// Sistema de toasts — inclua este script em todas as páginas
// Uso: Toast.show('Mensagem', 'success' | 'error' | 'info' | 'warning')

const Toast = (() => {
  let container;

  function init() {
    if (document.getElementById('toast-container')) return;
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      display: flex; flex-direction: column; gap: 10px; pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  function show(mensagem, tipo = 'info', duracao = 3500) {
    init();
    const cores = {
      success: { bg: '#22c55e', icon: '✓' },
      error:   { bg: '#ef4444', icon: '✕' },
      warning: { bg: '#f59e0b', icon: '⚠' },
      info:    { bg: '#3b82f6', icon: 'ℹ' }
    };
    const { bg, icon } = cores[tipo] || cores.info;

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${bg}; color: white; padding: 12px 18px;
      border-radius: 10px; font-family: Inter, sans-serif; font-size: 14px;
      font-weight: 500; display: flex; align-items: center; gap: 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25); pointer-events: all;
      max-width: 340px; animation: slideIn 0.3s ease;
      opacity: 1; transition: opacity 0.3s ease;
    `;
    toast.innerHTML = `<span style="font-weight:700;font-size:16px">${icon}</span>${mensagem}`;

    const style = document.createElement('style');
    style.textContent = `@keyframes slideIn { from { transform: translateX(120%); opacity:0; } to { transform: translateX(0); opacity:1; } }`;
    if (!document.getElementById('toast-style')) { style.id = 'toast-style'; document.head.appendChild(style); }

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duracao);
  }

  return { show };
})();
