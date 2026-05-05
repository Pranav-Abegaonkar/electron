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
| Font | Poppins |

## Screen Map & Status
| Node | Screen | Status | File(s) |
|------|--------|--------|---------|
| 2:2298 | Pre-Call Pop up (modal) | ✅ Done | `PreCallReminderModal.js` |
| 2:2406 | Waiting Room (base) | ✅ Done | `JoiningScreen.js` |
| 2:2523 | Video Room (main) | ⬜ Next | `MeetingContainer.js`, `BottomBar.js` |
| 2:2598 | Poor Connection | ⬜ Todo | `NetworkStats.js`, `BottomBar.js` |
| 2:2816–3801 | Video Room variants | ⬜ Todo | same as above |
| 2:3912–3966 | Share Screen dialogs | ⬜ Todo | New component |
| 2:2437 | Waiting Room - Virtual BG | 🚫 Skip | — |

## Files Changed
| File | Change |
|------|--------|
| `tailwind.config.js` | Added `poppins` font, `lilac` color palette |
| `src/index.css` | Added Poppins Google Font import |
| `src/components/screens/PreCallReminderModal.js` | **NEW** — Important Reminders modal |
| `src/components/screens/JoiningScreen.js` | UI redesign — all logic preserved, `ButtonWithTooltip` moved outside component |
| `src/components/MeetingDetailsScreen.js` | UI redesign — all logic preserved |

## Rules (never break)
- Zero logic changes — only UI/CSS
- No new npm dependencies
- Poppins + lilac palette everywhere
- Skip virtual background screen (`2:2437`)
- **Responsive at all window sizes** — use `clamp()` for heights, `items-start` (not `items-center`) on flex wrappers, always `truncate` + `min-w-0` on device label spans, `shrink-0` on icons
- `ButtonWithTooltip` (now `MediaToggleButton`) lives outside the component — prevents re-creation on every render

## Next Session Checkpoint
1. Run `npm start` to preview in browser at `localhost:3000`
2. Check Pre-Call modal renders on load, dismisses correctly
3. Verify JoiningScreen layout on both mobile and desktop
4. Next Figma node to fetch: `2:2523` (Video Room main)
5. Files to redesign next: `MeetingContainer.js`, `BottomBar.js`
