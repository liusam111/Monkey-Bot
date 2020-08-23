# Update Log: August 3, 2020 - August 16, 2020

**TL;DR:**  This week, I made a prototype command, `~detailedlivegame`, or `~dlg` for short, that extended on the `~livegame` command. This prototype has the same function as the `~livegame` command, but displays a lot more details about each player in the game, such as rank, winrate, total games won/lost, and hotstreaks. I also finished loading database entries into memory and refactored appropriate commands to use the memory values.

## New Features

### `~detailedlivegame` or `~dlg`: Command Completed

The `~dlg` command serves the same purpose as the `~livegame` command, except this command shows much more details than the `~livegame` command. This command includes the following information that the `~livegame` command doesn't:

  - Rank
  - Ranked winrate
  - Number of ranked games won/lost
  - Hot streaks

Right now, due to API rate limits, this command serves only as a prototype command. However, if the rate limits ever increase, this will become the default functionality of the `~livegame` command.

### `~livegame` and `~dlg` Formatting

I improved the formatting of the `~livegame` and `~dlg` command output embeds. Last week, the command displayed all the information in text form. This week, I uploaded various images and icons from Riot Games Data Dragon (a tarball of League of Legends game data and assets) to Discord as emotes to replace text describing live match data such as champions, rank, and summoner spells.


## Refactoring

### Loading Parts of Database Into Memory Part 2

This week, in continuation of last week's refactorting, I preloaded any linked League of Legends usernames, along with their corresponding regions, as well as all users' active reminder IDs. 

For the League of Legends regions/usernames, this allowed me to remove 2 database queries from the `~league` and `~livegame`. 

For reminders, I only preloaded the reminder ID's. Since the reminder message can be fairly long, this would pose the biggest risk to using up all of my allotted memory if I were to load the entire reminder into memory. By loading the reminder IDs, this allows me to skip a database query for checking whether or not the specified reminder ID belongs to the user. Once the ID is verified, then the bot will make a query for the full reminder.

## Challenges

### Including Images in `~livegame` and `~dlg` Output Embed

One limitation of using Discord embeds is the difficulty in inserting inline images into embeds. As of right now, there are only two ways to attach images to an embed: as the thumbnail, or as an image attachment. There can only be one thumbnail for each embed, but I need multiple images for my format, so thumbnails won't work. Image attachments are displayed either in their full size, or in Discord's maximum image display size, whichever is smaller in its on line. For my format, I need images to be inline with text, which also means the images need to be fairly small. This would also eliminate image attachments as an option.

Lucky, these features below work perfectly together to fit my formatting needs:

 - Discord embeds support inline emotes
 - Discord supports custom emotes on a per server basis
 - Although you as the user can't use emotes from other servers without Discord Nitro (paid monthly premium features), bots can

 After creating four private Discord servers, whose sole purpose is to store the custom emotes, I invited my bot to those emote servers. By doing this, the bot can now reference the custom emotes in my private servers and use them in the embed.