const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const port = 3000; 


const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Niteesh@1995",
  database: "your_database_name",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Parse incoming JSON data
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, "login")));

// Endpoint to handle form submissions
app.post("/submit", (req, res) => {
  // Access form data from the request body
  const formData = req.body;
  const { name, email, password } = formData;

  
  pool.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
    (error, results) => {
      if (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
      }

      
      console.log("User added to the database:", results);

      
      res.json({ success: true, message: "Form submitted successfully!" });
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
