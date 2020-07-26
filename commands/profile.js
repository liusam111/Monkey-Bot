const DAYS_TO_SECS = 86400000;

module.exports = {
    name: 'profile',
    description: 'Shows the first mentioned user\'s profile information, or the author\'s profile if no one is mentioned',
    async execute(params){
        const general = require('./modules/module-general.js');

        let user = general.getFirstMention(params.args, params.client, 'user') || params.message.author;

        const Discord = require('discord.js');
        const timeSinceCreation = (Date.now() - user.createdTimestamp) / (DAYS_TO_SECS);

        // Created embed to display profile
        const embed = new Discord.RichEmbed()
            .setColor('#fffff0')
            .setTitle(`${user.tag}'s Profile`)
            .setThumbnail(user.displayAvatarURL)
            .addField('ID:', user.id)
            .addField('Created At: ', user.createdAt)
            .addField('Days Since Creation: ', timeSinceCreation.toFixed(0))
            .addField('Profile Picture: ', user.displayAvatarURL);

                
        params.message.channel.send(embed);
    }
}