const button = document.querySelector('#btn')
const wait = document.querySelector('#wait')



button.addEventListener('click', () =>{
    wait.style.display = 'block'
    setTimeout(() => {
        window.location.href = '../auth/auth.html'
    }, 10000)
})