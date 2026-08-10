import prisma from '../prisma';

export interface DashboardMetricsResponse {
  cards: {
    totalCustomers: number;
    totalProducts: number;
    todaysChallans: number;
    lowStockProducts: number;
    totalInventoryValue: number;
  };
  lists: {
    recentChallans: any[];
    recentCustomers: any[];
  };
}

export class DashboardService {
  static async getMetrics(): Promise<DashboardMetricsResponse> {
    // 1. Calculate Start of Today (00:00:00.000)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 2. Execute all aggregation queries concurrently in parallel
    const [
      totalCustomers,
      totalProducts,
      todaysChallans,
      productInventoryData,
      recentChallans,
      recentCustomers,
    ] = await Promise.all([
      // Card 1: Total Customers
      prisma.customer.count(),

      // Card 2: Total Products
      prisma.product.count(),

      // Card 3: Today's Challans
      prisma.salesChallan.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
      }),

      // Card 4 & 5: Fetch stock, minimumStock, and unitPrice for valuation & low stock alerts
      prisma.product.findMany({
        select: {
          stock: true,
          minimumStock: true,
          unitPrice: true,
        },
      }),

      // List 1: Recent Challans (latest 5)
      prisma.salesChallan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true },
          },
          createdBy: {
            select: { id: true, name: true, role: true },
          },
        },
      }),

      // List 2: Recent Customers (latest 5)
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          customerType: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // 3. Fast memory aggregation for Inventory Value and Low Stock Count
    let lowStockProducts = 0;
    let totalInventoryValue = 0;

    for (const item of productInventoryData) {
      if (item.stock <= item.minimumStock) {
        lowStockProducts++;
      }
      totalInventoryValue += Number(item.unitPrice) * item.stock;
    }

    return {
      cards: {
        totalCustomers,
        totalProducts,
        todaysChallans,
        lowStockProducts,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      },
      lists: {
        recentChallans,
        recentCustomers,
      },
    };
  }
}
