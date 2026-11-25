/**
 * Beta Testing page: lists production apps and builds pre-filled
 * Gmail compose links so visitors can apply without a form backend.
 */
(function () {
    const EMAIL = 'serieworks@gmail.com';
    const list = document.getElementById('betaAppList');
    if (!list) return;

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
    }

    function buildGmailComposeUrl(appTitle) {
        const subject = `Beta testing: ${appTitle}`;
        const body = [
            `Hi! I'd like to beta test ${appTitle} on Android.`,
            '',
            'My Google account email: ',
            ''
        ].join('\n');

        const params = new URLSearchParams({
            view: 'cm',
            fs: '1',
            to: EMAIL,
            su: subject,
            body: body
        });

        return `https://mail.google.com/mail/?${params.toString()}`;
    }

    function createBetaRow(app) {
        const row = document.createElement('div');
        row.className = 'card-compact beta-row';

        const image = app.image && app.image !== '#'
            ? app.image
            : 'https://placehold.co/300x300?text=App';

        row.innerHTML = `
            <div class="card-compact-icon">
                <img src="${escapeHtml(image)}" 
                     alt="${escapeHtml(app.title)} icon" 
                     onerror="this.onerror=null;this.src='https://placehold.co/300x300?text=App';" 
                     loading="lazy" />
            </div>
            <div class="card-compact-content">
                <div class="card-compact-header">
                    <span class="card-compact-title" title="${escapeHtml(app.title)}">${escapeHtml(app.title)}</span>
                    <a class="website-link-button beta-apply-button" 
                       href="${buildGmailComposeUrl(app.title)}" 
                       target="_blank" 
                       rel="noopener noreferrer">Apply to test</a>
                </div>
            </div>
        `;

        return row;
    }

    fetch('apps.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(apps => {
            const appsToList = apps.filter(app => app.status === 'production' && app.androidBeta);
            if (appsToList.length === 0) {
                list.innerHTML = '<p>No apps are open for testing right now. Check back soon!</p>';
                return;
            }
            appsToList.forEach(app => list.appendChild(createBetaRow(app)));
        })
        .catch(() => {
            list.innerHTML = '<p>Sorry, the app list failed to load. Please email us directly instead.</p>';
        });

    const copyButton = document.getElementById('betaCopyEmail');
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const done = () => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => { copyButton.textContent = EMAIL; }, 2000);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(EMAIL).then(done).catch(done);
            } else {
                done();
            }
        });
    }
})();
