const general = require('./modules/module-general.js');
const Discord = require('discord.js');
//TODO: Format creation time with Moment TZ

module.exports = {
    name: 'profile',
    async execute(params){
        let user = await general.getFirstMention(params, general.MENTION_TYPE.USER) || params.message.author;
        const timeSinceCreation = (Date.now() - user.createdTimestamp) / (general.TO_MS.DAY / general.TO_MS.SEC);
        const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });

        // Created embed to display profile
        const embed = new Discord.MessageEmbed()
            .setColor('#fffff0')
            .setTitle(`${user.tag}'s Profile`)
            .setThumbnail(avatarURL)
            .addField('ID:', user.id)
            .addField('Created At: ', user.createdAt)
            .addField('Days Since Creation: ', Math.floor(timeSinceCreation))
            .addField('Profile Picture: ', avatarURL);

                
        params.message.channel.send(embed);
    }
}