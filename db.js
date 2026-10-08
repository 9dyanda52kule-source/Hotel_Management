const sqlite3 = require("sqlite3").verbose();

// Database create/open
const db = new sqlite3.Database("./hotel.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Rooms table
db.run(`
CREATE TABLE IF NOT EXISTS Rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roomNo TEXT UNIQUE,
    type TEXT,
    price REAL,
    status TEXT DEFAULT 'Available'
);
`);

// Bookings table
db.run(`
CREATE TABLE IF NOT EXISTS Bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roomId INTEGER,
    guestName TEXT,
    checkIn TEXT,
    checkOut TEXT,
    FOREIGN KEY(roomId) REFERENCES Rooms(id)
);
`);

module.exports = db;