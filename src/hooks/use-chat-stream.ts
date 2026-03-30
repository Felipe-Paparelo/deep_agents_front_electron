import { useState, useCallback, useRef } from "react";
import type { UIMessage } from "ai";
import { nanoid } from "nanoid";

export type ChatStatus = "ready" | "submitted" | "streaming" | "error";

type TextPart = { type: "text"; text: string };
type ReasoningPart = { type: "reasoning"; text: string };
type MessagePart = TextPart | ReasoningPart;

function buildParts(
  reasoningText: string,
  textContent: string,
  hasReasoning: boolean,
  hasText: boolean
): MessagePart[] {
  const parts: MessagePart[] = [];
  if (hasReasoning) parts.push({ type: "reasoning", text: reasoningText });
  if (hasText) parts.push({ type: "text", text: textContent });
  return parts;
}

const BACKEND_URL = "http://localhost:8000";

export function useChatStream() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserTextRef = useRef<string>("");

  const streamFromBackend = useCallback(async (userText: string) => {
    abortControllerRef.current = new AbortController();
    setStatus("submitted");

    const assistantId = nanoid();

    try {
      const res = await fetch(`${BACKEND_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          thread_id: "default-user",
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Backend error ${res.status}: ${detail}`);
      }

      setStatus("streaming");

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant" as const,
          parts: [] as UIMessage["parts"],
          content: "",
          createdAt: new Date(),
        },
      ]);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let reasoningText = "";
      let textContent = "";
      let hasReasoning = false;
      let hasText = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          let data: {
            type: string;
            content?: string;
            name?: string;
            message?: string;
          };
          try {
            data = JSON.parse(trimmed.slice(6));
          } catch {
            continue;
          }

          switch (data.type) {
            case "tool-start": {
              hasReasoning = true;
              reasoningText += `Usando ${data.name}...\n`;
              const parts = buildParts(
                reasoningText,
                textContent,
                hasReasoning,
                hasText
              );
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, parts: parts as UIMessage["parts"] }
                    : m
                )
              );
              break;
            }
            case "tool-end": {
              reasoningText += `${data.name} completado\n`;
              const parts = buildParts(
                reasoningText,
                textContent,
                hasReasoning,
                hasText
              );
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, parts: parts as UIMessage["parts"] }
                    : m
                )
              );
              break;
            }
            case "text-delta": {
              hasText = true;
              textContent += data.content ?? "";
              const parts = buildParts(
                reasoningText,
                textContent,
                hasReasoning,
                hasText
              );
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: textContent,
                        parts: parts as UIMessage["parts"],
                      }
                    : m
                )
              );
              break;
            }
            case "done":
              break;
            case "error":
              throw new Error(data.message ?? "Error del agente");
          }
        }
      }

      setStatus("ready");
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setStatus("ready");
      } else {
        console.error("Chat stream error:", e);
        setStatus("error");
      }
    }
  }, []);

  const sendMessage = useCallback(
    ({ text }: { text: string }) => {
      if (!text.trim()) return;
      lastUserTextRef.current = text;

      const userMessage: UIMessage = {
        id: nanoid(),
        role: "user",
        parts: [{ type: "text", text }] as UIMessage["parts"],
        content: text,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      streamFromBackend(text);
    },
    [streamFromBackend]
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setStatus("ready");
  }, []);

  const regenerate = useCallback(() => {
    if (!lastUserTextRef.current) return;
    setMessages((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].role === "assistant") {
        return prev.slice(0, -1);
      }
      return prev;
    });
    streamFromBackend(lastUserTextRef.current);
  }, [streamFromBackend]);

  return { messages, sendMessage, status, regenerate, stop };
}
