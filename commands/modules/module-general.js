module.exports = {

    /* 
    * Get the first mention of the specified type
    * Type defaults to user
    * Valid types: 'user', 'channel'
    * Does not support 'role'
    */
    async getFirstMention(args, client, type){

        const mentionType = {
            USER: 'user',
            CHANNEL: 'channel'
        };

        let prefix = type == mentionType.CHANNEL ? '<#' : '<@';

        
        for(let i = 0; i < args.length; i++){
            let mention = args[i];
            if(mention.startsWith(prefix) && mention.endsWith('>')){
                mention = mention.slice(2, -1);

                let mentionResult;

                if(type == mentionType.CHANNEL){
                    mentionResult = await client.channels.fetch(mention);
                } else {
                    if(mention.startsWith('!')){
                        mention = mention.slice(1);
                    }

                    mentionResult = await client.users.fetch(mention);
                }

                //If mentioned user/channel exists
                if(mentionResult){
                    return mentionResult;
                }
            }
        }
    },

    /* 
    * Checks if user can be considered a moderator
    * Moderators have the following permissions:
    * MANAGE_CHANNELS
    * MANAGE_GUILD
    * KICK_MEMBERS
    * BAN_MEMBERS
    * MANAGE_MESSAGES
    * ADMINISTRATOR
    */
    isModerator(member) {
        let isModerator = member.hasPermission('MANAGE_CHANNELS') ||
                        member.hasPermission('MANAGE_GUILD') ||
                        member.hasPermission('KICK_MEMBERS') ||
                        member.hasPermission('BAN_MEMBERS') ||
                        member.hasPermission('MANAGE_MESSAGES') ||
                        member.hasPermission('ADMINISTRATOR');
        return isModerator;
    }
 
}
