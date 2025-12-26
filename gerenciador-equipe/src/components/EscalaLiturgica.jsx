import React, { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, CheckCircle2, UserMinus } from 'lucide-react';

const EscalaLiturgica = () => {
  const [servos, setServos] = useState([]);
  const [escalaGerada, setEscalaGerada] = useState(null);
  const [ausentes, setAusentes] = useState([]);
  const [tipoMissa, setTipoMissa] = useState('comum'); // 'comum' ou 'solene'
  const [isLoading, setIsLoading] = useState(false);

  // 1. REGRAS DE QUANTIDADE CONFORME SOLICITADO
  const funcoesMissa = {
    solene: [
      "Cerimonial 1", "Cerimonial 2", "Turiferário", "Naveteiro", "Cruciferário", 
      "Librífero", "Microfone", "Altar 1", "Altar 2", "Intenções 1", "Intenções 2", 
      "Ofertório 1", "Ofertório 2", "Ofertório 3", "Ofertório 4",
      "Ceriferário 1", "Ceriferário 2", "Ceriferário 3", "Ceriferário 4", "Ceriferário 5", "Ceriferário 6"
    ],
    comum: [
      "Cerimonial 1", "Cerimonial 2", "Cruciferário", "Librífero", "Microfone", 
      "Altar 1", "Altar 2", "Intenções 1", "Intenções 2", 
      "Ofertório 1", "Ofertório 2", "Ofertório 3", "Ofertório 4",
      "Ceriferário 1", "Ceriferário 2", "Ceriferário 3", "Ceriferário 4", "Ceriferário 5", "Ceriferário 6"
    ]
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

  // 2. LÓGICA DE GERAÇÃO QUE ENCAIXA OS SERVOS DISPONÍVEIS
  const gerarEscalaAuto = () => {
    const funcoesNecessarias = funcoesMissa[tipoMissa];
    const disponiveis = servos.filter(s => !ausentes.includes(s.id));

    if (disponiveis.length < funcoesNecessarias.length) {
      alert(`Quantidade insuficiente! A missa ${tipoMissa} precisa de ${funcoesNecessarias.length} servos, mas apenas ${disponiveis.length} estão disponíveis.`);
      return;
    }

    const novaEscala = funcoesNecessarias.map((funcao, index) => ({
      funcao,
      servo_id: disponiveis[index].id,
      servo_nome: disponiveis[index].name
    }));

    setEscalaGerada(novaEscala);
  };

  const confirmarESalvarNoBanco = async () => {
    if (!confirm("Deseja oficializar esta escala no histórico?")) return;
    
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
        alert("Escala salva e rodízio atualizado!");
        setEscalaGerada(null);
        fetchServosParaFila(); 
      }
    } catch (error) {
      alert("Erro ao salvar escala.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Gerador de Escala</h2>
        <p className="text-gray-500">Rodízio automático respeitando as quantidades da missa {tipoMissa}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          {/* SELEÇÃO TIPO DE MISSA */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Calendar size={18}/> 1. Tipo de Missa</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => { setTipoMissa('comum'); setEscalaGerada(null); }}
                className={`flex-1 py-2 rounded-lg font-medium border ${tipoMissa === 'comum' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600'}`}
              >
                Comum
              </button>
              <button 
                onClick={() => { setTipoMissa('solene'); setEscalaGerada(null); }}
                className={`flex-1 py-2 rounded-lg font-medium border ${tipoMissa === 'solene' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600'}`}
              >
                Solene
              </button>
            </div>
          </div>

          {/* LISTA DE AUSENTES */}
          <div className="bg-white p-6 rounded-xl shadow-sm border max-h-[400px] flex flex-col">
            <h3 className="font-bold mb-2 flex items-center gap-2"><UserMinus size={18}/> 2. Quem NÃO participa?</h3>
            <div className="overflow-y-auto space-y-2 pr-2">
              {servos.map(s => (
                <button 
                  key={s.id}
                  onClick={() => toggleAusente(s.id)}
                  className={`w-full flex justify-between items-center p-2 rounded-md text-sm transition-colors ${ausentes.includes(s.id) ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-700 border border-transparent hover:border-gray-300'}`}
                >
                  {s.name}
                  {ausentes.includes(s.id) && <span className="text-[10px] font-bold uppercase">Falta</span>}
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

        {/* TABELA DE RESULTADOS */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border min-h-[500px] flex flex-col p-8">
            {escalaGerada ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Escala Proposta ({escalaGerada.length} pessoas)</h3>
                </div>

                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider border-b">
                      <th className="pb-3">Função</th>
                      <th className="pb-3">Servo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {escalaGerada.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 text-sm font-medium text-slate-600">{item.funcao}</td>
                        <td className="py-2 text-sm font-bold text-purple-700">{item.servo_nome}</td>
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
                    {isLoading ? "Salvando..." : <><CheckCircle2 size={20}/> Confirmar e Salvar</>}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
                <Calendar size={48} className="opacity-10 mb-4" />
                <p>Configure a missa e clique em Gerar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscalaLiturgica;