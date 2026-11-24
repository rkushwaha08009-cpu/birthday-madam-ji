(function (window) {
    'use strict';

    const firebaseConfig = {
        apiKey: "AIzaSyCJUAwEEWawZKt6qEztyVQ8X_J1hFZPZdk",
        authDomain: "chori-de5f4.firebaseapp.com",
        databaseURL: "https://chori-de5f4-default-rtdb.firebaseio.com",
        projectId: "chori-de5f4",
        storageBucket: "chori-de5f4.firebasestorage.app",
        messagingSenderId: "321941175043",
        appId: "1:321941175043:web:29d02684c9d45ded134736",
        measurementId: "G-9TKEX2TXYZ"
    };

    const DB_ROOT = 'birthdayCelebration/default';
    const SYNC_KEYS = [
        'cfgName',
        'cfgDOB',
        'cfgTargetTime',
        'cfgLetterTitle',
        'cfgLetterBody',
        'cfgLetterStatic',
        'cfgCakeWish',
        'cfgVideoPath',
        'cfgMusicPath',
        'cfgFriendsWishes',
        'cfgLoveCount',
        'cfgClaimedCoupons'
    ];

    let db = null;
    let isReady = false;

    if (window.firebase && typeof window.firebase.initializeApp === 'function') {
        const app = window.firebase.apps && window.firebase.apps.length
            ? window.firebase.app()
            : window.firebase.initializeApp(firebaseConfig);
        db = window.firebase.database(app);
        isReady = true;
    }

    function collectLocalPayload() {
        const payload = { updatedAt: Date.now() };
        SYNC_KEYS.forEach((key) => {
            const val = localStorage.getItem(key);
            if (val !== null) {
                payload[key] = val;
            }
        });
        return payload;
    }

    function applyRemotePayload(data) {
        if (!data || typeof data !== 'object') return false;
        let changed = false;
        SYNC_KEYS.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined && data[key] !== null) {
                const remoteStr = String(data[key]);
                if (localStorage.getItem(key) !== remoteStr) {
                    localStorage.setItem(key, remoteStr);
                    changed = true;
                }
            }
        });
        return changed;
    }

    async function pushToFirebase() {
        if (!isReady || !db) return false;
        const payload = collectLocalPayload();
        await db.ref(DB_ROOT).set(payload);
        return true;
    }

    async function resetFirebase() {
        if (!isReady || !db) return false;
        await db.ref(DB_ROOT).remove();
        return true;
    }

    function subscribeToFirebase(onUpdate) {
        if (!isReady || !db) return () => {};
        const ref = db.ref(DB_ROOT);
        const handler = (snap) => {
            const val = snap.val();
            if (!val) {
                const localData = collectLocalPayload();
                if (Object.keys(localData).length > 1) {
                    ref.set(localData).catch(() => {});
                }
                return;
            }
            const changed = applyRemotePayload(val);
            if (typeof onUpdate === 'function') {
                onUpdate(val, changed);
            }
        };
        ref.on('value', handler);
        return () => ref.off('value', handler);
    }

    window.BirthdayFirebase = {
        config: firebaseConfig,
        isReady: () => isReady,
        pushToFirebase,
        resetFirebase,
        subscribeToFirebase
    };
})(window);
