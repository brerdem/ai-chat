import { Message } from "ai";
import { FC, useEffect, useRef } from "react";

type Props = {
  m: Message;
};

const MessageBalloon: FC<Props> = ({ m }) => {
  return (
    <div
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
  );
};

export default MessageBalloon;
