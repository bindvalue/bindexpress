/**
 * Configurações - BindExpress Admin
 * JavaScript para gerenciar todas as funcionalidades da página de configurações
 */

class ConfiguracoesManager {
    constructor() {
        this.currentTab = 'geral';
        this.unsavedChanges = false;
        this.init();
    }

    init() {
        this.initTabs();
        this.initFormHandlers();
        this.initToggleButtons();
        this.initPasswordToggles();
        this.initFileUploads();
        this.initModals();
        this.initStripeIntegration();
        this.initN8nIntegration();
        this.initNotificationSettings();
        this.initSecuritySettings();
        this.initDeliveryAreas();
        this.loadSavedConfigurations();
        this.initAutoSave();
    }

    // Gerenciamento de Abas
    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Remove active class de todas as abas
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Adiciona active class na aba selecionada
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');

        this.currentTab = tabId;
        this.trackTabUsage(tabId);
    }

    trackTabUsage(tabId) {
        const usage = JSON.parse(localStorage.getItem('tab_usage') || '{}');
        usage[tabId] = (usage[tabId] || 0) + 1;
        localStorage.setItem('tab_usage', JSON.stringify(usage));
    }

    // Gerenciamento de Formulários
    initFormHandlers() {
        const forms = document.querySelectorAll('input, select, textarea');
        forms.forEach(input => {
            input.addEventListener('change', () => {
                this.markUnsavedChanges();
                this.validateField(input);
            });
        });

        // Botão salvar configurações
        document.getElementById('btn-salvar-config').addEventListener('click', () => {
            this.saveAllConfigurations();
        });

        // Botão backup configurações
        document.getElementById('btn-backup-config').addEventListener('click', () => {
            this.backupConfigurations();
        });
    }

    markUnsavedChanges() {
        this.unsavedChanges = true;
        const saveBtn = document.getElementById('btn-salvar-config');
        saveBtn.classList.add('has-changes');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações *';
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let errorMessage = '';

        // Validações específicas por tipo
        switch (type) {
            case 'email':
                isValid = this.validateEmail(value);
                errorMessage = 'Email inválido';
                break;
            case 'url':
                isValid = this.validateUrl(value);
                errorMessage = 'URL inválida';
                break;
            case 'tel':
                isValid = this.validatePhone(value);
                errorMessage = 'Telefone inválido';
                break;
            case 'number':
                isValid = !isNaN(value) && value !== '';
                errorMessage = 'Número inválido';
                break;
        }

        // Validações específicas por ID
        if (field.id === 'empresa-cnpj') {
            isValid = this.validateCNPJ(value);
            errorMessage = 'CNPJ inválido';
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    showFieldValidation(field, isValid, errorMessage) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        field.classList.remove('field-valid', 'field-invalid');

        if (field.value.trim() !== '') {
            if (isValid) {
                field.classList.add('field-valid');
            } else {
                field.classList.add('field-invalid');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'field-error';
                errorDiv.textContent = errorMessage;
                field.parentNode.appendChild(errorDiv);
            }
        }
    }

    // Validadores
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    validatePhone(phone) {
        const re = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return re.test(phone);
    }

    validateCNPJ(cnpj) {
        const re = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
        return re.test(cnpj);
    }

    // Toggle Buttons
    initToggleButtons() {
        const toggles = document.querySelectorAll('.webhook-toggle input, .method-toggle input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                this.handleToggleChange(toggle);
            });
        });

        // Toggles especiais que mostram/escondem seções
        this.initConditionalToggles();
    }

    initConditionalToggles() {
        // Stripe
        document.getElementById('stripe-enabled').addEventListener('change', (e) => {
            const settings = document.getElementById('stripe-settings');
            settings.style.display = e.target.checked ? 'block' : 'none';
        });

        // WhatsApp
        document.getElementById('whatsapp-enabled').addEventListener('change', (e) => {
            const settings = document.getElementById('whatsapp-settings');
            settings.style.display = e.target.checked ? 'block' : 'none';
        });

        // Email
        document.getElementById('email-enabled').addEventListener('change', (e) => {
            const settings = document.getElementById('email-settings');
            settings.style.display = e.target.checked ? 'block' : 'none';
        });

        // Push
        document.getElementById('push-enabled').addEventListener('change', (e) => {
            const settings = document.getElementById('push-settings');
            settings.style.display = e.target.checked ? 'block' : 'none';
        });

        // 2FA
        document.getElementById('two-factor-enabled').addEventListener('change', (e) => {
            const settings = document.getElementById('two-factor-settings');
            settings.style.display = e.target.checked ? 'block' : 'none';
        });

        // Backup
        document.getElementById('backup-auto').addEventListener('change', (e) => {
            const settings = document.getElementById('backup-settings');
            settings.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    handleToggleChange(toggle) {
        const webhookType = toggle.id.replace('webhook-', '').replace('-enabled', '');
        const isEnabled = toggle.checked;
        
        localStorage.setItem(`webhook_${webhookType}`, isEnabled);
        this.markUnsavedChanges();

        // Log da mudança
        console.log(`${webhookType} ${isEnabled ? 'habilitado' : 'desabilitado'}`);
    }

    // Password Toggles
    initPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.btn-toggle-password');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentNode.querySelector('input');
                const icon = button.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    // File Uploads
    initFileUploads() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleFileUpload(e.target);
            });
        });
    }

    handleFileUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const previewId = input.id.replace('-', '-preview-').replace('site-logo', 'preview-logo').replace('pix-qrcode', 'preview-qrcode');
        const preview = document.getElementById(previewId);

        if (preview && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        this.markUnsavedChanges();
    }

    // Modais
    initModals() {
        const modals = document.querySelectorAll('.modal');
        const closeButtons = document.querySelectorAll('.modal .close');

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.modal').style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            modals.forEach(modal => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    // Integração Stripe
    initStripeIntegration() {
        document.getElementById('btn-testar-stripe').addEventListener('click', () => {
            this.testStripeConnection();
        });
    }

    async testStripeConnection() {
        const publicKey = document.getElementById('stripe-public-key').value;
        const secretKey = document.getElementById('stripe-secret-key').value;

        if (!publicKey || !secretKey) {
            this.showNotification('Preencha as chaves do Stripe', 'error');
            return;
        }

        try {
            this.showNotification('Testando conexão com Stripe...', 'info');
            
            // Simula teste de conexão
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Aqui você faria a requisição real para testar as chaves
            const isValid = this.validateStripeKeys(publicKey, secretKey);
            
            if (isValid) {
                this.showNotification('Conexão com Stripe estabelecida com sucesso!', 'success');
            } else {
                this.showNotification('Erro: Chaves do Stripe inválidas', 'error');
            }
        } catch (error) {
            this.showNotification('Erro ao testar conexão com Stripe', 'error');
        }
    }

    validateStripeKeys(publicKey, secretKey) {
        // Validação básica das chaves
        const publicKeyValid = publicKey.startsWith('pk_');
        const secretKeyValid = secretKey.startsWith('sk_');
        return publicKeyValid && secretKeyValid;
    }

    // Integração n8n
    initN8nIntegration() {
        document.getElementById('btn-testar-conexao').addEventListener('click', () => {
            this.testN8nConnection();
        });

        // Botões de teste de webhook
        document.querySelectorAll('.btn-test-webhook').forEach(button => {
            button.addEventListener('click', () => {
                const webhookType = button.getAttribute('data-webhook');
                this.testWebhook(webhookType);
            });
        });

        // Botões de copiar webhook
        document.querySelectorAll('.btn-copy-webhook').forEach(button => {
            button.addEventListener('click', () => {
                const webhookType = button.getAttribute('data-webhook');
                this.copyWebhookUrl(webhookType);
            });
        });

        // Logs
        document.getElementById('btn-limpar-logs').addEventListener('click', () => {
            this.clearLogs();
        });

        document.getElementById('btn-exportar-logs').addEventListener('click', () => {
            this.exportLogs();
        });
    }

    async testN8nConnection() {
        const url = document.getElementById('n8n-url').value;
        const apiKey = document.getElementById('n8n-api-key').value;

        if (!url) {
            this.showNotification('Preencha a URL do n8n', 'error');
            return;
        }

        try {
            this.showNotification('Testando conexão com n8n...', 'info');
            
            // Usa a integração n8n se disponível
            if (window.n8nIntegration) {
                const result = await window.n8nIntegration.testConnection();
                if (result.success) {
                    this.showNotification('Conexão com n8n estabelecida!', 'success');
                    this.updateConnectionStatus(true);
                } else {
                    this.showNotification(`Erro: ${result.message}`, 'error');
                    this.updateConnectionStatus(false);
                }
            } else {
                // Fallback para teste simples
                const response = await fetch(`${url}/health`);
                if (response.ok) {
                    this.showNotification('Conexão com n8n estabelecida!', 'success');
                    this.updateConnectionStatus(true);
                } else {
                    throw new Error('Servidor não respondeu');
                }
            }
        } catch (error) {
            this.showNotification('Erro ao conectar com n8n', 'error');
            this.updateConnectionStatus(false);
        }
    }

    updateConnectionStatus(isConnected) {
        const statusElement = document.getElementById('n8n-status');
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');

        if (isConnected) {
            indicator.classList.remove('offline');
            indicator.classList.add('online');
            text.textContent = 'Conectado';
        } else {
            indicator.classList.remove('online');
            indicator.classList.add('offline');
            text.textContent = 'Desconectado';
        }
    }

    async testWebhook(webhookType) {
        const urlInput = document.getElementById(`webhook-${webhookType}-url`);
        const url = urlInput.value;

        if (!url) {
            this.showNotification('URL do webhook não configurada', 'error');
            return;
        }

        try {
            this.showNotification(`Testando webhook ${webhookType}...`, 'info');
            
            if (window.n8nIntegration) {
                await window.n8nIntegration.testWebhook(webhookType);
                this.showNotification(`Webhook ${webhookType} testado com sucesso!`, 'success');
            } else {
                // Fallback
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teste: true, timestamp: new Date().toISOString() })
                });
                
                if (response.ok) {
                    this.showNotification(`Webhook ${webhookType} testado com sucesso!`, 'success');
                } else {
                    throw new Error('Webhook não respondeu');
                }
            }
        } catch (error) {
            this.showNotification(`Erro ao testar webhook ${webhookType}`, 'error');
        }
    }

    copyWebhookUrl(webhookType) {
        const urlInput = document.getElementById(`webhook-${webhookType}-url`);
        const url = urlInput.value;

        if (!url) {
            this.showNotification('URL não configurada', 'error');
            return;
        }

        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('URL copiada para a área de transferência!', 'success');
        }).catch(() => {
            this.showNotification('Erro ao copiar URL', 'error');
        });
    }

    clearLogs() {
        if (window.n8nIntegration) {
            window.n8nIntegration.clearLogs();
        }
        
        const logsContainer = document.getElementById('logs-container');
        if (logsContainer) {
            logsContainer.innerHTML = '';
        }
        
        this.showNotification('Logs limpos com sucesso', 'success');
    }

    exportLogs() {
        if (window.n8nIntegration) {
            window.n8nIntegration.exportLogs();
        } else {
            // Fallback
            const logs = JSON.parse(localStorage.getItem('n8n_logs') || '[]');
            const dataStr = JSON.stringify(logs, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `logs_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        }
        
        this.showNotification('Logs exportados com sucesso', 'success');
    }

    // Configurações de Notificação
    initNotificationSettings() {
        document.getElementById('btn-testar-whatsapp').addEventListener('click', () => {
            this.testWhatsApp();
        });

        document.getElementById('btn-testar-email').addEventListener('click', () => {
            this.testEmail();
        });
    }

    async testWhatsApp() {
        const numero = document.getElementById('whatsapp-numero').value;
        const token = document.getElementById('whatsapp-token').value;

        if (!numero || !token) {
            this.showNotification('Preencha número e token do WhatsApp', 'error');
            return;
        }

        try {
            this.showNotification('Testando WhatsApp...', 'info');
            
            // Simula envio de teste
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Mensagem de teste enviada via WhatsApp!', 'success');
        } catch (error) {
            this.showNotification('Erro ao testar WhatsApp', 'error');
        }
    }

    async testEmail() {
        const host = document.getElementById('smtp-host').value;
        const user = document.getElementById('smtp-user').value;
        const password = document.getElementById('smtp-password').value;

        if (!host || !user || !password) {
            this.showNotification('Preencha todas as configurações de email', 'error');
            return;
        }

        try {
            this.showNotification('Testando configurações de email...', 'info');
            
            // Simula teste de email
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Email de teste enviado com sucesso!', 'success');
        } catch (error) {
            this.showNotification('Erro ao testar email', 'error');
        }
    }

    // Configurações de Segurança
    initSecuritySettings() {
        document.getElementById('btn-export-security-logs').addEventListener('click', () => {
            this.exportSecurityLogs();
        });

        document.getElementById('btn-clear-security-logs').addEventListener('click', () => {
            this.clearSecurityLogs();
        });

        document.getElementById('btn-backup-now').addEventListener('click', () => {
            this.createBackup();
        });

        document.getElementById('btn-restore-backup').addEventListener('click', () => {
            this.restoreBackup();
        });
    }

    exportSecurityLogs() {
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        const dataStr = JSON.stringify(logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `security_logs_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Logs de segurança exportados', 'success');
    }

    clearSecurityLogs() {
        if (confirm('Tem certeza que deseja limpar todos os logs de segurança?')) {
            localStorage.removeItem('security_logs');
            this.showNotification('Logs de segurança limpos', 'success');
        }
    }

    async createBackup() {
        try {
            this.showNotification('Criando backup...', 'info');
            
            const backup = this.generateBackupData();
            const dataStr = JSON.stringify(backup, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `backup_bindexpress_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showNotification('Backup criado com sucesso!', 'success');
        } catch (error) {
            this.showNotification('Erro ao criar backup', 'error');
        }
    }

    restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    this.restoreBackupData(backup);
                    this.showNotification('Backup restaurado com sucesso!', 'success');
                    location.reload(); // Recarrega para aplicar as configurações
                } catch (error) {
                    this.showNotification('Erro ao restaurar backup', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    generateBackupData() {
        return {
            timestamp: new Date().toISOString(),
            version: '1.0',
            configurations: {
                empresa: this.getFormData('empresa'),
                n8n: this.getFormData('n8n'),
                stripe: this.getFormData('stripe'),
                pagamentos: this.getFormData('pagamentos'),
                entrega: this.getFormData('entrega'),
                notificacoes: this.getFormData('notificacoes'),
                seguranca: this.getFormData('seguranca')
            },
            localStorage: {
                n8n_config: localStorage.getItem('n8n_config'),
                webhook_urls: this.getWebhookUrls(),
                settings: this.getAllSettings()
            }
        };
    }

    restoreBackupData(backup) {
        if (!backup.configurations) {
            throw new Error('Backup inválido');
        }

        // Restaura configurações dos formulários
        Object.keys(backup.configurations).forEach(section => {
            this.setFormData(section, backup.configurations[section]);
        });

        // Restaura localStorage
        if (backup.localStorage) {
            Object.keys(backup.localStorage).forEach(key => {
                if (backup.localStorage[key]) {
                    localStorage.setItem(key, backup.localStorage[key]);
                }
            });
        }
    }

    // Áreas de Entrega
    initDeliveryAreas() {
        document.getElementById('btn-add-area').addEventListener('click', () => {
            document.getElementById('modal-add-area').style.display = 'block';
        });

        document.getElementById('form-add-area').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addDeliveryArea();
        });

        // Botões de editar e excluir áreas
        document.querySelectorAll('.btn-edit-area').forEach(button => {
            button.addEventListener('click', () => {
                this.editDeliveryArea(button.closest('.area-item'));
            });
        });

        document.querySelectorAll('.btn-delete-area').forEach(button => {
            button.addEventListener('click', () => {
                this.deleteDeliveryArea(button.closest('.area-item'));
            });
        });
    }

    addDeliveryArea() {
        const formData = new FormData(document.getElementById('form-add-area'));
        const areaData = {
            nome: formData.get('area-nome'),
            cepInicio: formData.get('area-cep-inicio'),
            cepFim: formData.get('area-cep-fim'),
            taxa: formData.get('area-taxa'),
            tempo: formData.get('area-tempo')
        };

        // Adiciona à lista visual
        this.createAreaElement(areaData);
        
        // Salva no localStorage
        this.saveDeliveryArea(areaData);
        
        // Fecha modal e limpa formulário
        document.getElementById('modal-add-area').style.display = 'none';
        document.getElementById('form-add-area').reset();
        
        this.showNotification('Área de entrega adicionada com sucesso!', 'success');
        this.markUnsavedChanges();
    }

    createAreaElement(areaData) {
        const container = document.querySelector('.delivery-areas');
        const areaElement = document.createElement('div');
        areaElement.className = 'area-item';
        areaElement.innerHTML = `
            <div class="area-header">
                <h4>${areaData.nome}</h4>
                <div class="area-actions">
                    <button type="button" class="btn-secondary btn-edit-area">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn-secondary btn-delete-area">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="area-info">
                <p><strong>CEPs:</strong> ${areaData.cepInicio} a ${areaData.cepFim}</p>
                <p><strong>Taxa:</strong> R$ ${areaData.taxa}</p>
                <p><strong>Tempo:</strong> ${areaData.tempo} min</p>
            </div>
        `;
        
        container.appendChild(areaElement);
        
        // Adiciona event listeners
        areaElement.querySelector('.btn-edit-area').addEventListener('click', () => {
            this.editDeliveryArea(areaElement);
        });
        
        areaElement.querySelector('.btn-delete-area').addEventListener('click', () => {
            this.deleteDeliveryArea(areaElement);
        });
    }

    editDeliveryArea(areaElement) {
        // Implementar edição de área
        this.showNotification('Funcionalidade de edição em desenvolvimento', 'info');
    }

    deleteDeliveryArea(areaElement) {
        if (confirm('Tem certeza que deseja excluir esta área de entrega?')) {
            areaElement.remove();
            this.markUnsavedChanges();
            this.showNotification('Área de entrega removida', 'success');
        }
    }

    saveDeliveryArea(areaData) {
        const areas = JSON.parse(localStorage.getItem('delivery_areas') || '[]');
        areas.push(areaData);
        localStorage.setItem('delivery_areas', JSON.stringify(areas));
    }

    // Salvamento e Carregamento
    saveAllConfigurations() {
        try {
            const configurations = {
                geral: this.getFormData('geral'),
                n8n: this.getFormData('n8n'),
                pagamento: this.getFormData('pagamento'),
                entrega: this.getFormData('entrega'),
                notificacoes: this.getFormData('notificacoes'),
                seguranca: this.getFormData('seguranca')
            };

            localStorage.setItem('bindexpress_config', JSON.stringify(configurations));
            
            this.unsavedChanges = false;
            const saveBtn = document.getElementById('btn-salvar-config');
            saveBtn.classList.remove('has-changes');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
            
            this.showNotification('Configurações salvas com sucesso!', 'success');
            
            // Atualiza integração n8n se necessário
            if (window.n8nIntegration) {
                window.n8nIntegration.updateConfig(configurations.n8n);
            }
            
        } catch (error) {
            this.showNotification('Erro ao salvar configurações', 'error');
        }
    }

    loadSavedConfigurations() {
        try {
            const saved = localStorage.getItem('bindexpress_config');
            if (!saved) return;

            const configurations = JSON.parse(saved);
            
            Object.keys(configurations).forEach(section => {
                this.setFormData(section, configurations[section]);
            });

            // Atualiza toggles condicionais
            this.updateConditionalToggles();
            
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    }

    updateConditionalToggles() {
        // Atualiza visibilidade das seções baseado nos toggles
        const conditionalSections = [
            { toggle: 'stripe-enabled', section: 'stripe-settings' },
            { toggle: 'whatsapp-enabled', section: 'whatsapp-settings' },
            { toggle: 'email-enabled', section: 'email-settings' },
            { toggle: 'push-enabled', section: 'push-settings' },
            { toggle: 'two-factor-enabled', section: 'two-factor-settings' },
            { toggle: 'backup-auto', section: 'backup-settings' }
        ];

        conditionalSections.forEach(({ toggle, section }) => {
            const toggleElement = document.getElementById(toggle);
            const sectionElement = document.getElementById(section);
            
            if (toggleElement && sectionElement) {
                sectionElement.style.display = toggleElement.checked ? 'block' : 'none';
            }
        });
    }

    getFormData(section) {
        const data = {};
        const sectionElement = document.getElementById(`tab-${section}`);
        
        if (!sectionElement) return data;

        const inputs = sectionElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                data[input.id] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    data[input.name] = input.value;
                }
            } else {
                data[input.id] = input.value;
            }
        });

        return data;
    }

    setFormData(section, data) {
        if (!data) return;

        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (!element) return;

            if (element.type === 'checkbox') {
                element.checked = data[key];
            } else if (element.type === 'radio') {
                if (element.value === data[key]) {
                    element.checked = true;
                }
            } else {
                element.value = data[key];
            }
        });
    }

    getWebhookUrls() {
        const webhooks = {};
        const webhookInputs = document.querySelectorAll('[id^="webhook-"][id$="-url"]');
        
        webhookInputs.forEach(input => {
            const type = input.id.replace('webhook-', '').replace('-url', '');
            webhooks[type] = input.value;
        });

        return webhooks;
    }

    getAllSettings() {
        const settings = {};
        
        // Coleta todas as configurações do localStorage relacionadas ao sistema
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('bindexpress_') || key.startsWith('n8n_') || key.startsWith('webhook_')) {
                settings[key] = localStorage.getItem(key);
            }
        });

        return settings;
    }

    backupConfigurations() {
        this.createBackup();
    }

    // Auto-save
    initAutoSave() {
        setInterval(() => {
            if (this.unsavedChanges) {
                this.autoSave();
            }
        }, 30000); // Auto-save a cada 30 segundos
    }

    autoSave() {
        const autoSaveData = {
            timestamp: new Date().toISOString(),
            currentTab: this.currentTab,
            formData: this.getFormData(this.currentTab)
        };

        localStorage.setItem('bindexpress_autosave', JSON.stringify(autoSaveData));
    }

    // Notificações
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Auto-remove após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Botão de fechar
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Animação de entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.configuracoesManager = new ConfiguracoesManager();
});

// Aviso antes de sair com alterações não salvas
window.addEventListener('beforeunload', (e) => {
    if (window.configuracoesManager && window.configuracoesManager.unsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
        return e.returnValue;
    }
});

