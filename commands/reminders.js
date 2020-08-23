const {isNumber} = require('./modules/module-general.js');
const remind = require('./modules/module-remind.js');
const remindCRUD = require('./modules/module-remind-crud.js');
const options = require('./modules/module-options.js');
const moment = require('moment');
const tz = require('moment-timezone');
const {valid: validTimezones} = require('../data/timezones.json');
const {PREFIX} = require('../data/config.json');


module.exports = {
    name: 'reminders',
    async execute(params){

        let option = params.args.shift() || '';
        let idArg = params.args.shift();
        let reminderId = isNumber(idArg || '') ? parseInt(idArg) : NaN;

        switch(true){
            case options.REMIND.EDIT_MSG.includes(option):
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

                    let commandRegex = RegExp(`${PREFIX}${this.name}`,'i');
                    let optionRegex = RegExp(`${option}`, 'i');

                    newReminder.message = params.source.replace(commandRegex, '').replace(optionRegex, '').replace(`${reminderId}`, '').trim();

                    remindCRUD.editReminder(params, newReminder);
                    //TODO: Use embed
                    params.message.reply(`Reminder message has been changed to\`\`\`${newReminder.message}\`\`\``);
                });

            break;



            case options.REMIND.EDIT_TIME.includes(option):
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



            case options.REMIND.DELETE.includes(option):
                if(isNaN(reminderId)){
                    params.message.reply('That\'s not a valid ID!');
                    return;
                }

                remindCRUD.verifyReminder(params, reminderId, (rows) => {
                    remindCRUD.deleteReminder(params, params.message.author.id, reminderId);
                    params.message.reply('Reminder deleted!');
                });

                break;



            case option.startsWith('-'):
                params.message.reply('Invalid Options!');
                break;


                
            default:
                remindCRUD.showReminders(params);
                break;
        }

    }
}