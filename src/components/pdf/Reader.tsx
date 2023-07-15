"use client";

import { useTextStore } from "@/lib/store";
import WebViewer from "@pdftron/webviewer";
import { FC, useEffect, useRef } from "react";

type Props = {
  blob: Blob;
};

const config = {
  path: "/lib",
  isReadOnly: true,
  disabledElements: [
    "searchButton",
    "menuButton",
    "toggleNotesButton",
    "selectToolButton",
    "panToolButton",
    "signaturePanelButton",
  ],
  fullAPI: true,
  enableAnnotations: false,
  licenseKey:
    "BVS Buchverlag und Service AG (bvsb.vantage.ch):OEM:eBookBox::B+:AMS(20240429):E4A54CDD04B7480A0360B13AC9A2037860611FA5F7481E67CD621DDA5C7C5E0726B6B6F5C7",
};

const Reader: FC<Props> = ({ blob }) => {
  const viewer = useRef<HTMLDivElement>(null);
  const { addText } = useTextStore();

  async function coonstructDatabase(text: string) {
    const res = await fetch("/api/db-hnswlib", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    });
    if (res) {
      console.log("res.json() ->", JSON.stringify(res.json(), null, 2));
      addText(text);
    }
  }

  useEffect(() => {
    (async () => {
      if (viewer.current && window) {
        const instance = await WebViewer(config, viewer.current);

        instance.UI.loadDocument(blob, {
          filename: "test.pdf",
        });

        const docViewer = instance.Core.documentViewer;

        docViewer.addEventListener("documentLoaded", async () => {
          const doc = docViewer.getDocument();
          const pageCount = doc.getPageCount();
          let tempText = "";
          for (let i = 0; i < pageCount; i++) {
            let pageNumber = i + 1;

            const text = await doc.loadPageText(pageNumber);
            tempText += text;
          }
          console.log(
            "tempText.length ->",
            JSON.stringify(tempText.length, null, 2)
          );
          await coonstructDatabase(tempText);
        });
      }
    })();
  }, []);

  return <div className="w-full h-full" ref={viewer}></div>;
};

export default Reader;
