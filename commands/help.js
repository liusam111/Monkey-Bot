module.exports = {
    name: 'help',
    description: 'Sends a link to the help website',
    async execute(params){
        params.message.channel.send('https://discord-monkeybot.com');
    }
}