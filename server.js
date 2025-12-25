const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

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

// ADICIONAR (POST) - Corrigido para 'name' e 'roles'
app.post('/servos', (req, res) => {
    const { nome } = req.body; // O frontend ainda manda como { nome: ... } no cadastro
    
    const sql = "INSERT INTO servos (name, roles) VALUES ($1, '[]') RETURNING id";
    
    db.query(sql, [nome], (err, result) => {
        if (err) {
            console.error("Erro ao inserir:", err);
            return res.status(500).send(err);
        }
        const novoId = result.rows[0].id;
        // Retorna adaptado para o frontend entender
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

// ATUALIZAR (PUT) - Corrigido para 'roles'
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});