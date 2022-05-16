/* Wetterstationen Tirol Beispiel */
// Workload 7 - Franz Gatt

let innsbruck = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 11
};

// WMTS Hintergrundlayer von https://lawinen.report (CC BY avalanche.report) als Startlayer
let startLayer = L.tileLayer("https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
    attribution: '&copy; <a href="https://lawinen.report">CC BY avalanche.report</a>'
})

// Overlays Objekt für die thematischen Layer
let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    precipitation: L.featureGroup(),
    snowheight: L.featureGroup(),
    wind: L.featureGroup(),
};

// Karte initialisieren
let map = L.map("map", {
    center: [innsbruck.lat, innsbruck.lng],
    zoom: innsbruck.zoom,
    layers: [
        startLayer
    ],
});

// Layer control mit WMTS Hintergründen und Overlays
let layerControl = L.control.layers({
    "Relief avalanche.report": startLayer,
    "Esri World Imagery": L.tileLayer.provider("Esri.WorldImagery"),
}, {
    "Wetterstationen": overlays.stations,
    "Temperatur": overlays.temperature,
    "Niederschlag": overlays.precipitation,
    "Schneehöhe": overlays.snowheight,
    "Wind": overlays.wind
}).addTo(map);

// Layer control ausklappen
layerControl.expand();

// Maßstab control
L.control.scale({
    imperial: false
}).addTo(map);

// Fullscreen control
L.control.fullscreen().addTo(map);

// Wetterstationslayer beim Laden anzeigen
overlays.stations.addTo(map);

// Wetterstationen
async function loadData(url) {
    let response = await fetch(url);
    let geojson = await response.json();

    // Wetterstationen mit Icons und Popups implementieren
    // Workload 7: Franz Gatt

    //console.log(geojson);

    let overlay = L.featureGroup()
    layerControl.addOverlay(overlay, "Wetterstationen");
    overlay.addTo(map);

    let marker = L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            
            let popup = `
                <strong>${geoJsonPoint.properties.name}</strong>
                (${geoJsonPoint.geometry.coordinates[2]}m)<br>
            `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/wifi.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(overlay);
}
loadData("https://static.avalanche.report/weather_stations/stations.geojson");