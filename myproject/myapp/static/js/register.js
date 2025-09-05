
function Register() {
  const registerForm = document.getElementById("register-form");
  const registerMsg = document.getElementById("message-box");
  const loginLink = document.getElementById("load-login-link");
  console.log("......register........");
  console.log("register page loaded", new Date().toLocaleTimeString());

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      registerMsg.innerHTML = "";
      const formData = new FormData(registerForm);
      fetch("/register/", {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest",


         },
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            fetch("/login/")
              .then(res => res.text())
              .then(html => {
                document.getElementById("page-container").innerHTML= html;
                history.pushState({}, "", "/login/");
                Login(); 
              });
          } else {
            const error = document.createElement("li");
            error.innerText = data.error;
            error.className = "error";
            registerMsg.appendChild(error);
          }
        });
    });
  }
  if (loginLink) {
    loginLink.addEventListener("click", function (e) {
      e.preventDefault();
      ajaxNavigate(this.href);
        });
  }
}
