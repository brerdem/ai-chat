"use client";

import { FC, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useChat } from "ai/react";
import { useTextStore } from "@/lib/store";

type Props = {};

const Chat: FC<Props> = ({}) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    append,
    isLoading,
  } = useChat();
  const [active, setActive] = useState(false);
  const { text } = useTextStore();

  console.log("messages ->", JSON.stringify(messages, null, 2));

  const startChat = async () => {
    setActive(true);
    if (messages.length === 0 && !isLoading) {
      console.log("hey ->", JSON.stringify("hey", null, 2));
      await append({
        role: "user",
        content:
          "Nazik bir karşılama cümlesi ile birlikte bu doküman ile ilgili 5 adet soru örneği göster",
        id: "onboarding",
        createdAt: new Date(),
      });
    }
  };

  useEffect(() => {
    setActive(false);
    setMessages([]);
  }, [text]);

  return (
    <div className="w-full flex flex-col relative">
      {active ? (
        <div className="w-full shrink-0 h-[calc(100vh-8rem)] flex flex-col gap-4 overflow-auto overflow-x-hidden">
          {messages
            .filter((m) => m.id !== "onboarding")
            .map((m) => (
              <div
                key={m.id}
                className={`flex flex-row ${
                  m.role === "user" ? "justify-end" : "justify-start"
                } `}
              >
                <div
                  className={`rounded-xl text-black flex items-center justify-center max-w-3xl py-2 px-4 whitespace-pre-wrap ${
                    m.role === "user"
                      ? "text-right bg-red-100 rounded-br-none"
                      : "text-left bg-indigo-100 rounded-bl-none"
                  } `}
                >
                  {m.content}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center overflow-x-hidden">
          <Button onClick={() => startChat()} size={"lg"}>
            Start Chat
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          className={`h-15 border-t-2 flex flex-row gap-4 pt-4 w-full mt-6 transition-all ${
            active ? "translate-y-0" : "translate-y-20"
          }`}
        >
          <input
            className="w-full bg-white border-slate-400 rounded-md p-2 h-full border-2"
            placeholder="Say something..."
            value={input}
            onChange={handleInputChange}
          />
          <Button type="submit">SEND</Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
