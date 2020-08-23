const general = require('./modules/module-general.js');
const league = require('./modules/module-league.js');
const riot = require('./modules/module-riot-api.js');
const options = require('./modules/module-options.js');
const queues = require('../data/lol_game_constants/queues.json');
const emotes = require('../data/emotes.json');
const Discord = require('discord.js');

const MIN_TO_MS = 60000;
const SEC_TO_MS = 1000;


module.exports = {
    name: 'dlg',
    async execute(params){

        let mention = await general.getFirstMention(params, general.USER);

        let region, username;
        if(!params.args.length || mention){
            let userId = mention ? mention.id : params.message.author.id;
            let linkedSummoner = params.client.leagueUsernames.get(userId);

            if(!linkedSummoner){
                if(mention){
                    params.message.channel.send(`${mention.username} hasn't linked their League account!`);
                } else{
                    params.message.reply(`You haven't linked your League account! Use \`~league ${options.LEAGUE.LINK} YOUR_USERNAME\` to link it.`);
                }
                return;
            }

            region = linkedSummoner.region;
            username = linkedSummoner.username;
        } else {
            region = league.DEFAULT_REGION;
        
            let regionOptionVal = options.getOptionValue(params.args[0], options.LEAGUE.REGION);
            if(regionOptionVal){
                if(league.isValidRegionCode(regionOptionVal)){
                    region = regionOptionVal.toUpperCase();
                    params.args.shift();
                } else {
                    params.message.reply('That\'s not a valid region!');
                    return;
                }
            }
    
            username = params.args.join(' ');
        }



        let summonerData, liveMatchData, rankedData;
        try{
            summonerData = await riot.getSummonerDataByName(region, username);
            liveMatchData = await riot.getCurrentMatch(region, summonerData.id);
            rankedData = await league.parseParticipantRankedData(region, liveMatchData.participants);
        } catch(err){
            if(err == riot.ERROR_DNE){
                return params.message.reply(`I can\'t find a match for \`${username} (${region})\`. Either they are not in game, or the username/region is incorrect.`);
            } else {
                throw err;
            }
        }

        //Use API username capitalization
        for(let player of liveMatchData.participants){
            if(player.summonerName.toLowerCase() == username.toLowerCase()){
                username = player.summonerName;
                break;
            }
        }

        let teamData = league.parseParticipantData(username, liveMatchData.participants, liveMatchData.bannedChampions);
        
        let queueId = liveMatchData.gameQueueConfigId;
        let map, gameMode;
        for(let queue of queues){
            if(queue.queueId == queueId){
                map = queue.map;
                gameMode = queue.description;
                break;
            }
        }

        let gameLength = Date.now().valueOf() - liveMatchData.gameStartTime;
        let gameMins = Math.floor(gameLength / MIN_TO_MS).toString().padStart(2, '0');
        let gameSecs = Math.floor(gameLength % MIN_TO_MS / SEC_TO_MS).toString().padStart(2, '0');

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