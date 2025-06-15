// Sistema de Autenticação
class AuthManager {
    constructor() {
        this.apiURL = 'http://localhost:3000/usuarios';
        this.init();
    }

    init() {
        this.updateNavbar();
        this.updateMovieCards();
    }

    // Verificar se usuário está logado
    isLoggedIn() {
        return sessionStorage.getItem('usuarioLogado') !== null;
    }

    // Obter usuário logado
    getLoggedUser() {
        const userData = sessionStorage.getItem('usuarioLogado');
        return userData ? JSON.parse(userData) : null;
    }

    // Fazer logout
    logout() {
        sessionStorage.removeItem('usuarioLogado');
        window.location.reload();
    }

    // Atualizar navbar baseado no status de login
    updateNavbar() {
        const navbar = document.querySelector('.navbar-nav');
        if (!navbar) return;

        const authSection = navbar.querySelector('#auth-section') || document.createElement('div');
        authSection.id = 'auth-section';

        if (this.isLoggedIn()) {
            const user = this.getLoggedUser();
            authSection.innerHTML = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user"></i> ${user.nome}
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" id="favoritosLink"><i class="fas fa-heart"></i> Favoritos</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
                    </ul>
                </li>
            `;

            // Adicionar event listeners
            authSection.querySelector('#logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });

            authSection.querySelector('#favoritosLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.showFavorites();
            });
        } else {
            authSection.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="cadastro.html"><i class="fas fa-user-plus"></i> Cadastro</a>
                </li>
            `;
        }

        if (!navbar.contains(authSection)) {
            navbar.appendChild(authSection);
        }
    }

    // Atualizar cards de filmes com ícones de favoritos
    updateMovieCards() {
        if (!this.isLoggedIn()) return;

        const user = this.getLoggedUser();
        const favoritos = user.favoritos || [];

        // Aguardar um pouco para os cards serem renderizados
        setTimeout(() => {
            const movieCards = document.querySelectorAll('.movie, .card');
            movieCards.forEach(card => {
                const link = card.querySelector('a[href*="detalhes.html"]');
                if (link) {
                    const urlParams = new URLSearchParams(link.href.split('?')[1]);
                    const movieId = urlParams.get('id');

                    if (movieId) {
                        const isFavorite = favoritos.includes(movieId);
                        this.addFavoriteButton(card, movieId, isFavorite);
                    }
                }
            });
        }, 100);
    }

    // Adicionar botão de favorito ao card
    addFavoriteButton(card, movieId, isFavorite) {
        // Remover botão existente se houver
        const existingBtn = card.querySelector('.favorite-btn');
        if (existingBtn) existingBtn.remove();

        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        favoriteBtn.innerHTML = isFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        favoriteBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.9);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            color: ${isFavorite ? '#e74c3c' : '#666'};
            font-size: 18px;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10;
        `;

        favoriteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleFavorite(movieId, favoriteBtn);
        });

        // Posicionar o card como relative se não estiver
        if (getComputedStyle(card).position === 'static') {
            card.style.position = 'relative';
        }

        card.appendChild(favoriteBtn);
    }

    // Alternar favorito
    async toggleFavorite(movieId, button) {
        const user = this.getLoggedUser();
        const favoritos = user.favoritos || [];
        const isFavorite = favoritos.includes(movieId);

        try {
            let updatedFavoritos;
            if (isFavorite) {
                updatedFavoritos = favoritos.filter(id => id !== movieId);
            } else {
                updatedFavoritos = [...favoritos, movieId];
            }

            // Atualizar no servidor
            const response = await fetch(`${this.apiURL}/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ favoritos: updatedFavoritos })
            });

            if (response.ok) {
                // Atualizar sessionStorage
                user.favoritos = updatedFavoritos;
                sessionStorage.setItem('usuarioLogado', JSON.stringify(user));

                // Atualizar ícone do botão
                const newIsFavorite = !isFavorite;
                button.innerHTML = newIsFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
                button.style.color = newIsFavorite ? '#e74c3c' : '#666';
            }
        } catch (error) {
            console.error('Erro ao atualizar favorito:', error);
        }
    }

    // Mostrar página de favoritos
    showFavorites() {
        const user = this.getLoggedUser();
        const favoritos = user.favoritos || [];

        if (favoritos.length === 0) {
            alert('Você ainda não tem filmes favoritos!');
            return;
        }

        // Filtrar e mostrar apenas filmes favoritos
        if (window.filmesCache) {
            const filmesFavoritos = window.filmesCache.filter(f => favoritos.includes(f.id));
            if (window.renderFilmes) {
                window.renderFilmes(filmesFavoritos);

                // Atualizar título da seção
                const title = document.querySelector('h1, h2');
                if (title) {
                    title.textContent = 'Meus Filmes Favoritos';
                }

                // Adicionar botão para voltar
                const backBtn = document.createElement('button');
                backBtn.className = 'btn btn-secondary mb-3';
                backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Voltar ao Catálogo';
                backBtn.onclick = () => window.location.reload();

                const container = document.getElementById('filmes-container');
                if (container) {
                    container.parentNode.insertBefore(backBtn, container);
                }
            }
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});