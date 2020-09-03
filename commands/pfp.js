const general = require('./modules/module-general.js');

module.exports = {
    name: 'pfp',
    async execute(params){
        let user = await general.getFirstMention(params, general.MENTION_TYPE.USER) || params.message.author;

        params.message.channel.send({files: [
            user.displayAvatarURL({ format: 'png', dynamic: true, size: 512 })
        ]});
    }
}