// ============================================
// Firebase Utilities — All database operations
// ============================================

// Initialize Firebase
let app, dbInstance, storageInstance;
let firebaseReady = false;

function initFirebase() {
    try {
        if (!firebaseConfig || firebaseConfig.apiKey === "PASTE_YOUR_API_KEY_HERE") {
            console.warn("Firebase not configured yet. Using sample data.");
            return false;
        }
        app = firebase.initializeApp(firebaseConfig);
        dbInstance = firebase.firestore();
        storageInstance = firebase.storage();
        firebaseReady = true;
        console.log("✅ Firebase connected!");
        return true;
    } catch (e) {
        console.error("Firebase init error:", e);
        return false;
    }
}

// ---- Firestore Helpers ----

const db = {
    // -- Site Settings --
    async getSettings() {
        if (!firebaseReady) return db.defaultSettings();
        try {
            const doc = await dbInstance.collection('settings').doc('main').get();
            return doc.exists ? doc.data() : db.defaultSettings();
        } catch (e) {
            console.error("Error getting settings:", e);
            return db.defaultSettings();
        }
    },

    async saveSettings(settings) {
        if (!firebaseReady) return;
        await dbInstance.collection('settings').doc('main').set(settings);
    },

    defaultSettings() {
        return {
            name: "Birthday Star",
            introText: "Something special is waiting for you...",
            heroGreeting: "Happy Birthday!",
            heroSubtext: "To the one who makes every day brighter.",
            storyTitle: "The Story So Far...",
            storyText: "Another year older, another year of being completely fabulous! We wanted to do something a little different for your birthday this year. So we built you a whole experience.",
            storyText2: "Keep scrolling to see what everyone has to say, find out who knows you best, and look back at some of your greatest moments!",
            closingGreeting: "Dear Birthday Star,",
            closingText: "We hope this little surprise brought a smile to your face. May this year bring you as much joy and happiness as you bring to everyone around you. Keep shining, keep being your amazing self, and never change.",
            closingText2: "Here's to a year filled with love, laughter, and unforgettable moments.",
            closingSignoff: "Happy Birthday, once again! We all love you! ❤️",
            footerText: "Made with ❤️"
        };
    },

    // -- Questions --
    async getQuestions() {
        if (!firebaseReady) return db.defaultQuestions();
        try {
            const snap = await dbInstance.collection('questions').orderBy('createdAt').get();
            if (snap.empty) return db.defaultQuestions();
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            console.error("Error getting questions:", e);
            return db.defaultQuestions();
        }
    },

    async addQuestion(question) {
        if (!firebaseReady) return;
        question.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        return await dbInstance.collection('questions').add(question);
    },

    async removeQuestion(id) {
        if (!firebaseReady) return;
        await dbInstance.collection('questions').doc(id).delete();
    },

    defaultQuestions() {
        return [
            { id: "sample1", text: "What is their favorite color?", options: ["Red", "Blue", "Green", "Purple"] },
            { id: "sample2", text: "What is their favorite food?", options: ["Pizza", "Pasta", "Sushi", "Tacos"] },
            { id: "sample3", text: "What is their favorite movie genre?", options: ["Comedy", "Action", "Romance", "Horror"] }
        ];
    },

    // -- Guesses --
    async getGuesses() {
        if (!firebaseReady) return db.defaultGuesses();
        try {
            const snap = await dbInstance.collection('guesses').get();
            if (snap.empty) return [];
            return snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        } catch (e) {
            console.error("Error getting guesses:", e);
            return [];
        }
    },

    async addGuess(guess) {
        if (!firebaseReady) return;
        return await dbInstance.collection('guesses').add(guess);
    },

    async removeGuess(docId) {
        if (!firebaseReady) return;
        await dbInstance.collection('guesses').doc(docId).delete();
    },

    defaultGuesses() {
        return [
            { docId: "s1", name: "Friend 1", answers: { "sample1": "Blue", "sample2": "Pizza", "sample3": "Comedy" } },
            { docId: "s2", name: "Friend 2", answers: { "sample1": "Purple", "sample2": "Sushi", "sample3": "Romance" } }
        ];
    },

    // -- Messages --
    async getMessages() {
        if (!firebaseReady) return db.defaultMessages();
        try {
            const snap = await dbInstance.collection('messages').get();
            if (snap.empty) return [];
            return snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        } catch (e) {
            console.error("Error getting messages:", e);
            return [];
        }
    },

    async addMessage(message) {
        if (!firebaseReady) return;
        return await dbInstance.collection('messages').add(message);
    },

    async removeMessage(docId) {
        if (!firebaseReady) return;
        await dbInstance.collection('messages').doc(docId).delete();
    },

    defaultMessages() {
        return [
            { docId: "s1", name: "Friend 1", text: "Happy Birthday! Wishing you an amazing year ahead! 🎉", color: "#bfdbfe" },
            { docId: "s2", name: "Friend 2", text: "Have the best birthday ever! You deserve all the happiness! 🥳", color: "#fbcfe8" }
        ];
    },

    // -- Photos --
    async getPhotos() {
        if (!firebaseReady) return db.defaultPhotos();
        try {
            const snap = await dbInstance.collection('photos').orderBy('createdAt').get();
            if (snap.empty) return [];
            return snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        } catch (e) {
            console.error("Error getting photos:", e);
            return [];
        }
    },

    async addPhoto(photoData) {
        if (!firebaseReady) return;
        photoData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        return await dbInstance.collection('photos').add(photoData);
    },

    async updatePhoto(docId, field, value) {
        if (!firebaseReady) return;
        await dbInstance.collection('photos').doc(docId).update({ [field]: value });
    },

    async removePhoto(docId) {
        if (!firebaseReady) return;
        // Also delete image from storage if it's a Firebase URL
        try {
            const doc = await dbInstance.collection('photos').doc(docId).get();
            if (doc.exists && doc.data().url && doc.data().url.includes('firebase')) {
                const ref = storageInstance.refFromURL(doc.data().url);
                await ref.delete();
            }
        } catch (e) {
            console.warn("Could not delete image from storage:", e);
        }
        await dbInstance.collection('photos').doc(docId).delete();
    },

    defaultPhotos() {
        return [
            { docId: "s1", url: "images/sample-1.jpg", caption: "Great memories! ✨", viewpoint: "center" },
            { docId: "s2", url: "images/sample-2.jpg", caption: "Best times ever! 🎉", viewpoint: "center" }
        ];
    },

    // -- Birthday Person's Answers (quiz) --
    async getAnswers() {
        if (!firebaseReady) {
            const stored = localStorage.getItem('birthdayPersonAnswers');
            return stored ? JSON.parse(stored) : {};
        }
        try {
            const doc = await dbInstance.collection('answers').doc('session').get();
            return doc.exists ? doc.data() : {};
        } catch (e) {
            return {};
        }
    },

    async saveAnswers(answers) {
        // Always save locally for the current session
        localStorage.setItem('birthdayPersonAnswers', JSON.stringify(answers));
        if (!firebaseReady) return;
        await dbInstance.collection('answers').doc('session').set(answers);
    },

    // -- Image Upload --
    async uploadImage(file) {
        if (!firebaseReady) throw new Error("Firebase not configured");
        const filename = `images/${Date.now()}_${file.name}`;
        const ref = storageInstance.ref(filename);
        const snapshot = await ref.put(file);
        return await snapshot.ref.getDownloadURL();
    }
};

// Initialize on load
const isFirebaseConnected = initFirebase();
