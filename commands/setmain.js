module.exports = {
    name: "setmain",
    description: "Sets the main channel for the bot, only available to server mods",
    guildOnly: true,
    execute(message, args, client, database){
        if(!message.mentions.channels.size){
            message.channel.send("Please mention a channel (#channelname)");
        } else {

            let newMain = getFirstMention(args, client, "channel").id;
            let currGuild = message.guild.id;

            //Save main channel id to database
            database.query(`SELECT * FROM mainchannel 
                            WHERE guildid = '${currGuild}'`, (err, rows) => {
                if(err) console.error(err);

                let sql;
 
                if(!rows.length){
                    sql = `INSERT INTO mainchannel (guildid, mainchannelid, enable) 
                           VALUES('${currGuild}', '${newMain}', ${true})`;
                } else {
                    sql = `UPDATE mainchannel SET mainchannelid = '${newMain}' 
                           WHERE guildid = '${currGuild}'`;
                }

                database.query(sql);
                message.channel.send(`Main channel has been set to <#${newMain}>`);
            });
            
        }
    }
}