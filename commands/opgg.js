module.exports = {
    name: "opgg",
    description: "Shows Ranked Solo/Duo information of specified League username",
    execute(message, args){
        if(!args.length){
            message.channel.send("Specify a user.");
        } else {
            //Dependencies
            const request = require("request");
            const cheerio = require("cheerio");
            const Discord = require("discord.js");

            var searchName = args.join(" ");
            //Handle non-ASCII characters for URL request
            const url = encodeURI("https://na.op.gg/summoner/userName=" + searchName);
            
            request(url, (error, response, html) => {
                if(!error && response.statusCode == 200){
                    const $ = cheerio.load(html);
                    
                    const username = $('div[class="Information"] > span[class ="Name"]').text();

                    //Length 0 means username doesn't exist
                    if(!username.length){
                        message.channel.send("\`" + searchName + "\` does not exists in NA.")
                        return;
                    }

                    //Get information about user
                    const ladderHTML = $('div[class="LadderRank"] > a');
                    const summonerIcon = "https:" +  $('div[class="ProfileIcon"] > img').attr("src");
                    const rankIcon = "https:" + $('div[class="TierBox Box"] > div > div > img').attr("src");
                    

                    var embed;
                    //Unranked Player
                    if(!ladderHTML.length){
                        
                        embed = new Discord.RichEmbed()
                            .setColor("#fffff0")
                            .setTitle(username)
                            .setURL(url)
                            .setThumbnail(rankIcon)
                            .addField("Ranked Solo/Duo", "Unranked")
                            .setImage(summonerIcon);

                    //Ranked Player
                    } else {
                        //Get ranked information about user
                        const rank = $('div[class="TierRank"]').text();
                        const wins = $('div[class="TierInfo"] > span[class="WinLose"] > span[class="wins"]').text().replace("W","");
                        const losses = $('div[class="TierInfo"] > span[class="WinLose"] > span[class="losses"]').text().replace("L","");
                        const winRatio = $('div[class="TierInfo"] > span[class="WinLose"] > span[class="winratio"]').text().replace("Win Ratio ","");
                        const ladderRank = ladderHTML.text().replace("Ladder Rank ","");
                        const lp = $('div[class="TierInfo"] > span[class="LeaguePoints"]').text();
                        const lpText = rank + ", " + lp.replace("\n", "");

                        embed = new Discord.RichEmbed()
                            .setColor("#fffff0")
                            .setTitle(username)
                            .setURL(url)
                            .setThumbnail(rankIcon)
                            .addField("Ranked Solo/Duo", lpText)
                            .addField("Wins", wins, true)
                            .addField("Losses", losses, true)
                            .addField("Win Ratio", winRatio, true)
                            .addField("Ladder Rank", ladderRank)
                            .setImage(summonerIcon, "\n");
                            
                    }

                    message.channel.send(embed);
                }


            });
        }
    }
}