const remind = require('./modules/module-remind.js');
const moment = require('moment');
const tz = require('moment-timezone');

const minDateArgs = 2;
const maxDateArgs = 3;
const numTimeArgs = 2;
const DEFAULT_TZ = 'America/Los_Angeles';


module.exports = {
    name: 'remindme',
    description: 'DMs the user a remind message at the specified time',
    cooldown: 0.1,
    async execute(params){


        if(!params.args.length){
            return params.message.channel.send(formatError);
        }

        let firstArg = params.args[0];
        const isNum = remind.isNumber(firstArg);
        const splitByTime = firstArg.split(':');
        const splitByDate = firstArg.replace(/\//g, '-').split('-');
        const dayOfWeek = remind.getDayOfWeek(firstArg);
        const monthString = remind.getMonthFromString(firstArg);
        
        let remindEpoch;

        //Time Offset
        if(isNum){
            remindEpoch = remind.parseByOffset(params.args);
        //Date and Time
        } else if(minDateArgs <= splitByDate.length && splitByDate.length <= maxDateArgs){
            remindEpoch = remind.parseByDateTime(params.args);
        //Only Time
        } else if(splitByTime.length == numTimeArgs){
            remindEpoch = remind.parseByTime(params.args);
        //Day of Week
        } else if(dayOfWeek != -1){
            remindEpoch = remind.parseByDayOfWeek(params.args);
        //Month in String Format
        } else if(monthString != -1){
            remindEpoch = remind.parseByMonthString(params.args);
        } else {
            return params.message.channel.send('Invalid/Unsupported Format');
        }

        if(isNaN(remindEpoch)){
            if(remindEpoch == remind.past){
                return params.message.channel.send('Invalid Time: This time is in the past!');
            } else {
                return params.message.channel.send('Invalid Offset/Time/Format');
            }
        }

        const remindMoment = moment.tz(remindEpoch, DEFAULT_TZ);

        params.message.channel.send(`(WIP) ALARM AT: ${remindMoment.format('LLLL')}`);


    }
}