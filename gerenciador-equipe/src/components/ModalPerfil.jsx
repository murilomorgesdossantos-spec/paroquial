import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Calendar } from 'lucide-react';

const ModalPerfil = ({ servo, onClose }) => {
  const [historico, setHistorico] = useState([]);
  const [novaFuncao, setNovaFuncao] = useState('');
  const [novaData, setNovaData] = useState('');

  // Lista de funções oficiais para seleção
  const funcoesDisponiveis = [
    "Cerimonial",
    "Turiferário",
    "Naveteiro",
    "Cruciferário",
    "Librífero",
    "Microfone",
    "Altar",
    "Intenções",
    "Ofertório",
    "Ceriferário"
  ];

  useEffect(() => {
    fetchHistorico();
  }, [servo]);

  const fetchHistorico = async () => {
    const res = await fetch(`https://escala-paroquial.onrender.com/historico/${servo.id}`);
    const data = await res.json();
    setHistorico(data);
  };

  const removerRegistro = async (id) => {
    if (!confirm("Remover esta participação do histórico?")) return;
    await fetch(`https://escala-paroquial.onrender.com/historico/${id}`, { method: 'DELETE' });
    fetchHistorico();
  };

  const adicionarManual = async () => {
    if (!novaFuncao || !novaData) return alert("Selecione a função e a data");
    await fetch('https://escala-paroquial.onrender.com/historico/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        servo_id: servo.id, 
        funcao: novaFuncao, 
        data_escala: novaData 
      })
    });
    setNovaFuncao('');
    setNovaData('');
    fetchHistorico();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-purple-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{servo.name}</h2>
            <p className="text-xs opacity-80">Histórico de Atividades</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X/></button>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-4">Adicionar Registro Manual</h3>
          <div className="flex gap-2 mb-6">
            {/* Campo de seleção atualizado */}
            <select 
              className="flex-1 p-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-purple-500"
              value={novaFuncao}
              onChange={e => setNovaFuncao(e.target.value)}
            >
              <option value="">Função...</option>
              {funcoesDisponiveis.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <input 
              type="date" 
              className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" 
              value={novaData} 
              onChange={e => setNovaData(e.target.value)} 
            />
            
            <button 
              onClick={adicionarManual} 
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
            >
              <Plus size={20}/>
            </button>
          </div>

          <h3 className="text-sm font-black text-slate-400 uppercase mb-2">Últimas Participações</h3>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {historico.map(h => (
              <div key={h.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-700 text-sm">{h.funcao}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={10}/> {new Date(h.data_escala).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </p>
                </div>
                <button onClick={() => removerRegistro(h.id)} className="text-red-400 hover:text-red-600 p-1 transition-colors">
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
            {historico.length === 0 && (
              <p className="text-center text-slate-400 py-4 text-sm italic">Nenhum registro encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalPerfil;