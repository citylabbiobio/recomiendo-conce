// heatmap.js
export function createHeatmapLayer(map) {
    console.log('⚡ Generando grilla hexagonal...');

    const data = [
        { position: [-73.05, -36.82] },
        { position: [-73.06, -36.83] },
        { position: [-73.07, -36.84] },
        { position: [-73.08, -36.81] }
    ];

    const hexLayer = new deck.HexagonLayer({
        id: 'hex-layer',
        data,
        getPosition: d => d.position,
        radius: 200, // metros
        elevationScale: 4,
        extruded: true,
        pickable: true,
        opacity: 0.6
    });

    const overlay = new deck.MapboxOverlay({
        layers: [hexLayer]
    });

    map.addControl(overlay);
}