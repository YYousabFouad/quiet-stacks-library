# Quiet Stacks Library

A clean, responsive library management web interface designed faithfully from the Figma design specification using pure HTML and CSS.

---

## 📁 Architecture Overview

```text
Libaray-system/
├── index.html                   # Main semantic HTML5 document
├── README.md                    # Project documentation & structure
└── assets/
    ├── css/
    │   ├── style.css            # Central stylesheet entry point (imports modules)
    │   ├── variables.css        # Design tokens: palette, typography, spacing, shadows
    │   ├── reset.css            # Modern CSS reset and baseline defaults
    │   ├── layout.css           # Grid layouts, header, banners, responsive breakpoints
    │   └── components.css       # Cards, badges, buttons, tables, filters, modals
    └── images/
        ├── book-banner.svg      # Vector SVG illustration for the header bookshelf
        └── icons/               # Icon assets
```

---

## 🎨 Design System Details

- **Typography:** Serif headings via [Lora](https://fonts.google.com/specimen/Lora) paired with [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) for clear metadata.
- **Color Palette:**
  - Parchment background: `#fbf8f1`
  - British Racing / Forest Green: `#1b4332`
  - Amber / Ochre Gold: `#b07d1a`
  - Muted borders: `#e6decb`
  - Status Badges: Available (green), Borrowed (amber), Overdue (soft red), Inactive (slate)
- **Interactive Modals:** Built using accessible pure CSS (`:target`) so "Add a book" and "Add a member" dialogs open and close cleanly without requiring JavaScript dependencies.

---

## 🚀 How to Run

Open [index.html](file:///home/soupa-fedora/Projects/Libaray-system/index.html) directly in any modern browser, or serve it locally with any static web server:

```bash
# Python 3
python3 -m http.server 3000
```
