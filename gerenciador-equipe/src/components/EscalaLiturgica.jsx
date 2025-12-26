import React, { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, CheckCircle2, UserMinus } from 'lucide-react';

const EscalaLiturgica = () => {
  const [servos, setServos] = useState([]);
  const [escalaGerada, setEscalaGerada] = useState(null);
  const [ausentes, setAusentes] = useState([]);
  const [tipoMissa, setTipoMissa] = useState('comum'); // 'comum' ou 'solene'
  const [isLoading, setIsLoading] = useState(false);

  // Definição das funções por tipo de missa
  const funcoesMissa = {
    comum: ["Cerimonial", "Turiferario", "Naveteiro", "Cruciferario", "Librifero", "Microfone", "Altar"],
    solene: ["Cerimonial 1", "Cerimonial 2", "Turiferario", "Naveteiro", "Cruciferario", "Librifero", "Microfone", "Altar", "Intencoes", "Ofertorio"]
  };

  useEffect(() => {
    fetchServosParaFila();
  }, []);

  const fetchServosParaFila = async () => {
    try {
      const res = await fetch('https://escala-paroquial.onrender.com/proximos-da-fila');
      const data = await res.json();
      setServos(data);
    } catch (error) {
      console.error("Erro ao buscar fila:", error);
    }
  };

  const toggleAusente = (id) => {
    setAusentes(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const gerarEscalaAuto = () => {
    const funcoesNecessarias = funcoesMissa[tipoMissa];
    
    // Filtra quem não está marcado como ausente
    const disponiveis = servos.filter(s => !ausentes.includes(s.id));

    if (disponiveis.length < funcoesNecessarias.length) {
      alert(`Servos disponíveis insuficientes! Precisa de ${funcoesNecessarias.length} e tem apenas ${disponiveis.length}.`);
      return;
    }

    // Como os servos já vêm ordenados por "quem serviu há mais tempo" do banco,
    // pegamos os primeiros da lista que não estão ausentes.
    const novaEscala = funcoesNecessarias.map((funcao, index) => ({
      funcao,
      servo_id: disponiveis[index].id,
      servo_nome: disponiveis[index].name
    }));

    setEscalaGerada(novaEscala);
  };

  const confirmarESalvarNoBanco = async () => {
    if (!confirm("Deseja oficializar esta escala no histórico? Isso jogará esses servos para o fim da fila.")) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('https://escala-paroquial.onrender.com/historico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          escala: escalaGerada.map(e => ({ servo_id: e.servo_id, funcao: e.funcao })) 
        })
      });

      if (response.ok) {
        alert("Escala salva com sucesso!");
        setEscalaGerada(null);
        fetchServosParaFila(); // Atualiza a fila visual
      }
    } catch (error) {
      alert("Erro ao salvar escala.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-8">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gerador de Escala</h2>
          <p className="text-gray-500">Configuração de rodízio automático via Banco de Dados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA 1: CONFIGURAÇÕES */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Calendar size={18}/> 1. Tipo de Missa</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setTipoMissa('comum')}
                className={`flex-1 py-2 rounded-lg font-medium border ${tipoMissa === 'comum' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600'}`}
              >
                Comum
              </button>
              <button 
                onClick={() => setTipoMissa('solene')}
                className={`flex-1 py-2 rounded-lg font-medium border ${tipoMissa === 'solene' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600'}`}
              >
                Solene
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border max-h-[400px] flex flex-col">
            <h3 className="font-bold mb-2 flex items-center gap-2"><UserMinus size={18}/> 2. Quem NÃO participa?</h3>
            <p className="text-xs text-gray-400 mb-4">Marque os servos que avisaram que não podem ir.</p>
            <div className="overflow-y-auto space-y-2 pr-2">
              {servos.map(s => (
                <button 
                  key={s.id}
                  onClick={() => toggleAusente(s.id)}
                  className={`w-full flex justify-between items-center p-2 rounded-md text-sm transition-colors ${ausentes.includes(s.id) ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-700 border border-transparent hover:border-gray-300'}`}
                >
                  {s.name}
                  {ausentes.includes(s.id) && <span className="text-[10px] font-bold uppercase">Ausente</span>}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={gerarEscalaAuto}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw size={20} /> GERAR ESCALAMENTO
          </button>
        </div>

        {/* COLUNA 2 e 3: RESULTADO */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border min-h-[500px] flex flex-col">
            {escalaGerada ? (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 underline decoration-purple-500">Escala Proposta</h3>
                  <div className="flex gap-2">
                    <button onClick={() => window.print()} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Download size={20}/></button>
                  </div>
                </div>

                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-sm uppercase tracking-wider">
                      <th className="pb-4 font-medium">Função</th>
                      <th className="pb-4 font-medium">Servo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {escalaGerada.map((item, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-4 font-medium text-slate-600">{item.funcao}</td>
                        <td className="py-4">
                          <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold text-sm">
                            {item.servo_nome}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-8 flex gap-4">
                  <button 
                    onClick={confirmarESalvarNoBanco}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    {isLoading ? "Salvando..." : <><CheckCircle2 size={20}/> Confirmar e Salvar no Banco</>}
                  </button>
                  <button 
                    onClick={() => setEscalaGerada(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar size={40} className="opacity-20" />
                </div>
                <p className="text-lg font-medium">Nenhuma escala gerada</p>
                <p className="text-sm max-w-[250px]">Selecione o tipo de missa e os ausentes, depois clique em Gerar.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EscalaLiturgica;