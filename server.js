const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const path = require('path'); 

const app = express();

app.use(express.json());
app.use(cors());

// 1. Servir arquivos estáticos do Frontend (Vite)
app.use(express.static(path.join(__dirname, 'gerenciador-equipe', 'dist')));

// --- ROTAS DE API CORRIGIDAS ---

// BUSCAR (GET) - Corrigido para não quebrar o Frontend
app.get('/servos', (req, res) => {
    const sql = "SELECT * FROM servos ORDER BY id ASC";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Erro no banco:", err);
            return res.status(500).send({ error: "Erro ao buscar dados" });
        }
        
        // MAPEAMENTO: Converte os nomes das colunas do banco (inglês) 
        // para o formato que o seu Frontend React espera (português)
        const servosFormatados = result.rows.map(servo => ({
            id: servo.id,
            nome: servo.name || "",      // 'name' vira 'nome' (evita erro de toLowerCase)
            funcoes: servo.roles || []    // 'roles' vira 'funcoes'
        }));

        res.send(servosFormatados); 
    });
});

// ADICIONAR (POST) - Corrigido erro de Array e mapeamento
app.post('/servos', (req, res) => {
    const { nome } = req.body; 
    
    // Usamos $2 como parâmetro para o array vazio, evitando erro de aspas/colchetes
    const sql = "INSERT INTO servos (name, roles) VALUES ($1, $2) RETURNING id";
    
    // Passamos o array vazio [] direto. A lib 'pg' converte para '{}' corretamente.
    db.query(sql, [nome, []], (err, result) => {
        if (err) {
            console.error("Erro ao inserir:", err);
            return res.status(500).send(err);
        }
        const novoId = result.rows[0].id;

        // Retorna o objeto exatamente como o Frontend espera para atualizar a lista
        res.send({ 
            id: novoId, 
            nome: nome, 
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

// ATUALIZAR (PUT) - Corrigido erro de salvamento automático
app.put('/servos/:id', (req, res) => {
    const { id } = req.params;
    let { funcoes } = req.body; 
    
    // REMOVIDO: JSON.stringify (não deve ser usado com colunas tipo ARRAY no Postgres)
    
    // Garante que funcoes seja um array antes de enviar ao banco
    if (!funcoes || !Array.isArray(funcoes)) {
        funcoes = [];
    }

    const sql = "UPDATE servos SET roles = $1 WHERE id = $2";
    
    db.query(sql, [funcoes, id], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar funções:", err);
            return res.status(500).send(err);
        }
        res.send({ message: "Atualizado com sucesso" });
    });
});

// --- FIM DAS ROTAS DE API ---

// 2. Rota Coringa para o Frontend (React Router)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'gerenciador-equipe', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});