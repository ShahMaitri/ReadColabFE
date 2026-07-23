---
name: create-readme
description: Generate a README.md for this repository. Use this skill when the user wants to create, generate, or update a README file. Keywords: readme, create readme, generate readme, documentation, project documentation.
---

# Hackathon Submission README Generator

## Purpose
Generate `README.md` for this repository in the exact format required for
hackathon judging. This README will be used by an AI-assisted first-pass
scorer and then by human jurors — accuracy matters more than making the
project look good. Overclaiming will be caught when jurors run the code,
and will count against the team.

## Instructions

1. Read the file `README_TEMPLATE.md` in this repo (or the one provided by
   hackathon organizers) and use it as the exact structure for the output
   `README.md`. Preserve all section headers and ordering.

2. Sections marked **[HUMAN-FILL]** must NOT be written by you. Leave them
   as empty prompts under the heading, exactly as worded in the template
   (e.g. keep the guiding question as a placeholder comment). Do not
   invent a problem statement, target user, or "why this matters" content.
   If these sections already contain team-written content, preserve it
   as-is — do not rewrite or embellish it.

3. Sections marked **[AI-FILL]** must be produced by actually inspecting
   this repository:
   - Read the actual source files, not just filenames or comments.
   - For "Fully working," only list a feature if you can point to a
     specific file, function, or route that implements it end-to-end.
   - For "Designed but not implemented," include anything referenced in
     UI, docs, comments, or naming that has no working implementation —
     stubs, hardcoded/mocked return values, TODOs, dead code paths.
   - For setup instructions, only include commands you can verify are
     consistent with the actual entry points and dependency files
     (package.json, requirements.txt, Dockerfile, etc.) in this repo.
     Do not copy aspirational instructions from an old draft README if
     they no longer match the code.
   - For the consistency check, note contradictions — do not resolve
     them in the team's favor or silently omit them.

4. Do not fabricate evidence. If you cannot verify a claim from the code,
   write "Not verifiable from repository" rather than guessing.

5. Do not fill in [HUMAN-FILL] sections even if the answer seems obvious
   from context — the jury wants the team's own framing, not an inferred one.
   Exception: the "Working Status" section (Section 6) is [AI-FILL]. You must
   actually attempt to install, build, and run the project, then report real
   results. Do not guess — run the commands and observe what happens. If an
   external dependency (API key, hosted service) blocks execution, state that
   clearly and ask the team to provide a demo link or recording.

6. After generating, output a short summary to the team (not part of the
   README) listing:
   - Which [HUMAN-FILL] sections are still empty and need their input
   - Any features you flagged as "Designed but not implemented"
   - Any consistency issues found

## Output
Write the completed file as `README.md` in the repository root, following
the template structure exactly. Do not add extra sections beyond the template.
