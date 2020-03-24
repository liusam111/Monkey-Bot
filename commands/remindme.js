const minDateArgs = 2;
const maxDateArgs = 3;
const numTimeArgs = 2;
const DEFAULT_TZ = "America/Los_Angeles";


module.exports = {
    name: "remindme",
    description: "Set a reminder notification in the current channel at the specified time",
    cooldown: 0.1,
    execute(message, args, client, database){
        const remind = require("./helper/helper_remind.js");
        const moment = require("moment");
        const tz = require("moment-timezone");

        if(!args.length){
            return message.channel.send(formatError);
        }

        const isNum = remind.isNumber(args[0]);
        const splitByTime = args[0].split(":");
        const splitByDate = args[0].replace(/\//g, "-").split("-");
        const dayOfWeek = remind.getDayOfWeek(args[0]);
        const monthString = remind.getMonthFromString(args[0]);
        
        let remindEpoch;

        //Time Offset
        if(isNum){
            remindEpoch = remind.parseByOffset(message, args, client, database);
        //Date and Time
        } else if(minDateArgs <= splitByDate.length && splitByDate.length <= maxDateArgs){
            remindEpoch = remind.parseByDateTime(message, args, client, database);
        //Only Time
        } else if(splitByTime.length == numTimeArgs){
            remindEpoch = remind.parseByTime(message, args, client, database);
        //Day of Week
        } else if(dayOfWeek != -1){
            remindEpoch = remind.parseByDayOfWeek(message, args, client, database);
        //Month in String Format
        } else if(monthString != -1){
            remindEpoch = remind.parseByMonthString(message, args, client, database);
        } else {
            return message.channel.send("Invalid/Unsupported Format");
        }

        if(isNaN(remindEpoch)){
            if(remindEpoch == remind.past){
                return message.channel.send("Invalid Time: This time is in the past!");
            } else {
                return message.channel.send("Invalid Offset/Time/Format");
            }
        }

        const remindMoment = moment.tz(remindEpoch, DEFAULT_TZ);

        message.channel.send(`(WIP) ALARM AT: ${remindMoment.format("LLLL")}`);


    }
}