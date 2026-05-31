(() => {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const contactForm = document.querySelector("#contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const topic = String(formData.get("topic") || "").trim();
      const message = String(formData.get("message") || "").trim();

      if (!name || !email || !topic || !message) {
        contactForm.reportValidity();
        return;
      }

      const subject = `【歴史と伝統文化フォーラム】${topic}`;
      const body = [
        "一般社団法人 歴史と伝統文化フォーラム 宛",
        "",
        `お名前: ${name}`,
        `メールアドレス: ${email}`,
        `お問い合わせ種別: ${topic}`,
        "",
        "お問い合わせ内容:",
        message,
      ].join("\n");

      const href = `mailto:rekifor2026@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
    });
  }
})();
