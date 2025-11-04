"use client";

import { PreviewMessage, ThinkingMessage } from "@/components/message";
import { MultimodalInput } from "@/components/multimodal-input";
import { Overview } from "@/components/overview";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { useChat, type CreateUIMessage, type UIMessage } from "@ai-sdk/react";
import { toast } from "sonner";
import React from "react";

export function Chat() {
  const chatId = "001";

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    id: chatId,
    onError: (error: Error) => {
      console.error("[Chat] Error occurred:", error);
      if (error.message.includes("Too many requests")) {
        toast.error(
          "You're sending messages too quickly. Please wait a moment before trying again."
        );
      } else {
        toast.error(
          "We're experiencing technical difficulties. Please try again or contact support@skillflow-ai.com if the issue persists."
        );
      }
    },
    onFinish: (message) => {
      console.log("[Chat] onFinish called with message:", message);
      console.log("[Chat] Status after onFinish:", status);
    },
  });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [input, setInput] = React.useState("");

  const isLoading = status === "submitted" || status === "streaming";

  // Log status changes
  React.useEffect(() => {
    console.log("[Chat] Status changed to:", status);
    console.log("[Chat] isLoading:", isLoading);
  }, [status, isLoading]);

  // Log message changes
  React.useEffect(() => {
    console.log("[Chat] Messages updated, count:", messages.length);
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log("[Chat] Last message:", {
        role: lastMessage.role,
        contentLength: lastMessage.content?.length || 0,
        parts: lastMessage.parts?.length || 0,
      });
    }
  }, [messages]);

  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    if (input.trim()) {
      console.log("[Chat] Sending message:", input);
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col min-w-0 h-[calc(100dvh-52px)] bg-background">
      <div
        ref={messagesContainerRef}
        className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
      >
        {messages.length === 0 && <Overview />}

        {messages.map((message: UIMessage, index: number) => (
          <PreviewMessage
            key={message.id}
            chatId={chatId}
            message={message}
            isLoading={isLoading && messages.length - 1 === index}
          />
        ))}

        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && <ThinkingMessage />}

        <div
          ref={messagesEndRef}
          className="shrink-0 min-w-[24px] min-h-[24px]"
        />
      </div>

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultimodalInput
          chatId={chatId}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          messages={messages}
          setMessages={setMessages}
          sendMessage={sendMessage}
        />
      </form>
    </div>
  );
}
