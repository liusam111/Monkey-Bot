module.exports = {
    name: "say",
    description: "Makes bot say the following text after the command",
    needsOriginal: true,
    execute(params){
        if(!params.args.length){
            params.message.channel.send("You gonna tell me what to say or what?");
        } else {
            params.message.channel.send(params.args.join(" "));
        }
    }
}