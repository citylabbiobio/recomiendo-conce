import { populateModal, populateConsolidadoModal } from './modal.js';

let markers = [];

export function clearMarkers() {
    markers.forEach(m => m.remove());
    markers = [];
}

// Marcador original para lugares individuales
export function addLugarMarker(map, lugar) {
    const el = document.createElement('div');
    el.className = 'marker-individual';

    const img = document.createElement('img');
    img.src = 'assets/svg/pin.svg';
    img.alt = 'Pin';
    el.appendChild(img);

    img.addEventListener('click', () => {
        populateModal(lugar);
        const modal = new bootstrap.Modal(document.getElementById('infoModal'));
        modal.show();
    });

    const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    })
        .setLngLat([lugar.lon, lugar.lat])
        .addTo(map);

    markers.push(marker);
}

// Marcador para lugares consolidados con contador
export function addLugarConsolidadoMarker(map, lugar) {
    const el = document.createElement('div');
    el.className = 'marker-consolidado';

    // Pin principal
    const img = document.createElement('img');
    img.src = 'assets/svg/pin.svg';
    img.alt = 'Pin consolidado';
    img.className = 'marker-pin';

    // Badge con el contador
    const badge = document.createElement('div');
    badge.className = 'marker-badge';
    badge.textContent = lugar.total_registros;

    // Aplicar clase según cantidad para colores
    const count = lugar.total_registros;
    if (count === 1) {
        badge.classList.add('badge-single');
    } else if (count >= 2 && count <= 4) {
        badge.classList.add('badge-few');
    } else if (count >= 5 && count <= 9) {
        badge.classList.add('badge-many');
    } else if (count >= 10) {
        badge.classList.add('badge-lots');
    }

    // Click event
    el.addEventListener('click', () => {
        populateConsolidadoModal(lugar);
        const modal = new bootstrap.Modal(document.getElementById('infoModal'));
        modal.show();
    });

    // Ensamblar
    el.appendChild(img);
    el.appendChild(badge);

    const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    })
        .setLngLat([lugar.lng, lugar.lat])
        .addTo(map);

    markers.push(marker);
}

// Marcador para hotspots (lugares muy recomendados)
export function addHotspotMarker(map, lugar) {
    const el = document.createElement('div');
    el.className = 'marker-hotspot';

    const img = document.createElement('img');
    img.src = 'assets/svg/pin.svg';
    img.alt = 'Hotspot pin';
    img.className = 'marker-pin hotspot-pin';

    const badge = document.createElement('div');
    badge.className = 'marker-badge hotspot-badge';
    badge.textContent = lugar.total_registros;

    el.addEventListener('click', () => {
        populateConsolidadoModal(lugar);
        const modal = new bootstrap.Modal(document.getElementById('infoModal'));
        modal.show();
    });

    el.appendChild(img);
    el.appendChild(badge);

    const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    })
        .setLngLat([lugar.lng, lugar.lat])
        .addTo(map);

    markers.push(marker);
}

// Función inteligente que decide qué tipo de marcador usar
export function addSmartMarker(map, lugar) {
    if (lugar.total_registros !== undefined) {
        if (lugar.total_registros >= 10) {
            addHotspotMarker(map, lugar);
        } else {
            addLugarConsolidadoMarker(map, lugar);
        }
    } else {
        addLugarMarker(map, lugar);
    }
}

// Obtiene estadísticas de los marcadores actuales
export function getMarkersStats() {
    const consolidados = markers.filter(m =>
        m.getElement().classList.contains('marker-consolidado')
    );

    const hotspots = markers.filter(m =>
        m.getElement().classList.contains('marker-hotspot')
    );

    const individuales = markers.filter(m =>
        m.getElement().classList.contains('marker-individual')
    );

    return {
        total: markers.length,
        consolidados: consolidados.length,
        individuales: individuales.length,
        hotspots: hotspots.length
    };
}

// Función de debugging
export function logMarkersInfo() {
    const stats = getMarkersStats();
    console.log('📍 Marcadores en mapa:', stats);
}