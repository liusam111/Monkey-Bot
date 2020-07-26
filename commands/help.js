module.exports = {
    name: 'help',
    description: 'Sends a link to the help website',
    execute(params){
        params.message.channel.send('https://discord-monkeybot.com');
    }
}