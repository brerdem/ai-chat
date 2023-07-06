"use client";

import { Button } from "@/components/ui/button";
import { useTextStore } from "@/lib/store";
import WebViewer from "@pdftron/webviewer";
import { FC, useEffect, useRef } from "react";

type Props = {
  blob: Blob;
};

const Reader: FC<Props> = ({ blob }) => {
  const parseURL = async () => {
    const res = await fetch("/api/web", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "test",
      }),
    });
    if (res) {
      console.log("ok");
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Button onClick={() => parseURL()}>TEST</Button>
    </div>
  );
};

export default Reader;
