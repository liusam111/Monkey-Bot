module.exports = {
    name: "factcycle",
    description: "Generates a random fun fact every 5 minutes in each server's main channel",
    cannotRun: true,
    execute(guildId, client, database){
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
                    

                database.query(`SELECT * FROM mainchannel WHERE guildid = ${guildId} `, (err, rows) => {
                    if(err) throw err;

                    if(rows.length){
                        let mainChannelId = rows[0].mainchannelid;
                        let currGuild = client.guilds.get(guildId);
                        let mainChannel = currGuild.channels.get(mainChannelId);
                        mainChannel.send(embed);
                    }
                    
                });
                
            }

        });

    }
}