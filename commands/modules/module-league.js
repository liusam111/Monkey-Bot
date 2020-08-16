const {getFlagValue} = require('./module-general.js');
const riot = require('./module-riot-api.js');

module.exports = {
    DEFAULT_REGION: 'NA',

    isValidRegionCode(region){
        return riot.getPlatformId(region) == '' ? false : true;
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
                return -1;
        }
    },

}

