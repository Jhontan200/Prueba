/**
 * DETALLE DE RESTAURANTE - JS UNIFICADO FINAL ELITE
 * Corrección: Actualización instantánea por input + Estrellas Pro + Zoom + Swipe + Share Estilo YouTube
 */

import { restaurantService } from './services/restaurantService.js';
import { reviewService } from './services/reviewService.js';

// --- VARIABLES GLOBALES ---
let images = [];
let currentIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
let allOpiniones = [];
let displayedCount = 3;
let isZoomed = false;
const PAGE_SIZE = 10;

// --- ELEMENTOS DEL DOM ---
const modal = document.getElementById('gallery-modal');
const mainImg = document.getElementById('main-gallery-img');
const thumbContainer = document.getElementById('thumb-container');
const openBtn = document.getElementById('btn-open-gallery');
const closeBtn = document.getElementById('close-gallery');
const nextBtn = document.getElementById('next-photo');
const prevBtn = document.getElementById('prev-photo');

const revModal = document.getElementById('review-modal');
const openRevBtn = document.getElementById('open-review-form');
const closeRevBtnX = document.getElementById('close-review-x');
const cancelRevBtn = document.getElementById('btn-cancel-review');
const closeRevOverlay = document.getElementById('close-review-overlay');
const starContainer = document.getElementById('star-rating');
const ratingInput = document.getElementById('rev-rating');
const reviewForm = document.getElementById('review-form');

// ELEMENTOS DE COMPARTIR
const btnShare = document.getElementById('btn-abrir-compartir');
const shareModal = document.getElementById('share-modal');
const closeShareX = document.getElementById('close-share-x');
const closeShareOverlay = document.getElementById('close-share-overlay');
const shareUrlInput = document.getElementById('share-url-input');
const btnCopyLink = document.getElementById('btn-copy-link');

/**
 * 1. INICIO DE LA APLICACIÓN
 */
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    const params = new URLSearchParams(window.location.search);
    const idUrl = parseInt(params.get('id')) || 1;

    try {
        const restaurante = await restaurantService.getRestaurantById(idUrl);
        if (restaurante) {
            updateDOM(restaurante);
            await renderDynamicReviews(idUrl);
            setupReviewForm(idUrl);
            initHeroSlider();
            setupGalleryZoom(); 
            setupShareLogic(); // Inicializar lógica de compartir
        } else {
            document.body.innerHTML = `<h1 class="text-center py-20 font-display text-primary">Restaurante no encontrado</h1>`;
        }
    } catch (error) {
        console.error("Error al inicializar:", error);
    }
}

/**
 * 2. ACTUALIZACIÓN DEL DOM (Info General)
 */
function updateDOM(res) {
    document.title = `${res.nombre} - Maki Catta`;
    const bcrumb = document.querySelector('li[aria-current="page"] span:last-child');
    if (bcrumb) bcrumb.textContent = res.nombre;

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

    const bgSlides = document.querySelectorAll('.hero-bg-slide');
    bgSlides.forEach((slide, index) => {
        if (res.imagenes && res.imagenes[index]) {
            slide.style.backgroundImage = `url('${res.imagenes[index]}')`;
        }
    });

    const prose = document.querySelector('.prose');
    if (prose) prose.innerHTML = res.descripcion.map(p => `<p class="mb-4 font-body">${p}</p>`).join('');

    const servicesGrid = document.getElementById('services-grid');
    if (servicesGrid) {
        servicesGrid.innerHTML = res.servicios.map(s => `
            <div class="flex items-center gap-3 text-secondary">
                <span class="material-symbols-outlined">${s.icon}</span>
                <span class="text-sm font-medium font-body">${s.label}</span>
            </div>
        `).join('');
    }

    const locContainer = document.getElementById('location');
    if (locContainer) {
        locContainer.innerHTML = res.ubicacion.iframe_mapa;
        const iframe = locContainer.querySelector('iframe');
        if (iframe) iframe.style.cssText = "width: 100%; height: 200px; border: 0; border-radius: 12px;";
    }
    document.getElementById('dir-text').textContent = res.ubicacion.direccion;

    if (res.ubicacion.horario) renderHorariosCompletos(res.ubicacion.horario);

    const platosContainer = document.getElementById('platos-container');
    if (platosContainer) {
        platosContainer.innerHTML = res.platos_destacados.map(p => `
            <div class="flex gap-4 items-start p-3 rounded-lg bg-background-light dark:bg-card-dark hover:shadow-md transition-all border border-secondary/10 group">
                <div class="w-16 h-16 shrink-0 rounded-md bg-cover bg-center shadow-sm group-hover:scale-105 transition-transform duration-300"
                    style="background-image: url('${p.img}')"></div>
                <div>
                    <h5 class="font-display font-bold text-sm text-primary dark:text-accent leading-tight">${p.nombre}</h5>
                    <p class="text-xs text-primary/60 dark:text-white/60 mt-1 font-body">${p.desc}</p>
                </div>
            </div>
        `).join('');
    }
    images = res.imagenes;
}

/**
 * 3. LÓGICA DE HORARIOS
 */
function renderHorariosCompletos(horarios) {
    const container = document.getElementById('horario-text');
    if (!container) return;
    const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const hoyIdx = new Date().getDay();
    const hoyNombre = dias[hoyIdx];
    let html = '<div class="flex flex-col gap-2 mt-2">';
    for (const dia of dias) {
        const horas = horarios[dia];
        const esHoy = dia === hoyNombre;
        let estadoLabel = "";
        let colorClase = esHoy ? "text-primary dark:text-white font-bold" : "text-secondary/60";
        if (esHoy) {
            const status = getStatus(horas);
            if (status === "closing") {
                colorClase = "text-yellow-600 dark:text-yellow-400 font-bold";
                estadoLabel = '<span class="ml-2 inline-block text-[10px] bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">• CIERRA PRONTO</span>';
            } else if (status === "closed") {
                colorClase = "text-red-600 dark:text-red-500 font-bold";
                estadoLabel = '<span class="ml-2 inline-block text-[10px] bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">• CERRADO</span>';
            } else if (status === "open") {
                colorClase = "text-green-600 dark:text-green-500 font-bold";
                estadoLabel = '<span class="ml-2 inline-block text-[10px] bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">• ABIERTO</span>';
            }
        }
        html += `<div class="flex justify-between items-center text-[13px] font-body ${colorClase}">
            <span class="capitalize min-w-[80px]">${dia}</span>
            <div class="flex items-center text-right"><span>${horas}</span>${estadoLabel}</div>
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
    return isClosingSoon ? "closing" : (isOpen ? "open" : "closed");
}

function timeToMins(timeStr) {
    const [h, m] = timeStr.trim().split(':').map(Number);
    return h * 60 + (m || 0);
}

/**
 * 4. OPINIONES - SKELETON + CARGA
 */
async function renderDynamicReviews(restaurantId, append = false) {
    const container = document.getElementById('reviews-container');
    const countSpan = document.getElementById('reviews-count');
    if (!container) return;

    const showSkeletons = (num) => {
        const skel = `<div class="flex gap-4 mb-6 pb-6 border-b border-secondary/10 last:border-0">
            <div class="size-10 rounded-full skeleton shrink-0"></div>
            <div class="flex-1">
                <div class="flex justify-between mb-2">
                    <div class="h-4 w-24 skeleton rounded"></div>
                    <div class="h-3 w-16 skeleton rounded"></div>
                </div>
                <div class="h-4 w-20 skeleton rounded mb-3"></div>
                <div class="h-3 w-full skeleton rounded"></div>
            </div>
        </div>`.repeat(num);
        if (append) container.insertAdjacentHTML('beforeend', `<div id="temp-skel">${skel}</div>`);
        else container.innerHTML = skel;
    };

    try {
        if (!append) {
            showSkeletons(3);
            allOpiniones = await reviewService.getReviewsByRestaurant(restaurantId);
            if (countSpan) countSpan.textContent = allOpiniones.length;
            displayedCount = 3;
        } else { showSkeletons(4); }

        await new Promise(r => setTimeout(r, 600));
        const oldSkel = document.getElementById('temp-skel');
        if (oldSkel) oldSkel.remove();

        if (allOpiniones.length === 0) {
            container.innerHTML = '<p class="text-secondary/50 italic py-10 text-center">Sé el primero en opinar.</p>';
            return;
        }

        const fragmento = allOpiniones.slice(0, displayedCount);
        container.innerHTML = fragmento.map((op, index) => {
            const stars = Array.from({ length: 5 }, (_, i) => {
                const fullStars = Math.floor(op.puntuacion);
                const hasPartial = op.puntuacion % 1 !== 0 && i === fullStars;
                let style = "";
                if (i < fullStars) style = "font-variation-settings: 'FILL' 1; color: #FBBF24;";
                else if (hasPartial) {
                    const percent = (op.puntuacion % 1) * 100;
                    style = `background: linear-gradient(90deg, #FBBF24 ${percent}%, #CBD5E1 ${percent}%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-variation-settings: 'FILL' 1;`;
                } else style = "font-variation-settings: 'FILL' 0; color: #CBD5E1;";
                return `<span class="material-symbols-outlined text-[18px]" style="${style}">star</span>`;
            }).join('');

            return `<div class="flex gap-4 mb-6 pb-6 border-b border-secondary/10 last:border-0 animate-fadeInUp" style="animation-delay: ${index * 0.05}s">
                <div class="size-10 rounded-full bg-accent/20 shrink-0" style="background-image: url('https://ui-avatars.com/api/?name=${encodeURIComponent(op.usuario)}&background=random'); background-size: cover;"></div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-primary dark:text-white text-sm font-display">${op.usuario}</span>
                        <span class="text-secondary/50 text-[10px] font-body">${new Date(op.fecha).toLocaleDateString()}</span>
                    </div>
                    <div class="flex mb-2">${stars}</div>
                    <p class="text-primary/80 dark:text-white/80 text-sm italic font-body">"${op.comentario}"</p>
                </div>
            </div>`;
        }).join('');

        renderReviewButtons(restaurantId);
    } catch (e) { console.error(e); }
}

function renderReviewButtons(restaurantId) {
    let navContainer = document.getElementById('reviews-nav-container');
    if (!navContainer) {
        navContainer = document.createElement('div');
        navContainer.id = 'reviews-nav-container';
        navContainer.className = 'flex flex-col gap-4 mt-6 items-center w-full';
        document.getElementById('reviews-container').after(navContainer);
    }
    navContainer.innerHTML = '';
    if (displayedCount > 3) {
        const btnLess = document.createElement('button');
        btnLess.className = 'w-max px-4 py-1 text-secondary/60 text-xs font-medium hover:text-primary transition-all flex items-center gap-1 order-1';
        btnLess.innerHTML = '<span class="material-symbols-outlined text-sm">keyboard_arrow_up</span> Ocultar opiniones';
        btnLess.onclick = () => {
            displayedCount = 3;
            renderDynamicReviews(restaurantId, false);
            document.getElementById('reviews-section-title')?.scrollIntoView({ behavior: 'smooth' });
        };
        navContainer.appendChild(btnLess);
    }
    if (displayedCount < allOpiniones.length) {
        const btnMore = document.createElement('button');
        btnMore.className = 'w-full py-3.5 px-6 rounded-xl bg-primary text-white font-button font-bold text-sm shadow-lg hover:opacity-95 transition-all active:scale-[0.98] order-2';
        btnMore.textContent = displayedCount === 3 ? "Ver todas las opiniones" : "Cargar más opiniones";
        btnMore.onclick = () => {
            displayedCount = (displayedCount === 3) ? PAGE_SIZE : (displayedCount + PAGE_SIZE);
            renderDynamicReviews(restaurantId, true);
        };
        navContainer.appendChild(btnMore);
    }
}

/**
 * 5. MODAL DE OPINIONES - ESTRELLAS PROFESIONALES
 */
function setupReviewForm(restaurantId) {
    if (!reviewForm) return;

    const renderStars = (val) => {
        const stars = starContainer.querySelectorAll('span');
        stars.forEach(s => {
            const sVal = parseFloat(s.getAttribute('data-value'));
            s.style.cssText = "color: #CBD5E1; font-variation-settings: 'FILL' 0; cursor: pointer !important; user-select: none;";
            
            if (sVal <= val) {
                s.style.color = "#FBBF24";
                s.style.fontVariationSettings = "'FILL' 1";
            } else if (sVal - 1 < val) {
                const p = (val - (sVal - 1)) * 100;
                s.style.background = `linear-gradient(90deg, #FBBF24 ${p}%, #CBD5E1 ${p}%)`;
                s.style.webkitBackgroundClip = "text";
                s.style.webkitTextFillColor = "transparent";
                s.style.fontVariationSettings = "'FILL' 1";
            }
        });
    };

    ratingInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0;
        if (val > 5) { val = 5; e.target.value = 5; }
        if (val < 0) { val = 0; e.target.value = 0; }
        renderStars(val);
    });

    const stars = starContainer.querySelectorAll('span');
    stars.forEach(star => {
        const getVal = (e) => {
            const r = star.getBoundingClientRect();
            const x = e.clientX - r.left;
            return Math.min(Math.max(parseFloat(star.dataset.value) - 1 + (Math.ceil((x / r.width) * 4) / 4), 0), 5);
        };
        star.onclick = (e) => { 
            const val = getVal(e);
            ratingInput.value = val; 
            renderStars(val); 
        };
        star.onmousemove = (e) => renderStars(getVal(e));
    });
    
    starContainer.onmouseleave = () => renderStars(parseFloat(ratingInput.value) || 0);
    
    if (openRevBtn) {
        openRevBtn.onclick = () => { 
            revModal.classList.remove('hidden'); 
            document.body.style.overflow = 'hidden'; 
            setTimeout(() => renderStars(parseFloat(ratingInput.value) || 5), 10); 
        };
    }
    
    const closeForm = () => { 
        reviewForm.reset(); 
        ratingInput.value = "5"; 
        renderStars(5); 
        revModal.classList.add('hidden'); 
        document.body.style.overflow = ''; 
    };
    
    [closeRevBtnX, cancelRevBtn, closeRevOverlay].forEach(b => { if (b) b.onclick = closeForm; });
    
    reviewForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = reviewForm.querySelector('button[type="submit"]');
        const oldText = btn.innerHTML;
        btn.disabled = true; btn.innerHTML = "Publicando...";
        try {
            await reviewService.createReview({
                restaurante_id: restaurantId,
                usuario: document.getElementById('rev-name').value,
                puntuacion: parseFloat(ratingInput.value),
                comentario: document.getElementById('rev-comment').value,
                fecha: new Date().toISOString()
            });
            closeForm(); await renderDynamicReviews(restaurantId, false);
        } catch (err) { alert("Error al publicar."); }
        finally { btn.disabled = false; btn.innerHTML = oldText; }
    };
}

/**
 * 6. GALERÍA + ZOOM + TÁCTIL
 */
function setupGalleryZoom() {
    if (!mainImg) return;
    const container = mainImg.parentElement;
    container.style.cursor = "zoom-in";

    const toggleZoom = (e) => {
        isZoomed = !isZoomed;
        container.classList.toggle('zoomed', isZoomed);
        container.style.cursor = isZoomed ? "zoom-out" : "zoom-in";
        if (!isZoomed) mainImg.style.transform = '';
    };

    const handleMove = (e) => {
        if (!isZoomed) return;
        const rect = container.getBoundingClientRect();
        const clientX = e.clientX || e.touches?.[0].clientX;
        const clientY = e.clientY || e.touches?.[0].clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        mainImg.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
    };

    container.addEventListener('click', toggleZoom);
    container.addEventListener('mousemove', handleMove);
    container.addEventListener('touchmove', handleMove, { passive: true });
}

function initThumbs() {
    if (!thumbContainer) return;
    thumbContainer.innerHTML = '';
    images.forEach((src, index) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.className = `w-24 h-16 shrink-0 object-cover rounded-md cursor-pointer transition-all border-2 ${index === currentIndex ? 'border-accent scale-105 opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`;
        thumb.onclick = () => { 
            isZoomed = false; 
            const container = mainImg.parentElement;
            container.classList.remove('zoomed'); 
            container.style.cursor = "zoom-in";
            updateGallery(index); 
        };
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

if (openBtn) openBtn.onclick = () => { modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; updateGallery(0); };
if (closeBtn) closeBtn.onclick = () => { modal.classList.add('hidden'); document.body.style.overflow = ''; isZoomed = false; };
if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); isZoomed = false; updateGallery(currentIndex + 1); };
if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); isZoomed = false; updateGallery(currentIndex - 1); };

if (modal) {
    modal.addEventListener('touchstart', e => { if (!isZoomed) touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    modal.addEventListener('touchend', e => {
        if (isZoomed) return;
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) updateGallery(currentIndex + 1);
        if (touchEndX - touchStartX > 50) updateGallery(currentIndex - 1);
    }, { passive: true });
}

window.addEventListener('keydown', (e) => {
    if (modal && !modal.classList.contains('hidden')) {
        if (e.key === "Escape") closeBtn.click();
        if (e.key === "ArrowRight") updateGallery(currentIndex + 1);
        if (e.key === "ArrowLeft") updateGallery(currentIndex - 1);
    }
});

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-bg-slide');
    if (slides.length < 2) return;
    let idx = 0;
    setInterval(() => {
        slides[idx].classList.replace('opacity-100', 'opacity-0');
        idx = (idx + 1) % slides.length;
        slides[idx].classList.replace('opacity-0', 'opacity-100');
    }, 6000);
}

/**
 * 7. LÓGICA DE COMPARTIR ESTILO YOUTUBE
 */
function setupShareLogic() {
    if (btnShare) {
        btnShare.onclick = () => {
            const url = window.location.href;
            const restaurantName = document.querySelector('h1').textContent;
            const text = `Echa un vistazo a ${restaurantName} en Maki Catta`;
            
            // Configurar enlaces sociales
            const whatsapp = document.getElementById('share-whatsapp');
            const facebook = document.getElementById('share-facebook');
            const xTwitter = document.getElementById('share-x');
            const email = document.getElementById('share-email');

            if (whatsapp) whatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`;
            if (facebook) facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            if (xTwitter) xTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            if (email) email.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
            
            if (shareUrlInput) shareUrlInput.value = url;
            if (shareModal) {
                shareModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        };
    }

    const closeShare = () => {
        if (shareModal) {
            shareModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    };

    [closeShareX, closeShareOverlay].forEach(b => b && (b.onclick = closeShare));

    if (btnCopyLink && shareUrlInput) {
        btnCopyLink.onclick = () => {
            shareUrlInput.select();
            navigator.clipboard.writeText(shareUrlInput.value);
            const originalText = btnCopyLink.textContent;
            btnCopyLink.textContent = "¡Copiado!";
            btnCopyLink.classList.add('bg-green-600');
            btnCopyLink.classList.remove('bg-primary');
            
            setTimeout(() => {
                btnCopyLink.textContent = originalText;
                btnCopyLink.classList.remove('bg-green-600');
                btnCopyLink.classList.add('bg-primary');
            }, 2000);
        };
    }
}