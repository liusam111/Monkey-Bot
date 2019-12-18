module.exports = {
    name: "test",
    description: "File for testing new features and understanding how the library works",
    execute(message, args){
        //Only allow creator to run ~test
        if(message.author.id != "96468616911790080"){
            return message.channel.send("Only the bot creator can use this command.");
        }

        const filter = m => m.author.id == message.author.id;
        const collector = message.channel.createMessageCollector(filter, {maxMatches: 3, time: 10000});


        message.channel.send("Say \"Test\"");
        collector.on("collect", m => {
            if(m.content != "Test"){
                if(collector.collected.size == 3) return;
                message.channel.send("Try again"); 
                return;
            }
            collector.stop("done");
            const collector2 = message.channel.createMessageCollector(filter, {maxMatches: 3, time: 10000});
            
            
            message.channel.send("1, 2, or 3?");
            collector2.on("collect", m2 =>{
                if(m2.content == "end"){
                    collector2.stop("end");
                    return;
                }
                if(m2.content != "3"){ 
                    if(collector2.collected.size == 3) return;
                    message.channel.send("Try again"); 
                    return;}

                collector2.stop("done");

                message.channel.send("3 Pass");
            });

            collector2.on("end", (collected, reason) =>{
                if(reason == "matchesLimit"){
                    message.channel.send("Out of tries 2");
                    return;
                }
                if(reason == "end") message.channel.send("ended"); else 
                if(reason == "done") message.channel.send("Completed 2"); else
                message.channel.send("Timeout");
            });

        });

        collector.on("end", (collected, reason) => {
            if(reason == "matchesLimit"){
                message.channel.send("Out of tries");
                return;
            }
            if(reason == "done") message.channel.send("Completed 1"); else
            message.channel.send("Timeout");
        });
    }
}