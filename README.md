# Quiet Stacks Library

A clean, responsive library management web interface designed faithfully from the Figma design specification using pure HTML, CSS, and vanilla JavaScript with persistent LocalStorage.

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
    ├── js/
    │   ├── storage.js           # LocalStorage service: seeds, CRUD for books, members, loans, stats
    │   └── app.js               # UI controller: dynamic rendering, live search/filtering, event handling
    └── images/
        ├── book-banner.svg      # Vector SVG illustration for the header bookshelf
        └── icons/               # Icon assets
```

---

## 💾 LocalStorage Data Schema & Sample Dataset

The data layer in [storage.js](file:///home/soupa-fedora/Projects/Libaray-system/assets/js/storage.js) handles persistent client-side storage across four keys, seeded with 20 books across 5 categories, 8 members, and 8 active/overdue loans:

1. **`quiet_stacks_books`** (20 Books)
   - Fields: `id`, `title`, `author`, `category` (Programming, Science, Fiction, Philosophy, History), `isbn`, `year`, `status` (`available` | `borrowed` | `overdue`).
2. **`quiet_stacks_members`** (8 Members)
   - Fields: `id` (e.g. `M-001` through `M-008`), `name`, `email`, `membershipType` (Standard, Student, Faculty, Premium), `status` (`active` | `inactive`), `borrowedCount`.
3. **`quiet_stacks_loans`** (8 Loans)
   - Active lending records: `id`, `bookId`, `bookTitle`, `memberId`, `memberName`, `borrowedDate`, `dueDate`, `status`.
4. **`quiet_stacks_statistics`**
   - Automatically updated summary metrics: `totalBooks: 20`, `totalMembers: 8`, `borrowed: 6`, `overdue: 2`.
   - Use the **"Reset Sample Data"** button in the navigation bar to restore the sample dataset at any time.

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
- **Sticky Navbar & ScrollSpy:** The navigation bar sticks to the viewport header with smooth backdrop blur (`backdrop-filter: blur(8px)`) and uses an `IntersectionObserver` to highlight the active section tab as the user scrolls. Clicking tabs smoothly navigates to each section.

---

## 🚀 How to Run

Open [index.html](file:///home/soupa-fedora/Projects/Libaray-system/index.html) directly in any modern browser, or serve it locally with any static web server:

```bash
# Python 3
python3 -m http.server 3000
```
