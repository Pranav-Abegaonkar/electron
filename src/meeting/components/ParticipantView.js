import React, { useMemo } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { MemoizedParticipantGrid } from "../../components/ParticipantGrid";
import { useMeetingAppContext } from "../../MeetingAppContextDef";

function ParticipantsViewer({ isPresenting }) {
  const {
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
    localScreenShareOn,
  } = useMeeting();

  const { reconnectingParticipants } = useMeetingAppContext();

  const participantIds = useMemo(() => {
    const pinnedParticipantId = [...pinnedParticipants.keys()].filter(
      (participantId) => {
        return participantId !== localParticipant.id;
      }
    );
    const regularParticipantIds = [...participants.keys()].filter(
      (participantId) => {
        return (
          ![...pinnedParticipants.keys()].includes(participantId) &&
          localParticipant.id !== participantId
        );
      }
    );

    reconnectingParticipants?.forEach(rp => {
      const id = rp.id || rp;
      if (!regularParticipantIds.includes(id) && id !== localParticipant?.id) {
        regularParticipantIds.push(id);
      }
    });

    const ids = [
      localParticipant.id,
      ...pinnedParticipantId,
      ...regularParticipantIds,
    ].slice(0, isPresenting ? 6 : 16);

    if (activeSpeakerId) {
      if (!ids.includes(activeSpeakerId)) {
        ids[ids.length - 1] = activeSpeakerId;
      }
    }
    return ids;
  }, [
    participants,
    activeSpeakerId,
    pinnedParticipants,
    localScreenShareOn,
    reconnectingParticipants,
  ]);

  return (
    <MemoizedParticipantGrid
      participantIds={participantIds}
      isPresenting={isPresenting}
    />
  );
}

const MemorizedParticipantView = React.memo(
  ParticipantsViewer,
  (prevProps, nextProps) => {
    return prevProps.isPresenting === nextProps.isPresenting;
  }
);

export default MemorizedParticipantView;
