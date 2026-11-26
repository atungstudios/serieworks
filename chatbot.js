/**
 * Serieworks FAQ Chatbot
 * A lightweight keyword-matching chat widget, no backend required.
 */

(function () {
    const FAQ = [
        {
            keywords: ['hello', 'hi', 'hey', 'yo', 'morning', 'afternoon'],
            answer: 'Hello! I\'m Soffee, the Serieworks assistant. Ask me about our apps, the beta program, privacy, or how to get in touch.'
        },
        {
            keywords: ['serieworks', 'who are you', 'about', 'what is this', 'company'],
            answer: 'Serieworks builds small, thoughtful apps for everyday life. You can read more on the <a href="about.html">About page</a>.'
        },
        {
            keywords: ['app', 'apps', 'product', 'what do you make', 'download'],
            answer: 'All our apps are listed on this page — use the search bar or the category filter above to browse them. Each card links to the App Store or Google Play.'
        },
        {
            keywords: ['beta', 'test', 'testflight', 'early access', 'try'],
            answer: 'You can join our beta program to try new apps early. Details are on the <a href="beta.html">Beta page</a>.'
        },
        {
            keywords: ['privacy', 'data', 'tracking', 'personal information'],
            answer: 'We take privacy seriously. You can read the full policy on the <a href="privacy.html">Privacy page</a>.'
        },
        {
            keywords: ['contact', 'email', 'support', 'help', 'reach', 'feedback'],
            answer: 'You can reach us through the <a href="contact.html">Contact page</a> — we\'d love to hear from you.'
        },
        {
            keywords: ['guide', 'how to', 'tutorial', 'use', 'start'],
            answer: 'Check out the <a href="guide.html">Guide page</a> for walkthroughs of our apps.'
        },
        {
            keywords: ['price', 'cost', 'free', 'paid', 'subscription', 'buy'],
            answer: 'Pricing varies per app — each app card links to its store page where you\'ll find the current price.'
        },
        {
            keywords: ['thank', 'thanks', 'great', 'cool'],
            answer: 'You\'re welcome! Anything else you\'d like to know?'
        }
    ];

    const SUGGESTIONS = [
        'What is Serieworks?',
        'Join the beta',
        'Leave a message'
    ];

    const FALLBACK = 'Hmm, I\'m not sure about that one. Try asking about our apps, the beta program, privacy, or contact — or visit the <a href="contact.html">Contact page</a> to reach a human.';

    const panel = document.getElementById('chatPanel');
    const toggle = document.getElementById('chatToggle');
    const closeBtn = document.getElementById('chatClose');
    const messages = document.getElementById('chatMessages');
    const suggestions = document.getElementById('chatSuggestions');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');

    if (!panel || !toggle) return;

    let greeted = false;

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = 'chat-message ' + sender;
        if (sender === 'bot') {
            div.innerHTML = text;
        } else {
            div.textContent = text;
        }
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function findAnswer(query) {
        const q = query.toLowerCase();
        let best = null;
        let bestScore = 0;
        for (const entry of FAQ) {
            let score = 0;
            for (const keyword of entry.keywords) {
                if (q.includes(keyword)) score++;
            }
            if (score > bestScore) {
                bestScore = score;
                best = entry;
            }
        }
        return best ? best.answer : FALLBACK;
    }

    function renderSuggestions() {
        suggestions.innerHTML = '';
        for (const text of SUGGESTIONS) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'chat-suggestion';
            btn.textContent = text;
            btn.addEventListener('click', () => {
                addMessage(text, 'user');
                handleUserInput(text);
            });
            suggestions.appendChild(btn);
        }
    }

    function reply(query) {
        setTimeout(() => addMessage(findAnswer(query), 'bot'), 300);
    }

    let messageFlow = null;

    function startMessageFlow() {
        messageFlow = { step: 'email' };
        setTimeout(() => addMessage('Sure! What\'s your email address, so the reply can reach you?', 'bot'), 300);
    }

    function handleMessageFlow(query) {
        if (messageFlow.step === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query)) {
                addMessage('That doesn\'t look like an email address — mind trying again?', 'bot');
                return;
            }
            messageFlow.email = query;
            messageFlow.step = 'message';
            addMessage('Got it. What would you like to say?', 'bot');
            return;
        }
        const subject = encodeURIComponent('Message from serieworks.com');
        const body = encodeURIComponent('From: ' + messageFlow.email + '\n\n' + query);
        const href = 'mailto:serieworks@gmail.com?subject=' + subject + '&body=' + body;
        addMessage('Thanks! <a href="' + href + '">Tap here to open your email app</a> — everything is pre-filled, just press send.', 'bot');
        messageFlow = null;
    }

    function handleUserInput(query) {
        if (messageFlow) {
            handleMessageFlow(query);
        } else if (/leave a message|send a message|talk to a human/i.test(query)) {
            startMessageFlow();
        } else {
            reply(query);
        }
    }

    function openChat() {
        panel.hidden = false;
        if (!greeted) {
            greeted = true;
            addMessage(FAQ[0].answer, 'bot');
            renderSuggestions();
        }
        input.focus();
    }

    function closeChat() {
        panel.hidden = true;
        toggle.focus();
    }

    toggle.addEventListener('click', () => {
        if (panel.hidden) {
            openChat();
        } else {
            closeChat();
        }
    });

    closeBtn.addEventListener('click', closeChat);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) closeChat();
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        addMessage(query, 'user');
        input.value = '';
        handleUserInput(query);
    });
})();
