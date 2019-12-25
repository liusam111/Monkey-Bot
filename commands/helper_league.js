leagueSearch = function(message, searchName, mentionedUser, isAuthor){
    //Dependencies
    const request = require("request");
    const cheerio = require("cheerio");
    const Discord = require("discord.js");

    //Check if username has not been set, username is empty string if not set
    if(mentionedUser && searchName == ""){
        if(isAuthor){
            return message.channel.send("You have not linked your League username!");
        } else {
            return message.channel.send(`\`${mentionedUser.tag.split("#")[0]}\` has not linked their League username!`);
        }
    }


    //Handle non-ASCII characters for URL request
    const url = encodeURI("https://na.op.gg/summoner/userName=" + searchName);

    request(url, (err, response, html) => {
        if(!err && response.statusCode == VALID_STATUS){
            const $ = cheerio.load(html);
 
            const username = $("div.Information > span.Name").text();

            //Length 0 means username doesn't exist
            if(!username.length){
                return message.channel.send(`Username \`${searchName}\` cannot be found!`);
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
                const ladderRank = ladderHTML.text().replace("Ladder Rank", "");
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

leagueLink = function(message, args, client, database){
    //Dependencies
    const request = require("request");
    const cheerio = require("cheerio");
    const Discord = require("discord.js");

    let searchName;

    //Prompt user to input username if they don't provide it
    if(!args.length){
        message.channel.send("Gimme a name");
    } else {
        searchName = args.join(" ");
        linkHandler(searchName);
    }

    /*
     * Handles username verification to make sure it exists
     * Also handles the actual linking of Discord ID and username in MySQL
     */
    function linkHandler(searchName){
        //Verify that the username exists by checking opgg
        const url = encodeURI("https://na.op.gg/summoner/userName=" + searchName);

        request(url, (err, response, html) => {
            if(!err && response.statusCode == VALID_STATUS){
                const $ = cheerio.load(html);

                const username = $("div.Information > span.Name").text();

                //Username doesn't exist
                if(!username.length){
                    return message.channel.send(`Username \`${searchName}\` cannot be found!`);
                }

                //Link Discord ID with username in MySQL database
                database.query(`SELECT * FROM userinfo 
                                WHERE id = '${message.author.id}'`, (err, rows) => {
                    if(err) throw err;

                    let sql;

                    if(!rows.length){
                        sql = `INSERT INTO userinfo (id, league) 
                               VALUES('${message.author.id}', '${username}')`;
                    } else {
                        sql = `UPDATE userinfo SET league = '${username} '
                               WHERE id = '${message.author.id}'`;
                    }

                    database.query(sql);
                });

                message.reply(`Your League username has been set to \`${username}\``);

            }
        });
    }
    
}