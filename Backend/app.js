const express = require('express');
const eminentSpeakerRoutes = require('./routes/eminentSpeakerRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Use routes
app.use('/api/eminent-speakers', eminentSpeakerRoutes);

module.exports = app;