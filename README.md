# Avora Library — Serialized Storytelling & Community Reading Platform

> A responsive, multilingual web platform and Progressive Web App (PWA) built with **Next.js 14 (App Router)**, **React 18**, and **Tailwind CSS**. Optimized for seamless deployment on **Vercel** with full integration for remote **MariaDB / MySQL** databases.

---

## 🌟 Complete Feature Scope Implementation

### 1. Public Website & Homepage (`app/page.js`)
- **Hero Section**: High-converting sign-up and start reading calls-to-action with featured House Original spotlight.
- **Trending Now Story Carousel**: Responsive grid displaying active serialized stories with read counts, vote badges, and live metadata.
- **Featured Category Carousels**: "Must-read Fanfiction" spotlight chosen and curated by admin.
- **20+ Genre Library Grid**: Dedicated interactive cards for Romance, Fanfiction, LGBTQ+, Fantasy, Teen Fiction, Historical Fiction, Paranormal, Humor, Horror, Contemporary, Diverse Lit, Mystery, Thriller, Science Fiction, Adventure, Non-Fiction, Poetry, Short Story, Werewolf, and New Adult.
- **Community Section**: Real reader reactions and paragraph annotation quotes.
- **Author Success Stories (Testimonials)**: Real author case studies detailing serials turned into publishing deals.
- **"Read. Watch. Obsess."**: Flagship serial carousel (admin-managed).
- **PWA Installation & QR Code Section**: QR code for mobile reading and instant web app installation prompt.
- **Comprehensive Footer**: Social links, multilingual switcher, discovery links, and editable legal pages.

### 2. Browse & Discovery (`app/browse/page.js`, `app/story/[slug]/page.js`)
- **Comprehensive Filter Toolbar**: Filter by 20+ genres, status (ongoing/completed), maturity rating (everyone/18+), language, mood, trope, and story length.
- **Live Search & Autocomplete**: Search bar with real-time dropdown for stories, authors, and public reading lists.
- **House Originals & Editor's Picks Toggles**: Instant curated view toggling.
- **Sorting Options**: Trending, Newest releases, Most read, Most voted, and Recently updated.
- **Story Detail Page (`app/story/[slug]/page.js`)**: Cover, author follow button, description, tags, maturity badge, chapter table of contents, read/vote counts, share button, report modal, and related stories.
- **Pagination (`?page=1`)**: Clean URL query pagination with configurable items per page.

### 3. Dedicated Reading Engine (`app/read/[slug]/page.js`)
- **Reading Modes**: **Light**, **Dark**, and **Sepia (`☕`)** reading mode for long sessions.
- **Customizable Typography**: Adjust font size (`A-` / `A+`), font family (Serif vs Sans), and line spacing.
- **Inline Paragraph Comments**:
  - Readers can tap/hover any paragraph to see comment count badges.
  - Clicking opens a slide-over discussion drawer for line-by-line annotations.
  - Readers can post new comments and nested replies directly linked to that specific paragraph.
- **Chapter Emoji Reactions**: React with 🔥, ❤️, 😭, 👏, or 😱 on chapters and comments.
- **Chapter Voting & Reactions**: Heart button counter with reaction state.
- **Next & Previous Chapter Controls**: Seamless transition between serial chapters.
- **Reading Progress**: Automatically saves current chapter and paragraph position across devices.

### 4. Write & Publish Author Portal (`app/write/page.js`)
- **Author Studio**: Create serialized novels and draft chapters.
- **Rich Editor with Auto-Save**: Real-time auto-saving draft indicator while typing.
- **Chapter & Story Management**: Authors can edit, delete, and reorder chapters.
- **Story Settings**: Cover URL/upload, description, genre selection, tags, maturity rating (18+), copyright license, and release status (Draft, Published, Scheduled).
- **Creator Analytics**: Reads over time, votes, inline comments count, follower base, audience country breakdown, and top-performing chapters.
- **Writing Contests (`app/contests/page.js`)**: Watty Awards style annual contests, category submissions, jury evaluation, and winners showcase.
- **Author Guidelines (`app/guidelines/page.js`)**: Best practices for serialized chapter cadence and pacing.

### 5. Admin Panel & Moderation (`app/admin/page.js`)
- **House Originals & Story Management**: Feature/unfeature stories, assign House Original badges, move story authors, or unpublish stories.
- **Content Moderation & Reports Queue**: Review reported comments or stories with warn, suspend, and ban actions.
- **Genre Library Management**: Add new genres with custom slugs and metadata.
- **Author Persona Creator (Without Login)**: Create editorial author personas (name, bio, photo) to publish house originals or syndicated titles without a user login.
- **Security & Admin Audit Trail**: Immutable log recording admin moderation and curation events.
- **Site Policies & Settings**: Toggle author self-publishing, enforce mature age gate, and adjust catalog pagination.

### 6. Multilingual & Security
- **Language Switcher (`components/Header.js`)**:
  - **English (EN)**
  - **Georgian (KA — ქართული)**
  - **Hindi (HI — हिन्दी)**
- **User Accounts (`app/login/page.js`, `app/register/page.js`, `app/forgot-password/page.js`, `app/settings/page.js`)**:
  - Age confirmation at registration (13+ / 18+ for mature fiction).
  - Mature age gate protection before reading 18+ chapters.
  - Account settings: Change password, toggle "Hide Mature Content", and email notification preferences.
  - One-click Google sign-in option.
- **Legal & Corporate (`app/help/page.js`, `app/contact/page.js`, `app/terms/page.js`, `app/privacy/page.js`, `app/dmca/page.js`, `app/content-policy/page.js`, `app/payment-policy/page.js`, `app/accessibility/page.js`, `app/about/page.js`, `app/careers/page.js`, `app/press/page.js`, `app/partnerships/page.js`)**.
- **SEO & PWA**: `public/manifest.json`, `public/robots.txt`, `public/sw.js`, and `app/sitemap.js`.

---

## 💻 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (with light, dark, and sepia reader themes)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PWA**: Web App Manifest (`public/manifest.json`) & Service Worker (`public/sw.js`)
- **Database**: Remote MariaDB / MySQL connection config (`.env`)

---

## 🛠 Local Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the platform.

---

## 🚀 Easy Hosting on Vercel

1. **Commit and Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete Avora Library Next.js platform with all 11 scope areas, PWA, and Vercel setup"
   git push origin main
   ```
2. Go to **[Vercel](https://vercel.com)** and click **Add New > Project**.
3. Select your repository and click **Import**.
4. In **Environment Variables**, configure the production variables documented in `.env.example`:
   - `DB_HOST`: Host address of your MariaDB/MySQL server
   - `DB_PORT`: `3306`
   - `DB_USER`: Your database username
   - `DB_PASSWORD`: Your database password
   - `DB_NAME`: Your database name
   - `ADMIN_JWT_SECRET`: 32+ character random secret for JWT signing
   - `EMAIL_USER`: Your SMTP sender email address
   - `EMAIL_PASS`: Your SMTP or Gmail App Password
   - `NEXT_PUBLIC_APP_NAME`: `Avora Library`
   - `NEXT_PUBLIC_APP_URL`: Your Vercel or custom domain URL
5. Click **Deploy**. Vercel will build and serve your app globally on an SSL domain with CDN edge caching!
