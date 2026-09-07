(function () {
  'use strict';

  // =========================================================================
  // Configuration
  // =========================================================================
  const CONFIG = {
    themeKey: 'portfolio-theme',
    debounceDelay: 250,
    scrollOffset: 80,
    animationThreshold: 0.1,
    navSections: [
      'section-dashboard',
      'section-projects',
      'section-services',
      'section-insights',
      'section-experience',
      'section-education',
      'section-contact'
    ]
  };

  // =========================================================================
  // State
  // =========================================================================
  var searchTimeout = null;
  var contactWidgetOpen = false;

  // =========================================================================
  // Utility Functions
  // =========================================================================
  function debounce(fn, delay) {
    var timer;
    return function () {
      var args = arguments;
      var context = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(context, args); }, delay);
    };
  }

  function isDarkMode() {
    return document.documentElement.classList.contains('dark');
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // =========================================================================
  // Theme
  // =========================================================================
  function initTheme() {
    var saved = localStorage.getItem(CONFIG.themeKey);
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }

    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', toggleTheme);
    }
  }

  function toggleTheme() {
    var html = document.documentElement;
    html.classList.toggle('dark');
    var theme = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem(CONFIG.themeKey, theme);

    // Re-init icons (sun/moon swap)
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // =========================================================================
  // Navigation
  // =========================================================================
  function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(function (item) {
      item.addEventListener('click', function () {
        const sectionId = this.getAttribute('data-section');
        const section = document.getElementById(sectionId);
        if (!section) return;

        // Smooth scroll
        const top = section.offsetTop - CONFIG.scrollOffset;
        window.scrollTo({ top: top, behavior: 'smooth' });

        // Update active state
        setActiveNav(sectionId);

        // Close mobile sidebar
        closeMobileMenu();
      });
    });

    // Scroll spy
    initScrollSpy();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          const top = target.offsetTop - CONFIG.scrollOffset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  function setActiveNav(sectionId) {
    document.querySelectorAll('.nav-item').forEach(function (item) {
      item.classList.remove('active');
      if (item.getAttribute('data-section') === sectionId) {
        item.classList.add('active');
      }
    });
  }

  function initScrollSpy() {
    const sections = CONFIG.navSections
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      function (entries) {
        // Find the topmost visible section
        let activeId = null;
        let minTop = Infinity;

        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const rect = entry.target.getBoundingClientRect();
            if (rect.top < minTop && rect.top > -rect.height / 2) {
              minTop = rect.top;
              activeId = entry.target.id;
            }
          }
        });

        if (activeId) {
          setActiveNav(activeId);
        }
      },
      {
        rootMargin: '-80px 0px -40% 0px',
        threshold: [0.05, 0.1, 0.3]
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // =========================================================================
  // Search
  // =========================================================================
  function initSearch() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    if (!input || !results) return;

    input.addEventListener('input', debounce(function () {
      const query = this.value.trim().toLowerCase();
      if (query.length < 2) {
        closeSearch();
        return;
      }
      performSearch(query);
    }, CONFIG.debounceDelay));

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        closeSearch();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeSearch();
        input.blur();
      }
    });

    // Delegate click on results
    results.addEventListener('click', function (e) {
      const item = e.target.closest('.search-result-item');
      if (!item) return;

      const scrollTo = item.getAttribute('data-scroll-to');
      const target = document.getElementById(scrollTo);
      if (target) {
        const top = target.offsetTop - CONFIG.scrollOffset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
      closeSearch();
      input.value = '';
    });
  }

  function performSearch(query) {
    const results = document.getElementById('search-results');
    if (!results) return;

    let html = '';
    let count = 0;

    // Search projects
    document.querySelectorAll('.project-card').forEach(function (card) {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const tags = (card.getAttribute('data-tags') || '').toLowerCase();
      if (title.includes(query) || tags.includes(query)) {
        html += buildSearchResult(
          card.getAttribute('data-title'),
          'Estudo de Caso',
          'briefcase',
          'section-projects'
        );
        count++;
      }
    });

    // Search insights
    document.querySelectorAll('.insight-card').forEach(function (card) {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const tags = (card.getAttribute('data-tags') || '').toLowerCase();
      if (title.includes(query) || tags.includes(query)) {
        html += buildSearchResult(
          card.getAttribute('data-title'),
          'Insight',
          'lightbulb',
          'section-insights'
        );
        count++;
      }
    });

    // Search services
    document.querySelectorAll('.service-card').forEach(function (card) {
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var tags = (card.getAttribute('data-tags') || '').toLowerCase();
      if (title.includes(query) || tags.includes(query)) {
        html += buildSearchResult(
          card.getAttribute('data-title'),
          'Serviço',
          'briefcase-business',
          'section-services'
        );
        count++;
      }
    });

    if (count === 0) {
      html = '<div class="px-4 py-6 text-center text-sm text-gray-400">Nenhum resultado encontrado</div>';
    }

    results.innerHTML = html;
    results.classList.add('active');

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  function buildSearchResult(title, type, icon, scrollTo) {
    return '<div class="search-result-item px-4 py-3 cursor-pointer" data-scroll-to="' + scrollTo + '">' +
      '<div class="flex items-center gap-3">' +
      '<i data-lucide="' + icon + '" class="w-4 h-4 text-accent flex-shrink-0"></i>' +
      '<div class="min-w-0">' +
      '<div class="text-sm font-medium truncate">' + escapeHtml(title) + '</div>' +
      '<div class="text-xs text-gray-400">' + type + '</div>' +
      '</div></div></div>';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function closeSearch() {
    var results = document.getElementById('search-results');
    if (results) {
      results.classList.remove('active');
    }
  }

  // =========================================================================
  // Mobile Menu
  // =========================================================================
  function initMobileMenu() {
    var menuBtn = document.getElementById('mobile-menu-btn');
    var closeBtn = document.getElementById('sidebar-close-btn');
    var overlay = document.getElementById('sidebar-overlay');

    if (menuBtn) {
      menuBtn.addEventListener('click', openMobileMenu);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMobileMenu);
    }
    if (overlay) {
      overlay.addEventListener('click', closeMobileMenu);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
        closeMobileMenu();
      }
    });
  }

  function openMobileMenu() {
    document.body.classList.add('sidebar-open');
  }

  function closeMobileMenu() {
    document.body.classList.remove('sidebar-open');
  }

  // =========================================================================
  // Scroll Animations
  // =========================================================================
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) return;

    // If reduced motion, show everything immediately
    if (prefersReducedMotion()) {
      elements.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: CONFIG.animationThreshold, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // =========================================================================
  // Pipeline Animation
  // =========================================================================
  function initPipelineAnimation() {
    var container = document.querySelector('.pipeline-container');
    if (!container) return;

    var nodes = container.querySelectorAll('.pipeline-node');
    if (nodes.length === 0) return;

    if (prefersReducedMotion()) {
      nodes.forEach(function (node) { node.classList.add('animate'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            nodes.forEach(function (node, index) {
              setTimeout(function () {
                node.classList.add('animate');
              }, index * 200);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(container);
  }
  // =========================================================================
  // Contact Widget
  // =========================================================================
  function initContactWidget() {
    var btn = document.getElementById('contact-widget-btn');
    var closeBtn = document.getElementById('contact-widget-close');
    var panel = document.getElementById('contact-widget-panel');

    if (!btn || !panel) return;

    btn.addEventListener('click', function () {
      contactWidgetOpen = !contactWidgetOpen;
      if (contactWidgetOpen) {
        panel.classList.add('open');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      } else {
        panel.classList.remove('open');
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        contactWidgetOpen = false;
        panel.classList.remove('open');
      });
    }
  }

  // =========================================================================
  // Insight Filters
  // =========================================================================
  function initInsightFilters() {
    var filters = document.querySelectorAll('.insight-filter');
    var cards = document.querySelectorAll('.insight-card');

    if (filters.length === 0 || cards.length === 0) return;

    filters.forEach(function (filter) {
      filter.addEventListener('click', function () {
        var category = this.getAttribute('data-category');

        // Update active filter button
        filters.forEach(function (f) {
          f.classList.remove('bg-accent', 'text-white');
          f.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-500');
        });
        this.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-500');
        this.classList.add('bg-accent', 'text-white');

        // Filter cards
        cards.forEach(function (card) {
          var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
          var filterCategory = category.toLowerCase();

          if (filterCategory === 'all' || cardCategory === filterCategory) {
            card.style.display = '';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(8px)';
            setTimeout(function () {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  }

  // =========================================================================
  // WhatsApp Form
  // =========================================================================
  function initWhatsAppForm() {
    var form = document.getElementById('whatsapp-contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput = document.getElementById('contact-name');
      var emailInput = document.getElementById('contact-email');
      var serviceInput = document.getElementById('contact-service');
      var companyInput = document.getElementById('contact-company');
      var messageInput = document.getElementById('contact-message');

      var name = nameInput ? nameInput.value.trim() : '';
      var email = emailInput ? emailInput.value.trim() : '';
      var service = serviceInput ? serviceInput.value : '';
      var company = companyInput ? companyInput.value.trim() : '';
      var message = messageInput ? messageInput.value.trim() : '';

      var text = 'Olá! Meu nome é *' + name + '*.\n';
      text += '*E-mail:* ' + email + '\n';
      if (service) text += '*Solução desejada:* ' + service + '\n';
      if (company) text += '*Empresa/Projeto:* ' + company + '\n';
      if (message) text += '\n*Detalhes do projeto:*\n' + message;

      var encodedText = encodeURIComponent(text);
      var whatsappUrl = 'https://wa.me/5511971238888?text=' + encodedText;

      window.open(whatsappUrl, '_blank');
    });
  }

  // =========================================================================
  // Initialization
  // =========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    // Theme (must run first)
    initTheme();

    // Icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Core features
    initNavigation();
    initSearch();
    initMobileMenu();
    initScrollAnimations();
    initPipelineAnimation();
    initInsightFilters();
    initContactWidget();
    initWhatsAppForm();
  });

})();
