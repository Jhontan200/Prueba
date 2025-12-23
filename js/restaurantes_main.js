import { restaurantService } from './services/restaurantService.js';

// Variables de estado
let currentHeroSlide = 0;
let isDataLoaded = false;

/**
 * Inicialización principal
 */
document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    loadRestaurantsData();
});

/**
 * Carga los datos desde el servicio y gestiona el estado de la UI
 */
async function loadRestaurantsData() {
    const container = document.getElementById('restaurantes-container');
    if (!container) return;

    // 1. Mostrar Skeletons (Evita el CLS y mejora la percepción de velocidad)
    renderSkeletons(container);

    try {
        const restaurantes = await restaurantService.getAllRestaurants();

        if (restaurantes && restaurantes.length > 0) {
            renderRestaurantCards(container, restaurantes);
            isDataLoaded = true;
        } else {
            container.innerHTML = `<p class="col-span-full text-center py-10">No se encontraron restaurantes disponibles.</p>`;
        }
    } catch (error) {
        console.error("Error en loadRestaurantsData:", error);
        container.innerHTML = `<p class="col-span-full text-center py-10 text-red-500">Error al conectar con la base de datos.</p>`;
    }
}

/**
 * Renderiza los esqueletos de carga
 */
function renderSkeletons(container) {
    container.innerHTML = Array(3).fill(0).map(() => `
        <div class="animate-pulse bg-white dark:bg-slate-900 rounded-xl h-[480px] border border-slate-200 dark:border-slate-800">
            <div class="h-60 bg-slate-200 dark:bg-slate-700 rounded-t-xl"></div>
            <div class="p-5 space-y-4">
                <div class="flex justify-between"><div class="h-6 bg-slate-200 dark:bg-slate-700 w-1/2 rounded"></div><div class="h-6 bg-slate-200 dark:bg-slate-700 w-10 rounded"></div></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-700 w-full rounded"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-700 w-2/3 rounded"></div>
                <div class="h-10 bg-slate-200 dark:bg-slate-700 w-full rounded mt-4"></div>
            </div>
        </div>
    `).join('');
}

/**
 * Renderiza las tarjetas reales con los datos de Supabase
 */
function renderRestaurantCards(container, lista) {
    const htmlContent = lista.map((res, index) => {
        // OPTIMIZACIÓN LCP: Solo las 2 primeras imágenes cargan con prioridad alta
        const isCritical = index < 2;

        // Ajustamos width/height según lo que Lighthouse detectó (aprox 772x480) 
        // para eliminar la alerta de "Image size vs display size" sin tocar el archivo real.
        return `
            <article class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div class="relative h-60 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img 
                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src="${res.imagenes[0]}" 
                        alt="Restaurante ${res.nombre}" 
                        width="772" 
                        height="480"
                        loading="${isCritical ? 'eager' : 'lazy'}"
                        decoding="async"
                        ${isCritical ? 'fetchpriority="high"' : ''}
                    />
                    <div class="absolute top-4 left-4">
                        <span class="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                            ${res.categoria || 'Gastronomía'}
                        </span>
                    </div>
                </div>

                <div class="flex flex-1 flex-col p-5">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-display font-bold text-slate-900 dark:text-white leading-tight">
                            ${res.nombre}
                        </h3>
                        <div class="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg">
                            <span class="material-symbols-outlined !text-base fill-current" style="font-variation-settings: 'FILL' 1">star</span>
                            <span class="text-sm font-bold">${res.puntuacion || '5.0'}</span>
                        </div>
                    </div>

                    <div class="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-3">
                        <span class="material-symbols-outlined !text-sm">location_on</span>
                        <span class="text-xs font-medium">${res.ubicacion || 'Madagascar'}</span>
                    </div>

                    <p class="text-sm text-gray-600 dark:text-gray-400 font-body line-clamp-2 mb-4">
                        ${res.descripcion && res.descripcion[0] ? res.descripcion[0] : 'Disfruta de una experiencia culinaria única en el corazón de Madagascar.'}
                    </p>

                    <div class="mt-auto">
                        <a href="restaurante_detalle.html?id=${res.id}" 
                           class="block w-full text-center rounded-lg bg-primary py-3 text-sm font-bold text-white hover:brightness-110 transition-all shadow-md active:scale-[0.98]"
                           aria-label="Ver detalles de ${res.nombre}">
                            Ver Detalles
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    container.innerHTML = htmlContent;
}

/**
 * Control del Slider del Hero
 */
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length <= 1) return;

    setInterval(() => {
        // Evita que el slider consuma recursos si el usuario no está viendo la pestaña
        if (document.hidden) return;

        slides[currentHeroSlide].classList.remove('active', 'scale-110');
        currentHeroSlide = (currentHeroSlide + 1) % slides.length;
        slides[currentHeroSlide].classList.add('active', 'scale-110');
    }, 5000);
}