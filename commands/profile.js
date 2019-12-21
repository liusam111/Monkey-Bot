const DAYS_TO_SECS = 86400000;

module.exports = {
    name: "profile",
    description: "Shows mentioned user's profile information, or the author's profile if no one is mentioned",
    guildOnly: true,
    execute(message, args, client){
        let currUser = getFirstMention(args, client, "user") || message.author;

        const Discord = require("discord.js");
        const timeSinceCreation = (Date.now() - currUser.createdTimestamp) / (DAYS_TO_SECS);

        // Created embed to display profile
        const embed = new Discord.RichEmbed()
            .setColor("#fffff0")
            .setTitle(`${currUser.tag}'s Profile`)
            .setThumbnail(currUser.displayAvatarURL)
            .addField("ID:", currUser.id)
            .addField("Created At: ", currUser.createdAt)
            .addField("Days Since Creation: ", timeSinceCreation.toFixed(0))
            .addField("Profile Picture: ", currUser.displayAvatarURL);

                
        message.channel.send(embed);
    }
}