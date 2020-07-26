module.exports = {
    name: 'pfp',
    description: 'Shows the first mentioned user\'s profile picture, or the author\'s profile picture if no one is mentioned',
    async execute(params){
        const general = require('./modules/module-general.js');

        let user = general.getFirstMention(params.args, params.client, 'user') || params.message.author;

        params.message.channel.send({files: [
            {
                attachment: user.displayAvatarURL,
                name: 'avatar.png'
                }
        ]});
        
    }
}