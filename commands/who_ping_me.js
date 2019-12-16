module.exports = {
    name: "who ping me",
    description: "Send :whopingme: emoji whenever bot is mentioned. Only works in certain servers",
    execute(message){

        //Guam's server
        if(message.guild.id == "147890409039724544"){
            message.channel.send("<:whopingme:495774223541993472>");
        }

        //Monkey Court
        if(message.guild.id == "643681528173297665"){
        message.channel.send("<:whopingme:656003409643831348>");
        }
    }
}