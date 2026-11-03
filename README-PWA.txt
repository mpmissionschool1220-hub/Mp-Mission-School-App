M.P. Mission School App — PWA package

WHAT THIS DOES
- Adds a web app manifest, install icons, and a service worker for app-shell offline loading.
- Keeps the existing HTML/CSS/JS features and localStorage behavior.
- Renames the supplied "student,html" file to "student.html".
- Removes accidental Markdown code fences from teacher.html.

IMPORTANT LIMITATIONS
- This does NOT add Firebase synchronization or secure authentication.
- localStorage data remains on the same browser/device only.
- Do not enter real student records or publish this as a production school system yet.
- The app must be hosted over HTTPS (or localhost) for PWA installation. Opening index.html directly from a file manager will not enable installation.
- Service worker caching is for the app shell; dynamic records remain in browser storage.

FREE HOSTING (one option: GitHub Pages)
1. Create a repository on GitHub (ask a parent/guardian to supervise account use).
2. Upload/extract all files and folders from this ZIP into the repository root.
3. In repository Settings > Pages, select deploy from branch, choose main and /(root), then Save.
4. Wait for the published HTTPS URL.
5. Open that URL in Chrome on Android. Use browser menu > Install app or Add to Home screen.
6. After changing files, update the repository; reload the site. If an old version persists, close/reopen Chrome or clear the site's cached data.

No Play Store account/payment is needed for this PWA route.
