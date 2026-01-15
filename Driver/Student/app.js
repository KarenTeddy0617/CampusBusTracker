const firebaseConfig = {
    apiKey: "AIzaSyAyH0z9oScufG5CnJ8izMvaO0aur0l_ANg",
    authDomain: "campusbustracker-a1f10.firebaseapp.com",
    databaseURL: "https://campusbustracker-a1f10-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "campusbustracker-a1f10",
    storageBucket: "campusbustracker-a1f10.firebasestorage.app",
    messagingSenderId: "698456556354",
    appId: "1:698456556354:web:9b10635f53cb4c111d7edb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

console.log("Firebase connected");

// 🔹 Google Map Variables
let map, busMarker;

// 🔹 Campus Center
const campus = { lat: 9.93198, lng: 76.34288 };

// 🔹 Dummy Stop (already used in Day 3)
const destinationStop = { lat: 9.93350, lng: 76.34120 };

// 🔹 Initialize Map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: campus,
        zoom: 15
    });

    busMarker = new google.maps.Marker({
        position: campus,
        map: map,
        icon: "assets/bus.png",
        title: "Live Bus"
    });

    addStops();
    drawRoute();
}

initMap();

// 🔹 Bus Stops
function addStops() {
    const stops = [
        { name: "Main Gate", lat: 9.93350, lng: 76.34120 },
        { name: "Library", lat: 9.93220, lng: 76.34300 },
        { name: "Hostel", lat: 9.93080, lng: 76.34410 }
    ];

    stops.forEach(stop => {
        new google.maps.Marker({
            position: { lat: stop.lat, lng: stop.lng },
            map: map,
            icon: "assets/stop.png",
            title: stop.name
        });
    });
}

// 🔹 Draw Route
function drawRoute() {
    const routeCoordinates = [
        campus,
        { lat: 9.93350, lng: 76.34120 },
        { lat: 9.93220, lng: 76.34300 },
        { lat: 9.93080, lng: 76.34410 }
    ];

    const route = new google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeWeight: 3
    });

    route.setMap(map);
}

// 🔹 Distance Calculation (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 🔹 Live Firebase Listener
db.ref("buses/bus1").on("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    const busPos = { lat: data.lat, lng: data.lng };

    busMarker.setPosition(busPos);
    map.panTo(busPos);

    document.getElementById("speed").innerText = data.speed || 0;

    const distance = calculateDistance(
        data.lat,
        data.lng,
        destinationStop.lat,
        destinationStop.lng
    );

    const speed = data.speed || 20; // km/h fallback
    const eta = (distance / speed) * 60;

    document.getElementById("distance").innerText = distance.toFixed(2);
    document.getElementById("eta").innerText = eta.toFixed(1);
});
