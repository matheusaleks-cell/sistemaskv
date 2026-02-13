
const { getClientsAction } = require('./lib/actions/clients');
require('dotenv').config();

async function test() {
    console.log('Testing getClientsAction...');
    const result = await getClientsAction();
    console.log('Result:', JSON.stringify(result, null, 2));
}
test();
