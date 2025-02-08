const scriptURL = 'https://script.google.com/macros/s/AKfycbyyX5EhgIDYKH3N0pvRiId5CUcH9tHMFdu0B9rq9c7fy49eAaeoYSf5pHhdOz8IaFE3Yg/exec';


document.addEventListener("DOMContentLoaded", function() {
    // רישום סטטיסטיקות כניסה לאתר
    const visitData = new FormData();
    visitData.append('action', 'visit');
    visitData.append('userAgent', navigator.userAgent);
    visitData.append('platform', navigator.platform);
    visitData.append('language', navigator.language);
    visitData.append('screen', window.screen.width + "x" + window.screen.height);

    fetch(scriptURL, { method: 'POST', body: visitData})
      .then(response => response.text())
      .then(result => console.log('רישום כניסה: ' + result))
      .catch(error => console.error('שגיאה ברישום כניסת משתמש: ', error));

    // שנו את הכתובת לכתובת ה-Web App שלכם בגוגל Apps Script

    // טיפול בטופס הרישום
    const registrationForm = document.getElementById('registration-form');
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(registrationForm);
        formData.append('action', 'register');
        fetch(scriptURL, { method: 'POST', body: formData})
        .then(response => response.text())
        .then(data => {
            document.getElementById('registration-result').innerText = data;
            registrationForm.reset();
        })
        .catch(error => {
            document.getElementById('registration-result').innerText = 'ארעה שגיאה, נסה שוב.';
            console.error('Error!', error.message);
        });
    });

    // טיפול בצ'אט
    const chatForm = document.getElementById('chat-form');
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const chatInput = document.getElementById('chat-input');
        const userQuestion = chatInput.value;
        if (!userQuestion.trim()) return; // לא לשלוח הודעות ריקות
        appendMessage('אתה: ' + userQuestion);
        chatInput.value = '';

        const chatData = new FormData();
        chatData.append('action', 'chat');
        chatData.append('question', userQuestion);

        showTypingIndicator();

        fetch(scriptURL, { method: 'POST', body: chatData})
        .then(response => response.text())
        .then(data => {
            hideTypingIndicator();
            appendMessage('בינה מלאכותית: ' + data);
        })
        .catch(error => {
            hideTypingIndicator();
            appendMessage('ארעה שגיאה בעת יצירת התגובה.');
            console.error('Error!', error.message);
        });
    });

    // טעינת היסטוריית הצ'אט מהזיכרון המקומי
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    // מחיקת תוכן קיים לפני טעינת ההיסטוריה
    document.getElementById('chat-window').innerHTML = '';
    chatHistory.forEach(message => appendMessage(message, false));

    function appendMessage(message, isNew = true) {
        const chatWindow = document.getElementById('chat-window');
        // הסרת אינדיקטור ההקלדה אם קיים
        const existingIndicator = chatWindow.querySelector('.typing-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const messageElem = document.createElement('div');
        const isUser = message.startsWith('אתה:');
        messageElem.className = `chat-message ${isUser ? 'user' : 'ai'}`;
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerText = message.replace('אתה: ', '').replace('בינה מלאכותית: ', '');
        messageElem.appendChild(bubble);
        
        chatWindow.appendChild(messageElem);

        chatWindow.scrollTop = chatWindow.scrollHeight;

        // שמירת ההודעה בזיכרון המקומי רק אם זו הודעה חדשה
        if (isNew) {
            const updatedHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
            updatedHistory.push(message);
            localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
        }
    }

    function showTypingIndicator() {
        const chatWindow = document.getElementById('chat-window');
        // יצירת אינדיקטור חדש
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator visible';
        typingIndicator.innerHTML = `
            <div class="dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        chatWindow.appendChild(typingIndicator);
    }

    function hideTypingIndicator() {
        const chatWindow = document.getElementById('chat-window');
        const typingIndicator = chatWindow.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function fetchNews() {
        fetch(scriptURL + "?action=getNews")
        .then(response => response.json())
        .then(data => {
            const newsBanner = document.getElementById('news-banner');
            newsBanner.innerHTML = '';
            data.forEach(item => {
                const [date, title, content] = item;
                const newsItem = document.createElement('div');
                newsItem.classList.add('news-item');
                newsItem.innerHTML = `<h3>${title}</h3><p>${content}</p><small>${date}</small>`;
                newsBanner.appendChild(newsItem);
            });
        })
        .catch(error => {
            console.error('Error fetching news:', error);
        });
    }

    fetchNews();
}); 