function draft_list() {
console.log("draft_list page loaded------>", new Date().toLocaleTimeString());

  document.querySelectorAll(".edit-draft-link").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      fetch(this.href, { headers: { "X-Requested-With": "XMLHttpRequest" } })
        .then(res => res.text())
        .then(html => {
          document.getElementById("page-container").innerHTML = html;
          history.pushState({}, "", this.href);
          create_article();
        });
    });
  });

  const createArticleBtn = document.getElementById("load-create-article");
  if (createArticleBtn) {
    createArticleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      fetch(this.href, { headers: { "X-Requested-With": "XMLHttpRequest" } })
        .then(res => res.text())
        .then(html => {
          document.getElementById("page-container").innerHTML = html;
          history.pushState({}, "", this.href);
          create_article();
        });
    });
  }

  const backToArticlesBtn = document.getElementById("back-article-list");
  if (backToArticlesBtn) {
    backToArticlesBtn.addEventListener("click", function (e) {
      e.preventDefault();
      ajaxNavigate(this.href);
        });
    }
}

