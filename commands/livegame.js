const general = require('./modules/module-general.js');
const league = require('./modules/module-league.js');
const riot = require('./modules/module-riot-api.js');
const queues = require('../data/lol_game_constants/queues.json');
const Discord = require('discord.js');

const MIN_TO_MS = 60000;
const SEC_TO_MS = 1000;

const team = {
    BLUE: 100,
    RED: 200
}

module.exports = {
    name: 'livematch',
    async execute(params){

        let mention = await general.getFirstMention(params, general.USER);

        if(!params.args.length || mention){
            //DO DATABASE CALL
            return;
        }

        let region = league.DEFAULT_REGION;
        
        let regionFlagValue = flags.getFlagValue(params.args[0], flags.LEAGUE.REGION);
        if(regionFlagValue){
            if(league.isValidRegionCode(regionFlagValue)){
                region = regionFlagValue.toUpperCase();
                args.shift();
            } else {
                params.message.reply('That\'s not a valid region!');
            }
        }

        let username = params.args.join(' ');

        let summonerData, liveMatchData;
        try{
            summonerData = await riot.getSummonerDataByName(region, username);
            liveMatchData = await riot.getCurrentMatch(region, summonerData.id);
        } catch(err){
            if(err == riot.ERROR_DNE){
                return params.message.reply(`I can\'t find a match for \`${username} (${region})\`. Either they are not in game, or the username/region is incorrect.`);
            } else {
                throw err;
            }
        }




        let queueId = liveMatchData.gameQueueConfigId;
        let map, gameMode;
        for(let queue of queues){
            if(queue.queueId == queueId){
                map = queue.map;
                gameMode = queue.description;
            }
        }




        let blueTeamInfo = [];
        let redTeamInfo = [];

        for(let player of liveMatchData.participants){
            let isRequestedPlayer = player.summonerName.toLowerCase() == username.toLowerCase();

            let botTag = player.bot ? ' (Bot)' : '';
            let champion = riot.getChampionById(player.championId);

            //TO ADD: win rate, rank, mastery, hotstreak with production key
            let playerInfo = {
                username: isRequestedPlayer ? `**__${player.summonerName}__**` : `${player.summonerName}${botTag}`,
                champion: isRequestedPlayer ? `**__${champion}__**` : `${champion}`,
                spell1: riot.getSummonerSpellById(player.spell1Id),
                spell2: riot.getSummonerSpellById(player.spell2Id),
            }

            if(player.teamId == team.BLUE){
                blueTeamInfo.push(playerInfo);
            } else {
                redTeamInfo.push(playerInfo);
            }

        }

        let blueTeamBans = [];
        let redTeamBans = [];
        let orderedBans = liveMatchData.bannedChampions.sort((a, b) => {return a.pickTurn - b.pickTurn;});
                
        for(let ban of orderedBans){
            if(ban.teamId == team.BLUE){
                blueTeamBans.push(riot.getChampionById(ban.championId));
            } else {
                redTeamBans.push(riot.getChampionById(ban.championId));
            }
        }

        let gameLength = Date.now().valueOf() - liveMatchData.gameStartTime;
        let gameMins = Math.floor(gameLength / MIN_TO_MS).toString().padStart(2, '0');
        let gameSecs = Math.floor(gameLength % MIN_TO_MS / SEC_TO_MS).toString().padStart(2, '0');

        let embedTitle = `In-Game: ${username} (${region})`;
        let embedDescription = `${map}: ${gameMode} | ${gameMins}:${gameSecs}`;

        let bluePlayersString = blueTeamInfo.map(player => {return `(${player.champion}) ${player.username}`}).join('\n');
        let blueSpellsString = blueTeamInfo.map(player => {return `${player.spell1} | ${player.spell2}`}).join('\n');
        let blueBansString = blueTeamBans.join(', ');

        let redPlayersString = redTeamInfo.map(player => {return `(${player.champion}) ${player.username}`}).join('\n');
        let redSpellsString = redTeamInfo.map(player => {return `${player.spell1} | ${player.spell2}`}).join('\n');
        let redBansString = redTeamBans.join(', ');

        let embed = new Discord.MessageEmbed()
            .setColor('#fffff0')
            .setTitle(embedTitle)
            .setDescription(embedDescription)
            .addField('Blue Team', bluePlayersString, true)
            .addField('Spells', blueSpellsString, true)
            .addField('Bans', blueBansString || 'None')
            .addField('Red Team', redPlayersString, true)
            .addField('Spells', redSpellsString, true)
            .addField('Bans', redBansString || 'None')

        params.message.channel.send(embed);
    }
}