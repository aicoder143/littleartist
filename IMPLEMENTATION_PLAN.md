# Little Artist — ART implementation plan

Updated for paper-first learning, ages 4–12. The final Product revision section records the implemented age-based lesson flow and supersedes historical digital-first milestone assumptions.

Prepared 29 October 2026. ART means **Actor, Requirements, Tasks**, as confirmed by the project owner.

## A — Actor

Act as a website designer and patient Python/Django mentor. Build a drawing and coloring web application with a welcoming creative studio. Explain each Django concept through a small, working example. Optimize for a beginner maintaining the application, children using touch screens, and adults supporting them.

Primary audience: children 4–12 learning to draw on physical paper. Use Explore (4–5), Build (6–8), and Develop (9–12) as flexible starting points without collecting birthdays. Older groups retain easier lessons and gain more complex choices. Adults will author lessons through Django admin when the catalog is connected.

## R — Requirements

### Product boundaries

1. Web application with both guided drawing lessons and coloring-book activities in the first release.
2. A free-draw studio supports independent practice and is shared with lessons.
3. Artwork and learner progress stay in the browser. No child accounts, uploads, cloud synchronization, public galleries, chat, or advertising in v1.
4. Django serves pages and, eventually, published lesson and coloring catalogs. SQLite stores editorial content only. Browser IndexedDB stores creative work.
5. Beginner stack: Django templates, plain CSS, plain JavaScript, Canvas 2D, and reviewed SVG assets. No React build pipeline, REST framework, task queue, or paid AI dependency is needed.
6. Brand: **Little Artist**, bright yellow and contrasting charcoal gray, with frosted glass surfaces. Maintain solid white drawing paper and opaque text/control backgrounds where translucency reduces readability.
7. Main character: a Pixar-inspired 3D illustration based on the owner's child's supplied photo; use a full character in the hero and a simplified head crop in the logo. Photo is still required. Current pencil illustration is a temporary decoration, not a depiction of the child. Do not include the original photograph in distributed source or collect visitor photos.
8. Local saving refers to artworks. A locally run Django server is delivered now; production hosting is a separate milestone.

### Reference review and scope decisions

Review date: 29 October 2026. These are README/documentation observations, not results of running upstream software.

**Splotch**: https://github.com/KyleMit/Splotch

Its current README describes a young-child drawing experience with large controls, a palette, pen/crayon/magic drawing, built-in coloring, and an offline-first PWA. Adopt the simple interaction philosophy and deliberate reset behavior. More elaborate brush textures and offline installation are later work. Its optional paid AI feature is excluded from local-only v1.

**coloring-book**: https://github.com/pflajsman/coloring-book

Its README documents pen and other tools, layered art, fill, undo/redo, local saving and PNG export, and stylus-focused behavior. Adopt the separation between editable paint and outlines, plus a local sketchbook. Advanced fill, pressure smoothing, and extended tools belong to later milestones. Guided instruction is new product work rather than assumed functionality inherited from either repository.

**Reuse decision:** implement fresh starter code and original cat, flower, and rocket artwork. Splotch is identified as MIT by GitHub; confirm its actual LICENSE at the exact commit before copying any files, retain copyright/license notices, and track modifications. No root LICENSE was found for coloring-book in this review; its package metadata does not supply a license. Treat its code as unavailable for copying until the owner grants permission or an applicable license is verified. A public repository is not sufficient permission. README statements about CC0 template sources are not a blanket license for every file. Audit each asset's provenance and permissions separately.

Before reuse, record repository URL, commit SHA, file paths, license, author, modifications, dependency licenses, and asset attribution in THIRD_PARTY_NOTICES.md. Do not copy upstream logos, brand names, or child photographs. Never execute repository automation merely to inspect features.

### Release feature priorities

**Core v1:** accessible mode navigation; freehand pen/eraser; brush size; palette/custom colors; bounded undo/redo; original coloring pages with tappable regions; progressive guided steps; local draft restoration; named saved works; reopen/delete; PNG download; replacement confirmation; useful storage errors; responsive mouse/touch/stylus input.

**v1 completion work after this starter:** database-backed content catalog, difficulty/category filters, more reviewed lessons, locally stored completion records, true cumulative lesson guides, tablet QA, automated browser regression tests, and privacy/help copy reviewed with parents.

**Later:** offline PWA shell and cached catalogs; command-based history; textured brushes; freehand fill in a Worker; shapes and stamps; drawing layer controls; editable project-file export/import. Keep cloud AI and sharing outside this scope unless explicitly requested later.

### Acceptance criteria

- A new visitor can begin drawing without registration or network calls to external services.
- A click creates a dot; dragging creates a continuous stroke; erasing leaves the background intact.
- A child can choose a lesson, read one short instruction, move forward/back, and keep their drawing.
- A coloring region accepts mouse click, Enter, and Space; its outline remains legible.
- Undo and redo restore both paint and region colors. A new action after undo discards redo history.
- A saved work reopens with its mode, selected page, lesson step, name, paint, and colors.
- Refresh restores the latest completed autosave. Explain that the last fraction of a second can be lost if the browser closes before autosave completes.
- PNG has an opaque white background and all visible artwork, excluding instructional guides and UI controls.
- Storage denial/quota failures do not claim success; PNG download remains available.
- Switching activities warns before replacing unsaved work. Delete has confirmation.
- No artwork payload is sent to Django. Verify this in browser network inspection before release.
- At 360px, 768px, and desktop widths, tools remain reachable without horizontal page overflow. Test portrait/landscape and 200% text zoom.

## T — Tasks

### 1. Architecture and data ownership

Browser → GET / → Django view → template + first-party CSS/JavaScript.

Pointer events → Canvas paint layer → undo snapshots → IndexedDB draft/saved works.

Color selection → trusted SVG region fill → IndexedDB → client-side PNG composition.

Adult author → Django admin → SQLite editorial tables → published catalog (planned connection).

The browser currently receives three built-in lesson definitions from app.js. The models and admin are present but are deliberately not advertised as powering the studio yet. The next content milestone connects these models to rendered catalog JSON. Django's admin authentication belongs to adult content management; it does not create learner accounts.

Keep stroke rendering in JavaScript: Python cannot handle each pointer event without network latency. Use Django for publishing content, routes, validation, and administration.

### 2. Database models

Implemented in studio/models.py and initial migration:

- **Lesson**: unique slug, title (120 chars), difficulty choice, description, published flag. One lesson has many steps.
- **LessonStep**: lesson foreign key (cascade), nonnegative order, short instruction (240 chars), reviewed guide_asset path. Unique (lesson, order), ordered ascending.
- **ColoringPage**: unique slug, title, category, asset_path, source_url, license_name, attribution, published flag.

Before the catalog milestone, add title/slug validation, positive order validation, asset-path allowlisting, and safe publish checks requiring provenance and valid guides. Store reusable local paths, not arbitrary inline SVG submitted by visitors. Add optional thumbnail_path and estimated_minutes when content needs them. Avoid speculative tables for children, parents, subscriptions, or artwork.

For larger catalogs, add indexes supporting published/difficulty and published/category filters after measuring query needs. SQLite is adequate for the beginner editorial workload. Move to PostgreSQL only if operational needs justify it.

**Browser schema (implemented):** IndexedDB database `little-lines`, version 1; object store `artworks`, keyPath `id`. The technical key remains stable through the rename to preserve local drafts.

Each record contains id (`draft` or UUID), updated timestamp, versioned state, and preview for saved works. State contains mode, subject, step, artwork name, transparent paint PNG data URL, and ordered region colors. Never save raw child photographs here. Future content IDs must be stable and versioned; region IDs should replace array positions before editing live templates.

**Planned browser schema:** v2 adds a `progress` store keyed by lesson slug and a `preferences` store. Progress records contain completed step IDs and optional completion time, no identifying information. Upgrade in onupgradeneeded without deleting existing records. Preserve unknown-version records and give an export/recovery route rather than silently wiping them.

Storage is browser/profile/origin specific. Clearing site data, private mode expiry, eviction, or changing host/port can remove access. A second device will not see the same sketchbook. PNG is a durable visual copy, not an editable project backup. Future project export/import should validate schema and bound file size.

### 3. UI specification

Use yellow #FFDC35 for selected mode and key save action, charcoal #292D34 for readable text, gray #565B64 for supporting text, and translucent white panels over a soft yellow/gray background. Use backdrop-filter with an opaque fallback for unsupported browsers. The canvas remains white. Avoid yellow text on white.

Header: character head logo + Little Artist wordmark; sketchbook action and count. Hero: short encouraging headline and child character holding art materials. Main navigation: Free draw, Learn to draw, Coloring book. Desktop: choices/instructions left, studio right. Phone: choices above studio, palette and actions wrap below.

Use labeled tools rather than relying on icons alone. Target 44px controls; status messages use aria-live. Show selected state with shape/border/text, not color alone. Keyboard users can color SVG regions and navigate all controls. Freehand drawing still needs a pointer; do not claim the drawing canvas is fully keyboard accessible. Offer coloring activities as a useful alternate creative mode.

5–7: large shapes, few instructions, no time pressure. 8–11: shape construction, animals, objects, short pattern challenges. 12–15+: proportion, perspective, shading, composition. Use encouraging feedback without ranking children's work or claiming machine-graded artistic skill.

Content selection, loading, saving, saved, storage-error, unavailable-image, empty-sketchbook, and replacement-confirmation states must have plain explanations. Avoid hiding critical controls behind hover. The current responsive layout needs physical-device testing before a child-facing release.

Character task after photo: generate a friendly, recognizable 3D animated-film portrait with yellow artist clothing, charcoal accents, art materials, and a transparent background. Preserve the child's visible facial features and hair; no invented likeness. Review full-body hero and face crop at 40px before using the character logo. Include descriptive alt text for a meaningful hero and empty alt text for a duplicate decorative logo portrait.

### 4. Canvas and coloring implementation

Use fixed 800×560 drawing coordinates and scale pointer positions from the displayed bounding rectangle. Preserve canvas bitmap dimensions through layout changes. Capture the active pointer, ignore secondary pointers, and close strokes on pointerup/pointercancel. Full pressure, palm rejection, and coalesced-event smoothing are planned enhancements and need real stylus testing.

The starter stores at most 20 undo snapshots to bound growth. This is simple to understand but memory-heavy; about 1.8MB raw pixels per 800×560 canvas before encoding, and each image/decoding adds overhead. Measure on low-memory tablets. In later work use stroke commands with periodic bitmap checkpoints and an explicit memory budget.

Coloring uses trusted closed SVG shapes. Tapping a region changes its fill; it is not general flood fill of user strokes. Region intersections and overlaps need intentional authoring. Draw outlines above fills. Freehand-on-top coloring, layer toggles, and magic reveal are not present in the starter.

If implementing bitmap fill later, combine paint + boundary masks, run scanline fill in a Web Worker, include tolerance controls and anti-alias edge tests, apply the result to the paint layer, and preserve outlines separately. Bound work to canvas dimensions and cancel stale Worker jobs. Test open boundaries, thin lines, repeated fill, zoomed display, transparent areas, and identical source/target colors.

### 5. Django catalog integration (next code task)

1. Add original guide/thumbnail assets under studio/static/studio/content/.
2. Create seed fixtures or an idempotent seed_demo management command.
3. Query only published lessons with prefetch_related('steps').
4. Pass explicit dictionaries to the template, using Django json_script for safe serialization.
5. Read those JSON payloads in app.js; do not interpolate HTML from untrusted content.
6. Render instructions with textContent and resolve only allowlisted first-party asset paths.
7. Add catalog tests proving unpublished content stays hidden and ordered steps remain stable.

Example view expansion:

```python
from django.shortcuts import render
from .models import Lesson

def home(request):
    lessons = Lesson.objects.filter(published=True).prefetch_related('steps')
    catalog = [
        {'id': lesson.slug, 'title': lesson.title,
         'difficulty': lesson.difficulty,
         'steps': [{'order': step.order, 'instruction': step.instruction,
                    'guide': step.guide_asset} for step in lesson.steps.all()]}
        for lesson in lessons
    ]
    return render(request, 'studio/index.html', {'catalog': catalog})
```

Template: `{{ catalog|json_script:"lesson-catalog" }}`. Browser: `JSON.parse(document.getElementById('lesson-catalog').textContent)`. This is planned expansion, not currently active code.

### 6. Milestones and effort

Estimates assume one beginner working 8–10 hours per week. Total approximately 8–12 weeks; adjust after the first vertical slice. Content review and device access affect duration.

**M0 — Brief and visual direction, 2–4 hours.** Confirm ART, local-only scope, brand, and character photo. Done except photo/character. Exit: an agreed visual direction and explicitly scoped feature set.

**M1 — Django foundations, 6–10 hours.** Virtual environment, settings, route, template, static files, models, migration, admin. Starter delivered. Exit: clean install runs migrate/check/tests and returns studio HTML.

**M2 — Creative vertical slice, 12–18 hours.** Pen, eraser, palette, sizing, pointer capture, undo/redo, one original coloring page. Starter implements these with snapshot history and region coloring. Exit: usable end-to-end drawing, correction, and download on desktop and tablet.

**M3 — Lessons and catalog, 12–18 hours.** Three starter four-step lessons are supplied; author accurate progressive guides, add difficulty choices, connect editorial models, and seed content. Exit: an adult publishes a lesson and it appears correctly without editing JavaScript.

**M4 — Reliable local sketchbook, 10–16 hours.** Drafts, save/open/delete and PNG exist. Add completion records, stable region IDs, storage migration, large-library pagination, and editable project export. Exit: refresh, quota failure, and backward-compatible restore tests pass.

**M5 — Character and accessibility, 8–14 hours.** Replace provisional artwork with approved child character/logo, add opaque glass fallback, review contrast and 200% zoom, test keyboard coloring and low-end touch devices with adult supervision. Exit: brand approved and no task-blocking accessibility defects.

**M6 — Release and optional offline install, 12–20 hours.** Automated browser tests, deployment settings, security/static checks, and parent help. PWA only if explicitly included after the basic web release; cache app shell and content, test upgrades and offline navigation. Exit: documented release checklist and reproducible setup.

### 7. Validation strategy

Implemented automated checks: home renders core studio, POST to home is rejected, lesson ordering is correct, duplicate step order is rejected. JavaScript syntax checked with Node. Keep tests focused on behavior, not CSS implementation.

Browser checklist: draw a dot/line; erase; undo/redo; change color/width; switch modes and cancel/confirm; advance lesson without losing paint; fill several regions using keyboard/mouse; save and open; refresh restore; export PNG and visually compare; simulate blocked/full storage; test large saved libraries; ensure no external artwork requests. Add automated browser coverage for these flows in M6, with an isolated browser profile to avoid touching real artwork.

For touch/stylus: pointer capture outside canvas, interrupted gestures, second finger while drawing, rotated screen, page scroll outside drawing area, tiny regions, and actual palm contact. No claim of reliable palm rejection until measured on devices.

### 8. Deployment and privacy boundary

The delivered server is for local development. Before public hosting: set DEBUG=0, a strong environment-only secret, exact allowed hosts, HTTPS, secure adult-admin cookies, CSRF origins as needed, collectstatic, production WSGI hosting, backups for editorial content, and restrictive admin access. Use Django's deployment checklist and run check --deploy against production settings. Do not expose the development server publicly.

Browser-local artwork does not mean an internet host sees no traffic: page requests and ordinary server logs may still exist. Keep server logging minimal and omit drawing payloads. No analytics or external fonts are included. Validate applicable children's privacy requirements if adding accounts, analytics, photo upload, or cloud AI later; current scope deliberately avoids those features.

### 9. Delivered starter and honest limitations

Working source includes Django project, initial migration, editorial models/admin, responsive studio, original coloring art, three guided activities, pen/eraser, sizing, colors, 20-step history, browser drafts, sketchbook, reopen/delete, and PNG export.

Not yet complete: child portrait/logo (photo needed), database-driven lesson rendering, difficulty filters, completion tracking, full offline installation, stylus pressure/palm rejection, texture tools, bitmap flood fill, editable project backup, and production deployment. Catalog records can be edited in admin but do not yet change the built-in studio catalog. This is a runnable starter, not a tested production release.

## Reusable ART development prompt

**Actor:** You are a patient Django mentor and children's web product designer implementing Little Artist for a beginner developer.

**Requirements:** Web; ages 5–15 as the main audience and welcoming to all ages; drawing lessons plus coloring in v1; browser-local artwork only; Django templates and SQLite for editorial content; Canvas/SVG and IndexedDB in the browser; yellow/gray glassmorphism; approved child character in hero/logo; no child accounts, uploads, ads, or external AI calls. Use original assets or verified licensed assets with notices. Preserve existing artwork on upgrades. State limitations honestly.

**Tasks:** Implement one milestone at a time. Explain the user-visible behavior, write the smallest understandable change, include migrations when models change, run relevant Django and browser checks, and document setup. Report what works, what was tested, and what remains. Begin with M3: connect the published editorial catalog to the existing studio without moving artwork storage to the server.

## Sources

- Splotch repository and current feature description: https://github.com/KyleMit/Splotch
- Splotch license file for per-commit verification: https://github.com/KyleMit/Splotch/blob/main/LICENSE
- Coloring-book repository and feature description: https://github.com/pflajsman/coloring-book
- Coloring-book package metadata reviewed: https://github.com/pflajsman/coloring-book/blob/main/package.json
- Django 5.2 documentation and beginner tutorials: https://docs.djangoproject.com/en/5.2/
- Django deployment checklist: https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

## Product revision — paper-first learning, ages 4–12

This revision supersedes the earlier 5–15/all-ages audience and digital-studio-first UI. The primary task is now watching a demonstration and practicing on physical paper. Digital drawing/coloring remain optional and collapsed by default.

Actor: a patient drawing teacher for children aged 4–12, supported by a beginner Django maintainer.

Requirements: explicit age selection without birthdays or child accounts; one illustrated instruction at a time; no automatic step advance or timer; increasing challenge and broader subject choice; paper, pencil, and eraser as the core materials; local progress only. Age is an instructional suggestion, never an ability assessment. A child may explore another level freely.

Tasks delivered: lessons.js contains 12 original step-by-step lessons. Ages 4–5 see sun, fish, house, and flower (four steps each). Ages 6–8 retain these and gain cat, rocket, butterfly, and tree (five steps each). Ages 9–12 retain all eight and gain landscape, perspective box, owl, and perspective street (five or six steps). Difficulty increases by band rather than introducing arbitrary changes on every birthday. Existing lines are gray; the current addition uses dark gold for visibility. Each step includes an instruction, a self-paced Next action, and a final independent paper challenge.

Progress: localStorage key little-artist-paper-progress stores lesson IDs, last visited step, and self-reported completion. No age selection is persisted or transmitted. Completion means the child pressed “I finished on paper”; the app does not inspect the paper or assess drawing quality. Revisiting resumes the last visited step; Previous allows reviewing all earlier steps. Storage failure shows an explanatory message.

Next implementation milestone: migrate this teaching catalog into Lesson/LessonStep editorial data, add reviewed min_age and max_age/level fields, expose only published content, and replace hardcoded SVG snippets with reviewed first-party guide assets. Keep progress browser-local and preserve stable lesson IDs. Test with children and adults to refine instructions; practice suggested ages are not validated educational standards.

Acceptance additions: age 4 yields four choices, age 6 eight, age 9 twelve; no lesson timer; Next adds only the next step illustration; Previous hides future lines; completion survives reopening in the same browser; no paper photograph upload is required. Verify touch/keyboard navigation and that optional digital art remains intact when switching lessons.

## Catalog expansion — categories and gradual challenge

The initial expansion brought the paper-first catalog to 25 lessons. The current 63-lesson catalog and its updated age/category counts are documented in the Character-catalog expansion below. At that stage five subject filters covered Animals, Landscapes, Fruits, Nature, and Objects & transport.

Added subjects: apple, pear, cherries, fruit-bowl still life, snail, turtle, penguin, fox, rolling hills, beach, waterfall, kite, sailboat. Difficulty progresses from simple outlines to patterns, overlapping forms, contour, movement, perspective, and tonal shading. Each added subject has original cumulative vector illustrations and 4–6 paper-practice steps. Categories organize paper lessons; the optional digital coloring catalog is unchanged.

For the database-content milestone, add category and recommended_min_age to Lesson, migrate/seed stable IDs, and expose the same filtering through the published catalog. Add intermediate subjects before increasing complexity sharply; review instructions and demonstrations with a drawing teacher and children before release. Age bands remain flexible suggestions.

## Current implementation — Stitch-inspired, low-reading, installable web app

This is the authoritative current design revision. See DESIGN_PRINCIPLES.md for the full design rationale and README.md for current setup and limitations. It supersedes earlier statements that offline installation, pressure input, or a low-reading interface are only planned.

**Actor:** children's drawing teacher, accessible interaction designer, and beginner Django mentor.

**Requirements:** preserve the 63 paper-first lessons and age/category selection; apply the supplied ZIP's pastel tactile design; support pre-readers through pictures, number choices, short labels, and optional spoken instructions; offer touch and pressure-aware compatible stylus input in the optional screen studio; supply installable/offline PWA support while retaining browser-local saving.

**Tasks implemented:** local Comfortaa/Quicksand fonts and Material Symbols; source decorative images; large number age buttons; low-reading screens at ages 4–5; device speech control with cancellation and error messaging; isolated lesson focus mode; 56px primary controls; updated drawing input with pen pressure, coalesced samples/fallback, pointer capture cleanup, explicit pen-only control, and touch-contact filtering; root manifest/worker, standalone icons and Apple metadata, offline app-shell precache, platform-specific installation guidance, and focused verification.

**Remaining release tasks:** host Django over HTTPS before phone/tablet installation; physically validate Apple Pencil and active/passive styluses; test actual iOS/Android Home Screen installation and storage behavior; connect the teaching catalog to editorial models; assess the design with children and caregivers; provide the owner's child photo before creating the personalized character/logo; confirm reference illustration rights or commission replacements before public distribution. Current release does not offer guaranteed palm rejection, universal pressure support, or guaranteed offline voice availability.

Verification: seven Django tests passed; Node input-behavior tests passed; browser confirmed that the page and a lesson reopened with the local Django server stopped. Source-reference and rendered-design comparisons informed fixes for lesson focus, heading font specificity, and compact young-reader controls.


## Character and shape-catalog expansion — 33 character guides and five shape lessons

Construction marks can be erased from paper after a clean final outline is traced; the digital lesson also removes marked head or geometric construction lines in the last frame.

The current catalog contains **63 original paper-practice lessons**. The 33 new character tutorials are grouped under Characters, Indian cartoons, Japanese cartoons, and Mythology; each group has an age-count badge and works with the existing age and difficulty filters. The Explore, Build, and Develop levels now contain 19, 24, and 20 lessons respectively. Character guides include Chota Bheem, Chutki, Raju, Doraemon, several Pokémon characters, Ram, Krishna, Shiva, Ganesha, and others.

Each tutorial uses first-party SVG line art assembled one step at a time. Children practice on paper, with a light construction outline, refined silhouette, body, face, signature accessory, and final cleanup step revealed over six steps. The final lesson view hides the marked construction guide while keeping the retraced head outline. On paper, children are taught to darken the lines they want to keep and gently erase light marks that overlap finished features. No third-party character image files were copied into the site. Five shape lessons add circle/oval, triangle, rectangle, cube, and cuboid practice across the age tiers; their challenges connect basic forms with character drawing, buildings, and still life. The character catalog has a focused Node check for minimum count, stable unique IDs, three age tiers, group membership, requested examples, cleanup flags, and shape coverage.

Verification additions: `node tests/character-lessons.cjs`; static Pages output includes the versioned character script; the service worker precaches the updated library.
