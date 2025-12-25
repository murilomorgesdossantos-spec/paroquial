import React, { useState } from 'react';
import { Trash2, Plus, Search, Save } from 'lucide-react';

const TeamManager = () => {
  const availableRoles = [
    "Cerimonial", "Turiferario", "Naveteiro", "Cruciferario", 
    "Librifero", "Microfone", "Altar", "Intencoes", "Ofertorio", "Cerifario"
  ];

  const [members, setMembers] = useState([
    { id: 1, name: 'Murilo Morges', roles: ['Cerimonial', 'Turiferario', 'Altar'] },
    { id: 2, name: 'Ana Costa', roles: ['Cerimonial', 'Microfone'] },
    { id: 3, name: 'Diego Martins', roles: ['Cerimonial', 'Turiferario'] },
  ]);

  const [newMemberName, setNewMemberName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
    setMembers([...members, { id: newId, name: newMemberName, roles: ['Cerimonial'] }]);
    setNewMemberName('');
  };

  const handleSave = () => {
    console.log("Dados salvos:", members);
    alert("Alterações salvas! (Veja os dados no Console F12)");
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto font-sans mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Equipe</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Nome do novo servo..."
          className="flex-1 p-2 border rounded border-gray-300 outline-none focus:border-purple-500"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
        />
        <button 
          onClick={handleAddMember}
          className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600 transition-colors"
        >
          <Plus size={18} /> Adicionar
        </button>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar membros existentes..."
          className="w-full p-2 pl-10 border rounded border-gray-300 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-3 grid grid-cols-12 font-bold text-gray-600 text-sm">
          <div className="col-span-3">NOME</div>
          <div className="col-span-8">FUNÇÕES (CLIQUE PARA ALTERNAR)</div>
          <div className="col-span-1 text-center">AÇÃO</div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Nenhum membro encontrado.</div>
          ) : (
            filteredMembers.map(member => (
              <div key={member.id} className="border-t p-3 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-3 font-medium text-gray-800">{member.name}</div>
                
                <div className="col-span-8 flex flex-wrap gap-1">
                  {availableRoles.map(role => {
                    const isActive = member.roles.includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => toggleRole(member.id, role)}
                        className={`text-xs px-2 py-1 rounded border transition-colors cursor-pointer ${
                          isActive 
                            ? 'bg-purple-100 border-purple-400 text-purple-700 font-semibold shadow-sm' 
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>

                <div className="col-span-1 flex justify-center">
                  <button className="text-red-300 hover:text-red-500 p-2 bg-red-50 rounded hover:bg-red-100 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Save size={18} /> Salvar Alterações
        </button>
      </div>
    </div>
  );
};

export default TeamManager;