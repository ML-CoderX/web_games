# Wobble Delivery

A solo, browser-only 3D delivery game. Six unlocked courses, procedural geometry, free-body cargo physics, and synthesized Web Audio. No external media assets.

Courses: Kitchen Run, Delivery Docks, Rooftop Chaos, Pantry Express, Harbor Hop, and Skyline Sprint. The three added routes combine raised paths, crate bridges and a moving ferry, and a windy rooftop with a final jump.

## Run

```sh
npm install
npm run dev
```

Open the URL printed by Vite. Use a desktop browser with WebGL and a keyboard.

```sh
npm run build
npm run preview
npm test
```

## Controls

- WASD: camera-relative movement. Tap gently to build speed without upsetting the load.
- Space: jump when grounded.
- Click the course: capture the mouse; move the mouse to rotate the camera.
- Esc: pause/release the mouse. Tab blur also pauses.
- R: retry from the last checkpoint, adding one drop.
- M: mute synthesized sounds.
- Backtick: show or hide the live tuning panel.

## Tuning

Spring stiffness (60), damping (8), tilt factor (0.06), maximum tilt (0.5 radians), cargo friction (0.9 pizza / 0.8 crates / 0.3 egg), cargo mass (1 kg per body), player speed (5 m/s), and gravity (9.81 m/s²). Changes apply live and are saved in localStorage when available. Friction overrides and best times are stored per level. Storage failures never prevent play.

## Architecture

`src/main.ts` owns a fixed 60 Hz accumulator and interpolated rendering. `src/game/` contains the player, spring tray, cargo, input, camera, checkpoints, HUD, and testable simulation. `src/levels/` contains typed piece arrays and one shared builder. Add another data file and register it in `src/levels/index.ts` to add a course. UI and synthesized audio are in `src/ui/` and `src/audio/`.

Rapier drives the dynamic capsule, free cargo, kinematic platforms and hammers, and hinged seesaw. Cargo has CCD, no joints, and no attachment forces. Cargo touching course geometry triggers one drop and a 1.5-second reset. The two rooftop courses use a -6 m kill plane; the other courses use -3 m.

The player capsule collides with cargo, trays, obstacles, and moving hammers. CCD prevents fast cargo from tunneling through the body. The tray is held farther forward, with a conservative clearance constraint covering its tilted corners and bowl rim, so its kinematic spring motion cannot pass through the capsule. Ground detection ignores cargo and trays. Arms reach the revised tray position.

The build includes Rapier's embedded WebAssembly. Vite reports gzip sizes; `npm test` exercises the same simulation without WebGL. Browser performance still depends on the device and graphics driver.

## Verification

The automated suite checks cargo settling, drop counting, delayed rebuilds, checkpoint activation and retry, mass/friction/gravity changes, and complete normal-input traversals of all six courses at default tuning. It also fires cargo at the player's body on two axes and stress-tests actual tray/capsule separation for 720 physics steps. Traversal uses only movement, camera yaw, and jump inputs; it never teleports bodies or suppresses failures. Some runs deliberately recover through checkpoints. It is a reproducible completion check, not a claim that the courses have been balanced with human playtesting.

The desktop browser UI was checked for rendering, level selection, keyboard retry, mute, tuning controls, and pause/resume. Sustained 60 fps on a representative mid-range laptop and sub-five-second cold loading over a real network have not been benchmarked.
made by saad