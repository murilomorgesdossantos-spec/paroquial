const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const path = require('path'); 

const app = express();

app.use(express.json());
app.use(cors());

// 1. CORREÇÃO PRINCIPAL:
// Apontamos para a pasta onde o Vite cria o build (dentro da subpasta do projeto)
app.use(express.static(path.join(__dirname, 'gerenciador-equipe', 'dist')));

// --- SUAS ROTAS DE API (MANTIDAS IGUAIS) ---

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

// ADICIONAR (POST)
app.post('/servos', (req, res) => {
    const { nome } = req.body; 
    const sql = "INSERT INTO servos (name, roles) VALUES ($1, '[]') RETURNING id";
    
    db.query(sql, [nome], (err, result) => {
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

// ATUALIZAR (PUT)
app.put('/servos/:id', (req, res) => {
    const { id } = req.params;
    const { funcoes } = req.body; 
    const funcoesString = JSON.stringify(funcoes);
    
    const sql = "UPDATE servos SET roles = $1 WHERE id = $2";
    
    db.query(sql, [funcoesString, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Atualizado" });
    });
});

// --- FIM DAS ROTAS DE API ---

// 2. CORREÇÃO DA ROTA CORINGA:
// Se não for API, devolve o index.html que está lá na pasta dist
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'gerenciador-equipe', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});