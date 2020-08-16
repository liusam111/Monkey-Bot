const moment = require('moment');
const tz = require('moment-timezone');
const Discord = require('discord.js');


module.exports = {

    //TODO: Use memory cache
    verifyReminder(params, reminderId, verifiedAction){
        params.database.query(
            `SELECT * FROM reminders WHERE rid = ? AND uid = ?;`,
            [reminderId, params.message.author.id],
            (err, rows) => {
                if (err) throw err;

                if(!rows.length){
                    params.message.reply('You don\'t have a reminder with that ID!');
                } else {
                    verifiedAction(rows);
                }
            }
        );
    },

    createReminder(params, epoch, timezone, message){
        let userId = params.message.author.id;
        let newCount = (params.client.reminderCounts.get(userId) || 0) + 1;
        params.client.reminderCounts.set(userId, newCount);

        let newReminderId = ++params.client.currReminderId;
        params.database.query(`UPDATE curr_reminder_id SET id = ${newReminderId};`);

        let reminder = {
            rid: newReminderId,
            uid: params.message.author.id,
            epoch: epoch,
            timezone: timezone,
            message: message
        }

        params.database.query(
            `INSERT INTO reminders (rid, uid, epoch, timezone, message) VALUES (?, ?, ?, ?, ?);`,
            [reminder.rid, reminder.uid, reminder.epoch, reminder.timezone, reminder.message],
        );


        this.setReminder(params, reminder);
        return newReminderId;
    },


    async setReminder(params, reminder){
        let timeout = params.client.reminderTimeouts.get(reminder.rid);

        if(timeout){
            clearTimeout(timeout);
            params.client.reminderTimeouts.delete(reminder.rid);
        }

        const now = moment.tz(reminder.timezone);
        const reminderTime = moment.tz(reminder.epoch, reminder.timezone);

        let diff = reminder.epoch - now.valueOf();
        let user = await params.client.users.fetch(reminder.uid);

        if(diff <= 0){
            user.send(`Looks like I was offline at ${reminderTime.format('LLLL')} (${reminder.timezone}) when I was supposed to remind you of this:\`\`\`${reminder.message}\`\`\`Sorry about that!`);
            this.deleteReminder(params, reminder.uid, reminder.rid);
            return;
        }

        timeout = setTimeout(() =>{
            let embed = new Discord.MessageEmbed()
                .setColor('#fffff0')
                .setTitle('REMINDER!!!')
                .setDescription(reminder.message);
            user.send(embed);
            this.deleteReminder(params, reminder.uid, reminder.rid);
        }, diff);

        params.client.reminderTimeouts.set(reminder.rid, timeout);
    },

    showReminders(params){
        params.database.query(`SELECT * FROM reminders WHERE uid = ${params.message.author.id};`, (err, rows) => {
            if(err) throw err;

            let embed = new Discord.MessageEmbed()
                .setColor('#fffff0')
                .setTitle(`Your Active Reminders`)

            if(!rows.length){
                embed.setDescription('No Reminders Set!');
            } else {
                for(let reminder of rows){
                    let timeString = moment.tz(reminder.epoch, reminder.timezone).format('LLLL');
                    embed.addField(`ID: ${reminder.rid}\n${timeString} (${reminder.timezone})`, reminder.message);
                }
            }
            
            params.message.author.send(embed);
        });
    },


    editReminder(params, newReminder){
        this.setReminder(params, newReminder);
        params.database.query(
            `UPDATE reminders SET epoch = ?, timezone = ?, message = ? WHERE rid = ? AND uid = ?;`,
            [newReminder.epoch, newReminder.timezone, newReminder.message, newReminder.rid, newReminder.uid]
        );
    },

    deleteReminder(params, userId, reminderId){
        let newCount = params.client.reminderCounts.get(userId) - 1;
        params.client.reminderCounts.set(userId, newCount);
        
        let timeout = params.client.reminderTimeouts.get(reminderId);
        if(timeout){
            clearTimeout(timeout);
            params.client.reminderTimeouts.delete(reminderId);
        }
        params.database.query(`DELETE FROM reminders WHERE rid = ${reminderId} AND uid = ${userId};`);
    }
}