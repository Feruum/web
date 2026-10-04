# Midterm implementation plan â€” 2026-10-04

Goal: finish the existing eight-page Istanbul site and prepare its HTML/CSS for future JavaScript. The user approved the requirements checklist and requested implementation. The user explicitly excluded an AI log.

Keep semantic HTML, Bootstrap 5.3.8 and the existing restaurant photographs. Reuse browser constraint validation, native GET forms and CSS `:target` for the present static confirmation. Add no custom runtime JavaScript, server, database, staff approval flow or invented reservation. Preserve the local sticky header and FAQ item styling.

- [x] Add a repeatable source audit for local links/anchors, labels, ids, uniform navigation/footer, form outcomes, empty price elements and missing assets; run it before changes to identify the current failures.
- [x] Apply one header/footer/navigation and title pattern to index, menu, visit, gallery, about, faq, feedback and colophon. Keep Colophon reachable through the footer, omit it from all header menus by user request, and rename `mainNavbar` to `main-navbar`.
- [x] Replace empty menu prices with a small finished selection from the published owner-menu listing for the correct Uly Dala 56 restaurant. Keep source/limitations in content notes. Add meal planning controls, quantity, subtotal output, confirmation and error containers without claiming an order was sent.
- [x] Finish visit, question and review preparation: unique form/button ids, clear submission boundaries, visible result locations, empty dynamic containers, recovery links and error/success/selected/active/hidden styles. Browser validation handles missing/invalid fields; future JavaScript owns calculation and persistence.
- [x] Add ids to future content owners (menu, gallery, FAQ, reviews), keep labels accessible and keep the small correction stylesheet.
- [x] Rewrite README with the eight-page list, three click-through journeys, run/check commands, JavaScript hook map, truthful form limitations and submission instructions. Add quality-pass and content-source documents. Do not create an AI log.
- [x] Run the source audit, W3C Nu checks and installed-browser checks for all eight pages at phone and desktop widths. Exercise mobile navigation, keyboard access, invalid/valid form submission and result recovery. Save 16 page screenshots plus form-result evidence.
- [x] Record actual checks and outstanding human requirements. Do not fabricate teammate reviews, photo authorship, four-day contribution histories or a final freeze. Leave the `midterm` tag until the team has completed its required review and accepted the HTML/CSS.

Verification uses tooling scripts only; these are not loaded by the website. No new build framework or dependency installation is needed. External content checks and validator results are recorded separately from local-browser evidence.
