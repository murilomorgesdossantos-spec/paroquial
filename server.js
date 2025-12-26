const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const path = require('path'); 

const app = express();
app.use(express.json());
app.use(cors());

// Servir os arquivos do Frontend (Pasta dist do Vite)
app.use(express.static(path.join(__dirname, 'gerenciador-equipe', 'dist')));

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    // Busca na tabela específica ParoquiaLogins
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

// --- OUTRAS ROTAS DO SISTEMA ---

app.get('/servos', (req, res) => {
    const sql = "SELECT * FROM servos ORDER BY id ASC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send({ error: "Erro ao buscar" });
        const servosFormatados = result.rows.map(servo => ({
            id: servo.id,
            name: servo.name || "Sem Nome", 
            roles: Array.isArray(servo.roles) ? servo.roles : [] 
        }));
        res.send(servosFormatados); 
    });
});

app.post('/servos', (req, res) => {
    const { nome } = req.body; 
    const sql = "INSERT INTO servos (name, roles) VALUES ($1, $2) RETURNING id";
    db.query(sql, [nome || "Novo Servo", []], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ id: result.rows[0].id, name: nome || "Novo Servo", roles: [] });
    });
});

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

app.post('/historico', async (req, res) => {
    const { escala } = req.body;
    try {
        const queries = escala.map(item => 
            db.query("INSERT INTO historico_escalas (servo_id, funcao, data_escala) VALUES ($1, $2, CURRENT_DATE)", [item.servo_id, item.funcao])
        );
        await Promise.all(queries);
        res.send({ message: "Histórico salvo" });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Rota Coringa para o React Router
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'gerenciador-equipe', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));