

module.exports = {
    INVALID: 'invalid',

    LEAGUE: {
        REGION: ['--region=', '-r='],
        LINK: '--link',
        UNLINK: '--unlink',
    },

    REMIND: {
        TZ: ['--timezone=', '-tz='],
        EDIT_TIME: ['--edittime', '-et'],
        EDIT_MSG: ['--editmessage','--editmsg', '-em'],
        DELETE: ['--delete', '-d'],
    },

    getOptionValue(optionArg, optionPrefixes){
        for(let prefix of optionPrefixes){
            if(optionArg.startsWith(prefix)){
                return optionArg.replace(prefix, '');
            }
        }
    },

}