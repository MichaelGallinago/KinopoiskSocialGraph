const loginModal = $.modal()

const openLoginWindow = document.getElementById('open-login-window')
openLoginWindow.addEventListener('click', event => {
    loginModal.open()
})

// Регистрация
const BASE_URL = "http://127.0.0.1:5000" // TODO: Установить URL
const registerForm = document.getElementById('register-form')

registerForm.addEventListener('submit', function (event) {
    event.preventDefault()

    let formData = {
        login: document.getElementById('register-login-input').value,
        email: document.getElementById('register-email-input').value,
        password: document.getElementById('register-password-input').value
    }

    fetch(BASE_URL + '/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(
            function (response) {
                if (response.ok) {
                    alert('Регистрация прошла успешно!')
                } else {
                    alert('Ошибка регистрации: ' + response.status)
                }
            }
        )
        .catch(function (error) {
            alert('Произошла ошибка: ' + error)
        })
})
