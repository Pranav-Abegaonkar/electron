import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { useEffect, useRef, useState } from "react";
import { formatAMPM, json_verify, nameTructed } from "../../utils/helper";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

const ChatMessage = ({ senderId, senderName, text, timestamp }) => {
  const mMeeting = useMeeting();
  const localParticipantId = mMeeting?.localParticipant?.id;
  const localSender = localParticipantId === senderId;

  return (
    <div className={`flex ${localSender ? "justify-end" : "justify-start"} mt-3`}>
      <div className={`flex ${localSender ? "items-end" : "items-start"} flex-col py-2 px-3 rounded-xl bg-[#2D2E40] max-w-[85%]`}>
        <p className="text-xs font-poppins" style={{ color: "#9FA0B7" }}>
          {localSender ? "You" : nameTructed(senderName, 15)}
        </p>
        <p className="text-sm text-white font-poppins whitespace-pre-wrap break-words mt-0.5">{text}</p>
        <p className="text-[10px] italic mt-1 font-poppins" style={{ color: "#9FA0B7" }}>
          {formatAMPM(new Date(timestamp))}
        </p>
      </div>
    </div>
  );
};

const ChatInput = ({ inputHeight }) => {
  const [message, setMessage] = useState("");
  const { publish } = usePubSub("CHAT");
  const input = useRef();

  const sendMessage = () => {
    const messageText = message.trim();
    if (messageText.length > 0) {
      try {
        publish(messageText, { persist: true });
        setTimeout(() => setMessage(""), 100);
        input.current?.focus();
      } catch (e) {
        console.log("Error in pubsub", e);
      }
    }
  };

  return (
    <div className="w-full flex items-center px-3 gap-2" style={{ height: inputHeight }}>
      <input
        type="text"
        className="flex-1 min-w-0 py-2.5 px-3 text-sm text-white border border-[#3D3E50] bg-[#1B1C27] rounded-xl focus:outline-none focus:border-[#888CC4] transition-colors font-poppins placeholder-[#9FA0B7]"
        placeholder="Write your message"
        autoComplete="off"
        ref={input}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />
      <button
        disabled={message.length < 2}
        type="submit"
        className="shrink-0 p-2 focus:outline-none transition-colors"
        onClick={sendMessage}
      >
        <PaperAirplaneIcon
          className={`w-5 h-5 -rotate-90 transition-colors ${
            message.length < 2 ? "text-[#3D3E50]" : "text-[#888CC4]"
          }`}
        />
      </button>
    </div>
  );
};

const ChatMessages = ({ listHeight }) => {
  const listRef = useRef();
  const { messages } = usePubSub("CHAT");

  const scrollToBottom = (data) => {
    if (!data) {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    } else {
      const { text } = data;
      if (json_verify(text)) {
        const { type } = JSON.parse(text);
        if (type === "CHAT" && listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      }
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  return messages ? (
    <div ref={listRef} style={{ overflowY: "scroll", height: listHeight }}>
      <div className="px-3 py-2">
        {messages.map((msg, i) => {
          const { senderId, senderName, message, timestamp } = msg;
          return (
            <ChatMessage
              key={`chat_item_${i}`}
              senderId={senderId}
              senderName={senderName}
              text={message}
              timestamp={timestamp}
            />
          );
        })}
      </div>
    </div>
  ) : (
    <p className="text-[#9FA0B7] text-sm font-poppins text-center py-4">No messages yet</p>
  );
};

export function ChatPanel({ panelHeight }) {
  const inputHeight = 72;
  const listHeight = panelHeight - inputHeight;

  return (
    <div className="flex flex-col h-full">
      <ChatMessages listHeight={listHeight} />
      <ChatInput inputHeight={inputHeight} />
    </div>
  );
}
