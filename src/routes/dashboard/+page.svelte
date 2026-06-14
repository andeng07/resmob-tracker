<script lang="ts">
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
    { label: "Settings", key: "settings" },
  ];

  let activeNav = $state("dashboard");

  function setActiveNav(key: string) {
    activeNav = key;
    sidebarOpen = false;
  }

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

  onMount(loadDashboard);
</script>

<div class="min-h-screen bg-[#fff7f7] text-gray-800 flex">
  <!-- MOBILE OVERLAY -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 bg-black/40 z-40 md:hidden hover:cursor-pointer"
      onclick={() => (sidebarOpen = false)}
    />
  {/if}

  <!-- SIDEBAR -->
  <aside
    class={`
      fixed md:static z-50 md:z-auto
      h-full md:h-auto
      w-72 md:w-64
      bg-white border-r border-red-100 px-4 py-6
      transform transition-transform duration-200
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    `}
  >
    <h1 class="text-2xl font-bold tracking-tight mb-6">
      <span class="text-[#b91c1c]">Dear</span>Amanah
    </h1>

    <!-- NAVBAR (DYNAMIC) -->
    <nav class="space-y-2 text-sm">
      {#each navItems as item}
        <a
          onclick={() => setActiveNav(item.key)}
          class={`block px-3 py-2 rounded-lg hover:cursor-pointer transition border border-transparent
            ${
              activeNav === item.key
                ? "bg-red-50 text-[#b91c1c] font-medium border border-red-100"
                : "hover:bg-red-50"
            }
          `}
        >
          {item.label}
        </a>
      {/each}
    </nav>
  </aside>

  <!-- MAIN -->
  <main class="flex-1 w-full">
    <!-- TOP BAR -->
    <div
      class="sticky top-0 z-30 bg-[#fff7f7]/80 backdrop-blur border-b border-red-100"
    >
      <div
        class="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto"
      >
        <div class="flex items-center gap-3">
          <button
            class="md:hidden p-2 rounded-lg border border-red-100 bg-white"
            onclick={() => (sidebarOpen = !sidebarOpen)}
          >
            ☰
          </button>

          <div>
            <h2 class="text-xl sm:text-2xl font-semibold">
              {navItems.find((n) => n.key === activeNav)?.label ?? "Dashboard"}
            </h2>
            <p class="text-xs sm:text-sm text-gray-500">
              Fundraising operations overview
            </p>
          </div>
        </div>

        <button
          class="bg-[#b91c1c] hover:bg-[#991b1b] hover:cursor-pointer text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm shadow"
        >
          + New Transaction
        </button>
      </div>
    </div>

    <div class="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <!-- LOADING -->
      {#if loading}
        <div class="space-y-3 animate-pulse">
          <div class="h-4 w-1/3 bg-red-100 rounded"></div>
          <div class="h-4 w-1/2 bg-red-100 rounded"></div>
          <div class="h-4 w-2/3 bg-red-100 rounded"></div>
        </div>
      {:else}
        <!-- KPI CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white border border-red-100 p-4 rounded-xl shadow-sm">
            <p class="text-sm text-gray-500">Revenue</p>
            <p class="text-xl font-bold text-[#b91c1c]">₱{stats.revenue}</p>
          </div>

          <div class="bg-white border border-red-100 p-4 rounded-xl shadow-sm">
            <p class="text-sm text-gray-500">Cash Received</p>
            <p class="text-xl font-bold">₱{stats.cashReceived}</p>
          </div>

          <div class="bg-white border border-red-100 p-4 rounded-xl shadow-sm">
            <p class="text-sm text-gray-500">Change Given</p>
            <p class="text-xl font-bold text-gray-700">₱{stats.changeGiven}</p>
          </div>

          <div class="bg-white border border-red-100 p-4 rounded-xl shadow-sm">
            <p class="text-sm text-gray-500">Transactions</p>
            <p class="text-xl font-bold text-[#b91c1c]">
              {stats.transactionCount}
            </p>
          </div>
        </div>

        <!-- CHART PLACEHOLDERS -->
        <div class="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          <div class="bg-white border border-red-100 p-6 rounded-xl shadow-sm">
            <h3 class="font-semibold mb-2">Revenue Flow</h3>
            <div class="space-y-2">
              {#each revenueFlow as point}
                <div class="flex items-center gap-3">
                  <span class="w-32 text-xs text-gray-500">
                    {point._id}
                  </span>

                  <div
                    class="h-5 bg-red-500 rounded"
                    style={`width:${Math.max(point.revenue / 10, 10)}px`}
                  ></div>

                  <span class="text-xs font-medium">
                    ₱{point.revenue}
                  </span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- TRANSACTIONS TABLE -->
        <div
          class="bg-white border border-red-100 p-6 rounded-xl shadow-sm overflow-hidden"
        >
          <h3 class="font-semibold mb-4">Recent Transactions</h3>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[700px] text-sm">
              <thead class="text-left text-gray-500 border-b border-red-100">
                <tr>
                  <th class="py-2">Activity</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Created By</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {#each transactions as tx}
                  <tr class="border-b border-red-50">
                    <td class="py-2">{tx.description}</td>
                    <td class="capitalize">{tx.method}</td>
                    <td>₱{tx.amount}</td>
                    <td>{tx.createdBy}</td>
                    <td>{new Date(tx.createdAt).toLocaleString()}</td>
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
