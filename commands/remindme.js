const minDateArgs = 2;
const maxDateArgs = 3;
const numTimeArgs = 2;

module.exports = {
    name: "remindme",
    description: "Set a reminder notification in the current channel at the specified time",
    cooldown: 0.1,
    execute(message, args, client, database){
        const remind = require("./helper/helper_remind.js");
        const formatError = "Invalid Format";

        if(!args.length){
            return message.channel.send(formatError);
        }

        const isNum = remind.isNumber(args[0]);
        const splitByTime = args[0].split(":");
        const splitByDate = args[0].replace(/\//g, "-").split("-");
        const dayOfWeek = remind.getDayOfWeek(args[0]);
        const monthString = remind.getMonthFromString(args[0]);
        
        //Time Offset
        if(isNum){
            remind.parseByOffset(message, args, client, database);
        //Date and Time
        } else if(minDateArgs <= splitByDate.length && splitByDate.length <= maxDateArgs){
            remind.parseByDateTime(message, args, client, database);
        //Only Time
        } else if(splitByTime.length == numTimeArgs){
            remind.parseByTime(message, args, client, database);
        //Day of Week
        } else if(dayOfWeek != -1){
            remind.parseByDayOfWeek(message, args, client, database);
        //Month in String Format
        } else if(monthString != -1){
            remind.parseByMonthString(message, args, client, database);
        } else {
            message.channel.send(formatError);
        }
    }
}