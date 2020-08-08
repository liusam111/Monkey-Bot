const remind = require('./modules/module-remind.js');
const remindCRUD = require('./modules/module-remind-crud.js');
const moment = require('moment');
const tz = require('moment-timezone');
const Discord = require('discord.js');

const TIMEOUT = 30000;
const CANCEL = '-cancel-';

module.exports = {
    name: 'remindme',
    description: 'DMs the user a remind message at the specified time',
    cooldown: 0.1,

    async execute(params){

        if(!params.args.length){
            return params.message.reply('I\'m gonna need a time for that reminder...');
        }

        params.database.query(`SELECT * FROM timezones WHERE id = ${params.message.author.id}`, (err, rows) => {
            if(err) throw err;

            let timezone = rows.length ? rows[0].timezone : remind.DEFAULT_TZ;            
            let remindEpoch = remind.argsToEpoch(params.args, timezone);

            if(isNaN(remindEpoch)){
                if(remindEpoch == remind.PAST){
                    params.message.reply('Invalid Time: That time is in the past!');
                    return;
                } else { 
                    params.message.reply('Invalid Format/Offset/Time');
                    return;
                }
            }

            const remindMoment = moment.tz(remindEpoch, timezone);

            params.client.activeCommand.set(params.message.author.id);
            const filter = m => m.author.id === params.message.author.id;
            const collector = params.message.channel.createMessageCollector(filter, { max: 1, time: TIMEOUT });

            params.message.reply(`Reminder will be set at \`${remindMoment.format('LLLL')}\`.\n\nEnter your reminder message, or send '${CANCEL}' to cancel creation. You have 30 seconds...GO!`)
            collector.on('collect', m => {
                if(m.content == CANCEL){
                    collector.stop('cancel');
                }
            });

            collector.on('end', (collected, reason) => {
                params.client.activeCommand.delete(params.message.author.id);

                if(reason == 'limit'){
                    let reminderMessage = collected.first().content;

                    //TODO: Wrap this in a database.query to get timezone
                    let id = remindCRUD.createReminder(params, remindEpoch, timezone, reminderMessage);
            
                    let embed = new Discord.MessageEmbed()
                        .setColor('#fffff0')
                        .setTitle(`Reminder Set! (ID: ${id})`)
                        .addField('Time', `${remindMoment.format('LLLL')} (${timezone})`)
                        .addField('Message', reminderMessage)
                        .setFooter('You can view/edit your reminders using \'~TBD\' and change your timezone using \'~timezone\'!');
                
                    params.message.author.send(embed);

                } else if(reason == 'time'){
                    params.message.reply('You\'re taking a bit too long there...');
                } else if(reason == 'cancel'){
                    params.message.reply('Creation cancelled');
                }

            });
        });



    }
}