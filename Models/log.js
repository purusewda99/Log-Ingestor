const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/logdb', { useNewUrlParser: true, useUnifiedTopology: true });

const logSchema = new mongoose.Schema({
    level: String,
    message: String,
    resourceId: String,
    timestamp: Date,
    traceId: String,
    spanId: String,
    commit: String,
    metadata: mongoose.Schema.Types.Mixed
});
logSchema.index({ level: 1 });

const Log = mongoose.model('Log', logSchema);

module.exports = {
    Log
};