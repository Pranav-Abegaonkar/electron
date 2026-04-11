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
import MemoizedWhiteboard, { convertHWAspectRatio } from "../components/whiteboard/WhiteboardContainer";
import { ParticipantView } from "../components/ParticipantView";
import useMediaStream from "../hooks/useMediaStream";

export function MeetingContainer({
  onMeetingLeave,
  setIsMeetingLeft,
}) {
  const {
    selectedWebcam,
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
    participantLeftModalData,
    setParticipantLeftModalData,
    setReconnectingParticipants,
    reconnectingParticipants,
    whiteboardStarted,
    setWhiteboardStarted,
    sideBarMode,
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
  const isDegradedQualityRef = useRef(false);
  // Tracks which participant IDs are currently causing degradation.
  // Quality restores only when this Set is empty (all recovered).
  const degradedByRef = useRef(new Set());
  // Ref so handleQualityLimitation can always call the latest publish
  // regardless of which render's closure useMeeting captured.
  const publishQCRef = useRef(null);
  const { getVideoTrack } = useMediaStream();

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

  // ── Quality limitation handler ────────────────────────────────────────────
  //
  // Uses publishQCRef (a ref) instead of publishQualityControl directly, so
  // the stale-closure problem with useMeeting callbacks is avoided — the ref
  // always points to the latest publish function from the current render.
  async function handleQualityLimitation({ state, type }) {
    if (state === "detected") {
      // Show popup only on the affected participant
      setActiveLimitations((prev) => ({ ...prev, [type]: true }));

      // Publish DEGRADE once (guard prevents duplicate publishes)
      if (!isDegradedQualityRef.current) {
        isDegradedQualityRef.current = true;
        try {
          await publishQCRef.current(
            JSON.stringify({
              event: "DEGRADE",
              byParticipantId: mMeetingRef.current?.localParticipant?.id,
            }),
            { persist: true }
          );
        } catch (err) {
          console.error("[QUALITY_CONTROL] ❌ DEGRADE publish failed:", err);
          isDegradedQualityRef.current = false; // allow retry
        }
      }
    }

    if (state === "resolved") {
      // Hide popup only on the affected participant
      setActiveLimitations((prev) => {
        const next = { ...prev, [type]: false };

        // Publish RESTORE when ALL local limitation types are clear
        const allClear = !Object.values(next).some(Boolean);
        if (allClear && isDegradedQualityRef.current) {
          isDegradedQualityRef.current = false;
          publishQCRef.current(
            JSON.stringify({
              event: "RESTORE",
              byParticipantId: mMeetingRef.current?.localParticipant?.id,
            }),
            { persist: true }
          )
            .then(() => { })
            .catch((err) => console.error("[QUALITY_CONTROL] ❌ RESTORE publish failed:", err));
        }
        return next;
      });
    }
  }

  const mMeeting = useMeeting({
    onQualityLimitation: (option) => {
      handleQualityLimitation(option);
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

  // ─── WB layout constants ──────────────────────────────────────────────────
  const WB_TOOLBAR_WIDTH = 48;
  const WB_SPACING = 8;

  const { publish: publishWBControl } = usePubSub("WB_CONTROL", {
    onMessageReceived: ({ message }) => {
      try {
        const { event } = JSON.parse(message);
        setWhiteboardStarted(event === "START");
      } catch (e) { }
    },
    onOldMessagesReceived: (messages) => {
      if (messages.length > 0) {
        try {
          const last = messages[messages.length - 1];
          const { event } = JSON.parse(last.message);
          // Only apply if not already in the correct state
          setWhiteboardStarted(event === "START");
        } catch (e) { }
      }
    },
  });

  // ── QUALITY_CONTROL PubSub ────────────────────────────────────────────────
  // When any participant detects a quality limitation, they broadcast DEGRADE.
  // All participants (including the sender) receive it and each switches their
  // own local webcam to h360p_w640p. When the limitation resolves, RESTORE is
  // broadcast and all switch back to h540p_w960p.
  // degradedByRef tracks which participant IDs are still in limited state so
  // restoration only happens when every degraded participant has recovered.

  const switchWebcamQuality = (encoderConfig) => {
    getVideoTrack({ webcamId: selectedWebcam.id, encoderConfig, multiStream: false })
      .then((track) => {
        if (track) {
          mMeetingRef.current?.changeWebcam(track);
        }
      })
      .catch((err) => console.error("[QUALITY_CONTROL] ❌ changeWebcam failed:", err));
  };

  const { publish: publishQualityControl } = usePubSub("QUALITY_CONTROL", {
    onMessageReceived: ({ message }) => {
      try {
        const { event, byParticipantId } = JSON.parse(message);
        if (event === "DEGRADE") {
          degradedByRef.current.add(byParticipantId);
          switchWebcamQuality("h360p_w640p");
        }

        if (event === "RESTORE") {
          degradedByRef.current.delete(byParticipantId);
          if (degradedByRef.current.size === 0) {
            switchWebcamQuality("h540p_w960p");
          }
        }
      } catch (e) {
        console.error("[QUALITY_CONTROL] ❌ Failed to parse message:", e);
      }
    },
    onOldMessagesReceived: (messages) => {
      try {
        const degradedBy = new Set();
        for (const msg of messages) {
          const { event, byParticipantId } = JSON.parse(msg.message);
          if (event === "DEGRADE") degradedBy.add(byParticipantId);
          if (event === "RESTORE") degradedBy.delete(byParticipantId);
        }
        degradedByRef.current = degradedBy;
        if (degradedBy.size > 0) {
          switchWebcamQuality("h360p_w640p");
        }
      } catch (e) {
        console.error("[QUALITY_CONTROL] ❌ Failed to replay old messages:", e);
      }
    },
  });

  // Keep the ref always pointing to the latest publish fn (fixes stale closure)
  publishQCRef.current = publishQualityControl;

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const participantIds = Array.from(mMeeting.participants.keys());

      reconnectingParticipants.forEach(rp => {
        const id = rp.id || rp;
        if (!participantIds.includes(id)) {
          participantIds.push(id);
        }
      });
      setParticipantsData(participantIds);
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

                {/* ── LEFT: main content ── */}
                {whiteboardStarted ? (
                  // ── WHITEBOARD ACTIVE: centered card with spacing from edges ──
                  // Toolbar is now a floating overlay — canvas fills the full area
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: WB_SPACING,
                      overflow: "hidden",
                    }}
                  >
                    <MemoizedWhiteboard
                      height={containerHeight - bottomBarHeight - 2 * WB_SPACING}
                      width={containerWidth - sideBarContainerWidth - 2 * WB_SPACING}
                      whiteboardToolbarWidth={0}
                      whiteboardSpacing={WB_SPACING}
                      originalHeight={containerHeight - bottomBarHeight - 2 * WB_SPACING}
                      originalWidth={containerWidth - sideBarContainerWidth - 2 * WB_SPACING}
                      onClose={() =>
                        publishWBControl(
                          JSON.stringify({ event: "STOP" }),
                          { persist: true }
                        )
                      }
                    />
                  </div>
                ) : (
                  // ── NORMAL MODE: original full-stretch layout ──
                  <div className={`flex flex-1 flex-col`}>
                    <div className={`flex flex-1`}>
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
                  </div>
                )}

                {/* ── RIGHT: participant tiles column (whiteboard) or chat/participants sidebar ── */}
                {whiteboardStarted && !sideBarMode ? (
                  // Vertical participant tile stack — each tile is a fixed 16:9 card.
                  // This gives proper height for camera video to render.
                  <div
                    style={{
                      width: sideBarContainerWidth,
                      height: containerHeight - bottomBarHeight,
                      backgroundColor: "#0d1117",
                      borderLeft: "1px solid rgba(255,255,255,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      flexShrink: 0,
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                  >
                    {participantsData.map((participantId) => {
                      // Each tile: full column width, 16:9 aspect ratio height
                      const tileH = Math.round(sideBarContainerWidth * (9 / 16));
                      return (
                        <div
                          key={participantId}
                          style={{
                            width: "100%",
                            height: tileH,
                            flexShrink: 0,
                            padding: 4,
                          }}
                        >
                          <ParticipantView participantId={participantId} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Normal sidebar (chat / participants panel)
                  <SidebarConatiner
                    height={containerHeight - bottomBarHeight}
                    sideBarContainerWidth={sideBarContainerWidth}
                  />
                )}
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
