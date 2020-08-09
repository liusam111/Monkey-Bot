module.exports = {
    name: 'pfp',
    async execute(params){
        const general = require('./modules/module-general.js');

        let user = await general.getFirstMention(params, general.USER) || params.message.author;

        params.message.channel.send({files: [
            user.displayAvatarURL({ format: 'png', dynamic: true, size: 512 })
        ]});
    }
}