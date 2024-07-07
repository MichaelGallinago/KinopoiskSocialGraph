class Graph {
    #personId
    #data
    #filters

    constructor(options) {
        this.#personId = options.personId
        this.#data = options.data
        this.#filters = options.filters
    }

    static get getData() {
        return {
            personId: this.#personId,
            data: this.#data,
            filters: this.#filters,
        }
    }

    drawGraph() {
        Person.clearInfo()
        $('#graph').empty()

        const graphContainer = $('#graph-container')
        const containerWidth = graphContainer.clientWidth
        const containerHeight = graphContainer.clientHeight

        const svg = d3.select("svg")
        let width = containerWidth
        let height = containerHeight

        let centerX = width / 2
        let centerY = height / 2

        const maxCommonMovies = this.#data.edges.reduce((maxCount, edge) => {
            const filmCount = Array.isArray(edge.movie) ? edge.movie.length : 1
            return Math.max(maxCount, filmCount)
        }, 0)

        const simulation = d3.forceSimulation(this.#data.nodes)
            .force("link", d3.forceLink(this.#data.edges).id(d => d.id).distance(d => {
                let commonMovies = 0
                data.edges.forEach(edge => {
                    if ((edge.source.id === d.source.id && edge.target.id === d.target.id) ||
                        (edge.source.id === d.target.id && edge.target.id === d.source.id)) {
                        commonMovies += Array.isArray(edge.movie) ? edge.movie[0] : 1
                    }
                })
                return (maxCommonMovies * 5) / commonMovies
            }))
            .force('center', d3.forceCenter(centerX, centerY))
            .force("repulsion", d3.forceManyBody().strength(-maxCommonMovies))

        const link = svg.selectAll(".link")
            .data(this.#data.edges)
            .enter().append("line")
            .attr("class", "link")

        link.append('title')
            .text(d => d.movie.join('\n'))

        const node = svg.selectAll(".node")
            .data(this.#data.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 8)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", async function(event, d) {
                await API.getPersonInfo(d.id)
            })

        node.append("title")
            .text(d => d.name)

        const personNode = d3.selectAll('.node').filter((d) => {
            return d.id === parseInt(this.#personId)
        })
        personNode.attr('class', 'person-node')

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y)

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
        })

        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .extent([[0, 0], [width, height]])
            .on("zoom", function (event) {
                svg.attr("transform", event.transform)
            })
        svg.call(zoom)

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
        }

        function dragged(event, d) {
            d.fx = event.x
            d.fy = event.y
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
        }

        LocalStorage.checkFavouritesHasGraph(this.#personId)
    }

    static showLoader() {
        $('.loader').removeClass('loader-hidden')
    }

    static hideLoader() {
        $('.loader').addClass('loader-hidden')
    }
}

class Filter {
    #options

    constructor(options) {
        this.#options = options
    }

    get getOptions() {
        return this.#options
    }

    static getFilters() {
        return {
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
        }
    }

    static formatDate(dateString) {
        const parts = dateString.split('-')
        return `${parts[2]}.${parts[1]}.${parts[0]}`
    }
}

class Person {
    #options

    constructor(options) {
        this.#options = options
    }

    get getOptions() {
        return this.#options
    }

    fillInfo() {
        const personPhoto = $('.person-photo')
        const personName = $('.person-name')
        const personInfoMain = $('.person-info-main')
        const personInfoMore = $('.person-info-more')

        personPhoto.attr('src', this.#options.posterUrl)
        let temp = [this.#options.nameRu, this.#options.nameEn].filter((d) => d != null && d != 'None' && d != '')
        personName.text(temp.join(' - '))

        personInfoMain.find('.info-elements').append(
            createInfo('Возраст', this.#options.age),
            createInfo('Пол', this.#options.sex == 'MALE' ? 'Мужской' : 'Женский'),
            createInfo('Место рождения', this.#options.birthplace),
            createInfo('Кол-во фильмов', this.#options.films),
            createInfo('Кол-во наград', this.#options.hasAwards)
        )

        personInfoMore.find('.info-elements').append(
            createInfo('ID', this.#options.personId),
            createInfo('Профессия', this.#options.profession),
            createInfo('Дата рождения', Filter.formatDate(this.#options.birthday)),
            createInfo('Рост (см)', this.#options.growth),
            createInfo('Супруги', this.#options.spouses),
            createInfo('Умер', this.#options.death == null || this.#options.death == 'None' ? 'SKIP' : Filter.formatDate(this.#options.death)),
            createInfo('Место смерти', this.#options.deathplace == null || this.#options.deathplace == 'None' ? 'SKIP' : this.#options.deathplace),
            createInfo('Ссылка', `<a href="${this.#options.webUrl}" target="_blank">${this.#options.webUrl}</a>`)
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

    static clearInfo() {
        $('.person-photo').attr('src', '')
        $('.person-name').text('')
        $('.info-elements').empty()
    }
}

$(document).ready(async function () {
    await API.getTokens()

    $('#graph-form').on('submit', async function (event) {
        event.preventDefault()

        const personId = document.getElementById('person-id').value

        await API.loadGraph(personId)
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
})
