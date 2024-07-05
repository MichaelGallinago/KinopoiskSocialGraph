$(document).ready(() => {
    $('.burger').on('click', showMenu)

    $('.favourites-btn').on('click', openFavourites)
    $('.history-btn').on('click', openHistory)
    $('.admin-btn').on('click', openAdminPanel)
    $('.exit-btn').on('click', exit)

    $('.close-history-btn').on('click', closeHistory)
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
    const data = JSON.parse(localStorage.getItem('searchHistory'))
    if (data != null) {
        data.forEach(d => {
            $('.history-elements').append(`
            <div class="history-element">
                <div class="history-values">
                    <span class="history-element-name key">ID человека</span>
                    <span class="history-element-name value">${d.personId}</span>
                </div>
                <div class="history-values">
                    <span class="history-element-date key">Дата запроса</span>
                    <span class="history-element-date value">${d.date}</span>
                </div>
            </div>
        `)
        })
    }

    const historyElement = $('.history-element')
    $('.history-modal').css('display', 'block')
    historyElement.on('click', function () {
        const personIdValue = $(this).find('.history-element-name.value').text()
        const dateValue = $(this).find('.history-element-date.value').text()

        const currentData = data.filter(d => d.personId == personIdValue && d.date == dateValue)

        $('.person-id-input').val(personIdValue)

        $('.depth-input').val(currentData[0].filters.depth)
        $('#depth-text').text(currentData[0].filters.depth)

        $('.people-limit-input').val(currentData[0].filters.peopleLimit)
        $('.people-limit-text').text(currentData[0].filters.peopleLimit)

        $('.movie-limit-for-person-input').val(currentData[0].filters.movieLimitForPerson)
        $('.movie-limit-for-person-text').text(currentData[0].filters.movieLimitForPerson)

        $('.movie-min-for-edge-input').val(currentData[0].filters.movieMinForEdge)
        $('.movie-min-for-edge-text').text(currentData[0].filters.movieMinForEdge)

        $('.age-input-left-range').val(currentData[0].filters.ageLeft)
        $('#left-age-text').text(currentData[0].filters.ageLeft)

        $('.age-input-right-range').val(currentData[0].filters.ageRight)
        $('#right-age-text').text(currentData[0].filters.ageRight)

        $('.is-alive-input').val(currentData[0].filters.isAlive)

        $('.height-input-left-range').val(currentData[0].filters.heightLeft)
        $('#left-height-text').text(currentData[0].filters.heightLeft)

        $('.height-input-right-range').val(currentData[0].filters.heightRight)
        $('#right-height-text').text(currentData[0].filters.heightRight)

        $('.awards-input').val(currentData[0].filters.awards)
        $('#awards-text').text(currentData[0].filters.awards)

        $('.career-input').val(currentData[0].filters.career)

        $('.gender-input').val(currentData[0].filters.gender)

        $('.movies-input').val(currentData[0].filters.countOfMovies)
        $('#movies-text').text(currentData[0].filters.countOfMovies)

        drawGraph(
            {
                edges: currentData[0].edges,
                nodes: currentData[0].nodes
            },
            personIdValue
        )
        closeHistory()
    })
}

function closeHistory() {
    $('.history-elements').empty()
    $('.history-modal').css('display', 'none')
}

async function openAdminPanel() {
    await checkAccessToAdminPanel()
}

function exit() {
    localStorage.removeItem('login')
    localStorage.removeItem('password')
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
