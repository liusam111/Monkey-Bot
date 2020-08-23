const remindCRUD = require('./module-remind-crud.js');

// initParams: client, database
module.exports = {

    currReminderId(initParams){
        initParams.database.query(`SELECT id FROM curr_reminder_id;`, (err, rows) => {
            if(err) throw err;

            //currReminderId should always exist, otherwise table was not set up correctly
            initParams.client.currReminderId = rows[0].id;
            console.log('Current Reminder ID Loaded!');
        });
    },

    reminders(initParams){
        initParams.database.query(`SELECT * FROM reminders;`, (err, rows) => {
            if(err) throw err;

            /**
             * Table column names are the same as reminder Object's keys, so the RowPacket Object can be 
             * sent directly into setReminder
             */
            for(let reminder of rows){

                let userReminders = initParams.client.reminderIds.get(reminder.uid) || [];
                userReminders.push(reminder.rid.toString());
                initParams.client.reminderIds.set(reminder.uid, userReminders);

                remindCRUD.setReminder(initParams, reminder);
            }

            console.log('User Reminders Loaded!');
        });
    },

    userTimezones(initParams){
        initParams.database.query(`SELECT * from timezones;`, (err, rows) => {
            if(err) throw err;
 
            for(let timezoneData of rows){
                initParams.client.userTimezones.set(timezoneData.id, timezoneData.timezone);
            }
            console.log('Timezones Loaded!');
        });  
    },

    leagueUsernames(initParams){
        initParams.database.query(`SELECT * from lol_names;`, (err, rows) => {
            if(err) throw err;

            for(let usernameData of rows){
                let summoner = {
                    region: usernameData.region,
                    username: usernameData.username
                }
                initParams.client.leagueUsernames.set(usernameData.id, summoner);
            }
            console.log('League Usernames Loaded!');
        });
    }

}