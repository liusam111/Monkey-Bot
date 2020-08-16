const remindCRUD = require('./module-remind-crud.js');

// initParams: client, database
module.exports = {

    initReminderId(initParams){
        initParams.database.query(`SELECT id FROM curr_reminder_id;`, (err, rows) => {
            if(err) throw err;

            //currReminderId should always exist, otherwise table was not set up correctly
            initParams.client.currReminderId = rows[0].id;
        });
    },

    loadReminderCounts(initParams){
        initParams.database.query(`SELECT uid, COUNT(*) AS count FROM reminders GROUP BY uid;`, (err, rows) => {
            if(err) throw err;
 
            for(let countInfo of rows){
                initParams.client.reminderCounts.set(countInfo.uid, countInfo.count);
            }
        });
    },

    loadReminders(initParams){
        initParams.database.query(`SELECT * FROM reminders;`, (err, rows) => {
            if(err) throw err;

            /**
             * Table column names are the same as reminder Object's keys, so the RowPacket Object can be 
             * sent directly into setReminder
             */
            for(let reminder of rows){
                remindCRUD.setReminder(initParams, reminder);
            }
        });
    },

    loadUserReminderIds(initParams){
        //TODO
    },

    loadUserTimezones(initParams){
        initParams.database.query(`SELECT * from timezones;`, (err, rows) => {
            if(err) throw err;
 
            for(let timezoneInfo of rows){
                initParams.client.userTimezones.set(timezoneInfo.id, timezoneInfo.timezone);
            }
        });  
    },

    loadLeagueUsernames(initParams){
        //TODO
    }

}