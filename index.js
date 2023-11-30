const express = require('express');
const { Log } = require('./Models/log');
const { redisClient } = require('./redisConnection');
const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.post('/ingest-log', async (req, res) => {
    try {
        const logEntry = new Log(req.body);
        await logEntry.save();
        res.status(200).send('Log ingested successfully');
    } catch(error) {
        res.status(500).send('Error ingesting log');
    }
});

app.get('/search', async (req, res) => {
    try {
        const query = {};
        if(req.query.level) query.level = req.query.level;

        // regex filter for message
        if(req.query.message) {
            // 'i' for case-insensitive matching
            query.message = new RegExp(req.query.message, 'i');
        }

        // Date range filter
        if(req.query.startDate && req.query.endDate) {

            const { startDate, endDate } = req.query;
            const start = new Date(startDate);
            const end = new Date(endDate);

            if(isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).send('Invalid format for date ranges');
            }

            query.timestamp = {};
            query.timestamp.$gte = start;
            query.timestamp.$lte = end;
        }

        const searchQuery = JSON.stringify(req.qeury);

        redisClient.get(searchQuery, async (error, cachedData) => {
            if(error)   throw error;

            if(cachedData) {
                return res.status(200).json(JSON.parse(cachedData));
            }

            const logs = await Log.find(query);

            // save in redis for 20 mins
            redisClient.setEx(searchQuery, 1200, JSON.stringify(logs));

            res.status(200).json(logs);

        })
        
    } catch(error) {
        res.status(500).send('Error searching logs');
    }
});
