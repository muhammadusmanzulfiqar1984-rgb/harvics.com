# HARVICS SYSTEM RULES

This is the permanent design system law for this codebase.
Never deviate without explicit approval.

## MASTER PALETTE

- Burgundy: `#1A0505` -> `bg-harvics-burgundy`
- Cream: `#F5F0E8` -> `bg-harvics-cream`
- Gold: `#C9A84C` -> `bg-harvics-gold`
- Muted: `#8A7D6B` -> `text-harvics-muted`

## 25 COMPLIANCE PILLARS

1. Color — burgundy/cream/gold only
2. Typography — cream on dark, burgundy on light, gold accent only
3. Spacing — 1440px max layout
4. Layout/Grid — universal-layout-frame
5. Elevation/Shadow — burgundy-tinted only
6. Border/Radius — gold at 30% opacity
7. Motion — cubic-bezier(0.16, 1, 0.3, 1)
8. Iconography — SVG only, no emojis
9. Imagery — dark overlay on all hero images
10. Navigation — T1 burgundy, T2 cream, T3 cream
11. Buttons — burgundy fill, cream text, gold hover
12. Forms — cream bg, burgundy text, gold focus
13. Cards — burgundy dark, cream light, gold hover border
14. Modals — burgundy overlay `rgba(26,5,5,0.85)`
15. Notifications — burgundy bg, cream text, gold border
16. Tables — burgundy header, cream rows, gold border
17. Badges — burgundy bg, gold text
18. Tooltips — burgundy bg, cream text
19. Dropdowns — cream bg, burgundy text, gold hover
20. Breadcrumbs — burgundy text, gold separator
21. Progress — burgundy track, gold fill
22. Scrollbar — burgundy track, gold thumb
23. Breakpoints — mobile first, 1440px max
24. Accessibility — gold focus rings only
25. Dark/Light Mode — burgundy base dark, cream base light

## HEADER ZONES

- T1 Utility Bar -> burgundy
- T2 Brand Bar -> cream
- T3 Sector Nav -> cream

## DEFAULT SCOPE ENFORCEMENT (FOR ALL AGENTS)

- If a request says change color/font/font color/design system without explicit scope, treat it as GLOBAL scope.
- GLOBAL scope means entire repository (all current and future pages/components/routes), not just a single file.
- Only use local scope when the user explicitly restricts scope (example: T1 only, Header only, Hero only, specific file).
- T1/T2/T3 labels are header-local architecture zones and must not be interpreted as repo-global scope by themselves.

## RULE

- No hardcoded hex.
- No emojis.
- No Option A replacements.
- Skin only unless explicitly approved.