/**
 * Integração com n8n - BindExpress Admin
 * Gerencia todas as comunicações com os webhooks do n8n
 */

class N8nIntegration {
    constructor() {
        this.config = {
            baseUrl: localStorage.getItem('n8n_base_url') || 'https://n8n.bindvalue.com.br',
            apiKey: localStorage.getItem('n8n_api_key') || '',
            timeout: parseInt(localStorage.getItem('n8n_timeout')) || 30000,
            retryAttempts: parseInt(localStorage.getItem('n8n_retry')) || 3,
            debugMode: localStorage.getItem('n8n_debug') === 'true',
            offlineQueue: localStorage.getItem('n8n_offline_queue') === 'true'
        };
        
        this.webhooks = {
            novoPedido: localStorage.getItem('webhook_pedidos_url') || 'https://n8n.bindvalue.com.br/webhook/novo-pedido',
            atualizarStatus: localStorage.getItem('webhook_status_url') || 'https://n8n.bindvalue.com.br/webhook/atualizar-status',
            autenticar: localStorage.getItem('webhook_auth_url') || 'https://n8n.bindvalue.com.br/webhook/autenticar',
            obterPedidos: localStorage.getItem('webhook_listar_url') || 'https://n8n.bindvalue.com.br/webhook/obter-pedidos',
            contato: localStorage.getItem('webhook_contato_url') || 'https://n8n.bindvalue.com.br/webhook/contato'
        };
        
        this.isOnline = navigator.onLine;
        this.offlineQueue = JSON.parse(localStorage.getItem('n8n_offline_requests') || '[]');
        
        this.initEventListeners();
        this.processOfflineQueue();
    }
    
    initEventListeners() {
        // Monitora status de conexão
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectionStatus(true);
            this.processOfflineQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectionStatus(false);
        });
    }
    
    updateConnectionStatus(isOnline) {
        const statusIndicator = document.getElementById('n8n-status');
        if (statusIndicator) {
            const indicator = statusIndicator.querySelector('.status-indicator');
            const text = statusIndicator.querySelector('.status-text');
            
            if (isOnline) {
                indicator.classList.remove('offline');
                indicator.classList.add('online');
                text.textContent = 'Conectado';
            } else {
                indicator.classList.remove('online');
                indicator.classList.add('offline');
                text.textContent = 'Desconectado';
            }
        }
    }
    
    async makeRequest(url, data = null, method = 'POST') {
        const requestId = this.generateRequestId();
        
        try {
            if (this.config.debugMode) {
                console.log(`[N8N] ${method} ${url}`, data);
            }
            
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': requestId
                },
                timeout: this.config.timeout
            };
            
            if (this.config.apiKey) {
                options.headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }
            
            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }
            
            const response = await this.fetchWithTimeout(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (this.config.debugMode) {
                console.log(`[N8N] Response:`, result);
            }
            
            this.logRequest('SUCCESS', `${method} ${url} - ${response.status}`);
            this.updateStats('success');
            
            return result;
            
        } catch (error) {
            if (this.config.debugMode) {
                console.error(`[N8N] Error:`, error);
            }
            
            this.logRequest('ERROR', `${method} ${url} - ${error.message}`);
            this.updateStats('error');
            
            // Se estiver offline e a fila offline estiver habilitada
            if (!this.isOnline && this.config.offlineQueue && method !== 'GET') {
                this.addToOfflineQueue(url, data, method);
                throw new Error('Requisição adicionada à fila offline');
            }
            
            // Tentar novamente se configurado
            if (this.config.retryAttempts > 0) {
                return this.retryRequest(url, data, method, this.config.retryAttempts);
            }
            
            throw error;
        }
    }
    
    async fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Timeout na requisição');
            }
            throw error;
        }
    }
    
    async retryRequest(url, data, method, attemptsLeft) {
        if (attemptsLeft <= 0) {
            throw new Error('Máximo de tentativas excedido');
        }
        
        this.logRequest('WARNING', `Tentando novamente... (${this.config.retryAttempts - attemptsLeft + 1}/${this.config.retryAttempts})`);
        
        // Aguarda um tempo antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000 * (this.config.retryAttempts - attemptsLeft + 1)));
        
        try {
            return await this.makeRequest(url, data, method);
        } catch (error) {
            return this.retryRequest(url, data, method, attemptsLeft - 1);
        }
    }
    
    addToOfflineQueue(url, data, method) {
        const request = {
            id: this.generateRequestId(),
            url: url,
            data: data,
            method: method,
            timestamp: new Date().toISOString()
        };
        
        this.offlineQueue.push(request);
        localStorage.setItem('n8n_offline_requests', JSON.stringify(this.offlineQueue));
        
        this.updateOfflineQueueCount();
        this.logRequest('INFO', `Requisição adicionada à fila offline: ${method} ${url}`);
    }
    
    async processOfflineQueue() {
        if (!this.isOnline || this.offlineQueue.length === 0) {
            return;
        }
        
        this.logRequest('INFO', `Processando ${this.offlineQueue.length} requisições da fila offline`);
        
        const processedRequests = [];
        
        for (const request of this.offlineQueue) {
            try {
                await this.makeRequest(request.url, request.data, request.method);
                processedRequests.push(request.id);
                this.logRequest('SUCCESS', `Requisição offline processada: ${request.method} ${request.url}`);
            } catch (error) {
                this.logRequest('ERROR', `Falha ao processar requisição offline: ${error.message}`);
                // Mantém na fila para tentar novamente depois
            }
        }
        
        // Remove requisições processadas com sucesso
        this.offlineQueue = this.offlineQueue.filter(req => !processedRequests.includes(req.id));
        localStorage.setItem('n8n_offline_requests', JSON.stringify(this.offlineQueue));
        
        this.updateOfflineQueueCount();
    }
    
    updateOfflineQueueCount() {
        const queueElement = document.getElementById('fila-offline');
        if (queueElement) {
            queueElement.textContent = `${this.offlineQueue.length} itens`;
        }
    }
    
    generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    logRequest(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = { timestamp, type, message };
        
        // Adiciona ao log visual se existir
        const logsContainer = document.getElementById('logs-container');
        if (logsContainer) {
            const logElement = document.createElement('div');
            logElement.className = `log-entry ${type.toLowerCase()}`;
            logElement.innerHTML = `
                <span class="log-time">${timestamp}</span>
                <span class="log-type">${type}</span>
                <span class="log-message">${message}</span>
            `;
            
            logsContainer.insertBefore(logElement, logsContainer.firstChild);
            
            // Mantém apenas os últimos 50 logs
            while (logsContainer.children.length > 50) {
                logsContainer.removeChild(logsContainer.lastChild);
            }
        }
        
        // Salva no localStorage para persistência
        const logs = JSON.parse(localStorage.getItem('n8n_logs') || '[]');
        logs.unshift(logEntry);
        logs.splice(100); // Mantém apenas os últimos 100 logs
        localStorage.setItem('n8n_logs', JSON.stringify(logs));
    }
    
    updateStats(type) {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('n8n_stats') || '{}');
        
        if (!stats[today]) {
            stats[today] = { success: 0, error: 0 };
        }
        
        stats[today][type]++;
        localStorage.setItem('n8n_stats', JSON.stringify(stats));
        
        // Atualiza elementos na tela
        const todayStats = stats[today];
        const total = todayStats.success + todayStats.error;
        const successRate = total > 0 ? ((todayStats.success / total) * 100).toFixed(1) : 100;
        
        const reqElement = document.getElementById('requisicoes-hoje');
        const taxaElement = document.getElementById('taxa-sucesso');
        
        if (reqElement) reqElement.textContent = total;
        if (taxaElement) taxaElement.textContent = `${successRate}%`;
    }
    
    // Métodos específicos para cada tipo de webhook
    
    async enviarNovoPedido(pedidoData) {
        if (!this.isWebhookEnabled('pedidos')) {
            throw new Error('Webhook de novos pedidos está desabilitado');
        }
        
        return await this.makeRequest(this.webhooks.novoPedido, {
            evento: 'novo_pedido',
            pedido: pedidoData,
            timestamp: new Date().toISOString()
        });
    }
    
    async atualizarStatusPedido(pedidoId, novoStatus, observacoes = '') {
        if (!this.isWebhookEnabled('status')) {
            throw new Error('Webhook de atualização de status está desabilitado');
        }
        
        return await this.makeRequest(this.webhooks.atualizarStatus, {
            evento: 'status_atualizado',
            pedido_id: pedidoId,
            status: novoStatus,
            observacoes: observacoes,
            timestamp: new Date().toISOString()
        });
    }
    
    async autenticarUsuario(email, senha) {
        if (!this.isWebhookEnabled('auth')) {
            throw new Error('Webhook de autenticação está desabilitado');
        }
        
        return await this.makeRequest(this.webhooks.autenticar, {
            evento: 'autenticacao',
            email: email,
            senha: senha,
            timestamp: new Date().toISOString()
        });
    }
    
    async obterListaPedidos(filtros = {}) {
        if (!this.isWebhookEnabled('listar')) {
            throw new Error('Webhook de listagem está desabilitado');
        }
        
        return await this.makeRequest(this.webhooks.obterPedidos, {
            evento: 'obter_pedidos',
            filtros: filtros,
            timestamp: new Date().toISOString()
        });
    }
    
    async enviarContato(dadosContato) {
        if (!this.isWebhookEnabled('contato')) {
            throw new Error('Webhook de contato está desabilitado');
        }
        
        return await this.makeRequest(this.webhooks.contato, {
            evento: 'contato',
            dados: dadosContato,
            timestamp: new Date().toISOString()
        });
    }
    
    isWebhookEnabled(webhookType) {
        return localStorage.getItem(`webhook_${webhookType}`) !== 'false';
    }
    
    // Métodos de configuração
    
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        
        // Salva no localStorage
        Object.keys(newConfig).forEach(key => {
            localStorage.setItem(`n8n_${key}`, newConfig[key]);
        });
    }
    
    updateWebhooks(newWebhooks) {
        Object.assign(this.webhooks, newWebhooks);
        
        // Salva no localStorage
        Object.keys(newWebhooks).forEach(key => {
            localStorage.setItem(`webhook_${key}_url`, newWebhooks[key]);
        });
    }
    
    async testConnection() {
        try {
            const testUrl = `${this.config.baseUrl}/health`;
            const response = await this.fetchWithTimeout(testUrl, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                this.logRequest('SUCCESS', 'Teste de conexão bem-sucedido');
                this.updateConnectionStatus(true);
                return { success: true, message: 'Conexão estabelecida com sucesso' };
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            this.logRequest('ERROR', `Teste de conexão falhou: ${error.message}`);
            this.updateConnectionStatus(false);
            return { success: false, message: error.message };
        }
    }
    
    async testWebhook(webhookType) {
        const webhookUrl = this.webhooks[webhookType];
        if (!webhookUrl) {
            throw new Error('URL do webhook não configurada');
        }
        
        try {
            const testData = {
                evento: 'teste',
                webhook_type: webhookType,
                timestamp: new Date().toISOString()
            };
            
            const response = await this.makeRequest(webhookUrl, testData);
            this.logRequest('SUCCESS', `Teste do webhook ${webhookType} bem-sucedido`);
            return { success: true, response };
        } catch (error) {
            this.logRequest('ERROR', `Teste do webhook ${webhookType} falhou: ${error.message}`);
            throw error;
        }
    }
    
    clearLogs() {
        localStorage.removeItem('n8n_logs');
        const logsContainer = document.getElementById('logs-container');
        if (logsContainer) {
            logsContainer.innerHTML = '';
        }
        this.logRequest('INFO', 'Logs limpos');
    }
    
    exportLogs() {
        const logs = JSON.parse(localStorage.getItem('n8n_logs') || '[]');
        const dataStr = JSON.stringify(logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `n8n_logs_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
    
    getStats() {
        const stats = JSON.parse(localStorage.getItem('n8n_stats') || '{}');
        const today = new Date().toDateString();
        
        return {
            today: stats[today] || { success: 0, error: 0 },
            all: stats
        };
    }
}

// Instância global
window.n8nIntegration = new N8nIntegration();

// Funções utilitárias globais
window.n8nUtils = {
    // Copia URL do webhook para a área de transferência
    copyWebhookUrl: function(webhookType) {
        const url = window.n8nIntegration.webhooks[webhookType];
        if (url) {
            navigator.clipboard.writeText(url).then(() => {
                this.showNotification('URL copiada para a área de transferência', 'success');
            }).catch(() => {
                this.showNotification('Erro ao copiar URL', 'error');
            });
        }
    },
    
    // Testa webhook específico
    testWebhook: async function(webhookType) {
        try {
            const result = await window.n8nIntegration.testWebhook(webhookType);
            this.showNotification('Teste do webhook realizado com sucesso', 'success');
            return result;
        } catch (error) {
            this.showNotification(`Erro no teste: ${error.message}`, 'error');
            throw error;
        }
    },
    
    // Testa conexão com n8n
    testConnection: async function() {
        try {
            const result = await window.n8nIntegration.testConnection();
            this.showNotification(result.message, result.success ? 'success' : 'error');
            return result;
        } catch (error) {
            this.showNotification(`Erro na conexão: ${error.message}`, 'error');
            throw error;
        }
    },
    
    // Mostra notificação
    showNotification: function(message, type = 'info') {
        // Implementação simples de notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideInRight 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#27ae60';
                break;
            case 'error':
                notification.style.backgroundColor = '#e74c3c';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f39c12';
                break;
            default:
                notification.style.backgroundColor = '#3498db';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
};

// CSS para animação da notificação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

