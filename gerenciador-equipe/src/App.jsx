import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Verifica se já existe um login salvo no navegador ao abrir o site
    useEffect(() => {
        const usuarioSalvo = localStorage.getItem('usuario_logado');
        if (usuarioSalvo) {
            setIsLoggedIn(true);
        }
    }, []);

    // Função para sair do sistema
    const handleLogout = () => {
        localStorage.removeItem('usuario_logado');
        setIsLoggedIn(false);
    };

    return (
        <div className="App">
            {isLoggedIn ? (
                // Se estiver logado, mostra o Dashboard e passa a função de sair
                <Dashboard onLogout={handleLogout} />
            ) : (
                // Se não estiver logado, mostra a tela de Login
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
            )}
        </div>
    );
}

export default App;