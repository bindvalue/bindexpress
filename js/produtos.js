/**
 * Gerenciador de Produtos - BindExpress Admin
 * Sistema completo de CRUD para produtos com integração n8n
 * Versão corrigida com modal funcional e produtos de amostra
 */

class ProdutosManager {
    constructor() {
        this.produtos = [];
        this.produtoAtual = null;
        this.filtros = {
            categoria: '',
            status: '',
            preco: '',
            busca: ''
        };
        this.paginacao = {
            paginaAtual: 1,
            itensPorPagina: 10,
            totalItens: 0,
            totalPaginas: 0
        };
        
        console.log('ProdutosManager iniciando...');
        this.init();
    }
    
    init() {
        console.log('Inicializando ProdutosManager...');
        this.carregarProdutos();
        this.bindEvents();
        this.renderizarProdutos();
        this.atualizarContadores();
        console.log('ProdutosManager inicializado com sucesso!');
    }
    
    carregarProdutos() {
        // Tentar carregar do localStorage primeiro
        const produtosSalvos = localStorage.getItem('produtos');
        
        if (produtosSalvos) {
            try {
                this.produtos = JSON.parse(produtosSalvos);
                console.log('Produtos carregados do localStorage:', this.produtos.length);
            } catch (error) {
                console.error('Erro ao carregar produtos do localStorage:', error);
                this.criarProdutosAmostra();
            }
        } else {
            console.log('Nenhum produto encontrado, criando produtos de amostra...');
            this.criarProdutosAmostra();
        }
    }
    
    criarProdutosAmostra() {
        this.produtos = [
            {
                id: 1,
                nome: 'Pizza Calabresa',
                descricao: 'Molho de tomate, mussarela, calabresa e cebola',
                categoria: 'pizza',
                preco: 45.90,
                precoPromocional: null,
                status: 'ativo',
                imagem: 'https://via.placeholder.com/150x150/FF6B35/FFFFFF?text=Pizza+Calabresa',
                tamanhos: ['pequena', 'media', 'grande'],
                adicionais: [
                    { nome: 'Calabresa extra', preco: 5.00 },
                    { nome: 'Queijo extra', preco: 4.00 }
                ],
                controleEstoque: 'sem_controle',
                quantidade: null,
                destaque: 'sim',
                calorias: 280,
                tempoPreparo: 25,
                restricoes: [],
                dataCriacao: new Date().toISOString()
            },
            {
                id: 2,
                nome: 'Pizza Margherita',
                descricao: 'Molho de tomate, mussarela, manjericão e tomate',
                categoria: 'pizza',
                preco: 42.90,
                precoPromocional: null,
                status: 'ativo',
                imagem: 'https://via.placeholder.com/150x150/28A745/FFFFFF?text=Pizza+Margherita',
                tamanhos: ['pequena', 'media', 'grande'],
                adicionais: [
                    { nome: 'Manjericão extra', preco: 3.00 },
                    { nome: 'Tomate extra', preco: 2.50 }
                ],
                controleEstoque: 'sem_controle',
                quantidade: null,
                destaque: 'nao',
                calorias: 260,
                tempoPreparo: 25,
                restricoes: ['vegetariano'],
                dataCriacao: new Date().toISOString()
            },
            {
                id: 3,
                nome: 'Pizza 4 Queijos',
                descricao: 'Molho de tomate, mussarela, parmesão, gorgonzola e provolone',
                categoria: 'pizza',
                preco: 52.90,
                precoPromocional: 47.90,
                status: 'ativo',
                imagem: 'https://via.placeholder.com/150x150/FFC107/000000?text=Pizza+4+Queijos',
                tamanhos: ['pequena', 'media', 'grande', 'familia'],
                adicionais: [
                    { nome: 'Queijo extra', preco: 6.00 },
                    { nome: 'Gorgonzola extra', preco: 8.00 }
                ],
                controleEstoque: 'sem_controle',
                quantidade: null,
                destaque: 'sim',
                calorias: 320,
                tempoPreparo: 30,
                restricoes: ['vegetariano'],
                dataCriacao: new Date().toISOString()
            },
            {
                id: 4,
                nome: 'Coca-Cola 2L',
                descricao: 'Refrigerante de cola gelado',
                categoria: 'bebida',
                preco: 12.00,
                precoPromocional: null,
                status: 'ativo',
                imagem: 'https://via.placeholder.com/150x150/DC3545/FFFFFF?text=Coca+Cola',
                tamanhos: [],
                adicionais: [],
                controleEstoque: 'com_controle',
                quantidade: 50,
                destaque: 'nao',
                calorias: 140,
                tempoPreparo: 0,
                restricoes: [],
                dataCriacao: new Date().toISOString()
            },
            {
                id: 5,
                nome: 'Pudim de Leite',
                descricao: 'Pudim caseiro com calda de caramelo',
                categoria: 'sobremesa',
                preco: 8.50,
                precoPromocional: null,
                status: 'ativo',
                imagem: 'https://via.placeholder.com/150x150/6F42C1/FFFFFF?text=Pudim',
                tamanhos: [],
                adicionais: [],
                controleEstoque: 'com_controle',
                quantidade: 15,
                destaque: 'nao',
                calorias: 180,
                tempoPreparo: 5,
                restricoes: [],
                dataCriacao: new Date().toISOString()
            },
            {
                id: 6,
                nome: 'Pão de Alho',
                descricao: 'Pão francês com manteiga de alho e ervas',
                categoria: 'entrada',
                preco: 15.90,
                precoPromocional: null,
                status: 'ativo',
                imagem: 'https://via.placeholder.com/150x150/17A2B8/FFFFFF?text=Pao+Alho',
                tamanhos: [],
                adicionais: [
                    { nome: 'Queijo extra', preco: 3.00 }
                ],
                controleEstoque: 'sem_controle',
                quantidade: null,
                destaque: 'nao',
                calorias: 220,
                tempoPreparo: 15,
                restricoes: ['vegetariano'],
                dataCriacao: new Date().toISOString()
            }
        ];
        
        this.salvarProdutos();
        console.log('Produtos de amostra criados:', this.produtos.length);
    }
    
    bindEvents() {
        console.log('Configurando eventos...');
        
        // Botão Novo Produto
        const btnNovoProduto = document.getElementById('btn-novo-produto');
        if (btnNovoProduto) {
            btnNovoProduto.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Botão Novo Produto clicado');
                this.abrirModalProduto();
            });
        } else {
            console.error('Botão btn-novo-produto não encontrado!');
        }
        
        // Modal Events
        const closeModal = document.getElementById('close-modal-produto');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.fecharModalProduto();
            });
        }
        
        const btnCancelar = document.getElementById('btn-cancelar-produto');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                this.fecharModalProduto();
            });
        }
        
        // Form Submit
        const formProduto = document.getElementById('form-produto');
        if (formProduto) {
            formProduto.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Formulário submetido');
                this.salvarProduto();
            });
        }
        
        // Categoria change - mostrar/ocultar seções específicas
        const selectCategoria = document.getElementById('produto-categoria');
        if (selectCategoria) {
            selectCategoria.addEventListener('change', (e) => {
                this.toggleSecoesPorCategoria(e.target.value);
            });
        }
        
        // Controle de estoque change
        const selectEstoque = document.getElementById('produto-estoque');
        if (selectEstoque) {
            selectEstoque.addEventListener('change', (e) => {
                this.toggleControleEstoque(e.target.value);
            });
        }
        
        // Upload de imagem
        this.setupImageUpload();
        
        // Adicionais
        const btnAddAdicional = document.getElementById('btn-add-adicional');
        if (btnAddAdicional) {
            btnAddAdicional.addEventListener('click', () => {
                this.adicionarAdicional();
            });
        }
        
        // Filtros
        const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');
        if (btnAplicarFiltros) {
            btnAplicarFiltros.addEventListener('click', () => {
                this.aplicarFiltros();
            });
        }
        
        const btnLimparFiltros = document.getElementById('btn-limpar-filtros');
        if (btnLimparFiltros) {
            btnLimparFiltros.addEventListener('click', () => {
                this.limparFiltros();
            });
        }
        
        // Busca
        const searchInput = document.getElementById('search-produtos');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filtros.busca = e.target.value;
                this.aplicarFiltros();
            });
        }
        
        // Tabs de categoria
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selecionarTab(e.target.dataset.category);
            });
        });
        
        // Select all checkbox
        const selectAll = document.getElementById('select-all-produtos');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                this.selecionarTodos(e.target.checked);
            });
        }
        
        // Paginação
        const btnPrevPage = document.getElementById('btn-prev-page');
        if (btnPrevPage) {
            btnPrevPage.addEventListener('click', () => {
                this.irParaPagina(this.paginacao.paginaAtual - 1);
            });
        }
        
        const btnNextPage = document.getElementById('btn-next-page');
        if (btnNextPage) {
            btnNextPage.addEventListener('click', () => {
                this.irParaPagina(this.paginacao.paginaAtual + 1);
            });
        }
        
        // Modal de exclusão
        const closeModalExclusao = document.getElementById('close-modal-exclusao');
        if (closeModalExclusao) {
            closeModalExclusao.addEventListener('click', () => {
                this.fecharModalExclusao();
            });
        }
        
        const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');
        if (btnCancelarExclusao) {
            btnCancelarExclusao.addEventListener('click', () => {
                this.fecharModalExclusao();
            });
        }
        
        const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
        if (btnConfirmarExclusao) {
            btnConfirmarExclusao.addEventListener('click', () => {
                this.confirmarExclusao();
            });
        }
        
        // Export/Import
        const btnExportar = document.getElementById('btn-exportar-produtos');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => {
                this.exportarProdutos();
            });
        }
        
        const btnImportar = document.getElementById('btn-importar-produtos');
        if (btnImportar) {
            btnImportar.addEventListener('click', () => {
                this.importarProdutos();
            });
        }
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal-produto');
            if (e.target === modal) {
                this.fecharModalProduto();
            }
            
            const modalExclusao = document.getElementById('modal-confirmar-exclusao');
            if (e.target === modalExclusao) {
                this.fecharModalExclusao();
            }
        });
        
        console.log('Eventos configurados com sucesso!');
    }
    
    abrirModalProduto(produto = null) {
        console.log('Abrindo modal para produto:', produto ? produto.nome : 'novo produto');
        
        this.produtoAtual = produto;
        const modal = document.getElementById('modal-produto');
        const title = document.getElementById('modal-produto-title');
        const form = document.getElementById('form-produto');
        
        if (!modal) {
            console.error('Modal não encontrado!');
            return;
        }
        
        if (produto) {
            title.textContent = 'Editar Produto';
            this.preencherFormulario(produto);
        } else {
            title.textContent = 'Novo Produto';
            form.reset();
            this.limparPreviewImagem();
            this.toggleSecoesPorCategoria('');
        }
        
        // Mostrar modal
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        console.log('Modal aberto com sucesso!');
    }
    
    fecharModalProduto() {
        console.log('Fechando modal...');
        
        const modal = document.getElementById('modal-produto');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.style.overflow = '';
            this.produtoAtual = null;
        }
    }
    
    preencherFormulario(produto) {
        console.log('Preenchendo formulário com produto:', produto.nome);
        
        document.getElementById('produto-id').value = produto.id;
        document.getElementById('produto-nome').value = produto.nome;
        document.getElementById('produto-categoria').value = produto.categoria;
        document.getElementById('produto-descricao').value = produto.descricao || '';
        document.getElementById('produto-preco').value = produto.preco;
        document.getElementById('produto-preco-promocional').value = produto.precoPromocional || '';
        document.getElementById('produto-estoque').value = produto.controleEstoque;
        document.getElementById('produto-quantidade').value = produto.quantidade || '';
        document.getElementById('produto-status').value = produto.status;
        document.getElementById('produto-destaque').value = produto.destaque;
        document.getElementById('produto-calorias').value = produto.calorias || '';
        document.getElementById('produto-tempo-preparo').value = produto.tempoPreparo || '';
        
        // Limpar tamanhos e restrições anteriores
        document.querySelectorAll('input[name="tamanhos"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[name="restricoes"]').forEach(cb => cb.checked = false);
        
        // Tamanhos
        if (produto.tamanhos) {
            produto.tamanhos.forEach(tamanho => {
                const checkbox = document.querySelector(`input[name="tamanhos"][value="${tamanho}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Restrições
        if (produto.restricoes) {
            produto.restricoes.forEach(restricao => {
                const checkbox = document.querySelector(`input[name="restricoes"][value="${restricao}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Adicionais
        const container = document.getElementById('adicionais-list');
        if (container) {
            container.innerHTML = '';
            if (produto.adicionais && produto.adicionais.length > 0) {
                produto.adicionais.forEach(adicional => {
                    this.adicionarAdicional(adicional.nome, adicional.preco);
                });
            } else {
                this.adicionarAdicional(); // Adicionar um campo vazio
            }
        }
        
        // Imagem
        if (produto.imagem) {
            this.mostrarPreviewImagem(produto.imagem);
        }
        
        this.toggleSecoesPorCategoria(produto.categoria);
        this.toggleControleEstoque(produto.controleEstoque);
    }
    
    toggleSecoesPorCategoria(categoria) {
        const tamanhosSection = document.getElementById('tamanhos-section');
        const adicionaisSection = document.getElementById('adicionais-section');
        
        if (tamanhosSection && adicionaisSection) {
            if (categoria === 'pizza') {
                tamanhosSection.style.display = 'block';
                adicionaisSection.style.display = 'block';
            } else {
                tamanhosSection.style.display = 'none';
                adicionaisSection.style.display = 'none';
            }
        }
    }
    
    toggleControleEstoque(controle) {
        const quantidadeGroup = document.getElementById('quantidade-estoque-group');
        const quantidadeInput = document.getElementById('produto-quantidade');
        
        if (quantidadeGroup && quantidadeInput) {
            if (controle === 'com_controle') {
                quantidadeGroup.style.display = 'block';
                quantidadeInput.required = true;
            } else {
                quantidadeGroup.style.display = 'none';
                quantidadeInput.required = false;
            }
        }
    }
    
    setupImageUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const fileInput = document.getElementById('produto-imagem');
        const placeholder = document.getElementById('upload-placeholder');
        const preview = document.getElementById('image-preview');
        const removeBtn = document.getElementById('remove-image');
        
        if (!uploadArea || !fileInput) return;
        
        // Click to upload
        uploadArea.addEventListener('click', (e) => {
            if (e.target !== removeBtn) {
                fileInput.click();
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.processarImagemUpload(e.target.files[0]);
            }
        });
        
        // Remove image
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.limparPreviewImagem();
            });
        }
    }
    
    processarImagemUpload(file) {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            this.mostrarNotificacao('Apenas arquivos de imagem são aceitos', 'error');
            return;
        }
        
        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.mostrarNotificacao('A imagem deve ter no máximo 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.mostrarPreviewImagem(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    mostrarPreviewImagem(src) {
        const placeholder = document.getElementById('upload-placeholder');
        const preview = document.getElementById('image-preview');
        const img = document.getElementById('preview-img');
        
        if (img && placeholder && preview) {
            img.src = src;
            placeholder.style.display = 'none';
            preview.style.display = 'block';
        }
    }
    
    limparPreviewImagem() {
        const placeholder = document.getElementById('upload-placeholder');
        const preview = document.getElementById('image-preview');
        const fileInput = document.getElementById('produto-imagem');
        
        if (fileInput) fileInput.value = '';
        if (placeholder) placeholder.style.display = 'block';
        if (preview) preview.style.display = 'none';
    }
    
    adicionarAdicional(nome = '', preco = '') {
        const container = document.getElementById('adicionais-list');
        if (!container) return;
        
        const adicionalDiv = document.createElement('div');
        adicionalDiv.className = 'adicional-item';
        adicionalDiv.innerHTML = `
            <input type="text" placeholder="Nome do adicional" class="adicional-nome" value="${nome}">
            <input type="number" placeholder="Preço" step="0.01" min="0" class="adicional-preco" value="${preco}">
            <button type="button" class="btn-remove-adicional">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        // Event listener para remover
        adicionalDiv.querySelector('.btn-remove-adicional').addEventListener('click', () => {
            adicionalDiv.remove();
        });
        
        container.appendChild(adicionalDiv);
    }
    
    salvarProduto() {
        console.log('Salvando produto...');
        
        const form = document.getElementById('form-produto');
        if (!form) {
            console.error('Formulário não encontrado!');
            return;
        }
        
        const formData = new FormData(form);
        
        // Validar campos obrigatórios
        if (!this.validarFormulario(formData)) {
            return;
        }
        
        const produto = this.construirObjetoProduto(formData);
        
        if (this.produtoAtual) {
            // Editar produto existente
            const index = this.produtos.findIndex(p => p.id === this.produtoAtual.id);
            if (index !== -1) {
                produto.id = this.produtoAtual.id;
                produto.dataCriacao = this.produtoAtual.dataCriacao;
                produto.dataAtualizacao = new Date().toISOString();
                this.produtos[index] = produto;
                this.mostrarNotificacao('Produto atualizado com sucesso!', 'success');
            }
        } else {
            // Criar novo produto
            produto.id = this.gerarNovoId();
            produto.dataCriacao = new Date().toISOString();
            this.produtos.push(produto);
            this.mostrarNotificacao('Produto criado com sucesso!', 'success');
        }
        
        this.salvarProdutos();
        this.renderizarProdutos();
        this.atualizarContadores();
        this.fecharModalProduto();
        
        // Integração com n8n (se disponível)
        this.sincronizarComN8n(produto, this.produtoAtual ? 'update' : 'create');
        
        console.log('Produto salvo com sucesso!');
    }
    
    validarFormulario(formData) {
        const nome = formData.get('nome');
        const categoria = formData.get('categoria');
        const preco = formData.get('preco');
        
        if (!nome || !categoria || !preco) {
            this.mostrarNotificacao('Preencha todos os campos obrigatórios', 'error');
            return false;
        }
        
        if (parseFloat(preco) <= 0) {
            this.mostrarNotificacao('O preço deve ser maior que zero', 'error');
            return false;
        }
        
        return true;
    }
    
    construirObjetoProduto(formData) {
        const produto = {
            nome: formData.get('nome'),
            descricao: formData.get('descricao') || '',
            categoria: formData.get('categoria'),
            preco: parseFloat(formData.get('preco')),
            precoPromocional: formData.get('precoPromocional') ? parseFloat(formData.get('precoPromocional')) : null,
            status: formData.get('status') || 'ativo',
            controleEstoque: formData.get('controleEstoque') || 'sem_controle',
            quantidade: formData.get('quantidade') ? parseInt(formData.get('quantidade')) : null,
            destaque: formData.get('destaque') || 'nao',
            calorias: formData.get('calorias') ? parseInt(formData.get('calorias')) : null,
            tempoPreparo: formData.get('tempoPreparo') ? parseInt(formData.get('tempoPreparo')) : null,
            tamanhos: [],
            adicionais: [],
            restricoes: [],
            imagem: null
        };
        
        // Tamanhos (apenas para pizzas)
        if (produto.categoria === 'pizza') {
            const tamanhosSelecionados = formData.getAll('tamanhos');
            produto.tamanhos = tamanhosSelecionados;
        }
        
        // Restrições
        const restricoesSelecionadas = formData.getAll('restricoes');
        produto.restricoes = restricoesSelecionadas;
        
        // Adicionais
        const adicionaisNomes = document.querySelectorAll('.adicional-nome');
        const adicionaisPrecos = document.querySelectorAll('.adicional-preco');
        
        for (let i = 0; i < adicionaisNomes.length; i++) {
            const nome = adicionaisNomes[i].value.trim();
            const preco = parseFloat(adicionaisPrecos[i].value);
            
            if (nome && preco > 0) {
                produto.adicionais.push({ nome, preco });
            }
        }
        
        // Imagem
        const previewImg = document.getElementById('preview-img');
        if (previewImg && previewImg.src && previewImg.src !== window.location.href) {
            produto.imagem = previewImg.src;
        } else {
            // Usar placeholder baseado na categoria
            const placeholders = {
                pizza: 'https://via.placeholder.com/150x150/FF6B35/FFFFFF?text=Pizza',
                bebida: 'https://via.placeholder.com/150x150/DC3545/FFFFFF?text=Bebida',
                sobremesa: 'https://via.placeholder.com/150x150/6F42C1/FFFFFF?text=Sobremesa',
                entrada: 'https://via.placeholder.com/150x150/17A2B8/FFFFFF?text=Entrada'
            };
            produto.imagem = placeholders[produto.categoria] || 'https://via.placeholder.com/150x150/6C757D/FFFFFF?text=Produto';
        }
        
        return produto;
    }
    
    gerarNovoId() {
        return this.produtos.length > 0 ? Math.max(...this.produtos.map(p => p.id)) + 1 : 1;
    }
    
    renderizarProdutos() {
        console.log('Renderizando produtos...');
        
        const produtosFiltrados = this.filtrarProdutos();
        
        // Calcular paginação
        this.paginacao.totalItens = produtosFiltrados.length;
        this.paginacao.totalPaginas = Math.ceil(this.paginacao.totalItens / this.paginacao.itensPorPagina);
        
        // Produtos da página atual
        const inicio = (this.paginacao.paginaAtual - 1) * this.paginacao.itensPorPagina;
        const fim = inicio + this.paginacao.itensPorPagina;
        const produtosPagina = produtosFiltrados.slice(inicio, fim);
        
        // Renderizar tabela
        const tbody = document.getElementById('produtos-tbody');
        if (!tbody) {
            console.error('Tbody não encontrado!');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (produtosPagina.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                        <p>Nenhum produto encontrado</p>
                    </td>
                </tr>
            `;
        } else {
            produtosPagina.forEach(produto => {
                tbody.appendChild(this.criarLinhaProduto(produto));
            });
        }
        
        this.atualizarPaginacao();
        console.log(`Produtos renderizados: ${produtosPagina.length} de ${produtosFiltrados.length}`);
    }
    
    filtrarProdutos() {
        return this.produtos.filter(produto => {
            // Filtro por categoria
            if (this.filtros.categoria && produto.categoria !== this.filtros.categoria) {
                return false;
            }
            
            // Filtro por status
            if (this.filtros.status && produto.status !== this.filtros.status) {
                return false;
            }
            
            // Filtro por preço
            if (this.filtros.preco) {
                const preco = produto.precoPromocional || produto.preco;
                if (this.filtros.preco === '0-30' && preco > 30) return false;
                if (this.filtros.preco === '30-60' && (preco <= 30 || preco > 60)) return false;
                if (this.filtros.preco === '60+' && preco <= 60) return false;
            }
            
            // Filtro por busca
            if (this.filtros.busca) {
                const busca = this.filtros.busca.toLowerCase();
                const nome = produto.nome.toLowerCase();
                const descricao = (produto.descricao || '').toLowerCase();
                
                if (!nome.includes(busca) && !descricao.includes(busca)) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    criarLinhaProduto(produto) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="select-produto" data-id="${produto.id}"></td>
            <td>
                <div class="produto-img">
                    <img src="${produto.imagem || 'https://via.placeholder.com/150x150/6C757D/FFFFFF?text=Produto'}" 
                         alt="${produto.nome}" 
                         onerror="this.src='https://via.placeholder.com/150x150/6C757D/FFFFFF?text=Erro'"
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </div>
            </td>
            <td>
                <div class="produto-info">
                    <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${produto.nome}</h4>
                    <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.3;">${produto.descricao || ''}</p>
                </div>
            </td>
            <td><span class="categoria-badge ${produto.categoria}">${this.formatarCategoria(produto.categoria)}</span></td>
            <td class="preco">
                ${produto.precoPromocional ? 
                    `<span style="text-decoration: line-through; color: #999; font-size: 12px;">R$ ${produto.preco.toFixed(2)}</span><br>
                     <strong style="color: #28a745;">R$ ${produto.precoPromocional.toFixed(2)}</strong>` :
                    `R$ ${produto.preco.toFixed(2)}`
                }
            </td>
            <td><span class="status-badge ${produto.status}">${produto.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
            <td class="estoque">${this.formatarEstoque(produto)}</td>
            <td>
                <div class="table-actions" style="display: flex; gap: 4px;">
                    <button class="btn-action view" title="Visualizar" onclick="window.produtosManager.visualizarProduto(${produto.id})" style="background: #17a2b8; color: white; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" title="Editar" onclick="window.produtosManager.editarProduto(${produto.id})" style="background: #ffc107; color: #212529; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action copy" title="Duplicar" onclick="window.produtosManager.duplicarProduto(${produto.id})" style="background: #6f42c1; color: white; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-action delete" title="Excluir" onclick="window.produtosManager.excluirProduto(${produto.id})" style="background: #dc3545; color: white; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        return tr;
    }
    
    formatarCategoria(categoria) {
        const categorias = {
            pizza: 'Pizza',
            bebida: 'Bebida',
            sobremesa: 'Sobremesa',
            entrada: 'Entrada'
        };
        return categorias[categoria] || categoria;
    }
    
    formatarEstoque(produto) {
        if (produto.controleEstoque === 'sem_controle') {
            return 'Sem controle';
        } else {
            if (produto.quantidade === 0) {
                return '<span style="color: #dc3545;">Sem estoque</span>';
            } else if (produto.quantidade <= 5) {
                return `<span style="color: #ffc107;">${produto.quantidade} unidades</span>`;
            } else {
                return `${produto.quantidade} unidades`;
            }
        }
    }
    
    atualizarContadores() {
        const contadores = {
            todos: this.produtos.length,
            pizza: this.produtos.filter(p => p.categoria === 'pizza').length,
            bebida: this.produtos.filter(p => p.categoria === 'bebida').length,
            sobremesa: this.produtos.filter(p => p.categoria === 'sobremesa').length,
            entrada: this.produtos.filter(p => p.categoria === 'entrada').length
        };
        
        // Atualizar contador "todos"
        const elementTodos = document.getElementById('count-todos');
        if (elementTodos) {
            elementTodos.textContent = contadores.todos;
        }
        
        // Atualizar outros contadores
        Object.keys(contadores).forEach(categoria => {
            if (categoria !== 'todos') {
                const element = document.getElementById(`count-${categoria}s`);
                if (element) {
                    element.textContent = contadores[categoria];
                }
            }
        });
        
        console.log('Contadores atualizados:', contadores);
    }
    
    atualizarPaginacao() {
        const currentPageEl = document.getElementById('current-page');
        const totalPagesEl = document.getElementById('total-pages');
        const btnPrev = document.getElementById('btn-prev-page');
        const btnNext = document.getElementById('btn-next-page');
        
        if (currentPageEl) currentPageEl.textContent = this.paginacao.paginaAtual;
        if (totalPagesEl) totalPagesEl.textContent = this.paginacao.totalPaginas;
        
        if (btnPrev) btnPrev.disabled = this.paginacao.paginaAtual === 1;
        if (btnNext) btnNext.disabled = this.paginacao.paginaAtual === this.paginacao.totalPaginas || this.paginacao.totalPaginas === 0;
    }
    
    // Métodos de ação
    visualizarProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;
        
        this.mostrarNotificacao(`Visualizando: ${produto.nome}`, 'info');
    }
    
    editarProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;
        
        this.abrirModalProduto(produto);
    }
    
    duplicarProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;
        
        const novoProduto = { ...produto };
        novoProduto.id = this.gerarNovoId();
        novoProduto.nome = `${produto.nome} (Cópia)`;
        novoProduto.dataCriacao = new Date().toISOString();
        delete novoProduto.dataAtualizacao;
        
        this.produtos.push(novoProduto);
        this.salvarProdutos();
        this.renderizarProdutos();
        this.atualizarContadores();
        this.mostrarNotificacao('Produto duplicado com sucesso!', 'success');
    }
    
    excluirProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;
        
        if (confirm(`Tem certeza que deseja excluir "${produto.nome}"?`)) {
            const index = this.produtos.findIndex(p => p.id === id);
            if (index !== -1) {
                this.produtos.splice(index, 1);
                this.salvarProdutos();
                this.renderizarProdutos();
                this.atualizarContadores();
                this.mostrarNotificacao('Produto excluído com sucesso!', 'success');
            }
        }
    }
    
    // Métodos de filtro
    aplicarFiltros() {
        this.filtros.categoria = document.getElementById('filtro-categoria').value;
        this.filtros.status = document.getElementById('filtro-status').value;
        this.filtros.preco = document.getElementById('filtro-preco').value;
        
        this.paginacao.paginaAtual = 1;
        this.renderizarProdutos();
    }
    
    limparFiltros() {
        document.getElementById('filtro-categoria').value = '';
        document.getElementById('filtro-status').value = '';
        document.getElementById('filtro-preco').value = '';
        document.getElementById('search-produtos').value = '';
        
        this.filtros = {
            categoria: '',
            status: '',
            preco: '',
            busca: ''
        };
        
        this.paginacao.paginaAtual = 1;
        this.renderizarProdutos();
        this.selecionarTab('todos');
    }
    
    selecionarTab(categoria) {
        // Atualizar visual das tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const tabBtn = document.querySelector(`[data-category="${categoria}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        }
        
        // Aplicar filtro
        if (categoria === 'todos') {
            this.filtros.categoria = '';
        } else {
            this.filtros.categoria = categoria;
        }
        
        this.paginacao.paginaAtual = 1;
        this.renderizarProdutos();
    }
    
    selecionarTodos(selecionado) {
        const checkboxes = document.querySelectorAll('.select-produto');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selecionado;
        });
    }
    
    irParaPagina(pagina) {
        if (pagina < 1 || pagina > this.paginacao.totalPaginas) return;
        
        this.paginacao.paginaAtual = pagina;
        this.renderizarProdutos();
    }
    
    // Métodos de persistência
    salvarProdutos() {
        localStorage.setItem('produtos', JSON.stringify(this.produtos));
        console.log('Produtos salvos no localStorage');
    }
    
    exportarProdutos() {
        const dataStr = JSON.stringify(this.produtos, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `produtos_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.mostrarNotificacao('Produtos exportados com sucesso!', 'success');
    }
    
    importarProdutos() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const produtosImportados = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(produtosImportados)) {
                        throw new Error('Formato de arquivo inválido');
                    }
                    
                    // Validar estrutura dos produtos
                    const produtosValidos = produtosImportados.filter(produto => {
                        return produto.nome && produto.categoria && produto.preco;
                    });
                    
                    if (produtosValidos.length === 0) {
                        throw new Error('Nenhum produto válido encontrado');
                    }
                    
                    // Adicionar IDs únicos
                    produtosValidos.forEach(produto => {
                        produto.id = this.gerarNovoId();
                        produto.dataCriacao = new Date().toISOString();
                    });
                    
                    this.produtos.push(...produtosValidos);
                    this.salvarProdutos();
                    this.renderizarProdutos();
                    this.atualizarContadores();
                    
                    this.mostrarNotificacao(`${produtosValidos.length} produtos importados com sucesso!`, 'success');
                    
                } catch (error) {
                    this.mostrarNotificacao(`Erro ao importar produtos: ${error.message}`, 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Integração n8n
    sincronizarComN8n(produto, acao) {
        // Verificar se n8n está disponível
        if (typeof window.n8nIntegration === 'undefined') {
            console.log('n8n não disponível, pulando sincronização');
            return;
        }
        
        try {
            const payload = {
                evento: `produto_${acao}`,
                produto: produto,
                timestamp: new Date().toISOString()
            };
            
            // Usar webhook personalizado para produtos (se configurado)
            const webhookUrl = localStorage.getItem('webhook_produtos_url') || 
                             `${window.n8nIntegration.config.baseUrl}/webhook/produtos`;
            
            window.n8nIntegration.makeRequest(webhookUrl, payload)
                .then(response => {
                    console.log('Produto sincronizado com n8n:', response);
                })
                .catch(error => {
                    console.warn('Erro ao sincronizar produto com n8n:', error);
                });
                
        } catch (error) {
            console.warn('Erro na integração n8n:', error);
        }
    }
    
    // Sistema de notificações
    mostrarNotificacao(mensagem, tipo = 'info') {
        console.log(`Notificação [${tipo}]: ${mensagem}`);
        
        // Criar toast se não existir
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.className = 'toast';
            toast.innerHTML = `
                <div class="toast-content">
                    <i class="toast-icon"></i>
                    <span class="toast-message"></span>
                </div>
                <button class="toast-close">&times;</button>
            `;
            document.body.appendChild(toast);
        }
        
        const icon = toast.querySelector('.toast-icon');
        const message = toast.querySelector('.toast-message');
        const closeBtn = toast.querySelector('.toast-close');
        
        // Configurar ícone baseado no tipo
        const icones = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        icon.className = `toast-icon ${icones[tipo] || icones.info}`;
        message.textContent = mensagem;
        
        // Remover classes de tipo anteriores
        toast.classList.remove('success', 'error', 'warning', 'info');
        toast.classList.add(tipo, 'show');
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
        
        // Event listener para fechar
        closeBtn.onclick = () => {
            toast.classList.remove('show');
        };
    }
    
    // Modal de exclusão (métodos vazios para compatibilidade)
    fecharModalExclusao() {
        // Implementação simplificada usando confirm()
    }
    
    confirmarExclusao() {
        // Implementação simplificada usando confirm()
    }
}

// Estilos CSS inline para garantir funcionamento
const style = document.createElement('style');
style.textContent = `
    /* Modal Styles */
    .modal {
        display: none;
        position: fixed;
        z-index: 9999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        overflow-y: auto;
    }
    
    .modal.show {
        display: block !important;
    }
    
    .modal-content {
        background-color: #fefefe;
        margin: 2% auto;
        padding: 0;
        border-radius: 8px;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
        padding: 20px 30px;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f8f9fa;
        border-radius: 8px 8px 0 0;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
    }
    
    .close {
        color: #aaa;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        line-height: 1;
    }
    
    .close:hover {
        color: #000;
    }
    
    .modal-body {
        padding: 30px;
        max-height: 60vh;
        overflow-y: auto;
    }
    
    .modal-footer {
        padding: 20px 30px;
        border-top: 1px solid #e9ecef;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        background-color: #f8f9fa;
        border-radius: 0 0 8px 8px;
    }
    
    /* Form Styles */
    .form-section {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e9ecef;
    }
    
    .form-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
    
    .form-section h4 {
        margin-bottom: 20px;
        color: #333;
        font-size: 16px;
        font-weight: 600;
    }
    
    .form-row {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .form-group {
        flex: 1;
        margin-bottom: 20px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
    }
    
    .form-group small {
        display: block;
        margin-top: 5px;
        color: #666;
        font-size: 12px;
    }
    
    /* Button Styles */
    .btn-primary {
        background-color: #F25C05;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-primary:hover {
        background-color: #e55100;
    }
    
    .btn-secondary {
        background-color: #6c757d;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
    }
    
    .btn-secondary:hover {
        background-color: #5a6268;
    }
    
    /* Toast Notification */
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 10000;
        border-left: 4px solid #ccc;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast.success {
        border-left-color: #28a745;
    }
    
    .toast.error {
        border-left-color: #dc3545;
    }
    
    .toast.warning {
        border-left-color: #ffc107;
    }
    
    .toast.info {
        border-left-color: #17a2b8;
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
    }
    
    .toast-icon {
        font-size: 20px;
    }
    
    .toast.success .toast-icon {
        color: #28a745;
    }
    
    .toast.error .toast-icon {
        color: #dc3545;
    }
    
    .toast.warning .toast-icon {
        color: #ffc107;
    }
    
    .toast.info .toast-icon {
        color: #17a2b8;
    }
    
    .toast-message {
        font-weight: 500;
        color: #333;
    }
    
    .toast-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 4px;
    }
    
    .toast-close:hover {
        color: #333;
    }
    
    /* Image Upload */
    .image-upload-area {
        border: 2px dashed #ddd;
        border-radius: 8px;
        padding: 40px 20px;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.3s ease;
        position: relative;
    }
    
    .image-upload-area:hover {
        border-color: #F25C05;
        background-color: rgba(242, 92, 5, 0.1);
    }
    
    .upload-placeholder i {
        font-size: 48px;
        color: #999;
        margin-bottom: 16px;
    }
    
    .upload-placeholder p {
        margin-bottom: 8px;
        color: #333;
        font-weight: 500;
    }
    
    .upload-placeholder small {
        color: #666;
    }
    
    .image-preview {
        position: relative;
        display: inline-block;
    }
    
    .image-preview img {
        max-width: 200px;
        max-height: 200px;
        border-radius: 8px;
        object-fit: cover;
    }
    
    .remove-image {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
    }
    
    /* Adicionais */
    .adicional-item {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
        align-items: center;
    }
    
    .adicional-nome {
        flex: 2;
    }
    
    .adicional-preco {
        flex: 1;
    }
    
    .btn-remove-adicional {
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .btn-remove-adicional:hover {
        background: #c82333;
    }
    
    /* Checkbox Labels */
    .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px 0;
    }
    
    .checkbox-label input[type="checkbox"] {
        margin: 0;
        width: auto;
    }
    
    .checkbox-label span {
        font-size: 14px;
        color: #333;
    }
    
    /* Status Badges */
    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .status-badge.ativo {
        background-color: #d4edda;
        color: #155724;
    }
    
    .status-badge.inativo {
        background-color: #f8d7da;
        color: #721c24;
    }
    
    /* Categoria Badges */
    .categoria-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .categoria-badge.pizza {
        background-color: #fff3cd;
        color: #856404;
    }
    
    .categoria-badge.bebida {
        background-color: #d1ecf1;
        color: #0c5460;
    }
    
    .categoria-badge.sobremesa {
        background-color: #e2e3f1;
        color: #383d41;
    }
    
    .categoria-badge.entrada {
        background-color: #d4edda;
        color: #155724;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
            margin: 5% auto;
        }
        
        .form-row {
            flex-direction: column;
            gap: 0;
        }
        
        .adicional-item {
            flex-direction: column;
            align-items: stretch;
        }
        
        .adicional-nome,
        .adicional-preco {
            flex: none;
        }
        
        .toast {
            right: 10px;
            left: 10px;
            min-width: auto;
        }
    }
`;

document.head.appendChild(style);

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando ProdutosManager...');
    window.produtosManager = new ProdutosManager();
});

// Fallback caso o DOMContentLoaded já tenha disparado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.produtosManager) {
            console.log('Fallback: Inicializando ProdutosManager...');
            window.produtosManager = new ProdutosManager();
        }
    });
} else {
    console.log('DOM já carregado, inicializando ProdutosManager imediatamente...');
    window.produtosManager = new ProdutosManager();
}

