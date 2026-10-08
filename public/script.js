const addRoomBtn = document.getElementById("addRoomBtn");
const bookRoomBtn = document.getElementById("bookRoomBtn");
const searchRoomBtn = document.getElementById("searchRoomBtn");

addRoomBtn.addEventListener("click", addRoom);
bookRoomBtn.addEventListener("click", bookRoom);
searchRoomBtn.addEventListener("click", searchRooms);


// ==============================
// ADD ROOM
// ==============================
async function addRoom() {

    const roomNo = document.getElementById("roomNo").value.trim();
    const type = document.getElementById("roomType").value;
    const price = document.getElementById("roomPrice").value;

    if (!roomNo || !type || !price) {
        alert("Please fill all fields.");
        return;
    }

    try {

        const response = await fetch("/api/rooms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                roomNo: roomNo,
                type: type,
                price: price
            })
        });

        const data = await response.json();

        alert(data.message);

        if (response.ok) {

            document.getElementById("roomNo").value = "";
            document.getElementById("roomType").value = "";
            document.getElementById("roomPrice").value = "";

            loadRooms();
        }

    } catch (error) {

        console.error("Error adding room:", error);
        alert("Unable to add room.");
    }
}


// ==============================
// LOAD ALL ROOMS
// ==============================
async function loadRooms() {

    try {

        const response = await fetch("/api/rooms");
        const rooms = await response.json();

        const roomsList = document.getElementById("roomsList");

        roomsList.innerHTML = "";

        if (rooms.length === 0) {

            roomsList.innerHTML = "<p>No rooms available.</p>";
            return;
        }

        rooms.forEach(room => {

            roomsList.innerHTML += `
                <div class="room-card">

                    <h3>Room ${room.roomNo}</h3>

                    <p>
                        <strong>Type:</strong>
                        ${room.type}
                    </p>

                    <p>
                        <strong>Price:</strong>
                        ₹${room.price}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${room.status}
                    </p>

                </div>
            `;
        });

    } catch (error) {

        console.error("Error loading rooms:", error);

        document.getElementById("roomsList").innerHTML =
            "<p>Unable to load rooms.</p>";
    }
}


// ==============================
// BOOK ROOM
// ==============================
async function bookRoom() {

    const roomId = document.getElementById("bookRoomId").value;
    const guestName = document.getElementById("guestName").value.trim();
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;

    if (!roomId || !guestName || !checkIn || !checkOut) {

        alert("Please fill all fields.");
        return;
    }

    if (checkOut <= checkIn) {

        alert("Check-out date must be after check-in date.");
        return;
    }

    try {

        const response = await fetch("/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                roomId: roomId,
                guestName: guestName,
                checkIn: checkIn,
                checkOut: checkOut
            })
        });

        const data = await response.json();

        alert(data.message);

        if (response.ok) {

            document.getElementById("bookRoomId").value = "";
            document.getElementById("guestName").value = "";
            document.getElementById("checkIn").value = "";
            document.getElementById("checkOut").value = "";

            loadRooms();
            loadBookings();
        }

    } catch (error) {

        console.error("Error booking room:", error);
        alert("Unable to book room.");
    }
}


// ==============================
// LOAD ALL BOOKINGS
// ==============================
async function loadBookings() {

    try {

        const response = await fetch("/api/bookings");
        const bookings = await response.json();

        const bookingsList = document.getElementById("bookingsList");

        bookingsList.innerHTML = "";

        if (bookings.length === 0) {

            bookingsList.innerHTML = "<p>No bookings yet.</p>";
            return;
        }

        bookings.forEach(booking => {

            bookingsList.innerHTML += `
                <div class="booking-card">

                    <h3>Booking #${booking.id}</h3>

                    <p>
                        <strong>Guest:</strong>
                        ${booking.guestName}
                    </p>

                    <p>
                        <strong>Room:</strong>
                        ${booking.roomNo}
                    </p>

                    <p>
                        <strong>Type:</strong>
                        ${booking.type}
                    </p>

                    <p>
                        <strong>Check-in:</strong>
                        ${booking.checkIn}
                    </p>

                    <p>
                        <strong>Check-out:</strong>
                        ${booking.checkOut}
                    </p>

                    <button onclick="cancelBooking(${booking.id})">
                        Cancel Booking
                    </button>

                </div>
            `;
        });

    } catch (error) {

        console.error("Error loading bookings:", error);

        document.getElementById("bookingsList").innerHTML =
            "<p>Unable to load bookings.</p>";
    }
}


// ==============================
// CANCEL BOOKING
// ==============================
async function cancelBooking(id) {

    try {

        const response = await fetch(`/api/bookings/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        alert(data.message);

        if (response.ok) {

            loadBookings();
            loadRooms();
        }

    } catch (error) {

        console.error("Error cancelling booking:", error);
        alert("Unable to cancel booking.");
    }
}


// ==============================
// INITIAL LOAD
// ==============================
loadRooms();
loadBookings();
// ========================================
// SEARCH AVAILABLE ROOMS
// ========================================
async function searchRooms() {

    const type = document.getElementById("searchType").value;
    const checkIn = document.getElementById("searchCheckIn").value;
    const checkOut = document.getElementById("searchCheckOut").value;

    if (!type || !checkIn || !checkOut) {
        alert("Please select room type and dates.");
        return;
    }

    if (checkOut <= checkIn) {
        alert("Check-out date must be after check-in date.");
        return;
    }

    try {

        const response = await fetch(
            `/api/rooms/search?type=${encodeURIComponent(type)}&checkIn=${checkIn}&checkOut=${checkOut}`
        );

        const data = await response.json();

        const searchResults = document.getElementById("searchResults");

        searchResults.innerHTML = "";

        if (!response.ok) {
            searchResults.innerHTML = `<p>${data.message}</p>`;
            return;
        }

        if (data.length === 0) {
            searchResults.innerHTML =
                "<p>No rooms available for the selected dates.</p>";
            return;
        }

        data.forEach(room => {

            searchResults.innerHTML += `
                <div class="room-card">

                    <h3>Room ${room.roomNo}</h3>

                    <p>
                        <strong>Type:</strong>
                        ${room.type}
                    </p>

                    <p>
                        <strong>Price:</strong>
                        ₹${room.price}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        Available
                    </p>

                </div>
            `;
        });

    } catch (error) {

        console.error("Error searching rooms:", error);

        document.getElementById("searchResults").innerHTML =
            "<p>Unable to search rooms.</p>";
    }
}