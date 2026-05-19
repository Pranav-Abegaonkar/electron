import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { useEffect, useRef, useState } from "react";
import { formatAMPM, json_verify, nameTructed } from "../../utils/helper";
import { XMarkIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

// ─── Chip selector ────────────────────────────────────────────────────────────
const Chip = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium font-poppins border transition-colors ${
      selected
        ? "bg-[#888CC4] text-white border-[#888CC4]"
        : "text-[#888888] border-[#CCCCCC] hover:border-[#888CC4] hover:text-[#888CC4]"
    }`}
  >
    {label}
  </button>
);

// ─── Step 1: Extend / Change form ─────────────────────────────────────────────
const ExtendForm = ({ onCancel, onProceed }) => {
  const [duration, setDuration] = useState(null);
  const [service, setService] = useState(null);
  const [format, setFormat] = useState(null);

  const toggle = (val, current, setter) =>
    setter(current === val ? null : val);

  const handleProceed = () => {
    console.log("[Extend/Change Session] Proceed clicked", { duration, service, format });
    onProceed();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#EEEEEE] shrink-0">
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm font-bold text-[#1B1C27] font-poppins leading-tight">
            Extend / Change Session
          </p>
          <button
            onClick={() => {
              console.log("[Extend/Change Session] Close (×) clicked");
              onCancel();
            }}
            className="text-[#888888] hover:text-[#1B1C27] ml-2 shrink-0"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[11px] text-[#888888] font-poppins">Session #4 of 4 · Desiree</p>
        <p className="text-[11px] text-[#888888] font-poppins">Mon 7 Nov 2023, 11:05 AM — 12:05 AM</p>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Extend Session */}
        <div>
          <p className="text-xs font-semibold text-[#1B1C27] font-poppins mb-2">Extend Session</p>
          <div className="flex gap-2 flex-wrap">
            {["30 min", "45 min", "60 min"].map((d) => (
              <Chip
                key={d}
                label={d}
                selected={duration === d}
                onClick={() => toggle(d, duration, setDuration)}
              />
            ))}
          </div>
        </div>

        {/* Service */}
        <div>
          <p className="text-xs font-semibold text-[#1B1C27] font-poppins mb-2">Service</p>
          <div className="flex gap-2 flex-wrap">
            {["Individual", "Couples"].map((s) => (
              <Chip
                key={s}
                label={s}
                selected={service === s}
                onClick={() => toggle(s, service, setService)}
              />
            ))}
          </div>
        </div>

        {/* Format / Details */}
        <div>
          <p className="text-xs font-semibold text-[#1B1C27] font-poppins mb-2">Details</p>
          <div className="flex gap-2 flex-wrap">
            {["Audio", "Video", "Text-based"].map((f) => (
              <Chip
                key={f}
                label={f}
                selected={format === f}
                onClick={() => toggle(f, format, setFormat)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#EEEEEE] shrink-0 flex items-center justify-between">
        <p className="text-sm font-poppins text-[#1B1C27]">
          Total: <span className="font-bold">$0.00</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log("[Extend/Change Session] Cancel clicked — returning to chat");
              onCancel();
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold font-poppins text-[#888888] border border-[#CCCCCC] hover:border-[#888CC4] hover:text-[#888CC4] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold font-poppins bg-[#888CC4] text-white hover:bg-[#7a7eb5] transition-colors"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Step 2: Confirmation ─────────────────────────────────────────────────────
const ExtendConfirm = ({ onCancel, onBuySession }) => (
  <div className="flex flex-col h-full bg-white">
    {/* Header */}
    <div className="px-4 pt-4 pb-3 border-b border-[#EEEEEE] shrink-0">
      <p className="text-sm font-bold text-[#1B1C27] font-poppins">Change / Extend Session</p>
    </div>

    {/* Body */}
    <div className="flex-1 flex flex-col justify-center px-6 py-6">
      <p className="text-sm text-[#888888] font-poppins leading-relaxed text-center">
        Your request will be sent to your Therapist for approval. Once approved you will be
        redirected to complete payment and your session will be updated.
      </p>
    </div>

    {/* Footer */}
    <div className="px-4 py-3 border-t border-[#EEEEEE] shrink-0 flex justify-end gap-2">
      <button
        onClick={() => {
          console.log("[Extend/Change Session] Confirmation Cancel clicked — returning to chat");
          onCancel();
        }}
        className="px-4 py-1.5 rounded-lg text-xs font-semibold font-poppins text-[#888888] border border-[#CCCCCC] hover:border-[#888CC4] hover:text-[#888CC4] transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={() => {
          console.log("[Extend/Change Session] Buy Session clicked — returning to chat session");
          onBuySession();
        }}
        className="px-4 py-1.5 rounded-lg text-xs font-semibold font-poppins bg-[#888CC4] text-white hover:bg-[#7a7eb5] transition-colors"
      >
        Buy Session
      </button>
    </div>
  </div>
);

// ─── Chat message bubble ──────────────────────────────────────────────────────
const ChatMessage = ({ senderId, senderName, text, timestamp }) => {
  const mMeeting = useMeeting();
  const localSender = mMeeting?.localParticipant?.id === senderId;

  return (
    <div className={`flex ${localSender ? "justify-end" : "justify-start"} mt-3`}>
      <div
        className={`flex flex-col py-2 px-3 rounded-xl max-w-[85%] ${
          localSender
            ? "items-end bg-[#888CC4]"
            : "items-start bg-[#F5F5F5]"
        }`}
      >
        {!localSender && (
          <p className="text-xs font-poppins text-[#888888]">
            {nameTructed(senderName, 15)}
          </p>
        )}
        <p className={`text-sm font-poppins whitespace-pre-wrap break-words mt-0.5 ${
          localSender ? "text-white" : "text-[#1B1C27]"
        }`}>
          {text}
        </p>
        <p className={`text-[10px] italic mt-1 font-poppins ${
          localSender ? "text-[#E8E9F8]" : "text-[#888888]"
        }`}>
          {formatAMPM(new Date(timestamp))}
        </p>
      </div>
    </div>
  );
};

// ─── Messages list ────────────────────────────────────────────────────────────
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
        if (type === "CHAT" && listRef.current)
          listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  if (!messages?.length) {
    return (
      <div
        className="flex items-center justify-center bg-white"
        style={{ height: listHeight }}
      >
        <p className="text-[#888888] text-base font-poppins">No messages yet</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="bg-white" style={{ overflowY: "scroll", height: listHeight }}>
      <div className="px-3 py-2">
        {messages.map((msg, i) => (
          <ChatMessage
            key={`chat_${i}`}
            senderId={msg.senderId}
            senderName={msg.senderName}
            text={msg.message}
            timestamp={msg.timestamp}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Message input ────────────────────────────────────────────────────────────
const ChatInput = ({ inputHeight }) => {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const { publish } = usePubSub("CHAT");
  const inputRef = useRef();
  const emojiRef = useRef();

  useEffect(() => {
    const close = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target))
        setShowEmoji(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const sendMessage = () => {
    const text = message.trim();
    if (text.length > 0) {
      try {
        publish(text, { persist: true });
        setTimeout(() => setMessage(""), 100);
        inputRef.current?.focus();
      } catch (e) {
        console.log("Error sending chat message", e);
      }
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const canSend = message.trim().length > 0;

  return (
    <div
      className="w-full flex items-center px-3 gap-2 shrink-0 border-t border-[#EEEEEE] bg-white"
      style={{ height: inputHeight }}
    >
      <input
        type="text"
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        placeholder="Write your message"
        autoComplete="off"
        className="flex-1 min-w-0 py-2.5 px-3 text-sm text-[#1B1C27] border border-[#EEEEEE] bg-white rounded-xl focus:outline-none focus:border-[#888CC4] transition-colors font-poppins placeholder-[#888888]"
      />

      {/* Emoji picker trigger */}
      <div ref={emojiRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setShowEmoji((s) => !s)}
          className={`p-1.5 rounded-lg transition-colors ${
            showEmoji ? "bg-[#F5F6FF] text-[#888CC4]" : "text-[#888888] hover:bg-[#F5F6FF] hover:text-[#888CC4]"
          }`}
        >
          <FaceSmileIcon className="w-5 h-5" />
        </button>
        {showEmoji && (
          <div className="absolute bottom-full mb-2 right-0 z-20 shadow-xl rounded-2xl overflow-hidden">
            <Picker
              data={data}
              onEmojiSelect={(e) => handleEmojiSelect(e.native)}
              theme="light"
              previewPosition="none"
              skinTonePosition="none"
              perLine={8}
              emojiSize={20}
              emojiButtonSize={28}
              maxFrequentRows={2}
            />
          </div>
        )}
      </div>

      {/* Send button */}
      <button
        type="button"
        onClick={sendMessage}
        disabled={!canSend}
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          canSend
            ? "bg-[#888CC4] hover:bg-[#7a7eb5] cursor-pointer"
            : "bg-[#EEEEEE] cursor-not-allowed"
        }`}
      >
        <PaperAirplaneIcon className="w-4 h-4 text-white" />
      </button>
    </div>
  );
};

// ─── Tabs + chat view ─────────────────────────────────────────────────────────
const TABS = ["Session Note", "Pre-Survey", "In-Call Chat"];
const EXTEND_BTN_HEIGHT = 58;
const TABS_HEIGHT = 44;
const INPUT_HEIGHT = 80;

const ChatView = ({ panelHeight, onExtendClick }) => {
  // Subtract fixed sections; guard against negative values
  const messagesHeight = Math.max(
    0,
    (panelHeight || 0) - EXTEND_BTN_HEIGHT - TABS_HEIGHT - INPUT_HEIGHT
  );

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Extend / Change Session button */}
      <div className="px-3 pt-3 pb-2 shrink-0" style={{ height: EXTEND_BTN_HEIGHT }}>
        <button
          onClick={() => {
            console.log("[Extend/Change Session] Button clicked — opening form");
            onExtendClick();
          }}
          className="w-full py-2.5 rounded-lg text-sm font-semibold font-poppins text-[#888CC4] border border-[#888CC4] hover:bg-[#888CC4] hover:text-white transition-colors"
        >
          Extend / Change Session
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b border-[#EEEEEE] shrink-0 bg-white"
        style={{ height: TABS_HEIGHT }}
      >
        {TABS.map((tab) => {
          const isActive = tab === "In-Call Chat";
          return (
            <button
              key={tab}
              onClick={() => {
                if (tab !== "In-Call Chat") {
                  console.log(`[Chat Tabs] "${tab}" tab clicked`);
                }
              }}
              className={`flex-1 py-2 text-xs font-semibold font-poppins transition-colors border-b-2 ${
                isActive
                  ? "text-[#1B1C27] border-[#888CC4]"
                  : "text-[#888888] border-transparent hover:text-[#1B1C27]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <ChatMessages listHeight={messagesHeight} />

      {/* Input */}
      <ChatInput inputHeight={INPUT_HEIGHT} />
    </div>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────
// view: "chat" | "extend-form" | "extend-confirm"
export function ChatPanel({ panelHeight }) {
  const [view, setView] = useState("chat");

  if (view === "extend-form") {
    return (
      <div className="w-full h-full overflow-hidden">
        <ExtendForm
          onCancel={() => setView("chat")}
          onProceed={() => setView("extend-confirm")}
        />
      </div>
    );
  }

  if (view === "extend-confirm") {
    return (
      <div className="w-full h-full overflow-hidden">
        <ExtendConfirm
          onCancel={() => setView("chat")}
          onBuySession={() => setView("chat")}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <ChatView
        panelHeight={panelHeight}
        onExtendClick={() => setView("extend-form")}
      />
    </div>
  );
}
