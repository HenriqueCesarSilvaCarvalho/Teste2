
// Função para gerar os cards dinamicamente
function gerarCards(filmes, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Limpa conteúdo anterior
    filmes.forEach(filme => {
        container.innerHTML += `
            <div class="col-md-6 col-12 col-xl-2">
                <article class="movie">
                    <a href="${filme.link}" target="_blank">
                        <img src="${filme.imagem}" alt="Movie Poster" style="width: 100%; height: 280px; object-fit: cover; border-radius: 10px;">
                        <h3>${filme.titulo}</h3>
                        <p>${filme.visualizacoes} | ${filme.tempo}</p>
                    </a>
                </article>
            </div>
        `;
    });
}

// Função para buscar os dados da API
function fetchFilmes() {
    fetch('http://localhost:3000/filmes') // URL da API
        .then(response => response.json())
        .then(data => {
            // Agora que os filmes foram carregados, passamos para a função de gerar os cards
            gerarCards(data.slice(0, 3), "recommended-container");
            gerarCards(data.slice(1), "recently-uploaded-container");
        })
        .catch(error => {
            console.error("Erro ao buscar os dados da API:", error);
        });
}

// Ao carregar a página, chama a função de fetch para pegar os filmes da API
window.onload = function () {
    fetchFilmes();
};

const apiURL = 'http://localhost:3000/filmes';

const filmesContainer = document.getElementById('filmes-container');
const btnAdd = document.getElementById('btnAdd');
const modalFilme = new bootstrap.Modal(document.getElementById('modalFilme'));
const formFilme = document.getElementById('formFilme');

let editId = null;

// Carrega filmes do JSON Server
async function loadFilmes() {
  filmesContainer.innerHTML = 'Carregando...';
  try {
    const res = await fetch(apiURL);
    const filmes = await res.json();

    filmesContainer.innerHTML = '';
    filmes.forEach(filme => {
      filmesContainer.innerHTML += `
        <div class="col-md-3 mb-4">
          <div class="card h-100">
            <img src="${filme.imagem}" class="card-img-top" alt="${filme.titulo}" />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${filme.titulo}</h5>
              <p class="card-text"><strong>Gênero:</strong> ${filme.genero}</p>
              <p class="card-text"><strong>Ano:</strong> ${filme.ano}</p>
              <p class="card-text"><strong>Nota:</strong> ${filme.nota}</p>
              <p class="card-text"><strong>Visualizações:</strong> ${filme.visualizacoes}</p>
              <p class="card-text"><strong>Tempo:</strong> ${filme.tempo}</p>
              <a href="detalhes.html?id=${filme.id}" class="btn btn-primary mt-auto">Detalhes</a>
              <button class="btn btn-warning mt-2 btnEdit" data-id="${filme.id}">Editar</button>
              <button class="btn btn-danger mt-2 btnDelete" data-id="${filme.id}">Excluir</button>
            </div>
          </div>
        </div>
      `;
    });

    // Eventos dos botões editar e excluir
    document.querySelectorAll('.btnEdit').forEach(btn => {
      btn.onclick = e => {
        editId = e.target.dataset.id;
        openEditModal(editId);
      };
    });
    document.querySelectorAll('.btnDelete').forEach(btn => {
      btn.onclick = e => {
        const id = e.target.dataset.id;
        if (confirm('Quer mesmo excluir esse filme?')) {
          deleteFilme(id);
        }
      };
    });

  } catch (error) {
    filmesContainer.innerHTML = 'Erro ao carregar filmes.';
    console.error(error);
  }
}

// Abrir modal para criar novo filme
btnAdd.onclick = () => {
  editId = null;
  formFilme.reset();
  document.getElementById('modalFilmeLabel').textContent = 'Adicionar Filme';
  modalFilme.show();
};

// Abrir modal para editar filme
async function openEditModal(id) {
  try {
    const res = await fetch(`${apiURL}/${id}`);
    const filme = await res.json();
    document.getElementById('modalFilmeLabel').textContent = 'Editar Filme';
    document.getElementById('filmeId').value = filme.id;
    document.getElementById('titulo').value = filme.titulo;
    document.getElementById('imagem').value = filme.imagem;
    document.getElementById('visualizacoes').value = filme.visualizacoes;
    document.getElementById('tempo').value = filme.tempo;
    document.getElementById('genero').value = filme.genero;
    document.getElementById('ano').value = filme.ano;
    document.getElementById('nota').value = filme.nota;
    modalFilme.show();
  } catch (error) {
    alert('Erro ao carregar dados do filme');
  }
}

// Criar ou atualizar filme
formFilme.onsubmit = async e => {
  e.preventDefault();

  const filmeData = {
    titulo: document.getElementById('titulo').value,
    imagem: document.getElementById('imagem').value,
    visualizacoes: document.getElementById('visualizacoes').value,
    tempo: document.getElementById('tempo').value,
    genero: document.getElementById('genero').value,
    ano: parseInt(document.getElementById('ano').value),
    nota: parseFloat(document.getElementById('nota').value),
  };

  try {
    if (editId) {
      // Update
      await fetch(`${apiURL}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filmeData),
      });
      alert('Filme atualizado com sucesso!');
    } else {
      // Create
      await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filmeData),
      });
      alert('Filme criado com sucesso!');
    }
    modalFilme.hide();
    loadFilmes();
  } catch (error) {
    alert('Erro ao salvar filme.');
    console.error(error);
  }
};

// Deletar filme
async function deleteFilme(id) {
  try {
    await fetch(`${apiURL}/${id}`, { method: 'DELETE' });
    alert('Filme deletado com sucesso!');
    loadFilmes();
  } catch (error) {
    alert('Erro ao deletar filme.');
  }
}

// Inicializar lista
loadFilmes();

// Busca simples
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
  const filtro = searchInput.value.toLowerCase();
  document.querySelectorAll('#filmes-container .card').forEach(card => {
    const titulo = card.querySelector('h5').textContent.toLowerCase();
    card.parentElement.style.display = titulo.includes(filtro) ? '' : 'none';
  });
});
