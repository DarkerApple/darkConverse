function setTheme(theme) {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
        document.getElementById('theme-select').value = savedTheme;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();

    const themeSelect = document.getElementById('theme-select');
    themeSelect.addEventListener('change', (e) => {
        setTheme(e.target.value);
    });

    const joinBtn = document.getElementById('join-btn');
    joinBtn.addEventListener('click', () => {
        alert('Welcome to DarkConverse! Start exploring our forums and sharing your ideas.');
    });
});

