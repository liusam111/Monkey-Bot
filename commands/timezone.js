const remind = require('./modules/module-remind.js');
const {valid: validTimezones} = require('../data/timezones.json');

module.exports = {
    name: 'timezone',
    async execute(params){

        let savedTimezone = params.client.userTimezones.get(params.message.author.id);

        if(!params.args.length){
            let timezone = savedTimezone || remind.DEFAULT_TZ;
            params.message.reply(`You current timezone is set to \`${timezone}\`\n\nYou can use \`~timezone [your_timezone]\` to change this. Valid timezones can be found under \`TZ database name\` here:\n<https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>`);
        } else {

            let timezone = validTimezones[params.args[0].toLowerCase()];

            if(params.args.length > 1 || !timezone){
                params.message.reply('Invalid Timezone! Valid timezones can be found under \`TZ database name\` here:\n<https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>');
                return;
            }

            if(!savedTimezone){
                params.database.query(
                    `INSERT INTO timezones (id, timezone) VALUES (?, ?);`, 
                    [params.message.author.id, timezone]
                )
            } else {
                params.database.query(
                    `UPDATE timezones SET timezone = ? WHERE id = ?;`, 
                    [timezone, params.message.author.id]
                );
            }

            params.client.userTimezones.set(params.message.author.id, timezone);
            params.message.reply(`You timezone has been changed to ${timezone}!`);

        }


    }
}