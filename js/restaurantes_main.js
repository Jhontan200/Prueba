/**
 * LÓGICA DEL SLIDER DE FONDO (AUTO-PLAY)
 */
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');

    // Solo se ejecuta si hay más de una imagen
    if (slides.length > 1) {
        let currentSlide = 0;
        const slideInterval = 5000; // Cambio cada 5 segundos

        function nextSlide() {
            // Quitamos visibilidad a la diapositiva actual
            slides[currentSlide].classList.replace('opacity-100', 'opacity-0');
            slides[currentSlide].classList.remove('scale-110');

            // Calculamos el índice de la siguiente
            currentSlide = (currentSlide + 1) % slides.length;

            // Mostramos la siguiente diapositiva con efecto de zoom
            slides[currentSlide].classList.replace('opacity-0', 'opacity-100');
            slides[currentSlide].classList.add('scale-110');
        }

        // Iniciamos el ciclo automático
        setInterval(nextSlide, slideInterval);
    }
});