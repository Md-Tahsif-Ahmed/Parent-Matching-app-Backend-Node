## Auto-login to Onboarding (Patch)

- First-time **/auth/verify-email** returns tokens + `next: "ONBOARDING"`.
- Normal **/auth/login** returns tokens + `next: "HOME"`.
- Ensures empty **Profile** doc exists at verification so onboarding steps can save immediately.
- Adds minimal **Profile model** at `src/app/modules/profile/profile.model.ts`.
