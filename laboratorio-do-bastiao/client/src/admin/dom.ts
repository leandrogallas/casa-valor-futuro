export function $main(): HTMLElement {
  return document.getElementById('main') as HTMLElement;
}

// ── Simple modal ─────────────────────────────────────────────────────────

type ConfirmHandler = () => Promise<boolean>;
let pendingConfirm: ConfirmHandler | null = null;

export function showModal(
  titulo: string,
  bodyHtml: string,
  onConfirm: ConfirmHandler,
  confirmLabel = 'Salvar',
): void {
  pendingConfirm = onConfirm;

  (document.getElementById('modal-title') as HTMLElement).textContent = titulo;
  (document.getElementById('modal-body') as HTMLElement).innerHTML = bodyHtml;
  (document.getElementById('modal-confirm') as HTMLButtonElement).textContent = confirmLabel;
  (document.getElementById('modal-overlay') as HTMLElement).classList.add('open');

  const confirmBtn = document.getElementById('modal-confirm')!.cloneNode(true) as HTMLButtonElement;
  const cancelBtn  = document.getElementById('modal-cancel')!.cloneNode(true)  as HTMLButtonElement;

  document.getElementById('modal-confirm')!.replaceWith(confirmBtn);
  document.getElementById('modal-cancel')!.replaceWith(cancelBtn);

  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    const ok = await (pendingConfirm?.() ?? Promise.resolve(true));
    confirmBtn.disabled = false;
    if (ok) hideModal();
  });

  cancelBtn.addEventListener('click', hideModal);

  document.getElementById('modal-overlay')!.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) hideModal();
  }, { once: true });
}

export function hideModal(): void {
  (document.getElementById('modal-overlay') as HTMLElement).classList.remove('open');
  pendingConfirm = null;
}

export function showFeedback(containerId: string, msg: string, ok: boolean): void {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="msg ${ok ? 'msg-ok' : 'msg-err'}">${msg}</div>`;
}

// ── Wizard modal ─────────────────────────────────────────────────────────

export interface WizardStep {
  title: string;
  icon: string;
  render: () => string;
  validate?: () => string | null; // returns error msg or null if valid
}

export function showWizard(
  steps: WizardStep[],
  onFinish: () => Promise<boolean>,
): void {
  let step = 0;

  function stepIndicators(): string {
    return steps.map((s, i) => {
      const state = i < step ? 'done' : i === step ? 'active' : 'pending';
      return `
        <div class="wz-step ${state}">
          <div class="wz-step-dot">${i < step ? '✓' : i + 1}</div>
          <div class="wz-step-label">${s.title}</div>
        </div>
        ${i < steps.length - 1 ? '<div class="wz-connector"></div>' : ''}
      `;
    }).join('');
  }

  function render(): void {
    const s = steps[step];
    const isLast = step === steps.length - 1;
    const isFirst = step === 0;

    const html = `
      <style>
        .wz-header { margin-bottom: 24px; }
        .wz-steps  { display: flex; align-items: center; gap: 0; margin-bottom: 28px; }
        .wz-step   { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
        .wz-step-dot {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          border: 2px solid var(--border);
          background: var(--surface);
          color: var(--muted);
          transition: all 0.2s;
        }
        .wz-step.active .wz-step-dot  { border-color: var(--accent); background: var(--accent); color: #fff; }
        .wz-step.done .wz-step-dot    { border-color: var(--accent2); background: var(--accent2); color: #fff; }
        .wz-step-label { font-size: 10px; color: var(--muted); white-space: nowrap; }
        .wz-step.active .wz-step-label { color: var(--accent); }
        .wz-step.done .wz-step-label   { color: var(--accent2); }
        .wz-connector { flex: 1; height: 2px; background: var(--border); min-width: 16px; margin-bottom: 20px; }
        .wz-title { font-size: 18px; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
        .wz-sub   { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
        .wz-body  { min-height: 240px; }
        .wz-nav   { display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid var(--border); margin-top: 20px; }
        .wz-err   { color: var(--danger); font-size: 12px; margin-top: 8px; min-height: 18px; }
      </style>
      <div class="wz-header">
        <div class="wz-steps">${stepIndicators()}</div>
        <div class="wz-title">${s.icon} ${s.title}</div>
      </div>
      <div class="wz-body">${s.render()}</div>
      <div class="wz-err" id="wz-err"></div>
      <div class="wz-nav">
        <button class="btn btn-sm" id="wz-back" ${isFirst ? 'style="visibility:hidden"' : ''}>← Voltar</button>
        <span style="font-size:11px;color:var(--muted)">${step + 1} / ${steps.length}</span>
        <button class="btn btn-primary btn-sm" id="wz-next">
          ${isLast ? '✓ Criar Agente' : 'Avançar →'}
        </button>
      </div>
    `;

    (document.getElementById('modal-body') as HTMLElement).innerHTML = html;
    // Hide default footer buttons — wizard has its own nav
    const confirm = document.getElementById('modal-confirm') as HTMLElement;
    const cancel  = document.getElementById('modal-cancel')  as HTMLElement;
    if (confirm) confirm.style.display = 'none';
    if (cancel)  cancel.style.display  = 'none';

    document.getElementById('wz-back')?.addEventListener('click', () => {
      if (step > 0) { step--; render(); }
    });

    document.getElementById('wz-next')?.addEventListener('click', async () => {
      const errEl = document.getElementById('wz-err') as HTMLElement;
      errEl.textContent = '';

      const err = steps[step].validate?.();
      if (err) { errEl.textContent = err; return; }

      if (step < steps.length - 1) {
        step++;
        render();
      } else {
        const btn = document.getElementById('wz-next') as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = 'Criando...';
        try {
          const ok = await onFinish();
          if (ok) hideModal();
          else { errEl.textContent = 'Erro ao criar agente.'; btn.disabled = false; btn.textContent = '✓ Criar Agente'; }
        } catch (e) {
          errEl.textContent = String(e);
          btn.disabled = false;
          btn.textContent = '✓ Criar Agente';
        }
      }
    });
  }

  // Override title
  (document.getElementById('modal-title') as HTMLElement).textContent = 'Novo Agente';
  (document.getElementById('modal-overlay') as HTMLElement).classList.add('open');

  // Allow clicking overlay to close
  document.getElementById('modal-overlay')!.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) hideModal();
  }, { once: true });

  render();
}
