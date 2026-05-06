import {
    createCameraVideoTrack,
    useMeeting,
    useParticipant,
    VideoPlayer,
} from "@videosdk.live/react-sdk";
import { useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import { useMeetingAppContext } from "../../MeetingAppContextDef";

// ─── SingleImage ──────────────────────────────────────────────────────────────

const SingleImage = ({
    videoProcessor,
    previewImageUrl,
    backgroudImageUrl,
    i,
    type,
    isLocal,
}) => {
    const { selectedWebcam, setImg, setType } = useMeetingAppContext();
    const selectWebcamDeviceId = selectedWebcam?.id;
    const mMeeting = useMeeting();
    const changeWebcam = mMeeting?.changeWebcam;
    const localWebcamOn = mMeeting?.localWebcamOn;
    const localMicOn = mMeeting?.localMicOn;

    const flipStyle = useMemo(
        () => (isLocal ? { transform: "scaleX(-1)", WebkitTransform: "scaleX(-1)" } : {}),
        [isLocal]
    );

    const handleClick = async () => {
        setImg(backgroudImageUrl);
        setType(type);

        if (!videoProcessor.ready) {
            await videoProcessor.init();
        }

        const stream = await createCameraVideoTrack(
            {
                cameraId: selectWebcamDeviceId,
                encoderConfig: localMicOn ? "h720p_w1280p" : "h360p_w640p",
                multiStream: false
            }
        );

        if (type === "DEFAULT") {
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
                    type,
                    imageUrl: backgroudImageUrl,
                });
                changeWebcam(processedStream);
            } catch (error) {
                console.log(error);
            }
        } else {
            videoProcessor.updateProcessorConfig({ type, imageUrl: backgroudImageUrl });
        }
    };

    return (
        <div
            onClick={handleClick}
            className="flex flex-1 items-center justify-center cursor-pointer rounded"
        >
            {previewImageUrl && (
                <img
                    style={flipStyle}
                    id={`virtualBgImage_${i}`}
                    src={previewImageUrl}
                    alt={`background-${i}`}
                    className="w-full"
                />
            )}
        </div>
    );
};

// ─── VirtualBackgroundContainer ───────────────────────────────────────────────

const VirtualBackgroundContainer = ({ panelHeight }) => {
    const { videoProcessor, isMirrorViewChecked } = useMeetingAppContext();

    const isTab = useMediaQuery({ minWidth: 768, maxWidth: 1223 });
    const isLGDesktop = useMediaQuery({ minWidth: 1824 });

    const mMeeting = useMeeting();
    const participantId = mMeeting?.localParticipant?.id;
    const { webcamOn, isLocal } = useParticipant(participantId, {});

    const flipStyle = useMemo(
        () => (isLocal ? { transform: "scaleX(-1)", WebkitTransform: "scaleX(-1)" } : {}),
        [isLocal]
    );

    const BASE_URL = "https://cdn.videosdk.live/virtual-background";

    const backgroundImageArr = [
        { previewImageUrl: `${BASE_URL}/webcam-no-filter-preview.png`, type: "DEFAULT" },
        { previewImageUrl: `${BASE_URL}/webcam-blur-preview.png`, type: "blur" },
        { type: "image", previewImageUrl: `${BASE_URL}/san-fran-preview.png`, backgroudImageUrl: `${BASE_URL}/san-fran.jpeg` },
        { previewImageUrl: `${BASE_URL}/hill-preview.png`, backgroudImageUrl: `${BASE_URL}/hill.jpeg`, type: "image" },
        { type: "image", previewImageUrl: `${BASE_URL}/cloud-preview.png`, backgroudImageUrl: `${BASE_URL}/cloud.jpeg` },
        { type: "image", previewImageUrl: `${BASE_URL}/beach-preview.png`, backgroudImageUrl: `${BASE_URL}/beach.jpeg` },
        { type: "image", previewImageUrl: `${BASE_URL}/white-wall-preview.png`, backgroudImageUrl: `${BASE_URL}/white-wall.jpeg` },
        { type: "image", previewImageUrl: `${BASE_URL}/wall-with-pot-preview.png`, backgroudImageUrl: `${BASE_URL}/wall-with-pot.jpeg` },
        { type: "image", previewImageUrl: `${BASE_URL}/window-conference-preview.png`, backgroudImageUrl: `${BASE_URL}/window-conference.jpeg` },
        { type: "image", previewImageUrl: `${BASE_URL}/sky-preview.png`, backgroudImageUrl: `${BASE_URL}/sky.jpeg` },
        { previewImageUrl: `${BASE_URL}/red-mix-preview.png`, backgroudImageUrl: `${BASE_URL}/red-mix.jpeg`, type: "image" },
        { type: "image", previewImageUrl: `${BASE_URL}/blue-mix-preview.png`, backgroudImageUrl: `${BASE_URL}/blue-mix.jpeg` },
        { type: "image", previewImageUrl: `${BASE_URL}/coffe-wall-preview.png`, backgroudImageUrl: `${BASE_URL}/coffe-wall.jpeg` },
        { type: "image", previewImageUrl: `${BASE_URL}/paper-wall-preview.png`, backgroudImageUrl: `${BASE_URL}/paper-wall.jpeg` },
        { type: "image", previewImageUrl: `${BASE_URL}/design-wall-preview.png`, backgroudImageUrl: `${BASE_URL}/design-wall.jpeg` },
    ];

    // 3 cols normally, 6 cols on tablet or large desktop (mirrors original Grid xl=4 / xs=2 out of 12)
    const colClass = isTab || isLGDesktop ? "w-1/6" : "w-1/3";

    return (
        <div
            style={{ height: panelHeight - 14 }}
            className="overflow-y-auto overflow-x-hidden"
        >
            <div className="flex flex-col flex-1 h-full p-2">

                {/* 16:9 video preview */}
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                    <div className="absolute inset-0 bg-black rounded overflow-hidden flex flex-col">
                        {webcamOn ? (
                            <VideoPlayer
                                participantId={participantId}
                                type="video"
                                containerStyle={{ height: "100%", width: "100%" }}
                                className="h-full"
                                classNameVideo="h-full"
                                videoStyle={isMirrorViewChecked ? {} : flipStyle}
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center px-4">
                                <p className="text-white text-center text-sm">
                                    Your camera is turned off. Selecting an effect will turn it on.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Background thumbnails */}
                <div className="mt-3 flex flex-wrap">
                    {backgroundImageArr.map(({ previewImageUrl, backgroudImageUrl, type }, i) => (
                        <div key={i} className={`${colClass} p-1`}>
                            <SingleImage
                                videoProcessor={videoProcessor}
                                previewImageUrl={previewImageUrl}
                                backgroudImageUrl={backgroudImageUrl}
                                i={i}
                                type={type}
                                isLocal={isLocal}
                            />
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default VirtualBackgroundContainer;