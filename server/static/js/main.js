const BASE_URL = "http://172.29.233.230:5000"

const loginModal = $.modal()
const openLoginWindow = document.querySelector('.open-login-window-btn')
openLoginWindow.addEventListener('click', event => {
    loginModal.open()
})

document.getElementById('register-form').addEventListener('submit', async function (event) {
    event.preventDefault()

    const login = document.querySelector('.register-login-input').value
    const email = document.querySelector('.register-email-input').value
    const password = document.querySelector('.register-password-input').value

    await register(login, email, password)
})

document.getElementById('login-form').addEventListener('submit', async function  (event) {
    event.preventDefault()

    const login = document.querySelector('.login-input').value
    const password = document.querySelector('.password-input').value

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
            localStorage.setItem('login', login)
            localStorage.setItem('password', password)
            window.location.href = 'graph.html'
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
            localStorage.setItem('login', login)
            localStorage.setItem('password', password)
            window.location.href = 'graph.html'
        } else {
            alert('Ошибка авторизации: ' + response.status)
        }
    } catch (error) {
        alert('Произошла ошибка: ' + error)
    }
}
