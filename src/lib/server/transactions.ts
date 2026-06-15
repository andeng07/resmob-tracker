import { ObjectId } from "mongodb";
import { events } from "$lib/server/events";
import { db } from "./db";

export type Activity =
  | "charot-reading"
  | "live-drawing-photobooth"
  | "tie-dye-booth"
  | "cup-match-game"
  | "can-shooting-game"
  | "jack-and-cup-stack";

export type Method = "cash" | "cashless";

export interface Transaction {
  _id?: ObjectId;

  method: Method;

  amount: number;
  paid: number;
  change: number;

  activity: Activity;
  description: string;

  createdBy: string;

  createdAt: Date;
}

export interface TransactionFilters {
  method?: Method;
  activity?: Activity;
  from?: Date;
  to?: Date;
  limit?: number;
}

const transactions = db.collection<Transaction>("transactions");

// =========================
// CREATE
// =========================
export async function createTransaction(
  data: Omit<Transaction, "_id" | "createdAt" | "change">,
): Promise<ObjectId> {
  const change = data.paid - data.amount;

  if (change < 0) {
    throw new Error("Insufficient payment");
  }

  const result = await transactions.insertOne({
    ...data,
    change,
    createdAt: new Date(),
  });

  events.emit("transactions:updated");

  return result.insertedId;
}

export async function getTransaction(
  id: ObjectId,
): Promise<Transaction | null> {
  return transactions.findOne({ _id: id });
}

export async function getTransactions(): Promise<Transaction[]> {
  return transactions.find().sort({ createdAt: -1 }).toArray();
}

export async function getTransactionsByFilters(
  filters: TransactionFilters,
): Promise<Transaction[]> {
  const query: any = {};

  if (filters.method) {
    query.method = filters.method;
  }

  if (filters.activity) {
    query.activity = filters.activity;
  }

  if (filters.from || filters.to) {
    query.createdAt = {};

    if (filters.from) {
      query.createdAt.$gte = filters.from;
    }

    if (filters.to) {
      query.createdAt.$lte = filters.to;
    }
  }

  return transactions
    .find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit ?? 0)
    .toArray();
}

export async function deleteTransaction(id: ObjectId): Promise<boolean> {
  const result = await transactions.deleteOne({ _id: id });

  events.emit("transactions:updated");

  return result.deletedCount > 0;
}

export async function getTotalRevenue(): Promise<number> {
  const result = await transactions
    .aggregate<{ total: number }>([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])
    .toArray();

  return result[0]?.total ?? 0;
}

export async function getTotalCashReceived(): Promise<number> {
  const result = await transactions
    .aggregate<{ total: number }>([
      {
        $group: {
          _id: null,
          total: { $sum: "$paid" },
        },
      },
    ])
    .toArray();

  return result[0]?.total ?? 0;
}

export async function getTotalChangeGiven(): Promise<number> {
  const result = await transactions
    .aggregate<{ total: number }>([
      {
        $group: {
          _id: null,
          total: { $sum: "$change" },
        },
      },
    ])
    .toArray();

  return result[0]?.total ?? 0;
}

export async function getRevenueByActivity(): Promise<
  {
    activity: Activity;
    revenue: number;
  }[]
> {
  const result = await transactions
    .aggregate<{
      _id: Activity;
      revenue: number;
    }>([
      {
        $group: {
          _id: "$activity",
          revenue: { $sum: "$amount" },
        },
      },
      {
        $sort: { revenue: -1 },
      },
    ])
    .toArray();

  return result.map((item) => ({
    activity: item._id,
    revenue: item.revenue,
  }));
}

export async function getDashboardStats(): Promise<{
  revenue: number;
  cashReceived: number;
  changeGiven: number;
  transactionCount: number;
}> {
  const [revenue, cashReceived, changeGiven, transactionCount] =
    await Promise.all([
      getTotalRevenue(),
      getTotalCashReceived(),
      getTotalChangeGiven(),
      transactions.countDocuments(),
    ]);

  return {
    revenue,
    cashReceived,
    changeGiven,
    transactionCount,
  };
}

export async function getRevenueFlow() {
  return transactions
    .aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d %H:00",
              date: "$createdAt",
              timezone: "Asia/Manila",
            },
          },
          revenue: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ])
    .toArray();
}

export { transactions };
