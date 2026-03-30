import { Fragment, useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { Bot, RefreshCcwIcon, CopyIcon, Puzzle, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Spinner } from "@/components/ui/spinner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatStream } from "@/hooks/use-chat-stream";

const SUGGESTIONS = [
  "¿Qué tengo en el calendario esta semana?",
  "¿Qué proyectos con issues asignados tengo?",
  "Revisá mis correos de hoy",
  "¿Cuándo es mi próxima reunión?",
];

function AssistantParts({
  message,
  isLast,
  isStreaming,
}: {
  message: UIMessage;
  isLast: boolean;
  isStreaming: boolean;
}) {
  const reasoningParts = message.parts.filter((p) => p.type === "reasoning");
  const reasoningText = reasoningParts
    .map((p) => ("text" in p ? p.text : ""))
    .join("\n");
  const hasReasoning = reasoningText.length > 0;

  const lastPart = message.parts.at(-1);
  const isReasoningStreaming =
    isLast && isStreaming && lastPart?.type === "reasoning";

  return (
    <>
      {hasReasoning && (
        <Reasoning isStreaming={isReasoningStreaming}>
          <ReasoningTrigger
            getThinkingMessage={(streaming) =>
              streaming ? "Pensando..." : "Ver razonamiento"
            }
          />
          <ReasoningContent>{reasoningText}</ReasoningContent>
        </Reasoning>
      )}
      {message.parts.map((part, i) => {
        if (part.type === "text") {
          const text = "text" in part ? part.text : "";
          return (
            <MessageResponse
              key={`${message.id}-text-${text}-${i}`}
            >
              {part.text}
            </MessageResponse>
          );
        }
        return null;
      })}
    </>
  );
}

export default function ChatPage() {
  const { messages, sendMessage, status, regenerate, stop } = useChatStream();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    const bg = isDark ? "oklch(0.2077 0.0398 265.7549)" : "oklch(0.965 0.012 290)";
    const dots = isDark ? "0.3" : "0.18";
    document.body.style.backgroundColor = bg;
    document.body.style.backgroundImage = `radial-gradient(circle, oklch(0.6056 0.2189 292.7172 / ${dots}) 1px, transparent 1px)`;
    document.body.style.backgroundSize = "22px 22px";
  }, [isDark]);

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    sendMessage({ text: message.text });
  };

  const handleSuggestion = (text: string) => {
    sendMessage({ text });
  };

  const isStreaming = status === "streaming";

  return (
    <div className="flex h-screen flex-col items-center overflow-hidden">
      <header className={`sticky top-0 z-10 w-full border-b px-6 py-3 backdrop-blur-sm ${isDark ? "border-white/10 bg-black/30" : "border-border/30 bg-white/40"}`}>
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="size-4" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight">Symbios</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark((d) => !d)}
              aria-label="Cambiar modo"
              className="text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Link
              to="/integraciones"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "gap-1.5 text-muted-foreground hover:text-foreground"
              )}
            >
              <Puzzle className="size-3.5" />
              Integraciones
            </Link>
          </div>
        </div>
      </header>

      <div className="flex w-full max-w-3xl flex-1 flex-col overflow-hidden min-h-0 px-4 py-4">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="flex size-full flex-col items-center justify-center gap-8 p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <Bot className="size-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-semibold tracking-tight">Hola, soy Symbios</h2>
                    <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                      Tu asistente IA con acceso a Calendar, Gmail y más. Preguntame lo que necesites.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-card-foreground shadow-md transition-all hover:shadow-lg hover:bg-accent hover:text-accent-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, idx) => {
                const isLast = idx === messages.length - 1;

                return (
                  <Fragment key={message.id}>
                    <Message from={message.role}>
                      <MessageContent>
                        {message.role === "assistant" ? (
                          <AssistantParts
                            message={message}
                            isLast={isLast}
                            isStreaming={isStreaming}
                          />
                        ) : (
                          message.parts.map((part, i) =>
                            part.type === "text" ? (
                              <p
                                key={`${message.id}-text-${i}`}
                                className="whitespace-pre-wrap"
                              >
                                {"text" in part ? part.text : ""}
                              </p>
                            ) : null
                          )
                        )}
                      </MessageContent>
                    </Message>
                    {message.role === "assistant" &&
                      isLast &&
                      status === "ready" && (
                        <MessageActions>
                          <MessageAction
                            onClick={() => regenerate()}
                            label="Reintentar"
                          >
                            <RefreshCcwIcon className="size-3" />
                          </MessageAction>
                          <MessageAction
                            onClick={() => {
                              const text = message.parts
                                .filter(
                                  (p): p is { type: "text"; text: string } =>
                                    p.type === "text"
                                )
                                .map((p) => p.text)
                                .join("");
                              navigator.clipboard.writeText(text);
                            }}
                            label="Copiar"
                          >
                            <CopyIcon className="size-3" />
                          </MessageAction>
                        </MessageActions>
                      )}
                  </Fragment>
                );
              })
            )}
            {status === "submitted" && (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4 w-full max-w-2xl mx-auto"
          inputGroupClassName="rounded-3xl bg-card dark:bg-card shadow-sm"
        >
          <PromptInputTextarea placeholder="Escribe tu mensaje..." className="px-5 pt-4" />
          <PromptInputFooter className="justify-end pb-3 px-4">
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
