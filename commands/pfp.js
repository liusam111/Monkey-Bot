module.exports = {
    name: "pfp",
    description: "Shows mentioned user's profile picture (max 3), or the author's profile picture if no one is mentioned",
    execute(message, args){
        //No user mentioned
        if(!message.mentions.users.size){
            message.channel.send({files: [
                {
                    attachment: message.author.displayAvatarURL,
                    name: "avatar.png"
                }
            ]});
        
        //More than 3 mentioned
        }else if(message.mentions.user.size > 3) {
            message.channel.send("Let's not spam things up. Give me 3 or less people.");

        } else {
            const avatarList = message.mentions.users.map(user => {
                console.log(user);
                return message.channel.send(
                            {files: [
                                {
                                    attachment: user.displayAvatarURL,
                                    name: "avatar.png"
                                }
    
                                ]}
                        );
                });        
        }
    }
}