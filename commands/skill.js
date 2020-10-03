const riot = require('./modules/module-riot-api.js');
const {capitalize} = require('./modules/module-general.js');
const Discord = require('discord.js');
const emotes = require('../data/emotes.json');
const {LOL_PATCH} = require('../data/config.json');


module.exports = {
    name: 'skill',
    async execute(params){

        if(!params.args.length){
            params.message.reply('I\'m gonna need a champion to look up...');
            return;
        } else if(params.args.length == 1){
            params.message.reply('I\'m gonna need a skill to look up...');
            return;
        }

        let skill = params.args.pop();
        const VALID_SKILLS = ['passive', 'p', 'q', 'w', 'e', 'r', 'ult']

        if(!VALID_SKILLS.includes(skill)){
            params.message.reply(`\`${skill}\` is not a valid skill! Valid skills are: \`${VALID_SKILLS.join('/')}\``);
            return;
        }

        //Remove apostrophes so champions like Kha'Zix can by typed as "KhaZix"
        let rawChampionString = params.args.join(' ').replace('\'', '');

        let champion;
        try{
            champion = riot.getChampionNames(rawChampionString);
        } catch(err){
            params.message.reply('I couldn\'t find that champion! Either you mistyped the champion, or my data is on the wrong patch');
            return
        }

        const championData = require(`../lol_assets/${LOL_PATCH}/data/en_US/champion/${champion.internalName}.json`).data[champion.internalName];

        let skillInfo;
        switch(skill){
            case 'q':
                skillInfo = championData.spells[0];
                break;
            case 'w':
                skillInfo = championData.spells[1];
                break;
            case 'e':
                skillInfo = championData.spells[2];
                break;
            case 'r':
            case 'ult':
                skillInfo = championData.spells[3];
                break;
            default:
                skillInfo = championData.passive;
                break;
        }


        //For consistent Embed titles
        skill = skill == 'p' ? 'passive' : skill;
        skill = skill == 'ult' ? 'r' : skill;

        let embed = new Discord.MessageEmbed()
            .setColor('#fffff0')
            .setTitle(`${emotes[champion.displayName]} ${champion.displayName} ${capitalize(skill)}: ${skillInfo.name}`)
           
        const ICON_NAME = 'Skill.png';
        let icon;

        if(skill != 'passive'){
            embed.addField(`Cost`, skillInfo.costBurn || '', true)
                 .addField('Cooldown', skillInfo.cooldownBurn || '', true)
            icon = new Discord.MessageAttachment(
                riot.getSkillIcon(skillInfo.image.full, './'), 
                ICON_NAME
            );
        } else {
            icon = new Discord.MessageAttachment(
                riot.getPassiveIcon(skillInfo.image.full, './'), 
                ICON_NAME
            );
        }

        embed.attachFiles([icon])
             .setThumbnail(`attachment://${ICON_NAME}`)
             .addField('Description', skillInfo.description.replace(/<[^>]*>/g, '')) //Some descriptions have XML tags

        params.message.channel.send(embed);
    }

}