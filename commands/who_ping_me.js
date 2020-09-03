module.exports = {
    name: 'who ping me',
    cannotRun: true,
    async execute(params){
        params.message.channel.send('<:whopingme:748081195300159489>');
    }
}