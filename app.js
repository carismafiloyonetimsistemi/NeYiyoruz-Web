/**
 * Ne Yiyoruz? - Modern Food Decision & Wheel of Fortune App
 * Full Autonomous Logic: Guest Auth, Rooms, Tinder Swipe, Canvas Wheel, Affiliate
 */

// --- 1. FOOD DATASET ---
const FOOD_ITEMS = [
    { id: 1, name: 'Karışık Pizza', category: 'İtalyan / Fast Food', emoji: '🍕', price: '240 ₺', desc: 'İnce hamur, bol mozzarella, sucuk ve mantar' },
    { id: 2, name: 'Çıtır Lahmacun', category: 'Geleneksel / Taş Fırın', emoji: '🥩', price: '120 ₺', desc: 'Bol yeşillik ve buz gibi köpüklü ayran ile' },
    { id: 3, name: 'Smash Burger', category: 'Amerikan / Fast Food', emoji: '🍔', price: '260 ₺', desc: 'Karamelize soğan, trüflü mayonez ve çıtır patates' },
    { id: 4, name: 'Hatay Usulü Döner', category: 'Döner / Sokak Lezzeti', emoji: '🌯', price: '180 ₺', desc: 'Özel sarımsaklı mayonez ve patatesli soslu dürüm' },
    { id: 5, name: 'Kayseri Mantısı', category: 'Ev Yemekleri', emoji: '🥟', price: '210 ₺', desc: 'Sarımsaklı yoğurt ve naneli tereyağı sosuyla' },
    { id: 6, name: 'Adana Kebap', category: 'Ocakbaşı', emoji: '🍢', price: '320 ₺', desc: 'Közlenmiş biber, domates ve sıcak lavaş eşliğinde' },
    { id: 7, name: 'Sushi & Roll', category: 'Uzak Doğu', emoji: '🍣', price: '380 ₺', desc: 'Somon, avokado ve çıtır tempura roll' },
    { id: 8, name: 'Etli Çiğ Köfte Dürüm', category: 'Pratik / Çiğ Köfte', emoji: '🥬', price: '110 ₺', desc: 'Bol nar ekşisi, marul ve acı sos' },
    { id: 9, name: 'Günün Ev Yemeği Menüsü', category: 'Sağlıklı / Anne Yemeği', emoji: '🍲', price: '175 ₺', desc: 'Mercimek çorbası, kuru fasulye ve tane tane pirinç pilavı' },
    { id: 10, name: 'Sıcak Sufle & Dondurma', category: 'Tatlı Kapanış', emoji: '🍫', price: '160 ₺', desc: 'Akışkan Belçika çikolatası ve vanilyalı dondurma' },
];

// --- 2. GLOBAL STATE ---
const state = {
    user: null, // { name: 'Ersoy', avatar: '😎', isGuest: true }
    room: null, // { code: '4821', title: 'Ofis Grubu', participants: ['Ersoy', 'Can', 'Ayşe'] }
    currentCardIndex: 0,
    acceptedFoods: [],
    winnerFood: FOOD_ITEMS[0],
    runner: null,
    wheelAngle: 0,
    isSpinning: false,
};

// --- 3. WEB AUDIO SYNTHESIZER (No external mp3 needed!) ---
const audio = {
    ctx: null,
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) this.ctx = new AudioContext();
        }
    },
    tick() {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.04);
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.04);
        } catch (e) {}
    },
    fanfare() {
        if (!this.ctx) return;
        try {
            [440, 554, 659, 880].forEach((freq, idx) => {
                setTimeout(() => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.4);
                }, idx * 100);
            });
        } catch (e) {}
    }
};

// --- 4. DOM ELEMENTS ---
const els = {
    userBadge: document.getElementById('userBadge'),
    displayUsername: document.getElementById('displayUsername'),
    userAvatar: document.getElementById('userAvatar'),
    logoutBtn: document.getElementById('logoutBtn'),
    guestNameInput: document.getElementById('guestNameInput'),
    btnGuestStart: document.getElementById('btnGuestStart'),
    createRoomNameInput: document.getElementById('createRoomNameInput'),
    btnCreateRoom: document.getElementById('btnCreateRoom'),
    joinRoomCodeInput: document.getElementById('joinRoomCodeInput'),
    btnJoinRoom: document.getElementById('btnJoinRoom'),
    activeRoomBox: document.getElementById('activeRoomBox'),
    currentRoomTitle: document.getElementById('currentRoomTitle'),
    currentRoomCodeBadge: document.getElementById('currentRoomCodeBadge'),
    btnShareWhatsApp: document.getElementById('btnShareWhatsApp'),
    participantCount: document.getElementById('participantCount'),
    participantsList: document.getElementById('participantsList'),
    btnStartMatching: document.getElementById('btnStartMatching'),
    swipeCardWrapper: document.getElementById('swipeCardWrapper'),
    cardCounter: document.getElementById('cardCounter'),
    btnSwipeLeft: document.getElementById('btnSwipeLeft'),
    btnSwipeRight: document.getElementById('btnSwipeRight'),
    btnSuperLike: document.getElementById('btnSuperLike'),
    btnSkipToWheel: document.getElementById('btnSkipToWheel'),
    btnBackToLobby: document.getElementById('btnBackToLobby'),
    matchModal: document.getElementById('matchModal'),
    modalMatchedFoodName: document.getElementById('modalMatchedFoodName'),
    btnModalGoToWheel: document.getElementById('btnModalGoToWheel'),
    wheelCanvas: document.getElementById('wheelCanvas'),
    btnSpinWheel: document.getElementById('btnSpinWheel'),
    runnerResultBox: document.getElementById('runnerResultBox'),
    runnerName: document.getElementById('runnerName'),
    btnProceedToOrder: document.getElementById('btnProceedToOrder'),
    finalFoodTitle: document.getElementById('finalFoodTitle'),
    winnerFoodEmoji: document.getElementById('winnerFoodEmoji'),
    winnerFoodName: document.getElementById('winnerFoodName'),
    summaryRunnerName: document.getElementById('summaryRunnerName'),
    btnCopyPromo: document.getElementById('btnCopyPromo'),
    promoCodeText: document.getElementById('promoCodeText'),
    linkYemeksepeti: document.getElementById('linkYemeksepeti'),
    linkTrendyol: document.getElementById('linkTrendyol'),
    linkGetir: document.getElementById('linkGetir'),
    btnNewRound: document.getElementById('btnNewRound'),
    stickyBanner: document.getElementById('stickyBanner'),
    btnCloseBanner: document.getElementById('btnCloseBanner'),
    navTabs: document.querySelectorAll('.nav-tab'),
    screens: document.querySelectorAll('.screen'),
};

// --- 5. NAVIGATION CONTROLLER ---
function navigateTo(screenId) {
    els.screens.forEach(s => s.classList.remove('active'));
    els.navTabs.forEach(t => t.classList.remove('active'));

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) targetScreen.classList.add('active');

    const targetTab = Array.from(els.navTabs).find(t => t.dataset.target === screenId);
    if (targetTab) targetTab.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (screenId === 'screen-wheel') {
        drawWheel();
    }
}

els.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        navigateTo(tab.dataset.target);
    });
});

// --- 6. GUEST & USER AUTH ---
function loginAsGuest(name) {
    audio.init();
    const cleanName = (name || 'Misafir').trim();
    state.user = {
        name: cleanName,
        avatar: ['😎', '🍕', '🚀', '🔥', '🦁', '🌟'][Math.floor(Math.random() * 6)],
        isGuest: true,
    };
    localStorage.setItem('neyiyoruz_user', JSON.stringify(state.user));

    // Update UI
    els.displayUsername.innerText = state.user.name;
    els.userAvatar.innerText = state.user.avatar;
    els.userBadge.style.display = 'flex';

    // Auto-proceed to Lobby
    navigateTo('screen-lobby');

    // If there is room in query, auto-fill
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
        joinRoom(roomParam);
    }
}

els.btnGuestStart.addEventListener('click', () => {
    const val = els.guestNameInput.value;
    loginAsGuest(val || 'Misafir Gurme');
});

els.logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('neyiyoruz_user');
    state.user = null;
    els.userBadge.style.display = 'none';
    navigateTo('screen-auth');
});

// --- 7. ROOM SYSTEM ---
function createRoom(title) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const roomTitle = title || 'Günün Yemeği';
    const participants = [state.user ? state.user.name : 'Ersoy', 'Ahmet (Ofis)', 'Can'];

    state.room = {
        code: code,
        title: roomTitle,
        participants: participants,
    };

    renderActiveRoom();
}

function joinRoom(code) {
    if (!code) return alert('Lütfen geçerli bir oda kodu giriniz.');
    const userName = state.user ? state.user.name : 'Yeni Katılımcı';
    
    state.room = {
        code: code,
        title: 'Lezzet Grubu #' + code,
        participants: ['Ersoy', 'Ahmet', userName],
    };

    renderActiveRoom();
}

function renderActiveRoom() {
    els.activeRoomBox.style.display = 'block';
    els.currentRoomTitle.innerText = state.room.title;
    els.currentRoomCodeBadge.innerText = state.room.code;
    els.participantCount.innerText = state.room.participants.length;

    els.participantsList.innerHTML = state.room.participants.map(p => `
        <span class="chip">
            <i class="fa-solid fa-circle-user text-orange"></i> ${p}
        </span>
    `).join('');

    els.activeRoomBox.scrollIntoView({ behavior: 'smooth' });
}

els.btnCreateRoom.addEventListener('click', () => {
    createRoom(els.createRoomNameInput.value);
});

els.btnJoinRoom.addEventListener('click', () => {
    joinRoom(els.joinRoomCodeInput.value);
});

els.btnShareWhatsApp.addEventListener('click', () => {
    if (!state.room) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${state.room.code}`;
    const text = encodeURIComponent(`🍕 Ne Yiyoruz? uygulamasına katıl, bugün ne yiyeceğimizi birlikte oylayalım!\n\nOda Kodu: ${state.room.code}\nKatılmak için tıkla: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
});

els.btnStartMatching.addEventListener('click', () => {
    state.currentCardIndex = 0;
    state.acceptedFoods = [];
    renderCurrentCard();
    navigateTo('screen-match');
});

els.btnBackToLobby.addEventListener('click', () => {
    navigateTo('screen-lobby');
});

// --- 8. TINDER-STYLE FOOD MATCH (SWIPE) ---
function renderCurrentCard() {
    if (state.currentCardIndex >= FOOD_ITEMS.length) {
        // Deck finished -> pick top voted or first accepted
        finishFoodMatch();
        return;
    }

    const item = FOOD_ITEMS[state.currentCardIndex];
    els.cardCounter.innerText = `${state.currentCardIndex + 1}/${FOOD_ITEMS.length}`;

    els.swipeCardWrapper.innerHTML = `
        <div class="food-card" id="activeFoodCard">
            <div class="food-card-header">
                <span class="food-category-badge">${item.category}</span>
                <span class="food-price-badge">${item.price}</span>
            </div>
            <div class="food-illustration">${item.emoji}</div>
            <div class="food-card-info">
                <h2>${item.name}</h2>
                <p>${item.desc}</p>
            </div>
        </div>
    `;

    setupCardDrag(document.getElementById('activeFoodCard'));
}

function handleSwipe(direction) {
    const card = document.getElementById('activeFoodCard');
    if (!card) return;

    audio.init();
    audio.tick();

    if (direction === 'right' || direction === 'super') {
        const item = FOOD_ITEMS[state.currentCardIndex];
        state.acceptedFoods.push(item);

        // Instant match trigger for viral demo!
        if (state.acceptedFoods.length >= 2 || direction === 'super') {
            triggerMatch(item);
            return;
        }
    }

    // Animate out
    const translateX = direction === 'right' ? 400 : direction === 'left' ? -400 : 0;
    const translateY = direction === 'super' ? -400 : 0;
    card.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${translateX / 15}deg)`;
    card.style.opacity = '0';

    setTimeout(() => {
        state.currentCardIndex++;
        renderCurrentCard();
    }, 220);
}

function setupCardDrag(card) {
    if (!card) return;
    let startX = 0, currentX = 0;
    let isDragging = false;

    const onStart = (clientX) => {
        startX = clientX;
        isDragging = true;
        card.style.transition = 'none';
    };

    const onMove = (clientX) => {
        if (!isDragging) return;
        currentX = clientX - startX;
        card.style.transform = `translate(${currentX}px, 0px) rotate(${currentX / 20}deg)`;
    };

    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        card.style.transition = 'transform 0.25s ease-out, opacity 0.2s';
        if (currentX > 90) {
            handleSwipe('right');
        } else if (currentX < -90) {
            handleSwipe('left');
        } else {
            card.style.transform = 'translate(0px, 0px) rotate(0deg)';
        }
    };

    // Touch
    card.addEventListener('touchstart', e => onStart(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', e => onMove(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchend', onEnd);

    // Mouse
    card.addEventListener('mousedown', e => onStart(e.clientX));
    window.addEventListener('mousemove', e => onMove(e.clientX));
    window.addEventListener('mouseup', onEnd);
}

els.btnSwipeLeft.addEventListener('click', () => handleSwipe('left'));
els.btnSwipeRight.addEventListener('click', () => handleSwipe('right'));
els.btnSuperLike.addEventListener('click', () => handleSwipe('super'));

function triggerMatch(food) {
    state.winnerFood = food;
    audio.fanfare();

    // Confetti!
    if (window.confetti) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    els.modalMatchedFoodName.innerText = `${food.emoji} ${food.name}`;
    els.matchModal.classList.add('active');
}

function finishFoodMatch() {
    state.winnerFood = state.acceptedFoods[0] || FOOD_ITEMS[0];
    triggerMatch(state.winnerFood);
}

els.btnModalGoToWheel.addEventListener('click', () => {
    els.matchModal.classList.remove('active');
    navigateTo('screen-wheel');
});

els.btnSkipToWheel.addEventListener('click', () => {
    state.winnerFood = FOOD_ITEMS[0];
    navigateTo('screen-wheel');
});

// --- 9. INTERACTIVE CANVAS WHEEL OF FORTUNE ---
function drawWheel() {
    const canvas = els.wheelCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 10;
    const participants = state.room ? state.room.participants : ['Ersoy', 'Ahmet', 'Can', 'Ayşe'];
    const count = participants.length;
    const sliceAngle = (2 * Math.PI) / count;

    const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b'];

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(state.wheelAngle);

    for (let i = 0; i < count; i++) {
        const start = i * sliceAngle;
        const end = start + sliceAngle;

        // Slice
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, start, end);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Label
        ctx.save();
        ctx.rotate(start + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(participants[i], radius - 20, 5);
        ctx.restore();
    }

    // Center Cap
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏃', 0, 0);

    ctx.restore();
}

els.btnSpinWheel.addEventListener('click', () => {
    if (state.isSpinning) return;
    audio.init();
    state.isSpinning = true;
    els.btnSpinWheel.disabled = true;
    els.runnerResultBox.style.display = 'none';

    const participants = state.room ? state.room.participants : ['Ersoy', 'Ahmet', 'Can', 'Ayşe'];
    const totalSlices = participants.length;
    const randomRotations = 6 + Math.random() * 4; // 6 to 10 full turns
    const targetSlice = Math.floor(Math.random() * totalSlices);
    const sliceAngle = (2 * Math.PI) / totalSlices;

    // Pointer is at Top (3 * PI / 2)
    const targetAngle = (3 * Math.PI / 2) - (targetSlice * sliceAngle + sliceAngle / 2);
    const finalAngle = state.wheelAngle + (randomRotations * 2 * Math.PI) + (targetAngle - (state.wheelAngle % (2 * Math.PI)));

    let start = null;
    const duration = 4000;
    const initialAngle = state.wheelAngle;
    let lastTickAngle = initialAngle;

    function animateWheel(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        // Ease Out Cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        state.wheelAngle = initialAngle + (finalAngle - initialAngle) * ease;

        if (Math.abs(state.wheelAngle - lastTickAngle) > sliceAngle) {
            audio.tick();
            lastTickAngle = state.wheelAngle;
        }

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animateWheel);
        } else {
            state.isSpinning = false;
            els.btnSpinWheel.disabled = false;
            state.runner = participants[targetSlice];
            showRunnerResult(state.runner);
        }
    }

    requestAnimationFrame(animateWheel);
});

function showRunnerResult(winnerRunner) {
    audio.fanfare();
    if (window.confetti) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }
    els.runnerName.innerText = winnerRunner;
    els.runnerResultBox.style.display = 'block';
    els.runnerResultBox.scrollIntoView({ behavior: 'smooth' });
}

els.btnProceedToOrder.addEventListener('click', () => {
    renderResultScreen();
    navigateTo('screen-result');
});

// --- 10. AFFILIATE & RESULT SCREEN ---
function renderResultScreen() {
    const food = state.winnerFood || FOOD_ITEMS[0];
    const runner = state.runner || (state.user ? state.user.name : 'Ersoy');

    els.finalFoodTitle.innerText = `${food.name}!`;
    els.winnerFoodEmoji.innerText = food.emoji;
    els.winnerFoodName.innerText = food.name;
    els.summaryRunnerName.innerText = runner;

    // Generate Affiliate Search Links
    const query = encodeURIComponent(food.name.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ ]/g, ''));
    const affId = 'neyiyoruz_aff';

    els.linkYemeksepeti.href = `https://www.yemeksepeti.com/search?q=${query}&utm_source=affiliate&utm_medium=neyiyoruz&ref=${affId}`;
    els.linkTrendyol.href = `https://www.trendyol.com/sr?q=${query}&ty_aff=${affId}`;
    els.linkGetir.href = `https://getir.com/yemek/ara/?q=${query}&utm_source=neyiyoruz`;
}

els.btnCopyPromo.addEventListener('click', () => {
    const code = els.btnCopyPromo.dataset.code;
    navigator.clipboard.writeText(code).then(() => {
        els.promoCodeText.innerText = 'KOPYALANDI! ✓';
        setTimeout(() => {
            els.promoCodeText.innerText = code;
        }, 2000);
    });
});

els.btnNewRound.addEventListener('click', () => {
    state.currentCardIndex = 0;
    state.acceptedFoods = [];
    state.runner = null;
    navigateTo('screen-lobby');
});

// --- 11. STICKY BANNER & INIT ---
els.btnCloseBanner.addEventListener('click', () => {
    els.stickyBanner.style.display = 'none';
});

window.addEventListener('DOMContentLoaded', () => {
    // Check saved user
    const saved = localStorage.getItem('neyiyoruz_user');
    if (saved) {
        state.user = JSON.parse(saved);
        els.displayUsername.innerText = state.user.name;
        els.userAvatar.innerText = state.user.avatar;
        els.userBadge.style.display = 'flex';
        navigateTo('screen-lobby');
    } else {
        navigateTo('screen-auth');
    }

    drawWheel();
});
