const baseURL = "http://localhost:3000"
const usersURL = `${baseURL}/users`
const loginURL = `${baseURL}/login`

const formContainer = document.getElementById('form-container')

renderLoginForm()
navBar()

function navBar(){
    const signup = document.getElementById('signup')
    const login = document.getElementById('login')
    
    signup.addEventListener("click", (e) => {
        e.preventDefault(),
        renderSignupForm()
    })
    
    login.addEventListener("click", (e) => {
        e.preventDefault(),
        renderLoginForm()
    })
}

function renderSignupForm(){
    formContainer.innerHTML = ""

    const form = document.createElement('form')
    const img = document.createElement('img')
    img.src = "./photos/fish-closeup.jpg"

    form.id = "signup-form"
    form.innerHTML = `
        <h2>Create a New User</h2>
        <label>First Name</label>
        <input class="form-input" type="text" name="name" placeholder="John">
        <label>Create a Username</label>
        <input class="form-input" type="text" name="username" placeholder="FishSlayer22">
        <label>Password</label>
        <input class="form-input" type="password" name="password">
        <label>Confirm Password</label>
        <input class="form-input" type="password" name="password_confirmation">
        <p class="side-note">Must contain an Uppercase Letter, Lowercase Letter, Number, and a special character.</p>
        <input id="submit-new-user" type="submit" value="Create User">
        <ul id="errors"></ul>
    `
    formContainer.append(img, form)

    submitNewUser()
}

function submitNewUser(){
    const submitUserForm = document.getElementById('submit-new-user')
        
    submitUserForm.addEventListener("click", (e) => {
        e.preventDefault(),
        createUser()
    })
}

function createUser(){
    clearErrors()
    
    const signupForm = document.getElementById('signup-form')
    const signupData = new FormData(signupForm)
    
    const newUserBody = {
        name: signupData.get('name'),
        username: signupData.get('username'),
        phone: signupData.get('phone'),
        password: signupData.get('password'),
        password_confirmation: signupData.get('password_confirmation'),
    }

    fetchAndParse(usersURL,"POST", newUserBody)
        .then(response => {
            if (response.status >= 400) {
                throw new Error("Bad request")
            } else if (response.name) {
                alert("User Sucessfully Created")
                renderLoginForm()
            } else {
                displayErrors(response.errors)
            }
        })
}

function displayErrors(errors){
    errors.forEach(renderErrors)
}

function renderErrors(error){
    const ul = document.getElementById('errors')
    const li = document.createElement('li')
    li.innerText=(error)
    ul.appendChild(li)
}

function clearErrors(){
    const ul = document.getElementById('errors')
    ul.innerText=""
}

function renderLoginForm(){
    formContainer.innerHTML = ""
    const img = document.createElement('img')
    img.src = "./photos/peach+fish.jpeg"
    const form = document.createElement('form')
    form.id = "login-form"
    form.innerHTML = `
        <h2>Login</h2>
        <label>Username</label>
        <input class="form-input" type="text" name="username" placeholder="FishSlayer22" >
        <label>Password</label>
        <input class="form-input" type="password" name="password">
        <input id="login-submit" type="submit" value="Log In">
        <ul id="errors">
        </ul>
    `
    formContainer.append(img, form)

    loginButton()
}

function loginButton(){
    const button = document.getElementById('login-submit')

    button.addEventListener("click", (e) => {
        e.preventDefault(),
        loginUser()
    })
}

function loginUser(){
    clearErrors()

    const loginForm = document.getElementById('login-form')
    const loginData = new FormData(loginForm)
    const loginBody = {
        username: loginData.get('username'),
        password: loginData.get('password'),
    }

    justFetch(loginURL, "POST", loginBody)
        .then(response => {
            if (response.status >= 400) {
                throw new Error("Unauthorized"),
                renderErrors("Incorrect Username or Password")
            }
            return response.json()
        }).then(storeToken)
        .catch(console.log)
}

function storeToken(response){
    const loginForm = document.getElementById('login-form')
    const loginData = new FormData(loginForm)
    const username = loginData.get('username')

    localStorage.setItem("token", response.token)
    localStorage.setItem("username", username)

    window.location.href = `./fishing-buddy-main/home.html`
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

function justFetch (url, method, optbody = null) {
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
}