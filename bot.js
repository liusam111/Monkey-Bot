const fs = require("fs");
const Discord = require("discord.js");
const {prefix, token} = require("./config.json");
const client = new Discord.Client();
client.commands = new Discord.Collection();
global.active = new Discord.Collection();

//Login Using Token
client.login(token);

//Get list of command files
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
const cooldowns = new Discord.Collection();

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

//Startup message, triggers once upon login
client.once("ready", () => {
    console.log("Ready!");
});


client.on("message", message => {



    //Don't allow bot to run commands
    if(message.author.bot){
        return;
    }

    //Log messages
    fs.appendFile("log.txt", ("[#" + message.channel.name + "] " + message.author.tag + ": " + message + "\n"), (err) => {
        if(err){
            console.log(err);
        }
    });

    const currentActive = global.active.has(message.author.id);

    //Exit early if user is in the middle of a Collector command
    if(currentActive){
        return;
    }

    //Respond to mentions
    if(message.content.match(/<@!?(651523467174346804)>/)){
        client.commands.get("who ping me").execute(message);
    }

    //Respond to no u
    if(message.content.toLowerCase().includes("no u")){
        client.commands.get("no u").execute(message);
    }

    //Only run commands with prefix
    if(!message.content.startsWith(prefix)){
        return;
    }


    console.log(message.content);


    //Slice off prefix, split message by spacebars
    const original = message.content.slice(prefix.length).split(" ");
    const args = message.content.slice(prefix.length).split(/ +/);
    
    //Take first element off args and convert to lowercase
    const commandName = args.shift().toLowerCase(); 

    //Take first element off original
    original.shift();


    //Exit early if command doesn't exist
    if(!client.commands.has(commandName)){
        return;
    }

    const command = client.commands.get(commandName);


    if(!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    //Either set as defined cooldown time or 3 as default (in secs)
    const cooldownTime = (command.cooldown || 3) * 1000; 

    if(timestamps.has(message.author.id)){
        const expireTime = timestamps.get(message.author.id) + cooldownTime;

        if(now < expireTime){
            const timeLeft = (expireTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing \`${prefix}${command.name}\``)
        }
    } else {
        timestamps.set(message.author.id, now);
        //Automatically delete user entry from timestamps after cooldown
        setTimeout(() => timestamps.delete(message.author.id), cooldownTime);
    }

    
    try{
        if(commandName == "say"){
            command.execute(message, original);
        } else if(command.limit_user){
            global.active.set(message.author.id);
            command.execute(message, args);
        } else {
            
            //Check if command is only available on server text channels
            if(command.guildOnly && message.channel.type !== 'text'){
                return message.reply("Get that command out of my DMs.");
            }

            command.execute(message,args);
        }
    //Handle any errors gracefully
    } catch(error) {
        console.error(error);
        message.reply("Error executing command");
    }


    
});
