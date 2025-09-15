export async function createHeatmapLayer(map) {
    const res = await fetch('/data/Result_2.json');
    const rawData = await res.json();

    const geojson = rawData.map(poi => ({
        position: [poi.lon, poi.lat],
        weight: poi.total_recomendaciones
    }));

    const hexLayer = new deck.HexagonLayer({
        id: 'hex-layer',
        data: geojson,
        getPosition: d => d.position,
        getElevationWeight: d => d.weight,
        elevationScale: 50,
        extruded: true,
        radius: 200,
        colorRange: [
            [0, 0, 255],
            [0, 128, 255],
            [0, 255, 255],
            [255, 255, 0],
            [255, 128, 0],
            [255, 0, 0]
        ],
        coverage: 1,
        elevationRange: [0, 1000],
        pickable: true
    });

    new deck.DeckGL({
        map: map,
        layers: [hexLayer],
        viewState: {
            longitude: map.getCenter().lng,
            latitude: map.getCenter().lat,
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            bearing: map.getBearing()
        },
        controller: false
    });
}