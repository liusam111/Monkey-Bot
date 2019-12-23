module.exports = {
    name: "facttoggle",
    description: "Enables/Disables automatics facts in the server",
    guildOnly: true,
    execute(message, args, client, database){
        
        database.query(`SELECT * FROM mainchannel 
                        WHERE guildid = '${message.guild.id}'`, (err, rows) => {
            if(err) throw err;

            if(!rows.length){
                return message.channel.send("You haven't set a main channel for facts yet!");
            }

            let enable = rows[0].enable;
            database.query(`UPDATE mainchannel SET enable = ${!enable} 
                            WHERE guildid = '${message.guild.id}'`);
            let output = enable ? "disabled" : "enabled";
            message.channel.send(`Automatic fun facts has been ${output}`);

        });
    }
}