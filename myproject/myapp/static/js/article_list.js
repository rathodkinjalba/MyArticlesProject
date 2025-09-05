
function article_list() {
  const createBtn = document.getElementById("create-article-link");
  const logoutBtn = document.getElementById("logout-link");
  const draftBtn = document.getElementById("draft-link");
  const tagLinks = document.querySelectorAll(".tag-sidebar a");
  const likeBtns = document.querySelectorAll(".like-btn"); 
  const commentBtns = document.querySelectorAll(".comments-btn");
  const submitBtns = document.querySelectorAll(".submit-comment-btn");
  const searchInput = document.getElementById("author-search");
  const searchBtn = document.getElementById("author-search-btn");
  const registerBtn = document.getElementById("register-link"); 
  const paginationLinks = document.querySelectorAll(".pagination a"); 
  const loginLink = document.getElementById("login-link")
  if (loginLink){
    loginLink.addEventListener("click",function (e){
      e.preventDefault();
      ajaxNavigate(loginLink.href);
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Searching by author...");
      const query = searchInput.value.trim();
      if (query) {
        ajaxNavigate(`/article_list/?author=${encodeURIComponent(query)}`);
      }
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", function (e) {  
      e.preventDefault();
      ajaxNavigate(this.href);
    });
  }
  paginationLinks.forEach(function (link) {   
    link.addEventListener("click", function (e) {
      e.preventDefault();
      ajaxNavigate(this.href);
    });
  });

  
  if (createBtn) {
    createBtn.addEventListener("click", function (e) {
      e.preventDefault();
      ajaxNavigate(this.href);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      ajaxNavigate(this.href);
    });
  }

  if (draftBtn) {
    draftBtn.addEventListener("click", function (e) {
      e.preventDefault();
      ajaxNavigate(this.href);
    });
  }

  tagLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      ajaxNavigate(this.href);
    });
  });
  
likeBtns.forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.preventDefault();

    const articleId = this.getAttribute("data-article");
    const url = `/like/${articleId}/`;
    const likeList = document.getElementById(`like-list-${articleId}`);
    const countBtn = document.getElementById(`like-count-${articleId}`);

    fetch(url, {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    })
      .then(res => res.json())
      .then(data => {
        this.innerHTML = data.liked ? "Liked" : "Like";

        countBtn.innerText = data.count;

        if (data.liked) {
          const noLikes = document.getElementById(`no-likes-${articleId}`);
          if (noLikes) noLikes.remove();

          if (!document.getElementById(`like-user-${data.user_id}`)) {
            const li = document.createElement("li");
            li.id = `like-user-${data.user_id}`;
            li.innerHTML = `${data.username} : <small>${data.liked_at}</small>`;

            likeList.appendChild(li);
          }
        } else {
          const li = document.getElementById(`like-user-${data.user_id}`);
          if (li) li.remove();

          if (data.count === 0) {
            const li = document.createElement("li");
            li.id = `no-likes-${articleId}`;
            li.innerText = "No likes yet";
            likeList.appendChild(li);
          }
        }
      });
  });
});
document.querySelectorAll(".like-count").forEach(function(btn){
  btn.addEventListener("click", function(){
    const articleId = this.getAttribute("data-article");
    const likeListDiv = document.getElementById(`like-list-${articleId}`);

    document.querySelectorAll("[id^='like-list-']").forEach(function(div) {
      if (div !== likeListDiv) {
        div.style.display = "none";
      }
    });

    likeListDiv.style.display = 
      (likeListDiv.style.display === "block") ? "none" : "block";
  });
});


commentBtns.forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    const articleId = this.getAttribute("data-article");
    const section = document.getElementById(`comments-section-${articleId}`);

    document.querySelectorAll("[id^='comments-section-']").forEach(function (div) {
      if (div !== section) {
        div.style.display = "none";
      }
    });
    section.style.display = (section.style.display === "block") ? "none" : "block";
  });
});


  
  submitBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      const articleId = this.getAttribute("data-article");
      const textarea = document.getElementById(`comment-input-${articleId}`);
      const commentText = textarea.value.trim();

      if (!commentText) {
        alert("Comment cannot be empty!");
        return;
      }
      

      const formData = new FormData();
      formData.append("content", commentText);
  

      fetch(`/comment/${articleId}/`, {
        method: "POST",
        headers: {
          
          "X-CSRFToken": getCookie("csrftoken"),
        },
        
        body: formData
        
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            
            const commentList = document.getElementById(`comments-list-${articleId}`);
            const newComment = document.createElement("div");
            newComment.classList.add("comment");
            newComment.innerHTML = `<strong>${data.username}:</strong>${data.content}`;
            commentList.prepend(newComment);

  
            const countSpan = document.getElementById(`comments-count-${articleId}`);
            countSpan.innerText = data.count;
            textarea.value = "";
            } else {
            alert("Failed to post comment");
          }
        });
    });
  });
}
  document.querySelectorAll(".more-link").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const id = this.getAttribute("data-id");
      document.getElementById("short-" + id).style.display = "none";
      document.getElementById("full-" + id).style.display = "block";
    });
  });
  document.querySelectorAll(".less-link").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const id = this.getAttribute("data-id");
      document.getElementById("full-" + id).style.display = "none";
      document.getElementById("short-" + id).style.display = "block";
    });
  });

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
