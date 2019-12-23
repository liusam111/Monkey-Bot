const EXP_MAX = 100;

module.exports = {
    name: "incrementXP",
    description: "Give the user 1 xp each time they send a message and store their xp in a MySQL database",
    cannotRun: true,
    execute(message, args, client, database){
        database.query(`SELECT * FROM userinfo 
                        WHERE id = '${message.author.id}'`, (err, rows) => {
            if(err) console.error(err);

            let sql;
            if(!rows.length){
                sql = `INSERT INTO userinfo (id, xp) 
                       VALUES ('${message.author.id}', 1)`;
            } else {
                let currExp = rows[0].xp + 1;
                sql = `UPDATE userinfo SET xp = ${currExp}
                       WHERE id = '${message.author.id}'`;

                //Send level up message
                if(currExp % EXP_MAX == 0){
                    let level = Math.floor(currExp / EXP_MAX) + 1;
                    message.channel.send(`<@${message.author.id}> is now Level ${level}!`);
                }
            }
            database.query(sql);
        });

    }
}