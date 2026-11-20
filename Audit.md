# Koku & Steam (V5) — Architecture Audit & Implementation Specification

> ## 🛑 STOP CONDITIONS (READ FIRST)
> **Mandatory Halt Rule for Implementing Agents:**
> Before modifying any file, verify that every referenced file path, symbol name, line anchor, DOM ID, and invariant listed in this specification exists in the workspace.
> - **HALT AND REPORT BACK IMMEDIATELY** if:
>   1. Any target file (`index.html`, `v3_core.js`, `v4_expansion.js`, `koku_steam_mitochondrial_village_simulation_V5.html`) is missing or has diverged from `index.html + v3_core.js + v4_expansion.js` bundle parity.
>   2. Any symbol, state property, or function override referenced in Section 3 has been renamed, removed, or moved in a way that contradicts this specification.
>   3. Any verification command in Section 4 fails, throws an unexpected exception, or produces state values outside the stated pass criteria.
>   4. A change would require modifying the frozen `koku_steam_mitochondrial_village_simulation_V4.html` or `koku_steam_mitochondrial_village_simulation_V3.html` archives.
> - **Do NOT improvise workarounds, silence failing assertions, or rewrite tests to match broken behavior.** Stop, document the exact contradiction (file, line, expected vs. actual), and request user guidance.

---

## Baseline Audit Scope

- **Audited Deliverable:** `koku_steam_mitochondrial_village_simulation_V5.html` (`8,305` lines, `464,684` bytes). Verified byte-for-byte identical to `index.html` (`498` lines) with `v3_core.js` inlined at lines `497–5134` (`4,634` lines) and `v4_expansion.js` inlined at lines `5135–8305` (`3,165` lines).
- **Audited Project Documents:**
  - `Design document - Koku & Steam.md` (V4 specification)
  - `IMPLEMENTATION_TRACKER.md` (living tracker + V5 addendum)
  - `PROJECT_HANDOFF_AND_SUMMARY.md` (V4 handoff & re-bundling guide)
  - `Summary_of_the_features.md` (narrative feature summary)
- **Frozen Archives (Read-Only):** `koku_steam_mitochondrial_village_simulation_V3.html`, `koku_steam_mitochondrial_village_simulation_V4.html`.

---

## 1. Doc-vs-Code Drift

### 1.1 Deliverable Versioning & Build Instructions
- **V4 vs. V5 Target Drift:** `Design document - Koku & Steam.md` (lines `1–3`) and `PROJECT_HANDOFF_AND_SUMMARY.md` (lines `21, 54–79`) still specify `koku_steam_mitochondrial_village_simulation_V4.html` as the active build output and give Python/PowerShell re-bundling commands that overwrite `V4.html`. In reality, `V4.html` is frozen (`IMPLEMENTATION_TRACKER.md:12`) and all active development targets `koku_steam_mitochondrial_village_simulation_V5.html`.
- **Missing Reproducible Build Script:** No build script exists in the repository; bundling `index.html` + `v3_core.js` + `v4_expansion.js` into `V5.html` currently relies on ad-hoc CLI one-liners.

### 1.2 Spatial, Landmark & Road Graph Mismatches
- **Outdated V3 Landmark Coordinates in Design Doc §2.3:** Almost every landmark coordinate in `Design document - Koku & Steam.md` (§2.3) has drifted from `Landmarks` in `v3_core.js`:
  - `ketoneShrine`: `(3.3, 2.6)` in doc vs. `(3.0, 2.4)` in `v3_core.js:460`
  - `fatLine`: `(3.2, 6.2)` vs. `(3.0, 6.0)` in `v3_core.js:467`
  - `glucoseLine`: `(3.2, 11.2)` vs. `(3.0, 10.9)` in `v3_core.js:474`
  - `village1`: `(11.2, 5.8)` vs. `(10.9, 5.5)` in `v3_core.js:560`
  - `village2`: `(10.6, 11.4)` vs. `(10.8, 11.0)` in `v3_core.js:567`
  - `wellhouse`: `(13.6, 8.6)` vs. `(14.3, 8.1)` in `v3_core.js:577`
  - `village3`: `(16.8, 5.5)` vs. `(17.3, 5.5)` in `v3_core.js:601`
  - `proteostasisShrine`: `(15.6, 9.8)` vs. `(17.3, 10.7)` in `v3_core.js:608`
  - `dam`: `(18.2, 1.8)` vs. `(17.5, 2.0)` in `v3_core.js:629`
- **Undocumented V5 Landmarks in Design Doc:** `v3_core.js` defines 8 landmarks absent from `Design document - Koku & Steam.md`: `glycogenGranary`, `basketAlanine`, `basketGlycerol`, `basketPyruvate`, `basketLactate`, `basketSuccinate`, `calligraphyPavilion`, and `muscleOutpost`.
- **Stale Metaphor Mutation in `v4_expansion.js:24–26`:** Appends `"fermentation fires"` and `"Neon-Green Warburg Lactate Fermentation fire"` onto `Landmarks.wellhouse.metaphor` and `Landmarks.glucoseLine.metaphor`, contradicting V5's explicit replacement of fermentation fire animations with bubbling fermentation bogs (`IMPLEMENTATION_TRACKER.md:298–299, 460`).
- **Road Graph Node Count Drift:** `PROJECT_HANDOFF_AND_SUMMARY.md:23` cites a `"31-node road/bridge waypoint pathfinder"`; `RoadNodes` in `v3_core.js:110–156` actually contains **34** nodes.

### 1.3 Biochemical Tuning, Crisis Endpoints & Preset Drift
- **Crisis States (`4` vs. `5`):** `Design document - Koku & Steam.md` §3.1 specifies 4 crisis states; `CrisisDefinitions` (`v4_expansion.js:102–138`) implements **5** (adding `nafld`: `HEPATIC STEATOSIS (NAFLD / MASLD)`).
- **Preset Parameters & Dead Fields:**
  - `Presets.warburg` in `Design document - Koku & Steam.md` §3.1 specifies `etcDamage: 35`; `v4_expansion.js:3071` defines `etcDamage: 48`, which is now **unused dead data** because `v4_expansion.js:3111` preserves current `SimState.etcDamage` unless `wasTerminal` is true.
  - `Presets.necrosis` in Design Doc §3.1 specifies `antiox: 22, gshReserve: 48`; `v4_expansion.js:3075` defines `antiox: 18, gshReserve: 28, etcDamage: 15` (`etcDamage` also unused).
  - `Presets.fasted` in `v3_core.js:4527` sets `antiox: 75` (whereas `Presets.exercise` is `85` and `demand: 80`).
- **BioConfig & Rate Tuning Drift vs. Design Doc:**
  - `BioConfig.gshCostPerFire` is `8` (`v3_core.js`), vs. `-12 GSH` in Design Doc §2.3.
  - Ronin rebellion uses per-Samurai `roninPatienceLimit: 9`s desertion → prowling camp → `>= 13` (`>60%`) rebellion (`v4_expansion.js:2068–2480`), replacing Design Doc §2.3's `6.5s` global Doom Clock (`>= 12` Samurai, Dam `< 18%`).
  - Bandit sabotage was reduced ~60% in F-07 (`toxinScale = 0.35 + 0.65 * (toxinLoad / 100)`, GSH drain `0.65`, ETC scar `0.45`, `fireTimer >= 6.8s`, `robCooldown = 5.5s`, `robScar = 0.9 * toxinScale`, `spawnInterval = 10.5/7.2/4.2s` at `v4_expansion.js:988–1078`) vs. Design Doc §3.2 (`1.95/s`, `1.35/s`, `2.8s`, `2.6s`, `+2.4%`).
  - Endogenous RIRR decay multiplier is `0.52` (`v4_expansion.js:1169`) vs. `1.35%/s` in Design Doc §3.6.
  - Adenylate Kinase trigger (`v4_expansion.js:1942–1944`) uses `SimState.ampCount < 3 && ((queueAtCastle.length > 4 && SimState.bandits.length > 0) || queueAtCastle.length > 7)` with `akCooldown = 2.4s`, differing from Design Doc §3.3 (`>= 7` / `>= 8` with `damLevel < 32`, `akCooldown = 1.35s`) and `IMPLEMENTATION_TRACKER.md:173` (`1.35s`).
  - `mTOR` activation (`v4_expansion.js:2135+`) requires `glucoseSupply >= 50 && totalFuelInput >= 105 && samuraiDemand <= 40 && fires.length < 2 && rosLevel < 30 && villageStock.v1 < 4` vs. Design Doc §3.4 (`glucoseSupply >= 45%`, fuel `>= 85`).
- **Warburg & Press-Pulse Divergence:** Design Doc §3.6 still describes permanent fermentation fires (`drawFermentationFire`) and permanent `100%` lock-in; V5 implements gradual `45% → 55%` bog crumbling (`drawFermentationBog`), bistable `SimState.warburgActive` (`>= 55%` ON / `< 30%` OFF), Warburg apoptotic resistance, Thriller zombie dance, Succinate wicker basket, floor overflow puddles, and manual Press + spaced `Pulse` (`#btnPressPulse`).
- **Orphaned HUD Element:** `index.html:427` defines `<span id="lblBrigadeStatus">Ready</span>`, which is never referenced or updated by `v3_core.js` or `v4_expansion.js`.

### 1.4 Code-Internal Architectural Weaknesses & Logic Bugs Found in V5
1. **Incomplete Bistable Hysteresis Migration (16 Stale `etcDamage >= 55` / `< 55` Checks in `v4_expansion.js`):**
   - `SimState.warburgActive` latches ON at `>= 55%` and stays ON until `< 30%`, yet **16 checks** in `v4_expansion.js` still test `SimState.etcDamage >= 55` / `< 55`: lines `394` (AcAc delivery), `515, 520, 523, 537, 541, 553, 611` (Glycerol, Pyruvate, Lactate, Glycogenesis, Glycogenolysis, GNG, Muscle Proteolysis), `1307` (fat cart purge), `1341, 1361, 1374, 1398` (Complex I–IV porters), `1492` (Wellhouse porter relocation), `1533` (C1 reverse slip), and `1555` (RET-ROS).
   - **Impact:** As soon as Press-Pulse lowers `etcDamage` below `55%` into the `30%–54%` hysteresis band while `warburgActive === true`, Complexes I–IV, GNG, Glycogenolysis, and LDH equilibrium silently re-activate while the buildings remain sunk in Warburg bogs and `effectiveFat === 0`.
2. **Negative `fermentStrength` & Dropped `pdk1Block`/`damDrag` in `30%–49%` Hysteresis Band:**
   - `v4_expansion.js:2017` computes `const fermentStrength = warburgFermentActive ? ((SimState.etcDamage - 50) / 50) : 0;`, which becomes **negative** (`-0.40` at `30%`) when `warburgActive` is true and Pulses drive `etcDamage < 50%`.
   - `v4_expansion.js:269` (`pdk1Block`) and `v4_expansion.js:1187` (`damDrag`) gate on `SimState.etcDamage >= 50`, shutting off PDK1 blockade and dam drag while `warburgActive` is still true in the `30%–49%` band.
3. **Dual `.preset-btn` Listeners & Terminal Warburg/Necrosis/NAFLD Lock-In Bug:**
   - Both `v3_core.js:4534–4548` and `v4_expansion.js:3086–3118` attach click listeners to `.preset-btn`.
   - Because `v3_core.js`'s listener fires first and calls `initSamuraiGarrison()` when `SimState.cellDead || SimState.senescenceActive`, both flags are already `false` by the time `v4_expansion.js:3090` evaluates `const wasTerminal = SimState.cellDead || SimState.senescenceActive;`.
   - Worse, `wasTerminal` omits `SimState.crisisState === 'warburg' || SimState.crisisState === 'necrosis' || SimState.crisisState === 'nafld'`. Clicking any scenario preset after `100%` Warburg lock-in hides `#crisisBanner` via `setCrisisBanner('none')` **without resetting `etcDamage = 100`**, so `v4_expansion.js:1206` immediately re-locks Warburg on the very next frame!
4. **Bandits Bypass Isometric Depth Sorting:**
   - `v4_expansion.js:2943–2945` draws `SimState.bandits` inside the `renderScene` post-wrapper after `_v3RenderScene()` finishes `renderQueue`, so Bandits always paint on top of foreground buildings and roofs rather than sorting by `b.gx + b.gy`.
5. **Unguarded `ctx.fillText()` Calls Violating `SimState.showLabels === false`:**
   - V5 defaults `SimState.showLabels` to `false` (`v3_core.js:28`), yet 8 canvas labels in `v4_expansion.js` (`2703, 2853, 2866, 2873, 2880, 2887, 2915, 2922`) and 16+ labels in `v3_core.js` (`1531, 1707, 1725, 1967, 1975, 1984, 2000, 2458, 2462, 3615, 3733, 3777, 3790, 4107, 4123, 4294`) draw text unconditionally without checking `SimState.showLabels`.
6. **Dead / Unreachable Code Bloat:**
   - `drawFermentationFire` (`v4_expansion.js:2707–2760`) is completely unused.
   - `renderGlucoseProcessingLine` returns early at `v3_core.js:1876`, making `v3_core.js:1909` (`if (warburgFerment) { const spilledBales ... }`) and `v3_core.js:2004` (`if (warburgFerment) { ... }`) dead code.
   - `renderWellhouseApothecary` returns early at `v3_core.js:2969`, making `v3_core.js:2999` (`if (mslpBonfire) { const wellBales ... }`) dead code.
   - `v3_core.js:1206` defines an empty stub `function updateSimulation(dt) {}` overwritten by `v4_expansion.js:226`.

---

## 2. Recommended Improvements

1. **Unify All Warburg Gates Under `SimState.warburgActive`:** Replace all 16 remaining `etcDamage >= 55` / `< 55` Warburg checks and clamp `fermentStrength` / `pdk1Block` / `damDrag` so the `55%` ON / `< 30%` OFF hysteresis switch is internally consistent across every subsystem.
2. **Consolidate `.preset-btn` Handling into a Single Context-Aware Handler:** Remove the duplicate click listener in `v3_core.js`, compute `wasTerminal` from all 5 terminal/crisis states (`cellDead || senescenceActive || crisisState !== 'none'`), and strip dead `etcDamage` fields from `Presets.warburg` and `Presets.necrosis`.
3. **Depth-Sort Bandits Inside `renderQueue`:** Push `SimState.bandits` into `v3_core.js`'s `renderQueue` (guarding `typeof drawXenobioticBandit === 'function'`) and remove the post-pass loop from `v4_expansion.js` so Bandits properly occlude behind foreground roofs and trees.
4. **Enforce `SimState.showLabels` Consistently Across Character & Gate Labels:** Guard unguarded `ctx.fillText()` calls in `v4_expansion.js` and `v3_core.js` with `if (SimState.showLabels)` so `"Labels: OFF"` genuinely declutters the village (preserving intentional transient callouts like `floatingTexts` and `ripples`).
5. **Remove Dead Code & Stale Fire Metaphors:** Delete unused `drawFermentationFire`, unreachable post-`return` Warburg blocks in `v3_core.js`, and stale `"fermentation fire"` concatenations in `v4_expansion.js:24–26`.
6. **Wire Up `#lblBrigadeStatus` in `updateHUD`:** Update `#lblBrigadeStatus` live with active firefighter count and GSH well state (`Ready` / `N Dousing` / `GSH Low!`) instead of leaving static HTML text.
7. **Add a Deterministic `bundle_v5.mjs` Build & Smoke-Test Script:** Commit a zero-dependency Node script (`scripts/bundle_v5.mjs`) that bundles `index.html` + `v3_core.js` + `v4_expansion.js` → `koku_steam_mitochondrial_village_simulation_V5.html` and verifies byte parity, preventing manual bundling mistakes and keeping `V4.html` untouched.
8. **Synchronize Project Documentation to V5:** Update `PROJECT_HANDOFF_AND_SUMMARY.md` (target `V5.html`, 34 `RoadNodes`, new build script) and note V5 supersedes V4 sections in `Design document - Koku & Steam.md`.

---

## 3. File-by-File Execution Plan

Execute the following steps **in order**. Do not modify `koku_steam_mitochondrial_village_simulation_V3.html` or `koku_steam_mitochondrial_village_simulation_V4.html`.

### Step 1 — Unify Bistable `SimState.warburgActive` & Fix `fermentStrength` / `pdk1Block` / `damDrag`
- **File:** `/home/chris/Documents/Syncopy/koku-and-steam/v4_expansion.js`
- **Symbols & Changes:**
  - In `updateSimulation(dt)`:
    - Line `269`: Change `pdk1Block` computation to:
      ```js
      const pdk1Block = (SimState.warburgActive || SimState.etcDamage >= 50)
          ? Math.min(0.92, Math.max(SimState.warburgActive ? 0.55 : 0, ((SimState.etcDamage - 50) / 50) * 0.90))
          : 0;
      ```
    - Replace all 16 remaining Warburg threshold checks with `SimState.warburgActive` / `!SimState.warburgActive`:
      - Line `394`: `SimState.etcDamage < 55` → `!SimState.warburgActive`
      - Lines `515, 537, 541, 553, 611`: `SimState.etcDamage < 55` → `!SimState.warburgActive`
      - Lines `520, 523`: `SimState.etcDamage >= 55` → `SimState.warburgActive`
      - Lines `1307, 1492`: `SimState.etcDamage >= 55` → `SimState.warburgActive`
      - Lines `1341, 1361, 1374, 1398, 1533, 1555`: `SimState.etcDamage < 55` → `!SimState.warburgActive`
    - Line `1187–1204`: Change `if (SimState.etcDamage >= 50)` to `if (SimState.warburgActive || SimState.etcDamage >= 50)` and clamp `damDrag = 6.5 * Math.max(SimState.warburgActive ? 0.35 : 0, (SimState.etcDamage - 50) / 50)`.
    - Line `2017`: Clamp `fermentStrength` non-negative while `warburgFermentActive` is true:
      ```js
      const fermentStrength = warburgFermentActive ? Math.max(0.25, (SimState.etcDamage - 30) / 70) : 0;
      ```
- **Invariants to Preserve:**
  - Entry threshold remains `SimState.etcDamage >= 55` → `SimState.warburgActive = true`.
  - Exit threshold remains `SimState.etcDamage < 30` → `SimState.warburgActive = false`.
  - `preWarburgFasting` (`!SimState.warburgActive && SimState.glucoseSupply <= 12 && SimState.fatSupply >= 75 && SimState.toxinLoad < 10`) still heals `etcDamage` before `55%`.
  - `fermentStrength >= 0` for all `etcDamage ∈ [0, 100]`.

### Step 2 — Consolidate `.preset-btn` Handling & Fix Terminal Crisis Recovery
- **Files:**
  1. `/home/chris/Documents/Syncopy/koku-and-steam/v3_core.js`
  2. `/home/chris/Documents/Syncopy/koku-and-steam/v4_expansion.js`
- **Symbols & Changes:**
  - Add a single unified helper `function applyScenarioPreset(presetName)` in `v4_expansion.js` (or expose `window.applyScenarioPreset`), and remove the duplicate `document.querySelectorAll('.preset-btn').forEach(...)` listener in `v3_core.js:4534–4548`.
  - Inside `v4_expansion.js`'s `.preset-btn` click listener (`lines 3086–3118`):
    - Compute `const wasTerminal = SimState.cellDead || SimState.senescenceActive || SimState.crisisState !== 'none';` **before** calling `setCrisisBanner('none')` or `initSamuraiGarrison()`.
    - If `wasTerminal`, call `initSamuraiGarrison()` and reset `SimState.etcDamage = 0; SimState.warburgActive = false;`.
    - Apply all V3+V4 preset fields (`fatSupply`, `glucoseSupply`, `samuraiDemand`, `antioxSynthesis`, `toxinLoad`, `gshReserve`, `sluice`, `drainDam`, `glycogenLevel`, `lactatePool`, `glycerolPool`, `alaninePool`, `ninjaInterventionsUsed = 0`, `crisisTimer = 0`, `pulseAnimTimer = 0`) and sync all 5 sliders (`sliderFat`, `sliderGlucose`, `sliderDemand`, `sliderAntiox`, `sliderToxin`) and their value labels.
    - Remove dead `etcDamage` keys from `Presets.warburg` (`v4_expansion.js:3071`) and `Presets.necrosis` (`v4_expansion.js:3075`).
- **Edge Cases & Invariants to Preserve:**
  - Clicking a preset while healthy or mid-simulation (`wasTerminal === false`) MUST preserve `SimState.etcDamage`, `SimState.warburgActive`, and all extant character arrays (`carts`, `porters`, `samurai`, `brigade`, `bandits`, `ketoneButterflies`, `mikoCouriers`, `dockPorter`, `musclePorter`, `muscleFerry`, `ronin`, `ninjas`, `monks`).
  - Clicking any preset after ANY terminal crisis (`apoptosis`, `senescence`, `necrosis`, `warburg`, `nafld`) MUST cleanly reset the crisis state and NOT re-trigger the crisis banner on the next tick.

### Step 3 — Depth-Sort Bandits & Remove Dead Code / Stale Metaphors
- **Files:**
  1. `/home/chris/Documents/Syncopy/koku-and-steam/v3_core.js`
  2. `/home/chris/Documents/Syncopy/koku-and-steam/v4_expansion.js`
- **Symbols & Changes:**
  - In `v3_core.js` inside `renderScene()` (around line `1285`, beside `SimState.ronin`):
    ```js
    if (SimState.bandits && typeof drawXenobioticBandit === 'function') {
        for (const b of SimState.bandits) renderQueue.push({ depth: b.gx + b.gy + 0.18, draw: () => drawXenobioticBandit(b) });
    }
    ```
  - In `v4_expansion.js`:
    - Remove the post-render `for (const b of SimState.bandits) drawXenobioticBandit(b);` loop at lines `2943–2945`.
    - Delete unused `drawFermentationFire` (`lines 2707–2760`).
    - Update lines `24–26` so `Landmarks.wellhouse.metaphor` and `Landmarks.glucoseLine.metaphor` reference bubbling fermentation **bogs** (not `"fermentation fires"`).
  - In `v3_core.js`:
    - Remove unreachable `if (warburgFerment)` blocks after the early `return;` in `renderGlucoseProcessingLine` (`lines 1909–1940` and `2004–2016`), keeping the intact/crumbling rendering path clean.
    - Remove unreachable `if (mslpBonfire)` block after the early `return;` in `renderWellhouseApothecary` (`lines 2999–3045`).
- **Invariants to Preserve:**
  - Bandits still render cleanly when `SimState.bandits.length > 0` and now occlude naturally behind buildings whose `depth > b.gx + b.gy + 0.18`.
  - Pre-Warburg crumbling (`45% < etcDamage < 55%`) and full Warburg bog rendering (`SimState.warburgActive === true`) remain visually identical.

### Step 4 — Enforce `SimState.showLabels` & Wire `#lblBrigadeStatus`
- **Files:**
  1. `/home/chris/Documents/Syncopy/koku-and-steam/v4_expansion.js`
  2. `/home/chris/Documents/Syncopy/koku-and-steam/v3_core.js`
- **Symbols & Changes:**
  - In `v4_expansion.js`:
    - Wrap character status `ctx.fillText(...)` calls in `drawXenobioticBandit` (`line 2703`) and `drawSamuraiRetainer` (`lines 2853, 2866, 2873, 2880, 2887, 2915, 2922`) with `if (SimState.showLabels)`.
    - In `updateHUD()` (`lines 2985–3065`), update `#lblBrigadeStatus`:
      ```js
      const brigEl = document.getElementById('lblBrigadeStatus');
      if (brigEl) {
          if (SimState.brigade.length > 0) {
              brigEl.textContent = `${SimState.brigade.length} Dousing`;
              brigEl.className = 'text-amber-300 font-semibold';
          } else if (SimState.gshReserve <= 20) {
              brigEl.textContent = 'GSH Low!';
              brigEl.className = 'text-rose-400 font-bold';
          } else {
              brigEl.textContent = 'Ready';
              brigEl.className = 'text-cyan-300/80';
          }
      }
      ```
  - In `v3_core.js`:
    - Wrap unguarded persistent character/gate `ctx.fillText(...)` calls (`lines 1531, 1707, 1725, 1967, 1975, 1984, 2000, 2458, 2462, 3615, 3733, 3777, 3790, 4107, 4123, 4294`) with `if (SimState.showLabels)`.
    - **Do NOT** gate `SimState.floatingTexts` (`v4_expansion.js:2968`), river ripple `rp.text` (`v3_core.js:1347`), or chemical molecule badges (`O₂` at `3150`, `H₂O` at `3322`) so acute event feedback and molecular symbols remain legible with Labels OFF.
- **Invariants to Preserve:**
  - Default `SimState.showLabels === false` renders zero persistent character/building labels on load, and toggling `#btnToggleLabels` restores all of them.

### Step 5 — Add Reproducible V5 Bundler Script & Synchronize Docs
- **Files:**
  1. Create `/home/chris/Documents/Syncopy/koku-and-steam/scripts/bundle_v5.mjs`
  2. Regenerate `/home/chris/Documents/Syncopy/koku-and-steam/koku_steam_mitochondrial_village_simulation_V5.html`
  3. Update `/home/chris/Documents/Syncopy/koku-and-steam/PROJECT_HANDOFF_AND_SUMMARY.md`
  4. Add a V5 supersession notice at the top of `/home/chris/Documents/Syncopy/koku-and-steam/Design document - Koku & Steam.md`
- **Symbols & Changes:**
  - `scripts/bundle_v5.mjs`: Read `index.html`, `v3_core.js`, `v4_expansion.js` in UTF-8, assert both `<script src="v3_core.js"></script>` and `<script src="v4_expansion.js"></script>` tags exist before replacing (exiting non-zero if missing), write `koku_steam_mitochondrial_village_simulation_V5.html`, and print byte count.
  - `PROJECT_HANDOFF_AND_SUMMARY.md`: Update bundle target from `V4.html` to `V5.html`, note `V4.html` is frozen, correct `RoadNodes` count from `31` to `34`, and document `node scripts/bundle_v5.mjs`.
  - `Design document - Koku & Steam.md`: Add a top callout pointing readers to `IMPLEMENTATION_TRACKER.md` for V5 additions (F-07–F-09, bistable Warburg bogs, Press-Pulse, wicker baskets, `NAFLD` endpoint) without erasing the historical V4 baseline spec.

---

## 4. Verification Criteria

Run all four checks from `/home/chris/Documents/Syncopy/koku-and-steam`. Every command must exit with code `0` and satisfy its exact pass criteria.

### Check 1 — Deterministic V5 Bundle Build & V4 Freeze Integrity
```bash
node scripts/bundle_v5.mjs && ls -la koku_steam_mitochondrial_village_simulation_V4.html koku_steam_mitochondrial_village_simulation_V5.html
```
- **Expected Pass State:**
  - Exit code `0`.
  - `koku_steam_mitochondrial_village_simulation_V5.html` regenerated with zero unresolved `<script src="v3_core.js">` or `<script src="v4_expansion.js">` tags.
  - `koku_steam_mitochondrial_village_simulation_V4.html` size remains unchanged at `419055` bytes.

### Check 2 — Static Audit (Zero Stale `etcDamage >= 55` / Dead Symbols / Unwired DOM IDs)
```bash
node -e '
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
const v3 = fs.readFileSync("v3_core.js", "utf8");
const v4 = fs.readFileSync("v4_expansion.js", "utf8");
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
const jsIds = new Set([...(v3 + "\n" + v4).matchAll(/getElementById\([\x27"]([^"\x27]+)[\x27"]\)/g)].map(m => m[1]));
const missingInHtml = [...jsIds].filter(id => !htmlIds.has(id));
const unusedInJs = [...htmlIds].filter(id => !jsIds.has(id));
const staleV4_55 = v4.split("\n").map((l,i)=>[i+1,l]).filter(([i,l])=>/etcDamage\s*(>=|<)\s*55/.test(l) && !l.includes("SimState.warburgActive = true"));
const hasDeadFire = v4.includes("function drawFermentationFire");
const presetListeners = (v3.match(/\.preset-btn/g) || []).length + (v4.match(/\.preset-btn/g) || []).length;
console.log(JSON.stringify({ missingInHtml, unusedInJs, staleV4_55Count: staleV4_55.length, hasDeadFire, presetListeners }, null, 2));
if (missingInHtml.length || unusedInJs.length || staleV4_55.length || hasDeadFire || presetListeners !== 1) process.exit(1);
'
```
- **Expected Pass State:**
  - Exit code `0`.
  - `missingInHtml: []`, `unusedInJs: []`, `staleV4_55Count: 0`, `hasDeadFire: false`, `presetListeners: 1`.

### Check 3 — Headless Node `vm` Behavioral & Hysteresis Regression Suite
```bash
node -e '
const fs = require("fs");
const vm = require("vm");
const v3 = fs.readFileSync("v3_core.js", "utf8");
const v4 = fs.readFileSync("v4_expansion.js", "utf8");
const noop = () => {};
const grad = { addColorStop: noop };
let labelDraws = 0;
const ctx2d = new Proxy({}, {
  get(t, p) {
    if (p === "measureText") return () => ({ width: 50 });
    if (p === "createRadialGradient" || p === "createLinearGradient") return () => grad;
    if (p === "canvas") return { width: 1400, height: 900 };
    if (p === "fillText") return () => { labelDraws++; };
    return noop;
  }
});
const domElems = {};
const listeners = {};
const getDom = (id) => {
  if (!domElems[id]) {
    const classes = new Set();
    const evs = {};
    domElems[id] = new Proxy({
      style: {},
      classList: {
        add: (...c) => c.forEach(x => classes.add(x)),
        remove: (...c) => c.forEach(x => classes.delete(x)),
        toggle: (c, force) => force === undefined ? (classes.has(c) ? classes.delete(c) : classes.add(c)) : (force ? classes.add(c) : classes.delete(c)),
        contains: (c) => classes.has(c)
      },
      value: 0, textContent: "", innerHTML: "",
      click: () => (evs.click || []).forEach(fn => fn())
    }, {
      get(t, p) {
        if (p === "getContext") return () => ctx2d;
        if (p === "addEventListener") return (ev, fn) => { (evs[ev] = evs[ev] || []).push(fn); };
        if (p === "getBoundingClientRect") return () => ({ left: 0, top: 0, width: 1400, height: 900 });
        return t[p] !== undefined ? t[p] : noop;
      }
    });
  }
  return domElems[id];
};
const presetBtns = ["fasted", "warburg"].map(name => {
  const handlers = [];
  return {
    dataset: { preset: name },
    addEventListener: (ev, fn) => { if (ev === "click") handlers.push(fn); },
    click: () => handlers.forEach(fn => fn())
  };
});
const context = {
  console, Math, Date, Array, Object, Number, String, Boolean, Set, Map, JSON,
  performance: { now: () => Date.now() },
  setTimeout: noop, clearTimeout: noop, requestAnimationFrame: noop,
  devicePixelRatio: 1,
  document: { getElementById: getDom, querySelectorAll: (sel) => sel === ".preset-btn" ? presetBtns : [], createElement: () => getDom("_tmp"), addEventListener: noop },
  addEventListener: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); },
  innerWidth: 1400, innerHeight: 900,
  presetBtns
};
context.window = context;
vm.createContext(context);
vm.runInContext(v3, context, { filename: "v3_core.js" });
vm.runInContext(v4, context, { filename: "v4_expansion.js" });
if (listeners.DOMContentLoaded) listeners.DOMContentLoaded.forEach(fn => fn());

const out = vm.runInContext(`
  // 1. Bistable hysteresis consistency in 30-54% band
  initSamuraiGarrison();
  Object.assign(SimState, { etcDamage: 56, glucoseSupply: 5, fatSupply: 85, toxinLoad: 2, succinatePool: 98, villageStock: { v1: 3, v2: 3, v3: 3, v4: 3 } });
  updateSimulation(0.05);
  document.getElementById("btnPressPulse").click(); // drops etcDamage ~47% while warburgActive stays true
  for (let i = 0; i < 40; i++) updateSimulation(0.05);
  const hysteresisBand = {
    etcDamage: Math.round(SimState.etcDamage * 10) / 10,
    warburgActive: SimState.warburgActive,
    portersSpawned: SimState.porters.length,
    gngActive: SimState.gngActive
  };

  // 2. Preset recovery from 100% Warburg lock-in
  SimState.etcDamage = 100;
  updateSimulation(0.05);
  const lockedCrisis = SimState.crisisState;
  presetBtns[0].click(); // click fasted preset
  updateSimulation(0.05);
  const afterPresetRecovery = {
    lockedCrisis,
    crisisAfter: SimState.crisisState,
    etcDamageAfter: SimState.etcDamage,
    warburgAfter: SimState.warburgActive
  };

  // 3. Render with showLabels = false and active Bandit/Samurai
  SimState.showLabels = false;
  SimState.floatingTexts = [];
  SimState.ripples = [];
  SimState.bandits.push({ gx: 14, gy: 8, tx: 14, ty: 8, chaseTimer: 0, requiredChaseTime: 6, engaged: false, stepPhase: 0, walkPhase: 0 });
  renderScene();
  updateHUD();
  JSON.stringify({ hysteresisBand, afterPresetRecovery, brigadeText: document.getElementById("lblBrigadeStatus").textContent }, null, 2);
`, context);
console.log(out, "\nfillText calls with showLabels=false:", labelDraws);
const parsed = JSON.parse(out);
if (!parsed.hysteresisBand.warburgActive || parsed.hysteresisBand.portersSpawned !== 0 || parsed.hysteresisBand.gngActive) process.exit(1);
if (parsed.afterPresetRecovery.crisisAfter !== "none" || parsed.afterPresetRecovery.etcDamageAfter !== 0 || parsed.afterPresetRecovery.warburgAfter) process.exit(1);
'
```
- **Expected Pass State:**
  - Exit code `0`.
  - `hysteresisBand`: `warburgActive: true`, `portersSpawned: 0`, `gngActive: false` while `etcDamage` is in the `30%–54%` recovery band.
  - `afterPresetRecovery`: `lockedCrisis: "warburg"`, `crisisAfter: "none"`, `etcDamageAfter: 0`, `warburgAfter: false`.
  - `renderScene()` and `updateHUD()` complete with zero exceptions; `lblBrigadeStatus` populated (`"Ready"` / `"N Dousing"` / `"GSH Low!"`).
  - `labelDraws` with `showLabels = false` restricted strictly to chemical molecule symbols (`O₂` / `H₂O`).

### Check 4 — Syntax Validation of Bundled `V5.html` Inline Scripts
```bash
node -e '
const fs = require("fs");
const vm = require("vm");
const v5 = fs.readFileSync("koku_steam_mitochondrial_village_simulation_V5.html", "utf8");
const scripts = [...v5.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (scripts.length !== 2) throw new Error("Expected 2 inline scripts, found " + scripts.length);
scripts.forEach((code, idx) => new vm.Script(code, { filename: "V5_script_" + idx + ".js" }));
console.log("Parsed both V5 inline scripts cleanly:", scripts.map(s => s.length));
'
```
- **Expected Pass State:**
  - Exit code `0`, confirming both inlined script blocks in `koku_steam_mitochondrial_village_simulation_V5.html` parse with zero syntax errors.
