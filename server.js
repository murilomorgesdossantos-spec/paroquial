const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const path = require('path'); 

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'gerenciador-equipe', 'dist')));

// --- ROTAS DE API BLINDADAS ---

// BUSCAR (GET) - Garante que NOME nunca seja undefined
app.get('/servos', (req, res) => {
    const sql = "SELECT * FROM servos ORDER BY id ASC";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Erro no banco:", err);
            return res.status(500).send({ error: "Erro ao buscar dados" });
        }
        
        // Mapeamento com proteção: se o campo 'name' estiver nulo no banco, enviamos ""
        const servosFormatados = result.rows.map(servo => ({
            id: servo.id,
            nome: servo.name || "Sem Nome", // Proteção contra o erro 'toLowerCase'
            funcoes: Array.isArray(servo.roles) ? servo.roles : [] 
        }));

        res.send(servosFormatados); 
    });
});

// ADICIONAR (POST)
app.post('/servos', (req, res) => {
    const { nome } = req.body; 
    
    // Inserindo com array vazio correto para PostgreSQL
    const sql = "INSERT INTO servos (name, roles) VALUES ($1, $2) RETURNING id";
    
    db.query(sql, [nome || "Novo Servo", []], (err, result) => {
        if (err) {
            console.error("Erro ao inserir:", err);
            return res.status(500).send(err);
        }
        const novoId = result.rows[0].id;

        res.send({ 
            id: novoId, 
            nome: nome || "Novo Servo", 
            funcoes: [] 
        });
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
    let { funcoes } = req.body; 
    
    // Garante que o que vai para o banco é um array
    if (!Array.isArray(funcoes)) funcoes = [];

    const sql = "UPDATE servos SET roles = $1 WHERE id = $2";
    
    db.query(sql, [funcoes, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Atualizado" });
    });
});

// Rota Coringa
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'gerenciador-equipe', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});