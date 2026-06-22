const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

function createMobileMenu() {
    const mobileNav = document.createElement('div');
    mobileNav.className = 'nav-mobile';
    mobileNav.id = 'navMobile';
    mobileNav.innerHTML = nav.innerHTML;
    document.body.appendChild(mobileNav);
    return mobileNav;
}

const mobileNav = createMobileMenu();

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu on link click
mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ============================================
// HEADER BACKGROUND ON SCROLL
// ============================================

const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        header.style.background = 'rgba(26, 26, 29, 0.95)';
    } else {
        header.style.background = 'rgba(26, 26, 29, 0.85)';
    }
    
    lastScroll = currentScroll;
});

// ============================================
// SCROLL ANIMATIONS (IntersectionObserver)
// ============================================

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
});

// Separate observer for service cards with stagger
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add staggered animation
            const cards = entry.target.querySelectorAll('.service-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('visible');
                }, index * 100);
            });
            cardObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

const servicesGrid = document.querySelector('.services-grid');
if (servicesGrid) {
    cardObserver.observe(servicesGrid);
}

// Separate observer for about list items
const listObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll('li');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('visible');
                }, index * 100);
            });
            listObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

const aboutList = document.querySelector('.about-list');
if (aboutList) {
    listObserver.observe(aboutList);
}

// Contact items observer
const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 150);
            contactObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.contact-item').forEach(item => {
    contactObserver.observe(item);
});

// Messengers observer
const messengersEl = document.querySelector('.messengers');
if (messengersEl) {
    const messengersObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                messengersObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    messengersObserver.observe(messengersEl);
}

// Map observer
const mapEl = document.querySelector('.contacts-map');
if (mapEl) {
    const mapObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                mapObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    mapObserver.observe(mapEl);
}

// ============================================
// THREE.JS WIREFRAME SPHERE
// ============================================

function initSphere() {
    const container = document.getElementById('sphereCanvas');
    if (!container) return;
    
    // Check for touch device
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3;
    
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    // Create wireframe sphere
    const geometry = new THREE.IcosahedronGeometry(1, 2);
    const wireframe = new THREE.WireframeGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0xDC2626,
        transparent: true,
        opacity: 0.6
    });
    const sphere = new THREE.LineSegments(wireframe, lineMaterial);
    scene.add(sphere);
    
    // Add inner glow sphere (solid, very transparent)
    const glowGeometry = new THREE.IcosahedronGeometry(0.98, 3);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x1D4ED8,
        transparent: true,
        opacity: 0.08,
        wireframe: false
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowSphere);
    
    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    let isHovered = false;
    
    if (!isTouchDevice) {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        });
        
        container.addEventListener('mouseenter', () => {
            isHovered = true;
        });
        
        container.addEventListener('mouseleave', () => {
            isHovered = false;
            mouseX = 0;
            mouseY = 0;
        });
    }
    
    // Animation
    let animationId;
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        const baseSpeed = isHovered ? 0.008 : 0.004;
        
        sphere.rotation.y += baseSpeed;
        sphere.rotation.x += baseSpeed * 0.5;
        glowSphere.rotation.y += baseSpeed;
        glowSphere.rotation.x += baseSpeed * 0.5;
        
        // Mouse follow (smooth)
        targetRotationY = mouseX * 0.3;
        targetRotationX = mouseY * 0.3;
        
        sphere.rotation.y += (targetRotationY - sphere.rotation.y * 0) * 0.02;
        sphere.rotation.x += (targetRotationX - sphere.rotation.x * 0) * 0.02;
        
        // Scale on hover
        const targetScale = isHovered ? 1.15 : 1;
        sphere.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        glowSphere.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Resize handler
    function onResize() {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    
    window.addEventListener('resize', onResize);
    
    // Cleanup on page hide
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
}

// Initialize Three.js sphere when DOM is ready
if (document.getElementById('sphereCanvas')) {
    initSphere();
}

// ============================================
// HERO PARTICLES (Desktop only)
// ============================================

function createParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const particleCount = 60;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position along the racing stripe diagonal
        const progress = Math.random();
        const spreadX = (Math.random() - 0.5) * 200;
        const spreadY = (Math.random() - 0.5) * 100;
        
        const startX = 30 + progress * 40 + spreadX;
        const startY = 20 + progress * 60 + spreadY;
        
        particle.style.left = startX + '%';
        particle.style.top = startY + '%';
        
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 150;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        
        // Random color (80% red, 20% white)
        particle.style.background = Math.random() > 0.2 ? '#DC2626' : '#FFFFFF';
        
        // Random size
        const size = 2 + Math.random() * 3;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random delay
        particle.style.animationDelay = (Math.random() * 1.5) + 's';
        particle.style.animationDuration = (1 + Math.random() * 1) + 's';
        
        container.appendChild(particle);
    }
}

createParticles();

// ============================================
// 3D CARD PARALLAX EFFECT
// ============================================

function init3DCard() {
    const card = document.getElementById('card3d');
    if (!card) return;
    
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const inner = card.querySelector('.card-3d-inner');
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const rotateY = ((mouseX - centerX) / centerX) * 8;
        const rotateX = ((mouseY - centerY) / centerY) * -8;
        
        inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
        inner.style.transform = 'rotateX(0) rotateY(0)';
    });
}

init3DCard();

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// NAV TYPING EFFECT RESET
// ============================================

const navCta = document.getElementById('navCta');
if (navCta) {
    // Restart typing animation on hover
    navCta.addEventListener('mouseenter', () => {
        const text = navCta.querySelector('.typing-text');
        text.style.animation = 'none';
        text.offsetHeight; // Trigger reflow
        text.style.animation = 'typing 3s steps(15) forwards';
    });
}

// ============================================
// ACTIVE NAV LINK HIGHLIGHTING
// ============================================

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNavLink() {
    const scrollPos = window.pageYOffset + header.offsetHeight + 100;
    
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        
        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// Add active style
const activeNavStyle = document.createElement('style');
activeNavStyle.textContent = `
    .nav-link.active {
        color: var(--text-primary);
    }
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(activeNavStyle);

// ============================================
// PERFORMANCE: Pause animations when not visible
// ============================================

const animatedElements = document.querySelectorAll('.service-card, .racing-stripe-services');

const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.target.classList.contains('racing-stripe-services')) {
            entry.target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        }
    });
}, { threshold: 0 });

animatedElements.forEach(el => {
    if (el.classList.contains('racing-stripe-services')) {
        visibilityObserver.observe(el);
    }
});

// ============================================
// CONSOLE SIGNATURE
// ============================================

console.log('%c ПРОФІ СЕРВІС ', 'background: #DC2626; color: #fff; font-size: 20px; font-weight: bold; padding: 8px 16px; border-radius: 4px;');
console.log('%c Станція технічного обслуговування | Хмельницький ', 'color: #9CA3AF; font-size: 12px;');
