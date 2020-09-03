const {TO_MS} = require('./modules/module-general.js');
const league = require('./modules/module-league.js');
const riot = require('./modules/module-riot-api.js');
const options = require('./modules/module-options.js');
const queues = require('../data/lol_game_constants/queues.json');
const emotes = require('../data/emotes.json');
const Discord = require('discord.js');


module.exports = {
    name: 'dlg',
    async execute(params){

        let summoner = await league.getSummonerFromArgs(params);
        if(!summoner) return;
        let username = summoner.username;
        let region = summoner.region;

        let summonerData, liveGameData, rankedData;
        try{
            summonerData = await riot.getSummonerDataByName(region, username);
        } catch(err){
            riot.handleAPIError(params, err, riot.REQUEST_TYPE.SEARCH_USER, region, username);
            return;
        }

        try{
            liveGameData = await riot.getCurrentMatch(region, summonerData.id);
            rankedData = await league.parseParticipantRankedData(region, liveGameData.participants);
        } catch(err){
            riot.handleAPIError(params, err, riot.REQUEST_TYPE.LIVE_GAME, region, username);
            return;
        }

        //Use API username capitalization
        for(let player of liveGameData.participants){
            if(player.summonerName.toLowerCase() == username.toLowerCase()){
                username = player.summonerName;
                break;
            }
        }

        let teamData = league.parseParticipantData(username, liveGameData.participants, liveGameData.bannedChampions);
        
        let queueId = liveGameData.gameQueueConfigId;
        let map, gameMode;
        for(let queue of queues){
            if(queue.queueId == queueId){
                map = queue.map;
                gameMode = queue.description;
                break;
            }
        }
        gameMode = gameMode || 'Special Mode';

        let gameLength = Date.now().valueOf() - liveGameData.gameStartTime;
        let gameMins = Math.floor(gameLength / TO_MS.MIN).toString().padStart(2, '0');
        let gameSecs = Math.floor(gameLength % TO_MS.MIN / TO_MS.SEC).toString().padStart(2, '0');

        let embedTitle = `In-Game: ${username} (${region})`;
        let embedDescription = `${emotes.Map} **__${map}:__ ${gameMode}** | ${gameMins}:${gameSecs}`;

        let embed = new Discord.MessageEmbed()
            .setColor('#fffff0')
            .setTitle(embedTitle)
            .setDescription(embedDescription)

        for(let team of [riot.TEAMS.BLUE, riot.TEAMS.RED]){
            let teamStrings = league.formatDetailedTeamStrings(teamData[team], rankedData);

            if(team == riot.TEAMS.BLUE){
                embed.addField(`${emotes.BlueTeam} Blue Team`, teamStrings.players, true);
            } else {
                embed.addField(`${emotes.RedTeam} Red Team`, teamStrings.players, true)
            }

            embed.addField('Rank (Solo/Duo)', teamStrings.ranks, true)
            embed.addField('Win Rate', teamStrings.winrates, true)
            
            if(teamStrings.bans){
                embed.addField('Bans', teamStrings.bans)
            }

        }

        params.message.channel.send(embed);
    }
}