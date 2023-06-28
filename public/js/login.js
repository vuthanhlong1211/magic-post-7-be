(() => {

    const main = document.querySelector('.main');

    main.querySelector('.login-form .frame-button #button-login').addEventListener('click', () => {
        const username = main.querySelector('.login-form .username-form #username').value;
        const password = main.querySelector('.login-form .password-form #password').value;
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                window.location.href = '/dashboard';
            } else {
                alert('Invalid credentials');
            }
        })
        .catch(error => {
            alert('Error: ', error);
        });
    });

    main.querySelector('.login-form .frame-button #button-signup').addEventListener('click', () => {
        window.location.href = '/signup';
    });
})();