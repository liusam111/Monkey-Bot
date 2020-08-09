module.exports = {
    name: 'lolmatch',
    async execute(params){

        //Guam's server
        if(params.message.guild && (params.message.guild.id == '147890409039724544')){
            params.message.channel.send('<:whopingme:495774223541993472>');
        }

        //Monkey Court
        if(params.message.guild && (params.message.guild.id == '643681528173297665')){
            params.message.channel.send('<:whopingme:656003409643831348>');
        }
    }
}