"use client";

import { FC, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { useChat } from "ai/react";
import { useTextStore } from "@/lib/store";
import MessageBalloon from "./MessageBalloon";
import { ChatRequest, FunctionCallHandler } from "ai";

type Props = {};

const ChatAPI: FC<Props> = ({}) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    append,
    isLoading,
  } = useChat({
    api: "/api/api-chain",
  });
  const [active, setActive] = useState(false);
  const { text } = useTextStore();

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  console.log("messages ->", JSON.stringify(messages, null, 2));

  const startChat = async () => {
    setActive(true);
  };

  useEffect(() => {
    setActive(false);
    setMessages([]);
  }, [text]);

  return (
    <div className="w-full flex flex-col relative">
      {active ? (
        <>
          <div className="w-full shrink-0 h-[calc(100vh-8rem)] flex flex-col gap-6 overflow-auto overflow-x-hidden">
            {messages
              .filter((m) => m.id !== "onboarding")
              .map((m) => (
                <MessageBalloon m={m} key={m.id} />
              ))}
            <div ref={divRef}></div>
          </div>
        </>
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

export default ChatAPI;
