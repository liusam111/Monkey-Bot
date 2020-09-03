module.exports = {

    TO_MS: {
        YEAR: 31556952000,
        MONTH: 2592000000,
        WEEK: 604800000,
        DAY: 86400000,
        HOUR: 3600000,
        MIN: 60000,
        SEC: 1000
    },

    MENTION_TYPE: {
        USER: 'user',
        CHANNEL: 'channel'
    },

    async getFirstMention(params, type){

        let prefix = type == this.MENTION_TYPE.CHANNEL ? '<#' : '<@';

        for(let i = 0; i < params.args.length; i++){
            let mention = params.args[i];
            if(mention.startsWith(prefix) && mention.endsWith('>')){
                mention = mention.slice(2, -1);

                let mentionResult;

                if(type == this.MENTION_TYPE.CHANNEL){
                    mentionResult = await params.client.channels.fetch(mention);
                } else {
                    if(mention.startsWith('!')){
                        mention = mention.slice(1);
                    }

                    mentionResult = await params.client.users.fetch(mention);
                }

                //If mentioned user/channel exists
                if(mentionResult){
                    return mentionResult;
                }
            }
        }
    },

    isModerator(member) {
        let isModerator = member.hasPermission('MANAGE_CHANNELS') ||
                        member.hasPermission('MANAGE_GUILD') ||
                        member.hasPermission('KICK_MEMBERS') ||
                        member.hasPermission('BAN_MEMBERS') ||
                        member.hasPermission('MANAGE_MESSAGES') ||
                        member.hasPermission('ADMINISTRATOR');
        return isModerator;
    },


    timeSince(epoch){
        let timeDiff = Date.now().valueOf() - epoch;

        let timeStrings = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];
        let conversionVals = Object.values(this.TO_MS).sort((a, b) => {return a > b;});
        
        for(let i = 0; i < conversionVals.length; i++){
            let interval = Math.floor(timeDiff / conversionVals[i]);

            if(interval > 0){
                return `${interval} ${timeStrings[i]}${interval != 1 ? 's' : ''} ago`;
            }
        }

        return 'Now';

    },

    isNumber(num){
        if(num.toString().match(/^[0-9]+$/)) return true;
        return false;
    },

}
