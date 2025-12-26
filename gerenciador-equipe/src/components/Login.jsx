import React, { useState } from 'react';
import { Lock, User, LogIn } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

const Login = ({ onLoginSuccess }) => {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://escala-paroquial.onrender.com/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, senha })
            });
            const data = await response.json();

            if (data.auth) {
                localStorage.setItem('usuario_logado', JSON.stringify(data.user));
                onLoginSuccess();
            } else {
                setErro(data.message);
            }
        } catch (err) {
            setErro("Erro ao conectar com o servidor.");
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-100 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
                <div className="flex flex-col items-center mb-8">
                    <img src={logoImg} alt="Logo" className="h-20 mb-4" />
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Sistema de Escala</h1>
                    <p className="text-slate-500 text-sm">Entre com suas credenciais de acesso</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-slate-400" size={20} />
                        <input 
                            type="text" placeholder="Usuário" required
                            className="w-full pl-10 p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                            value={usuario} onChange={(e) => setUsuario(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                        <input 
                            type="password" placeholder="Senha" required
                            className="w-full pl-10 p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                            value={senha} onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>

                    {erro && <p className="text-red-500 text-xs font-bold text-center">{erro}</p>}

                    <button 
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-black shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <LogIn size={20} /> ENTRAR NO SISTEMA
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;