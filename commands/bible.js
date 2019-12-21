const CHANCE = 100;

module.exports = {
    name: "bible",
    description: "Send a random bible quote",
    execute(message, args){
        //Dependencies
        const request = require("request");
        const cheerio = require("cheerio");
        
        const url = "https://dailyverses.net/random-bible-verse";

        request(url, (err, response, html) => {
            if(!err && response.statusCode == VALID_STATUS){
                const $ = cheerio.load(html);
                
                //Random number from 0 to CHANCE-1
                const easterEgg = Math.floor(Math.random() * CHANCE);

                //1 in CHANCE, sends if easterEgg = 0
                if(!easterEgg){
                    message.channel.send("\`\`\`fix\nAdam and Steve, not Adam and Eve. So sorry. \n\n---Guam 69:420--- \`\`\`");
                    return;
                }

                //Get quote
                const quote = $('div.bibleVerse').first().contents().filter(function() {
                    return this.type == "text";
                }).text();
                const chapter = $('div.bibleChapter > a').contents().first().text();

                const send = `\`\`\`${quote} \n\n---${chapter}--- \`\`\``
                message.channel.send(send);
            }

        });


    }
}