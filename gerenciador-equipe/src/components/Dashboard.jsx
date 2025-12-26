import React, { useState, useEffect } from 'react';
import { Users, Calendar, Settings, Menu, LogOut } from 'lucide-react';
import GerenciarEquipe from './GerenciarEquipe';
import EscalaLiturgica from './EscalaLiturgica';
import ModalPerfil from './ModalPerfil'; // Certifique-se de criar este arquivo com o código enviado anteriormente

const Dashboard = ({ onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servos, setServos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('banco');
  const [servoSelecionado, setServoSelecionado] = useState(null); // Estado para o balão clicado

  const buscarServos = async () => {
    try {
      const response = await fetch('https://escala-paroquial.onrender.com/servos');
      const data = await response.json();
      setServos(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarServos();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    buscarServos(); 
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* MENU LATERAL */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-purple-400">Escala Paroquial</h1>
          <p className="text-sm text-gray-400 mt-1">{servos.length} servos cadastrados</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setAbaAtiva('banco')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
              abaAtiva === 'banco' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-gray-400 hover:bg-slate-800'
            }`}
          >
            <Users size={20} />
            <span className="font-medium">Banco de Servos</span>
          </button>
          
          <button 
            onClick={() => setAbaAtiva('escala')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
              abaAtiva === 'escala' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-gray-400 hover:bg-slate-800'
            }`}
          >
            <Calendar size={20} />
            <span>Escala Litúrgica</span>
          </button>

          <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={20} />
            <span>Configurações</span>
          </button>

          {/* Botão Sair */}
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors mt-10"
          >
            <LogOut size={20} />
            <span>Sair do Sistema</span>
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

      {/* CONTEÚDO DINÂMICO */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white p-4 shadow-sm md:hidden flex justify-between items-center">
          <h1 className="font-bold text-slate-800">Escala Paroquial</h1>
          <button><Menu /></button>
        </header>

        <div className="flex-1 overflow-auto">
          {abaAtiva === 'banco' ? (
            <div className="p-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">Banco de Servos</h2>
                  <p className="text-gray-500 mt-2">Clique no balão de um servo para gerenciar seu histórico.</p>
                </div>
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <Users size={20} />
                  Gerenciar Equipe
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <p className="col-span-full text-center text-gray-500">Carregando dados do banco...</p>
                ) : servos.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500">Nenhum servo encontrado.</p>
                ) : (
                  servos.map((servo) => (
                    <div 
                      key={servo.id} 
                      onClick={() => setServoSelecionado(servo)} // DISPARA O MODAL DE PERFIL
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-purple-300 group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors">
                          {servo.name ? servo.name[0].toUpperCase() : "👤"}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{servo.name || "Sem Nome"}</h3>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Ativo</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {servo.roles && servo.roles.length > 0 ? (
                          servo.roles.map((funcao) => (
                            <span key={funcao} className="text-[10px] border border-purple-100 bg-purple-50 px-2 py-0.5 rounded text-purple-600 font-medium">
                              {funcao}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Nenhuma função</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <EscalaLiturgica servos={servos} />
          )}
        </div>
      </main>

      {/* MODAL GERENCIAR EQUIPE (Lista Geral) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
           <div className="relative z-10 w-full max-w-5xl">
             <GerenciarEquipe onClose={handleCloseModal} />
           </div>
        </div>
      )}

      {/* MODAL PERFIL INDIVIDUAL (Histórico e Edição) */}
      {servoSelecionado && (
        <ModalPerfil 
          servo={servoSelecionado} 
          onClose={() => setServoSelecionado(null)} 
        />
      )}

    </div>
  );
};

export default Dashboard;