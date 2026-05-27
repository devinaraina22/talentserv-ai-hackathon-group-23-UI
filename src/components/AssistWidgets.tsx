"use client";

import { useState } from "react";
import { BookingChatbot, ChatFab } from "./BookingChatbot";

export function AssistWidgets({ authenticated = true }: { authenticated?: boolean }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <BookingChatbot
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        authenticated={authenticated}
      />

      <div className="assist-stack no-print">
        <ChatFab active={chatOpen} onClick={() => setChatOpen((o) => !o)} />
      </div>
    </>
  );
}
