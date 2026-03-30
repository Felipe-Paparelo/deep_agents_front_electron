import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ExternalLinkIcon, ClipboardIcon, ClipboardCheckIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ExternalLinkContext = createContext<{
  openLink: (url: string) => void;
}>({ openLink: () => {} });

export const useExternalLink = () => useContext(ExternalLinkContext);

export function ExternalLinkProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const openLink = useCallback((href: string) => setUrl(href), []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const isExternal =
        href.startsWith("http://") || href.startsWith("https://");
      if (!isExternal) return;

      try {
        const parsed = new URL(href);
        if (parsed.origin === window.location.origin) return;
      } catch {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setUrl(href);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  const handleCopy = useCallback(() => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [url]);

  const handleOpen = useCallback(() => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
    setUrl(null);
  }, [url]);

  const handleClose = useCallback(() => {
    setUrl(null);
    setCopied(false);
  }, []);

  let domain = "";
  const displayUrl = url ?? "";
  try {
    if (url) {
      const parsed = new URL(url);
      domain = parsed.hostname.replace(/^www\./, "");
    }
  } catch {}

  return (
    <ExternalLinkContext.Provider value={{ openLink }}>
      {children}

      <Dialog open={!!url} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent
          className="max-w-sm gap-5"
          showCloseButton={false}
        >
          <DialogHeader className="gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                <ExternalLinkIcon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="truncate text-sm leading-snug">
                  {domain || "Enlace externo"}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs">
                  Estás a punto de salir de la aplicación
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-md border border-border bg-muted/50 px-3 py-2.5">
            <p className="break-all font-mono text-xs text-muted-foreground leading-relaxed">
              {displayUrl}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <ClipboardCheckIcon className="size-3.5 text-green-600" />
                  Copiado
                </>
              ) : (
                <>
                  <ClipboardIcon className="size-3.5" />
                  Copiar
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              onClick={handleOpen}
            >
              <ExternalLinkIcon className="size-3.5" />
              Abrir enlace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ExternalLinkContext.Provider>
  );
}
