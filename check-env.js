require('dotenv').config()
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'NOT LOADED')
console.log('Value:', process.env.DATABASE_URL)
