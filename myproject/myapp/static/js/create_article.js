
function create_article() {
  const form = document.getElementById("article-form");
  const publishBtn = document.getElementById("publish-btn");
  const draftBtn = document.getElementById("draft-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  let actionType = "";

  if (!form) return;

  if (publishBtn) publishBtn.addEventListener("click", () => actionType = "publish");
  if (draftBtn) draftBtn.addEventListener("click", () => actionType = "draft");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(form);

    if (actionType === "draft") formData.append("save_as_draft", "true");
    else formData.append("publish", "true");

    fetch("/create_article/", {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      body: formData
    })
    .then(res => res.text())
    .then(html => {
      if (actionType === "draft") {
        document.getElementById("page-container").innerHTML = html;
        history.pushState({}, "", "/draft_list/");
        draft_list();
      } else {
        document.getElementById("page-container").innerHTML = html;
        history.pushState({}, "", "/article_list/");
        article_list();
      }
    })
    .catch(err => console.error("Create Article AJAX Error:", err));
  });

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      ajaxNavigate("/create_article/");
    });
  }

  const backArticleLink = document.getElementById("back-to-article-list");
  if (backArticleLink) {
    backArticleLink.addEventListener("click", function (e) {
      e.preventDefault();
      ajaxNavigate(this.href);
    });
  }

  const backDraftLink = document.getElementById("back-to-draft-list");
  if (backDraftLink) {
    backDraftLink.addEventListener("click", function (e) {
      e.preventDefault();
      ajaxNavigate(this.href);
    });
  }
}
