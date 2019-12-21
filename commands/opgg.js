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

            let searchName = args.join(" ");
            //Handle non-ASCII characters for URL request
            const url = encodeURI("https://na.op.gg/summoner/userName=" + searchName);
            
            request(url, (err, response, html) => {
                if(!err && response.statusCode == VALID_STATUS){
                    const $ = cheerio.load(html);
                    
                    const username = $("div.Information > span.Name").text();

                    //Length 0 means username doesn't exist
                    if(!username.length){
                        message.channel.send("\`" + searchName + "\` does not exists in NA.")
                        return;
                    }

                    //Get information about user
                    const ladderHTML = $("div.LadderRank > a");
                    const summonerIcon = "https:" +  $("div.ProfileIcon > img").attr("src");
                    const rankIcon = "https:" + $("div.TierBox.Box > div > div > img").attr("src");

                    let embed;
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
                        const rank = $("div.TierRank").text();
                        const wins = $("div.TierInfo > span.WinLose > span.wins").text().replace("W","");
                        const losses = $("div.TierInfo > span.WinLose > span.losses").text().replace("L","");
                        const winRatio = $("div.TierInfo > span.WinLose > span.winratio").text().replace("Win Ratio ","");
                        const ladderRank = ladderHTML.text().replace("Ladder Rank");
                        const lp = $("div.TierInfo > span.LeaguePoints").text();
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