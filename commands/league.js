module.exports = {
    name: "league",
    description: "Shows Ranked Solo/Duo information of specified League username",
    execute(message, args, client, database){
        const helper = require("./helper_general.js");

        const flagEnum = {
            LINK: "-link",
            UNLINK: "-unlink",
            REGION: "-region="
        }

        let username;
        let region = "na"; //Let NA be default region

        //No arguments given, search for message author's League profile
        if(!args.length){
            database.query(`SELECT * FROM userinfo WHERE id = '${message.author.id}'`, (err, rows) => {
                if(err) throw err;

                //First time chatting in a server with Monkey Bot
                if(!rows.length){
                    database.query(`INSERT INTO userinfo (id) VALUES('${message.author.id}')`);
                    username = "";
                } else {
                    username = rows[0].league;
                    region = rows[0].region;
                }
                leagueSearch(message, username, region, message.author);
            });

            

        } else {

            const validRegions = new Set(["na", "kr", "jp", "euw", "eune", "oce", "br", "las", "lan", "ru", "tr"]);

            //Check for region flag
            if(args[0].startsWith(flagEnum.REGION)){
                region = args[0].replace(flagEnum.REGION, "");


                if(!validRegions.has(region)){
                    return message.channel.send("Invalid Region");
                }

                args.shift();
            }

            if(!args.length){
                return message.channel.send("Gimme a name");
            }

            //Check for link/unlink flag
            if(args[0].startsWith("-")){

                if(args[0] == flagEnum.LINK){
                    args.shift();
                    leagueLink(message, args, database, region);


                } else if(args[0] == flagEnum.UNLINK){
                    args.shift();
                    leagueUnlink(message, client, database);

                //Invalid flag
                } else {
                    return message.channel.send("Invalid flags given.");
                }

            //No flags
            } else {
                let mentionedUser = helper.getFirstMention(args, client, "user");

                if(mentionedUser){
                    database.query(`SELECT * FROM userinfo WHERE id = '${mentionedUser.id}'`, (err, rows) => {
                        if(err) throw err;

                        username = !rows.length ? "" : rows[0].league;
                        region = !rows.length ? "" : rows[0].region;
                        leagueSearch(message, username, region, mentionedUser);
                    });


                } else {
                    username = args.join(" ");
                    leagueSearch(message, username, region, mentionedUser);
                }
            }
        }
    }
}