$(document).ready(() => {
    $('.burger').on('click', showMenu)

    $('.favourites-btn').on('click', openFavourites)
    $('.history-btn').on('click', openHistory)
    $('.admin-btn').on('click', openAdminPanel)
    $('.exit-btn').on('click', exit)
})

function showMenu() {
    this.classList.toggle('active')
    $('.sidebar').toggleClass('open')
}

function openFavourites() {
    console.log('Избранное')
    // TODO: избранное
}

function openHistory() {
    console.log('История')
    // TODO: история
}

async function openAdminPanel() {
    await checkAccessToAdminPanel()
}

function exit() {
    localStorage.clear()
    window.location.href = 'index.html'
}

async function checkAccessToAdminPanel() {
    try {
        const response = await fetch(BASE_URL + '/get_admin_status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: localStorage.getItem('login'),
                password: localStorage.getItem('password')
            })
        })

        if (response.ok) {
            const data = await response.json()
            if (data.status) {
                window.location.href = 'admin_win.html'
            } else {
                alert('Вы не являетесь администратором!')
            }
        } else {
            alert(': ' + response.status)
        }
    } catch (error) {
        alert('Произошла ошибка: ' + error)
    }
}
