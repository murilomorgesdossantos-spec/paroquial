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

  const simplificarParaSorteio = (texto) => {
    if (!texto) return "";
    return texto
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+\d+.*$/, "")
      .toLowerCase()
      .trim();
  };

  const gerarEscalaSemanal = () => {
    if (!dataMissa) { alert("Selecione a data da missa."); return; }
    
    let disponiveis = [...servos].filter(s => !ausentes.includes(s.id));
    const novaEscalaMap = {};

    // 1. Definição de postos vitais (Um de cada categoria antes de preencher os extras)
    const postosVitais = [
      "Cerimonial 1", "Turiferário", "Naveteiro", "Cruciferário", "Librífero", 
      "Microfone", "Altar 1", "Intenções 1", "Ofertório 1", "Ceriferário 1"
    ];

    // 2. Postos de apoio (Preenchidos depois que o básico está garantido)
    const postosApoio = [
      "Cerimonial 2", "Altar 2", "Intenções 2", "Ofertório 2", "Ofertório 3", "Ofertório 4",
      "Ceriferário 2", "Ceriferário 3", "Ceriferário 4", "Ceriferário 5", "Ceriferário 6"
    ];

    const preencherFuncao = (funcaoNome) => {
      const categoria = simplificarParaSorteio(funcaoNome);

      if (!isSolene && (categoria === "turiferario" || categoria === "naveteiro")) {
        return { funcao: funcaoNome, servo_nome: "-/-", servo_id: null };
      }

      // Tenta 1: Cargo exato
      let idx = disponiveis.findIndex(s => 
        (s.roles || []).map(r => simplificarParaSorteio(r)).includes(categoria)
      );

      // Tenta 2: Fallback para não deixar vazio (Polivalência)
      if (idx === -1) {
        if (["ceriferario", "cruciferario", "librifero"].includes(categoria)) {
          idx = disponiveis.findIndex(s => (s.roles || []).map(r => simplificarParaSorteio(r)).includes("altar"));
        } else if (categoria === "altar") {
          idx = disponiveis.findIndex(s => (s.roles || []).map(r => simplificarParaSorteio(r)).some(role => ["ofertorio", "intencoes"].includes(role)));
        }
      }

      if (idx !== -1) {
        const sorteado = disponiveis.splice(idx, 1)[0];
        return { funcao: funcaoNome, servo_nome: sorteado.name, servo_id: sorteado.id };
      }
      return { funcao: funcaoNome, servo_nome: "-/-", servo_id: null };
    };

    // Executa o preenchimento em duas passagens para garantir o equilíbrio
    postosVitais.forEach(f => { novaEscalaMap[f] = preencherFuncao(f); });
    postosApoio.forEach(f => { novaEscalaMap[f] = preencherFuncao(f); });

    const escalaFinal = funcoesBase.map(f => novaEscalaMap[f]);
    setEscalaGerada(escalaFinal);
  };

  const formatarDataBR = (dataISO) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const salvarNoBanco = async () => {
    if (!escalaGerada) return;
    if (!confirm(`Confirmar salvamento para ${formatarDataBR(dataMissa)}?`)) return;

    setIsSaving(true);
    const escalados = escalaGerada.filter(item => item.servo_id !== null);

    try {
      const promises = escalados.map(item => 
        fetch('https://escala-paroquial.onrender.com/historico/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            servo_id: item.servo_id,
            nome_servo: item.servo_nome,
            funcao: item.funcao, 
            data_escala: dataMissa 
          })
        })
      );
      await Promise.all(promises);
      alert("Escala salva com sucesso!");
      fetchFila();
    } catch (error) {
      alert("Erro ao conectar.");
    } finally {
      setIsSaving(false);
    }
  };

  const baixarPDF = () => {
    const element = document.getElementById('tabela-impressao');
    const opt = {
      margin: 10,
      filename: `Escala_${dataMissa}.pdf`,
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
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 underline decoration-purple-500 decoration-2 text-left">Configurar Missa</h3>
          <div className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Data da Missa</label>
              <input type="date" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" value={dataMissa} onChange={(e) => setDataMissa(e.target.value)} />
            </div>
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="text-sm font-bold text-slate-700">Missa Solene?</span>
              <input type="checkbox" checked={isSolene} onChange={() => setIsSolene(!isSolene)} className="w-5 h-5 accent-purple-600 rounded" />
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col max-h-[400px]">
          <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2 text-left">Lista de Ausentes</h3>
          <div className="overflow-y-auto pr-2 space-y-1 custom-scrollbar text-left text-slate-600">
            {servos.map(s => (
              <button key={s.id} onClick={() => toggleAusente(s.id)} className={`w-full text-left p-2.5 rounded-lg text-sm transition-all ${ausentes.includes(s.id) ? 'bg-red-50 text-red-700 border border-red-200 font-bold' : 'bg-slate-50 hover:bg-slate-200'}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={gerarEscalaSemanal} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-purple-700 active:scale-95 transition-all uppercase">
          GERAR TABELA
        </button>
      </div>

      <div className="lg:col-span-2 space-y-4 text-center">
        {escalaGerada ? (
          <>
            <div className="flex gap-3">
              <button onClick={baixarPDF} className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold transition-all hover:bg-orange-600 uppercase">BAIXAR PDF</button>
              <button onClick={salvarNoBanco} disabled={isSaving} className={`flex-1 ${isSaving ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-xl font-bold transition-all uppercase shadow-md`}>
                {isSaving ? "SALVANDO..." : "CONFIRMAR E SALVAR"}
              </button>
            </div>

            <div id="tabela-impressao" className="bg-white p-12 text-black border rounded-xl shadow-sm">
              <div className="flex flex-col items-center mb-8">
                <img src={logoImg} alt="Logo" className="h-24 mb-4" />
                <h1 className="text-3xl font-black text-orange-600 uppercase tracking-tighter">Pastoral Coroinhas</h1>
                <p className="text-lg font-bold text-slate-700 text-center">Paróquia São Pedro e São Paulo</p>
                <div className="w-full h-1 bg-orange-500 mt-2"></div>
              </div>

              <div className="text-center mb-6 py-2 bg-slate-100 border-y border-slate-300">
                <span className="text-xl font-black uppercase tracking-widest">Escala Litúrgica - {formatarDataBR(dataMissa)}</span>
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
                      <td className="border border-slate-400 p-2 font-bold text-[11px] uppercase text-left text-slate-800">{item.funcao}</td>
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
          <div className="h-full min-h-[500px] bg-white rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-slate-400 p-10 text-center">
            <Calendar size={64} className="opacity-20 mb-4 text-purple-600"/>
            <p className="text-xl font-bold">Aguardando geração da escala...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalaLiturgica;