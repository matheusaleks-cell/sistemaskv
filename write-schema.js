const fs = require('fs');
const path = require('path');

const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String   @unique
  password  String   @default("12345")
  role      String
  createdAt DateTime @default(now())
}

model Client {
  id          String   @id @default(uuid())
  name        String
  companyName String?
  document    String?
  email       String?
  phone       String?
  origin      String?
  type        String   @default("PF")
  createdAt   DateTime @default(now())
  orders      Order[]
}

model Order {
  id              String      @id @default(uuid())
  osNumber        String?     @unique
  clientId        String
  clientName      String
  total           Decimal     @db.Decimal(10, 2)
  status          String
  createdAt       DateTime    @default(now())
  validUntil      DateTime?
  productionStart DateTime?
  deadline        DateTime?
  finishedAt      DateTime?
  hasShipping     Boolean     @default(false)
  shippingAddress String?
  shippingType    String?
  shippingValue   Decimal?    @default(0) @db.Decimal(10, 2)
  needsArt        Boolean     @default(true)
  client          Client      @relation(fields: [clientId], references: [id])
  items           OrderItem[]
}

model OrderItem {
  id          String  @id @default(uuid())
  orderId     String
  productId   String?
  productName String
  width       Decimal @db.Decimal(10, 2)
  height      Decimal @db.Decimal(10, 2)
  quantity    Int
  unitPrice   Decimal @db.Decimal(10, 2)
  totalPrice  Decimal @db.Decimal(10, 2)
  finish      String?
  costs       Json?
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model FinancialRecord {
  id          String    @id @default(uuid())
  type        String
  description String
  amount      Decimal   @db.Decimal(10, 2)
  dueDate     DateTime
  paidDate    DateTime?
  status      String
  category    String?
  orderId     String?
  createdAt   DateTime  @default(now())
}

model Log {
  id       String   @id @default(uuid())
  date     DateTime @default(now())
  action   String
  details  String
  userId   String
  userName String
}

model Product {
  id          String   @id @default(uuid())
  name        String
  price       Decimal  @db.Decimal(10, 2)
  minPrice    Decimal? @default(0) @db.Decimal(10, 2)
  pricingType String   @default("AREA")
  category    String   @default("OTHER")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
`.replace(/\n/g, '\r\n');

fs.writeFileSync(path.join(__dirname, 'prisma', 'schema.prisma'), schema, 'utf8');
console.log('schema.prisma written successfully');
