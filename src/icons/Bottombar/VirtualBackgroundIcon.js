import * as React from "react";

const VirtualBackgroundIcon = (props) => (
    <svg
        width={24}
        height={24}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        {/* Monitor / screen frame */}
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2 4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2 0h16v13H4V4Z"
            fill={props.fillcolor}
        />
        {/* Stand stem */}
        <path
            d="M10.5 19h3v2h-3v-2Z"
            fill={props.fillcolor}
        />
        {/* Base */}
        <path
            d="M7.5 21a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H8a.5.5 0 0 1-.5-.5Z"
            fill={props.fillcolor}
        />
        {/* Background image landscape — sky */}
        <path
            d="M4 4h16v8H4V4Z"
            fill={props.fillcolor}
            opacity={0.15}
        />
        {/* Sun */}
        <circle cx="16" cy="7.5" r="1.5" fill={props.fillcolor} opacity={0.7} />
        {/* Hills */}
        <path
            d="M4 12c2-3 4-3 6 0h10v5H4v-5Z"
            fill={props.fillcolor}
            opacity={0.35}
        />
        {/* Person silhouette - head */}
        <circle cx="10" cy="8" r="1.5" fill={props.fillcolor} />
        {/* Person silhouette - body */}
        <path
            d="M7.5 13c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5H7.5Z"
            fill={props.fillcolor}
        />
    </svg>
);

export default VirtualBackgroundIcon;