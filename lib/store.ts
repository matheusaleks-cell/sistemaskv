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
    login: (email: string, password?: string) => Promise<boolean>;
    logout: () => void;
    updatePassword: (userId: string, newPassword: string) => Promise<boolean>;

    // Database Sync
    hydrate: () => Promise<void>;

    addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<boolean>;
    updateClient: (id: string, data: Partial<Client>) => Promise<boolean>;

    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: string, data: Partial<Omit<Product, 'id'>>) => void;
    deleteProduct: (id: string) => void;

    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
    addDirectOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'osNumber' | 'productionStart'>) => Promise<boolean>;
    updateOrderStatus: (id: string, status: OrderStatus, user: User) => Promise<boolean>;

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
                { id: '1', name: 'Wiliam', email: 'wiliam@grafica.com', role: 'MASTER', password: 'Jojo!246040' },
                { id: '2', name: 'Amanda', email: 'amanda@atendimento.com', role: 'ATTENDANT', password: 'Jojo!246040' }
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

            login: async (identifier, password) => {
                try {
                    const { loginAction } = await import('@/lib/actions/auth');
                    const result = await loginAction(identifier, password);

                    if (result.success && result.user) {
                        set({ currentUser: result.user as User });
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Login store error:', error);
                    return false;
                }
            },

            logout: () => set({ currentUser: null }),

            updatePassword: async (userId, newPassword) => {
                const { updatePasswordAction } = await import('@/lib/actions/auth');
                const result = await updatePasswordAction(userId, newPassword);

                if (result.success) {
                    set(state => ({
                        users: state.users.map(u => u.id === userId ? { ...u, password: newPassword } : u),
                        currentUser: state.currentUser?.id === userId ? { ...state.currentUser, password: newPassword } : state.currentUser
                    }));
                    return true;
                }
                return false;
            },

            hydrate: async () => {
                try {
                    const { getClientsAction } = await import('@/lib/actions/clients');
                    const { getOrdersAction } = await import('@/lib/actions/orders');

                    const [clientsRes, ordersRes] = await Promise.all([
                        getClientsAction(),
                        getOrdersAction()
                    ]);

                    if (clientsRes.success && clientsRes.clients) {
                        const clients = (clientsRes.clients as any[]).map(c => ({
                            ...c,
                            createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt
                        }));
                        set({ clients });
                    }
                    if (ordersRes.success && ordersRes.orders) {
                        const orders = (ordersRes.orders as any[]).map(o => ({
                            ...o,
                            createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
                            productionStart: o.productionStart instanceof Date ? o.productionStart.toISOString() : o.productionStart,
                            finishedAt: o.finishedAt instanceof Date ? o.finishedAt.toISOString() : o.finishedAt,
                        }));
                        set({ orders });
                    }
                } catch (error) {
                    console.error('Hydrate error:', error);
                }
            },

            addClient: async (clientData) => {
                try {
                    const { createClientAction } = await import('@/lib/actions/clients');
                    const result = await createClientAction(clientData);

                    if (result.success && result.client) {
                        const newClient = {
                            ...(result.client as any),
                            createdAt: (result.client as any).createdAt instanceof Date ? (result.client as any).createdAt.toISOString() : (result.client as any).createdAt
                        } as Client;
                        set((state) => ({
                            clients: [newClient, ...state.clients]
                        }));
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Add client error:', error);
                    return false;
                }
            },

            updateClient: async (id, data) => {
                // Implementation for updateClient in DB if needed
                set((state) => ({
                    clients: state.clients.map(c => c.id === id ? { ...c, ...data } : c)
                }));
                return true;
            },

            addProduct: (productData: Omit<Product, 'id'>) => set((state) => ({
                products: [...state.products, { ...productData, id: uuidv4() }]
            })),

            updateProduct: (id: string, data: Partial<Omit<Product, 'id'>>) => set((state) => ({
                products: state.products.map(p => p.id === id ? { ...p, ...data } : p)
            })),

            deleteProduct: (id: string) => set((state) => ({
                products: state.products.filter(p => p.id !== id)
            })),

            addOrder: async (orderData) => {
                try {
                    const { createOrderAction } = await import('@/lib/actions/orders');
                    const fullOrderData = {
                        ...orderData,
                        status: 'QUOTE',
                        hasShipping: orderData.hasShipping || false,
                        shippingAddress: orderData.shippingAddress || '',
                        shippingValue: orderData.shippingValue || 0,
                    };

                    const result = await createOrderAction(fullOrderData);

                    if (result.success && result.order) {
                        const newOrder = {
                            ...(result.order as any),
                            createdAt: (result.order as any).createdAt instanceof Date ? (result.order as any).createdAt.toISOString() : (result.order as any).createdAt,
                            items: orderData.items // Re-attach items since create return might be missing them if not included
                        } as Order;
                        set(state => ({ orders: [newOrder, ...state.orders] }));
                        await get().logAction('CRIAR_ORCAMENTO', `Criou orçamento para ${newOrder.clientName}`, get().currentUser!);
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Add order error:', error);
                    return false;
                }
            },

            addDirectOrder: async (orderData) => {
                try {
                    const { createOrderAction } = await import('@/lib/actions/orders');
                    const fullOrderData = {
                        ...orderData,
                        status: 'PRODUCTION',
                        osNumber: `OS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                        productionStart: new Date().toISOString(),
                        hasShipping: orderData.hasShipping || false,
                        shippingAddress: orderData.shippingAddress || '',
                        shippingValue: orderData.shippingValue || 0,
                    };

                    const result = await createOrderAction(fullOrderData);

                    if (result.success && result.order) {
                        const newOrder = {
                            ...(result.order as any),
                            createdAt: (result.order as any).createdAt instanceof Date ? (result.order as any).createdAt.toISOString() : (result.order as any).createdAt,
                            productionStart: (result.order as any).productionStart instanceof Date ? (result.order as any).productionStart.toISOString() : (result.order as any).productionStart,
                            items: orderData.items
                        } as Order;
                        set(state => ({ orders: [newOrder, ...state.orders] }));
                        await get().logAction('CRIAR_PEDIDO_DIRETO', `Criou pedido direto para ${newOrder.clientName}`, get().currentUser!);
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Add direct order error:', error);
                    return false;
                }
            },

            updateOrderStatus: async (id, status, user) => {
                try {
                    const { updateOrderStatusAction } = await import('@/lib/actions/orders');
                    const result = await updateOrderStatusAction(id, status);

                    if (result.success && result.order) {
                        const updatedOrder = {
                            ...(result.order as any),
                            createdAt: (result.order as any).createdAt instanceof Date ? (result.order as any).createdAt.toISOString() : (result.order as any).createdAt,
                            productionStart: (result.order as any).productionStart instanceof Date ? (result.order as any).productionStart.toISOString() : (result.order as any).productionStart,
                            finishedAt: (result.order as any).finishedAt instanceof Date ? (result.order as any).finishedAt.toISOString() : (result.order as any).finishedAt,
                        } as Order;

                        set(state => ({
                            orders: state.orders.map(o => o.id === id ? { ...o, ...updatedOrder } : o)
                        }));
                        await get().logAction('MUDAR_STATUS', `Pedido ${id} para ${status}`, user);
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Update order status error:', error);
                    return false;
                }
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
            skipHydration: false,
            partialize: (state) => ({
                currentUser: state.currentUser,
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
