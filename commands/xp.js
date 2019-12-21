const EXP_MAX = 100;

module.exports = {
    name: "xp",
    description: "Shows user's level and xp",
    execute(message, args, client, database){
        const Discord = require("discord.js");

        var currUser = getFirstMention(args, client, "user") || message.author;

        database.query(`SELECT * FROM userinfo WHERE id = '${currUser.id}'`, (err, rows) => {
            if(err) console.error(err);

            let currExp;
            if(!rows.length){
                currExp = 0;
            } else {
                currExp = rows[0].xp;
            }

            //Different level and exp for bots
            let expString;
            let level;

            if(currUser.bot){
                expString = "(100 / 100)";
                level = 9999999;
            } else {
                expString = `(${currExp % EXP_MAX} / 100)`;
                level = Math.floor(currExp / EXP_MAX) + 1;
            }

            let embed = new Discord.RichEmbed()
                .setColor("#fffff0")
                .setTitle(`${currUser.tag}`)
                .setDescription(`Level ${level} ${expString}`)
                .setThumbnail(currUser.displayAvatarURL)
                .addField("Total Exp: ", currExp);

            message.channel.send(embed);
        });

    }
}