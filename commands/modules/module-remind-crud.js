const moment = require('moment');
const tz = require('moment-timezone');
const Discord = require('discord.js');

module.exports = {
    
    createReminder(params, epoch, timezone, message){
        let currId = ++params.client.currReminderId;
        params.database.query(`UPDATE curr_reminder_id SET id = ${currId}`);

        let reminder = {
            r_id: currId,
            u_id: params.message.author.id,
            epoch: epoch,
            timezone: timezone,
            message: message
        }

        params.database.query(
            `INSERT INTO reminders (r_id, u_id, epoch, timezone, message) VALUES (?, ?, ?, ?, ?)`,
            [reminder.r_id, reminder.u_id, reminder.epoch, reminder.timezone, reminder.message],
        );

        this.setReminder(params, reminder);
        return currId;
    },


    async setReminder(params, reminder){
        let timeout = params.client.remindTimeouts.get(reminder.r_id);

        if(timeout){
            clearTimeout(timeout);
            params.client.remindTimeouts.delete(reminder.r_id);
        }

        const now = moment.tz(reminder.timezone);
        const reminderTime = moment.tz(reminder.epoch, reminder.timezone);
        let diff = reminder.epoch - now.valueOf();

        let user = await params.client.users.fetch(reminder.u_id);

        if(diff <= 0){
            user.send(`Looks like I was offline at ${reminderTime.format('LLLL')} (${reminder.timezone}) when I was supposed to remind you of this:
                       \`\`\`${reminder.message}\`\`\`
                       Sorry about that!`);
            return;
        }

        timeout = setTimeout(() =>{
            let embed = new Discord.MessageEmbed()
            .setColor('#fffff0')
            .setTitle('REMINDER!!!')
            .setDescription(reminder.message);
            user.send(embed);
            this.deleteReminder(params, reminder);
        }, diff);

        params.client.remindTimeouts.set(reminder.r_id, timeout);
    },

    editReminder(params, newReminder){
        setReminder(params.client, newReminder);
        params.database.query(
            `UPDATE reminders SET epoch = ?, timezone = ?, message = ? WHERE r_id = ? AND u_id = ?`,
            [newReminder.epoch, newReminder.timezone, newReminder.message, newReminder.id, newReminder.u_id]
        );
    },


    getReminders(params){
        params.database.query(`SELECT * FROM reminders WHERE u_id = ${params.message.author.id}`, (err, rows) => {

        });
    },


    deleteReminder(params, reminder){
        let timeout = params.client.remindTimeouts.get(reminder.r_id);
        if(timeout){
            clearTimeout(timeout);
            params.client.remindTimeouts.delete(reminder.r_id);
        }
        params.database.query(
            `DELETE FROM reminders WHERE r_id = ? AND u_id = ?`, 
            [reminder.r_id, reminder.u_id]
        );
    }
}