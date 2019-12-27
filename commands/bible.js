module.exports = {
    name: "bible",
    description: "Send a random bible quote",
    execute(message){
        //Dependencies
        const request = require("request");
        const cheerio = require("cheerio");
        
        const url = "https://dailyverses.net/random-bible-verse";

        request(url, (err, response, html) => {
            if(!err && response.statusCode == VALID_STATUS){
                const $ = cheerio.load(html);

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