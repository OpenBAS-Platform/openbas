#!/usr/bin/env python3
"""Check that every ADR file has a valid name and its own number.

Two ADRs merged in parallel can pick the same "next free" number, because each branch only sees
`main` as it was when the branch started.

For every Markdown file in `adr/` it checks three things:

1. The file name is `ADR-NNN-lowercase-kebab-case.md`: an uppercase prefix, three digits, then a
   lowercase description, for example `ADR-009-marking-based-access-control.md`.
2. No other ADR file uses the same number.
3. The first line is the title `# ADR-NNN: ...`, with the same number as the file name. The
   template, `ADR-000`, keeps its `ADR-XXX` placeholder.

On a pull request the runner checks out the PR merged into `main`, so an ADR merged on `main` after
the branch was cut is part of the check too.

Run it with no arguments from the repository root.
"""

from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
ADR_DIR = REPO / "adr"

# The number is read on its own, so a badly named file still counts in the duplicate check.
NUMBER = re.compile(r"^ADR-(?P<number>\d{3})-")
FILE_NAME = re.compile(r"^ADR-\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")
TITLE = re.compile(r"^# ADR-(?P<number>\d{3}|XXX): \S")
TEMPLATE_NUMBER = "000"

errors: list[str] = []


def fail(message: str) -> None:
    errors.append(message)


def check_title(path: Path, number: str) -> None:
    """Check that the first line is an ADR title that carries the file's own number."""
    lines = path.read_text(encoding="utf-8").splitlines()
    first_line = lines[0] if lines else ""
    expected = "XXX" if number == TEMPLATE_NUMBER else number
    match = TITLE.match(first_line)
    if not match:
        fail(f"{path.name}: the first line must be '# ADR-{expected}: <title>', found '{first_line}'.")
        return
    if match["number"] != expected:
        fail(f"{path.name}: the title says ADR-{match['number']} but the file name says ADR-{number}.")


def main() -> int:
    if not ADR_DIR.is_dir():
        print(f"No {ADR_DIR.relative_to(REPO)} directory, nothing to check.")
        return 0

    files_by_number: dict[str, list[str]] = defaultdict(list)
    adr_files = sorted(ADR_DIR.glob("*.md"))

    for path in adr_files:
        if not FILE_NAME.match(path.name):
            fail(
                f"{path.name}: the file name must be 'ADR-NNN-lowercase-kebab-case.md', "
                "for example 'ADR-009-marking-based-access-control.md'."
            )
        match = NUMBER.match(path.name)
        if not match:
            continue
        number = match["number"]
        files_by_number[number].append(path.name)
        check_title(path, number)

    for number, names in sorted(files_by_number.items()):
        if len(names) > 1:
            fail(
                f"ADR-{number} is used by {len(names)} files: {', '.join(names)}. "
                "Keep the number on the ADR merged first and move the other one to the next free number."
            )

    if errors:
        print(f"Found {len(errors)} problem(s) in {ADR_DIR.relative_to(REPO)}/:")
        for error in errors:
            print(f" - {error}")
        return 1

    print(f"All {len(adr_files)} ADR files have a valid name, a matching title and a unique number.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
