const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const path = require('path'); 

const app = express();
app.use(express.json());
app.use(cors());

// Servir os arquivos estáticos do Frontend (pasta dist do Vite)
app.use(express.static(path.join(__dirname, 'gerenciador-equipe', 'dist')));

// --- 1. ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    // Consulta na tabela ParoquiaLogins
    const sql = "SELECT * FROM ParoquiaLogins WHERE usuario = $1 AND senha = $2";
    
    db.query(sql, [usuario, senha], (err, result) => {
        if (err) {
            console.error("Erro no login:", err);
            return res.status(500).send({ auth: false, message: "Erro no servidor" });
        }
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            res.send({ 
                auth: true, 
                user: { nome: user.nome_completo, usuario: user.usuario } 
            });
        } else {
            res.status(401).send({ auth: false, message: "Usuário ou senha incorretos" });
        }
    });
});

// --- 2. GERENCIAMENTO DE SERVOS ---

// Buscar todos os servos
app.get('/servos', (req, res) => {
    const sql = "SELECT * FROM servos ORDER BY id ASC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send({ error: "Erro ao buscar servos" });

        const servosFormatados = result.rows.map(servo => ({
            id: servo.id,
            name: servo.name || "Sem Nome", 
            roles: Array.isArray(servo.roles) ? servo.roles : [] 
        }));

        res.send(servosFormatados); 
    });
});

// Adicionar novo servo
app.post('/servos', (req, res) => {
    const { nome } = req.body; 
    const sql = "INSERT INTO servos (name, roles) VALUES ($1, $2) RETURNING id";
    
    db.query(sql, [nome || "Novo Servo", []], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ 
            id: result.rows[0].id, 
            name: nome || "Novo Servo", 
            roles: [] 
        });
    });
});

// Atualizar funções de um servo
app.put('/servos/:id', (req, res) => {
    const { id } = req.params;
    let { funcoes } = req.body; 
    if (!Array.isArray(funcoes)) funcoes = [];

    const sql = "UPDATE servos SET roles = $1 WHERE id = $2";
    db.query(sql, [funcoes, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Atualizado com sucesso" });
    });
});

// Deletar servo
app.delete('/servos/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM servos WHERE id = $1", [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Deletado" });
    });
});

// --- 3. ESCALA LITÚRGICA E HISTÓRICO ---

// Buscar servos ordenados pela última vez que serviram (Lógica de Rodízio)
app.get('/proximos-da-fila', (req, res) => {
    const sql = `
        SELECT s.id, s.name, MAX(h.data_escala) as ultima_vez
        FROM servos s
        LEFT JOIN historico_escalas h ON s.id = h.servo_id
        GROUP BY s.id, s.name
        ORDER BY ultima_vez ASC NULLS FIRST, s.id ASC;
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result.rows);
    });
});

// Salvar oficialização de escala no histórico
app.post('/historico', async (req, res) => {
    const { escala } = req.body; // Array de {servo_id, funcao}
    try {
        const queries = escala.map(item => 
            db.query(
                "INSERT INTO historico_escalas (servo_id, funcao, data_escala) VALUES ($1, $2, CURRENT_DATE)", 
                [item.servo_id, item.funcao]
            )
        );
        await Promise.all(queries);
        res.send({ message: "Histórico salvo com sucesso" });
    } catch (err) {
        res.status(500).send(err);
    }
});

// --- 4. PERFIL DO SERVO (HISTÓRICO INDIVIDUAL) ---

// Buscar histórico específico de um servo
app.get('/historico/:servo_id', (req, res) => {
    const { servo_id } = req.params;
    const sql = "SELECT * FROM historico_escalas WHERE servo_id = $1 ORDER BY data_escala DESC";
    db.query(sql, [servo_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result.rows);
    });
});

// Deletar um registro específico do histórico
app.delete('/historico/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM historico_escalas WHERE id = $1", [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Registro removido" });
    });
});

// Adicionar registro manual ao histórico
app.post('/historico/manual', (req, res) => {
    const { servo_id, funcao, data_escala } = req.body;
    const sql = "INSERT INTO historico_escalas (servo_id, funcao, data_escala) VALUES ($1, $2, $3)";
    db.query(sql, [servo_id, funcao, data_escala], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Registro adicionado manualmente" });
    });
});

// --- ROTA CORINGA ---
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'gerenciador-equipe', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));