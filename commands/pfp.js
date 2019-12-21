module.exports = {
    name: "pfp",
    description: "Shows mentioned user's profile picture (max 3), or the author's profile picture if no one is mentioned",
    execute(message, args, client){

        let currUser = getFirstMention(args, client, "user") || message.author;
        message.channel.send({files: [
            {
                attachment: currUser.displayAvatarURL,
                name: "avatar.png"
                }
        ]});
        
    }
}