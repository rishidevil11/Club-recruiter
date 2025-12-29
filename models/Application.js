// models/Application.js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dept: { type: String, required: true }, 
    year: { type: String, required: true }, 
    regNo: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    track: { type: String, required: true },
    quizScore: { type: Number, required: true },
    challengeResponse: { type: String, required: true },
    essayResponse: { type: String, required: true },
    submissionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);