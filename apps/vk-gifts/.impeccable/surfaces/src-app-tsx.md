---
version: 1
slug: 'src-app-tsx'
primary_target: 'src/App.tsx'
related_targets:
  [
    'src/styles.css',
    'src/features/wish-list.tsx',
    'src/features/add-wish.tsx',
    'src/features/gift-sheet.tsx',
  ]
---

# Хочу: тёплая предметная галерея

## Direction contract

THESIS
A personal wishlist leads with real object photographs, readable names and regular-weight prices. Clear textual booking state connects a friend's choice to the same object after saving.

OWN-WORLD
Warm off-white page, light compact header with gift mark, raspberry actions, Montserrat body and Comfortaa headings. Soft pastel fields belong only to gift photographs and keep radius16 with no border or shadow. Photo captions remain open; prices stay weight400. Mobile navigation sits at the bottom with its full height and safe area reserved by content and toast. Desktop keeps the four-column gallery.

STORY
The owner adds an item by local catalog link or manually, edits it and confirms deletion. A friend opens the recipient's list, books a free gift and can cancel their own booking. Other bookings remain protected. Retry belongs to the action that failed and current form values.

FIRST VIEWPORT
At320×568 two complete own wishes show name and price; first friend photos start no lower than300px and both captions/prices and booking tag remain above the bottom navigation, with at least12px clearance for prices. Category and sort are native selects in one row. At1440×900 all four own gifts are comparable in one row with existing notes. Three navigation labels remain visible in the mobile bottom bar and desktop header. The link form and its primary action fit the first phone viewport.

FORM
Operate, code-led. Seed reference seed:62b2b8f0712208d0, user chose grounded rank1 «Предметная галерея», kind pick. Chosen critique reference is external gifts-review/.impeccable/mocks/decision/gallery.html and gifts-selected-gallery-320/1440.png. It is not a pixel comp. The user requested a blend after preferring the earlier UI. This revision restores its light header, photographic backgrounds and bottom navigation while retaining the gallery topology. The earlier pure-white material constraint is superseded by that request; the prior gallery render remains archived for comparison. App states and other routes inherit this system. Existing rasters remain transparent local media with their provenance.

FINISH
unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
