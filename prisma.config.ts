import { defineConfig } from '@prisma/config'

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        // This is used by CLI commands like `prisma migrate`
        url: process.env.DIRECT_URL || process.env.DATABASE_URL
    },
})
