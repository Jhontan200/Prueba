document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const mobileBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const logoLight = document.getElementById('logo-light');
    const logoDark = document.getElementById('logo-dark');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactBtn = document.getElementById('contact-btn');

    /**
     * LÓGICA DEL MENÚ MÓVIL
     */
    function openMenu() {
        mobileMenu?.classList.replace('hidden', 'flex');
        menuIcon.textContent = 'close';
        document.body.style.overflow = 'hidden';
        updateHeaderStyles(); // Actualiza logos y colores al abrir
    }

    function closeMenu() {
        mobileMenu?.classList.replace('flex', 'hidden');
        menuIcon.textContent = 'menu';
        document.body.style.overflow = '';
        updateHeaderStyles(); // Restaura logos y colores al cerrar
    }

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const isOpening = mobileMenu.classList.contains('hidden');
            isOpening ? openMenu() : closeMenu();
        });

        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    /**
     * SOLUCIÓN AL CAMBIO DE PANTALLA
     * Si la pantalla crece más allá de 768px (o tu breakpoint de desktop),
     * cerramos el menú automáticamente.
     */
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) { // Ajusta 768 al breakpoint de tu CSS (lg, md, etc)
            if (mobileMenu?.classList.contains('flex')) {
                closeMenu();
            }
        }
    });

    /**
     * LÓGICA DE SCROLL Y ESTILOS
     */
    function updateHeaderStyles() {
        window.requestAnimationFrame(() => {
            const isScrolled = window.scrollY > 50;
            const isMenuOpen = mobileMenu?.classList.contains('flex');

            if (isScrolled || isMenuOpen) {
                header.classList.add('bg-white/95', 'dark:bg-background-dark/95', 'backdrop-blur-md', 'shadow-md', 'py-2');
                header.classList.remove('bg-transparent', 'py-4');

                logoLight?.classList.add('hidden');
                logoDark?.classList.remove('hidden');

                navLinks.forEach(link => {
                    link.classList.remove('text-white');
                    link.classList.add('text-gray-600', 'dark:text-gray-200');
                });

                if (contactBtn) {
                    contactBtn.classList.remove('bg-white', 'text-primary');
                    contactBtn.classList.add('bg-primary', 'text-white');
                }

                mobileBtn?.classList.remove('text-white');
                mobileBtn?.classList.add('text-primary');

            } else {
                header.classList.add('bg-transparent', 'py-4');
                header.classList.remove('bg-white/95', 'dark:bg-background-dark/95', 'backdrop-blur-md', 'shadow-md', 'py-2');

                logoLight?.classList.remove('hidden');
                logoDark?.classList.add('hidden');

                navLinks.forEach(link => {
                    link.classList.add('text-white');
                    link.classList.remove('text-gray-600', 'dark:text-gray-200');
                });

                if (contactBtn) {
                    contactBtn.classList.remove('bg-primary', 'text-white');
                    contactBtn.classList.add('bg-white', 'text-primary');
                }

                mobileBtn?.classList.remove('text-primary');
                mobileBtn?.classList.add('text-white');
            }
        });
    }

    window.addEventListener('scroll', updateHeaderStyles, { passive: true });
    updateHeaderStyles();
});