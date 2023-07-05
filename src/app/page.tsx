"use client";

import Chat from "@/components/pdf/Chat";
import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import dynamic from "next/dynamic";

const Reader = dynamic(() => import("@/components/pdf/Reader"), {
  ssr: false,
});

type Props = {};

const PDFMain: NextPage<Props> = ({}) => {
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    const file: File = acceptedFiles[0] as File;

    (async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfBlob = new Blob([new Uint8Array(arrayBuffer)], {
          type: file.type,
        });

        if (pdfBlob.size > 0) setFileBlob(pdfBlob);
      } catch (error) {
        console.log("Pdf Blob Error -->", error);
      }
    })();
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="w-full h-screen flex flex-row">
      <div className="w-96 flex flex-col p-6 gap-2 border-r-2">
        <div
          {...getRootProps()}
          className="border-dashed border-slate-200 border-2 p-2"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>
        {fileBlob !== null && (
          <Button onClick={() => setFileBlob(null)}>CLEAR</Button>
        )}
      </div>
      <div className="w-1/2 p-6 border-r-2">
        {fileBlob == null ? <h2>No File!</h2> : <Reader blob={fileBlob} />}
      </div>
      <div className="w-1/2 p-6">
        <Chat />
      </div>
    </div>
  );
};

export default PDFMain;
