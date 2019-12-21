const MIN_REPEATS = 3;

module.exports = {
    name: "repeat",
    description: "Repeats the last message sent if the past 3 messages are the same",
    cannotRun: true,
    execute(message, args, client){
        let noSpecialChars = message.content.replace(/[^A-Za-z0-9]/g, "").toLowerCase();

        let newPair = [message.author.id, noSpecialChars];
        
        client.messageRepeat.push(newPair);
        if(client.messageRepeat.length > MIN_REPEATS){
            client.messageRepeat.shift();
        }
        

        //Check that the last 3 messages are the same message by different users
        if(client.messageRepeat.length == MIN_REPEATS){
            let user1 = client.messageRepeat[0][0];
            let user2 = client.messageRepeat[1][0];
            let user3 = client.messageRepeat[2][0];
            let msg1 = client.messageRepeat[0][1];
            let msg2 = client.messageRepeat[1][1];
            let msg3 = client.messageRepeat[2][1];

            let diffUsers = (user1 != user2) && (user1 != user3) && (user2 != user3);
            let sameMsg = (msg1 == msg2) && (msg1 == msg3) && (msg2 == msg3);

            if(diffUsers && sameMsg){
                message.channel.send(message.content);
            }

        }


    }
}