const MIN_DATE_ARGS = 2;
const MAX_DATE_ARGS = 3;
const NUM_TIME_ARGS = 2;
const NEXT_DOW = 7;

const {isNumber, TO_MS} = require('./module-general.js');
const moment = require('moment');
const tz = require('moment-timezone');

const validFormats = (function (){
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
})();



module.exports = {
    ERROR: 'error',
    PAST: 'past',
    DEFAULT_TZ: 'America/Los_Angeles',
    validFormats,

    /* Get date string based on time offset arguments */
    parseByOffset(args, timezone){
        if(args.length % 2 != 0){
            return this.ERROR;
        }

        const weeks = /^w((ee)?ks?)?$/;
        const days = /^d(ays?)?$/;
        const hours = /^h((ou)?rs?)?$/;
        const mins = /^m(in(ute)?s?)?$/;

        const keys = [weeks, days, hours, mins];
        const values = [TO_MS.WEEK, TO_MS.DAY, TO_MS.HOUR, TO_MS.MIN];

        let totalOffset = 0;

        let currArg = 0;
        for(let i = 0; i < keys.length && currArg < args.length; i++){
            let value = args[currArg];
            let unitOfTime = args[currArg + 1];
            let unitRegex = keys[i];
            
            
            if(!isNumber(value) || value < 0){
                return this.ERROR;
            }

            if(unitOfTime.match(unitRegex)){
                let unitConvert = values[i];
                totalOffset += value * unitConvert;
                currArg += 2;
            }
            
        }

        if(currArg < args.length || totalOffset < 1){
            return this.ERROR;
        }

        const now = moment.tz(timezone);
        const remindMoment = moment.tz(now.valueOf() + totalOffset, timezone);
        return remindMoment.valueOf();

    },


    /* Get date string based on date and optional time arguments 
     * If no time given, defaults to current time
     * If no year given, defaults to current year if time hasn't already passed
     * and defaults to next year otherwise
     */
    parseByDateTime(args, timezone){
        const now = moment.tz(timezone);
        const dateArg = args.shift();

        let timeString = args.length ? args.join(' ') : this.getCurrTime(timezone);

        const dateInput = dateArg.replace(/\//g, '-').split('-');
        const monthValue = dateInput[0];
        const dateValue = dateInput[1];

        let remindMoment;
        //Length is either 2 (no year) or 3 (specified year), enforced in main remindme function
        if(dateInput.length == MIN_DATE_ARGS){
            let dateString = `${monthValue}-${dateValue}-${now.year()}`;
            let momentString = `${dateString} ${timeString}`;

            remindMoment = moment.tz(momentString, validFormats, true, timezone);

            if(isNaN(remindMoment.valueOf())){
                return this.ERROR;
            }

            if(remindMoment.valueOf() <= now.valueOf()){
                remindMoment.year(now.year() + 1);
            }


        } else {
            let dateString = dateArg;
            let momentString = `${dateString} ${timeString}`;

            remindMoment = moment.tz(momentString, validFormats, true, timezone);

            if(isNaN(remindMoment.valueOf())){
                return this.ERROR;
            }

            if(remindMoment.valueOf() <= now.valueOf()){
                return this.PAST;
            }
        }

        return remindMoment.valueOf();
        
    },


    /* Get date string based on only time arguments 
     * Handles 12 hour clock HH:MM{AM/PM}, HH:MM {AM/PM} (with space between time and AM/PM)
     * and 24 hour clock HH:MM formats through Moment/Moment-Timezone parsing
     */
    parseByTime(args, timezone){     
        const now = moment.tz(timezone);

        const momentString = `${this.getCurrDate(timezone)} ${args.join(' ')}`;
        const remindMoment = moment.tz(momentString, validFormats, true, timezone);
        
        //Invalid format
        if(isNaN(remindMoment.valueOf())){
            return this.ERROR;
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
    parseByDayOfWeek(args, timezone){
        const dayOfWeekArg = this.getDayOfWeek(args.shift());

        if(dayOfWeekArg == -1){
            return this.ERROR;
        }

        let timeString = args.length ? args.join(' ') : this.getCurrTime(timezone);

        const momentString = `${this.getCurrDate(timezone)} ${timeString}`;
        const remindMoment = moment.tz(momentString, validFormats, true, timezone);

        if(isNaN(remindMoment.valueOf())){
            return this.ERROR;
        }

        remindMoment.day(dayOfWeekArg + NEXT_DOW);

        return remindMoment.valueOf();

    },

    /* 
     * Get date string based on month in string format
     * Converts string to numeric month, day, year format so it can be based
     * as a Date/Time instead
     */
    parseByMonthString(args, timezone){
        const now = moment.tz(timezone);

        let month = this.getMonthFromString(args.shift()) + 1; //Returned month is 0 indexed
        let day = args.shift();

        //Just month, no other args
        if(!day){
            return this.ERROR;
        }

        let year = (args.length && isNumber(args[0])) ? `/${args.shift()}` : '';
        let timeString = args.length ? args.join(' ') : this.getCurrTime(timezone);

        return this.parseByDateTime([`${month}/${day.replace(/,$/, '')}${year}`, `${timeString}`], timezone);
    },



    argsToEpoch(args, timezone){
        const isNum = isNumber(args[0]);
        const splitByTime = args[0].split(':');
        const splitByDate = args[0].replace(/\//g, '-').split('-');
        const dayOfWeek = this.getDayOfWeek(args[0]);
        const monthString = this.getMonthFromString(args[0]);
        
        //Time Offset
        if(isNum){
            return this.parseByOffset(args, timezone);
        //Date and Time
        } else if(MIN_DATE_ARGS <= splitByDate.length && splitByDate.length <= MAX_DATE_ARGS){
            return this.parseByDateTime(args, timezone);
        //Only Time
        } else if(splitByTime.length == NUM_TIME_ARGS){
            return this.parseByTime(args, timezone);
        //Day of Week
        } else if(dayOfWeek != -1){
            return this.parseByDayOfWeek(args, timezone);
        //Month in String Format
        } else if(monthString != -1){
            return this.parseByMonthString(args, timezone);
        } else {
            return this.ERROR;
        }
    },


    /*
     * Returns the current date in MM-DD-YYYY format
     */
    getCurrDate(timezone){
        const now = moment.tz(timezone);
        
        const currMonth = now.month() + 1; //Month is 0 indexed
        const currDay = now.date();
        const currYear = now.year();
    
        return `${currMonth}-${currDay}-${currYear}`;
    },


    /*
     * Returns the current time in HH:MM format
     */
    getCurrTime(timezone){
        const now = moment.tz(timezone);
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

}