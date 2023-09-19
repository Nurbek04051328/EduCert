const redis = require('redis');
const client = redis.createClient(4100);



async function getRepos (req, res, next) {
    try {
        console.log("dataaaaa");
        const {title} = req.params;
        const cacheKey = JSON.stringify(title);
        console.log("cacheKey", cacheKey)
        client.get(cacheKey, (err, data) => {
            if (err) {
                console.error('Redis error:', err);
                next(); // Proceed to the next middleware (e.g., querying MongoDB)
            } else if (data) {
                // Data found in Redis cache, return it to the client
                res.json(JSON.parse(data));
            } else {
                // Data not found in Redis cache, proceed to query MongoDB
                next();

            }
        });
        client.quit();

    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
}


module.exports = getRepos





// module.exports = (req, res, next) => {
//     const redis = require('redis');
//     const client = redis.createClient(4100);
//
//     client.on('error', (err) => {
//         console.error('Redis error:', err);
//     });
//
//     client.on('ready', () => {
//         console.log("redis worked")
//         // The client is ready, you can perform Redis operations here
//     });
//     console.log("client", client)
//     const { query } = req;
//     console.log("query", query)
//     // Generate a unique key for the Redis cache based on the query parameters
//     const cacheKey = JSON.stringify(query);
//     console.log("cacheKey", cacheKey)
//     client.get(cacheKey, (err, data) => {
//         if (err) {
//             console.error('Redis error:', err);
//             next(); // Proceed to the next middleware (e.g., querying MongoDB)
//         } else if (data) {
//             // Data found in Redis cache, return it to the client
//             res.json(JSON.parse(data));
//         } else {
//             // Data not found in Redis cache, proceed to query MongoDB
//             next();
//         }
//     });
// }