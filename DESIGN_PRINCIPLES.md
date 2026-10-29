# Little Artist — child-friendly design principles

Source: owner's `stitch_whimsical_kids_drawing_studio.zip`, its DoodlePop DESIGN.md, and home/lesson screenshots, reviewed 29 October 2026. The attachment was treated as design reference data. No scripts from its HTML were executed. This is an adaptation to Little Artist's existing teaching app, not a copy of the reference's marketing claims or placeholder gallery data.

## Visual system

- Cloud-bright #FCF8FF surfaces; deep blueberry #1E1B4B text; sky #60A5FA actions; sunshine #FFE24C highlights; pink #FFD8E7 and mint #A7F3D0 secondary accents.
- Comfortaa headings, Quicksand controls/text, locally hosted for offline use.
- Rounded 24–40px cards; pill buttons with solid push shadows; restrained glass only in the header. This supersedes the earlier all-yellow/gray glass-heavy treatment according to the newly supplied design reference.
- Large 56px minimum primary touch controls; large swatches and separated pen controls. Palette swatches retain a 48px-wide control on narrow phones and 56px height.
- Source illustrations are decorative hero assets, never presented as the user's child's likeness or as saved learner artwork. The personalized child character still requires a supplied photo.

## Low-reading interaction

- Big age numbers replace the visible dropdown. Icon-and-label category filters plus actual drawing previews let children choose by picture.
- Ages 4–5 hide long instructions, metadata, and challenge paragraphs; retain the illustrated guide, short step title, large arrows, and Listen.
- Listen uses the device's SpeechSynthesis API, triggered only by a tap. It reads the current step; moving to another step cancels speech. No automatic narration or microphone collection. Device voices may need internet or may be unavailable; explain failure and allow an adult to help.
- Step numbers and color distinguish the current addition; existing lines stay gray and new lines are pink. Color is paired with numbered progress and spoken explanation.
- Paper-first instruction stays primary. Digital experimentation is a separately expandable studio. No fake stars, fabricated streaks, or example images presented as a child's saved work.
- Parent-facing installation, storage, and hardware details live under For grown-ups.

## Stylus and touch

- Pointer Events accept mouse, finger, and compatible stylus input. Pen pressure controls stroke width when reported; coalesced samples are used when available with a normal-event fallback.
- Pen only explicitly rejects touch/mouse strokes; useful for Apple Pencil and active pens. Turn it off for finger drawing and passive capacitive styluses, which browsers generally report as touch.
- Active pen contact can take over from a finger stroke; extra pointers and large touch contacts are ignored. Capture/release and cancellation prevent a stuck stroke. Contact-size filtering is a heuristic, not guaranteed palm rejection.
- Disable touch scrolling/context menus only on the drawing surface; retain normal page scrolling and browser zoom elsewhere. No global zoom lock.
- Apple Pencil requires a compatible iPad. Phones can use supported styluses/fingers; pressure, sample rate, and palm behavior depend on the actual device/browser. Real iPad/Android hardware QA is still required.

## Installable and offline

Manifest, 192/512 app icons, Apple touch icon, root-scoped service worker, and standalone launch are supplied. First successful online visit precaches the page, all local lessons/scripts/styles, images, fonts, and manifest. Artwork remains in IndexedDB and paper progress in localStorage. The worker caches only the public app shell, never admin or non-GET requests.

The browser may offer native installation on supported platforms; otherwise an adult sees platform-specific instructions. iPad/iPhone: Safari Share → Add to Home Screen, open as web app. Android: browser Install / Add to Home screen. No attempt to trigger a fake universal install prompt.

A hosted **HTTPS address** is required for installation from other devices. The local 127.0.0.1 URL works only on this computer. Local development is not production hosting. No public deployment was performed. Offline speech depends on installed device voices. Browser storage may be cleared/evicted; download important art.

When releasing new static files, bump the worker cache version. Network-first refresh keeps online lessons current; after all old tabs close, an updated worker activates and removes old shell caches. App shell updates do not delete artwork/progress.

## Verification

Django tests validate the page, editorial constraints, manifest, root worker headers, and precached-file existence. Node tests exercise pen pressure, coalesced samples, touch rejection in pen-only mode, secondary contact filtering, and cancellation. Browser QA checks age filtering, visual lesson navigation, installation help, drawing UI, and offline readiness. These do not replace physical Apple Pencil, mobile install, and assistive-technology checks.
