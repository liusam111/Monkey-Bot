module.exports = {
    name: "league",
    description: "Shows Ranked Solo/Duo information of specified League username",
    execute(message, args, client, database){
        let username;

        //No arguments given, search for message author's League profile
        if(!args.length){
            database.query(`SELECT * FROM userinfo 
                            WHERE id = '${message.author.id}'`, (err, rows) => {
                if(err) throw err;

                //First time chatting in a server with Monkey Bot
                if(!rows.length){
                    database.query(`INSERT INTO userinfo (id) 
                                    VALUES('${message.author.id}')`);
                    username = "";
                } else {
                    username = rows[0].league;
                }
                console.log(username)
                leagueSearch(message, username, message.author, true);
            });

            

        } else {

            //Args contains flags
            if(args[0].startsWith("-")){

                //Link new username to Discord id
                if(args[0] == "-link"){
                    args.shift();
                    leagueLink(message, args, client, database);

                //Unlink username from Discord id
                } else if(args[0] == "-unlink"){
                    args.shift();
                    console.log("unlonk");

                //Invalid flag
                } else {
                    return message.channel.send("Invalid flags given.");
                }

            //No flags
            } else {
                let username;
                
                let mentionedUser = getFirstMention(args, client, "user");

                if(mentionedUser){
                    database.query(`SELECT * FROM userinfo 
                                    WHERE id = '${mentionedUser.id}'`, (err, rows) => {
                        if(err) throw err;

                        username = !rows.length ? "" : rows[0].league;
                        leagueSearch(message, username, mentionedUser, false);
                    });


                } else {
                    username = args.join(" ");
                    leagueSearch(message, username, mentionedUser, false);
                }
            }
        }
    }
}