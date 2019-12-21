module.exports = {
    name: "sneakysay",
    description: "Makes bot say the following text after the command and then deletes your message for maximum stealth.",
    needsOriginal: true,
    execute(message, args){
        message.delete();
        if(args.length){
            message.channel.send(args.join(" "));
        }
    }
}