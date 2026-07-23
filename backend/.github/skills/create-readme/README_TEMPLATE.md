<!--
HACKATHON SUBMISSION README — TEMPLATE
Do not delete section headers or HTML comments. Comments marked [AI-FILL] should
be completed by your coding assistant (Copilot / Claude Code / etc.) by reading
the actual repository. Comments marked [HUMAN-FILL] must be written by the team —
your assistant should leave these as prompts, not guess or fabricate content.
-->

# Project Name

## 1. Problem & Target User  [HUMAN-FILL]
<!--
Answer specifically:
- Who exactly has this problem? (a role, a persona, a context — not "everyone")
- What do they do today without your solution, and why is that inadequate?
Do NOT let your AI assistant write this section. If it's empty, jury will ask why.
-->

## 2. Solution Overview & Core User Flow  [HUMAN-FILL]
<!--
2-4 sentence summary, PLUS a literal step-by-step flow:
  1. User does ___
  2. System does ___
  3. User sees/gets ___
-->

## 3. Functional Scope: Built vs. Not Built  [AI-FILL — verified from code]
<!--
Your assistant should inspect the codebase and produce two lists:

### Fully working in this submission
- [Feature] — evidence: [file/function/route that implements it]

### Designed but not implemented / mocked / stubbed
- [Feature] — evidence: [e.g. "UI exists at components/X.jsx but calls a stub function
  that returns hardcoded data" or "mentioned in comments, no implementation found"]

Do not rely on comments or the team's other notes as proof something is built —
confirm the actual code path exists and would execute.
-->

## 4. Technical Spec  [AI-FILL — verified from code, human may edit]
<!--
- Stack: [languages, frameworks, key libraries — read from package.json/requirements.txt/etc.]
- Architecture / data flow: [short description or ASCII diagram of how components connect]
- Hardest technical problem solved: [HUMAN-FILL — AI can suggest a candidate based on
  code complexity, but the "why it was hard" should come from the team]
-->

## 5. Setup & Run Instructions  [AI-FILL — verified by actually attempting setup]
<!--
- Exact commands to install and run, taken from what actually works, not aspirational docs
- Expected runtime to get to a working state
- Any external dependencies (API keys, services) required, clearly flagged
- Fallback: hosted demo link or short screen-recording link if local run is unreliable [HUMAN-FILL]
-->

## 6. Working Status  [AI-FILL — verified by attempting build & run]
<!--
This section is used as a QUICK FILTER by judges. The AI assistant must actually
attempt to build and run the project, then report results honestly.

Instructions for AI:
1. Run the install command (npm install, pip install, etc.) and report success/failure.
2. Run the build/compile command and report success/failure with error count if any.
3. Run the start/serve command and check if the application loads.
4. If the app starts, attempt the core user flow from Section 2 and report whether
   it completes end-to-end.

Fill in each line with YES / NO / PARTIAL and brief evidence:

- Code builds without errors: [YES/NO/PARTIAL] — [e.g. "npm run build exits 0" or "3 TS errors in X.ts"]
- Application starts and loads: [YES/NO/PARTIAL] — [e.g. "localhost:4200 serves the app" or "crashes on start with error X"]
- Core feature can be demoed end-to-end: [YES/NO/PARTIAL] — [e.g. "navigated to /map, markers load from CSV" or "page loads but API call fails"]
- Demo steps (if YES or PARTIAL above):
  1. [step to reproduce the core flow]
  2. [expected output/screen]

If build/run fails due to missing external dependency (API key, database, etc.),
note it clearly. Team should provide a screen recording or hosted demo link as
fallback proof. [HUMAN-FILL if external dependency blocks AI from running]
-->

## 7. Verification Notes  [AI-FILL, human should confirm]
<!--
For each major feature in "Fully working," one line on how a juror can verify it works,
e.g. "Run `npm start`, go to /recommend, submit a sample query — response appears in <2s."
-->

## 8. Known Limitations  [AI-FILL — inferred from code, human may add]
<!--
Anything incomplete, hardcoded, untested, or fragile that the team should be upfront about.
-->

## 9. Consistency Check  [AI-FILL — flag only, do not resolve]
<!--
If any claims in code comments, other docs, or commit messages seem to contradict
what's actually implemented, list the discrepancy here for jury awareness.
Do not silently pick one version as "true."
-->
