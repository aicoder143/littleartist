# Little Artist

A Django drawing teacher for ages 4–12: watch an illustrated step, then practice on paper. Includes 63 categorized lessons, including 33 character drawing guides (with 10 advanced mythology drawing and coloring lessons) and five shape/form lessons, age-recommended Explore/Build/Develop levels, a low-reading mode for ages 4–5, tap-to-hear instructions, an optional screen drawing/coloring studio, a local-only About Me artist card, and optional guardian-created accounts with private online sketchbooks.

The current design follows the owner's Stitch ZIP: Comfortaa/Quicksand type, pastel cloud cards, chunky touch controls, visual choices, and simple lesson navigation. See [design principles](DESIGN_PRINCIPLES.md), [ART implementation plan](IMPLEMENTATION_PLAN.md), and [design QA](design-qa.md).

## Run locally

Python 3.10+:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Windows activation: `.venv\Scripts\activate`. Open http://127.0.0.1:8000/ and keep the terminal running. Stop with Ctrl+C.

## GitHub Pages

The live static site is [aicoder143.github.io/littleartist](https://aicoder143.github.io/littleartist/). GitHub Actions renders the Django templates and deploys the static output on pushes to `main`; GitHub Pages does not run the Django server or admin. To build the same project-site output locally, run `python build_pages.py --output _site --base-path /littleartist/`.

For the Django server deployment on `littleartist.in`, see [the Ubuntu/Nginx setup guide](ops/server-setup.md). The root installer configures Gunicorn, systemd, static files, Nginx, and HTTPS. The GitHub Pages build is static and guest-only; accounts and online sketchbooks work on the Django-hosted site.

## Learn and practice

Choose an age to see the recommended level: Explore (ages 4–5, 18 lessons), Build (ages 6–8, 21 lessons), or Develop (ages 9–12, 24 lessons). Older groups can choose an earlier level for practice. Category filters include Indian cartoons, Japanese cartoons, mythology, shapes and forms, animals, landscapes, fruit, nature, and objects; lesson cards follow the selected level. Character and shape lessons finish with a cleanup step that hides light construction marks while keeping the traced outline. Ten separate advanced mythology lessons build a portrait, costume and symbols, then guide paper coloring in two stages with a finished full-body color reference. The original reference art is stored as lossless WebP to retain its painted details. Screen-studio subjects remain a separate, smaller set. Completion is self-reported; no camera or automatic assessment is used. The About Me artist card is optional and saved only in the browser.

For ages 4–5, long instructions are hidden. Tap Listen for the complete instruction using the device voice. If voice is unavailable, ask a grown-up for help; offline narration depends on the device's installed voices.

Draw on screen opens the optional studio. Pen/eraser, colors, size, undo/redo, named saves, reopen/delete, and PNG export are available. Guests can use the full site and keep drawings in that browser. A parent or guardian can create a username/password account to save drawings privately across devices. Account drawings are lossless PNG files, limited to 30 per account; the gallery supports download and delete. No email or child profile is collected, so password recovery is not available; guardians should keep credentials safe. Back up both `/var/lib/littleartist/db.sqlite3` and `/var/lib/littleartist/private-artworks/` together. Compatible active pens use reported pressure. Pen only ignores touch/mouse in drawing modes; turn it off for finger drawing and passive touch styluses. Coloring is tap-to-fill and does not use pen pressure. Apple Pencil needs a compatible iPad; other pens depend on browser/hardware support. Real hardware QA remains required.

## Install and use offline

Manifest, icons, Apple touch metadata, and service worker are implemented. Visit online once and wait for “Lessons are ready offline” under For grown-ups. Public lessons, scripts, fonts, and images are precached. Then the guest app shell can reopen without the server/network. Guest artwork stays in IndexedDB and lesson progress in localStorage; account sketchbooks need a connection to sync. Download important artwork: browser data can be cleared or evicted.

On iPad/iPhone use Safari → Share → Add to Home Screen, with web-app mode enabled where offered. On Android use the browser's Install / Add to Home screen option, or the install button when the browser offers installation.

**Installation on another device needs a hosted HTTPS address.** This local computer's 127.0.0.1 address cannot be used on an iPad/phone. Use the hosted GitHub Pages address above. Physical iPad/stylus installation and hardware QA have not been performed.

Before shipping static changes, bump the service-worker cache version. New workers activate once older app tabs close; app-shell updates preserve creative work and progress. Admin and non-GET requests are never cached.

## Verify

```sh
python manage.py check
python manage.py test studio
node tests/pen-input.cjs
node tests/character-lessons.cjs
```

Django tests cover page behavior, editorial constraints, manifest/worker configuration, About Me, guest access, guardian account creation, private artwork ownership, PNG downloads/deletion, and the 30-artwork limit. Node tests cover pen pressure, coalesced-event fallback, pen-only filtering, large/secondary touch rejection, cancellation, and the 33-character lesson catalog, including advanced mythology color stages. Browser checks include age/category selection, lesson progression, installation guidance, and opening cached lessons with the server stopped. Physical iPad/stylus testing remains outstanding.

## Content and administration

Create an adult admin with `python manage.py createsuperuser`, then visit /admin/. Editorial models exist, but the live teaching catalog is still in `studio/static/studio/lessons.js`; admin changes do not yet alter those 63 lessons. Migrating the catalog into published Django records is the next content-management milestone.

Personalized child character/logo remains pending a supplied photo. Current decorative source illustrations do not depict the user's child. See THIRD_PARTY_NOTICES.md for source asset provenance and bundled font licenses.
