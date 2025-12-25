const express = require('express');
const cors = require('cors');
const db = require('./db'); // Seu arquivo de conexão com o banco

const app = express();

app.use(express.json());
app.use(cors());

// --- MUDANÇA 1: Servir os arquivos da pasta 'public' ---
app.use(express.static('public')); 
// Isso faz o http://localhost:3001 abrir seu site automaticamente!

// --- ROTAS DO BANCO DE DADOS ---

// Rota para buscar todos os servos (Você provavelmente já tinha essa)
app.get('/servos', (req, res) => {
    const sql = "SELECT * FROM servos";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    });
});

// --- NOVAS ROTAS (ADICIONE ISSO PARA O GERENCIADOR FUNCIONAR) ---

// 1. Adicionar Servo
app.post('/servos', (req, res) => {
    const { nome } = req.body;
    const sql = "INSERT INTO servos (nome, funcoes) VALUES (?, '[]')";
    db.query(sql, [nome], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ id: result.insertId, nome, funcoes: [] });
    });
});

// 2. Deletar Servo
app.delete('/servos/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM servos WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Deletado com sucesso" });
    });
});

// 3. Atualizar Funções
app.put('/servos/:id', (req, res) => {
    const { id } = req.params;
    const { funcoes } = req.body; 
    const funcoesString = JSON.stringify(funcoes); // Converte array para texto
    const sql = "UPDATE servos SET funcoes = ? WHERE id = ?";
    db.query(sql, [funcoesString, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Atualizado" });
    });
});

// Iniciar servidor
app.listen(3001, () => {
    console.log("Servidor rodando em http://localhost:3001");
});