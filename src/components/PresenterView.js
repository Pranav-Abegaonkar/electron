import { useMeeting, useParticipant, VideoPlayer } from "@videosdk.live/react-sdk";
import { useEffect, useRef } from "react";
import MicOffSmallIcon from "../icons/MicOffSmallIcon";
import ScreenShareIcon from "../icons/ScreenShareIcon";
import SpeakerIcon from "../icons/SpeakerIcon";
import { nameTructed } from "../utils/helper";
import { CornerDisplayName } from "./ParticipantView";

export function PresenterView({ height }) {
  const mMeeting = useMeeting();
  const presenterId = mMeeting?.presenterId;
  const {
    micOn,
    webcamOn,
    isLocal,
    screenShareAudioStream,
    screenShareOn,
    displayName,
    isActiveSpeaker,
  } = useParticipant(presenterId);

  const audioPlayer = useRef();

  useEffect(() => {
    if (!isLocal && audioPlayer.current && screenShareOn && screenShareAudioStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareAudioStream.track);
      audioPlayer.current.srcObject = mediaStream;
      audioPlayer.current.play().catch((err) => {
        if (err.message === "play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD") {
          console.error("audio" + err.message);
        }
      });
    } else {
      audioPlayer.current.srcObject = null;
    }
  }, [screenShareAudioStream, screenShareOn, isLocal]);

  return (
    <div
      className="bg-[#252636] rounded-xl m-2 relative overflow-hidden w-full"
      style={{ height }}
    >
      <audio autoPlay playsInline controls={false} ref={audioPlayer} />
      <div className="video-contain absolute h-full w-full">
        <VideoPlayer
          participantId={presenterId}
          type="share"
          containerStyle={{ height: "100%", width: "100%" }}
          className="h-full"
          classNameVideo="h-full"
          videoStyle={{ filter: isLocal ? "blur(1rem)" : undefined }}
        />

        <div
          className="bottom-2 left-2 bg-[#00000066] p-2 absolute rounded-lg flex items-center justify-center gap-1"
          style={{ transition: "all 200ms", transitionTimingFunction: "linear" }}
        >
          {!micOn ? (
            <MicOffSmallIcon fillcolor="white" />
          ) : micOn && isActiveSpeaker ? (
            <SpeakerIcon />
          ) : null}
          <p className="text-sm text-white font-poppins">
            {isLocal ? "You are presenting" : `${nameTructed(displayName, 15)} is presenting`}
          </p>
        </div>

        {isLocal && (
          <>
            <div className="p-8 rounded-2xl flex flex-col items-center justify-center absolute top-1/2 left-1/2 bg-[#1B1C27] bg-opacity-90 transform -translate-x-1/2 -translate-y-1/2">
              <ScreenShareIcon style={{ height: 48, width: 48, color: "#888CC4" }} />
              <p className="text-white text-lg font-semibold font-poppins mt-4">
                You are presenting to everyone
              </p>
              <button
                className="mt-6 bg-[#888CC4] hover:bg-[#7a7eb5] text-white px-6 py-2 rounded-lg text-sm font-semibold font-poppins transition-colors"
                onClick={(e) => { e.stopPropagation(); mMeeting.toggleScreenShare(); }}
              >
                Stop Presenting
              </button>
            </div>
            <CornerDisplayName
              {...{ isLocal, displayName, micOn, webcamOn, isPresenting: true, participantId: presenterId, isActiveSpeaker }}
            />
          </>
        )}
      </div>
    </div>
  );
}
