"use client";

import { useState } from "react";
import { BookingChatbot, ChatFab } from "./BookingChatbot";
import { CallFab, SupportCallWidget } from "./SupportCallWidget";

export function AssistWidgets({ authenticated = true }: { authenticated?: boolean }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);

  const toggleChat = () => {
    setChatOpen((o) => !o);
    if (!chatOpen) setCallOpen(false);
  };

  const toggleCall = () => {
    setCallOpen((o) => !o);
    if (!callOpen) setChatOpen(false);
  };

  return (
    <>
      <BookingChatbot
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        authenticated={authenticated}
      />
      <SupportCallWidget open={callOpen} onClose={() => setCallOpen(false)} />

      <div className="assist-stack no-print">
        <ChatFab active={chatOpen} onClick={toggleChat} />
        <CallFab active={callOpen} onClick={toggleCall} />
      </div>
    </>
  );
}
