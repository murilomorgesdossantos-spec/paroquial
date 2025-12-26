const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const path = require('path'); 

const app = express();

app.use(express.json());
app.use(cors());

// 1. Apontamos para a pasta onde o Vite cria o build
app.use(express.static(path.join(__dirname, 'gerenciador-equipe', 'dist')));

// --- SUAS ROTAS DE API CORRIGIDAS ---

// BUSCAR (GET)
app.get('/servos', (req, res) => {
    const sql = "SELECT * FROM servos ORDER BY id ASC";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Erro no banco:", err);
            return res.status(500).send({ error: "Erro ao buscar dados" });
        }
        res.send(result.rows); 
    });
});

// ADICIONAR (POST) - CORRIGIDO
app.post('/servos', (req, res) => {
    const { nome } = req.body; 
    
    // MUDANÇA 1: Trocamos '[]' fixo por $2 (um parâmetro)
    // Isso evita o erro "malformed array literal"
    const sql = "INSERT INTO servos (name, roles) VALUES ($1, $2) RETURNING id";
    
    // MUDANÇA 2: Passamos um array vazio [] real do Javascript no segundo parâmetro
    // A biblioteca 'pg' vai converter isso automaticamente para '{}' pro Postgres
    db.query(sql, [nome, []], (err, result) => {
        if (err) {
            console.error("Erro ao inserir:", err);
            return res.status(500).send(err);
        }
        const novoId = result.rows[0].id;
        res.send({ id: novoId, nome: nome, funcoes: [] });
    });
});

// DELETAR (DELETE)
app.delete('/servos/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM servos WHERE id = $1";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Deletado com sucesso" });
    });
});

// ATUALIZAR (PUT) - CORRIGIDO
app.put('/servos/:id', (req, res) => {
    const { id } = req.params;
    let { funcoes } = req.body; 
    
    // MUDANÇA 3: REMOVEMOS O JSON.stringify!
    // O banco precisa receber o array puro, não uma string.
    
    // Prevenção: Se por acaso vier null, garante que seja array vazio
    if (!funcoes) funcoes = [];

    const sql = "UPDATE servos SET roles = $1 WHERE id = $2";
    
    // Passamos 'funcoes' direto (o array puro)
    db.query(sql, [funcoes, id], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar:", err); // Adicionei log para ajudar
            return res.status(500).send(err);
        }
        res.send({ message: "Atualizado" });
    });
});

// --- FIM DAS ROTAS DE API ---

// 2. Rota Coringa para o Frontend
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'gerenciador-equipe', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});