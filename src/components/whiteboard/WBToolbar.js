import React, { useEffect, useRef, useState } from "react";
import {
  CursorArrowRaysIcon,
  PencilIcon,
  HandRaisedIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

// ─── Inline SVG icons (no external dep) ──────────────────────────────────────

const TextIcon = ({ color = "#374151" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke={color} style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12M12 4v16M9 20h6" />
  </svg>
);

const CircleOutlineIcon = ({ color = "#374151" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke={color} style={{ width: 20, height: 20 }}>
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const CircleFilledIcon = ({ color = "#374151" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
    <circle cx="12" cy="12" r="9" fill={color} />
  </svg>
);

const RectOutlineIcon = ({ color = "#374151" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke={color} style={{ width: 20, height: 20 }}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
  </svg>
);

const RectFilledIcon = ({ color = "#374151" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
    <rect x="3" y="5" width="18" height="14" rx="2" fill={color} />
  </svg>
);

// ─── Reusable tool button ─────────────────────────────────────────────────────

const ToolBtn = ({ title, onClick, isSelected, children }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      width: 36,
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isSelected ? "#EEF2FF" : "transparent",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      flexShrink: 0,
      transition: "background 0.12s",
    }}
    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#F3F4F6"; }}
    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
  >
    {children}
  </button>
);

// ─── Vertical divider ─────────────────────────────────────────────────────────

const Divider = () => (
  <div style={{ width: 1, height: 24, backgroundColor: "#E5E7EB", flexShrink: 0, margin: "0 4px" }} />
);

// ─── WBToolbar — horizontal floating bar at bottom of canvas ─────────────────

const WBToolbar = ({
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
  canvasBackgroundColor,
  setCanvasBackgroundColor,
}) => {
  const ACCENT = "#4F46E5";
  const [shapesOpen, setShapesOpen] = useState(false);
  const shapesRef = useRef(null);

  const isShapeActive = ["circle", "circleFilled", "square", "squareFilled"].includes(tool);
  const iColor = (t) => (tool === t ? ACCENT : "#374151");

  // Close shapes popup when clicking anywhere outside it
  useEffect(() => {
    if (!shapesOpen) return;
    const handler = (e) => {
      if (shapesRef.current && !shapesRef.current.contains(e.target)) {
        setShapesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shapesOpen]);

  // Current shape icon to show on the button
  const ShapeIcon = () => {
    if (tool === "circle") return <CircleOutlineIcon color={ACCENT} />;
    if (tool === "circleFilled") return <CircleFilledIcon color={ACCENT} />;
    if (tool === "squareFilled") return <RectFilledIcon color={ACCENT} />;
    return <RectOutlineIcon color={isShapeActive ? ACCENT : "#374151"} />;
  };

  return (
    // Floating pill — absolute, bottom-center of the parent (canvas card)
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)",
        padding: "4px 10px",
        gap: 0,
        zIndex: 150,
        userSelect: "none",
      }}
    >
      {/* ── Drawing tools ── */}
      <ToolBtn title="Select" isSelected={tool === "select"} onClick={() => setTool("select")}>
        <CursorArrowRaysIcon style={{ width: 20, height: 20, color: iColor("select") }} />
      </ToolBtn>

      <ToolBtn title="Pencil" isSelected={tool === "pencil"} onClick={() => setTool("pencil")}>
        <PencilIcon style={{ width: 20, height: 20, color: iColor("pencil") }} />
      </ToolBtn>

      <ToolBtn title="Text" isSelected={tool === "text"} onClick={() => setTool("text")}>
        <TextIcon color={iColor("text")} />
      </ToolBtn>

      {/* Shapes — click-to-toggle popup above toolbar */}
      <div ref={shapesRef} style={{ position: "relative" }}>
        <ToolBtn
          title="Shapes"
          isSelected={isShapeActive || shapesOpen}
          onClick={() => setShapesOpen((o) => !o)}
        >
          <ShapeIcon />
        </ToolBtn>

        {shapesOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#ffffff",
              borderRadius: 10,
              boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
              padding: 8,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 4,
              zIndex: 300,
              minWidth: 88,
            }}
          >
            <ToolBtn
              title="Rectangle"
              isSelected={tool === "square"}
              onClick={() => { setTool("square"); setShapesOpen(false); }}
            >
              <RectOutlineIcon color={iColor("square")} />
            </ToolBtn>

            <ToolBtn
              title="Rectangle Filled"
              isSelected={tool === "squareFilled"}
              onClick={() => { setTool("squareFilled"); setShapesOpen(false); }}
            >
              <RectFilledIcon color={iColor("squareFilled")} />
            </ToolBtn>

            <ToolBtn
              title="Circle"
              isSelected={tool === "circle"}
              onClick={() => { setTool("circle"); setShapesOpen(false); }}
            >
              <CircleOutlineIcon color={iColor("circle")} />
            </ToolBtn>

            <ToolBtn
              title="Circle Filled"
              isSelected={tool === "circleFilled"}
              onClick={() => { setTool("circleFilled"); setShapesOpen(false); }}
            >
              <CircleFilledIcon color={iColor("circleFilled")} />
            </ToolBtn>
          </div>
        )}
      </div>

      <ToolBtn title="Pan / Move" isSelected={tool === "pan"} onClick={() => setTool("pan")}>
        <HandRaisedIcon style={{ width: 20, height: 20, color: iColor("pan") }} />
      </ToolBtn>

      <Divider />

      {/* ── Brush color ── */}
      <div
        title="Brush color"
        style={{ position: "relative", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            backgroundColor: color,
            border: "2px solid #E5E7EB",
            overflow: "hidden",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <input
            type="color"
            value={color}
            onChange={(e) => { setColor(e.target.value); changeBrushColor(e.target.value); }}
            style={{
              opacity: 0,
              position: "absolute",
              width: "200%",
              height: "200%",
              top: "-50%",
              left: "-50%",
              cursor: "pointer",
              border: "none",
              padding: 0,
            }}
          />
        </div>
      </div>

      {/* ── Canvas background color ── */}
      <div
        title="Canvas background"
        style={{ position: "relative", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            backgroundColor: canvasBackgroundColor,
            border: "2px solid #E5E7EB",
            overflow: "hidden",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <input
            type="color"
            value={canvasBackgroundColor}
            onChange={(e) => { setCanvasBackgroundColor(e.target.value); changeCanvasBackgroundColor(e.target.value); }}
            style={{
              opacity: 0,
              position: "absolute",
              width: "200%",
              height: "200%",
              top: "-50%",
              left: "-50%",
              cursor: "pointer",
              border: "none",
              padding: 0,
            }}
          />
        </div>
      </div>

      <Divider />

      {/* ── Zoom ── */}
      <ToolBtn title="Zoom In" isSelected={false} onClick={() => { setTool("pan"); zoomIn(); }}>
        <MagnifyingGlassPlusIcon style={{ width: 20, height: 20, color: "#374151" }} />
      </ToolBtn>

      <ToolBtn title="Zoom Out" isSelected={false} onClick={() => { setTool("pan"); zoomOut(); }}>
        <MagnifyingGlassMinusIcon style={{ width: 20, height: 20, color: "#374151" }} />
      </ToolBtn>

      <Divider />

      {/* ── Actions ── */}
      <ToolBtn title="Undo  Ctrl+Z" isSelected={false} onClick={undo}>
        <ArrowUturnLeftIcon style={{ width: 20, height: 20, color: "#374151" }} />
      </ToolBtn>

      <ToolBtn title="Clear whiteboard" isSelected={false} onClick={clearCanvas}>
        <TrashIcon style={{ width: 20, height: 20, color: "#EF4444" }} />
      </ToolBtn>

      <ToolBtn title="Save as image" isSelected={false} onClick={downloadCanvas}>
        <ArrowDownTrayIcon style={{ width: 20, height: 20, color: "#374151" }} />
      </ToolBtn>
    </div>
  );
};

export default WBToolbar;
