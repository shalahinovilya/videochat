const enterText = document.querySelector(".title-text .enter");
const enterForm = document.querySelector("form.enter");
const enterBtn = document.querySelector("label.enter");
const createBtn = document.querySelector("label.create");
const createForm = document.querySelector('form.create')

createBtn.addEventListener('click', () => {
    enterForm.style.marginLeft = "-50%";
    enterText.style.marginLeft = "-50%";
});
enterBtn.addEventListener('click', () =>{
    enterForm.style.marginLeft = "0%";
    enterText.style.marginLeft = "0%";
});

const enterUsernameInput = document.querySelector('input#enterUsername')
const enterRoomIdInput = document.querySelector('input#roomId')

const createUsernameInput = document.querySelector('input#createUsername')

createForm.addEventListener('submit', (e) => {
    e.target.action = `/createRoom/${createUsernameInput.value}`
    e.target.method = 'get'
})

enterForm.addEventListener('submit', (e) => {
    e.target.action  = `/enterRoom/${enterRoomIdInput.value}/${enterUsernameInput.value}`
    e.target.method = 'get'
    createForm.submit()
})
