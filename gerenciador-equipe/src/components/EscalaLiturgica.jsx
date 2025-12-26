import React, { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, UserMinus, CheckCircle2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Importação do logotipo
import logoImg from '../assets/logo.jpg';

const EscalaLiturgica = () => {
  const [servos, setServos] = useState([]);
  const [escalaGerada, setEscalaGerada] = useState(null);
  const [ausentes, setAusentes] = useState([]);
  const [dataMissa, setDataMissa] = useState('');
  const [isSolene, setIsSolene] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const funcoesBase = [
    "Cerimonial 1", "Cerimonial 2", "Turiferário", "Naveteiro", "Cruciferário", 
    "Librífero", "Microfone", "Altar 1", "Altar 2", "Intenções 1", "Intenções 2", 
    "Ofertório 1", "Ofertório 2", "Ofertório 3", "Ofertório 4",
    "Ceriferário 1", "Ceriferário 2", "Ceriferário 3", "Ceriferário 4", "Ceriferário 5", "Ceriferário 6"
  ];

  useEffect(() => { fetchFila(); }, []);

  const fetchFila = async () => {
    try {
      const res = await fetch('https://escala-paroquial.onrender.com/proximos-da-fila');
      const data = await res.json();
      setServos(data);
    } catch (error) {
      console.error("Erro ao buscar fila:", error);
    }
  };

  const toggleAusente = (id) => {
    setAusentes(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const gerarEscalaSemanal = () => {
    if (!dataMissa) { alert("Por favor, digite a data da missa."); return; }
    let filaDisponivel = servos.filter(s => !ausentes.includes(s.id));
    
    const novaEscala = funcoesBase.map(funcao => {
      if (!isSolene && (funcao === "Turiferário" || funcao === "Naveteiro")) {
        return { funcao, servo_nome: "-/-", servo_id: null };
      }
      if (filaDisponivel.length > 0) {
        const sorteado = filaDisponivel.shift();
        return { funcao, servo_nome: sorteado.name, servo_id: sorteado.id };
      }
      return { funcao, servo_nome: "-/-", servo_id: null };
    });
    setEscalaGerada(novaEscala);
  };

  const baixarPDF = () => {
    const element = document.getElementById('tabela-impressao');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Escala_Coroinhas_${dataMissa.replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 4, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* PAINEL DE CONFIGURAÇÃO */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 underline decoration-purple-500 decoration-2">
            <Calendar size={20}/> Configurar Escala
          </h3>
          
          <div className="space-y-4">
            <input 
              type="text" placeholder="Data da Missa (Ex: 30/11)" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              value={dataMissa}
              onChange={(e) => setDataMissa(e.target.value)}
            />

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="text-sm font-bold text-slate-700">Missa Solene?</span>
              <input type="checkbox" checked={isSolene} onChange={() => setIsSolene(!isSolene)} className="w-5 h-5 accent-purple-600" />
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col max-h-[350px]">
          <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2"><UserMinus size={20}/> Lista de Ausentes</h3>
          <div className="overflow-y-auto pr-2 space-y-1 custom-scrollbar">
            {servos.map(s => (
              <button 
                key={s.id} onClick={() => toggleAusente(s.id)}
                className={`w-full text-left p-2.5 rounded-lg text-sm font-medium transition-all ${ausentes.includes(s.id) ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-200'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={gerarEscalaSemanal}
          className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={22} /> GERAR TABELA
        </button>
      </div>

      {/* ÁREA DA TABELA / VISUALIZAÇÃO */}
      <div className="lg:col-span-2 space-y-4">
        {escalaGerada ? (
          <>
            <button onClick={baixarPDF} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all">
              <Download size={20}/> BAIXAR ESCALA OFICIAL (PDF)
            </button>

            {/* DOCUMENTO PARA PDF */}
            <div id="tabela-impressao" className="bg-white p-12 text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
              
              {/* CABEÇALHO COM LOGO */}
              <div className="flex flex-col items-center mb-8">
                <img src={logoImg} alt="Pastoral Logo" className="h-24 mb-4" />
                <h1 className="text-3xl font-black text-orange-600 uppercase tracking-tight">Pastoral Coroinhas</h1>
                <p className="text-lg font-bold text-slate-700">Paróquia São Pedro e São Paulo</p>
                <div className="w-full h-1 bg-orange-500 mt-2"></div>
              </div>

              <div className="text-center mb-6 py-2 bg-slate-100 border-y border-slate-300">
                <span className="text-xl font-black uppercase">Escala Litúrgica - {dataMissa}</span>
              </div>

              <table className="w-full border-collapse border-2 border-black">
                <thead>
                  <tr className="bg-orange-500">
                    <th className="border-2 border-black p-3 text-left text-white uppercase text-sm font-black">Função</th>
                    <th className="border-2 border-black p-3 text-center text-white uppercase text-sm font-black">Servo Escalado</th>
                  </tr>
                </thead>
                <tbody>
                  {escalaGerada.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                      <td className="border border-slate-400 p-2 font-bold text-xs uppercase text-slate-800">{item.funcao}</td>
                      <td className={`border border-slate-400 p-2 text-center text-sm font-black ${item.servo_nome === "-/-" ? 'text-slate-300' : 'text-black'}`}>
                        {item.servo_nome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-10 pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 italic">
                <span>© Sistema de Gestão Paroquial</span>
                <span>Documento gerado em {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full min-h-[500px] bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 p-10 text-center">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <Calendar size={64} className="opacity-20"/>
            </div>
            <p className="text-xl font-bold text-slate-400">Pronto para gerar?</p>
            <p className="text-sm max-w-xs">Defina a data e os ausentes ao lado para criar a tabela semanal.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalaLiturgica;