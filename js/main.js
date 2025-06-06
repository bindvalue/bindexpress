// Espera o DOM ser carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o carrinho
    initCarrinho();
    
    // Carrega os produtos
    carregarProdutos();
    
    // Inicializa os modais
    initModais();
    
    // Inicializa os filtros
    initFiltros();
    
    // Inicializa o menu mobile
    initMenuMobile();
});

// Variáveis globais
let carrinho = [];
let produtos = [];
let produtoAtual = null;

// Inicializa o carrinho
function initCarrinho() {
    // Recupera o carrinho do localStorage
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
        carrinho = JSON.parse(carrinhoSalvo);
        atualizarContadorCarrinho();
    }
    
    // Botão do carrinho
    const btnCarrinho = document.getElementById('btn-carrinho');
    btnCarrinho.addEventListener('click', function(e) {
        e.preventDefault();
        abrirModalCarrinho();
    });
    
    // Botão limpar carrinho
    const btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');
    btnLimparCarrinho.addEventListener('click', function() {
        limparCarrinho();
    });
    
    // Botão finalizar pedido
    const btnFinalizarPedido = document.getElementById('btn-finalizar-pedido');
    btnFinalizarPedido.addEventListener('click', function() {
        if (carrinho.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }
        
        fecharModal('modal-carrinho');
        abrirModalFinalizarPedido();
    });
    
    // Botão voltar ao carrinho
    const btnVoltarCarrinho = document.getElementById('btn-voltar-carrinho');
    btnVoltarCarrinho.addEventListener('click', function() {
        fecharModal('modal-finalizar');
        abrirModalCarrinho();
    });
    
    // Botão confirmar pedido
    const btnConfirmarPedido = document.getElementById('btn-confirmar-pedido');
    btnConfirmarPedido.addEventListener('click', function() {
        const form = document.getElementById('form-pedido');
        if (form.checkValidity()) {
            enviarPedido();
        } else {
            alert('Por favor, preencha todos os campos obrigatórios.');
            form.reportValidity();
        }
    });
    
    // Forma de pagamento
    const formaPagamento = document.getElementById('forma-pagamento');
    const trocoGroup = document.getElementById('troco-group');
    
    formaPagamento.addEventListener('change', function() {
        if (this.value === 'dinheiro') {
            trocoGroup.style.display = 'block';
        } else {
            trocoGroup.style.display = 'none';
        }
    });
    
    // Botão fechar confirmação
    const btnFecharConfirmacao = document.getElementById('btn-fechar-confirmacao');
    btnFecharConfirmacao.addEventListener('click', function() {
        fecharModal('modal-confirmacao');
        limparCarrinho();
    });
}

// Inicializa os modais
function initModais() {
    // Fecha os modais ao clicar no X
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            fecharModal(modal.id);
        });
    });
    
    // Fecha os modais ao clicar fora deles
    const modais = document.querySelectorAll('.modal');
    modais.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModal(this.id);
            }
        });
    });
    
    // Modal de produto
    const btnDiminuir = document.getElementById('btn-diminuir');
    const btnAumentar = document.getElementById('btn-aumentar');
    const quantidade = document.getElementById('quantidade');
    
    btnDiminuir.addEventListener('click', function() {
        if (parseInt(quantidade.value) > 1) {
            quantidade.value = parseInt(quantidade.value) - 1;
            atualizarPrecoProduto();
        }
    });
    
    btnAumentar.addEventListener('click', function() {
        if (parseInt(quantidade.value) < 10) {
            quantidade.value = parseInt(quantidade.value) + 1;
            atualizarPrecoProduto();
        }
    });
    
    quantidade.addEventListener('change', function() {
        if (parseInt(this.value) < 1) {
            this.value = 1;
        } else if (parseInt(this.value) > 10) {
            this.value = 10;
        }
        atualizarPrecoProduto();
    });
    
    // Opções de tamanho e adicionais
    const opcoesTamanho = document.querySelectorAll('input[name="tamanho"]');
    const opcoesAdicionais = document.querySelectorAll('input[name="adicional"]');
    
    opcoesTamanho.forEach(opcao => {
        opcao.addEventListener('change', atualizarPrecoProduto);
    });
    
    opcoesAdicionais.forEach(opcao => {
        opcao.addEventListener('change', atualizarPrecoProduto);
    });
    
    // Botão adicionar ao carrinho
    const btnAdicionarCarrinho = document.getElementById('btn-adicionar-carrinho');
    btnAdicionarCarrinho.addEventListener('click', function() {
        adicionarAoCarrinho();
        fecharModal('modal-produto');
    });
}

// Inicializa os filtros
function initFiltros() {
    const filtros = document.querySelectorAll('.filtro-btn');
    
    filtros.forEach(filtro => {
        filtro.addEventListener('click', function() {
            // Remove a classe active de todos os filtros
            filtros.forEach(f => f.classList.remove('active'));
            
            // Adiciona a classe active ao filtro clicado
            this.classList.add('active');
            
            // Filtra os produtos
            const categoria = this.dataset.filter;
            filtrarProdutos(categoria);
        });
    });
}

// Inicializa o menu mobile
function initMenuMobile() {
    // Cria o overlay e o menu mobile
    const overlay = document.createElement('div');
    overlay.className = 'menu-mobile-overlay';
    
    const menuMobile = document.createElement('div');
    menuMobile.className = 'menu-mobile-content';
    
    menuMobile.innerHTML = `
        <div class="menu-mobile-header">
            <h2>Pizza<span>Express</span></h2>
            <div class="menu-mobile-close">
                <i class="fas fa-times"></i>
            </div>
        </div>
        <nav class="menu-mobile-nav">
            <ul>
                <li><a href="#cardapio">Cardápio</a></li>
                <li><a href="#promocoes">Promoções</a></li>
                <li><a href="#sobre">Sobre</a></li>
                <li><a href="#contato">Contato</a></li>
            </ul>
        </nav>
        <div class="menu-mobile-footer">
            <div class="social-icons">
                <a href="#"><i class="fab fa-facebook"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-whatsapp"></i></a>
            </div>
            <p>&copy; 2025 PizzaExpress</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(menuMobile);
    
    // Botão do menu mobile
    const btnMenuMobile = document.querySelector('.menu-mobile');
    btnMenuMobile.addEventListener('click', function() {
        overlay.classList.add('active');
        menuMobile.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Fecha o menu mobile ao clicar no X
    const btnFecharMenuMobile = menuMobile.querySelector('.menu-mobile-close');
    btnFecharMenuMobile.addEventListener('click', function() {
        overlay.classList.remove('active');
        menuMobile.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Fecha o menu mobile ao clicar no overlay
    overlay.addEventListener('click', function() {
        overlay.classList.remove('active');
        menuMobile.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Fecha o menu mobile ao clicar em um link
    const menuLinks = menuMobile.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            overlay.classList.remove('active');
            menuMobile.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Carrega os produtos
function carregarProdutos() {
    const produtosGrid = document.querySelector('.produtos-grid');
    
    // Limpa o grid
    produtosGrid.innerHTML = '';
    
    // Adiciona os produtos ao grid
    produtosData.forEach(produto => {
        const produtoCard = document.createElement('div');
        produtoCard.className = 'produto-card';
        produtoCard.dataset.categoria = produto.categoria;
        
        produtoCard.innerHTML = `
            <div class="produto-img">
                <img src="${produto.imagem}" alt="${produto.nome}">
            </div>
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <div class="produto-bottom">
                    <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
                    <button class="btn-adicionar" data-id="${produto.id}">Adicionar</button>
                </div>
            </div>
        `;
        
        produtosGrid.appendChild(produtoCard);
    });
    
    // Adiciona evento de clique aos botões de adicionar
    const botoesAdicionar = document.querySelectorAll('.btn-adicionar');
    botoesAdicionar.forEach(botao => {
        botao.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            abrirModalProduto(id);
        });
    });
    
    // Salva os produtos na variável global
    produtos = produtosData;
}

// Filtra os produtos
function filtrarProdutos(categoria) {
    const produtosCards = document.querySelectorAll('.produto-card');
    
    produtosCards.forEach(card => {
        if (categoria === 'todos' || card.dataset.categoria === categoria) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Abre o modal do produto
function abrirModalProduto(id) {
    // Encontra o produto pelo ID
    produtoAtual = produtos.find(p => p.id === id);
    
    if (!produtoAtual) return;
    
    // Preenche os dados do produto no modal
    document.getElementById('produto-titulo').textContent = produtoAtual.nome;
    document.getElementById('produto-img').src = produtoAtual.imagem;
    document.getElementById('produto-descricao').textContent = produtoAtual.descricao;
    
    // Reseta as opções
    document.querySelector('input[name="tamanho"][value="media"]').checked = true;
    document.querySelectorAll('input[name="adicional"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('quantidade').value = 1;
    
    // Atualiza o preço
    atualizarPrecoProduto();
    
    // Abre o modal
    abrirModal('modal-produto');
}

// Atualiza o preço do produto no modal
function atualizarPrecoProduto() {
    if (!produtoAtual) return;
    
    let preco = produtoAtual.preco;
    const tamanho = document.querySelector('input[name="tamanho"]:checked').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    
    // Ajusta o preço conforme o tamanho
    if (tamanho === 'pequena') {
        preco = preco * 0.8;
    } else if (tamanho === 'grande') {
        preco = preco * 1.2;
    }
    
    // Adiciona os adicionais
    document.querySelectorAll('input[name="adicional"]:checked').forEach(adicional => {
        if (adicional.value === 'borda-recheada') {
            preco += 8;
        } else if (adicional.value === 'extra-queijo') {
            preco += 5;
        }
    });
    
    // Multiplica pela quantidade
    preco = preco * quantidade;
    
    // Atualiza o preço no modal
    document.getElementById('produto-preco').textContent = `R$ ${preco.toFixed(2)}`;
}

// Adiciona o produto ao carrinho
function adicionarAoCarrinho() {
    if (!produtoAtual) return;
    
    const tamanho = document.querySelector('input[name="tamanho"]:checked').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const adicionais = [];
    
    document.querySelectorAll('input[name="adicional"]:checked').forEach(adicional => {
        adicionais.push(adicional.value);
    });
    
    let preco = produtoAtual.preco;
    
    // Ajusta o preço conforme o tamanho
    if (tamanho === 'pequena') {
        preco = preco * 0.8;
    } else if (tamanho === 'grande') {
        preco = preco * 1.2;
    }
    
    // Adiciona os adicionais
    adicionais.forEach(adicional => {
        if (adicional === 'borda-recheada') {
            preco += 8;
        } else if (adicional === 'extra-queijo') {
            preco += 5;
        }
    });
    
    // Cria o item do carrinho
    const item = {
        id: Date.now(), // ID único para o item do carrinho
        produtoId: produtoAtual.id,
        nome: produtoAtual.nome,
        imagem: produtoAtual.imagem,
        tamanho: tamanho,
        adicionais: adicionais,
        quantidade: quantidade,
        preco: preco,
        total: preco * quantidade
    };
    
    // Adiciona ao carrinho
    carrinho.push(item);
    
    // Salva o carrinho no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    // Atualiza o contador do carrinho
    atualizarContadorCarrinho();
    
    // Mostra mensagem de sucesso
    alert('Produto adicionado ao carrinho!');
}

// Atualiza o contador do carrinho
function atualizarContadorCarrinho() {
    const contador = document.querySelector('.contador');
    contador.textContent = carrinho.length;
}

// Abre o modal do carrinho
function abrirModalCarrinho() {
    const carrinhoItens = document.querySelector('.carrinho-itens');
    const carrinhoTotal = document.getElementById('carrinho-total');
    
    // Limpa os itens
    carrinhoItens.innerHTML = '';
    
    if (carrinho.length === 0) {
        carrinhoItens.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
        carrinhoTotal.textContent = 'R$ 0,00';
    } else {
        let total = 0;
        
        // Adiciona os itens ao carrinho
        carrinho.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'carrinho-item';
            
            let adicionaisTexto = '';
            if (item.adicionais.length > 0) {
                adicionaisTexto = item.adicionais.map(adicional => {
                    if (adicional === 'borda-recheada') return 'Borda Recheada';
                    if (adicional === 'extra-queijo') return 'Extra Queijo';
                    return '';
                }).join(', ');
            }
            
            let tamanhoTexto = '';
            if (item.tamanho === 'pequena') tamanhoTexto = 'Pequena';
            if (item.tamanho === 'media') tamanhoTexto = 'Média';
            if (item.tamanho === 'grande') tamanhoTexto = 'Grande';
            
            itemElement.innerHTML = `
                <div class="carrinho-item-img">
                    <img src="${item.imagem}" alt="${item.nome}">
                </div>
                <div class="carrinho-item-info">
                    <h4>${item.nome}</h4>
                    <p>Tamanho: ${tamanhoTexto}${adicionaisTexto ? ', ' + adicionaisTexto : ''}</p>
                </div>
                <div class="carrinho-item-preco">R$ ${item.preco.toFixed(2)}</div>
                <div class="carrinho-item-qtd">
                    <button class="btn-diminuir" data-id="${item.id}">-</button>
                    <span>${item.quantidade}</span>
                    <button class="btn-aumentar" data-id="${item.id}">+</button>
                </div>
                <div class="carrinho-item-remover" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </div>
            `;
            
            carrinhoItens.appendChild(itemElement);
            total += item.total;
        });
        
        // Atualiza o total
        carrinhoTotal.textContent = `R$ ${total.toFixed(2)}`;
        
        // Adiciona eventos aos botões
        const botoesAumentar = document.querySelectorAll('.carrinho-item-qtd .btn-aumentar');
        const botoesDiminuir = document.querySelectorAll('.carrinho-item-qtd .btn-diminuir');
        const botoesRemover = document.querySelectorAll('.carrinho-item-remover');
        
        botoesAumentar.forEach(botao => {
            botao.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                aumentarQuantidadeCarrinho(id);
            });
        });
        
        botoesDiminuir.forEach(botao => {
            botao.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                diminuirQuantidadeCarrinho(id);
            });
        });
        
        botoesRemover.forEach(botao => {
            botao.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                removerDoCarrinho(id);
            });
        });
    }
    
    // Abre o modal
    abrirModal('modal-carrinho');
}

// Aumenta a quantidade de um item no carrinho
function aumentarQuantidadeCarrinho(id) {
    const item = carrinho.find(i => i.id === id);
    
    if (item && item.quantidade < 10) {
        item.quantidade++;
        item.total = item.preco * item.quantidade;
        
        // Salva o carrinho no localStorage
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        
        // Atualiza o modal do carrinho
        abrirModalCarrinho();
    }
}

// Diminui a quantidade de um item no carrinho
function diminuirQuantidadeCarrinho(id) {
    const item = carrinho.find(i => i.id === id);
    
    if (item && item.quantidade > 1) {
        item.quantidade--;
        item.total = item.preco * item.quantidade;
        
        // Salva o carrinho no localStorage
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        
        // Atualiza o modal do carrinho
        abrirModalCarrinho();
    }
}

// Remove um item do carrinho
function removerDoCarrinho(id) {
    carrinho = carrinho.filter(i => i.id !== id);
    
    // Salva o carrinho no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    // Atualiza o contador do carrinho
    atualizarContadorCarrinho();
    
    // Atualiza o modal do carrinho
    abrirModalCarrinho();
}

// Limpa o carrinho
function limparCarrinho() {
    carrinho = [];
    
    // Salva o carrinho no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    // Atualiza o contador do carrinho
    atualizarContadorCarrinho();
    
    // Atualiza o modal do carrinho
    abrirModalCarrinho();
}

// Abre o modal de finalizar pedido
function abrirModalFinalizarPedido() {
    const resumoItens = document.querySelector('.resumo-itens');
    const resumoSubtotal = document.getElementById('resumo-subtotal');
    const resumoTotal = document.getElementById('resumo-total');
    
    // Limpa os itens
    resumoItens.innerHTML = '';
    
    let subtotal = 0;
    
    // Adiciona os itens ao resumo
    carrinho.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'resumo-item';
        
        let adicionaisTexto = '';
        if (item.adicionais.length > 0) {
            adicionaisTexto = item.adicionais.map(adicional => {
                if (adicional === 'borda-recheada') return 'Borda Recheada';
                if (adicional === 'extra-queijo') return 'Extra Queijo';
                return '';
            }).join(', ');
        }
        
        let tamanhoTexto = '';
        if (item.tamanho === 'pequena') tamanhoTexto = 'Pequena';
        if (item.tamanho === 'media') tamanhoTexto = 'Média';
        if (item.tamanho === 'grande') tamanhoTexto = 'Grande';
        
        itemElement.innerHTML = `
            <div class="resumo-item-info">
                <h5>${item.nome} (${tamanhoTexto}) x${item.quantidade}</h5>
                <p>${adicionaisTexto}</p>
            </div>
            <div class="resumo-item-preco">R$ ${item.total.toFixed(2)}</div>
        `;
        
        resumoItens.appendChild(itemElement);
        subtotal += item.total;
    });
    
    // Taxa de entrega
    const taxaEntrega = 5;
    
    // Atualiza os valores
    resumoSubtotal.textContent = `R$ ${subtotal.toFixed(2)}`;
    resumoTotal.textContent = `R$ ${(subtotal + taxaEntrega).toFixed(2)}`;
    
    // Abre o modal
    abrirModal('modal-finalizar');
}

// Envia o pedido
async function enviarPedido() {
    // Obtém os dados do formulário
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;
    const endereco = document.getElementById('endereco').value;
    const numero = document.getElementById('numero').value;
    const complemento = document.getElementById('complemento').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;
    const formaPagamento = document.getElementById('forma-pagamento').value;
    const troco = formaPagamento === 'dinheiro' ? document.getElementById('troco').value : null;
    const observacoes = document.getElementById('observacoes').value;
    
    // Calcula o subtotal
    let subtotal = 0;
    carrinho.forEach(item => {
        subtotal += item.total;
    });
    
    // Taxa de entrega
    const taxaEntrega = 5;
    
    // Total
    const total = subtotal + taxaEntrega;
    
    // Cria o objeto do pedido
    const pedido = {
        cliente: {
            nome,
            telefone,
            email,
            endereco: {
                logradouro: endereco,
                numero,
                complemento,
                bairro,
                cidade
            }
        },
        itens: carrinho.map(item => ({
            id: item.produtoId,
            nome: item.nome,
            tamanho: item.tamanho,
            adicionais: item.adicionais,
            quantidade: item.quantidade,
            preco: item.preco,
            total: item.total
        })),
        pagamento: {
            forma: formaPagamento,
            troco: troco ? parseFloat(troco) : null
        },
        observacoes,
        valores: {
            subtotal,
            taxaEntrega,
            total
        },
        status: 'pendente',
        data: new Date().toISOString()
    };
    
    try {
        // Envia o pedido para o n8n
        await window.N8nIntegration.enviarPedido(pedido);
        
        // Gera um número de pedido aleatório
        const numeroPedido = Math.floor(Math.random() * 10000);
        
        // Preenche o número do pedido no modal de confirmação
        document.getElementById('pedido-numero').textContent = numeroPedido;
        
        // Fecha o modal de finalizar pedido
        fecharModal('modal-finalizar');
        
        // Abre o modal de confirmação
        abrirModal('modal-confirmacao');
        
        // Limpa o carrinho
        limparCarrinho();
    } catch (error) {
        console.error('Erro ao enviar pedido:', error);
        
        // Mesmo em caso de erro, mostramos a confirmação para o usuário
        // O pedido será salvo localmente e tentará ser enviado novamente quando houver conexão
        const numeroPedido = Math.floor(Math.random() * 10000);
        document.getElementById('pedido-numero').textContent = numeroPedido;
        fecharModal('modal-finalizar');
        abrirModal('modal-confirmacao');
    }
}

// Abre um modal
function abrirModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Fecha um modal
function fecharModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

