# Update Log: August 2, 2020

**TL;DR:** School year plus summer session is out, so I have time to finally work on the bot again! This week, I refactored the existing commands to prepare the bot for a revamp. The goal of this revamp is to give the bot a clearer focus, and I plan to make this bot _League of Legends/Riot Games_ themed, with a few utility commands, fun features, and easter eggs included. 

## New Features

### `~remind`: Month String Format

The `~remind` command now supports the Month String format, for people who prefer to entering the month over the `MM-DD-YYYY` format! This includes common abbreviations of the 12 months. Examples of this format can be found below:
```
~remindme august 9
~remindme aug 9 12:30 pm
~remindme sept 29 12:01 am
```

## Refactoring

**Overall:** -10 files removed, +421 insertions, and -1227 deletions

### Removed Commands

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


### New League of Legends/Riot Games API

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

### Parameter Changes

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


### discord.js v12 Update

Due to school, the bot was put on hiatus for the school quarter, and during that time, the developers of `discord.js` made a decent amount of changes to the library as they updated `discord.js` from `v11` to `v12`. As a result of this update, some of my command started throwing errors, most notably due to constructor renaming and function declaration changes. For example, the `RichEmbed` constructor got renamed and reworked into `MessageEmbed`, `displayAvatarURL` is now a function that returns an URL and not the URL itself, and the function to fetch users/channels now happens asynchronously and returns a Promise instead of the user itself. After this week's refactoring, I believe that all of the broken code is now fixed. However, there may be some undiscovered side effects of the `discord.js` changes and I will need to closely monitor and extensively test my revised commands.