import type { SVGProps } from "react";

interface ChibiIconProps extends SVGProps<SVGSVGElement> {
  active?: boolean;
}

/** 🏠 บ้านจิบิคิ้วท์ๆ มีควันหัวใจลอย */
export function ChibiHomeIcon({ active, className = "size-6", ...props }: ChibiIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tiny heart smoke */}
      <path
        d="M23 7.5C23 6.4 23.9 5.5 25 5.5C25.6 5.5 26.1 5.7 26.5 6.1C26.9 5.7 27.4 5.5 28 5.5C29.1 5.5 30 6.4 30 7.5C30 9.2 27.7 10.8 26.5 11.5C25.3 10.8 23 9.2 23 7.5Z"
        fill={active ? "currentColor" : "#F472B6"}
        opacity={active ? 0.9 : 0.7}
      />
      {/* Roof - chubby & rounded */}
      <path
        d="M5 16.5L13.8 8.8C15.1 7.7 16.9 7.7 18.2 8.8L27 16.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chimney */}
      <path
        d="M22 12V8.5H25V14.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* House Body */}
      <rect
        x="7"
        y="15"
        width="18"
        height="12"
        rx="4"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.18 : 0}
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Cute Round Door */}
      <path
        d="M13 27V21.5C13 19.8 14.3 18.5 16 18.5C17.7 18.5 19 19.8 19 21.5V27"
        fill={active ? "currentColor" : "#FBBF24"}
        fillOpacity={active ? 0.8 : 0.6}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Cute door knob */}
      <circle cx="17.5" cy="22.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

/** 🔍 แว่นขยายจิบิมีประกายวิ้งๆ */
export function ChibiSearchIcon({ active, className = "size-6", ...props }: ChibiIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Big bubbly lens */}
      <circle
        cx="14"
        cy="14"
        r="9"
        fill={active ? "currentColor" : "#38BDF8"}
        fillOpacity={active ? 0.18 : 0.12}
        stroke="currentColor"
        strokeWidth="2.8"
      />
      {/* Chubby Handle */}
      <path
        d="M20.5 20.5L26.5 26.5"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Cute Twinkle Sparkle inside */}
      <path
        d="M14 9V11M14 17V19M9 14H11M17 14H19"
        stroke={active ? "currentColor" : "#F59E0B"}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="1.5" fill={active ? "currentColor" : "#F59E0B"} />
      {/* Lens reflection shine */}
      <path
        d="M10.5 10.5C11.5 9.5 13 8.8 14.5 8.8"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** ➕ ปุ่มโพสต์จิบิ ทรงบอลลูนนุ่มฟูมีดาววิ้ง */
export function ChibiPostIcon({ active, className = "size-6", ...props }: ChibiIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Cute bubbly pill/circle container */}
      <rect
        x="4"
        y="4"
        width="24"
        height="24"
        rx="12"
        fill="currentColor"
        fillOpacity={active ? 1 : 0.15}
      />
      {/* Cute chunky plus */}
      <path
        d="M16 10.5V21.5M10.5 16H21.5"
        stroke={active ? "#FFFFFF" : "currentColor"}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Tiny sparkle on top corner */}
      <path
        d="M23 7L24 9.5L26.5 10.5L24 11.5L23 14L22 11.5L19.5 10.5L22 9.5L23 7Z"
        fill="#FBBF24"
      />
    </svg>
  );
}

/** 💬 กล่องคำพูดจิบิหูแมวน่ารัก */
export function ChibiChatIcon({ active, className = "size-6", ...props }: ChibiIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Main bubbly chat bubble with tiny ears */}
      <path
        d="M6 14C6 8.8 10.3 5 16 5C21.7 5 26 8.8 26 14C26 19.2 21.7 23 16 23C14.2 23 12.6 22.5 11.2 21.7L6.5 23.5C5.9 23.7 5.3 23.2 5.5 22.6L6.5 18.2C6.2 16.9 6 15.5 6 14Z"
        fill={active ? "currentColor" : "#A7F3D0"}
        fillOpacity={active ? 0.2 : 0.25}
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* Cute happy eyes & mouth or 3 bouncy dots */}
      <circle cx="11.5" cy="14" r="1.6" fill="currentColor" />
      <circle cx="16" cy="14" r="1.6" fill="currentColor" />
      <circle cx="20.5" cy="14" r="1.6" fill="currentColor" />
      {/* Tiny blush on cheeks */}
      <ellipse cx="9.5" cy="16.5" rx="1.5" ry="0.8" fill="#F472B6" opacity={0.7} />
      <ellipse cx="22.5" cy="16.5" rx="1.5" ry="0.8" fill="#F472B6" opacity={0.7} />
    </svg>
  );
}

/** 👤 โปรไฟล์น้องหมีจิบิยิ้มแป้น */
export function ChibiProfileIcon({ active, className = "size-6", ...props }: ChibiIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Bear / Cat Ears */}
      <circle cx="10" cy="9.5" r="3.5" fill="currentColor" fillOpacity={active ? 0.35 : 0.2} stroke="currentColor" strokeWidth="2.2" />
      <circle cx="22" cy="9.5" r="3.5" fill="currentColor" fillOpacity={active ? 0.35 : 0.2} stroke="currentColor" strokeWidth="2.2" />
      {/* Head */}
      <circle
        cx="16"
        cy="15"
        r="7.5"
        fill={active ? "currentColor" : "#FED7AA"}
        fillOpacity={active ? 0.25 : 0.4}
        stroke="currentColor"
        strokeWidth="2.6"
      />
      {/* Cute eyes (arcs / happy curves) */}
      <path
        d="M13 14C13.3 13.3 14 13.3 14.3 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17.7 14C18 13.3 18.7 13.3 19 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Cute smile */}
      <path
        d="M14.8 17.5C15.5 18.3 16.5 18.3 17.2 17.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Cheeks blush */}
      <ellipse cx="12" cy="16" rx="1.2" ry="0.7" fill="#F43F5E" opacity={0.8} />
      <ellipse cx="20" cy="16" rx="1.2" ry="0.7" fill="#F43F5E" opacity={0.8} />
      {/* Chubby shoulders / body */}
      <path
        d="M8.5 28C8.5 24.5 11.5 22 16 22C20.5 22 23.5 24.5 23.5 28"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
