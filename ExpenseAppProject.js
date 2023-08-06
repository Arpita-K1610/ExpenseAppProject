const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON data in the request body
app.use(bodyParser.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Niteesh@1995',
    database: 'mydatabase', // Replace 'mydatabase' with your preferred database name
});

// Serve the static files from the 'public' folder (including index.html)
app.use(express.static(path.join(__dirname, 'ExpenseApp')));

// API endpoint to handle signups
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    // Check if the email already exists in the database
    pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ error: true, message: 'An error occurred. Please try again later.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: true, message: 'User already exists' });
        }

        // Insert the new user into the database
        pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], (error) => {
            if (error) {
                console.error('Error executing query:', error);
                return res.status(500).json({ error: true, message: 'An error occurred. Please try again later.' });
            }

            return res.json({ success: true, message: 'Signup successful' });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
