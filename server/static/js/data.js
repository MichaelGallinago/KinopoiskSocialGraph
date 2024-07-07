class API {
    static #BASE_URL = "http://192.168.0.85:5000"

    static async register(login, email, password) {
        try {
            const response = await fetch(this.#BASE_URL + '/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: login,
                    email: email,
                    password: password
                })
            })

            if (response.ok) {
                LocalStorage.save('login', login)
                LocalStorage.save('email', email)
                LocalStorage.save('password', password)

                window.location.href = 'graph.html'
            } else {
                alert('Ошибка регистрации: ' + response.status)
            }
        } catch (error) {
            alert('Произошла ошибка: ' + error)
        }
    }

    static async auth(login, password) {
        try {
            const response = await fetch(this.#BASE_URL + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: login,
                    password: password
                })
            })

            if (response.ok) {
                LocalStorage.save('login', login)
                LocalStorage.save('password', password)

                window.location.href = 'graph.html'
            } else {
                alert('Ошибка авторизации: ' + response.status)
            }
        } catch (error) {
            alert('Произошла ошибка: ' + error)
        }
    }

    static async getTokens() {
        try {
            const response = await fetch(this.#BASE_URL + '/get_tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: LocalStorage.get('login')
                })
            })

            if (response.ok) {
                const data = await response.json()
                User.fillTokens(data)
            } else {
                alert('Ошибка при загрузке данных о персоне: ' + response.status)
            }
        } catch (error) {
            alert('Произошла ошибка: ' + error)
        }
    }

    static async checkAccessToAdminPanel() {
        try {
            const response = await fetch(this.#BASE_URL + '/get_admin_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: LocalStorage.get('login'),
                    password: LocalStorage.get('password')
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
                alert('Ошибка при получении данных: ' + response.status)
            }
        } catch (error) {
            alert('Произошла ошибка: ' + error)
        }
    }

    static async loadGraph(personId) {
        try {
            Graph.showLoader()

            const response = await fetch(this.#BASE_URL + '/make_graph', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    personId: personId,
                    login: LocalStorage.get('login'),
                    password: LocalStorage.get('password'),
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
                const data  = await response.json()
                const graph = new Graph({
                    personId: personId,
                    data: data,
                    filters: {
                        login: LocalStorage.get('login'),
                        password: LocalStorage.get('password'),
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
                })

                LocalStorage.saveSearchToHistory(data)
                graph.drawGraph()
                await API.getTokens()
                Graph.hideLoader()
            } else {
                Graph.hideLoader()
                alert('Ошибка при загрузке графа: ' + response.status)
            }
        } catch (error) {
            Graph.hideLoader()
            alert('Произошла ошибка: ' + error)
        }
    }

    static async getPersonInfo(personId) {
        try {
            const response = await fetch(this.#BASE_URL + '/get_person', {
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

                Person.clearInfo()

                const person = new Person(data)
                person.fillInfo()
            } else {
                alert('Ошибка при загрузке данных о персоне: ' + response.status)
            }
        } catch (error) {
            alert('Произошла ошибка: ' + error)
        }
    }
}

class LocalStorage {
    static save(key, value) { localStorage.setItem(key, value) }

    static get(key) { return localStorage.getItem(key) }

    static remove(key) { localStorage.removeItem(key) }

    static saveSearchToHistory(data) {
        let searchHistory = JSON.parse(this.get('searchHistory')) || []

        searchHistory.push({
            personId: $('.person-id-input').val(),
            filters: {
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
            date: new Date().toLocaleString('ru', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        })

        this.save('searchHistory', JSON.stringify(searchHistory))
    }

    static saveGraphToFavourites() {
        const graphData = Graph.getData

        let favourites = JSON.parse(this.get('favourites')) || []
        const personId = $('.person-id-input').val()

        const searchHistory = JSON.parse(this.get('searchHistory'))
        const filters = Filter.getFilters()
        const temp = searchHistory.filter(
            d => d.personId === personId && JSON.stringify(d.filters) === JSON.stringify(filters)
        )

        const date = temp == null || temp.length === 0 ? null : temp[0].date

        if (date != null) {
            favourites.push({
                personId: personId,
                filters: Filter.getFilters(),
                edges: graphData.edges,
                nodes: graphData.nodes,
                date: date
            })

            this.save('favourites', JSON.stringify(favourites))
            MenuBurger.disableSaveToFavouritesBtn()
        }
    }

    static checkFavouritesHasGraph(personId) {
        const favourites = JSON.parse(this.get('favourites'))

        const filters = Filter.getFilters()

        if (favourites != null) {
            const temp = favourites.filter(
                d => d.personId === personId && JSON.stringify(d.filters) === JSON.stringify(filters)
            )

            temp == null || temp.length === 0 ? MenuBurger.enableSaveToFavouritesBtn() : MenuBurger.disableSaveToFavouritesBtn()
        } else {
            MenuBurger.enableSaveToFavouritesBtn()
        }
    }
}