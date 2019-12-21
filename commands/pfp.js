module.exports = {
    name: "pfp",
    description: "Shows mentioned user's profile picture (max 3), or the author's profile picture if no one is mentioned",
    execute(message, args, client){

        //No user mentioned
        if(!message.mentions.users.size){
            message.channel.send({files: [
                {
                    attachment: message.author.displayAvatarURL,
                    name: "avatar.png"
                }
            ]});
        
        } else {
            const mentionedUser = global.getFirstMention(args, client);
            message.channel.send({files: [
                {
                    attachment: mentionedUser.displayAvatarURL,
                    name: "avatar.png"
                }
            ]});   
        }
    }
}