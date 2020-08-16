module.exports = {
    /**
     * userData is a JSON Object consisting of the following keys:
     * region, username, accountId, summonerId, puuId
     * username and region should always be defined
     * At least one of the ID's should be defined
     */
    cacheUser(database, userData){

        if(!userData.username || !userData.region){
            console.log(`Bad userData: ${JSON.stringify(userData, null, '\t')}`);
            return;
        }

        database.query(
            `SELECT * FROM lol_cache WHERE username = ? AND region = ?;`, 
            [userData.username, userData.region],
            (err, rows) => {
                if(err) throw err;

                if(!rows.length){
                    database.query(
                        `INSERT INTO lol_cache (username, region, account_id, summoner_id, puuid) VALUES (?, ?, ?, ?, ?);`,
                        [userData.username, userData.region, userData.accountId, userData.summonerId, userData.puuId]
                    );
                } else {
                    let accountIdQuery = userData.accountId ? `account_id = ${userData.accountId}`: '';
                    let summonerIdQuery = userData.summonerId ? `account_id = ${userData.summonerId}`: '';
                    let puuIdQuery = userData.puuId ? `account_id = ${userData.puuId}`: '';

                    let queryValues = [accountIdQuery, summonerIdQuery, puuIdQuery].filter(Boolean);

                    if(!queryValues.length){
                        console.log(`Bad userData: ${JSON.stringify(userData, null, '\t')}`);
                        return;
                    }

                    database.query(
                        `UPDATE lol_cache SET ${queryValues.join(',')} WHERE username = ? AND region = ?;`, 
                        [userData.username, userData.region]
                    );
                    
                }
            }
        );
    }
}
