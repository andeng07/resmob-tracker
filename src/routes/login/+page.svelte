<script lang="ts">
  import { goto } from "$app/navigation";

  let email = $state("");
  let code = $state("");
  let step = $state<"email" | "otp">("email");
  let loading = $state(false);

  let message = $state("");
  let messageType = $state<"error" | "success" | "info" | "">("");

  async function sendCode() {
    loading = true;
    message = "";
    messageType = "";

    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    loading = false;

    if (!res.ok) {
      message = data.error ?? "Failed to send code";
      messageType = "error";
      return;
    }

    step = "otp";
    message = "Verification code sent.";
    messageType = "success";
  }

  async function verifyCode() {
    loading = true;
    message = "";
    messageType = "";

    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    loading = false;

    if (!res.ok) {
      message = data.error ?? "Invalid code";
      messageType = "error";
      return;
    }

    message = "Authentication successful.";
    messageType = "success";

    goto("/dashboard");
  }
</script>

<div class="min-h-screen bg-[#f6f8fa] flex items-center justify-center px-6">
  <div class="w-full max-w-sm">
    <!-- Card -->
    <div class="bg-white border border-[#d0d7de] rounded-md overflow-hidden">
      <div class="h-1 flex">
        <div class="flex-1 bg-[#cf222e]"></div>
        <div class="flex-1 bg-[#d29922]"></div>
        <div class="flex-1 bg-[#cf222e]"></div>
      </div>

      <!-- Header -->
      <div class="px-6 py-5 border-b border-[#d0d7de]">
        <h1 class="text-sm font-semibold text-[#24292f]">Dear Amanah</h1>
        <p class="text-xs text-[#57606a] mt-0.5">Authentication</p>
      </div>

      <!-- Body -->
      <div class="px-6 py-6 space-y-6">
        {#if step === "email"}
          <!-- Email -->
          <div class="space-y-2">
            <label for="email" class="text-xs font-medium text-[#57606a]">
              Email address
            </label>

            <input
              id="email"
              class="w-full px-3 py-2 text-sm border border-[#d0d7de] rounded-md
                     focus:outline-none focus:border-[#cf222e]
                     focus:ring-1 focus:ring-[#cf222e]/20"
              placeholder="name@dlsu.edu.ph"
              bind:value={email}
            />
          </div>

          <button
            class="w-full py-2 text-sm font-medium rounded-md
                   bg-[#24292f] text-white
                   hover:bg-[#1f2428]
                   disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={sendCode}
            disabled={loading || !email}
          >
            {loading ? "Sending code..." : "Send verification code"}
          </button>
        {:else}
          <!-- OTP -->
          <div class="space-y-2">
            <label for="code" class="text-xs font-medium text-[#57606a]">
              Verification code
            </label>

            <input
              id="code"
              class="w-full px-3 py-2 text-sm text-center tracking-widest
                     border border-[#d0d7de] rounded-md
                     focus:outline-none focus:border-[#cf222e]
                     focus:ring-1 focus:ring-[#cf222e]/20"
              maxlength="6"
              minlength="6"
              placeholder="000000"
              bind:value={code}
            />
          </div>

          <div class="flex flex-col gap-2">
            <button
              class="w-full py-2 text-sm font-medium rounded-md
                     bg-[#24292f] text-white
                     hover:bg-[#1f2428]
                     disabled:opacity-50 disabled:cursor-not-allowed"
              onclick={verifyCode}
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verifying..." : "Verify code"}
            </button>

            <button
              class="w-full text-sm text-[#57606a] hover:text-[#24292f]"
              onclick={() => {
                step = "email";
                code = "";
                message = "";
                messageType = "";
              }}
            >
              Use different email
            </button>
          </div>
        {/if}

        <!-- Message -->
        {#if message}
          <div
            class="text-sm border-t pt-4"
            class:text-[#cf222e]={messageType === "error"}
            class:text-[#1a7f37]={messageType === "success"}
            class:text-[#57606a]={messageType === "info" || messageType === ""}
            class:border-[#cf222e]={messageType === "error"}
            class:border-[#1a7f37]={messageType === "success"}
            class:border-[#d0d7de]={messageType === "info" ||
              messageType === ""}
          >
            {message}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
