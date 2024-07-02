const BASE_URL = "http://127.0.0.1:5000"

$('.login').text(localStorage.getItem('login'))

document.getElementById('graph-form').addEventListener('submit', async function (event) {
    event.preventDefault()

    const personId = document.getElementById('person-id').value

    await loadGraph(personId)
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
            drawGraph(data)
            hideLoader()
        } else {
            hideLoader()
            alert('Ошибка при загрузке графа: ' + response.status)
        }
    } catch (error) {
        hideLoader()
        alert('Произошла ошибка: ' + error)
    }

    // TODO: тест графа
    /*showLoader()
    setTimeout(() => {
        fetch('http://localhost:8080/js/test-data-1.json')
            .then(response => response.json())
            .then(data => {
                drawGraph(data);
                hideLoader()
            })
            .catch(error => console.error('Ошибка получения данных:', error));
    }, 3000)*/
}

function drawGraph(data, personId) {
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const centerX = width / 2;
    const centerY = height / 2;

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
            console.log(d.id)
            // TODO: получение информации о человеке по id
        })

    node.append("title")
        .text(d => d.name);

    const personNode = d3.selectAll('.node').filter((d) => {
        return d.id == personId
    })
    personNode.classed('person-node', true)

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
