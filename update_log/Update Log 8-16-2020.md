# Update Log: August 3, 2020 - August 16, 2020

**TL;DR:**  This week, I added the finishing touches on the `~remindme` command and implemented three new commands: `~reminders`, `~timezone`, and `~livegame`. `~livegame` produced the most challenges, as I was forced to make tradeoffs between details and API requests. I also started a new refactoring step, where I load portions of the MySQL database into memory to reduce the number of queries I have to make.

## New Features

### `~remindme`: Command Completed

The `~remindme` command has now been linked to a `setTimeout()` function that will directly message the user their reminder at the specified time. The timeout is calculated using the difference in epoch times between the current time and the specified time.

It also now supports timezone conversions. The user can specify a single-use timezone using the `-tz=TIMEZONE` flag and the bot will automatically convert that time into their native timezone (They can set this using the [`~timezone` command](#tz)). As an example, if a user went on vacation to New York for a month but the Discord server is based in San Francisco, they can choose to set their timezone to `America/New_York` using `~timezone` for personal reminders, but can also specify `-tz=America/Los_Angeles` in the `~remindme` command to convert to Pacific Time if four of their friends in San Francisco scheduled some inhouse or premade matches.

### `~reminders`: CRUD for `~remind`

The `~reminders` command allows for CRUD (create, read, update, delete) features for the reminders set by `~remindme` (technically, it only supports RUD commands since `~remindme` is the C). Each function can be triggered using their respective flags.

#### Read: No Flags

Shows a list of the user's reminder times and messages

#### Update: --edittime, -et, --editmessage, --editmsg, -em

Changes either reminder's time or message, whichever the corresponding flag is, and updates the corresponding timeout

#### Delete: --delete, -d

Deletes the reminder and removes the corresponding timeout

### <a name="tz"></a> `~timezone`: Timezone Support for Reminders

The `~timezone` command allows the user to view their current timezone (Default: America/Los_Angeles, or PST) and set a new timezone as their native timezone. This feature is based heavily off the `moment-tz` module, which uses the [timezones listed here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) as valid timezones.

### `~livegame`: Live League of Legends Match Information

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


## Refactoring

### Loading Parts of Database Into Memory

As a new refactoring step, I started querying and saving pieces of data into memory by creating a Collection/Map connected to the `Discord.Client` variable while the bot is being initialized. So far, I have removed 4 database queries across various functions and am projecting to replace another 6 queries: 2 for League of Legends related commands, 4 for reminder related commands. Note that the commands do not query very often (usually 2 or 3 queries at most), so decreasing the number of queries of a function by 1 is a 33% to 50% reduction in queries.

A major upside to this refactoring step is a reduced number of database queries and improved performance. Accessing data from memory is significantly faster than querying the same data from the database because querying requires communication to the database server and that network request results in extra latency (although I'm currently hosting the database locally on my computer, it's still good to keep this communication and latency in mind for future external bot and database hosting). Since most of my commands don't require any heavy or delayed computation, the database query should theoretically take up the bulk of the command's runtime.

An extra benefit to loading data into memory is a reduced number of callbacks (which is directly related to the reduced number of database queries since I need a callback function to access the queried data). One major issue I ran into with the `database.query()` callbacks relates to how errors are thrown and caught in callbacks. If I throw an error inside a callback but wrap the `database.query()` function in a `try...catch` block, the `try...catch` block will not catch the error. This is due to the fact that the `database.query()` call is asynchronous. Before the callback can leave the message queue, the `database.query()` call, along with any other code in the call stack (including the code within the `try...catch` block) must finish execution. As a result, the `try` finishes execution before the error is thrown, and if the query throws any errors, the bot will completely crash and I will need to manually restart it. By loading data into memory, I have direct access to the information I need without needing a callback, which eliminates sections of code where this issue can occur.

One downside to this refactoring step is increased memory usage. However, this should be a non-issue for the most part, since the data being stored in memory is small (in fact, 1KB per entry is probably a gross overestimate). Using 1kB entries as a estimate, even if the bot has 10,000 users (which is more than I would expect, since the scale is moreso for personal servers and small communities), and assuming all 10,000 users have the maximum possible entires for each of the client's memory tables (1 for `leagueUsernames`, `reminderCounts`, and `userTimezones`, 5 for `reminderIds`), this results in an extreme overestimate of 80MB of memory used. And note that the smallest Amazon Web Services EC2 instance that I found after a quick search was 0.5GB.

## Challenges

### <a name="api-limits"></a> Riot Games API Limits

As I was implementing the `~livegame` command, I found myself to be limited by my personal API key's rate limits. For the command, I wanted to include various player stats, like rank, winrate, champion mastery, and hot streaks. However, this information was not immediately available in the API response for live match information. If I wanted this information, I would need to make additional API request per player. 

Currently, my key only allows 20 request per second and 100 API requests every 2 minutes. If I were to add these details to the match history command, I would need to make a total of 22 requests: 1 to get the summoner ID from username, 1 to get the current match using the summoner ID, 10 to get the ranked statistics, win rates, etc. of each player, and 10 to get the champion masteries of each player. This would already exceed the 20 request per second limitation. If I were to exclude the champion mastery feature, I could reduce this to 12 requests to meet the per-second limit. However, this could quickly hit the per-two-minutes API rate limit if multiple people were to use the command within the 2 minute timeframe.

Unfortunately, the Riot Games API does not support batch requests, and caching the information required by the `~livegame` command is ineffective as the information I'm requesting is highly volatile (See next section). The only solution seems to be requesting a production API key, which allows for rate limit increase requests, unlike my personal API key.

### Ineffective API Caching For Most Commands

After using the Riot Games API more, I found that caching is, for the most part, ineffective because all of the information I use from the responses are highly subject to change. 

For example, for the detailed version of the `~livegame` command, I would request for player statistics and rank information, but this changes within the span of 1 ranked game.

Also, I initally came up with the cache idea to pair usernames with their various IDs (summoner ID, account ID, puuID) to reduce API requests. For the `~livegame` command, this worked in theory, since the API request for match information only required the summoner ID, and if this username-summoner ID pair was in cache, I could get the summoner ID from cache without needing to make an API request using the username as the key.

But, I soon realized that usernames are also volatile (to a lesser degree than player statistics and rank information, but still volatile nonetheless). Players can change their names with relative ease. They can simply buy a name change in the shop using either in-game currency or purchased currency (In other words, name changes are basically free and can be obtained just by playing the game). If the username changes, the username to ID pairings in the cache no longer match, and I would need to request to the API again.

As an example, let's say we have two players who want to change names: `Player1` and `Player2`. `Player1` changes their name to `BestPlayer` and does so. `Player2` later checks to see if `Player1` is available, since they no longer want to be second, and sees that it's now available because `Player1` changed their name. `Player2` then changes their name to `Player1`. If both `Player1` and `Player2` used the bot prior to this name change, and the bot cached their username-ID mappings, then if `Player2` used a bot command on the username `Player1`, since that is their new name, they would actually get all the results for `BestPlayer` since the IDs do not change and `Player1` is mapped to `BestPlayer`'s IDs in cache.

I can't exactly key by any of the ID's, since those ID's aren't known unless you make a request using the username. And there's no good way to expire the entries either. Although the API has a timestamp of whenever a username's player data was changed, I won't see this updated value to expire entries unless I request to the API again. If I constantly have to make API request to check for timestamp changes, then this defeats the entire purpose of caching. As a result, I won't know when to expire values from cache unless I make a request, but I shouldn't need to make a request because the value is cached. 

I could also set a duration for how long cache entries are stored for, but most people don't change their usernames that often. So in that case, a long expiration would be ideal, but this would mean that whenever people do change their names, they could be stuck seeing incorrect information for a long time. On the opposite end, I could make entries expire quickly to improve accuracy, but this would mean entries may be flushed before you can reuse the values. From the user's perspective, they would likely be frustrated more at the incorrect information, which lasts until cache expiration (likely more than 2 minutes), than rate limits, which would be resolved in 2 minutes max. Again, it would seem that making additional API requests (and requesting for a production key when I publish the bot) is the ideal solution here.