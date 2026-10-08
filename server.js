const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

// Public folder serve karega
app.use(express.static("public"));

// Test Route
app.get("/", (req, res) => {
    res.send("Hotel Room Booking System Server Running!");
});
// Add a new room
app.post("/api/rooms", (req, res) => {
    const { roomNo, type, price } = req.body;

    // Validation
    if (!roomNo || !type || !price) {
        return res.status(400).json({ message: "All fields are required." });
    }

    db.run(
        "INSERT INTO Rooms (roomNo, type, price, status) VALUES (?, ?, ?, ?)",
        [roomNo, type, price, "Available"],
        function (err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            res.json({
                message: "Room added successfully!",
                id: this.lastID
            });
        }
    );
});
// View all rooms
app.get("/api/rooms", (req, res) => {

    db.all("SELECT * FROM Rooms", [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        res.json(rows);
    });

});
// Book a room
app.post("/api/bookings", (req, res) => {

    const { roomId, guestName, checkIn, checkOut } = req.body;

    // Validation
    if (!roomId || !guestName || !checkIn || !checkOut) {
        return res.status(400).json({
            message: "All fields are required."
        });
    }

    // Check overlapping booking
    db.get(
        `SELECT * FROM Bookings
         WHERE roomId = ?
         AND NOT (checkOut <= ? OR checkIn >= ?)`,
        [roomId, checkIn, checkOut],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            if (row) {
                return res.status(400).json({
                    message: "Room is already booked for these dates."
                });
            }

            // Insert booking
            db.run(
                `INSERT INTO Bookings (roomId, guestName, checkIn, checkOut)
                 VALUES (?, ?, ?, ?)`,
                [roomId, guestName, checkIn, checkOut],
                function (err) {

                    if (err) {
                        return res.status(400).json({
                            message: err.message
                        });
                    }

                    // Update room status
                    db.run(
                        "UPDATE Rooms SET status='Booked' WHERE id=?",
                        [roomId]
                    );

                    res.json({
                        message: "Room booked successfully!"
                    });
                }
            );
        }
    );
});
// View all bookings
app.get("/api/bookings", (req, res) => {

    db.all(
        `SELECT 
            Bookings.id,
            Bookings.guestName,
            Bookings.checkIn,
            Bookings.checkOut,
            Rooms.roomNo,
            Rooms.type
         FROM Bookings
         JOIN Rooms ON Bookings.roomId = Rooms.id`,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            res.json(rows);
        }
    );

});
// Cancel a booking
app.delete("/api/bookings/:id", (req, res) => {

    const bookingId = req.params.id;

    // Find the booking first
    db.get(
        "SELECT roomId FROM Bookings WHERE id = ?",
        [bookingId],
        (err, booking) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            // Booking does not exist
            if (!booking) {
                return res.status(404).json({
                    message: "Booking not found."
                });
            }

            // Delete booking
            db.run(
                "DELETE FROM Bookings WHERE id = ?",
                [bookingId],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            message: err.message
                        });
                    }

                    // Make room available again
                    db.run(
                        "UPDATE Rooms SET status = 'Available' WHERE id = ?",
                        [booking.roomId],
                        (err) => {

                            if (err) {
                                return res.status(500).json({
                                    message: err.message
                                });
                            }

                            res.json({
                                message: "Booking cancelled successfully!"
                            });
                        }
                    );
                }
            );
        }
    );
});
// Search available rooms by type and date
app.get("/api/rooms/search", (req, res) => {

    const { type, checkIn, checkOut } = req.query;

    // Validation
    if (!type || !checkIn || !checkOut) {
        return res.status(400).json({
            message: "Room type, check-in and check-out dates are required."
        });
    }

    // Check-out must be after check-in
    if (checkOut <= checkIn) {
        return res.status(400).json({
            message: "Check-out date must be after check-in date."
        });
    }

    const query = `
        SELECT *
        FROM Rooms
        WHERE type = ?
        AND id NOT IN (
            SELECT roomId
            FROM Bookings
            WHERE NOT (
                checkOut <= ?
                OR checkIn >= ?
            )
        )
    `;

    db.all(
        query,
        [type, checkIn, checkOut],
        (err, rooms) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            res.json(rooms);
        }
    );
});
// Server Start
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});