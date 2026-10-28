# User guide — QR Code Studio

## 1. Create a QR code

1. Choose a format in **Content**: URL, text, WiFi, vCard, event, place, contact
   or crypto.
2. Fill in the fields. Validation is immediate: errors appear under the relevant
   field and export stays disabled until the content is valid.
3. The preview and scannability report update automatically.

Quick notes:

- **URL**: only `http` and `https` are accepted.
- **Text**: up to 1,000 characters.
- **WiFi**: the password is required unless the network is open (`nopass`). The
  SSID and password are escaped correctly.
- **vCard**: last name is required; other details are optional.
- **Event**: the end must be later than the start.
- **Place**: latitude between -90 and 90, longitude between -180 and 180. Decimal
  commas are accepted.
- **Contact**: choose email, phone or SMS; the fields change with the channel.
- **Crypto**: address required, optional amount must be strictly positive.

## 2. Read the scannability report

The displayed QR code is rendered at the selected export size, then actually
decoded in the browser.

| Status            | Meaning                                                       |
| ----------------- | ------------------------------------------------------------- |
| **Scannable**     | The decoder reads exactly the expected content.               |
| **Attention**     | The code is readable, but a safety rule is weakened.          |
| **Non scannable** | The decoder cannot read the content, or reads something else. |

Possible warnings:

- logo above **20%** of the QR surface;
- error correction below **Q** while a logo is present;
- margin below **4 modules**;
- contrast below **4.5:1**;
- lighter modules than the background.

Each warning offers a fix: reduce the logo, switch to H, restore a 4-module margin
or strengthen contrast. Export remains available in orange or red, but a warning
is shown: do not use those files in production without fixing the issue.

## 3. Style the code

- **Presets**: four starting points (minimal, corporate, warm, editorial).
- **Modules**: square, rounded, dots, classy, classy rounded, extra rounded.
- **Corners**: outer corner shape and corner core shape.
- **Colours**: solid, linear gradient or radial gradient, with gradient rotation.
- **Logo**: PNG, JPEG or SVG up to 1 MiB. SVG files are sanitised; scripts, event
  handlers and external references are removed.
- **Size**: 128, 256, 512 or 1024 px, or a custom value up to 2048 px.
- **Margin**: 0 to 8 modules. Keep at least 4 modules for print.
- **Correction**: L, M, Q or H. Adding a logo automatically switches to H.

Tips:

- a logo covering **10–15%** is safer than one near 20%;
- avoid gradients with very light or highly variable modules;
- dark modules on a light background remain the most reliable combination;
- check the final rendered size, not only the on-screen preview.

## 4. Export and print

| Format        | Best use                                             |
| ------------- | ---------------------------------------------------- |
| **PNG**       | Screens, social media, office documents              |
| **SVG**       | Vector printing, cutting, editing in design software |
| **PDF A4**    | Paper printing with crop marks                       |
| **Clipboard** | Paste a PNG directly into another application        |

- PNG uses the selected size. **Transparent background** removes the background
  for compositing.
- SVG is vector-based and contains the styled QR code.
- The PDF is A4 with crop marks; print at **100%**, without “fit to page”.
- Always test a printed copy with several phones at a realistic distance. A code
  that scans on screen can fail on glossy, too-small or low-contrast media.

## 5. Local history

- Every valid content is saved automatically after your first edit.
- History keeps a thumbnail, type, description and content; reopen an entry to edit
  it again.
- The limit is configurable in **Settings**: 10, 25, 50 or 100 entries. Oldest
  entries are purged first.
- **Delete** removes one entry; **Clear all** empties history after confirmation.
- **Private mode** pauses saving and history for the current session. Turn it off
  to resume saving.

History stays in this browser and profile. There is no account, server or sync.
Clearing site data or using a private browsing window removes access to history.

## 6. Keyboard shortcuts

| Shortcut                     | Action              |
| ---------------------------- | ------------------- |
| `Ctrl`/`Cmd` + `S`           | Download the PNG    |
| `Ctrl`/`Cmd` + `Shift` + `D` | Toggle the theme    |
| `Ctrl`/`Cmd` + `Shift` + `L` | Toggle the language |
| `Escape`                     | Close a dialog      |

## 7. Troubleshooting

**Status is “Non scannable”**  
Reduce the logo, set the margin to 4 modules, switch to Q or H correction,
strengthen contrast, then check the expected content. If it persists, simplify the
module shape or increase the size.

**The logo is rejected**  
Check the format (PNG, JPEG or SVG) and size (1 MiB maximum). A malformed SVG or
one that only contains external references may also be rejected. Try a PNG.

**Export is disabled**  
The content is not valid yet. Fix the flagged fields; the pending verification can
also briefly block export.

**History no longer saves**  
Private mode may be active. Open **Settings** and turn it off. Also check that the
browser allows local storage for this site.

**Theme or language is not remembered**  
Preferences are stored in browser local storage. Private browsing or clearing site
data resets them.

## 8. Accessibility

The app works with a keyboard, announces status changes, traps focus inside
dialogs and respects the system reduced-motion preference. Contrast is checked for
WCAG 2.1 AA in both themes.
