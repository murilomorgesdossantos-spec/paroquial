const express = require('express');
const cors = require('cors');
const db = require('./db'); // Sua conexão PostgreSQL (db.js)

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve o site da pasta public

// --- ROTA 1: BUSCAR TUDO (GET) ---
app.get('/servos', (req, res) => {
    // Ordena pelo ID para a lista não ficar pulando
    const sql = "SELECT * FROM servos ORDER BY id ASC";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Erro no banco:", err);
            return res.status(500).send({ error: "Erro ao buscar dados" });
        }
        // CORREÇÃO POSTGRES: Os dados vêm dentro de .rows
        res.send(result.rows); 
    });
});

// --- ROTA 2: ADICIONAR (POST) ---
app.post('/servos', (req, res) => {
    const { nome } = req.body;
    
    // CORREÇÃO POSTGRES: 
    // 1. Usa $1 em vez de ?
    // 2. Usa 'RETURNING id' porque o Postgres não devolve o ID automaticamente
    const sql = "INSERT INTO servos (nome, funcoes) VALUES ($1, '[]') RETURNING id";
    
    db.query(sql, [nome], (err, result) => {
        if (err) {
            console.error("Erro ao inserir:", err);
            return res.status(500).send(err);
        }
        // Pega o ID que foi retornado
        const novoId = result.rows[0].id;
        res.send({ id: novoId, nome, funcoes: [] });
    });
});

// --- ROTA 3: DELETAR (DELETE) ---
app.delete('/servos/:id', (req, res) => {
    const { id } = req.params;
    // CORREÇÃO POSTGRES: Usa $1
    const sql = "DELETE FROM servos WHERE id = $1";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Deletado com sucesso" });
    });
});

// --- ROTA 4: ATUALIZAR (PUT) ---
app.put('/servos/:id', (req, res) => {
    const { id } = req.params;
    const { funcoes } = req.body; 
    const funcoesString = JSON.stringify(funcoes);
    
    // CORREÇÃO POSTGRES: Usa $1 e $2
    const sql = "UPDATE servos SET funcoes = $1 WHERE id = $2";
    
    db.query(sql, [funcoesString, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Atualizado" });
    });
});

// Inicia servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});