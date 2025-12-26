const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const path = require('path'); 

const app = express();
app.use(express.json());
app.use(cors());

// Servir os arquivos do Frontend
app.use(express.static(path.join(__dirname, 'gerenciador-equipe', 'dist')));

// --- ROTAS DA API ---

// 1. BUSCAR (GET) - Blindagem contra tela branca
app.get('/servos', (req, res) => {
    const sql = "SELECT * FROM servos ORDER BY id ASC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send({ error: "Erro ao buscar" });

        // IMPORTANTE: O seu frontend usa 'F.name'. 
        // Vamos garantir que ele receba 'name' (em inglês) e que nunca seja nulo.
        const servosFormatados = result.rows.map(servo => ({
            id: servo.id,
            name: servo.name || "Sem Nome", // Garante que name existe para o .toLowerCase()
            roles: Array.isArray(servo.roles) ? servo.roles : [] 
        }));

        res.send(servosFormatados); 
    });
});

// 2. ADICIONAR (POST) - Corrigindo Erro 500
app.post('/servos', (req, res) => {
    const { nome } = req.body; 
    
    // Usamos $2 para passar o array vazio [] corretamente para o PostgreSQL
    const sql = "INSERT INTO servos (name, roles) VALUES ($1, $2) RETURNING id";
    
    db.query(sql, [nome || "Novo Servo", []], (err, result) => {
        if (err) {
            console.error("Erro no log do Render:", err);
            return res.status(500).send(err);
        }
        const novoId = result.rows[0].id;

        // Retorna exatamente o que o frontend espera
        res.send({ 
            id: novoId, 
            name: nome || "Novo Servo", 
            roles: [] 
        });
    });
});

// 3. ATUALIZAR (PUT)
app.put('/servos/:id', (req, res) => {
    const { id } = req.params;
    let { funcoes } = req.body; 
    
    if (!Array.isArray(funcoes)) funcoes = [];

    const sql = "UPDATE servos SET roles = $1 WHERE id = $2";
    db.query(sql, [funcoes, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Atualizado" });
    });
});

// 4. DELETAR (DELETE)
app.delete('/servos/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM servos WHERE id = $1", [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Deletado" });
    });
});

// Rota Coringa
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'gerenciador-equipe', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));