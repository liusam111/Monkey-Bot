const MIN_REPEATS = 3;

module.exports = {
    name: "repeat",
    description: "Repeats the last message sent if the past 3 messages are the same",
    cannotRun: true,
    execute(message, args, client){
        let noSpecialChars = message.content.replace(/[^A-Za-z0-9]/g, "").toLowerCase();


        if(!client.messageRepeat.get(message.guild.id)){
            client.messageRepeat.set(message.guild.id, []);
        }

        let currGuildMessages = client.messageRepeat.get(message.guild.id);
        let newPair = [message.author.id, noSpecialChars];


        currGuildMessages.push(newPair);
        if(currGuildMessages.length > MIN_REPEATS){
            currGuildMessages.shift();
        }

        //Check that the last 3 messages are the same message by different users
        if(currGuildMessages.length == MIN_REPEATS){
            let user1 = currGuildMessages[0][0];
            let user2 = currGuildMessages[1][0];
            let user3 = currGuildMessages[2][0];
            let msg1 = currGuildMessages[0][1];
            let msg2 = currGuildMessages[1][1];
            let msg3 = currGuildMessages[2][1];

            let diffUsers = (user1 != user2) && (user1 != user3) && (user2 != user3);
            let sameMsg = (msg1 == msg2) && (msg1 == msg3) && (msg2 == msg3);

            if(diffUsers && sameMsg){
                message.channel.send(message.content);
            }

        }


    }
}