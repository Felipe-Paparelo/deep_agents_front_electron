import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ExternalLinkProvider } from "@/components/providers/external-link-provider";
import ChatPage from "@/pages/ChatPage";
import IntegracionesPage from "@/pages/IntegracionesPage";

function App() {
  return (
    <HashRouter>
      <ExternalLinkProvider>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/integraciones" element={<IntegracionesPage />} />
          </Routes>
        </TooltipProvider>
      </ExternalLinkProvider>
    </HashRouter>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(React.createElement(App));
