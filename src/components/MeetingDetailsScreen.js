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

  // Reset back to the initial Create / Join choice screen
  const handleBack = () => {
    setIscreateMeetingClicked(false);
    setIsJoinMeetingClicked(false);
    setMeetingIdError(false);
    setMeetingId("");
  };

  return (
    <div className={`flex flex-1 flex-col justify-center w-full md:p-[6px] sm:p-1 p-1.5`}>

      {/* ── Back button — visible only when a sub-screen is active ── */}
      {(iscreateMeetingClicked || isJoinMeetingClicked) && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors self-start"
          title="Go back"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>
      )}

      {/* ── Meeting code display (Create flow) ── */}
      {iscreateMeetingClicked ? (
        <div className="border border-solid border-gray-400 rounded-xl px-4 py-3 flex items-center justify-center">
          <p className="text-white text-base">{`Meeting code : ${meetingId}`}</p>
          <button
            className="ml-2"
            onClick={() => {
              navigator.clipboard.writeText(meetingId);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 3000);
            }}
          >
            {isCopied ? (
              <CheckIcon className="h-5 w-5 text-green-400" />
            ) : (
              <ClipboardIcon className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      ) : isJoinMeetingClicked ? (
        /* ── Meeting ID input (Join flow) ── */
        <>
          <input
            defaultValue={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder={"Enter meeting Id"}
            className="px-4 py-3 bg-gray-650 rounded-xl text-white w-full text-center"
          />
          {meetingIdError && (
            <p className="text-xs text-red-600">{`Please enter valid meetingId`}</p>
          )}
        </>
      ) : null}

      {/* ── Name input + action button (both flows) ── */}
      {(iscreateMeetingClicked || isJoinMeetingClicked) && (
        <>
          <input
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
            className="px-4 py-3 mt-5 bg-gray-650 rounded-xl text-white w-full text-center"
          />
          <button
            disabled={participantName.length < 3}
            className={`w-full ${
              participantName.length < 3 ? "bg-gray-650" : "bg-purple-350"
            } text-white px-2 py-3 rounded-xl mt-5`}
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

      {/* ── Initial choice: Create or Join ── */}
      {!iscreateMeetingClicked && !isJoinMeetingClicked && (
        <div className="w-full md:mt-0 mt-4 flex flex-col">
          <div className="flex items-center justify-center flex-col w-full">
            <button
              className="w-full bg-purple-350 text-white px-2 py-3 rounded-xl"
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
              className="w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-5"
              onClick={() => setIsJoinMeetingClicked(true)}
            >
              Join a meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
