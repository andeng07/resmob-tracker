import { events } from "$lib/server/events";

export function GET() {
  const encoder = new TextEncoder();

  let listener: () => void;

  const stream = new ReadableStream({
    start(controller) {
      listener = () => {
        controller.enqueue(encoder.encode("data: refresh\n\n"));
      };

      events.on("transactions:updated", listener);
    },

    cancel() {
      // THIS is the important cleanup
      events.off("transactions:updated", listener);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
