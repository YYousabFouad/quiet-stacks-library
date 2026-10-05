# Quiet Stacks Library

A clean, responsive library management web interface designed faithfully from the Figma design specification using pure HTML, CSS, and vanilla JavaScript with persistent LocalStorage, user accounts, and purchase/borrow management.

---

## 📁 Architecture Overview

```text
Libaray-system/
├── index.html                   # Main library dashboard & catalog
├── login.html                   # User & librarian login page
├── signup.html                  # New member registration page
├── README.md                    # Project documentation & structure
└── assets/
    ├── css/
    │   ├── style.css            # Central stylesheet entry point (imports modules)
    │   ├── variables.css        # Design tokens: palette, typography, spacing, shadows
    │   ├── reset.css            # Modern CSS reset and baseline defaults
    │   ├── layout.css           # Grid layouts, header, banners, responsive breakpoints
    │   ├── components.css       # Cards, badges, buttons, tables, filters, user session, modals
    │   └── auth.css             # Authentication card & form styles for login/signup
    ├── js/
    │   ├── storage.js           # LocalStorage service: accounts, auth, books, members, loans, stats
    │   ├── auth.js              # Authentication controller for login and registration
    │   └── app.js               # Dashboard controller: live rendering, search, buy/borrow, modal flows
    └── images/
        ├── book-banner.svg      # Vector SVG illustration for the header bookshelf
        └── icons/               # Icon assets
```

---

## 🔐 Authentication & Accounts

User accounts are stored persistently in `quiet_stacks_accounts`, linked directly with `quiet_stacks_members`:

- **Chief Librarian (Admin):**
  - Email: `admin@quietstacks.com` | Password: `admin123`
- **John Smith (Standard Member):**
  - Email: `john@example.com` | Password: `password123` (2 borrowed titles, 1 purchased title)
- **Sarah Ali (Student Member):**
  - Email: `sarah@example.com` | Password: `password123` (1 borrowed title, 1 purchased title)

Quick "Fill" demo buttons are available on [login.html](file:///home/soupa-fedora/Projects/Libaray-system/login.html) for instantaneous testing.

---

## 💾 LocalStorage Data Schema & Sample Dataset

The data layer in [storage.js](file:///home/soupa-fedora/Projects/Libaray-system/assets/js/storage.js) handles persistent client-side storage across five primary keys:

1. **`quiet_stacks_accounts`**
   - User account records containing `id`, `name`, `email`, `password`, `role`, `membershipType`, `borrowedBooks`, and `purchasedBooks` (with invoices, price paid, and timestamps).
2. **`quiet_stacks_current_user`**
   - Active session user object (tracks currently logged-in member/librarian).
3. **`quiet_stacks_books`** (20 Books)
   - Fields: `id`, `title`, `author`, `category`, `price`, `isbn`, `year`, `status` (`available` | `borrowed` | `overdue`).
4. **`quiet_stacks_members`** (8 Members)
   - Fields: `id` (e.g. `M-001` through `M-008`), `name`, `email`, `membershipType`, `status`, `borrowedCount`.
5. **`quiet_stacks_loans`** (8 Loans)
   - Active lending records: `id`, `bookId`, `bookTitle`, `memberId`, `memberName`, `borrowedDate`, `dueDate`, `status`.
6. **`quiet_stacks_statistics`**
   - Real-time counters: `totalBooks: 20`, `totalMembers: 8`, `borrowed: 6`, `overdue: 2`.

---

## 🎨 Interactive Features

- **Buy & Borrow for Logged-In Users:**
  - Clicking **Buy** creates a purchase record with an official invoice (e.g. `INV-1003`) stored permanently in the user's account.
  - Clicking **Borrow** assigns the book directly to the active member, creates a loan record, and updates availability badges.
- **My Reading Stack Modal:**
  - Clicking the user profile badge in the navigation bar opens the account modal, showing active loans (with due dates and a 1-click **Return** button) and purchased books with invoices.
- **Sticky Navbar & ScrollSpy:**
  - The navigation bar sticks with frosted-glass backdrop blur and dynamically updates active section tabs using `IntersectionObserver`.

---

## 🚀 How to Run

Open [index.html](file:///home/soupa-fedora/Projects/Libaray-system/index.html) directly in any modern browser, or run a local static server:

```bash
# Python 3
python3 -m http.server 3000
```
