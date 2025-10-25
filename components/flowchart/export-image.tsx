"use client";

import { toPng, toJpeg, toSvg } from "html-to-image";
import { toast } from "sonner";

export async function exportToImage(
  format: "png" | "jpeg" | "svg",
  elementId: string = "reactflow-wrapper"
) {
  const element = document.querySelector(`.react-flow`) as HTMLElement;
  
  if (!element) {
    toast.error("Canvas not found");
    return;
  }

  try {
    let dataUrl: string;

    const options = {
      backgroundColor: "#ffffff",
      width: element.offsetWidth,
      height: element.offsetHeight,
      style: {
        width: `${element.offsetWidth}px`,
        height: `${element.offsetHeight}px`,
      },
    };

    switch (format) {
      case "png":
        dataUrl = await toPng(element, options);
        break;
      case "jpeg":
        dataUrl = await toJpeg(element, { ...options, quality: 0.95 });
        break;
      case "svg":
        dataUrl = await toSvg(element, options);
        break;
      default:
        throw new Error("Unsupported format");
    }

    const link = document.createElement("a");
    link.download = `flowchart-${Date.now()}.${format}`;
    link.href = dataUrl;
    link.click();

    toast.success(`Flowchart exported as ${format.toUpperCase()}`);
  } catch (error) {
    console.error("Export failed:", error);
    toast.error("Failed to export image");
  }
}

export async function copyToClipboard() {
  const element = document.querySelector(`.react-flow`) as HTMLElement;
  
  if (!element) {
    toast.error("Canvas not found");
    return;
  }

  try {
    const dataUrl = await toPng(element, {
      backgroundColor: "#ffffff",
    });

    const blob = await (await fetch(dataUrl)).blob();
    
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);

    toast.success("Copied to clipboard!");
  } catch (error) {
    console.error("Copy failed:", error);
    toast.error("Failed to copy to clipboard");
  }
}

