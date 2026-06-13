# Content Intake Workflow

This project includes a local intake script to help gather draft profile data from exported files.

## What you can provide

Place any files into one of these folders:

- `intake/`
- `imports/`
- `data-intake/`

Recommended inputs:

- Saved LinkedIn profile (`.pdf`, `.html`)
- Resume (`.pdf`, `.docx` converted to `.txt` or `.md`)
- Patent links and records
- Blog links and article exports
- YouTube links
- GitHub profile notes
- X/Twitter profile links
- Company websites
- Old posts and speaking links

## Run intake script

```bash
npm run intake:profile
```

The script scans supported local files and writes a draft file:

- `src/data/profile.draft.json`

## Important safety rules

- Treat all extracted records as review-only.
- Imported data is **never** published automatically.
- You must manually verify and copy approved data into:
  - `src/data/profile.json`
  - `src/data/experience.json`
  - `src/data/projects.json`
  - `src/data/patents.json`
  - `src/content/activity.json`

## Notes about PDFs

PDF parsing is intentionally conservative. If a PDF cannot be parsed cleanly, convert it to text and rerun intake.
