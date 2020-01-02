//Define dependencies
const fs = require("fs");
const Discord = require("discord.js");
const mysql = require("mysql");
const {prefix, token, sqlpass} = require("./config.json");

//Set up client
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.active = new Discord.Collection();
client.messageRepeat = new Discord.Collection();
client.login(token);

//Define constants
const DEFAULT_COOLDOWN = 3;
const FUN_FACT_COOLDOWN = 20;
const SECS_TO_MS = 1000;
const SECS_TO_MINS = 60000;
VALID_STATUS = 200;

//Get list of command files
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
const cooldowns = new Discord.Collection();

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    if(command.name){
        client.commands.set(command.name, command);
    }
}

//Connect to MySQL Database
var database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: sqlpass,
    database: "monkeybot"
});

database.connect((err) => {
    if(err) console.log(err);
    console.log("Connected to Database!");
});

//Startup message, triggers once upon login
client.once("ready", () => {
    console.log("Ready!");
    const factcycle = require("./commands/automatic_facts.js");
    setInterval(() => {
        console.log("Fact Sent!");
        [...client.guilds.values()].map((guild) => {
            factcycle.execute(guild.id, client, database);
        });
    }, FUN_FACT_COOLDOWN * SECS_TO_MINS);

});

client.on("message", message => {

    //Don't allow bots to run commands
    if(message.author.bot) return;

    //Increment exp
    client.commands.get("incrementXP").execute(message, null, null, database);

    //Log messages
    fs.appendFile("log.txt", ("[#" + message.channel.name + "] " + message.author.tag + ": " + message + "\n"), (err) => {
        if(err) console.error(err);
    });

    const currentActive = client.active.has(message.author.id);

    //Exit early if user is in the middle of a Collector command
    if(currentActive) return;

    //Respond to mentions
    if(message.content.match(/<@!?(651523467174346804)>/)){
        client.commands.get("who ping me").execute(message);
    }

    //Respond to no u
    if(message.content.toLowerCase().includes("no u")){
        client.commands.get("no u").execute(message);
    }



    //Only run commands with prefix, but check repeat for messages without prefix
    if(!message.content.startsWith(prefix)){
        client.commands.get("repeat").execute(message, null, client);
        return;
    }


    console.log(message.content);
    
    //Slice off prefix, split message by spacebars
    const original = message.content.slice(prefix.length).split(" ");

    //When used in command execute functions, the args array values can be modified
    const args = message.content.toLowerCase().slice(prefix.length).split(/ +/);


    const commandName = args.shift();
    original.shift();


    const command = client.commands.get(commandName);

    //Exit early if command doesn't exist or can't be run
    if(!command || command.cannotRun) return;


    if(!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Discord.Collection());
    }


    

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    //Either set as defined cooldown time or 3 as default (in secs)
    const cooldownTime = (command.cooldown || DEFAULT_COOLDOWN) * SECS_TO_MS; 

    if(timestamps.has(message.author.id)){
        const expireTime = timestamps.get(message.author.id) + cooldownTime;

        if(now < expireTime){
            const timeLeft = (expireTime - now) / SECS_TO_MS;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing \`${prefix}${command.name}\``)
        }
    } else {
        timestamps.set(message.author.id, now);
        //Automatically delete user entry from timestamps after cooldown
        setTimeout(() => timestamps.delete(message.author.id), cooldownTime);
    }





    //Run commands
    try{
        if(command.needsOriginal){
            command.execute(message, original, client, database);
        } else if(command.limit_user){
            client.active.set(message.author.id);
            command.execute(message, args, client, database);
        } else {
            
            //Check if command is only available on server text channels
            if(command.guildOnly && message.channel.type !== 'text'){
                return message.reply("Get that command out of my DMs.");
            }

            command.execute(message, args, client, database);
        }

    //Handle any errors gracefully
    } catch(error) {
        console.error(error);
        message.reply("Error executing command");
    }
    
});