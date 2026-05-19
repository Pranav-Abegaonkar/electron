import {
  useMeeting,
  usePubSub,
  useMediaDevice,
  createCameraVideoTrack,
} from "@videosdk.live/react-sdk";
import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  ClipboardIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import Lottie from "lottie-react";
import ChatIcon from "../../icons/Bottombar/ChatIcon";
import ParticipantsIcon from "../../icons/Bottombar/ParticipantsIcon";
import EndIcon from "../../icons/Bottombar/EndIcon";
import RaiseHandIcon from "../../icons/Bottombar/RaiseHandIcon";
import WhiteboardIcon from "../../icons/Bottombar/WhiteboardIcon";
import { sideBarModes } from "../../utils/common";
import ScreenShareIcon from "../../icons/Bottombar/ScreenShareIcon";
import { Dialog, Transition } from "@headlessui/react";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import useMediaStream from "../../hooks/useMediaStream";
import MicDropUp from "../../components/MicDropUp";
import CamDropUp from "../../components/CamDropUp";
import VBDropUp from "../../components/VBDropUp";
import useIsMobile from "../../hooks/useIsMobile";
import useIsTab from "../../hooks/useIsTab";

// ─── Brand-styled icon button ─────────────────────────────────────────────────
const BarBtn = React.memo(function BarBtn({
  Icon, onClick, active, danger, disabled, tooltip, badge, lottieOption, isRequestProcessing,
}) {
  const [blink, setBlink] = useState(1);
  const blinkRef = useRef();

  useEffect(() => {
    if (isRequestProcessing) {
      blinkRef.current = setInterval(() => setBlink((s) => (s === 1 ? 0.4 : 1)), 600);
    } else {
      clearInterval(blinkRef.current);
      setBlink(1);
    }
    return () => clearInterval(blinkRef.current);
  }, [isRequestProcessing]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`relative flex items-center justify-center p-2.5 rounded-lg border transition-colors 
        ${danger
          ? "bg-red-500 hover:bg-red-600 border-red-500"
          : active
            ? "bg-[#F5F6FF] border-[#888CC4]"
            : "bg-white border-[#EEEEEE] hover:bg-[#F5F6FF] hover:border-[#888CC4]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      style={{ opacity: blink }}
    >
      {lottieOption ? (
        <div style={{ height: 20, width: 48 }}>
          <Lottie
            loop={lottieOption.loop}
            animationData={lottieOption.animationData}
            rendererSettings={lottieOption.rendererSettings}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      ) : (
        Icon && (
          <Icon
            style={{ height: 20, width: 20 }}
            fillcolor={danger ? "#fff" : active ? "#888CC4" : "#1B1C27"}
          />
        )
      )}
      {badge && (
        <span className="absolute -top-1 -right-1 bg-[#888CC4] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold font-poppins">
          {badge}
        </span>
      )}
    </button>
  );
});

// ─── Mic split-button (file-level) ────────────────────────────────────────────
function MicBTN() {
  const { isMicrophonePermissionAllowed } = useMeetingAppContext();
  const mMeeting = useMeeting();
  const [mics, setMics] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const { getMicrophones, getPlaybackDevices } = useMediaDevice({ onDeviceChanged });

  function onDeviceChanged() { loadDevices(); }

  const loadDevices = async () => {
    const [m, s] = await Promise.all([getMicrophones(), getPlaybackDevices()]);
    if (m?.length) setMics(m);
    if (s?.length) setSpeakers(s);
  };
  // eslint-disable-next-line
  useEffect(() => { loadDevices(); }, []);

  return (
    <MicDropUp
      micOn={mMeeting.localMicOn}
      onToggle={() => mMeeting.toggleMic()}
      mics={mics}
      speakers={speakers}
      changeMic={mMeeting.changeMic}
      isMicrophonePermissionAllowed={isMicrophonePermissionAllowed}
      openUpward
    />
  );
}

// ─── Webcam split-button (file-level) ─────────────────────────────────────────
function WebCamBTN() {
  const { selectedWebcam, isCameraPermissionAllowed } = useMeetingAppContext();
  const mMeeting = useMeeting();
  const [webcams, setWebcams] = useState([]);
  const { getCameras } = useMediaDevice();
  const { getVideoTrack } = useMediaStream();

  useEffect(() => {
    getCameras().then((cams) => { if (cams?.length) setWebcams(cams); });
    // eslint-disable-next-line
  }, []);

  return (
    <CamDropUp
      webcamOn={mMeeting.localWebcamOn}
      onToggle={async () => {
        let track;
        if (!mMeeting.localWebcamOn) track = await getVideoTrack({ webcamId: selectedWebcam.id });
        mMeeting.toggleWebcam(track);
      }}
      webcams={webcams}
      changeWebcam={mMeeting.changeWebcam}
      isCameraPermissionAllowed={isCameraPermissionAllowed}
      openUpward
    />
  );
}

// ─── Raise hand (file-level) ──────────────────────────────────────────────────
function RaiseHandBTN() {
  const { publish } = usePubSub("RAISE_HAND");
  return (
    <BarBtn
      Icon={RaiseHandIcon}
      onClick={() => { try { publish("Raise Hand"); } catch (e) { console.log("pubsub error", e); } }}
      tooltip="Raise Hand"
    />
  );
}

// ─── Whiteboard (file-level) ──────────────────────────────────────────────────
function WhiteBoardBTN() {
  const { whiteboardStarted } = useMeetingAppContext();
  const { publish: publishWBControl } = usePubSub("WB_CONTROL");
  const { presenterId } = useMeeting();
  return (
    <BarBtn
      Icon={WhiteboardIcon}
      onClick={() => publishWBControl(JSON.stringify({ event: whiteboardStarted ? "STOP" : "START" }), { persist: true })}
      active={whiteboardStarted}
      tooltip={whiteboardStarted ? "Stop Whiteboard" : "Start Whiteboard"}
      disabled={!!presenterId && !whiteboardStarted}
    />
  );
}

// ─── Leave (file-level, needs setIsMeetingLeft prop) ──────────────────────────
function LeaveBTN({ setIsMeetingLeft }) {
  const { leave } = useMeeting();
  return (
    <BarBtn
      Icon={EndIcon}
      danger
      onClick={() => { leave(); setIsMeetingLeft(true); }}
      tooltip="Leave Meeting"
    />
  );
}

// ─── Chat toggle (file-level) ─────────────────────────────────────────────────
function ChatBTN() {
  const { sideBarMode, setSideBarMode } = useMeetingAppContext();
  return (
    <BarBtn
      Icon={ChatIcon}
      onClick={() => setSideBarMode((s) => (s === sideBarModes.CHAT ? null : sideBarModes.CHAT))}
      active={sideBarMode === sideBarModes.CHAT}
      tooltip="View Chat"
    />
  );
}

const BASE_VB_URL = "https://cdn.videosdk.live/virtual-background";
const backgroundImageArr = [
  { previewImageUrl: `${BASE_VB_URL}/webcam-no-filter-preview.png`, type: "DEFAULT" },
  { previewImageUrl: `${BASE_VB_URL}/webcam-blur-preview.png`, type: "blur" },
  { type: "image", previewImageUrl: `${BASE_VB_URL}/san-fran-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/san-fran.jpeg` },
  { previewImageUrl: `${BASE_VB_URL}/hill-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/hill.jpeg`, type: "image" },
  { type: "image", previewImageUrl: `${BASE_VB_URL}/cloud-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/cloud.jpeg` },
  { type: "image", previewImageUrl: `${BASE_VB_URL}/beach-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/beach.jpeg` },
  { type: "image", previewImageUrl: `${BASE_VB_URL}/white-wall-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/white-wall.jpeg` },
  { type: "image", previewImageUrl: `${BASE_VB_URL}/wall-with-pot-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/wall-with-pot.jpeg` },
  { type: "image", previewImageUrl: `${BASE_VB_URL}/window-conference-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/window-conference.jpeg` },
  { type: "image", previewImageUrl: `${BASE_VB_URL}/sky-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/sky.jpeg` },
  { previewImageUrl: `${BASE_VB_URL}/red-mix-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/red-mix.jpeg`, type: "image" },
  { type: "image", previewImageUrl: `${BASE_VB_URL}/blue-mix-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/blue-mix.jpeg` },
  { type: "image", previewImageUrl: `${BASE_VB_URL}/coffe-wall-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/coffe-wall.jpeg` },
  { type: "image", previewImageUrl: `${BASE_VB_URL}/paper-wall-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/paper-wall.jpeg` },
  { type: "image", previewImageUrl: `${BASE_VB_URL}/design-wall-preview.png`, backgroudImageUrl: `${BASE_VB_URL}/design-wall.jpeg` },
];

function VBBTN() {
  const { videoProcessor, selectedWebcam, type, setType, img, setImg } = useMeetingAppContext();
  const mMeeting = useMeeting();
  const changeWebcam = mMeeting?.changeWebcam;
  const localWebcamOn = mMeeting?.localWebcamOn;
  const localMicOn = mMeeting?.localMicOn;

  let activeVBIndex = 0;
  if (type === "blur") activeVBIndex = 1;
  else if (type === "image") {
    const idx = backgroundImageArr.findIndex((b) => b.backgroudImageUrl === img);
    if (idx !== -1) activeVBIndex = idx;
  }

  const handleSelectBackground = async ({ type: newType, backgroudImageUrl }, index) => {
    setImg(backgroudImageUrl || null);
    setType(newType);

    if (!videoProcessor.ready) {
      await videoProcessor.init();
    }

    const stream = await createCameraVideoTrack({
      cameraId: selectedWebcam?.id,
      encoderConfig: localMicOn ? "h720p_w1280p" : "h360p_w640p",
      multiStream: false,
    });

    if (newType === "DEFAULT") {
      try {
        if (videoProcessor.processorRunning || !localWebcamOn) {
          videoProcessor.stop();
          changeWebcam(stream);
        }
        return;
      } catch (error) {
        console.log(error);
      }
    }

    if (!videoProcessor.processorRunning) {
      try {
        const processedStream = await videoProcessor.start(stream, {
          type: newType,
          imageUrl: backgroudImageUrl,
        });
        changeWebcam(processedStream);
      } catch (error) {
        console.log(error);
      }
    } else {
      videoProcessor.updateProcessorConfig({ type: newType, imageUrl: backgroudImageUrl });
    }
  };

  const _toggleVB = () => {
    if (activeVBIndex !== 0) {
      handleSelectBackground({ type: "DEFAULT" }, 0);
    } else {
      handleSelectBackground(backgroundImageArr[1], 1);
    }
  };

  return (
    <VBDropUp
      vbOn={activeVBIndex !== 0}
      onToggle={_toggleVB}
      backgroundImages={backgroundImageArr}
      activeVBIndex={activeVBIndex}
      handleSelectBackground={handleSelectBackground}
      openUpward
    />
  );
}

// ─── Participants toggle (file-level) ─────────────────────────────────────────
function ParticipantsBTN() {
  const { sideBarMode, setSideBarMode } = useMeetingAppContext();
  const { participants } = useMeeting();
  return (
    <BarBtn
      Icon={ParticipantsIcon}
      onClick={() => setSideBarMode((s) => (s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS))}
      active={sideBarMode === sideBarModes.PARTICIPANTS}
      tooltip="View Participants"
      badge={`${new Map(participants)?.size}`}
    />
  );
}
// ─── Screen share (file-level) ────────────────────────────────────────────────
function ScreenShareBTN() {
  const { localScreenShareOn, toggleScreenShare, presenterId } = useMeeting();
  const isMobile = useIsMobile();
  const isTab = useIsTab();

  return (
    <BarBtn
      Icon={ScreenShareIcon}
      onClick={() => toggleScreenShare()}
      active={localScreenShareOn}
      tooltip={localScreenShareOn ? "Stop Presenting" : "Present Screen"}
      disabled={presenterId ? (localScreenShareOn ? false : true) : (isMobile || isTab)}
    />
  );
}

// ─── Meeting ID copy (file-level) ─────────────────────────────────────────────
function MeetingIdCopyBTN() {
  const { meetingId } = useMeeting();
  const [isCopied, setIsCopied] = useState(false);
  return (
    <div className="flex bg-[#F5F5F5] border border-[#EEEEEE] rounded-lg px-3 py-2 items-center gap-2">
      <p className="text-[#1B1C27] text-sm font-poppins select-none">{meetingId}</p>
      <button
        onClick={() => {
          navigator.clipboard.writeText(meetingId);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        }}
      >
        {isCopied
          ? <CheckIcon className="h-4 w-4 text-green-500" />
          : <ClipboardIcon className="h-4 w-4 text-[#888CC4]" />
        }
      </button>
    </div>
  );
}

// ─── Bottom bar ───────────────────────────────────────────────────────────────
export function BottomBar({ bottomBarHeight, setIsMeetingLeft }) {
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const [open, setOpen] = useState(false);

  return isMobile || isTab ? (
    <div
      className="flex items-center justify-center gap-2 bg-white border-t border-[#EEEEEE] px-3"
      style={{ height: bottomBarHeight }}
    >
      <LeaveBTN setIsMeetingLeft={setIsMeetingLeft} />
      <MicBTN />
      <WebCamBTN />
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center p-2.5 rounded-lg border border-[#EEEEEE] bg-white hover:bg-[#F5F6FF] transition-colors"
      >
        <EllipsisHorizontalIcon className="w-5 h-5 text-[#1B1C27]" />
      </button>

      <Transition appear show={Boolean(open)} as={Fragment}>
        <Dialog as="div" className="relative" style={{ zIndex: 9999 }} onClose={() => setOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[#1B1C27] bg-opacity-30" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="translate-y-full opacity-0" enterTo="translate-y-0 opacity-100"
            leave="ease-in duration-200" leaveFrom="translate-y-0 opacity-100" leaveTo="translate-y-full opacity-0"
          >
            <div className="fixed inset-0 overflow-y-hidden">
              <div className="flex h-full items-end">
                <Dialog.Panel className="w-screen bg-white border-t border-[#EEEEEE] shadow-xl">
                  <div className="py-6 px-4">
                    <div className="grid grid-cols-4 gap-x-4 gap-y-5 justify-items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <RaiseHandBTN />
                        <p className="text-[10px] text-[#888888] font-poppins">Raise Hand</p>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <WhiteBoardBTN />
                        <p className="text-[10px] text-[#888888] font-poppins">Whiteboard</p>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <ChatBTN />
                        <p className="text-[10px] text-[#888888] font-poppins">Chat</p>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <ParticipantsBTN />
                        <p className="text-[10px] text-[#888888] font-poppins">Participants</p>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <VBBTN />
                        <p className="text-[10px] text-[#888888] font-poppins">Virtual BG</p>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <ScreenShareBTN />
                        <p className="text-[10px] text-[#888888] font-poppins">Share Screen</p>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <MeetingIdCopyBTN />
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  ) : (
    <div
      className="hidden md:flex items-center justify-between px-4 bg-white border-t border-[#EEEEEE]"
      style={{ height: bottomBarHeight }}
    >
      <MeetingIdCopyBTN />
      <div className="flex items-center gap-2">
        <RaiseHandBTN />
        <MicBTN />
        <WebCamBTN />
        <ScreenShareBTN />
        <WhiteBoardBTN />
        <VBBTN />
        <LeaveBTN setIsMeetingLeft={setIsMeetingLeft} />
      </div>
      <div className="flex items-center gap-2">
        <ChatBTN />
        <ParticipantsBTN />
      </div>
    </div>
  );
}
