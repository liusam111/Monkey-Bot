module.exports = {
    name: "bible",
    description: "Send a random bible quote",
    execute(message){
        //Dependencies
        const request = require("request");
        const cheerio = require("cheerio");
        
        const url = "https://dailyverses.net/random-bible-verse";

        request(url, (error, response, html) => {
            if(!error && response.statusCode == 200){
                const $ = cheerio.load(html);

                const easterEgg = Math.floor(Math.random() * 100) + 1;

                if(easterEgg == 1){
                    message.channel.send("\`\`\`fix\nAdam and Steve, not Adam and Eve. So sorry. \n\n---Guam 69:420--- \`\`\`");
                    return;
                }

                //Get quote
                const quote = $('div[class="bibleVerse"]').contents().first().text();
                const chapter = $('div[class="bibleChapter"] > a').first().text();

                const send = `\`\`\`${quote} \n\n---${chapter}--- \`\`\``
                message.channel.send(send);
            }

        });


    }
}