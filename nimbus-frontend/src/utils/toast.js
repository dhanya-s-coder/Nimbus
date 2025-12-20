/**
 * Simple Toast Notification Utility
 * No external dependencies required
 */

class Toast {
  constructor() {
    this.toasts = [];
    this.toastId = 0;
    this.initializeStyles();
  }

  initializeStyles() {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        pointer-events: none;
      }

      .toast {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 16px 20px;
        margin-bottom: 12px;
        min-width: 300px;
        max-width: 400px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
        pointer-events: auto;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
      }

      .toast.success {
        border-left: 4px solid #10B981;
        background-color: #ECFDF5;
        color: #065F46;
      }

      .toast.success .toast-icon {
        color: #10B981;
        font-weight: bold;
        font-size: 18px;
      }

      .toast.error {
        border-left: 4px solid #EF4444;
        background-color: #FEE2E2;
        color: #991B1B;
      }

      .toast.error .toast-icon {
        color: #EF4444;
        font-weight: bold;
        font-size: 18px;
      }

      .toast.warning {
        border-left: 4px solid #F59E0B;
        background-color: #FFFBEB;
        color: #92400E;
      }

      .toast.warning .toast-icon {
        color: #F59E0B;
        font-weight: bold;
        font-size: 18px;
      }

      .toast.info {
        border-left: 4px solid #3B82F6;
        background-color: #EFF6FF;
        color: #1E40AF;
      }

      .toast.info .toast-icon {
        color: #3B82F6;
        font-weight: bold;
        font-size: 18px;
      }

      .toast-content {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .toast-message {
        margin: 0;
        line-height: 1.5;
      }

      .toast-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #6B7280;
        font-size: 18px;
        padding: 0;
        align-self: flex-start;
        transition: color 0.2s;
      }

      .toast-close:hover {
        color: #374151;
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }

      .toast.removing {
        animation: slideOut 0.3s ease-out forwards;
      }

      @media (max-width: 768px) {
        .toast-container {
          left: 10px;
          right: 10px;
          top: 10px;
        }

        .toast {
          min-width: auto;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  getContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  show(message, type = 'info', duration = 3000) {
    const toastId = this.toastId++;
    const container = this.getContainer();

    const toastEl = document.createElement('div');
    toastEl.className = `toast ${type}`;
    toastEl.id = `toast-${toastId}`;

    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toastEl.innerHTML = `
      <span class="toast-icon">${iconMap[type]}</span>
      <div class="toast-content">
        <p class="toast-message">${this.escapeHtml(message)}</p>
      </div>
      <button class="toast-close" aria-label="Close notification">×</button>
    `;

    const closeBtn = toastEl.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toastId));

    container.appendChild(toastEl);
    this.toasts.push({ id: toastId, element: toastEl });

    if (duration > 0) {
      setTimeout(() => this.remove(toastId), duration);
    }

    return toastId;
  }

  remove(toastId) {
    const toast = document.getElementById(`toast-${toastId}`);
    if (toast) {
      toast.classList.add('removing');
      setTimeout(() => {
        toast.remove();
        this.toasts = this.toasts.filter(t => t.id !== toastId);
      }, 300);
    }
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 3000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export const toast = new Toast();
