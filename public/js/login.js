//DOM elements
const form = document.querySelector("#login-form");
const submitBtn = document.querySelector("#submit-btn");
const createLink = document.querySelector("#create-link");
const usernameInput = document.querySelector("#username");
const loginError = document.querySelector("#loginError");
const codeInput = document.querySelector("#code");


const generateCode = () => (
    Math.random().toString(36).substr(2,7)
)

form.addEventListener("submit", async (event) => {
    event.preventDefault()
    let res;
    try {
        res = await axios.put(`http://nowie-chat-app.herokuapp.com/room/${codeInput.value}/add?name=${usernameInput.value}`);
       
    } catch (error) {
        console.log(error.message);
    }
    if (res.status === 205) {
        loginError.classList.toggle("d-none");
        usernameInput.focus();
        codeInput.focus();
    }
    else {
        window.location.replace(`http://nowie-chat-app.herokuapp.com/chat/${codeInput.value}?name=${usernameInput.value}`);
    }
})

const createLinkEventListener = async (event) => {
    let code=generateCode()
    try {
        let res = await axios.post(`http://nowie-chat-app.herokuapp.com/room/${code}?name=${usernameInput.value}`);
        console.log(res);
   } catch (error) {
       console.log(error.message);
    }
    
    window.location.replace(`http://nowie-chat-app.herokuapp.com/chat/${code}?name=${usernameInput.value}`);
};

usernameInput.addEventListener("keyup", (event) => {
    submitBtn.classList.toggle("disabled");
    createLink.addEventListener("click",createLinkEventListener);
})

codeInput.addEventListener("keyup", (event) => {
    
})