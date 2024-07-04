const BASE_URL = "http://127.0.0.1:5000"

$(document).ready(() => {
    /*
    * создать окно
    * заполнить данными
    * */

    const modal = document.createElement('div')
    modal.classList.add('modal')
    modal.insertAdjacentHTML('afterbegin', `
        <div class="modal-overlay">
            <div class="modal-window">
                <img src="img/close-icon.png" alt="Close" class="close-icon">
                <h2 class="login-title">История запросов</h2>
                <div class="history-elements"></div>
            </div>
        </div>
    `)
})
