const baseURL = "http://localhost:3000"
const patternsURL = `${baseURL}/patterns/`
const insectfamilites = `${baseURL}/insectfamilies`
const colorsURL = `${baseURL}/colors`
const usersURL = `${baseURL}/users`

const cardContainer = document.getElementById('card-container')
const formContainer = document.getElementById('form-container')


mainDisplay()
navBarEvents()
userOptions()

function userOptions(){
    console.log(localStorage.token)
}

function renderUser() {
    const searchParams = new URLSearchParams(window.location.search)
    const username = searchParams.get('username')
    fetchUserWithToken(`${usersURL}/${username}`, "GET")
        .then(response => response.json())
        .then(addNameToNavBar)

}

function addNameToNavBar(user){
    const mainNav = document.getElementById('main-nav')
    const name = document.createElement('h5')
    
    name.innerText = user.name
    mainNav.appendChild(name)

    name.addEventListener("click", (e) => {
        e.preventDefault()
        viewUserForm(user)

    })
}

function viewUserForm(user){
    clearContainer()
    const editUserForm = document.createElement('form')
    editUserForm.innerHTML = `
        <h2>Edit Your Profile<h2>
        <label>Name</label>
        <input type="text" name="name" placeholder="${user.name}">
        <label>Username</label>
        <input type="text" name="username" placeholder="${user.username}">
        <label>Phone Number</label>
        <input type="text" name="phone" placeholder="${user.phone}">
        <label>Password</label>
        <input type="password" name="password">
        <label>Confirm Password</label>
        <input type="password" name="password_confirmation">

        <input id="changeUser" type="submit" value="Change User Profile">
        <input id="delete" type="submit" value="Delete User">
    `
    formContainer.appendChild(editUserForm)
}



function navBarEvents(){
    addUnlistedPattern()
    viewByInsectFamily()
}

function viewByInsectFamily() {
    const insectFamily = document.getElementById('viewfamily')
    insectFamily.addEventListener("click", e => {
        e.preventDefault()
        viewByFamily()  
    })
}

function viewByFamily(){
    fetchAndParse(insectfamilites, "GET")
        .then(familyOptions)
}

function familyOptions(families){
    let allPatterns = null
    const nav = document.getElementById('filter-nav-bar')
    const ul = document.createElement('ul')

    fetchAndParse(patternsURL, "GET")
        .then(patterns => allPatterns = patterns)

    families.forEach(family => {
        const li = document.createElement('li')
        li.value = family.id 
        li.innerText = family.name
        nav.appendChild(li)

        li.addEventListener("click", e => {
            e.preventDefault()
            const filteredPatterns = allPatterns.filter(pattern => pattern.insect_family_id === family.id)
            displayFlies(filteredPatterns)
        })
    })
    nav.append(ul)
}

function mainDisplay(){
    viewCardsBySearch()
    defaultShowAllPatterns()

    const patterns = document.getElementById("patterns")

    patterns.addEventListener("click", (e) => {
        e.preventDefault()
        defaultShowAllPatterns()
    })

}

function viewCardsBySearch(){
    let patternlist = null
    
    fetchAndParse(patternsURL, "GET")
    .then(patternObj =>patternlist = patternObj)
    
    const search = document.createElement('input')
    search.type = "text"

    formContainer.appendChild(search)

    search.addEventListener("input", e => {
        e.preventDefault()
        const filteredFlies = patternlist.filter(pattern => e.target.value === pattern.name)
    })
}

function defaultShowAllPatterns(){
    clearContainer()
    fetchAndParse(patternsURL, "GET")
    .then(displayFlies)
}

function addUnlistedPattern(){
    const addPatternLi = document.getElementById('add-new-pattern')
    addPatternLi.addEventListener("click", e => {
    e.preventDefault(),
    addNewFly()
    })
}

function addNewFly(){
    clearContainer()
    createNewPatternForm(formContainer)
    createNewColorForm(formContainer)
}

function createNewPatternForm(container){
    const newPatternForm = document.createElement('form')
    newPatternForm.id = "new-pattern-form"
    newPatternForm.innerHTML = `
    <h2>Add a new Pattern!</h2>
    <label>Name of Pattern:</label>
    <input class="patternInput" type="text" name="name" placeholder="BWO">
    <label>Dry or Wet fly?</label>
    <input class="patternInput" type="text" name="dry_wet" placeholder="Dry">
    <label>Description:</label>
    <input class="patternInput" type="text" name="description" placeholder="">
    <label>Species:</label>
    <input class="patternInput" type="text" name="species" placeholder="BWO">
    <label>Life Stage:</label>
    <input class="patternInput" type="text" name="life_stage" placeholder="Adult">
    <label>Select an Insect Family this pattern belongs to:</label>
    <select id="select-family" name="insect_family">
        <option value="">- Select -</option>
    </select>
    `
    container.appendChild(newPatternForm)
    addOptions()
    submitNewFly(newPatternForm)
}

function submitNewFly(container){
    const submit = document.createElement('input')
    submit.id = "pattern-button"
    
    submit.type = "submit"
    submit.value = "Add Fly Pattern"
    container.appendChild(submit)
    
    submit.addEventListener("click", (e) => {
        e.preventDefault()
        createPattern()
    })
}

function createPattern(){
    const patternForm = document.getElementById('new-pattern-form')
    const patternFormData = new FormData (patternForm)
    const patternBody = {
        name: patternFormData.get('name'),
        dry_wet: patternFormData.get('dry_wet'),
        description: patternFormData.get('description'),
        species: patternFormData.get('species'),
        life_stage: patternFormData.get('life_stage'),
        insect_family_id: patternFormData.get('insect_family'),
    }

    fetchAndParse(patternsURL, "POST", patternBody)
        .then(newPattern => {
            if (newPattern["errors"]){
                console.log(newPattern)}
        })
}

function addOptions(){
    fetchAndParse(insectfamilites, "GET")
    .then(createFamilyOptions)
}

function createFamilyOptions(families) {
    const select = document.getElementById('select-family')
    families.forEach(family =>{
        const option = document.createElement("option")
        option.value = family.id 
        option.innerText = family.name
        select.appendChild(option)
    })
}

function createNewColorForm(container){
    const colorForm = document.createElement('form')

    colorForm.id = "new-color-form"
    colorForm.innerHTML = `
    <h3>Add a new color for a pattern!</h3>
    <label>Select a Pattern:</label>
    <select id="pattern-select" name="pattern_id">
        <option value=""> - Select -</option>
    </select>
    <label>Picture:</label>
    <input class="color-input" type="text" name="image" placeholder="Image Link">
    <label>Color:</label>
    <input class="color-input" type="text" name="name" placeholder="Red / None etc...">
    <label>What Sizes?</label>
    <input class="color-input" type="text" name='sizes' placeholder="16, 18, 20, etc...">
    `
    container.appendChild(colorForm)

    patternOption()
    submitNewColor(colorForm)
}

function patternOption(){
    fetchAndParse(patternsURL, "GET")
    .then(createPatternOptions)
}

function createPatternOptions(patterns){

    const select = document.getElementById('pattern-select')
    patterns.forEach(pattern =>{
        const option = document.createElement("option")
        option.value = pattern.id 
        option.innerText = pattern.name
        select.appendChild(option)
    })
}

function submitNewColor(container){
    const submit = document.createElement('input')
    submit.id = "color-button"
    submit.type = "submit"
    submit.value = "Add Color To Pattern"
    container.appendChild(submit)
    
    submit.addEventListener("click", (e) => {
        e.preventDefault()
        createColor()
    })
}

function createColor(){
    const colorForm = document.getElementById('new-color-form')
    const colorFormData = new FormData (colorForm)
    const colorBody = {
        name: colorFormData.get('name'),
        image: colorFormData.get('image'),
        sizes: colorFormData.get('sizes'),
        pattern_id: colorFormData.get('pattern_id')
    }
    fetchAndParse(colorsURL, "POST", colorBody)
        .then(newColor => {
            if (newColor["errors"]){
                console.log(newColor)
            }
        })
}

function clearContainer(){
    cardContainer.innerText = ""
    formContainer.innerText = ""
}

function displayFlies(patternObj) {
    clearContainer()

    patternObj.forEach(pattern => createFlyCard(pattern))
}

function createFlyCard(pattern){
    const div = document.createElement('div')

    div.className = "card"
    div.innerHTML = `
            <h3>${pattern.name}</h3>
            <p>${pattern.description}</p>
            <ul class="details">
                <li>Species: ${pattern.species}</li>
                <li>Life-stage: ${pattern.life_stage}</li>
                <li>Pattern type: ${pattern.dry_wet}</li>
            </ul>
            <section class="thumbnail-list"> 
            
            </section>
        `
    const element = div.querySelector('.thumbnail-list')

    if (pattern.colors.length > 0) {
        const ul = div.querySelector('ul')
        const li = document.createElement('li')
        li.innerText = pattern.colors[0]["sizes"]

        ul.appendChild(li)
        
        addSmallPics(pattern.colors, element, div)
    }


    cardContainer.appendChild(div)
}

function addSmallPics(colors, element, div) {
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

function fetchAndParse(url, method, optbody = null) {
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

function fetchUserWithToken(url, method) {
    const request = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }
    return fetch(url, request)
}