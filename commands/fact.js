module.exports = {
    name: "fact",
    description: "Generates a random fun fact",
    needsOriginal: true,
    execute(message, args){
        //Dependencies
        const cheerio = require("cheerio");
        const request = require("request");
        const Discord = require("discord.js");

        const url = "http://randomfactgenerator.net/";

        request(url, (err, response, html) =>{
            if(!err && response.statusCode == VALID_STATUS){
                const $ = cheerio.load(html);

                const fact = $("div#f > div#z").first().contents().filter(function() {
                    return this.type == "text";

                }).text();

                const embed = new Discord.RichEmbed()
                    .setColor("#fffff0")
                    .setTitle("Fun Fact:")
                    .setDescription(fact);
                message.channel.send(embed);
            }

        });

    }
}