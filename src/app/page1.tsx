"use client";

import { useState, useEffect } from "react";
import localForage from "localforage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generate } from "@/server/generate";
import { LoadingIcon } from "@/components/LoadingIcon";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Page() {
  const [selectedTab, setSelectedTab] = useState("txt2img");
  return (
    <main className="flex min-h-screen flex-col items-center justify-between mt-2 ">
      {selectedTab === "txt2img" && <Txt2img />}
    </main>
  );
}

function Txt2img() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState([]);

  useEffect(() => {
    const fetchStoredImages = async () => {
      const images = [];
      await localForage.iterate((value, key) => {
        if (key.startsWith("image_")) {
          images.push(value);
        }
      });
      setImageData(images);
    };
    fetchStoredImages();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await generate(prompt);
      if (res && res.url) {
        const imageB64 = await fetchImageAsBase64(res.url);
        const imageKey = `image_${new Date().getTime()}`;
        await localForage.setItem(imageKey, imageB64);
        setImageData((prevData) => [...prevData, imageB64]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImageAsBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <Card className="w-full max-w-[600px]">
      <CardHeader>
        Comfy Deploy - Vector Line Art Tool
        <div className="text-xs text-foreground opacity-50">
          Lora -{" "}
          <a href="https://civitai.com/models/256144/stick-line-vector-illustration">
            stick-line-vector-illustration
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid w-full items-center gap-1.5" onSubmit={handleFormSubmit}>
          <Label htmlFor="picture">Image prompt</Label>
          <Input id="picture" type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <Button type="submit" className="flex gap-2" disabled={loading}>
            Generate {loading && <LoadingIcon />}
          </Button>
        </form>
        <ScrollArea className="p-4 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {imageData.map((imageSrc, index) => (
              <div key={index} className="flex justify-center">
                <img src={imageSrc} alt={`Generated Image ${index}`} className="max-w-full h-auto" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}