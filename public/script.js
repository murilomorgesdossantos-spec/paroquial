// src/script.js

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

// BANCO DE PESSOAS (50 Pessoas)
const BANCO_PESSOAS = [
    // LIDERANÇA / CERIMONIÁRIOS
    { id: 1, name: "Murilo Morges", roles: ['Cerimonial', 'Turiferario', 'Altar'] },
    { id: 2, name: "Ana Costa", roles: ['Cerimonial', 'Microfone'] },
    { id: 3, name: "Diego Martins", roles: ['Cerimonial', 'Turiferario'] },
    { id: 4, name: "Julia Lima", roles: ['Cerimonial', 'Librifero'] },
    { id: 5, name: "Roberto Alves", roles: ['Cerimonial', 'Naveteiro'] },
    { id: 6, name: "Fernanda Rocha", roles: ['Cerimonial', 'Intencoes'] },
    
    // EQUIPE LITÚRGICA
    { id: 7, name: "Felipe Melo", roles: ['Turiferario', 'Naveteiro'] },
    { id: 8, name: "Pedro Santos", roles: ['Naveteiro', 'Cruciferario'] },
    { id: 9, name: "Otavio Pinto", roles: ['Turiferario', 'Cerifario'] },
    { id: 10, name: "Paulo Mendes", roles: ['Cruciferario', 'Cerifario'] },
    { id: 11, name: "Lucas Pereira", roles: ['Naveteiro', 'Altar'] },
    { id: 12, name: "Marcos Rocha", roles: ['Cruciferario', 'Cerifario'] },
    { id: 13, name: "Gabriel Souza", roles: ['Turiferario', 'Ofertorio'] },
    { id: 14, name: "Ricardo Lima", roles: ['Naveteiro', 'Librifero'] },

    // LEITURA / MICROFONE / INTENÇÕES
    { id: 15, name: "Maria Oliveira", roles: ['Librifero', 'Intencoes', 'Microfone'] },
    { id: 16, name: "Sara Campos", roles: ['Microfone', 'Intencoes'] },
    { id: 17, name: "Larissa Reis", roles: ['Intencoes', 'Microfone'] },
    { id: 18, name: "Carla Dias", roles: ['Intencoes', 'Altar'] },
    { id: 19, name: "Beatriz Silva", roles: ['Librifero', 'Microfone'] },
    { id: 20, name: "Sofia Gomes", roles: ['Librifero', 'Ofertorio'] },
    { id: 21, name: "Helena Martins", roles: ['Microfone', 'Cerifario'] },
    { id: 22, name: "Laura Azevedo", roles: ['Intencoes', 'Ofertorio'] },
    
    // GERAL
    { id: 23, name: "João Silva", roles: ['Cerifario', 'Ofertorio'] },
    { id: 24, name: "Tiago Souza", roles: ['Cerifario', 'Ofertorio'] },
    { id: 25, name: "Bruno Alves", roles: ['Cerifario', 'Ofertorio'] },
    { id: 26, name: "Rafael Cruz", roles: ['Cerifario', 'Altar'] },
    { id: 27, name: "Gabriela Nunes", roles: ['Ofertorio', 'Librifero'] },
    { id: 28, name: "Renata Farias", roles: ['Ofertorio', 'Altar'] },
    { id: 29, name: "Vitor Hugo", roles: ['Cerifario'] },
    { id: 30, name: "Amanda Luz", roles: ['Ofertorio'] },
    { id: 31, name: "Gustavo Henrique", roles: ['Cerifario', 'Altar'] },
    { id: 32, name: "Enzo Gabriel", roles: ['Cerifario', 'Cruciferario'] },
    { id: 33, name: "Arthur Miguel", roles: ['Cerifario', 'Ofertorio'] },
    { id: 34, name: "Theo Nogueira", roles: ['Altar', 'Ofertorio'] },
    { id: 35, name: "Heitor Vieira", roles: ['Cerifario', 'Naveteiro'] },
    { id: 36, name: "Nicolas Ramos", roles: ['Cerifario'] },
    { id: 37, name: "Lorenzo Pires", roles: ['Ofertorio', 'Cerifario'] },
    { id: 38, name: "Samuel Lopes", roles: ['Altar', 'Cerifario'] },
    { id: 39, name: "Benjamin Duarte", roles: ['Cerifario', 'Ofertorio'] },
    { id: 40, name: "Matheus Cardoso", roles: ['Cerifario'] },
    { id: 41, name: "Isaac Ferreira", roles: ['Cerifario', 'Ofertorio'] },
    { id: 42, name: "Lucca Ribeiro", roles: ['Altar', 'Ofertorio'] },
    { id: 43, name: "Davi Lucca", roles: ['Cerifario', 'Turiferario'] },
    { id: 44, name: "Pedro Henrique", roles: ['Cerifario'] },
    { id: 45, name: "Thiago Moreira", roles: ['Ofertorio', 'Intencoes'] },
    { id: 46, name: "Antonio Castro", roles: ['Cerifario', 'Altar'] },
    { id: 47, name: "Leonardo Moura", roles: ['Cerifario'] },
    { id: 48, name: "Eduardo Braga", roles: ['Ofertorio', 'Cerifario'] },
    { id: 49, name: "Caio Cesar", roles: ['Altar', 'Ofertorio'] },
    { id: 50, name: "Vinicius Santana", roles: ['Cerifario', 'Cruciferario'] }
];

let escalaAtualParaSalvar = [];

window.onload = function() {
    renderizarInputsRegras();
    atualizarTotalVagas();
};

function mudarTipoMissa() {
    renderizarInputsRegras();
    atualizarTotalVagas();
}

function renderizarInputsRegras() {
    const container = document.getElementById('config-container');
    container.innerHTML = '';
    
    const tipoMissa = document.getElementById('tipoMissa').value;

    for (const [funcao, qtdPadrao] of Object.entries(REGRAS_PADRAO)) {
        
        if (tipoMissa === 'comum') {
            if (funcao === 'Turiferario' || funcao === 'Naveteiro') {
                continue;
            }
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
    inputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });
    document.getElementById('requiredSlots').innerText = total;
}

function lerRegrasDaTela() {
    const regrasAtuais = {};
    for (const funcao of Object.keys(REGRAS_PADRAO)) {
        const input = document.getElementById(`rule-${funcao}`);
        if (input) {
            const valor = parseInt(input.value);
            if (valor > 0) {
                regrasAtuais[funcao] = valor;
            }
        }
    }
    return regrasAtuais;
}

// --- FUNÇÕES DE HISTÓRICO ---
function getHistorico() {
    const salvo = localStorage.getItem('historico_missa');
    return salvo ? JSON.parse(salvo) : {};
}

function salvarHistorico(escala) {
    const historico = {};
    escala.forEach(item => {
        if (item.pessoa) {
            historico[item.pessoa.id] = item.cargo;
        }
    });
    localStorage.setItem('historico_missa', JSON.stringify(historico));
    
    const msg = document.getElementById('msgSalvo');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
}

function confirmarEscala() {
    if (escalaAtualParaSalvar.length === 0) {
        alert("Gere uma escala primeiro!");
        return;
    }
    salvarHistorico(escalaAtualParaSalvar);
}

// --- GERAÇÃO ---
function gerarEscala() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; 

    const regrasAtuais = lerRegrasDaTela();
    const historicoPassado = getHistorico();

    // ALTERAÇÃO AQUI: Não há mais limite, usamos o banco completo embaralhado
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
                    p.roles.includes(funcao) && 
                    !idsUsados.has(p.id)
                );
            }

            let pessoaEscolhida = null;

            if (candidatoIndex !== -1) {
                pessoaEscolhida = poolDisponivel[candidatoIndex];
                idsUsados.add(pessoaEscolhida.id);
            }

            resultadoFinal.push({
                cargo: funcao,
                pessoa: pessoaEscolhida
            });
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
            tdNome.className = 'text-purple';
            tdNome.innerText = item.pessoa.name;
            
            if (historicoPassado[item.pessoa.id] === item.cargo) {
                const alerta = document.createElement('span');
                alerta.innerText = " (Repetindo)";
                alerta.style.fontSize = "0.7em";
                alerta.style.color = "orange";
                tdNome.appendChild(alerta);
            }

        } else {
            tdNome.className = 'text-red';
            tdNome.innerText = '-- VAGO --';
        }

        const tdStatus = document.createElement('td');
        const span = document.createElement('span');
        span.className = 'badge';
        if (item.pessoa) {
            span.classList.add('badge-success');
            span.innerText = 'Confirmado';
        } else {
            span.classList.add('badge-error');
            span.innerText = 'Falta Pessoal';
        }
        tdStatus.appendChild(span);

        tr.appendChild(tdFuncao);
        tr.appendChild(tdNome);
        tr.appendChild(tdStatus);
        tbody.appendChild(tr);
    });
}