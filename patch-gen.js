const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const url = "postgresql://postgres:Jojo%21246040@db.pgviebosymajwqcucljd.supabase.co:5432/postgres";

// Fix schema.prisma
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');
schema = schema.replace(/url\s+=\s+env\("DATABASE_URL"\)/, `url = "${url}"`);
fs.writeFileSync(schemaPath, schema);

try {
    console.log('Generating...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Success!');
} catch (e) {
    console.error('Failed.');
} finally {
    // Revert schema
    schema = schema.replace(`url = "${url}"`, 'url = env("DATABASE_URL")');
    fs.writeFileSync(schemaPath, schema);
}
