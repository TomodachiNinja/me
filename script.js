// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Animated counter
function animateCounter(element, target, duration = 2000, isDecimal = false) {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        if (isDecimal) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Trigger counter animation for stats
            const counters = entry.target.querySelectorAll('[data-target]');
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const isDecimal = target % 1 !== 0;
                animateCounter(counter, target, 2000, isDecimal);
                counter.removeAttribute('data-target'); // Prevent re-animation
            });
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.feature-card, .learning-card, .stat-card, .analytics-feature, .trust-indicators').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// Live Chart Animation (Hero Section)
const liveChartCanvas = document.getElementById('liveChart');
if (liveChartCanvas) {
    const ctx = liveChartCanvas.getContext('2d');
    liveChartCanvas.width = liveChartCanvas.parentElement.offsetWidth - 40;
    liveChartCanvas.height = 180;

    const dataPoints = 30;
    let chartData = Array.from({ length: dataPoints }, () => Math.random() * 100 + 50);

    function drawChart() {
        const width = liveChartCanvas.width;
        const height = liveChartCanvas.height;
        const padding = 20;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = padding + (height - 2 * padding) * i / 4;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw line chart
        ctx.beginPath();
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const stepX = (width - 2 * padding) / (dataPoints - 1);
        const maxValue = Math.max(...chartData);
        const minValue = Math.min(...chartData);
        const range = maxValue - minValue || 1;

        chartData.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw gradient fill
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(135, 206, 235, 0.3)');
        gradient.addColorStop(1, 'rgba(135, 206, 235, 0)');

        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw dots
        ctx.fillStyle = '#87CEEB';
        chartData.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);

            if (index === dataPoints - 1) {
                // Highlight last point
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#87CEEB';
                ctx.fill();

                // Pulse effect
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(135, 206, 235, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    }

    function updateChart() {
        // Shift data and add new point
        chartData.shift();
        chartData.push(chartData[chartData.length - 1] + (Math.random() - 0.5) * 20);

        // Keep values in reasonable range
        chartData[chartData.length - 1] = Math.max(30, Math.min(180, chartData[chartData.length - 1]));

        drawChart();
    }

    // Initial draw
    drawChart();

    // Update chart periodically
    setInterval(updateChart, 2000);
}

// Dashboard Chart Animation
const dashboardChartCanvas = document.getElementById('dashboardChart');
if (dashboardChartCanvas) {
    const ctx = dashboardChartCanvas.getContext('2d');
    dashboardChartCanvas.width = dashboardChartCanvas.parentElement.offsetWidth - 40;
    dashboardChartCanvas.height = 160;

    const data = [
        { label: 'Mon', value: 45 },
        { label: 'Tue', value: 62 },
        { label: 'Wed', value: 55 },
        { label: 'Thu', value: 78 },
        { label: 'Fri', value: 85 },
        { label: 'Sat', value: 92 },
        { label: 'Sun', value: 88 }
    ];

    function drawDashboardChart() {
        const width = dashboardChartCanvas.width;
        const height = dashboardChartCanvas.height;
        const padding = 30;
        const barWidth = (width - 2 * padding) / data.length * 0.7;
        const gap = (width - 2 * padding) / data.length * 0.3;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw bars
        const maxValue = Math.max(...data.map(d => d.value));

        data.forEach((item, index) => {
            const x = padding + index * (barWidth + gap);
            const barHeight = (item.value / maxValue) * (height - 2 * padding);
            const y = height - padding - barHeight;

            // Create gradient for bars
            const gradient = ctx.createLinearGradient(x, y, x, height - padding);
            gradient.addColorStop(0, '#93C572');
            gradient.addColorStop(1, 'rgba(147, 197, 114, 0.3)');

            // Draw bar
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, height - padding + 15);
        });
    }

    drawDashboardChart();
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-visual');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Dynamic market stats update (simulated)
function updateMarketStats() {
    const btcValue = document.querySelector('.stat-item.positive .stat-value');
    const ethValue = document.querySelector('.stat-item.negative .stat-value');
    const btcChange = document.querySelector('.stat-item.positive .stat-change');
    const ethChange = document.querySelector('.stat-item.negative .stat-change');

    if (btcValue && ethValue) {
        setInterval(() => {
            // BTC update
            const currentBTC = parseFloat(btcValue.textContent.replace('$', '').replace(',', ''));
            const btcFluctuation = (Math.random() - 0.5) * 100;
            const newBTC = currentBTC + btcFluctuation;
            btcValue.textContent = `$${newBTC.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

            // ETH update
            const currentETH = parseFloat(ethValue.textContent.replace('$', '').replace(',', ''));
            const ethFluctuation = (Math.random() - 0.5) * 50;
            const newETH = currentETH + ethFluctuation;
            ethValue.textContent = `$${newETH.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

            // Update change percentages with random values
            const btcChangeValue = (Math.random() * 5 - 1).toFixed(1);
            const ethChangeValue = (Math.random() * 5 - 3).toFixed(1);

            btcChange.textContent = `${btcChangeValue > 0 ? '+' : ''}${btcChangeValue}%`;
            ethChange.textContent = `${ethChangeValue > 0 ? '+' : ''}${ethChangeValue}%`;
        }, 5000);
    }
}

updateMarketStats();

// Add floating animation to feature cards on hover
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.animation = 'none';
        setTimeout(() => {
            this.style.animation = '';
        }, 10);
    });
});

// Particle effect for hero background (optional performance-friendly version)
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.init();
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(135, 206, 235, ${particle.opacity})`;
            this.ctx.fill();
        });

        // Draw connections
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(135, 206, 235, ${0.2 * (1 - distance / 150)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            });
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Create particle canvas (optional - can be disabled for better performance)
const createParticleCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.4';

    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.insertBefore(canvas, heroSection.firstChild);
        new ParticleSystem(canvas);
    }
};

// Initialize particles only on larger screens for performance
if (window.innerWidth > 1024) {
    createParticleCanvas();
}

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Redraw charts on resize
        if (liveChartCanvas) {
            liveChartCanvas.width = liveChartCanvas.parentElement.offsetWidth - 40;
            drawChart();
        }
        if (dashboardChartCanvas) {
            dashboardChartCanvas.width = dashboardChartCanvas.parentElement.offsetWidth - 40;
            drawDashboardChart();
        }
    }, 250);
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// CTA button interactions
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';

        const rect = this.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left - 10) + 'px';
        ripple.style.top = (e.clientY - rect.top - 10) + 'px';

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('🚀 Traders Dex initialized successfully!');
