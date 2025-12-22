document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const mobileBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const logoLight = document.getElementById('logo-light');
    const logoDark = document.getElementById('logo-dark');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactBtn = document.getElementById('contact-btn');

    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    const htmlElement = document.documentElement;

    function updateThemeUI() {
        const isDark = htmlElement.classList.contains('dark');
        const iconName = isDark ? 'light_mode' : 'dark_mode';
        
        const desktopIcon = document.getElementById('theme-icon');
        const mobileIcon = document.querySelector('.theme-icon-mobile');
        
        [desktopIcon, mobileIcon].forEach(icon => {
            if (icon) {
                icon.classList.add('theme-icon-animate', 'icon-rotate');
                setTimeout(() => {
                    icon.textContent = iconName;
                    icon.classList.remove('icon-rotate');
                }, 250);
            }
        });
    }

    function toggleDarkMode() {
        htmlElement.classList.toggle('dark');
        const isDark = htmlElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeUI();
        updateHeaderStyles();
    }

    if (themeToggle) themeToggle.addEventListener('click', toggleDarkMode);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleDarkMode);

    if (localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    }
    updateThemeUI();

    function updateHeaderStyles() {
        window.requestAnimationFrame(() => {
            const isScrolled = window.scrollY > 50;
            const isMenuOpen = mobileMenu?.classList.contains('flex');
            const isDark = htmlElement.classList.contains('dark');

            header.classList.add('transition-all', 'duration-500');

            // --- 1. LÓGICA DE LOGO: BLANCO FIJO EN DARK MODE ---
            if (isDark) {
                logoLight?.classList.remove('hidden');
                logoDark?.classList.add('hidden');
            } else {
                if (isScrolled || isMenuOpen) {
                    logoLight?.classList.add('hidden');
                    logoDark?.classList.remove('hidden');
                } else {
                    logoLight?.classList.remove('hidden');
                    logoDark?.classList.add('hidden');
                }
            }

            // --- 2. FONDO DEL HEADER Y LINKS ---
            if (isScrolled || isMenuOpen) {
                header.classList.add('bg-white/95', 'dark:bg-slate-900/95', 'backdrop-blur-md', 'shadow-md', 'py-2');
                header.classList.remove('bg-transparent', 'py-4');

                navLinks.forEach(link => {
                    link.classList.remove('text-white');
                    link.classList.add('text-slate-700', 'dark:text-gray-200');
                });

                if (contactBtn) {
                    contactBtn.classList.remove('bg-white', 'text-primary');
                    contactBtn.classList.add('bg-primary', 'text-white');
                }

                // --- 3. LÓGICA DE ICONOS (MÁXIMA PRIORIDAD AL COLOR OSCURO) ---
                [themeToggle, themeToggleMobile, mobileBtn].forEach(el => {
                    if (el) {
                        if (isDark) {
                            // En modo oscuro siempre blanco
                            el.classList.add('text-white');
                            el.classList.remove('text-slate-950', 'text-gray-800');
                        } else {
                            // CORRECCIÓN FINAL MODO CLARO + SCROLL: Forzamos color oscuro nítido
                            el.classList.remove('text-white');
                            el.classList.add('text-slate-950'); // Color negro Slate muy oscuro
                        }
                    }
                });

            } else {
                // ESTADO INICIAL / TRANSPARENTE
                header.classList.add('bg-transparent', 'py-4');
                header.classList.remove('bg-white/95', 'dark:bg-slate-900/95', 'backdrop-blur-md', 'shadow-md', 'py-2');

                navLinks.forEach(link => {
                    link.classList.add('text-white');
                    link.classList.remove('text-slate-700', 'dark:text-gray-200');
                });

                if (contactBtn) {
                    contactBtn.classList.remove('bg-primary', 'text-white');
                    contactBtn.classList.add('bg-white', 'text-primary');
                }

                // Todos los iconos blancos sobre fondo transparente (hero image)
                [themeToggle, themeToggleMobile, mobileBtn].forEach(el => {
                    if (el) {
                        el.classList.add('text-white');
                        el.classList.remove('text-slate-950');
                    }
                });
            }
        });
    }

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const isOpening = mobileMenu.classList.contains('hidden');
            if (isOpening) {
                mobileMenu.classList.replace('hidden', 'flex');
                menuIcon.textContent = 'close';
                document.body.style.overflow = 'hidden';
            } else {
                mobileMenu.classList.replace('flex', 'hidden');
                menuIcon.textContent = 'menu';
                document.body.style.overflow = '';
            }
            updateHeaderStyles();
        });
    }

    window.addEventListener('scroll', updateHeaderStyles, { passive: true });
    updateHeaderStyles();
});