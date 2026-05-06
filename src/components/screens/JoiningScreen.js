import React, { useEffect, useRef, useState } from "react";
import { getToken, validateMeeting, createMeeting } from "../../api";
import ConfirmBox from "../ConfirmBox";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { Constants, useMediaDevice } from "@videosdk.live/react-sdk";
import NetworkStats from "../NetworkStats";
import MicDropUp from "../MicDropUp";
import CamDropUp from "../CamDropUp";
import useMediaStream from "../../hooks/useMediaStream";
import useIsMobile from "../../hooks/useIsMobile";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import PreCallReminderModal from "./PreCallReminderModal";


export function JoiningScreen({
  participantName,
  setParticipantName,
  setMeetingId,
  setToken,
  setMicOn,
  setWebcamOn,
  onClickStartMeeting,
  customAudioStream,
  setCustomAudioStream,
  setCustomVideoStream,
  micOn,
  webcamOn,
}) {
  const {
    selectedWebcam,
    selectedMic,
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
    isCameraPermissionAllowed,
    isMicrophonePermissionAllowed,
    setIsCameraPermissionAllowed,
    setIsMicrophonePermissionAllowed,
  } = useMeetingAppContext();

  const isMobile = useIsMobile();

  const [{ webcams, mics, speakers }, setDevices] = useState({
    webcams: [],
    mics: [],
    speakers: [],
  });
  const { getVideoTrack, getAudioTrack } = useMediaStream();
  const {
    checkPermissions,
    getCameras,
    getMicrophones,
    requestPermission,
    getPlaybackDevices,
  } = useMediaDevice({ onDeviceChanged });

  const [audioTrack, setAudioTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [dlgMuted, setDlgMuted] = useState(false);
  const [dlgDevices, setDlgDevices] = useState(false);
  const [hasSeenReminders, setHasSeenReminders] = useState(false);
  const [localMeetingId, setLocalMeetingId] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  // "idle" | "joining" | "creating"
  const [status, setStatus] = useState("idle");

  const videoPlayerRef = useRef();
  const audioPlayerRef = useRef();
  const videoTrackRef = useRef();
  const audioTrackRef = useRef();
  const audioAnalyserIntervalRef = useRef();
  const permissonAvaialble = useRef();
  const webcamRef = useRef();
  const micRef = useRef();

  useEffect(() => { webcamRef.current = webcamOn; }, [webcamOn]);
  useEffect(() => { micRef.current = micOn; }, [micOn]);

  useEffect(() => {
    permissonAvaialble.current = {
      isCameraPermissionAllowed,
      isMicrophonePermissionAllowed,
    };
  }, [isCameraPermissionAllowed, isMicrophonePermissionAllowed]);

  useEffect(() => {
    if (micOn) {
      audioTrackRef.current = audioTrack;
      startMuteListener();
    }
  }, [micOn, audioTrack]);

  useEffect(() => {
    if (micOn) {
      if (audioTrackRef.current && audioTrackRef.current !== audioTrack) {
        audioTrackRef.current.stop();
      }
      audioTrackRef.current = audioTrack;
      if (audioTrack) {
        const audioSrcObject = new MediaStream([audioTrack]);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.srcObject = audioSrcObject;
          audioPlayerRef.current.play().catch((err) => console.log("audio play error", err));
        }
      } else if (audioPlayerRef.current) {
        audioPlayerRef.current.srcObject = null;
      }
    }
  }, [micOn, audioTrack]);

  useEffect(() => {
    if (webcamOn) {
      if (videoTrackRef.current && videoTrackRef.current !== videoTrack) {
        videoTrackRef.current.stop();
      }
      videoTrackRef.current = videoTrack;

      const isPlaying =
        videoPlayerRef.current.currentTime > 0 &&
        !videoPlayerRef.current.paused &&
        !videoPlayerRef.current.ended &&
        videoPlayerRef.current.readyState > videoPlayerRef.current.HAVE_CURRENT_DATA;

      if (videoTrack) {
        const videoSrcObject = new MediaStream([videoTrack]);
        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = videoSrcObject;
          if (videoPlayerRef.current.pause && !isPlaying) {
            videoPlayerRef.current.play().catch((err) => console.log("error", err));
          }
        }
      } else if (videoPlayerRef.current) {
        videoPlayerRef.current.srcObject = null;
      }
    }
  }, [webcamOn, videoTrack]);

  useEffect(() => { getCameraDevices(); }, [isCameraPermissionAllowed]);
  useEffect(() => { getAudioDevices(); }, [isMicrophonePermissionAllowed]);
  useEffect(() => {
    checkMediaPermission();
    return () => {};
  }, []);
  useEffect(() => { getAudioDevices(); }, []);

  const _toggleWebcam = () => {
    const track = videoTrackRef.current;
    if (webcamOn) {
      if (track) {
        track.stop();
        setVideoTrack(null);
        setCustomVideoStream(null);
        setWebcamOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: false, webcam: true });
      setWebcamOn(true);
    }
  };

  const _toggleMic = () => {
    const track = audioTrackRef.current;
    if (micOn) {
      if (track) {
        track.stop();
        setAudioTrack(null);
        setCustomAudioStream(null);
        setMicOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: true, webcam: false });
      setMicOn(true);
    }
  };

  const changeWebcam = async (deviceId) => {
    if (webcamOn) {
      const currentvideoTrack = videoTrackRef.current;
      if (currentvideoTrack) currentvideoTrack.stop();
      const stream = await getVideoTrack({ webcamId: deviceId });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      setVideoTrack(videoTracks?.length ? videoTracks[0] : null);
    }
  };

  const changeMic = async (deviceId) => {
    if (micOn) {
      const currentAudioTrack = audioTrackRef.current;
      currentAudioTrack && currentAudioTrack.stop();
      const stream = await getAudioTrack({ micId: deviceId });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      clearInterval(audioAnalyserIntervalRef.current);
      setAudioTrack(audioTracks?.length ? audioTracks[0] : null);
    }
  };

  const getDefaultMediaTracks = async ({ mic, webcam }) => {
    if (mic) {
      const stream = await getAudioTrack({ micId: selectedMic.id });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      setAudioTrack(audioTracks?.length ? audioTracks[0] : null);
    }
    if (webcam) {
      const stream = await getVideoTrack({ webcamId: selectedWebcam?.id });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      setVideoTrack(videoTracks?.length ? videoTracks[0] : null);
    }
  };

  async function startMuteListener() {
    const currentAudioTrack = audioTrackRef.current;
    if (currentAudioTrack) {
      if (currentAudioTrack.muted) setDlgMuted(true);
      currentAudioTrack.addEventListener("mute", () => setDlgMuted(true));
    }
  }

  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;

  async function requestAudioVideoPermission(mediaType) {
    try {
      const permission = await requestPermission(mediaType);
      if (isFirefox) {
        const isVideoAllowed = permission.get("video");
        setIsCameraPermissionAllowed(isVideoAllowed);
        if (isVideoAllowed) {
          setWebcamOn(true);
          await getDefaultMediaTracks({ mic: false, webcam: true });
        }
        const isAudioAllowed = permission.get("audio");
        setIsMicrophonePermissionAllowed(isAudioAllowed);
        if (isAudioAllowed) {
          setMicOn(true);
          await getDefaultMediaTracks({ mic: true, webcam: false });
        }
      }
      if (mediaType === Constants.permission.AUDIO) {
        const isAudioAllowed = permission.get(Constants.permission.AUDIO);
        setIsMicrophonePermissionAllowed(isAudioAllowed);
        if (isAudioAllowed) {
          setMicOn(true);
          await getDefaultMediaTracks({ mic: true, webcam: false });
        }
      }
      if (mediaType === Constants.permission.VIDEO) {
        const isVideoAllowed = permission.get(Constants.permission.VIDEO);
        setIsCameraPermissionAllowed(isVideoAllowed);
        if (isVideoAllowed) {
          setWebcamOn(true);
          await getDefaultMediaTracks({ mic: false, webcam: true });
        }
      }
    } catch (ex) {
      console.log("Error in requestPermission ", ex);
    }
  }

  function onDeviceChanged() {
    getCameraDevices();
    getAudioDevices();
    getDefaultMediaTracks({ mic: micRef.current, webcam: webcamRef.current });
  }

  const checkMediaPermission = async () => {
    try {
      const checkAudioVideoPermission = await checkPermissions();
      const cameraPermissionAllowed = checkAudioVideoPermission.get(Constants.permission.VIDEO);
      const microphonePermissionAllowed = checkAudioVideoPermission.get(Constants.permission.AUDIO);
      setIsCameraPermissionAllowed(cameraPermissionAllowed);
      setIsMicrophonePermissionAllowed(microphonePermissionAllowed);
      if (microphonePermissionAllowed) {
        setMicOn(true);
        getDefaultMediaTracks({ mic: true, webcam: false });
      } else {
        await requestAudioVideoPermission(Constants.permission.AUDIO);
      }
      if (cameraPermissionAllowed) {
        setWebcamOn(true);
        getDefaultMediaTracks({ mic: false, webcam: true });
      } else {
        await requestAudioVideoPermission(Constants.permission.VIDEO);
      }
    } catch (error) {
      await requestAudioVideoPermission();
      console.log(error);
    }
  };

  const getCameraDevices = async () => {
    try {
      if (permissonAvaialble.current?.isCameraPermissionAllowed) {
        let webcams = await getCameras();
        setSelectedWebcam({ id: webcams[0]?.deviceId, label: webcams[0]?.label });
        setDevices((d) => ({ ...d, webcams }));
      }
    } catch (err) {
      console.log("Error in getting camera devices", err);
    }
  };

  const getAudioDevices = async () => {
    try {
      if (permissonAvaialble.current?.isMicrophonePermissionAllowed) {
        let mics = await getMicrophones();
        let speakers = await getPlaybackDevices();
        if (mics.length > 0) startMuteListener();
        setSelectedSpeaker({ id: speakers[0]?.deviceId, label: speakers[0]?.label });
        await setSelectedMic({ id: mics[0]?.deviceId, label: mics[0]?.label });
        setDevices((d) => ({ ...d, mics, speakers }));
      }
    } catch (err) {
      console.log("Error in getting audio devices", err);
    }
  };

  const handleJoinSession = async () => {
    if (!localMeetingId.trim() || status !== "idle") return;
    setStatus("joining");
    try {
      const token = await getToken();
      const { meetingId, err } = await validateMeeting({ roomId: localMeetingId.trim(), token });
      if (meetingId === localMeetingId.trim()) {
        setToken(token);
        setMeetingId(meetingId);
        onClickStartMeeting();
      } else {
        toast(String(err), { position: "bottom-left", autoClose: 4000, hideProgressBar: true, closeButton: false, theme: "light" });
      }
    } finally {
      setStatus("idle");
    }
  };

  // ─── TEST ONLY: remove handleCreateMeeting + button in JSX to disable ───
  const handleCreateMeeting = async () => {
    if (status !== "idle") return;
    setStatus("creating");
    try {
      const token = await getToken();
      const { meetingId, err } = await createMeeting({ token });
      if (meetingId) setLocalMeetingId(meetingId);
      else toast(String(err || "Failed to create meeting"), { position: "bottom-left", autoClose: 3000, theme: "light" });
    } finally {
      setStatus("idle");
    }
  };
  // ─── END TEST ONLY ───

  const DISPLAY_MEETING_ID = localMeetingId || "DUMMY MEETING ID";

  const handleCopy = () => {
    navigator.clipboard.writeText(DISPLAY_MEETING_ID);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const canJoin = localMeetingId.trim().length > 0 && status === "idle";

  return (
    <>
      <div className="min-h-screen bg-[#F5F6FF] font-poppins flex flex-col overflow-y-auto">
        <header className="flex justify-center pt-10 pb-2">
          <span className="text-[#888CC4] font-bold font-poppins text-2xl tracking-wider">TYHO</span>
        </header>

        <main className="flex-1 flex items-start justify-center px-4 md:px-8 lg:px-16 py-6">
          <div className="w-full max-w-6xl grid grid-cols-12 gap-4 lg:gap-8 items-start">

            {/* Left: camera preview + join controls */}
            <div className="col-span-12 md:col-span-7 flex flex-col gap-4">

              {/* Camera preview */}
              <div
                className="relative rounded-2xl bg-[#1B1C27]"
                style={{ height: isMobile ? "40vh" : "clamp(280px, 48vh, 460px)" }}
              >
                <div className="absolute top-3 right-3 z-10">
                  <NetworkStats />
                </div>
                {isMobile && (
                  <audio autoPlay playsInline muted ref={audioPlayerRef} controls={false} />
                )}
                <video
                  autoPlay playsInline muted ref={videoPlayerRef} controls={false}
                  style={{ transform: "scaleX(-1)", WebkitTransform: "scaleX(-1)" }}
                  className="h-full w-full object-cover rounded-2xl"
                />
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
                  <MicDropUp
                    micOn={micOn} onToggle={_toggleMic}
                    mics={mics} speakers={speakers} changeMic={changeMic}
                    isMicrophonePermissionAllowed={isMicrophonePermissionAllowed}
                  />
                  <CamDropUp
                    webcamOn={webcamOn} onToggle={_toggleWebcam}
                    webcams={webcams} changeWebcam={changeWebcam}
                    isCameraPermissionAllowed={isCameraPermissionAllowed}
                  />
                </div>
              </div>

              {/* Join */}
              <button
                onClick={handleJoinSession}
                disabled={!canJoin}
                className={`w-full py-3 rounded-xl font-bold font-poppins text-base text-white transition-colors
                  ${canJoin ? "bg-[#888CC4] hover:bg-[#7a7eb5]" : "bg-[#C5C8E3] cursor-not-allowed"}`}
              >
                {status === "joining" ? "Joining…" : "Join Session"}
              </button>

              {/* ─── TEST ONLY: delete this button to remove create-meeting ─── */}
              <button
                onClick={handleCreateMeeting}
                disabled={status !== "idle"}
                className="w-full py-2.5 rounded-xl border border-[#888CC4] text-[#888CC4] text-sm font-semibold font-poppins hover:bg-[#F5F6FF] transition-colors disabled:opacity-50"
              >
                {status === "creating" ? "Creating…" : "Create Test Meeting"}
              </button>
              {/* ─── END TEST ONLY ─── */}

              {/* Session info card */}
              <div className="bg-white border border-[#EEEEEE] rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-[#1B1C27] font-bold font-poppins text-base">
                  6 Mar 2023, 06:00 PM – 07:00 PM
                </p>
                {/* Meeting ID / link row */}
                <div className="bg-[#F5F5F5] border border-[#EEEEEE] rounded-lg flex items-center gap-2 px-4 py-3">
                  <p
                    className="flex-1 min-w-0 bg-transparent text-sm text-[#1B1C27] font-poppins outline-none truncate"
                  >
                    {DISPLAY_MEETING_ID}
                  </p>
                  <div className="w-px h-4 bg-[#EEEEEE] shrink-0" />
                  <button
                    onClick={handleCopy}
                    className="shrink-0 text-[#888CC4] text-xs font-bold font-poppins transition-opacity"
                  >
                    {isCopied ? "Copied!" : "Copy"}
                  </button>
                  {isCopied
                    ? <CheckIcon className="w-4 h-4 text-green-500 shrink-0" />
                    : <ClipboardIcon className="w-4 h-4 text-[#888CC4] shrink-0" />
                  }
                </div>
              </div>
            </div>

            {/* Right: info card — matches video height */}
            <div className="col-span-12 md:col-span-5 md:mt-0 mt-4">
              <div
                className="bg-white border border-[#EEEEEE] rounded-2xl p-8 flex flex-col gap-4 overflow-y-auto"
                style={{ height: isMobile ? "auto" : "clamp(280px, 48vh, 460px)" }}
              >
                <div className="flex flex-col gap-3">
                  <p className="text-[#1B1C27] font-bold font-poppins text-base">
                    For the best experience, please:
                  </p>
                  <ul className="list-disc pl-6 text-[#1B1C27] font-poppins text-sm space-y-2">
                    <li>Use a Chrome browser on a laptop to attend your sessions.</li>
                    <li>Check that you have a good internet connection, otherwise your video feed may be affected.</li>
                  </ul>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[#1B1C27] font-bold font-poppins text-sm">Note:</p>
                  <p className="text-[#1B1C27] font-poppins text-sm">
                    Screen sharing and virtual background have been disabled for all mobile devices (including tablets).
                  </p>
                </div>
                <p className="text-[#1B1C27] font-poppins text-sm">Hope you have a great session.</p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {!hasSeenReminders && (
        <PreCallReminderModal onDismiss={() => setHasSeenReminders(true)} />
      )}

      <ConfirmBox
        open={dlgMuted}
        successText="OKAY"
        onSuccess={() => setDlgMuted(false)}
        title="System mic is muted"
        subTitle="You're default microphone is muted, please unmute it or increase audio input volume from system settings."
      />
      <ConfirmBox
        open={dlgDevices}
        successText="DISMISS"
        onSuccess={() => setDlgDevices(false)}
        title="Mic or webcam not available"
        subTitle="Please connect a mic and webcam to speak and share your video in the meeting. You can also join without them."
      />
    </>
  );
}
