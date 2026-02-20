const fs = require('fs');
const path = require('path');

const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
`.replace(/\n/g, '\r\n');

fs.writeFileSync(path.join(__dirname, 'prisma', 'schema2.prisma'), schema, 'utf8');
console.log('minimal schema2.prisma written successfully');
