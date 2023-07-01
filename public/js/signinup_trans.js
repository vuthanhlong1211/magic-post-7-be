const signInBtn = document.getElementById("signIn");
const signUpBtn = document.getElementById("signUp");
const fistForm = document.getElementById("form1");
const secondForm = document.getElementById("form2");
const container = document.querySelector(".container");


signInBtn.addEventListener("click", () => {
	container.classList.remove("right-panel-active");
});

signUpBtn.addEventListener("click", () => {
	container.classList.add("right-panel-active");
});

fistForm.addEventListener("submit", () => {
	const username = document.getElementById('username_signup').value
	const password = document.getElementById('password_signup').value
	const repassword = document.getElementById('repassword').value
	if (password !== repassword) {
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
			container.classList.remove("right-panel-active");
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


secondForm.addEventListener("submit", () => {
	const username = document.getElementById('username_signin').value
	const password = document.getElementById('password_signin').value
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



