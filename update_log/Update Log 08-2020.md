# Update Log: August 2020

## August 2, 2020

**TL;DR:** School year plus summer session is out, so I have time to finally work on the bot again! This week, I refactored the existing commands to prepare the bot for a revamp. The goal of this revamp is to give the bot a clearer focus, and I plan to make this bot _League of Legends/Riot Games_ themed, with a few utility commands, fun features, and easter eggs included. 

### New Features

#### `~remindme`: Month String Format

The `~remindme` command now supports the Month String format, for people who prefer to entering the month over the `MM-DD-YYYY` format! This includes common abbreviations of the 12 months. Examples of this format can be found below:
```
~remindme august 9
~remindme aug 9 12:30 pm
~remindme sept 29 12:01 am
```

### Refactoring

**Overall:** -10 files removed, +421 insertions, and -1227 deletions

#### Removed Commands

The following commands/dependencies were removed:
```
automatic_facts
bible
fact
fact_toggle
guess
xp/incrementXP
kick
sneakysay
```
Whenever I'm introduced to a new technology, I always spend time exploring various features of that technology so I can know what's available and understand how to properly access and utilize its features. This time investment early on actually improves efficiency later in my development process. Since I will already know how to use the various functions and don't need to spend time figuring out what to pass in as arguments, how to interpret the return values, how errors are handled, etc., I can have one continuous coding session and won't need to interrupt my thought process and development process to search and explore. 

The commands listed above are all examples of such "test code" that I wrote with this idea in mind, and they serve no purpose other than testing features. For instance, the `kick` command was created so I could experiment with receiving, parsing, and sending messages with `discord.js`. The `xp` and `incrementXP` commands were used to learn `MySQL` database queries as well as its corresponding `node.js` package. The `guess` command was used to learn the `MessageCollectors` from the `discord.js` library. And I am using (or plan on using) all of these features in my bot revamp.

As a drawback, however, because these commands were created only to test features, they act as standalone commands and do not conform to any type of theme, which contradicts the main goal of this revamp. So, I have decided to remove these commands from the bot. If in the future, these commands do relate to the bot's theme in some way, I can always consider re-implementing them.


#### New League of Legends/Riot Games API

As a part of the refactoring, I've migrated away from parsing HTML GET responses from `op.gg` and will instead be obtaining the data and information for all my _League of Legends_ related commands directly from the _Riot Games_ API. 

One of the greatest challenges I faced when initially brainstorming and implementing _League of Legends_ commands was that I was limited by the information that `op.gg` provided on each user on page load. Upon landing on a user's profile on `op.gg`, only a certain amount information was displayed, and the webpage required mouse click events in order to generate more content and dynamically modify the HTML. With HTTP GET requests via the `cheerio` and `request` packages, I couldn't send mouse events to `op.gg` and needed an actual web browser open using a library like `selenium-webdriver`, which I found to be too inconvenient with web browsers constantly opening/changing. Now that I have access to the `Riot Games API`, I, in turn, have access to all of `op.gg`'s information as well, including any unloaded content. (As an aside, my guess is that `op.gg` only loads a certain amount of information that's immediately available and only makes additional requests to the `Riot Games API` when the buttons on the page are clicked. Since this information isn't available until a GET request to the API is made, it would make sense why additional HTML is only generated after clicking the button)

Also, another benefit of getting my data directly from the source is reliability and accuracy. By pulling information straight from the `Riot Games API`, I eliminate the possibility of third-party single points of failure. If `op.gg` for whatever reason goes down, but the `Riot Games API` remains stable, then some of my bot's commands will become unavailable as a result. With this new change, the status of my bot is unaffected by `op.gg` and is affected only by the status of the `Riot Games API`. If the API goes down, then even though some commands will fail, so will everyone else's features that rely on the API. Also, by fetching from the source, the information is also guaranteed to be accurate. If someone were to attack `op.gg` and modify content that I used, then my bot's output would reflect those changes, which could be something inapproprate or offensive.

Migrating to the `Riot Games API` also resulted in some significant code structure changes. For example, my `~league` command code for obtaining player information now looks less like I'm traversing a DOM tree and more like I'm parsing a JSON data response from an HTTP request (in fact, that is literally what the new code does).

Before (Note the JQuery-style commands): 
```
const username = $("div.Information > span.Name").text();
const ladderHTML = $("div.LadderRank > a");
const summonerIcon = "https:" +  $("div.ProfileIcon > img").attr("src");
const rankIcon = "https:" + $("div.TierBox.Box > div > div > img").attr("src");
```
After:
```
const title = `${summonerData.name} (${region})`;
const level = `${summonerData.summonerLevel}`;
const tier = rankedData.tier[0] + rankedData.tier.slice(1).toLowerCase();
const rank = `${tier} ${rankedData.rank}, ${rankedData.leaguePoints} LP`
const wins = `${rankedData.wins}`
const losses = `${rankedData.losses}`;
```

#### Parameter Changes

In order to effectively organize and load all the commands, I export a standardized function, `execute`, in each command file that `bot.js` uses to run that command. But, something I found annoying with this universal `execute` function was that some commands only needed one or two of the arguments while other commands needed all four parameters, but `bot.js` calls `execute` with the parameters listed in the same order for each command. This resulted in either inconsistent declaration, or unneeded parameters. 

For example, if a command needed `message` and `args`, but not `client` or `database`, I could've omitted `client` and `database` from the function declaration, since `JavaScript` allows its users to pass in more parameters than declared, but this would make the `execute` declaration inconsistent between commands. This also becomes a issue if a new command requires a 5th parameter, which requires me to update all other `execute` declarations with the new parameter to be consistent. In another situation, a command might only use `args` and `database` but not `message` or `client`. This requires me to pad in two unused "dummy" variables (which just end up being `message` and `client`) to force `args` and `database` into their correct parameter positions.

To resolve this inconvenience, I took inspiration from `Python`'s keyword arguments feature, which allows you to specify a key/name for each parameter value, such that the actual ordering of the parameters no longer matters. In `Python`, I could've passed in all four parameters as keyword arguments in `bot.js` and only accessed the parameter key-value pairs that the specific command's `execute` function required via the `kwargs` argument. The declaration, then, would've looked something like this:
```
def execute(**kwargs)
```

To simulate this in `JavaScript` I bundled all of the required parameters for `execute` into a JSON Object and passed that Object into `execute`. Now, even though all four parameters are still available, the `execute` function only needs to access the parameters that it uses and can ignore the others without affecting its declaration. The resulting code looks now looks like this:

```diff
- execute(message, args, client, database)

+ params = {
+     message: message,
+     args: args,
+     client: client,
+     database: database
+ }
+execute(params)
```

Overall, this change resulted in improved code organization. There are no longer any unused arguments in the function declaration, and if I needed to add additional parameters for future commands, I just need to add it in `bot.js`, where the `params` Object is initialized. One drawback, however, is that some lines of code got a bit longer, since I now have to access, for example, `message` as `params.message`, but I find this to be a non-issue, since `discord.js` already has fairly long function/value access patterns, like `message.channel.send`.


#### discord.js v12 Update

Due to school, the bot was put on hiatus for the school quarter, and during that time, the developers of `discord.js` made a decent amount of changes to the library as they updated `discord.js` from `v11` to `v12`. As a result of this update, some of my command started throwing errors, most notably due to constructor renaming and function declaration changes. For example, the `RichEmbed` constructor got renamed and reworked into `MessageEmbed`, `displayAvatarURL` is now a function that returns an URL and not the URL itself, and the function to fetch users/channels now happens asynchronously and returns a Promise instead of the user itself. After this week's refactoring, I believe that all of the broken code is now fixed. However, there may be some undiscovered side effects of the `discord.js` changes and I will need to closely monitor and extensively test my revised commands.


 
## August 3, 2020 - August 16, 2020

**TL;DR:**  This week, I added the finishing touches on the `~remindme` command and implemented three new commands: `~reminders`, `~timezone`, and `~livegame`. `~livegame` produced the most challenges, as I was forced to make tradeoffs between details and API requests. I also started a new refactoring step, where I load portions of the MySQL database into memory to reduce the number of queries I have to make.

### New Features

#### `~remindme`: Command Completed

The `~remindme` command has now been linked to a `setTimeout()` function that will directly message the user their reminder at the specified time. The timeout is calculated using the difference in epoch times between the current time and the specified time.

It also now supports timezone conversions. The user can specify a single-use timezone using the `-tz=TIMEZONE` flag and the bot will automatically convert that time into their native timezone (They can set this using the [`~timezone` command](#tz)). As an example, if a user went on vacation to New York for a month but the Discord server is based in San Francisco, they can choose to set their timezone to `America/New_York` using `~timezone` for personal reminders, but can also specify `-tz=America/Los_Angeles` in the `~remindme` command to convert to Pacific Time if four of their friends in San Francisco scheduled some inhouse or premade matches.

#### `~reminders`: CRUD for `~remind`

The `~reminders` command allows for CRUD (create, read, update, delete) features for the reminders set by `~remindme` (technically, it only supports RUD commands since `~remindme` is the C). Each function can be triggered using their respective flags.

##### Read: No Flags

Shows a list of the user's reminder times and messages

##### Update: --edittime, -et, --editmessage, --editmsg, -em

Changes either reminder's time or message, whichever the corresponding flag is, and updates the corresponding timeout

##### Delete: --delete, -d

Deletes the reminder and removes the corresponding timeout

#### <a name="tz"></a> `~timezone`: Timezone Support for Reminders

The `~timezone` command allows the user to view their current timezone (Default: America/Los_Angeles, or PST) and set a new timezone as their native timezone. This feature is based heavily off the `moment-tz` module, which uses the [timezones listed here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) as valid timezones.

#### `~livegame`: Live League of Legends Match Information

The `~livegame` command displays the live League of Legends game information of the specified user. The includes the following:
 - Allied players
 - Enemy players
 - Which champions each player selected
 - Which summoner spells each player selected
 - Champion bans

 I would also like to include the following information, but currently, I have to manage with API rate limits (See [Riot Games API Limits] for more information):
  - Rank
  - Ranked winrate
  - Champion mastery
  - Hot streaks


### Refactoring

#### Loading Parts of Database Into Memory

As a new refactoring step, I started querying and saving pieces of data into memory by creating a Collection/Map connected to the `Discord.Client` variable while the bot is being initialized. So far, I have removed 4 database queries across various functions and am projecting to replace another 6 queries: 2 for League of Legends related commands, 4 for reminder related commands. Note that the commands do not query very often (usually 2 or 3 queries at most), so decreasing the number of queries of a function by 1 is a 33% to 50% reduction in queries.

A major upside to this refactoring step is a reduced number of database queries and improved performance. Accessing data from memory is significantly faster than querying the same data from the database because querying requires communication to the database server and that network request results in extra latency (although I'm currently hosting the database locally on my computer, it's still good to keep this communication and latency in mind for future external bot and database hosting). Since most of my commands don't require any heavy or delayed computation, the database query should theoretically take up the bulk of the command's runtime.

An extra benefit to loading data into memory is a reduced number of callbacks (which is directly related to the reduced number of database queries since I need a callback function to access the queried data). One major issue I ran into with the `database.query()` callbacks relates to how errors are thrown and caught in callbacks. If I throw an error inside a callback but wrap the `database.query()` function in a `try...catch` block, the `try...catch` block will not catch the error. This is due to the fact that the `database.query()` call is asynchronous. Before the callback can leave the message queue, the `database.query()` call, along with any other code in the call stack (including the code within the `try...catch` block) must finish execution. As a result, the `try` finishes execution before the error is thrown, and if the query throws any errors, the bot will completely crash and I will need to manually restart it. By loading data into memory, I have direct access to the information I need without needing a callback, which eliminates sections of code where this issue can occur.

One downside to this refactoring step is increased memory usage. However, this should be a non-issue for the most part, since the data being stored in memory is small (in fact, 1KB per entry is probably a gross overestimate). Using 1kB entries as a estimate, even if the bot has 10,000 users (which is more than I would expect, since the scale is moreso for personal servers and small communities), and assuming all 10,000 users have the maximum possible entires for each of the client's memory tables (1 for `leagueUsernames`, `reminderCounts`, and `userTimezones`, 5 for `reminderIds`), this results in an extreme overestimate of 80MB of memory used. And note that the smallest Amazon Web Services EC2 instance that I found after a quick search was 0.5GB.

### Challenges

#### <a name="api-limits"></a> Riot Games API Limits

As I was implementing the `~livegame` command, I found myself to be limited by my personal API key's rate limits. For the command, I wanted to include various player stats, like rank, winrate, champion mastery, and hot streaks. However, this information was not immediately available in the API response for live match information. If I wanted this information, I would need to make additional API request per player. 

Currently, my key only allows 20 request per second and 100 API requests every 2 minutes. If I were to add these details to the match history command, I would need to make a total of 22 requests: 1 to get the summoner ID from username, 1 to get the current match using the summoner ID, 10 to get the ranked statistics, win rates, etc. of each player, and 10 to get the champion masteries of each player. This would already exceed the 20 request per second limitation. If I were to exclude the champion mastery feature, I could reduce this to 12 requests to meet the per-second limit. However, this could quickly hit the per-two-minutes API rate limit if multiple people were to use the command within the 2 minute timeframe.

Unfortunately, the Riot Games API does not support batch requests, and caching the information required by the `~livegame` command is ineffective as the information I'm requesting is highly volatile (See next section). The only solution seems to be requesting a production API key, which allows for rate limit increase requests, unlike my personal API key.

#### Ineffective API Caching For Most Commands

After using the Riot Games API more, I found that caching is, for the most part, ineffective because all of the information I use from the responses are highly subject to change. 

For example, for the detailed version of the `~livegame` command, I would request for player statistics and rank information, but this changes within the span of 1 ranked game.

Also, I initally came up with the cache idea to pair usernames with their various IDs (summoner ID, account ID, puuID) to reduce API requests. For the `~livegame` command, this worked in theory, since the API request for match information only required the summoner ID, and if this username-summoner ID pair was in cache, I could get the summoner ID from cache without needing to make an API request using the username as the key.

But, I soon realized that usernames are also volatile (to a lesser degree than player statistics and rank information, but still volatile nonetheless). Players can change their names with relative ease. They can simply buy a name change in the shop using either in-game currency or purchased currency (In other words, name changes are basically free and can be obtained just by playing the game). If the username changes, the username to ID pairings in the cache no longer match, and I would need to request to the API again.

As an example, let's say we have two players who want to change names: `Player1` and `Player2`. `Player1` changes their name to `BestPlayer` and does so. `Player2` later checks to see if `Player1` is available, since they no longer want to be second, and sees that it's now available because `Player1` changed their name. `Player2` then changes their name to `Player1`. If both `Player1` and `Player2` used the bot prior to this name change, and the bot cached their username-ID mappings, then if `Player2` used a bot command on the username `Player1`, since that is their new name, they would actually get all the results for `BestPlayer` since the IDs do not change and `Player1` is mapped to `BestPlayer`'s IDs in cache.

I can't exactly key by any of the ID's, since those ID's aren't known unless you make a request using the username. And there's no good way to expire the entries either. Although the API has a timestamp of whenever a username's player data was changed, I won't see this updated value to expire entries unless I request to the API again. If I constantly have to make API request to check for timestamp changes, then this defeats the entire purpose of caching. As a result, I won't know when to expire values from cache unless I make a request, but I shouldn't need to make a request because the value is cached. 

I could also set a duration for how long cache entries are stored for, but most people don't change their usernames that often. So in that case, a long expiration would be ideal, but this would mean that whenever people do change their names, they could be stuck seeing incorrect information for a long time. On the opposite end, I could make entries expire quickly to improve accuracy, but this would mean entries may be flushed before you can reuse the values. From the user's perspective, they would likely be frustrated more at the incorrect information, which lasts until cache expiration (likely more than 2 minutes), than rate limits, which would be resolved in 2 minutes max. Again, it would seem that making additional API requests (and requesting for a production key when I publish the bot) is the ideal solution here.


## August 3, 2020 - August 16, 2020

**TL;DR:**  This week, I made a prototype command, `~detailedlivegame`, or `~dlg` for short, that extended on the `~livegame` command. This prototype has the same function as the `~livegame` command, but displays a lot more details about each player in the game, such as rank, winrate, total games won/lost, and hotstreaks. I also finished loading database entries into memory and refactored appropriate commands to use the memory values.

### New Features

#### `~detailedlivegame` or `~dlg`: Command Completed

The `~dlg` command serves the same purpose as the `~livegame` command, except this command shows much more details than the `~livegame` command. This command includes the following information that the `~livegame` command doesn't:

  - Rank
  - Ranked winrate
  - Number of ranked games won/lost
  - Hot streaks

Right now, due to API rate limits, this command serves only as a prototype command. However, if the rate limits ever increase, this will become the default functionality of the `~livegame` command.

#### `~livegame` and `~dlg` Formatting

I improved the formatting of the `~livegame` and `~dlg` command output embeds. Last week, the command displayed all the information in text form. This week, I uploaded various images and icons from Riot Games Data Dragon (a tarball of League of Legends game data and assets) to Discord as emotes to replace text describing live match data such as champions, rank, and summoner spells.


### Refactoring

#### Loading Parts of Database Into Memory Part 2

This week, in continuation of last week's refactorting, I preloaded any linked League of Legends usernames, along with their corresponding regions, as well as all users' active reminder IDs. 

For the League of Legends regions/usernames, this allowed me to remove 2 database queries from the `~league` and `~livegame`. 

For reminders, I only preloaded the reminder ID's. Since the reminder message can be fairly long, this would pose the biggest risk to using up all of my allotted memory if I were to load the entire reminder into memory. By loading the reminder IDs, this allows me to skip a database query for checking whether or not the specified reminder ID belongs to the user. Once the ID is verified, then the bot will make a query for the full reminder.

### Challenges

#### Including Images in `~livegame` and `~dlg` Output Embed

One limitation of using Discord embeds is the difficulty in inserting inline images into embeds. As of right now, there are only two ways to attach images to an embed: as the thumbnail, or as an image attachment. There can only be one thumbnail for each embed, but I need multiple images for my format, so thumbnails won't work. Image attachments are displayed either in their full size, or in Discord's maximum image display size, whichever is smaller in its on line. For my format, I need images to be inline with text, which also means the images need to be fairly small. This would also eliminate image attachments as an option.

Lucky, these features below work perfectly together to fit my formatting needs:

 - Discord embeds support inline emotes
 - Discord supports custom emotes on a per server basis
 - Although you as the user can't use emotes from other servers without Discord Nitro (paid monthly premium features), bots can

 After creating four private Discord servers, whose sole purpose is to store the custom emotes, I invited my bot to those emote servers. By doing this, the bot can now reference the custom emotes in my private servers and use them in the embed.