function _createModal(options) {
    const modal = document.createElement('div')
    modal.setAttribute('id', 'login-form')
    modal.classList.add('login-modal')
    modal.insertAdjacentHTML('afterbegin', `
        <div class="auth-overlay" data-close="true">
            <div class="auth-modal-window">
                <img src="img/close-icon.png" alt="close-icon" class="close-icon" data-close="true">
                <h2 class="login-title">Вход</h2>
                <form id="login-form" class="login-form auth-container">
                    <div class="auth-field">
                        <img src="img/login-icon.png" alt="login-icon" class="login-icon auth-icon">
                        <input type="text" name="login" id="login-input" class="auth-input" required placeholder="Логин" />
                    </div>
                    <div class="auth-field">
                        <img src="img/password-icon.png" alt="password-icon" class="password-icon auth-icon">
                        <input type="password" name="password" id="password-input" class="auth-input" required placeholder="Пароль" />
                    </div>
                    <button type="submit" class="login-button glowing-button">Войти</button>
                </form>
            </div>
        </div>
    `)
    document.body.appendChild(modal)
    return modal
}

$.modal = function (options) {
    const $modal = _createModal(options)
    let closing = false

    const modal = {
        open() {
            !closing && $modal.classList.add('open')
        },
        close() {
            closing = true
            $modal.classList.remove('open')
            closing = false
        }
    }

    const listener = event => {
        if (event.target.dataset.close) {
            modal.close()
        }
    }

    $modal.addEventListener('click', listener)

    return modal
}