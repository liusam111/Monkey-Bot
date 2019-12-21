module.exports = {
    name: "say",
    description: "Makes bot say the following text after the command",
    needsOriginal: true,
    execute(message, args){
        if(!args.length){
            message.channel.send("You gonna tell me what to say or what?");
        } else {
            message.channel.send(args.join(" "));
        }
    }
}