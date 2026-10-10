# Quiet Stacks Library

A clean, responsive library management web interface designed faithfully from the Figma design specification using pure HTML, CSS, and vanilla JavaScript with persistent LocalStorage, user accounts, and purchase/borrow management.

---

## 📁 Architecture Overview

```text
Libaray-system/
├── index.html                   # Starter file: unified Log In & Sign Up auth portal
├── dashboard.html               # Main library dashboard & catalog
├── login.html                   # Dedicated login page
├── signup.html                  # Dedicated new member registration page
├── README.md                    # Project documentation & structure
└── assets/
    ├── css/
    │   ├── style.css            # Central stylesheet entry point (imports modules)
    │   ├── variables.css        # Design tokens: palette, typography, spacing, shadows
    │   ├── reset.css            # Modern CSS reset and baseline defaults
    │   ├── layout.css           # Grid layouts, header, banners, responsive breakpoints
    │   ├── components.css       # Cards, badges, buttons, tables, filters, user session, modals
    │   └── auth.css             # Elevated glassmorphism & animated auth styles
    ├── js/
    │   ├── storage.js           # LocalStorage service: accounts, auth, books, members, loans, stats
    │   ├── auth.js              # Auth controller: page turns, tabs, and form validation
    │   ├── page-curl.js         # Three.js page curl interaction
    │   └── app.js               # Dashboard controller: live rendering, search, buy/borrow, modal flows
    ├── vendor/
    │   ├── three.min.js         # Three.js engine used by the page curl
    │   ├── vanta.net.min.js     # Bundled visual effect library (not currently used)
    │   └── anime.min.js         # Bundled animation library (not currently used)
    └── images/
        └── book-banner.svg      # Vector SVG illustration for the header bookshelf
```

---

## 🔐 Authentication & Accounts

User accounts are stored persistently in `quiet_stacks_accounts`, linked directly with `quiet_stacks_members`:

- **Chief Librarian (Admin):**
  - Email: `admin@quietstacks.com` | Password: `admin123`
- **John Smith (Standard Member):**
  - Email: `john@example.com` | Password: `password123` (3 borrowed titles, 1 purchased title)
- **Sarah Ali (Student Member):**
  - Email: `sarah@example.com` | Password: `password123` (3 borrowed titles, 1 purchased title)

Quick "Fill" demo buttons are available on [index.html](index.html) and [login.html](login.html).

---

## 💾 LocalStorage Data Schema & Sample Dataset

The data layer in [storage.js](assets/js/storage.js) handles persistent client-side storage across six primary keys:

1. **`quiet_stacks_accounts`**
   - User account records containing `id`, `name`, `email`, `password`, `role`, `membershipType`, `borrowedBooks`, and `purchasedBooks` (with invoices, price paid, and timestamps).
2. **`quiet_stacks_current_user`**
   - Active session user object (tracks currently logged-in member/librarian).
3. **`quiet_stacks_books`** (20 Books)
   - Fields: `id`, `title`, `author`, `category`, `price`, `isbn`, `year`, `status` (`available` | `borrowed` | `overdue`).
4. **`quiet_stacks_members`** (8 Members)
   - Fields: `id` (e.g. `M-001` through `M-008`), `name`, `email`, `membershipType`, `status`, `borrowedCount`.
5. **`quiet_stacks_loans`** (16 Loans)
   - Active lending records: `id`, `bookId`, `bookTitle`, `memberId`, `memberName`, `borrowedDate`, `dueDate`, `status` (11 _Borrowed_, 5 _Overdue_).
6. **`quiet_stacks_statistics`**
   - Real-time counters: `totalBooks: 20`, `totalMembers: 8`, `borrowed: 11`, `overdue: 5`.

---

## 🎨 Interactive Features

- **Buy & Borrow for Logged-In Users:**
  - Clicking **Buy** creates a purchase record with an official invoice (e.g. `INV-1003`) stored permanently in the user's account.
  - Clicking **Borrow** assigns the book directly to the active member, creates a loan record, and updates availability badges.
- **My Reading Stack Modal:**
  - Clicking the user profile badge in the navigation bar opens the account modal, showing active loans (with due dates and a 1-click **Return** button) and purchased books with invoices.
- **Sticky Navbar & ScrollSpy:**
  - The navigation bar sticks with frosted-glass backdrop blur and dynamically updates active section tabs using `IntersectionObserver`.
- **Daily Literary Quotes Banner:**
  - Positioned directly beneath the illustrated bookshelf header, displaying quotes from titles in the library collection (_The Alchemist_, _Cosmos_, _Clean Code_, _1984_, _Meditations_, etc.) with a 1-click **"Another Excerpt"** cycling button.
- **Back to Top "Power" Button:**
  - Fixed floating button that appears smoothly once scrolled past 250px.
  - Features an animated SVG power circle that charges/fills up dynamically according to page scroll progress (0%–100%) and radiates a pulsing energy aura. Clicking it smoothly returns the user to the top.

---

## 🚀 How to Run

Launch the starter file [index.html](index.html) directly in any modern browser, or run a local static server:

```bash
# Python 3
python3 -m http.server 3000
```

1. You start on the **Log In & Sign Up** portal (`index.html`).
2. Use the **1-click Demo Fill** buttons (`John Smith`, `Sarah Ali`, or `Chief Librarian`) or sign up as a new member.
3. Upon authentication, you will be redirected to the library dashboard (`dashboard.html`).
4. Logging out returns you back to the starter file. You can also preview the catalog as a guest.
