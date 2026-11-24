# Store screenshots

Upload the files in their order. They are slices of one wide picture, so the order matters.

- `ios/`: App Store, 6.9-inch iPhone, 1320 × 2868.
- `ios-6.3/`: App Store, 6.3-inch iPhone, 1206 × 2622. Use this set if App Store Connect asks for
  the 6.1-inch or the 6.3-inch display.
- `ipad/`: App Store, 13-inch iPad, 2064 × 2752. App Store Connect asks for this set because the
  app runs on the iPad.
- `play/`: Google Play, phone, 1080 × 1920.

Each `panorama.png` is the whole picture. Keep it for reference.

## How to make them again

The raw screens come from the web export of the mobile app, at the size of an iPhone. The capture hides the Ko-fi link, because the iOS app does not show it.

```bash
npm run calendar -- --release
(cd apps/mobile && npx expo export -p web --output-dir dist)
# Serve apps/mobile/dist with a fallback to index.html, on port 18186.
node store/screenshots/capture.cjs store/screenshots/raw      # needs playwright
node store/screenshots/compose.cjs store/screenshots/config.json store/screenshots   # needs sharp
```

To make only the iPad set, capture the screens at the size of a 13-inch iPad into `raw-ipad/`. Then
give the target `ipad` to `compose.cjs`. The other folders do not change.

```bash
node store/screenshots/capture.cjs store/screenshots/raw-ipad http://localhost:18186 --ipad
node store/screenshots/compose.cjs store/screenshots/config.json store/screenshots ipad
```

`compose.cjs` needs the fonts Inter and Source Serif 4. `config.json` holds the colours, the
headlines and the order of the screens.

## The bold set

`bold/` holds a second design, for a test against the first design. `compose-bold.cjs` draws it
from the same raw screens.

- The first card and the last card have a loud colour. One card in the middle is dark.
- Each headline has two to four words. The key word is large and italic.
- The phones tilt. Parts of each screen stand out of the phone at a larger size.

`bold.json` holds the colours, the headlines and the crops. The script needs `sharp`, and
`playwright` with its Chromium browser. The fonts are in `fonts/`.

```bash
NODE_PATH=<the node_modules with sharp and playwright> node compose-bold.cjs bold.json bold
```
