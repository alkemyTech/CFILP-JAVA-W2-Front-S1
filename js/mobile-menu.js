document.addEventListener('DOMContentLoaded', function () {
    // Detectar qué menú mostrar según la página actual
    const isAdminPage = window.location.pathname.includes('admin');
    const userMenu = document.querySelector('.user-menu');
    const adminMenu = document.querySelector('.admin-menu');

    if (isAdminPage) {
        userMenu.style.display = 'none';
        adminMenu.style.display = 'block';
    } else {
        userMenu.style.display = 'block';
        adminMenu.style.display = 'none';
    }

    // Manejar clics en los ítems del menú
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            // Remover clase active de todos los ítems
            menuItems.forEach(i => i.classList.remove('active'));

            // Agregar clase active al ítem clickeado
            this.classList.add('active');

            // Si tiene un href con hash, manejar la navegación
            const href = this.getAttribute('href');
            if (href && href.startsWith('#') && href !== '#') {
                e.preventDefault();

                // Ocultar todas las secciones
                document.querySelectorAll('section[id]').forEach(section => {
                    section.style.display = 'none';
                });

                // Mostrar la sección correspondiente
                const sectionId = href.substring(1);
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.style.display = 'block';

                    // Scroll al inicio de la sección
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Detectar la sección actual basada en el hash de la URL
    function updateActiveMenuItem() {
        const hash = window.location.hash || '#';

        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === hash) {
                item.classList.add('active');
            }
        });

        // Si no hay hash o no coincide con ningún ítem, activar el primero
        if (hash === '#' || !document.querySelector(`.menu-item[href="${hash}"]`)) {
            const firstMenuItem = document.querySelector('.mobile-menu .menu-item');
            if (firstMenuItem) {
                firstMenuItem.classList.add('active');
            }
        }
    }

    // Actualizar el ítem activo cuando cambia el hash
    window.addEventListener('hashchange', updateActiveMenuItem);

    // Inicializar el ítem activo
    updateActiveMenuItem();

    // Efecto de ripple al hacer clic
    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Asegurar que el menú permanezca visible incluso cuando se muestra el teclado virtual
    const originalHeight = window.innerHeight
    window.addEventListener("resize", () => {
        // Si la altura de la ventana cambia significativamente (teclado virtual)
        if (window.innerHeight < originalHeight * 0.75) {
            // Ocultar temporalmente el menú mientras el teclado está visible
            document.querySelector(".mobile-menu-container").style.transform = "translateY(100%)"
        } else {
            // Mostrar el menú cuando el teclado se oculta
            document.querySelector(".mobile-menu-container").style.transform = "translateY(0)"
        }
    })

    // Agregar clase al body para aplicar estilos específicos
    document.body.classList.add("has-mobile-menu")
});