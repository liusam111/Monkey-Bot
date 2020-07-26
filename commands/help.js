module.exports = {
    name: 'help',
    description: 'Sends a link to the help website',
    execute(param){
        param.message.channel.send('https://discord-monkeybot.com');
    }
}