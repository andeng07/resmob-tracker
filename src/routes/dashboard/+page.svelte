<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  type Stats = {
    revenue: number;
    cashReceived: number;
    changeGiven: number;
    transactionCount: number;
  };

  type Transaction = {
    _id?: string;
    method: "cash" | "cashless";
    amount: number;
    paid: number;
    change: number;
    activity: string;
    description: string;
    createdBy: string;
    createdAt: string;
  };

  type NavItem = {
    label: string;
    key: string;
  };

  const navItems: NavItem[] = [
    { label: "Dashboard", key: "dashboard" },
    { label: "POS", key: "pos" },
    { label: "Transactions", key: "transactions" },
    { label: "Transparency", key: "transparency" },
  ];

  let activeNav = $state("dashboard");

  let stats = $state<Stats>({
    revenue: 0,
    cashReceived: 0,
    changeGiven: 0,
    transactionCount: 0,
  });

  let transactions = $state<Transaction[]>([]);
  let loading = $state(true);
  let sidebarOpen = $state(false);
  let revenueFlow = $state<{ _id: string; revenue: number }[]>([]);

  async function loadDashboard() {
    loading = true;

    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();

      stats = data.stats;
      transactions = data.transactions;
      revenueFlow = data.revenueFlow;
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      loading = false;
    }
  }

  function logout() {
    localStorage.clear();
    goto("/login");
  }

  onMount(() => {
    loadDashboard();

    const es = new EventSource("/api/events");

    es.onmessage = () => loadDashboard();
    es.onerror = (err) => console.error("SSE error:", err);

    return () => es.close();
  });
</script>

<!-- ROOT -->
<div class="min-h-screen bg-gray-50 text-gray-800 flex">
  <!-- MOBILE OVERLAY -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 bg-black/40 z-40 md:hidden"
      onclick={() => (sidebarOpen = false)}
    />
  {/if}

  <!-- SIDEBAR -->
  <aside
    class={`
      fixed md:static inset-y-0
      w-72 md:w-64
      bg-white border-r border-gray-100 px-4 py-6
      flex flex-col
      transform transition-transform duration-200
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    `}
  >
    <!-- HEADER -->
    <h1 class="text-2xl font-bold mb-8">
      <span class="text-[#b91c1c]">Dear</span>Amanah
    </h1>

    <!-- NAV -->
    <nav class="space-y-1 text-sm">
      {#each navItems as item}
        <a
          onclick={() => goto(`./${item.key}`)}
          class={`block px-3 py-2 rounded-lg transition cursor-pointer
            ${
              activeNav === item.key
                ? "bg-red-50 text-[#b91c1c] font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          {item.label}
        </a>
      {/each}
    </nav>

    <!-- LOGOUT -->
    <div class="pt-4 border-t border-gray-100">
      <button
        onclick={logout}
        class="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
      >
        Logout
      </button>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="flex-1 w-full">
    <!-- TOP BAR -->
    <div
      class="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100"
    >
      <div
        class="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto"
      >
        <div class="flex items-center gap-3">
          <button
            class="md:hidden p-2 rounded-lg border border-gray-200 bg-white"
            onclick={() => (sidebarOpen = !sidebarOpen)}
          >
            ☰
          </button>

          <div>
            <h2 class="text-xl font-semibold">
              {navItems.find((n) => n.key === activeNav)?.label ?? "Dashboard"}
            </h2>
            <p class="text-xs text-gray-500">Fundraising operations overview</p>
          </div>
        </div>

        <button
          onclick={() => goto("/pos")}
          class="bg-[#b91c1c] hover:bg-[#991b1b] text-white px-4 py-2 rounded-lg shadow-sm transition"
        >
          + New Transaction
        </button>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="px-6 py-6 max-w-7xl mx-auto">
      {#if loading}
        <div class="space-y-3 animate-pulse">
          <div class="h-4 w-1/3 bg-gray-200 rounded"></div>
          <div class="h-4 w-1/2 bg-gray-200 rounded"></div>
          <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
        </div>
      {:else}
        <!-- KPI -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition"
          >
            <p class="text-xs text-gray-500">Revenue</p>
            <p class="text-2xl font-bold text-[#b91c1c] mt-1">
              ₱{stats.revenue}
            </p>
          </div>

          <div
            class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition"
          >
            <p class="text-xs text-gray-500">Cash Received</p>
            <p class="text-2xl font-bold mt-1">₱{stats.cashReceived}</p>
          </div>

          <div
            class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition"
          >
            <p class="text-xs text-gray-500">Change Given</p>
            <p class="text-2xl font-bold mt-1">₱{stats.changeGiven}</p>
          </div>

          <div
            class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition"
          >
            <p class="text-xs text-gray-500">Transactions</p>
            <p class="text-2xl font-bold text-[#b91c1c] mt-1">
              {stats.transactionCount}
            </p>
          </div>
        </div>

        <!-- REVENUE FLOW -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 class="font-semibold mb-4">Revenue Flow</h3>

          <div class="space-y-3">
            {#each revenueFlow as point}
              <div class="flex items-center gap-4">
                <span class="w-32 text-xs text-gray-500">
                  {point._id}
                </span>

                <div
                  class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full bg-[#b91c1c] rounded-full"
                    style={`width:${Math.min(point.revenue / 10, 100)}%`}
                  />
                </div>

                <span class="text-xs font-semibold">
                  ₱{point.revenue}
                </span>
              </div>
            {/each}
          </div>
        </div>

        <!-- TABLE -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="font-semibold mb-4">Recent Transactions</h3>

          <div class="overflow-x-auto">
            <table class="w-full text-sm min-w-[700px]">
              <thead class="text-xs text-gray-500 border-b">
                <tr>
                  <th class="px-4 py-3 text-left">Activity</th>
                  <th class="px-4 py-3 text-left">Method</th>
                  <th class="px-4 py-3 text-left">Amount</th>
                  <th class="px-4 py-3 text-left">Created By</th>
                  <th class="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-100">
                {#each transactions.slice(0, 15) as tx}
                  <tr class="hover:bg-gray-50 transition">
                    <td class="px-4 py-3 font-medium text-gray-800">
                      {tx.description}
                    </td>

                    <td class="px-4 py-3">
                      <span
                        class={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide
                          ${
                            tx.method === "cash"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                      >
                        {tx.method}
                      </span>
                    </td>

                    <td class="px-4 py-3 font-mono font-semibold">
                      ₱{tx.amount}
                    </td>

                    <td class="px-4 py-3 text-gray-600">
                      {tx.createdBy}
                    </td>

                    <td
                      class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap"
                    >
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    </div>
  </main>
</div>
