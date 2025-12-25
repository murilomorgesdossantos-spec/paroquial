// --- CONFIGURAÇÃO PADRÃO ---
const REGRAS_PADRAO = {
    'Cerimonial': 2,
    'Turiferario': 1,
    'Naveteiro': 1,
    'Cruciferario': 1,
    'Librifero': 1,
    'Microfone': 1,
    'Altar': 2,
    'Intencoes': 2,
    'Ofertorio': 4,
    'Cerifario': 6
};

let BANCO_PESSOAS = []; 
let escalaAtualParaSalvar = [];

window.onload = async function() {
    renderizarInputsRegras(); // Renderiza inputs iniciais
    await carregarPessoasDoBanco();
    atualizarTotalVagas();
};

// --- API E RENDERIZAÇÃO LATERAL ---
async function carregarPessoasDoBanco() {
    try {
        const response = await fetch('/api/pessoas');
        if (!response.ok) throw new Error('Falha');
        
        BANCO_PESSOAS = await response.json();
        
        // Atualiza contador na sidebar
        document.getElementById('totalServos').innerText = `${BANCO_PESSOAS.length} servos cadastrados`;
        
        // Renderiza a lista lateral
        atualizarSidebar(BANCO_PESSOAS);

    } catch (error) {
        console.error(error);
        document.getElementById('totalServos').innerText = "Erro ao carregar";
    }
}

function atualizarSidebar(lista) {
    const container = document.getElementById('lista-servos-container');
    container.innerHTML = ''; // Limpa loading

    lista.forEach(pessoa => {
        const divItem = document.createElement('div');
        divItem.className = 'servo-item';

        const spanNome = document.createElement('span');
        spanNome.className = 'servo-name';
        spanNome.innerText = pessoa.name;

        const divTags = document.createElement('div');
        divTags.className = 'roles-tags';

        // Cria uma etiqueta para cada função
        if (pessoa.roles && Array.isArray(pessoa.roles)) {
            pessoa.roles.forEach(role => {
                const tag = document.createElement('span');
                tag.className = 'role-tag';
                tag.innerText = role;
                divTags.appendChild(tag);
            });
        }

        divItem.appendChild(spanNome);
        divItem.appendChild(divTags);
        container.appendChild(divItem);
    });
}

// --- LÓGICA DE INTERFACE ---
function mudarTipoMissa() {
    renderizarInputsRegras();
    atualizarTotalVagas();
}

function renderizarInputsRegras() {
    const container = document.getElementById('config-container');
    container.innerHTML = '';
    
    const tipoMissa = document.getElementById('tipoMissa').value;

    for (const [funcao, qtdPadrao] of Object.entries(REGRAS_PADRAO)) {
        if (tipoMissa === 'comum' && (funcao === 'Turiferario' || funcao === 'Naveteiro')) {
            continue;
        }

        const div = document.createElement('div');
        div.className = 'config-item';

        const label = document.createElement('label');
        label.innerText = funcao;

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = qtdPadrao;
        input.id = `rule-${funcao}`; 
        input.onchange = atualizarTotalVagas; 

        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    }
}

function atualizarTotalVagas() {
    let total = 0;
    const inputs = document.querySelectorAll('.config-item input');
    inputs.forEach(input => total += parseInt(input.value) || 0);
    document.getElementById('requiredSlots').innerText = total;
}

function lerRegrasDaTela() {
    const regrasAtuais = {};
    for (const funcao of Object.keys(REGRAS_PADRAO)) {
        const input = document.getElementById(`rule-${funcao}`);
        if (input && parseInt(input.value) > 0) {
            regrasAtuais[funcao] = parseInt(input.value);
        }
    }
    return regrasAtuais;
}

// --- HISTÓRICO ---
function getHistorico() {
    const salvo = localStorage.getItem('historico_missa');
    return salvo ? JSON.parse(salvo) : {};
}

function salvarHistorico(escala) {
    const historico = {};
    escala.forEach(item => {
        if (item.pessoa) historico[item.pessoa.id] = item.cargo;
    });
    localStorage.setItem('historico_missa', JSON.stringify(historico));
    
    const msg = document.getElementById('msgSalvo');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
}

function confirmarEscala() {
    if (escalaAtualParaSalvar.length === 0) return alert("Gere uma escala primeiro!");
    salvarHistorico(escalaAtualParaSalvar);
}

// --- GERAÇÃO ---
function gerarEscala() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; 

    if (BANCO_PESSOAS.length === 0) return alert("Aguardando dados do banco...");

    const regrasAtuais = lerRegrasDaTela();
    const historicoPassado = getHistorico();

    let poolDisponivel = [...BANCO_PESSOAS];
    poolDisponivel.sort(() => Math.random() - 0.5); 

    const idsUsados = new Set();
    const resultadoFinal = [];

    for (const [funcao, quantidade] of Object.entries(regrasAtuais)) {
        for (let i = 0; i < quantidade; i++) {
            
            let candidatoIndex = poolDisponivel.findIndex(p => 
                p.roles.includes(funcao) && 
                !idsUsados.has(p.id) &&
                historicoPassado[p.id] !== funcao
            );

            if (candidatoIndex === -1) {
                candidatoIndex = poolDisponivel.findIndex(p => 
                    p.roles.includes(funcao) && !idsUsados.has(p.id)
                );
            }

            let pessoaEscolhida = null;
            if (candidatoIndex !== -1) {
                pessoaEscolhida = poolDisponivel[candidatoIndex];
                idsUsados.add(pessoaEscolhida.id);
            }

            resultadoFinal.push({ cargo: funcao, pessoa: pessoaEscolhida });
        }
    }

    escalaAtualParaSalvar = resultadoFinal;

    if (resultadoFinal.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Nenhuma vaga solicitada.</td></tr>';
        return;
    }

    resultadoFinal.forEach(item => {
        const tr = document.createElement('tr');
        
        const tdFuncao = document.createElement('td');
        tdFuncao.innerText = item.cargo;
        
        const tdNome = document.createElement('td');
        if (item.pessoa) {
            tdNome.className = 'text-name';
            tdNome.innerText = item.pessoa.name;
            if (historicoPassado[item.pessoa.id] === item.cargo) {
                tdNome.innerHTML += ' <span style="font-size:0.7em; color:orange;">(Repetindo)</span>';
            }
        } else {
            tdNome.style.color = '#991b1b';
            tdNome.innerText = '-- VAGO --';
        }

        const tdStatus = document.createElement('td');
        const span = document.createElement('span');
        span.className = item.pessoa ? 'badge badge-ok' : 'badge badge-fail';
        span.innerText = item.pessoa ? 'Confirmado' : 'Falta Pessoal';
        
        tdStatus.appendChild(span);
        tr.appendChild(tdFuncao);
        tr.appendChild(tdNome);
        tr.appendChild(tdStatus);
        tbody.appendChild(tr);
    });
}