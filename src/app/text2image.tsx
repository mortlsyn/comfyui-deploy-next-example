"use client";
// this makes sure its front end 
import { useEffect, useState } from "react";
import localForage from "localforage";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JSX, SVGProps } from "react";

import { LoadingIcon } from "@/components/LoadingIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    checkStatus,
    generate,
    generate_img,
    generate_img_with_controlnet,
    getUploadUrl,
} from "@/server/generate";
import { VscGithubAlt } from "react-icons/vsc";
import { FaDiscord } from "react-icons/fa";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageGenerationResult } from "@/components/ImageGenerationResult";
import { WebsocketDemo } from "@/components/WebsocketDemo";
import { WebsocketDemo2 } from "@/components/WebsocketDemo2";
import { cn } from "@/lib/utils";
import { WebsocketDemo3 } from "@/components/WebsocketDemo3";
import { parseAsInteger, parseAsIsoDateTime, useQueryState } from "next-usequerystate";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from "@/components/ui/drawer";

export default function Page() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [runIds, setRunIds] = useState<string[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [images, setImages] = useState([]);

    // Load saved runIds from local storage when the component mounts
    useEffect(() => {
        // Fetch images from localForage when the component mounts
        localForage.getItem('results').then(savedImages => {
            if (savedImages) {
                setImages(savedImages);
            }
        });
    }, []);

    // Save runIds to local storage whenever they change
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        try {
            const res = await generate(prompt);
            if (res) {
                const newImage = { id: res.run_id, src: res.image_b64 }; // Assuming res.image_b64 is your base64 image string
                const updatedImages = [...images, newImage];
                setImages(updatedImages);
                await localForage.setItem('results', updatedImages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex h-screen">
            <aside className="w-64 bg-[#bd1e59] p-6 relative">
                <Select>
                    <SelectTrigger id="mode">
                        <SelectValue placeholder="Text2Img" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value="text2img">Text2Img</SelectItem>
                        <SelectItem value="img2img">Img2Img</SelectItem>
                    </SelectContent>
                </Select>
                <form
                    className="grid w-full items-center gap-1.5"
                    onSubmit={handleFormSubmit}
                >
                    <Input
                        id="picture"
                        className="mt-6 mb-4"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <Button type="submit" className="flex gap-2" disabled={loading}>
                        Generate {loading && <LoadingIcon />}
                    </Button>
                    <div className="flex justify-center mx-auto">
                        {loading && <img src="/hourglass.gif" alt="Loading" className="w-24 h-24 mt-4" />}
                    </div>
                </form>

                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DrawerTrigger asChild>
                        <button onClick={() => setDrawerOpen(!drawerOpen)} className="fixed bottom-0 w-full p-4 bg-[#bd1e59] text-white z-20">
                            View Past Images
                        </button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <ScrollArea className="p-4">
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((image, index) => (
                                    <div key={index} className="flex justify-center items-center w-1/4">
                                        <img src={`data:image/png;base64,${image.src}`} alt={`Generated Image ${index}`} className="max-w-full h-auto" />
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerContent>
                </Drawer>
                <Tabs className="absolute bottom-0 w-full">
                    <div className="flex justify-center">
                        <ChevronUpIcon className="text-white" />
                    </div>
                </Tabs>
            </aside>
            <main className="flex-grow overflow-hidden">
                {runIds.map((runId, index) => (
                    <div className="flex justify-center items-center h-full" key={index}>
                        <ImageGenerationResult runId={runId} className="max-h-full object-contain" />
                    </div>
                ))}
            </main>
        </div>
    );
}

function ChevronUpIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m18 15-6-6-6 6" />
        </svg>
    );
}

function HourglassIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 22h14" />
            <path d="M5 2h14" />
            <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
            <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
        </svg>
    );
}