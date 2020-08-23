const remind = require('./modules/module-remind.js');
const remindCRUD = require('./modules/module-remind-crud.js');
const options = require('./modules/module-options.js');
const moment = require('moment');
const tz = require('moment-timezone');
const Discord = require('discord.js');
const {valid: validTimezones} = require('../data/timezones.json');

const MAX_REMINDERS = 5;
const TIMEOUT = 30000;
const CANCEL = '~CANCEL';

module.exports = {
    name: 'remindme',
    cooldown: 0.1,

    async execute(params){
        if(!params.args.length){ 
            params.message.reply('I\'m gonna need a time for that reminder...');
            return;
        }

        let userRemindersId = params.client.reminderIds.get(params.message.author.id);
        let userReminderCount =  userRemindersId ? userRemindersId.length : 0;
        if(userReminderCount >= MAX_REMINDERS){
            params.message.reply(`I can\'t create more than ${MAX_REMINDERS} reminders per person!`);
            return;
        }

        let savedTimezone = params.client.userTimezones.get(params.message.author.id) || remind.DEFAULT_TZ;
        let timezoneArg = savedTimezone;

        let timezoneOptionVal = options.getOptionValue(params.args[0], options.REMIND.TZ);
        if(timezoneOptionVal){
            timezoneArg = validTimezones[timezoneOptionVal.toLowerCase()];
            if(timezoneArg){
                params.args.shift();
            } else {
                params.message.reply('Invalid timezone!');
                return;
            }
        }
        
        if(!validTimezones[timezoneArg.toLowerCase()]){
            params.message.reply('Invalid timezone!');
            return;
        }

        let epoch = remind.argsToEpoch(params.args, timezoneArg);

        switch(epoch){
            case remind.PAST:
                params.message.reply('Invalid Time: That time is in the past!');
                return;
            case remind.ERROR:
                params.message.reply('Invalid Format/Offset/Time');
                return;
            default:
                break;
        }

        let remindMoment = moment.tz(epoch, savedTimezone);

        params.client.activeCommand.set(params.message.author.id);
        const filter = m => m.author.id === params.message.author.id;
        const collector = params.message.channel.createMessageCollector(filter, { max: 1, time: TIMEOUT });

        params.message.reply(`Reminder will be set at \`${remindMoment.format('LLLL')}\`.\n\nEnter your reminder message, or send \`${CANCEL}\`' (case-sensitive) to cancel creation. You have 30 seconds...GO!`)
        collector.on('collect', m => {
            if(m.content == CANCEL){
                collector.stop('cancel');
            }
        });

        collector.on('end', (collected, reason) => {
            params.client.activeCommand.delete(params.message.author.id);

            if(reason == 'limit'){
                let reminderMessage = collected.first().content;

                let id = remindCRUD.createReminder(params, epoch, savedTimezone, reminderMessage);
        
                let embed = new Discord.MessageEmbed()
                    .setColor('#fffff0')
                    .setTitle(`Reminder Set! (ID: ${id})`)
                    .addField('Time', `${remindMoment.format('LLLL')} (${savedTimezone})`)
                    .addField('Message', reminderMessage)
                    .setFooter('You can view/edit your reminders using \'~reminders\' and change your timezone using \'~timezone\'!');
            
                params.message.author.send(embed);

            } else if(reason == 'time'){
                params.message.reply('You\'re taking a bit too long there...');
            } else if(reason == 'cancel'){
                params.message.reply('Creation cancelled');
            }

        });
    }
}