"use client";

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
};

const Reader: FC<Props> = ({ blob }) => {
  const viewer = useRef<HTMLDivElement>(null);

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