"use client";

import Sidebar from "../components/Sidebar";
import { UserButton } from "@clerk/nextjs";
import { ChevronDown, Plus, Mic, Image, Pen, Globe } from "lucide-react";
import { useState } from "react";

export default function Page() {
  const [model, setModel] = useState("ChatGPT");
  const [inputValue, setInputValue] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const handlePillClick = (action: string) => {
    if (action === "image") {
      setInputValue("Create an image of ");
    } else if (action === "write") {
      setInputValue("Help me write ");
    } else if (action === "search") {
      setInputValue("Look up ");
    }
  };

  return (
    <div className="bg-black text-[#ececf1] h-screen w-screen flex overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main chat window */}
      <div className="flex-1 flex flex-col h-full bg-black relative">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-sm z-10">
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-1 hover:bg-white/5 px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all text-white/90 hover:text-white"
            >
              <span>{model}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${showModelDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showModelDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowModelDropdown(false)}
                />
                <div className="absolute left-0 mt-1.5 w-40 rounded-xl bg-[#212121] border border-white/5 shadow-2xl p-1 z-20 animate-in fade-in slide-in-from-top-1 duration-100">
                  <button
                    onClick={() => {
                      setModel("ChatGPT");
                      setShowModelDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-xs font-semibold transition-all"
                  >
                    ChatGPT
                  </button>
                  <button
                    onClick={() => {
                      setModel("pptChat");
                      setShowModelDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-xs font-semibold transition-all"
                  >
                    pptChat
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox:
                    "w-7 h-7 rounded-full border border-white/10",
                },
              }}
            />
          </div>
        </header>

        {/* Chat Home body */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full pb-28 select-none">
          <h1 className="text-3xl font-medium tracking-normal text-white mb-6 text-center">
            Where should we begin?
          </h1>

          {/* Prompt container */}
          <div className="w-full bg-[#212121] rounded-full py-1.5 pl-4 pr-1.5 flex items-center gap-3 border border-transparent focus-within:border-white/5 transition-all shadow-md">
            {/* Plus button */}
            <button
              className="p-1.5 rounded-full text-white/60 hover:text-white transition-all cursor-pointer"
              title="Attach files"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything"
              className="flex-1 bg-transparent outline-none text-white placeholder-white/35 text-[15px] py-1.5 leading-relaxed"
            />

            <div className="flex items-center gap-1.5">
              {/* Mic button */}
              <button
                className="p-2 rounded-full text-white/60 hover:text-white transition-all cursor-pointer"
                title="Voice input"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>

              {/* Blue voice button */}
              <button
                className="w-8 h-8 rounded-full bg-[#1066e5] hover:bg-[#1066e5]/90 text-white transition-all flex items-center justify-center shadow-lg cursor-pointer"
                title="Voice mode"
              >
                <div className="flex items-center gap-[2.5px] h-3">
                  <span className="w-[2px] h-1.5 bg-white rounded-full"></span>
                  <span className="w-[2px] h-3 bg-white rounded-full"></span>
                  <span className="w-[2px] h-2.5 bg-white rounded-full"></span>
                  <span className="w-[2px] h-1 bg-white rounded-full"></span>
                </div>
              </button>
            </div>
          </div>

          {/* Quick pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <button
              onClick={() => handlePillClick("image")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-transparent hover:bg-white/5 text-white/60 hover:text-white text-xs font-normal transition-all cursor-pointer"
            >
              <Image className="w-3.5 h-3.5 text-white/50" />
              <span>Create an image</span>
            </button>

            <button
              onClick={() => handlePillClick("write")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-transparent hover:bg-white/5 text-white/60 hover:text-white text-xs font-normal transition-all cursor-pointer"
            >
              <Pen className="w-3.5 h-3.5 text-white/50" />
              <span>Write or edit</span>
            </button>

            <button
              onClick={() => handlePillClick("search")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-transparent hover:bg-white/5 text-white/60 hover:text-white text-xs font-normal transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-white/50" />
              <span>Look something up</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
