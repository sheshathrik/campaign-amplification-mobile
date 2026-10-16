# 🏆 Hackathon Video Demo Script & Presentation Guide

Use this battle-tested, word-for-word demo script to record your submission video for the **Campaign Amplification Hackathon**.

**Target Duration**: 3 to 5 minutes  
**Tone**: Confident, product-minded, engineering-focused.

---

## 🎬 Act 1: The Core Value Proposition (0:00 - 0:45)
**Screen**: Home Tab ([HomeScreen.tsx](file:///Users/sheshathrik/Desktop/working%20mobile%20application%20prototype/src/screens/HomeScreen.tsx))

> *"Hello everyone! Today I'm presenting our complete, mobile-first prototype for the **Campaign Amplification Platform**, built natively using **React Native**, **Expo SDK 58**, and **TypeScript**.*
>
> *First and foremost, **this is not a donation platform**. Traditional crowdfunding sends money to personal accounts with zero delivery accountability. The Campaign Amplification Platform allows communities, researchers, and creators to pool contributions directly into wholesale digital advertising flights—delivering fact-checked messages to targeted audiences beyond their followers.*
>
> *Notice right here on the Home screen our interactive **Community Reach Calculator**: as I tap different contribution amounts—say, $50 or $100—it dynamically calculates the expected targeted reach and verified impressions using a realistic CPM model, clearly marked as an estimate, not a guarantee.*
>
> *Below, we clearly explain the 3-step sequence: **Create $\rightarrow$ Review $\rightarrow$ Amplify**."*

---

## 🔍 Act 2: Campaign Discovery & State Handling (0:45 - 1:30)
**Screen**: Explore Tab ([ExploreScreen.tsx](file:///Users/sheshathrik/Desktop/working%20mobile%20application%20prototype/src/screens/ExploreScreen.tsx))

> *"Let’s hop into the **Explore** tab. Anyone can discover and verify campaigns without needing an account.*
>
> *We have real-time keyword search and all 10 suggested categories—Environment, Health, Science, Education, Economic Policy, and more. When I filter by 'Health', you see campaigns like our generic biosimilar campaign.*
>
> *If I type a search query with no matches, watch how we handle edge cases: we display a clean **No-Results State** with an immediate 'Reset All Filters' button that restores the feed with one tap. No dead ends."*

---

## 📖 Act 3: Editorial Story & Visible Sources (1:30 - 2:30)
**Screen**: Campaign Detail Page ([CampaignDetailScreen.tsx](file:///Users/sheshathrik/Desktop/working%20mobile%20application%20prototype/src/screens/CampaignDetailScreen.tsx))

> *"Let’s tap on 'Protecting Coastal Mangroves'. Notice how the screen prioritizes editorial readability over cluttered UI.*
>
> *We have the verified creator profile, funding progress, and reach projection. Scrolling down, we see the article narrative with statistical callouts.*
>
> *Now, notice this crucial requirement: **Supporting Evidence & Sources are 100% visible to the audience**. Users can tap directly on peer-reviewed citations from Nature Climate Change or NOAA Fisheries.*
>
> *Further down, we include:*
> 1. *Verified Distribution Audit Reports with real impressions delivered and channel breakdowns.*
> 2. *Expandable Trust Accordions explaining the review process, audience targeting, and our escrow refund policy.*
> 3. *An interactive **Reader Impact Poll**: readers can vote whether the visuals encouraged them to read or changed their perspective, updating live counters.*
> 4. *Backer discussion with verified backer badges."*

---

## 💳 Act 4: Backing Flow & Simulated Checkout (2:30 - 3:15)
**Screen**: Contribution Modal ([ContributionModal.tsx](file:///Users/sheshathrik/Desktop/working%20mobile%20application%20prototype/src/components/backing/ContributionModal.tsx))

> *"Let’s back this campaign! Tapping 'Back This Campaign' launches our streamlined 6-step contribution flow:*
> 1. *First, we select preset amounts ($25, $50, $100) or enter a custom amount. The estimated reach updates in real time.*
> 2. *Next, we see the transparent fee review: $50 contribution plus a 5% platform fee equals $52.50 total.*
> 3. *For checkout, we support Apple Pay, Credit Card, and Instant Demo. For this prototype, we even included a **Reviewer Simulator Toggle** so judges can simulate 'Success', 'Pending', or 'Failed' states.*
> 4. *When I complete payment, we generate a formal receipt number, update the campaign’s live funding progress, and provide an instant one-tap social share trigger."*

---

## ✍️ Act 5: 5-Step Creator Flow & Voice Assistant (3:15 - 4:15)
**Screen**: Create Tab ([CreateScreen.tsx](file:///Users/sheshathrik/Desktop/working%20mobile%20application%20prototype/src/screens/CreateScreen.tsx))

> *"Now to the most important creator workflow: **Campaign Creation**.*
>
> *Creators can start manually or tap **Use Voice**. The voice assistant simulates an interactive speech interview with live wave animations and transcription that automatically drafts the campaign.*
>
> *The 5-step flow follows the exact required order:*
> - *Step 1 — **Basics**: 60-character title counter, required categories, creator info, and an AI Propose helper.*
> - *Step 2 — **Story**: Article composer where creators add rearrangeable sections and attach public sources.*
> - *Step 3 — **Visuals & Ads**: Notice how we separate the editorial story from ad creatives. Creators can preview how their ad looks on a **Social Newsfeed**, **9:16 Vertical Story**, and **Web Display Banner**.*
> - *Step 4 — **Reach**: Creators select geographic targets and distribution channels (Meta, Google, X, Open Web).*
> - *Step 5 — **Submit**: **The creator manually sets the funding goal here**—it is never overwritten by AI. Once rules are confirmed, submitting places the campaign in the review queue with a status timeline."*

---

## 🛡️ Act 6: Creator Dashboard & Reviewer Console (4:15 - 5:00)
**Screen**: Profile Tab ([ProfileScreen.tsx](file:///Users/sheshathrik/Desktop/working%20mobile%20application%20prototype/src/screens/ProfileScreen.tsx))

> *"Finally, in the **Profile** tab:*
> - *Creators have a dashboard with status tabs: Drafts, Under Review, Published, Promoting, Completed, and Requires Action.*
> - *They can resume saved drafts with zero state loss.*
> - *And to demonstrate assignment review logic, we built a dedicated **Reviewer Mode**: judges can inspect submitted drafts, review cited sources, and approve campaigns live—instantly promoting them to the public feed!*
> - *We've also included full documentation for Platform Transparency, Escrow Refund Policies, and Dark/Light mode.*
>
> *Under the hood, we have a complete **PostgreSQL relational schema** and Express REST architecture in `backend/`.*
>
> *Thank you, and I look forward to contributing as part of the founding engineering team!"*
