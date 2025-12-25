const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão com o Banco de Dados
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Obrigatório para conexões seguras no Render
    }
});

// Mensagem para confirmar no terminal que tentou conectar
pool.on('connect', () => {
    console.log('Base de dados conectada com sucesso!');
});

pool.on('error', (err) => {
    console.error('Erro inesperado no cliente do banco', err);
    process.exit(-1);
});

module.exports = pool;