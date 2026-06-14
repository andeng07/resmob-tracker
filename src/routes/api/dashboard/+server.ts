import { json } from "@sveltejs/kit";
import {
  getDashboardStats,
  getRevenueByActivity,
  getTransactionsByFilters,
  getRevenueFlow,
} from "$lib/server/transactions";

export async function GET() {
  try {
    const [stats, revenueByActivity, transactions, revenueFlow] =
      await Promise.all([
        getDashboardStats(),
        getRevenueByActivity(),
        getTransactionsByFilters({
          limit: 20,
        }),
        getRevenueFlow(),
      ]);

    return json({
      stats,
      revenueByActivity,
      transactions,
      revenueFlow,
    });
  } catch (err) {
    console.error("Dashboard API error:", err);

    return json(
      {
        error: "Failed to load dashboard data",
      },
      { status: 500 },
    );
  }
}
