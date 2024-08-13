const express = require("express");
const { google } = require('googleapis');
const dotenv = require("dotenv");
const { v4: uuidv4 } = require('uuid');  // Importing uuid

const app = express();
dotenv.config();


const port = process.env.PORT || 8000;


// app.get("/", (req, res) => {
//     res.send("Hello World");
// });


// Define the scope of access for the Google Calendar API.
const scopes = ['https://www.googleapis.com/auth/calendar'];


// OAuth 2 configuration
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);


const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client
});


app.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    res.redirect(url);
});


app.get("/auth/redirect", async (req, res) => {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);
    res.send('Authentication successful! Please return to the console.');
});


app.get('/create-event', async (req, res) => {
    try {
        const result = await calendar.events.insert({
            calendarId: 'primary',
            auth: oauth2Client,
            conferenceDataVersion: 1, 
            sendUpdates: 'all',
            resource: event
        });

        res.send({
            status: 200,
            message: 'Event created',
            link: result.data.hangoutLink
        });
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});


const event = {
    summary: 'Tech Talk with Nikhil',
    location: 'Google Meet',
    description: "Demo for pushing code to github.",
    start: {
        dateTime: "2024-08-15T15:30:00+05:30",
        timeZone: 'Asia/Kolkata'
    },
    end: {
        dateTime: "2024-08-15T16:35:00+05:30",
        timeZone: 'Asia/Kolkata'
    },
    colorId: 1,
    conferenceData: {
        createRequest: {
            requestId: uuidv4(),  // Use uuidv4 to generate unique ID
        }
    },
    attendees: [
        { email: 'nikhilanand020@gmail.com' },
    ]
};



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
