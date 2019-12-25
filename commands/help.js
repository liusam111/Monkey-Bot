module.exports = {
    name: "help",
    description: "Sends a link to the help website",
    needsOriginal: true,
    execute(message, args){
        message.channel.send("https://discord-monkeybot.com");
    }
}