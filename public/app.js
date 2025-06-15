// Variáveis globais
let filmes = [];
let usuarioLogado = null;

// Carrega dados iniciais
window.addEventListener('load', async function() {
    verificarLogin();
    await carregarFilmes();
    exibirFilmes();
    configurarBusca();
});

// Verificar se o usuário está logado
function verificarLogin() {
    const dadosUsuario = sessionStorage.getItem('usuarioLogado');
    if (dadosUsuario) {
        usuarioLogado = JSON.parse(dadosUsuario);
        atualizarInterfaceUsuario(true);
    } else {
        atualizarInterfaceUsuario(false);
    }
}

// Atualizar interface baseada no status de login
function atualizarInterfaceUsuario(logado) {
    const authContainer = document.getElementById('auth-button-container');
    const favoritosContainer = document.getElementById('favoritos-container');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');

    if (logado && usuarioLogado) {
        // Usuário logado - mostrar informações e botão de logout
        authContainer.style.display = 'none';
        favoritosContainer.style.display = 'block';
        userInfo.style.display = 'block';
        userName.textContent = usuarioLogado.nome;
    } else {
        // Usuário não logado - mostrar botão de login
        authContainer.style.display = 'block';
        favoritosContainer.style.display = 'none';
        userInfo.style.display = 'none';
    }
}

// Função de logout
function logout() {
    sessionStorage.removeItem('usuarioLogado');
    usuarioLogado = null;
    atualizarInterfaceUsuario(false);
    exibirFilmes(); // Recarregar filmes sem ícones de favorito
    alert('Logout realizado com sucesso!');
}

// Carregar filmes da API
async function carregarFilmes() {
    try {
        const response = await fetch('http://localhost:3000/filmes');
        filmes = await response.json();
    } catch (error) {
        console.error('Erro ao carregar filmes:', error);
        alert('Erro ao carregar filmes. Verifique se o servidor está rodando.');
    }
}

// Exibir filmes na tela
function exibirFilmes(listaFilmes = filmes) {
    const container = document.getElementById('filmes-container');
    container.innerHTML = '';

    listaFilmes.forEach(filme => {
        const isFavorito = usuarioLogado && usuarioLogado.favoritos.includes(filme.id);
        const iconeFavorito = usuarioLogado ? 
            (isFavorito ? '❤️' : '🤍') : '';

        const card = `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${filme.imagem}" class="card-img-top" alt="${filme.titulo}" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title">${filme.titulo}</h5>
                            ${usuarioLogado ? `<button class="btn btn-sm btn-link p-0" onclick="toggleFavorito(${filme.id})" style="font-size: 1.2em;">${iconeFavorito}</button>` : ''}
                        </div>
                        <p class="card-text flex-grow-1">${filme.descricao}</p>
                        <div class="mt-auto">
                            <small class="text-muted">
                                👁️ ${filme.visualizacoes} | ⏱️ ${filme.tempo} | ⭐ ${filme.nota}
                            </small>
                            <div class="mt-2">
                                <button class="btn btn-primary btn-sm me-2" onclick="verDetalhes('${filme.id}')">
                                    Ver Detalhes
                                </button>
                                <button class="btn btn-warning btn-sm me-2" onclick="editarFilme('${filme.id}')">
                                    Editar
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="excluirFilme('${filme.id}')">
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Toggle favorito
async function toggleFavorito(filmeId) {
    if (!usuarioLogado) {
        alert('Você precisa estar logado para adicionar favoritos!');
        return;
    }

    try {
        const isFavorito = usuarioLogado.favoritos.includes(filmeId);

        if (isFavorito) {
            // Remover dos favoritos
            usuarioLogado.favoritos = usuarioLogado.favoritos.filter(id => id !== filmeId);
        } else {
            // Adicionar aos favoritos
            usuarioLogado.favoritos.push(filmeId);
        }

        // Atualizar no servidor
        const response = await fetch(`http://localhost:3000/usuarios/${usuarioLogado.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: usuarioLogado.nome,
                email: usuarioLogado.email,
                senha: usuarioLogado.senha, // Nota: em produção, não envie a senha
                favoritos: usuarioLogado.favoritos
            })
        });

        if (response.ok) {
            // Atualizar sessionStorage
            sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
            // Recarregar a exibição
            exibirFilmes();
        } else {
            alert('Erro ao atualizar favoritos');
        }

    } catch (error) {
        console.error('Erro ao toggle favorito:', error);
        alert('Erro ao atualizar favoritos');
    }
}

// Mostrar apenas favoritos
function mostrarFavoritos() {
    if (!usuarioLogado || usuarioLogado.favoritos.length === 0) {
        alert('Você não tem filmes favoritos ainda!');
        return;
    }

    const filmesFavoritos = filmes.filter(filme => usuarioLogado.favoritos.includes(filme.id));
    exibirFilmes(filmesFavoritos);
}

// Configurar busca
function configurarBusca() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function(e) {
        const termo = e.target.value.toLowerCase();
        const filmesFiltrados = filmes.filter(filme => 
            filme.titulo.toLowerCase().includes(termo) ||
            filme.genero.toLowerCase().includes(termo) ||
            filme.descricao.toLowerCase().includes(termo)
        );
        exibirFilmes(filmesFiltrados);
    });
}

// Resto das funções CRUD permanecem as mesmas...

// Ver detalhes do filme
function verDetalhes(id) {
    window.location.href = `detalhes.html?id=${id}`;
}

// Configurar modal e formulário
document.addEventListener('DOMContentLoaded', function() {
    const btnAdd = document.getElementById('btnAdd');
    const formFilme = document.getElementById('formFilme');
    const modalFilme = new bootstrap.Modal(document.getElementById('modalFilme'));

    if (btnAdd) {
        btnAdd.addEventListener('click', function() {
            limparFormulario();
            document.getElementById('modalFilmeLabel').textContent = 'Adicionar Filme';
            modalFilme.show();
        });
    }

    if (formFilme) {
        formFilme.addEventListener('submit', async function(e) {
            e.preventDefault();
            await salvarFilme();
            modalFilme.hide();
        });
    }
});

// Limpar formulário
function limparFormulario() {
    document.getElementById('filmeId').value = '';
    document.getElementById('titulo').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('imagem').value = '';
    document.getElementById('visualizacoes').value = '';
    document.getElementById('tempo').value = '';
    document.getElementById('genero').value = '';
    document.getElementById('ano').value = '';
    document.getElementById('nota').value = '';
}

// Editar filme
async function editarFilme(id) {
    try {
        const response = await fetch(`http://localhost:3000/filmes/${id}`);
        const filme = await response.json();

        document.getElementById('filmeId').value = filme.id;
        document.getElementById('titulo').value = filme.titulo;
        document.getElementById('descricao').value = filme.descricao;
        document.getElementById('imagem').value = filme.imagem;
        document.getElementById('visualizacoes').value = filme.visualizacoes;
        document.getElementById('tempo').value = filme.tempo;
        document.getElementById('genero').value = filme.genero;
        document.getElementById('ano').value = filme.ano;
        document.getElementById('nota').value = filme.nota;

        document.getElementById('modalFilmeLabel').textContent = 'Editar Filme';
        const modalFilme = new bootstrap.Modal(document.getElementById('modalFilme'));
        modalFilme.show();
    } catch (error) {
        console.error('Erro ao carregar filme:', error);
        alert('Erro ao carregar dados do filme');
    }
}

// Salvar filme (criar ou editar)
async function salvarFilme() {
    const id = document.getElementById('filmeId').value;
    const filme = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        imagem: document.getElementById('imagem').value,
        visualizacoes: document.getElementById('visualizacoes').value,
        tempo: document.getElementById('tempo').value,
        genero: document.getElementById('genero').value,
        ano: parseInt(document.getElementById('ano').value),
        nota: parseFloat(document.getElementById('nota').value)
    };

    try {
        let response;
        if (id) {
            // Editar filme existente
            filme.id = parseInt(id);
            response = await fetch(`http://localhost:3000/filmes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filme)
            });
        } else {
            // Criar novo filme
            response = await fetch('http://localhost:3000/filmes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filme)
            });
        }

        if (response.ok) {
            await carregarFilmes();
            exibirFilmes();
            alert(id ? 'Filme atualizado com sucesso!' : 'Filme adicionado com sucesso!');
        } else {
            alert('Erro ao salvar filme');
        }
    } catch (error) {
        console.error('Erro ao salvar filme:', error);
        alert('Erro ao salvar filme');
    }
}

// Excluir filme
async function excluirFilme(id) {
    if (!confirm('Tem certeza que deseja excluir este filme?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/filmes/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await carregarFilmes();
            exibirFilmes();
            alert('Filme excluído com sucesso!');
        } else {
            alert('Erro ao excluir filme');
        }
    } catch (error) {
        console.error('Erro ao excluir filme:', error);
        alert('Erro ao excluir filme');
    }
}