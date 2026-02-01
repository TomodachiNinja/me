// ========================================
// InvoiceFlow - Interactive JavaScript
// Parallax, Animations & Demo Functionality
// ========================================

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initParallax();
    initScrollAnimations();
    initCounters();
    initDemo();
    initSmoothScroll();
});

// ========================================
// Navigation
// ========================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ========================================
// Parallax Effects
// ========================================
function initParallax() {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const floatingCards = document.querySelectorAll('.float-card');
    const parallaxBgs = document.querySelectorAll('.parallax-bg');

    let ticking = false;

    function updateParallax() {
        const scrollY = window.pageYOffset;

        // Parallax layers in hero
        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.dataset.speed) || 0.5;
            const yPos = -(scrollY * speed);
            layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });

        // Floating cards parallax
        floatingCards.forEach((card, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = scrollY * speed;
            const rotation = Math.sin(scrollY * 0.002 + index) * 3;
            card.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
        });

        // Background parallax
        parallaxBgs.forEach(bg => {
            const speed = parseFloat(bg.dataset.speed) || 0.2;
            const yPos = scrollY * speed;
            bg.style.transform = `translate(-50%, calc(-50% + ${yPos}px))`;
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });

    // Mouse parallax for floating cards
    document.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        floatingCards.forEach((card, index) => {
            const depth = 10 + (index * 5);
            const moveX = mouseX * depth;
            const moveY = mouseY * depth;
            card.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
}

// ========================================
// Scroll Animations
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate step line progress
                if (entry.target.classList.contains('step-card')) {
                    updateStepLine();
                }
            }
        });
    }, observerOptions);

    // Observe step cards
    document.querySelectorAll('.step-card').forEach(card => {
        observer.observe(card);
    });

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';

        const featureObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        featureObserver.observe(card);
    });

    // Observe benefit cards
    document.querySelectorAll('.benefits-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(-30px)';

        const benefitObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateX(0)';
                    }, index * 200);
                }
            });
        }, { threshold: 0.1 });

        benefitObserver.observe(card);
    });
}

function updateStepLine() {
    const stepCards = document.querySelectorAll('.step-card.visible');
    const lineProgress = document.getElementById('lineProgress');

    if (lineProgress) {
        const progress = (stepCards.length / 3) * 100;
        lineProgress.style.width = `${progress}%`;
    }
}

// ========================================
// Animated Counters
// ========================================
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;

    const isLargeNumber = target > 10000;
    const isCurrency = element.textContent.includes('$');

    const timer = setInterval(() => {
        current += target / steps;

        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        let displayValue;
        if (isCurrency) {
            if (isLargeNumber) {
                displayValue = `$${(current / 1000000).toFixed(1)}M`;
            } else {
                displayValue = `$${Math.floor(current).toLocaleString()}`;
            }
        } else {
            displayValue = Math.floor(current).toLocaleString();
        }

        element.textContent = displayValue;
    }, stepDuration);
}

// ========================================
// Live Demo Section
// ========================================
function initDemo() {
    const auctionTimer = document.getElementById('auctionTimer');
    const currentBid = document.getElementById('currentBid');
    const bidList = document.getElementById('bidList');
    const bidInput = document.getElementById('bidInput');
    const placeBidBtn = document.getElementById('placeBidBtn');

    if (!auctionTimer) return;

    // Countdown timer
    let timeLeft = 9930; // 2:45:30 in seconds

    function updateTimer() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        auctionTimer.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (timeLeft > 0) {
            timeLeft--;
            setTimeout(updateTimer, 1000);
        }
    }

    updateTimer();

    // Simulated bids
    const bidders = [
        '0x8a2f...3c91',
        '0x3b7c...9f42',
        '0x5d1e...7a83',
        '0x9c4a...2b15',
        '0x7f2d...8e67'
    ];

    let currentBidValue = 24250;

    function simulateBid() {
        if (currentBidValue <= 23000) return;

        const reduction = Math.floor(Math.random() * 100) + 50;
        currentBidValue -= reduction;

        const bidder = bidders[Math.floor(Math.random() * bidders.length)];
        const discount = (((25000 - currentBidValue) / 25000) * 100).toFixed(1);

        // Update current bid display
        currentBid.textContent = `$${currentBidValue.toLocaleString()}`;
        document.querySelector('.bid-discount').textContent = `${discount}% discount`;

        // Add new bid to list
        const newBid = document.createElement('div');
        newBid.className = 'bid-item';
        newBid.innerHTML = `
            <span class="bidder">${bidder}</span>
            <span class="bid-amount">$${currentBidValue.toLocaleString()}</span>
            <span class="bid-time">Just now</span>
        `;
        newBid.style.opacity = '0';
        newBid.style.transform = 'translateY(-10px)';

        bidList.insertBefore(newBid, bidList.firstChild);

        // Animate new bid
        setTimeout(() => {
            newBid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            newBid.style.opacity = '1';
            newBid.style.transform = 'translateY(0)';
        }, 10);

        // Remove old bids if too many
        if (bidList.children.length > 5) {
            bidList.removeChild(bidList.lastChild);
        }

        // Update existing bid times
        Array.from(bidList.children).forEach((bid, index) => {
            if (index > 0) {
                const timeSpan = bid.querySelector('.bid-time');
                const currentTime = timeSpan.textContent;
                if (currentTime === 'Just now') {
                    timeSpan.textContent = '1m ago';
                } else {
                    const minutes = parseInt(currentTime) || 1;
                    timeSpan.textContent = `${minutes + 1}m ago`;
                }
            }
        });

        // Schedule next simulated bid
        const nextBidDelay = Math.random() * 10000 + 5000;
        setTimeout(simulateBid, nextBidDelay);
    }

    // Start simulated bidding after 3 seconds
    setTimeout(simulateBid, 3000);

    // User bid placement
    if (placeBidBtn && bidInput) {
        placeBidBtn.addEventListener('click', () => {
            const userBid = parseInt(bidInput.value);

            if (isNaN(userBid) || userBid >= currentBidValue) {
                // Show error feedback
                bidInput.style.borderColor = '#ff4444';
                bidInput.style.animation = 'shake 0.5s ease';

                setTimeout(() => {
                    bidInput.style.borderColor = '';
                    bidInput.style.animation = '';
                }, 500);
                return;
            }

            // Update current bid
            currentBidValue = userBid;
            const discount = (((25000 - currentBidValue) / 25000) * 100).toFixed(1);

            currentBid.textContent = `$${currentBidValue.toLocaleString()}`;
            document.querySelector('.bid-discount').textContent = `${discount}% discount`;

            // Add user bid to list
            const userBidItem = document.createElement('div');
            userBidItem.className = 'bid-item';
            userBidItem.style.background = 'rgba(99, 102, 241, 0.2)';
            userBidItem.innerHTML = `
                <span class="bidder">You</span>
                <span class="bid-amount">$${userBid.toLocaleString()}</span>
                <span class="bid-time">Just now</span>
            `;

            bidList.insertBefore(userBidItem, bidList.firstChild);

            // Clear input
            bidInput.value = '';

            // Success feedback
            placeBidBtn.textContent = 'Bid Placed!';
            placeBidBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

            setTimeout(() => {
                placeBidBtn.textContent = 'Place Bid';
                placeBidBtn.style.background = '';
            }, 2000);
        });
    }
}

// ========================================
// Smooth Scroll
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                document.querySelector('.nav-links')?.classList.remove('active');
                document.getElementById('mobileMenuBtn')?.classList.remove('active');
            }
        });
    });
}

// ========================================
// Wallet Connection (Simulated)
// ========================================
const connectWalletBtn = document.getElementById('connectWallet');

if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', async () => {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });

                const address = accounts[0];
                const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

                connectWalletBtn.innerHTML = `
                    <span class="wallet-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                    </span>
                    ${shortAddress}
                `;
                connectWalletBtn.style.borderColor = 'var(--accent-green)';
                connectWalletBtn.style.color = 'var(--accent-green)';

            } catch (error) {
                console.error('Wallet connection failed:', error);
            }
        } else {
            // Show install MetaMask prompt
            alert('Please install MetaMask to connect your wallet!');
            window.open('https://metamask.io/', '_blank');
        }
    });
}

// ========================================
// Utility: Shake Animation
// ========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// ========================================
// Performance: Reduce animations on low-end devices
// ========================================
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-fast', '0s');
    document.documentElement.style.setProperty('--transition-normal', '0s');
    document.documentElement.style.setProperty('--transition-slow', '0s');
}

// Console branding
console.log(
    '%c InvoiceFlow %c Decentralized Invoice Financing ',
    'background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 5px 10px; border-radius: 5px 0 0 5px; font-weight: bold;',
    'background: #1a1a2e; color: #818cf8; padding: 5px 10px; border-radius: 0 5px 5px 0;'
);
