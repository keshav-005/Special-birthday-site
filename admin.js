// ============================================
// 🎛️ Admin Portal — Firebase-powered
// ============================================

// --- Connection Status ---
function updateConnectionStatus() {
    const statusEl = document.getElementById('connection-status');
    const statusText = document.getElementById('status-text');

    if (firebaseReady) {
        statusEl.className = 'connection-status connected';
        statusText.textContent = '✅ Firebase Connected';
    } else {
        statusEl.className = 'connection-status disconnected';
        statusText.textContent = '⚠️ Firebase not configured — edit config.js';
    }
}

// --- Site Settings ---
const settingsForm = document.getElementById('settings-form');

async function loadSettings() {
    const s = await db.getSettings();
    document.getElementById('setting-name').value = s.name || '';
    document.getElementById('setting-intro').value = s.introText || '';
    document.getElementById('setting-hero').value = s.heroGreeting || '';
    document.getElementById('setting-hero-sub').value = s.heroSubtext || '';
    document.getElementById('setting-story').value = s.storyText || '';
    document.getElementById('setting-story2').value = s.storyText2 || '';
    document.getElementById('setting-closing-greeting').value = s.closingGreeting || '';
    document.getElementById('setting-closing').value = s.closingText || '';
    document.getElementById('setting-closing2').value = s.closingText2 || '';
    document.getElementById('setting-signoff').value = s.closingSignoff || '';
    document.getElementById('setting-footer').value = s.footerText || '';
}

settingsForm.onsubmit = async (e) => {
    e.preventDefault();
    const settings = {
        name: document.getElementById('setting-name').value,
        introText: document.getElementById('setting-intro').value,
        heroGreeting: document.getElementById('setting-hero').value,
        heroSubtext: document.getElementById('setting-hero-sub').value,
        storyTitle: "The Story So Far...",
        storyText: document.getElementById('setting-story').value,
        storyText2: document.getElementById('setting-story2').value,
        closingGreeting: document.getElementById('setting-closing-greeting').value,
        closingText: document.getElementById('setting-closing').value,
        closingText2: document.getElementById('setting-closing2').value,
        closingSignoff: document.getElementById('setting-signoff').value,
        footerText: document.getElementById('setting-footer').value
    };
    await db.saveSettings(settings);
    showToast('Settings saved! ✅');
};

// --- Manage Questions ---
const qForm = document.getElementById('add-question-form');
const qList = document.getElementById('admin-questions-list');

async function renderQuestions() {
    const qs = await db.getQuestions();
    if (qs.length === 0) {
        qList.innerHTML = '<p style="color:var(--coffee-light);">No questions yet. Add some below!</p>';
    } else {
        qList.innerHTML = qs.map((q, i) => `
            <div class="admin-item">
                <strong>Q${i + 1}: ${q.text}</strong><br>
                Options: ${q.options.join(', ')}
                <button onclick="removeQuestion('${q.id}')" class="delete-btn">✕</button>
            </div>
        `).join('');
    }
    await renderGuessSelects();
}

window.removeQuestion = async (id) => {
    await db.removeQuestion(id);
    await renderQuestions();
    showToast('Question deleted');
};

qForm.onsubmit = async (e) => {
    e.preventDefault();
    await db.addQuestion({
        text: document.getElementById('q-text').value,
        options: [
            document.getElementById('q-opt1').value,
            document.getElementById('q-opt2').value,
            document.getElementById('q-opt3').value,
            document.getElementById('q-opt4').value
        ]
    });
    qForm.reset();
    await renderQuestions();
    showToast('Question added! ✅');
};

// --- Manage Guesses ---
const gForm = document.getElementById('add-guess-form');
const gContainer = document.getElementById('guess-questions-container');
const gList = document.getElementById('admin-guesses-list');

async function renderGuessSelects() {
    const qs = await db.getQuestions();
    gContainer.innerHTML = qs.map((q) => `
        <div style="margin-bottom: 10px;">
            <label>${q.text}</label>
            <select id="guess-q-${q.id}" required>
                <option value="">Select an option</option>
                ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
        </div>
    `).join('');
}

async function renderGuesses() {
    const gs = await db.getGuesses();
    const qs = await db.getQuestions();
    if (gs.length === 0) {
        gList.innerHTML = '<p style="color:var(--coffee-light);">No guesses yet.</p>';
        return;
    }
    gList.innerHTML = gs.map((g) => `
        <div class="admin-item">
            <strong>${g.name}'s Guesses:</strong>
            <ul>
                ${Object.entries(g.answers || {}).map(([qId, ans]) => {
                    const question = qs.find(q => q.id === qId);
                    return `<li>${question ? question.text : 'Unknown'}: ${ans}</li>`;
                }).join('')}
            </ul>
            <button onclick="removeGuess('${g.docId}')" class="delete-btn">✕</button>
        </div>
    `).join('');
}

window.removeGuess = async (docId) => {
    await db.removeGuess(docId);
    await renderGuesses();
    showToast('Guess deleted');
};

gForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('guess-name').value;
    const qs = await db.getQuestions();
    const answers = {};
    qs.forEach(q => {
        answers[q.id] = document.getElementById(`guess-q-${q.id}`).value;
    });

    await db.addGuess({ name, answers });
    gForm.reset();
    await renderGuesses();
    showToast('Guesses saved! ✅');
};

// --- Manage Messages ---
const mForm = document.getElementById('add-message-form');
const mList = document.getElementById('admin-messages-list');

async function renderMessages() {
    const ms = await db.getMessages();
    if (ms.length === 0) {
        mList.innerHTML = '<p style="color:var(--coffee-light);">No messages yet.</p>';
        return;
    }
    mList.innerHTML = ms.map((m) => `
        <div class="admin-item">
            <strong>${m.name}:</strong> ${m.text}
            <button onclick="removeMessage('${m.docId}')" class="delete-btn">✕</button>
        </div>
    `).join('');
}

window.removeMessage = async (docId) => {
    await db.removeMessage(docId);
    await renderMessages();
    showToast('Message deleted');
};

mForm.onsubmit = async (e) => {
    e.preventDefault();
    await db.addMessage({
        name: document.getElementById('msg-name').value,
        text: document.getElementById('msg-text').value,
        color: ['#fef08a', '#fbcfe8', '#bbf7d0', '#bfdbfe'][Math.floor(Math.random() * 4)]
    });
    mForm.reset();
    await renderMessages();
    showToast('Message saved! ✅');
};

// --- Manage Gallery with Image Upload ---
const pList = document.getElementById('admin-gallery-list');
const uploadZone = document.getElementById('upload-zone');
const photoUpload = document.getElementById('photo-upload');

// Click to upload
uploadZone.addEventListener('click', () => photoUpload.click());

// Drag and drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    handleFileUpload(files);
});

photoUpload.addEventListener('change', (e) => {
    handleFileUpload(e.target.files);
});

async function handleFileUpload(files) {
    if (!firebaseReady) {
        showToast('⚠️ Configure Firebase first to upload images');
        return;
    }

    const progressDiv = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const statusText = document.getElementById('upload-status');
    progressDiv.style.display = 'block';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
            showToast(`⚠️ ${file.name} is too large (max 5MB)`);
            continue;
        }

        statusText.textContent = `Uploading ${file.name} (${i + 1}/${files.length})...`;
        progressFill.style.width = `${((i) / files.length) * 100}%`;

        try {
            const url = await db.uploadImage(file);
            await db.addPhoto({
                url: url,
                caption: file.name.split('.')[0],
                viewpoint: 'center'
            });
        } catch (e) {
            console.error("Upload error:", e);
            showToast(`❌ Failed to upload ${file.name}`);
        }
    }

    progressFill.style.width = '100%';
    statusText.textContent = 'All uploads complete! ✅';
    setTimeout(() => { progressDiv.style.display = 'none'; }, 2000);

    await renderGallery();
    photoUpload.value = '';
}

async function renderGallery() {
    const ps = await db.getPhotos();
    if (ps.length === 0) {
        pList.innerHTML = '<p style="color:var(--coffee-light);">No photos yet. Upload some above!</p>';
        return;
    }
    pList.innerHTML = ps.map((p) => {
        const imgSrc = p.url || `images/${p.filename}`;
        return `
        <div class="admin-item gallery-item">
            <img src="${imgSrc}" style="width:60px; height:60px; object-fit:cover; object-position:${p.viewpoint || 'center'}; border-radius:5px; border: 2px solid white;">
            <div style="flex-grow:1; display:flex; flex-direction:column; gap:5px;">
                <input type="text" value="${p.caption}" onchange="updatePhoto('${p.docId}', 'caption', this.value)" style="margin:0; padding:5px; font-size:1rem;" placeholder="Caption">
                <select onchange="updatePhoto('${p.docId}', 'viewpoint', this.value)" style="margin:0; padding:5px; font-size:1rem; border-radius: 5px; border: 1px solid #ccc;">
                    <option value="center" ${p.viewpoint === 'center' || !p.viewpoint ? 'selected' : ''}>Center View</option>
                    <option value="top" ${p.viewpoint === 'top' ? 'selected' : ''}>Top View</option>
                    <option value="bottom" ${p.viewpoint === 'bottom' ? 'selected' : ''}>Bottom View</option>
                    <option value="left" ${p.viewpoint === 'left' ? 'selected' : ''}>Left View</option>
                    <option value="right" ${p.viewpoint === 'right' ? 'selected' : ''}>Right View</option>
                </select>
            </div>
            <button onclick="removePhoto('${p.docId}')" class="delete-btn">✕</button>
        </div>
    `;
    }).join('');
}

window.updatePhoto = async (docId, field, value) => {
    await db.updatePhoto(docId, field, value);
    if (field === 'viewpoint') await renderGallery();
    showToast('Photo updated ✅');
};

window.removePhoto = async (docId) => {
    if (!confirm('Delete this photo?')) return;
    await db.removePhoto(docId);
    await renderGallery();
    showToast('Photo deleted');
};

// --- Clear All Data ---
window.clearAllData = async () => {
    if (!firebaseReady) {
        localStorage.clear();
        location.reload();
        return;
    }
    // Delete all collections
    const collections = ['questions', 'guesses', 'messages', 'photos', 'answers', 'settings'];
    for (const col of collections) {
        const snap = await dbInstance.collection(col).get();
        for (const doc of snap.docs) {
            await doc.ref.delete();
        }
    }
    showToast('All data cleared! Reloading...');
    setTimeout(() => location.reload(), 1000);
};

// --- Toast Notification ---
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- Initialize ---
async function initAdmin() {
    updateConnectionStatus();
    await loadSettings();
    await renderQuestions();
    await renderGuesses();
    await renderMessages();
    await renderGallery();
}

initAdmin();
