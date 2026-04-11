import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import WBToolbar from "./WBToolbar";

/**
 * Maintain 16:9 aspect ratio within the given container dimensions.
 * Exported so MeetingContainer can use it for sizing calculations.
 */
export const convertHWAspectRatio = ({ height: cH, width: cW }) => {
  if (!cH || !cW || cH <= 0 || cW <= 0) return { width: 0, height: 0 };
  let width = cW, height = cH;
  if (cW / cH > 16 / 9) {
    width = cH * (16 / 9);
  } else {
    height = cW / (16 / 9);
  }
  return { width: Math.floor(width), height: Math.floor(height) };
};

// ─── WhiteboardContainer ──────────────────────────────────────────────────────

function WhiteboardContainer({
  height,
  width,
  whiteboardToolbarWidth,   // kept for API compat — no longer used for layout
  whiteboardSpacing,
  originalHeight,
  originalWidth,
  onClose,
}) {
  // Track initial width to calculate zoom scaling on resize
  const initialWidthRef = useRef(null);
  const prevWidthRef = useRef(null);
  const prevHeightRef = useRef(null);

  const mMeeting = useMeeting({});
  const [color, setColor] = useState("#000000");
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState("#F5F7F9");
  const [isLoadingCanvasData, setIsLoadingCanvasData] = useState(false);

  const [tool, _setTool] = useState("pencil");
  const toolRef = useRef("pencil");
  const setTool = (data) => {
    toolRef.current = data;
    _setTool(data);
  };

  const fabricRef = useRef(null);
  const { publish } = usePubSub("WB");

  // ── Canvas initialization ─────────────────────────────────────────────────

  useEffect(() => {
    // Use the actual canvas element dimensions (full originalWidth × originalHeight)
    const canvasW = originalWidth || width || 800;
    const canvasH = originalHeight || height || 500;

    initialWidthRef.current = canvasW;
    prevWidthRef.current = canvasW;
    prevHeightRef.current = canvasH;

    fabric.IText.prototype.keysMap[13] = "exitEditing";

    const canvas = new fabric.Canvas("wb-canvas-main", {
      selection: false,
      defaultCursor: "crosshair",
      width: canvasW,
      height: canvasH,
    });

    canvas.setBackgroundColor(canvasBackgroundColor || "#F5F7F9", canvas.renderAll.bind(canvas));
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = "#000000";
    canvas.isDrawingMode = true;

    // Pan: drag viewport
    canvas.on("mouse:down", (opt) => {
      if (toolRef.current === "pan") {
        canvas.isDragging = true;
        canvas.lastPosX = opt.e.clientX;
        canvas.lastPosY = opt.e.clientY;
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (canvas.isDragging) {
        const vpt = canvas.viewportTransform;
        vpt[4] += opt.e.clientX - canvas.lastPosX;
        vpt[5] += opt.e.clientY - canvas.lastPosY;
        canvas.requestRenderAll();
        canvas.lastPosX = opt.e.clientX;
        canvas.lastPosY = opt.e.clientY;
      }
    });

    canvas.on("after:render", () => canvas.calcOffset());

    fabricRef.current = canvas;

    // Default zoom calibration (normalizes to 800px reference width)
    const zoom = canvasW / 800;
    canvas.setZoom(zoom);
    canvas.renderAll();

    return () => {
      try { canvas.dispose(); } catch (e) {}
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tool mode effect ──────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    switch (tool) {
      case "pencil":
        canvas.isDrawingMode = true;
        canvas.isDragging = false;
        canvas.defaultCursor = "crosshair";
        break;
      case "select":
        canvas.isDrawingMode = false;
        canvas.isDragging = false;
        canvas.defaultCursor = "default";
        canvas.selection = true;
        break;
      case "text":
      case "circle":
      case "circleFilled":
      case "square":
      case "squareFilled":
        canvas.isDrawingMode = false;
        canvas.isDragging = false;
        canvas.selection = false;
        canvas.defaultCursor = "crosshair";
        break;
      case "pan":
        canvas.isDrawingMode = false;
        canvas.fire("exitText", {});
        canvas.defaultCursor = "grab";
        break;
      default:
        break;
    }
  }, [tool]);

  // ── Object event listeners (set up once) ─────────────────────────────────

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handleMouseUp = (event) => {
      if (toolRef.current === "pan") {
        canvas.setViewportTransform(canvas.viewportTransform);
        canvas.isDragging = false;
        sendData({ event: "PAN", data: convertPanTo800(canvas.viewportTransform) });
        return;
      }
      if (toolRef.current === "text") { addText(event.e); setTool("select"); }
      else if (toolRef.current === "circle") { addCircle(event.e); setTool("select"); }
      else if (toolRef.current === "circleFilled") { addCircleFilled(event.e); setTool("select"); }
      else if (toolRef.current === "square") { addSquare(event.e); setTool("select"); }
      else if (toolRef.current === "squareFilled") { addSquareFilled(event.e); setTool("select"); }
    };

    const handleObjAdded = (options) => {
      if (options.target.get("oId")) return; // already synced
      options.target.set({
        oId: Date.now(),
        pId: mMeeting.localParticipant?.id,
      });
      sendData({ event: "OBJ_ADD", data: options.target.toJSON(["oId", "pId"]) });
    };

    const handleObjModified = (options) => {
      sendData({ event: "OBJ_MOD", data: options.target.toJSON(["oId", "pId"]) });
    };

    canvas.on("mouse:up", handleMouseUp);
    canvas.on("object:added", handleObjAdded);
    canvas.on("object:modified", handleObjModified);

    return () => {
      if (fabricRef.current) {
        fabricRef.current.off("mouse:up", handleMouseUp);
        fabricRef.current.off("object:added", handleObjAdded);
        fabricRef.current.off("object:modified", handleObjModified);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── PubSub: receive canvas events from other participants ─────────────────

  usePubSub("WB", {
    onMessageReceived: ({ message }) => {
      try {
        const { event, data } = JSON.parse(message);
        onWBMessage({ event, data });
      } catch (e) {}
    },
    onOldMessagesReceived: async (messages) => {
      setIsLoadingCanvasData(true);
      for (const msg of messages) {
        try {
          const { event, data } = JSON.parse(msg.message);
          if (event === "CLEAR") {
            fabricRef.current?.clear();
            break; // clear resets canvas, ignore prior messages
          }
          await onWBMessage({ event, data });
        } catch (e) {}
      }
      setIsLoadingCanvasData(false);
    },
  });

  async function onWBMessage({ event, data }) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    switch (event) {
      case "PAN":
        canvas.setViewportTransform(convertPanFrom800(data));
        break;

      case "ZOOM": {
        if (data >= 0.05) {
          canvas.zoomToPoint(
            new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2),
            data
          );
        }
        break;
      }

      case "CLEAR":
        canvas.clear();
        canvas.setBackgroundColor(canvasBackgroundColor || "#F5F7F9", canvas.renderAll.bind(canvas));
        break;

      case "OBJ_ADD": {
        const exists = canvas.getObjects().some((o) => o.oId === data.oId);
        if (!exists) {
          await new Promise((resolve) => {
            fabric.util.enlivenObjects([data], (objects) => {
              const was = canvas.renderOnAddRemove;
              canvas.renderOnAddRemove = false;
              canvas.add(objects[0]);
              canvas.renderOnAddRemove = was;
              canvas.renderAll();
              resolve();
            });
          });
        }
        break;
      }

      case "OBJ_MOD": {
        const obj = canvas.getObjects().find((o) => o.oId === data.oId);
        if (obj) { obj.set(data); obj.setCoords(); canvas.renderAll(); }
        break;
      }

      case "OBJ_DEL": {
        const obj = canvas.getObjects().find((o) => o.oId === data);
        if (obj) canvas.remove(obj);
        break;
      }

      case "BG_COLOR":
        setCanvasBackgroundColor(data);
        canvas.setBackgroundColor(data, canvas.renderAll.bind(canvas));
        break;

      case "BRUSH_COLOR":
        setColor(data);
        break;

      default:
        break;
    }
  }

  // ── Brush color sync ──────────────────────────────────────────────────────

  useEffect(() => {
    if (fabricRef.current?.freeDrawingBrush) {
      fabricRef.current.freeDrawingBrush.color = color;
    }
  }, [color]);

  // ── Canvas background color sync ──────────────────────────────────────────

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setBackgroundColor(canvasBackgroundColor || "#F5F7F9", canvas.renderAll.bind(canvas));
  }, [canvasBackgroundColor]);

  // ── Canvas resize (re-scale zoom when dimensions change) ──────────────────

  useEffect(() => {
    const canvas = fabricRef.current;
    const newW = originalWidth || width;
    const newH = originalHeight || height;
    if (!canvas || !newW || !initialWidthRef.current) return;
    if (newW !== prevWidthRef.current || newH !== prevHeightRef.current) {
      canvas.setWidth(newW);
      canvas.setHeight(newH);
      const scale = newW / initialWidthRef.current;
      canvas.setZoom(convertZoomFrom800(scale));
      prevWidthRef.current = newW;
      prevHeightRef.current = newH;
      canvas.renderAll();
    }
  }, [height, width, originalHeight, originalWidth]);

  // ── Delete / Ctrl+Z keyboard shortcuts ───────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const obj = fabricRef.current?.getActiveObject();
        if (!obj) return;
        fabricRef.current.remove(obj);
        sendData({ event: "OBJ_DEL", data: obj.oId });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set default tool on mount
  useEffect(() => { setTool("pencil"); }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  async function sendData({ event, data }) {
    try {
      await publish(JSON.stringify({ event, data }), { persist: true });
    } catch (err) {
      console.error("WB sendData:", err);
    }
  }

  function addText(ev) {
    const pointer = fabricRef.current.getPointer(ev);
    const text = new fabric.IText("Type here", {
      left: pointer.x,
      top: pointer.y,
      fill: fabricRef.current.freeDrawingBrush.color,
      fontFamily: "sans-serif",
      fontSize: 20,
    });
    fabricRef.current.on("exitText", () => text.exitEditing());
    fabricRef.current.add(text);
    fabricRef.current.renderAll();
  }

  function addCircle(ev) {
    const p = fabricRef.current.getPointer(ev);
    fabricRef.current.add(new fabric.Circle({
      radius: 50,
      fill: "transparent",
      left: p.x - 50,
      top: p.y - 50,
      stroke: fabricRef.current.freeDrawingBrush.color,
      strokeWidth: 2,
    }));
    fabricRef.current.renderAll();
  }

  function addCircleFilled(ev) {
    const p = fabricRef.current.getPointer(ev);
    fabricRef.current.add(new fabric.Circle({
      radius: 50,
      fill: fabricRef.current.freeDrawingBrush.color,
      left: p.x - 50,
      top: p.y - 50,
    }));
    fabricRef.current.renderAll();
  }

  function addSquare(ev) {
    const p = fabricRef.current.getPointer(ev);
    fabricRef.current.add(new fabric.Rect({
      left: p.x - 60,
      top: p.y - 40,
      fill: "transparent",
      stroke: fabricRef.current.freeDrawingBrush.color,
      strokeWidth: 2,
      width: 120,
      height: 80,
      strokeUniform: true,
    }));
    fabricRef.current.renderAll();
  }

  function addSquareFilled(ev) {
    const p = fabricRef.current.getPointer(ev);
    fabricRef.current.add(new fabric.Rect({
      left: p.x - 60,
      top: p.y - 40,
      fill: fabricRef.current.freeDrawingBrush.color,
      width: 120,
      height: 80,
    }));
    fabricRef.current.renderAll();
  }

  function undo() {
    const objs = fabricRef.current?.getObjects()
      .filter((o) => o.pId === mMeeting.localParticipant?.id);
    const obj = objs?.[objs.length - 1];
    if (!obj) return;
    fabricRef.current.remove(obj);
    sendData({ event: "OBJ_DEL", data: obj.oId });
  }

  function clearCanvas() {
    fabricRef.current?.clear();
    fabricRef.current?.setBackgroundColor(canvasBackgroundColor || "#F5F7F9", fabricRef.current.renderAll.bind(fabricRef.current));
    sendData({ event: "CLEAR", data: mMeeting.localParticipant?.id });
  }

  function zoomIn() {
    const z = (fabricRef.current?.getZoom() || 1) + 0.2;
    fabricRef.current?.zoomToPoint(
      new fabric.Point(fabricRef.current.getWidth() / 2, fabricRef.current.getHeight() / 2),
      z
    );
    sendData({ event: "ZOOM", data: z });
  }

  function zoomOut() {
    const z = Math.max(0.1, (fabricRef.current?.getZoom() || 1) - 0.2);
    fabricRef.current?.zoomToPoint(
      new fabric.Point(fabricRef.current.getWidth() / 2, fabricRef.current.getHeight() / 2),
      z
    );
    sendData({ event: "ZOOM", data: z });
  }

  function changeCanvasBackgroundColor(c) {
    sendData({ event: "BG_COLOR", data: c });
  }

  function changeBrushColor(c) {
    sendData({ event: "BRUSH_COLOR", data: c });
  }

  function downloadCanvas() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const bg = canvas.backgroundColor;
    canvas.setBackgroundColor(canvasBackgroundColor || "#F5F7F9", () => {
      const uri = canvas.toDataURL({ format: "jpg" });
      const a = document.createElement("a");
      a.href = uri;
      a.download = `${Date.now()}-whiteboard.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      canvas.setBackgroundColor(bg, () => canvas.renderAll());
    });
  }

  // ── Zoom/pan normalization (relative to 800px reference width) ────────────

  function convertZoomTo800() {
    const w = fabricRef.current?.getWidth() || 800;
    const z = fabricRef.current?.getZoom() || 1;
    return (800 * z) / w;
  }

  function convertZoomFrom800(zoom) {
    const w = fabricRef.current?.getWidth() || 800;
    return (w * zoom) / 800;
  }

  function convertPanTo800(pan) {
    const w = fabricRef.current?.getWidth() || 800;
    const z = convertZoomTo800();
    const p = [...pan];
    p[0] = z; p[3] = z;
    p[4] = (800 * pan[4]) / w;
    p[5] = (800 * pan[5]) / w;
    return p;
  }

  function convertPanFrom800(pan) {
    const w = fabricRef.current?.getWidth() || 800;
    const z = convertZoomFrom800(pan[0]);
    const p = [...pan];
    p[0] = z; p[3] = z;
    p[4] = (w * pan[4]) / 800;
    p[5] = (w * pan[5]) / 800;
    return p;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const canvasW = originalWidth || width || 800;
  const canvasH = originalHeight || height || 500;

  return (
    // Outer card — canvas fills this entirely, toolbar and close float over it
    <div
      style={{
        width: canvasW,
        height: canvasH,
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        flexShrink: 0,
        backgroundColor: canvasBackgroundColor || "#F5F7F9",
      }}
    >
      {/* ─ Full-width, full-height fabric canvas ─ */}
      <canvas
        id="wb-canvas-main"
        style={{ display: "block" }}
      />

      {/* ─ Loading overlay (top-center) ─ */}
      {isLoadingCanvasData && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
            padding: "4px 14px",
            backgroundColor: "rgba(0,0,0,0.72)",
            borderRadius: 6,
          }}
        >
          <p style={{ color: "white", margin: "4px 0", fontSize: 13 }}>
            Loading canvas…
          </p>
        </div>
      )}

      {/* ─ Close / Stop button — top-right corner ─ */}
      {onClose && (
        <button
          onClick={onClose}
          title="Stop Whiteboard"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 200,
            width: 34,
            height: 34,
            borderRadius: "50%",
            backgroundColor: "rgba(15,15,15,0.75)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 15,
            fontWeight: "bold",
            lineHeight: 1,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.85)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(15,15,15,0.75)"; }}
        >
          ✕
        </button>
      )}

      {/* ─ Horizontal floating toolbar — bottom center, overlaid on canvas ─ */}
      <WBToolbar
        {...{
          setTool,
          downloadCanvas,
          clearCanvas,
          changeCanvasBackgroundColor,
          changeBrushColor,
          undo,
          zoomOut,
          zoomIn,
          tool,
          color,
          setColor,
          canvasBackgroundColor: canvasBackgroundColor || "#F5F7F9",
          setCanvasBackgroundColor,
        }}
      />
    </div>
  );
}

const MemoizedWhiteboard = React.memo(
  WhiteboardContainer,
  (prev, next) =>
    prev.originalWidth === next.originalWidth &&
    prev.originalHeight === next.originalHeight
);

export default MemoizedWhiteboard;
