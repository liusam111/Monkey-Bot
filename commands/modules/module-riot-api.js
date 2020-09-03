const {RIOT_API_KEY, LOL_PATCH} = require('../../data/config.json');
const {data: championData} = require(`../../lol_assets/${LOL_PATCH}/data/en_US/champion.json`);
const {data: summonerSpellData} = require(`../../lol_assets/${LOL_PATCH}/data/en_US/summoner.json`);
const axios = require('axios');


module.exports = {
    QUEUES: {
        SOLO: 'RANKED_SOLO_5x5',
        FLEX: 'RANKED_FLEX_SR',
    },
    
    RANKS: {
        UNRANKED: 'unranked',
        IRON: 'iron',
        BRONZE: 'bronze',
        SILVER: 'silver',
        GOLD: 'gold',
        PLATINUM: 'platinum',
        DIAMOND: 'diamond',
        MASTER: 'master',
        GRANDMASTER: 'grandmaster',
        CHALLENGER: 'challenger',
    },

    TEAMS: {
        BLUE: 100,
        RED: 200
    },

    ERRORS:{
        DNE: 404,
    },

    REQUEST_TYPE: {
        SEARCH_USER: 'search',
        LIVE_GAME: 'livegame'
    },

    handleAPIError(params, err, requestType, region, username){
        if(err = this.ERRORS.DNE){
            switch(requestType){
                case this.REQUEST_TYPE.SEARCH_USER:
                    params.message.channel.send(`I can\'t find \`${username} (${region})\`. Make sure the username and region are correct!`);
                    return;
                case this.REQUEST_TYPE.LIVE_GAME:
                    params.message.channel.send(`Seems like \`${username} (${region})\` isn't in a game!`);
                    return;
                default:
                    throw err;
            }
        } else {
            throw err;
        }
    },

    getPlatformId(region){
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
    
    getChampionById(id){
        if(id == -1){
            return "None";
        }

        for(let champion of Object.values(championData)){
            if(champion.key == id){
                //Riot sometimes uses internal names as keys, but 'name' is what players refer to
                return champion.name;
            }
        }
        throw new Error('Outdated lol_assets');
    },

    getSummonerSpellById(id){
        for(let spell of Object.values(summonerSpellData)){
            if(spell.key == id){
                return spell.name;
            }
        }
        throw new Error('Outdated lol_assets');
    },

    getProfileIcon(iconId, pathToRoot){
        return `${pathToRoot}/lol_assets/${LOL_PATCH}/img/profileicon/${iconId}.png`;
    },

    getRankIcon(tier, rank, pathToRoot){
        tier = tier.toLowerCase();
        rank = rank ? rank.toLowerCase() : '';

        let pathToIcons = `${pathToRoot}/lol_assets/extra_icons/rank_icons`;

        switch(tier){
            case this.RANKS.UNRANKED:
                return `${pathToIcons}/${this.RANKS.UNRANKED}.png`
            case this.RANKS.MASTER:
                return `${pathToIcons}/${this.RANKS.MASTER}.png`;
            case this.RANKS.GRANDMASTER:
                return `${pathToIcons}/${this.RANKS.GRANDMASTER}.png`;
            case this.RANKS.CHALLENGER:
                return `${pathToIcons}/${this.RANKS.CHALLENGER}.png`;
            default:
                return `${pathToIcons}/${tier}_${rank}.png`;
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
        const regionURL = this.getPlatformId(region);
        const URL = encodeURI(`https://${regionURL}.api.riotgames.com/${path}`);
        const tokenHeader = {'X-Riot-Token': RIOT_API_KEY}
        
        try{
            const response = await axios.get(URL, {headers: tokenHeader});
            if(response.status != 200){
                throw new Error(`Riot API request failed with status code ${response.status}`);
            };
            return response.data; 
        } catch (err){
            if(err.response && err.response.status == 404){
                throw this.ERRORS.DNE;
            }
            throw err;
        }
    
    },

    async getSummonerDataByName(region, summonerName){
        const SUMMONER_ENDPOINT = `/lol/summoner/v4/summoners/by-name/${summonerName}`;
        const response = await this.requestFromAPI(region, SUMMONER_ENDPOINT);
        return response;
    },

    async getRankedResponse(region, encryptedSummonerId){
        const RANKED_ENDPOINT = `/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`;
        const response = await this.requestFromAPI(region, RANKED_ENDPOINT);
        return response;
    },

    async getCurrentMatch(region, encryptedSummonerId){
        const MATCH_ENDPOINT = `/lol/spectator/v4/active-games/by-summoner/${encryptedSummonerId}`;
        const response = await this.requestFromAPI(region, MATCH_ENDPOINT);
        return response;
    },

    async getChampionMastery(region, encryptedSummonerId){
        const MASTERY_ENDPOINT = `/lol/champion-mastery/v4/champion-masteries/by-summoner/${encryptedSummonerId}`;
        const response = await this.requestFromAPI(region, MASTERY_ENDPOINT);
        return response;
    },

}