import { getLatestMessages } from "@/lib/live-session-reader";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let lastTimestamp: string | undefined;

      const send = (data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // connection closed
        }
      };

      const poll = () => {
        try {
          const { messages, filePath } = getLatestMessages(lastTimestamp, 50);
          if (messages.length > 0) {
            lastTimestamp = messages[messages.length - 1].timestamp;
            send({ messages, filePath });
          }
        } catch {
          // ignore
        }
      };

      // Send initial batch (no sinceTimestamp to get recent messages)
      const initial = getLatestMessages(undefined, 30);
      if (initial.messages.length > 0) {
        lastTimestamp = initial.messages[initial.messages.length - 1].timestamp;
        send({ messages: initial.messages, filePath: initial.filePath });
      }

      const interval = setInterval(poll, 2000);

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          // connection closed
        }
      }, 30000);

      (controller as unknown as Record<string, unknown>)._cleanup = () => {
        clearInterval(interval);
        clearInterval(heartbeat);
      };
    },
    cancel(controller) {
      const cleanup = (controller as unknown as Record<string, unknown>)
        ?._cleanup as (() => void) | undefined;
      cleanup?.();
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
