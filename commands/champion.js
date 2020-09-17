const general = require('./modules/module-general.js');
const riot = require('./modules/module-riot-api.js');
const league = require('./modules/module-league.js');
const emotes = require('../data/emotes.json');
const Discord = require('discord.js');
const {LOL_PATCH} = require('../data/config.json');


module.exports = {
    name: 'champion',
    async execute(params){

        if(!params.args.length){
            params.message.reply('I\'m gonna need a champion to look up...');
            return;
        }

        //Remove apostrophes so champions like Kha'Zix can by typed as "KhaZix"
        let rawChampionString = params.args.join(' ').replace('\'', '');

        let championInternalName;
        try{
            championInternalName = riot.getChampionInternalName(rawChampionString);
        } catch(err){
            params.message.reply('I couldn\'t find that champion! Either you mistyped the champion, or my data is on the wrong patch');
            return
        }

        const CHAMPION_ICON_NAME = 'Champion.png';
        const championData = require(`../lol_assets/${LOL_PATCH}/data/en_US/champion/${championInternalName}.json`).data[championInternalName];
        const championIcon = new Discord.MessageAttachment(
            riot.getChampionIcon(championInternalName, './'), 
            CHAMPION_ICON_NAME
        );

        let stats = championData.stats;

        let statsLeftCol = [
            `**HP:** ${stats.hp} (+ ${stats.hpperlevel})`,
            `**HP Regen:** ${stats.hpregen} (+ ${stats.hpregenperlevel})`,
            `**${championData.partype}:** ${stats.mp} (+ ${stats.mpperlevel})`,
            `**${championData.partype} Regen:** ${stats.mpregen} (+ ${stats.mpregenperlevel})`,
            `**Movement Speed: ** ${stats.movespeed}`,
        ]

        let statsRightCol = [
            `**Attack Damage:** ${stats.attackdamage} (+ ${stats.attackdamageperlevel})`,
            `**Attack Speed:** ${stats.attackspeed} (+ ${stats.attackspeedperlevel})`,
            `**Attack Range:** ${stats.attackrange}`,
            `**Armor:** ${stats.armor} (+ ${stats.armorperlevel})`,
            `**Magic Resist: ** ${stats.spellblock} (+ ${stats.spellblockperlevel})`,
        ]

        let skills = [
            `**Passive:** ${championData.passive.name}`,
            `**Q:** ${championData.spells[0].name}`,
            `**W:** ${championData.spells[1].name}`,
            `**E:** ${championData.spells[2].name}`,
            `**R:** ${championData.spells[3].name}`,
        ]

        let embed = new Discord.MessageEmbed()
            .setColor('#fffff0')
            .setTitle(`${championData.name}, ${championData.title}`)
            .attachFiles([championIcon])
            .setThumbnail(`attachment://${CHAMPION_ICON_NAME}`)
            .addField('Lore', championData.lore)
            .addField('Stats', statsLeftCol.join('\n'), true)
            .addField('\u200b', statsRightCol.join('\n'), true)
            .addField('Skills', skills.join('\n'))
            .setFooter('View skill information using \'~skill champion [passive/p/q/w/e/r]\'!')



        params.message.channel.send(embed);
    }

}