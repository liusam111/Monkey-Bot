const league = require('./modules/module-league.js');
const general = require('./modules/module-general.js');
const options = require('./modules/module-options.js');;

module.exports = {
    name: 'league',
    async execute(params){

        let mention = await general.getFirstMention(params, general.MENTION_TYPE.USER);

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
            league.searchProfile(region, username);;

        } else {
            let userOptions;
            try{
                userOptions = league.parseProfileSearchOptions(params.args);
            } catch(err){ //Any errors caught from parseProfileSearchOptions are error strings
                params.message.reply(err);
                return;
            }
            
            region = userOptions.region;
            username = params.args.join(' ');
            
            if(userOptions.action == options.LEAGUE.LINK){
                league.linkProfile(params, region, username);
            } else if(userOptions.action == options.LEAGUE.UNLINK){
                league.unlinkProfile(params);
            } else {
                league.searchProfile(region, username);
            }
        }
    }
}