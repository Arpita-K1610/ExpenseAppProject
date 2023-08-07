const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000; // Replace with your desired port number

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Niteesh@1995",
  database: "loginDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Parse incoming JSON data
app.use(bodyParser.json());

// Endpoint to handle user login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Fetch the user from the database based on the provided email
  pool.query("SELECT * FROM users WHERE email = ?", [email], (error, results) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      // User with the provided email does not exist
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    // Compare the provided password with the hashed password stored in the database
    bcrypt.compare(password, user.password, (err, passwordMatch) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (passwordMatch) {
        // Password matches, login successful
        return res.json({ message: "User login successful" });
      } else {
        // Password does not match, login failed
        return res.status(401).json({ message: "User not authorized" });
      }
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
