const baseURL = "http://localhost:3000"
const patternsURL = `${baseURL}/patterns/`
const insectfamilites = `${baseURL}/insectfamilies`
const colorsURL = `${baseURL}/colors`
const usersURL = `${baseURL}/users`
const currentUserUrl = `${usersURL}/${localStorage.username}`
const currentUserDays = `${currentUserUrl}/days`

const cardContainer = document.getElementById('card-container')
const formContainer = document.getElementById('form-container')

mainDisplay()
navBarEvents()
footerSignOut()

function userOptions(){
    if (localStorage.token) renderUser()
}

function renderUser() {
    const username = localStorage.username

    fetchUserWithToken(`${usersURL}/${username}`, "GET")
        .then(response => response.json())
        .then(addNameToNavBar)

}

function addNameToNavBar(user){
    if (user.errors) return
    const mainNav = document.getElementById('nav-list')
    const name = document.createElement('li')
    name.id = "user-name"
    name.className = 'click-able'
    
    name.innerText = user.name
    mainNav.appendChild(name)

    name.addEventListener("click", (e) => {
        e.preventDefault()
        viewUserForm(user)
    })

    addDaysToNavBar()
    addNewDay()
}

function addNewDay(){
    const ul = document.getElementById('nav-list')
    const li = document.createElement('li')

    li.innerText = "New Log Entry"
    li.className = "click-able"
    li.id = "new-log"

    ul.appendChild(li)
    li.addEventListener("click", (e) => {
        e.preventDefault()
        renderLogForm()
    })
}

function renderLogForm(){
    clearContainer()
    const form = document.createElement('form')
    form.id = "create-log"
    form.innerHTML = `
        <h2>Add a New Fishing Day to Your Log!</h2>
        <label>Date:</label>
        <input class="userinput" type="date" name="date">
        <label>River:</label>
        <input class="userinput" type="text" name="location" placeholder="Clear Creek">
        <label>River Access:</label>
        <textarea class="userinput" name="directions"></textarea>
        <label>Pattern Used:</label>
        <select id="pattern-select" type="select" name="colors" onchange="changeColorOption()">
            <option value=""> - Select - </option>
        </select>
        <label>Color of Pattern:</label>
        <select id="color-select" type="select" name="color_id">
            <option value=""> - Select - </option>
        </select>
        <label>How was the Fishing?</label>
        <textarea class="userinput" type="text" name="comments"></textarea>
        <label>Picture of the Day:</label>
        <input class="userinput" type="url" name="picture" placeholder="Image URL">
        <input id="addToLog" type="submit" value="Add to Log">
        <ul id="errors"></ul>
    `
    addPictureToFormContainer("../photos/fish-closeup.jpg")
    formContainer.append(form)
    addPatternOption()
    submitLogForm(form)
}

function submitLogForm(form){
    form.addEventListener("submit", e => {
        e.preventDefault()
        createLog()
    })
}

function createLog(){
    const form = document.getElementById('create-log')
    const rawData = new FormData(form)
    const logData = {
        date: rawData.get('date'),
        directions: rawData.get('directions'),
        location: rawData.get('location'),
        comments: rawData.get('comments'),
        picture: rawData.get('picture'),
        color_id: rawData.get('color_id'),
    }

    fetchUserWithToken(currentUserDays, "POST", logData)
        .then(response => response.json())
        .then(response => {
            if (response.status >= 400){
                displayErrors()
            } else {
                alert("Added to your fishing log!")
                getCurrentUserDays()
            }
        })
}

function addPatternOption(){
    fetchAndParse(patternsURL, "GET")
        .then(appendPatterns)
}

function appendPatterns(patterns){
    patterns.forEach(createOptionForPatternSelect)
}

function createOptionForPatternSelect(pattern){
    const select = document.getElementById('pattern-select')
    const option = document.createElement('option')
    option.value = pattern.colors.map(color => color.name + "-" + color.id)
    option.innerText = pattern.name 
    select.appendChild(option)
}

function changeColorOption(){
    removeColorOptions()
    const select = document.getElementById('color-select')
    const form = document.getElementById('create-log')
    const data = new FormData(form)
    const colorString = data.get("colors")
    const colorPairs = colorString.split(",")
    colorPairs.forEach(pair => {
        const newPair = pair.split("-")
        const option = document.createElement('option')
        option.className = "color-option"
        if (newPair[0] === "None") return
        option.innerText = newPair[0]
        option.value = newPair[1]
        select.appendChild(option)
    })
}

function removeColorOptions(){
    const options = document.getElementsByClassName('color-option')
    for (let option of options){
        option.remove()
    }
}

function addDaysToNavBar(){
    const ul = document.getElementById('nav-list')
    const li = document.createElement('li')

    li.innerText = "My Fishing Log"
    li.className = "click-able"
    li.id = "fishing-log"

    ul.appendChild(li)
    li.addEventListener("click", (e) => {
        e.preventDefault()
        getCurrentUserDays()
    })
}

function getCurrentUserDays(){
    clearContainer()
    fetchUserWithToken(currentUserDays, "GET")
        .then(response => {
            return response.json()
        }).then(displayDays)
}

function displayDays(days){
    days.forEach(day => {
        let colorName = ""
        if (day.color.name) colorName = day.color.name + " "
        const colorPatternName = colorName + day.patternName
        const div = document.createElement('div')
        div.className = "log-card"
        div.innerHTML = `
            <h4>Fishing Log: ${day.date}</h4>
            <ul>
                <li>Location: ${day.location}</li>
                <li>Directions: ${day.directions}</li>
                <li class="comment">Pattern of Choice: ${colorPatternName}</li>
            </ul>
            <img class="day-card-pattern" src=${day.color.image}>
            <p>Comments: ${day.comments}</p>
        `
        addDayOptPicture(day.picture, div)

        cardContainer.appendChild(div)
    })
}

function addDayOptPicture(source, parent){
    const img = document.createElement('img')
    img.className = "day-card-img"
    if (source) img.src = source
    else img.src = "../photos/green-back-cutthroat.jpg"
    parent.appendChild(img)
}

function viewUserForm(user){
    clearContainer()
    const editUserForm = document.createElement('form')
    const img = document.createElement('img')
    if (user.picture) {
        img.src = user.picture
    }else{
        img.src = "../photos/brookie-frasier.jpg"
    }
    editUserForm.id = "editUser"
    editUserForm.innerHTML = `
        <h2>Edit Your Profile</h2>
        <label>Name:</label>
        <input class="userinput" type="text" name="name" placeholder="${user.name}">
        <label>Phone Number:</label>
        <input class="userinput" type="tel" name="phone" placeholder="${user.phone}">
        <label>Profile Picture:</label>
        <input class="userinput" type="text" name="picture" placeholder="Image URL">
        <label>Confirm with your Password:</label>
        <input class="userinput" type="password" name="password">
        <div>
            <ul id="errors"></ul>
        </div>
    `
    createUserButton(editUserForm)
    deleteUserButton(editUserForm)
    formContainer.append(img, editUserForm)
}

function createUserButton(form){
    const editUserButton = document.createElement('input')
    editUserButton.id = "changeUser"
    editUserButton.type="submit"
    editUserButton.value = "Edit User Profile"
    form.appendChild(editUserButton)

    editUserButton.addEventListener("click", (e) => {
        e.preventDefault()
        editUser()
    })
}

function editUser(){
    const userForm = document.getElementById('editUser')
    const userFormData = new FormData(userForm)
    const userbody = {
        name: userFormData.get('name'),
        username: userFormData.get('username'),
        phone: userFormData.get('phone'),
        picture: userFormData.get('picture'),
        password: userFormData.get('password'),
        password_confirmation: userFormData.get('password_confirmation'),
    }

    fetchUserWithToken(currentUserUrl, "PATCH", userbody)
        .then(response => {
            if (response.status >= 400) {
                throw new Error("Bad request"),
                displayErrors()
            }
            return response
        }).then(response => {
                alert("User Sucessfully Updated")
                mainDisplay()
        })
}

function displayErrors(){
    clearErrors()
    const ul = document.getElementById('errors')
    const li = document.createElement('li')
    li.innerText = "Invalid Field(s)"
    ul.append(li)
}

function clearErrors(){
    const ul = document.getElementById('errors')
    ul.innerText = ""
}

function deleteUserButton(form){
    const editUserButton = document.createElement('input')
    editUserButton.id = "deleteUser"
    editUserButton.type="submit"
    editUserButton.value = "Delete Account"
    form.appendChild(editUserButton)

    editUserButton.addEventListener("click", (e) => {
        e.preventDefault()
        deleteUser()
    })
}

function deleteUser(){
    fetchUserWithToken(currentUserUrl, "DELETE")
        .then(response => {
            if (response.status >= 400) {
                throw new Error("Bad request")
            } else {
                alert("User Sucessfully Deleted")
                window.location.href = `../index.html`
            }
        })
}

function navBarEvents(){
    addUnlistedPattern()
    viewByFamily()
    userOptions()
}

function footerSignOut(){
    const signout = document.getElementById("logout")
    signout.addEventListener("click", (e) =>  
        clearLocalStorage()
    )
}

function clearLocalStorage(){
    localStorage.removeItem('token')
    localStorage.removeItem('username')
}

function viewByFamily(){
    fetchAndParse(insectfamilites, "GET")
        .then(familyOptions)
}

function familyOptions(families){
    let allPatterns = null
    const ul = document.getElementById('family-list')
    ul.innerText = ""

    fetchAndParse(patternsURL, "GET")
        .then(patterns => allPatterns = patterns)

    families.forEach(family => {
        const li = document.createElement('li')
        li.value = family.id 
        li.innerText = family.name
        ul.appendChild(li)

        li.addEventListener("click", e => {
            e.preventDefault()
            const filteredPatterns = allPatterns.filter(pattern => pattern.insect_family_id === family.id)
            displayFlies(filteredPatterns)
        })
    })
}

function mainDisplay(){
    defaultShowAllPatterns()

    const patterns = document.getElementById("patterns")

    patterns.addEventListener("click", (e) => {
        e.preventDefault()
        defaultShowAllPatterns()
    })

}

// function viewCardsBySearch(){
//     let patternlist = null
    
//     fetchAndParse(patternsURL, "GET")
//     .then(patternObj =>patternlist = patternObj)
    
//     const search = document.createElement('input')
//     search.type = "text"

//     formContainer.appendChild(search)

//     search.addEventListener("input", e => {
//         e.preventDefault()
//         const filteredFlies = patternlist.filter(pattern => e.target.value === pattern.name)
//     })
// }

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
    createNewPatternForm()
    createNewColorForm(formContainer)
}

function createNewPatternForm(){
    const newPatternForm = document.createElement('form')
    
    newPatternForm.id = "new-pattern-form"
    newPatternForm.innerHTML = `
    <h2>Add a new Pattern!</h2>
    <label>Name of Pattern:</label>
    <input class="patternInput" type="text" name="name" placeholder="BWO">
    <label>Dry or Wet fly?</label>
    <input class="patternInput" type="text" name="dry_wet" placeholder="Dry">
    <label>Description:</label>
    <textarea class="patternInput" name="description"></textarea>
    <label>Species:</label>
    <input class="patternInput" type="text" name="species" placeholder="BWO">
    <label>Life Stage:</label>
    <input class="patternInput" type="text" name="life_stage" placeholder="Adult">
    <label>Select an Insect Family this pattern belongs to:</label>
    <select id="select-family" name="insect_family">
        <option value="">- Select -</option>
    </select>
    `
    addPictureToFormContainer("../photos/fish-closeup.jpg")
    formContainer.append(newPatternForm)
    addOptions()
    submitNewFly(newPatternForm)
}

function addPictureToFormContainer(source){
    const img = document.createElement('img')
    img.src = source
    formContainer.append(img)
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
        .then(response => {
            if (response["errors"]) console.errors(response)
            return response
        }).then(response => {
            alert(`${response.name} Added! Next - add a Color for the Pattern!`)
            optomisticAddPatternOption(response)
        })
}

function optomisticAddPatternOption(pattern) {
    const select = document.getElementById('pattern-select')
    const option = document.createElement('option')
    option.value = pattern.id
    option.innerText = pattern.name
    select.appendChild(option)
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
            }else {
                alert(`Color has been added!`)
                location.reload()  
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

function fetchUserWithToken(url, method, optbody = null) {
    const request = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }
    if (optbody) {
        request.body = JSON.stringify(optbody)
    }
    return fetch(url, request)
}