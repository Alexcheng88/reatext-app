import React, { useState } from "react";
import { OCRPlugin } from "ocr-plugin";

export default function OcrTester() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string>("");

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImageBase64(base64);

      try {
        const result = await OCRPlugin.recognize({ base64Image: base64 });
        setResultText(result.text);
      } catch (err) {
        console.error("OCR error:", err);
        setResultText("识别失败");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 space-y-4">
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {imageBase64 && (
        <img src={imageBase64} alt="Uploaded" className="max-w-full border rounded" />
      )}
      <div className="p-2 bg-gray-100 rounded shadow">
        <h3 className="font-bold mb-2">识别结果：</h3>
        <p>{resultText}</p>
      </div>
    </div>
  );
}
