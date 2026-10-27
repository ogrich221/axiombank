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
