import React, { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, ChevronLeft } from 'lucide-react';

const EscalaLiturgica = () => {
  const [servos, setServos] = useState([]);
  const [escalaGerada, setEscalaGerada] = useState(null);
  const [dataFimDeSemana, setDataFimDeSemana] = useState('');

  const funcoesNecessarias = [
    "Cerimonial", "Turiferario", "Naveteiro", "Cruciferario", 
    "Librifero", "Microfone", "Altar", "Intencoes", "Ofertorio"
  ];

  useEffect(() => {
    fetch('https://escala-paroquial.onrender.com/servos')
      .then(res => res.json())
      .then(data => setServos(data));
  }, []);

  const gerarEscala = () => {
    if (servos.length < funcoesNecessarias.length) {
      alert("Quantidade de servos insuficiente para preencher todas as funções!");
      return;
    }

    // LÓGICA DE SORTEIO SEM REPETIÇÃO
    // 1. Embaralhar a lista de servos (Fisher-Yates Shuffle)
    let embaralhados = [...servos].sort(() => Math.random() - 0.5);
    
    // 2. Mapear funções para os primeiros servos da lista embaralhada
    const novaEscala = funcoesNecessarias.map((funcao, index) => {
      const servo = embaralhados[index];
      return {
        funcao,
        servo: servo.name,
        // Aqui você poderia salvar no banco quem já foi escalado para a próxima rodada
      };
    });

    setEscalaGerada(novaEscala);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Escala Litúrgica</h2>
          <p className="text-gray-500">Gere a escala automática seguindo as regras de rodízio.</p>
        </div>
        <button 
          onClick={gerarEscala}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-md flex items-center gap-2"
        >
          <RefreshCw size={20} /> Gerar Nova Escala
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {escalaGerada ? (
          <div id="tabela-escala">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-4 border-b font-bold text-slate-700">Função</th>
                  <th className="p-4 border-b font-bold text-slate-700">Servo Escalado</th>
                </tr>
              </thead>
              <tbody>
                {escalaGerada.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 border-b text-slate-600 font-medium">{item.funcao}</td>
                    <td className="p-4 border-b text-purple-700 font-bold">{item.servo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button 
              className="mt-6 w-full py-3 bg-green-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700"
              onClick={() => window.print()} // Atalho simples para salvar em PDF
            >
              <Download size={20} /> Baixar Escala (PDF)
            </button>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
            <p>Clique em "Gerar Nova Escala" para sortear os servos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalaLiturgica;