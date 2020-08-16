

module.exports = {
    INVALID: 'invalid',

    LEAGUE: {
        REGION: ['-region=', '-r='],
        LINK: '-link',
        UNLINK: '-unlink',
    },

    REMIND: {
        TZ: ['-timezone=', '-tz='],
        EDIT_TIME: ['-edittime', '-et'],
        EDIT_MSG: ['-editmsg', '-em'],
        DELETE: ['-delete', '-d'],
    },

    getFlagValue(flagArg, flagPrefixes){
        for(let prefix of flagPrefixes){
            if(flagArg.startsWith(prefix)){
                return flagArg.replace(prefix, '');
            }
        }
    },

}