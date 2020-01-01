module.exports = {
    name: "facttoggle",
    description: "Enables/Disables automatics facts in the server",
    guildOnly: true,
    execute(message, args, client, database){
        const helper = require("./helper/helper_general.js");

        //Check permissions
        if(!helper.isModerator(message.member)){
            return message.send("You do not have permission to use this command.");
        }


        database.query(`SELECT * FROM mainchannel WHERE guildid = '${message.guild.id}'`, (err, rows) => {
            if(err) throw err;

            if(!rows.length){
                return message.channel.send("You haven't set a main channel for facts yet!");
            }

            let enable = rows[0].enable;
            database.query(`UPDATE mainchannel SET enable = ${!enable} WHERE guildid = '${message.guild.id}'`);
            let status = enable ? "disabled" : "enabled";
            message.channel.send(`Automatic fun facts has been ${status}`);

        });
    }
}