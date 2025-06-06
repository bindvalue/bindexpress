// Espera o DOM ser carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o formulário de login
    initLoginForm();
});

// Inicializa o formulário de login
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtém os valores dos campos
            const usuario = document.getElementById('usuario').value;
            const senha = document.getElementById('senha').value;
            
            // Valida os campos
            if (!usuario || !senha) {
                mostrarErro('Por favor, preencha todos os campos.');
                return;
            }
            
            // Tenta fazer login
            fazerLogin(usuario, senha);
        });
    }
    
    // Botão de mostrar/ocultar senha
    const btnMostrarSenha = document.getElementById('btn-mostrar-senha');
    const inputSenha = document.getElementById('senha');
    
    if (btnMostrarSenha && inputSenha) {
        btnMostrarSenha.addEventListener('click', function() {
            if (inputSenha.type === 'password') {
                inputSenha.type = 'text';
                btnMostrarSenha.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                inputSenha.type = 'password';
                btnMostrarSenha.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }
    
    // Botão de esqueci minha senha
    const btnEsqueciSenha = document.getElementById('btn-esqueci-senha');
    
    if (btnEsqueciSenha) {
        btnEsqueciSenha.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtém o valor do campo de usuário
            const usuario = document.getElementById('usuario').value;
            
            if (!usuario) {
                mostrarErro('Por favor, informe seu usuário para recuperar a senha.');
                return;
            }
            
            // Mostra uma mensagem de sucesso
            alert('Um e-mail com instruções para recuperar sua senha foi enviado para o endereço associado a este usuário.');
        });
    }
}

// Faz login
async function fazerLogin(usuario, senha) {
    try {
        // Mostra o loader
        mostrarLoader(true);
        
        // Tenta fazer login
        await window.N8nIntegration.autenticar(usuario, senha);
        
        // Redireciona para o dashboard
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        
        // Mostra uma mensagem de erro
        mostrarErro('Usuário ou senha inválidos. Por favor, tente novamente.');
        
        // Esconde o loader
        mostrarLoader(false);
    }
}

// Mostra uma mensagem de erro
function mostrarErro(mensagem) {
    const erroElement = document.getElementById('erro-login');
    
    if (erroElement) {
        erroElement.textContent = mensagem;
        erroElement.style.display = 'block';
        
        // Esconde a mensagem após 5 segundos
        setTimeout(() => {
            erroElement.style.display = 'none';
        }, 5000);
    }
}

// Mostra ou esconde o loader
function mostrarLoader(mostrar) {
    const loader = document.getElementById('login-loader');
    const btnLogin = document.getElementById('btn-login');
    
    if (loader && btnLogin) {
        if (mostrar) {
            loader.style.display = 'block';
            btnLogin.disabled = true;
            btnLogin.textContent = 'Entrando...';
        } else {
            loader.style.display = 'none';
            btnLogin.disabled = false;
            btnLogin.textContent = 'Entrar';
        }
    }
}

