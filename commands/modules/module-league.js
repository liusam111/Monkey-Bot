const riot = require('./module-riot-api.js');
const general = require('./module-general.js');
const options = require('./module-options.js');
const Discord = require('discord.js');
const emotes = require('../../data/emotes.json')

module.exports = {
    DEFAULT_REGION: 'NA',

    isValidRegionCode(region){
        return riot.getPlatformId(region) == '' ? false : true;
    },

    async getSummonerFromArgs(params){
        let mention = await general.getFirstMention(params, general.MENTION_TYPE.USER);

        if(!params.args.length || mention){
            let userId = mention ? mention.id : params.message.author.id;
            let linkedSummoner = params.client.leagueUsernames.get(userId);

            if(!linkedSummoner){
                if(mention){
                    params.message.channel.send(`${mention.username} hasn't linked their League account!`);
                } else{
                    params.message.reply(`You haven't linked your League account! Use \`~league ${options.LEAGUE.LINK} your_username\` to link it.`);
                }
                return null;
            }

            return linkedSummoner;

        } else {
            region = this.DEFAULT_REGION;
        
            let regionOptionVal = options.getOptionValue(params.args[0], options.LEAGUE.REGION);
            if(regionOptionVal){
                if(this.isValidRegionCode(regionOptionVal)){
                    region = regionOptionVal.toUpperCase();
                    params.args.shift();
                } else {
                    params.message.reply('That\'s not a valid region!');
                    return null;
                }
            }
    
            username = params.args.join(' ');

            return {
                username: username,
                region: region
            };
        }
    },

    parseProfileSearchOptions(args){
        let result = {
            action: 'search',
            region: this.DEFAULT_REGION
        }
    
        let currArg = args[0];
        if(!currArg.startsWith('-')){
            return result;
        }
    
        let regionOptionVal = options.getOptionValue(currArg, options.LEAGUE.REGION);
        if(regionOptionVal){
            if(this.isValidRegionCode(regionOptionVal)){
                result.region = regionOptionVal.toUpperCase();
                args.shift();
            } else {
                throw 'That\'s not a valid region!';
            }
        }
    
        currArg = args[0];
        if(!currArg){
            throw 'I\'m gonna need a username with that option...';
        }
    
        if(currArg == options.LEAGUE.LINK || currArg == options.LEAGUE.UNLINK){
            result.action = currArg;
            args.shift();
        }
    
        return result;
    },

    async searchProfile(region, username){
        const regionForURL = region == 'KR' ? 'www' : `${region.toLowerCase()}`;
        
        let summonerData, rankedResponse;
        try{
            summonerData = await riot.getSummonerDataByName(region, username);
            rankedResponse = await riot.getRankedResponse(region, summonerData.id);
        } catch (err){
            riot.handleAPIError(params, err, riot.REQUEST_TYPE.SEARCH_USER, region, username);
            return;
        }
    
        const PROFILE_ICON_NAME = 'profileIcon.png';
        const RANK_ICON_NAME = 'rankedIcon.png';
    
        const title = `${summonerData.name} (${region})`;
        const level = `${summonerData.summonerLevel}`;
        const opgg = encodeURI(`https://${regionForURL}.op.gg/summoner/userName=${summonerData.name}`);
        const footer = `Use the ${options.LEAGUE.REGION[0]}XX option to search different regions!`;
        const profileIconPath = riot.getProfileIcon(summonerData.profileIconId, './')
        const profileIcon = new Discord.MessageAttachment(profileIconPath, PROFILE_ICON_NAME)
    
        const rankedData = riot.getRankedData(rankedResponse, riot.QUEUES.SOLO);
    
        let embed;
    
        if(rankedData){
            //Change from all caps to first letter uppercase
            const tier = `${rankedData.tier[0]}${rankedData.tier.slice(1).toLowerCase()}`; 

            const rank = `${tier} ${rankedData.rank} ${rankedData.leaguePoints} LP`
            const wins = `${rankedData.wins}`
            const losses = `${rankedData.losses}`;
            const winRatio = `${(rankedData.wins / ((rankedData.wins + rankedData.losses)) * 100).toFixed(1)}%`;

            const rankIcon = new Discord.MessageAttachment(
                riot.getRankIcon(rankedData.tier, rankedData.rank, './'), 
                RANK_ICON_NAME
            );
    
            embed = new Discord.MessageEmbed()
                .setColor('#fffff0')
                .setTitle(title)
                .setURL(opgg)
                .addField('Level', level)
                .addField('Ranked Solo/Duo', rank)
                .addField('Wins', wins, true)
                .addField('Losses', losses, true)
                .addField('Win Ratio', winRatio, true)
                .attachFiles([profileIcon, rankIcon])
                .setImage(`attachment://${PROFILE_ICON_NAME}`)
                .setThumbnail(`attachment://${RANK_ICON_NAME}`)
                .setFooter(footer);
    
    
        } else {
            const rankIcon = new Discord.MessageAttachment(
                riot.getRankIcon(riot.RANKS.UNRANKED, null, './'), 
                RANK_ICON_NAME
            );
    
            embed = new Discord.MessageEmbed()
                .setColor('#fffff0')
                .setTitle(title)
                .setURL(opgg)
                .addField('Level', level)
                .addField('Ranked Solo/Duo', `${riot.RANKS.UNRANKED[0].toUpperCase()}${riot.RANKS.UNRANKED.slice(1)}`)
                .attachFiles([profileIcon, rankIcon])
                .setImage(`attachment://${PROFILE_ICON_NAME}`)
                .setThumbnail(`attachment://${RANK_ICON_NAME}`)
                .setFooter(footer); 
        }
        
        params.message.channel.send(embed);
    },

    async linkProfile(params, region, username){
        let summonerData;
        try{
            summonerData = await riot.getSummonerDataByName(region, username);
            username = summonerData.name; //Use API username capitalization
        } catch(err){
            riot.handleAPIError(params, err, riot.REQUEST_TYPE.SEARCH_USER, region, username);
            return;
        }

        let linkedData = params.client.leagueUsernames.get(params.message.author.id);
        if(!linkedData){
            params.database.query(
                `INSERT INTO lol_names (id, username, region) VALUES (?, ?, ?);`,
                [params.message.author.id, username, region]
            );
        } else {
            params.database.query(
                `UPDATE lol_names SET username = ?, region = ? WHERE id = ${params.message.author.id};`,
                [username, region],
            );
        }

        let summoner = {
            region: region,
            username: username,
        }
        params.client.leagueUsernames.set(params.message.author.id, summoner);
        params.message.reply(`Your League username has been set to \`${username} (${region})\`!`);
    },

    unlinkProfile(params){
        let linkedData = params.client.leagueUsernames.get(params.message.author.id);
        if(!linkedData){
            params.message.reply('There\'s nothing to unlink!')
            return;
        }

        params.database.query(`DELETE FROM lol_names WHERE id = ${params.message.author.id};`);
        params.client.leagueUsernames.delete(params.message.author.id);
        params.message.reply('Your League username has been unlinked!');
    },







    parseParticipantData(targetPlayer, participants, participantBans){
        let teamData = {};
        for(let team of Object.values(riot.TEAMS)){
            teamData[team] = {
                players: [],
                bans: []
            };
        }

        for(let player of participants){
            let isRequestedPlayer = player.summonerName.toLowerCase() == targetPlayer.toLowerCase();
            let botTag = player.bot ? ' (Bot)' : '';
            let champion = riot.getChampionById(player.championId);

            let playerData = {
                username: player.summonerName,
                displayName: isRequestedPlayer ? `**__${player.summonerName}__**` : `${player.summonerName}${botTag}`,
                championIcon: emotes[champion],
                spell1Icon: emotes[riot.getSummonerSpellById(player.spell1Id)],
                spell2Icon: emotes[riot.getSummonerSpellById(player.spell2Id)],
            }

            teamData[player.teamId].players.push(playerData);
        }

        for(let ban of participantBans){
            teamData[ban.teamId].bans.push(emotes[riot.getChampionById(ban.championId)]);
        }

        return teamData;
    },

    async parseParticipantRankedData(region, participants){
        let playerRankedData = {};

        for(let player of participants){
            let rankedResponse = await riot.getRankedResponse(region, player.summonerId);
            let rankedData = riot.getRankedData(rankedResponse, riot.QUEUES.SOLO);

            playerRankedData[player.summonerName] = {};

            if(rankedData){
                //Change from all caps to first letter uppercase;
                let tier = `${rankedData.tier[0]}${rankedData.tier.slice(1).toLowerCase()}`;
                let rank = [riot.RANKS.MASTER, riot.RANKS.GRANDMASTER, riot.RANKS.CHALLENGER]
                    .includes(tier.toLowerCase()) ? '' : rankedData.rank;

                let wins = rankedData.wins;
                let losses = rankedData.losses;
                let winPercent = ((wins / (wins + losses)) * 100).toFixed(1);

                playerRankedData[player.summonerName].rank = `${emotes[tier]} ${tier} ${rank} (${rankedData.leaguePoints} LP)`; 
                playerRankedData[player.summonerName].hotStreak = rankedData.hotStreak;
                playerRankedData[player.summonerName].winrate = `**${winPercent}%** (${wins}W | ${losses}L)`;
            } else {
                let tier = `${riot.RANKS.UNRANKED[0].toUpperCase()}${riot.RANKS.UNRANKED.slice(1)}`

                playerRankedData[player.summonerName].rank = `${emotes[tier]} ${tier}`;
                playerRankedData[player.summonerName].hotStreak = false;
                playerRankedData[player.summonerName].winrate = '**0.00%** (0W | 0L)';
            }   
        }

        return playerRankedData;
    },

    formatTeamStrings(team){
        let teamStrings = {};

        teamStrings.title = 

        teamStrings.players = team.players.map((player) => {
            return `${player.championIcon} ${player.username}`;
        }).join('\n')

        teamStrings.spells = team.players.map((player) => {
            return `${player.spell1Icon} ${player.spell2Icon}`;
        }).join('\n')

        teamStrings.bans = team.bans.join(' ');

        return teamStrings;
    },

    formatDetailedTeamStrings(team, rankedData){
        let teamStrings = {};

        teamStrings.players = team.players.map((player) => {
            let spells = `${player.spell1Icon} ${player.spell2Icon}`;
            let hotStreakIcon = rankedData[player.username].hotStreak ? ':fire:' : '';
            return `${spells} \u200B \u200B ${player.championIcon} ${player.displayName}${hotStreakIcon}`;
        }).join('\n')

        teamStrings.ranks = team.players.map((player) => {
            return `${rankedData[player.username].rank}`;
        }).join('\n')

        teamStrings.winrates = team.players.map((player) => {
            return `${rankedData[player.username].winrate}`;
        }).join('\n')

        teamStrings.bans = team.bans.join(' ');

        return teamStrings;
    },
    
}

