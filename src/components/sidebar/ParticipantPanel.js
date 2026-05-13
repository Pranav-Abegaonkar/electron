import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import React, { useMemo } from "react";
import MicOffIcon from "../../icons/ParticipantTabPanel/MicOffIcon";
import MicOnIcon from "../../icons/ParticipantTabPanel/MicOnIcon";
import RaiseHand from "../../icons/ParticipantTabPanel/RaiseHand";
import VideoCamOffIcon from "../../icons/ParticipantTabPanel/VideoCamOffIcon";
import VideoCamOnIcon from "../../icons/ParticipantTabPanel/VideoCamOnIcon";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import { nameTructed } from "../../utils/helper";

function ParticipantListItem({ participantId, raisedHand }) {
  const { micOn, webcamOn, displayName, isLocal } = useParticipant(participantId);

  return (
    <div className="mx-2 mt-2 mb-0 p-2.5 bg-[#2D2E40] rounded-xl">
      <div className="flex flex-1 items-center justify-center relative">
        <div className="h-9 w-9 rounded-full bg-[#888CC4] flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white font-poppins">
            {displayName?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="ml-2 mr-1 flex flex-1 min-w-0">
          <p className="text-sm text-white font-poppins truncate">
            {isLocal ? "You" : nameTructed(displayName, 15)}
          </p>
        </div>
        {raisedHand && (
          <div className="flex items-center justify-center m-1 p-1">
            <RaiseHand fillcolor={"#888CC4"} />
          </div>
        )}
        <div className="m-1 p-1">{micOn ? <MicOnIcon /> : <MicOffIcon />}</div>
        <div className="m-1 p-1">{webcamOn ? <VideoCamOnIcon /> : <VideoCamOffIcon />}</div>
      </div>
    </div>
  );
}

export function ParticipantPanel({ panelHeight }) {
  const { raisedHandsParticipants } = useMeetingAppContext();
  const mMeeting = useMeeting();
  const participants = mMeeting.participants;

  const sortedRaisedHandsParticipants = useMemo(() => {
    const participantIds = [...participants.keys()];

    const notRaised = participantIds.filter(
      (pID) => raisedHandsParticipants.findIndex(({ participantId: rPID }) => rPID === pID) === -1
    );

    const raisedSorted = raisedHandsParticipants.sort((a, b) => {
      if (a.raisedHandOn > b.raisedHandOn) return -1;
      if (a.raisedHandOn < b.raisedHandOn) return 1;
      return 0;
    });

    return [
      ...raisedSorted.map(({ participantId: p }) => ({ raisedHand: true, participantId: p })),
      ...notRaised.map((p) => ({ raisedHand: false, participantId: p })),
    ];
  }, [raisedHandsParticipants, participants]);

  const filterParticipants = (sorted) => sorted;

  const part = useMemo(
    () => filterParticipants(sortedRaisedHandsParticipants, participants),
    [sortedRaisedHandsParticipants, participants]
  );

  return (
    <div
      className="flex w-full flex-col bg-[#252636] overflow-y-auto"
      style={{ height: panelHeight }}
    >
      <div className="flex flex-col flex-1 pb-2" style={{ height: panelHeight - 100 }}>
        {[...participants.keys()].map((participantId, index) => {
          const { raisedHand, participantId: peerId } = part[index];
          return (
            <ParticipantListItem
              key={participantId}
              participantId={peerId}
              raisedHand={raisedHand}
            />
          );
        })}
      </div>
    </div>
  );
}
