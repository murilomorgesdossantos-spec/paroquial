// --- CONFIGURAÇÃO PADRÃO ---
const REGRAS_PADRAO = {
    'Cerimonial': 2, 'Turiferario': 1, 'Naveteiro': 1, 'Cruciferario': 1,
    'Librifero': 1, 'Microfone': 1, 'Altar': 2, 'Intencoes': 2,
    'Ofertorio': 4, 'Cerifario': 6
};

// Funções disponíveis para aparecerem nos botões
const TODAS_FUNCOES = Object.keys(REGRAS_PADRAO);

let BANCO_PESSOAS = []; 
let escalaAtualParaSalvar = [];

window.onload = async function() {
    renderizarInputsRegras(); 
    await carregarPessoasDoBanco();
    atualizarTotalVagas();
};

// --- API E DADOS ---
async function carregarPessoasDoBanco() {
    try {
        const response = await fetch('/servos');
        if (!response.ok) throw new Error('Falha ao conectar');
        
        const dadosBrutos = await response.json();
        
        // CONVERSÃO DE DADOS (Banco em Inglês -> Frontend)
        BANCO_PESSOAS = dadosBrutos.map(servo => {
            let funcoesReais = [];
            try {
                // Tenta ler 'roles' (Inglês)
                const rawRoles = servo.roles || servo.funcoes || '[]';
                funcoesReais = typeof rawRoles === 'string' ? JSON.parse(rawRoles) : rawRoles;
            } catch (e) { funcoesReais = []; }

            return {
                id: servo.id,
                name: servo.name || servo.nome, // Aceita name (novo) ou nome (antigo)
                roles: Array.isArray(funcoesReais) ? funcoesReais : []
            };
        });
        
        // Atualiza UI principal
        document.getElementById('totalServos').innerText = `${BANCO_PESSOAS.length} servos cadastrados`;
        atualizarSidebar(BANCO_PESSOAS);

        // Se o modal estiver aberto, atualiza ele também
        if(document.getElementById('modalGerenciar').style.display === 'flex') {
            renderizarTabelaGerenciamento();
        }

    } catch (error) {
        console.error("Erro:", error);
        document.getElementById('totalServos').innerText = "Erro ao carregar";
    }
}

// --- SIDEBAR ---
function atualizarSidebar(lista) {
    const container = document.getElementById('lista-servos-container');
    container.innerHTML = ''; 

    lista.forEach(pessoa => {
        const divItem = document.createElement('div');
        divItem.className = 'servo-item';
        
        const spanNome = document.createElement('span');
        spanNome.className = 'servo-name';
        spanNome.innerText = pessoa.name; // CORREÇÃO AQUI TAMBÉM

        const divTags = document.createElement('div');
        divTags.className = 'roles-tags';

        if (pessoa.roles) {
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

// ============================================================
// === LÓGICA DO MODAL (GERENCIAMENTO) - NOVO CÓDIGO AQUI ===
// ============================================================

function abrirModalGerenciar() {
    document.getElementById('modalGerenciar').style.display = 'flex';
    renderizarTabelaGerenciamento();
}

function fecharModalGerenciar() {
    document.getElementById('modalGerenciar').style.display = 'none';
}

function renderizarTabelaGerenciamento() {
    const tbody = document.getElementById('tabelaGerenciarCorpo');
    tbody.innerHTML = '';

    BANCO_PESSOAS.forEach(servo => {
        const tr = document.createElement('tr');
        
        // 1. Coluna Nome (CORRIGIDO PARA .name)
        const tdNome = document.createElement('td');
        tdNome.style.fontWeight = "600";
        tdNome.textContent = servo.name; 

        // 2. Coluna Funções
        const tdFuncoes = document.createElement('td');
        TODAS_FUNCOES.forEach(funcao => {
            const span = document.createElement('span');
            span.textContent = funcao;
            // Verifica se a pessoa tem a função
            const ativo = servo.roles.includes(funcao);
            span.className = 'tag-modal ' + (ativo ? 'ativa' : '');
            
            // Ao clicar na tag, atualiza o cargo
            span.onclick = () => toggleFuncaoServo(servo, funcao);
            tdFuncoes.appendChild(span);
        });

        // 3. Coluna Ação (Deletar)
        const tdAcao = document.createElement('td');
        tdAcao.style.textAlign = 'center';
        const btnDel = document.createElement('button');
        btnDel.innerHTML = '🗑️'; // Ou ícone SVG
        btnDel.className = 'btn-del';
        btnDel.onclick = () => deletarServo(servo.id);
        tdAcao.appendChild(btnDel);

        tr.append(tdNome, tdFuncoes, tdAcao);
        tbody.appendChild(tr);
    });
}

// --- CRUD: ADICIONAR ---
async function adicionarServo() {
    const input = document.getElementById('novoNomeInput');
    const nome = input.value;
    if (!nome) return;

    // Envia 'nome' (Backend espera 'nome' no body, mas salva em 'name' no banco)
    await fetch('/servos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome })
    });
    
    input.value = '';
    await carregarPessoasDoBanco(); // Recarrega tudo
}

// --- CRUD: DELETAR ---
async function deletarServo(id) {
    if(!confirm("Tem certeza que deseja excluir este servo?")) return;
    await fetch(`/servos/${id}`, { method: 'DELETE' });
    await carregarPessoasDoBanco();
}

// --- CRUD: ATUALIZAR FUNÇÃO ---
async function toggleFuncaoServo(servo, funcao) {
    let novasFuncoes;
    if (servo.roles.includes(funcao)) {
        novasFuncoes = servo.roles.filter(f => f !== funcao); // Remove
    } else {
        novasFuncoes = [...servo.roles, funcao]; // Adiciona
    }

    // Backend espera { funcoes: [...] }
    await fetch(`/servos/${servo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funcoes: novasFuncoes })
    });
    
    // Atualiza localmente para ser rápido, depois recarrega
    servo.roles = novasFuncoes;
    renderizarTabelaGerenciamento(); // Atualiza só o modal visualmente
    carregarPessoasDoBanco(); // Atualiza tudo em background
}

// ============================================================
// === LÓGICA DE ESCALA (MANTIDA IGUAL) ===
// ============================================================

function mudarTipoMissa() {
    renderizarInputsRegras();
    atualizarTotalVagas();
}

function renderizarInputsRegras() {
    const container = document.getElementById('config-container');
    container.innerHTML = '';
    const tipoMissa = document.getElementById('tipoMissa').value;

    for (const [funcao, qtdPadrao] of Object.entries(REGRAS_PADRAO)) {
        if (tipoMissa === 'comum' && (funcao === 'Turiferario' || funcao === 'Naveteiro')) continue;

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

function gerarEscala() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; 

    if (BANCO_PESSOAS.length === 0) return alert("Aguardando dados do banco...");

    const regrasAtuais = lerRegrasDaTela();
    const historicoPassado = JSON.parse(localStorage.getItem('historico_missa') || '{}');

    let poolDisponivel = [...BANCO_PESSOAS];
    poolDisponivel.sort(() => Math.random() - 0.5); 

    const idsUsados = new Set();
    const resultadoFinal = [];

    for (const [funcao, quantidade] of Object.entries(regrasAtuais)) {
        for (let i = 0; i < quantidade; i++) {
            // Tenta achar alguém que tenha a função E não trabalhou nela semana passada
            let candidatoIndex = poolDisponivel.findIndex(p => 
                p.roles.includes(funcao) && 
                !idsUsados.has(p.id) &&
                historicoPassado[p.id] !== funcao
            );

            // Se não achar, pega qualquer um que tenha a função
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
            tdNome.innerText = item.pessoa.name; // CORRIGIDO PARA .name
            if (historicoPassado[item.pessoa.id] === item.cargo) {
                tdNome.innerHTML += ' <span style="font-size:0.7em; color:orange;">(Repetindo)</span>';
            }
        } else {
            tdNome.style.color = '#991b1b';
            tdNome.innerText = '-- FALTA PESSOAL --';
        }

        const tdStatus = document.createElement('td');
        const span = document.createElement('span');
        span.className = item.pessoa ? 'badge badge-ok' : 'badge badge-fail';
        span.innerText = item.pessoa ? 'Confirmado' : 'Vago';
        tdStatus.appendChild(span);

        tr.append(tdFuncao, tdNome, tdStatus);
        tbody.appendChild(tr);
    });
}

function confirmarEscala() {
    if (escalaAtualParaSalvar.length === 0) return alert("Gere uma escala primeiro!");
    const historico = {};
    escalaAtualParaSalvar.forEach(item => {
        if (item.pessoa) historico[item.pessoa.id] = item.cargo;
    });
    localStorage.setItem('historico_missa', JSON.stringify(historico));
    const msg = document.getElementById('msgSalvo');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
}