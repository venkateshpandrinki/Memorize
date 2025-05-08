"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ChevronRight, Bot, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import UploadModal from "./Uploadmodal";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  spaceId: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPanel({ spaceId }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const queryMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await axios.post(`http://127.0.0.1:8001/query/${spaceId}`, {
        query_text: query
      });
      return response.data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.response || "Sorry, I couldn't generate a response."
        }
      ]);
    },
    onError: (error) => {
      console.error("Query error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, there was an error processing your request."
        }
      ]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: inputValue
    };

    setMessages((prev) => [...prev, userMessage]);
    queryMutation.mutate(inputValue);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <Upload className="h-8 w-8 text-zinc-600" />
          <h2 className="text-xl text-zinc-100">Add a source to get started</h2>
          <UploadModal space_id={spaceId} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg",
                message.role === "user"
                  ? "bg-zinc-800 ml-12"
                  : "bg-zinc-900 mr-12"
              )}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-600 flex-shrink-0">
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-200">{message.content}</p>
              </div>
            </div>
          ))}
          {queryMutation.isPending && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          )}
        </div>
      )}
      <div className="border-t border-zinc-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2">
          <Input
            placeholder="Ask a question about your documents..."
            className="border-0 bg-transparent focus-visible:ring-0 px-0 text-zinc-200"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={queryMutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
            disabled={queryMutation.isPending}
          >
            {queryMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}