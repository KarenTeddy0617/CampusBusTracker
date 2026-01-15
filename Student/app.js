// 🔥 Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAyH0z9oScufG5CnJ8izMvaO0aur0l_ANg",
    authDomain: "campusbustracker-a1f10.firebaseapp.com",
    databaseURL: "https://campusbustracker-a1f10-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "campusbustracker-a1f10",
    storageBucket: "campusbustracker-a1f10.firebasestorage.app",
    messagingSenderId: "698456556354",
    appId: "1:698456556354:web:9b10635f53cb4c111d7edb"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

console.log("Firebase connected");

// 📍 Campus Center
const campus = [9.93198, 76.34288];

// 🎯 Destination Stop
const destinationStop = [9.93350, 76.34120];

// 🗺️ Initialize Leaflet Map
const map = L.map("map").setView(campus, 15);

// 🌍 OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

// 🚌 Bus Icon
const busIcon = L.icon({
    iconUrl: "../assets/bus.png",
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

// 🚏 Stop Icon
const stopIcon = L.icon({
    iconUrl: "../assets/stop.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// 🚌 Bus Marker
let busMarker = L.marker(campus, { icon: busIcon })
    .addTo(map)
    .bindPopup("Live Bus");

// 🚏 Bus Stops
const stops = [
    { name: "Main Gate", lat: 9.93350, lng: 76.34120 },
    { name: "Library", lat: 9.93220, lng: 76.34300 },
    { name: "Hostel", lat: 9.93080, lng: 76.34410 }
];

stops.forEach(stop => {
    L.marker([stop.lat, stop.lng], { icon: stopIcon })
        .addTo(map)
        .bindPopup(stop.name);
});

// 🛣️ Route Polyline
const routeCoordinates = [
    campus,
    [9.93350, 76.34120],
    [9.93220, 76.34300],
    [9.93080, 76.34410]
];

L.polyline(routeCoordinates, {
    color: "red",
    weight: 4
}).addTo(map);

// 📐 Distance Calculation (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 🔴 Live Firebase Listener
db.ref("buses/bus1").on("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    const lat = data.lat;
    const lng = data.lng;

    // Move marker
    busMarker.setLatLng([lat, lng]);
    map.panTo([lat, lng]);

    // Update speed
    document.getElementById("speed").innerText = data.speed || 0;

    // Distance + ETA
    const distance = calculateDistance(
        lat,
        lng,
        destinationStop[0],
        destinationStop[1]
    );

    const speed = data.speed || 20;
    const eta = (distance / speed) * 60;

    document.getElementById("distance").innerText = distance.toFixed(2);
    document.getElementById("eta").innerText = eta.toFixed(1);
});
