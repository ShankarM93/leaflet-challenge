// Defining depth colours
function depthColor(depth) {
    if (depth > 90) {
      return "Red";
    } else if (depth > 70) {
      return "DarkOrange";
    } else if (depth > 50) {
      return "Orange";
    } else if (depth > 30) {
      return "Yellow";
    } else if (depth > 10) {
      return "LightGreen";
    } else {
      return "Aqua";
    }
  }

// D3 gethers earthquake data from json url
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';  

// Creating Overlaysfdn
var earthquakeLayer = new L.layerGroup();
var overlays = {
    Earthquakes: earthquakeLayer
}

// tile layer and base layer
var geoLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors'
})

var baseLayers = {
    Outdoor: geoLayer
} 

// map object
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3, 
    // Display on load
    layers: [geoLayer, earthquakeLayer]
});

// using function to callback for pointTolayer, which returns Leaflet circle markers with given specifications
function drawCircle(point, latlng) {
    let mag = point.properties.mag;
    let depth = point.geometry.coordinates[2];
    return L.circle(latlng, {
            fillOpacity: 1,
            color: 'black',
            weight: 0.5,
            fillColor: depthColor(depth),
            radius: mag * 15000
    })
}

// creating popup with location, magnitude and depth information
function bindPopUp(feature, layer) {
    layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}`);
}

//Converting earthquake data in to Leaflet circle markers, with popups being bound to each layer 
d3.json(url).then((data) => {
    var features = data.features;
    L.geoJSON(features, {
        pointToLayer: drawCircle,
        onEachFeature: bindPopUp
    }).addTo(earthquakeLayer);

    // Setting up legend parameters
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = () => {
        var div = L.DomUtil.create('div', 'info legend');
        labels = ['<strong>Depth:<br></strong>'];
        grades = [-10, 10, 30, 50, 70, 90];
        div.innerHTML = labels.join('<br>');
    
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + depthColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        
        return div;
    };
    legend.addTo(myMap);
});