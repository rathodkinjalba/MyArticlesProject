document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("register-form")) {
        console.log("Register DOM loaded at", new Date().toLocaleTimeString());
        Register();
    }
    else if (document.getElementById("login-form")) {
        console.log(" Login DOM loaded at", new Date().toLocaleTimeString());
        Login();
    }
    else if (document.getElementById("article-list-container")) {
        console.log(" article-list DOM loaded at", new Date().toLocaleTimeString());
        article_list();

    }
    else if (document.getElementById("draft-list-page")) { 
        console.log(" Draft List page loaded at", new Date().toLocaleTimeString());
        draft_list();
    
    }
    else if (document.getElementById("article-form")) {
        console.log("create-article DOM loaded at", new Date().toLocaleTimeString());
        create_article();
    }
    
});
// ------------------- Dynamic Page Navigation --------------------
function ajaxNavigate(url, addToHistory = true) {
  fetch(url)
    .then(response => response.text())
    .then(html => {
      document.getElementById("page-container").innerHTML = html;

      if (addToHistory) 
        history.pushState({}, "", url); 
      if (document.getElementById("article-list-container")) 
        article_list();
      else if (document.getElementById("article-form")) 
        create_article();
      
      else if (document.getElementById("register-form")) 
        Register();
      
      else if (document.getElementById("login-form")) 
        Login();
      
      else if (document.getElementById("draft-list-page")) 
        draft_list();
    })
    .catch(error => console.error("Navigation Error:", error));
}
// ------------------- Handle Back & Forward Button --------------------
window.addEventListener("popstate", function () {
  ajaxNavigate(window.location.pathname, false); 
});

