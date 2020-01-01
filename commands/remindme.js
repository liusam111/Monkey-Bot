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

        const firstVal = args[0];
        const splitByTime = args[0].split(":");
        const splitByDate = args[0].replace(/\//g, "-").split("-");
        const dayOfWeek = remind.getDayOfWeek(args[0]);
        
        //Time Offset
        if(!isNaN(firstVal)){
            remind.parseByOffset(message, args, client, database);
        //Date and Time
        } else if(minDateArgs <= splitByDate.length && splitByDate.length <= maxDateArgs){
            let a = 1;
        //Only Time
        } else if(splitByTime != numTimeArgs){
            let a = 1;
        //Day of Week
        } else if(dayOfWeek != -1){
            let a = 1;
        } else {
            message.channel.send(formatError);
        }
    }
}