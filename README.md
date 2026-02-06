# Meld

![Meld Banner](public/mail-banner.png)

> **"Merge tasks, translate minds."**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Lingo.dev](https://img.shields.io/badge/Lingo.dev-Translation-orange?style=for-the-badge)](https://lingo.dev/)

## 🚀 Project Overview

**Meld** is a collaborative task management and real-time communication platform built to break down language barriers in remote teams. Designed for the **Lingo.dev Hackathon**, Meld seamlessly integrates task tracking with instant, AI-powered translation for chat messages, ensuring that language is never a bottleneck for productivity.

Whether you're brainstorming in a group chat, managing a Kanban board, or collaborating on rich-text notes, Meld keeps everyone on the same page—literally and linguistically.

### ✨ Key Features

*   **🌐 Real-time Chat Translation**: Instantly translate chat messages into multiple languages (English, Hindi, Spanish, French, German, Chinese) using the **Lingo.dev SDK**.
*   **📋 Collaborative Task Boards**: Manage projects with intuitive drag-and-drop task lists.
*   **📝 Rich Text Notes**: Create and share beautiful documents using our **Tiptap**-powered editor.
*   **🌍 Interactive Connectivity**: Visualize your global team connections with a 3D interactive globe powered by **Magic UI**.
*   **🎨 Stunning UI**: A modern, dark-mode-first interface built with **shadcn/ui** and **Framer Motion** for fluid animations.
*   **🔒 Secure Authentication**: Robust user management via **Supabase Auth** (Google & GitHub integration).

---

## 📸 Screenshots

<img width="1920" height="1695" alt="Meld Dashboard Preview" src="https://github.com/user-attachments/assets/09a902c7-caca-4503-af6c-d1933e4d6808" />

> *Tip: Drag and drop screenshots of the Dashboard, Chat Interface with Translation Dialog, and Task Board here.*

---

## 🛠 Tech Stack

Meld is built with a cutting-edge stack focused on performance, interactivity, and developer experience:

| Category | Technology | Usage |
|----------|------------|-------|
| **Framework** | **Next.js 16 (App Router)** | Core application structure, fast routing, and server actions. |
| **Language** | **TypeScript** | Type-safe development for robust code. |
| **Styling** | **Tailwind CSS 4** | Rapid, utility-first styling with the latest features. |
| **Components** | **shadcn/ui** | Accessible, reusable UI components based on Radix UI. |
| **Animations** | **Framer Motion** & **Magic UI** | Fluid pages, layout transitions, and the interactive globe. |
| **Backend/Auth** | **Supabase** | Postgres database, real-time subscriptions, and authentication. |
| **AI/Translation** | **Lingo.dev** | The powerhouse behind our accurate, context-aware translations. |
| **Editor** | **Tiptap** | Headless wrapper for ProseMirror giving us a custom rich-text note experience. |

---

## 🧩 Features Deep Dive

### 🗣️ Lingo.dev Integration
At the heart of Meld's cross-border collaboration is the **Lingo.dev** integration. We utilize `LingoDotDevEngine` to provide high-quality localized text.
- **On-demand Translation**: Users can click to translate any message in a chat thread.
- **Smart Detection**: The system automatically detects source languages and adapts to the user's preferred locale.
- **Implementation**: Check out `src/app/api/translate/route.ts` and `src/components/chat/translate-dialog.tsx` to see how we handle translation requests securely.

### 📝 Notes & Tasks
- **Tasks**: Organized in a Kanban-style view, allowing users to move items between "To Do", "In Progress", and "Done".
- **Notes**: A Notion-like editing experience supporting markdown shortcuts, image embedding, and formatting.

### 🎨 UI/UX & Animations
- **Magic UI Globe**: A stunning visualization on the dashboard connecting users across the world.
- **Glassmorphism**: Subtle backdrops and gradients for a premium feel.
- **Responsive Design**: Fully functional on mobile and desktop devices.

---

## 🚀 Getting Started

Follow these steps to set up Meld locally.

### Prerequisites
- Node.js 18+
- npm or pnpm
- A **Supabase** project (for DB and Auth)
- A **Lingo.dev** API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/therandomuser03/meld.git
    cd meld
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

4.  **Configure Environment Variables**
    Open `.env` and fill in your keys:

    | Variable | Description |
    | men | men |
    | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
    | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Your Supabase Anon Key |
    | `DATABASE_URL` | Supabase Transaction Pooler URL (6543) |
    | `DIRECT_URL` | Supabase Session Mode URL (5432) |
    | `LINGO_API_KEY` | **Crucial:** Your API Key from Lingo.dev |
    | `GOOGLE_CLOUD_ID` / `_SECRET` | For Google OAuth |
    | `GITHUB_CLIENT_ID` / `_SECRET` | For GitHub OAuth |

5.  **Initialize Database**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

6.  **Run Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to see the app!

---

## 📂 Project Structure

```
src/
├── app/                # Next.js App Router pages and API routes
│   ├── api/            # Backend endpoints (including /translate)
│   ├── (app)/          # Protected app routes (dashboard, tasks, chat)
│   └── (marketing)/    # Landing page routes
├── components/         # React components
│   ├── chat/           # Chat logic & translation dialogs
│   ├── magicui/        # Visual effects components
│   └── ui/             # shadcn/ui primitives
├── lib/                # Utilities and helper functions
│   └── supabase/       # Supabase client configuration
└── prisma/             # Database schema and migrations
```

---

## 🏆 Hackathon Context

Meld was built specifically for the **Lingo.dev Hackathon**.

**The Challenge:** Build an app that leverages Lingo.dev's i18n and translation capabilities.

**Our Solution:** We didn't just want to translate static content; we wanted to translate *conversation*. By integrating Lingo.dev directly into our chat workflow, we enable dynamic, on-the-fly communication between users who speak different languages.

**Key Learnings:**
- Implementing the `LingoDotDevEngine` SDK was straightforward and powerful.
- Balancing real-time state (Supabase) with async translation actions required careful UI state management (loading states, optimistic updates).

---

## 🔮 Future Roadmap

- [ ] **Voice-to-Text Translation**: Adding audio transcription and translation.
- [ ] **Document Translation**: Translate entire Note documents with one click.
- [ ] **Team Workspaces**: Deeper permission models for enterprise teams.
- [ ] **Mobile App**: React Native export for iOS/Android.

---

## ❤️ Acknowledgments

A huge thank you to:

*   **[Lingo.dev](https://lingo.dev/)** for the incredible hackathon opportunity and the robust translation SDK.
*   **Vercel** for Next.js.
*   **Supabase** for making backend infrastructure effortless.
*   **Magic UI** & **shadcn** for the beautiful component libraries.

---

## 👤 Author

**Anubhab**
- Website: [anubhab.site](https://anubhab.site)
- GitHub: [@therandomuser03](https://github.com/therandomuser03)

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.
