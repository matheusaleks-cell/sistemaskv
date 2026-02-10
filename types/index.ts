export type Role = 'MASTER' | 'ATTENDANT';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: Role;
}

export type ClientType = 'PF' | 'PJ';

export interface Client {
    id: string;
    name: string;
    companyName?: string;
    document?: string; // CPF/CNPJ
    email?: string;
    phone: string;
    type: ClientType;
    origin?: string;
    createdAt: string;
}

export type ProductCategory = 'BANNER' | 'STICKER' | 'CLOTHING' | 'GIFTS' | 'OTHER';

export interface Product {
    id: string;
    name: string;
    category: ProductCategory;
    price: number; // For fixed price items or M2 price base
    pricingType: 'AREA' | 'FIXED';
    minPrice?: number; // Minimum price for small items
    defaultDays: number;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    width: number; // Stored in cm
    height: number; // Stored in cm
    quantity: number;
    finish?: string;
    unitPrice: number;
    totalPrice: number;
    // Cost calculation breakdown
    costs?: {
        taxPercent?: number;
        itemCost?: number;
        engravingCost?: number;
        tshirtCost?: number;
        silkCost?: number;
        collarCost?: number;
        sewingCost?: number;
        bagCost?: number;
        shippingCost?: number;
        markupPercent?: number;
    };
}

export type OrderStatus = 'QUOTE' | 'APPROVED' | 'PRODUCTION' | 'COMPLETED' | 'DELIVERED';

export interface Order {
    id: string;
    osNumber?: string; // Generated only when approved
    clientId: string;
    clientName: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    createdAt: string;
    validUntil?: string; // For quotes
    productionStart?: string;
    deadline?: string; // For production
    finishedAt?: string;
    hasShipping: boolean;
    shippingAddress?: string;
    shippingValue?: number;
}

export interface Log {
    id: string;
    date: Date;
    action: string;
    details: string;
    userId: string;
    userName: string;
}

export interface SystemSettings {
    enableFinancial: boolean;
    enableQualityChecklist: boolean;
}

export type FinancialRecordType = 'PAYABLE' | 'RECEIVABLE';
export type FinancialStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface FinancialRecord {
    id: string;
    type: FinancialRecordType;
    description: string;
    amount: number;
    dueDate: string;
    paidDate?: string;
    status: FinancialStatus;
    category?: string;
    orderId?: string;
    createdAt: string;
}
