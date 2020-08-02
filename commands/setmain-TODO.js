module.exports = {
    name: 'setmain',
    description: 'Sets the main channel for the bot, only available to server mods',
    guildOnly: true,
    async execute(message, args, client, database){
        /*
        const helper = require('./helper/helper_general.js');

        //Check permissions
        if(!helper.isModerator(message.member)){
            return message.channel.send('You do not have permission to use this command.');
        }

        let guildId = message.guild.id;

        if(!message.mentions.channels.size){
            database.query(`SELECT * FROM mainchannel WHERE guildid = '${guildId}'`, (err, rows) => {
                if(err) throw err;

                if(!rows.length || !message.guild.channels.has(rows[0].mainchannelid)){
                    return message.channel.send('This server does not have a main channel. Mention a channel using this command to set one.')
                }

                message.channel.send(`This server's main channel is <#${rows[0].mainchannelid}>.`);

            });
        } else {

            let newMain = helper.getFirstMention(args, client, 'channel').id;

            if(!message.guild.channels.has(newMain)){
                return message.channel.send('Nice try. That channel isn\'t in this server.');
            }

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
        */
       return;
    }
}