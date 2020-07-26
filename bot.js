//Dependencies
const fs = require('fs');
const Discord = require('discord.js');
const mysql = require('mysql');
const {prefix, token, sqlpass} = require('./config.json');

//Constants
const DEFAULT_COOLDOWN = 3;
const SECS_TO_MS = 1000;
const SECS_TO_MINS = 60000;
VALID_STATUS = 200;

//Discord client setup
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.active = new Discord.Collection();
client.messageRepeat = new Discord.Collection();
client.login(token);

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
    password: sqlpass,
    database: 'monkeybot'
});

database.connect((err) => {
    if(err) console.log(err);
    console.log('Connected to Database!');
});

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', async function(message) {

    //Don't allow bots to run commands
    if(message.author.bot) return;

    //Log messages
    fs.appendFile('log.txt', (`[#${message.channel.name} (${message.channel.id})]  ${message.author.tag} (${message.author.id}): ${message}\n`), (err) => {
        if(err) console.error(err);
    });

    //Exit early if user is in the middle of a Collector command
    if(client.active.has(message.author.id)) return;

    //Easter egg for my personal servers
    if(message.content.match(/<@!?(651523467174346804)>/)){
        client.commands.get('who ping me').execute(message);
    }

    //Easter egg. Respond to no u
    if(message.content.toLowerCase() == 'no u'){
        client.commands.get('no u').execute(message);
    }

    //Only run commands with prefix, but check repeat for messages without prefix
    //TODO: Revamp this feature
    if(!message.content.startsWith(prefix)){
        client.commands.get('repeat').execute(message, null, client);
        return;
    }

    console.log(message.content); //For development purposes only
    

    //Parse message for command and args
    const original = message.content.slice(prefix.length).split(' ');
    const args = message.content.toLowerCase().slice(prefix.length).split(/ +/);
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
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing \`${prefix}${command.name}\``)
        }
    } else {
        timestamps.set(message.author.id, now);
        //Automatically delete entry after cooldown
        setTimeout(() => timestamps.delete(message.author.id), cooldownTime);
    }


    originalArgs = {
        'message': message,
        'args': original,
        'client': client,
        'database' : database
    }

    parsedArgs = {
        'message': message,
        'args': args,
        'client': client,
        'database' : database
    }


    //Command execution
    try{

        //Handle server only/non-DM commands
        if(command.guildOnly && message.channel.type !== 'text'){
            return message.reply('Get that command out of my DMs.');
        }

        if(command.needsOriginal){
            command.execute(originalArgs);

        } else {
            if(command.limitUser){
                client.active.set(message.author.id);
            }

            await command.execute(parsedArgs);
        }

    } catch(error) {
        console.error(error.message);
        message.reply('Whoops! Something broke internally. Lemme just log this error...');
    }
    
});