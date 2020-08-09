module.exports = {
    name: 'say',
    needsOriginal: true,
    async execute(params){
        if(!params.args.length){
            params.message.channel.send('You gonna tell me what to say or what?');
        } else {
            params.message.channel.send(params.args.join(' '));
        }
    }
}