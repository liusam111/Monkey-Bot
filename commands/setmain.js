module.exports = {
    name: "setmain",
    description: "Sets the main channel for the bot, only available to server mods",
    guildOnly: true,
    execute(message, args, client, database){
        const helper = require("./helper_general.js");

        //Check permissions
        if(!helper.isModerator(message.member)){
            return message.channel.send("You do not have permission to use this command.");
        }

        if(!message.mentions.channels.size){
            message.channel.send("Please mention a channel (#channelname)");
        } else {

            let newMain = helper.getFirstMention(args, client, "channel").id;
            let guildId = message.guild.id;

            //Save main channel id to database
            database.query(`SELECT * FROM mainchannel WHERE guildid = '${guildId}'`, (err, rows) => {
                if(err) console.error(err);

                let sql;
 
                if(!rows.length){
                    sql = `INSERT INTO mainchannel (guildid, mainchannelid, enable) VALUES('${guildId}', '${newMain}', ${true})`;
                } else {
                    sql = `UPDATE mainchannel SET mainchannelid = '${newMain}' WHERE guildid = '${guildId}'`;
                }

                database.query(sql);
                message.channel.send(`Main channel has been set to <#${newMain}>`);
            });
            
        }
    }
}