const RIOT_API_KEY = require('../../data/config.json').riot_api_key;
const axios = require('axios');

module.exports = {
    SOLO_QUEUE: 'RANKED_SOLO_5x5',
    FLEX: 'RANKED_FLEX_SR',
    ERROR_DNE: '404',
    PATCH: '10.14.1',

    getRegionURL(region){
        switch(region.toUpperCase()){
            case 'NA':
                return 'na1';
            case 'EUW':
                return 'euw1';
            case 'EUNE':
                return 'eun1';
            case 'LAN':
                return 'la1';
            case 'LAS':
                return 'la2';
            case 'KR':
                return 'kr';
            case 'JP':
                return 'jp1';
            case 'BR':
                return 'br1';
            case 'TR':
                return 'tr1';
            case 'OCE':
                return 'oc1';
            case 'RU':
                return 'ru';
            default:
                return '';
        }
    },
    
    getRankedData(rankedResponse, queue){
        for(let queueData of rankedResponse){
            if(queueData.queueType == queue){
                return queueData;
            }
        }
        return null;
    },

    async requestFromAPI(region, path){
        const regionURL = this.getRegionURL(region);
        const URL = encodeURI(`https://${regionURL}.api.riotgames.com/${path}`);
        const tokenHeader = {'X-Riot-Token': RIOT_API_KEY}
        
        try{
            const response = await axios.get(URL, {headers: tokenHeader});

            if(response.status != 200){
                throw new Error(`Request failed with status code ${response.status}`);
            };
    
            return response.data; 
        } catch (err){
            if(err.response.status == 404){
                throw this.ERROR_DNE;
            }
            throw err;
        }
    
    },

    async getSummonerInfoByName(region, summonerName){
        const SUMMONER_INFO_PATH = `/lol/summoner/v4/summoners/by-name/${summonerName}`;

        const response = await this.requestFromAPI(region, SUMMONER_INFO_PATH);

        return response;
    },

    async getRankedInfo(region, encryptedSummonerId){
        const RANKED_INFO_PATH = `/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`;
        
        const response = await this.requestFromAPI(region, RANKED_INFO_PATH);

        return response;
    },

    async getCurrentMatch(region, encryptedSummonerId){
        const MATCH_REQUEST_PATH = `/lol/spectator/v4/active-games/by-summoner/${encryptedSummonerId}`;

        const response = await this.requestFromAPI(region, MATCH_REQUEST_PATH);

        return response;
    },


}