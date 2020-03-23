const WK_TO_MS = 604800000;
const DAY_TO_MS = 86400000;
const HR_TO_MS = 3600000;
const MIN_TO_MS = 60000;
const minDateArgs = 2;
const maxDateArgs = 3;
const numTimeArgs = 2;

const moment = require("moment");
const tz = require("moment-timezone");

const validFormats = [
    "M-D-YYYY h:mm a",
    "M-D-YYYY h:mma",
    "M-D-YYYY H:mm",
    "M/D/YYYY h:mm a",
    "M/D/YYYY h:mma",
    "M/D/YYYY H:mm",
    "M-D-YY h:mm a",
    "M-D-YY h:mma",
    "M-D-YY H:mm",
    "M/D/YY h:mm a",
    "M/D/YY h:mma",
    "M/D/YY H:mm",
    "MMM D h:mm a",
    "MMM D h:mma",
    "MMMM D h:mm a",
    "MMMM D h:mma",
    "MMM D YYYY h:mm a",
    "MMM D YYYY h:mma",
    "MMMM D YYYY h:mm a",
    "MMMM D YYYY h:mma",
    "MMM D, YYYY h:mm a",
    "MMM D, YYYY h:mma",
    "MMMM D, YYYY h:mm a",
    "MMMM D, YYYY h:mma",
    "MMM D H:mm",
    "MMMM D H:mm",
    "MMM D YYYY H:mm",
    "MMMM D YYYY H:mm",
    "MMM D, YYYY H:mm",
    "MMMM D, YYYY H:mm"
];

const DEFAULT_TZ = "America/Los_Angeles";

module.exports = {

    /* Get date string based on time offset arguments */
    parseByOffset(message, args, client, database){
        const errorMessage = "Invalid Format and/or Offset";
        
        if(args.length % 2 != 0){
            return message.channel.send(errorMessage);
        }

        const weeks = /^w((ee)?ks?)?$/;
        const days = /^d(ays?)?$/;
        const hours = /^h((ou)?rs?)?$/;
        const mins = /^m(in(ute)?s?)?$/;

        const keys = [weeks, days, hours, mins];
        const values = [WK_TO_MS, DAY_TO_MS, HR_TO_MS, MIN_TO_MS];

        let totalOffset = 0;

        let currArg = 0;
        for(let i = 0; i < keys.length && currArg < args.length; i++){
            let value = args[currArg];
            let unitOfTime = args[currArg+1];
            let unitRegex = keys[i];
            
            
            if(!this.isNumber(value) || value < 0){
                return message.channel.send(errorMessage);
            }

            if(unitOfTime.match(unitRegex)){
                let unitConvert = values[i];
                totalOffset += value * unitConvert;
                currArg += 2;
            }
            
        }

        if(currArg < args.length || totalOffset < 1){
            return message.channel.send(errorMessage);
        }
        
        let remindMoment = new Date(Date.now() + totalOffset);
        message.channel.send("WIP: Alarm would've been set at: " + remindMoment.toString());

    },


    /* Get date string based on date and optional time arguments 
     * If no time given, defaults to current time
     * If no year given, defaults to current year if time hasn't already passed,
     * Otherwise, defaults to next year
     */
    parseByDateTime(message, args, client, database){
        const errorMessage = "Invalid Format and/or Time";

        const now = moment.tz(DEFAULT_TZ);
        const dateArg = args.shift();

        let timeString;
        //Date and time
        if(args.length){
            timeString = `${args.toString().replace(/,/g, " ")}`;

        //Only date
        } else {
            timeString = `${now.hour()}:${now.minute()}`;
        }


        const dateValues = dateArg.replace(/\//g, "-").split("-");
        const monthInput = dateValues[0];
        const dateInput = dateValues[1];

        let dateString;
        //Length is either 2 (no year) or 3 (specified year), enforced in main remindme function
        if(dateValues.length == 2){
            dateString = `${monthInput}-${dateInput}-${now.year()}`;
        } else {
            dateString = dateArg;
        }


        
    },


    /* Get date string based on only time arguments 
     * Handles 12 hour clock HH:MM{AM/PM}, HH:MM {AM/PM} (with space between time and AM/PM)
     * and 24 hour clock HH:MM formats through Moment/Moment-Timezone parsing
     */
    parseByTime(message, args, client, database){
        const errorMessage = "Invalid Format and/or Time";     

        const now = moment.tz(DEFAULT_TZ);
        const currMonth = now.month() + 1; //Month is 0 indexed
        const currDay = now.date();
        const currYear = now.year();
        const timeString = `${currMonth}-${currDay}-${currYear} ${args.toString().replace(/,/g, " ")}`;
        
        let remindMoment = moment.tz(timeString, validFormats, true, DEFAULT_TZ);
        
        //Invalid format
        if(isNaN(remindMoment.valueOf())){
            return message.channel.send(errorMessage);
        }

        //Set for next day if time already passed
        if(remindMoment.valueOf() <= now.valueOf()){
            remindMoment = moment.tz(remindMoment.valueOf() + DAY_TO_MS, DEFAULT_TZ);
        }

        message.channel.send("WIP: Alarm would've been set at: " + remindMoment.toString());
    },


    /* Get date string based on next day of the week arguments */
    parseByDayOfWeek(message, args, client, database){

    },

    /* Get date string based on month in string format */
    parseByMonthString(message, args, client, database){

    },


    /*
     * Returns the 0 indexed day of week based on the day of week string
     */
    getDayOfWeek(day) {
        if(day.match(/^sun(day)?$/i)){
            return 0;
        }
        if(day.match(/^mon(day)?$/i)){
            return 1;
        }
        if(day.match(/^tue(sday|s)?$/i)){
            return 2;
        }
        if(day.match(/^wed(nesday)?$/i)){
            return 3;
        }
        if(day.match(/^thu(rsday|rs|r)?$/i)){
            return 4;
        }
        if(day.match(/^fri(day)?$/i)){
            return 5;
        }
        if(day.match(/^sat(urday)?$/i)){
            return 6;
        }
        return -1;
    },


    /* 
     * Checks whether the input is a number or not
     * Excludes empty string
     * */
    isNumber(num){
        if(num.match(/^[0-9]+$/)) return true;
        return false;
    }
}