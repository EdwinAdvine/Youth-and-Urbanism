# Voice Mode

This guide covers Voice Mode in Urban Home School, which allows The Bird AI to read its responses aloud using natural-sounding AI-generated speech. Voice Mode is powered by ElevenLabs for text-to-speech and Synthesia for AI video responses.

---

## What Is Voice Mode?

Voice Mode transforms text-based AI responses into spoken audio. Instead of reading long explanations, you can listen to The Bird explain concepts, walk you through problems, or narrate lesson summaries -- just like having a tutor speak to you directly.

Voice Mode is especially useful for:

- Students who learn better by listening (auditory learners)
- Younger students who find reading long text difficult
- Studying on the go (listening while commuting or doing chores)
- Accessibility needs (students with reading difficulties or visual impairments)
- Kiswahili language practice (hearing correct pronunciation)

---

## How Voice Mode Works

The process behind Voice Mode is straightforward:

1. **You ask a question** via text in The Bird AI chat.
2. **The Bird generates a text response** using the AI orchestrator (Gemini, Claude, Grok, or GPT-4).
3. **The text is sent to ElevenLabs**, which converts it to natural-sounding speech.
4. **The audio is played back** in your browser automatically or when you click the speaker icon.

The entire process happens in seconds. You will see the text response appear first, followed by the audio playback.

---

## Enabling Voice Mode

### Per-Response Playback

You can listen to any individual response without enabling Voice Mode globally:

1. Look for the **speaker icon** next to any AI response in the chat.
2. Click the icon to hear that specific response read aloud.
3. Click again to pause the audio.

### Global Voice Mode (Automatic Playback)

To have all responses automatically read aloud:

1. Open The Bird AI chat.
2. Click the **Settings** gear icon.
3. Find the **Voice Mode** toggle.
4. Switch it to **On**.
5. All subsequent AI responses will be automatically read aloud.

To disable automatic voice, return to Settings and switch the toggle to **Off**.

### From the CoPilot Sidebar

Voice mode is also available in the CoPilot sidebar, though with limited functionality:

- Per-response playback is supported (click the speaker icon).
- Automatic voice mode may not be available in the sidebar to avoid unexpected audio while browsing.

---

## Voice Options

### Voice Profiles

Urban Home School offers several voice profiles to choose from:

| Voice Profile | Description | Best For |
|--------------|-------------|----------|
| **Default (Mwalimu)** | Warm, clear Kenyan-accented English voice | General learning |
| **Amani** | Young, friendly voice | Younger students (Grade 1-4) |
| **Professor** | Authoritative, measured voice | Older students, exam preparation |
| **Storyteller** | Expressive, animated voice | Creative subjects, storytelling |

### Language Options

Voice Mode supports the following languages:

| Language | Description | Notes |
|----------|-------------|-------|
| **English** | Standard English with clear pronunciation | Default language |
| **Kiswahili** | Kiswahili with natural pronunciation | Great for language practice and listening comprehension |

The voice language is determined by the language of the AI response. If you ask The Bird to respond in Kiswahili, the voice will use the Kiswahili voice profile.

### Adjusting Voice Settings

1. Go to **Settings** in The Bird AI chat or CoPilot sidebar.
2. Navigate to **Voice Settings**.
3. Adjust the following:

| Setting | Options | Default |
|---------|---------|---------|
| **Voice Profile** | Mwalimu, Amani, Professor, Storyteller | Mwalimu |
| **Speed** | 0.5x (slow), 0.75x, 1x (normal), 1.25x, 1.5x, 2x | 1x |
| **Volume** | 0-100% | 80% |
| **Auto-play** | On / Off | Off |
| **Language Preference** | English / Kiswahili / Match response | Match response |

---

## When to Use Voice Mode

### Long Explanations

When The Bird provides a detailed explanation of a complex topic (e.g., the water cycle, how fractions work, or the history of Kenya), listening can be easier and more engaging than reading.

### On-the-Go Learning

If you are listening on a mobile device while commuting or doing other activities, Voice Mode allows you to continue learning without looking at the screen.

### Accessibility

Students who find reading challenging -- whether due to visual impairment, dyslexia, or other reading difficulties -- can benefit significantly from Voice Mode.

### Language Practice

For Kiswahili learners, hearing correct pronunciation from the AI voice helps reinforce proper speaking patterns and vocabulary.

### Revision and Review

Use Voice Mode to listen to summaries of topics you have already studied. Hearing the material again can reinforce your understanding.

---

## Video Responses with Synthesia

For certain topics, The Bird can generate short AI video lessons using Synthesia. These are different from voice-only responses.

### What Are Synthesia Video Responses?

Synthesia videos feature an AI-generated presenter who explains the topic visually. The video includes:

- An AI avatar speaking the explanation
- On-screen text highlighting key points
- Visual diagrams or illustrations (when applicable)

### When Video Responses Are Used

Video responses are not generated for every question. They are triggered when:

- The topic benefits from visual demonstration
- You explicitly request a video explanation: "Can you explain this with a video?"
- The instructor has configured video content for certain topics

### Video Response Limitations

- **Generation time**: Videos take 30 seconds to a few minutes to generate, depending on length.
- **Length**: Video responses are typically 1-3 minutes long.
- **Availability**: Video generation depends on the Synthesia API key being configured by the platform.
- **Mobile data**: Videos consume more data than text or audio responses.

### Playing Video Responses

1. When a video response is available, you will see a video player embedded in the chat.
2. Click the **Play** button to start the video.
3. Use standard video controls (pause, rewind, fullscreen).
4. The text version of the explanation is also provided alongside the video.

---

## Combining Text and Voice

Voice Mode does not replace text -- it complements it. When Voice Mode is active:

1. The text response appears in the chat window as usual.
2. The audio begins playing automatically (or on click, depending on your settings).
3. You can read along while listening, which is a powerful learning technique.
4. Pause the audio at any time without losing the text.

### Reading Along

Research shows that reading text while hearing it spoken aloud improves comprehension and retention. This "dual-channel" approach engages both your visual and auditory processing, making it easier to understand and remember information.

---

## Audio Playback Controls

When audio is playing, you will see playback controls:

| Control | Function |
|---------|----------|
| **Play / Pause** | Start or pause the audio |
| **Rewind 10s** | Jump back 10 seconds |
| **Forward 10s** | Jump forward 10 seconds |
| **Speed** | Change playback speed (0.5x to 2x) |
| **Volume** | Adjust volume level |
| **Stop** | Stop playback entirely |

These controls appear at the bottom of the chat or attached to the specific response being played.

---

## Limitations and Tips

### Limitations

- **Internet required**: Voice Mode requires an active internet connection to generate audio.
- **Response length**: Very long responses may take a few extra seconds to convert to audio.
- **Browser support**: Voice Mode works best in Chrome, Firefox, Safari, and Edge. Older browsers may have limited support.
- **Simultaneous playback**: Only one audio response plays at a time. Starting a new one will stop the previous.
- **Cost**: Voice generation uses the ElevenLabs API, which has usage limits. Excessive use may result in temporary throttling during high-demand periods.

### Tips for Best Experience

1. **Use headphones**: For the best audio quality, especially in noisy environments.
2. **Adjust speed for study**: Slow down to 0.75x when learning a new topic for the first time, and speed up to 1.5x for review sessions.
3. **Combine with flashcards**: Listen to explanations and then test yourself with the Flashcards quick action.
4. **Save mobile data**: On mobile networks, download lessons while on Wi-Fi and use text mode when on cellular data.
5. **Try Kiswahili voice**: Even if you primarily study in English, listening to Kiswahili explanations can improve your language skills.
6. **Use video sparingly**: Reserve video responses for topics that truly benefit from visual explanation to save generation time and data.

---

## Troubleshooting

**No audio plays when I click the speaker icon:**
- Check your device volume is turned up.
- Ensure your browser allows audio playback (some browsers block autoplay).
- Try clicking the speaker icon again.
- Refresh the page and try again.

**Audio quality is poor:**
- Check your internet connection speed.
- Try a wired connection instead of Wi-Fi.
- Use headphones for clearer audio.

**Video response is taking too long:**
- Video generation can take up to 2 minutes for complex topics.
- If it takes longer than 3 minutes, try refreshing and requesting the video again.
- The text version of the response is always available while the video generates.

**Voice Mode setting keeps turning off:**
- Clear your browser's local storage and re-enable the setting.
- Ensure you are saving your settings (check for a Save button).

**Audio plays at the wrong speed:**
- Check your speed setting in Voice Settings.
- Reset to 1x if the speed seems incorrect.

---

## Related Guides

- [The Bird AI Tutor Guide](./ai-tutor.md)
- [CoPilot Guide](./copilot.md)
- [Student Guide](../uhs-v1/student-guide.md)
