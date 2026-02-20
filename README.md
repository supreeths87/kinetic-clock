# Kinetic Clock

A browser-based animated digital clock where each digit is formed by moving car icons into seven-segment patterns.

## Overview

This project renders a four-digit clock (`HH:MM`) using animated taxi/car SVG elements. Each digit is a 9x5 grid, and cars move between parking positions and active segment cells whenever the time changes.

The UI includes two visual themes (called "flair" modes):
- **Option 1: Cinematic Glow**
- **Option 2: Neon Grid**

## Features

- Animated car-based seven-segment digits
- Smooth enter/exit transitions for active/inactive cars
- Blinking separator dots between hours and minutes
- Theme switcher with cinematic and neon styles
- Snowfall-style animated background layer
- Responsive layout for desktop, tablet, and mobile

## Project Structure

- `index.html` — App markup and layout
- `style.css` — Visual styling, animations, and responsive rules
- `script.js` — Clock logic, car positioning, segment mapping, and theme switching

## How It Works

1. On page load, the app creates car elements for each cell of every digit container.
2. Every second, it checks the current time and updates only when the displayed value changes.
3. For each digit, the app computes which segment cells should be active.
4. Cars for active cells move into place; non-active cars return to parking positions and fade out.
5. On window resize, car coordinates are recalculated to keep alignment correct.

## Run Locally

No build tool or dependencies are required.

### Option 1: Open directly

- Open `index.html` in a browser.

### Option 2: Use a local static server (recommended)

If you have Node.js:

```bash
npx serve .
```

Then open the local URL shown in your terminal.

## Customization

- Change car size in `script.js` (`carWidth`, `carHeight`) and matching `.car-container` dimensions in `style.css`.
- Tune animation timing in `script.js` (`enterStepDelay`, `exitStepDelay`) and CSS transitions for `.car-container`.
- Adjust flair visuals under `body.flair-cinematic` and `body.flair-neon` in `style.css`.
- Modify digit segment logic in `script.js` (`digitSegments`, `defineSegmentCells`).

## Browser Support

Works in modern browsers that support:
- ES6 classes
- `requestAnimationFrame`
- CSS animations/transitions
- SVG rendering

## License

No license file is currently included. Add a `LICENSE` file if you plan to distribute or open-source this project.
