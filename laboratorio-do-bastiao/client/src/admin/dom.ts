export function $main(): HTMLElement {
  return document.getElementById('main') as HTMLElement;
}

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

  // Re-attach listeners (overwrite previous)
  const confirmBtn = document.getElementById('modal-confirm')!.cloneNode(true) as HTMLButtonElement;
  const cancelBtn = document.getElementById('modal-cancel')!.cloneNode(true) as HTMLButtonElement;

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
