'use client';

import { useRef, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  url: string;
  equipmentName: string;
  size?: number;
}

const QRCodeDisplay = ({ url, equipmentName, size = 200 }: QRCodeDisplayProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fullUrl, setFullUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullUrl(`${window.location.origin}${url}`);
    }
  }, [url]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const qrImage = new Image();
    qrImage.crossOrigin = "anonymous";
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(fullUrl)}`;

    qrImage.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(qrImage, 0, 0, size, size);
      ctx.fillStyle = "rgba(98, 147, 241, 0.8)";
      ctx.fillRect(0, size - 40, size, 40);

      ctx.font = "bold 14px monospace";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText(fullUrl, size / 2, size - 15);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qrcode-${equipmentName}.png`;
      link.click();
    };
  };

  if (!fullUrl) return null;

  return (
    <div className="relative w-fit mx-auto">
      <div
        className="relative bg-card border border-border p-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col items-center gap-4 relative">
          <QRCodeSVG value={fullUrl} size={size} level="H" />
          {isHovered && (
            <div
              className="absolute inset-0 bg-card/95 backdrop-blur-sm flex items-center justify-center rounded-lg z-10 cursor-pointer"
              onClick={handleDownload}
            >
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-md hover:bg-primary/90 transition">
                Скачать QR
              </button>
            </div>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={size}
        height={size + 40}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default QRCodeDisplay;
