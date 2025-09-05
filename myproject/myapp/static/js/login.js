function Login() {
  const loginForm = document.getElementById("login-form");
  const loginMsg = document.getElementById("login-message-box");
  const registerLink = document.getElementById("load-register-link");

  console.log("login page loaded------->", new Date().toLocaleTimeString());
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      loginMsg.innerHTML = "";
      const formData = new FormData(loginForm);
      fetch("/login/", {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" ,
        },
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            fetch("/article_list/")
              .then(res => res.text())
              .then(html => {
                document.getElementById("page-container").innerHTML = html;
                history.pushState({}, "", "/article_list/");
                article_list(); 
              });
          } else {
            const error = document.createElement("li");
            error.innerText = data.error;
            error.className = "error";
            loginMsg.appendChild(error);
          }
        });
    });
  }
  if (registerLink) {
    registerLink.addEventListener("click", function (e) {
      e.preventDefault();
      ajaxNavigate(this.href);
      console.log("login link loaded at", new Date().toLocaleTimeString());
        });
  }
}
