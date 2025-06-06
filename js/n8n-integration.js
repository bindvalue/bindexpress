/**
 * Arquivo de integração com o n8n
 * Este arquivo contém as funções para integração com o n8n para processamento de pedidos
 */

// Configuração da API do n8n
const N8N_CONFIG = {
    // URL base da API do n8n (deve ser substituída pela URL real do seu webhook n8n)
    baseUrl: 'https://seu-servidor-n8n.com/webhook/',
    
    // Endpoints
    endpoints: {
        // Webhook para envio de novos pedidos
        novoPedido: 'novo-pedido',
        
        // Webhook para atualização de status de pedidos
        atualizarStatus: 'atualizar-status',
        
        // Webhook para autenticação de usuários
        autenticar: 'autenticar',
        
        // Webhook para obter lista de pedidos
        obterPedidos: 'obter-pedidos'
    }
};

/**
 * Classe para gerenciar a integração com o n8n
 */
class N8nIntegration {
    /**
     * Envia um novo pedido para o n8n
     * @param {Object} pedido - Objeto contendo os dados do pedido
     * @returns {Promise} - Promise com o resultado da operação
     */
    static async enviarPedido(pedido) {
        try {
            // Adiciona timestamp ao pedido
            pedido.timestamp = new Date().toISOString();
            
            // Envia o pedido para o n8n
            const response = await fetch(`${N8N_CONFIG.baseUrl}${N8N_CONFIG.endpoints.novoPedido}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
            });
            
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro ao enviar pedido: ${response.status} ${response.statusText}`);
            }
            
            // Retorna os dados da resposta
            return await response.json();
        } catch (error) {
            console.error('Erro ao enviar pedido:', error);
            
            // Em caso de erro de conexão, salva o pedido localmente para tentar novamente depois
            this.salvarPedidoOffline(pedido);
            
            throw error;
        }
    }
    
    /**
     * Atualiza o status de um pedido no n8n
     * @param {string} pedidoId - ID do pedido
     * @param {string} novoStatus - Novo status do pedido
     * @returns {Promise} - Promise com o resultado da operação
     */
    static async atualizarStatusPedido(pedidoId, novoStatus) {
        try {
            // Envia a atualização de status para o n8n
            const response = await fetch(`${N8N_CONFIG.baseUrl}${N8N_CONFIG.endpoints.atualizarStatus}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify({
                    pedidoId,
                    status: novoStatus,
                    timestamp: new Date().toISOString()
                })
            });
            
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro ao atualizar status: ${response.status} ${response.statusText}`);
            }
            
            // Retorna os dados da resposta
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
            throw error;
        }
    }
    
    /**
     * Autentica um usuário no sistema
     * @param {string} usuario - Nome de usuário
     * @param {string} senha - Senha do usuário
     * @returns {Promise} - Promise com o resultado da operação
     */
    static async autenticar(usuario, senha) {
        try {
            // Envia as credenciais para o n8n
            const response = await fetch(`${N8N_CONFIG.baseUrl}${N8N_CONFIG.endpoints.autenticar}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usuario,
                    senha
                })
            });
            
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro de autenticação: ${response.status} ${response.statusText}`);
            }
            
            // Obtém os dados da resposta
            const data = await response.json();
            
            // Salva o token no localStorage
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
            }
            
            return data;
        } catch (error) {
            console.error('Erro ao autenticar usuário:', error);
            throw error;
        }
    }
    
    /**
     * Obtém a lista de pedidos do n8n
     * @param {Object} filtros - Filtros para a consulta
     * @returns {Promise} - Promise com o resultado da operação
     */
    static async obterPedidos(filtros = {}) {
        try {
            // Constrói a URL com os filtros
            const url = new URL(`${N8N_CONFIG.baseUrl}${N8N_CONFIG.endpoints.obterPedidos}`);
            
            // Adiciona os filtros como parâmetros de consulta
            Object.keys(filtros).forEach(key => {
                if (filtros[key]) {
                    url.searchParams.append(key, filtros[key]);
                }
            });
            
            // Envia a requisição para o n8n
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro ao obter pedidos: ${response.status} ${response.statusText}`);
            }
            
            // Retorna os dados da resposta
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter pedidos:', error);
            throw error;
        }
    }
    
    /**
     * Obtém o token de autenticação do localStorage
     * @returns {string} - Token de autenticação
     */
    static getToken() {
        return localStorage.getItem('authToken');
    }
    
    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean} - True se o usuário estiver autenticado, false caso contrário
     */
    static isAutenticado() {
        return !!this.getToken();
    }
    
    /**
     * Faz logout do usuário
     */
    static logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
    }
    
    /**
     * Salva um pedido offline para tentar enviar novamente depois
     * @param {Object} pedido - Objeto contendo os dados do pedido
     */
    static salvarPedidoOffline(pedido) {
        // Obtém os pedidos offline salvos
        const pedidosOffline = JSON.parse(localStorage.getItem('pedidosOffline') || '[]');
        
        // Adiciona o novo pedido à lista
        pedidosOffline.push({
            pedido,
            timestamp: new Date().toISOString()
        });
        
        // Salva a lista atualizada no localStorage
        localStorage.setItem('pedidosOffline', JSON.stringify(pedidosOffline));
        
        console.log('Pedido salvo offline para envio posterior');
    }
    
    /**
     * Tenta enviar os pedidos offline salvos
     * @returns {Promise} - Promise com o resultado da operação
     */
    static async enviarPedidosOffline() {
        // Obtém os pedidos offline salvos
        const pedidosOffline = JSON.parse(localStorage.getItem('pedidosOffline') || '[]');
        
        if (pedidosOffline.length === 0) {
            console.log('Não há pedidos offline para enviar');
            return;
        }
        
        console.log(`Tentando enviar ${pedidosOffline.length} pedidos offline`);
        
        // Lista de pedidos que não puderam ser enviados
        const pedidosNaoEnviados = [];
        
        // Tenta enviar cada pedido
        for (const item of pedidosOffline) {
            try {
                await this.enviarPedido(item.pedido);
                console.log('Pedido offline enviado com sucesso');
            } catch (error) {
                console.error('Erro ao enviar pedido offline:', error);
                pedidosNaoEnviados.push(item);
            }
        }
        
        // Atualiza a lista de pedidos offline
        if (pedidosNaoEnviados.length > 0) {
            localStorage.setItem('pedidosOffline', JSON.stringify(pedidosNaoEnviados));
            console.log(`${pedidosNaoEnviados.length} pedidos ainda não puderam ser enviados`);
        } else {
            localStorage.removeItem('pedidosOffline');
            console.log('Todos os pedidos offline foram enviados com sucesso');
        }
    }
}

// Exporta a classe para uso em outros arquivos
window.N8nIntegration = N8nIntegration;

// Tenta enviar pedidos offline quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Verifica a conexão com a internet antes de tentar enviar
    if (navigator.onLine) {
        N8nIntegration.enviarPedidosOffline()
            .catch(error => console.error('Erro ao enviar pedidos offline:', error));
    }
    
    // Adiciona listener para quando a conexão com a internet for restabelecida
    window.addEventListener('online', function() {
        console.log('Conexão com a internet restabelecida. Tentando enviar pedidos offline...');
        N8nIntegration.enviarPedidosOffline()
            .catch(error => console.error('Erro ao enviar pedidos offline:', error));
    });
});

