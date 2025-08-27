import { supabase } from './supabaseClient.js';

// Modal original para lugares individuales
export async function populateModal(lugar) {
    let selectedRating = null;

    const ratings = lugar.ratings || [];
    const suma = ratings.reduce((acc, r) => acc + r.rating, 0);
    const promedio = ratings.length ? (suma / ratings.length).toFixed(1) : 'Sin votos';

    document.getElementById('modal-titulo').innerText = lugar.lugar;
    document.getElementById('modal-categoria').innerText = lugar.categoria;
    document.getElementById('modal-direccion').innerText = lugar.formatted_address ?? lugar.comuna;

    // Resto del código de ratings...
}

// Nueva función para lugares consolidados
export async function populateConsolidadoModal(lugar) {
    document.getElementById('modal-titulo').innerText = lugar.ultimo_nombre || 'Lugar Popular';
    document.getElementById('modal-categoria').innerText = lugar.ultima_categoria || 'Varios';
    document.getElementById('modal-direccion').innerText = lugar.formatted_address;

    // Crear sección especial para mostrar las estadísticas
    const statsContainer = document.querySelector('.modal-body .info-row');
    if (statsContainer) {
        // Añadir nueva fila con estadísticas
        const statsRow = document.createElement('div');
        statsRow.className = 'info-row mt-3';
        statsRow.innerHTML = `
            <div class="info-box" style="background-color: #28a745; color: white;">
                <div class="text-center">
                    <div style="font-size: 2.5rem; font-weight: bold;">${lugar.total_registros}</div>
                    <div style="font-size: 1rem;">Recomendaciones</div>
                </div>
            </div>
            <div class="info-box" style="background-color: #17a2b8; color: white;">
                <div class="text-center">
                    <div style="font-size: 1.2rem; font-weight: bold;">🔥 Lugar Popular</div>
                    <div style="font-size: 0.9rem;">Recomendado por múltiples usuarios</div>
                </div>
            </div>
        `;

        statsContainer.parentNode.insertBefore(statsRow, statsContainer.nextSibling);
    }

    // Cargar los registros individuales que formaron este lugar consolidado
    await loadRegistrosOriginales(lugar.id);
}

/**
 * Carga y muestra los registros originales que formaron el lugar consolidado
 */
async function loadRegistrosOriginales(consolidadoId) {
    const { data: registros, error } = await supabase
        .from('lugares')
        .select('lugar, categoria, comuna, created_at')
        .eq('lugar_consolidado_id', consolidadoId) // Asumiendo que tienes esta relación
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error cargando registros originales:', error);
        return;
    }

    if (registros && registros.length > 0) {
        const registrosContainer = document.createElement('div');
        registrosContainer.className = 'registros-originales mt-4';
        registrosContainer.innerHTML = `
            <h6 class="text-white mb-3">🔍 Últimas recomendaciones:</h6>
            <div class="registros-list">
                ${registros.map(r => `
                    <div class="registro-item" style="
                        background-color: #333; 
                        padding: 0.75rem; 
                        margin-bottom: 0.5rem; 
                        border-radius: 8px;
                        border-left: 4px solid #ffcc05;
                    ">
                        <div style="font-weight: bold; color: #ffcc05;">${r.lugar}</div>
                        <small style="color: #ccc;">
                            ${r.categoria} • ${r.comuna} • ${new Date(r.created_at).toLocaleDateString()}
                        </small>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelector('.modal-body').appendChild(registrosContainer);
    }
}

/**
 * Limpia el modal antes de mostrar nuevo contenido
 */
export function clearModal() {
    // Remover elementos dinámicos añadidos anteriormente
    const dynamicElements = document.querySelectorAll('.registros-originales, .info-row:not(:first-child)');
    dynamicElements.forEach(el => el.remove());}
