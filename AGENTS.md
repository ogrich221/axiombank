<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Give each public bank topic a separate TanStack leaf route, with shared editorial content and page presentation kept outside routes, so navigation and page metadata stay consistent.
- Banking, legal, pricing, and contact content remains reviewable draft information until the bank verifies it; never treat a presentation-only page as a live banking service.
- Render the card showcase with dynamically loaded Three.js inside a client effect, using semantic CSS tokens for textures and honoring reduced-motion preferences, to keep SSR safe and the display accessible.
- Keep the admin workspace under /admin behind a server-checked shared passcode session; admin data is read and written only through passcode-gated server functions using the service client, because the admin tables have no public access policies.
- Scope the emerald admin theme to the admin layout and its dialogs so the public bank theme remains unchanged.
- Customer pages live under the integration-style client-gated `_authenticated` layout; all private operations additionally validate the bearer on the server and use owner-scoped access, keeping admin passcode access independent.
- Keep customer schemas, server operations, and shared presentation outside leaf routes; do not collect transfer PINs or create financial records until authorized providers and protected authorization are connected.
- Customer avatar uploads are cropped and re-encoded in the browser, checked on the server, and stored in an owner-only private bucket so profile photos do not become public assets.
- Populate profile edit drafts through the editable-field mapper and reset from the latest saved profile when opening or cancelling edits, so stale drafts and account-only fields cannot be resubmitted.

- Keep administrator customer-application review on customer_applications, separate from identity verification and directory roles; use a passcode-gated service-only atomic function to confirm and audit each pending application.
- Self-registered accounts get an admin_users directory row (id = auth user id, status Pending) from the signup trigger; application confirmation activates it and directory deletion also removes the application, so admin tools and approvals stay in sync.
- Admin AI transfer review runs through a passcode-gated server function that calls Lovable AI server-side and returns a structured summary only; it never stores, approves or moves transfers, so the admin stays the decision-maker.
