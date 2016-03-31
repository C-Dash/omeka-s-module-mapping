$(document).ready( function() {

// Control that fits markers within bounds.
L.Control.FitBounds = L.Control.extend({
    options: {
        position: 'topleft'
    },

    initialize: function (layerGroup) {
        this._layerGroup = layerGroup;
    },

    onAdd: function (map) {
        this._map = map;

        var container = L.DomUtil.create('div', 'mapping-control-fit leaflet-bar');
        var link = L.DomUtil.create('a', 'mapping-control-fit-bounds', container);

        link.innerHTML = '⊡';
        link.href = '#';
        link.title = 'Fit markers within bounds';
        link.style.fontSize = '20px';

        L.DomEvent
            .on(link, 'mousedown', L.DomEvent.stopPropagation)
            .on(link, 'dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', this._fitBounds, this);
        return container;
    },

    _fitBounds: function(e) {
        var bounds = this._layerGroup.getBounds();
        if (bounds.isValid()) {
            this._map.fitBounds(bounds);
        }
    },
});
L.control.fitBounds = function (layerGroup) {
    return new L.Control.FitBounds(layerGroup);
};

var mappingMap = $('#mapping-map');
var map = L.map('mapping-map').setView([0, 0], 1);
var baseMaps = {
    'Streets': L.tileLayer.provider('OpenStreetMap.Mapnik'),
    'Grayscale': L.tileLayer.provider('OpenStreetMap.BlackAndWhite'),
    'Satellite': L.tileLayer.provider('Esri.WorldImagery'),
    'Terrain': L.tileLayer.provider('Esri.WorldShadedRelief')
};
var drawnItems = new L.FeatureGroup();
var layerControl = L.control.layers(baseMaps);
var fitBoundsControl = L.control.fitBounds(drawnItems);

map.addLayer(baseMaps['Streets']);
map.addLayer(drawnItems);
map.addControl(layerControl);
map.addControl(fitBoundsControl);

$.each(mappingMap.data('markers'), function(index, data) {
    var latLng = L.latLng(data['o-module-mapping:lat'], data['o-module-mapping:lng']);
    var marker = L.marker(latLng);
    var popupContent = $('.template.mapping-marker-popup-content[data-marker-id="' + data['o:id'] + '"]')
        .clone().removeClass('template');
    marker.bindPopup(popupContent[0]);
    drawnItems.addLayer(marker);
});

var mapping = mappingMap.data('mapping');
if (mapping) {
    wms = L.tileLayer.wms(mapping['o-module-mapping:wms_base_url'], {
        layers: mapping['o-module-mapping:wms_layers'],
        styles: mapping['o-module-mapping:wms_styles'],
        format: 'image/png',
        transparent: true,
    }).addTo(map);
    layerControl.addOverlay(wms, mapping['o-module-mapping:wms_label']);
}

// Switching sections changes map dimensions, so make the necessary adjustments.
$('a[href="#mapping-section"], #mapping-legend').on('click', function(e) {
    map.invalidateSize();
});

});
