module.exports = {
    name: "automatic facts",
    description: "Generates a random fun fact in each server's main channel every FUN_FACT_COOLDOWN minutes (from bot.js)",
    cannotRun: true,
    execute(guildId, client, database){
        //Dependencies
        const cheerio = require("cheerio");
        const request = require("request");
        const Discord = require("discord.js");

        const url = "http://randomfactgenerator.net/";

        request(url, (err, response, html) =>{
            if(!err && response.statusCode == VALID_STATUS){
                database.query(`SELECT * FROM mainchannel WHERE guildid = '${guildId}' `, (err, rows) => {
                    if(err) throw err;

                    if(!rows.length || !rows[0].enable) return;

                    const $ = cheerio.load(html);

                    const fact = $("div#f > div#z").first().contents().filter(function() {
                        return this.type == "text";
    
                    }).text();
    
                    const embed = new Discord.RichEmbed()
                        .setColor("#fffff0")
                        .setTitle("Fun Fact:")
                        .setDescription(fact);


                    let mainChannelId = rows[0].mainchannelid;
                    let currGuild = client.guilds.get(guildId);
                    let mainChannel = currGuild.channels.get(mainChannelId);
                    mainChannel.send(embed);
                    
                });
            }

        });

    }
}