# Campaign Amplification Mobile Platform Prototype

An end-to-end, mobile-first prototype built with **React Native**, **Expo SDK 58**, and **TypeScript** for the **Campaign Amplification Hackathon**.

The **Campaign Amplification Platform** is a community-funded message distribution network. It is **not a donation platform**; contributions pool toward verified digital advertising flights (Meta, Google, X, Web Display) to deliver fact-checked stories and research directly to targeted audiences beyond an author's existing social network.

---

## 🌟 Architecture & Key Features

### 1. Stable 5-Destination Bottom Navigation
- **Home**:
  - Hero Value Proposition: Clear distinction between message amplification vs charitable donation.
  - Interactive **Reach Estimator Calculator Widget**: Dynamic calculation translating dollar amounts into verified impression estimates with transparent CPM model disclaimers.
  - 3-Step Visual Process: **Create $\rightarrow$ Review $\rightarrow$ Amplify**.
  - Featured & Active Campaigns Feed with live progress bars and one-tap backing CTA.
- **Explore**:
  - Instant live keyword search across titles, summaries, and creator organizations.
  - 10 Campaign Categories with filter pills (*Environment, Health, Science, Education, Public Policy, Economic Policy, Community, Arts & Culture, Business, Other*).
  - Multi-criteria sorting: *Trending, Most Funded, Max Reach*.
  - Handled loading, empty, and no-results states with single-tap filter reset.
- **Create (5-Step Creation Flow with Persistent Progress)**:
  - **Dual Entry**: *Create Manually* or *Create with Your Voice* (speech-to-text interview simulation with animated voice waves and demo fallbacks).
  - **Step 1 — Basics**: 60-character title counter, required category picker, creator/org details, short summary, cover imagery, and an **AI Propose** assistant button.
  - **Step 2 — Story**: Editorial article composer with customizable, rearrangeable story sections, statistics callout blocks, and **Visible Supporting Sources & Evidence** (title, publisher, URL).
  - **Step 3 — Campaign & Ad Visuals**: Separation of editorial narrative from ad creatives, with real-time interactive ad placement previews (*Social Feed, 9:16 Vertical Story, Display Banner*).
  - **Step 4 — Reach**: Geographic targeting chips, interest clusters, distribution channel toggles (*Meta, Google, X, Web Display*), duration controls, and platform review disclaimers.
  - **Step 5 — Submit**: Full pre-submission review, manual creator-set funding goal with instant reach calculation, policy confirmation checkboxes, and post-submission status timeline (*Submission $\rightarrow$ Fact-Check Audit $\rightarrow$ Policy Approval $\rightarrow$ Backing $\rightarrow$ Ad Flight*).
- **Activity**:
  - In-app notification center for funding milestones, reviewer decisions, and distribution delivery.
  - Categorized filters (*Milestones, Review & Status, Distribution & Spend*) with deep-linking into specific campaign pages.
- **Profile & Creator Dashboard**:
  - Creator campaign management with status tabs (*Drafts, Under Review, Published / Funding, Promoting, Completed, Requires Action*).
  - Moderation feedback inspection and in-progress draft resumption.
  - Backer contribution history with verified receipts and reach metrics.
  - **Bonus Reviewer / Admin Mode**: A live review console allowing hackathon evaluators to inspect pending campaigns, verify citations, and approve or request edits in real time!
  - Dark & Light mode toggle with persistent preferences.

### 2. Core Flow 4: Campaign Detail Page
- Rich editorial layout with sticky navigation, bookmarks, and native share integration.
- Visible supporting evidence citations linking directly to peer-reviewed sources.
- Expandable trust accordions detailing the review audit, distribution channels, and unspent funds refund policies.
- Interactive Reader Impact Poll (*"Did the visuals encourage you to read?"* / *"Did this message change your mind?"*).
- Backer discussion section with comment submission and verified backer badges.

### 3. Core Flow 5: Back a Campaign (Contribution Flow)
- Dynamic reach calculator updating in real time as contribution amount changes.
- Transparent 5% platform fee itemization.
- Multi-provider simulated checkout (*Instant Demo, Card, Apple Pay/Google Pay*).
- Reviewer simulation toggles for **Succeeded**, **Pending**, and **Failed** transaction states.
- Confirmation modal with downloadable/printable receipt number, instant social share trigger, and updated funding progress.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or npx

### Run the App Locally
```bash
# 1. Install dependencies (already installed)
npm install

# 2. Start the Expo development server
npx expo start

# 3. Choose your platform:
# Press 'w' in the terminal to open in web browser
# Press 'a' to open in Android Emulator
# Press 'i' to open in iOS Simulator
# Or scan the QR code with Expo Go on your physical device
```

### Type Checking & Build Verification
```bash
# Verify TypeScript types:
npx tsc --noEmit

# Test bundle export:
npx expo export -p web
```

---

## 📱 Building the Android APK (For Submission)

To build a standalone installable Android APK file:
```bash
# Login to your Expo account:
npx eas-cli login

# Build standalone APK using the preview profile:
npx eas-cli build -p android --profile preview
```
The resulting direct `.apk` link will be generated in your terminal and downloadable from your EAS dashboard!

---

## 📂 Project Directory Structure

```
├── App.tsx                          # Root entry with navigation, SafeArea, & Theme
├── app.json                         # Expo configuration (bundle ID, package name)
├── eas.json                         # EAS build configuration for APKs
├── src/
│   ├── components/
│   │   ├── common/                  # Button, Badge, Card, ProgressBar, Input, Skeleton
│   │   ├── campaign/                # CampaignCard, ReachEstimatorWidget
│   │   └── backing/                 # ContributionModal with simulated checkout
│   ├── context/
│   │   ├── CampaignContext.tsx      # Central state (campaigns, drafts, contributions, admin actions)
│   │   └── ThemeContext.tsx         # Dark / Light theme tokens & persistence
│   ├── data/
│   │   ├── initialCampaigns.ts      # Rich demo campaigns across diverse categories
│   │   └── initialNotifications.ts  # Notification center demo events
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Hero, reach calculator, How It Works, feed
│   │   ├── ExploreScreen.tsx        # Search, 10 categories, sorting, empty states
│   │   ├── CreateScreen.tsx         # 5-step guided creation, AI propose, ad visuals
│   │   ├── VoiceCreateModal.tsx     # Voice-guided AI creation assistant
│   │   ├── ActivityScreen.tsx       # Notification center with categorized filters
│   │   ├── ProfileScreen.tsx        # Creator dashboard, backed history, Reviewer console
│   │   └── CampaignDetailScreen.tsx # Editorial story, visible sources, poll, comments
│   ├── theme/
│   │   └── index.ts                 # Colors, typography, spacing, shadows
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces for all domain entities
│   └── utils/
│       └── reachCalculator.ts       # CPM-based dynamic reach estimation engine
```

