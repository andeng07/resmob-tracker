<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  type Transaction = {
    _id: string;
    method: "cash" | "cashless";
    amount: number;
    paid: number;
    change: number;
    activity: string;
    description: string;
    createdBy: string;
    createdAt: string;
  };

  let transactions = $state<Transaction[]>([]);
  let loading = $state(false);

  let pagination = $state({
    page: 1,
    pages: 1,
    limit: 10,
  });

  let filters = $state({
    method: "",
    activity: "",
    from: "",
    to: "",
  });

  let es: EventSource;

  // ─────────────────────────────
  // FETCH
  // ─────────────────────────────
  async function fetchTransactions() {
    loading = true;

    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });

    const { method, activity, from, to } = filters;

    if (method) params.set("method", method);
    if (activity) params.set("activity", activity);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    try {
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();

      transactions = data.data;
      pagination.pages = data.pages;
    } finally {
      loading = false;
    }
  }

  // ─────────────────────────────
  // FILTERS (FIXED REACTIVE BEHAVIOR)
  // ─────────────────────────────
  function updateFilters() {
    pagination.page = 1;
    fetchTransactions();
  }

  // ─────────────────────────────
  // PAGINATION
  // ─────────────────────────────
  function nextPage() {
    if (pagination.page < pagination.pages) {
      pagination.page += 1;
      fetchTransactions();
    }
  }

  function prevPage() {
    if (pagination.page > 1) {
      pagination.page -= 1;
      fetchTransactions();
    }
  }

  // ─────────────────────────────
  // HELPERS
  // ─────────────────────────────
  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  function methodClass(method: Transaction["method"]) {
    return method === "cash"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-blue-50 text-blue-700";
  }

  // ─────────────────────────────
  // INIT
  // ─────────────────────────────
  onMount(() => {
    fetchTransactions();

    es = new EventSource("/api/events");
    es.onmessage = fetchTransactions;

    return () => es.close();
  });
</script>

<!-- ───────────────────────────── -->
<!-- PAGE -->
<!-- ───────────────────────────── -->
<div class="min-h-screen bg-gray-50 p-6">
  <!-- HEADER -->
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-xl font-bold">Transactions</h1>
    <div>
      <button
        onclick={() => goto("/dashboard")}
        class="bg-gray-300 text-black px-4 py-2 rounded-lg hover:opacity-90"
      >
        Go to Dashboard
      </button>
      <button
        onclick={() => goto("/pos")}
        class="bg-[#b91c1c] text-white px-4 py-2 rounded-lg hover:opacity-90"
      >
        + New
      </button>
    </div>
  </div>

  <!-- FILTER BAR (FIXED LAYOUT) -->
  <div class="bg-white p-4 rounded-xl shadow-sm mb-6">
    <div class="flex flex-wrap items-end gap-3">
      <!-- METHOD -->
      <select
        bind:value={filters.method}
        onchange={updateFilters}
        class="border p-2 rounded w-full md:w-40"
      >
        <option value="">All Methods</option>
        <option value="cash">Cash</option>
        <option value="cashless">Cashless</option>
      </select>

      <!-- ACTIVITY -->
      <input
        bind:value={filters.activity}
        oninput={updateFilters}
        placeholder="Activity"
        class="border p-2 rounded w-full md:flex-1 md:min-w-[200px]"
      />

      <!-- FROM -->
      <input
        type="date"
        bind:value={filters.from}
        onchange={updateFilters}
        class="border p-2 rounded w-full md:w-44"
      />

      <!-- TO -->
      <input
        type="date"
        bind:value={filters.to}
        onchange={updateFilters}
        class="border p-2 rounded w-full md:w-44"
      />

      <!-- BUTTON -->
      <button
        onclick={updateFilters}
        class="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 w-full md:w-auto"
      >
        Apply
      </button>
    </div>
  </div>

  <!-- TABLE CARD -->
  <div class="bg-white rounded-xl shadow-sm p-6">
    <h3 class="font-semibold mb-4">Recent Transactions</h3>

    {#if loading}
      <div class="text-sm text-gray-500">Loading...</div>
    {:else if transactions.length === 0}
      <div class="text-sm text-gray-500">No transactions found.</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[700px]">
          <!-- HEADER -->
          <thead class="text-xs text-gray-500 border-b">
            <tr>
              <th class="px-4 py-3 text-left">Activity</th>
              <th class="px-4 py-3 text-left">Method</th>
              <th class="px-4 py-3 text-left">Amount</th>
              <th class="px-4 py-3 text-left">Created By</th>
              <th class="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>

          <!-- BODY -->
          <tbody class="divide-y divide-gray-100">
            {#each transactions as tx (tx._id)}
              <tr class="hover:bg-gray-50 transition">
                <td class="px-4 py-3 font-medium text-gray-800">
                  {tx.description}
                </td>

                <td class="px-4 py-3">
                  <span
                    class={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${methodClass(tx.method)}`}
                  >
                    {tx.method}
                  </span>
                </td>

                <td class="px-4 py-3 font-mono font-semibold text-gray-900">
                  ₱{tx.amount}
                </td>

                <td class="px-4 py-3 text-gray-600">
                  {tx.createdBy}
                </td>

                <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(tx.createdAt)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- PAGINATION (FIXED POSITION INSIDE CARD) -->
      <div class="flex items-center justify-between mt-5 pt-4 border-t">
        <button
          onclick={prevPage}
          disabled={pagination.page === 1}
          class="px-3 py-1 bg-white border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <p class="text-sm text-gray-600">
          Page {pagination.page} / {pagination.pages}
        </p>

        <button
          onclick={nextPage}
          disabled={pagination.page === pagination.pages}
          class="px-3 py-1 bg-white border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    {/if}
  </div>
</div>
