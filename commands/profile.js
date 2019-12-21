const DAYS_TO_SECS = 86400000;

module.exports = {
    name: "profile",
    description: "Shows mentioned user's profile information, or the author's profile if no one is mentioned",
    guildOnly: true,
    execute(message){
        if(message.mentions.users.size > 1){
            message.reply("One person at a time, buddy");
        } else {

            var taggedUser = message.author;
            if(message.mentions.users.size){
                taggedUser = message.mentions.users.first();
            }

            const Discord = require("discord.js");
            const timeSinceCreation = (Date.now() - taggedUser.createdTimestamp) / (DAYS_TO_SECS);

            // Created embed to display profile
            const embed = new Discord.RichEmbed()
                .setColor("#fffff0")
                .setTitle(`${taggedUser.tag}'s Profile`)
                .setThumbnail(taggedUser.displayAvatarURL)
                .addField("ID:", taggedUser.id)
                .addField("Created At: ", taggedUser.createdAt)
                .addField("Days Since Creation: ", timeSinceCreation.toFixed(0))
                .addField("Profile Picture: ", taggedUser.displayAvatarURL);

                
            message.channel.send(embed);
        }
    }
}