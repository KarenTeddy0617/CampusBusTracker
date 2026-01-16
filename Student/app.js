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
const campus = [10.06171, 76.34288];

// 🎯 Destination Stop
//const destinationStop = [9.93350, 76.34120];

// 🗺️ Initialize Leaflet Map
const map = L.map("map").setView(campus, 12);

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
    //.addTo(map)
    .bindPopup("Live Bus");
let selectedStop = null;// Selected stop from dropdown
let stopMarker = null; // GREEN marker
// 🚏 Bus Stops
const stopCoordinates = {
    Najath: { name: "Najath Hospital Aluva", lat: 10.11125, lng: 76.35153 },
    BankJn: { name: "Bank Junction", lat: 10.11542, lng: 76.35231 },
    Railway: { name: "Railway Station Aluva", lat: 10.10889, lng: 76.35653 },
    Garage: { name: "Garage Stop", lat: 10.1065, lng: 76.3541 },
    Kalamassery: { name: "Premier Junction, Kalamassery", lat: 10.06171, lng: 76.32360 },
    Cusat: { name: "CUSAT Main Gate", lat: 10.04774, lng: 76.31895 },
    Mec: { name: "MEC", lat: 10.03110, lng: 76.32925 }
};


/*stops.forEach(stop => {
    L.marker([stop.lat, stop.lng], { icon: stopIcon })
        .addTo(map)
        .bindPopup(stop.name);
});*/

// 🛣️ Route Polyline
/*const routeCoordinates = [
    campus,
    [9.93350, 76.34120],
    [9.93220, 76.34300],
    [9.93080, 76.34410]
];

L.polyline(routeCoordinates, {
    color: "red",
    weight: 4
}).addTo(map);*/

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


function resetBusUI() {
    if (map.hasLayer(busMarker)) map.removeLayer(busMarker);
    document.getElementById("speed").innerText = '--';
    document.getElementById("distance").innerText = '--';
    document.getElementById("eta").innerText = '--';
}

//Controls non-bus hours,No GPS movement when inactive
let busRunning = false;


db.ref("busStatus").on("value", snapshot => {
    const status = snapshot.val();

    if (status === "running") {
        busRunning = true;
        document.getElementById("status").innerText = "🚌 Bus is running";
    } else {
        busRunning = false;
        document.getElementById("status").innerText =
            "🚫 Bus service not available now";
        resetBusUI();
    }
});
document.getElementById("stopSelect").addEventListener("change", function () {
    const stopKey = this.value;

    if (!stopKey) return;

    selectedStop = stopCoordinates[stopKey];

    // Remove previous green marker
    if (stopMarker) {
        map.removeLayer(stopMarker);
    }

    // Add GREEN marker at selected stop
    stopMarker = L.circleMarker(
        [selectedStop.lat, selectedStop.lng],
        {
            radius: 10,
            color: "green",
            fillColor: "green",
            fillOpacity: 0.8
        }
    )
        .addTo(map)
        .bindPopup(`Selected Stop: ${selectedStop.name}`)
        .openPopup();

    // Focus map on selected stop
    map.setView([selectedStop.lat, selectedStop.lng], 15);
});



// 🔴 Live Firebase Listener
db.ref("buses/bus1").on("value", snapshot => {
    
    const data = snapshot.val();
    // Remove marker if bus not running or data invalid
    if (!busRunning || !data || !data.lat || !data.lng) {
        

        return;
        
    }

    let lat = Number(data.lat);
    let lng = Number(data.lng);

    
   // map.panTo([lat, lng]);
    if (!map.hasLayer(busMarker)) {
    busMarker.addTo(map);
    }

    // Move marker
    busMarker.setLatLng([lat, lng]);



    const FIXED_SPEED = 30;
    // Only calculate distance/ETA if a stop is selected
    if (selectedStop) {
        const distance = calculateDistance(
            lat,
            lng,
            selectedStop.lat,
            selectedStop.lng
        );

       
        const eta = FIXED_SPEED > 0 ? (distance / FIXED_SPEED) * 60 : '--';

        document.getElementById("distance").innerText = distance.toFixed(2);
        document.getElementById("eta").innerText = eta === '--' ? '--' : eta.toFixed(1);
    } else {
        document.getElementById("distance").innerText = '--';
        document.getElementById("eta").innerText = '--';
    }
    document.getElementById("speed").innerText = FIXED_SPEED;


    /* Distance + ETA
    const distance = calculateDistance(
        lat,
        lng,
        selectedStop.lat,
        selectedStop.lng
    );

    const speed = data.speed || 20;
    const eta = (distance / speed) * 60;

    document.getElementById("distance").innerText = distance.toFixed(2);
    document.getElementById("eta").innerText = eta.toFixed(1);
});*/

// ❗ ONLY calculate distance/ETA if stop selected
    /*if (!selectedStop) {
        document.getElementById("distance").innerText = "--";
        document.getElementById("eta").innerText = "--";
        return;
    }*/

   /* const distance = calculateDistance(
        lat,
        lng,
        selectedStop.lat,
        selectedStop.lng
    );
    console.log

    const speed = data.speed && data.speed > 0 ? data.speed : 20;
    const eta = (distance / speed) * 60;

    document.getElementById("distance").innerText = distance.toFixed(2);
    document.getElementById("eta").innerText = eta.toFixed(1);
}); */


});
