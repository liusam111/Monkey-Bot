module.exports = {
    name: "test",
    description: "File for testing new features and understanding how the library works",
    execute(message, args){
        //Only allow creator to run ~test
        if(message.author.id != "96468616911790080"){
            return message.channel.send("Only the bot creator can use this command.");
        }

        const helper = require("./helper_general");
        var d = new Date("Dec 30 2019 16:35 UTC-0:00");
        console.log(d.toTimeString());
        console.log(d.getTime() / 1000);
        console.log(Date.now() / 1000);
    }
}