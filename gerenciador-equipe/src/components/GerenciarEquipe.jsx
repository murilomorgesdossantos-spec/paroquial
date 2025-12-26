import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Search, Save, X } from 'lucide-react';

const GerenciarEquipe = ({ onClose }) => {
  
  const availableRoles = [
    "Cerimonial", "Turiferario", "Naveteiro", "Cruciferario", 
    "Librifero", "Microfone", "Altar", "Intencoes", "Ofertorio", "Cerifario"
  ];

  // Começamos com uma lista vazia, pois vamos carregar do banco
  const [members, setMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. CARREGAR DADOS DO BANCO AO ABRIR ---
  useEffect(() => {
    fetchServos();
  }, []);

  const fetchServos = async () => {
    try {
      // O fetch usa o caminho relativo, funcionando tanto local quanto no Render
      const response = await fetch('/servos');
      const data = await response.json();
      
      // Garante que 'roles' seja um array (o banco pode devolver como string JSON ou null)
      const formattedData = data.map(member => ({
        ...member,
        roles: Array.isArray(member.roles) ? member.roles : 
               (typeof member.roles === 'string' ? JSON.parse(member.roles || '[]') : [])
      }));

      setMembers(formattedData);
    } catch (error) {
      console.error("Erro ao buscar servos:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. ADICIONAR NO BANCO (POST) ---
  const handleAddMember = async () => {
    if (!newMemberName.trim()) return;

    try {
      const response = await fetch('/servos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: newMemberName })
      });

      if (response.ok) {
        const newMember = await response.json();
        // O backend devolve o membro criado com o ID correto
        // Precisamos garantir que roles seja array no frontend
        const memberFix = { ...newMember, roles: [] }; 
        setMembers([memberFix, ...members]);
        setNewMemberName('');
      } else {
        alert("Erro ao adicionar servo.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- 3. ATUALIZAR FUNÇÃO NO BANCO (PUT) ---
  const toggleRole = async (memberId, role) => {
    // Primeiro, calculamos como a lista vai ficar
    const memberToUpdate = members.find(m => m.id === memberId);
    if (!memberToUpdate) return;

    const hasRole = memberToUpdate.roles.includes(role);
    const updatedRoles = hasRole
      ? memberToUpdate.roles.filter(r => r !== role) // Remove
      : [...memberToUpdate.roles, role];             // Adiciona

    // Atualizamos visualmente (Otimista)
    setMembers(prevMembers => prevMembers.map(m => 
      m.id === memberId ? { ...m, roles: updatedRoles } : m
    ));

    // Enviamos para o banco silenciosamente
    try {
      await fetch(`/servos/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funcoes: updatedRoles })
      });
    } catch (error) {
      console.error("Erro ao salvar função:", error);
      alert("Erro ao salvar alteração. Verifique sua conexão.");
    }
  };

  // --- 4. DELETAR DO BANCO (DELETE) ---
  const handleDeleteMember = async (id) => {
    if(confirm("Tem certeza que deseja remover este servo do banco de dados?")) {
      try {
        const response = await fetch(`/servos/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setMembers(members.filter(m => m.id !== id));
        } else {
          alert("Erro ao deletar.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Filtro de busca visual
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white w-full rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      
      {/* CABEÇALHO */}
      <div className="p-5 border-b flex justify-between items-center bg-white">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Equipe</h2>
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
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Carregando dados do banco...</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 grid grid-cols-12 font-bold text-gray-600 text-sm border-b">
              <div className="col-span-3 pl-2">NOME</div>
              <div className="col-span-8 text-center">FUNÇÕES (CLIQUE PARA ALTERNAR)</div>
              <div className="col-span-1 text-center">AÇÃO</div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {members.length === 0 ? "Nenhum servo cadastrado no banco." : "Nenhum servo encontrado com esse nome."}
                </div>
              ) : (
                filteredMembers.map(member => (
                  <div key={member.id} className="p-3 grid grid-cols-12 items-center hover:bg-purple-50/30 transition-colors">
                    <div className="col-span-3 font-semibold text-gray-800 pl-2">
                      {member.name}
                    </div>
                    
                    <div className="col-span-8 flex flex-wrap gap-1 justify-center">
                      {availableRoles.map(role => {
                        const isActive = member.roles && member.roles.includes(role);
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
        )}
      </div>

      {/* RODAPÉ */}
      <div className="p-4 border-t bg-gray-50 flex justify-end text-xs text-gray-400">
        As alterações são salvas automaticamente no banco de dados.
      </div>
    </div>
  );
};

export default GerenciarEquipe;