// topbar.js — Topbar compartilhada com acessibilidade persistente
// Inclua este script em todas as páginas do candidato

(function() {
  const PAGINAS_CANDIDATO = ['home.html','vagas.html','vaga-detalhes.html','candidaturas.html','curriculo.html','addlaudo.html','acessibilidade.html','chat.html'];

  // ── Injeta estilos ──────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #topbar-global {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0 28px; height: 62px;
      background: rgba(13,59,142,0.7); backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.15);
      position: sticky; top: 0; z-index: 999; gap: 16px;
    }
    #topbar-left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    #topbar-left .tb-logo img { width: 34px; height: 34px; border-radius: 8px; object-fit: cover; }
    #topbar-left .tb-logo span { font-family: 'Sora',sans-serif; font-size: 17px; font-weight: 700; color: #fff; margin-left: 8px; }
    #topbar-center { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .tb-btn {
      background: transparent; border: 1px solid rgba(255,255,255,0.18);
      color: #fff; padding: 6px 13px; border-radius: 7px;
      font-size: 12px; font-weight: 500; cursor: pointer;
      transition: 0.2s; display: flex; align-items: center; gap: 5px;
      font-family: 'Inter', sans-serif; white-space: nowrap;
    }
    .tb-btn:hover { background: rgba(255,255,255,0.1); }
    .tb-btn.active { background: rgba(244,124,32,0.2); border-color: rgba(244,124,32,0.5); color: #f47c20; }
    #topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; position: relative; }
    #tb-notif-panel {
      display: none; position: absolute; top: 52px; right: 0; width: 320px;
      background: #0f3d99; border: 1px solid rgba(255,255,255,0.18);
      border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.35);
      z-index: 9999; overflow: hidden;
    }
    #tb-notif-panel .panel-header {
      padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex; justify-content: space-between; align-items: center;
    }
    #tb-notif-panel .panel-header span { font-family:'Sora',sans-serif; font-size:13px; font-weight:700; color:#fff; }
    #tb-notif-panel .panel-header button { background:transparent; border:none; color:rgba(255,255,255,0.5); font-size:11px; cursor:pointer; }
    .notif-item { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.07); font-size:13px; color:#fff; line-height:1.5; transition:0.2s; }
    .notif-item:hover { background: rgba(255,255,255,0.07); }
    .notif-item p { margin-bottom:3px; }
    .notif-item small { font-size:11px; color:rgba(255,255,255,0.4); }
    .notif-empty { padding:20px; text-align:center; font-size:13px; color:rgba(255,255,255,0.4); }
    #tb-badge { display:none; position:absolute; top:-6px; right:-6px; background:#ef4444; color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:20px; min-width:18px; text-align:center; }
    /* CURSOR AMPLIADO */
    body.ac-cursor * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='8' cy='8' r='7' fill='white' stroke='black' stroke-width='2'/%3E%3C/svg%3E") 8 8, auto !important; }
    /* FOCO VISÍVEL */
    body.ac-teclado *:focus { outline: 3px solid #f47c20 !important; outline-offset: 3px !important; }
    @media(max-width:700px){ #topbar-center { display:none; } }
  `;
  document.head.appendChild(style);

  // ── Injeta cursor style tag ──────────────────────────────────────
  const cursorStyle = document.createElement('style');
  cursorStyle.id = 'tb-cursor-style';
  document.head.appendChild(cursorStyle);

  const tecladoStyle = document.createElement('style');
  tecladoStyle.id = 'tb-teclado-style';
  document.head.appendChild(tecladoStyle);

  // ── Renderiza topbar ─────────────────────────────────────────────
  function render() {
    const topbar = document.createElement('div');
    topbar.id = 'topbar-global';
    topbar.innerHTML = `
      <div id="topbar-left">
        <a href="home.html" class="tb-logo" style="display:flex;align-items:center;text-decoration:none">
          <img src="logo.png.jpeg" alt="Inclui+">
          <span>Inclui+</span>
        </a>
      </div>

      <div id="topbar-center">
        <button class="tb-btn" id="tb-contraste" onclick="Topbar.toggleContraste()" title="Alto Contraste">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h10"/></svg>
          Contraste
        </button>
        <button class="tb-btn" id="tb-fonte" onclick="Topbar.toggleFonte()" title="Fonte ampliada">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          Fonte
        </button>
        <button class="tb-btn" id="tb-cursor" onclick="Topbar.toggleCursor()" title="Cursor ampliado">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-7 1-4 7z"/></svg>
          Cursor
        </button>
        <button class="tb-btn" id="tb-teclado" onclick="Topbar.toggleTeclado()" title="Navegação por teclado">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>
          Teclado
        </button>
        <button class="tb-btn" id="tb-vlibras" onclick="Topbar.toggleVlibras()" title="VLibras">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          VLibras
        </button>
      </div>

      <div id="topbar-right">
        <button class="tb-btn" id="tb-notif-btn" onclick="Topbar.toggleNotif()" style="position:relative">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          Notificações
          <span id="tb-badge">0</span>
        </button>
        <a href="login.html" class="tb-btn" onclick="localStorage.clear()" style="text-decoration:none">Sair</a>

        <div id="tb-notif-panel">
          <div class="panel-header">
            <span>Notificações</span>
            <button onclick="Topbar.marcarLidas()">Marcar como lidas</button>
          </div>
          <div id="tb-notif-lista"></div>
        </div>
      </div>
    `;

    // Insere no início do body
    document.body.insertBefore(topbar, document.body.firstChild);

    // Remove topbar antiga se existir
    document.querySelectorAll('.topbar').forEach(el => el.remove());
  }

  // ── Aplica preferências salvas ────────────────────────────────────
  function aplicarPreferencias() {
    if (localStorage.getItem('ac-contraste') === '1') { document.body.classList.add('high-contrast'); document.getElementById('tb-contraste')?.classList.add('active'); }
    if (localStorage.getItem('ac-fonte') === '1') { document.body.style.fontSize = '17px'; document.getElementById('tb-fonte')?.classList.add('active'); }
    if (localStorage.getItem('ac-cursor') === '1') { document.body.classList.add('ac-cursor'); document.getElementById('tb-cursor')?.classList.add('active'); }
    if (localStorage.getItem('ac-teclado') === '1') { document.body.classList.add('ac-teclado'); document.getElementById('tb-teclado')?.classList.add('active'); }
    if (localStorage.getItem('ac-vlibras') === '0') { document.querySelector('[vw-access-button]')?.style.setProperty('display','none'); }
    else { document.getElementById('tb-vlibras')?.classList.add('active'); }
  }

  // ── API pública ───────────────────────────────────────────────────
  window.Topbar = {
    toggleContraste() {
      const on = localStorage.getItem('ac-contraste') !== '1';
      document.body.classList.toggle('high-contrast', on);
      localStorage.setItem('ac-contraste', on ? '1' : '0');
      document.getElementById('tb-contraste')?.classList.toggle('active', on);
    },
    toggleFonte() {
      const on = localStorage.getItem('ac-fonte') !== '1';
      document.body.style.fontSize = on ? '17px' : '';
      localStorage.setItem('ac-fonte', on ? '1' : '0');
      document.getElementById('tb-fonte')?.classList.toggle('active', on);
    },
    toggleCursor() {
      const on = localStorage.getItem('ac-cursor') !== '1';
      document.body.classList.toggle('ac-cursor', on);
      localStorage.setItem('ac-cursor', on ? '1' : '0');
      document.getElementById('tb-cursor')?.classList.toggle('active', on);
    },
    toggleTeclado() {
      const on = localStorage.getItem('ac-teclado') !== '1';
      document.body.classList.toggle('ac-teclado', on);
      localStorage.setItem('ac-teclado', on ? '1' : '0');
      document.getElementById('tb-teclado')?.classList.toggle('active', on);
    },
    toggleVlibras() {
      const btn = document.querySelector('[vw-access-button]');
      const on = localStorage.getItem('ac-vlibras') !== '1';
      if (btn) btn.style.display = on ? '' : 'none';
      localStorage.setItem('ac-vlibras', on ? '1' : '0');
      document.getElementById('tb-vlibras')?.classList.toggle('active', on);
    },
    toggleNotif() {
      const p = document.getElementById('tb-notif-panel');
      p.style.display = p.style.display === 'none' ? 'block' : 'none';
      if (p.style.display === 'block') this.carregarNotif();
    },
    async carregarNotif() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const r = await fetch('https://inclui-plus-api.onrender.com/notificacoes', { headers: {'Authorization':'Bearer '+token} });
        const d = await r.json();
        const badge = document.getElementById('tb-badge');
        const lista = document.getElementById('tb-notif-lista');
        if (d.total > 0) { badge.style.display = 'block'; badge.textContent = d.total; }
        else { badge.style.display = 'none'; }
        lista.innerHTML = d.notificacoes.length
          ? d.notificacoes.map(n => `
            <div class="notif-item" ${n.link ? `onclick="window.location.href='${n.link}'" style="cursor:pointer"` : ''}>
              <p>${n.mensagem}</p>
              <small>${new Date(n.criado_em).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</small>
            </div>`).join('')
          : '<div class="notif-empty">Nenhuma notificação.</div>';
      } catch(e) {}
    },
    async marcarLidas() {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/notificacoes/lidas', { method:'PATCH', headers:{'Authorization':'Bearer '+token} });
      document.getElementById('tb-badge').style.display = 'none';
      document.getElementById('tb-notif-lista').innerHTML = '<div class="notif-empty">Nenhuma notificação.</div>';
    }
  };

  // Fecha painel ao clicar fora
  document.addEventListener('click', e => {
    const p = document.getElementById('tb-notif-panel');
    const btn = document.getElementById('tb-notif-btn');
    if (p && btn && !p.contains(e.target) && !btn.contains(e.target)) p.style.display = 'none';
  });

  // Inicializa
  render();
  aplicarPreferencias();

  // Carrega notificações após 1s (aguarda token estar disponível)
  setTimeout(() => Topbar.carregarNotif(), 1000);
  setInterval(() => Topbar.carregarNotif(), 30000);

})();
