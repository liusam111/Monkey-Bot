//Dependencies
const fs = require('fs');
const Discord = require('discord.js');
const mysql = require('mysql');
const init = require('./commands/modules/module-init.js')
const {PREFIX, DISCORD_TOKEN, SQL_PASSWORD} = require('./data/config.json');

//Constants
const DEFAULT_COOLDOWN = 3;
const SECS_TO_MS = 1000;
const SECS_TO_MINS = 60000;
VALID_STATUS = 200;

//Discord client setup
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.activeCommand = new Discord.Collection();
client.messageRepeat = new Discord.Collection();
client.leagueUsernames = new Discord.Collection();
client.reminderIds = new Discord.Collection();
client.reminderTimeouts = new Discord.Collection();
client.userTimezones = new Discord.Collection();
client.login(DISCORD_TOKEN);

//Load commands from directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const cooldowns = new Discord.Collection();

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    if(command.name){
        client.commands.set(command.name, command);
    }
}

//MySQL Setup
var database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: SQL_PASSWORD,
    database: 'monkeybot'
});

database.connect((err) => {
    if(err) throw err;
    console.log('Connected to Database!');
});

client.once('ready', () => {
    console.log('Connected to Discord!');

    let initParams = {
        client: client,
        database: database
    };

    init.currReminderId(initParams);
    init.reminders(initParams);
    init.userTimezones(initParams);
    init.leagueUsernames(initParams);
});

client.on('message', async function(message) {
    
    //Don't allow bots to run commands
    if(message.author.bot) return;

    //Log messages
    fs.appendFile('log.txt', (`[#${message.channel.name} (${message.channel.id})]  ${message.author.tag} (${message.author.id}): ${message}\n`), (err) => {
        if(err) console.error(err);
    });

    //Exit early if user is in the middle of a Collector command
    if(client.activeCommand.has(message.author.id)) return;

    //Easter egg for my personal servers
    if(message.content.match(/<@!?(651523467174346804)>/)){
        client.commands.get('who ping me').execute({
            'message': message
        });
    }

    //Easter egg. Respond to no u
    if(message.content.toLowerCase() == 'no u'){
        message.channel.send('no u');
        return;
    }

    //Only run commands with prefix, but check repeat for messages without prefix
    if(!message.content.startsWith(PREFIX)){
        client.commands.get('repeat').execute({
            'message': message,
            'client': client
        });
        return;
    }

    console.log(message.content); //For development purposes only
    

    //Parse message for command and args
    const original = message.content.slice(PREFIX.length).split(' ');
    const args = message.content.toLowerCase().slice(PREFIX.length).split(/ +/);
    const commandName = args.shift();
    original.shift();
    const command = client.commands.get(commandName);

    if(!command || command.cannotRun) return;


    //Set cooldowns for commands
    if(!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownTime = (command.cooldown || DEFAULT_COOLDOWN) * SECS_TO_MS;

    if(timestamps.has(message.author.id)){
        const expireTime = timestamps.get(message.author.id) + cooldownTime;

        if(now < expireTime){
            const timeLeft = (expireTime - now) / SECS_TO_MS;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing \`${PREFIX}${command.name}\``)
        }
    } else {
        timestamps.set(message.author.id, now);
        //Automatically delete entry after cooldown
        setTimeout(() => timestamps.delete(message.author.id), cooldownTime);
    }

    params = {
        message: message,
        args: command.needsOriginal ? original : args,
        client: client,
        database: database,
        source: message.content
    }

    //Command execution
    try{

        //Handle server only/non-DM commands
        if(command.guildOnly && message.channel.type !== 'text'){
            return message.reply('Get that command out of my DMs.');
        }

        await command.execute(params);
        

    } catch(err) {
        console.error(err);
        message.reply('Whoops! Something broke internally. Lemme just log this error...');
    }
    
});