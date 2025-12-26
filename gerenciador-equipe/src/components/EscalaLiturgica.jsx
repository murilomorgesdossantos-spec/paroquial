import React, { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, UserMinus, Save } from 'lucide-react';
import html2pdf from 'html2pdf.js';
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

  const normalizar = (nome) => nome.replace(/\s\d+$/, '');

  const gerarEscalaSemanal = () => {
    if (!dataMissa) { alert("Por favor, selecione a data da missa."); return; }
    
    // 1. Filtrar servos disponíveis (que não estão marcados como ausentes)
    let disponiveis = [...servos].filter(s => !ausentes.includes(s.id));
    const novaEscala = [];

    // 2. Tentar preencher cada função da lista base
    funcoesBase.forEach(funcaoNome => {
      // Regra de Missa Comum: Turiferário e Naveteiro só em missa solene
      if (!isSolene && (funcaoNome === "Turiferário" || funcaoNome === "Naveteiro")) {
        novaEscala.push({ funcao: funcaoNome, servo_nome: "-/-", servo_id: null });
        return;
      }

      const categoriaRequisitada = normalizar(funcaoNome);

      // Critério de Seleção:
      // Encontra o primeiro servo na fila que tenha o cargo permitido (roles)
      const idx = disponiveis.findIndex(s => {
        const cargosDoServo = s.roles || [];
        return cargosDoServo.includes(categoriaRequisitada);
      });

      if (idx !== -1) {
        // Se encontrou, remove da lista de disponíveis do dia e adiciona na escala
        const sorteado = disponiveis.splice(idx, 1)[0];
        novaEscala.push({ funcao: funcaoNome, servo_nome: sorteado.name, servo_id: sorteado.id });
      } else {
        // Se não houver ninguém habilitado para esta função, fica vazio
        novaEscala.push({ funcao: funcaoNome, servo_nome: "-/-", servo_id: null });
      }
    });

    setEscalaGerada(novaEscala);
  };

  const formatarDataBR = (dataISO) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const salvarNoBanco = async () => {
    if (!escalaGerada) return;
    if (!confirm(`Confirmar salvamento da escala para ${formatarDataBR(dataMissa)}?`)) return;

    setIsSaving(true);
    let duplicadosCount = 0;
    const escalados = escalaGerada.filter(item => item.servo_id !== null);

    try {
      const promises = escalados.map(async (item) => {
        const response = await fetch('https://escala-paroquial.onrender.com/historico/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            servo_id: item.servo_id,
            nome_servo: item.servo_nome,
            funcao: item.funcao, 
            data_escala: dataMissa 
          })
        });
        if (response.status === 409) duplicadosCount++;
        return response;
      });

      await Promise.all(promises);

      if (duplicadosCount === escalados.length && escalados.length > 0) {
        alert("Esta escala já foi salva para esta data.");
      } else {
        alert("Escala salva com sucesso!");
        fetchFila(); 
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const baixarPDF = () => {
    const element = document.getElementById('tabela-impressao');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Escala_${formatarDataBR(dataMissa).replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-purple-600"/> Configurar Escala
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Data da Missa</label>
              <input type="date" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" value={dataMissa} onChange={(e) => setDataMissa(e.target.value)} />
            </div>
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
              <span className="text-sm font-bold text-slate-700">Missa Solene?</span>
              <input type="checkbox" checked={isSolene} onChange={() => setIsSolene(!isSolene)} className="w-5 h-5 accent-purple-600" />
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col max-h-[400px]">
          <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2"><UserMinus size={20}/> Ausentes</h3>
          <div className="overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {servos.map(s => (
              <button key={s.id} onClick={() => toggleAusente(s.id)} className={`w-full text-left p-2.5 rounded-lg text-sm transition-all ${ausentes.includes(s.id) ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-200'}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={gerarEscalaSemanal} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
          <RefreshCw size={22} /> GERAR ESCALA
        </button>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {escalaGerada ? (
          <>
            <div className="flex gap-3">
              <button onClick={baixarPDF} className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-orange-600 transition-all">
                <Download size={20}/> BAIXAR PDF
              </button>
              <button onClick={salvarNoBanco} disabled={isSaving} className={`flex-1 ${isSaving ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all`}>
                <Save size={20}/> {isSaving ? "SALVANDO..." : "SALVAR NO BANCO"}
              </button>
            </div>

            <div id="tabela-impressao" className="bg-white p-12 text-black border rounded-xl shadow-sm">
              <div className="flex flex-col items-center mb-8">
                <img src={logoImg} alt="Logo" className="h-20 mb-4" />
                <h1 className="text-2xl font-black text-orange-600 uppercase">Pastoral Coroinhas</h1>
                <p className="font-bold text-slate-700">Paróquia São Pedro e São Paulo</p>
                <div className="w-full h-1 bg-orange-500 mt-2"></div>
              </div>

              <div className="text-center mb-6 py-2 bg-slate-100 border-y border-slate-300">
                <span className="text-lg font-black uppercase">Escala Litúrgica - {formatarDataBR(dataMissa)}</span>
              </div>

              <table className="w-full border-collapse border-2 border-black">
                <thead>
                  <tr className="bg-orange-500 text-white">
                    <th className="border-2 border-black p-3 text-left uppercase text-sm font-black w-1/2">Função</th>
                    <th className="border-2 border-black p-3 text-center uppercase text-sm font-black w-1/2">Servo Escalado</th>
                  </tr>
                </thead>
                <tbody>
                  {escalaGerada.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                      <td className="border border-slate-400 p-2 font-bold text-[11px] uppercase text-left">{item.funcao}</td>
                      <td className={`border border-slate-400 p-2 text-center text-[12px] font-black ${item.servo_id ? 'text-black' : 'text-slate-300'}`}>
                        {item.servo_nome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="h-full min-h-[500px] bg-white rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-slate-300 p-10">
            <Calendar size={64} className="opacity-20 mb-4"/>
            <p className="text-xl font-bold">Aguardando geração...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalaLiturgica;