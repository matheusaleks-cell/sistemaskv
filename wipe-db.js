const { Pool } = require('pg');
require('dotenv').config();

// Use local env for connection string
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function wipe() {
    try {
        console.log('--- LIMPANDO DADOS FAKES ---');

        // Deletar itens primeiro por causa da chave estrangeira
        await pool.query('DELETE FROM "OrderItem"');
        console.log('1. OrderItem limpo');

        // Deletar pedidos
        await pool.query('DELETE FROM "Order"');
        console.log('2. Order limpo');

        // Deletar clientes (exceto os que o usuário queira manter, mas imagino que queira todos fakes fora)
        await pool.query('DELETE FROM "Client"');
        console.log('3. Client limpo');

        // Deletar registros financeiros
        await pool.query('DELETE FROM "FinancialRecord"');
        console.log('4. FinancialRecord limpo');

        // Deletar Logs
        await pool.query('DELETE FROM "Log"');
        console.log('5. Log limpo');

        // Deletar usuários extras (manter apenas Wiliam e Amanda)
        await pool.query(`DELETE FROM "User" WHERE email NOT IN ('wiliam@grafica.com', 'amanda@atendimento.com')`);
        console.log('6. Users filtrados (Mantido Wiliam e Amanda)');

        console.log('--- SUCESSO! Banco de dados limpo. ---');
    } catch (e) {
        console.error('ERRO AO LIMPAR:', e.message);
    } finally {
        await pool.end();
    }
}

wipe();
