/**
 * @module dashboardService
 * @description Aggregates the admin overview: order revenue/status, best
 * sellers, 30-day revenue trend, catalog & customer counts, low-stock alerts.
 */
import { orderService } from "../order/order.service.js";
import { productRepository } from "../product/product.repository.js";
import { customerRepository } from "../customer/customer.repository.js";

const dashboardService = {
  async overview() {
    const [orderData, productCount, activeProducts, customerCount, lowStock] = await Promise.all([
      orderService.dashboard(),
      productRepository.countAll(),
      productRepository.countAll({ isActive: true }),
      customerRepository.count(),
      productRepository.lowStock(5, 8),
    ]);

    return {
      ...orderData,
      catalog: { totalProducts: productCount, activeProducts, customers: customerCount },
      lowStock: lowStock.map((p) => ({
        id: String(p._id),
        name: p.name,
        slug: p.slug,
        categoryName: p.categoryName,
        image: p.image,
        totalStock: p.totalStock,
      })),
    };
  },
};

export { dashboardService };
