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
    humidity: L.featureGroup(),
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
    "Relative Luftfeuchtigkeit": overlays.humidity,
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

// Farben nach Wert und Schwellen ermitteln
let getColor = function (value, ramp) {
    // console.log(value,ramp);
    for (let rule of ramp) {
        // console.log(rule)
        if (value >= rule.min && value < rule.max) {
            return rule.color;
        }
    }
};
// console.log(getColor(-40, COLORS.temperature));


// Wetterstationen mit Icons und Popups
let drawStations = function (geojson) {
    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            // Workload 8 - Franz Gatt
            // Temperatur-Abfrage
            let temperatur = ``
            if (geoJsonPoint.properties.LT > -50 && geoJsonPoint.properties.LT < 50) {
                temperatur = `Lufttemperatur: ${geoJsonPoint.properties.LT.toFixed(1)}(°C)<br>`
            }
            // Schneehöhe-Abfrage
            let snowheight = ``
            if (geoJsonPoint.properties.HS > 0 && geoJsonPoint.properties.HS < 15000) {
                snowheight = `Schneehöhe: ${geoJsonPoint.properties.HS.toFixed(1)}(cm)<br>`
            }
            // Windgeschwindigkeit-Abfrage
            let wind = ``
            if (geoJsonPoint.properties.WG > 0 && geoJsonPoint.properties.WG < 300) {
                wind = `Windgeschwindigkeit: ${(geoJsonPoint.properties.WG * 3.6).toFixed(1)}(km/h)<br>`
            }
            // Windrichtung-Abfrage
            let winddir = ``
            if (geoJsonPoint.properties.WR >= 0 && geoJsonPoint.properties.WR <= 360) {
                winddir = `Windrichtung: ${geoJsonPoint.properties.WR.toFixed(1)}(°)<br>`
            }
            // Relative Luftfeuchtigkeit-Abfrage
            let humidity = ``
            if (geoJsonPoint.properties.RH >= 0 && geoJsonPoint.properties.RH <= 150) {
                humidity = `Relative Luftfeuchtigkeit: ${geoJsonPoint.properties.RH.toFixed(1)}(%)<br>`
            }
            let popup = `
                <strong>${geoJsonPoint.properties.name}</strong>
                (${geoJsonPoint.geometry.coordinates[2]}m)<br>
                ${temperatur}
                ${snowheight}
                ${wind}
                ${winddir}
                ${humidity}
                <a href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/dreitage/${geoJsonPoint.properties.plot}.png">Aktuelle Wetterverlaufsgrafik</a>
            `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/wifi.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(overlays.stations);
}

// Temperatur
let drawTemperature = function (geojson) {
    L.geoJSON(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.LT > -50 && geoJsonPoint.properties.LT < 50) {
                return true;
            }
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
                 <strong>${geoJsonPoint.properties.name}</strong>
                 (${geoJsonPoint.geometry.coordinates[2]}m)<br>
             `;
            let color = getColor(
                geoJsonPoint.properties.LT,
                COLORS.temperature
            );
            console.log(geoJsonPoint.properties.LT, color);

            // Provisorischer Marker: L.marker(latlng).addTo(map);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${geoJsonPoint.properties.LT.toFixed(1)}</span>`
                })
            }).bindPopup(popup);
        }
    }).addTo(overlays.temperature);
}

// Schneehöhen 
let drawSnowheight = function (geojson) {
    L.geoJSON(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.HS > 0 && geoJsonPoint.properties.HS < 15000) {
                return true;
            }
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
                 <strong>${geoJsonPoint.properties.name}</strong>
                 (${geoJsonPoint.geometry.coordinates[2]}m)<br>
             `;
            let color = getColor(
                geoJsonPoint.properties.HS,
                COLORS.snowheight
            );
            // console.log(geoJsonPoint.properties.LT, color);

            // Provisorischer Marker: L.marker(latlng).addTo(map);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${geoJsonPoint.properties.HS.toFixed(0)}</span>`
                })
            }).bindPopup(popup);
        }
    }).addTo(overlays.snowheight);
}

// Wind
let drawWind = function (geojson) {
    L.geoJSON(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.WG > 0 && geoJsonPoint.properties.WG < 300 && geoJsonPoint.properties.WR >= 0 && geoJsonPoint.properties.WR <= 360) {
                return true;
            }
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
                 <strong>${geoJsonPoint.properties.name}</strong>
                 (${geoJsonPoint.geometry.coordinates[2]}m)<br>
             `;
            let color = getColor(
                geoJsonPoint.properties.WG,
                COLORS.wind
            );
            // console.log(geoJsonPoint.properties.LT, color);
            let deg = geoJsonPoint.properties.WR;
            // console.log(WR);

            // Provisorischer Marker: L.marker(latlng).addTo(map);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}; transform: rotate(${deg}deg)"><i class="fa-solid fa-circle-arrow-up"></i>${geoJsonPoint.properties.WG.toFixed(0)}</span>`
                })
            }).bindPopup(popup);
        }
    }).addTo(overlays.wind);
}

// Relative Luftfeuchtigkeit
let drawHumidity = function (geojson) {
    L.geoJson(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.RH >= 0 && geoJsonPoint.properties.RH <= 100) {
                return true;
            }
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
                <strong>${geoJsonPoint.properties.name}</strong><br>
                (${geoJsonPoint.geometry.coordinates[2]}m)
            `;
            let color = getColor(geoJsonPoint.properties.RH,
                COLORS.humidity
            );
            // console.log(RH);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}"> ${geoJsonPoint.properties.RH.toFixed(0)}</span>`
                })
            }).bindPopup(popup);
        }
    }).addTo(overlays.humidity);
}

// Wetterstationen
async function loadData(url) {
    let response = await fetch(url);
    let geojson = await response.json();

    drawStations(geojson);
    drawTemperature(geojson);
    drawSnowheight(geojson);
    drawWind(geojson);
    drawHumidity(geojson);
}
// Server lässt Nutzung der Daten nicht zu: loadData("https://lawine.tirol.gv.at/data/produkte/ogd.geojson");
loadData("https://static.avalanche.report/weather_stations/stations.geojson");

// Rainviewer-Plugin
// Change default options
L.control.rainviewer({
    position: 'bottomleft',
    nextButtonText: '>',
    playStopButtonText: 'Play/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Hour:",
    opacitySliderLabelText: "Opacity:",
    animationInterval: 500,
    opacity: 0.5
}).addTo(map);