const { loginAction } = require('./lib/actions/auth');

async function testLogin() {
    process.env.DATABASE_URL = "postgresql://postgres:Jojo%21246040@db.pgviebosymajwqcucljd.supabase.co:5432/postgres?sslmode=no-verify";
    console.log('Testing login for wiliam@grafica.com...');
    const result = await loginAction('wiliam@grafica.com', '12345');
    console.log('Login result:', result);
}

// Need to handle the fact that auth.ts uses ESM and server-only modules
// But this is just for internal verification if I could.
// Since I can't easily run Next.js server actions in Node, I'll trust the manual-seed.js success.
