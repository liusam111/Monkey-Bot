const {isNumber} = require('./modules/module-general.js');
const remind = require('./modules/module-remind.js');
const remindCRUD = require('./modules/module-remind-crud.js');
const flags = require('./modules/module-flags.js')
const moment = require('moment');
const tz = require('moment-timezone');
const {valid: validTimezones} = require('../data/timezones.json');


module.exports = {
    name: 'reminders',
    async execute(params){

        let flag = params.args.shift() || '';
        let idArg = params.args.shift();
        let reminderId = isNumber(idArg || '') ? parseInt(idArg) : NaN;

        switch(true){
            case flags.REMIND.EDIT_MSG.includes(flag):
                if(isNaN(reminderId)){
                    params.message.reply('That\'s not a valid ID!');
                    return;
                }

                if(!params.args.length){
                    params.message.reply('I\'m gonna need a new message to set to!');
                    return;
                }

                remindCRUD.verifyReminder(params, reminderId, (rows) => {
                    let newReminder = rows[0];
                    newReminder.message = params.args.join(' ');
                    remindCRUD.editReminder(params, newReminder);
                    //TODO: Use embed
                    params.message.reply(`Reminder message has been changed to\`\`\`${newReminder.message}\`\`\``);
                });

            break;



            case flags.REMIND.EDIT_TIME.includes(flag):
                if(isNaN(reminderId)){
                    params.message.reply('That\'s not a valid ID!');
                    return;
                }
                if(!params.args.length){
                    params.message.reply('I\'m gonna need a new time to set to!');
                    return;
                }

                let savedTimezone = params.client.userTimezones.get(params.message.author.id) || remind.DEFAULT_TZ;
                let timezoneArg = savedTimezone;

                let timezoneFlagValue = flags.getFlagValue(params.args[0], flags.REMIND.TZ);
                if(timezoneFlagValue){
                    timezoneArg = validTimezones[timezoneFlagValue.toLowerCase()];
                    if(timezoneArg){
                        params.args.shift();
                    } else {
                        params.message.reply('Invalid timezone!');
                        return;
                    }
                }

                let epoch = remind.argsToEpoch(params.args, timezoneArg);

                switch(epoch){
                    case remind.PAST:
                        params.message.reply('Edit Cancelled: That time is in the past! ');
                        return;
                    case remind.ERROR:
                        params.message.reply('Edit Cancelled: Invalid Format/Offset/Time');
                        return;
                    default:
                        break;
                }


                let remindMoment = moment.tz(epoch, savedTimezone);

                remindCRUD.verifyReminder(params, reminderId, (rows) => {
                    let newReminder = rows[0];
                    newReminder.epoch = remindMoment.valueOf();
                    remindCRUD.editReminder(params, newReminder);
                    //TODO: Use embed
                    params.message.reply(`Reminder time has been changed to\`\`\`${remindMoment.format('LLLL')} (${savedTimezone})\`\`\``);
                });

                break;



            case flags.REMIND.DELETE.includes(flag):
                if(isNaN(reminderId)){
                    params.message.reply('That\'s not a valid ID!');
                    return;
                }

                remindCRUD.verifyReminder(params, reminderId, (rows) => {
                    remindCRUD.deleteReminder(params, params.message.author.id, reminderId);
                    params.message.reply('Reminder deleted!');
                });

                break;



            case flag.startsWith('-'):
                params.message.reply('Invalid Flag!');
                break;


                
            default:
                remindCRUD.showReminders(params);
                break;
        }

    }
}