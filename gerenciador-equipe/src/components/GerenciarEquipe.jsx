import React, { useState } from 'react';
import { Trash2, Plus, Search, Save, X } from 'lucide-react';

// Recebemos a função 'onClose' vinda do Dashboard para fechar o modal
const GerenciarEquipe = ({ onClose }) => {
  
  // 1. Lista de Funções Disponíveis
  const availableRoles = [
    "Cerimonial", "Turiferario", "Naveteiro", "Cruciferario", 
    "Librifero", "Microfone", "Altar", "Intencoes", "Ofertorio", "Cerifario"
  ];

  // 2. Estado Inicial (Membros)
  const [members, setMembers] = useState([
    { id: 1, name: 'Murilo Morges', roles: ['Cerimonial', 'Turiferario', 'Altar'] },
    { id: 2, name: 'Ana Costa', roles: ['Cerimonial', 'Microfone'] },
    { id: 3, name: 'Diego Martins', roles: ['Cerimonial', 'Turiferario'] },
    { id: 4, name: 'Julia Lima', roles: ['Cerimonial', 'Librifero'] },
    { id: 5, name: 'Roberto Alves', roles: ['Naveteiro', 'Cerimonial'] },
    { id: 6, name: 'Fernanda Rocha', roles: ['Intencoes', 'Cerimonial'] }
  ]);

  const [newMemberName, setNewMemberName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- LÓGICA DE CLIQUE E EDIÇÃO ---
  const toggleRole = (memberId, role) => {
    setMembers(prevMembers => prevMembers.map(member => {
      if (member.id === memberId) {
        const hasRole = member.roles.includes(role);
        const updatedRoles = hasRole
          ? member.roles.filter(r => r !== role) 
          : [...member.roles, role];
        return { ...member, roles: updatedRoles };
      }
      return member;
    }));
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
    setMembers([{ id: newId, name: newMemberName, roles: ['Cerimonial'] }, ...members]);
    setNewMemberName('');
  };

  const handleDeleteMember = (id) => {
    if(confirm("Tem certeza que deseja remover este servo?")) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const handleSave = () => {
    console.log("Enviando para o Banco de Dados:", members);
    alert("Alterações salvas com sucesso!");
    if (onClose) onClose(); // Fecha o modal após salvar (opcional)
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Removemos a div escura 'fixed inset-0 bg-black/50' daqui, pois o Dashboard já cuida disso.
    // Deixamos apenas o conteúdo principal (o Cartão Branco).
    <div className="bg-white w-full rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      
      {/* CABEÇALHO */}
      <div className="p-5 border-b flex justify-between items-center bg-white">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Equipe</h2>
        {/* Botão X chama a função onClose */}
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* CONTROLES */}
      <div className="p-5 bg-gray-50 border-b space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nome do novo servo..."
            className="flex-1 p-3 border rounded-md border-gray-300 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
          />
          <button 
            onClick={handleAddMember}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-bold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} /> Adicionar
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar membros existentes..."
            className="w-full p-2 pl-10 border rounded-md border-gray-300 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LISTA DE MEMBROS */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3 grid grid-cols-12 font-bold text-gray-600 text-sm border-b">
            <div className="col-span-3 pl-2">NOME</div>
            <div className="col-span-8 text-center">FUNÇÕES (CLIQUE PARA ALTERNAR)</div>
            <div className="col-span-1 text-center">AÇÃO</div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Nenhum servo encontrado.</div>
            ) : (
              filteredMembers.map(member => (
                <div key={member.id} className="p-3 grid grid-cols-12 items-center hover:bg-purple-50/30 transition-colors">
                  <div className="col-span-3 font-semibold text-gray-800 pl-2">
                    {member.name}
                  </div>
                  
                  <div className="col-span-8 flex flex-wrap gap-1 justify-center">
                    {availableRoles.map(role => {
                      const isActive = member.roles.includes(role);
                      return (
                        <button
                          key={role}
                          onClick={() => toggleRole(member.id, role)}
                          className={`text-xs px-2 py-1 rounded border transition-all duration-200 ${
                            isActive 
                              ? 'bg-purple-100 border-purple-500 text-purple-700 font-bold shadow-sm scale-105' 
                              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <button 
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-red-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RODAPÉ */}
      <div className="p-4 border-t bg-gray-50 flex justify-end">
        <button 
          onClick={handleSave}
          className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded shadow-md flex items-center gap-2 font-semibold transition-transform active:scale-95"
        >
          <Save size={20} /> Salvar Alterações
        </button>
      </div>
    </div>
  );
};

export default GerenciarEquipe;