const BASE_URL = "http://127.0.0.1:5000"

document.getElementById('graph-form').addEventListener('submit', async function (event) {
    event.preventDefault()

    const personId = document.getElementById('person-id').value

    await loadGraph(personId)
})

async function loadGraph(personId) {
    try {
        const response = await fetch(BASE_URL + '/make_graph', {
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
            drawGraph(data)
        } else {
            alert('Ошибка при загрузке графа: ' + response.status)
        }
    } catch (error) {
        alert('Произошла ошибка: ' + error)
    }
}

fetch('http://localhost:8080/js/data.json')
    .then(response => response.json())
    .then(data => {
        drawGraph(data);
    })
    .catch(error => console.error('Ошибка получения данных:', error));

function drawGraph(data) {
    const nodeNames = data.nodes.map(node => node.name)
    const ids = data.nodes.map(node => node.id)
    const edgeLabels = data.edges.map(edge => edge.movie)

    const minId = Math.min(...ids.values())
    const maxId = Math.max(...ids.values())

    const coordinates = new Map()
    for (let i = 0; i < ids.length; i++) {
        const x = getRandomCoordinate(minId, maxId)
        const y = getRandomCoordinate(minId, maxId)
        const z = getRandomCoordinate(minId, maxId)

        coordinates.set(ids[i], [x, y, z])
    }

    const edgeSources = data.edges.map(edge => edge.source)
    const edgeTargets = data.edges.map(edge => edge.target)

    const nodeTrace = {
        type: 'scatter3d',
        x: [],
        y: [],
        z: [],
        mode: 'markers',
        marker: {
            size: 12
        },
        text: nodeNames,
        hoverinfo: 'text'
    }

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i]
        const coord = coordinates.get(id)

        nodeTrace.x.push(coord[0])
        nodeTrace.y.push(coord[1])
        nodeTrace.z.push(coord[2])
    }

    console.log('nodeTrace.x: ' + nodeTrace.x)
    console.log('nodeTrace.y: ' + nodeTrace.y)
    console.log('nodeTrace.z: ' + nodeTrace.z)

    const edgeTrace = {
        type: 'scatter3d',
        x: [],
        y: [],
        z: [],
        mode: 'lines',
        text: edgeLabels,
        hoverinfo: 'text'
    }

    for (let i = 0; i < edgeLabels.length; i++) {
        const sourceId = edgeSources[i];
        const targetId = edgeTargets[i];

        const coordSource = coordinates.get(sourceId);
        const coordTarget = coordinates.get(targetId);

        edgeTrace.x.push(coordSource[0], coordTarget[0], null);
        edgeTrace.y.push(coordSource[1], coordTarget[1], null);
        edgeTrace.z.push(coordSource[2], coordTarget[2], null);
    }


    console.log('edgeTrace.x: ' + edgeTrace.x)
    console.log('edgeTrace.y: ' + edgeTrace.y)
    console.log('edgeTrace.z: ' + edgeTrace.z)

    const graphData = [nodeTrace, edgeTrace]

    Plotly.newPlot('graph-container', graphData)
}

function getRandomCoordinate(min, max) {
    return Math.random()  *  (max - min) + min
}

