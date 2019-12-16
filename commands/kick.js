module.exports = {
    name: "kick",
    description: "Fake kick message",
    guildOnly: true,
    execute(message, args){
        if(!message.mentions.users.size){
            message.reply("Give me someone to kick.");
        } else if(message.mentions.users.size > 1){
            message.reply("I can't kick multiple people at the same time. I need at least one leg to stand on.");
        } else {
            const taggedUser = message.mentions.users.first();
            message.channel.send(`<@${taggedUser.id}> has been kicked in the groin.`);

        }
    }
}