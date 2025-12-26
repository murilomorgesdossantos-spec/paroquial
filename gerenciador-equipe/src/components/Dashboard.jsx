import React, { useState } from 'react';
import { Users, Calendar, Settings, Menu } from 'lucide-react';
import GerenciarEquipe from './GerenciarEquipe';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* MENU LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-purple-400">Escala Paroquial</h1>
          <p className="text-sm text-gray-400 mt-1">50 servos cadastrados</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-3 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30">
            <Users size={20} />
            <span className="font-medium">Banco de Servos</span>
          </button>
          
          <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:bg-slate-800 rounded-lg transition-colors">
            <Calendar size={20} />
            <span>Escala Litúrgica</span>
          </button>

          <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={20} />
            <span>Configurações</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold">M</div>
            <div>
              <p className="text-sm font-medium">Murilo Admin</p>
              <p className="text-xs text-green-400">● Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topo Mobile (só aparece em celular) */}
        <header className="bg-white p-4 shadow-sm md:hidden flex justify-between items-center">
          <h1 className="font-bold text-slate-800">Escala Paroquial</h1>
          <button><Menu /></button>
        </header>

        {/* Área de Conteúdo */}
        <div className="flex-1 overflow-auto p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Banco de Servos</h2>
              <p className="text-gray-500 mt-2">Gerencie as funções e cadastros da equipe.</p>
            </div>
            
            {/* O BOTÃO QUE ABRE O MODAL */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Users size={20} />
              Gerenciar Equipe
            </button>
          </div>

          {/* Exemplo de Lista de Fundo (Simulando seu site antigo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((item) => (
              <div key={item} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
                  <div>
                    <h3 className="font-bold text-gray-800">Nome do Servo {item}</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Ativo</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs border px-2 py-1 rounded text-gray-500">Cerimonial</span>
                  <span className="text-xs border px-2 py-1 rounded text-gray-500">Turiferário</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* AQUI ESTÁ O MODAL - Só aparece se isModalOpen for TRUE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
           {/* Fundo escuro atrás do modal */}
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
             onClick={() => setIsModalOpen(false)} // Fecha ao clicar fora
           ></div>
           
           {/* O componente GerenciarEquipe flutuando */}
           <div className="relative z-10 w-full max-w-5xl px-4">
             <GerenciarEquipe onClose={() => setIsModalOpen(false)} />
           </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;