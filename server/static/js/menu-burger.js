$(document).ready(() => {
    $('.burger').on('click', showMenu)

    /*localStorage.removeItem('searchHistory')
    localStorage.removeItem('favourites')*/

    $('.save-to-favourites-btn').attr('disabled', 'disabled').on('click', saveGraphToFavourites)

    $('.favourites-btn').on('click', openFavourites)
    $('.history-btn').on('click', openHistory)
    $('.admin-btn').on('click', openAdminPanel)
    $('.exit-btn').on('click', exit)

    $('.close-history-btn').on('click', closeHistory)
    $('.close-favourites-btn').on('click', closeFavourites)
})

function disableSaveToFavouritesBtn() {
    const btn = $('.save-to-favourites-btn')
    btn.attr('disabled', 'disabled')
    btn.text('Избранное')
}

function enableSaveToFavouritesBtn() {
    const btn = $('.save-to-favourites-btn')
    btn.removeAttr('disabled')
    btn.text('Добавить в избранное')
}

function showMenu() {
    this.classList.toggle('active')
    $('.sidebar').toggleClass('open')
}

function openFavourites() {
    closeHistory()

    const data = JSON.parse(localStorage.getItem('favourites'))
    if (data != null) {
        data.reverse().forEach(d => {
            $('.favourites-elements').append(`
                <div class="favourites-element">
                    <div class="favourites-values">
                        <span class="favourites-element-name key">ID человека</span>
                        <span class="favourites-element-name value">${d.personId}</span>
                    </div>
                    <div class="favourites-values">
                        <span class="favourites-element-date key">Дата запроса</span>
                        <span class="favourites-element-date value">${d.date}</span>
                    </div>
                </div>
                <!--<button class="delete-from-favourites-btn"></button>-->
            `)
        })
    }

    /*$('.delete-from-favourites-btn').on('click', function () {
        deleteGraphFromFavourites(personIdValue, dateValue)
    })*/

    const favouritesElement = $('.favourites-element')
    $('.favourites-modal').css('display', 'block')
    favouritesElement.on('click', function () {
        const personIdValue = $(this).find('.favourites-element-name.value').text()
        const dateValue = $(this).find('.favourites-element-date.value').text()

        const currentData = data.filter(d => d.personId == personIdValue && d.date == dateValue)

        fillFilters(currentData[0], personIdValue)

        drawGraph(
            {
                edges: currentData[0].edges,
                nodes: currentData[0].nodes
            },
            personIdValue
        )
        closeFavourites()
    })
}

function closeFavourites() {
    $('.favourites-elements').empty()
    $('.favourites-modal').css('display', 'none')
}

function openHistory() {
    closeFavourites()

    const data = JSON.parse(localStorage.getItem('searchHistory'))
    if (data != null) {
        data.reverse().forEach(d => {
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

        fillFilters(currentData[0], personIdValue)

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

function fillFilters(data, personIdValue) {
    $('.person-id-input').val(personIdValue)

    $('.depth-input').val(data.filters.depth)
    $('#depth-text').text(data.filters.depth)

    $('.people-limit-input').val(data.filters.peopleLimit)
    $('.people-limit-text').text(data.filters.peopleLimit)

    $('.movie-limit-for-person-input').val(data.filters.movieLimitForPerson)
    $('.movie-limit-for-person-text').text(data.filters.movieLimitForPerson)

    $('.movie-min-for-edge-input').val(data.filters.movieMinForEdge)
    $('.movie-min-for-edge-text').text(data.filters.movieMinForEdge)

    $('.age-input-left-range').val(data.filters.ageLeft)
    $('#left-age-text').text(data.filters.ageLeft)

    $('.age-input-right-range').val(data.filters.ageRight)
    $('#right-age-text').text(data.filters.ageRight)

    $('.is-alive-input').val(data.filters.isAlive)

    $('.height-input-left-range').val(data.filters.heightLeft)
    $('#left-height-text').text(data.filters.heightLeft)

    $('.height-input-right-range').val(data.filters.heightRight)
    $('#right-height-text').text(data.filters.heightRight)

    $('.awards-input').val(data.filters.awards)
    $('#awards-text').text(data.filters.awards)

    $('.career-input').val(data.filters.career)

    $('.gender-input').val(data.filters.gender)

    $('.movies-input').val(data.filters.countOfMovies)
    $('#movies-text').text(data.filters.countOfMovies)
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
