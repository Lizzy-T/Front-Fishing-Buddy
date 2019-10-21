const baseURL = "http://localhost:3000/"
const patternsURL = `${baseURL}patterns/`

fetchCall(patternsURL, "GET")
    .then(displayFlies)

function displayFlies(patternObj) {
    const container = document.getElementById('card-container')

    patternObj.forEach(pattern => {
        const div = document.createElement('div')

        div.className = "card"
        div.innerHTML = `
            <h3>${pattern.name}</h3>
            <p>${pattern.description}</p>
            <ul class="details">
                <li>Species: ${pattern.species}</li>
                <li>Life-stage: ${pattern.life_stage}</li>
                <li>Pattern type: ${pattern.dry_wet}</li>
                <li>Sizes: ${pattern.colors[0]["sizes"]}</li>
            </ul>
            <section class="thumbnail-list"> 
            
            </section>
        `
        const element = div.querySelector('.thumbnail-list')

        smallColorPics(pattern.colors, element, div)

        container.appendChild(div)
    })
}

function smallColorPics(colors, element, div) {
    const figure = document.createElement('figure')
    const mainImg = document.createElement('img')
    const figcaption = document.createElement('figcaption')
    
    figure.className = "main-img"
    mainImg.src = colors[0]["image"]

    figure.append(mainImg, figcaption)
    div.appendChild(figure)
    
    colors.forEach(color => {
        const img = document.createElement('img')
        
        img.className = "flyThumbnail"
        img.src = color.image

        element.appendChild(img)

        img.addEventListener('click', e => {
            e.preventDefault()
            mainImg.src = color.image
        })
    })
}

function fetchCall(url, method, optbody = null) {
    const request = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    }
    if (optbody) {
        request.body = JSON.stringify(optbody)
    }
    return fetch(url, request)
    .then(response => response.json())
}