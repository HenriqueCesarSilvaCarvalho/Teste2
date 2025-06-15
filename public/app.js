/*****************  CARDS “RECOMMENDED / RECENTLY”  *****************/
function gerarCards(filmes, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  filmes.forEach(filme => {
    container.innerHTML += `
      <div class="col-md-6 col-12 col-xl-2">
        <article class="movie">
          <a href="detalhes.html?id=${filme.id}">
            <img src="${filme.imagem}"
                 alt="Poster"
                 style="width:100%;height:280px;object-fit:cover;border-radius:10px;">
            <h3>${filme.titulo}</h3>
            <p>${filme.visualizacoes} | ${filme.tempo}</p>
          </a>
        </article>
      </div>`;
  });
}

function fetchFilmes() {
  fetch('http://localhost:3000/filmes')
    .then(r => r.json())
    .then(data => {
      gerarCards(data.slice(0, 3), 'recommended-container');
      gerarCards(data.slice(1),     'recently-uploaded-container');
    })
    .catch(err => console.error('Erro API:', err));
}
window.onload = fetchFilmes;

/*****************  CRUD MAIN GRID  *****************/
const apiURL      = 'http://localhost:3000/filmes';
const filmesGrid  = document.getElementById('filmes-container');
const btnAdd      = document.getElementById('btnAdd');
const modalFilme  = new bootstrap.Modal(document.getElementById('modalFilme'));
const formFilme   = document.getElementById('formFilme');
let   filmesCache = [];   // lista completa em memória
let   editId      = null;

/* ---------- Render helper ---------- */
function renderFilmes(lista) {
  filmesGrid.innerHTML = '';
  lista.forEach(f => {
    filmesGrid.innerHTML += `
      <div class="col-md-3 mb-4">
        <div class="card h-100">
          <img src="${f.imagem}" class="card-img-top" alt="${f.titulo}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${f.titulo}</h5>

            <!-- descrição escondida para busca -->
            <p class="descricao d-none">${f.descricao || ''}</p>

            <p class="card-text"><strong>Gênero:</strong> ${f.genero}</p>
            <p class="card-text"><strong>Ano:</strong> ${f.ano}</p>
            <p class="card-text"><strong>Nota:</strong> ${f.nota}</p>
            <p class="card-text"><strong>Visualizações:</strong> ${f.visualizacoes}</p>
            <p class="card-text"><strong>Tempo:</strong> ${f.tempo}</p>

            <a href="detalhes.html?id=${f.id}" class="btn btn-primary mt-auto">Detalhes</a>
            <button class="btn btn-warning mt-2 btnEdit" data-id="${f.id}">Editar</button>
            <button class="btn btn-danger  mt-2 btnDelete" data-id="${f.id}">Excluir</button>
          </div>
        </div>
      </div>`;
  });

  document.querySelectorAll('.btnEdit').forEach(b =>
    b.onclick = () => openEditModal(b.dataset.id));
  document.querySelectorAll('.btnDelete').forEach(b =>
    b.onclick = () => deleteFilme(b.dataset.id));
}

/* ---------- Load grid ---------- */
async function loadFilmes() {
  filmesGrid.innerHTML = 'Carregando...';
  try {
    const res   = await fetch(apiURL);
    filmesCache = await res.json();
    renderFilmes(filmesCache);
  } catch (e) {
    filmesGrid.innerHTML = 'Erro ao carregar filmes.';
    console.error(e);
  }
}
loadFilmes();

/* ---------- Search ---------- */
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
  const termo = searchInput.value.trim().toLowerCase();
  if (!termo) return renderFilmes(filmesCache);

  const filtrados = filmesCache.filter(f =>
    f.titulo.toLowerCase().includes(termo) ||
    (f.descricao && f.descricao.toLowerCase().includes(termo))
  );
  renderFilmes(filtrados);
});

/* ---------- Modal handlers ---------- */
btnAdd.onclick = () => {
  editId = null;
  formFilme.reset();
  document.getElementById('modalFilmeLabel').textContent = 'Adicionar Filme';
  modalFilme.show();
};

async function openEditModal(id) {
  editId = id;
  try {
    const res   = await fetch(`${apiURL}/${id}`);
    const filme = await res.json();

    document.getElementById('modalFilmeLabel').textContent = 'Editar Filme';
    document.getElementById('titulo').value        = filme.titulo;
    document.getElementById('descricao').value     = filme.descricao || '';
    document.getElementById('imagem').value        = filme.imagem;
    document.getElementById('visualizacoes').value = filme.visualizacoes;
    document.getElementById('tempo').value         = filme.tempo;
    document.getElementById('genero').value        = filme.genero;
    document.getElementById('ano').value           = filme.ano;
    document.getElementById('nota').value          = filme.nota;

    modalFilme.show();
  } catch {
    alert('Erro ao carregar dados do filme.');
  }
}

/* ---------- Submit (create/update) ---------- */
formFilme.onsubmit = async e => {
  e.preventDefault();

  const filmeData = {
    titulo:        document.getElementById('titulo').value,
    descricao:     document.getElementById('descricao').value,
    imagem:        document.getElementById('imagem').value,
    visualizacoes: document.getElementById('visualizacoes').value,
    tempo:         document.getElementById('tempo').value,
    genero:        document.getElementById('genero').value,
    ano:           parseInt(document.getElementById('ano').value),
    nota:          parseFloat(document.getElementById('nota').value)
  };

  try {
    if (editId) {
      await fetch(`${apiURL}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify(filmeData)
      });
    } else {
      await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify(filmeData)
      });
    }
    modalFilme.hide();
    loadFilmes();
  } catch (err) {
    alert('Erro ao salvar filme.');
    console.error(err);
  }
};

/* ---------- Delete ---------- */
async function deleteFilme(id) {
  if (!confirm('Quer mesmo excluir?')) return;
  await fetch(`${apiURL}/${id}`, { method: 'DELETE' });
  loadFilmes();
}
