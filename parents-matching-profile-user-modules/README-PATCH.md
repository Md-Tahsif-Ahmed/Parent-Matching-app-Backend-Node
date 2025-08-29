# Parent Matching – Profile Onboarding & User Modules (Patch)

This patch adds a full **Profile** onboarding module and aligns **User** module routes/validation with the Figma & spec.

## Profile module (new)

**Routes (all require auth)**

- `GET /profile/me`
- `PATCH /profile/basic` – `{ displayName?, aboutMe?, childAge? }`
- `PUT /profile/journey` – `{ journeyName }`
- `PUT /profile/interests-values` – `{ interests?: string[], values?: string[] }`
- `PUT /profile/diagnoses` – `{ items: Array<{ typeName?, name }> }`
- `PUT /profile/therapies` – `{ items: Array<{ typeName?, name }> }`
- `PUT /profile/location` – `{ lat, lng, locationText? }`
- `POST /profile/consent` – `{ agreed: true }`
- `PUT /profile/profile-picture` – `multipart/form-data` single file
- `POST /profile/photos` – add to gallery (max 4)
- `PUT /profile/photos/:index` – replace by index
- `DELETE /profile/photos/:index` – remove by index

> Gallery hard limit is enforced (max 4). Exceeding results in `409 PHOTO_LIMIT_REACHED`.

## User module (updated)

- `GET /user/profile` – returns current user (with populated `profile`)
- `POST /user/create-admin` – guarded by `SUPER_ADMIN`
- `POST /user` – register parent (firstName/lastName/dob are optional; email+password required)
- `PATCH /user` – update own base fields. **Note:** images should be updated via `/profile` module.

## Notes

- Profile stores **profilePicture** and **galleryPhotos** (not the `User` model).
- Location uses GeoJSON Point with a 2dsphere index (suitable for proximity feed).
- Diagnosis/Therapy items accept either dropdown `{ typeName?, name }` or "Other" as `{ name }` only.
- The auth flow already returns `next: "ONBOARDING"` on first verify and `next: "HOME"` on login.
