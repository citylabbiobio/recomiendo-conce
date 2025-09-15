// main.js
import { map } from './map.js';
import { loadData } from './dataLoader.js';
import { setupForm } from './formHandler.js';
import { setupFilters, getActiveFilters } from './filters.js';
import { initSearch } from './search.js';
import { clearModal } from './modal.js';
import { supabase } from './supabaseClient.js';
import { updateMarkerSizes } from './markerManager.js';
import { createHeatmapLayer } from './heatmap.js'; // 👈 Importar grilla hexagonal

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM listo. Inicializando aplicación...');

    setupForm();
    initSearch();
    setupFilters({
        onFilterChange: () => disableAutoRefresh(),
        onReset: () => enableAutoRefresh()
    });

    loadData(); // Carga inicial sin filtros

    // 🔥 Agregar grilla hexagonal cuando el mapa esté listo
    map.on('load', async () => {
        try {
            await createHeatmapLayer(map);
            console.log('✅ Grilla hexagonal cargada');
        } catch (err) {
            console.error('Error cargando heatmap:', err);
        }

        // Ajustar marcadores al cargar el mapa
        updateMarkerSizes(map);
    });

    // Cargar ícono SVG del menú
    loadSVGInline('assets/svg/menu-1.svg', '.menu-icon');

    // FAB y offcanvas
    const fabMenu = document.getElementById('main-fab-menu');
    const offcanvasElement = document.getElementById('menuOffcanvas');

    if (fabMenu && offcanvasElement) {
        const offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
        offcanvasElement.addEventListener('shown.bs.offcanvas', () => fabMenu.style.display = 'none');
        offcanvasElement.addEventListener('hidden.bs.offcanvas', () => fabMenu.style.display = 'block');
    }

    // Modal submit: apertura automática al cargar
    const submitModalEl = document.getElementById('submitModal');
    if (submitModalEl) {
        const modal = new bootstrap.Modal(submitModalEl);
        modal.show();
    }

    // Limpiar modal antes de mostrar contenido
    const infoModalEl = document.getElementById('infoModal');
    if (infoModalEl) {
        infoModalEl.addEventListener('show.bs.modal', () => {
            clearModal();
        });
    }

    // Botón para abrir modal manualmente
    const openModalBtn = document.getElementById('openModalBtn');
    if (openModalBtn && submitModalEl) {
        openModalBtn.addEventListener('click', () => {
            const offcanvasInstances = Array.from(document.querySelectorAll('.offcanvas'))
                .map(el => bootstrap.Offcanvas.getInstance(el))
                .filter(i => i);
            if (offcanvasInstances.length === 0) return new bootstrap.Modal(submitModalEl).show();

            let closedCount = 0;
            offcanvasInstances.forEach(i => i.hide());
            document.querySelectorAll('.offcanvas').forEach(el => {
                el.addEventListener('hidden.bs.offcanvas', () => {
                    closedCount++;
                    if (closedCount === offcanvasInstances.length) new bootstrap.Modal(submitModalEl).show();
                }, { once: true });
            });
        });
    }

    // Formulario de búsqueda geocoding
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (!query) return;

            console.log('Buscando ubicación:', query);
            const data = await geocodeGoogle(query);
            console.log('Resultados Google Maps:', data);
        });
    }

    // Eventos para actualizar tamaño de marcadores según zoom
    map.on('zoom', () => updateMarkerSizes(map));
});

// 🔁 Auto-refresh controlado
let autoRefreshEnabled = true;

function enableAutoRefresh() {
    autoRefreshEnabled = true;
}

function disableAutoRefresh() {
    autoRefreshEnabled = false;
}

// 🔄 Auto-refresh del mapa cada 10s
setInterval(() => {
    const popupVisible = document.querySelector('.mapboxgl-popup.open');
    const modalVisible = document.querySelector('.modal.show');
    const { category, comuna } = getActiveFilters();
    const filtersActive = category !== null || comuna !== null;

    if (!popupVisible && !modalVisible && autoRefreshEnabled && !filtersActive) {
        loadData();
        console.log('Mapa actualizado automáticamente');
    }
}, 10000);

// 📦 Cargar SVG inline
async function loadSVGInline(path, targetSelector) {
    try {
        const res = await fetch(path);
        const svgText = await res.text();
        const container = document.querySelector(targetSelector);
        if (container) container.innerHTML = svgText;
    } catch (error) {
        console.error("Error cargando SVG:", error);
    }
}

// 🌐 Geocoding seguro via Edge Function
async function geocodeGoogle(query) {
    try {
        const { data, error } = await supabase.functions.invoke("maps-geocode", {
            body: { provider: "google", q: query }
        });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error geocoding Google:', err);
        return null;
    }
}

async function reverseMapbox(lon, lat) {
    try {
        const { data, error } = await supabase.functions.invoke("maps-geocode", {
            body: { provider: "mapbox", lon, lat }
        });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error reverse geocoding Mapbox:', err);
        return null;
    }
}