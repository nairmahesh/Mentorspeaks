# Podcast System Setup Guide

## Overview
The podcast system allows moderators to create and manage podcast episodes with mentors as guests. It includes AI-generated questions, teleprompter features, and a professional recording interface.

## Getting Started

### Step 1: Make Yourself a Moderator

First, you need to be designated as a podcast moderator. Run this SQL command in your Supabase SQL Editor:

```sql
-- Replace 'your@email.com' with your actual login email
SELECT add_moderator('your@email.com', true);
```

The `true` parameter makes you an admin moderator (can manage all podcasts). Use `false` for regular moderator status.

### Step 2: Access the Podcast Management

After becoming a moderator:

1. **Log out and log back in** to refresh your session
2. You'll see a new **"Manage Podcasts"** link in the navigation bar
3. Click it to access the podcast management dashboard at `/podcasts/manage`

## Creating Your First Podcast Episode

### Method 1: Through the Management Dashboard

1. Go to `/podcasts/manage`
2. Click **"New Episode"** button
3. Fill in the episode details:
   - **Title**: Episode name (e.g., "Journey from Developer to CTO")
   - **Guest**: Select a mentor from your platform
   - **Moderator**: Select yourself or another moderator
   - **Episode Number**: Sequential number
   - **Recording Type**: Choose Video or Audio
   - **Scheduled Date**: Optional scheduling

### Method 2: Create a Series First

1. Click **"New Series"** to create a podcast series
2. Give it a name and description
3. Then create episodes within that series

## Adding Questions

You have two options for adding questions:

### Option A: AI-Generated Questions
1. Click **"Generate AI Questions"** button
2. The system will create 5 common interview questions
3. You can edit these questions as needed

### Option B: Manual Questions
1. Click **"Add Question"** to add custom questions
2. Enter the question text
3. Optionally add a **pre-filled answer** for the teleprompter

### Pre-filled Answers (Teleprompter)
- The answer text you add will appear in the teleprompter during recording
- This helps the guest stay on track or remember key points
- It's optional - guests can answer freely without pre-filled text

## Recording Interface

### Starting a Recording

1. From the management page, find your episode
2. Click the **video camera icon** next to the episode
3. This opens the recording interface at `/podcasts/episode/:id/record`

### Recording Interface Features

**Left Side: Video/Audio Preview**
- Shows the guest's video feed (for video recordings)
- Shows audio waveform visualization (for audio recordings)
- Guest's name and photo displayed

**Right Side: Questions & Teleprompter**
- **Top**: Current question displayed prominently
- **Middle**: Pre-filled answer text (if provided) for teleprompter
- **Bottom**: Navigation between questions

**Controls**:
- **Start Recording**: Green button to begin
- **Stop Recording**: Red button when recording
- **Question Navigation**: Previous/Next buttons or click question numbers
- **Complete & Save**: Finishes the recording session

### Recording Workflow

1. **Start Recording** - Click the green "Start Recording" button
2. **Ask Question** - The current question appears on screen
3. **Guest Reads Teleprompter** - Pre-filled answer appears below (optional)
4. **Navigate Questions** - Use arrows or numbers to move between questions
5. **Complete** - Click "Complete & Save" when done

## Managing Episodes

### Episode Status Flow

1. **Draft** - Initial creation, not visible to public
2. **Scheduled** - Episode scheduled for future recording
3. **Recording** - Currently being recorded
4. **Completed** - Recording finished, ready for review
5. **Published** - Live and visible on the Podcasts page

### Publishing Episodes

1. Edit the episode status to "Published"
2. Add a recording URL (where the video/audio is hosted)
3. Set the duration in minutes
4. Upload a thumbnail (optional)

## Viewing Published Episodes

- Public can view all published episodes at `/podcasts`
- Episodes show with guest information, view counts, and duration
- Click "Watch Episode" to view (you'll need to integrate actual video player)

## Tips & Best Practices

### For Moderators:
- Prepare 5-7 questions per episode
- Use AI questions as a starting point, then customize
- Add pre-filled answers for complex topics
- Test the recording interface before the actual session

### For Guests:
- Review questions beforehand
- Pre-filled answers are guidance, not a script
- Feel free to expand beyond the teleprompter
- Stay natural and conversational

### Technical:
- Video recordings need good lighting
- Audio recordings need quiet environment
- Test microphone before recording
- Have a backup recording method

## Making Other Users Moderators

To add more moderators:

```sql
-- Regular moderator
SELECT add_moderator('mentor@example.com', false);

-- Admin moderator
SELECT add_moderator('admin@example.com', true);
```

## Database Tables

The podcast system uses these tables:
- `podcast_series` - Podcast series/shows
- `podcast_episodes` - Individual episodes
- `podcast_questions` - Questions for each episode
- `podcast_moderators` - Users who can create/manage podcasts

## Troubleshooting

**"Access Denied" message?**
- Make sure you ran the `add_moderator()` function with your email
- Log out and log back in to refresh your session

**Don't see "Manage Podcasts" link?**
- Check if you're logged in
- Verify moderator status in database
- Clear browser cache and refresh

**Can't find mentors in dropdown?**
- Make sure users have `role = 'mentor'` in their profiles
- They need to be registered on the platform

**Questions not appearing in recording interface?**
- Make sure you saved the episode with questions
- Check that questions have `question_text` filled

## Next Steps

1. **Make yourself a moderator** using the SQL command
2. **Create your first episode** with a mentor
3. **Add questions** (use AI or manual)
4. **Test the recording interface**
5. **Publish** when ready

For support or questions, contact the development team.
