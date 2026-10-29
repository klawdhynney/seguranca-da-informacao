/**
 * Apresentação de Segurança da Informação e Boas Práticas no Trabalho
 * Engine de Apresentação Interativa em JavaScript Puro
 */

(function () {
  'use strict';

  // Estado da Apresentação
  const state = {
    currentSlide: 1,
    totalSlides: 12,
    isFullscreen: false,
    isOverviewOpen: false,
    isHelpOpen: false,
    isCardZoomOpen: false,
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
  };

  // Elementos do DOM
  const dom = {
    slides: document.querySelectorAll('.slide'),
    progressBar: document.getElementById('top-progress-bar'),
    currentNum: document.querySelector('.current-num'),
    totalNum: document.querySelector('.total-num'),
    prevBtn: document.getElementById('btn-prev'),
    nextBtn: document.getElementById('btn-next'),
    fullscreenBtn: document.getElementById('btn-fullscreen'),
    overviewBtn: document.getElementById('btn-overview'),
    helpBtn: document.getElementById('btn-help'),
    themeBtn: document.getElementById('btn-theme'),
    dotsContainer: document.getElementById('dock-dots-container'),
    overviewModal: document.getElementById('overview-modal'),
    helpModal: document.getElementById('help-modal'),
    closeOverviewBtn: document.getElementById('close-overview-btn'),
    closeHelpBtn: document.getElementById('close-help-btn'),
    overviewGrid: document.getElementById('overview-grid'),
    cardZoomModal: document.getElementById('card-zoom-modal'),
    cardZoomContainer: document.getElementById('card-zoom-container'),
    cardZoomContent: document.getElementById('card-zoom-content'),
    cardZoomCloseBtn: document.getElementById('card-zoom-close-btn'),
  };

  /**
   * Inicialização
   */
  function init() {
    state.totalSlides = dom.slides.length || 12;
    if (dom.totalNum) dom.totalNum.textContent = String(state.totalSlides).padStart(2, '0');

    buildDots();
    buildOverviewGrid();
    setupImageHandlers();
    setupCardZoom();

    // Lê slide da URL hash se existir (#1 a #12)
    const hash = window.location.hash.replace('#', '');
    const initialSlide = parseInt(hash, 10);
    if (!isNaN(initialSlide) && initialSlide >= 1 && initialSlide <= state.totalSlides) {
      goToSlide(initialSlide, false);
    } else {
      goToSlide(1, false);
    }

    bindEvents();
  }

  /**
   * Cria os pontos indicadores na barra inferior
   */
  function buildDots() {
    if (!dom.dotsContainer) return;
    dom.dotsContainer.innerHTML = '';
    for (let i = 1; i <= state.totalSlides; i++) {
      const dot = document.createElement('div');
      dot.className = 'dock-dot' + (i === state.currentSlide ? ' active' : '');
      dot.title = `Ir para o slide ${i}`;
      dot.setAttribute('data-target', i);
      dot.addEventListener('click', () => goToSlide(i));
      dom.dotsContainer.appendChild(dot);
    }
  }

  /**
   * Constrói a grade do modal de visão geral
   */
  function buildOverviewGrid() {
    if (!dom.overviewGrid) return;
    dom.overviewGrid.innerHTML = '';

    dom.slides.forEach((slide, index) => {
      const slideNum = index + 1;
      const titleElem = slide.querySelector('.slide-title');
      const categoryElem = slide.querySelector('.slide-category');

      const card = document.createElement('div');
      card.className = 'overview-card' + (slideNum === state.currentSlide ? ' active' : '');
      card.setAttribute('data-target', slideNum);

      const numSpan = document.createElement('span');
      numSpan.className = 'card-num';
      numSpan.textContent = `SLIDE ${String(slideNum).padStart(2, '0')}`;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'card-name';
      const rawText = titleElem ? (titleElem.textContent || titleElem.innerText || '') : `Slide ${slideNum}`;
      nameSpan.textContent = rawText.replace(/\s+/g, ' ').trim();

      card.appendChild(numSpan);
      card.appendChild(nameSpan);

      card.addEventListener('click', () => {
        goToSlide(slideNum);
        toggleOverviewModal(false);
      });

      dom.overviewGrid.appendChild(card);
    });
  }

  /**
   * Gerencia detecção e carregamento automático de imagens (imagens/slide-XX.png)
   */
  function setupImageHandlers() {
    dom.slides.forEach((slide, index) => {
      const slideNum = index + 1;
      const formattedNum = String(slideNum).padStart(2, '0');
      const visualContainer = slide.querySelector('.visual-container');
      if (!visualContainer) return;

      const img = visualContainer.querySelector('.slide-custom-image');
      const svg = visualContainer.querySelector('.svg-illustration');
      const togglePill = visualContainer.querySelector('.media-toggle-pill');

      if (!img) return;

      // Suporta slide-01.png, slide-01.jpg
      const tryImages = [
        `imagens/slide-${formattedNum}.png`,
        `imagens/slide-${formattedNum}.jpg`,
        `imagens/slide-${slideNum}.png`,
        `imagens/slide-${slideNum}.jpg`
      ];

      let attemptIdx = 0;

      function tryNextImage() {
        if (attemptIdx < tryImages.length) {
          img.src = tryImages[attemptIdx];
          attemptIdx++;
        } else {
          // Nenhuma imagem encontrada: SVG permanece ativo
          img.classList.remove('loaded', 'show');
          if (svg) svg.style.opacity = '1';
          if (togglePill) togglePill.style.display = 'none';
        }
      }

      img.onload = function () {
        img.classList.add('loaded', 'show');
        if (svg) svg.style.opacity = '0';
        if (togglePill) {
          togglePill.style.display = 'inline-flex';
          togglePill.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Imagem Ativa (Alternar para SVG)
          `;
          togglePill.onclick = function (e) {
            e.stopPropagation();
            if (img.classList.contains('show')) {
              img.classList.remove('show');
              if (svg) svg.style.opacity = '1';
              togglePill.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                SVG Ativo (Alternar para Imagem)
              `;
            } else {
              img.classList.add('show');
              if (svg) svg.style.opacity = '0';
              togglePill.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                Imagem Ativa (Alternar para SVG)
              `;
            }
          };
        }
      };

      img.onerror = function () {
        tryNextImage();
      };

      // Inicia a verificação da imagem
      tryNextImage();
    });
  }

  /**
   * Configuração de ampliação interativa dos elementos (Cards, Cabeçalhos, Avisos, Diagramas/Mídia)
   */
  function setupCardZoom() {
    const zoomableSelectors = '.slide-header-block, .info-card, .check-item, .comp-card, .alert-callout, .visual-container';
    const allZoomables = document.querySelectorAll(zoomableSelectors);

    allZoomables.forEach(elem => {
      elem.setAttribute('role', 'button');
      elem.setAttribute('tabindex', '0');

      let tooltip = 'Clique para ampliar';
      if (elem.classList.contains('slide-header-block')) tooltip = 'Clique para ampliar o título e introdução';
      else if (elem.classList.contains('visual-container')) tooltip = 'Clique para ampliar o diagrama / ilustração';
      else if (elem.classList.contains('alert-callout')) tooltip = 'Clique para ampliar o aviso de destaque';
      elem.setAttribute('title', tooltip);

      // Abre ao clicar
      elem.addEventListener('click', (e) => {
        // Não ativa se o usuário clicar no botão de alternar imagem/SVG
        if (e.target.closest('.media-toggle-pill')) return;
        // Não ativa se clicar em botões de ação (ex: reiniciar ou grade)
        if (e.target.closest('button:not(.card-modal-close), a')) return;
        openCardZoom(elem);
      });

      // Abre com tecla Enter ou Espaço
      elem.addEventListener('keydown', (e) => {
        if (e.target.closest('.media-toggle-pill, button, a')) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCardZoom(elem);
        }
      });
    });

    // Fechar ao clicar no botão X
    if (dom.cardZoomCloseBtn) {
      dom.cardZoomCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCardZoom();
      });
    }

    // Fechar ao clicar fora do card (no backdrop)
    if (dom.cardZoomModal) {
      dom.cardZoomModal.addEventListener('click', (e) => {
        if (e.target === dom.cardZoomModal) {
          closeCardZoom();
        }
      });
    }
  }

  /**
   * Abre qualquer elemento selecionado em modo ampliado (~70% da tela)
   */
  function openCardZoom(elem) {
    if (!dom.cardZoomModal || !dom.cardZoomContent || !dom.cardZoomContainer) return;

    // Determina o slide de origem
    const slide = elem.closest('.slide');
    const slideCategoryElem = slide ? slide.querySelector('.slide-category') : null;
    const slideTitleElem = slide ? slide.querySelector('.slide-title') : null;

    let contextTag = 'SEGURANÇA DA INFORMAÇÃO';
    if (slideCategoryElem) {
      contextTag = slideCategoryElem.textContent.replace(/\s+/g, ' ').trim();
    } else if (slideTitleElem) {
      contextTag = slideTitleElem.textContent.replace(/\s+/g, ' ').trim();
    }

    let titleText = '';
    let descHtml = '';
    let iconHtml = '';
    let theme = 'cyan';

    // Redefine container
    dom.cardZoomContainer.className = 'card-modal-container';

    // ========================================================
    // CASO 1: DIAGRAMAS, ILUSTRAÇÕES SVG E IMAGENS (.visual-container)
    // ========================================================
    if (elem.classList.contains('visual-container')) {
      theme = 'cyan';
      dom.cardZoomContainer.classList.add('modal-media-mode');

      const img = elem.querySelector('.slide-custom-image');
      const svg = elem.querySelector('.svg-illustration');
      const isImageActive = img && img.classList.contains('show');

      const slideTitleText = slideTitleElem ? slideTitleElem.textContent.replace(/\s+/g, ' ').trim() : 'Ilustração Técnica';
      titleText = isImageActive ? `Imagem: ${slideTitleText}` : `Diagrama: ${slideTitleText}`;

      iconHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

      let mediaStageHtml = '';
      if (isImageActive && img.src) {
        mediaStageHtml = `<img src="${img.src}" alt="${titleText}" class="zoomed-media-image" />`;
      } else if (svg) {
        mediaStageHtml = `<div class="zoomed-media-svg">${svg.innerHTML}</div>`;
      }

      dom.cardZoomContent.innerHTML = `
        <div class="zoomed-header">
          <div class="zoomed-icon cyan">
            ${iconHtml}
          </div>
          <div class="zoomed-meta">
            <span class="zoomed-tag">${contextTag} • DIAGRAMA / ILUSTRAÇÃO</span>
            <h2 class="zoomed-title">${titleText}</h2>
          </div>
        </div>
        <div class="zoomed-media-stage">
          ${mediaStageHtml}
        </div>
      `;

      dom.cardZoomModal.classList.add('open');
      dom.cardZoomModal.setAttribute('aria-hidden', 'false');
      state.isCardZoomOpen = true;
      return;
    }

    // ========================================================
    // CASO 2: BLOCO DE CABEÇALHO DO SLIDE (.slide-header-block)
    // ========================================================
    if (elem.classList.contains('slide-header-block')) {
      theme = 'cyan';
      const catElem = elem.querySelector('.slide-category');
      const titleElem = elem.querySelector('.slide-title');
      const subElem = elem.querySelector('.slide-subtitle');

      const catText = catElem ? catElem.textContent.replace(/\s+/g, ' ').trim() : contextTag;
      const titleHtml = titleElem ? titleElem.innerHTML : 'Título do Slide';
      const subHtml = subElem ? subElem.innerHTML : '';

      iconHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`;

      dom.cardZoomContent.innerHTML = `
        <div class="zoomed-header">
          <div class="zoomed-icon cyan">
            ${iconHtml}
          </div>
          <div class="zoomed-meta">
            <span class="zoomed-tag">${catText} • INTRODUÇÃO</span>
            <h2 class="zoomed-title">${titleHtml}</h2>
          </div>
        </div>
        <div class="zoomed-subtitle-large">
          ${subHtml}
        </div>
      `;

      dom.cardZoomModal.classList.add('open');
      dom.cardZoomModal.setAttribute('aria-hidden', 'false');
      state.isCardZoomOpen = true;
      return;
    }

    // ========================================================
    // CASO 3: AVISOS E NOTAS DE RODAPÉ (.alert-callout)
    // ========================================================
    if (elem.classList.contains('alert-callout')) {
      if (elem.classList.contains('danger')) theme = 'rose';
      else if (elem.classList.contains('tip')) theme = 'cyan';
      else if (elem.classList.contains('success')) theme = 'emerald';
      else theme = 'amber';

      dom.cardZoomContainer.classList.add(`theme-${theme}`);

      const svgElem = elem.querySelector('svg');
      iconHtml = svgElem ? svgElem.outerHTML : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

      const strongElem = elem.querySelector('strong');
      titleText = strongElem ? strongElem.innerText.replace(/:$/, '').trim() : 'Diretriz de Segurança';

      const spanElem = elem.querySelector('span');
      descHtml = spanElem ? spanElem.innerHTML : elem.innerHTML;

      dom.cardZoomContent.innerHTML = `
        <div class="zoomed-header">
          <div class="zoomed-icon ${theme}">
            ${iconHtml}
          </div>
          <div class="zoomed-meta">
            <span class="zoomed-tag">${contextTag} • DIRETRIZ CORPORATIVA</span>
            <h2 class="zoomed-title">${titleText}</h2>
          </div>
        </div>
        <div class="zoomed-body" style="font-size: clamp(1.4rem, 2.2vw, 1.85rem); line-height: 1.65;">
          ${descHtml}
        </div>
      `;

      dom.cardZoomModal.classList.add('open');
      dom.cardZoomModal.setAttribute('aria-hidden', 'false');
      state.isCardZoomOpen = true;
      return;
    }

    // ========================================================
    // CASO 4: CARDS (.info-card, .check-item, .comp-card)
    // ========================================================
    let codeHtml = '';

    if (elem.classList.contains('info-card')) {
      const iconElem = elem.querySelector('.card-icon');
      const titleElem = elem.querySelector('.card-title');
      const descElem = elem.querySelector('.card-desc');

      titleText = titleElem ? titleElem.innerHTML : 'Destaque';
      descHtml = descElem ? descElem.innerHTML : '';

      if (iconElem) {
        iconHtml = iconElem.innerHTML;
        if (iconElem.classList.contains('blue')) theme = 'blue';
        else if (iconElem.classList.contains('emerald')) theme = 'emerald';
        else if (iconElem.classList.contains('amber')) theme = 'amber';
        else if (iconElem.classList.contains('rose')) theme = 'rose';
        else if (iconElem.classList.contains('violet')) theme = 'violet';
      }
    } else if (elem.classList.contains('check-item')) {
      const badgeElem = elem.querySelector('.check-badge');
      const strongElem = elem.querySelector('strong');
      const pElem = elem.querySelector('p');
      const isDanger = elem.classList.contains('danger-border') || (badgeElem && badgeElem.classList.contains('danger'));

      theme = isDanger ? 'rose' : 'emerald';
      titleText = strongElem ? strongElem.innerHTML : '';
      descHtml = pElem ? pElem.innerHTML : '';

      if (badgeElem) {
        iconHtml = badgeElem.innerHTML;
      } else {
        iconHtml = isDanger
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
      }
    } else if (elem.classList.contains('comp-card')) {
      const isBad = elem.classList.contains('bad');
      theme = isBad ? 'rose' : 'emerald';

      const badgeElem = elem.querySelector('.comp-badge');
      const codeElem = elem.querySelector('code');
      const pElem = elem.querySelector('p');

      titleText = badgeElem ? badgeElem.innerText.trim() : (isBad ? 'Senha Vulnerável' : 'Senha Segura');
      descHtml = pElem ? pElem.innerHTML : '';

      if (codeElem) {
        codeHtml = `<div class="zoomed-code-box ${isBad ? 'bad' : 'good'}">${codeElem.innerText}</div>`;
      }

      iconHtml = isBad
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="16 10 11 15 8 12"/></svg>';
    } else {
      titleText = elem.innerText.slice(0, 50);
      descHtml = elem.innerText.slice(50);
    }

    if (theme && theme !== 'cyan') {
      dom.cardZoomContainer.classList.add(`theme-${theme}`);
    }

    dom.cardZoomContent.innerHTML = `
      <div class="zoomed-header">
        <div class="zoomed-icon ${theme}">
          ${iconHtml}
        </div>
        <div class="zoomed-meta">
          <span class="zoomed-tag">${contextTag}</span>
          <h2 class="zoomed-title">${titleText}</h2>
        </div>
      </div>
      ${codeHtml}
      <div class="zoomed-body">
        ${descHtml}
      </div>
    `;

    dom.cardZoomModal.classList.add('open');
    dom.cardZoomModal.setAttribute('aria-hidden', 'false');
    state.isCardZoomOpen = true;
  }

  /**
   * Fecha o modal de card ampliado
   */
  function closeCardZoom() {
    if (!dom.cardZoomModal) return;
    dom.cardZoomModal.classList.remove('open');
    dom.cardZoomModal.setAttribute('aria-hidden', 'true');
    state.isCardZoomOpen = false;
  }

  /**
   * Navega para um slide específico
   */
  function goToSlide(slideNum, updateHash = true) {
    if (state.isCardZoomOpen) {
      closeCardZoom();
    }

    if (slideNum < 1) slideNum = 1;
    if (slideNum > state.totalSlides) slideNum = state.totalSlides;

    const prevIndex = state.currentSlide;
    state.currentSlide = slideNum;

    // Atualiza classes dos slides
    dom.slides.forEach((slide, idx) => {
      const num = idx + 1;
      slide.classList.remove('active', 'prev', 'next');

      if (num === slideNum) {
        slide.classList.add('active');
      } else if (num < slideNum) {
        slide.classList.add('prev');
      } else {
        slide.classList.add('next');
      }
    });

    // Atualiza Barra de Progresso
    if (dom.progressBar) {
      const progress = ((slideNum - 1) / (state.totalSlides - 1)) * 100;
      dom.progressBar.style.width = `${progress}%`;
    }

    // Atualiza Contador
    if (dom.currentNum) {
      dom.currentNum.textContent = String(slideNum).padStart(2, '0');
    }

    // Atualiza Estado dos Botões
    if (dom.prevBtn) dom.prevBtn.style.opacity = slideNum === 1 ? '0.4' : '1';
    if (dom.nextBtn) dom.nextBtn.style.opacity = slideNum === state.totalSlides ? '0.4' : '1';

    // Atualiza Dots
    const dots = document.querySelectorAll('.dock-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx + 1 === slideNum);
    });

    // Atualiza Miniaturas no Grid de Visão Geral
    const overviewCards = document.querySelectorAll('.overview-card');
    overviewCards.forEach((card, idx) => {
      card.classList.toggle('active', idx + 1 === slideNum);
    });

    // Atualiza Hash na URL
    if (updateHash) {
      history.replaceState(null, '', `#${slideNum}`);
    }
  }

  function nextSlide() {
    if (state.currentSlide < state.totalSlides) {
      goToSlide(state.currentSlide + 1);
    }
  }

  function prevSlide() {
    if (state.currentSlide > 1) {
      goToSlide(state.currentSlide - 1);
    }
  }

  /**
   * Alterna Tela Cheia
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        state.isFullscreen = true;
      }).catch(err => {
        console.warn('Erro ao ativar tela cheia:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          state.isFullscreen = false;
        });
      }
    }
  }

  /**
   * Modais
   */
  function toggleOverviewModal(force) {
    state.isOverviewOpen = typeof force === 'boolean' ? force : !state.isOverviewOpen;
    if (dom.overviewModal) {
      dom.overviewModal.classList.toggle('open', state.isOverviewOpen);
    }
    if (state.isOverviewOpen && state.isHelpOpen) {
      toggleHelpModal(false);
    }
  }

  function toggleHelpModal(force) {
    state.isHelpOpen = typeof force === 'boolean' ? force : !state.isHelpOpen;
    if (dom.helpModal) {
      dom.helpModal.classList.toggle('open', state.isHelpOpen);
    }
    if (state.isHelpOpen && state.isOverviewOpen) {
      toggleOverviewModal(false);
    }
  }

  function toggleTheme() {
    document.body.classList.toggle('light-mode');
  }

  /**
   * Registro de Eventos
   */
  function bindEvents() {
    // Botões Inferiores
    if (dom.prevBtn) dom.prevBtn.addEventListener('click', prevSlide);
    if (dom.nextBtn) dom.nextBtn.addEventListener('click', nextSlide);
    if (dom.fullscreenBtn) dom.fullscreenBtn.addEventListener('click', toggleFullscreen);
    if (dom.overviewBtn) dom.overviewBtn.addEventListener('click', () => toggleOverviewModal());
    if (dom.helpBtn) dom.helpBtn.addEventListener('click', () => toggleHelpModal());
    if (dom.themeBtn) dom.themeBtn.addEventListener('click', toggleTheme);

    // Fechar Modais
    if (dom.closeOverviewBtn) dom.closeOverviewBtn.addEventListener('click', () => toggleOverviewModal(false));
    if (dom.closeHelpBtn) dom.closeHelpBtn.addEventListener('click', () => toggleHelpModal(false));

    // Fechar ao clicar fora do conteúdo
    if (dom.overviewModal) {
      dom.overviewModal.addEventListener('click', (e) => {
        if (e.target === dom.overviewModal) toggleOverviewModal(false);
      });
    }
    if (dom.helpModal) {
      dom.helpModal.addEventListener('click', (e) => {
        if (e.target === dom.helpModal) toggleHelpModal(false);
      });
    }

    // Teclado
    window.addEventListener('keydown', handleKeyDown);

    // Suporte a Toque / Swipe
    window.addEventListener('touchstart', (e) => {
      state.touchStartX = e.changedTouches[0].screenX;
      state.touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      state.touchEndX = e.changedTouches[0].screenX;
      state.touchEndY = e.changedTouches[0].screenY;
      handleGesture();
    }, { passive: true });

    // Mudança de Hash na URL (botões avançar/voltar do navegador)
    window.addEventListener('hashchange', () => {
      const hash = parseInt(window.location.hash.replace('#', ''), 10);
      if (!isNaN(hash) && hash >= 1 && hash <= state.totalSlides && hash !== state.currentSlide) {
        goToSlide(hash, false);
      }
    });

    // Botões customizados dentro dos slides (ex: recomeçar apresentação)
    document.querySelectorAll('[data-action="restart"]').forEach(btn => {
      btn.addEventListener('click', () => goToSlide(1));
    });

    document.querySelectorAll('[data-action="overview"]').forEach(btn => {
      btn.addEventListener('click', () => toggleOverviewModal(true));
    });
  }

  function handleKeyDown(e) {
    // Se o modal de card ampliado estiver aberto
    if (state.isCardZoomOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCardZoom();
        return;
      }
      // Com um card ampliado, as setas do teclado ← → (e navegação) fecham o card e mudam de slide
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'l', 'j'].includes(e.key)) {
        e.preventDefault();
        closeCardZoom();
        nextSlide();
        return;
      }
      if (['ArrowLeft', 'ArrowUp', 'Backspace', 'PageUp', 'h', 'k'].includes(e.key)) {
        e.preventDefault();
        closeCardZoom();
        prevSlide();
        return;
      }
    }

    // Se algum modal estiver aberto, Escape fecha
    if (e.key === 'Escape') {
      if (state.isOverviewOpen) toggleOverviewModal(false);
      if (state.isHelpOpen) toggleHelpModal(false);
      return;
    }

    // Atalhos globais
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
      case 'l':
      case 'j':
        e.preventDefault();
        nextSlide();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
      case 'Backspace':
      case 'PageUp':
      case 'h':
      case 'k':
        e.preventDefault();
        prevSlide();
        break;

      case 'Home':
        e.preventDefault();
        goToSlide(1);
        break;

      case 'End':
        e.preventDefault();
        goToSlide(state.totalSlides);
        break;

      case 'f':
      case 'F':
        toggleFullscreen();
        break;

      case 'g':
      case 'G':
      case 'o':
      case 'O':
        toggleOverviewModal();
        break;

      case '?':
        toggleHelpModal();
        break;

      case 't':
      case 'T':
        toggleTheme();
        break;

      default:
        // Teclas numéricas 1 a 9 pulam direto para o slide correspondente
        if (/^[1-9]$/.test(e.key)) {
          const target = parseInt(e.key, 10);
          if (target <= state.totalSlides) {
            goToSlide(target);
          }
        }
        break;
    }
  }

  function handleGesture() {
    const diffX = state.touchEndX - state.touchStartX;
    const diffY = state.touchEndY - state.touchStartY;
    const minSwipeDistance = 45;

    // Garante que é movimento horizontal e não rolagem vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (state.isCardZoomOpen) {
        closeCardZoom();
      }
      if (diffX < 0) {
        nextSlide(); // Swipe para esquerda -> próximo slide
      } else {
        prevSlide(); // Swipe para direita -> slide anterior
      }
    }
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expõe API para console ou automação se necessário
  window.PresentationApp = {
    goToSlide,
    nextSlide,
    prevSlide,
    openCardZoom,
    closeCardZoom,
    toggleFullscreen,
    toggleOverviewModal,
    toggleTheme,
    getState: () => ({ ...state })
  };

})();
