// ============================================
// 🎂 Birthday Site — Main Script
// ============================================
// Loads all data from Firebase (or sample data if not configured)

// --- Intro Animation & Flow ---
document.addEventListener('DOMContentLoaded', () => {
    // Ensure the page always starts from the top on reload
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const introScreen = document.getElementById('intro-screen');
    const enterBtn = document.getElementById('enter-btn');
    const mainContent = document.getElementById('main-content-wrapper');

    enterBtn.addEventListener('click', () => {
        // Fade out intro
        introScreen.style.opacity = '0';
        introScreen.style.visibility = 'hidden';

        // Show main content
        setTimeout(() => {
            mainContent.style.opacity = '1';
            mainContent.style.pointerEvents = 'auto';
            initGSAP();
        }, 500);
    });

    // Load everything from Firebase
    loadSiteData();
});

// --- Load all site data ---
async function loadSiteData() {
    try {
        // Load settings and populate dynamic text
        const settings = await db.getSettings();
        applySettings(settings);

        // Load content sections
        await loadMessages();
        await loadGallery();
        await loadQuiz();
    } catch (e) {
        console.error("Error loading site data:", e);
    }
}

// --- Apply site settings to page text ---
function applySettings(s) {
    document.title = s.heroGreeting || "Happy Birthday! 🎂";

    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el && text) el.textContent = text;
    };

    setText('intro-subtext', s.introText);
    setText('hero-greeting', (s.heroGreeting || "Happy Birthday!") + " 🎂");
    setText('hero-subtext', s.heroSubtext);
    setText('story-title', s.storyTitle);
    setText('story-text', s.storyText);
    setText('story-text-2', s.storyText2);
    setText('closing-greeting', s.closingGreeting);
    setText('closing-text', s.closingText);
    setText('closing-text-2', s.closingText2);
    setText('closing-signoff', s.closingSignoff);
    setText('footer-text', s.footerText);
}

// --- GSAP Scroll Animations ---
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);
    const sections = gsap.utils.toArray('.reveal-up');
    sections.forEach(sec => {
        gsap.to(sec, {
            scrollTrigger: {
                trigger: sec,
                start: "top 80%",
                toggleActions: "play none none none"
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        });
    });
}

// --- Quiz Logic ---
let currentQuestionIndex = 0;
let questions = [];
let birthdayPersonAnswers = {};

async function loadQuiz() {
    questions = await db.getQuestions();
    birthdayPersonAnswers = await db.getAnswers();

    // Skip already answered
    while (currentQuestionIndex < questions.length && birthdayPersonAnswers[questions[currentQuestionIndex].id]) {
        currentQuestionIndex++;
    }

    loadQuestion();
}

const quizContainer = document.getElementById('birthday-quiz-container');
const qText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

function loadQuestion() {
    if (questions.length === 0) {
        qText.textContent = "No questions set up yet!";
        return;
    }

    if (currentQuestionIndex >= questions.length) {
        showLeaderboard();
        return;
    }

    const q = questions[currentQuestionIndex];
    qText.innerHTML = `<span style="color:var(--accent);">Q${currentQuestionIndex + 1}:</span> ${q.text}`;
    optionsContainer.innerHTML = '';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.className = 'option-btn';
        btn.onclick = () => selectAnswer(q.id, opt, btn);
        optionsContainer.appendChild(btn);
    });
}

async function selectAnswer(qId, answer, btn) {
    const allBtns = optionsContainer.querySelectorAll('.option-btn');
    allBtns.forEach(b => { b.classList.remove('selected'); b.disabled = true; });
    btn.classList.add('selected');

    birthdayPersonAnswers[qId] = answer;
    await db.saveAnswers(birthdayPersonAnswers);

    setTimeout(() => {
        currentQuestionIndex++;
        gsap.fromTo(quizContainer,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.5 }
        );
        loadQuestion();
    }, 1000);
}

// --- Leaderboard Logic ---
async function showLeaderboard() {
    quizContainer.style.display = 'none';
    const lbSection = document.getElementById('leaderboard-section');
    lbSection.style.display = 'block';

    const guesses = await db.getGuesses();
    const finalAnswers = birthdayPersonAnswers;

    const scores = guesses.map(g => {
        let score = 0;
        Object.keys(finalAnswers).forEach(qId => {
            if (g.answers && g.answers[qId] === finalAnswers[qId]) { score++; }
        });
        return { name: g.name, score };
    });

    scores.sort((a, b) => b.score - a.score);

    const lbContainer = document.getElementById('leaderboard-container');
    if (scores.length === 0) {
        lbContainer.innerHTML = "<p style='text-align:center;'>No one guessed yet! The leaderboard is empty.</p>";
        return;
    }

    lbContainer.innerHTML = scores.map((s, i) => `
        <div class="leaderboard-entry">
            <span>${i === 0 ? '👑 ' : ''}${i + 1}. ${s.name}</span>
            <span>${s.score} pts</span>
        </div>
    `).join('');

    lbContainer.innerHTML += `
        <div style="text-align:center; margin-top: 2rem;">
            <button class="btn" style="background-color:var(--coffee-light);" onclick="resetQuiz()">Retake Quiz ↺</button>
        </div>
    `;

    gsap.from(".leaderboard-entry", {
        y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)"
    });
}

window.resetQuiz = function () {
    localStorage.removeItem('birthdayPersonAnswers');
    if (firebaseReady) {
        dbInstance.collection('answers').doc('session').delete();
    }
    location.reload();
};

// --- Sticky Notes (Messages) ---
async function loadMessages() {
    const messages = await db.getMessages();
    const board = document.getElementById('message-board');

    if (messages.length === 0) {
        board.innerHTML = "<p>No messages yet!</p>";
        return;
    }

    board.innerHTML = messages.map(m => {
        const rotation = Math.floor(Math.random() * 16) - 8;
        const color = m.color || '#fef08a';
        return `
            <div class="sticky-note" style="background-color: ${color}; transform: rotate(${rotation}deg);">
                <h4>From: ${m.name}</h4>
                <p>${m.text}</p>
            </div>
        `;
    }).join('');
}

// --- Swipeable Carousel Gallery ---
let currentSlide = 0;
let carouselPhotos = [];

async function loadGallery() {
    const track = document.getElementById('gallery-track');
    carouselPhotos = await db.getPhotos();

    if (carouselPhotos.length === 0) {
        track.innerHTML = "<p>No photos yet!</p>";
        return;
    }

    track.innerHTML = carouselPhotos.map((p, index) => {
        const rotation = Math.floor(Math.random() * 6) - 3;
        // Support both old local paths and new Firebase Storage URLs
        const imgSrc = p.url || `images/${p.filename}`;
        return `
            <div class="carousel-slide">
                <div class="polaroid" style="transform: rotate(${rotation}deg);">
                    <img src="${imgSrc}" alt="Capture ${index + 1}" style="object-position: ${p.viewpoint || 'center'};">
                    <div class="polaroid-caption">${p.caption}</div>
                </div>
            </div>
        `;
    }).join('');

    updateCarousel();
    initSwipe();
}

function moveCarousel(direction) {
    if (carouselPhotos.length === 0) return;
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = carouselPhotos.length - 1;
    if (currentSlide >= carouselPhotos.length) currentSlide = 0;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('gallery-track');
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Swipe handling
function initSwipe() {
    const trackContainer = document.getElementById('track-container');
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    trackContainer.addEventListener('mousedown', touchStart);
    trackContainer.addEventListener('mousemove', touchMove);
    trackContainer.addEventListener('mouseup', touchEnd);
    trackContainer.addEventListener('mouseleave', touchEnd);
    trackContainer.addEventListener('touchstart', touchStart, { passive: true });
    trackContainer.addEventListener('touchmove', touchMove, { passive: true });
    trackContainer.addEventListener('touchend', touchEnd);

    function touchStart(e) {
        isDragging = true;
        startX = getPositionX(e);
        document.getElementById('gallery-track').style.transition = 'none';
    }

    function touchMove(e) {
        if (!isDragging) return;
        currentX = getPositionX(e);
        const diff = currentX - startX;
        document.getElementById('gallery-track').style.transform = `translateX(calc(-${currentSlide * 100}% + ${diff}px))`;
    }

    function touchEnd() {
        if (!isDragging) return;
        isDragging = false;
        const diff = currentX - startX;
        document.getElementById('gallery-track').style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        if (Math.abs(diff) > 50) {
            moveCarousel(diff > 0 ? -1 : 1);
        } else {
            updateCarousel();
        }
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }
}

window.moveCarousel = moveCarousel;
