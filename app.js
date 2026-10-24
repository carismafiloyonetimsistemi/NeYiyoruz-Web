// --- ETKİN SİPARİŞÇİ / ÖDEYEN BELİRLEME (VARSAYILAN: ODAYI KURAN KİŞİ) ---
function getEffectiveRunner() {
    if (state.runner && state.runner.trim()) return state.runner.trim();
    if (state.room && state.room.host && state.room.host.trim()) return state.room.host.trim();
    if (state.room && state.room.participants && state.room.participants.length > 0) return state.room.participants[0].trim();
    if (state.user && state.user.name && state.user.name.trim()) return state.user.name.trim();
    return 'Siparişçi';
}

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

// --- KAPSAMLI LEZZET MENÜSÜ KATALOĞU (FOOD CATALOG) ---
const FOOD_CATALOG = [
    // Lahmacun & Pide
    { id: 'fc_1', name: 'Taş Fırın Lahmacun', category: 'Lahmacun & Pide', emoji: '🍕', price: 110, desc: 'Çıtır çıtır taş fırın lahmacun, bol maydanoz ve limonla' },
    { id: 'fc_2', name: 'Kaşarlı Pide', category: 'Lahmacun & Pide', emoji: '🥩', price: 190, desc: 'Özel hamur, bol erimiş kaşar peyniri' },
    { id: 'fc_3', name: 'Kuşbaşılı Kaşarlı Pide', category: 'Lahmacun & Pide', emoji: '🥩', price: 240, desc: 'Dana kuşbaşı eti, domates, biber ve kaşar' },
    { id: 'fc_4', name: 'Kıymalı Pide', category: 'Lahmacun & Pide', emoji: '🥩', price: 210, desc: 'Baharatlı kıyma harçlı geleneksel Karadeniz pidesi' },

    // Döner & Dürüm
    { id: 'fc_5', name: 'Et Döner Dürüm', category: 'Döner & Dürüm', emoji: '🌯', price: 220, desc: '100g yaprak et döner, domates, turşu ve özel sos' },
    { id: 'fc_6', name: 'Tavuk Döner Dürüm (Hatay Usulü)', category: 'Döner & Dürüm', emoji: '🌯', price: 150, desc: 'Özel soslu çift lavaş, sarımsaklı mayonez ve patates' },
    { id: 'fc_7', name: 'Porsiyon Et Döner & Pilav', category: 'Döner & Dürüm', emoji: '🍽️', price: 290, desc: 'Tereyağlı pirinç pilavı üzerinde yaprak et döner' },
    { id: 'fc_8', name: 'İskender Kebap (Et Dönerden)', category: 'Döner & Dürüm', emoji: '🥩', price: 330, desc: 'Kızarmış pide, domates sosu, yoğurt ve tereyağı' },

    // Kebap & Köfte
    { id: 'fc_9', name: 'Adana Kebap Dürüm / Porsiyon', category: 'Kebap & Köfte', emoji: '🍢', price: 280, desc: 'Zırhta çekilmiş acılı kıyma kebabı, köz sebzeler' },
    { id: 'fc_10', name: 'Urfa Kebap', category: 'Kebap & Köfte', emoji: '🍢', price: 280, desc: 'Acısız zırh kebabı, lavaş ve közlenmiş garnitür' },
    { id: 'fc_11', name: 'Izgara Köfte Porsiyon', category: 'Kebap & Köfte', emoji: '🥪', price: 230, desc: 'Geleneksel anne köftesi, patates kızartması ve pilav' },
    { id: 'fc_12', name: 'Tavuk Şiş Dürüm', category: 'Kebap & Köfte', emoji: '🍗', price: 190, desc: 'Marine edilmiş tavuk göğsü, köz sebzeler' },

    // Burger & Pizza
    { id: 'fc_13', name: 'Gurme Smash Burger Menü', category: 'Burger & Pizza', emoji: '🍔', price: 260, desc: '140g dana köfte, cheddar, karamelize soğan, patates' },
    { id: 'fc_14', name: 'Tavuk Burger Menü', category: 'Burger & Pizza', emoji: '🍔', price: 195, desc: 'Çıtır panelenmiş tavuk fileto, marul, patates' },
    { id: 'fc_15', name: 'Büyük Karışık Pizza', category: 'Burger & Pizza', emoji: '🍕', price: 250, desc: 'Sucuk, sosis, mantar, mısır, zeytin ve bol mozzarella' },
    { id: 'fc_16', name: 'Margarita Pizza', category: 'Burger & Pizza', emoji: '🍕', price: 200, desc: 'İtalyan domates sosu, fesleğen ve taze mozzarella' },

    // Çorba & Ev Yemeği
    { id: 'fc_17', name: 'Mercimek Çorbası', category: 'Çorba & Ev Yemeği', emoji: '🍲', price: 90, desc: 'Tereyağlı süzme mercimek çorbası, kruton ve limon' },
    { id: 'fc_18', name: 'Kuru Fasulye & Pilav', category: 'Çorba & Ev Yemeği', emoji: '🍲', price: 160, desc: 'Güveçte tereyağlı İspir fasulyesi ve dane pilav' },
    { id: 'fc_19', name: 'Kayseri Mantısı', category: 'Çorba & Ev Yemeği', emoji: '🥟', price: 210, desc: 'Sarımsaklı yoğurt, nane, sumak ve tereyağlı sos' },
    { id: 'fc_20', name: 'Çiğ Köfte Dürüm (Mega)', category: 'Çorba & Ev Yemeği', emoji: '🥬', price: 95, desc: 'Bol yeşillik, limon, nar ekşisi ve acı soslu lavaş' },

    // Yan Lezzetler
    { id: 'fc_21', name: 'Büyük Patates Kızartması', category: 'Yan Lezzetler', emoji: '🍟', price: 85, desc: 'Baharatlı çıtır altın sarısı patates' },
    { id: 'fc_22', name: 'Çıtır Soğan Halkası (8 Adet)', category: 'Yan Lezzetler', emoji: '🧅', price: 75, desc: 'Altın sarısı çıtır soğan halkaları' },

    // İçecekler
    { id: 'fc_23', name: 'Büyük Yayık Ayran (300ml)', category: 'İçecekler', emoji: '🥤', price: 35, desc: 'Bol köpüklü soğuk yayık ayranı' },
    { id: 'fc_24', name: 'Kutu Kola (330ml)', category: 'İçecekler', emoji: '🥤', price: 50, desc: 'Soğuk Coca-Cola / Zero' },
    { id: 'fc_25', name: 'Kutu Fanta / Sprite (330ml)', category: 'İçecekler', emoji: '🥤', price: 50, desc: 'Soğuk meyveli gazlı içecek' },
    { id: 'fc_26', name: 'Şalgam Suyu (330ml Acılı/Acısız)', category: 'İçecekler', emoji: '🥤', price: 35, desc: 'Doğal Adana şalgam suyu' },
    { id: 'fc_27', name: 'Doğal Kaynak Suyu (500ml)', category: 'İçecekler', emoji: '💧', price: 15, desc: 'Pet şişe soğuk su' },
    { id: 'fc_28', name: 'Ice Tea (Şeftali / Limon)', category: 'İçecekler', emoji: '🥤', price: 50, desc: 'Soğuk kutu çay 330ml' },

    // Tatlılar
    { id: 'fc_29', name: 'Fıstıklı Baklava (3 Dilim)', category: 'Tatlılar', emoji: '🍰', price: 180, desc: 'Antep fıstıklı çıtır kare baklava' },
    { id: 'fc_30', name: 'Sıcak Hatay Künefesi', category: 'Tatlılar', emoji: '🍰', price: 165, desc: 'Erimiş özel peynirli çıtır kadayıf, Antep fıstıklı' },
    { id: 'fc_31', name: 'Fırın Sütlaç', category: 'Tatlılar', emoji: '🍮', price: 110, desc: 'Fırında nar gibi kızarmış geleneksel sütlaç' },
    { id: 'fc_32', name: 'Sıcak Çikolatalı Sufle', category: 'Tatlılar', emoji: '🍫', price: 135, desc: 'Akışkan Belçika çikolatalı sufle' }
];

const SAMPLE_DISHES = {
    'Kebap & Ocakbaşı': [
        { dish: 'Adana Kebap (Tek Lavaş) + Şalgam', price: 340 },
        { dish: 'Kuzu Şiş Porsiyon + Ayran', price: 410 },
        { dish: 'Mercimek Çorbası + 2 Lahmacun', price: 260 },
        { dish: 'Beyti Sarma + Kola', price: 380 },
    ],
    'default': [
        { dish: 'Lahmacun', price: 110, emoji: '🍕' },
        { dish: 'Döner Porsiyon', price: 220, emoji: '🌯' },
        { dish: 'Köfte Ekmek / Dürüm', price: 190, emoji: '🥪' },
        { dish: 'Tavuk Döner', price: 160, emoji: '🌯' },
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
    wheelMode: 'runner', // 'runner' or 'food'
    winnerFood: null,
    runner: null,
    wheelAngle: 0,
    isSpinning: false,
    // Individual plates & Split bill
    splitMode: 'individual', // 'individual' or 'equal'
    plates: [], // [ { person: 'Ersoy', dish: 'Adana Kebap', price: 340, paid: false } ]
    debtsHistory: JSON.parse(localStorage.getItem('neyiyoruz_debts_history')) || [],
    favoriteItemIds: JSON.parse(localStorage.getItem('neyiyoruz_fav_foods')) || ['lahmacun_1', 'burger_1', 'ayran_1'],
};

// --- 3. WEB AUDIO SYNTHESIZER ---

// --- FAVORİ YEMEKLER SİSTEMİ (YILDIZLA & SEPETTE HIZLI EKLE) ---
window.toggleFavoriteFood = function(itemId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (!state.favoriteItemIds) state.favoriteItemIds = [];

    const idx = state.favoriteItemIds.indexOf(itemId);
    const item = (typeof FOOD_CATALOG !== 'undefined') ? FOOD_CATALOG.find(f => f.id === itemId) : null;
    const itemName = item ? item.name : 'Lezzet';

    if (idx >= 0) {
        state.favoriteItemIds.splice(idx, 1);
        if (typeof window.showAppToast === 'function') {
            window.showAppToast(`☆ "${itemName}" favorilerden çıkarıldı.`, 'info');
        }
    } else {
        state.favoriteItemIds.push(itemId);
        audio.init();
        audio.tick();
        if (typeof window.showAppToast === 'function') {
            window.showAppToast(`⭐ "${itemName}" favorilere eklendi! Sepette hızlı ekle çipi olarak görünecek.`, 'success');
        }
    }

    localStorage.setItem('neyiyoruz_fav_foods', JSON.stringify(state.favoriteItemIds));

    if (typeof renderMenuScreen === 'function') renderMenuScreen();
    if (state.plates && state.plates.length > 0 && typeof renderPlatesUI === 'function') {
        renderPlatesUI();
    }
};

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
    wheelParticipantCount: document.getElementById('wheelParticipantCount'),
    wheelParticipantsList: document.getElementById('wheelParticipantsList'),
    btnQuickAddFriendWheel: document.getElementById('btnQuickAddFriendWheel'),
    btnGoToOrderDirect: document.getElementById('btnGoToOrderDirect'),
    btnGoToWheel: document.getElementById('btnGoToWheel'),
    btnWheelToOrder: document.getElementById('btnWheelToOrder'),
    btnGoToMenu: document.getElementById('btnGoToMenu'),
    menuTargetPersonSelect: document.getElementById('menuTargetPersonSelect'),
    menuSearchInput: document.getElementById('menuSearchInput'),
    btnClearMenuSearch: document.getElementById('btnClearMenuSearch'),
    menuCategoriesBar: document.getElementById('menuCategoriesBar'),
    menuItemsGrid: document.getElementById('menuItemsGrid'),
    btnOpenCustomDishPrompt: document.getElementById('btnOpenCustomDishPrompt'),
    menuStickyCartBar: document.getElementById('menuStickyCartBar'),
    stickyTargetPersonName: document.getElementById('stickyTargetPersonName'),
    stickyCartTotalText: document.getElementById('stickyCartTotalText'),
    btnStickyGoToCart: document.getElementById('btnStickyGoToCart'),
    btnMenuGoToPlates: document.getElementById('btnMenuGoToPlates'),
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
    btnAddAllLikedToPlate: document.getElementById('btnAddAllLikedToPlate'),
    roomTimerBar: document.getElementById('roomTimerBar'),
    timerCountdownDisplay: document.getElementById('timerCountdownDisplay'),
    btnExtendTimer: document.getElementById('btnExtendTimer'),
    activeRoomTimerLabel: document.getElementById('activeRoomTimerLabel'),
    wheelBadge: document.getElementById('wheelBadge'),
    wheelTitle: document.getElementById('wheelTitle'),
    wheelSubDesc: document.getElementById('wheelSubDesc'),
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

    if (screenId === 'screen-match' || screenId === 'screen-menu') {
        screenId = 'screen-menu';
        setupPlatesData();
        renderMenuScreen();
    } else if (screenId === 'screen-wheel') {
        renderWheelParticipants();
        populateVolunteerSelect();
        drawWheel();
    } else if (screenId === 'screen-history') {
        renderHistoryScreen();
    } else if (screenId === 'screen-result') {
        renderResultScreen();
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
    const list = [];
    if (state.user && state.user.name) {
        list.push(state.user.name);
    }
    if (state.room && state.room.participants && Array.isArray(state.room.participants)) {
        state.room.participants.forEach(p => {
            if (p && !list.includes(p)) list.push(p);
        });
    }
    if (state.plates && Array.isArray(state.plates)) {
        state.plates.forEach(pl => {
            if (pl && pl.person && !list.includes(pl.person)) list.push(pl.person);
        });
    }
    return list.length > 0 ? list : ['Siz'];
}

// --- 7. ROOM SYSTEM ---
function createRoom(title) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const roomTitle = title || 'Günün Yemeği';
    const currentUserName = state.user ? state.user.name : 'Siz';
    const participants = [currentUserName];

    // Kullanıcının seçtiği süreyi doğrudan aktif çipten oku (15 dk seçildiyse kesinlikle 15 dk olsun)
    const activeChip = document.querySelector('#createTimerChips .timer-chip.active');
    const roomMins = activeChip ? parseInt(activeChip.dataset.mins, 10) : selectedTimerMinutes;
    selectedTimerMinutes = roomMins;

    const timerEndTime = roomMins > 0 ? (Date.now() + roomMins * 60 * 1000) : null;

    state.room = {
        code: code,
        title: roomTitle,
        participants: participants,
        timerMinutes: roomMins,
        timerEndTime: timerEndTime
    };

    if (roomMins > 0) {
        startRoomCountdown(timerEndTime);
    } else {
        if (roomTimerInterval) clearInterval(roomTimerInterval);
        roomTimerInterval = null;
        if (els.roomTimerBar) els.roomTimerBar.style.display = 'none';
    }

    renderActiveRoom();
    populateVolunteerSelect();
    drawWheel();
    initRoomRealtime(code);
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
    populateVolunteerSelect();
    drawWheel();
    initRoomRealtime(code);
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
        renderWheelParticipants();
        populateVolunteerSelect();
        drawWheel();
        if (state.plates) {
            setupPlatesData();
            renderPlatesUI();
        }
        broadcastRoomState();
        broadcastPlatesChange();
    }
};

window.removeParticipantFromRoom = function(index) {
    if (state.room && state.room.participants.length > 1) {
        state.room.participants.splice(index, 1);
        renderActiveRoom();
        renderWheelParticipants();
        populateVolunteerSelect();
        drawWheel();
        if (state.plates) {
            setupPlatesData();
            renderPlatesUI();
        }
        broadcastRoomState();
        broadcastPlatesChange();
    }
};

function renderActiveRoom() {
    els.activeRoomBox.style.display = 'block';
    els.currentRoomTitle.innerText = state.room.title;
    els.currentRoomCodeBadge.innerText = state.room.code;
    els.participantCount.innerText = state.room.participants.length;
    if (els.menuCountBadge) els.menuCountBadge.innerText = state.foods.length;

    // Oda sayacını ve aktif çipi güncelle
    const roomMins = (state.room && state.room.timerMinutes !== undefined) ? state.room.timerMinutes : selectedTimerMinutes;
    if (els.activeRoomTimerLabel) {
        els.activeRoomTimerLabel.innerText = roomMins > 0 ? `${roomMins} Dakika` : 'Süresiz';
    }
    const activeChips = document.querySelectorAll('#activeTimerChips .timer-chip');
    activeChips.forEach(chip => {
        const chipMins = parseInt(chip.dataset.mins, 10);
        if (chipMins === roomMins) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

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

if (els.btnCreateRoom) {
    els.btnCreateRoom.addEventListener('click', () => {
        const title = els.createRoomNameInput ? els.createRoomNameInput.value : '';
        createRoom(title);
    });
}

if (els.btnJoinRoom) {
    els.btnJoinRoom.addEventListener('click', () => {
        const code = els.joinRoomCodeInput ? els.joinRoomCodeInput.value : '';
        joinRoom(code);
    });
}

els.btnShareWhatsApp.addEventListener('click', () => {
    if (!state.room) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${state.room.code}`;
    let timerMsg = '';
    if (state.room.timerMinutes && state.room.timerMinutes > 0) {
        timerMsg = `\n⏱️ DİKKAT: Sipariş için son ${state.room.timerMinutes} dakika! Gelen gelir, gelmeyen aç kalır!\n`;
    }
    const text = encodeURIComponent(`🍕 Ne Yiyoruz? uygulamasına katıl, siparişleri topluyoruz!${timerMsg}\nOda Kodu: ${state.room.code}\nKatılmak için tıkla: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
});

if (els.btnGoToOrderDirect) {
    els.btnGoToOrderDirect.addEventListener('click', () => {
        setupPlatesData();
        renderPlatesUI();
        navigateTo('screen-result');
    });
}

if (els.btnGoToWheel) {
    els.btnGoToWheel.addEventListener('click', () => {
        renderWheelParticipants();
        populateVolunteerSelect();
        drawWheel();
        navigateTo('screen-wheel');
    });
}

if (els.btnWheelToOrder) {
    els.btnWheelToOrder.addEventListener('click', () => {
        setupPlatesData();
        renderPlatesUI();
        navigateTo('screen-result');
    });
}

if (els.btnQuickAddFriendWheel) {
    els.btnQuickAddFriendWheel.addEventListener('click', () => {
        const name = prompt('Odaya ve siparişçiye eklenecek kişinin adını yazın:');
        if (name && name.trim()) {
            window.addParticipantToRoom(name.trim());
        }
    });
}

if (els.btnStartMatching) {
    els.btnStartMatching.addEventListener('click', () => {
        setupPlatesData();
        renderPlatesUI();
        navigateTo('screen-result');
    });
}

if (els.btnBackToLobby) {
    els.btnBackToLobby.addEventListener('click', () => {
        navigateTo('screen-lobby');
    });
}

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

    if (els.menuCountBadge) els.menuCountBadge.innerText = state.foods.length;
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

if (els.btnOpenMenuManager) {
    els.btnOpenMenuManager.addEventListener('click', () => {
        renderFoodManageList();
        if (els.menuManagerModal) els.menuManagerModal.classList.add('active');
    });
}

if (els.btnOpenQuickAddModal) {
    els.btnOpenQuickAddModal.addEventListener('click', () => {
        renderFoodManageList();
        if (els.menuManagerModal) els.menuManagerModal.classList.add('active');
    });
}

if (els.btnCloseMenuManager) {
    els.btnCloseMenuManager.addEventListener('click', () => {
        if (els.menuManagerModal) els.menuManagerModal.classList.remove('active');
    });
}


// --- 8B. YEMEK SEÇİMİ & MENÜ SİSTEMİ (FOOD CATALOG & SELECTION) ---
let currentMenuCategory = 'Tümü';
let currentMenuSearch = '';
const menuQuantities = {}; // { fc_1: 3, fc_2: 1 }

const MENU_CATEGORIES = [
    'Tümü',
    'Lahmacun & Pide',
    'Döner & Dürüm',
    'Kebap & Köfte',
    'Burger & Pizza',
    'Çorba & Ev Yemeği',
    'Yan Lezzetler',
    'İçecekler',
    'Tatlılar'
];

let activeMenuPersonIndex = null;

function getTargetPersonIndex() {
    if (!state.plates || state.plates.length === 0) {
        setupPlatesData();
    }
    if (activeMenuPersonIndex !== null && state.plates[activeMenuPersonIndex]) {
        return activeMenuPersonIndex;
    }
    const myName = (state.user && state.user.name) ? state.user.name.trim() : null;
    if (myName && state.plates) {
        const idx = state.plates.findIndex(p => p.person.trim().toLowerCase() === myName.toLowerCase());
        if (idx >= 0) return idx;
    }
    return 0;
}

window.openMenuForPerson = function(personIndex) {
    setupPlatesData();
    activeMenuPersonIndex = personIndex;
    navigateTo('screen-menu');
    renderMenuScreen();
};

// --- DİNAMİK YEMEK MENÜSÜ VE SİLME YÖNETİMİ ---
let currentFoodCatalog = JSON.parse(localStorage.getItem('neyiyoruz_custom_catalog')) || null;
if (!currentFoodCatalog || !Array.isArray(currentFoodCatalog) || currentFoodCatalog.length === 0) {
    currentFoodCatalog = [...FOOD_CATALOG];
    localStorage.setItem('neyiyoruz_custom_catalog', JSON.stringify(currentFoodCatalog));
}

function getActiveFoodCatalog() {
    return currentFoodCatalog;
}

window.deleteCatalogFoodItem = function(itemId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const item = currentFoodCatalog.find(f => f.id === itemId);
    const itemName = item ? item.name : 'Yemek';

    if (!confirm(`"${itemName}" lezzetini menüden tamamen silmek istediğinize emin misiniz?`)) {
        return;
    }

    currentFoodCatalog = currentFoodCatalog.filter(f => f.id !== itemId);
    localStorage.setItem('neyiyoruz_custom_catalog', JSON.stringify(currentFoodCatalog));

    // Favorilerden de çıkar
    if (state.favoriteItemIds) {
        state.favoriteItemIds = state.favoriteItemIds.filter(id => id !== itemId);
        localStorage.setItem('neyiyoruz_fav_foods', JSON.stringify(state.favoriteItemIds));
    }

    renderMenuScreen();
    if (state.plates && state.plates.length > 0) renderPlatesUI();
    if (typeof window.showAppToast === 'function') {
        window.showAppToast(`🗑️ "${itemName}" menüden silindi.`, 'info');
    }
};

window.removeItemFromPlateByName = function(dishName, targetIdx) {
    const idx = (targetIdx !== undefined && targetIdx !== null) ? targetIdx : getTargetPersonIndex();
    const plate = state.plates[idx];
    if (!plate || !plate.items) return;

    plate.items = plate.items.filter(it => it.name.trim().toLowerCase() !== dishName.trim().toLowerCase());
    
    updateMenuStickyCartBar();
    renderMenuScreen();
    renderPlatesUI();
    broadcastPlatesChange();

    if (typeof window.showAppToast === 'function') {
        window.showAppToast(`🗑️ "${dishName}" tabağınızdan çıkarıldı.`, 'info');
    }
};

function renderMenuScreen() {
    setupPlatesData();
    const participants = getActiveParticipants();
    const targetIdx = getTargetPersonIndex();
    const targetPlate = (state.plates && state.plates[targetIdx]) ? state.plates[targetIdx] : (state.plates && state.plates[0] ? state.plates[0] : { person: 'Siz', items: [] });

    // 1. Populate Target Person Select
    if (els.menuTargetPersonSelect && state.plates) {
        els.menuTargetPersonSelect.innerHTML = state.plates.map((p, idx) => `
            <option value="${idx}" ${idx === targetIdx ? 'selected' : ''}>
                👤 ${p.person} ${p.person === (state.user?.name) ? '(Siz)' : ''}
            </option>
        `).join('');

        els.menuTargetPersonSelect.onchange = () => {
            renderMenuScreen();
        };
    }

    // 2. Render Categories Bar
    if (els.menuCategoriesBar) {
        els.menuCategoriesBar.innerHTML = MENU_CATEGORIES.map(cat => `
            <button type="button" class="menu-cat-chip ${cat === currentMenuCategory ? 'active' : ''}" 
                    onclick="setMenuCategory('${cat.replace(/'/g, "\\'")}')">
                ${cat === 'Tümü' ? '🌟 Tümü' : 
                  cat === 'Lahmacun & Pide' ? '🍕 ' + cat : 
                  cat === 'Döner & Dürüm' ? '🌯 ' + cat : 
                  cat === 'Kebap & Köfte' ? '🍢 ' + cat : 
                  cat === 'Burger & Pizza' ? '🍔 ' + cat : 
                  cat === 'Çorba & Ev Yemeği' ? '🍲 ' + cat : 
                  cat === 'İçecekler' ? '🥤 ' + cat : 
                  cat === 'Yan Lezzetler' ? '🍟 ' + cat : '🍰 ' + cat}
            </button>
        `).join('');
    }

    // 3. Filter Foods
    const catalog = getActiveFoodCatalog();
    const q = currentMenuSearch.trim().toLowerCase();
    const filteredFoods = catalog.filter(item => {
        const matchesCategory = (currentMenuCategory === 'Tümü' || item.category === currentMenuCategory);
        const matchesSearch = !q || item.name.toLowerCase().includes(q) || (item.desc && item.desc.toLowerCase().includes(q)) || item.category.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
    });

    // 4. Render Food Cards Grid
    if (els.menuItemsGrid) {
        if (filteredFoods.length === 0) {
            els.menuItemsGrid.innerHTML = `
                <div class="glass-card p-4 text-center">
                    <span style="font-size: 32px;">🔍</span>
                    <h4 class="mt-2">Sonuç Bulunamadı</h4>
                    <p class="small-text text-muted">"${currentMenuSearch}" ile eşleşen bir yemek bulunamadı.</p>
                    <button type="button" class="btn btn-sm btn-primary mt-2" onclick="promptAddItemToPlate(${targetIdx})">
                        <i class="fa-solid fa-pen"></i> Özel Olarak Ekle
                    </button>
                </div>
            `;
        } else {
            els.menuItemsGrid.innerHTML = filteredFoods.map(item => {
                const qty = menuQuantities[item.id] || 1;
                const isFav = Boolean(state.favoriteItemIds && state.favoriteItemIds.includes(item.id));
                const targetPlate = (state.plates && state.plates[targetIdx]) ? state.plates[targetIdx] : null;
                const plateItem = targetPlate ? (targetPlate.items || []).find(it => it.name.trim().toLowerCase() === item.name.trim().toLowerCase()) : null;
                const inPlateQty = plateItem ? (plateItem.qty || 1) : 0;

                return `
                <div class="menu-catalog-card">
                    <div class="catalog-card-left">
                        <div class="catalog-card-emoji">${item.emoji}</div>
                        <div class="catalog-card-details">
                            <div class="catalog-card-title-row">
                                <h4 class="catalog-card-title">${item.name}</h4>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <button type="button" class="btn-fav-star ${isFav ? 'active' : ''}" 
                                            onclick="toggleFavoriteFood('${item.id}', event)" 
                                            title="${isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle (Sepette Hızlı Ekle)'}">
                                        <i class="${isFav ? 'fa-solid fa-star' : 'fa-regular fa-star'}"></i>
                                    </button>
                                    <button type="button" class="btn-delete-catalog-food" 
                                            onclick="deleteCatalogFoodItem('${item.id}', event)" 
                                            title="Bu yemeği menüden tamamen sil">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </div>
                            <span class="catalog-card-desc">${item.desc}</span>
                            <div class="catalog-card-price">${item.price} ₺</div>
                            ${inPlateQty > 0 ? `
                                <div class="catalog-plate-status">
                                    <span class="catalog-in-plate-badge">✓ Tabağınızda: ${inPlateQty} adet</span>
                                    <button type="button" class="btn-remove-from-plate" 
                                            onclick="removeItemFromPlateByName('${item.name.replace(/'/g, "\'")}', ${targetIdx})" 
                                            title="Bu yemeği tabağımdan çıkar">
                                        <i class="fa-solid fa-trash-can"></i> Çıkar
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="catalog-card-actions">
                        <div class="catalog-qty-stepper">
                            <button type="button" class="btn-catalog-qty" onclick="changeCatalogItemQty('${item.id}', -1)">-</button>
                            <span class="catalog-qty-val" id="catalogQty_${item.id}">${qty}</span>
                            <button type="button" class="btn-catalog-qty" onclick="changeCatalogItemQty('${item.id}', 1)">+</button>
                        </div>
                        <button type="button" class="btn btn-sm btn-primary btn-catalog-add" onclick="addCatalogItemToTargetPlate('${item.id}')">
                            <i class="fa-solid fa-plus"></i> Ekle
                        </button>
                    </div>
                </div>
                `;
            }).join('');
        }
    }

    // 5. Update Sticky Cart Bar
    updateMenuStickyCartBar();
}

function updateMenuStickyCartBar() {
    const targetIdx = getTargetPersonIndex();
    const targetPlate = (state.plates && state.plates[targetIdx]) ? state.plates[targetIdx] : (state.plates && state.plates[0] ? state.plates[0] : null);
    if (!targetPlate) return;

    const itemCount = (targetPlate.items || []).reduce((sum, it) => sum + (it.qty || 1), 0);
    const totalAmount = (targetPlate.items || []).reduce((sum, it) => sum + (parseFloat(it.price) || 0), 0);

    const currentUserName = (state.user && state.user.name && state.user.name.trim()) ? state.user.name.trim() : '';
    const isMyPlate = Boolean(currentUserName && targetPlate.person.trim().toLowerCase() === currentUserName.toLowerCase());

    if (els.stickyTargetPersonName) {
        els.stickyTargetPersonName.innerText = `🛒 ${targetPlate.person}'un Tabağı`;
    }
    if (els.stickyCartTotalText) {
        els.stickyCartTotalText.innerText = `${itemCount} Ürün • ${totalAmount} ₺`;
    }

    if (els.btnStickyGoToCart) {
        if (isMyPlate || !currentUserName) {
            els.btnStickyGoToCart.innerHTML = `<i class="fa-solid fa-circle-check"></i> Tabağımı Onayla`;
            els.btnStickyGoToCart.title = "Seçtiğiniz yemekleri onaylayıp sepet & hesap masasına geçin";
        } else {
            els.btnStickyGoToCart.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${targetPlate.person}'un Tabağını Onayla`;
            els.btnStickyGoToCart.title = `${targetPlate.person} için tabağı onaylayıp sepete geçin`;
        }
    }
}

window.setMenuCategory = function(cat) {
    currentMenuCategory = cat;
    renderMenuScreen();
};

window.changeCatalogItemQty = function(itemId, delta) {
    const current = menuQuantities[itemId] || 1;
    const next = Math.max(1, Math.min(99, current + delta));
    menuQuantities[itemId] = next;
    const el = document.getElementById(`catalogQty_${itemId}`);
    if (el) el.innerText = next;
};

window.addCatalogItemToTargetPlate = function(itemId) {
    const item = FOOD_CATALOG.find(f => f.id === itemId);
    if (!item) return;

    const targetIdx = getTargetPersonIndex();
    const plate = state.plates[targetIdx];
    if (!plate) return;

    if (!plate.items) plate.items = [];

    const qty = menuQuantities[itemId] || 1;
    const unitPrice = item.price;

    const existing = plate.items.find(it => it.name.trim().toLowerCase() === item.name.trim().toLowerCase());
    if (existing) {
        existing.qty = (existing.qty || 1) + qty;
        existing.unitPrice = unitPrice;
        existing.price = Math.round(existing.qty * existing.unitPrice);
    } else {
        const isDrink = (item.category === 'İçecekler');
        plate.items.push({
            id: 'it_cat_' + Date.now() + Math.random().toString(36).substr(2, 4),
            name: item.name,
            qty: qty,
            unitPrice: unitPrice,
            price: Math.round(qty * unitPrice),
            emoji: item.emoji,
            type: isDrink ? 'drink' : 'food'
        });
    }

    // Reset qty stepper back to 1
    menuQuantities[itemId] = 1;
    const qtyEl = document.getElementById(`catalogQty_${itemId}`);
    if (qtyEl) qtyEl.innerText = '1';

    audio.init();
    audio.tick();
    showGlobalToast(`✅ ${qty}x ${item.name} eklendi! (${plate.person})`);
    updateMenuStickyCartBar();
    broadcastPlatesChange();
};

// Wire menu search input & buttons
if (els.menuSearchInput) {
    els.menuSearchInput.addEventListener('input', (e) => {
        currentMenuSearch = e.target.value;
        if (els.btnClearMenuSearch) {
            els.btnClearMenuSearch.style.display = currentMenuSearch ? 'block' : 'none';
        }
        renderMenuScreen();
    });
}
if (els.btnClearMenuSearch) {
    els.btnClearMenuSearch.addEventListener('click', () => {
        currentMenuSearch = '';
        els.menuSearchInput.value = '';
        els.btnClearMenuSearch.style.display = 'none';
        renderMenuScreen();
    });
}

function handleConfirmPlateAndProceed() {
    const targetIdx = getTargetPersonIndex();
    const targetPlate = (state.plates && state.plates[targetIdx]) ? state.plates[targetIdx] : null;

    setupPlatesData();
    renderPlatesUI();

    const currentUserName = (state.user && state.user.name && state.user.name.trim()) ? state.user.name.trim() : '';
    const personName = targetPlate ? targetPlate.person : (currentUserName || 'Tabağınız');
    const itemCount = targetPlate ? (targetPlate.items || []).reduce((sum, it) => sum + (it.qty || 1), 0) : 0;

    audio.init();
    audio.fanfare();
    if (window.confetti) {
        confetti({ particleCount: 65, spread: 65, origin: { y: 0.7 } });
    }

    if (itemCount > 0) {
        window.showAppToast(`✅ <strong>${personName}</strong> tabağı başarıyla onaylandı! Sepet & hesap masasına aktarılıyorsunuz...`, 'success');
    } else {
        window.showAppToast(`ℹ️ <strong>${personName}</strong> için tabak onaylandı. Dilediğiniz zaman sepet masasında yemek ekleyebilirsiniz.`, 'info');
    }

    broadcastPlatesChange();
    if (typeof broadcastRoomState === 'function') {
        broadcastRoomState();
    }

    navigateTo('screen-result');
}

if (els.btnMenuGoToPlates) {
    els.btnMenuGoToPlates.addEventListener('click', handleConfirmPlateAndProceed);
}

if (els.btnStickyGoToCart) {
    els.btnStickyGoToCart.addEventListener('click', handleConfirmPlateAndProceed);
}

const btnCustomDish = document.getElementById('btnOpenCustomDishPrompt');
if (btnCustomDish) {
    btnCustomDish.onclick = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        window.openAddFoodModal();
    };
}

if (els.btnGoToMenu) {
    els.btnGoToMenu.addEventListener('click', () => {
        setupPlatesData();
        renderMenuScreen();
        navigateTo('screen-menu');
    });
}

// --- 9. TINDER-STYLE CUISINE / RESTAURANT MATCH (SWIPE) ---
function renderCurrentCard() {
    if (state.currentCardIndex >= state.foods.length) {
        finishFoodMatch();
        return;
    }

    const item = state.foods[state.currentCardIndex];
    if (els.cardCounter) els.cardCounter.innerText = `${state.currentCardIndex + 1}/${state.foods.length}`;

    if (els.swipeCardWrapper) els.swipeCardWrapper.innerHTML = `
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

if (els.btnSwipeLeft) els.btnSwipeLeft.addEventListener('click', () => handleSwipe('left'));
if (els.btnSwipeRight) els.btnSwipeRight.addEventListener('click', () => handleSwipe('right'));
if (els.btnSuperLike) els.btnSuperLike.addEventListener('click', () => handleSwipe('super'));

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

if (els.btnSkipToWheel) {
    els.btnSkipToWheel.addEventListener('click', () => {
        state.winnerFood = state.acceptedFoods[0] || state.foods[0];
        navigateTo('screen-wheel');
    });
}

// --- 10. RUNNER SELECTION: VOLUNTEER OR WHEEL ---
function renderWheelParticipants() {
    if (!els.wheelParticipantsList) return;
    const participants = getActiveParticipants();
    if (els.wheelParticipantCount) {
        els.wheelParticipantCount.innerText = participants.length;
    }

    els.wheelParticipantsList.innerHTML = participants.map((p) => {
        const isRunner = state.runner && state.runner.toLowerCase() === p.toLowerCase();
        const safeName = p.replace(/'/g, "\\'");
        return `
            <span class="chip clickable ${isRunner ? 'active-runner-chip' : ''}" onclick="selectRunnerDirectly('${safeName}')" title="${isRunner ? 'Seçili Siparişçi' : 'Siparişçi Olarak Seç'}">
                <i class="fa-solid ${isRunner ? 'fa-crown text-amber' : 'fa-circle-user text-orange'}"></i>
                <strong>${p}</strong>
                ${isRunner ? '<span class="runner-badge-tag">👑 Siparişçi</span>' : ''}
            </span>
        `;
    }).join('') + `
        <button type="button" class="chip-add-btn" id="btnWheelInnerAdd">
            <i class="fa-solid fa-user-plus"></i> + Kişi Ekle
        </button>
    `;

    const innerAdd = document.getElementById('btnWheelInnerAdd');
    if (innerAdd) {
        innerAdd.onclick = () => {
            const name = prompt('Odaya ve siparişçiye eklenecek kişinin adını yazın:');
            if (name && name.trim()) {
                window.addParticipantToRoom(name.trim());
            }
        };
    }
}

function populateVolunteerSelect() {
    const participants = getActiveParticipants();
    if (els.volunteerSelect) {
        els.volunteerSelect.innerHTML = '<option value="">Gruptan Birini Seç...</option>' + 
            participants.map(p => `<option value="${p}" ${state.runner && state.runner.toLowerCase() === p.toLowerCase() ? 'selected' : ''}>${p}</option>`).join('');
    }
    renderWheelParticipants();
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

function broadcastRunnerChange(runnerPerson) {
    if (!currentRoomChannel || !state.room) return;
    try {
        currentRoomChannel.send({
            type: 'broadcast',
            event: 'runner_selected',
            payload: { runner: runnerPerson, sender: state.user ? state.user.name : 'Siz' }
        });
        broadcastRoomState();
    } catch (e) {
        console.warn('Broadcast runner error:', e);
    }
}

function selectRunnerDirectly(runnerPerson, shouldBroadcast = true) {
    audio.init();
    audio.fanfare();
    state.runner = runnerPerson;
    showRunnerResult(runnerPerson);
    renderWheelParticipants();
    if (els.volunteerSelect) {
        els.volunteerSelect.value = runnerPerson;
    }
    // Tabaklardaki isRunner ve paid durumlarını da senkronize et
    if (state.plates && state.plates.length > 0) {
        state.plates.forEach(p => {
            p.isRunner = (p.person.trim().toLowerCase() === runnerPerson.trim().toLowerCase());
            if (p.isRunner) {
                p.paid = true;
            }
        });
        renderPlatesUI();
    }
    if (shouldBroadcast) {
        broadcastRunnerChange(runnerPerson);
        broadcastPlatesChange();
    }
}

function getWheelItems() {
    return getActiveParticipants();
}

function drawWheel() {
    const canvas = els.wheelCanvas;
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 10;
    const wheelItems = getWheelItems();
    const count = Math.max(wheelItems.length, 1);
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
        ctx.fillText(wheelItems[i], radius - 20, 5);
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
            const wheelItems = getWheelItems();
            const runnerWinner = wheelItems[targetSlice] || wheelItems[0];
            selectRunnerDirectly(runnerWinner);
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

if (els.btnProceedToOrder) {
    els.btnProceedToOrder.addEventListener('click', () => {
        try {
            renderResultScreen();
        } catch (err) {
            console.error('renderResultScreen error, falling back:', err);
            setupPlatesData();
            renderPlatesUI();
        }
        navigateTo('screen-result');
    });
}

// --- 11. BİREYSEL TABAKLAR & ADALETLİ HESAP BÖLÜŞÜMÜ (INDIVIDUAL PLATES & FAIR SPLIT) ---
function renderResultScreen() {
    const runner = getEffectiveRunner();
    const roomTitle = state.room?.title || 'Ortak Sipariş Masası';

    if (els.finalFoodTitle) els.finalFoodTitle.innerText = roomTitle;
    if (els.winnerFoodEmoji) els.winnerFoodEmoji.innerText = '🍽️';
    if (els.winnerFoodName) els.winnerFoodName.innerText = roomTitle;
    if (els.winnerDecisionTag) {
        els.winnerDecisionTag.innerText = '📋 Herkes Kendi Tabağını Belirliyor';
    }

    if (els.summaryRunnerName) els.summaryRunnerName.innerText = runner;
    if (els.cartRunnerDisplay) els.cartRunnerDisplay.innerText = runner;

    // Affiliate Linkleri (Genel Lezzet Arama)
    const query = encodeURIComponent(roomTitle.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ ]/g, ''));
    const affId = 'neyiyoruz_aff';

    if (els.linkYemeksepeti) els.linkYemeksepeti.href = `https://www.yemeksepeti.com/search?q=${query}&utm_source=affiliate&utm_medium=neyiyoruz&ref=${affId}`;
    if (els.linkTrendyol) els.linkTrendyol.href = `https://www.trendyol.com/sr?q=${query}&ty_aff=${affId}`;
    if (els.linkGetir) els.linkGetir.href = `https://getir.com/yemek/ara/?q=${query}&utm_source=neyiyoruz`;

    setupPlatesData();
    renderPlatesUI();
}

function setupPlatesData() {
    const participants = getActiveParticipants();
    const currentRunner = getEffectiveRunner();

    // Eğer tabaklar zaten varsa katılımcıları koru, eksik olan varsa boş tabak olarak ekle
    if (state.plates && state.plates.length > 0) {
        participants.forEach(person => {
            const exists = state.plates.some(p => p.person.trim().toLowerCase() === person.trim().toLowerCase());
            if (!exists) {
                const isRunner = (person.trim().toLowerCase() === currentRunner.toLowerCase());
                state.plates.push({
                    person: person,
                    isRunner: isRunner,
                    paid: isRunner,
                    items: []
                });
            }
        });

        // Tabaklardaki isRunner ve paid senkronizasyonu
        state.plates.forEach(p => {
            const isRunner = (p.person.trim().toLowerCase() === currentRunner.toLowerCase());
            p.isRunner = isRunner;
            if (isRunner && !p.paid) {
                p.paid = true;
            }
        });
        return;
    }

    state.plates = participants.map((person) => {
        const isRunner = (person.trim().toLowerCase() === currentRunner.toLowerCase());
        return {
            person: person,
            isRunner: isRunner,
            paid: isRunner,
            items: []
        };
    });
}

function renderPlatesUI() {
    const currentUserName = (state.user && state.user.name && state.user.name.trim()) ? state.user.name.trim() : '';
    const currentRunner = getEffectiveRunner();
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

            const isMyPlate = Boolean(currentUserName && plate.person.trim().toLowerCase() === currentUserName.toLowerCase());
            let copyBtnText = '🤝 Bana da Aynısından!';
            let copyBtnTitle = `"${plate.person}" ile aynı siparişi kendi tabağına kopyala`;
            let copyBtnIcon = 'fa-handshake';

            if (isMyPlate) {
                copyBtnText = '👥 +1 Arkadaşıma Aynısından';
                copyBtnTitle = 'Bu siparişin aynısını başka bir arkadaşın için ekle';
                copyBtnIcon = 'fa-user-plus';
            } else if (!currentUserName) {
                copyBtnText = '🤝 Aynısından İsterim';
                copyBtnTitle = 'Bu siparişin aynısını bir kişi için ekle';
                copyBtnIcon = 'fa-user-plus';
            }

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
                    ${(!plate.items || plate.items.length === 0) ? `
                        <div class="empty-plate-hint">
                            <span class="empty-icon">🍽️</span>
                            <strong>Tabağınız Henüz Boş</strong>
                            <p>Henüz bir seçim yapmadınız. Dilediğiniz lezzet ve içecekleri ekleyin:</p>
                            <button type="button" class="btn btn-xs btn-primary" onclick="promptAddItemToPlate(${index})">
                                <i class="fa-solid fa-plus"></i> Yemek veya İçecek Ekle
                            </button>
                        </div>
                    ` : plate.items.map((it, itemIdx) => {
                        const qty = it.qty || 1;
                        const unitPrice = it.unitPrice !== undefined ? it.unitPrice : it.price;
                        const totalPrice = it.price !== undefined ? it.price : (qty * unitPrice);

                        return `
                        <div class="plate-single-item-row">
                            <span class="plate-item-emoji">${it.emoji || (it.type === 'drink' ? '🥤' : '🍽️')}</span>
                            <input type="text" class="plate-item-name-input" 
                                   value="${it.name}" 
                                   placeholder="Yemek veya içecek adı..." 
                                   oninput="updatePlateItemName(${index}, ${itemIdx}, this.value)"
                                   onchange="updatePlateItemName(${index}, ${itemIdx}, this.value)">
                            
                            <!-- Adet Stepper: [ - ] 1 [ + ] -->
                            <div class="plate-item-qty-stepper" title="Adet / Porsiyon Sayısı">
                                <button type="button" class="btn-qty" onclick="changePlateItemQty(${index}, ${itemIdx}, -1)">-</button>
                                <span class="plate-item-qty-text">${qty}</span>
                                <button type="button" class="btn-qty" onclick="changePlateItemQty(${index}, ${itemIdx}, 1)">+</button>
                            </div>

                            <div class="plate-item-price-box" title="Toplam Tutar (Birim: ${unitPrice} ₺)">
                                <input type="number" class="plate-item-price-input" 
                                       value="${totalPrice}" 
                                       placeholder="0" min="0" step="5"
                                       oninput="updatePlateItemPrice(${index}, ${itemIdx}, this.value)"
                                       onchange="updatePlateItemPrice(${index}, ${itemIdx}, this.value)">
                                <span class="plate-item-currency">₺</span>
                            </div>
                            <button type="button" class="btn-remove-plate-item" onclick="removePlateItem(${index}, ${itemIdx})" title="Bu ürünü çıkar">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                        `;
                    }).join('')}
                </div>

                <!-- Favori Lezzet Hızlı Ekleme Çipleri (Kullanıcı Yıldızladıkları) -->
                <div class="plate-quick-chips-box">
                    <div class="flex-between align-center mb-1">
                        <span class="quick-chips-label"><i class="fa-solid fa-star text-amber"></i> Favori Hızlı Ekle:</span>
                        <button type="button" class="btn-xs btn-ghost text-muted" onclick="openMenuForPerson(${index})" style="font-size:11px;" title="Menüden daha fazla lezzet yıldızla">
                            + Menüden Yıldızla
                        </button>
                    </div>
                    <div class="plate-quick-chips">
                        ${(() => {
                            const favs = (state.favoriteItemIds || []).map(fid => FOOD_CATALOG.find(f => f.id === fid)).filter(Boolean);
                            if (favs.length === 0) {
                                return `<span class="small-text text-muted" style="font-size:11px; padding: 2px 4px;">
                                    ⭐ Menüde yemeklerin yanındaki yıldıza tıklayarak buraya favorilerinizi ekleyebilirsiniz.
                                </span>`;
                            }
                            return favs.map(f => `
                                <button type="button" class="quick-food-chip" onclick="addQuickItemToPlate(${index}, '${f.name.replace(/'/g, "\\'")}', ${f.price}, '${f.emoji}', '${f.type || 'food'}')" title="${f.name} ekle">
                                    ${f.emoji} ${f.name} ${f.price}₺
                                </button>
                            `).join('');
                        })()}
                    </div>
                </div>

                <!-- Temiz Sipariş Aksiyon Barı (Menüyü Aç & Aynısından İsterim) -->
                <div class="plate-action-bar">
                    <button type="button" class="btn btn-sm btn-outline flex-1" onclick="openMenuForPerson(${index})" title="Geniş menü kataloğunu aç">
                        <i class="fa-solid fa-utensils"></i> 📖 Menüden Yemek Seç
                    </button>
                    <button type="button" class="btn-copy-same-plate flex-1" onclick="clonePlateForAnotherPerson(${index})" title="${copyBtnTitle}">
                        <i class="fa-solid ${copyBtnIcon}"></i> ${copyBtnText}
                    </button>
                </div>

                <div class="plate-status-row">
                    <button class="debt-status-btn ${plate.paid ? 'status-paid' : 'status-debt'}" onclick="togglePlatePaid(${index})">
                        ${plate.paid ? (plate.isRunner ? '✓ Hesabı Ödeyen' : '✓ Ödedi') : (personTotal > 0 ? '❌ ' + currentRunner + '\'e Borçlu (' + personTotal + ' ₺)' : '⚪ Sipariş Bekleniyor')}
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

window.changePlateItemQty = function(personIndex, itemIndex, delta) {
    const plate = state.plates[personIndex];
    if (!plate || !plate.items || !plate.items[itemIndex]) return;

    const item = plate.items[itemIndex];
    if (!item.qty) item.qty = 1;
    if (item.unitPrice === undefined) item.unitPrice = parseFloat(item.price) || 50;

    const newQty = item.qty + delta;
    if (newQty <= 0) {
        removePlateItem(personIndex, itemIndex);
        return;
    }

    item.qty = newQty;
    item.price = Math.round(item.qty * item.unitPrice);
    audio.init();
    audio.tick();
    renderPlatesUI();
    broadcastPlatesChange();
};

window.addQuickItemToPlate = function(personIndex, name, price, emoji, type) {
    if (state.plates[personIndex]) {
        if (!state.plates[personIndex].items) state.plates[personIndex].items = [];
        
        // If an item with the same name already exists in this plate, increment its quantity!
        const existing = state.plates[personIndex].items.find(it => it.name.trim().toLowerCase() === name.trim().toLowerCase());
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
            if (existing.unitPrice === undefined) existing.unitPrice = price;
            existing.price = Math.round(existing.qty * existing.unitPrice);
        } else {
            state.plates[personIndex].items.push({
                id: 'it_' + Date.now() + Math.random().toString(36).substr(2, 4),
                name: name,
                qty: 1,
                unitPrice: price,
                price: price,
                emoji: emoji || '🍽️',
                type: type || 'drink'
            });
        }
        audio.init();
        audio.tick();
        renderPlatesUI();
        broadcastPlatesChange();
    }
};

window.addNewCustomItemToPlate = function(personIndex) {
    if (state.plates[personIndex]) {
        if (!state.plates[personIndex].items) state.plates[personIndex].items = [];
        state.plates[personIndex].items.push({
            id: 'it_' + Date.now(),
            name: 'Yeni İçecek / Yan Ürün',
            qty: 1,
            unitPrice: 45,
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
        broadcastPlatesChange();
    }
};

window.updatePlateItemName = function(personIndex, itemIndex, value) {
    if (state.plates[personIndex] && state.plates[personIndex].items && state.plates[personIndex].items[itemIndex]) {
        state.plates[personIndex].items[itemIndex].name = value;
    }
};

window.updatePlateItemPrice = function(personIndex, itemIndex, value) {
    if (state.plates[personIndex] && state.plates[personIndex].items && state.plates[personIndex].items[itemIndex]) {
        const item = state.plates[personIndex].items[itemIndex];
        const val = parseFloat(value) || 0;
        item.price = val;
        item.unitPrice = (item.qty && item.qty > 0) ? Math.round((val / item.qty) * 100) / 100 : val;
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
                const runnerName = getEffectiveRunner();
                debtBtn.innerText = plate.isRunner ? '✓ Hesabı Ödeyen' : `❌ ${runnerName}'e Borçlu (${personTotal} ₺)`;
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
    const runner = getEffectiveRunner();
    const roomTitle = state.room?.title || 'Ortak Sipariş Masası';
    
    let text = `📋 Ne Yiyoruz Sipariş & Hesap Özeti\n`;
    text += `🏠 Masa / Oda: ${roomTitle}\n`;
    text += `🛵 Siparişçi (Hesabı Ödeyen): ${runner}\n`;
    text += `---------------------------------\n`;

    let grandTotal = 0;
    state.plates.forEach(p => {
        const items = p.items && p.items.length ? p.items : [{ name: p.dish || 'Sipariş', price: p.price || 0, emoji: '🍽️' }];
        const personTotal = items.reduce((sum, it) => sum + (parseFloat(it.price) || 0), 0);
        grandTotal += personTotal;

        const isRunner = (p.person.trim().toLowerCase() === runner.toLowerCase());
        const roleStr = isRunner ? ' (Siparişçi / Ödeyen)' : '';
        text += `👤 ${p.person}${roleStr}:\n`;
        items.forEach(it => {
            const qtyStr = (it.qty && it.qty > 1) ? `${it.qty}x ` : '';
            text += `   • ${it.emoji || '🍽️'} ${qtyStr}${it.name} (${it.price} ₺)\n`;
        });
        text += `   Kişi Toplamı: ${personTotal} ₺ [${p.paid ? 'ÖDENDİ' : 'BORÇLU'}]\n\n`;
    });

    text += `---------------------------------\n`;
    text += `💰 TOPLAM HESAP: ${grandTotal} ₺\n`;
    const debtors = state.plates.filter(p => !p.paid && p.person.trim().toLowerCase() !== runner.toLowerCase());
    if (debtors.length > 0) {
        text += `\n📌 ${runner}'e Borçlular:\n`;
        debtors.forEach(d => {
            const amount = (d.items || []).reduce((s, i) => s + (parseFloat(i.price)||0), 0);
            text += `   • ${d.person}: ${amount} ₺\n`;
        });
    } else {
        text += `\n🎉 Tüm hesaplar kapandı (Herkes ödedi)!\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
        els.orderNoteCopiedNotice.style.display = 'block';
        setTimeout(() => {
            els.orderNoteCopiedNotice.style.display = 'none';
        }, 3000);
        if (typeof window.showAppToast === 'function') {
            window.showAppToast('📋 Sipariş & borç özeti panoya kopyalandı!', 'success');
        }
    });
};
document.getElementById('btnCopyOrderNote').addEventListener('click', els.btnCopyOrderNote);

// --- BORCLARI KAYDET ---
els.btnSaveDebtSummary.addEventListener('click', () => {
    const runner = getEffectiveRunner();
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
        const orderRunner = record.runner || 'Siparişçi';
        (record.plates || []).forEach(p => {
            if (!p.paid && !p.isRunner && p.person.trim().toLowerCase() !== orderRunner.trim().toLowerCase()) {
                const key = `${p.person} ➔ ${orderRunner}`;
                if (!unpaidMap[key]) unpaidMap[key] = 0;
                unpaidMap[key] += (parseFloat(p.price) || 0);
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
        state.wheelMode = 'food';
        if (els.wheelBadge) els.wheelBadge.innerText = '🍕 LEZZET KURASI';
        if (els.wheelTitle) els.wheelTitle.innerText = 'Hangi Yemeği Yiyeceğiz?';
        if (els.wheelSubDesc) els.wheelSubDesc.innerText = 'Beğendiğin lezzetler arasında kura çekiliyor!';
        navigateTo('screen-wheel');
        drawWheel();
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


// Hepsini Tabağıma Ekle & Sepete Git
function addAllLikedToMyPlate() {
    if (!state.acceptedFoods || state.acceptedFoods.length === 0) {
        alert('Henüz beğendiğiniz bir ürün yok.');
        return;
    }

    const participants = getActiveParticipants();
    const myName = state.user ? state.user.name : participants[0];

    // Build items from all accepted foods
    const newItems = state.acceptedFoods.map((f, i) => {
        const p = parseFloat(f.price) || 100;
        return {
            id: 'it_all_' + Date.now() + '_' + i,
            name: f.name,
            qty: 1,
            unitPrice: p,
            price: p,
            emoji: f.emoji || '🍽️',
            type: 'food'
        };
    });

    state.plates = participants.map(person => ({
        person: person,
        isRunner: (person === state.runner),
        paid: (person === state.runner),
        items: JSON.parse(JSON.stringify(newItems))
    }));

    state.winnerFood = {
        name: state.acceptedFoods.map(f => f.name).join(' + '),
        emoji: '🍽️',
        price: state.acceptedFoods.reduce((s, f) => s + (parseFloat(f.price) || 0), 0) + ' ₺'
    };

    if (els.likedChoicesModal) els.likedChoicesModal.classList.remove('active');
    if (els.matchModal) els.matchModal.classList.remove('active');

    renderResultScreen();
    broadcastPlatesChange();
    navigateTo('screen-result');
}

if (els.btnAddAllLikedToPlate) {
    els.btnAddAllLikedToPlate.addEventListener('click', addAllLikedToMyPlate);
}


function showFoodWheelResult(foodObj) {
    audio.fanfare();
    if (window.confetti) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }
    if (els.runnerName) els.runnerName.innerText = `${foodObj.emoji || '🍽️'} ${foodObj.name}`;
    if (els.runnerResultBox) {
        const h3 = els.runnerResultBox.querySelector('h3');
        if (h3) h3.innerHTML = `🎉 Kazanan Lezzet: <span class="text-orange">${foodObj.name}</span>!`;
        const p = els.runnerResultBox.querySelector('p');
        if (p) p.innerText = 'Çark bu lezzette karar kıldı. Şimdi tabak ve sepeti oluşturalım:';
        els.runnerResultBox.style.display = 'block';
        els.runnerResultBox.scrollIntoView({ behavior: 'smooth' });
    }
}


// --- 13. CANLI SİPARİŞ ZAMANLAYICISI (GELEN GELİR, GELMEYEN AÇ KALIR!) ---
let roomTimerInterval = null;
let selectedTimerMinutes = 10;

function setupTimerPresetListeners() {
    const createChips = document.querySelectorAll('#createTimerChips .timer-chip');
    createChips.forEach(chip => {
        chip.addEventListener('click', () => {
            createChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedTimerMinutes = parseInt(chip.dataset.mins) || 0;
        });
    });

    const activeChips = document.querySelectorAll('#activeTimerChips .timer-chip');
    activeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            activeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const mins = parseInt(chip.dataset.mins, 10);
            setRoomTimer(mins);
            broadcastRoomState();
        });
    });

    if (els.btnExtendTimer) {
        els.btnExtendTimer.addEventListener('click', () => {
            extendRoomTimer(2);
        });
    }
}

function setRoomTimer(minutes) {
    selectedTimerMinutes = minutes;
    if (state.room) {
        state.room.timerMinutes = minutes;
    }
    if (els.activeRoomTimerLabel) {
        els.activeRoomTimerLabel.innerText = minutes > 0 ? `${minutes} Dakika` : 'Süresiz';
    }

    const activeChips = document.querySelectorAll('#activeTimerChips .timer-chip');
    activeChips.forEach(chip => {
        const chipMins = parseInt(chip.dataset.mins, 10);
        if (chipMins === minutes) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    if (minutes <= 0) {
        // Süresiz
        clearInterval(roomTimerInterval);
        roomTimerInterval = null;
        if (state.room) {
            state.room.timerEndTime = null;
            state.room.timerMinutes = 0;
        }
        if (els.roomTimerBar) els.roomTimerBar.style.display = 'none';
        return;
    }

    const endTime = Date.now() + minutes * 60 * 1000;
    if (state.room) {
        state.room.timerEndTime = endTime;
        state.room.timerMinutes = minutes;
    }

    startRoomCountdown(endTime);
}

function startRoomCountdown(endTime) {
    clearInterval(roomTimerInterval);
    if (!els.roomTimerBar) return;

    els.roomTimerBar.style.display = 'flex';
    updateTimerDisplay(endTime);

    roomTimerInterval = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(roomTimerInterval);
            roomTimerInterval = null;
            onRoomTimerExpired();
        } else {
            updateTimerDisplay(endTime);
        }
    }, 1000);
}

function updateTimerDisplay(endTime) {
    const remaining = Math.max(0, endTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (els.timerCountdownDisplay) {
        els.timerCountdownDisplay.innerText = formatted;
    }

    if (els.roomTimerBar) {
        if (totalSeconds <= 60 && totalSeconds > 0) {
            els.roomTimerBar.classList.add('timer-urgent');
        } else {
            els.roomTimerBar.classList.remove('timer-urgent');
        }
    }
}

function extendRoomTimer(additionalMinutes) {
    if (!state.room || !state.room.timerEndTime) {
        setRoomTimer(additionalMinutes);
        return;
    }
    state.room.timerEndTime += additionalMinutes * 60 * 1000;
    startRoomCountdown(state.room.timerEndTime);
    audio.init();
    audio.fanfare();
    alert(`⏱️ Sipariş süresi +${additionalMinutes} dakika uzatıldı!`);
}

function onRoomTimerExpired() {
    audio.fanfare();
    if (els.roomTimerBar) {
        els.roomTimerBar.classList.add('timer-urgent');
        if (els.timerCountdownDisplay) els.timerCountdownDisplay.innerText = '00:00';
    }

    alert('⏰ SÜRE DOLDU!\\n\\nZaman bitti! Odaya henüz katılmayanlar elendi. Sipariş mevcut katılımcılarla kilitlendi.');

    // Kalan katılımcılarla doğrudan sepete geç
    renderResultScreen();
    navigateTo('screen-result');
}

// Wire setupTimerPresetListeners on load
document.addEventListener('DOMContentLoaded', setupTimerPresetListeners);
setupTimerPresetListeners();


// --- GLOBAL TOAST BİLDİRİMİ ---
window.showAppToast = function(message, type = 'success') {
    let container = document.getElementById('appToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'appToastContainer';
        container.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;width:90%;max-width:440px;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bg = type === 'error' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : (type === 'info' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #10b981, #059669)');
    toast.style.cssText = `background:${bg};color:#ffffff;padding:12px 18px;border-radius:12px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.4), 0 0 15px rgba(255,255,255,0.15);font-size:14px;font-weight:600;text-align:center;opacity:0;transform:translateY(-15px) scale(0.95);transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);pointer-events:auto;border:1px solid rgba(255,255,255,0.2);`;
    toast.innerHTML = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0) scale(1)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-15px) scale(0.95)';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 320);
    }, 4000);
};

// --- AYNISINDAN İSTERİM (GİRİŞ YAPMIŞSA SORMADAN KOPYALA, MİSAFİR YA DA KENDİ TABAĞIYSA SOR) ---
window.clonePlateForAnotherPerson = function(sourceIndex) {
    const sourcePlate = state.plates[sourceIndex];
    if (!sourcePlate || !sourcePlate.items || sourcePlate.items.length === 0) {
        window.showAppToast('⚠️ Bu tabakta henüz bir yemek bulunmuyor.', 'info');
        return;
    }

    const currentUserName = (state.user && state.user.name && state.user.name.trim()) ? state.user.name.trim() : '';
    const isSourceMine = Boolean(currentUserName && sourcePlate.person.trim().toLowerCase() === currentUserName.toLowerCase());

    let targetPersonName = '';

    if (currentUserName && !isSourceMine) {
        // Giriş yapmış kullanıcı başka birinin tabağında "Bana da Aynısından" butonuna tıkladı:
        // Kesinlikle soru sorma, doğrudan giriş yapan kişinin tabağına aktar!
        targetPersonName = currentUserName;
    } else if (currentUserName && isSourceMine) {
        // Kullanıcı kendi tabağında "+1 Arkadaşıma Aynısından" butonuna tıkladı
        const friendName = prompt('Kendi siparişinizin aynısını hangi arkadaşınız için eklemek istiyorsunuz?\n(Örn: Ahmet, Ayşe, Mehmet)');
        if (!friendName || !friendName.trim()) return;
        targetPersonName = friendName.trim();
    } else {
        // Giriş yapılmamış (misafir modda)
        const friendName = prompt(`"${sourcePlate.person}" ile aynı siparişi verecek kişinin adı nedir?\n(Örn: Ahmet, Ayşe, Can)`);
        if (!friendName || !friendName.trim()) return;
        targetPersonName = friendName.trim();
    }

    // Odaya dahil değilse ekle
    if (!state.room) {
        state.room = { code: '1001', title: 'Yemek Grubu', participants: [sourcePlate.person] };
    }
    if (!state.room.participants.some(p => p.toLowerCase() === targetPersonName.toLowerCase())) {
        state.room.participants.push(targetPersonName);
    }

    // Aynı ürünleri klonla
    const clonedItems = sourcePlate.items.map((it, idx) => ({
        id: 'it_clone_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 6),
        name: it.name,
        qty: it.qty || 1,
        unitPrice: it.unitPrice !== undefined ? it.unitPrice : it.price,
        price: it.price !== undefined ? it.price : ((it.qty || 1) * (it.unitPrice || it.price)),
        emoji: it.emoji || '🍽️',
        type: it.type || 'food'
    }));

    let targetPlate = state.plates.find(p => p.person.trim().toLowerCase() === targetPersonName.toLowerCase());
    if (targetPlate) {
        targetPlate.items = clonedItems;
    } else {
        state.plates.push({
            person: targetPersonName,
            isRunner: false,
            paid: false,
            items: clonedItems
        });
    }

    audio.init();
    audio.fanfare();
    if (window.confetti) {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.65 } });
    }

    renderPlatesUI();
    renderActiveRoom();
    renderWheelParticipants();
    populateVolunteerSelect();
    drawWheel();
    broadcastPlatesChange();
    if (typeof broadcastRoomState === 'function') {
        broadcastRoomState();
    }

    const foodSummary = sourcePlate.items.map(i => (i.qty > 1 ? i.qty + 'x ' : '') + i.name).join(', ');
    if (currentUserName && targetPersonName.toLowerCase() === currentUserName.toLowerCase()) {
        window.showAppToast(`🎉 Harika! <strong>"${sourcePlate.person}"</strong> ile aynı sipariş (<em>${foodSummary}</em>) tabağınıza eklendi!`, 'success');
    } else {
        window.showAppToast(`🎉 <strong>${targetPersonName}</strong> için "${sourcePlate.person}" ile aynı sipariş (<em>${foodSummary}</em>) eklendi!`, 'success');
    }
};

window.promptAddItemToPlate = function(personIndex) {
    const plate = state.plates[personIndex];
    if (!plate) return;

    const itemName = prompt('Tabağa eklenecek lezzet veya içecek:\n(Örn: 3 Lahmacun, Ayran, Kola, 2 Et Döner, Patates, Su)');
    if (!itemName || !itemName.trim()) return;

    let cleanName = itemName.trim();
    let qty = 1;

    // "3 lahmacun", "2 döner", "4x ayran" gibi adet ön ekini akıllıca yakala
    const qtyMatch = cleanName.match(/^(\d+)\s*x?\s+(.+)$/i);
    if (qtyMatch) {
        qty = parseInt(qtyMatch[1], 10) || 1;
        cleanName = qtyMatch[2].trim();
    }

    const defaultPrice = /kola/i.test(cleanName) ? 50 : 
                         /ayran/i.test(cleanName) ? 35 : 
                         /su/i.test(cleanName) ? 15 : 
                         /lahmacun/i.test(cleanName) ? 110 : 
                         /döner|dürüm|kebap/i.test(cleanName) ? 220 : 
                         /burger/i.test(cleanName) ? 250 : 
                         /pizza/i.test(cleanName) ? 240 : 80;
    
    const priceStr = prompt(`"${cleanName}" için 1 adet birim fiyatı (₺):`, String(defaultPrice));
    const unitPrice = parseFloat(priceStr) || defaultPrice;

    if (!plate.items) plate.items = [];

    // Eğer aynı isimde ürün zaten varsa adedini artır
    const existing = plate.items.find(it => it.name.trim().toLowerCase() === cleanName.toLowerCase());
    if (existing) {
        existing.qty = (existing.qty || 1) + qty;
        existing.unitPrice = existing.unitPrice || unitPrice;
        existing.price = Math.round(existing.qty * existing.unitPrice);
    } else {
        const isDrink = /ayran|kola|su|şalgam|fanta|gazoz|çay|kahve/i.test(cleanName);
        const emoji = isDrink ? '🥤' : 
                      /lahmacun|pizza/i.test(cleanName) ? '🍕' : 
                      /döner|dürüm/i.test(cleanName) ? '🌯' : 
                      /burger/i.test(cleanName) ? '🍔' : 
                      /patates/i.test(cleanName) ? '🍟' : 
                      /tatlı|künefe|baklava/i.test(cleanName) ? '🍰' : '🍽️';

        plate.items.push({
            id: 'it_add_' + Date.now() + Math.random().toString(36).substr(2, 4),
            name: cleanName,
            qty: qty,
            unitPrice: unitPrice,
            price: Math.round(qty * unitPrice),
            emoji: emoji,
            type: isDrink ? 'drink' : 'food'
        });
    }

    audio.init();
    audio.tick();
    renderPlatesUI();
    broadcastPlatesChange();
};


// --- 14. SUPABASE REALTIME MULTIPLAYER ROOM & PLATES SYNC ---
let currentRoomChannel = null;

function showGlobalToast(msg) {
    let toast = document.getElementById('globalRoomToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalRoomToast';
        toast.className = 'global-room-toast';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

function initRoomRealtime(roomCode) {
    if (!supabaseClient) {
        console.warn('Supabase client not available for realtime sync.');
        return;
    }

    if (!roomCode) return;

    if (currentRoomChannel) {
        try {
            supabaseClient.removeChannel(currentRoomChannel);
        } catch (e) {}
        currentRoomChannel = null;
    }

    const currentUserName = state.user ? state.user.name : (getActiveParticipants()[0] || 'Katılımcı');
    console.log(`[Supabase Realtime] Connecting to room: ${roomCode} as ${currentUserName}`);

    currentRoomChannel = supabaseClient.channel('room_' + roomCode, {
        config: {
            broadcast: { ack: true, self: false },
            presence: { key: currentUserName }
        }
    });

    // 1. PRESENCE: Canlı Katılımcı Senkronizasyonu
    currentRoomChannel
        .on('presence', { event: 'sync' }, () => {
            const presenceState = currentRoomChannel.presenceState();
            const members = Object.keys(presenceState);
            console.log('[Supabase Presence Sync] Online members:', members);

            let updated = false;
            members.forEach(member => {
                if (member && !state.room.participants.includes(member)) {
                    state.room.participants.push(member);
                    updated = true;
                }
            });

            if (updated) {
                renderActiveRoom();
                renderWheelParticipants();
                setupPlatesData();
                renderPlatesUI();
                populateVolunteerSelect();
                drawWheel();
            }
        })
        .on('presence', { event: 'join' }, ({ key }) => {
            console.log('[Supabase Presence Join] User joined:', key);
            if (key && !state.room.participants.includes(key)) {
                state.room.participants.push(key);
                renderActiveRoom();
                renderWheelParticipants();
                setupPlatesData();
                renderPlatesUI();
                populateVolunteerSelect();
                drawWheel();
                audio.init();
                audio.fanfare();
                showGlobalToast(`🎉 ${key} odaya katıldı!`);
                broadcastRoomState();
            }
        });

    // 2. BROADCAST: Tabaklar, Yemek Seçimleri ve Sayaç Senkronizasyonu
    currentRoomChannel
        .on('broadcast', { event: 'request_state' }, (msg) => {
            console.log('[Broadcast] State requested by newcomer:', msg);
            broadcastRoomState();
        })
        .on('broadcast', { event: 'room_state' }, ({ payload }) => {
            console.log('[Broadcast] Received room_state:', payload);
            if (!payload) return;

            let platesChanged = false;

            if (payload.title && state.room) {
                state.room.title = payload.title;
            }

            if (payload.participants && Array.isArray(payload.participants)) {
                payload.participants.forEach(p => {
                    if (!state.room.participants.includes(p)) {
                        state.room.participants.push(p);
                    }
                });
            }

            if (payload.plates && Array.isArray(payload.plates)) {
                mergeRemotePlates(payload.plates);
                platesChanged = true;
            }

            if (payload.winnerFood) {
                state.winnerFood = payload.winnerFood;
            }

            if (payload.runner) {
                state.runner = payload.runner;
                showRunnerResult(payload.runner);
                renderWheelParticipants();
            }

            if (payload.timerEndTime && (!state.room.timerEndTime || payload.timerEndTime > state.room.timerEndTime)) {
                state.room.timerEndTime = payload.timerEndTime;
                state.room.timerMinutes = payload.timerMinutes !== undefined ? payload.timerMinutes : Math.round((payload.timerEndTime - Date.now()) / 60000);
                startRoomCountdown(payload.timerEndTime);
            } else if (payload.timerMinutes !== undefined && state.room) {
                state.room.timerMinutes = payload.timerMinutes;
            }

            renderActiveRoom();
            populateVolunteerSelect();
            drawWheel();
            if (platesChanged) {
                renderPlatesUI();
            }
        })
        .on('broadcast', { event: 'runner_selected' }, ({ payload }) => {
            console.log('[Broadcast] Received runner_selected:', payload);
            if (payload && payload.runner) {
                state.runner = payload.runner;
                showRunnerResult(payload.runner);
                renderWheelParticipants();
                if (els.volunteerSelect) {
                    els.volunteerSelect.value = payload.runner;
                }
                showGlobalToast(`👑 Siparişçi belirlendi: ${payload.runner}!`);
            }
        })
        .on('broadcast', { event: 'plates_update' }, ({ payload }) => {
            console.log('[Broadcast] Received plates_update:', payload);
            if (payload && Array.isArray(payload.plates)) {
                mergeRemotePlates(payload.plates);
                renderPlatesUI();
                populateVolunteerSelect();
                drawWheel();
                showGlobalToast(`🛒 Siparişler güncellendi!`);
            }
        })
        .subscribe(async (status) => {
            console.log('[Supabase Realtime] Channel status:', status);
            if (status === 'SUBSCRIBED') {
                await currentRoomChannel.track({
                    name: currentUserName,
                    onlineAt: new Date().toISOString()
                });

                currentRoomChannel.send({
                    type: 'broadcast',
                    event: 'request_state',
                    payload: { from: currentUserName }
                });

                broadcastRoomState();
            }
        });
}

function mergeRemotePlates(remotePlates) {
    if (!remotePlates || !Array.isArray(remotePlates)) return;

    if (!state.plates || state.plates.length === 0) {
        state.plates = remotePlates;
        return;
    }

    const currentUserName = state.user ? state.user.name : (getActiveParticipants()[0] || 'Siz');

    remotePlates.forEach(remotePlate => {
        const localIdx = state.plates.findIndex(p => p.person.toLowerCase() === remotePlate.person.toLowerCase());
        if (localIdx >= 0) {
            if (remotePlate.person.toLowerCase() !== currentUserName.toLowerCase()) {
                state.plates[localIdx] = remotePlate;
            }
        } else {
            state.plates.push(remotePlate);
            if (!state.room.participants.includes(remotePlate.person)) {
                state.room.participants.push(remotePlate.person);
            }
        }
    });
}

function broadcastPlatesChange() {
    if (!currentRoomChannel) return;
    try {
        currentRoomChannel.send({
            type: 'broadcast',
            event: 'plates_update',
            payload: {
                plates: state.plates,
                sender: state.user ? state.user.name : 'Siz'
            }
        });
    } catch (e) {
        console.warn('Broadcast plates change error:', e);
    }
}

function broadcastRoomState() {
    if (!currentRoomChannel || !state.room) return;
    try {
        currentRoomChannel.send({
            type: 'broadcast',
            event: 'room_state',
            payload: {
                title: state.room.title,
                code: state.room.code,
                participants: state.room.participants,
                plates: state.plates,
                winnerFood: state.winnerFood,
                runner: state.runner,
                timerEndTime: state.room.timerEndTime,
                timerMinutes: state.room.timerMinutes
            }
        });
    } catch (e) {
        console.warn('Broadcast room state error:', e);
    }
}

const btnTopCustom = document.getElementById('btnOpenCustomDishPromptTop');
if (btnTopCustom) {
    btnTopCustom.addEventListener('click', () => {
        const targetIdx = getTargetPersonIndex();
        promptAddItemToPlate(targetIdx);
        updateMenuStickyCartBar();
    });
}

// --- YENİ YEMEK EKLEME MODALI FONKSİYONLARI ---
window.openAddFoodModal = function() {
    const modal = document.getElementById('modalAddNewFood');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        const nameInput = document.getElementById('customFoodNameInput');
        if (nameInput) {
            nameInput.value = '';
            setTimeout(() => { if (nameInput && nameInput.focus) nameInput.focus(); }, 150);
        }
    }
};

window.closeAddFoodModal = function() {
    const modal = document.getElementById('modalAddNewFood');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
};

window.handleAddNewFoodSubmit = function(e) {
    if (e && e.preventDefault) e.preventDefault();

    const nameInput = document.getElementById('customFoodNameInput');
    const catSelect = document.getElementById('customFoodCategorySelect');
    const priceInput = document.getElementById('customFoodPriceInput');

    if (!nameInput || !nameInput.value.trim()) return;

    const foodName = nameInput.value.trim();
    const category = catSelect ? catSelect.value : 'Kebap & Köfte';
    const selectedOption = catSelect ? catSelect.options[catSelect.selectedIndex] : null;
    const emoji = (selectedOption && selectedOption.dataset.emoji) ? selectedOption.dataset.emoji : '🍽️';
    const price = priceInput ? (parseFloat(priceInput.value) || 150) : 150;

    const isDrink = (category === 'İçecekler') || /kola|ayran|su|şalgam|fanta|çay|kahve/i.test(foodName);

    const newFoodItem = {
        id: 'fc_custom_' + Date.now(),
        name: foodName,
        category: category,
        emoji: emoji,
        price: price,
        desc: `${category} kategorisinde özel eklenen lezzet`,
        type: isDrink ? 'drink' : 'food'
    };

    if (typeof currentFoodCatalog !== 'undefined' && Array.isArray(currentFoodCatalog)) {
        currentFoodCatalog.unshift(newFoodItem);
        localStorage.setItem('neyiyoruz_custom_catalog', JSON.stringify(currentFoodCatalog));
    }

    // Doğrudan tabağa da ekle
    const targetIdx = (typeof getTargetPersonIndex === 'function') ? getTargetPersonIndex() : 0;
    if (state.plates && state.plates[targetIdx]) {
        const plate = state.plates[targetIdx];
        if (!plate.items) plate.items = [];
        
        const existing = plate.items.find(it => it.name.trim().toLowerCase() === foodName.toLowerCase());
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
            existing.unitPrice = price;
            existing.price = existing.qty * price;
        } else {
            plate.items.push({
                id: 'it_' + newFoodItem.id,
                name: foodName,
                qty: 1,
                unitPrice: price,
                price: price,
                emoji: emoji,
                type: isDrink ? 'drink' : 'food'
            });
        }
    }

    audio.init();
    audio.fanfare();
    closeAddFoodModal();

    if (typeof renderMenuScreen === 'function') renderMenuScreen();
    if (typeof updateMenuStickyCartBar === 'function') updateMenuStickyCartBar();
    if (typeof renderPlatesUI === 'function') renderPlatesUI();
    if (typeof broadcastPlatesChange === 'function') broadcastPlatesChange();

    if (typeof window.showAppToast === 'function') {
        window.showAppToast(`🎉 <strong>"${foodName}"</strong> (${price} ₺) menüye ve tabağınıza eklendi!`, 'success');
    }
};

// Modal dışına tıklayınca kapatma
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modalAddNewFood');
    if (modal && e.target === modal) {
        closeAddFoodModal();
    }
});
