import React, { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, UserMinus, Save } from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Importação do logotipo
import logoImg from '../assets/logo.jpg';

const EscalaLiturgica = () => {
  const [servos, setServos] = useState([]);
  const [escalaGerada, setEscalaGerada] = useState(null);
  const [ausentes, setAusentes] = useState([]);
  const [dataMissa, setDataMissa] = useState('');
  const [isSolene, setIsSolene] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!dataMissa) { alert("Por favor, selecione a data da missa."); return; }
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

  // FUNÇÃO PARA SALVAR NO BANCO DE DADOS
  const salvarNoBanco = async () => {
    if (!escalaGerada) return;
    if (!confirm(`Deseja salvar esta escala no histórico dos servos para a data ${formatarDataExibicao(dataMissa)}?`)) return;

    setIsSaving(true);
    try {
      // Filtra apenas funções que têm servos escalados
      const escalados = escalaGerada.filter(item => item.servo_id !== null);

      // Envia cada registro individualmente para o seu endpoint de histórico manual
      const promises = escalados.map(item => 
        fetch('https://escala-paroquial.onrender.com/historico/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            servo_id: item.servo_id, 
            funcao: item.funcao, 
            data_escala: dataMissa 
          })
        })
      );

      await Promise.all(promises);
      alert("Escala salva no histórico com sucesso!");
      fetchFila(); // Atualiza a fila principal
    } catch (error) {
      console.error("Erro ao salvar escala:", error);
      alert("Erro ao salvar alguns registros.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatarDataExibicao = (dataRaw) => {
    if (!dataRaw) return "";
    const [ano, mes, dia] = dataRaw.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const baixarPDF = () => {
    const element = document.getElementById('tabela-impressao');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Escala_${dataMissa}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 4, useCORS: true },
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
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Data da Missa</label>
              <input 
                type="date" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                value={dataMissa}
                onChange={(e) => setDataMissa(e.target.value)}
              />
            </div>
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-transparent hover:border-purple-200">
              <span className="text-sm font-bold text-slate-700">Missa Solene?</span>
              <input type="checkbox" checked={isSolene} onChange={() => setIsSolene(!isSolene)} className="w-5 h-5 accent-purple-600 rounded" />
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

      {/* ÁREA DA TABELA */}
      <div className="lg:col-span-2 space-y-4">
        {escalaGerada ? (
          <>
            <div className="flex gap-3">
              <button 
                onClick={baixarPDF} 
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Download size={20}/> BAIXAR PDF
              </button>
              
              <button 
                onClick={salvarNoBanco} 
                disabled={isSaving}
                className={`flex-1 ${isSaving ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95`}
              >
                <Save size={20}/> {isSaving ? "SALVANDO..." : "CONFIRMAR E SALVAR"}
              </button>
            </div>

            <div id="tabela-impressao" className="bg-white p-12 text-black border border-slate-200 rounded-xl" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div className="flex flex-col items-center mb-8">
                <img src={logoImg} alt="Pastoral Logo" className="h-24 mb-4" />
                <h1 className="text-3xl font-black text-orange-600 uppercase tracking-tight">Pastoral Coroinhas</h1>
                <p className="text-lg font-bold text-slate-700">Paróquia São Pedro e São Paulo</p>
                <div className="w-full h-1 bg-orange-500 mt-2"></div>
              </div>

              <div className="text-center mb-6 py-2 bg-slate-100 border-y border-slate-300">
                <span className="text-xl font-black uppercase">Escala Litúrgica - {formatarDataExibicao(dataMissa)}</span>
              </div>

              <table className="w-full border-collapse border-2 border-black">
                <thead>
                  <tr className="bg-orange-500 text-white">
                    <th className="border-2 border-black p-3 text-left uppercase text-sm font-black">Função</th>
                    <th className="border-2 border-black p-3 text-center uppercase text-sm font-black">Servo Escalado</th>
                  </tr>
                </thead>
                <tbody>
                  {escalaGerada.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                      <td className="border border-slate-400 p-2 font-bold text-xs uppercase text-slate-800 text-left">{item.funcao}</td>
                      <td className={`border border-slate-400 p-2 text-center text-sm font-black ${item.servo_nome === "-/-" ? 'text-slate-300' : 'text-black'}`}>
                        {item.servo_nome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="h-full min-h-[500px] bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 p-10 text-center">
            <Calendar size={64} className="opacity-20 mb-4"/>
            <p className="text-xl font-bold text-slate-400">Pronto para gerar?</p>
            <p className="text-sm">Selecione a data e os ausentes ao lado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalaLiturgica;