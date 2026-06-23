# RAT BENCH — Claude Instructions

## Git workflow

- **"push to dev"** always means: `git push origin main:dev`
- Commit to `main` locally, then push `main → dev` on the remote.
- Never push to a different remote branch without explicit instruction.

## Commit messages

- Never include Claude attribution lines (`Co-Authored-By`, `Claude-Session`, or similar) in any commit message.
