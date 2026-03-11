# 🎂 Setup Guide — Birthday Website

This guide will walk you through setting up your birthday website step by step. **No coding knowledge required!**

---

## Step 1: Get the Code

### Option A: Fork on GitHub (Recommended)
1. Go to the GitHub repo page
2. Click the **"Fork"** button (top right)
3. This creates your own copy of the project

### Option B: Download
1. Click the green **"Code"** button on the repo page
2. Click **"Download ZIP"**
3. Unzip the folder on your computer

---

## Step 2: Create a Firebase Project (Free!)

Firebase stores all your data (messages, photos, quiz) in the cloud for free.

1. Go to **[Firebase Console](https://console.firebase.google.com)**
2. Click **"Create a project"** (or "Add project")
3. Enter a project name (e.g., `sarah-birthday`)
4. Click **Continue** → you can disable Google Analytics → **Create Project**
5. Wait for it to finish, then click **Continue**

---

## Step 3: Add a Web App & Paste the Config

1. In your Firebase project, click the **web icon** `</>` on the main page
2. Enter an app nickname (e.g., `birthday-site`)
3. ✅ Check **"Also set up Firebase Hosting"** (optional, but recommended)
4. Click **Register App**
5. You'll see a code block with `firebaseConfig` — **keep this tab open, you'll need these values!**

### How to edit `config.js` on GitHub (no tools needed!)

6. Go to your **forked repo** on GitHub
7. Click on **`config.js`** in the file list
8. Click the **pencil icon ✏️** (top right of the file) to edit
9. You'll see this:

```javascript
// BEFORE — what it looks like right now:
const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY_HERE",
    authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
    projectId: "PASTE_YOUR_PROJECT_ID_HERE",
    storageBucket: "PASTE_YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "PASTE_YOUR_SENDER_ID_HERE",
    appId: "PASTE_YOUR_APP_ID_HERE"
};
```

10. Go back to the **Firebase tab** and copy each value one by one
11. Replace each `PASTE_YOUR_...` with the real values from Firebase:

```javascript
// AFTER — what it should look like (your values will be different):
const firebaseConfig = {
    apiKey: "AIzaSyB1234567890abcdefg",
    authDomain: "sarah-birthday.firebaseapp.com",
    projectId: "sarah-birthday",
    storageBucket: "sarah-birthday.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
```

> ⚠️ **Important:** Only replace the text inside the `"quotes"`. Don't delete the quotes themselves, the commas, or the curly brackets!

12. Click the green **"Commit changes"** button at the top right
13. In the popup, click **"Commit changes"** again

That's it! Your config is saved. 🎉

---

## Step 4: Enable Firestore Database

1. In Firebase Console, click **"Build"** → **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Select **"Start in test mode"** (this lets you read/write freely for 30 days)
4. Pick a location close to you → **Enable**

> ⚠️ **For production**, update the rules after 30 days. Go to Rules tab and use:
> ```
> rules_version = '2';
> service cloud.firestore {
>   match /databases/{database}/documents {
>     match /{document=**} {
>       allow read: if true;
>       allow write: if true;
>     }
>   }
> }
> ```

---

## Step 5: Enable Storage (for Photo Uploads)

1. In Firebase Console, click **"Build"** → **"Storage"** in the left menu
2. Click **"Get started"**
3. Select **"Start in test mode"** → **Next** → pick a location → **Done**

> ⚠️ **For production**, update Storage rules similarly:
> ```
> rules_version = '2';
> service firebase.storage {
>   match /b/{bucket}/o {
>     match /{allPaths=**} {
>       allow read: if true;
>       allow write: if request.resource.size < 5 * 1024 * 1024;
>     }
>   }
> }
> ```

---

## Step 6: Deploy Your Site

### Option A: GitHub Pages (Easiest if you forked)
1. Go to your forked repo on GitHub
2. Click **Settings** → **Pages** (in the left menu)
3. Under **Source**, select **Deploy from a branch**
4. Select **main** branch → **/ (root)** → **Save**
5. Wait 1-2 minutes — your site will be live at `https://yourusername.github.io/repo-name`

### Option B: Netlify (Drag & Drop)
1. Go to **[netlify.com](https://www.netlify.com)** and sign up (free)
2. Click **"Add new site"** → **"Deploy manually"**
3. **Drag and drop** your project folder onto the page
4. Done! You'll get a live URL instantly

### Option C: Firebase Hosting
1. Install Firebase tools: `npm install -g firebase-tools`
2. Run `firebase login` and log in
3. Run `firebase init` → select **Hosting** → use your project
4. Run `firebase deploy`

---

## Step 7: Customize Everything!

1. Open your live site and go to **`/admin.html`**
   - Example: `https://yoursite.com/admin.html`
2. You should see **"✅ Firebase Connected"** at the top
3. Fill in the **Site Settings**:
   - Birthday person's name
   - Custom greetings and messages
4. Add **quiz questions** and **friends' guesses**
5. Upload **photos** (drag & drop!)
6. Add **birthday messages** from friends and family
7. Share the main page URL with the birthday person! 🎉

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "⚠️ Firebase not configured" | Make sure you pasted the config in `config.js` |
| Photos not uploading | Check that Firebase Storage is enabled |
| Changes not showing | Clear your browser cache (Ctrl+Shift+R) |
| Site looks empty | Go to admin portal and add content first! |

---

## Need Help?

- Open an issue on the GitHub repo
- contact me through instagram - @keshav__0002
- All Firebase services used are **100% free** for this scale of use
