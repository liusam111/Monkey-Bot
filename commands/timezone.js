const remind = require('./modules/module-remind.js');
const validTimezones = require('../data/timezones.json').valid;

module.exports = {
    name: 'timezone',
    description: 'Views/sets user time zones for the remind command',
    async execute(params){
        params.database.query(`SELECT * FROM  timezones WHERE id = ${params.message.author.id}`, (err, rows) => {
            if(err) throw err;

            if(!params.args.length){
                let timezone = rows.length ? rows[0].timezone : remind.DEFAULT_TZ;
                params.message.reply(`You current timezone is set to \`${timezone}\`\n\nYou can use \`~timezone [YOUR_TIMEZONE]\` to change this. Valid timezones can be found under \`TZ database name\` here:\n<https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>`);
            } else {

                let timezone = validTimezones[params.args[0].toLowerCase()];

                if(params.args.length > 1 || !timezone){
                    params.message.reply('Invalid Timezone! Valid timezones can be found under \`TZ database name\` here:\n<https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>');
                    return;
                }

                if(!rows.length){
                    params.database.query(
                        `INSERT INTO timezones (id, timezone) VALUES (?, ?)`, 
                        [params.message.author.id, timezone]
                    )
                } else {
                    params.database.query(
                        `UPDATE timezones SET timezone = ? WHERE id = ?`, 
                        [timezone, params.message.author.id]
                    );
                }

                params.message.reply(`You timezone has been changed to ${timezone}!`);
    
            }
            
        });


    }
}