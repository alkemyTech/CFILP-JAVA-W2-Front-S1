document.addEventListener('DOMContentLoaded', function () {
    const menuLinks = document.querySelectorAll('.sidebar-menu .menu-link');

    menuLinks.forEach(link => {
        link.addEventListener('click', function () {
        menuLinks.forEach(el => el.classList.remove('active'));

        this.classList.add('active');
        });
    });
});

