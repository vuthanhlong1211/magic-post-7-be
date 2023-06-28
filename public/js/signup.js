(() => {
    const main = document.querySelector('.main');

    main.querySelector('.submit-button #signup-button').addEventListener('click', () => {
        const username = main.querySelector('.signup-form #username').value;
        const password = main.querySelector('.signup-form #password').value;
        if (password !== main.querySelector('.signup-form #re-password').value) {
            alert('Password mismatched!');
            return;
        }
        fetch('./signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        })
        .then(response => response.json())
        .then(result => {
            if (result.message === 'success') {
                window.location.href = '/';
            } else if (result.message === 'username_unavailable') {
                alert('Username already exists');
                return;
            } else if (result.message === 'password_invalid') {
                alert('Password is not valid');
                return;
            }
        })
        .catch(error => {
            alert('Error: ', error);
        });
    });
})();