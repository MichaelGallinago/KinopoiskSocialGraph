const BASE_URL = "http://127.0.0.1:5000"

document.getElementById('graph-form').addEventListener('submit', async function (event) {
    event.preventDefault()

    const personId = document.getElementById('person-id').value
    
    await loadGraph(personId)
})

$(document).ready(function () {
    getTokens()
})

$('.depth-input').on('input', function() {
    $('#depth-text').text(this.value)
}).trigger('input')

$('.people-limit-input').on('input', function () {
    $('.people-limit-text').text(this.value)
}).trigger('input')

$('.movie-limit-for-person-input').on('input', function () {
    $('.movie-limit-for-person-text').text(this.value)
}).trigger('input')

$('.movie-min-for-edge-input').on('input', function () {
    $('.movie-min-for-edge-text').text(this.value)
}).trigger('input')

$('.age-input-left-range').on('input', function() {
    $('#left-age-text').text(this.value)
}).trigger('input')

$('.age-input-right-range').on('input', function() {
    $('#right-age-text').text(this.value)
}).trigger('input')

$('.height-input-left-range').on('input', function() {
    $('#left-height-text').text(this.value)
}).trigger('input')

$('.height-input-right-range').on('input', function() {
    $('#right-height-text').text(this.value)
}).trigger('input')

$('.awards-input').on('input', function () {
    $('#awards-text').text(this.value)
}).trigger('input')

$('.movies-input').on('input', function () {
    $('#movies-text').text(this.value)
}).trigger('input')

async function loadGraph(personId) {
    document.getElementById('graph').innerHTML = ''

    try {
        showLoader()
        const response = await fetch(BASE_URL + '/make_graph', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: localStorage.getItem('login'),
                password: localStorage.getItem('password'),
                personId: personId,
                depth: $('.depth-input').val(),
                peopleLimit: $('.people-limit-input').val(),
                movieLimitForPerson: $('.movie-limit-for-person-input').val(),
                movieMinForEdge: $('.movie-min-for-edge-input').val(),
                ageLeft: $('.age-input-left-range').val(),
                ageRight: $('.age-input-right-range').val(),
                isAlive: $('.is-alive-input').val(),
                heightLeft: $('.height-input-left-range').val(),
                heightRight: $('.height-input-right-range').val(),
                awards: $('.awards-input').val(),
                career: $('.career-input').val(),
                gender: $('.gender-input').val(),
                countOfMovies: $('.movies-input').val()
            })
        })

        if (response.ok) {
            const data = await response.json()
            clearPersonInfo()
            drawGraph(data, personId)
            getTokens()
            hideLoader()
        } else {
            hideLoader()
            alert('Ошибка при загрузке графа: ' + response.status)
        }
    } catch (error) {
        hideLoader()
        alert('Произошла ошибка: ' + error)
    }

    /*fetch('http://localhost:8080/js/data/test-graph-1.json')
        .then(response => response.json())
        .then(data => {
            drawGraph(data, personId)
        })
        .catch(error => console.error('Ошибка получения данных:', error));*/
}

function drawGraph(data, personId) {

    //saveSearchToHistory(data)

    const svg = d3.select("svg")
    let width = +svg.attr("width")
    let height = +svg.attr("height")

    let centerX = width / 2;
    let centerY = height / 2;

    const maxCommonMovies = data.edges.reduce((maxCount, edge) => {
        const filmCount = Array.isArray(edge.movie) ? edge.movie.length : 1;
        return Math.max(maxCount, filmCount);
    }, 0);

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.edges).id(d => d.id).distance(d => {
            let commonMovies = 0;
            data.edges.forEach(edge => {
                if ((edge.source.id === d.source.id && edge.target.id === d.target.id) ||
                    (edge.source.id === d.target.id && edge.target.id === d.source.id)) {
                    commonMovies += Array.isArray(edge.movie) ? edge.movie[0] : 1;
                }
            });
            return (maxCommonMovies * 5) / commonMovies;
        }))
        .force('center', d3.forceCenter(centerX, centerY))
        .force("repulsion", d3.forceManyBody().strength(-maxCommonMovies));

    const link = svg.selectAll(".link")
        .data(data.edges)
        .enter().append("line")
        .attr("class", "link");

    link.append('title')
        .text(d => d.movie.join('\n'))

    const node = svg.selectAll(".node")
        .data(data.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 8)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", function(event, d) {
            getPersonInfo(d.id)
        })

    node.append("title")
        .text(d => d.name);

    const personNode = d3.selectAll('.node').filter((d) => {
        return d.id === parseInt(personId)
    })
    personNode.attr('class', 'person-node')

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

function showLoader() {
    document.querySelector('.loader').classList.remove('loader-hidden')
}

function hideLoader() {
    document.querySelector('.loader').classList.add('loader-hidden')
}

async function getPersonInfo(personId) {
    try {
        const response = await fetch(BASE_URL + '/get_person', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personId: personId
            })
        })

        if (response.ok) {
            const data = await response.json()
            clearPersonInfo()
            fillPersonInfo(data)
        } else {
            alert('Ошибка при загрузке данных о персоне: ' + response.status)
        }
    } catch (error) {
        alert('Произошла ошибка: ' + error)
    }

    /*fetch('http://localhost:8080/js/data/test-person-1.json')
        .then(response => response.json())
        .then(data => {
            clearPersonInfo()
            fillPersonInfo(data)
        })
        .catch(error => console.error('Ошибка получения данных:', error));*/
}

function fillPersonInfo(data) {
    const personPhoto = $('.person-photo')
    const personName = $('.person-name')
    const personInfoMain = $('.person-info-main')
    const personInfoMore = $('.person-info-more')

    personPhoto.attr('src', data.posterUrl)
    let temp = [data.nameRu, data.nameEn].filter((d) => d != null && d != 'None' && d != '')
    personName.text(temp.join(' - '))

    personInfoMain.find('.info-elements').append(
        createInfo('Возраст', data.age),
        createInfo('Пол', data.sex == 'MALE' ? 'Мужской' : 'Женский'),
        createInfo('Место рождения', data.birthplace),
        createInfo('Кол-во фильмов', data.films),
        createInfo('Кол-во наград', data.hasAwards)
    )

    personInfoMore.find('.info-elements').append(
        createInfo('ID', data.personId),
        createInfo('Профессия', data.profession),
        createInfo('Дата рождения', formatDate(data.birthday)),
        createInfo('Рост (см)', data.growth),
        createInfo('Супруги', data.spouses),
        createInfo('Умер', data.death == null || data.death == 'None' ? 'SKIP' : formatDate(data.death)),
        createInfo('Место смерти', data.deathplace == null || data.deathplace == 'None' ? 'SKIP' : data.deathplace),
        createInfo('Ссылка', `<a href="${data.webUrl}" target="_blank">${data.webUrl}</a>`)
    )

    function createInfo(key, value) {
        if (value !== 'SKIP') {
            return $(`
                <div class="info">
                    <span class="key">${key}</span>
                    <span class="info-value">${value}</span>
                </div>
            `)
        }
    }
}

function formatDate(dateString) {
    const parts = dateString.split('-');
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

function clearPersonInfo() {
    $('.person-photo').attr('src', '')
    $('.person-name').text('')
    $('.info-elements').empty()
}

async function getTokens() {
    try {
        const response = await fetch(BASE_URL + '/get_tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: localStorage.getItem('login')
            })
        })

        if (response.ok) {
            const data = await response.json()
            fillTokens(data)
        } else {
            alert('Ошибка при загрузке данных о персоне: ' + response.status)
        }
    } catch (error) {
        alert('Произошла ошибка: ' + error)
    }
}

function fillTokens(data) {
    $('.tokens-value').text(data.tokens)
    if (data.tokens == 0) {
        $('.load-graph-btn').attr('disabled', 'disabled')
        alert('У вас закончились токены для загрузки графа!')
    }
}

function saveSearchToHistory(data) {
    console.log(localStorage.getItem('searchHistory'))

    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || []

    searchHistory.push({
        personId: $('.person-id-input').val(),
        filter: {
            depth: $('.depth-input').val(),
            peopleLimit: $('.people-limit-input').val(),
            movieLimitForPerson: $('.movie-limit-for-person-input').val(),
            movieMinForEdge: $('.movie-min-for-edge-input').val(),
            ageLeft: $('.age-input-left-range').val(),
            ageRight: $('.age-input-right-range').val(),
            isAlive: $('.is-alive-input').val(),
            heightLeft: $('.height-input-left-range').val(),
            heightRight: $('.height-input-right-range').val(),
            awards: $('.awards-input').val(),
            career: $('.career-input').val(),
            gender: $('.gender-input').val(),
            countOfMovies: $('.movies-input').val()
        },
        edges: data.edges,
        nodes: data.nodes,
        date: new Date()
    })

    localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
}
