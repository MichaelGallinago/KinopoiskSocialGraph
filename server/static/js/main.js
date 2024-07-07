

$(document).ready(function () {
    const loginModal = obj.modal({
        class: 'login-modal modal-window',
        content: `
        <div class="modal-overlay" data-close="true">
            <div class="auth-modal-window">
                <img src="../static/img/close-icon.png" alt="close-icon" class="close-icon" data-close="true">
                <h2 class="login-title">Вход</h2>
                <form id="login-form" class="login-form auth-container">
                    <div class="auth-field">
                        <img src="../static/img/login-icon.png" alt="login-icon" class="login-icon auth-icon">
                        <input type="text" name="login" class="login-input auth-input" required placeholder="Логин" />
                    </div>
                    <div class="auth-field">
                        <img src="../static/img/password-icon.png" alt="password-icon" class="password-icon auth-icon">
                        <input type="password" name="password" class="password-input auth-input" required placeholder="Пароль" />
                    </div>
                    <button type="submit" class="login-button glowing-button">Войти</button>
                </form>
            </div>
        </div>
    `
    })

    let user = null

    $('.open-login-window-btn').on('click', function () { loginModal.open() })

    $('.register-form').on('submit', async function (event) {
        event.preventDefault()

        user = new User({
            login: '4324234',
            email: $('.register-email-input').val(),
            password: $('.register-password-input').val()
        })

        await API.register(user.login, user.email, user.password)
    })

    $('.login-form').on('submit', async function (event) {
        event.preventDefault()

        user = new User({
            login: $('.login-input').val(),
            password: $('.password-input').val()
        })

        await API.auth(user.login, user.password)
    })
})
