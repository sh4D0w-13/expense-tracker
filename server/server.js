require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (!bearerHeader) {
    return res.status(403).json({
      message: "Token missing",
    });
  }

  const token = bearerHeader.split(" ")[1];

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid token",
      });
    }

    req.user = decoded;

    next();
  });
};

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});

app.get("/api/expenses", verifyToken, (req, res) => {
  const sql = "SELECT * FROM expenses WHERE user_id = ?";

  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);
  });
});

app.post("/api/expenses", verifyToken, (req, res) => {
  const { title, amount, category } = req.body;

  const sql =
    "INSERT INTO expenses (title, amount, category, user_id) VALUES (?, ?, ?, ?)";

  db.query(sql, [title, amount, category, req.user.id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Expense added",
    });
  });
});

app.delete("/api/expenses/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM expenses WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Deleted successfully" });
  });
});

/* AUTH ROUTES */

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";

    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user.id }, "secretkey");

    res.json({
      message: "Login successful",
      token,
    });
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
