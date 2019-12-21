module.exports = {
    name: "kick",
    description: "Fake kick message",
    guildOnly: true,
    execute(message, args, client){
        if(!message.mentions.users.size){
            message.reply("Give me someone to kick.");
        } else {
            const taggedUser = getFirstMention(args, client);
            message.channel.send(`<@${taggedUser.id}> has been kicked in the groin.`);

        }
    }
}