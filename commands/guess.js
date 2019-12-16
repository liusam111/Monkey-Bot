module.exports = {
    name: "guess",
    description: "Number guessing game",
    limit_user: true,
    execute(message, args){
        if(args.length){
            message.channel.send("Screw your parameters.");
            return global.active.delete(message.author.id);
        }

        const filter = m => m.author.id == message.author.id;
        const collector = message.channel.createMessageCollector(filter, {time: 10000});

        //Min/max values that the user/bot can guess
        const minValUser = 50;
        const maxValUser = 150;
        const minValBot = 1;
        const maxValBot = 200;

        message.channel.send(`Guess a number between ${minValUser} and ${maxValUser}. You win if your number is higher.`);


        collector.on("collect", m => {

            //Non-numeric characters in args
            if(!m.content.match(/^[0-9]+$/)){
                collector.stop("Error");
                return message.channel.send("I'm ending the game. That's not a number.");
            }

            //Invalid range
            const num = parseInt(m.content);
            if(num < minValUser || num > maxValUser){
                collector.stop("Error");
                return message.channel.send("I'm ending the game. Give me a better number.");
            }

            const botNum = Math.floor(Math.random() * maxValBot) + minValBot;

            //Number comparison logic for game win/lose
            if(num > botNum){
                message.channel.send(`My number was ${botNum}. You got lucky.`);
            } else {
                message.channel.send(`My number was ${botNum}. You suck.`);
            }
            
            collector.stop("End Game");
        });

        collector.on("end", (collected, reason) => {
            if(reason == "time"){
                message.channel.send("This game is over. I don't have all day.");
            }
            if(global.active.has(message.author.id)){
                return global.active.delete(message.author.id);
            }
        });
    }

}