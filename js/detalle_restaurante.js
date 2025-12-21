/**
 * DETALLE DE RESTAURANTE - JS COMPLETO
 * Consumo de JSON + Horarios Dinámicos + Iframe Maps + Galería Pro (Teclado + Swipe)
 */

// --- VARIABLES GLOBALES PARA LA GALERÍA ---
let images = [];
let currentIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

// --- ELEMENTOS DEL DOM ---
const modal = document.getElementById('gallery-modal');
const mainImg = document.getElementById('main-gallery-img');
const thumbContainer = document.getElementById('thumb-container');
const openBtn = document.getElementById('btn-open-gallery');
const closeBtn = document.getElementById('close-gallery');
const nextBtn = document.getElementById('next-photo');
const prevBtn = document.getElementById('prev-photo');

/**
 * 1. CARGA DE DATOS (XMLHttpRequest)
 */
function loadData() {
    const requestURL = 'https://raw.githubusercontent.com/Jhontan200/Prueba/main/json/restaurantes.json';
    const request = new XMLHttpRequest();

    request.open("GET", requestURL);
    request.responseType = "json";
    request.send();

    request.onload = function () {
        if (request.status === 200) {
            const data = request.response;
            if (data) {
                const params = new URLSearchParams(window.location.search);
                const idUrl = parseInt(params.get('id')) || 1;
                const restaurante = data.find(item => item.id === idUrl);

                if (restaurante) {
                    updateDOM(restaurante);
                } else {
                    console.error("Restaurante no encontrado ID:", idUrl);
                }
            }
        }
    };
}

/**
 * 2. ACTUALIZACIÓN DEL DOM
 */
function updateDOM(res) {
    // Título y Breadcrumb
    document.title = `${res.nombre} - Maki Catta`;
    const bcrumb = document.querySelector('li[aria-current="page"] span:last-child');
    if (bcrumb) bcrumb.textContent = res.nombre;

    // Hero Section
    document.querySelector('h1').textContent = res.nombre;
    const heroInfo = document.getElementById('hero-info');
    if (heroInfo) {
        heroInfo.innerHTML = `
            <span class="inline-flex items-center gap-1 text-[#FBBF24] font-bold">
                <span class="material-symbols-outlined fill-current text-[20px]">star</span>${res.puntuacion} (${res.resenas_conteo} reseñas)
            </span>
            <span class="text-white/40">•</span><span>${res.categoria}</span>
            <span class="text-white/40">•</span><span>${res.precio}</span>
            <span class="text-white/40">•</span><a class="underline decoration-white/50 underline-offset-4 hover:text-white" href="#location">${res.ciudad}, ${res.pais}</a>
        `;
    }

    // Slider de Fondo (Hero)
    // Actualizar fondos del Hero Slider de forma segura
    const bgSlides = document.querySelectorAll('.hero-bg-slide');
    bgSlides.forEach((slide, index) => {
        if (res.imagenes && res.imagenes[index]) {
            slide.style.backgroundImage = `url('${res.imagenes[index]}')`;
        }
    });
    // Descripción
    const prose = document.querySelector('.prose');
    if (prose) {
        prose.innerHTML = res.descripcion.map(p => `<p class="mb-4">${p}</p>`).join('');
    }

    // Servicios
    const servicesGrid = document.getElementById('services-grid');
    if (servicesGrid) {
        servicesGrid.innerHTML = res.servicios.map(s => `
            <div class="flex items-center gap-3 text-secondary">
                <span class="material-symbols-outlined">${s.icon}</span>
                <span class="text-sm font-medium">${s.label}</span>
            </div>
        `).join('');
    }

    // --- UBICACIÓN (MAPA IFRAME) ---
    const locContainer = document.getElementById('location');
    if (locContainer) {
        locContainer.innerHTML = res.ubicacion.iframe_mapa;
        const iframe = locContainer.querySelector('iframe');
        if (iframe) {
            iframe.style.width = "100%";
            iframe.style.height = "200px";
            iframe.style.border = "0";
            iframe.style.borderRadius = "12px";
        }
    }
    document.getElementById('dir-text').textContent = res.ubicacion.direccion;

    // --- HORARIO DINÁMICO (LLAMADA A NUEVA FUNCIÓN) ---
    if (res.ubicacion.horario) {
        renderHorariosCompletos(res.ubicacion.horario);
    }

    // Platos Destacados
    const platosContainer = document.getElementById('platos-container');
    if (platosContainer) {
        platosContainer.innerHTML = res.platos_destacados.map(p => `
            <div class="flex gap-4 items-start p-3 rounded-lg bg-background-light dark:bg-card-dark hover:shadow-md transition-all border border-secondary/10 group">
                <div class="w-16 h-16 shrink-0 rounded-md bg-cover bg-center shadow-sm group-hover:scale-105 transition-transform duration-300"
                    style="background-image: url('${p.img}')"></div>
                <div>
                    <h5 class="font-display font-bold text-sm text-primary dark:text-accent leading-tight">${p.nombre}</h5>
                    <p class="text-xs text-primary/60 dark:text-white/60 mt-1">${p.desc}</p>
                </div>
            </div>
        `).join('');
    }

    // Opiniones
    if (res.opiniones) cargarOpiniones(res.opiniones);

    // Guardar imágenes para la galería
    images = res.imagenes;
}

/**
 * 3. FUNCIONES DE HORARIOS (Lógica Agregada)
 */
function renderHorariosCompletos(horarios) {
    const container = document.getElementById('horario-text');
    if (!container) return;

    const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const hoyIdx = new Date().getDay();
    const hoyNombre = dias[hoyIdx];

    let html = '<div class="flex flex-col gap-2 mt-2">'; // Aumentado el gap a 2

    for (const dia of dias) {
        const horas = horarios[dia];
        const esHoy = dia === hoyNombre;

        let estadoLabel = "";
        let colorClase = esHoy ? "text-primary dark:text-white font-bold" : "text-secondary/60";

        if (esHoy) {
            const status = getStatus(horas);
            if (status === "closing") {
                colorClase = "text-yellow-600 dark:text-yellow-400 font-bold";
                estadoLabel = '<span class="ml-2 inline-block">• CIERRA PRONTO</span>';
            } else if (status === "closed") {
                colorClase = "text-red-600 dark:text-red-500 font-bold";
                estadoLabel = '<span class="ml-2 inline-block">• CERRADO AHORA</span>';
            } else if (status === "open") {
                colorClase = "text-green-600 dark:text-green-500 font-bold";
                estadoLabel = '<span class="ml-2 inline-block">• ABIERTO AHORA</span>';
            }
        }

        // Estructura mejorada con Flexbox
        html += `
            <div class="flex justify-between items-center text-[13px] ${colorClase}">
                <span class="capitalize min-w-[80px]">${dia}</span>
                <div class="flex items-center text-right">
                    <span>${horas}</span>
                    ${estadoLabel}
                </div>
            </div>`;
    }
    container.innerHTML = html + '</div>';
}
function getStatus(rango) {
    if (!rango || rango.toLowerCase() === "cerrado") return "closed";

    const ahora = new Date();
    const minActual = ahora.getHours() * 60 + ahora.getMinutes();
    const turnos = rango.split(',');
    let isOpen = false;
    let isClosingSoon = false;

    turnos.forEach(t => {
        const partes = t.split('-');
        if (partes.length < 2) return;

        const inicio = timeToMins(partes[0]);
        const fin = timeToMins(partes[1]);

        if (minActual >= inicio && minActual < fin) {
            isOpen = true;
            if (fin - minActual <= 30) isClosingSoon = true;
        }
    });

    if (isClosingSoon) return "closing";
    return isOpen ? "open" : "closed";
}

function timeToMins(timeStr) {
    const [h, m] = timeStr.trim().split(':').map(Number);
    return h * 60 + (m || 0);
}

/**
 * 4. RENDERIZADO DE OPINIONES
 */
function cargarOpiniones(opiniones) {
    const container = document.getElementById('reviews-container');
    const countSpan = document.getElementById('reviews-count');

    if (!container) return;
    if (countSpan) countSpan.textContent = opiniones.length;

    container.innerHTML = opiniones.map(op => {
        let estrellasHTML = '';
        for (let i = 1; i <= 5; i++) {
            const isFilled = i <= op.puntuacion;
            estrellasHTML += `
                <span class="material-symbols-outlined text-[18px]" 
                      style="font-variation-settings: 'FILL' ${isFilled ? 1 : 0}; 
                             color: ${isFilled ? '#D97706' : '#CBD5E1'};">
                    star
                </span>`;
        }

        const userAvatar = op.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(op.usuario)}&background=random`;

        return `
            <div class="flex gap-4 mb-6 pb-6 border-b border-secondary/10 last:border-0 last:mb-0 last:pb-0">
                <div class="flex-shrink-0 size-10 rounded-full bg-accent/30 bg-center bg-cover" 
                     style="background-image: url('${userAvatar}');"></div>
                <div class="font-body flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-primary dark:text-white">${op.usuario}</span>
                        <span class="text-secondary/50 text-xs">${op.fecha || 'Reciente'}</span>
                    </div>
                    <div class="flex mb-2">${estrellasHTML}</div>
                    <p class="text-primary/80 dark:text-white/80 text-sm italic">"${op.comentario}"</p>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 5. LÓGICA DE GALERÍA MODAL
 */
function initThumbs() {
    if (!thumbContainer) return;
    thumbContainer.innerHTML = '';

    images.forEach((src, index) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.className = `w-24 h-16 shrink-0 object-cover rounded-md cursor-pointer transition-all border-2 ${index === currentIndex
            ? 'border-accent scale-105 opacity-100'
            : 'border-transparent opacity-40 hover:opacity-100'
            }`;
        thumb.onclick = () => updateGallery(index);
        thumbContainer.appendChild(thumb);
    });

    const active = thumbContainer.children[currentIndex];
    if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center' });
}

function updateGallery(index) {
    if (!images.length) return;
    currentIndex = (index + images.length) % images.length;

    mainImg.style.opacity = '0';
    setTimeout(() => {
        mainImg.src = images[currentIndex];
        mainImg.style.opacity = '1';
        initThumbs();
    }, 150);
}

// --- EVENTOS DE BOTONES ---
if (openBtn) {
    openBtn.onclick = () => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        updateGallery(0);
    };
}

if (closeBtn) {
    closeBtn.onclick = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };
}

if (nextBtn) {
    nextBtn.onclick = (e) => {
        e.stopPropagation();
        updateGallery(currentIndex + 1);
    };
}

if (prevBtn) {
    prevBtn.onclick = (e) => {
        e.stopPropagation();
        updateGallery(currentIndex - 1);
    };
}

// --- SOPORTE SWIPE (TÁCTIL) ---
if (modal) {
    modal.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) updateGallery(currentIndex + 1);
        if (touchEndX - touchStartX > 50) updateGallery(currentIndex - 1);
    }, { passive: true });
}

// --- NAVEGACIÓN POR TECLADO ---
window.addEventListener('keydown', (e) => {
    if (modal && !modal.classList.contains('hidden')) {
        if (e.key === "Escape") closeBtn.click();
        if (e.key === "ArrowRight") updateGallery(currentIndex + 1);
        if (e.key === "ArrowLeft") updateGallery(currentIndex - 1);
    }
});

// --- ARRANCAR APLICACIÓN ---
loadData();