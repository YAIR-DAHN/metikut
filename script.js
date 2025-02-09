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
        // טעינת העדכונים השמורים מהזיכרון המקומי
        const savedNews = JSON.parse(localStorage.getItem('lastNews')) || [];
        // טעינת מצב צפייה בעדכונים
        const viewedUpdates = JSON.parse(localStorage.getItem('viewedUpdates')) || [];
        
        fetch(scriptURL + "?action=getNews")
        .then(response => response.json())
        .then(data => {
            const newsBanner = document.getElementById('news-banner');
            newsBanner.innerHTML = '';
            
            // הפיכת סדר העדכונים מהחדש לישן - מתחילים מהשורה האחרונה
            const sortedNews = data.reverse().sort((a, b) => new Date(b[0]) - new Date(a[0]));
            
            // בדיקת עדכונים חדשים
            const newUpdates = sortedNews.filter(item => {
                return !savedNews.some(savedItem => 
                    savedItem[0] === item[0] && 
                    savedItem[1] === item[1] && 
                    savedItem[2] === item[2]
                );
            });
            
            // סינון עדכונים שכבר נצפו
            const unviewedUpdates = newUpdates.filter(item => {
                return !viewedUpdates.some(viewed => 
                    viewed[0] === item[0] && 
                    viewed[1] === item[1] && 
                    viewed[2] === item[2]
                );
            });

            // עדכון התראת פעמון אם יש חדשות חדשות שלא נצפו
            if (savedNews.length > 0 && unviewedUpdates.length > 0) {
                const newsLink = document.querySelector('a[href="#news"]');
                // הסרת פעמון קיים אם יש
                const existingBell = newsLink.querySelector('.news-notification');
                if (existingBell) {
                    existingBell.remove();
                }
                const bell = document.createElement('span');
                bell.className = 'news-notification';
                bell.innerHTML = `
                    <i class="fas fa-bell"></i>
                    <span class="notification-count">${unviewedUpdates.length}</span>
                `;
                newsLink.appendChild(bell);
            }

            // הצגת העדכונים
            sortedNews.forEach(item => {
                const [date, title, content] = item;
                const newsItem = document.createElement('div');
                newsItem.classList.add('news-item');
                
                // בדיקה אם זה עדכון חדש שלא נצפה
                const isNew = unviewedUpdates.some(newItem => 
                    newItem[0] === date && 
                    newItem[1] === title && 
                    newItem[2] === content
                );
                
                if (isNew) {
                    newsItem.classList.add('new-update');
                }

                newsItem.innerHTML = `
                    ${isNew ? '<span class="new-badge">חדש!</span>' : ''}
                    <h3>${title}</h3>
                    <p>${content}</p>
                    <small>${date}</small>
                `;
                
                // הסרת סימון "חדש" אחרי צפייה
                if (isNew) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                setTimeout(() => {
                                    const badge = newsItem.querySelector('.new-badge');
                                    if (badge) {
                                        badge.style.opacity = '0';
                                        setTimeout(() => badge.remove(), 300);
                                    }
                                    newsItem.classList.remove('new-update');
                                    
                                    // הוספת העדכון לרשימת העדכונים שנצפו
                                    viewedUpdates.push([date, title, content]);
                                    localStorage.setItem('viewedUpdates', JSON.stringify(viewedUpdates));
                                    
                                    // עדכון הפעמון
                                    const remainingUnviewed = unviewedUpdates.filter(update => 
                                        !(update[0] === date && update[1] === title && update[2] === content)
                                    );
                                    
                                    const bell = document.querySelector('.news-notification');
                                    if (bell) {
                                        if (remainingUnviewed.length === 0) {
                                            bell.remove();
                                        } else {
                                            const count = bell.querySelector('.notification-count');
                                            if (count) {
                                                count.textContent = remainingUnviewed.length;
                                            }
                                        }
                                    }
                                }, 3000);
                                observer.disconnect();
                            }
                        });
                    }, { threshold: 0.5 });
                    
                    observer.observe(newsItem);
                }
                
                newsBanner.appendChild(newsItem);
            });

            // שמירת העדכונים הנוכחיים בזיכרון המקומי
            localStorage.setItem('lastNews', JSON.stringify(sortedNews));
        })
        .catch(error => {
            console.error('Error fetching news:', error);
        });
    }

    fetchNews();

    // Modal functionality
    const modal = document.getElementById('creditsModal');
    const btn = document.getElementById('showCredits');
    const span = document.querySelector('.close-modal');

    btn.onclick = function() {
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}); 