function _createModal(options) {
    const modal = document.createElement('div')
    modal.setAttribute('id', 'login-form')
    modal.classList.add('login-modal')
    modal.classList.add('modal-window')
    modal.insertAdjacentHTML('afterbegin', `
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