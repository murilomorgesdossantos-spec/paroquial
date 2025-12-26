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

        const servosFormatados = result.rows.map(servo => ({
            id: servo.id,
            name: servo.name || "Sem Nome", 
            roles: Array.isArray(servo.roles) ? servo.roles : [] 
        }));

        res.send(servosFormatados); 
    });
});

// 2. ADICIONAR (POST)
app.post('/servos', (req, res) => {
    const { nome } = req.body; 
    const sql = "INSERT INTO servos (name, roles) VALUES ($1, $2) RETURNING id";
    
    db.query(sql, [nome || "Novo Servo", []], (err, result) => {
        if (err) {
            console.error("Erro no log do Render:", err);
            return res.status(500).send(err);
        }
        const novoId = result.rows[0].id;
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

// --- NOVAS ROTAS PARA ESCALA LITÚRGICA ---

// 5. SALVAR HISTÓRICO DE ESCALA (POST)
app.post('/historico', async (req, res) => {
    const { escala } = req.body; // Espera um array de {servo_id, funcao}
    try {
        // Itera sobre cada servo escalado e insere no banco
        const queries = escala.map(item => 
            db.query(
                "INSERT INTO historico_escalas (servo_id, funcao, data_escala) VALUES ($1, $2, CURRENT_DATE)", 
                [item.servo_id, item.funcao]
            )
        );
        await Promise.all(queries);
        res.send({ message: "Escala salva no histórico com sucesso!" });
    } catch (err) {
        console.error("Erro ao salvar histórico:", err);
        res.status(500).send({ error: "Erro ao salvar histórico" });
    }
});

// 6. BUSCAR PRÓXIMOS DA FILA (GET)
// Esta query retorna os servos ordenados por quem serviu há MAIS TEMPO ou NUNCA serviu
app.get('/proximos-da-fila', (req, res) => {
    const sql = `
        SELECT s.id, s.name, MAX(h.data_escala) as ultima_vez
        FROM servos s
        LEFT JOIN historico_escalas h ON s.id = h.servo_id
        GROUP BY s.id, s.name
        ORDER BY ultima_vez ASC NULLS FIRST, s.id ASC;
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Erro ao buscar fila:", err);
            return res.status(500).send({ error: "Erro ao calcular rodízio" });
        }
        res.send(result.rows);
    });
});

// Rota Coringa
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'gerenciador-equipe', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));