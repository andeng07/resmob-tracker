<script lang="ts">
    import { goto } from "$app/navigation";
  import type { AuthUser } from "$lib/server/auth";
  import type { Activity } from "$lib/server/transactions";
  import type { PageData } from "../$types";

  let { data }: { data: PageData } = $props();

  let user: AuthUser | null = $derived(data.user);

  type Service = {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    price: number;
    icon: string;
  };

  const services: Service[] = [
    {
      id: "charot",
      name: "Charot Reading",
      icon: "🎴",
      description:
        "A modern take on traditional tarot reading using Filipino jokes and slang.",
      longDescription:
        "Participation is free, but requires prior involvement in other booth activities before joining. Features custom-made cards packed with Pinoy memes and funny sayings.",
      price: 0,
    },
    {
      id: "photobooth",
      name: "Live-Drawing Photobooth",
      icon: "📸",
      description:
        "Class illustrations transformed to look like custom photostrip snapshots.",
      longDescription:
        "₱150 base rate for the first person + ₱50 for each additional person in the frame. Maximum of 4 people per photostrip snapshot.",
      price: 150,
    },
    // {
    //   id: "tiedye",
    //   name: "Tie-Dye Booth",
    //   icon: "🎨",
    //   description:
    //     "Creative shirt designing with dedicated structural guidance.",
    //   longDescription:
    //     "An expert will create or guide you through creating your custom layout. Bringing your own plain white shirt is highly recommended. ₱80 per design per shirt.",
    //   price: 80,
    // },
    {
      id: "cupmatch",
      name: "Cup Match Game",
      icon: "🥤",
      description:
        "Guess the hidden matching colored cups behind the display box.",
      longDescription:
        "Players can retry up to 3 times if they make a mistake. Winners receive a premium Art Booth masterpiece. Non-winners receive a token consolidation prize.",
      price: 50,
    },
    {
      id: "canshoot",
      name: "Can Shooting Game",
      icon: "🎯",
      description: "Knock down distant targets using soft recreational balls.",
      longDescription:
        "Get 3 attempts to knock down all the targets to win a free item from the Art Booth. Standard rate is ₱20 per ball, or get the 3-ball bundle promo for ₱50.",
      price: 20,
    },
    {
      id: "jackcup",
      name: "Jack and Cup Stack",
      icon: "🎈",
      description:
        "A fast-paced mashup of traditional Jack Stones and Cup Stacking.",
      longDescription:
        "Toss a heavy balloon into the air, then stack and unstack the cups completely before it drops. Win an exclusive Art Booth handmade souvenir.",
      price: 50,
    },
  ];

  // --- SVELTE 5 RUNES ---
  let selected = $state<Service | null>(null);
  let cash = $state<number | null>(null);

  // Layout presentation toggles
  let showMechanics = $state(false);
  let photoboothPeopleCount = $state(1);
  let isCanShootPromoBundle = $state(false);
  let paymentMethod = $state<"cash" | "cashless">("cash");

  // Flat reactive total logic
  let total = $derived.by(() => {
    if (!selected) return 0;
    if (selected.id === "photobooth") {
      return 150 + (photoboothPeopleCount - 1) * 50;
    }
    if (selected.id === "canshoot" && isCanShootPromoBundle) {
      return 50;
    }
    return selected.price;
  });

  let safeCash = $derived(cash ?? 0);
  let change = $derived(safeCash - total);
  let isCashInsufficient = $derived(safeCash < total);

  let isDisabled = $derived.by(() => {
    return paymentMethod === "cash" && isCashInsufficient;
  });

  // --- HANDLERS ---
  function openService(service: Service) {
    selected = service;
    cash = null;
    showMechanics = false;
    photoboothPeopleCount = 1;
    isCanShootPromoBundle = false;
    paymentMethod = "cash";
  }

  function closeModal() {
    selected = null;
  }

  async function confirmTransaction() {
    if (!selected || !user || (paymentMethod === "cash" && isCashInsufficient))
      return;

    let description = selected.name;

    if (selected.id === "photobooth") {
      description += ` (${photoboothPeopleCount} People)`;
    }

    if (selected.id === "canshoot") {
      description += ` (${isCanShootPromoBundle ? "3 Balls Promo" : "1 Ball"})`;
    }

    const activityMap: Record<string, Activity> = {
      charot: "charot-reading",
      photobooth: "live-drawing-photobooth",
      tiedye: "tie-dye-booth",
      cupmatch: "cup-match-game",
      canshoot: "can-shooting-game",
      jackcup: "jack-and-cup-stack",
    };

    try {
      const isCash = paymentMethod === "cash";

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: paymentMethod,
          amount: total,

          paid: isCash ? safeCash : total,
          change: isCash ? Math.max(safeCash - total, 0) : 0,

          activity: activityMap[selected.id],
          description,

          createdBy: user.name.lastName + ", " + user.name.firstName,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      alert("Transaction has been added successfully.");

      closeModal();
    } catch (error) {
      console.error(error);
      alert("Failed to save transaction.");
    }
  }
</script>

<div
  class="min-h-screen bg-[#fdfbf7] text-slate-800 p-4 md:p-8 font-sans relative overflow-hidden"
>
  <div class="max-w-4xl mx-auto relative z-10">
    <header
      class="mb-8 border-b-4 border-double border-red-600 pb-5 text-center relative"
    >
      <h1
        class="text-4xl font-black tracking-wider text-red-600 drop-shadow-sm uppercase"
      >
        Dear Amanah
      </h1>

      <p
        class="text-xs font-bold tracking-widest text-amber-600 uppercase mt-1"
      >
        ★ Point of Sales ★
      </p>

      <button
        class="absolute right-0 top-0 text-xs font-bold px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-50"
        onclick={() => goto("./dashboard")}
      >
        Dashboard
      </button>
    </header>

    <main>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each services as service}
          <button
            type="button"
            class="bg-white border-2 border-amber-100 hover:border-red-500 rounded-xl p-5 text-left transition shadow-xs hover:shadow-md flex flex-col justify-between h-40 group relative"
            onclick={() => openService(service)}
          >
            <div
              class="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#fdfbf7] rounded-full border-r border-amber-100 group-hover:border-red-500"
            ></div>
            <div
              class="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#fdfbf7] rounded-full border-l border-amber-100 group-hover:border-red-500"
            ></div>

            <div>
              <div class="flex items-center gap-2.5">
                <span
                  class="text-2xl group-hover:scale-110 transition-transform"
                  >{service.icon}</span
                >
                <div
                  class="font-black text-slate-900 text-sm group-hover:text-red-600 transition-colors"
                >
                  {service.name}
                </div>
              </div>
              <p class="text-xs text-slate-400 font-medium mt-2 line-clamp-2">
                {service.description}
              </p>
            </div>

            <div
              class="flex justify-between items-center pt-2 border-t border-dashed border-amber-100"
            >
              <span
                class="text-[9px] font-black text-amber-600/70 uppercase tracking-widest"
                >Select Service</span
              >
              <div class="font-mono text-sm font-black text-blue-900">
                {service.price === 0 ? "FREE" : `₱${service.price}`}
              </div>
            </div>
          </button>
        {/each}
      </div>
    </main>
  </div>
</div>

{#if selected}
  <div
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-[#fffdfa] w-full max-w-sm rounded-xl shadow-2xl border-4 border-red-600 overflow-hidden relative"
    >
      <div
        class="bg-red-600 text-white p-4 text-center border-b-4 border-double border-amber-400"
      >
        <span class="text-3xl block mb-1">{selected.icon}</span>
        <h3 class="font-black text-lg uppercase tracking-wider">
          {selected.name}
        </h3>
        <button
          type="button"
          class="text-[11px] text-amber-300 font-bold hover:text-white transition-colors mt-1 inline-flex items-center gap-1"
          onclick={() => (showMechanics = !showMechanics)}
        >
          🏷️ {showMechanics ? "Hide Details" : "View Attraction Rules"}
        </button>
      </div>

      {#if showMechanics}
        <div
          class="bg-amber-50/50 border-b border-amber-100 px-5 py-3 text-xs text-amber-900/90 leading-relaxed font-medium"
        >
          {selected.longDescription}
        </div>
      {/if}

      <div class="p-5 space-y-4">
        {#if selected.id === "photobooth"}
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-amber-700 uppercase tracking-widest"
              for="photobooth-people">Admissions / Attendance</label
            >
            <div class="grid grid-cols-4 gap-1.5" id="photobooth-people">
              {#each [1, 2, 3, 4] as num}
                <button
                  type="button"
                  class="h-9 border-2 rounded-lg text-xs font-black transition {photoboothPeopleCount ===
                  num
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-amber-100 text-slate-600 bg-white hover:bg-amber-50/50'}"
                  onclick={() => {
                    photoboothPeopleCount = num;
                  }}
                >
                  {num}
                  {num === 1 ? "Pax" : "Pax"}
                </button>
              {/each}
            </div>
          </div>
        {:else if selected.id === "canshoot"}
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-amber-700 uppercase tracking-widest"
              for="ball-pricing">Ammunition Package</label
            >
            <div class="grid grid-cols-2 gap-1.5" id="ball-pricing">
              <button
                type="button"
                class="py-2 border-2 rounded-lg text-xs font-black transition-all {!isCanShootPromoBundle
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-amber-100 text-slate-600 bg-white hover:bg-amber-50/50'}"
                onclick={() => {
                  isCanShootPromoBundle = false;
                }}
              >
                ₱20 • 1 Shot Ball
              </button>
              <button
                type="button"
                class="py-2 border-2 rounded-lg text-xs font-black transition-all {isCanShootPromoBundle
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-amber-100 text-slate-600 bg-white hover:bg-amber-50/50'}"
                onclick={() => {
                  isCanShootPromoBundle = true;
                }}
              >
                ₱50 • 3 Balls Promo
              </button>
            </div>
          </div>
        {/if}

        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-amber-700 uppercase tracking-widest"
          >
            Payment Method
          </label>

          <div class="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              class="h-10 border-2 rounded-lg text-xs font-black transition
                {paymentMethod === 'cash'
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-amber-100 text-slate-600 bg-white hover:bg-amber-50/50'}"
              onclick={() => (paymentMethod = "cash")}
            >
              CASH
            </button>

            <button
              type="button"
              class="h-10 border-2 rounded-lg text-xs font-black transition
                {paymentMethod === 'cashless'
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-amber-100 text-slate-600 bg-white hover:bg-amber-50/50'}"
              onclick={() => (paymentMethod = "cashless")}
            >
              CASHLESS
            </button>
          </div>
        </div>

        <div hidden={paymentMethod === "cashless"} class="space-y-1.5">
          <label
            class="text-[10px] font-black text-amber-700 uppercase tracking-widest"
            for="cash-input">Money Given</label
          >
          <div class="relative flex items-center">
            <span
              class="absolute left-3.5 font-mono font-black text-amber-600 text-sm"
              >₱</span
            >
            <input
              id="cash-input"
              class="w-full h-10 border-2 border-amber-100 rounded-lg pl-8 pr-4 font-mono font-bold text-sm focus:outline-none focus:border-red-500 bg-white"
              type="number"
              min="0"
              placeholder="0"
              bind:value={cash}
            />
          </div>
        </div>

        <div
          class="bg-blue-950 text-amber-100 rounded-xl p-3.5 font-mono text-xs space-y-1.5 border border-amber-400/20 relative overflow-hidden"
        >
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>

          <div class="flex justify-between pl-2">
            <span class="font-bold tracking-wide">TOTAL TICKET:</span>
            <span class="font-black text-amber-400 text-sm">₱{total}</span>
          </div>
          <div
            class="flex justify-between items-center pl-2 pt-1.5 border-t border-blue-900"
          >
            <span class="font-bold tracking-wide">RETURN CHANGE:</span>
            {#if isCashInsufficient}
              <span class="font-black text-red-400 uppercase text-[10px]"
                >Short: ₱{Math.abs(change)}</span
              >
            {:else}
              <span class="font-black text-emerald-400 text-sm">₱{change}</span>
            {/if}
          </div>
        </div>

        <div class="space-y-1.5 pt-1">
          <button
            type="button"
            class="w-full h-11 rounded-lg font-black text-xs tracking-wider uppercase transition-all shadow-sm
              {isDisabled
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-amber-500 hover:bg-amber-600 active:translate-y-0.5 text-slate-950 border-b-4 border-amber-700'}"
            disabled={isDisabled}
            onclick={confirmTransaction}
          >
            {isDisabled ? "★ Awaiting Payment ★" : "★ Dispatch Transaction ★"}
          </button>

          <button
            type="button"
            class="w-full py-1 text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-widest text-center"
            onclick={closeModal}
          >
            Void Transaction
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
