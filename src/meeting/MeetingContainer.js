import React, { useState, useEffect, useRef, createRef, memo } from "react";
import { Constants, useMeeting, useParticipant, usePubSub } from "@videosdk.live/react-sdk";
import { BottomBar } from "./components/BottomBar";
import { SidebarConatiner } from "../components/sidebar/SidebarContainer";
import MemorizedParticipantView from "./components/ParticipantView";
import { PresenterView } from "../components/PresenterView";
import { nameTructed, trimSnackBarText } from "../utils/helper";
import WaitingToJoinScreen from "../components/screens/WaitingToJoinScreen";
import ConfirmBox from "../components/ConfirmBox";
import NetworkQualityPopup from "../components/NetworkQualityPopup";
import useIsMobile from "../hooks/useIsMobile";
import useIsTab from "../hooks/useIsTab";
import { useMediaQuery } from "react-responsive";
import { toast } from "react-toastify";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import ParticipantLeftModal from "../components/ParticipantLeftModal";

export function MeetingContainer({
  onMeetingLeave,
  setIsMeetingLeft,
}) {
  const {
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
    participantLeftModalData,
    setParticipantLeftModalData,
    setReconnectingParticipants,
    reconnectingParticipants,
  } = useMeetingAppContext();

  const [participantsData, setParticipantsData] = useState([]);

  const ParticipantMicStream = memo(({ participantId }) => {
    // Individual hook for each participant
    const { micStream, isLocal } = useParticipant(participantId);

    useEffect(() => {

      if (micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        const audioElement = new Audio();
        audioElement.srcObject = mediaStream;
        audioElement.muted = isLocal
        audioElement.play();

      }
    }, [micStream, participantId]);

    return null;
  }, [participantsData]);

  // useEffect(() => {
  //   // Wait 10 seconds after joining, then show the popup
  //   const timer = setTimeout(() => {
  //     setNetworkAlert(true);
  //   }, 10000);
  //   return () => clearTimeout(timer);
  // }, []);

  const { useRaisedHandParticipants } = useMeetingAppContext();
  const bottomBarHeight = 60;

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] = useState(null);
  const [meetingErrorVisible, setMeetingErrorVisible] = useState(false);
  const [meetingError, setMeetingError] = useState(false);
  const [activeLimitations, setActiveLimitations] = useState({
    bandwidth: false,
    congestion: false,
    cpu: false,
  });

  const [isLocalReconnecting, setIsLocalReconnecting] = useState(false);
  const localReconnectTimerRef = useRef(null);

  const mMeetingRef = useRef();
  const containerRef = createRef();
  const containerHeightRef = useRef();
  const containerWidthRef = useRef();

  useEffect(() => {
    containerHeightRef.current = containerHeight;
    containerWidthRef.current = containerWidth;
  }, [containerHeight, containerWidth]);

  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const sideBarContainerWidth = isXLDesktop
    ? 400
    : isLGDesktop
      ? 360
      : isTab
        ? 320
        : isMobile
          ? 280
          : 240;

  useEffect(() => {
    containerRef.current?.offsetHeight &&
      setContainerHeight(containerRef.current.offsetHeight);
    containerRef.current?.offsetWidth &&
      setContainerWidth(containerRef.current.offsetWidth);

    window.addEventListener("resize", ({ target }) => {
      containerRef.current?.offsetHeight &&
        setContainerHeight(containerRef.current.offsetHeight);
      containerRef.current?.offsetWidth &&
        setContainerWidth(containerRef.current.offsetWidth);
    });
  }, [containerRef]);

  const { participantRaisedHand } = useRaisedHandParticipants();

  const _handleMeetingLeft = () => {
    setIsMeetingLeft(true);
  };

  useEffect(() => {
    return () => {
      if (localReconnectTimerRef.current) {
        clearTimeout(localReconnectTimerRef.current);
      }
    };
  }, []);

  const _handleOnRecordingStateChanged = ({ status }) => {
    if (
      status === Constants.recordingEvents.RECORDING_STARTED ||
      status === Constants.recordingEvents.RECORDING_STOPPED
    ) {
      toast(
        `${status === Constants.recordingEvents.RECORDING_STARTED
          ? "Meeting recording is started"
          : "Meeting recording is stopped."
        }`,
        {
          position: "bottom-left",
          autoClose: 4000,
          hideProgressBar: true,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  function handleParticipantJoinedLocal(participant) {
    // Change quality to low, med or high based on resolution
    participant && participant.setQuality("high");
  }


  function onEntryResponded(participantId, name) {
    if (mMeetingRef.current?.localParticipant?.id === participantId) {
      if (name === "allowed") {
        setLocalParticipantAllowedJoin(true);
      } else {
        setLocalParticipantAllowedJoin(false);
        setTimeout(() => {
          _handleMeetingLeft();
        }, 3000);
      }
    }
  }

  function onMeetingJoined() {
    console.log("onMeetingJoined");
  }

  function onMeetingLeft() {
    setSelectedMic({ id: null, label: null })
    setSelectedWebcam({ id: null, label: null })
    setSelectedSpeaker({ id: null, label: null })
    onMeetingLeave();
  }

  const _handleOnError = (data) => {
    const { code, message } = data;
    console.log("meetingErr", code, message)

    const joiningErrCodes = [
      4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010,
    ];

    const isJoiningError = joiningErrCodes.findIndex((c) => c === code) !== -1;
    const isCriticalError = `${code}`.startsWith("500");

    new Audio(
      isCriticalError
        ? `https://static.videosdk.live/prebuilt/notification_critical_err.mp3`
        : `https://static.videosdk.live/prebuilt/notification_err.mp3`
    ).play();

    setMeetingErrorVisible(true);
    setMeetingError({
      code,
      message: isJoiningError ? "Unable to join meeting!" : message,
    });
  };

  const mMeeting = useMeeting({
    onQualityLimitation: (option) => {
      console.log("Quality limitation", option);
      const { state, type } = option;
      setActiveLimitations((prev) => ({
        ...prev,
        [type]: state === "detected",
      }));
    },
    onParticipantJoined: (participant) => {
      setReconnectingParticipants(prev => prev.filter(p => (p.id || p) !== participant.id));
      handleParticipantJoinedLocal(participant);
    },
    onParticipantLeft: (participant) => {
      setReconnectingParticipants(prev => {
        if (!prev.find(p => p.id === participant.id)) {
          return [...prev, { id: participant.id, displayName: participant.displayName }];
        }
        return prev;
      });
    },
    onEntryResponded,
    onMeetingJoined,
    onMeetingStateChanged: ({ state }) => {
      if (state === "RECONNECTING") {
        setIsLocalReconnecting(true);
        if (localReconnectTimerRef.current) clearTimeout(localReconnectTimerRef.current);
        localReconnectTimerRef.current = setTimeout(() => {
          setIsLocalReconnecting(false);
          _handleMeetingLeft();
        }, 50000);
      } else if (state === "CONNECTED") {
        setIsLocalReconnecting(false);
        if (localReconnectTimerRef.current) {
          clearTimeout(localReconnectTimerRef.current);
          localReconnectTimerRef.current = null;
        }
      } else if (state === "DISCONNECTED") {
        setIsLocalReconnecting(false);
        if (localReconnectTimerRef.current) clearTimeout(localReconnectTimerRef.current);
        _handleMeetingLeft();
      }

      toast(`Meeting is in ${state} state`, {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    },
    onMeetingLeft,
    onError: _handleOnError,
    onRecordingStateChanged: _handleOnRecordingStateChanged,
  });

  const isPresenting = mMeeting.presenterId ? true : false;

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const participantIds = Array.from(mMeeting.participants.keys());

      reconnectingParticipants.forEach(rp => {
        const id = rp.id || rp;
        if (!participantIds.includes(id)) {
          participantIds.push(id);
        }
      });

      console.log("Debounced participantIds", participantIds);

      setParticipantsData(participantIds);
      console.log("Setting participants");
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [mMeeting.participants, reconnectingParticipants]);


  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);


  usePubSub("RAISE_HAND", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName } = data;

      const isLocal = senderId === localParticipantId;

      new Audio(
        `https://static.videosdk.live/prebuilt/notification.mp3`
      ).play();

      toast(`${isLocal ? "You" : nameTructed(senderName, 15)} raised hand 🖐🏼`, {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      participantRaisedHand(senderId);
    },
  });

  usePubSub("CHAT", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName, message } = data;

      const isLocal = senderId === localParticipantId;

      if (!isLocal) {
        new Audio(
          `https://static.videosdk.live/prebuilt/notification.mp3`
        ).play();

        toast(
          `${trimSnackBarText(
            `${nameTructed(senderName, 15)} says: ${message}`
          )}`,
          {
            position: "bottom-left",
            autoClose: 4000,
            hideProgressBar: true,
            closeButton: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
      }
    },
  });

  return (
    <div className="fixed inset-0">
      <div ref={containerRef} className="h-full flex flex-col bg-gray-800">
        {typeof localParticipantAllowedJoin === "boolean" ? (
          localParticipantAllowedJoin ? (
            <>
              {isLocalReconnecting && (
                <div className="absolute inset-0 z-50 bg-gray-800 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4"></div>
                  <h2 className="text-white text-xl font-semibold">Reconnecting...</h2>
                  <p className="text-gray-400 mt-2">Please wait while we try to restore your connection.</p>
                </div>
              )}
              <div className={` flex flex-1 flex-row bg-gray-800 `}>
                <div className={`flex flex-1 `}>
                  {isPresenting ? (
                    <PresenterView height={containerHeight - bottomBarHeight} />
                  ) : null}
                  {isPresenting && isMobile ? (
                    participantsData.map((participantId) => (
                      <ParticipantMicStream key={participantId} participantId={participantId} />
                    ))
                  ) : (
                    <MemorizedParticipantView isPresenting={isPresenting} />
                  )}
                </div>

                <SidebarConatiner
                  height={containerHeight - bottomBarHeight}
                  sideBarContainerWidth={sideBarContainerWidth}
                />
              </div>

              <BottomBar
                bottomBarHeight={bottomBarHeight}
                setIsMeetingLeft={setIsMeetingLeft}
              />
            </>
          ) : (
            <></>
          )
        ) : (
          !mMeeting.isMeetingJoined && <WaitingToJoinScreen />
        )}
        <ConfirmBox
          open={meetingErrorVisible}
          successText="OKAY"
          onSuccess={() => {
            setMeetingErrorVisible(false);
          }}
          title={`Error Code: ${meetingError.code}`}
          subTitle={meetingError.message}
        />
        <NetworkQualityPopup
          limitations={activeLimitations}
        />
        <ParticipantLeftModal
          open={participantLeftModalData.open}
          participantName={participantLeftModalData.participantName}
          onEndCall={() => {
            setParticipantLeftModalData({ open: false, participantName: "" });
            mMeeting.leave();
          }}
        />
      </div>
    </div>
  );
}
