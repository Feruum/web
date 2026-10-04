# Quality pass — 2026-10-04

This records a technical check of the local site. It does **not** claim that students have completed the required peer review two days before the deadline.

## Findings and fixes

| Finding | Fix |
| --- | --- |
| Colophon navigation placement | By user request, removed Colophon from every header menu; retained its link in every footer so all eight pages remain reachable. |
| Different footer links and title patterns | One identical footer and `Page — Istanbul Restaurant Astana` titles. |
| Fourteen empty price elements | Replaced with 18 published prices in six finished categories; source and limitations documented. |
| Menu ended at an external call | Added dish/portion selection, subtotal output, checked result and continuation to Visit. Calculation is prepared for JavaScript. |
| Forms lacked ids, error hooks and visible result locations | Added form/control/result ids, labels, error/summary/confirmation containers and result/recovery interfaces. |
| Disabled booking button and classroom text | Removed the dead button; forms describe useful preparation and clearly state that nothing is sent or saved. |
| Camel-case navigation id | Replaced with `main-navbar`; updated Bootstrap and ARIA references. |
| Missing future state classes | Added shared hidden, active, selected, error and success states. |
| External CDN dependency | Official Bootstrap assets pinned locally; original SHA-384 SRI hashes verified. |
| Outdated README and missing journeys | Updated stack, pages, ownership, three journeys, hooks, checks and freeze instructions. |
| Four Nu heading warnings | Corrected sectioning wrappers; all eight documents now have zero errors and warnings. |
| Screenshots caught images before decode and menu during closing animation | Capture awaits image decoding, actual closed menu and rendered frames. Evidence regenerated from actual pages. |

## Completed checks

- Source audit: all eight HTML files, local files and fragment targets, no empty/dead `href="#"`, unique lowercase ids, labels/ARIA targets, identical footer/navigation, form/result/error hooks, no empty prices or conflict markers.
- Official Nu Html Checker **26.10.2 (f302f46)**, run locally on the actual files: **0 errors, 0 warnings on each page**. [Report](checks/w3c.json) includes file hashes and checker hash. No HTML uploaded externally.
- Installed Chrome: eight pages at **1440×900**, **390×844** and **320×740**; no missing images, horizontal overflow, console/page errors or failed asset requests. Mobile menus open/close with seven visitor-page links; Colophon remains reachable through each footer.
- Four forms: blank submission blocked, valid entries accepted, invalid email rejected on the three contact forms, result visible, **Start again** restores initial state. Native reset and keyboard skip link work.
- Three README journeys exercised end to end: Home → address/hours; Menu → meal result → Visit → visit result → address; About → FAQ → question → result. External calls, messages and publication are not needed to finish these local paths.
- [Sixteen full-page screenshots](screenshots/README.md) cover each page at desktop and phone width; four more show form results.
- Original sticky header, FAQ item styling and restaurant photographs retained.

[Browser evidence](checks/browser.json) includes source hashes. This is local-browser evidence, not a production deployment or mobile-hardware test. JSON timestamps use UTC; this report uses the user's Asia/Qyzylorda date.

## Remaining team work before submission

1. Each student reviews another member's pages at least two days before the actual deadline. Record reviewer, pages, actual date, findings and fixes here after review. No deadline was supplied.
2. Confirm ownership/permission for existing photographs, original guest quotations and prices against the current restaurant menu. Automated public-site access can be blocked and does not certify every external destination.
3. Each member makes real contributions from their own account on at least four different days. Current branch history has **Ferumm: 3 distinct days**, **zhasik: 1 distinct day**, and no third author. These labels do not establish which student owns an account. No history or authorship was fabricated.
4. Review the final changes, make the final commit and create/push `midterm` when the team accepts the structure. The tag has not been created during preparation.
5. Prepare for defense: another member's page, hooks/states, semantics, validation, CSS selectors and Bootstrap grid/utilities.

## Next JavaScript assignments

The subtotal is a prepared output, not a functioning calculator. Summaries and confirmations have empty dynamic containers. Persistence, calculations, field messages and generated content will use the existing markup and state classes after the freeze. Native GET submission navigates without restoring values; every form states that entries are not saved.
