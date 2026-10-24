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
    swipeHistory: [],
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
    btnShowLogin: document.getElementById('btnShowLogin'),
    emailAuthModal: document.getElementById('emailAuthModal'),
    btnCloseAuthModal: document.getElementById('btnCloseAuthModal'),
    tabLoginBtn: document.getElementById('tabLoginBtn'),
    tabRegisterBtn: document.getElementById('tabRegisterBtn'),
    authModalHeaderTitle: document.getElementById('authModalHeaderTitle'),
    authAlert: document.getElementById('authAlert'),
    authAlertText: document.getElementById('authAlertText'),
    emailAuthForm: document.getElementById('emailAuthForm'),
    authNameGroup: document.getElementById('authNameGroup'),
    authNameInput: document.getElementById('authNameInput'),
    authEmailInput: document.getElementById('authEmailInput'),
    authPasswordInput: document.getElementById('authPasswordInput'),
    btnTogglePassword: document.getElementById('btnTogglePassword'),
    pwdEyeIcon: document.getElementById('pwdEyeIcon'),
    btnAuthSubmit: document.getElementById('btnAuthSubmit'),
    authSwitchPrompt: document.getElementById('authSwitchPrompt'),
    btnToggleAuthMode: document.getElementById('btnToggleAuthMode'),
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
    btnModalGoToCart: document.getElementById('btnModalGoToCart'),
    btnModalKeepSwiping: document.getElementById('btnModalKeepSwiping'),
    matchModalHeading: document.getElementById('matchModalHeading'),
    matchModalSubDesc: document.getElementById('matchModalSubDesc'),
    matchModalSubtext: document.getElementById('matchModalSubtext'),
    btnSwipeUndo: document.getElementById('btnSwipeUndo'),
    btnShowLikedChoices: document.getElementById('btnShowLikedChoices'),
    likedCountBadge: document.getElementById('likedCountBadge'),
    btnBackFromWheelToSwipe: document.getElementById('btnBackFromWheelToSwipe'),
    btnBackFromWheelToLobby: document.getElementById('btnBackFromWheelToLobby'),
    btnBackFromResultToWheel: document.getElementById('btnBackFromResultToWheel'),
    btnBackFromResultToSwipe: document.getElementById('btnBackFromResultToSwipe'),
    btnBackFromResultToLobby: document.getElementById('btnBackFromResultToLobby'),
    btnBackFromHistory: document.getElementById('btnBackFromHistory'),
    btnChangeWinnerCuisine: document.getElementById('btnChangeWinnerCuisine'),
    winnerDecisionTag: document.getElementById('winnerDecisionTag'),
    cuisineChangeModal: document.getElementById('cuisineChangeModal'),
    cuisineSelectList: document.getElementById('cuisineSelectList'),
    btnCloseCuisineModal: document.getElementById('btnCloseCuisineModal'),
    likedChoicesModal: document.getElementById('likedChoicesModal'),
    likedFoodsGrid: document.getElementById('likedFoodsGrid'),
    btnCloseLikedModal: document.getElementById('btnCloseLikedModal'),
    btnSpinWheelLikedFoods: document.getElementById('btnSpinWheelLikedFoods'),
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
    newFoodCategorySelect: document.getElementById('newFoodCategorySelect'),
    newFoodPriceInput: document.getElementById('newFoodPriceInput'),
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

// --- 6. GUEST & SUPABASE CLOUD AUTH ---
const SUPABASE_CONFIG = {
    url: 'https://cavkyexsgoytjndoafmt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdmt5ZXhzZ295dGpuZG9hZm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM2NzMsImV4cCI6MjA4MTUyOTY3M30.SvgxizvwSjkpe1j8Tpq1n7aLxFrH8C2_jZCatvJYhjo'
};

let supabaseClient = null;
try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }
} catch (e) {
    console.warn('Supabase initialization warning:', e);
}

let currentAuthMode = 'login'; // 'login' or 'register'

// Seed initial registered users if not present
function getRegisteredUsers() {
    try {
        const stored = localStorage.getItem('neyiyoruz_registered_users');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error reading registered users', e);
    }
    // Default initial demo user
    const initialUsers = [
        {
            name: 'Ersoy',
            email: 'ersoy@neyiyoruz.com',
            password: 'password123',
            avatar: '👨‍🍳',
            isGuest: false,
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('neyiyoruz_registered_users', JSON.stringify(initialUsers));
    return initialUsers;
}

function saveRegisteredUser(user) {
    const users = getRegisteredUsers();
    users.push(user);
    localStorage.setItem('neyiyoruz_registered_users', JSON.stringify(users));
}

function setUserSession(user) {
    state.user = user;
    localStorage.setItem('neyiyoruz_user', JSON.stringify(user));

    els.displayUsername.innerText = state.user.name;
    els.userAvatar.innerText = state.user.avatar || '😎';
    els.userBadge.style.display = 'flex';

    navigateTo('screen-lobby');

    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
        joinRoom(roomParam);
    }
}

function loginAsGuest(name) {
    audio.init();
    const cleanName = (name || 'Misafir').trim();
    const guestUser = {
        name: cleanName,
        avatar: ['😎', '🍕', '🚀', '🔥', '🦁', '🌟'][Math.floor(Math.random() * 6)],
        isGuest: true,
    };
    setUserSession(guestUser);
}

function showAuthAlert(msg, isSuccess = false) {
    els.authAlert.style.display = 'flex';
    els.authAlert.className = 'auth-alert' + (isSuccess ? ' success' : '');
    els.authAlertText.innerText = msg;
    const icon = els.authAlert.querySelector('.auth-alert-icon');
    if (icon) {
        icon.className = isSuccess ? 'fa-solid fa-circle-check auth-alert-icon' : 'fa-solid fa-circle-exclamation auth-alert-icon';
    }
}

function clearAuthAlert() {
    els.authAlert.style.display = 'none';
    els.authAlertText.innerText = '';
}

function setAuthMode(mode) {
    currentAuthMode = mode;
    clearAuthAlert();

    if (mode === 'login') {
        els.tabLoginBtn.classList.add('active');
        els.tabRegisterBtn.classList.remove('active');
        els.authModalHeaderTitle.innerText = 'Hesabına Giriş Yap';
        els.authNameGroup.style.display = 'none';
        els.authNameInput.removeAttribute('required');
        els.btnAuthSubmit.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Giriş Yap';
        els.authSwitchPrompt.innerText = 'Hesabın yok mu?';
        els.btnToggleAuthMode.innerText = 'Hemen Ücretsiz Kayıt Ol';
    } else {
        els.tabLoginBtn.classList.remove('active');
        els.tabRegisterBtn.classList.add('active');
        els.authModalHeaderTitle.innerText = 'Yeni Hesap Oluştur';
        els.authNameGroup.style.display = 'block';
        els.authNameInput.setAttribute('required', 'required');
        els.btnAuthSubmit.innerHTML = '<i class="fa-solid fa-user-plus"></i> Kayıt Ol ve Başla';
        els.authSwitchPrompt.innerText = 'Zaten hesabın var mı?';
        els.btnToggleAuthMode.innerText = 'Giriş Yap';
    }
}

function openAuthModal(mode = 'login') {
    audio.init();
    setAuthMode(mode);
    els.emailAuthModal.classList.add('active');
    setTimeout(() => {
        if (mode === 'register') {
            els.authNameInput.focus();
        } else {
            els.authEmailInput.focus();
        }
    }, 100);
}

function closeAuthModal() {
    els.emailAuthModal.classList.remove('active');
    clearAuthAlert();
    els.emailAuthForm.reset();
    els.authPasswordInput.type = 'password';
    els.pwdEyeIcon.className = 'fa-solid fa-eye';
}

async function handleAuthSubmit() {
    audio.init();
    clearAuthAlert();

    const email = (els.authEmailInput.value || '').trim().toLowerCase();
    const password = (els.authPasswordInput.value || '').trim();
    const name = (els.authNameInput.value || '').trim();

    // Validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showAuthAlert('Lütfen geçerli bir e-posta adresi giriniz (Örn: adiniz@ornek.com).');
        els.authEmailInput.focus();
        return;
    }

    if (!password || password.length < 6) {
        showAuthAlert('Şifre en az 6 karakter uzunluğunda olmalıdır.');
        els.authPasswordInput.focus();
        return;
    }

    if (currentAuthMode === 'register') {
        if (!name) {
            showAuthAlert('Lütfen adınızı veya lakabınızı giriniz.');
            els.authNameInput.focus();
            return;
        }

        els.btnAuthSubmit.disabled = true;
        els.btnAuthSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Kayıt Yapılıyor...';

        const avatars = ['😎', '🍕', '🚀', '🔥', '🦁', '🌟', '👨‍🍳', '🍲', '🥑', '🌮'];
        const avatar = avatars[Math.floor(Math.random() * avatars.length)];

        // Try Supabase Auth First
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: name,
                            avatar: avatar
                        }
                    }
                });

                if (error) {
                    throw error;
                }

                const newUser = {
                    id: data.user ? data.user.id : Date.now().toString(),
                    name: name,
                    email: email,
                    avatar: avatar,
                    isGuest: false,
                    provider: 'supabase',
                    createdAt: new Date().toISOString()
                };

                saveRegisteredUser(newUser);

                if (data.session) {
                    showAuthAlert('Supabase hesabı oluşturuldu! Giriş yapılıyor...', true);
                    audio.fanfare();
                    setTimeout(() => {
                        closeAuthModal();
                        setUserSession(newUser);
                    }, 600);
                } else {
                    showAuthAlert('Hesabınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.', true);
                    audio.fanfare();
                    setTimeout(() => {
                        setAuthMode('login');
                        els.authEmailInput.value = email;
                        els.authPasswordInput.value = password;
                    }, 1200);
                }
                return;
            } catch (err) {
                console.warn('Supabase register error:', err);
                const errMsg = err.message || '';
                if (errMsg.includes('already registered')) {
                    showAuthAlert('Bu e-posta adresiyle zaten kayıtlı bir hesap var! Giriş yapabilirsiniz.');
                    return;
                } else if (errMsg.includes('Failed to fetch') || errMsg.includes('521') || errMsg.includes('NetworkError')) {
                    showAuthAlert('Supabase sunucusu şu an aktif ediliyor / uyanıyor. Lütfen 1 dakika sonra tekrar deneyiniz.');
                    return;
                }
                // Fallback to local
                const users = getRegisteredUsers();
                if (users.find(u => u.email.toLowerCase() === email)) {
                    showAuthAlert('Bu e-posta adresiyle zaten kayıtlı bir hesap var! Giriş yapabilirsiniz.');
                    return;
                }
                const localUser = {
                    name: name,
                    email: email,
                    password: password,
                    avatar: avatar,
                    isGuest: false,
                    provider: 'local',
                    createdAt: new Date().toISOString()
                };
                saveRegisteredUser(localUser);
                showAuthAlert('Hesap yerel hafızaya kaydedildi! Giriş yapılıyor...', true);
                audio.fanfare();
                setTimeout(() => {
                    closeAuthModal();
                    setUserSession(localUser);
                }, 600);
                return;
            } finally {
                els.btnAuthSubmit.disabled = false;
                els.btnAuthSubmit.innerHTML = '<i class="fa-solid fa-user-plus"></i> Kayıt Ol ve Başla';
            }
        }
    } else {
        // LOGIN MODE
        els.btnAuthSubmit.disabled = true;
        els.btnAuthSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Giriş Yapılıyor...';

        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    throw error;
                }

                if (data && data.user) {
                    const fullName = data.user.user_metadata?.full_name || email.split('@')[0];
                    const avatar = data.user.user_metadata?.avatar || '👨‍🍳';

                    const userObj = {
                        id: data.user.id,
                        name: fullName,
                        email: data.user.email,
                        avatar: avatar,
                        isGuest: false,
                        provider: 'supabase'
                    };

                    saveRegisteredUser(userObj);
                    showAuthAlert(`Hoş geldin ${userObj.name}! Giriş başarılı...`, true);
                    audio.fanfare();

                    setTimeout(() => {
                        closeAuthModal();
                        setUserSession(userObj);
                    }, 500);
                    return;
                }
            } catch (err) {
                console.warn('Supabase login error, checking local store:', err);
                const errMsg = err.message || '';

                // Check local user database fallback (e.g. demo account or locally saved)
                const localUser = getRegisteredUsers().find(u => u.email.toLowerCase() === email && u.password === password);
                if (localUser) {
                    showAuthAlert(`Hoş geldin ${localUser.name}! Giriş başarılı...`, true);
                    audio.fanfare();
                    setTimeout(() => {
                        closeAuthModal();
                        setUserSession(localUser);
                    }, 500);
                    return;
                }

                if (errMsg.includes('Invalid login credentials')) {
                    showAuthAlert('E-posta veya şifre hatalı! Lütfen bilgilerinizi kontrol ediniz.');
                } else if (errMsg.includes('Email not confirmed')) {
                    showAuthAlert('E-posta henüz onaylanmamış! Lütfen gelen kutunuzdaki onay linkine tıklayınız (veya Supabase panelinde "Confirm email" ayarını kapatınız).');
                } else if (errMsg.includes('Failed to fetch') || errMsg.includes('521') || errMsg.includes('NetworkError')) {
                    showAuthAlert('Supabase sunucusu şu an aktif ediliyor / uyanıyor. Lütfen 1 dakika sonra tekrar deneyiniz.');
                } else {
                    showAuthAlert(errMsg || 'Giriş yapılamadı.');
                }
                return;
            } finally {
                els.btnAuthSubmit.disabled = false;
                els.btnAuthSubmit.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Giriş Yap';
            }
        }
    }
}

// Event Listeners for Auth
if (els.btnShowLogin) {
    els.btnShowLogin.addEventListener('click', () => openAuthModal('login'));
}

if (els.btnCloseAuthModal) {
    els.btnCloseAuthModal.addEventListener('click', closeAuthModal);
}

if (els.tabLoginBtn) {
    els.tabLoginBtn.addEventListener('click', () => setAuthMode('login'));
}

if (els.tabRegisterBtn) {
    els.tabRegisterBtn.addEventListener('click', () => setAuthMode('register'));
}

if (els.btnToggleAuthMode) {
    els.btnToggleAuthMode.addEventListener('click', () => {
        setAuthMode(currentAuthMode === 'login' ? 'register' : 'login');
    });
}

if (els.btnTogglePassword) {
    els.btnTogglePassword.addEventListener('click', () => {
        const isPassword = els.authPasswordInput.type === 'password';
        els.authPasswordInput.type = isPassword ? 'text' : 'password';
        els.pwdEyeIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
}

if (els.emailAuthForm) {
    els.emailAuthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAuthSubmit();
    });
}

if (els.emailAuthModal) {
    els.emailAuthModal.addEventListener('click', (e) => {
        if (e.target === els.emailAuthModal) {
            closeAuthModal();
        }
    });
}

els.btnGuestStart.addEventListener('click', () => {
    const val = els.guestNameInput.value;
    loginAsGuest(val || 'Misafir Gurme');
});

els.logoutBtn.addEventListener('click', async () => {
    if (supabaseClient) {
        try {
            await supabaseClient.auth.signOut();
        } catch (e) {}
    }
    localStorage.removeItem('neyiyoruz_user');
    state.user = null;
    els.userBadge.style.display = 'none';
    navigateTo('screen-auth');
});

// Helper for active room participants
function getActiveParticipants() {
    if (state.room && state.room.participants && state.room.participants.length > 0) {
        return state.room.participants;
    }
    const currentName = state.user ? state.user.name : 'Siz';
    return [currentName];
}

// --- 7. ROOM SYSTEM ---
function createRoom(title) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const roomTitle = title || 'Günün Yemeği';
    const currentUserName = state.user ? state.user.name : 'Siz';
    const participants = [currentUserName];

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
    
    let participants = [userName];
    if (state.room && state.room.code === code) {
        participants = state.room.participants;
        if (!participants.includes(userName)) {
            participants.push(userName);
        }
    }

    state.room = {
        code: code,
        title: state.room?.title || ('Lezzet Grubu #' + code),
        participants: participants,
    };

    renderActiveRoom();
}

window.addParticipantToRoom = function(name) {
    const clean = (name || '').trim();
    if (!clean) return;
    if (!state.room) {
        createRoom('Yemek Grubu');
    }
    if (!state.room.participants.includes(clean)) {
        state.room.participants.push(clean);
        renderActiveRoom();
        if (state.plates) {
            setupPlatesData();
            renderPlatesUI();
        }
    }
};

window.removeParticipantFromRoom = function(index) {
    if (state.room && state.room.participants.length > 1) {
        state.room.participants.splice(index, 1);
        renderActiveRoom();
        if (state.plates) {
            setupPlatesData();
            renderPlatesUI();
        }
    }
};

function renderActiveRoom() {
    els.activeRoomBox.style.display = 'block';
    els.currentRoomTitle.innerText = state.room.title;
    els.currentRoomCodeBadge.innerText = state.room.code;
    els.participantCount.innerText = state.room.participants.length;
    els.menuCountBadge.innerText = state.foods.length;

    els.participantsList.innerHTML = state.room.participants.map((p, idx) => `
        <span class="chip">
            <i class="fa-solid fa-circle-user text-orange"></i> ${p}
            ${state.room.participants.length > 1 ? `
                <button type="button" class="chip-delete-btn" onclick="removeParticipantFromRoom(${idx})" title="Odadakilerden Çıkar">&times;</button>
            ` : ''}
        </span>
    `).join('') + `
        <button type="button" class="chip-add-btn" id="btnQuickAddFriend">
            <i class="fa-solid fa-user-plus"></i> + Kişi Ekle
        </button>
    `;

    const addBtn = document.getElementById('btnQuickAddFriend');
    if (addBtn) {
        addBtn.onclick = () => {
            const name = prompt('Odaya eklenecek kişinin adını yazın:');
            if (name && name.trim()) {
                window.addParticipantToRoom(name.trim());
            }
        };
    }

    drawWheel();
    populateVolunteerSelect();
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
const FOOD_CATEGORIES = [
    { name: 'Kebap & Ocakbaşı', emoji: '🍢' },
    { name: 'Pizza & İtalyan', emoji: '🍕' },
    { name: 'Burger & Fast Food', emoji: '🍔' },
    { name: 'Döner & Sokak Lezzeti', emoji: '🌯' },
    { name: 'Ev Yemekleri & Çorba', emoji: '🍲' },
    { name: 'Pide & Taş Fırın', emoji: '🥩' },
    { name: 'Sushi & Uzak Doğu', emoji: '🍣' },
    { name: 'Çiğ Köfte & Dürüm', emoji: '🥬' },
    { name: 'Tavuk & Bistro', emoji: '🍗' },
    { name: 'Tatlı & Kafe', emoji: '🍫' },
    { name: 'Sandviç & Kahvaltı', emoji: '🥪' },
    { name: 'Salata & Sağlıklı', emoji: '🥗' },
    { name: 'Diğer Lezzetler', emoji: '🍽️' },
];

const PRICE_TIERS = ['100 ₺', '120 ₺', '160 ₺', '200 ₺', '250 ₺', '320 ₺', '400 ₺', '500 ₺'];

function renderFoodManageList() {
    els.foodItemsManageList.innerHTML = state.foods.map(item => {
        const numericPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 200;
        return `
        <div class="food-manage-item">
            <div class="food-manage-left">
                <span class="food-manage-emoji">${item.emoji}</span>
                <div class="food-manage-info">
                    <strong>${item.name}</strong>
                    <div class="food-manage-selects">
                        <select class="manage-select" onchange="updateItemCategory(${item.id}, this.value)">
                            ${FOOD_CATEGORIES.map(c => `<option value="${c.name}" ${item.category === c.name ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('')}
                        </select>
                        <div class="manage-price-box" title="Fiyatı doğrudan değiştirebilir, zam geldiğinde buradan güncelleyebilirsiniz">
                            <input type="number" class="manage-price-input" 
                                   value="${numericPrice}" 
                                   placeholder="Fiyat" 
                                   min="0" step="5"
                                   oninput="updateItemPrice(${item.id}, this.value)"
                                   onchange="updateItemPrice(${item.id}, this.value)">
                            <span class="manage-price-currency">₺</span>
                        </div>
                    </div>
                </div>
            </div>
            <button class="btn-delete-food" onclick="deleteFoodItem(${item.id})" title="Menüden Çıkar">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
        `;
    }).join('');

    els.menuCountBadge.innerText = state.foods.length;
}

window.updateItemCategory = function(id, newCat) {
    const item = state.foods.find(f => f.id === id);
    if (item) {
        item.category = newCat;
        const matched = FOOD_CATEGORIES.find(c => c.name === newCat);
        if (matched) item.emoji = matched.emoji;
        localStorage.setItem('neyiyoruz_custom_foods', JSON.stringify(state.foods));
        renderFoodManageList();
    }
};

window.updateItemPrice = function(id, newPrice) {
    const item = state.foods.find(f => f.id === id);
    if (item) {
        const num = parseFloat(newPrice) || 0;
        item.price = `${num} ₺`;
        localStorage.setItem('neyiyoruz_custom_foods', JSON.stringify(state.foods));
    }
};

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
    const category = els.newFoodCategorySelect.value;
    const priceNum = parseFloat(els.newFoodPriceInput.value) || 200;
    const price = `${priceNum} ₺`;
    
    const matchedCategory = FOOD_CATEGORIES.find(c => c.name === category);
    const emoji = matchedCategory ? matchedCategory.emoji : '🍽️';

    if (!name) return alert('Lütfen restoran veya yemek adını yazınız.');

    const newFood = {
        id: Date.now(),
        name: name,
        category: category,
        emoji: emoji,
        price: price,
        desc: `${category} kategorisinde özel seçim`
    };

    state.foods.unshift(newFood);
    localStorage.setItem('neyiyoruz_custom_foods', JSON.stringify(state.foods));

    els.newFoodNameInput.value = '';
    renderFoodManageList();
    alert(`"${name}" (${price}) listeye eklendi!`);
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

    const currentItem = state.foods[state.currentCardIndex];
    if (!currentItem) return;

    // Record in history for UNDO
    state.swipeHistory.push({
        index: state.currentCardIndex,
        item: currentItem,
        direction: direction
    });

    const participants = getActiveParticipants();
    const isSolo = (participants.length <= 1);

    if (direction === 'right' || direction === 'super') {
        if (!state.acceptedFoods.some(f => f.id === currentItem.id)) {
            state.acceptedFoods.push(currentItem);
        }
        if (els.likedCountBadge) {
            els.likedCountBadge.innerText = state.acceptedFoods.length;
        }
        if (els.btnShowLikedChoices) {
            els.btnShowLikedChoices.style.display = 'block';
        }

        // In Super Like: user explicitly declares this as their choice!
        if (direction === 'super') {
            triggerMatch(currentItem);
            return;
        }

        // In Solo Mode: do NOT trigger a premature popup while user is just swiping through cards!
        // Only in multi-person group room, check for room consensus
        if (!isSolo) {
            // In a group room, if at least 2 people liked the same food, trigger match
            if (state.acceptedFoods.length >= 2) {
                triggerMatch(currentItem);
                return;
            }
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

// Geri Al (Undo Last Swipe)
function undoLastSwipe() {
    if (!state.swipeHistory || state.swipeHistory.length === 0) {
        alert('Geri alınacak önceki bir seçim yok.');
        return;
    }
    const lastAction = state.swipeHistory.pop();
    state.currentCardIndex = lastAction.index;

    // If it was accepted, remove from acceptedFoods
    if (lastAction.direction === 'right' || lastAction.direction === 'super') {
        state.acceptedFoods = state.acceptedFoods.filter(f => f.id !== lastAction.item.id);
        if (els.likedCountBadge) {
            els.likedCountBadge.innerText = state.acceptedFoods.length;
        }
        if (state.acceptedFoods.length === 0 && els.btnShowLikedChoices) {
            els.btnShowLikedChoices.style.display = 'none';
        }
    }

    audio.tick();
    renderCurrentCard();
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

    const participants = getActiveParticipants();
    const isSolo = (participants.length <= 1);

    if (els.matchModalHeading) {
        els.matchModalHeading.innerText = isSolo ? '✨ HARİKA SEÇİM!' : '🎉 MUTFAKTA ANLAŞILDI!';
    }
    if (els.matchModalSubDesc) {
        els.matchModalSubDesc.innerText = isSolo ? 'Bugün ne yiyeceğine karar verdin:' : 'Gruptaki herkes bu lezzette buluştu:';
    }
    if (els.matchModalSubtext) {
        els.matchModalSubtext.innerText = isSolo 
            ? 'Şimdi ister tabaklarını belirle, ister siparişçiyi kura ile seç!'
            : 'Şimdi siparişçiyi seçip tabaklarımızı belirleyelim!';
    }

    els.modalMatchedFoodName.innerText = `${food.emoji} ${food.name}`;
    els.matchModal.classList.add('active');
}

function finishFoodMatch() {
    if (state.acceptedFoods.length === 0) {
        // No food liked, offer restart or first food
        const restart = confirm('Hiçbir mutfağı beğenmediniz. Kartları baştan oylamak ister misiniz?');
        if (restart) {
            state.currentCardIndex = 0;
            state.swipeHistory = [];
            state.acceptedFoods = [];
            if (els.btnShowLikedChoices) els.btnShowLikedChoices.style.display = 'none';
            renderCurrentCard();
            return;
        }
        state.winnerFood = state.foods[0];
        triggerMatch(state.winnerFood);
    } else if (state.acceptedFoods.length === 1) {
        state.winnerFood = state.acceptedFoods[0];
        triggerMatch(state.winnerFood);
    } else {
        // Multiple liked foods: let user pick or spin
        openLikedChoicesModal();
    }
}

// Modal Actions
if (els.btnModalGoToWheel) {
    els.btnModalGoToWheel.addEventListener('click', () => {
        els.matchModal.classList.remove('active');
        navigateTo('screen-wheel');
    });
}

if (els.btnModalGoToCart) {
    els.btnModalGoToCart.addEventListener('click', () => {
        els.matchModal.classList.remove('active');
        renderResultScreen();
        navigateTo('screen-result');
    });
}

if (els.btnModalKeepSwiping) {
    els.btnModalKeepSwiping.addEventListener('click', () => {
        els.matchModal.classList.remove('active');
    });
}

if (els.btnSwipeUndo) {
    els.btnSwipeUndo.addEventListener('click', undoLastSwipe);
}

if (els.btnShowLikedChoices) {
    els.btnShowLikedChoices.addEventListener('click', openLikedChoicesModal);
}

els.btnSkipToWheel.addEventListener('click', () => {
    state.winnerFood = state.acceptedFoods[0] || state.foods[0];
    navigateTo('screen-wheel');
});

// --- 10. RUNNER SELECTION: VOLUNTEER OR WHEEL ---
function populateVolunteerSelect() {
    const participants = getActiveParticipants();
    els.volunteerSelect.innerHTML = '<option value="">Gruptan Birini Seç...</option>' + 
        participants.map(p => `<option value="${p}">${p}</option>`).join('');
}

els.btnVolunteerMyself.addEventListener('click', () => {
    const myName = state.user ? state.user.name : (getActiveParticipants()[0] || 'Ben');
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
    const participants = getActiveParticipants();
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

    const participants = getActiveParticipants();
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
    const food = state.winnerFood || (state.acceptedFoods && state.acceptedFoods[0]) || state.foods[0];
    state.winnerFood = food;
    const participants = getActiveParticipants();
    const runner = state.runner || (state.user ? state.user.name : (participants[0] || 'Siparişçi'));

    els.finalFoodTitle.innerText = `${food.name}!`;
    els.winnerFoodEmoji.innerText = food.emoji;
    els.winnerFoodName.innerText = food.name;
    els.summaryRunnerName.innerText = runner;
    els.cartRunnerDisplay.innerText = runner;

    const isSolo = (participants.length <= 1);
    if (els.winnerDecisionTag) {
        els.winnerDecisionTag.innerText = isSolo ? '✨ Senin Seçimin' : '🔥 Grubun Ortak Kararı';
    }

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
    const participants = getActiveParticipants();
    const cuisine = state.winnerFood ? state.winnerFood.name : 'default';
    const samples = SAMPLE_DISHES[cuisine] || SAMPLE_DISHES['default'];

    if (state.plates.length !== participants.length) {
        state.plates = participants.map((person, idx) => {
            const sample = samples[idx % samples.length];
            const isRunner = (person === state.runner);
            return {
                person: person,
                isRunner: isRunner,
                paid: isRunner,
                items: [
                    { id: 'it_' + Date.now() + '_' + idx, name: sample.dish, price: sample.price, emoji: '🍽️', type: 'food' }
                ]
            };
        });
    } else {
        // Ensure legacy plates have items array
        state.plates.forEach((p, idx) => {
            if (!p.items || !Array.isArray(p.items)) {
                p.items = [
                    { id: 'it_' + Date.now() + '_' + idx, name: p.dish || 'Ana Menü', price: parseFloat(p.price) || 200, emoji: '🍽️', type: 'food' }
                ];
            }
        });
    }
}

function renderPlatesUI() {
    if (state.splitMode === 'individual') {
        els.individualPlatesContainer.style.display = 'flex';
        els.equalModeContainer.style.display = 'none';

        let grandTotal = 0;

        els.individualPlatesContainer.innerHTML = state.plates.map((plate, index) => {
            if (!plate.items || !Array.isArray(plate.items)) {
                plate.items = [{ id: 'it_init_' + index, name: plate.dish || 'Ana Yemek', price: parseFloat(plate.price) || 200, emoji: '🍽️', type: 'food' }];
            }

            const personTotal = plate.items.reduce((sum, it) => sum + (parseFloat(it.price) || 0), 0);
            plate.price = personTotal;
            grandTotal += personTotal;

            return `
            <div class="individual-plate-item" data-plate-index="${index}">
                <div class="plate-user-header">
                    <div class="plate-user-title">
                        <i class="fa-solid fa-user-circle text-orange"></i>
                        <span>${plate.person} ${plate.isRunner ? '<span style="color:#fbbf24; font-size:12px;">(Siparişçi / Ödeyen)</span>' : ''}</span>
                    </div>
                    <div class="plate-user-total-badge">
                        ${personTotal} ₺
                    </div>
                </div>

                <!-- Seçilen Yemek ve İçecekler Listesi -->
                <div class="plate-items-container">
                    ${plate.items.map((it, itemIdx) => `
                        <div class="plate-single-item-row">
                            <span class="plate-item-emoji">${it.emoji || (it.type === 'drink' ? '🥤' : '🍽️')}</span>
                            <input type="text" class="plate-item-name-input" 
                                   value="${it.name}" 
                                   placeholder="Yemek veya içecek adı..." 
                                   oninput="updatePlateItemName(${index}, ${itemIdx}, this.value)"
                                   onchange="updatePlateItemName(${index}, ${itemIdx}, this.value)">
                            <div class="plate-item-price-box" title="Fiyatı doğrudan değiştirebilir veya zam geldiğinde güncelleyebilirsiniz">
                                <input type="number" class="plate-item-price-input" 
                                       value="${it.price}" 
                                       placeholder="0" min="0" step="5"
                                       oninput="updatePlateItemPrice(${index}, ${itemIdx}, this.value)"
                                       onchange="updatePlateItemPrice(${index}, ${itemIdx}, this.value)">
                                <span class="plate-item-currency">₺</span>
                            </div>
                            ${plate.items.length > 1 ? `
                                <button type="button" class="btn-remove-plate-item" onclick="removePlateItem(${index}, ${itemIdx})" title="Bu ürünü çıkar">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>

                <!-- Hızlı İçecek ve İlave Ürün Ekleme Çipleri -->
                <div class="plate-quick-chips">
                    <button type="button" class="quick-chip quick-chip-drink" onclick="addQuickItemToPlate(${index}, 'Ayran', 35, '🥛', 'drink')">
                        + 🥛 Ayran (35₺)
                    </button>
                    <button type="button" class="quick-chip quick-chip-drink" onclick="addQuickItemToPlate(${index}, 'Kola', 50, '🥤', 'drink')">
                        + 🥤 Kola (50₺)
                    </button>
                    <button type="button" class="quick-chip quick-chip-drink" onclick="addQuickItemToPlate(${index}, 'Şalgam Suyu', 35, '🍷', 'drink')">
                        + 🍷 Şalgam (35₺)
                    </button>
                    <button type="button" class="quick-chip quick-chip-drink" onclick="addQuickItemToPlate(${index}, 'Su', 15, '💧', 'drink')">
                        + 💧 Su (15₺)
                    </button>
                    <button type="button" class="quick-chip" onclick="addQuickItemToPlate(${index}, 'Patates Kızartması', 90, '🍟', 'side')">
                        + 🍟 Patates (90₺)
                    </button>
                    <button type="button" class="quick-chip quick-chip-add" onclick="addNewCustomItemToPlate(${index})">
                        <i class="fa-solid fa-plus"></i> Özel İçecek / Ürün
                    </button>
                </div>

                <div class="plate-status-row">
                    <button class="debt-status-btn ${plate.paid ? 'status-paid' : 'status-debt'}" onclick="togglePlatePaid(${index})">
                        ${plate.paid ? '✓ Ödedi' : '❌ Borçlu (' + personTotal + ' ₺)'}
                    </button>
                </div>
            </div>
            `;
        }).join('');

        els.totalCartAmount.innerText = `${grandTotal} ₺`;
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

window.addQuickItemToPlate = function(personIndex, name, price, emoji, type) {
    if (state.plates[personIndex]) {
        if (!state.plates[personIndex].items) state.plates[personIndex].items = [];
        state.plates[personIndex].items.push({
            id: 'it_' + Date.now() + Math.random().toString(36).substr(2, 4),
            name: name,
            price: price,
            emoji: emoji || '🍽️',
            type: type || 'drink'
        });
        audio.init();
        audio.tick();
        renderPlatesUI();
    }
};

window.addNewCustomItemToPlate = function(personIndex) {
    if (state.plates[personIndex]) {
        if (!state.plates[personIndex].items) state.plates[personIndex].items = [];
        state.plates[personIndex].items.push({
            id: 'it_' + Date.now(),
            name: 'Yeni İçecek / Yan Ürün',
            price: 45,
            emoji: '🥤',
            type: 'drink'
        });
        audio.init();
        audio.tick();
        renderPlatesUI();
    }
};

window.removePlateItem = function(personIndex, itemIndex) {
    if (state.plates[personIndex] && state.plates[personIndex].items) {
        state.plates[personIndex].items.splice(itemIndex, 1);
        renderPlatesUI();
    }
};

window.updatePlateItemName = function(personIndex, itemIndex, value) {
    if (state.plates[personIndex] && state.plates[personIndex].items && state.plates[personIndex].items[itemIndex]) {
        state.plates[personIndex].items[itemIndex].name = value;
    }
};

window.updatePlateItemPrice = function(personIndex, itemIndex, value) {
    if (state.plates[personIndex] && state.plates[personIndex].items && state.plates[personIndex].items[itemIndex]) {
        state.plates[personIndex].items[itemIndex].price = parseFloat(value) || 0;
        updatePlatesTotalsOnly();
    }
};

function updatePlatesTotalsOnly() {
    let grandTotal = 0;
    state.plates.forEach((plate, idx) => {
        const personTotal = (plate.items || []).reduce((sum, it) => sum + (parseFloat(it.price) || 0), 0);
        plate.price = personTotal;
        grandTotal += personTotal;

        const plateCard = els.individualPlatesContainer.children[idx];
        if (plateCard) {
            const badge = plateCard.querySelector('.plate-user-total-badge');
            if (badge) badge.innerText = `${personTotal} ₺`;
            const debtBtn = plateCard.querySelector('.debt-status-btn');
            if (debtBtn && !plate.paid) {
                debtBtn.innerText = `❌ Borçlu (${personTotal} ₺)`;
            }
        }
    });
    els.totalCartAmount.innerText = `${grandTotal} ₺`;
}

window.togglePlatePaid = function(index) {
    if (state.plates[index]) {
        state.plates[index].paid = !state.plates[index].paid;
        renderPlatesUI();
    }
};

// --- SIPARIS LISTESI & NOTUNU KOPYALA ---
els.btnCopyOrderNote = function() {
    const runner = state.runner || state.user?.name || getActiveParticipants()[0] || 'Siparişçi';
    const cuisine = state.winnerFood ? state.winnerFood.name : 'Yemek';
    
    let text = `📋 Ne Yiyoruz Sipariş Özeti (${cuisine})\n`;
    text += `🛵 Siparişçi / Alacak Kişi: ${runner}\n`;
    text += `---------------------------------\n`;

    let grandTotal = 0;
    state.plates.forEach(p => {
        const items = p.items && p.items.length ? p.items : [{ name: p.dish || 'Ana Menü', price: p.price || 0, emoji: '🍽️' }];
        const personTotal = items.reduce((sum, it) => sum + (parseFloat(it.price) || 0), 0);
        grandTotal += personTotal;

        text += `👤 ${p.person}:\n`;
        items.forEach(it => {
            text += `   • ${it.emoji || '🍽️'} ${it.name} (${it.price} ₺)\n`;
        });
        text += `   Kişi Toplamı: ${personTotal} ₺\n\n`;
    });

    text += `---------------------------------\n`;
    text += `💰 TOPLAM HESAP: ${grandTotal} ₺\n`;
    const debtors = state.plates.filter(p => !p.paid && !p.isRunner);
    text += `Borçlular: ${debtors.map(p => p.person + ' (' + ((p.items || []).reduce((s, i) => s + (parseFloat(i.price)||0), 0)) + ' ₺)').join(', ') || 'Yok (Herkes Ödedi)'}`;

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
    const runner = state.runner || state.user?.name || getActiveParticipants()[0] || 'Siparişçi';
    let grandTotal = 0;
    const platesSummary = state.plates.map(p => {
        const items = p.items || [];
        const personTotal = items.reduce((sum, it) => sum + (parseFloat(it.price) || 0), 0);
        grandTotal += personTotal;
        const itemNames = items.map(i => `${i.name} (${i.price} ₺)`).join(' + ');
        return {
            person: p.person,
            dish: itemNames || p.dish || 'Menü',
            price: personTotal,
            paid: p.paid,
            isRunner: p.isRunner
        };
    });

    const record = {
        id: Date.now(),
        date: new Date().toLocaleDateString('tr-TR'),
        cuisine: state.winnerFood ? state.winnerFood.name : 'Yemek',
        runner: runner,
        total: grandTotal,
        plates: platesSummary,
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

window.addEventListener('DOMContentLoaded', async () => {
    // Check Supabase session first if available
    if (supabaseClient) {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session && session.user) {
                const userObj = {
                    id: session.user.id,
                    name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                    email: session.user.email,
                    avatar: session.user.user_metadata?.avatar || '👨‍🍳',
                    isGuest: false,
                    provider: 'supabase'
                };
                setUserSession(userObj);
                renderFoodManageList();
                drawWheel();
                return;
            }
        } catch (e) {
            console.warn('Supabase getSession warning:', e);
        }
    }

    const saved = localStorage.getItem('neyiyoruz_user');
    if (saved) {
        state.user = JSON.parse(saved);
        els.displayUsername.innerText = state.user.name;
        els.userAvatar.innerText = state.user.avatar || '😎';
        els.userBadge.style.display = 'flex';
        navigateTo('screen-lobby');
    } else {
        navigateTo('screen-auth');
    }

    renderFoodManageList();
    drawWheel();
});


// --- MUTFAK DEĞİŞTİRME & BEĞENİLENLER MODALI VE GERİ BUTONLARI ---
function openCuisineChangeModal() {
    if (!els.cuisineSelectList) return;
    els.cuisineSelectList.innerHTML = state.foods.map(item => `
        <button class="cuisine-grid-btn ${state.winnerFood && state.winnerFood.id === item.id ? 'active' : ''}" data-food-id="${item.id}">
            <span class="cuisine-grid-emoji">${item.emoji}</span>
            <span class="cuisine-grid-name">${item.name}</span>
        </button>
    `).join('');

    els.cuisineSelectList.querySelectorAll('.cuisine-grid-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const foodId = parseInt(btn.dataset.foodId);
            const selected = state.foods.find(f => f.id === foodId);
            if (selected) {
                state.winnerFood = selected;
                // Re-setup plates for the new cuisine
                state.plates = [];
                renderResultScreen();
                if (els.cuisineChangeModal) els.cuisineChangeModal.classList.remove('active');
            }
        });
    });

    if (els.cuisineChangeModal) els.cuisineChangeModal.classList.add('active');
}

function openLikedChoicesModal() {
    if (!els.likedFoodsGrid) return;
    if (!state.acceptedFoods || state.acceptedFoods.length === 0) {
        alert('Henüz beğendiğiniz bir mutfak yok.');
        return;
    }

    els.likedFoodsGrid.innerHTML = state.acceptedFoods.map(item => `
        <button class="cuisine-grid-btn" data-food-id="${item.id}">
            <span class="cuisine-grid-emoji">${item.emoji}</span>
            <span class="cuisine-grid-name">${item.name}</span>
        </button>
    `).join('');

    els.likedFoodsGrid.querySelectorAll('.cuisine-grid-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const foodId = parseInt(btn.dataset.foodId);
            const selected = state.foods.find(f => f.id === foodId);
            if (selected) {
                state.winnerFood = selected;
                if (els.likedChoicesModal) els.likedChoicesModal.classList.remove('active');
                triggerMatch(selected);
            }
        });
    });

    if (els.likedChoicesModal) els.likedChoicesModal.classList.add('active');
}

// Wire Change Cuisine button
if (els.btnChangeWinnerCuisine) {
    els.btnChangeWinnerCuisine.addEventListener('click', openCuisineChangeModal);
}
if (els.btnCloseCuisineModal) {
    els.btnCloseCuisineModal.addEventListener('click', () => {
        if (els.cuisineChangeModal) els.cuisineChangeModal.classList.remove('active');
    });
}
if (els.btnCloseLikedModal) {
    els.btnCloseLikedModal.addEventListener('click', () => {
        if (els.likedChoicesModal) els.likedChoicesModal.classList.remove('active');
    });
}
if (els.btnSpinWheelLikedFoods) {
    els.btnSpinWheelLikedFoods.addEventListener('click', () => {
        if (els.likedChoicesModal) els.likedChoicesModal.classList.remove('active');
        state.winnerFood = state.acceptedFoods[Math.floor(Math.random() * state.acceptedFoods.length)];
        navigateTo('screen-wheel');
    });
}

// Screen Navigation Back Buttons
if (els.btnBackFromWheelToSwipe) {
    els.btnBackFromWheelToSwipe.addEventListener('click', () => {
        navigateTo('screen-match');
    });
}
if (els.btnBackFromWheelToLobby) {
    els.btnBackFromWheelToLobby.addEventListener('click', () => {
        navigateTo('screen-lobby');
    });
}
if (els.btnBackFromResultToWheel) {
    els.btnBackFromResultToWheel.addEventListener('click', () => {
        navigateTo('screen-wheel');
    });
}
if (els.btnBackFromResultToSwipe) {
    els.btnBackFromResultToSwipe.addEventListener('click', () => {
        navigateTo('screen-match');
    });
}
if (els.btnBackFromResultToLobby) {
    els.btnBackFromResultToLobby.addEventListener('click', () => {
        navigateTo('screen-lobby');
    });
}
if (els.btnBackFromHistory) {
    els.btnBackFromHistory.addEventListener('click', () => {
        navigateTo('screen-lobby');
    });
}
