import { CheckIcon, ClipboardIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { toast } from "react-toastify";

export function MeetingDetailsScreen({
  onClickJoin,
  _handleOnCreateMeeting,
  participantName,
  setParticipantName,
  onClickStartMeeting,
}) {
  const [meetingId, setMeetingId] = useState("");
  const [meetingIdError, setMeetingIdError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [iscreateMeetingClicked, setIscreateMeetingClicked] = useState(false);
  const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(false);

  const handleBack = () => {
    setIscreateMeetingClicked(false);
    setIsJoinMeetingClicked(false);
    setMeetingIdError(false);
    setMeetingId("");
  };

  return (
    <div className="bg-white border border-[#EEEEEE] rounded-2xl p-8 flex flex-col gap-4 w-full font-poppins">

      {(iscreateMeetingClicked || isJoinMeetingClicked) && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#888CC4] hover:text-[#7a7eb5] transition-colors self-start"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>
      )}

      {iscreateMeetingClicked ? (
        <div className="border border-[#EEEEEE] rounded-lg px-4 py-3 flex items-center justify-between bg-[#F5F5F5]">
          <p className="text-[#1B1C27] text-sm truncate flex-1">
            {`Meeting code: ${meetingId}`}
          </p>
          <button
            className="ml-2 shrink-0"
            onClick={() => {
              navigator.clipboard.writeText(meetingId);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 3000);
            }}
          >
            {isCopied
              ? <CheckIcon className="h-5 w-5 text-green-400" />
              : <ClipboardIcon className="h-5 w-5 text-[#888CC4]" />
            }
          </button>
        </div>
      ) : isJoinMeetingClicked ? (
        <>
          <input
            defaultValue={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder="Enter meeting Id"
            className="px-4 py-3 bg-[#F5F5F5] border border-[#EEEEEE] rounded-lg text-[#1B1C27] w-full text-center focus:border-[#888CC4] transition-colors"
          />
          {meetingIdError && (
            <p className="text-xs text-red-500">Please enter valid meetingId</p>
          )}
        </>
      ) : null}

      {(iscreateMeetingClicked || isJoinMeetingClicked) && (
        <>
          <input
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
            className="px-4 py-3 bg-[#F5F5F5] border border-[#EEEEEE] rounded-lg text-[#1B1C27] w-full text-center focus:border-[#888CC4] transition-colors"
          />
          <button
            disabled={participantName.length < 3}
            className={`w-full text-white font-bold px-4 py-3 rounded-lg transition-colors
              ${participantName.length < 3
                ? "bg-[#C5C8E3] cursor-not-allowed"
                : "bg-[#888CC4] hover:bg-[#7a7eb5]"
              }`}
            onClick={() => {
              if (iscreateMeetingClicked) {
                onClickStartMeeting();
              } else {
                if (meetingId.match("\\w{4}\\-\\w{4}\\-\\w{4}")) {
                  onClickJoin(meetingId);
                } else {
                  setMeetingIdError(true);
                }
              }
            }}
          >
            {iscreateMeetingClicked ? "Start a meeting" : "Join a meeting"}
          </button>
        </>
      )}

      {!iscreateMeetingClicked && !isJoinMeetingClicked && (
        <div className="flex flex-col gap-3">
          <button
            className="w-full bg-[#888CC4] hover:bg-[#7a7eb5] text-white font-bold px-4 py-3 rounded-lg transition-colors"
            onClick={async () => {
              const { meetingId, err } = await _handleOnCreateMeeting();
              if (meetingId) {
                setMeetingId(meetingId);
                setIscreateMeetingClicked(true);
              } else {
                toast(`${err}`, {
                  position: "bottom-left",
                  autoClose: 4000,
                  hideProgressBar: true,
                  closeButton: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                });
              }
            }}
          >
            Create a meeting
          </button>
          <button
            className="w-full bg-white border border-[#EEEEEE] hover:border-[#888CC4] text-[#1B1C27] font-bold px-4 py-3 rounded-lg transition-colors"
            onClick={() => setIsJoinMeetingClicked(true)}
          >
            Join a meeting
          </button>
        </div>
      )}
    </div>
  );
}
