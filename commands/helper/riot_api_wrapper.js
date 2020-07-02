const RIOT_API_KEY = require('../../config.json').riot_api_key;
const axios = require('axios');

module.exports = {

    getRegionURL(region){
        switch(region.toLowerCase()){
            case "na":
                return "na1";
            case "euw":
                return "euw1";
            case "eune":
                return "eun1";
            case "lan":
                return "la1";
            case "las":
                return "la2";
            case "kr":
                return "kr";
            case "jp":
                return "jp1";
            case "br":
                return "br1";
            case "tr":
                return "tr1";
            case "oce":
                return "oc1";
            case "ru":
                return "ru";
            default:
                return "";
        }
    },

    async requestFromAPI(region, path){
        const URL = encodeURI(`https://${this.getRegionURL(region)}.api.riotgames.com${path}?api_key=${RIOT_API_KEY}`);
        const response = await axios.get(URL);

        if(response.status != 200) return -1;

        return response.data;
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