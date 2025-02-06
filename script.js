const scriptURL = 'https://script.google.com/macros/s/AKfycbzufOu4-9Z2ogZxDZaa6eSQySHEcoLxrqjBj1GGZWGcqugcLvtjUR4sOuxVU1zqVHqGbA/exec';


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
        appendMessage('אתה: ' + userQuestion);
        chatInput.value = '';

        const chatData = new FormData();
        chatData.append('action', 'chat');
        chatData.append('question', userQuestion);

        fetch(scriptURL, { method: 'POST', body: chatData})
        .then(response => response.text())
        .then(data => {
            appendMessage('בינה מלאכותית: ' + data);
        })
        .catch(error => {
            appendMessage('ארעה שגיאה בעת יצירת התגובה.');
            console.error('Error!', error.message);
        });
    });

    function appendMessage(message) {
        const chatWindow = document.getElementById('chat-window');
        const messageElem = document.createElement('p');
        messageElem.innerText = message;
        chatWindow.appendChild(messageElem);
        chatWindow.scrollTop = chatWindow.scrollHeight;
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