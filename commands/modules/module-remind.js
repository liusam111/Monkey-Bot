const WK_TO_MS = 604800000;
const DAY_TO_MS = 86400000;
const HR_TO_MS = 3600000;
const MIN_TO_MS = 60000;
const minDateArgs = 2;
const maxDateArgs = 3;
const numTimeArgs = 2;
const nextDOWOffset = 7;
const validFormats = getValidFormats();
const DEFAULT_TZ = 'America/Los_Angeles';

const moment = require('moment');
const tz = require('moment-timezone');

function getValidFormats(){
    const validTimeFormats = ['h:mm a', 'h:mma', 'H:mm'];
    const validDateFormats = ['M-D', 'M/D', 'M-D-YYYY','M-D-YY','M/D/YYYY','M/D/YY'];
    const validMonthStringFormats = ['MMM D','MMMM D','MMM D YYYY','MMMM D YYYY', 'MMM D, YYYY','MMMM D, YYYY'];

    let validFormats = validTimeFormats.reduce((accumulator, currVal) => {
        for(let format of validDateFormats){
            accumulator.push(`${format} ${currVal}`);
        }
        for(let format of validMonthStringFormats){
            accumulator.push(`${format} ${currVal}`);
        }
        return accumulator;
    }, []);
    return validFormats;
}


module.exports = {
    error: 'ERROR',
    past: 'PAST',
    validFormats,

    /* Get date string based on time offset arguments */
    parseByOffset(args){
        if(args.length % 2 != 0){
            return this.error;
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
            let unitOfTime = args[currArg + 1];
            let unitRegex = keys[i];
            
            
            if(!this.isNumber(value) || value < 0){
                return this.error;
            }

            if(unitOfTime.match(unitRegex)){
                let unitConvert = values[i];
                totalOffset += value * unitConvert;
                currArg += 2;
            }
            
        }

        if(currArg < args.length || totalOffset < 1){
            return this.error;
        }

        const now = moment.tz(DEFAULT_TZ);
        const remindMoment = moment.tz(now.valueOf() + totalOffset, DEFAULT_TZ);
        return remindMoment.valueOf();

    },


    /* Get date string based on date and optional time arguments 
     * If no time given, defaults to current time
     * If no year given, defaults to current year if time hasn't already passed
     * and defaults to next year otherwise
     */
    parseByDateTime(args){
        const now = moment.tz(DEFAULT_TZ);
        const dateArg = args.shift();

        let timeString = args.length ? args.join(' ') : this.getCurrTime();

        const dateInput = dateArg.replace(/\//g, '-').split('-');
        const monthValue = dateInput[0];
        const dateValue = dateInput[1];

        let remindMoment;
        //Length is either 2 (no year) or 3 (specified year), enforced in main remindme function
        if(dateInput.length == 2){
            let dateString = `${monthValue}-${dateValue}-${now.year()}`;
            let momentString = `${dateString} ${timeString}`;

            remindMoment = moment.tz(momentString, validFormats, true, DEFAULT_TZ);

            if(isNaN(remindMoment.valueOf())){
                return this.error;
            }

            if(remindMoment.valueOf() <= now.valueOf()){
                remindMoment.year(now.year() + 1);
            }


        } else {
            let dateString = dateArg;
            let momentString = `${dateString} ${timeString}`;

            remindMoment = moment.tz(momentString, validFormats, true, DEFAULT_TZ);

            if(isNaN(remindMoment.valueOf())){
                return this.error;
            }

            if(remindMoment.valueOf() <= now.valueOf()){
                return this.past;
            }
        }

        return remindMoment.valueOf();
        
    },


    /* Get date string based on only time arguments 
     * Handles 12 hour clock HH:MM{AM/PM}, HH:MM {AM/PM} (with space between time and AM/PM)
     * and 24 hour clock HH:MM formats through Moment/Moment-Timezone parsing
     */
    parseByTime(args){     
        const now = moment.tz(DEFAULT_TZ);

        const momentString = `${this.getCurrDate()} ${args.join(' ')}`;
        const remindMoment = moment.tz(momentString, validFormats, true, DEFAULT_TZ);
        
        //Invalid format
        if(isNaN(remindMoment.valueOf())){
            return this.error;
        }

        //Set for next day if time already passed
        if(remindMoment.valueOf() <= now.valueOf()){
            remindMoment.date(now.date() + 1);
        }

        return remindMoment.valueOf();
    },


    /* Get date string based on next day of the week arguments 
     * If no time given, defaults to current time
     * Time is set based on next day of the week, will not set on the same day
     */
    parseByDayOfWeek(args){
        const dayOfWeekArg = this.getDayOfWeek(args.shift());

        if(dayOfWeekArg == -1){
            return this.error;
        }

        let timeString = args.length ? args.join(' ') : this.getCurrTime();

        const momentString = `${this.getCurrDate()} ${timeString}`;
        const remindMoment = moment.tz(momentString, validFormats, true, DEFAULT_TZ);

        if(isNaN(remindMoment.valueOf())){
            return this.error;
        }

        remindMoment.day(dayOfWeekArg + nextDOWOffset);

        return remindMoment.valueOf();

    },

    /* 
     * Get date string based on month in string format
     * Converts string to numeric month, day, year format so it can be based
     * as a Date/Time instead
     */
    parseByMonthString(args){
        const now = moment.tz(DEFAULT_TZ);

        let month = this.getMonthFromString(args.shift()) + 1; //Returned month is 0 indexed
        let day = args.shift();

        //Just month, no other args
        if(!day){
            return this.error;
        }

        let year = (args.length && this.isNumber(args[0])) ? args.shift() : now.year();
        let timeString = args.length ? args.join(' ') : this.getCurrTime();

        return this.parseByDateTime([`${month}/${day.replace(/,$/, '')}/${year}`, `${timeString}`]);
    },


    /*
     * Returns the current date in MM-DD-YYYY format
     */
    getCurrDate(){
        const now = moment.tz(DEFAULT_TZ);
        const currMonth = now.month() + 1; //Month is 0 indexed
        const currDay = now.date();
        const currYear = now.year();
    
        return `${currMonth}-${currDay}-${currYear}`;
    },


    /*
     * Returns the current time in HH:MM format
     */
    getCurrTime(){
        const now = moment.tz(DEFAULT_TZ);
        const currHour = now.hour();
        const currMin = now.minute();
        
        return `${currHour}:${currMin}`;
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