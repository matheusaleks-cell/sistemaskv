import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Client, Order, Product, Log, OrderStatus, SystemSettings, FinancialRecord, FinancialStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
    currentUser: User | null;
    users: User[];
    clients: Client[];
    orders: Order[];
    products: Product[];
    financialRecords: FinancialRecord[];
    logs: Log[];
    settings: SystemSettings;

    // Actions
    login: (email: string, password?: string) => boolean;
    logout: () => void;
    updatePassword: (userId: string, newPassword: string) => void;

    addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
    updateClient: (id: string, data: Partial<Client>) => void;

    addProduct: (product: Omit<Product, 'id'>) => void;

    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
    addDirectOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'osNumber' | 'productionStart'>) => void;
    updateOrderStatus: (id: string, status: OrderStatus, user: User) => void;

    addFinancialRecord: (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => void;
    updateFinancialStatus: (id: string, status: FinancialStatus, paidDate?: string) => void;

    updateSettings: (settings: Partial<SystemSettings>) => void;

    logAction: (action: string, details: string, user: User) => void;

    // Computed (Actions that return data)
    getOrdersByStatus: (status: OrderStatus) => Order[];
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            users: [
                { id: '1', name: 'Wiliam', email: 'wiliam@grafica.com', role: 'MASTER', password: '12345' },
                { id: '2', name: 'Amanda', email: 'amanda@atendimento.com', role: 'ATTENDANT', password: '12345' }
            ],
            clients: [],
            orders: [],
            products: [
                {
                    id: '1',
                    name: 'Lona Frontlight',
                    price: 80,
                    defaultDays: 2,
                    category: 'BANNER',
                    pricingType: 'AREA',
                    minPrice: 35
                },
                {
                    id: '2',
                    name: 'Adesivo Vinil',
                    price: 120,
                    defaultDays: 1,
                    category: 'STICKER',
                    pricingType: 'AREA',
                    minPrice: 35
                },
                {
                    id: '3',
                    name: 'Caneca Personalizada',
                    price: 35,
                    defaultDays: 1,
                    category: 'GIFTS',
                    pricingType: 'FIXED',
                    minPrice: 0
                }
            ],
            financialRecords: [],
            logs: [],
            settings: {
                enableFinancial: true,
                enableQualityChecklist: false,
            },

            login: (email, password) => {
                const user = get().users.find(u => u.email === email && u.password === password);
                if (user) {
                    set({ currentUser: user });
                    return true;
                }
                return false;
            },

            logout: () => set({ currentUser: null }),

            updatePassword: (userId, newPassword) => set(state => ({
                users: state.users.map(u => u.id === userId ? { ...u, password: newPassword } : u),
                currentUser: state.currentUser?.id === userId ? { ...state.currentUser, password: newPassword } : state.currentUser
            })),

            addClient: (clientData) => set((state) => ({
                clients: [...state.clients, { ...clientData, id: uuidv4(), createdAt: new Date().toISOString() }]
            })),

            updateClient: (id, data) => set((state) => ({
                clients: state.clients.map(c => c.id === id ? { ...c, ...data } : c)
            })),

            addProduct: (productData) => set((state) => ({
                products: [...state.products, { ...productData, id: uuidv4() }]
            })),

            addOrder: (orderData) => {
                const newOrder: Order = {
                    ...orderData,
                    id: uuidv4(),
                    status: 'QUOTE',
                    createdAt: new Date().toISOString(),
                    hasShipping: orderData.hasShipping || false,
                    shippingAddress: orderData.shippingAddress || '',
                    shippingValue: orderData.shippingValue || 0,
                };
                set(state => ({ orders: [...state.orders, newOrder] }));
                get().logAction('CRIAR_ORCAMENTO', `Criou orçamento para ${newOrder.clientName}`, get().currentUser!);
            },

            addDirectOrder: (orderData) => {
                const newOrder: Order = {
                    ...orderData,
                    id: uuidv4(),
                    status: 'PRODUCTION',
                    osNumber: `OS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                    productionStart: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    hasShipping: orderData.hasShipping || false,
                    shippingAddress: orderData.shippingAddress || '',
                    shippingValue: orderData.shippingValue || 0,
                };
                set(state => ({ orders: [...state.orders, newOrder] }));
                get().logAction('CRIAR_PEDIDO_DIRETO', `Criou pedido direto para ${newOrder.clientName}`, get().currentUser!);
            },

            updateOrderStatus: (id, status, user) => {
                // Get order before update to log
                const order = get().orders.find(o => o.id === id);
                if (!order) return;

                set(state => {
                    const orderIndex = state.orders.findIndex(o => o.id === id);
                    if (orderIndex === -1) return state;

                    const updatedOrders = [...state.orders];
                    const updatedOrder = { ...updatedOrders[orderIndex] };

                    // Logic for transitions
                    if (status === 'APPROVED' && updatedOrder.status === 'QUOTE') {
                        updatedOrder.osNumber = `OS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
                        updatedOrder.productionStart = new Date().toISOString();
                    }
                    if (status === 'COMPLETED') updatedOrder.finishedAt = new Date().toISOString();

                    updatedOrder.status = status;
                    updatedOrders[orderIndex] = updatedOrder;

                    return { orders: updatedOrders };
                });

                get().logAction('MUDAR_STATUS', `Pedido ${id} para ${status}`, user);
            },

            addFinancialRecord: (recordData) => set((state) => ({
                financialRecords: [
                    ...state.financialRecords,
                    { ...recordData, id: uuidv4(), createdAt: new Date().toISOString() }
                ]
            })),

            updateFinancialStatus: (id, status, paidDate) => set((state) => ({
                financialRecords: state.financialRecords.map(r =>
                    r.id === id ? { ...r, status, paidDate: paidDate || r.paidDate } : r
                )
            })),

            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            logAction: (action, details, user) => set(state => ({
                logs: [...state.logs, {
                    id: uuidv4(),
                    date: new Date(),
                    userId: user.id,
                    userName: user.name,
                    action,
                    details
                }]
            })),

            getOrdersByStatus: (status) => get().orders.filter(o => o.status === status)
        }),
        {
            name: 'grafica-flow-storage',
            storage: createJSONStorage(() => localStorage),
            skipHydration: true,
            partialize: (state) => ({
                users: state.users,
                clients: state.clients,
                orders: state.orders,
                products: state.products,
                financialRecords: state.financialRecords,
                logs: state.logs,
                settings: state.settings
            }),
        }
    )
);
