const express = require('express');
const pool = require('./db');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Habilita conexões e leitura de JSON
app.use(cors());
app.use(express.json());

// Serve os arquivos do site (HTML, CSS, JS) que estão na pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- ROTA API: Busca as pessoas no Banco de Dados ---
app.get('/api/pessoas', async (req, res) => {
    try {
        // Faz a consulta no banco de dados
        const result = await pool.query('SELECT * FROM servos');
        
        // Devolve os dados para o frontend (seu script.js)
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar dados no banco:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar dados.' });
    }
});

// ROTA PADRÃO
// Mudamos de '*' para '(.*)' para corrigir o erro do PathError
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});