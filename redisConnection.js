const redis = require('redis');
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379  // defaul redis port
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

module.exports = {
    redisClient
};