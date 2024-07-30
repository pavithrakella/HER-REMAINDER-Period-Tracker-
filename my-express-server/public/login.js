loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    fetch('/user-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, email })
    })
    .then(response => {
        if (response.ok) {
            window.location.href = 'login1.html';
        } else {
            return response.text().then(text => { throw new Error(text) });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error logging in: ' + error.message);
    });
});
