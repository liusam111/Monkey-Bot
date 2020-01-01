module.exports = {
    name: "kick",
    description: "Fake kick message",
    guildOnly: true,
    execute(message, args, client){
        const helper = require("./helper/helper_general.js");

        if(!message.mentions.users.size){
            message.reply("Give me someone to kick.");
        } else {
            const taggedUser = helper.getFirstMention(args, client, "user");
            message.channel.send(`<@${taggedUser.id}> has been kicked in the groin.`);

        }
    }
}