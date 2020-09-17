const riot = require('./modules/module-riot-api.js');
const league = require('./modules/module-league.js');
const emotes = require('../data/emotes.json');
const options = require('./modules/module-options.js');
const Discord = require('discord.js');

module.exports = {
    name: 'rotation',
    async execute(params){

        let region = league.DEFAULT_REGION;

        if(!params.args.length){
            let linkedSummoner = params.client.leagueUsernames.get(params.message.author.id);

            if(linkedSummoner){
                region = linkedSummoner.region;
            }
        } else {
            let regionOption = options.getOptionValue(params.args[0], options.LEAGUE.REGION);
            if(regionOption){
                if(league.isValidRegionCode(regionOption)){
                    region = regionOption.toUpperCase();
                    params.args.shift();
                } else {
                    params.message.reply('That\'s not a valid region!');
                    return;
                }
            }
        }

        
        let rotation = await riot.getChampionRotation(region);

        let embed = new Discord.MessageEmbed()
            .setColor('#fffff0')
            .setTitle(`Free Champion Rotation (${region}):`)

        let freeChampions = []
        for(let id of rotation.freeChampionIds){
            let champion = riot.getChampionById(id);
            freeChampions.push(`${emotes[champion]} ${champion}`);
        }

        embed.addField('All Players', freeChampions.join('\n'), true);

        freeChampions = [];
        for(let id of rotation.freeChampionIdsForNewPlayers){
            let champion = riot.getChampionById(id);
            freeChampions.push(`${emotes[champion]} ${champion}`);
        }

        embed.addField(`New Players(Max Level: ${rotation.maxNewPlayerLevel})`, freeChampions.join('\n'), true);

        params.message.channel.send(embed);



    }
}