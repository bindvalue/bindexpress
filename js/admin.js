// Espera o DOM ser carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário está autenticado
    verificarAutenticacao();
    
    // Inicializa o sidebar
    initSidebar();
    
    // Inicializa os modais
    initModais();
    
    // Inicializa os gráficos
    initCharts();
    
    // Inicializa as tabelas
    initTables();
    
    // Inicializa os filtros
    initFiltros();
    
    // Inicializa o logout
    initLogout();
    
    // Carrega os pedidos
    carregarPedidos();
});

// Verifica se o usuário está autenticado
function verificarAutenticacao() {
    // Verifica se estamos na página de login
    const isLoginPage = window.location.pathname.includes('login.html');
    
    // Se não estamos na página de login, verifica se o usuário está autenticado
    if (!isLoginPage && !window.N8nIntegration.isAutenticado()) {
        // Redireciona para a página de login
        window.location.href = 'login.html';
        return;
    }
    
    // Se estamos na página de login e o usuário já está autenticado, redireciona para o dashboard
    if (isLoginPage && window.N8nIntegration.isAutenticado()) {
        window.location.href = 'index.html';
        return;
    }
}

// Inicializa o sidebar
function initSidebar() {
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            
            if (sidebar.classList.contains('active')) {
                mainContent.style.marginLeft = 'var(--sidebar-width)';
            } else {
                mainContent.style.marginLeft = '0';
            }
        });
    }
}

// Inicializa os modais
function initModais() {
    // Botões para abrir o modal de detalhes do pedido
    const btnViewPedido = document.querySelectorAll('.btn-action.view');
    btnViewPedido.forEach(btn => {
        btn.addEventListener('click', function() {
            const pedidoId = this.closest('tr').querySelector('td:nth-child(2)').textContent;
            abrirModalPedido(pedidoId);
        });
    });
    
    // Botões para abrir o modal de impressão
    const btnPrintPedido = document.querySelectorAll('.btn-action.print');
    btnPrintPedido.forEach(btn => {
        btn.addEventListener('click', function() {
            const pedidoId = this.closest('tr').querySelector('td:nth-child(2)').textContent;
            abrirModalImpressao(pedidoId);
        });
    });
    
    // Botão para imprimir pedido dentro do modal de detalhes
    const btnImprimirPedido = document.getElementById('btn-imprimir-pedido');
    if (btnImprimirPedido) {
        btnImprimirPedido.addEventListener('click', function() {
            const pedidoId = document.querySelector('.modal-header h3').textContent.split('#')[1];
            fecharModal('modal-pedido');
            abrirModalImpressao(pedidoId);
        });
    }
    
    // Botão para fechar o modal de detalhes
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', function() {
            fecharModal('modal-pedido');
        });
    }
    
    // Botão para cancelar impressão
    const btnCancelarImpressao = document.getElementById('btn-cancelar-impressao');
    if (btnCancelarImpressao) {
        btnCancelarImpressao.addEventListener('click', function() {
            fecharModal('modal-impressao');
        });
    }
    
    // Botão para confirmar impressão
    const btnConfirmarImpressao = document.getElementById('btn-confirmar-impressao');
    if (btnConfirmarImpressao) {
        btnConfirmarImpressao.addEventListener('click', function() {
            imprimirPedido();
        });
    }
    
    // Botão para salvar status
    const btnSalvarStatus = document.getElementById('btn-salvar-status');
    if (btnSalvarStatus) {
        btnSalvarStatus.addEventListener('click', function() {
            const status = document.getElementById('alterar-status').value;
            const pedidoId = document.querySelector('.modal-header h3').textContent.split('#')[1];
            
            if (status) {
                atualizarStatusPedido(pedidoId, status);
            } else {
                alert('Selecione um status!');
            }
        });
    }
    
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
}

// Inicializa os gráficos
function initCharts() {
    // Gráfico de vendas
    const vendasChart = document.getElementById('vendasChart');
    if (vendasChart) {
        new Chart(vendasChart, {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Vendas (R$)',
                    data: [1200, 1500, 1300, 1800, 2000, 2500, 2200],
                    borderColor: '#e23744',
                    backgroundColor: 'rgba(226, 55, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de produtos
    const produtosChart = document.getElementById('produtosChart');
    if (produtosChart) {
        new Chart(produtosChart, {
            type: 'bar',
            data: {
                labels: ['Calabresa', 'Margherita', '4 Queijos', 'Portuguesa', 'Frango'],
                datasets: [{
                    label: 'Quantidade',
                    data: [25, 18, 15, 12, 10],
                    backgroundColor: [
                        '#e23744',
                        '#f5a623',
                        '#28a745',
                        '#17a2b8',
                        '#6c757d'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// Inicializa as tabelas
function initTables() {
    // Selecionar todos os checkboxes
    const selectAll = document.getElementById('select-all');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.select-pedido');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    // Atualizar o selectAll quando os checkboxes individuais mudarem
    const checkboxes = document.querySelectorAll('.select-pedido');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const allChecked = document.querySelectorAll('.select-pedido:checked').length === checkboxes.length;
            if (selectAll) {
                selectAll.checked = allChecked;
                selectAll.indeterminate = !allChecked && document.querySelectorAll('.select-pedido:checked').length > 0;
            }
        });
    });
    
    // Botão para imprimir todos os selecionados
    const btnImprimirTodos = document.getElementById('btn-imprimir-todos');
    if (btnImprimirTodos) {
        btnImprimirTodos.addEventListener('click', function() {
            const selecionados = document.querySelectorAll('.select-pedido:checked');
            if (selecionados.length === 0) {
                alert('Selecione pelo menos um pedido!');
                return;
            }
            
            // Obtém os IDs dos pedidos selecionados
            const pedidosIds = Array.from(selecionados).map(checkbox => {
                return checkbox.closest('tr').querySelector('td:nth-child(2)').textContent;
            });
            
            // Imprime os pedidos selecionados
            imprimirPedidosEmLote(pedidosIds);
        });
    }
    
    // Botão para exportar
    const btnExportar = document.getElementById('btn-exportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', function() {
            exportarPedidos();
        });
    }
    
    // Links para atualizar status
    const statusLinks = document.querySelectorAll('.status-update');
    statusLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const status = this.dataset.status;
            const pedidoId = this.closest('tr').querySelector('td:nth-child(2)').textContent;
            
            atualizarStatusPedido(pedidoId, status);
        });
    });
}

// Inicializa os filtros
function initFiltros() {
    // Filtro de status
    const filtroStatus = document.getElementById('filtro-status');
    if (filtroStatus) {
        filtroStatus.addEventListener('change', function() {
            // Aqui seria feita a filtragem dos pedidos
            console.log('Filtro de status:', this.value);
        });
    }
    
    // Filtro de data
    const filtroData = document.getElementById('filtro-data');
    if (filtroData) {
        filtroData.addEventListener('change', function() {
            // Aqui seria feita a filtragem dos pedidos
            console.log('Filtro de data:', this.value);
        });
    }
    
    // Filtro de pagamento
    const filtroPagamento = document.getElementById('filtro-pagamento');
    if (filtroPagamento) {
        filtroPagamento.addEventListener('change', function() {
            // Aqui seria feita a filtragem dos pedidos
            console.log('Filtro de pagamento:', this.value);
        });
    }
    
    // Botão de filtrar
    const btnFiltrar = document.querySelector('.btn-filter');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', function() {
            // Obtém os valores dos filtros
            const status = filtroStatus ? filtroStatus.value : '';
            const data = filtroData ? filtroData.value : '';
            const pagamento = filtroPagamento ? filtroPagamento.value : '';
            
            // Aplica os filtros
            aplicarFiltros({
                status,
                data,
                pagamento
            });
        });
    }
    
    // Botão de limpar filtros
    const btnLimparFiltros = document.querySelector('.btn-clear-filter');
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', function() {
            // Limpa os filtros
            if (filtroStatus) filtroStatus.value = '';
            if (filtroData) filtroData.value = '';
            if (filtroPagamento) filtroPagamento.value = '';
            
            // Remove os filtros
            aplicarFiltros({});
        });
    }
    
    // Abas de status
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove a classe active de todos os botões
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // Adiciona a classe active ao botão clicado
            this.classList.add('active');
            
            // Aplica o filtro de status
            const status = this.dataset.status;
            if (status === 'todos') {
                aplicarFiltros({});
            } else {
                aplicarFiltros({ status });
            }
        });
    });
}

// Inicializa o logout
function initLogout() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Confirma o logout
            if (confirm('Deseja realmente sair?')) {
                // Faz logout
                window.N8nIntegration.logout();
                
                // Redireciona para a página de login
                window.location.href = 'login.html';
            }
        });
    }
}

// Carrega os pedidos
async function carregarPedidos() {
    try {
        // Obtém os pedidos do n8n
        const pedidos = await window.N8nIntegration.obterPedidos();
        
        // Atualiza a tabela de pedidos
        atualizarTabelaPedidos(pedidos);
        
        // Atualiza os contadores das abas
        atualizarContadoresAbas(pedidos);
        
        // Atualiza os gráficos
        atualizarGraficos(pedidos);
        
        // Atualiza os cards de estatísticas
        atualizarEstatisticas(pedidos);
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        
        // Em caso de erro, exibe uma mensagem para o usuário
        alert('Não foi possível carregar os pedidos. Por favor, tente novamente mais tarde.');
    }
}

// Atualiza a tabela de pedidos
function atualizarTabelaPedidos(pedidos) {
    // Verifica se estamos na página de pedidos
    const tabelaPedidos = document.querySelector('.pedidos-table tbody');
    if (!tabelaPedidos) return;
    
    // Limpa a tabela
    tabelaPedidos.innerHTML = '';
    
    // Adiciona os pedidos à tabela
    pedidos.forEach(pedido => {
        const tr = document.createElement('tr');
        
        // Formata a data
        const data = new Date(pedido.data);
        const dataFormatada = `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        
        // Formata o status
        let statusClass = '';
        switch (pedido.status) {
            case 'pendente':
                statusClass = 'pending';
                break;
            case 'em-preparo':
                statusClass = 'processing';
                break;
            case 'em-entrega':
                statusClass = 'shipping';
                break;
            case 'entregue':
                statusClass = 'delivered';
                break;
            case 'cancelado':
                statusClass = 'cancelled';
                break;
        }
        
        // Formata o status para exibição
        let statusTexto = '';
        switch (pedido.status) {
            case 'pendente':
                statusTexto = 'Pendente';
                break;
            case 'em-preparo':
                statusTexto = 'Em Preparo';
                break;
            case 'em-entrega':
                statusTexto = 'Em Entrega';
                break;
            case 'entregue':
                statusTexto = 'Entregue';
                break;
            case 'cancelado':
                statusTexto = 'Cancelado';
                break;
        }
        
        // Formata a forma de pagamento
        let formaPagamento = '';
        switch (pedido.pagamento.forma) {
            case 'dinheiro':
                formaPagamento = 'Dinheiro';
                break;
            case 'cartao-credito':
                formaPagamento = 'Cartão de Crédito';
                break;
            case 'cartao-debito':
                formaPagamento = 'Cartão de Débito';
                break;
            case 'pix':
                formaPagamento = 'PIX';
                break;
        }
        
        // Cria as opções do dropdown de acordo com o status atual
        let dropdownOptions = '';
        if (pedido.status === 'pendente') {
            dropdownOptions = `
                <a href="#" class="status-update" data-status="em-preparo">Marcar como Em Preparo</a>
                <a href="#" class="status-update" data-status="cancelado">Cancelar Pedido</a>
            `;
        } else if (pedido.status === 'em-preparo') {
            dropdownOptions = `
                <a href="#" class="status-update" data-status="em-entrega">Marcar como Em Entrega</a>
                <a href="#" class="status-update" data-status="cancelado">Cancelar Pedido</a>
            `;
        } else if (pedido.status === 'em-entrega') {
            dropdownOptions = `
                <a href="#" class="status-update" data-status="entregue">Marcar como Entregue</a>
                <a href="#" class="status-update" data-status="cancelado">Cancelar Pedido</a>
            `;
        } else if (pedido.status === 'entregue') {
            dropdownOptions = `
                <a href="#" class="status-update" data-status="cancelado">Cancelar Pedido</a>
            `;
        } else if (pedido.status === 'cancelado') {
            dropdownOptions = `
                <a href="#" class="status-update" data-status="pendente">Reativar Pedido</a>
            `;
        }
        
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="select-pedido">
            </td>
            <td>#${pedido.id}</td>
            <td>${pedido.cliente.nome}</td>
            <td>${dataFormatada}</td>
            <td>R$ ${pedido.valores.total.toFixed(2)}</td>
            <td>${formaPagamento}</td>
            <td><span class="status-badge ${statusClass}">${statusTexto}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-action view"><i class="fas fa-eye"></i></button>
                    ${pedido.status !== 'cancelado' ? '<button class="btn-action edit"><i class="fas fa-edit"></i></button>' : ''}
                    <button class="btn-action print"><i class="fas fa-print"></i></button>
                    <div class="dropdown">
                        <button class="btn-action"><i class="fas fa-ellipsis-v"></i></button>
                        <div class="dropdown-menu">
                            ${dropdownOptions}
                        </div>
                    </div>
                </div>
            </td>
        `;
        
        tabelaPedidos.appendChild(tr);
    });
    
    // Reinicializa os eventos da tabela
    initTables();
}

// Atualiza os contadores das abas
function atualizarContadoresAbas(pedidos) {
    // Verifica se estamos na página de pedidos
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length === 0) return;
    
    // Conta os pedidos por status
    const contadores = {
        todos: pedidos.length,
        pendente: 0,
        'em-preparo': 0,
        'em-entrega': 0,
        entregue: 0,
        cancelado: 0
    };
    
    // Conta os pedidos por status
    pedidos.forEach(pedido => {
        contadores[pedido.status]++;
    });
    
    // Atualiza os contadores nas abas
    tabBtns.forEach(btn => {
        const status = btn.dataset.status;
        const contador = contadores[status] || 0;
        btn.textContent = `${status === 'todos' ? 'Todos' : status === 'pendente' ? 'Pendentes' : status === 'em-preparo' ? 'Em Preparo' : status === 'em-entrega' ? 'Em Entrega' : status === 'entregue' ? 'Entregues' : 'Cancelados'} (${contador})`;
    });
}

// Atualiza os gráficos
function atualizarGraficos(pedidos) {
    // Verifica se estamos na página do dashboard
    const vendasChart = document.getElementById('vendasChart');
    const produtosChart = document.getElementById('produtosChart');
    if (!vendasChart || !produtosChart) return;
    
    // Dados para o gráfico de vendas
    const hoje = new Date();
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const vendasPorDia = [0, 0, 0, 0, 0, 0, 0];
    
    // Dados para o gráfico de produtos
    const produtosMaisVendidos = {};
    
    // Processa os pedidos
    pedidos.forEach(pedido => {
        // Ignora pedidos cancelados
        if (pedido.status === 'cancelado') return;
        
        // Data do pedido
        const dataPedido = new Date(pedido.data);
        
        // Verifica se o pedido é da última semana
        const diffDias = Math.floor((hoje - dataPedido) / (1000 * 60 * 60 * 24));
        if (diffDias < 7) {
            // Adiciona o valor do pedido ao dia correspondente
            const diaDaSemana = dataPedido.getDay();
            vendasPorDia[diaDaSemana] += pedido.valores.total;
        }
        
        // Conta os produtos vendidos
        pedido.itens.forEach(item => {
            if (!produtosMaisVendidos[item.nome]) {
                produtosMaisVendidos[item.nome] = 0;
            }
            produtosMaisVendidos[item.nome] += item.quantidade;
        });
    });
    
    // Ordena os dias da semana para começar com segunda-feira
    const diasOrdenados = [];
    const vendasOrdenadas = [];
    for (let i = 1; i <= 7; i++) {
        const idx = i % 7;
        diasOrdenados.push(diasDaSemana[idx]);
        vendasOrdenadas.push(vendasPorDia[idx]);
    }
    
    // Ordena os produtos mais vendidos
    const produtosOrdenados = Object.entries(produtosMaisVendidos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Atualiza o gráfico de vendas
    const chartVendas = Chart.getChart(vendasChart);
    chartVendas.data.labels = diasOrdenados;
    chartVendas.data.datasets[0].data = vendasOrdenadas;
    chartVendas.update();
    
    // Atualiza o gráfico de produtos
    const chartProdutos = Chart.getChart(produtosChart);
    chartProdutos.data.labels = produtosOrdenados.map(p => p[0]);
    chartProdutos.data.datasets[0].data = produtosOrdenados.map(p => p[1]);
    chartProdutos.update();
}

// Atualiza os cards de estatísticas
function atualizarEstatisticas(pedidos) {
    // Verifica se estamos na página do dashboard
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length === 0) return;
    
    // Calcula as estatísticas
    const totalPedidos = pedidos.length;
    let receitaTotal = 0;
    let pizzasVendidas = 0;
    const clientesUnicos = new Set();
    
    // Processa os pedidos
    pedidos.forEach(pedido => {
        // Ignora pedidos cancelados
        if (pedido.status === 'cancelado') return;
        
        // Adiciona a receita
        receitaTotal += pedido.valores.total;
        
        // Adiciona o cliente
        clientesUnicos.add(pedido.cliente.email || pedido.cliente.telefone);
        
        // Conta as pizzas vendidas
        pedido.itens.forEach(item => {
            // Considera apenas itens que são pizzas (não bebidas ou outros)
            if (item.nome.toLowerCase().includes('pizza')) {
                pizzasVendidas += item.quantidade;
            }
        });
    });
    
    // Atualiza os cards
    const totalPedidosCard = statCards[0].querySelector('.stat-value');
    const receitaTotalCard = statCards[1].querySelector('.stat-value');
    const novosClientesCard = statCards[2].querySelector('.stat-value');
    const pizzasVendidasCard = statCards[3].querySelector('.stat-value');
    
    if (totalPedidosCard) totalPedidosCard.textContent = totalPedidos;
    if (receitaTotalCard) receitaTotalCard.textContent = `R$ ${receitaTotal.toFixed(2)}`;
    if (novosClientesCard) novosClientesCard.textContent = clientesUnicos.size;
    if (pizzasVendidasCard) pizzasVendidasCard.textContent = pizzasVendidas;
}

// Abre o modal de detalhes do pedido
async function abrirModalPedido(pedidoId) {
    try {
        // Obtém os detalhes do pedido
        const pedido = await obterDetalhesPedido(pedidoId);
        
        // Atualiza o título do modal
        document.querySelector('#modal-pedido .modal-header h3').textContent = `Detalhes do Pedido ${pedidoId}`;
        
        // Preenche as informações do cliente
        const infoCliente = document.querySelector('#modal-pedido .pedido-info .info-section:first-child');
        infoCliente.innerHTML = `
            <h4>Informações do Cliente</h4>
            <p><strong>Nome:</strong> ${pedido.cliente.nome}</p>
            <p><strong>Telefone:</strong> ${pedido.cliente.telefone}</p>
            <p><strong>Email:</strong> ${pedido.cliente.email || 'Não informado'}</p>
            <p><strong>Endereço:</strong> ${pedido.cliente.endereco.logradouro}, ${pedido.cliente.endereco.numero}${pedido.cliente.endereco.complemento ? ', ' + pedido.cliente.endereco.complemento : ''}</p>
            <p><strong>Bairro:</strong> ${pedido.cliente.endereco.bairro}</p>
            <p><strong>Cidade:</strong> ${pedido.cliente.endereco.cidade}</p>
        `;
        
        // Formata a data
        const data = new Date(pedido.data);
        const dataFormatada = `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        
        // Formata o status
        let statusTexto = '';
        switch (pedido.status) {
            case 'pendente':
                statusTexto = 'Pendente';
                break;
            case 'em-preparo':
                statusTexto = 'Em Preparo';
                break;
            case 'em-entrega':
                statusTexto = 'Em Entrega';
                break;
            case 'entregue':
                statusTexto = 'Entregue';
                break;
            case 'cancelado':
                statusTexto = 'Cancelado';
                break;
        }
        
        // Formata a forma de pagamento
        let formaPagamento = '';
        switch (pedido.pagamento.forma) {
            case 'dinheiro':
                formaPagamento = `Dinheiro${pedido.pagamento.troco ? ' (Troco para R$ ' + pedido.pagamento.troco.toFixed(2) + ')' : ''}`;
                break;
            case 'cartao-credito':
                formaPagamento = 'Cartão de Crédito';
                break;
            case 'cartao-debito':
                formaPagamento = 'Cartão de Débito';
                break;
            case 'pix':
                formaPagamento = 'PIX';
                break;
        }
        
        // Preenche as informações do pedido
        const infoPedido = document.querySelector('#modal-pedido .pedido-info .info-section:last-child');
        infoPedido.innerHTML = `
            <h4>Informações do Pedido</h4>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Status:</strong> ${statusTexto}</p>
            <p><strong>Pagamento:</strong> ${formaPagamento}</p>
            <p><strong>Total:</strong> R$ ${pedido.valores.total.toFixed(2)}</p>
            ${pedido.observacoes ? `<p><strong>Observações:</strong> ${pedido.observacoes}</p>` : ''}
        `;
        
        // Preenche a tabela de itens
        const tabelaItens = document.querySelector('#modal-pedido .table-responsive table tbody');
        tabelaItens.innerHTML = '';
        
        pedido.itens.forEach(item => {
            const tr = document.createElement('tr');
            
            // Formata o tamanho
            let tamanhoTexto = '';
            switch (item.tamanho) {
                case 'pequena':
                    tamanhoTexto = 'Pequena';
                    break;
                case 'media':
                    tamanhoTexto = 'Média';
                    break;
                case 'grande':
                    tamanhoTexto = 'Grande';
                    break;
            }
            
            // Formata os adicionais
            let adicionaisTexto = '';
            if (item.adicionais && item.adicionais.length > 0) {
                adicionaisTexto = '<br><small>' + item.adicionais.map(adicional => {
                    if (adicional === 'borda-recheada') return 'Borda Recheada';
                    if (adicional === 'extra-queijo') return 'Extra Queijo';
                    return '';
                }).join(', ') + '</small>';
            }
            
            tr.innerHTML = `
                <td>${item.nome} (${tamanhoTexto})${adicionaisTexto}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${item.preco.toFixed(2)}</td>
                <td>R$ ${item.total.toFixed(2)}</td>
            `;
            
            tabelaItens.appendChild(tr);
        });
        
        // Preenche os valores
        const tabelaFooter = document.querySelector('#modal-pedido .table-responsive table tfoot');
        tabelaFooter.innerHTML = `
            <tr>
                <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
                <td>R$ ${pedido.valores.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="3" class="text-right"><strong>Taxa de Entrega:</strong></td>
                <td>R$ ${pedido.valores.taxaEntrega.toFixed(2)}</td>
            </tr>
            ${pedido.valores.desconto ? `
            <tr>
                <td colspan="3" class="text-right"><strong>Desconto:</strong></td>
                <td>-R$ ${pedido.valores.desconto.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
                <td colspan="3" class="text-right"><strong>Total:</strong></td>
                <td>R$ ${pedido.valores.total.toFixed(2)}</td>
            </tr>
        `;
        
        // Atualiza a timeline
        const timeline = document.querySelector('#modal-pedido .timeline');
        timeline.innerHTML = '';
        
        // Adiciona os itens da timeline
        const statusTimeline = [
            { status: 'pendente', texto: 'Pedido Recebido', data: pedido.data },
            { status: 'em-preparo', texto: 'Em Preparo', data: pedido.statusDates?.emPreparo },
            { status: 'em-entrega', texto: 'Em Entrega', data: pedido.statusDates?.emEntrega },
            { status: 'entregue', texto: 'Entregue', data: pedido.statusDates?.entregue }
        ];
        
        // Status atual do pedido
        const statusAtual = pedido.status;
        
        // Adiciona os itens da timeline
        statusTimeline.forEach((item, index) => {
            // Determina o estado do item na timeline
            let estado = '';
            if (statusAtual === 'cancelado') {
                // Se o pedido foi cancelado, apenas o primeiro item é completado
                estado = index === 0 ? 'completed' : '';
            } else {
                // Para outros status, marca como completado os itens até o status atual
                const statusIndex = statusTimeline.findIndex(s => s.status === statusAtual);
                if (index < statusIndex) {
                    estado = 'completed';
                } else if (index === statusIndex) {
                    estado = 'active';
                }
            }
            
            // Formata a data
            let dataFormatada = 'Aguardando';
            if (item.data) {
                const data = new Date(item.data);
                dataFormatada = `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
            }
            
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-icon ${estado}"><i class="fas fa-check"></i></div>
                <div class="timeline-content">
                    <h5>${item.texto}</h5>
                    <p>${dataFormatada}</p>
                </div>
            `;
            
            timeline.appendChild(timelineItem);
        });
        
        // Se o pedido foi cancelado, adiciona um item de cancelamento
        if (statusAtual === 'cancelado') {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            // Formata a data
            let dataFormatada = 'Não informada';
            if (pedido.statusDates?.cancelado) {
                const data = new Date(pedido.statusDates.cancelado);
                dataFormatada = `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
            }
            
            timelineItem.innerHTML = `
                <div class="timeline-icon active"><i class="fas fa-times"></i></div>
                <div class="timeline-content">
                    <h5>Pedido Cancelado</h5>
                    <p>${dataFormatada}</p>
                </div>
            `;
            
            timeline.appendChild(timelineItem);
        }
        
        // Atualiza o select de status
        const selectStatus = document.getElementById('alterar-status');
        selectStatus.innerHTML = '<option value="">Alterar Status</option>';
        
        // Adiciona as opções de status de acordo com o status atual
        if (statusAtual === 'pendente') {
            selectStatus.innerHTML += `
                <option value="em-preparo">Em Preparo</option>
                <option value="cancelado">Cancelado</option>
            `;
        } else if (statusAtual === 'em-preparo') {
            selectStatus.innerHTML += `
                <option value="em-entrega">Em Entrega</option>
                <option value="cancelado">Cancelado</option>
            `;
        } else if (statusAtual === 'em-entrega') {
            selectStatus.innerHTML += `
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
            `;
        } else if (statusAtual === 'entregue') {
            selectStatus.innerHTML += `
                <option value="cancelado">Cancelado</option>
            `;
        } else if (statusAtual === 'cancelado') {
            selectStatus.innerHTML += `
                <option value="pendente">Reativar Pedido</option>
            `;
        }
        
        // Abre o modal
        abrirModal('modal-pedido');
    } catch (error) {
        console.error('Erro ao abrir modal do pedido:', error);
        alert('Não foi possível carregar os detalhes do pedido. Por favor, tente novamente mais tarde.');
    }
}

// Abre o modal de impressão
async function abrirModalImpressao(pedidoId) {
    try {
        // Obtém os detalhes do pedido
        const pedido = await obterDetalhesPedido(pedidoId);
        
        // Atualiza o título do modal
        document.querySelector('#modal-impressao .modal-header h3').textContent = `Imprimir Pedido ${pedidoId}`;
        
        // Preenche a pré-visualização da comanda
        const comandaHeader = document.querySelector('#modal-impressao .comanda-header');
        comandaHeader.innerHTML = `
            <h3>PizzaExpress</h3>
            <p>Av. das Pizzas, 123 - Centro</p>
            <p>Tel: (11) 3456-7890</p>
        `;
        
        // Formata a data
        const data = new Date(pedido.data);
        const dataFormatada = `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        
        // Preenche as informações do pedido
        const comandaInfo = document.querySelector('#modal-impressao .comanda-info');
        comandaInfo.innerHTML = `
            <p>Pedido: ${pedidoId}</p>
            <p>Data: ${dataFormatada}</p>
            <p>Cliente: ${pedido.cliente.nome}</p>
            <p>Tel: ${pedido.cliente.telefone}</p>
        `;
        
        // Preenche a tabela de itens
        const comandaItens = document.querySelector('#modal-impressao .comanda-itens table tbody');
        comandaItens.innerHTML = '';
        
        pedido.itens.forEach(item => {
            // Formata o tamanho
            let tamanhoTexto = '';
            switch (item.tamanho) {
                case 'pequena':
                    tamanhoTexto = 'P';
                    break;
                case 'media':
                    tamanhoTexto = 'M';
                    break;
                case 'grande':
                    tamanhoTexto = 'G';
                    break;
            }
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nome} (${tamanhoTexto})</td>
                <td>${item.quantidade}</td>
                <td>${item.preco.toFixed(2)}</td>
            `;
            
            comandaItens.appendChild(tr);
            
            // Adiciona os adicionais
            if (item.adicionais && item.adicionais.length > 0) {
                item.adicionais.forEach(adicional => {
                    const trAdicional = document.createElement('tr');
                    trAdicional.innerHTML = `
                        <td>- ${adicional === 'borda-recheada' ? 'Borda Recheada' : adicional === 'extra-queijo' ? 'Extra Queijo' : adicional}</td>
                        <td></td>
                        <td></td>
                    `;
                    
                    comandaItens.appendChild(trAdicional);
                });
            }
        });
        
        // Preenche os valores
        const comandaFooter = document.querySelector('#modal-impressao .comanda-itens table tfoot');
        comandaFooter.innerHTML = `
            <tr>
                <td colspan="2">Subtotal:</td>
                <td>${pedido.valores.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="2">Taxa de Entrega:</td>
                <td>${pedido.valores.taxaEntrega.toFixed(2)}</td>
            </tr>
            ${pedido.valores.desconto ? `
            <tr>
                <td colspan="2">Desconto:</td>
                <td>-${pedido.valores.desconto.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
                <td colspan="2"><strong>Total:</strong></td>
                <td><strong>${pedido.valores.total.toFixed(2)}</strong></td>
            </tr>
        `;
        
        // Formata a forma de pagamento
        let formaPagamento = '';
        switch (pedido.pagamento.forma) {
            case 'dinheiro':
                formaPagamento = `Dinheiro${pedido.pagamento.troco ? ' (Troco para R$ ' + pedido.pagamento.troco.toFixed(2) + ')' : ''}`;
                break;
            case 'cartao-credito':
                formaPagamento = 'Cartão de Crédito';
                break;
            case 'cartao-debito':
                formaPagamento = 'Cartão de Débito';
                break;
            case 'pix':
                formaPagamento = 'PIX';
                break;
        }
        
        // Preenche o rodapé da comanda
        const comandaFooterDiv = document.querySelector('#modal-impressao .comanda-footer');
        comandaFooterDiv.innerHTML = `
            <p>Forma de Pagamento: ${formaPagamento}</p>
            <p class="agradecimento">Obrigado pela preferência!</p>
        `;
        
        // Abre o modal
        abrirModal('modal-impressao');
    } catch (error) {
        console.error('Erro ao abrir modal de impressão:', error);
        alert('Não foi possível carregar os detalhes do pedido para impressão. Por favor, tente novamente mais tarde.');
    }
}

// Obtém os detalhes de um pedido
async function obterDetalhesPedido(pedidoId) {
    try {
        // Remove o # do ID do pedido
        const id = pedidoId.replace('#', '');
        
        // Obtém os detalhes do pedido do n8n
        const pedido = await window.N8nIntegration.obterPedidos({ id });
        
        // Retorna o primeiro pedido (deve ser único)
        return pedido[0];
    } catch (error) {
        console.error('Erro ao obter detalhes do pedido:', error);
        throw error;
    }
}

// Atualiza o status de um pedido
async function atualizarStatusPedido(pedidoId, novoStatus) {
    try {
        // Remove o # do ID do pedido
        const id = pedidoId.replace('#', '');
        
        // Atualiza o status do pedido no n8n
        await window.N8nIntegration.atualizarStatusPedido(id, novoStatus);
        
        // Recarrega os pedidos
        await carregarPedidos();
        
        // Fecha o modal de detalhes do pedido
        fecharModal('modal-pedido');
        
        // Exibe uma mensagem de sucesso
        alert('Status atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        alert('Não foi possível atualizar o status do pedido. Por favor, tente novamente mais tarde.');
    }
}

// Imprime um pedido
function imprimirPedido() {
    try {
        // Obtém as opções de impressão
        const formato = document.querySelector('input[name="formato"]:checked').value;
        const tamanho = document.querySelector('input[name="tamanho"]:checked').value;
        const incluirLogo = document.querySelector('input[name="opcao"][value="logo"]').checked;
        const incluirEndereco = document.querySelector('input[name="opcao"][value="endereco"]').checked;
        const incluirQRCode = document.querySelector('input[name="opcao"][value="qrcode"]').checked;
        
        // Obtém a pré-visualização da comanda
        const previewContainer = document.querySelector('.preview-container');
        
        // Cria um novo elemento para impressão
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Impressão de Pedido</title>
                    <style>
                        body {
                            font-family: 'Courier New', monospace;
                            font-size: 12px;
                            margin: 0;
                            padding: 20px;
                        }
                        
                        .comanda-preview {
                            width: ${tamanho === '80mm' ? '80mm' : '100%'};
                            margin: 0 auto;
                        }
                        
                        .comanda-header {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        
                        .comanda-header h3 {
                            font-size: 16px;
                            margin-bottom: 5px;
                        }
                        
                        .comanda-info {
                            margin-bottom: 20px;
                        }
                        
                        .comanda-itens table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        
                        .comanda-itens th,
                        .comanda-itens td {
                            padding: 5px;
                            text-align: left;
                            border-bottom: 1px dashed #ddd;
                        }
                        
                        .comanda-itens th {
                            font-weight: 700;
                        }
                        
                        .comanda-itens tfoot td {
                            border-bottom: none;
                            padding-top: 10px;
                        }
                        
                        .comanda-footer {
                            margin-top: 20px;
                            text-align: center;
                        }
                        
                        .agradecimento {
                            margin-top: 20px;
                            font-weight: 700;
                        }
                        
                        @media print {
                            body {
                                width: ${tamanho === '80mm' ? '80mm' : 'auto'};
                            }
                        }
                    </style>
                </head>
                <body>
                    ${previewContainer.innerHTML}
                </body>
            </html>
        `);
        
        // Fecha o modal de impressão
        fecharModal('modal-impressao');
        
        // Imprime o documento
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        
        // Exibe uma mensagem de sucesso
        alert('Pedido enviado para impressão!');
    } catch (error) {
        console.error('Erro ao imprimir pedido:', error);
        alert('Não foi possível imprimir o pedido. Por favor, tente novamente mais tarde.');
    }
}

// Imprime pedidos em lote
function imprimirPedidosEmLote(pedidosIds) {
    try {
        // Exibe uma mensagem de sucesso
        alert(`${pedidosIds.length} pedido(s) enviado(s) para impressão!`);
        
        // TODO: Implementar a impressão em lote
        console.log('Pedidos a serem impressos:', pedidosIds);
    } catch (error) {
        console.error('Erro ao imprimir pedidos em lote:', error);
        alert('Não foi possível imprimir os pedidos. Por favor, tente novamente mais tarde.');
    }
}

// Exporta os pedidos
function exportarPedidos() {
    try {
        // Obtém a tabela de pedidos
        const tabela = document.querySelector('.pedidos-table');
        
        // Cria um array para armazenar os dados
        const dados = [];
        
        // Adiciona o cabeçalho
        const cabecalho = [];
        tabela.querySelectorAll('thead th').forEach((th, index) => {
            // Ignora a primeira coluna (checkbox)
            if (index > 0) {
                cabecalho.push(th.textContent.trim());
            }
        });
        dados.push(cabecalho);
        
        // Adiciona as linhas
        tabela.querySelectorAll('tbody tr').forEach(tr => {
            const linha = [];
            tr.querySelectorAll('td').forEach((td, index) => {
                // Ignora a primeira coluna (checkbox)
                if (index > 0) {
                    // Para a coluna de status, obtém o texto do span
                    if (index === 6) {
                        linha.push(td.querySelector('.status-badge').textContent.trim());
                    } else {
                        linha.push(td.textContent.trim());
                    }
                }
            });
            dados.push(linha);
        });
        
        // Converte os dados para CSV
        const csv = dados.map(linha => linha.join(',')).join('\n');
        
        // Cria um blob com os dados
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        
        // Cria um link para download
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Exibe uma mensagem de sucesso
        alert('Pedidos exportados com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar pedidos:', error);
        alert('Não foi possível exportar os pedidos. Por favor, tente novamente mais tarde.');
    }
}

// Aplica filtros à tabela de pedidos
async function aplicarFiltros(filtros) {
    try {
        // Obtém os pedidos filtrados do n8n
        const pedidos = await window.N8nIntegration.obterPedidos(filtros);
        
        // Atualiza a tabela de pedidos
        atualizarTabelaPedidos(pedidos);
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        alert('Não foi possível aplicar os filtros. Por favor, tente novamente mais tarde.');
    }
}

// Abre um modal
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Fecha um modal
function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

