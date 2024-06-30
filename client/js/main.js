const loginModal = $.modal()
const openLoginWindow = document.getElementById('open-login-window')
openLoginWindow.addEventListener('click', event => {
    loginModal.open()
})

const BASE_URL = "http://127.0.0.1:5000"

document.getElementById('register-form').addEventListener('submit', async function (event) {
    event.preventDefault()

    const login = document.getElementById('register-login-input').value
    const email = document.getElementById('register-email-input').value
    const password = document.getElementById('register-password-input').value

    await register(login, email, password)
})

document.getElementById('login-form').addEventListener('submit', async function  (event) {
    event.preventDefault()

    const login = document.getElementById('login-input').value
    const password = document.getElementById('password-input').value

    await auth(login, password)
})

async function register(login, email, password) {
    try {
        const response = await fetch(BASE_URL + '/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: login,
                email: email,
                password: password
            })
        })

        if (response.ok) {
            alert('Регистрация прошла успешно!')
        } else {
            alert('Ошибка регистрации: ' + response.status)
        }
    } catch (error) {
        alert('Произошла ошибка: ' + error)
    }
}

async function auth(login, password) {
    try {
        const response = await fetch(BASE_URL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: login,
                password: password
            })
        })

        if (response.ok) {
            const data = await response.json()
            window.location.href = 'graph.html'
        } else {
            alert('Ошибка авторизации: ' + response.status)
        }
    } catch (error) {
        alert('Произошла ошибка: ' + error)
    }
}
