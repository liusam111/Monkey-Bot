const general = require('./modules/module-general.js');
const riot = require('./modules/module-riot-api.js');
const league = require('./modules/module-league.js');
const emotes = require('../data/emotes.json');
const Discord = require('discord.js');

const MAX_DISPLAY = 10;

module.exports = {
    name: 'mastery',
    async execute(params){

        let summoner = await league.getSummonerFromArgs(params);
        if(!summoner) return;
        let username = summoner.username;
        let region = summoner.region;

        let summonerData, masteryData;
        try{
            summonerData = await riot.getSummonerDataByName(region, username);
            masteryData = await riot.getChampionMastery(region, summonerData.id);
        }catch(err){
            riot.handleAPIError(params, err, riot.REQUEST_TYPE.SEARCH_USER, region, username);
            return;
        }

        let championStrings = [];
        let masteryStrings = [];
        let lastPlayedStrings = [];
        
        //Riot API returns mastery data already sorted by championPoints from largest to smallest
        for(let i = 0; i < masteryData.length && i < MAX_DISPLAY; i++){
            let curr = masteryData[i];

            let champion = riot.getChampionById(curr.championId);
            let championIcon = emotes[champion];
            let masteryLevel = curr.championLevel;
            let masteryIcon = emotes[`Mastery${masteryLevel}`];
            let masteryPoints = curr.championPoints
            let lastPlayedEpoch = curr.lastPlayTime;

            championStrings.push(`${championIcon} **${champion}**`);
            masteryStrings.push(`${masteryIcon} **${masteryLevel}** | ${masteryPoints}`);
            lastPlayedStrings.push(general.timeSince(lastPlayedEpoch));
        }

        let embed = new Discord.MessageEmbed()
            .setColor('#fffff0')
            .setTitle(`Champion Mastery: ${summonerData.name} (${region})`)
            .setDescription('This player\'s highest mastery champions are:')
            .addField('Champion', championStrings.join('\n'),true)
            .addField('Mastery Level/Points', masteryStrings.join('\n'),true)
            .addField('Last Played', lastPlayedStrings.join('\n'),true)

        params.message.channel.send(embed);
    }
}