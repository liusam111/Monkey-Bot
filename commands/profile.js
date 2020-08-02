const DAYS_TO_SECS = 86400000;

module.exports = {
    name: 'profile',
    description: 'Shows the first mentioned user\'s profile information, or the author\'s profile if no one is mentioned',
    async execute(params){
        const general = require('./modules/module-general.js');

        let user = await general.getFirstMention(params, general.USER) || params.message.author;

        const Discord = require('discord.js');
        const timeSinceCreation = (Date.now() - user.createdTimestamp) / (DAYS_TO_SECS);
        const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });

        // Created embed to display profile
        const embed = new Discord.MessageEmbed()
            .setColor('#fffff0')
            .setTitle(`${user.tag}'s Profile`)
            .setThumbnail(avatarURL)
            .addField('ID:', user.id)
            .addField('Created At: ', user.createdAt)
            .addField('Days Since Creation: ', timeSinceCreation.toFixed(0))
            .addField('Profile Picture: ', avatarURL);

                
        params.message.channel.send(embed);
    }
}