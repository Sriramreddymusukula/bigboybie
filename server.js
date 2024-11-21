const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();  // SQLite database library
const bodyParser = require('body-parser');
const cors = require('cors');  // CORS middleware to handle cross-origin requests

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());  // For parsing JSON bodies

// Serve static files (like index.html, admin.html, etc.) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite Database (Make sure the file exists or is created)
const db = new sqlite3.Database('./bookings.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('SQLite database initialized.');
    }
});

// Create the bookings table if it doesn't already exist
db.run(
    `CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Bookings table created or already exists.');
        }
    }
);

// API Endpoint to Save Booking (excluding bikeModel)
app.post('/api/bookings', (req, res) => {
    const { name, email, phone } = req.body;  // No bikeModel now

    // SQL query to insert the new booking into the database
    const sql = `INSERT INTO bookings (name, email, phone) VALUES (?, ?, ?)`;
    const params = [name, email, phone];  // No bikeModel

    // Execute the SQL query
    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error saving booking:', err.message);
            return res.status(500).json({ message: 'Error saving booking', error: err.message });
        }
        // Respond with the newly created booking ID
        res.status(201).json({ message: 'Booking saved successfully', bookingId: this.lastID });
    });
});

// API Endpoint to Get All Bookings (for Admin)
app.get('/api/bookings', (req, res) => {
    // SQL query to select all bookings from the database
    const sql = `SELECT * FROM bookings ORDER BY date DESC`;

    // Execute the SQL query
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err.message);
            return res.status(500).json({ message: 'Error fetching bookings', error: err.message });
        }
        // Respond with the fetched booking data
        res.status(200).json(rows);
    });
});

// Start the server on port 5001 (or any other port you prefer)
const port = 5001;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
