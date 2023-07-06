"use client";

import ChatWeb from "@/components/pdf/ChatWeb";
import { Button } from "@/components/ui/button";
import { FC, useEffect, useRef, useState } from "react";

type Props = {
  blob: Blob;
};

const WebParser: FC<Props> = ({ blob }) => {
  const [txt, setTxt] = useState("");
  const [url, setUrl] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const parseURL = async () => {
    setUrl(txt);

    const res = await fetch("/api/db-web", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
      }),
    });
    if (res) {
      console.log("ok");
    }
  };

  return (
    <div className="w-full h-screen grid grid-cols-2">
      <div className="w-full flex flex-col p-6 gap-6">
        <div className="h-36 border-b-2 border-b-slate-200 flex items-center justify-center">
          <div className="flex flex-row gap-2">
            <input
              className="w-96 bg-white border-slate-400 rounded-md p-2 h-full border-2"
              placeholder="Say something..."
              value={txt}
              onChange={(e) => setTxt(e.target.value)}
            />
            <Button type="button" onClick={() => parseURL()}>
              PARSE
            </Button>
          </div>
        </div>
        <div className="w-full h-full overflow-auto">
          <iframe src={url} className="w-full h-full" ref={iframeRef}></iframe>
        </div>
      </div>
      <div className="w-full h-full">
        <ChatWeb url={url} />
      </div>
    </div>
  );
};

export default WebParser;
