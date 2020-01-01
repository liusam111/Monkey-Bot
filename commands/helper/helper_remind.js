const WK_TO_MS = 604800000;
const DAY_TO_MS = 86400000;
const HR_TO_MS = 3600000;
const MIN_TO_MS = 60000;

module.exports = {

    /*
     * Returns a Collection/Map pairing a common strings of the days 
     * of the weeks with a numeric value
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

    parseByOffset(message, args, client, database){
        const formatError = "Invalid Format";
        const offsetError = "Invalid Offset"
        const Discord = require("discord.js");
        

        if(args.length % 2 != 0){
            return message.channel.send(formatError);
        }

        const weeks = /^w(ee)?ks?$/;
        const days = /^days?$/;
        const hours = /^h(ou)?rs?$/;
        const mins = /^min(ute)?s?$/;

        const valueMap = new Discord.Collection;
        const keys = [weeks, days, hours, mins];
        valueMap.set(weeks, WK_TO_MS);
        valueMap.set(days, DAY_TO_MS);
        valueMap.set(hours, HR_TO_MS);
        valueMap.set(mins, MIN_TO_MS);

        let totalOffset = 0;

        for(let i = 0; i < keys.length && args.length > 0; i++){
            let value = args[0];
            let unitOfTime = args[1];

            let unitRegex = keys[i];

            if(isNaN(value)){
                return message.channel.send(formatError);
            }
            if(value < 0){
                return message.channel.send(offsetError);
            }

            if(unitOfTime.match(unitRegex)){
                let unitConvert = valueMap.get(unitRegex);
                totalOffset += value * unitConvert;
                args.shift();
                args.shift();
            }
        }

        if(args.length > 0 || totalOffset < 1){
            return message.channel.send(offsetError);
        }
        
        let time = new Date(Date.now() + totalOffset);
        message.channel.send("WIP: Alarm would've been set at: " + time.toString());

    },

    parseByDateTime(message, args, client, database){

    },

    parseByTime(message, args, client, database){
        const splitTime = args[0].split(":");
    },

    parseByDayOfWeek(message, args, client, database){

    }
}