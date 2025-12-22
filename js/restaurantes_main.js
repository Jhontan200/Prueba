/**
 * LISTADO DE RESTAURANTES - ARQUITECTURA LIMPIA
 * Combina datos estáticos (GitHub JSON) con dinámicos (Supabase)
 */

import { restaurantService } from './services/restaurantService.js';

// --- VARIABLES PARA EL SLIDER ---
let currentHeroSlide = 0;

/**
 * 1. CARGA DE DATOS (Modernizada)
 * Ahora usamos async/await y el servicio centralizado
 */
async function loadRestaurantsData() {
    const container = document.getElementById('restaurantes-container');

    try {
        // Mostramos un loader simple mientras carga
        container.innerHTML = `<div class="col-span-full text-center py-10">Cargando experiencias gastronómicas...</div>`;

        // Llamamos al servicio (Él ya sabe ir a GitHub y luego a Supabase)
        const restaurantes = await restaurantService.getAllRestaurants();

        if (restaurantes && restaurantes.length > 0) {
            renderRestaurantCards(restaurantes);
        } else {
            throw new Error("No se encontraron restaurantes");
        }

    } catch (error) {
        console.error("Error al cargar los restaurantes:", error);
        container.innerHTML =
            `<p class="col-span-full text-center py-10">Lo sentimos, no pudimos cargar los datos. Inténtalo más tarde.</p>`;
    }
}

/**
 * 2. RENDERIZADO DE TARJETAS EN EL DOM
 * Se ha actualizado para usar los datos dinámicos (puntuacion)
 */
function renderRestaurantCards(lista) {
    const container = document.getElementById('restaurantes-container');
    if (!container) return;

    container.innerHTML = '';

    lista.forEach(res => {
        // Lógica de colores según categoría
        const badgeColor = res.categoria.includes('Mariscos') ? 'bg-blue-500' :
            res.categoria.includes('Italiana') ? 'bg-orange-600' :
                res.categoria.includes('Alta Cocina') ? 'bg-emerald-500' : 'bg-primary';

        const cardHTML = `
            <article class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div class="relative h-60 w-full overflow-hidden">
                    <img class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                         src="${res.imagenes[0]}" alt="${res.nombre}" loading="lazy" />
                    
                    <div class="absolute left-3 top-3">
                        <span class="${badgeColor} rounded-md px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                            ${res.categoria}
                        </span>
                    </div>

                    <div class="absolute right-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-900 backdrop-blur-sm dark:bg-slate-900/90 dark:text-white font-button">
                        ${res.precio}
                    </div>
                </div>
                <div class="flex flex-1 flex-col p-5">
                    <div class="flex justify-between items-center mb-1">
                        <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white">${res.nombre}</h2>
                        
                        <div class="flex items-center gap-1 text-amber-500">
                            <span class="material-symbols-outlined !text-lg fill-current">star</span>
                            <span class="text-sm font-bold">${res.puntuacion > 0 ? res.puntuacion : 'N/A'}</span>
                            <span class="text-[10px] text-slate-400">(${res.resenas_conteo})</span>
                        </div>
                    </div>

                    <div class="flex items-center text-xs text-slate-500 mb-2">
                        <span class="material-symbols-outlined !text-sm mr-1">location_on</span>
                        <span>${res.ciudad}</span>
                    </div>

                    <p class="mt-2 text-sm font-body text-slate-600 dark:text-slate-300 line-clamp-2">
                        ${res.descripcion[0]}
                    </p>

                    <a href="restaurante_detalle.html?id=${res.id}" 
                       class="mt-4 w-full text-center rounded-lg bg-primary py-2.5 text-sm font-button font-bold text-white transition-all hover:bg-opacity-90 hover:shadow-md">
                        Ver Detalles
                    </a>
                </div>
            </article>
        `;
        container.innerHTML += cardHTML;
    });
}

/**
 * 3. LÓGICA DEL HERO SLIDER
 */
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length <= 1) return;

    setInterval(() => {
        slides[currentHeroSlide].classList.replace('opacity-100', 'opacity-0');
        slides[currentHeroSlide].classList.remove('scale-110');
        currentHeroSlide = (currentHeroSlide + 1) % slides.length;
        slides[currentHeroSlide].classList.replace('opacity-0', 'opacity-100');
        slides[currentHeroSlide].classList.add('scale-110');
    }, 5000);
}

/**
 * 4. INICIO DE LA APLICACIÓN
 */
document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    loadRestaurantsData();
});