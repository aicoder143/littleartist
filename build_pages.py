"""Render Little Artist's Django pages as static files for GitHub Pages."""

from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path

import django
from django.test import Client


ROOT = Path(__file__).resolve().parent


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "_site")
    parser.add_argument("--base-path", default="/littleartist/")
    args = parser.parse_args()
    base = "/" + args.base_path.strip("/") + "/"

    import os

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()

    output = args.output.resolve()
    if output == ROOT or (ROOT in output.parents and output != ROOT / "_site"):
        raise SystemExit("Choose the default _site folder or a build folder outside the Django source tree.")
    if output.exists():
        shutil.rmtree(output)
    (output / "about").mkdir(parents=True)
    (output / "our-story").mkdir(parents=True)

    client = Client()
    for route, destination in (
        ("/", output / "index.html"),
        ("/about/", output / "about" / "index.html"),
        ("/our-story/", output / "our-story" / "index.html"),
    ):
        response = client.get(route)
        if response.status_code != 200:
            raise SystemExit(f"Could not render {route}: HTTP {response.status_code}")
        html = response.content.decode("utf-8")
        # GitHub Pages has no Django auth or artwork API; it remains guest-only.
        if route == "/":
            html = re.sub(r'<div class="account-control">.*?</div>', "", html, count=1, flags=re.S)
        html = re.sub(
            r"((?:href|src)=[\"'])/(?!/)",
            lambda match: match.group(1) + base,
            html,
        )
        destination.write_text(html, encoding="utf-8")

    static_source = ROOT / "studio" / "static" / "studio"
    shutil.copytree(static_source, output / "static" / "studio")
    device_script = output / "static" / "studio" / "device.js"
    device_script.write_text(
        device_script.read_text(encoding="utf-8").replace(
            "register('/service-worker.js')", f"register('{base}service-worker.js')"
        ),
        encoding="utf-8",
    )

    manifest_response = client.get("/manifest.webmanifest")
    manifest = json.loads(manifest_response.content)
    manifest.update({"id": base, "start_url": base, "scope": base})
    for icon in manifest.get("icons", []):
        icon["src"] = base + icon["src"].lstrip("/")
    (output / "manifest.webmanifest").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    shutil.copyfile(static_source / "service-worker.js", output / "service-worker.js")
    (output / ".nojekyll").touch()
    print(f"Built static Pages site at {output} with base path {base}")


if __name__ == "__main__":
    main()
