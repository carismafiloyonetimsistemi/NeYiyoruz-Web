/**
 * Ne Yiyoruz? - Modern Food Decision, Individual Cart & Fair Debt Split App
 * Features:
 * 1. Food / Restaurant Category Decision (Swipe Match)
 * 2. Individual Plates & Custom Dishes per Person (Adana Kebap vs Kuzu Şiş vs Çorba)
 * 3. Fair Split Bill (Kimin ne kadar yediği kuruşu kuruşuna adaletli hesaplanır)
 * 4. WhatsApp / Delivery Order List Copying (Sipariş Notu Tek Tıkla Kopyalanır)
 * 5. Volunteer Runner / Orderer Selection
 * 6. Debt Tracking Book (Kim kime ne kadar borçlu geçmişi)
 */

// --- 1. DEFAULT RESTAURANTS / CUISINES DATASET ---
const DEFAULT_FOODS = [
    { id: 1, name: 'Kebap & Ocakbaşı', category: 'Geleneksel / Ocakbaşı', emoji: '🍢', price: '320 ₺', desc: 'Adana kebap, kuzu şiş, beyti, lahmacun ve meze' },
    { id: 2, name: 'Pizza & İtalyan', category: 'İtalyan / Fast Food', emoji: '🍕', price: '240 ₺', desc: 'İnce hamur karışık pizza, mantarlı, 4 peynirli' },
    { id: 3, name: 'Gurme Burger & Patates', category: 'Amerikan / Fast Food', emoji: '🍔', price: '260 ₺', desc: 'Smash burger, trüflü patates ve çıtır tavuk' },
    { id: 4, name: 'Hatay & Yaprak Döner', category: 'Döner / Sokak Lezzeti', emoji: '🌯', price: '180 ₺', desc: 'Özel soslu lavaş dürüm, iskender ve tombik' },
    { id: 5, name: 'Geleneksel Ev Yemekleri', category: 'Ev Yemekleri / Çorba', emoji: '🍲', price: '160 ₺', desc: 'Mercimek çorbası, kurufasulye, mantı, pilav' },
    { id: 6, name: 'Sushi & Uzak Doğu', category: 'Asya Mutfağı', emoji: '🍣', price: '380 ₺', desc: 'Roll çeşitleri, noodle ve çıtır karides' },
    { id: 7, name: 'Taş Fırın Pide & Lahmacun', category: 'Pide & Taş Fırın', emoji: '🥩', price: '130 ₺', desc: 'Kıymalı, kaşarlı, kuşbaşılı pide ve lahmacun' },
    { id: 8, name: 'Çiğ Köfte & Dürüm', category: 'Pratik / Çiğ Köfte', emoji: '🥬', price: '110 ₺', desc: 'Bol nar ekşisi, yeşillik ve acı soslu dürüm' },
    { id: 9, name: 'Tavuk Dünyası & Makarnalar', category: 'Tavuk / Bistro', emoji: '🍗', price: '220 ₺', desc: 'Kekikli tavuk, kremalı makarna ve akdeniz salatası' },
    { id: 10, name: 'Tatlı & Kahve Kapanışı', category: 'Tatlı / Kafe', emoji: '🍫', price: '150 ₺', desc: 'Sıcak sufle, waffle, baklava ve dondurma' },
];

// Default sample dishes based on selected cuisine
const SAMPLE_DISHES = {
    'Kebap & Ocakbaşı': [
        { dish: 'Adana Kebap (Tek Lavaş) + Şalgam', price: 340 },
        { dish: 'Kuzu Şiş Porsiyon + Ayran', price: 410 },
        { dish: 'Mercimek Çorbası + 2 Lahmacun', price: 260 },
        { dish: 'Beyti Sarma + Kola', price: 380 },
    ],
    'default': [
        { dish: 'Ana Menü + İçecek', price: 250 },
        { dish: 'Dürüm / Tek Porsiyon + Ayran', price: 180 },
        { dish: 'Çorba / Hafif Menü', price: 140 },
        { dish: 'Büyük Boy Menü + Tatlı', price: 320 },
    ]
};

// --- 2. GLOBAL STATE ---
const state = {
    user: null, // { name: 'Ersoy', avatar: '😎', isGuest: true }
    room: null, // { code: '4821', title: 'Ofis Grubu', participants: ['Ersoy', 'Ahmet', 'Can'] }
    foods: JSON.parse(localStorage.getItem('neyiyoruz_custom_foods')) || DEFAULT_FOODS,
    currentCardIndex: 0,
    acceptedFoods: [],
    winnerFood: null,
    runner: null,
    wheelAngle: 0,
    isSpinning: false,
    // Individual plates & Split bill
    splitMode: 'individual', // 'individual' or 'equal'
    plates: [], // [ { person: 'Ersoy', dish: 'Adana Kebap', price: 340, paid: false } ]
    debtsHistory: JSON.parse(localStorage.getItem('neyiyoruz_debts_history')) || [],
};

// --- 3. WEB AUDIO SYNTHESIZER ---
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
    btnOpenMenuManager: document.getElementById('btnOpenMenuManager'),
    menuCountBadge: document.getElementById('menuCountBadge'),
    swipeCardWrapper: document.getElementById('swipeCardWrapper'),
    cardCounter: document.getElementById('cardCounter'),
    btnSwipeLeft: document.getElementById('btnSwipeLeft'),
    btnSwipeRight: document.getElementById('btnSwipeRight'),
    btnSuperLike: document.getElementById('btnSuperLike'),
    btnSkipToWheel: document.getElementById('btnSkipToWheel'),
    btnBackToLobby: document.getElementById('btnBackToLobby'),
    btnOpenQuickAddModal: document.getElementById('btnOpenQuickAddModal'),
    matchModal: document.getElementById('matchModal'),
    modalMatchedFoodName: document.getElementById('modalMatchedFoodName'),
    btnModalGoToWheel: document.getElementById('btnModalGoToWheel'),
    // Runner & Volunteer
    volunteerSelect: document.getElementById('volunteerSelect'),
    btnVolunteerMyself: document.getElementById('btnVolunteerMyself'),
    wheelCanvas: document.getElementById('wheelCanvas'),
    btnSpinWheel: document.getElementById('btnSpinWheel'),
    runnerResultBox: document.getElementById('runnerResultBox'),
    runnerName: document.getElementById('runnerName'),
    btnProceedToOrder: document.getElementById('btnProceedToOrder'),
    // Result & Plates
    finalFoodTitle: document.getElementById('finalFoodTitle'),
    winnerFoodEmoji: document.getElementById('winnerFoodEmoji'),
    winnerFoodName: document.getElementById('winnerFoodName'),
    summaryRunnerName: document.getElementById('summaryRunnerName'),
    btnModeIndividual: document.getElementById('btnModeIndividual'),
    btnModeEqual: document.getElementById('btnModeEqual'),
    individualPlatesContainer: document.getElementById('individualPlatesContainer'),
    equalModeContainer: document.getElementById('equalModeContainer'),
    equalTotalInput: document.getElementById('equalTotalInput'),
    totalCartAmount: document.getElementById('totalCartAmount'),
    cartRunnerDisplay: document.getElementById('cartRunnerDisplay'),
    btnCopyOrderNote: document.getElementById('btnCopyOrderNote'),
    orderNoteCopiedNotice: document.getElementById('orderNoteCopiedNotice'),
    btnSaveDebtSummary: document.getElementById('btnSaveDebtSummary'),
    debtSavedNotice: document.getElementById('debtSavedNotice'),
    // History & Debt Summary
    activeDebtSummaryBox: document.getElementById('activeDebtSummaryBox'),
    votingHistoryList: document.getElementById('votingHistoryList'),
    // Promo & Affiliate
    btnCopyPromo: document.getElementById('btnCopyPromo'),
    promoCodeText: document.getElementById('promoCodeText'),
    linkYemeksepeti: document.getElementById('linkYemeksepeti'),
    linkTrendyol: document.getElementById('linkTrendyol'),
    linkGetir: document.getElementById('linkGetir'),
    btnNewRound: document.getElementById('btnNewRound'),
    stickyBanner: document.getElementById('stickyBanner'),
    btnCloseBanner: document.getElementById('btnCloseBanner'),
    // Menu Manager Modal
    menuManagerModal: document.getElementById('menuManagerModal'),
    btnCloseMenuManager: document.getElementById('btnCloseMenuManager'),
    newFoodNameInput: document.getElementById('newFoodNameInput'),
    newFoodCategoryInput: document.getElementById('newFoodCategoryInput'),
    newFoodEmojiInput: document.getElementById('newFoodEmojiInput'),
    btnAddFoodItem: document.getElementById('btnAddFoodItem'),
    foodItemsManageList: document.getElementById('foodItemsManageList'),
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
        populateVolunteerSelect();
        drawWheel();
    } else if (screenId === 'screen-history') {
        renderHistoryScreen();
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

    els.displayUsername.innerText = state.user.name;
    els.userAvatar.innerText = state.user.avatar;
    els.userBadge.style.display = 'flex';

    navigateTo('screen-lobby');

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
    els.menuCountBadge.innerText = state.foods.length;

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
    const text = encodeURIComponent(`🍕 Ne Yiyoruz? uygulamasına katıl, bugün hangi restoranda ne yiyeceğimizi birlikte seçelim!\n\nOda Kodu: ${state.room.code}\nKatılmak için tıkla: ${shareUrl}`);
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

// --- 8. YEMEK & MUTFAK YÖNETİMİ ---
function renderFoodManageList() {
    els.foodItemsManageList.innerHTML = state.foods.map(item => `
        <div class="food-manage-item">
            <div class="food-manage-left">
                <span class="food-manage-emoji">${item.emoji}</span>
                <div>
                    <strong>${item.name}</strong>
                    <span>${item.category} • ${item.price}</span>
                </div>
            </div>
            <button class="btn-delete-food" onclick="deleteFoodItem(${item.id})" title="Menüden Çıkar">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join('');

    els.menuCountBadge.innerText = state.foods.length;
}

window.deleteFoodItem = function(id) {
    if (state.foods.length <= 2) {
        alert('Oylama için en az 2 seçenek kalmalıdır.');
        return;
    }
    state.foods = state.foods.filter(f => f.id !== id);
    localStorage.setItem('neyiyoruz_custom_foods', JSON.stringify(state.foods));
    renderFoodManageList();
};

els.btnAddFoodItem.addEventListener('click', () => {
    const name = els.newFoodNameInput.value.trim();
    const category = els.newFoodCategoryInput.value.trim() || 'Özel Restoran';
    const emoji = els.newFoodEmojiInput.value.trim() || '🍽️';

    if (!name) return alert('Lütfen restoran/yemek adını yazınız.');

    const newFood = {
        id: Date.now(),
        name: name,
        category: category,
        emoji: emoji,
        price: '220 ₺',
        desc: 'Grup tarafından özel eklenen seçenek'
    };

    state.foods.unshift(newFood);
    localStorage.setItem('neyiyoruz_custom_foods', JSON.stringify(state.foods));

    els.newFoodNameInput.value = '';
    els.newFoodCategoryInput.value = '';
    els.newFoodEmojiInput.value = '';

    renderFoodManageList();
    alert(`"${name}" listeye eklendi!`);
});

els.btnOpenMenuManager.addEventListener('click', () => {
    renderFoodManageList();
    els.menuManagerModal.classList.add('active');
});

els.btnOpenQuickAddModal.addEventListener('click', () => {
    renderFoodManageList();
    els.menuManagerModal.classList.add('active');
});

els.btnCloseMenuManager.addEventListener('click', () => {
    els.menuManagerModal.classList.remove('active');
});

// --- 9. TINDER-STYLE CUISINE / RESTAURANT MATCH (SWIPE) ---
function renderCurrentCard() {
    if (state.currentCardIndex >= state.foods.length) {
        finishFoodMatch();
        return;
    }

    const item = state.foods[state.currentCardIndex];
    els.cardCounter.innerText = `${state.currentCardIndex + 1}/${state.foods.length}`;

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
        const item = state.foods[state.currentCardIndex];
        state.acceptedFoods.push(item);

        if (state.acceptedFoods.length >= 2 || direction === 'super') {
            triggerMatch(item);
            return;
        }
    }

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

    card.addEventListener('touchstart', e => onStart(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', e => onMove(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchend', onEnd);

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

    if (window.confetti) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    els.modalMatchedFoodName.innerText = `${food.emoji} ${food.name}`;
    els.matchModal.classList.add('active');
}

function finishFoodMatch() {
    state.winnerFood = state.acceptedFoods[0] || state.foods[0];
    triggerMatch(state.winnerFood);
}

els.btnModalGoToWheel.addEventListener('click', () => {
    els.matchModal.classList.remove('active');
    navigateTo('screen-wheel');
});

els.btnSkipToWheel.addEventListener('click', () => {
    state.winnerFood = state.foods[0];
    navigateTo('screen-wheel');
});

// --- 10. RUNNER SELECTION: VOLUNTEER OR WHEEL ---
function populateVolunteerSelect() {
    const participants = state.room ? state.room.participants : ['Ersoy', 'Ahmet', 'Can', 'Ayşe'];
    els.volunteerSelect.innerHTML = '<option value="">Gruptan Birini Seç...</option>' + 
        participants.map(p => `<option value="${p}">${p}</option>`).join('');
}

els.btnVolunteerMyself.addEventListener('click', () => {
    const myName = state.user ? state.user.name : 'Ersoy';
    selectRunnerDirectly(myName);
});

els.volunteerSelect.addEventListener('change', (e) => {
    if (e.target.value) {
        selectRunnerDirectly(e.target.value);
    }
});

function selectRunnerDirectly(runnerPerson) {
    audio.fanfare();
    state.runner = runnerPerson;
    showRunnerResult(runnerPerson);
}

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

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, start, end);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.stroke();

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
    const randomRotations = 6 + Math.random() * 4;
    const targetSlice = Math.floor(Math.random() * totalSlices);
    const sliceAngle = (2 * Math.PI) / totalSlices;

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

// --- 11. BİREYSEL TABAKLAR & ADALETLİ HESAP BÖLÜŞÜMÜ (INDIVIDUAL PLATES & FAIR SPLIT) ---
function renderResultScreen() {
    const food = state.winnerFood || state.foods[0];
    const runner = state.runner || (state.user ? state.user.name : 'Ersoy');

    els.finalFoodTitle.innerText = `${food.name}!`;
    els.winnerFoodEmoji.innerText = food.emoji;
    els.winnerFoodName.innerText = food.name;
    els.summaryRunnerName.innerText = runner;
    els.cartRunnerDisplay.innerText = runner;

    // Generate Affiliate Search Links
    const query = encodeURIComponent(food.name.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ ]/g, ''));
    const affId = 'neyiyoruz_aff';

    els.linkYemeksepeti.href = `https://www.yemeksepeti.com/search?q=${query}&utm_source=affiliate&utm_medium=neyiyoruz&ref=${affId}`;
    els.linkTrendyol.href = `https://www.trendyol.com/sr?q=${query}&ty_aff=${affId}`;
    els.linkGetir.href = `https://getir.com/yemek/ara/?q=${query}&utm_source=neyiyoruz`;

    setupPlatesData();
    renderPlatesUI();
}

function setupPlatesData() {
    const participants = state.room ? state.room.participants : ['Ersoy', 'Ahmet', 'Can'];
    const cuisine = state.winnerFood ? state.winnerFood.name : 'default';
    const samples = SAMPLE_DISHES[cuisine] || SAMPLE_DISHES['default'];

    if (state.plates.length !== participants.length) {
        state.plates = participants.map((person, idx) => {
            const sample = samples[idx % samples.length];
            const isRunner = (person === state.runner);
            return {
                person: person,
                dish: sample.dish,
                price: sample.price,
                paid: isRunner, // Runner already paid for everyone
                isRunner: isRunner,
            };
        });
    }
}

function renderPlatesUI() {
    if (state.splitMode === 'individual') {
        els.individualPlatesContainer.style.display = 'flex';
        els.equalModeContainer.style.display = 'none';

        els.individualPlatesContainer.innerHTML = state.plates.map((plate, index) => `
            <div class="individual-plate-item">
                <div class="plate-user-header">
                    <div class="plate-user-title">
                        <i class="fa-solid fa-user-circle text-orange"></i>
                        <span>${plate.person} ${plate.isRunner ? '<span style="color:#fbbf24; font-size:12px;">(Siparişçi / Ödeyen)</span>' : ''}</span>
                    </div>
                </div>

                <div class="plate-inputs-row">
                    <input type="text" class="plate-dish-input" value="${plate.dish}" placeholder="Yiyeceği yemek..." 
                           onchange="updatePlateDish(${index}, this.value)">
                    <input type="number" class="plate-price-input" value="${plate.price}" placeholder="Tutar ₺" 
                           oninput="updatePlatePrice(${index}, this.value)">
                </div>

                <div class="plate-status-row">
                    <button class="debt-status-btn ${plate.paid ? 'status-paid' : 'status-debt'}" onclick="togglePlatePaid(${index})">
                        ${plate.paid ? '✓ Ödedi' : '❌ Borçlu (' + plate.price + ' ₺)'}
                    </button>
                </div>
            </div>
        `).join('');

        // Compute Total Cart
        const total = state.plates.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
        els.totalCartAmount.innerText = `${total} ₺`;
    } else {
        // Equal Split Mode
        els.individualPlatesContainer.style.display = 'none';
        els.equalModeContainer.style.display = 'block';

        const equalTotal = parseFloat(els.equalTotalInput.value) || 0;
        const count = state.plates.length || 1;
        const perPerson = Math.round(equalTotal / count);

        els.totalCartAmount.innerText = `${equalTotal} ₺ (Kişi başı: ${perPerson} ₺)`;
    }
}

// Mode Toggles
els.btnModeIndividual.addEventListener('click', () => {
    state.splitMode = 'individual';
    els.btnModeIndividual.classList.add('active');
    els.btnModeEqual.classList.remove('active');
    renderPlatesUI();
});

els.btnModeEqual.addEventListener('click', () => {
    state.splitMode = 'equal';
    els.btnModeEqual.classList.add('active');
    els.btnModeIndividual.classList.remove('active');
    renderPlatesUI();
});

els.equalTotalInput.addEventListener('input', () => {
    renderPlatesUI();
});

window.updatePlateDish = function(index, value) {
    if (state.plates[index]) {
        state.plates[index].dish = value;
    }
};

window.updatePlatePrice = function(index, value) {
    if (state.plates[index]) {
        state.plates[index].price = parseFloat(value) || 0;
        renderPlatesUI();
    }
};

window.togglePlatePaid = function(index) {
    if (state.plates[index]) {
        state.plates[index].paid = !state.plates[index].paid;
        renderPlatesUI();
    }
};

// --- SIPARIS LISTESI & NOTUNU KOPYALA ---
els.btnCopyOrderNote = function() {
    const runner = state.runner || 'Ersoy';
    const cuisine = state.winnerFood ? state.winnerFood.name : 'Yemek';
    
    let text = `📋 Ne Yiyoruz Sipariş Özeti (${cuisine}):\n`;
    text += `Siparişi Veren: ${runner}\n`;
    text += `---------------------------------\n`;

    let total = 0;
    state.plates.forEach(p => {
        text += `• ${p.person}: ${p.dish} (${p.price} ₺)\n`;
        total += parseFloat(p.price) || 0;
    });

    text += `---------------------------------\n`;
    text += `TOPLAM HESAP: ${total} ₺\n`;
    text += `Borçlular: ${state.plates.filter(p => !p.paid && !p.isRunner).map(p => p.person + ' (' + p.price + ' ₺)').join(', ') || 'Yok (Herkes Ödedi)'}`;

    navigator.clipboard.writeText(text).then(() => {
        els.orderNoteCopiedNotice.style.display = 'block';
        setTimeout(() => {
            els.orderNoteCopiedNotice.style.display = 'none';
        }, 3000);
    });
};
document.getElementById('btnCopyOrderNote').addEventListener('click', els.btnCopyOrderNote);

// --- BORCLARI KAYDET ---
els.btnSaveDebtSummary.addEventListener('click', () => {
    const runner = state.runner || 'Ersoy';
    const total = state.plates.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);

    const record = {
        id: Date.now(),
        date: new Date().toLocaleDateString('tr-TR'),
        cuisine: state.winnerFood ? state.winnerFood.name : 'Yemek',
        runner: runner,
        total: total,
        plates: state.plates.map(p => ({
            person: p.person,
            dish: p.dish,
            price: p.price,
            paid: p.paid,
            isRunner: p.isRunner
        })),
    };

    state.debtsHistory.unshift(record);
    localStorage.setItem('neyiyoruz_debts_history', JSON.stringify(state.debtsHistory));

    els.debtSavedNotice.style.display = 'block';
    setTimeout(() => {
        els.debtSavedNotice.style.display = 'none';
    }, 3000);
});

// --- 12. HISTORY & DEBT SCREEN RENDERING ---
function renderHistoryScreen() {
    // 1. Calculate Active Debts based on individual plates
    const unpaidMap = {}; // { 'Ersoy': { to: 'Ahmet', amount: 340 } }

    state.debtsHistory.forEach(record => {
        record.plates.forEach(p => {
            if (!p.paid && !p.isRunner) {
                const key = `${p.person} ➔ ${record.runner}`;
                if (!unpaidMap[key]) unpaidMap[key] = 0;
                unpaidMap[key] += p.price;
            }
        });
    });

    const debtEntries = Object.entries(unpaidMap);
    if (debtEntries.length === 0) {
        els.activeDebtSummaryBox.innerHTML = `
            <div class="small-text text-center py-2" style="color:#34d399;">
                🎉 Harika! Kimsenin borcu bulunmuyor, tüm hesaplar kapalı.
            </div>
        `;
    } else {
        els.activeDebtSummaryBox.innerHTML = debtEntries.map(([debtPair, amount]) => `
            <div class="debt-summary-item">
                <span><strong>${debtPair}</strong></span>
                <span class="debt-badge-red">${amount} ₺ Borç</span>
            </div>
        `).join('');
    }

    // 2. Voting & Session History with Plate Breakdown
    if (state.debtsHistory.length === 0) {
        els.votingHistoryList.innerHTML = `
            <div class="small-text text-center py-2">Henüz kaydedilmiş bir sipariş geçmişi yok.</div>
        `;
    } else {
        els.votingHistoryList.innerHTML = state.debtsHistory.map(h => `
            <div class="history-item">
                <div class="history-left">
                    <strong>${h.cuisine} (${h.total} ₺)</strong>
                    <span>Tarih: ${h.date} • Siparişçi: ${h.runner}</span>
                </div>
                <div class="history-breakdown">
                    ${h.plates.map(p => `• ${p.person}: ${p.dish} (${p.price} ₺) [${p.paid ? 'Ödedi' : 'Borçlu'}]`).join('<br>')}
                </div>
            </div>
        `).join('');
    }
}

// --- 13. PROMO & INIT ---
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
    state.plates = [];
    navigateTo('screen-lobby');
});

els.btnCloseBanner.addEventListener('click', () => {
    els.stickyBanner.style.display = 'none';
});

window.addEventListener('DOMContentLoaded', () => {
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

    renderFoodManageList();
    drawWheel();
});
