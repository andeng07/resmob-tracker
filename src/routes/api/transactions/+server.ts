import { json } from "@sveltejs/kit";
import {
  createTransaction,
  getTransactions,
  getTransactionsByFilters,
  type Activity,
  type Method,
} from "$lib/server/transactions";

export async function GET({ url }) {
  try {
    const activity = url.searchParams.get("activity");
    const method = url.searchParams.get("method");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 10000);
    const skip = (page - 1) * limit;

    const hasFilters = activity || method || from || to;

    const baseQuery = hasFilters
      ? await getTransactionsByFilters({
          activity: activity as Activity | undefined,
          method: method as Method | undefined,
          from: from ? new Date(from) : undefined,
          to: to ? new Date(to) : undefined,
        })
      : await getTransactions();

    const paginated = baseQuery.slice(skip, skip + limit);

    return json({
      data: paginated,
      total: baseQuery.length,
      page,
      limit,
      pages: Math.ceil(baseQuery.length / limit),
    });
  } catch (error) {
    console.error(error);

    return json({ message: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json();

    const id = await createTransaction({
      method: body.method,
      amount: Number(body.amount),
      paid: Number(body.paid),
      activity: body.activity,
      description: body.description,
      createdBy: body.createdBy,
    });

    return json({
      success: true,
      id: id.toString(),
    });
  } catch (error) {
    console.error(error);

    return json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create transaction",
      },
      { status: 400 },
    );
  }
}
