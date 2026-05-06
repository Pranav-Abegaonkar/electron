# TYHO UI Redesign — Progress

## Figma File
`9QIa3GN18hxdmNVTEk9Ll0` (Video Call Therapy - Copy)

## Brand Tokens
| Token | Value |
|-------|-------|
| Primary lilac | `#888CC4` |
| Dark | `#1B1C27` |
| Light bg | `#F5F6FF` |
| Border | `#EEEEEE` |
| Input bg | `#F5F5F5` |
| Dark tile | `#252636` |
| Dark tile alt | `#2D2E40` |
| Font | Poppins |

## Screen Map & Status
| Node | Screen | Status | File(s) |
|------|--------|--------|---------|
| 2:2298 | Pre-Call Pop up (modal) | ✅ Done | `PreCallReminderModal.js` |
| 2:2406 | Waiting Room (base) | ✅ Done | `JoiningScreen.js` |
| 2:2523 | Video Room (main) | ✅ Done | `MeetingContainer.js`, `BottomBar.js` |
| 2:2598 | Poor Connection | ✅ Done | `NetworkQualityPopup.js` |
| 2:2816–3801 | Video Room variants | ✅ Done | `ParticipantView.js`, `SidebarContainer.js` |
| 2:3912–3966 | Share Screen dialogs | ✅ Done | `ConfirmBox.js`, `ParticipantLeftModal.js` |
| 2:2437 | Waiting Room - Virtual BG | 🚫 Skip | — |

## Files Changed
| File | Change |
|------|--------|
| `tailwind.config.js` | Added `poppins` font, `lilac` color palette |
| `src/index.css` | Added Poppins Google Font import |
| `src/components/screens/PreCallReminderModal.js` | **NEW** — Important Reminders modal |
| `src/components/screens/JoiningScreen.js` | UI redesign — all logic preserved |
| `src/components/screens/WaitingToJoinScreen.js` | Light bg, TYHO header, brand text |
| `src/components/MeetingDetailsScreen.js` | UI redesign — all logic preserved |
| `src/components/MicDropUp.js` | **NEW** — split mic/speaker drop-up; `openUpward` prop |
| `src/components/CamDropUp.js` | **NEW** — split cam drop-up; `openUpward` prop |
| `src/components/NetworkQualityPopup.js` | White card, brand colors, Heroicon |
| `src/components/ParticipantLeftModal.js` | White modal, rounded-2xl, font-poppins |
| `src/components/ConfirmBox.js` | White modal, brand button, font-poppins |
| `src/components/ParticipantView.js` | `bg-[#252636]` tile, `rounded-xl`, brand avatar |
| `src/components/sidebar/SidebarContainer.js` | `bg-[#1B1C27]`/`bg-[#252636]`, brand header |
| `src/components/sidebar/ChatPanel.js` | Dark brand chat bubbles, brand input |
| `src/components/sidebar/ParticipantPanel.js` | Brand avatar, dark list items |
| `src/meeting/MeetingContainer.js` | `bg-[#1B1C27]`, brand reconnecting overlay |
| `src/meeting/components/BottomBar.js` | Full redesign — `BarBtn`, `MicDropUp`/`CamDropUp` |
| `src/components/DropDown.js` | Truncate fix |
| `src/components/DropDownSpeaker.js` | Truncate fix |
| `src/components/DropDownCam.js` | Truncate fix |

## Rules (never break)
- Zero logic changes — only UI/CSS
- No new npm dependencies
- Poppins + lilac palette everywhere
- Skip virtual background screen (`2:2437`)
- **Responsive at all window sizes** — `clamp()` heights, `truncate`+`min-w-0` on labels, `shrink-0` on icons
- `MicDropUp`/`CamDropUp` reused in both JoiningScreen and BottomBar (via `openUpward` prop)

## Design System Summary
- **Light screens** (JoiningScreen, WaitingToJoin, modals): `bg-[#F5F6FF]`, white cards, `#1B1C27` text
- **Dark screens** (Video room): `bg-[#1B1C27]` outer, `bg-[#252636]` tiles/sidebar panels
- **BottomBar**: `bg-white border-t border-[#EEEEEE]` — bridges light/dark themes
- **Active state**: `bg-[#F5F6FF] border-[#888CC4]` icon → `#888CC4`
- **Mic/Cam off**: `bg-red-500` icon → white
