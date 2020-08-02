const riot = require('./module-riot-api.js');

module.exports = {
    FLAG_LINK: '-link',
    FLAG_UNLINK: '-unlink',
    FLAG_REGION: '-region=',
    DEFAULT_REGION: 'NA',

    isValidRegionCode(region){
        return riot.getRegionURL(region) == '' ? false : true;
    },

    parseRegionArg(regionArg){
        regionArg = regionArg.replace(this.FLAG_REGION, '').toUpperCase();
        if(this.isValidRegionCode(regionArg)){
            return regionArg;
        }
    },

    rankToInt(roman){
        switch(roman){
            case 'I':
                return 1;
            case 'II':
                return 2;
            case 'III':
                return 3;
            case 'IV':
                return 4;
            default:
                return '';
        }
    },

    usernameDatabaseLookup(username){
        return;
    },
}

