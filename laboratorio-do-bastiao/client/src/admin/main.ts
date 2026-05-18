import { renderAgentes } from './pages/agentes.js';
import { renderTarefas } from './pages/tarefas.js';
import { renderReunioes } from './pages/reunioes.js';
import { renderRelatorios } from './pages/relatorios.js';

type PageId = 'agentes' | 'tarefas' | 'reunioes' | 'relatorios';

const PAGES: Record<PageId, () => Promise<void>> = {
  agentes:   renderAgentes,
  tarefas:   renderTarefas,
  reunioes:  renderReunioes,
  relatorios: renderRelatorios,
};

let currentPage: PageId = 'agentes';

function setPage(id: PageId): void {
  currentPage = id;

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', (btn as HTMLButtonElement).dataset.page === id);
  });

  void PAGES[id]();
}

document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => setPage((btn as HTMLButtonElement).dataset.page as PageId));
});

// Hash routing
function applyHash(): void {
  const hash = window.location.hash.slice(1) as PageId;
  if (hash && hash in PAGES) setPage(hash);
  else setPage('agentes');
}

window.addEventListener('hashchange', applyHash);
applyHash();
