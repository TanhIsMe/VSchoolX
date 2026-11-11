document.addEventListener('DOMContentLoaded', () => {
  // ---- 0. Theme Toggle (Dark / Light Mode) ----
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('vt-web-theme');

  function applyTheme(isLight) {
    if (isLight) {
      document.body.classList.add('light-theme');
      if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun" style="color:#f59e0b"></i>';
    } else {
      document.body.classList.remove('light-theme');
      if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  }

  // Initial load
  if (savedTheme === 'light') {
    applyTheme(true);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isNowLight = !document.body.classList.contains('light-theme');
      applyTheme(isNowLight);
      localStorage.setItem('vt-web-theme', isNowLight ? 'light' : 'dark');
      showToast(isNowLight ? 'Đã chuyển sang giao diện Sáng' : 'Đã chuyển sang giao diện Tối');
    });
  }



  // ---- 1. Toast Notification Helper ----
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMsg.textContent = msg || 'Đã sao chép vào bộ nhớ tạm!';
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ---- 2. Copy Code Buttons ----
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      if (!code) return;

      navigator.clipboard.writeText(code).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Đã chép!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #22d3ee)';
        showToast('Đã sao chép lệnh khởi chạy vào bộ nhớ tạm!');

        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.style.background = '';
        }, 2000);
      }).catch(err => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          showToast('Đã sao chép lệnh vào bộ nhớ tạm!');
        } catch (e) {
          showToast('Không thể tự động sao chép, hãy chọn thủ công.');
        }
        ta.remove();
      });
    });
  });

  // ---- 3. Guide Tabs Switching ----
  const tabBtns = document.querySelectorAll('.g-tab');
  const tabContents = document.querySelectorAll('.guide-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('on'));
      tabContents.forEach(c => c.classList.remove('on'));

      btn.classList.add('on');
      const targetId = btn.dataset.target;
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('on');
      }
    });
  });

  // ---- 4. FAQ Accordion ----
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Open first FAQ by default
  if (faqItems.length > 0) {
    faqItems[0].classList.add('active');
  }

  // ---- 5. Mobile Navigation Toggle ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.style.display === 'flex';
      if (isOpen) {
        navLinks.style.display = '';
        navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = '#0d0f1e';
        navLinks.style.padding = '20px 24px';
        navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        navToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      }
    });

    // Close mobile nav when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinks.style.display = '';
          navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
      });
    });
  }

  // ---- 6. Scroll Active State ----
  const sections = document.querySelectorAll('section[id], header[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-links a[href*="${sectionId}"]`);
      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.style.color = 'var(--a2)';
        } else {
          navLink.style.color = '';
        }
      }
    });
  });

});
