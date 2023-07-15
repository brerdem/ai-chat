"use client";

import ChatAPI from "@/components/pdf/ChatAPI";
import ChatWeb from "@/components/pdf/ChatWeb";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { FC, useEffect, useRef, useState } from "react";
import ReactJson from "react-json-view";

type Props = {
  blob: Blob;
};

const WebParser: FC<Props> = ({ blob }) => {
  const [jsonObj, setJsonObj] = useState("");

  useEffect(() => {
    axios
      .get("https://dummyjson.com/products?limit=10")
      .then((res) => setJsonObj(JSON.stringify(res.data)));
  }, []);

  return (
    <div className="w-full h-screen grid grid-cols-2 overflow-hidden">
      <div className="w-full h-screen overflow-auto p-4">
        {jsonObj !== "" && (
          <ReactJson
            src={JSON.parse(jsonObj)}
            enableClipboard={false}
            displayDataTypes={false}
            style={{
              fontSize: 16,
            }}
          />
        )}
      </div>

      <div className="w-full h-full p-6">
        <ChatAPI />
      </div>
    </div>
  );
};

export default WebParser;
