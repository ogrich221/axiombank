# Roadmap

- [ ] Upgrade profile overview and domestic/international transfer review, PIN authorization, confirmed status and duplicate protection (live money movement blocked: banking/payment provider and approved currency/destination coverage required)

- [x] Repair stale profile edit drafts, inline validation and repeated photo selection; profile tests pass
- [ ] Verify updated profile saving and photo upload while signed in (blocked: user must sign in through preview; automatic session unavailable)

- [x] Improve personal profile layout and editing; verified no “customer workspace” wording remains; retained accurate financial availability notices (signed-in desktop/mobile and cancel editing verified; 12 tests passed)

- [x] Retest admin sign-in, directory CRUD/status/search/export/audit/logout, confirmed application review, signed-in customer pages/profile/transfer preview/notifications/sign-out (20 unit tests pass; no browser runtime errors; temporary records removed)
- [ ] Retest pending application confirmation (blocked: no pending application available; existing approvals must not be reset)
- [ ] Retest account photo storage and password changes (blocked: preserve the user's existing photo and credentials; crop/cancel and password form verified)

- [x] Display zero balances and connect Open Account applications to administrator confirmation

- [x] Add customer registration, sign-in, confirmation and password recovery
- [x] Save owner-only profiles, applications and editable avatars
- [x] Build customer dashboard, profile, accounts, cards, transfers, bills, transactions, security and support
- [x] Verify saved customer profile, photo, transfer preview, route protection and phone layouts
- [ ] Verify delivered confirmation/reset emails and password login (blocked: test mailbox not accessible)
- [ ] Connect authorized payment/card/identity services (blocked: no provider available)
- [ ] Confirm approved 54 international destinations (blocked: bank/payment partner approval)
- [ ] Enable transfer PIN authorization (blocked: payment service and rate-limit infrastructure)

- [x] Build the admin workspace and branded loading states
- [x] Implement sample user search, filters, profiles, creation, editing, and status confirmations
- [x] Add roles, read-only sample activity, notifications, settings, and support
- [x] Verify admin workflows and phone layouts (sample mode; live services are not connected)

- [x] Complete all homepage-linked banking, company, support, and legal pages
- [x] Connect homepage and menu links to their matching pages
- [x] Verify navigation and page layouts

- [x] Remove the demonstration block from the home page (and repoint links that pointed at it)
- [x] Tidy it: page flow after the removal + the scrambled lanyard/ID-badge lettering in the two branch photos

- [x] Add the new money-changer photo as the hero for the "Feel Good About Your Money" segment, with the bank logo
