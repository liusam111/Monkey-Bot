module.exports = {
    name: 'no u',
    description: 'Easter egg. Reply to no u',
    execute(params){
        params.message.channel.send('no u');
    }
}