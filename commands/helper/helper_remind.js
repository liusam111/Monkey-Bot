const WK_TO_MS = 604800000;
const DAY_TO_MS = 86400000;
const HR_TO_MS = 3600000;
const MIN_TO_MS = 60000;
const minDateArgs = 2;
const maxDateArgs = 3;
const numTimeArgs = 2;

const moment = require("moment");
const tz = require("moment-timezone");

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
            console.log(value)
            console.log(unitOfTime)
            if(isNaN(value) || value < 0){
                return message.channel.send(errorMessage);
            }

            if(unitOfTime.match(unitRegex)){
                let unitConvert = values[i];
                totalOffset += value * unitConvert;
                console.log(values)
                currArg += 2;
            }
            
        }

        if(currArg < args.length || totalOffset < 1){
            return message.channel.send(errorMessage);
        }
        
        let alarmTime = new Date(Date.now() + totalOffset);
        message.channel.send("WIP: Alarm would've been set at: " + alarmTime.toString());

    },


    /* Get date string based on date and optional time arguments */
    parseByDateTime(message, args, client, database){

    },


    /* Get date string based on only time arguments */
    parseByTime(message, args, client, database){
        const errorMessage = "Invalid Format and/or Time";

        const formattedTime = this.getTimeStringFromArgs(args);        

        const now = new Date();
        const currMonth = now.getMonth() + 1; //Month is 0 indexed
        const currDay = now.getDate();
        const currYear = now.getFullYear();
        const dateString = `${currMonth}-${currDay}-${currYear} ${formattedTime}`
        
        let alarmTime = new Date(dateString);
        
        if(alarmTime.toString().toLowerCase() == "invalid date"){
            return message.channel.send(errorMessage);
        }

        //Set for next day if time already passed
        if(alarmTime.valueOf() <= now.valueOf()){
            alarmTime = new Date(alarmTime.valueOf() + DAY_TO_MS);
        }

        message.channel.send("WIP: Alarm would've been set at: " + alarmTime.toString());
    },


    /* Get date string based on next day of the week arguments */
    parseByDayOfWeek(message, args, client, database){

    },

    /* Get date string based on month in string format */
    parseByMonthString(message, args, client, database){

    },


    /* 
     * Parses the time from args for errors
     * Modifies the parameter "args" in the process
     * Assumes the first element in "args" is a time string, otherwise it's a format error
     * Returns "INVALID" if there are any format errors
     * Returns a string in the format HH:MM {AM/PM} if no format errors
     *  */
    getTimeStringFromArgs(args){
        const errorString = "INVALID";
        const ampmEnum = {
            AM : "am",
            PM: "pm"
        }

        if(!args.length){
            const now = new Date();
            const currHr = now.getHours();
            const currMin = now.getMinutes();

            return `${currHr}:${currMin}`;

        } else {
            const splitTime = args[0].split(":");

            if(splitTime.length != numTimeArgs){
                return errorString;
            }


            const setHrs = splitTime[0];
            const setMins = splitTime[1].replace(/((a.?m.?)|(p.?m.?))?$/, "");
            args.shift();

            if(!this.isNumber(setHrs) || !this.isNumber(setMins)){
                return errorString;
            }

            let ampmArg = "";
    
            //am or pm is in its own separate argument index
            if(args.length){
                ampmArg = args[0].replace("a.m.", ampmEnum.AM).replace("p.m.", ampmEnum.PM);
                args.shift();

                if(ampmArg != ampmEnum.AM && ampmArg != ampmEnum.PM) return errorString;
                if(args.length) return errorString;
            

            //am or pm is joined with the time or is not given
            } else {

                if(splitTime[1].match(/[0-9]+((a.m.)|(am))$/)){ //AM
                    ampmArg = ampmEnum.AM;
                } else if(splitTime[1].match(/[0-9]+((p.m.)|(pm))$/)){ //PM
                    ampmArg = ampmEnum.PM;
                } else if(splitTime[1].match(/[0-9]+$/)){ //Not Given
                    ampmArg = "";
                } else {
                    return errorString;
                }

            }
            
            return `${setHrs}:${setMins} ${ampmArg}`;
        }
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
     * Returns the 0 indexed month based on the month string
     */
    getMonthFromString(month){
        if(month.match(/^jan(uary)?$/i)){
            return 0;
        }
        if(month.match(/^feb(ruary)?$/i)){
            return 1;
        }
        if(month.match(/^mar(ch)?$/i)){
            return 2;
        }
        if(month.match(/^apr(il)?$/i)){
            return 3;
        }
        if(month.match(/^may$/i)){
            return 4;
        }
        if(month.match(/^jun(e)?$/i)){
            return 5;
        }
        if(month.match(/^jul(y)?$/i)){
            return 6;
        }
        if(month.match(/^aug(ust)?$/i)){
            return 7;
        }
        if(month.match(/^sep(tember|t)?$/i)){
            return 8;
        }
        if(month.match(/^oct(ober)?$/i)){
            return 9;
        }
        if(month.match(/^nov(ember)?$/i)){
            return 10;
        }
        if(month.match(/^dec(ember)?$/i)){
            return 11;
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