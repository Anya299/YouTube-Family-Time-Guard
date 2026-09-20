# YouTube Family Time Guard ♡

A free, local Chrome/Edge Manifest V3 extension that gently reminds a YouTube viewer after **2 hours of active video playback in a local calendar day**.

## What it does

- Counts only while a YouTube video is actually playing.
- Counts only while the YouTube tab is visible.
- Does not count paused videos.
- Persists today's timer with Chrome extension local storage.
- Automatically starts a fresh timer on a new local calendar day.
- Keeps counting when YouTube changes videos or uses its single-page navigation.
- At the limit, pauses the current video and shows a polished family-time overlay.
- Plays a local Web Audio chime; no sound file or external site is required.
- Uses browser-native speech synthesis to say:
  "2 hours kala nodidira, family jothe time spend madi, chinte beda."
- "Continue to YouTube" dismisses the reminder and resumes playback.
- "OK — Family Time" leaves the video and navigates to YouTube Home.
- No server, database, account, API key, paid service, Node.js, npm, or internet API is required.

## Important design choice

The extension does not permanently block YouTube. The reminder is a user-controlled pause point, and **Continue to YouTube** always remains available.

## Quick testing

The production setting is in:

`extension/config.js`

You will see:

`const LIMIT_SECONDS = 2 * 60 * 60;`

For a one-minute test, temporarily change it to:

`const LIMIT_SECONDS = 60;`

After changing it, go to `chrome://extensions`, find the extension, and click **Reload**.

For a clean test, also open the extension popup and click **Reset today's timer**.

## Windows + Chrome installation

1. Download the ZIP and extract it.
2. Open Chrome.
3. Type `chrome://extensions` in the address bar and press Enter.
4. Turn **Developer mode** ON.
5. Click **Load unpacked**.
6. Open the extracted `YouTube_Family_Time_Guard` folder and select its **extension** folder.
7. Open YouTube and play a video.
8. For testing, change `LIMIT_SECONDS` to `60` in `extension/config.js`, reload the extension, reset the timer, and play for one minute.

## Microsoft Edge

1. Extract the ZIP.
2. Open Edge.
3. Type `edge://extensions`.
4. Turn **Developer mode** ON.
5. Click **Load unpacked**.
6. Select the project's **extension** folder.
7. Open YouTube and play a video.

## Testing checklist

### Active playback counts
- Start a YouTube video and keep the tab visible.
- The popup's "Today's YouTube time" should increase.

### Paused playback does not count
- Pause the video for 30–60 seconds.
- The timer should stop increasing.

### Hidden tab does not count
- Keep the video playing.
- Switch to another tab for a while.
- The timer should stop while the YouTube tab is hidden.

### Video changes
- Change to another YouTube video.
- The same daily timer should continue rather than starting over.

### Limit reminder
- Set `LIMIT_SECONDS = 60`.
- Reset today's timer from the extension popup.
- Play YouTube for about one minute.
- The video should pause.
- The full-screen reminder should appear.
- A bell/chime should play.
- Browser speech should read the reminder.
- Click **Continue to YouTube** to resume.
- Click **OK — Family Time** to go to YouTube Home.

## If you edit the extension

After changing extension files:
1. Save the files.
2. Open `chrome://extensions`.
3. Click **Reload** on Family Time Guard.
4. Refresh YouTube.

## Privacy

The extension stores only its local timer state in Chrome extension storage. It does not send the timer, browsing history, video titles, or personal data to a server.

## Browser notes

Speech synthesis and audio can be affected by browser permissions or device volume settings. The extension uses Web Audio API for the bell, so it does not download an audio file.

This project intentionally uses plain HTML, CSS, and JavaScript with Manifest V3.
