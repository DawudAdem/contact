/**
 * Al-Huda SIMS - Collapsible Accordion Sidebar
 */

export function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');

    // Create overlay for mobile
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    // Toggle sidebar (mobile)
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    });

    // Close sidebar
    sidebarClose?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });

    // Accordion toggle
    document.querySelectorAll('.accordion-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const navItem = toggle.closest('.nav-item');

            // Close other open accordions
            document.querySelectorAll('.nav-item.has-submenu.open').forEach(item => {
                if (item !== navItem) {
                    item.classList.remove('open');
                }
            });

            // Toggle current
            navItem.classList.toggle('open');
        });
    });

    // Close sidebar on window resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    });

    // Keyboard: Escape closes sidebar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    });
}
