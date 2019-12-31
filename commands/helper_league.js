leagueSearch = function(message, searchName, region, mentionedUser){
    //Dependencies
    const request = require("request");
    const cheerio = require("cheerio");
    const Discord = require("discord.js");

    //Check if username has not been set, username is empty string if not set
    if(mentionedUser && searchName == ""){
        if(mentionedUser.id == message.author.id){
            return message.channel.send("You have not linked your League username!");
        } else {
            return message.channel.send(`\`${mentionedUser.tag.split("#")[0]}\` has not linked their League username!`);
        }
    }

    //If username is "", then region should always be "", but just in case
    region = (region == "") ? "na" : region;

    //KR region URL uses the www.opgg while all other regions use REGIONCODE.opgg
    const regionURL = (region == "kr") ? "www" : region;

    //Handle non-ASCII characters for URL request
    const url = encodeURI(`https://${regionURL}.op.gg/summoner/userName=${searchName}`);

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

            const title = `${username} (${region.toUpperCase()})`;
            const footer = "Use the -region=XX flag to search different regions!"

            //Unranked Player
            if(!ladderHTML.length){
                
                embed = new Discord.RichEmbed()
                    .setColor("#fffff0")
                    .setTitle(title)
                    .setURL(url)
                    .setThumbnail(rankIcon)
                    .addField("Ranked Solo/Duo", "Unranked")
                    .setImage(summonerIcon)
                    .setFooter(footer);

            //Ranked Player
            } else {
                //Get ranked information about user
                const rank = $("div.TierRank").text();
                const wins = $("div.TierInfo > span.WinLose > span.wins").text().replace("W","");
                const losses = $("div.TierInfo > span.WinLose > span.losses").text().replace("L","");
                const winRatio = $("div.TierInfo > span.WinLose > span.winratio").text().replace("Win Ratio ","");
                const ladderRank = ladderHTML.text().replace(/(Ladder)?(Rank)?/g, "");
                const lp = $("div.TierInfo > span.LeaguePoints").text();
                const lpText = rank + ", " + lp.replace("\n", "");
                embed = new Discord.RichEmbed()
                    .setColor("#fffff0")
                    .setTitle(title)
                    .setURL(url)
                    .setThumbnail(rankIcon)
                    .addField("Ranked Solo/Duo", lpText)
                    .addField("Wins", wins, true)
                    .addField("Losses", losses, true)
                    .addField("Win Ratio", winRatio, true)
                    .addField("Ladder Rank", ladderRank)
                    .setImage(summonerIcon, "\n")
                    .setFooter(footer);
            }

            message.channel.send(embed);
        }
    });

}

leagueLink = function(message, args, database, region){
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
        linkHandler(searchName, region);
    }



    /*
     * Handles username verification to make sure it exists
     * Also handles the actual linking of Discord ID and username in MySQL
     */
    function linkHandler(searchName, region){

        //If username is "", then region should always be "", but just in case
        region = (region == "") ? "na" : region;

        //KR region URL uses the www.opgg while all other regions use REGIONCODE.opgg
        const regionURL = (region == "kr") ? "www" : region;

        //Verify that the username exists by checking opgg
        const url = encodeURI(`https://${regionURL}.op.gg/summoner/userName=${searchName}`);

        request(url, (err, response, html) => {
            if(!err && response.statusCode == VALID_STATUS){
                const $ = cheerio.load(html);

                const username = $("div.Information > span.Name").text();

                //Username doesn't exist
                if(!username.length){
                    return message.channel.send(`Username \`${searchName}\` cannot be found!`);
                }

                //Link Discord ID with username in MySQL database
                database.query(`SELECT * FROM userinfo WHERE id = '${message.author.id}'`, (err, rows) => {
                    if(err) throw err;

                    let sql;

                    if(!rows.length){
                        sql = `INSERT INTO userinfo (id, league, region) VALUES('${message.author.id}', '${username}', '${region}')`;

                    } else {
                        sql = `UPDATE userinfo SET league = '${username}', region = '${region}' WHERE id = '${message.author.id}'`;
                    }

                    database.query(sql);
                });

                message.reply(`Your League username has been set to \`${username}\``);

            }
        });
    }
    
}



leagueUnlink = function(message, client, database){
    const MAX_ERRORS = 3;
    const TIME_LIMIT_MS = 10000;
    const filter = (m) => m.author.id == message.author.id;
    const collector = message.channel.createMessageCollector(filter, {maxMatches: MAX_ERRORS, time: TIME_LIMIT_MS});

    message.channel.send("Are you sure you want to unlink your League username? Type \`Y\` or \`N\`.");

    client.active.set(message.author.id);
    collector.on("collect", (m) => {
        let messageLowercase = m.content.toLowerCase();

        if(messageLowercase == "y"){
            
            database.query(`SELECT * FROM userinfo WHERE id = '${message.author.id}'`, (err, rows) => {

                if (err) throw err;

                let sql;
                if(!rows.length){
                    sql = `INSERT INTO userinfo (id , league, region) VALUES ('${message.author.id}', '', '')`;
                } else {
                    sql = `UPDATE userinfo SET league = '', region = '' WHERE id = '${message.author.id}'`;
                }

                database.query(sql);

            });
            collector.stop("success");

        } else if(messageLowercase =="n"){
            collector.stop("cancelled");

        } else if(collector.collected.size < MAX_ERRORS) {
            message.channel.send("That's not an option. Type \`Y\` or \`N\`.");
        }
    });



    collector.on("end", (collected, reason) => {
        if(reason == "time"){
            message.channel.send("I don't have all day. Try again when you're ready to decide.");

        } else if(reason == "matchesLimit"){
            message.channel.send("I think I've given you enough chances. Unlink cancelled.");

        } else if(reason == "success"){
            message.channel.send("Your League username has been unlinked to your Discord!");

        } else if(reason == "cancelled"){
            message.channel.send("Unlink cancelled.");
        }

        if(client.active.has(message.author.id)){
            return client.active.delete(message.author.id);
        }
    });
}