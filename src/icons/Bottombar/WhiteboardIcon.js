import * as React from "react";

// Presentation board with bar chart and stand legs — clearly distinct from VB
const WhiteboardIcon = (props) => {
  const c = props.fillcolor || props.color || "#fff";
  return (
    <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Board frame */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.25 2.25a.75.75 0 0 0 0 1.5H3v10.5a2.25 2.25 0 0 0 2.25 2.25H10l-.96 2.883a.75.75 0 1 0 1.423.474l.248-.747h2.578l.248.747a.75.75 0 1 0 1.423-.474L14 16.5h4.75A2.25 2.25 0 0 0 21 14.25V3.75h.75a.75.75 0 0 0 0-1.5H2.25ZM19.5 3.75v10.5a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V3.75h15Z"
        fill={c}
      />
      {/* Bar chart bars */}
      <path d="M14.25 6.75a.75.75 0 0 0-1.5 0v5.25a.75.75 0 0 0 1.5 0V6.75Z" fill={c} />
      <path d="M11.25 9a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0V9Z" fill={c} />
      <path d="M8.25 10.5a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z" fill={c} />
    </svg>
  );
};

export default WhiteboardIcon;
