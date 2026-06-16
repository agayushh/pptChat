"use client";
import { ChevronsRightLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getAllTheChats } from "../utils/useChat";
import { Redirect } from "next";
import { SquarePen } from "lucide-react";
import { Images } from "lucide-react";

const sideBarMenuOptions = [
  {
    name: "New Chat",
    icon: <SquarePen />,
    redirect: "/chat",
  },
  {
    name: "Images",
    icon: <Images />,
    redirect: "/images",
  },
];

const Sidebar = () => {
  const [allChats, setAllChats] = useState<any[]>([]);
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchChats = async () => {
      const res = await getAllTheChats();
      setAllChats(res?.chats || []);
    };
    fetchChats();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSideBarOpen(true);
    };
  }, [sideBarOpen]);

  return (
    <div className="flex justify-start w-fit ">
      <div
        className={`${sideBarOpen ? "w-72" : "w-16"} transition-all duration-500 ease-in-out border-r h-screen border-white/30`}
      >
        {/* logo and toggle button */}
        <div className="flex items-center justify-between p-4 gap-2">
          <div>c</div>
          <div>
            <ChevronsRightLeft onClick={() => setSideBarOpen(!sideBarOpen)} />
          </div>
        </div>
        {/* create chat button */}
        <div className="space-y-1">
          {sideBarMenuOptions.map((menu, id) => {
            return (
              <div key={id}>
                <button className="w-68 overflow-x-hidden rounded-xl mx-2 p-2 text-white flex items-center justify-start gap-2 hover:bg-white/10">
                  <span>{menu.icon}</span>
                  {sideBarOpen && <span>{menu.name}</span>}
                  {/* <Redirect href={menu.redirect}/> */}
                </button>
              </div>
            );
          })}

          {/* all the chats/ */}
          <div>
            <div>
              {allChats.map((chat) => (
                <div key={chat.id}>
                  <span>{chat.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
