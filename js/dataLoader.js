import { clearMarkers, addLugarMarker, addLugarConsolidadoMarker } from './markerManager.js';
import { supabase } from './supabaseClient.js';
import { map } from './map.js';

export async function loadData(category = null, comuna = null) {
    clearMarkers();

    // Cargar lugares consolidados (siempre se muestran)
    await loadLugaresConsolidados();

    // Cargar lugares individuales con filtros
    let query = supabase.from('lugares').select('*');

    if (category && comuna) {
        query = query.eq('categoria', category).eq('comuna', comuna);
    } else if (category) {
        query = query.eq('categoria', category);
    } else if (comuna) {
        query = query.eq('comuna', comuna);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error al cargar lugares:', error);
        return;
    }

    data.forEach(lugar => addLugarMarker(map, lugar));
}

/**
 * Carga los lugares consolidados con su contador de recomendaciones
 */
async function loadLugaresConsolidados() {
    const { data, error } = await supabase.rpc('get_lugares_consolidados_con_contador');

    if (error) {
        console.error('Error al cargar lugares consolidados:', error);
        return;
    }

    data.forEach(lugar => {
        addLugarConsolidadoMarker(map, lugar);
    });
}

/**
 * Carga solo lugares consolidados (para usar desde otras partes)
 */
export async function loadOnlyConsolidados() {
    clearMarkers();
    await loadLugaresConsolidados();
}