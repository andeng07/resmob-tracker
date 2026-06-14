<script lang="ts">
  import { onMount } from "svelte";

  type Transaction = {
    amount: number;
  };

  let revenue = $state(0);
  let target = 100000;
  let loading = $state(true);
  let transactions = $state<Transaction[]>([]);

  const percent = $derived(Math.min(revenue / target, 1));
  const stroke = 2 * Math.PI * 110;
  const progress = $derived(stroke * percent);

  async function load() {
    loading = true;
    try {
      const res = await fetch("/api/transactions");
      const data: { data: Transaction[] } = await res.json();
      transactions = data.data ?? [];
      revenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    } catch (e) {
      console.error("Failed to load transactions", e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    load();

    const es = new EventSource("/api/events");

    es.onmessage = () => load();
    es.onerror = (err) => console.error("SSE error:", err);

    return () => es.close();
  });

  function format(n: number) {
    return `₱${n.toLocaleString()}`;
  }
</script>

<!-- Inline styles guarantee the deep vintage circus background renders no matter what -->
<div
  class="min-h-screen w-full flex flex-col items-center justify-center text-white p-4 font-serif relative"
  style="background: radial-gradient(circle, #2d0606 0%, #0f0202 100%);"
>
  <!-- 🎪 CARNIVAL TENT BACKDROP LAYER -->
  <div
    class="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay bg-[linear-gradient(90deg,transparent_50%,#fff_50%)] bg-[length:60px_100%]"
  ></div>

  <!-- MAIN SHOWCASE CONTAINER -->
  <div class="w-full max-w-md text-center z-10">
    <!-- VINTAGE TICKET MARQUEE HEADER -->
    <div
      class="mb-10 p-6 rounded-lg shadow-2xl relative"
      style="background: #1c0404; border: 4px double #eab308; box-shadow: 0 0 30px rgba(220, 38, 38, 0.3);"
    >
      <!-- Outer Bulb Accents -->
      <div
        class="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-[10px] text-black font-sans font-black px-3 py-0.5 rounded uppercase tracking-widest shadow-md"
      >
        ★ LIVE OVERALL TOTAL ★
      </div>

      <h1
        class="text-4xl md:text-5xl font-black uppercase tracking-wide font-serif mt-2"
        style="color: #ef4444; text-shadow: 2px 2px 0px #7f1d1d, 4px 4px 0px #000; font-family: 'Georgia', serif;"
      >
        Dear Amanah
      </h1>

      <div class="w-24 h-0.5 mx-auto my-3 bg-yellow-500/60"></div>

      <p
        class="text-xs uppercase tracking-[0.3em] font-sans text-stone-400 font-medium"
      >
        Fundrasing
      </p>
    </div>

    <!-- CIRCULAR METER (THE STAGE) -->
    <div class="relative inline-flex items-center justify-center mx-auto my-4">
      <svg
        class="w-80 h-80 -rotate-90 filter drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]"
      >
        <!-- Vintage Fairground Outer Dotted Ring -->
        <circle
          cx="160"
          cy="160"
          r="130"
          stroke="#eab308"
          stroke-width="3"
          stroke-dasharray="4, 12"
          fill="none"
          class="opacity-60"
        />

        <!-- Deep Crimson Empty Track -->
        <circle
          cx="160"
          cy="160"
          r="110"
          stroke="#450a0a"
          stroke-width="22"
          fill="none"
        />

        <!-- Bright Circus Red Active Progress Track -->
        <circle
          cx="160"
          cy="160"
          r="110"
          stroke="#dc2626"
          stroke-width="18"
          fill="none"
          stroke-linecap="round"
          stroke-dasharray={stroke}
          stroke-dashoffset={stroke - progress}
          class="transition-all duration-1000 ease-out"
        />

        <!-- Glowing Inner Accent Ring -->
        <circle
          cx="160"
          cy="160"
          r="96"
          stroke="#eab308"
          stroke-width="1"
          fill="none"
          class="opacity-30"
        />
      </svg>

      <!-- CENTER DISPLAY BOX (TICKET BOOTH VIBE) -->
      <div
        class="absolute w-44 h-44 rounded-full flex flex-col justify-center items-center font-sans border shadow-2xl"
        style="background: #0a0101; border-color: #7f1d1d;"
      >
        {#if loading}
          <div
            class="text-xs text-yellow-500 uppercase tracking-widest animate-pulse font-bold"
          >
            Admission...
          </div>
        {:else}
          <span
            class="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-bold"
          >
            Total Secured
          </span>

          <span
            class="text-3xl font-black my-1 font-serif tracking-tight"
            style="color: #facc15; text-shadow: 0 2px 4px rgba(0,0,0,0.8);"
          >
            {format(revenue)}
          </span>

          <div class="w-12 h-[1px] bg-red-800 my-1"></div>

          <span class="text-[10px] text-stone-400 uppercase tracking-wider">
            Target: <strong class="text-white font-mono font-medium"
              >{format(target)}</strong
            >
          </span>

          <!-- Percent Badge -->
          <span
            class="mt-3 text-[11px] font-black text-black px-3 py-1 rounded font-mono uppercase tracking-wider shadow-md"
            style="background: linear-gradient(135deg, #facc15 0%, #eab308 100%); border: 1px solid #ca8a04;"
          >
            {Math.round(percent * 100)}% Funded
          </span>
        {/if}
      </div>
    </div>

    <!-- VINTAGE FOOTER BANNER -->
    <div class="mt-10 font-sans">
      <p class="text-xs tracking-[0.4em] text-red-500/60 uppercase font-bold">
        Step Up • Support • Witness
      </p>
    </div>
  </div>
</div>

<style>
  /* Fallback template styles just in case your font config isolates fonts */
  :global(body) {
    background-color: #0f0202;
    margin: 0;
    padding: 0;
  }
</style>
