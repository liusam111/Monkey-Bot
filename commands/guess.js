//Min and max values the user and bot can guess
const MIN_VAL_USER = 50;
const MAX_VAL_USER = 150;
const MIN_VAL_BOT = 1;
const MAX_VAL_BOT = 200;

module.exports = {
    name: "guess",
    description: "Number guessing game",
    limit_user: true,
    execute(message, args, client){
        if(args.length){
            message.channel.send("Screw your parameters.");
            return client.active.delete(message.author.id);
        }     

        const filter = m => m.author.id == message.author.id;
        const collector = message.channel.createMessageCollector(filter, {maxMatches: 1, time: 10000});



        message.channel.send(`Guess a number between ${MIN_VAL_USER} and ${MAX_VAL_USER}. You win if your number is higher.`);

        collector.on("collect", m => {

            //Non-numeric characters in args
            if(!m.content.match(/^[0-9]+$/)){
                collector.stop("error_num");
                return;
            }

            //Invalid range
            const num = parseInt(m.content);
            if(num < MIN_VAL_USER || num > MAX_VAL_USER){
                collector.stop("error_range");
                return;
            }

            const botNum = Math.floor(Math.random() * MAX_VAL_BOT) + MIN_VAL_BOT;

            //Number comparison logic for game win/lose
            if(num > botNum){
                message.channel.send(`My number was ${botNum}. You got lucky.`);
            } else {
                message.channel.send(`My number was ${botNum}. You suck.`);
            }

        });

        collector.on("end", (collected, reason) => {
            if(reason == "time"){
                message.channel.send("This game is over. I don't have all day.");
            }

            if(reason == "error_range"){
                message.channel.send("I'm ending the game. Give me a better number.");
            }

            if(reason == "error_num"){
                message.channel.send("I'm ending the game. That's not a number.");
            }

            if(client.active.has(message.author.id)){
                return client.active.delete(message.author.id);
            }
        });
    }

}