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

  const noticeInner = document.querySelector(".notice-inner");

  if (noticeInner && !document.querySelector("#notice-update-style")) {
    const link = document.createElement("link");
    link.id = "notice-update-style";
    link.rel = "stylesheet";
    link.href = "assets/css/styles.css?v=notice-20260730";
    document.head.appendChild(link);
  }

  if (noticeInner) {
    noticeInner.innerHTML = `
        <p class="eyebrow">お知らせ</p>
        <article class="notice-primary">
          <p class="notice-label">New</p>
          <h1>8月21日 次回例会のお知らせ</h1>
          <p>歴史と伝統文化フォーラムの次回例会は、8月21日の金曜日です。金曜開催ですので御注意ください。</p>
          <p>今回は、時代劇をテーマとして行います。時代劇リバイバルの兆しも感じられる昨今、当フォーラムではその気運を醸成していきたく思っています。</p>
          <p>8月フォーラムの内容はチラシ画像の通りです。また、この情報をお知り合いの方々にも、広くお伝えいただければ幸いです。</p>
          <p class="notice-signature">一般社団法人 歴史と伝統文化フォーラム事務局</p>
        </article>
        <article class="notice-archive">
          <h2>6月20日 次回例会 内容変更のお知らせ</h2>
          <p>6月20日開催予定のフォーラム次回例会につきまして、内容を一部変更させていただきます。</p>
          <p>6月に講演を予定しておりました山本講師が急なご病気のため、6月例会は、10月に予定しておりました森田講師による「江戸時代、庶民の天皇即位式拝観」と差し替えて開催いたします。</p>
          <p>何卒ご理解、ご了承くださいますようお願い申し上げます。</p>
        </article>`;
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
