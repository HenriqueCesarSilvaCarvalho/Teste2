
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