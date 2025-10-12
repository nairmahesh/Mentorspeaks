# effyMentor - Navigation Guide

## How Users Access All Pages

### **Homepage (`/`)**
The main landing page showcases:
- Featured mentor answers
- Industry stalwarts
- Platform statistics
- **New Regional Chapters Section** with cards for all 3 chapters
- Direct links to explore each chapter

### **Navigation Menu**

#### **For Logged-In Users (Layout.tsx)**
Top navigation bar includes:
- 🏠 **Home** → `/` - Homepage
- 📻 **Podcasts** → `/podcasts` - Browse all podcasts
- 💬 **Questions** → `/questions` - Browse Q&A
- 📍 **Chapters** → `/chapters` - Regional chapters hub
- 📊 **Dashboard** → `/mentor/dashboard` (Mentors only)
- 👤 **Profile** → `/profile` - User profile settings
- 🔐 **Sign Out**

#### **For Moderators (Additional Links)**
- ⚙️ **Podcasts** → `/podcasts/manage` - Manage podcasts
- 🛡️ **Community** → `/community/manage` - Manage chapters & members

#### **For Public Users (PublicLayout.tsx)**
Top navigation includes:
- **Browse Questions** → `/questions`
- **Industries** → `/industries`
- **Chapters** → `/chapters` - NEW!
- **Become a Mentor** → `/mentors`
- **For Corporates** → `/corporate`
- **Sign In / Get Started**

### **Footer Links**

#### **For Seekers Section**
- Browse Questions → `/questions`
- Ask a Question → `/questions/ask`
- Explore Industries → `/industries`
- **Regional Chapters** → `/chapters` - NEW!

#### **For Mentors Section**
- Why Be a Mentor → `/mentors`
- Browse Mentors → `/browse-mentors`
- Sign Up as Mentor → `/register`
- Answer Questions → `/questions`

#### **For Corporates Section**
- Enterprise Solutions → `/corporate`
- Get Started → `/corporate/signup`
- Contact Sales → `/contact`

---

## Regional Chapters Access Flow

### **1. Discovery**

Users can discover chapters through:

**A. Homepage Section**
- Scroll down to "Regional Chapters" section
- See 3 chapter cards with descriptions
- Click "Explore Chapter" on any card → Direct to chapter detail page
- Click "View All Chapters" button → Goes to `/chapters`

**B. Main Navigation**
- Click "Chapters" in top nav → Goes to `/chapters`

**C. Footer Links**
- "Regional Chapters" link under "For Seekers" → Goes to `/chapters`

### **2. Chapters Hub (`/chapters`)**

Shows all regional chapters:
- **India MentorSpeak** (India, Bangladesh, Sri Lanka, Nepal, Pakistan, Bhutan, Maldives)
- **Middle East MentorSpeak** (UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Jordan, Lebanon, Egypt, Turkey, Israel)
- **Women in Leadership - SEA** (Singapore, Malaysia, Indonesia, Thailand, Philippines, Vietnam, Myanmar, Cambodia, Laos, Brunei, Timor-Leste)

Each chapter card shows:
- Member count
- "Joined" badge (if already a member)
- Click any card → Goes to chapter detail page

### **3. Chapter Detail Page (`/chapters/{slug}`)**

**Available to Everyone (Before Joining):**
- View chapter overview
- See eligible countries
- Meet leadership team
- Browse upcoming events
- **Request to Join** button (for mentors with country set)

**Additional for Members:**
- Access "Discussions" tab
- Participate in chapter-only discussions
- Register for events
- View full member list

**4 Tabs on Chapter Detail Page:**

#### **Overview Tab**
- Chapter description
- Eligible countries (as badges)
- Leadership team preview
- Upcoming events preview

#### **Events Tab** (Public)
- All upcoming chapter events
- Event details (type, time, location)
- Registration counts
- "Register" button for logged-in users
- "Registered" badge if already registered

#### **Discussions Tab** (Members Only)
- Chapter-exclusive discussions
- Categories: Announcement, Question, Resource, General
- Pinned discussions at top
- View counts and reply counts
- Create new discussions

#### **Leadership Team Tab** (Public)
- Full leadership profiles
- Roles: Chapter Lead, Co-Lead, Community Manager, Advisor
- Bios and backgrounds
- LinkedIn connection links

---

## Chapter Features Access

### **Events**

**Who Can See:**
- Everyone can view published events (public discovery)

**Who Can Register:**
- Any logged-in user
- One-click registration

**Who Can Create:**
- Chapter leadership
- Community moderators

**Event Types:**
- 🎥 Webinar
- 🤝 Meetup
- 🛠️ Workshop
- 🌐 Networking
- 🎤 Conference

### **Discussions**

**Who Can See:**
- Only chapter members (exclusive)

**Who Can Participate:**
- Only chapter members can create discussions
- Only chapter members can reply

**Who Can Moderate:**
- Chapter leadership can pin discussions
- Chapter leadership can manage all content

### **Join Requests**

**Requirements:**
- User must be a mentor
- User must have country set in profile (`/profile`)
- Country must be in chapter's eligible list

**Process:**
1. Mentor fills out country in profile
2. Visits chapter detail page
3. Clicks "Request to Join"
4. Request goes to chapter leadership
5. Leadership reviews in `/community/manage`
6. Upon approval → becomes active member

---

## Profile Setup for Chapter Access

### **Required Field: Country**

To join a chapter, users must:
1. Go to `/profile`
2. Fill out **Country** field (dropdown with all eligible countries)
3. Save profile
4. Return to chapter page and request to join

The system validates:
- User has country set
- Country matches chapter's allowed countries
- User is a mentor (only mentors can join chapters)

---

## Admin/Leadership Access

### **Community Management (`/community/manage`)**

**Who Can Access:**
- Super admins
- Chapter admins
- Community moderators

**What They Can Do:**
- View all join requests
- Approve/reject membership requests
- Appoint chapter leadership
- Manage chapter events
- Pin/unpin discussions
- View member lists and activity

### **Chapter Leadership Roles**

**Chapter Lead** 👑
- Primary chapter leader
- Full admin access

**Co-Lead** 🛡️
- Secondary leadership
- Support chapter operations

**Community Manager** ✓
- Day-to-day operations
- Event management

**Advisor** 👥
- Strategic guidance
- Mentorship support

---

## Complete User Journey Example

### **New User Interested in Chapters:**

1. **Lands on homepage** → Sees "Regional Chapters" section
2. **Clicks "Explore Chapter"** on India MentorSpeak → Goes to `/chapters/india-mentorspeak`
3. **Views Overview tab** → Sees description, eligible countries, leadership
4. **Clicks Events tab** → Sees upcoming webinars and meetups
5. **Clicks Leadership Team tab** → Meets the chapter leaders
6. **Wants to join** → Clicks "Request to Join" button
7. **System prompts** → "Please update your profile with your country"
8. **Goes to `/profile`** → Selects "India" from country dropdown → Saves
9. **Returns to chapter page** → Clicks "Request to Join"
10. **Success!** → "Join request submitted! Chapter leadership will review your request."
11. **Status updates** → Badge shows "Request pending"
12. **Leadership approves** → Badge changes to "You're a member"
13. **New tab appears** → "Discussions" tab now visible
14. **Full access** → Can join discussions, register for events, connect with members

---

## Quick Access Map

```
Homepage (/)
│
├── Regional Chapters Section
│   ├── India MentorSpeak → /chapters/india-mentorspeak
│   ├── Middle East MentorSpeak → /chapters/middle-east-mentorspeak
│   ├── Women in Leadership - SEA → /chapters/women-leadership-sea
│   └── View All Chapters → /chapters
│
├── Top Navigation
│   ├── Chapters → /chapters
│   ├── Questions → /questions
│   ├── Industries → /industries
│   └── Podcasts → /podcasts
│
└── Footer
    └── Regional Chapters → /chapters

Chapters Hub (/chapters)
│
├── Chapter Cards (3 total)
│   └── Click any card → /chapters/{slug}
│
└── Chapter Detail (/chapters/{slug})
    ├── Overview Tab (Public)
    ├── Events Tab (Public)
    ├── Discussions Tab (Members Only)
    └── Leadership Team Tab (Public)
```

---

## Industries Added

✅ **Agriculture** - Farming, agritech, food production (Wheat icon)
✅ **BFSI** - Banking, Financial Services, Insurance (Landmark icon)
✅ **Pharmaceuticals** - Healthcare, life sciences (Pill icon)
✅ **Retail** - E-commerce, consumer goods (ShoppingCart icon)

These are now available in the industries list and mentors can select them during profile setup!
