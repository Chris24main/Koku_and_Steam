# Koku & Steam — Implementation Tracker & Offline Feedback Log

This file is designed to be **edited offline** (in Obsidian, VS Code, or any text editor) as our shared living specification, implementation log, and playtest feedback tracker.

> **✨ Core Design Principle — Visual Delight & Pedagogical Clarity:**
> Every metabolic endpoint should **delight the user visually** as a means of reinforcing learning (e.g., the *Gilded Temple of Senescence*, the *Bubbling Warburg Fermentation Bogs + Villager "Thriller" Zombie Dance*, and *NAFLD Steatotic Lipid Droplets*).

---

## 🛠️ How to Use This File Offline

1. **Review Implemented Features:** Playtest `koku_steam_mitochondrial_village_simulation_V6.html` in your browser (`V3.html`, `V4.html`, and `V5.html` are frozen milestone archives) and check the corresponding feature section below.
2. **Leave Playtest Feedback:** Under any feature's **`📝 User Playtest Feedback & Ways to Improve`** block, type your notes on what worked, what felt off, or how the visual/biochemical behaviour should be tuned.
3. **Update the Status Tag:**
   - `[ ] 📋 PLANNED` — New specification written; ready for Antigravity to build.
   - `[~] 🚧 IN PROGRESS` — Partially built or currently being tuned.
   - `[x] ✅ IMPLEMENTED (AWAITING REVIEW)` — Built and bundled into `koku_steam_mitochondrial_village_simulation_V6.html` (via `node scripts/bundle_v6.mjs`); ready for your offline playtest. All future updates target `V6.html` (`V3.html`, `V4.html`, and `V5.html` are frozen).
   - `[!] 🔄 NEEDS REVISION` — You added feedback below and want Antigravity to revise/improve this feature on the next session.
   - `[x] 🏆 VERIFIED` — You playtested this feature and are happy with how it works.
4. **Add New Feature Specs:** Scroll to **`## 📥 New Feature Specs (Add or Paste Offline Here)`** at the bottom of this file and paste or draft your next biochemical mechanism using the 4-part template (`Why / What / How / Notes`). Next time you open Antigravity, simply say: *"Review `IMPLEMENTATION_TRACKER.md` and implement any items marked `PLANNED` or `NEEDS REVISION`."*

---

## 📊 Quick Status Summary

| ID       | Feature / Biochemical Mechanism                                                                                          | Status                                | Primary Code Locations                        |
| :------- | :----------------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :-------------------------------------------- |
| **F-01** | **Adenylate Kinase Salvage ($2\text{ADP} \rightleftharpoons \text{ATP} + \text{AMP}$) & Wellhouse Alarm**                | `[x] 🏆 VERIFIED`                     | `v4_expansion.js`, `v3_core.js`, `index.html` |
| **F-02** | **Castle–Dojo One-Way Clockwise Circulation, Gravity Dam & Onsen Sluice Valve**                                          | `[x] 🏆 VERIFIED`                     | `v3_core.js`, `v4_expansion.js`               |
| **F-03** | **Complex IV Paired $2\times2$ Steam-Kiln Jaw-Clamp & $\text{H}_2\text{O}$ Molecule Launch**                             | `[x] ✅ IMPLEMENTED (AWAITING REVIEW)` | `v3_core.js`, `v4_expansion.js`               |
| **F-04** | **Xenobiotic Bandit Raids, "Asterix Potion" Koku Consumption & 1-on-1 Samurai Pursuit**                                  | `[x] ✅ IMPLEMENTED (AWAITING REVIEW)` | `v4_expansion.js`, `v3_core.js`               |
| **F-05** | **Unblocked Ketogenesis, 2-Loaf Condensation Cycle & 3 Ketone Body Species ($\beta\text{-HB}$, $\text{AcAc}$, Acetone)** | `[x] ✅ IMPLEMENTED (AWAITING REVIEW)` | `v4_expansion.js`, `v3_core.js`               |
| **F-06** | **3-Pathway $\text{ETC}$ Repair, Walled-Off $\beta$-Oxidation & Warburg / $\text{mSLP}$ Stage Bonfires**                 | `[x] ✅ IMPLEMENTED (AWAITING REVIEW)` | `v4_expansion.js`, `v3_core.js`, `index.html` |
| **F-07** | **Slower & Smoother Character Pacing, Multi-Frame Articulated Animations & 60% Gentler Toxin Slider**                    | `[x] ✅ IMPLEMENTED (AWAITING REVIEW)` | `v3_core.js`, `v4_expansion.js`               |
| **F-08** | **Hepatic Gluconeogenesis ($\text{GNG}$), Glycogen Granary, Muscle Outpost Ferry (Cori & Cahill Cycles) & Calligraphy Koku Donation** | `[x] ✅ IMPLEMENTED (AWAITING REVIEW)` | `v3_core.js`, `v4_expansion.js`, `index.html` |
| **F-09** | **Complex II ($\text{SDH}$) Succinate Back-Pressure, Reverse Electron Transport ($\text{RET-ROS}$) & Adaptive ROS Feedback** | `[x] ✅ IMPLEMENTED (AWAITING REVIEW)` | `v4_expansion.js`, `v3_core.js` |

---

## 🌅 Active Status & Next Session Agenda

1. **`BUG-03` Resolved & Verified (`[x] ✅ FIXED & VERIFIED`):**
   - Hard iteration caps (`maxSteps = 16`, Dijkstra `nodeCount + 2`) added to `stepAlongVillagePath` and `findVillagePath` in [`v3_core.js`](file:///home/chris/Documents/Syncopy/koku-and-steam/v3_core.js).
   - Replaced unbounded `while` angle loops with bounded `Math.atan2(Math.sin(d), Math.cos(d))` normalisation.
   - Wrapped `gameLoop(now)` in resilient `try...catch` boundaries preventing unhandled frame aborts.
   - Added NaN / Infinity coordinate safety reset in `v4_expansion.js` for Samurai-Bandit pursuit intercept.
   - Verified across 28 preset × toxin matrix simulations in Deno (115,200 simulated frames) with 0 crashes and 0 NaNs.
   - Bundled into clean standalone [`koku_steam_mitochondrial_village_simulation_V4.html`](file:///home/chris/Documents/Syncopy/koku-and-steam/koku_steam_mitochondrial_village_simulation_V4.html).

2. **Ongoing Feature Playtesting & Review (`F-03` through `F-07`):**
   - **`F-03`:** Complex IV steam kiln paired snap-shut and $\text{H}_2\text{O}$ molecule fling to the river.
   - **`F-04` & User Feedback:** Bandits roam into village plazas with "Asterix Magic Potion" drinking ritual before pursuit.
   - **`F-05`:** 3 Ketone butterfly species ($\beta$-HB, AcAc, Acetone) and magnetic loaf snap without outward flick.
   - **`F-06`:** 3-Pathway ETC repair (GSH, Mitophagy, Biogenesis), walled-off $\beta$-oxidation, and roaring Warburg & mSLP stage bonfires.
   - **`F-07`:** Slower, articulated character animations and balanced 60% gentler toxin slider.

3. **Draft Next Biochemical Feature (`F-08`+):**
   - Use the template at the bottom of this tracker to draft the next metabolic feature (e.g., Calcium $\text{Ca}^{2+}$ uniporter $\text{MCU}$, Complex II Succinate / RET-ROS, or Carnitine CPT-1 shuttle).
   - F-08 - This is a *big* one, and will need some discussion around the logic / biochemistry before fully implementing; but given that we have ketogenesis, this more or less defines the mitochondrial *location* in the liver, thus we should implement GNG. This is not trivial as a piece of biochemistry -  but the metaphor should be clear. In the right context, villagers should route a portion of the glycerol discarded from the Beta-oxidation yard *back* into the glycolysis yard - which should then run in reverse, temporarily. Now, to be a full representation, we also need to consider lactate and ketogenic amino acids - neither of which appear in the sim at all. My initial thought is that we could have a kind of *spill-over* area for both yards - glycerol for fat, and Pyruvate for glucose (with Pyruvate then swapping between that bucket and another representing lactate). Finally, there could be another bucket with, say, Alanine in it. In the right context (and biochemically is high fat consumption/ ketogenesis with low glucose/ insulin and sufficient ATP / cellular redox potential - we have to build in the concept that GNG is energy intensive, so the Samurai / ATP-ADP must be involved clearly, but by visibly *donating* a koku - metaphorically a Samurai would not get involved directly, but may spend some time engaged, say, in calligraphy or other art forms - and clearly also the order of demand must be true - glycogen if possible, then lactate, and only in extreme cases amino acids.
---

*(Log any bugs you observe during playtesting below using `[!] 🐛 OPEN`. Antigravity will diagnose the root cause, fix the code, and update the entry to `[x] ✅ FIXED (AWAITING VERIFICATION)`.)*

| Bug ID     | Summary                                                                                                                                  | Status                                | Location                                                 |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :------------------------------------------------------- |
| **BUG-01** | **Samurai starting to pursue a Bandit (`chasingBandit`) freezes in place**                                                               | `[x] ✅ FIXED (AWAITING VERIFICATION)` | `v3_core.js` (`stepAlongVillagePath`), `v4_expansion.js` |
| **BUG-02** | **Simulation freezes / hits false endpoint in seconds after slowing Samurai (`F-07`)**                                                   | `[x] ✅ FIXED (AWAITING VERIFICATION)` | `v4_expansion.js`, `v3_core.js`                          |
| **BUG-03** | **Crash / freeze when a Samurai catches a Bandit**                                                                                       | `[x] ✅ FIXED & VERIFIED`              | `v3_core.js` (`stepAlongVillagePath`), `v4_expansion.js` |
| **BUG-04** | **High energy demand preset reaches balance instead of generating Ninjas, overwhelming Koku delivery, and triggering Samurai rebellion** | `[x] ✅ FIXED & VERIFIED`              | `v4_expansion.js`                                        |
| Bug-05     | Energy starvation now triggers rebellion rather than senescence - the recent work on ronin may have unbalanced this dynamic              |                                       |                                                          |

### BUG-04: High Energy Demand Preset Reaches Equilibrium Instead of Overwhelming Koku Delivery & Triggering Samurai Rebellion
- **Status:** `[x] ✅ FIXED & VERIFIED`
- **Reported By User:** *"High energy demand preset reaches balance. This state should generate Ninjas and eventually overwhelm koku delivery, resulting in samurai rebellion, but it reches equilibrium."*
- **Root Cause Diagnosed:**
  1. **Flat High-Workload Burn Rate:** Dojo `burnRate` scaled gently (`0.125 * (demand/100)^1.35`), only reaching `0.1167/s` at `95%` demand, which Complex V's `state3Boost` (`1.05 * 1.50 = 1.575 ATP/s`) easily matched in steady state.
  2. **Unbounded Adenylate Kinase Buffer:** `2ADP -> ATP + AMP` fired indefinitely regardless of `AMP` accumulation and subtracted `2.5s` (plus `2.0s` at the Wellhouse Bell) from `crisisTimer`, making Ronin rebellion impossible even in `starvation`.
  3. **Queue Avenue Bounding Clip (`q > 9`):** `queueAtCastle` and `gateRiotQueueCount` checked `s.gx >= 23.8 && s.gy <= 10.2`, which accidentally excluded queued Samurai beyond slot 9 (`q > 9`) as the line curved west and south (`gx = 23.4..23.8, gy = 10.2..10.65`).
  4. **Doom Clock `damLevel < 15` Gate:** Because `exercise` has high fuel (`fat: 55%, gluc: 80%`), the Dam stays full even when Complex V's Koku delivery is completely overwhelmed (`adpWaitingCount >= 10`).
- **Fix Applied (`v4_expansion.js`):**
  - [x] **Superlinear High-Workload Surge (`demand > 65%`):** Added `highDemandSurge` above `65%` demand (`0.29 * ((demand - 65) / 35)^1.35`) while keeping `Balanced Fasting` (`55%`) unchanged.
  - [x] **Complex V Delivery Cap & Queue Bounding Box Fix:** Tuned Castle `exchangeProgress` (`0.72 * state3Boost`, `state3Boost` capped at `1.04x`) so `95%` demand genuinely overwhelms Koku delivery, and widened the West Castle Queue Avenue filter to `gx >= 23.0 && gx <= 26.1 && gy <= 10.8`.
  - [x] **Thermodynamic AK Saturation & Doom Clock:** Gated Adenylate Kinase salvage by `SimState.ampCount < 3` with moderate crisis relief (`-0.8s` / `-0.6s`), and triggered the Doom Clock when `(gateRiotQueueCount >= 8 || adpWaitingCount >= 10)` under either `damLevel < 20%` or `samuraiDemand >= 85%`.
  - [x] **Verified Across All 7 Presets:** In Node simulation, `exercise` dispatches 4 AMPK Ninja waves (`maxNinjas = 4`), overwhelms Koku delivery (`maxADP = 19`), and triggers Ronin rebellion at `16.3s` (`apoptosis` at `17.4s`), while `fasted` remains in stable equilibrium (`roninAt = null`, `endDam = 81.5%`).

	Ok - so now a rebellion is definitely triggered - but in about 15 seconds, which is too fast for the user to learn anything. I also observed that the "rebellion" is triggered when any of the Samurai wait for too long. The best way of dealing with both issues could be that the first samurai to wait too long turn "Ronin" ... leaving the service of the castle. Then, this depletes the pool of ATP/ Samurai, making the problem worse.. then when enough samurai have turned ronin, ie >60% .. they outnumber the samurai still in the service of the castle - and *then* they rebel.. killing the remaining samurai an ransacking the castle (apoptosis).
	Now resolved.
  >
  > **✅ Antigravity Resolution (16th Nov — Progressive Ronin Desertion → >60% Rebellion):**
  > - **Stage 1 — Individual Queue Patience & Desertion ([`v4_expansion.js`](file:///home/chris/Documents/Syncopy/koku-and-steam/v4_expansion.js#L1520-L1553), [`v3_core.js`](file:///home/chris/Documents/Syncopy/koku-and-steam/v3_core.js#L14)):** Replaced the single global `6.5s` Doom Clock with individual Samurai queue wait tracking (`s.waitTimer >= 9.0s`, scaled by workload/dam stress and pool depletion). Impatient Samurai desert 1-by-1 (`2.0s` stagger), visibly shrinking the active `ATP:ADP:AMP` pool (`20 → 19 → 18...`).
  > - **Stage 2 — Prowling Outside Camp & Intervention Return ([`v4_expansion.js`](file:///home/chris/Documents/Syncopy/koku-and-steam/v4_expansion.js#L1555-L1606), [`v3_core.js`](file:///home/chris/Documents/Syncopy/koku-and-steam/v3_core.js#L2852-L2890)):** Deserted Ronin (`👹 RONIN (Prowling)`) camp and prowl harmlessly outside the perimeter (`gx: 25.4..30.0, gy: 12.85..13.8`) **doing zero damage**. If the user intervenes in time (reducing demand `< 75%` and stabilizing the queue/Dam), prowling Ronin gradually return to duty (`🤝 Ronin Returned to Duty!`, 1 every `2.0s`).
  > - **Stage 3 — `>60%` Rebellion (`13 / 20` Ronin) & Starvation vs. Overwork Distinction:** Once `SimState.ronin.length >= 13`, `SimState.roninRebelling` triggers (`👹 >60% RONIN REBELLION! CASTLE RANSACKED!`).
  >   - **`High Workload (AMPK)` (`exercise` set to `80%` demand):** Balances around **`~50/50` (`10` prowling Ronin vs. `10` loyal Samurai)** for ~`65s` so the user can flip back to **`Balanced Fasting`** and watch Ronin return to duty. If high workload **goes on too long (`overworkTimer >= 65s`)** or **demand is raised (`>= 88%`)**, the balance tips to `>60%` Ronin Rebellion (`70.5s` sustained / `42.9s` if bumped to `95%`).
  >   - **`Energy Starvation (mPTP)` (`starvation`):** When `>60%` rebellion triggers under fuel starvation (`damLevel < 20%` or `fat + gluc <= 40%`), **extant AMPK Ninjas join the rebellion (`🥷⚡ NINJA MUTINY!`)** and charge the Castle Dam alongside the Ronin (`30.7s`).

### BUG-03: Crash / Freeze When Samurai Encounters Bandit
- **Status:** `[x] ✅ FIXED & VERIFIED`
- **Reported By User:** *"Something causing the sim to crash when a samurai encounters a bandit. Sim was fine until the Samurai caught the bandit"*
- **Root Cause Diagnosed:**
  1. In `v3_core.js` (`window.stepAlongVillagePath`), path traversal looped over `while (remainingMove > 0.0001 && actor._pathIdx < actor._path.length)`. When a Samurai and Bandit moved in close parallel melee proximity (`dist <= 0.58`), floating-point sub-steps could produce micro-increments where `step < 1e-4` or coordinate rounding prevented `d <= snapRadius` from triggering, causing an unbounded loop.
  2. Manual `while (diff > Math.PI) diff -= Math.PI * 2` angle subtraction could spin if `diff` was non-finite or extreme.
  3. The `findVillagePath` Dijkstra algorithm had a `while (true)` without an iteration guard against cyclic or orphaned graph states.
  4. The main animation loop `gameLoop(now)` in `v3_core.js` lacked `try...catch` error handling; any transient canvas draw or arithmetic error aborted `requestAnimationFrame`, freezing the canvas permanently.
- **Fix Applied:**
  - [x] **Hard Loop Guards (`v3_core.js`):** Added `_loopGuard < 16` cap to `stepAlongVillagePath` sub-steps and `_dj < nodeCount + 2` cap to `findVillagePath` Dijkstra search.
  - [x] **Bounded Trigonometric Angle Normalization (`v3_core.js`):** Replaced manual angle loops with guaranteed-bounded `Math.atan2(Math.sin(d), Math.cos(d))`.
  - [x] **Coordinate NaN Guards (`v4_expansion.js`):** Added `Number.isFinite(dist)` checks in Samurai direct-intercept and coordinate clamping within world boundaries `[-1, 35]` × `[-1, 16]`.
  - [x] **Resilient Error Boundary (`v3_core.js`):** Wrapped both `updateSimulation(dt)` and `renderScene()` inside `try...catch` blocks within `gameLoop(now)` so animation continues smoothly even if an isolated frame encounters a transient issue.
  - [x] **Stress-Tested & Re-Bundled:** Passed all 28 preset × toxin matrix simulations in headless Deno across 115,200 simulated frames with 0 errors and 0 NaNs, and re-bundled into [`koku_steam_mitochondrial_village_simulation_V4.html`](file:///home/chris/Documents/Syncopy/koku-and-steam/koku_steam_mitochondrial_village_simulation_V4.html).
- **📝 User Verification Notes (Edit Offline):**
update 16th Nov - the sim does indeed keep running - but there seems to be a trigger point still, where the bulk of the village disappears in the same way as previously - but only instantaneously, then it re-appears. I tested this with the "Chronic Bandits- Warburg" preset.
  >
  > **✅ Antigravity Follow-Up Root Cause & Fix (16th Nov):**
  > - **Exact Root Cause Found:** In [`renderWellhouseApothecary`](file:///home/chris/Documents/Syncopy/koku-and-steam/v3_core.js#L1836-L1846), when `F-07` extended `SimState.wellhouseAlarmTimer` to `2.25s`, the Bronze Bell soundwave ring calculation still divided by `1.25` (`waveFrac = 1 - wellhouseAlarmTimer / 1.25 = -0.8`). Because JavaScript's `% 1` preserves negative signs, `r = (8 + (-0.8) * 24) * z` produced a **negative radius** (`-8.89px`), causing `ctx.arc(..., r, ...)` to throw a browser `DOMException: IndexSizeError`.
  > - Before the `try...catch` boundary, that exception permanently killed `requestAnimationFrame` with half the village missing; with the `try...catch` boundary in place, `renderScene()` aborted mid-queue while `wellhouseAlarmTimer > 1.66s` and then resumed once it ticked down—making the bulk of the village momentarily disappear and reappear whenever the Wellhouse AMP Alarm Bell rang!
  > - **Fix Applied:** Normalized `waveFrac` against `2.25s` and clamped both `phase` (`((waveFrac + w * 0.45) % 1 + 1) % 1`) and `r = Math.max(0.5, ...)` in [`v3_core.js`](file:///home/chris/Documents/Syncopy/koku-and-steam/v3_core.js#L1836-L1846), then re-bundled [`koku_steam_mitochondrial_village_simulation_V4.html`](file:///home/chris/Documents/Syncopy/koku-and-steam/koku_steam_mitochondrial_village_simulation_V4.html).

### BUG-01: Pursuing Samurai Frozen in Place When Chasing a Moving Bandit
- **Status:** `[x] ✅ FIXED (AWAITING VERIFICATION)`
- **Reported By User:** *"I note also that when a Samurai starts to pursue a bandit, it seems to be frozen in place - can we log that as a bug, and institute a bug-fix section?"*
- **Root Cause Diagnosed:**
  1. In `v3_core.js` (`window.stepAlongVillagePath`), path caching checked `actor._pathTargetX !== targetX || actor._pathTargetY !== targetY`. Because a Bandit moves every frame (`dt`), `targetX` and `targetY` changed by ~`0.02` tiles every frame, forcing `findVillagePath()` to rebuild `actor._path` and reset `actor._pathIdx = 0` on **every single frame**.
  2. Because `actor._path[0]` was always set to `nearestRoadNode(gx, gy)`, whenever the Samurai took one step away from that road node toward `actor._path[1]`, the next frame's path reset snapped `actor._pathIdx` back to `0` (`nearestRoadNode`), pulling the Samurai backward into an infinite 1-frame oscillation!
  3. Additionally, Samurai recruited from inside the fenced Dojo courtyard needed to clear the West Dojo Gate (`27.75, 11.15`) first and reset any stale `_path`.
- **Fix Applied:**
  - [x] **Path Cache Threshold (`v3_core.js`):** `stepAlongVillagePath` now only recomputes the road graph when the target moves by $>0.95$ tiles (`targetMovedDist > 0.95`), while continuously updating the final waypoint (`actor._path[actor._path.length - 1]`) to the Bandit's live position.
  - [x] **Forward-Node Pruning (`v3_core.js`):** `findVillagePath` now skips `waypoints[0]` (`startNode`) whenever the actor is already within `0.55` tiles of `startNode` or already closer to `waypoints[1]`, eliminating backward snapping.
  - [x] **Dojo Exit & Direct Intercept (`v4_expansion.js`):** Pursuing Samurai inside the Dojo courtyard first sprint out the West Dojo Gate (`27.75, 11.15`), follow the road network, and switch to direct high-speed pursuit once within `4.5` tiles of their target Bandit.
  - [x] **"Asterix Magic Potion" Koku Consumption Ritual (`consumingKoku`, `2.15–2.25s`):** When a Samurai is gifted emergency energy via Adenylate Kinase Salvage or recruited from the Dojo to hunt a Bandit, they enter `state = 'consumingKoku'` for `2.25s`, hoisting a glowing Golden Koku Elixir Gourd overhead (`🧪 Taking Koku Potion! ⚡`) with rising lightning sparks while the Bandit remains unengaged and runs deep into the village plazas (`Village I`, `Wellhouse`, `Village III`) so the Samurai genuinely has to chase them down!
- **📝 User Verification Notes (Edit Offline):**
  > *(Test Bandit pursuit in V4.html and note here if BUG-01 is resolved or needs further tuning...)*
  > Need to allow the bandits to have more access to the village - they are now being mugged too quickly by Samurai in the queue. I think the neatest way to achieve this is for a Samurai, having been gifted his energy - needs to physically "take" it, like Asterix drinking the magic potion.. that takes enough time for the Bandit to move past and therefore *need* to be chased.
  >
  > **✅ Antigravity Resolution (Implemented in V4):**
  > Added the `consumingKoku` ("Asterix Magic Potion") state (`2.25s` duration). When gifted Koku in the queue (stepping slightly aside to `24.85, 6.55`) or recruited from the Dojo, the Samurai raises both arms to guzzle a glowing Golden Koku Gourd with rising golden sparks (`🧪 Taking Koku Potion! ⚡`). During those `2.25s`, the Bandit is unengaged and sprints at `2.55` tiles/sec straight into the village plazas (`Village I`, `Wellhouse`, `Village III`), forcing an authentic high-speed chase across the village!

### BUG-02: Simulation Freezes / Hits False Endpoint in Seconds After Slowing Samurai (`F-07`)
- **Status:** `[x] ✅ FIXED (AWAITING VERIFICATION)`
- **Reported By User:** *"Ok - much better, but at this pace we must slow down the rate of ADP->ATP - because even the balanced fasted state is leading to an endpoint in seconds. I think actually it could be an error state: the sim freezes rather than presenting an endpoint"*
- **Root Cause Diagnosed (Verified via Headless Deno Trace):**
  1. **Dojo $\text{ATP} \rightarrow \text{ADP}$ Burn Rate & Castle $\text{ADP} \rightarrow \text{ATP}$ Minting Rate Mismatch:** When Samurai walking speeds were slowed by ~45% in `F-07`, the Dojo Koku `burnRate` remained at the old fast rate (`0.28`), causing all 14 Dojo Samurai to burn through their Koku in ~3.5 seconds while taking ~10 seconds for the Castle–Dojo round-trip walk.
  2. **Premature Adenylate Kinase Trigger on Exiting Dojo Samurai:** `queueAtCastle` checked `s.gx >= 23.8`, which accidentally included depleted Samurai still inside or exiting the Dojo (`gx = 28.5..31.0`), triggering `2ADP -> ATP + AMP` within 5 seconds even when the Castle Gate was clear.
  3. **Queue Head (`q === 0`) Deadlock by Far-Away Recovering $\text{AMP}$ Samurai:** When an $\text{AMP}$ Donor finished ringing the Wellhouse Bell at `(14.3, 9.25)`, it entered `state = 'approaching'` (`isRecoveringAMP = true`) with a lower `queueJoinSeq` than Samurai who depleted later in the Dojo. As soon as earlier Samurai cleared the gate, the far-away `isRecoveringAMP` Samurai walking at `0.95` tiles/sec from `gx = 14.3` claimed `q === 0` (`activeQueue[0]`). Because only `q === 0` at `dist <= 0.12` could receive Koku, **every Samurai standing at the Castle Gate (`q = 1..10`) froze in line waiting 12+ seconds for `q === 0` to walk across the village**, stopping Complex V from draining the Dam!
  4. **False Necrosis Endpoint & Canvas Freeze (`return;`):** With Complex V blocked from draining the Dam, `damLevel` overflowed to `99%`, spawning $\text{ROS}$ backpressure fires that drained $\text{GSH}$ to $\le 2\%$. Because the `necrosis` check at line 601 of `v4_expansion.js` did not check `SimState.toxinLoad >= 50`, even `0%` toxin states (`Balanced Fasted`) triggered `crisisState = 'necrosis'`, which hit an early `return;` at line 385 before updating particles, ripples, or characters—freezing the entire canvas in place!
- **Fix Applied:**
  - [x] **Slowed $\text{ATP} \rightarrow \text{ADP}$ Burn & $\text{ADP} \rightarrow \text{ATP}$ Minting Pacing (`v4_expansion.js`, `v3_core.js`):** Reduced Dojo `burnRate` by ~55% (`0.28` $\rightarrow$ **`0.125`**), slowed Castle Gate `exchangeProgress` (`2.2` $\rightarrow$ **`1.05`**, ~1.0s visible handoff per Samurai), and tuned `wheelDrainRate` (`7.2`) + `basalHousekeepingLeak` (`3.2`) so the Dam stays in steady-state equilibrium (`35%–74%` in Default, Fasted, and Exercise).
  - [x] **Dedicated `recoveringAMP` State (`v4_expansion.js`):** Donor Samurai walking back from the Wellhouse now use `state = 'recoveringAMP'` until they physically reach the Castle queue tail (`gx >= 24.6`), where they receive `queueJoinSeq = ++SimState.samuraiQueueSeq` and join the back of the line—never blocking `q === 0` while in transit.
  - [x] **Strict West Castle Queue Avenue Filter (`gx <= 26.1 && gy <= 10.2`):** Only Samurai physically on the West Castle Queue Avenue count toward `queueAtCastle` and `gateRiotQueueCount`, and `activeQueue` sorts Samurai already on the avenue ahead of Samurai still walking out of the Dojo.
  - [x] **Gated `necrosis` by `toxinLoad >= 50%` & Removed Canvas-Freezing Early Return:** `necrosis` now requires `SimState.toxinLoad >= 50%`, `mtorActive` requires genuine anabolic surplus (`glucoseSupply >= 50 && totalFuelInput >= 105 && samuraiDemand <= 40`), and ambient particles/ripples/callouts continue animating in all states.

---

## 🧬 Feature Specifications, Status & Playtest Feedback

---

### F-01: Adenylate Kinase Salvage ($2\text{ADP} \rightleftharpoons \text{ATP} + \text{AMP}$) & Wellhouse $\text{AMPK}$ Alarm
- **Status:** `[x] 🏆 VERIFIED`
- **Biochemical Mechanism:** Conserved Adenine Nucleotide Pool ($\text{ATP} + \text{ADP} + \text{AMP} = 20$), Myokinase / Adenylate Kinase emergency phosphotransfer ($2\text{ADP} \rightleftharpoons \text{ATP} + \text{AMP}$), and allosteric $\text{AMPK}$ activation at the lysosomal/mitochondrial surface.

#### 1. The Biochemical Reality (The "Why")
In a real cell, the total adenine nucleotide pool ($\text{ATP} + \text{ADP} + \text{AMP}$) is strictly conserved. During acute, overwhelming stress—such as a sudden influx of xenobiotic toxins—the cell hydrolyses $\text{ATP}$ rapidly to power detoxification and repair efforts. If mitochondrial OxPhos (Complex V) cannot re-phosphorylate $\text{ADP}$ back into $\text{ATP}$ fast enough, $\text{ADP}$ levels spike dangerously. To prevent immediate cellular collapse, **Adenylate Kinase** slams two $\text{ADP}$ molecules together to salvage one $\text{ATP}$, leaving behind one $\text{AMP}$:
$$2\text{ADP} \rightleftharpoons \text{ATP} + \text{AMP}$$
1. **Immediate Energy:** Provides rapid emergency $\text{ATP}$ to keep critical survival/detoxification functions running.
2. **The Alarm Bell:** Generates $\text{AMP}$, a potent allosteric activator of $\text{AMPK}$ that shuts down anabolic growth ($\text{mTOR}$) and triggers emergency catabolic rescue (autophagy, GLUT4 translocation, fuel mobilization).

#### 2. The Village Metaphor (The "What")
- **$\text{ATP}$ (High Energy):** Samurai holding Golden Koku, either training in the Dojo or actively hunting Bandits.
- **$\text{ADP}$ (Depleted):** Samurai with empty baskets queuing single-file along the West Castle Avenue waiting for Complex V to mint fresh Koku.
- **$\text{AMP}$ (Alarm State):** A desperate, empty-handed Donor Samurai who sacrificed their remaining energy to a peer, glowing with a cyan ring and sprinting to ring the Bronze Alarm Bell at the Apothecary Wellhouse.

#### 3. Game Mechanics & Simulation Logic Checklist (The "How")
- [x] **A. The Trigger (Tuned to `> 4` with Active Bandits or `> 7` Otherwise):** Activates when the Castle $\text{ADP}$ Queue exceeds **4 Samurai** while Bandits are raiding (`queueAtCastle.length > 4 && SimState.bandits.length > 0`) **or** exceeds **7 Samurai** without Bandits (`queueAtCastle.length > 7`), with a `1.35s` cooldown (`akCooldown`) that actively relieves the Ronin riot timer (`crisisTimer -= 2.5s`).
- [x] **B. The Desperate Trade ($2\text{ADP} \rightarrow \text{ATP} + \text{AMP}$):**
  - Pulls the first two $\text{ADP}$ Samurai (`queueAtCastle[0]` and `queueAtCastle[1]`) from the line while the rest of the queue shifts forward smoothly in strict FIFO order (`queueJoinSeq`).
  - **Recipient ($\text{ATP}$):** Receives a full Golden Koku (`kokuEnergy = 1.0`), steps aside (`24.85, 6.55`) into `consumingKoku` (`2.25s`, `🧪 Taking Koku Potion! ⚡`) so the Bandit can enter the village, and then sprints out in `chasingBandit` (`⚔️ Pursuing!`) to suppress Bandit sabotage by $80\%$.
  - **Donor ($\text{AMP}$):** Switches to `toWellhouseAMP`, surrounded by a pulsing cyan ring and labeled `🔔 AMP → Wellhouse!`, and sprints along the village road network to the Wellhouse (`14.3, 9.25`).
- [x] **C. The $\text{AMPK}$ Alarm (Wellhouse Arrival, $1.35\text{ s}$ Bell Pause & Slow Recovery Walk):**
  - Donor pauses at the Wellhouse porch for **$1.35\text{ s}$** (`state = 'ringingWellhouseBell'`, labeled `🔔 Ringing AMPK Alarm!`), ringing the hanging **Bronze Alarm Bell (`Bonsho`)** (`SimState.wellhouseAlarmTimer = 1.65`) and radiating cyan soundwaves.
  - Immediately shuts down `SimState.mtorActive = false` and spawns an emergency **$\text{AMPK}$ Ninja** at the Wellhouse (bypassing wave caps) to close the UCP1 sluice, unlock GLUT4, strip Shrine scaffolding, or boost substrate sliders.
  - After ringing the bell, the Donor transitions to a fatigued recovery walk (`isRecoveringAMP = true`, `😮‍💨 AMP → ADP (Returning)`) at **half normal speed (`1.35` tiles/sec vs. `2.95`)** so it takes ~9 seconds to walk back across the village to rejoin the tail of the Castle $\text{ADP}$ queue (and does not count toward Castle riot pressure while walking back).
- [x] **D. Visuals & Telemetry:**
  - Top HUD `ATP:ADP:AMP` counter dynamically updates (`SimState.ampCount`), pulsing the `AMP` count in sky-blue and expanding a dedicated **sky-blue bar segment (`#hudAmpBar`)** alongside the ATP and ADP bar segments.
  - Expanding cyan-and-gold reaction rings (`SimState.akTradeFlashTimer`) and 14 cyan/gold sparks erupt at the queue head when the trade occurs (`⚡ 2ADP → ATP + AMP!`).

#### 📝 User Playtest Feedback & Ways to Improve (Edit Offline)
> **Playtest Success / Observations (Round 1):**
> - Takes too long to occur - it's much too likely that the samurai will riot.
> **Requested Adjustments / Ways to Improve (Round 1):**
> - *(e.g., Should the trade happen at a lower queue threshold like `> 8`? Should the Donor Samurai pause for 0.5s at the Wellhouse bell before walking back to the queue?)*
> - Yes - it's currently too fast for the samurai to re-join the queue. Should happen a little earlier, >7 or >4 with active bandits.
> - I note also that when a Samurai starts to pursue a bandit, it seems to be frozen in place - can we log that as a bug, and institute a bug-fix section?
> - This generally is fine now.
> - 
> **✅ Antigravity Resolution (Implemented in V4):**
> 1. Updated the AK Salvage trigger threshold to **`> 4` queued Samurai with active Bandits** (`queueAtCastle.length > 4 && SimState.bandits.length > 0`) or **`> 7` queued Samurai** otherwise (`queueAtCastle.length > 7`), shortened `akCooldown` to `1.35s`, and made each AK trade + Bell ring subtract `2.0–2.5s` from the Ronin riot timer (`crisisTimer`).
> 2. Added a `1.35s` `ringingWellhouseBell` pause at the Wellhouse where the Donor strikes the Bronze Bell (`🔔 Ringing AMPK Alarm!`), followed by a slow, fatigued recovery walk back across the village (`speed = 1.35`, labeled `😮‍💨 AMP → ADP (Returning)`).
> 3. Logged and fixed **BUG-01** (Pursuing Samurai frozen in place + Asterix Koku Potion drinking delay) in the **`## 🐛 Bug Tracker & Resolution Log`** section above.
>
> **Playtest Feedback (Round 2 — Edit Offline):**
> - *(Type your next observations here...)*

---

### F-02: Castle–Dojo One-Way Clockwise Circulation Loop, Gravity Dam & Onsen Sluice Valve
- **Status:** `[x] 🏆 VERIFIED`
- **Biochemical Mechanism:** Spatial separation of newly phosphorylated $\text{ATP}$ export vs. depleted $\text{ADP}$ return flux; Proton Motive Force ($\Delta p$ / $\Delta\Psi_m$) impounded by the Inner Mitochondrial Membrane barrier; and $\text{UCP1}$ mechanical proton-leak channel gating.
- **Implementation Summary:**
  - [x] **Inbound $\text{ADP}$ Queue (`gx = 25.55`):** Depleted Samurai exit the **South-West Dojo Gate (`27.85, 11.15`)**, walk west along `gy = 11.15`, and form a northward single-file line along the West Castle Queue Avenue (`gx = 25.55, gy = 6.72 .. 9.51`).
  - [x] **Outbound Full-Koku Promenade (`gx = 28.25`):** Recharged Samurai carrying Golden Koku (`toTrainingYard`, labeled `🌾 Koku → Dojo`) step **East** from the Castle gate onto a dedicated cobblestone **Golden Koku Return Promenade (`27.15, 6.75` $\rightarrow$ `28.25, 6.85` $\rightarrow$ `28.25, 8.55` $\rightarrow$ `30.65, 8.55`)** and enter the Dojo through the **North Torii Gate (`30.65, 9.48`)**.
  - [x] **4-Sided Impounded Gravity Dam (`renderElevatedDam`):** Replaced the open cross-section water box with a fully enclosed 4-wall *Ishigaki* masonry reservoir basin (North cliff wall, West & East wing-walls, and a 3-tiered battered Southern Gravity Dam face with 6 heavy stone buttress piers, crest parapets, animated reservoir surface ripples, and a penstock flume chute feeding Complex V).
  - [x] **Literal Mechanical Onsen Sluice Gate & Rotating Handwheel Valve (`renderOnsenSpillway`):** Built a timber-and-stone sluice gatehouse (`Suimon`) directly into the Dam's eastern spillway gap (`gx: 28.88..30.32, gy: 3.12..3.78`) featuring a **vertically sliding iron-bound cedar gate leaf**, a threaded iron lifting spindle, a **rotating red/teal & brass 6-spoked valve handwheel** atop the gatehouse roof, and a foaming white-water chute when opened (`🔓 VALVE OPEN` vs. `🔒 VALVE CLOSED`).

#### 📝 User Playtest Feedback & Ways to Improve (Edit Offline)
> **Requested Adjustments / Ways to Improve (Round 1):**
> - We need a valve on the onsen, maybe a literal gate. Alongside that, we need a more self-consistent "dam" that looks like a dam. The current representation is a visual cross-section, and doesn't really look like a real dam.
>
> **✅ Antigravity Resolution (Implemented in V4):**
> 1. Rebuilt `renderElevatedDam()` as a 4-walled impounded reservoir behind a stepped, battered gravity dam face with 6 stone counterfort buttresses and crest parapets—no exposed water cross-section.
> 2. Built a literal vertical-sliding Sluice Gate leaf (`Suimon`) + overhead rotating 6-spoked Valve Handwheel into the Dam's eastern Onsen channel (`renderOnsenSpillway()`) that lifts open to unleash a foaming waterfall cascade into the Onsen bath.
>
> **Playtest Feedback (Round 2 — Edit Offline):**
> - *(Type your next observations here...)*
> - Yes, the dam is far better looking now, and consistent physically.
---

### F-03: Complex IV Paired $2\times2$ Steam-Kiln Jaw-Clamp & Triatomic $\text{H}_2\text{O}$ Molecule Ejection
- **Status:** `[x] ✅ IMPLEMENTED (AWAITING REVIEW)`
- **Biochemical Mechanism:** Cytochrome $c$ Oxidase (Complex IV) four-electron reduction of $\text{O}_2$ at the $\text{Heme } a_3 / \text{Cu}_B$ binuclear center ($4\text{ Cyt } c^{2+} + 8\text{H}^+_{\text{matrix}} + \text{O}_2 \rightarrow 4\text{ Cyt } c^{3+} + 4\text{H}^+_{\text{IMS}} + 2\text{H}_2\text{O}$), preventing partial-reduction hydroxyl radical ($\cdot\text{OH}$) leak.
- **Implementation Summary:**
  - [x] **Two-Sided Jaw Snap-Shut (`clamping` $\rightarrow$ `sealed`, `0.00s – 0.52s`):** When the 4th Mochi bun is deposited in time (`< 3.2s`), all 4 buns remain visible inside the two `[2e⁻]` chambers while the **left and right copper-iron kiln jaws physically snap shut** (`clampT: 0 → 1`) around the central $\text{O}_2$ orb, locking the top cross-clamp and igniting a glowing cyan-gold catalytic seam while pumping $2\text{ H}^+$ to the Dam.
  - [x] **Jaw Snap-Open & Triatomic $\text{H}_2\text{O}$ Launch (`opening`, `0.52s – 0.85s`):** The two kiln sides spring back open (`clampT: 1 → 0`), venting steam and flinging **triatomic $\text{H}_2\text{O}$ water molecules** (central blue Oxygen sphere bonded to two white Hydrogen spheres at $104.5^\circ$ with a trailing vapor arc) into the Southern $\text{O}_2$ River.

#### 📝 User Playtest Feedback & Ways to Improve (Edit Offline)
> **Playtest Success / Observations:**
> - *This looks good now*
>
> **Requested Adjustments / Ways to Improve:**
> - *(Type any timing or animation tweaks here...)*

---

### F-04: Xenobiotic Bandit Raids, "Asterix Potion" Koku Consumption & 1-on-1 Samurai Pursuit ($80\%$ Sabotage Suppression)
- **Status:** `[x] ✅ IMPLEMENTED (AWAITING REVIEW)`
- **Biochemical Mechanism:** Electrophilic xenobiotic/heavy-metal infiltration, $\text{GSH}$ conjugation/depletion, $\text{Fe-S}$ cluster scarring, and $\text{ATP}$-dependent Phase II/III detoxification.
- **Implementation Summary:**
  - [x] Bandits spawn along the Onsen trail (`toxinLoad > 5%`: 1 Bandit at $6\text{–}34\%$, 2 at $35\text{–}79\%$, up to 5 at $\ge 80\%$) and head straight toward the interior village plazas (`Village I`, `Wellhouse`, `Village III`).
  - [x] **"Asterix Magic Potion" Energy Consumption (`consumingKoku`, `2.15–2.25s`):** When a Samurai is gifted Koku in the queue or recruited from the Dojo (`gy > 6.45`), they first spend `2.15–2.25s` raising the Golden Koku Gourd overhead to drink/absorb the energy (`🧪 Taking Koku Potion! ⚡`), allowing the Bandit to run past into the village before the high-speed chase begins!
  - [x] Close engagement (`dist < 1.25` in `chasingBandit`) suppresses Bandit $\text{GSH}$ drain, $\text{ETC}$ scarring, fire-starting, and porter robbery by **$80\%$** (`sabotageMult = 0.20`) while detoxifying the Bandit over `3.6–4.4s`.

#### 📝 User Playtest Feedback & Ways to Improve (Edit Offline)
> **Playtest Success / Observations:**
> - *(Type your observations here...)*
>
> **Requested Adjustments / Ways to Improve:**
> - *(Type any balance or visual tweaks here...)*

---

### F-05: Unblocked Ketogenesis, 2-Loaf Condensation Cycle & Three Physiological Ketone Body Species ($\beta\text{-HB}$, $\text{AcAc}$, Acetone)
- **Status:** `[x] ✅ IMPLEMENTED (AWAITING REVIEW)`
- **Biochemical Mechanism:** Hepatic/astrocytic ketogenesis ($2\text{ Acetyl-CoA} \rightarrow \text{Acetoacetate} \rightarrow \beta\text{-Hydroxybutyrate} + \text{Acetone}$), $\text{PPAR}\alpha$ regulation, $\text{NLRP3}$ inflammasome inhibition (specific to $\beta\text{-HB}$), and Class I $\text{HDAC}$ inhibition.
- **Implementation Summary:**
  - [x] **Step-by-Step 2-Loaf Condensation Cycle (`renderKetogenesisShrine`):** Removed the permanent static loaves from the Ketogenic Hall. When dormant, the altar has **0 loaves**. When active (`ketoneCycleDuration = 1.95s`), the 1st Acetyl-CoA loaf slides up the bamboo chute onto the left altar pad (`0.00–0.38`), the 2nd loaf slides up onto the right altar pad (`0.38–0.80`), and then the two loaves slide together and snap into a butterfly (`snapping`), leaving the altar empty until the next cycle!
  - [x] **Three Physiological Ketone Body Butterfly Species (`~50% : 33% : 17%`):**
    1. **$\beta\text{-Hydroxybutyrate}$ ($\beta\text{-HB}$, ~`50%`, **Golden-Amber Butterfly**):** The **ONLY** ketone body with the $\beta$-hydroxyl group able to dive-bomb and extinguish $\text{ROS}$ fires (`🦋 β-HB ⊣ NLRP3!`) or perform $\text{PGC-1}\alpha$ epigenetic repair at Village III (`🦋 β-HB → PGC-1α`).
    2. **Acetoacetate ($\text{AcAc}$, ~`33%`, **Cerulean-Indigo Butterfly**):** Oxidized ketone fuel (`🦋 AcAc (Fuel)`); delivers an Acetyl-CoA fuel bale to Village I (`🦋 AcAc → Acetyl-CoA (Fuel)`) or glides across the matrix, but **cannot extinguish fires**.
    3. **Acetone (~`17%`, **Volatile Rose-Pink Butterfly**):** Spontaneous decarboxylation byproduct (`💨 Acetone (Volatile)`); flutters skyward and evaporates after `3.1s` (`💨 Acetone (Exhaled)`), **unable to extinguish fires**.

#### 📝 User Playtest Feedback & Ways to Improve (Edit Offline)
> **Playtest Success / Observations (Round 1):**
> - Appears that there are permanently 2 loaves in the ketogenic hall - we need to improve that animation, so that once the hall is open, (and at a realistic level.. I think there is too much being produced; we need to consider that there are three types of ketone bodies, and only one - B-HB, can act as a fire extinguisher)
>
> **Requested Adjustments / Ways to Improve (Round 1):**
> - Three different types (colours) of butterfly, consistent with biochemistry - proportion of BHB, acetoacetate and acetone. That limits the utility, because only the golden butterflys can dive bomb the fires.
>
> **✅ Antigravity Resolution (Implemented in V4):**
> 1. Replaced the static loaves in `renderKetogenesisShrine()` with a synced 2-loaf condensation cycle (`ketoneCycleDuration = 1.95s`): empty altar when dormant; 1st loaf slides up chute to left pad $\rightarrow$ 2nd loaf slides up chute to right pad $\rightarrow$ both loaves condense & snap into a butterfly $\rightarrow$ altar is empty again.
> 2. Implemented the 3 ketone butterfly species in a `3 : 2 : 1` physiological ratio (`50%` Golden $\beta\text{-HB}$, `33%` Cerulean-Blue $\text{AcAc}$, `17%` Rose-Pink $\text{Acetone}$). Only Golden $\beta\text{-HB}$ butterflies can target and extinguish $\text{ROS}$ fires (`🦋 β-HB ⊣ NLRP3!`) or heal Village III; Blue $\text{AcAc}$ butterflies act strictly as Complex I fuel; Pink $\text{Acetone}$ butterflies flutter skyward and evaporate (`💨 Acetone (Exhaled)`).
>
> **Playtest Feedback (Round 2):**
> - The animation is better - but at the point where 2 loaves snap together, they both flick apart first - this looks wrong, they should move together and then snap like magnets. I like the shuddering effect, it's only the "flick back" that I want to lose.
>
> **✅ Antigravity Resolution (Round 2 — Implemented in V4):**
> - Diagnosed the exact cause of the outward "flick back": previously, Loaf 1 and Loaf 2 rested on the altar at world coordinates `(2.68, 3.18)` and `(3.28, 3.18)` (`±9.6 * z` px from center), and when `kb.phase === 'snapping'` started (`t = 0`), `drawKetoneButterfly()` jumped them outward to `pos.x ± 18 * z` px before pulling them in.
> - Fixed both `renderKetogenesisShrine()` and `drawKetoneButterfly()` so the two loaves shudder in place at their exact altar coordinates `(2.68, 3.18)` and `(3.28, 3.18)` (`scale = 0.65`) and then accelerate inward like magnets (`magPull = Math.pow(t, 2.5)`, `halfSep = 0.30 * (1 - magPull)`) into `(2.98, 3.18)` with **zero outward flick**.
>
> **Playtest Feedback (Round 3 — Edit Offline):**
> - *(Type your next observations here...)*
---

### F-06: Three-Pathway Redox-Gated $\text{ETC}$ Repair, Walled-Off $\beta$-Oxidation & Warburg / $\text{mSLP}$ Stage Bonfires
- **Status:** `[x] ✅ IMPLEMENTED (AWAITING REVIEW)`
- **Biochemical Mechanism:** $\text{PINK1/Parkin}$ mitophagy, $\text{PGC-1}\alpha$ biogenesis, $\text{Fe-S}$ cluster repair, $\text{ROS}$-Induced $\text{ROS}$ Release ($\text{RIRR}$), $\text{HIF-1}\alpha/\text{NAD}^+$ shutdown of $\beta$-oxidation, and $\text{HIF-1}\alpha / \text{PDK1}$ glycolytic Warburg + glutaminolysis ($\text{mSLP}$) bonfire lock-in.
- **Implementation Summary:**
  - [x] **Redox Gate (`toxinLoad < 15%` & `bandits.length === 0`):** Unlocks passive $\text{GSH/Fe-S}$ repair (`-1.85%/s`), $\text{AMPK}$ Ninja Mitophagy at Village I (`-8% Scar`), Golden $\beta\text{-HB}$ Butterfly $\text{PGC-1}\alpha$ healing at Village III (`-4% Scar`), and $\text{mTOR}$ Monk Biogenesis (`-6% Scar`).
  - [x] **Complete Walled-Off Shutdown of $\beta$-Oxidation (`etcDamage >= 55%`):** The Fat Processing Yard is completely enclosed by a 4-sided stone-and-timber containment wall topped with crimson coping beams, crossed hazard timbers, and a `🧱 WALLED OFF (β-OX SHUTDOWN)` sign; `effectiveFat` drops to `0` and all fat carts stop.
  - [x] **Glycolytic Stage Warburg Fermentation Bog & Spilling Bales (`renderGlucoseProcessingLine`, `v4_expansion.js`):** Incoming bales pile up against the sealed `⛔ PDK1` gate and spill over both sides of the conveyor into a **bubbling, gas-venting Neon-Green Fermentation Bog (`🫧 WARBURG FERMENTATION BOG`)** (replacing fire animations so it is never confused with ROS fires), while villagers break into a synchronized **Michael Jackson "Thriller" Zombie Dance**!
  - [x] **Wellhouse $\text{mSLP}$ Fermentation Bog (`renderWellhouseApothecary`, `v4_expansion.js`):** Glutamine/Glutamate bales spill around the Wellhouse courtyard, which sinks into a **bubbling Violet $\text{mSLP}$ Fermentation Bog (`🫧 WELLHOUSE mSLP BOG`)** venting gas bubbles while sending energy pulses to the Castle queue!

#### 📝 User Playtest Feedback & Ways to Improve (Edit Offline)
> **Playtest Success / Observations (Round 1):**
> - When we enter this state - it needs to be more obvious that the cell has shifted into compensatory fermentation.
>
> **Requested Adjustments / Ways to Improve (Round 1):**
> - There should be a much more obvious shutdown of beta-oxidation - maybe it is completely walled off. Also the workers from all the complexes should be feeding the incoming bales - now spilling over the sides of the conveyor, into a large bonfire that the stage has become - this should also apply to the wellness house, which is representing mSLP. 
>
> **✅ Antigravity Resolution (Implemented in V4):**
> 1. Completely walled off the $\beta$-Oxidation yard when `etcDamage >= 55%` with a 4-sided stone-and-crimson-timber perimeter barricade, crossed quarantine timbers, halted conveyor, and `effectiveFat = 0`.
> 2. Added 8+ overflowing Tawara bales spilling over both the north and south edges of the Glycolytic conveyor, turned the Glycolytic Stage into a huge roaring Neon-Green Bonfire (`scale = 1.22–1.77`), and placed Complex I & II workers around the stage pitching animated bales into the fire.
> 3. Added spilling Glutamine/Glutamate bales around the Wellhouse, turned the Wellhouse into a huge roaring Violet $\text{mSLP}$ Bonfire, and placed Complex III & IV workers around the Wellhouse pitching animated bales into the fire (with road porters walking to the Wellhouse to join them).
>
> **Playtest Feedback (Round 2 — Edit Offline):**
> - *(Type your next observations here...)* 


### F-07: Slower & Smoother Character Pacing, Multi-Frame Articulated Animations & 60% Gentler Toxin Slider
- **Status:** `[x] ✅ IMPLEMENTED (AWAITING REVIEW)`
- **Biochemical & Visual Goal:** Keep the core substrate-to-Complex I–IV-to-Castle flow speed intact, while slowing down and smoothing out the movement and animations of **Ninjas, Bandits, Monks, and Samurai** so an observer can clearly follow every signalling and combat interaction, and reducing the strength of the **Xenobiotic Toxin Slider** by ~60% so low toxin levels (`~10%`) do not trigger chronic overload in seconds.
- **Implementation Summary:**
  - [x] **60% Reduction in Toxin Slider & Bandit Sabotage Strength (`v4_expansion.js`):**
    - Added proportional `toxinScale = 0.35 + 0.65 * (SimState.toxinLoad / 100)` scaling and reduced base sabotage rates by ~60%:
      - Bandit $\text{GSH}$ drain: `1.95` $\rightarrow$ **`0.65 * toxinScale / s`** (at `10%` toxin, `~0.27%/s` unengaged or `0.05%/s` when parried by a Samurai — easily outpaced by basal $\text{GSH}$ synthesis!).
      - Bandit $\text{ETC}$ scarring rate: `1.35` $\rightarrow$ **`0.45 * toxinScale / s`**.
      - Bandit arson `fireTimer` interval: `2.8s` $\rightarrow$ **`6.8s`**.
      - Porter cargo robbery scar: `+2.4%` $\rightarrow$ **`+0.9 * toxinScale %`**, `robCooldown`: `2.6s` $\rightarrow$ **`5.5s`**.
      - Bandit spawn interval (`spawnInterval`): `4.8s / 3.2s / 1.6s` $\rightarrow$ **`10.5s / 7.2s / 4.2s`**.
      - Endogenous $\text{RIRR}$ self-scarring rate: `1.35` $\rightarrow$ **`0.52`**.
  - [x] **Smooth Cornering & Continuous Sub-Step Pathfinding (`window.stepAlongVillagePath` in `v3_core.js`):**
    - Replaced abrupt waypoint snapping with continuous sub-step path traversal, lookahead corner blending within `0.45` tiles of road turns, and shortest-angle heading interpolation (`headingAngle`).
  - [x] **Slowed & Articulated Ninjas, Monks, Bandits, and Samurai (`v3_core.js`, `v4_expansion.js`):**
    - **AMPK Ninjas (`drawAmpkNinja`):** Travel speed reduced `4.6` $\rightarrow$ **`2.15` tiles/sec**, plus a **`1.80s` on-target action ritual (`n.workTimer`)** at the destination landmark (with gleaming cyan-violet Ninjato/Kunai slash arcs, 2-jointed knee/shin stride, pumping arms, and 3-node sinusoidal billowing scarf) before returning to the Castle.
    - **mTOR Zen Monks (`drawMtorMonk`):** Travel speed reduced `2.25` $\rightarrow$ **`1.30` tiles/sec**, plus a **`2.50s` chanting/building ritual (`m.workTimer`)** at the target with pulsing golden *Shakujo* staff rings, swaying saffron *Koromo* robe hem, and 2-jointed *Tabi* legs.
    - **Xenobiotic Bandits (`drawXenobioticBandit`):** Unengaged prowling speed reduced `2.55` $\rightarrow$ **`1.35` tiles/sec** (`0.38` when engaged), detoxification engagement duration extended `3.6–4.4s` $\rightarrow$ **`5.8–6.8s`**, with 2-jointed knee articulation, torso swagger, and continuous *Kanabo* war-club swinging arcs.
    - **Samurai Retainers (`drawSamuraiRetainer`):** Pursuit speed `3.95` $\rightarrow$ **`2.10` tiles/sec** (with pursuit Koku burn reduced proportionally to `0.11 + 0.18 * burnRate`), Koku Potion ritual `2.25s` $\rightarrow$ **`2.85s`**, AMP Wellhouse run `3.65` $\rightarrow$ **`1.95` tiles/sec**, Wellhouse Bell ringing `1.35s` $\rightarrow$ **`2.10s`**, AMP recovery walk `1.35` $\rightarrow$ **`0.95` tiles/sec**, Dojo return promenade `3.05` $\rightarrow$ **`1.75` tiles/sec`, and queue approach `2.95` $\rightarrow$ **`1.75` tiles/sec**, with articulated *Suneate* shin-guards, breathing cadence, and fluttering *Sashimono* banners.

#### 📝 User Playtest Feedback & Ways to Improve (Edit Offline)
> **Initial User Specification:**
> - There is a *lot* of action, and it's much too difficult to see what is actually occurring. The basic speed of the flow of material from input to Complex IV and the castle is fine, but the movement of the ninjas, bandits and monks - and samurai all need to slow down and be more smooth - better animated and with more frames, so that they appear on the screen for longer and an observer can make sense of what is happening. the strength of effect of the "toxin" slider should be about 60% less, because chronic overload can be triggered in seconds at about 10% as it is.
>
> **Playtest Feedback (Round 1 — Edit Offline):**
> - Ok - much better, but at this pace we must slow down the rate of ADP->ATP - because even the balanced fasted state is leading to an endpoint in seconds. I think actually it could be an error state: the sim freezes rather than presenting an endpoint
>
> **✅ Antigravity Resolution (Implemented in V4 — Logged as `BUG-02`):**
> - Reproduced the exact freeze in a 60-second headless Deno simulation of `Balanced Fasted` and fixed all four underlying causes (see **`BUG-02`** in the Bug Tracker above):
>   1. Slowed Dojo $\text{ATP} \rightarrow \text{ADP}$ `burnRate` by ~55% (`0.28` $\rightarrow$ **`0.125`**) and Castle $\text{ADP} \rightarrow \text{ATP}$ `exchangeProgress` (`2.2` $\rightarrow$ **`1.05`**) with `wheelDrainRate = 7.2` so the nucleotide cycle matches the slower `F-07` walking speeds.
>   2. Added a dedicated `recoveringAMP` state for Donor Samurai walking back from the Wellhouse so they only receive a `queueJoinSeq` upon reaching the Castle queue tail (`gx >= 24.6`), preventing a far-away recovering Samurai from claiming `q === 0` and deadlocking the Castle Waterwheel.
>   3. Restricted `queueAtCastle` to Samurai physically on the West Castle Queue Avenue (`gx <= 26.1 && gy <= 10.2`) so Samurai still walking out of the Dojo do not prematurely trigger `2ADP -> ATP + AMP`.
>   4. Required `toxinLoad >= 50%` for `necrosis` and ensured particles/ripples/animations never freeze.
>
> **Playtest Feedback (Round 2 — Edit Offline):**
> - *(Type your next observations here...)*

---

### F-08: Hepatic Gluconeogenesis ($\text{GNG}$), Glycogen Granary, Muscle Outpost Ferry & Calligraphy Koku Donation
- **Status:** `[x] ✅ IMPLEMENTED (AWAITING REVIEW)`
- **Biochemical Mechanism:** Hepatic Glycogenesis/Glycogenolysis, Gluconeogenesis ($\text{Glycerol}$, $\text{Lactate}$ via Cori Cycle, $\text{Alanine}$ via Cahill/Glucose-Alanine Cycle), $\text{GLUT2}$ bidirectional hepatic glucose export, and high $\text{ATP}/\text{GTP}$ energy coupling ($4\text{ ATP} + 2\text{ GTP}$ per glucose).

#### 1. The Biochemical Reality (The "Why")
Because the village models hepatic ketogenesis (`F-05`), its mitochondrial/cytosolic compartment represents a **hepatocyte**. During fasting or carbohydrate restriction, the liver must maintain systemic blood glucose for peripheral tissues (such as skeletal muscle and red blood cells):
1. **Strict Substrate Hierarchy:** The liver first mobilizes stored **Glycogen** (glycogenolysis, low energy cost). Only once Glycogen is depleted—and provided high $\beta$-oxidation/ketogenesis (supplying $\text{Acetyl-CoA}$ to activate Pyruvate Carboxylase and $\text{NADH}$) plus sufficient $\text{ATP}$—does **Gluconeogenesis ($\text{GNG}$)** ramp up using **Glycerol** (lipolysis byproduct) and **Lactate** (Cori Cycle). Only in severe/prolonged starvation is muscle **Alanine** (glucogenic amino acid, Cahill Cycle) tapped.
2. **Glycogenesis as Surplus Back-Pressure:** Conversely, when glucose enters under energy surplus, high insulin/$\text{mTOR}$, or Randle/Citrate $\text{PDH}$ back-pressure, G6P is routed in reverse into the **Glycogen Granary** at a much lower energy cost than $\text{GNG}$.
3. **$\text{GLUT2}$ Export:** Unlike muscle $\text{GLUT4}$, hepatic $\text{GLUT2}$ is bidirectional and insulin-independent, allowing newly synthesized glucose to exit freely into the bloodstream.

#### 2. The Village Metaphor (The "What")
- **Peripheral Muscle Outpost & Bloodstream Ferry:** A Muscle Outpost across the river (outside the hepatocyte village) connected by a **River Ferry** representing the bloodstream. Active muscle ships **Lactate** (Cori Cycle) to the Liver; starving muscle breaks down protein to ship **Alanine** (Cahill Cycle); the Ferry carries exported **Glucose** back to the Muscle.
- **Spill-Over Buckets & Glycogen Granary (West Courtyard):**
  - **Glycogen Granary:** Fills during glycogenesis (surplus / Randle back-pressure) and drains first during fasting.
  - **Glycerol Vat (South of Fat Yard):** Collects discarded Glycerol from $\beta$-oxidation lipolysis and routes it into mid-glycolysis during $\text{GNG}$.
  - **Pyruvate $\leftrightarrow$ Lactate Paired Buckets (Beside Glycolysis Yard):** Visibly swap/equilibrate ($\text{LDH}$), receiving Lactate from the Ferry and feeding Pyruvate into reverse glycolysis.
  - **Alanine Bucket:** Receives Alanine from the Muscle Ferry only during extreme starvation (Glycogen empty + Lactate/Glycerol low).
- **Reverse Glycolysis Conveyor & $\text{GLUT2}$ Entry/Exit Gate:** During Glycogenesis or $\text{GNG}$, the Glycolysis conveyor reverses direction. In $\text{GNG}$, newly minted Glucose hex-rings exit directly through the left **$\text{GLUT2}$** gate.
- **New Character — *Kawabe-no-Miko* (River-Shrine Maiden / $\text{GLUT2}$ Glucose Carrier):** A benevolent Shinto shrine maiden in crisp white *Kosode* and sky-blue/vermilion *Hakama* robes with a *Suzu* bell picks up exported Glucose hex-rings at the left $\text{GLUT2}$ gate and visibly carries them around the yard perimeter to the **Muscle Ferry** dock (visually distinct from Lactate/Pyruvate bucket shuttling).
- **Samurai Koku Donation ("Calligraphy Pavilion"):** To represent $\text{GNG}$'s high $\text{ATP}$ cost, a newly paid `ATP` Samurai (or an `ATP` Samurai minted via `2ADP → ATP + AMP` when no Bandits are present and the Castle queue is backed up) visits a **Calligraphy Pavilion** beside the Glycolysis Yard, visibly donates their Golden Koku to power the reverse conveyor, spends **`2.5s`** practicing *Shodo* calligraphy, and returns to the Castle queue as `ADP`.

#### 3. Game Mechanics & Simulation Logic Checklist (The "How")
- [x] **A. Emergent Control & HUD Readout (`index.html`, `v4_expansion.js`):**
  - No direct user sliders for Glycogen or $\text{GNG}$; both emerge from Fuel, Demand, Insulin/$\text{mTOR}$, and Redox state.
  - Add a **Glycogen & $\text{GNG}$ Output** HUD readout showing Glycogen reserve `%`, active pathway (*Glycogenesis / Glycogenolysis / $\text{GNG}$ / Glycolysis*), and active substrate tier (*Glycogen $\rightarrow$ Lactate & Glycerol $\rightarrow$ Alanine*).
- [x] **B. Glycogenesis & Glycogenolysis (`v4_expansion.js`, `v3_core.js`):**
  - **Glycogenesis:** Triggered by glucose entry under energy surplus, high insulin/$\text{mTOR}$, or Randle/Citrate $\text{PDH}$ back-pressure; runs the conveyor in reverse into the **Glycogen Granary** at low energy cost.
  - **Glycogenolysis:** First-line response when `glucoseSupply` drops; drains the Glycogen Granary before $\text{GNG}$ activates.
  - **Preset Initialization:** Realistic starting Glycogen per preset (e.g., full in `Overfed` / `Default`, moderate in `Balanced Fasted`, empty in `Starvation`).
- [x] **C. $\text{GNG}$ Context Gate & Substrate Hierarchy (`v4_expansion.js`):**
  - Requires low `glucoseSupply` / `mtorActive === false`, high `effectiveFat` / `ketogenesisActive`, `etcDamage < 55%`, and available Samurai Koku donations.
  - Strict demand order: **Tier 1 (Glycogen)** $\rightarrow$ **Tier 2 (Lactate + Glycerol)** $\rightarrow$ **Tier 3 (Alanine)**.
- [x] **D. Muscle Outpost, River Ferry & $\text{GLUT2}$ Glucose Carrier (`v3_core.js`, `v4_expansion.js`):**
  - Render **Peripheral Muscle Outpost** and animated **Bloodstream Ferry** shuttling Lactate/Alanine in and Glucose out.
  - Switch left gate label/state to **$\text{GLUT2}$ (Export)** during $\text{GNG}$, spawning a ***Kawabe-no-Miko* (River-Shrine Maiden)** character to carry new Glucose hex-rings around the yard to the Ferry dock.
- [x] **E. Samurai Calligraphy Koku Donation (`v4_expansion.js`, `v3_core.js`):**
  - Add **Calligraphy Pavilion** landmark near the Glycolysis Yard and `toCalligraphy` / `calligraphy` Samurai state (`2.5s` *Shodo* animation) before returning as `ADP` to the Castle queue.
  - Respect Bandit priority: Samurai never divert to Calligraphy while Bandits are raiding.

#### 4. Playtest Notes & Tuning (Edit Offline After Implementation)
> **Round 1–2 Layout, Ferry, Spirit & Fat-Adapted Recovery (Frozen in V4, Active in V5):**
> - **Suspended *Shodo* Calligraphy Pavilion:** Placed on a cantilevered *hinoki* pier overhanging the Southern River directly opposite Castle Complex V (`gx: 25.55, gy: 12.85`). Donating Koku spawns a river ripple and a golden-cyan **Water Spirit (*Suijin* wisp)** gliding west along the river to the Glycolysis Yard.
> - **Raised Muscle Outpost, Pontoons & *Isobune* Craft:** Muscle Outpost stands on stilts in the river opposite the Wellhouse (`gx: 14.3, gy: 14.05`, between Complex II and the mTOR Shrine) with a **SW docking pontoon** (`gx: 13.86..14.72, gy: 14.68..15.40`). A matching **SE Cytosol pontoon** (`gx: 4.85..6.00, gy: 12.55..13.73`) meets two depth-sorted traditional Japanese ***Isobune*** wooden boats gliding strictly over open water (`gy = 13.42–15.32`). A human **Dockhand Porter** offloads Lactate/Alanine to the spill-over buckets while ***Kawabe-no-Miko*** carries $\text{GLUT2}$ Glucose to the outbound *Isobune*.
> - **Flush Cytosol SW Bank:** Lowered the `gx = 0..5, gy = 13.0` stone embankment (`z = 0.01 → -0.16`) and extended `isOxygenRiver` across `gx = 0..34` so the entire Southern River is continuous water.
> - **Fat-Adapted Muscle $\beta$-HB + GNG Spirit Recovery:** When `ronin.length > 5`, `effectiveFat >= 35`, `ketogenesisActive`, and `samuraiDemand < 90`, Golden $\beta$-HB butterflies prioritize flying to the Muscle Outpost (**SCOT** oxidation) over fire-fighting; both $\beta$-HB arrival and GNG Glucose docking release a rate-limited (`4.5s` cooldown) **Calming Water Spirit** that coaxes 1 prowling Ronin back to the Castle `ADP` queue.

---

### F-09: Complex II ($\text{SDH}$) Succinate Back-Pressure, Reverse Electron Transport ($\text{RET-ROS}$) & Adaptive ROS Feedback
- **Status:** `[x] ✅ IMPLEMENTED (AWAITING REVIEW)`
- **Biochemical Mechanism:** Succinate-driven Reverse Electron Transport ($\text{CoQH}_2 + \text{high } \Delta\Psi_m \rightarrow \text{Complex I } \text{O}_2^{\bullet-}$), $\text{ROS}$ as an adaptive retrograde feedback signal (aconitase/PDH/$\beta$-ox fuel brake, $\text{O}_2^{\bullet-}$-activated $\text{UCP/ANT}$ mild uncoupling, $\text{Nrf2} \rightarrow \text{GSH}$ hormesis), and chronic Succinate $\rightarrow$ $\text{PHD}$ inhibition ($\text{HIF-1}\alpha$ pseudohypoxia).

#### 1. The Biochemical Reality (The "Why")
1. **Reverse Electron Transport ($\text{RET-ROS}$):** Complex II does not pump protons, so it continues feeding electrons into the $\text{CoQ}$ pool even when high $\Delta\Psi_m$ stalls Complex I and III. Over-reduced $\text{CoQH}_2$ under high $\Delta\Psi_m$ forces electrons backward into Complex I, generating a burst of $\text{RET-ROS}$.
2. **Adaptive ROS Feedback (Hormesis):** Acute mitochondrial $\text{ROS}$ is not merely passive damage—it throttles upstream substrate oxidation (protecting the ETC from overstuffing), activates mild proton leak ($\text{UCP/ANT}$) to bleed off excess $\Delta\Psi_m$, and triggers $\text{Nrf2}$-driven $\text{GSH}$ synthesis at moderate levels (`1–3` fires).
3. **Chronic Succinate $\rightarrow$ $\text{HIF-1}\alpha$:** Sustained Succinate accumulation (`>= 9` bales) inhibits prolyl hydroxylases ($\text{PHD}$), stabilizing $\text{HIF-1}\alpha$ and throttling $\text{PDH}$.

#### 2. Game Mechanics & Simulation Logic Checklist (The "How")
- [x] **CoQ Back-Pressure on Village II (`v4_expansion.js`):** Throttles `porter2Timer` when `damLevel > 78%` or `villageStock.v3 >= 6` so Succinate/$\text{FADH}_2$ bales visibly accumulate at Complex II.
- [x] **RET-ROS Arc (Village II $\rightarrow$ Village I, `v4_expansion.js`, `v3_core.js`):** When `villageStock.v2 >= 6` and `damLevel >= 76%`, a crackling amber-gold RET arc shoots from Village II up to Village I, igniting a signalling $\text{RET-ROS}$ fire (`⚡ RET-ROS (II → I): High ΔΨm Feedback!`).
- [x] **Adaptive ROS Feedback Loop (`v4_expansion.js`, `v3_core.js`):**
  - **Fuel Brake (`rosFeedbackBrake`):** Active ROS fires throttle `effectiveFat` and `effectiveGlucose` by up to `25%`.
  - **Partial Automatic UCP1 Sluice Release (`rosSluiceTimer`):** At `fires.length >= 3 && damLevel >= 80%`, the Onsen Sluice Gate automatically cracks open for `2.2s` at **`0.22x`** capacity (`5.5s` cooldown)—providing visible proton-leak relief without compensating for extreme glucose overload.
  - **$\text{Nrf2} \rightarrow \text{GSH}$ Hormesis:** Moderate ROS (`1–3` fires, `gshReserve > 25%`, `toxinLoad < 40%`) boosts Wellhouse $\text{GSH}$ synthesis by `1.35x` (`✨ Nrf2 +GSH Hormesis`).
- [x] **Complex I Reverse Red Wheel, Bale Spill & `+4 H⁺` Feedback (`v4_expansion.js`, `v3_core.js`):** When `damLevel >= 78%` and `villageStock.v1 >= 2`, Complex I's waterwheel turns crimson-red, spins backward (`c1ReverseSlip`), and spills a waiting bale onto the floor into a ROS fire (`2.8s` stall); normal pumping displays `💧 +4 H⁺`.
- [x] **Complex IV $\bullet\text{OH}$ Radical Leak (`v4_expansion.js`, `v3_core.js`):** Steam press stall (`press.timer > 3.2s`) spawns `1–2` larger magenta-crimson **Hydroxyl Radical ($\bullet\text{OH}$)** fires (`intensity: 1.45–1.75`), `+1.5%` ETC scar, and `-3.5%` GSH hit.
- [x] **Chronic ROS + IR Ratchet $\rightarrow$ `NAFLD / MASLD` Endpoint (`v4_expansion.js`, `v3_core.js`):** High ROS (`>= 30%`) + Complex I backup (`v1 >= 3`) drives protective GLUT4 Insulin Resistance (`c1RosIrDrive`) while inhibiting mTORC1 (`fires.length < 2 && rosLevel < 30 && v1 < 4`). A smooth leaky accumulator advances when `rosLevel >= 80% && IR >= 40%`, ratcheting IR up by `+10%` every `30s`. Once `IR > 80%` amid high ROS, golden steatotic lipid droplets accumulate and trigger **`HEPATIC STEATOSIS (NAFLD / MASLD)`**.
- [x] **Articulated *Hikeshi* Firefighters & *Oni* Bandits (`v3_core.js`, `v4_expansion.js`):** Slowed *Hikeshi* firefighters to `1.75–1.95` tiles/sec with `0.65s` douse animation, 2-jointed legs, *shikoro* hood flaps, and sloshing *Teoke* buckets; upgraded Bandits with billowing tattered cloaks, *Kusazuri* tassets, toxic flasks, studded *Kanabo* clubs, and *Oni* fangs.
- [x] **Chronic Succinate $\rightarrow$ $\text{HIF-1}\alpha$ (`v4_expansion.js`):** When `villageStock.v2 >= 7`, `succinateHifDrive` throttles the $\text{PDH}$ gate.

---

## 📥 New Feature Specs (Add or Paste Offline Here)

*(Copy and fill out the template below when designing your next biochemical mechanism offline. Set Status to `[ ] 📋 PLANNED` so Antigravity knows to build it next!)*

### F-07: [Feature Title — e.g., Calcium ($\text{Ca}^{2+}$) Uniporter (MCU) Overload & TCA Dehydrogenase Turbo-Boost]
- **Status:** `[ ] 📋 PLANNED`
- **Biochemical Mechanism:** *(e.g., Mitochondrial Calcium Uniporter $\text{MCU}$ allosterically activates PDH, IDH, and $\alpha$-KGDH at moderate levels, but triggers mPTP opening when overloaded)*

#### 1. The Biochemical Reality (The "Why")
*(Describe the real cellular biochemistry and why it matters...)*

#### 2. The Village Metaphor (The "What")
*(Describe how landmarks, villagers, or cargo represent this in the feudal village...)*

#### 3. Game Mechanics & Simulation Logic (The "How")
- **A. The Trigger:** *(When does it activate?)*
- **B. The Village Behaviour:** *(What do the characters/buildings do?)*
- **C. Visuals & Telemetry:** *(What HUD meters, particles, or labels appear?)*

#### 4. Implementation Notes & Playtest Feedback
> *(Any specific state variables, edge cases, or tuning notes for Antigravity...)*

---

### V5 Warburg Bistable Switch, Feudal Wicker Baskets & Prof. Seyfried's Press-Pulse Protocol
- **Status:** `[x] ✅ IMPLEMENTED (V5)`
- **UI, Visuals & Continuity:**
  1. **Labels Default OFF & Click-Spot Inspection:** `SimState.showLabels` starts `false` (`#lblToggleLabelsText` = `Labels: OFF`) so the canvas opens uncluttered. All major landmarks—including each metabolite basket—can be clicked at any time to inspect live state and biochemistry.
  2. **Feudal Wicker Baskets (`drawWickerBasket`) & Interaction Labels:** `Ala`, `Glycerol`, `Pyr`, `Lac`, and `Succinate` render as tapered woven bamboo baskets with open-top metabolite mounds and front bamboo sight-slits, consistent directional interaction labels, and dedicated `Landmarks` entries (`basketAlanine`, `basketGlycerol`, `basketPyruvate`, `basketLactate`, `basketSuccinate`).
  3. **Muscle Outpost Pontoon Porter (`SimState.musclePorter`):** Stationed on the Muscle Outpost SW pontoon (`14.25, 15.02`) and depth-sorted in `renderQueue`, loading Lactate/Alanine onto inbound *Isobune* and offloading Glucose from outbound *Isobune*.
  4. **Scenario Preset Continuity:** Clicking any `.preset-btn` takes over metabolic parameters from the current context (preserving `SimState.etcDamage` and all active character routes) rather than resetting the village, unless recovering from a terminal state (`SimState.cellDead || SimState.senescenceActive`).
- **Biochemical Rules (Warburg & Press-Pulse):**
  1. **Gradual Pre-Warburg Bog Emergence (`45% → 55%` ETC Scarring) & Balanced Fasting Rescue:** Both the Cytosol Glycolysis Yard and the Wellhouse Apothecary tremble, shed rubble (`drawCrumblingRubble`), and sink into widening fermentation bogs (`drawFermentationBog`, `bogFrac = (etcDamage - 45) / 10`). Selecting **Balanced Fasting** (`Glucose <= 12%`, `Fat >= 75%`, `Toxin < 10%`) in this pre-Warburg window halts RIRR decay, clears ROS/bandits, and heals `etcDamage` down before `55%` lock-in.
  2. **Bistable Warburg Toggle Switch (`55%` Entry / `< 30%` Exit):** Crossing `etcDamage >= 55%` latches `SimState.warburgActive = true` (bogs fully realised, *Thriller* zombie dance, $\beta$-oxidation & ketogenesis shut down, and Ronin rebellion suppressed). Once latched, `warburgActive` remains `true` until `etcDamage < 30%`.
  3. **Warburg Apoptotic Resistance (`SimState.warburgActive === true`):** Intrinsic mitochondrial apoptosis (mPTP breach at `damLevel <= 0.5`) is blocked while `warburgActive` is `true` (representing HK-II/VDAC shielding against Bax/Bak & Cytochrome *c* release, $\Delta\Psi_m$-independent glycolysis + mSLP ATP, and PPP NADPH/GSH buffering).
  4. **User-Driven Seyfried Press-Pulse (`55% <= etcDamage < 99.5%`):**
     - **Lactate Floor Overflow Without Press:** Without Press conditions, `lactatePool` fills to `100%` and leaks an acidic puddle (`drawBasketOverflowPuddle`) across the cobblestone floor (`⚠️ Acidic Lactate Leak!`).
     - **Setting the Press (`Glucose < 10%`, `Fat > 80%`, `Toxin < 5%`):** Halts Warburg glucose-hoarding (`glucoseSupply < 15%`), deploys *Hikeshi* firemen to bale/pump the Glycolysis bog, drains `lactatePool` (drying the floor puddle), and reveals `#btnPressPulse` (`Pulse`). Press alone stabilizes progression without curing Wellhouse mSLP below `30%`.
     - **Succinate Overflow & Spaced `Pulse` Strikes:** `succinatePool` fills in the wicker basket north of the Wellhouse mSLP bog (`14.04, 6.75`). Ignoring overflowing Succinate (`>= 95%`) causes `toxinLoad` to creep up (`+2.6/s`), releasing Xenobiotic Bandits and worsening ETC scarring. Clicking **`Pulse NOW!`** at overflow (`>= 95%`) empties Succinate, triggers a Wellhouse fireman scoop (`pulseAnimTimer = 2.0`), and reduces `etcDamage` by `Math.max(4.5, 11.5 - ((etcDamage - 30) / 70) * 7.0)%` per strike.
     - **Premature `Pulse` Host Toxicity (`succinatePool < 95%`):** Clicking **`Pulse (Wait)`** before Succinate overflows depletes healthy host Glutamine/GSH (`gshReserve - 28%`), spikes `toxinLoad + 18%` (breaking the Press condition), and ignites a ROS fire.
     - **Safe OxPhos Restoration (`etcDamage < 30%`) & Lock-In Clue (`>= 99.5%`):** Driving `etcDamage < 30%` flips `warburgActive = false`, restores `damLevel >= 38%`, and lets normal repair heal `30% → 0%`. If `etcDamage` reaches `99.5%`, `CrisisDefinitions.warburg.desc` explains the Press-Pulse strategy for the user's next attempt.
  5. **Dynamic Bog Inspector Details:** `Landmarks.glucoseLine` and `Landmarks.wellhouse` use `tagFn` / `titleFn` / `metaphorFn` / `biologyFn` / `liveStatFn` to explain structure failure (`45%–55%`) and Press-Pulse / Succinate mechanics (`warburgActive`).

---

### V6 Code Audit Resolution & Active V6 Target Lock
- **Status:** `[x] 🏆 AUDITED & VERIFIED (V6)`
- **Active Build Target:** `koku_steam_mitochondrial_village_simulation_V6.html` (`node scripts/bundle_v6.mjs`). All future updates target **V6**; `V3.html`, `V4.html`, and `V5.html` remain frozen milestone archives.
- **Audit Findings Resolved (per `Audit.md`):**
  1. **Unified Bistable `SimState.warburgActive` Hysteresis:** Replaced all 16 remaining `etcDamage >= 55` / `< 55` Warburg gates in `v4_expansion.js` and clamped `pdk1Block`, `damDrag`, and `fermentStrength` across the `30%–54%` recovery band.
  2. **Consolidated `.preset-btn` Handler & Terminal Recovery (`applyScenarioPreset`):** Removed the duplicate `.preset-btn` listener in `v3_core.js`, removed dead `etcDamage` preset fields, and ensured clicking any preset after any terminal crisis (`apoptosis`, `senescence`, `necrosis`, `warburg`, `nafld`) resets cleanly while preserving live context during normal takeovers.
  3. **Depth-Sorted Bandits & Dead Code Removal:** Moved `SimState.bandits` into `renderQueue` (`v3_core.js`), deleted unused `drawFermentationFire` and unreachable post-`return` Warburg blocks, and updated `v4_expansion.js` landmark extensions to reference fermentation bogs.
  4. **`SimState.showLabels` Enforcement & `#lblBrigadeStatus`:** Guarded persistent character/gate `ctx.fillText()` calls with `if (SimState.showLabels)` and wired `#lblBrigadeStatus` in `updateHUD()`.
  5. **Documentation Sync & Reproducible Bundler:** Added `scripts/bundle_v6.mjs` and synchronized `Design document - Koku & Steam.md`, `PROJECT_HANDOFF_AND_SUMMARY.md`, and `IMPLEMENTATION_TRACKER.md` to V6 and live §1.3 biochemical tuning.

---

### F-10: Cyclical Metabolic States (AMPK ↔ mTOR Garrison Plasticity, `15–25` Samurai)
- **Status:** `[x] ✅ IMPLEMENTED IN V6 (AWAITING REVIEW)`
- **Biochemical Mechanism:** 3-phase physiological cycling between **AMPK Exercise Priming ($\text{PGC-1}\alpha$)**, **Anabolic Recovery ($\text{mTORC1}$ supercompensation)**, and **Balanced Fasting ($\text{AMPK}$ autophagy consolidation vs. prolonged catabolic atrophy)**.
- **3-Phase Gameplay Loop (`v4_expansion.js`, `v3_core.js`, `index.html`):**
  1. **Phase 1 — `High Workload (AMPK)` (`samuraiDemand >= 70%`):** Builds `SimState.exercisePriming` (`0 → 100%`). Once `>= 4` Ronin desert, they form a menacing line along the South-East edge of the Practice Yard (`gx: 31.35.., gy: 11.45..`) facing the Dojo, and `#btnPresetOverfed` dynamically re-labels to **`🍲 Recovery / Feeding`**. Leaving it indefinitely still progresses to `>60%` Ronin Rebellion → mPTP Apoptosis.
  2. **Phase 2 — `🍲 Recovery / Feeding` (`applyScenarioPreset('overfed')` while primed):** Opens a `14.0s` `recoveryWindowTimer` (pausing senescence scaffolding while restoring $\Delta\Psi_m$/ATP so all Ronin return to duty). If left too long after `recoveryWindowTimer` expires, the button reverts to **`🍱 Sedentary Overfed (State 4)`** and resumes normal mTOR scaffolding → Senescence/NAFLD.
  3. **Phase 3 — `Balanced Fasting` (`applyScenarioPreset('fasted')`):**
     - **Zen Monk Changeover (`+1 Samurai`, max `25`):** Switching to Balanced Fasting while `recoveryFedWithPriming` is active and all Ronin are re-recruited (`ronin.length === 0`) triggers a Zen Monk → Samurai ordination (`targetGarrisonSize` increments up to `25`), expanding the conserved `ATP : ADP : AMP` pool.
     - **Extended Fasting Catabolic Pruning (`-1 Samurai`, min `15`):** Staying continuously in low-glucose, low-mTOR Balanced Fasting (`glucoseSupply <= 20%`, `!mtorActive`) fills `fastingAtrophyTimer`, prompting AMPK Ninjas to prune an idle Samurai down to a minimum of `15`—reducing resilience against future Bandit or workload shocks.

---

### Post-Audit Terminal Endpoints & Visual Polish (V6)
- **Status:** `[x] ✅ IMPLEMENTED IN V6 (VERIFIED)`
- **Updates Implemented (`index.html`, `v3_core.js`, `v4_expansion.js`):**
  1. **UI & Control Cleanup:** Removed the redundant `❄️ Uncoupled Thermogenesis (UCP1)` scenario button from `index.html` and shortened `setSluiceGate(true)` badge text to `'VENTING'`.
  2. **Simplified 3-Act Apoptosis Finale (`apoptosisSequence`):**
     - **Act I (`'rampage'`):** `>60%` Ronin Rebellion eliminates all village characters (`porters`, `carts`, `brigade`, `monks`, `ninjas`, `ketoneButterflies`, `ordainingMonk`, loyal `samurai`) without targeting the Castle or Dam.
     - **Act II (`'bridge_breach'`):** Ronin blow up the Membrane Bridge (`7.0, 8.35`), collapsing `damLevel → 0` and setting `membraneDepolarized = true` (isolated island with broken bridge stubs); all remaining transport (`fatChainOffset`, `glucConveyorPhase`, `muscleFerry`) and character spawners freeze.
     - **Act III (`'seppuku'` → `'complete'`):** Ronin walk to formation, kneel in full-detail *seiza* *seppuku* armor (`drawRoninRampager`), and vanish in spirit smoke, leaving `12` rising *Toro Nagashi* lanterns across the empty village (`SimState.cellDead = true`, `setCrisisBanner('apoptosis')`).
  3. **3-Act Necrosis & Ferroptosis Finale (`necrosisSequence`):**
     - **Act I (`'surge'`):** `14` xenobiotic bandits surge into the village, eliminating all characters and igniting structure/ground fires.
     - **Act II (`'breach_flee'`):** Bandits blow the Membrane Bridge (`membraneDepolarized = true`, `damLevel → 0`), then sprint along the dam wall through the Onsen Sluice Gate (`30.4, 5.2`), forcing `sluiceOpen = true` (`'VENTING'`) as they exit off-map east (DAMP spillover).
     - **Act III (`'smolder'` → `'complete'`):** Roof flames smolder down as `SimState.villageCharred = true` turns all roofs to blackened carbon and extinguishes lanterns, while ground fires (`SimState.fires`) continue burning and spreading toward neighboring tissue (`setCrisisBanner('necrosis')`).
  4. **Flame Graphical Pass (`drawFlameTongue` & `drawFlameCluster`):** Replaced parabolic fire cones and circles with layered S-curved flame tongues (crimson/magenta outer, amber-orange mid, yellow-white core), scorched ember beds, and rising sparks for all ground, `⋅OH`, and necrotic roof fires.
  5. **Starvation Autophagic Exhaustion (`starvationSequence` — Option 1):**
     - During `isStarving` (`preset === 'starvation'` or `glucoseSupply <= 10 && fatSupply <= 10`), Stage 3 Ronin Rebellion is suppressed and AMPK Ninjas cannot inject exogenous fuel. Ronin put away their katana (`r.sheathed = true`) and mill idly around the east camp with animated walking legs.
     - Endogenous `lactatePool`, `glycerolPool`, and `alaninePool` actively burn down (supplying emergency NADH carts and a `damLevel` trickle) until all baskets empty (`<= 0.5`) and `damLevel <= 15`.
     - **Phase I (`'scavenge'`) → Phase II (`'brownout'`) → `'complete'`:** AMPK autophagy prunes remaining Samurai/Ronin, freezes transport, extinguishes lanterns, slowly fades all roofs to dull grey (`SimState.villageGreyLevel: 0 → 1`), and rolls `3` tumbleweeds across the silent village (`CrisisDefinitions.starvation`).

---

### F-11: Peak Biogenesis Win Condition (`25 / 25` Samurai — Golden Matsuri & Dojo Ascension)
- **Status:** `[x] ✅ IMPLEMENTED IN V6 (VERIFIED)`
- **Biochemical Mechanism:** Mastering the 3-phase physiological cycle (**High Workload $\text{PGC-1}\alpha$ priming → Recovery/Feeding $\text{mTORC1}$ supercompensation → Balanced Fasting consolidation**) expands the conserved adenylate garrison (`ATP : ADP : AMP`) to peak `25 / 25` capacity—representing maximal mitochondrial biogenesis and metabolic reserve.
- **Golden Matsuri Celebration (`index.html`, `v3_core.js`, `v4_expansion.js`):**
  1. **Victory Trigger (`targetGarrisonSize >= 25`):** When the 25th Samurai emerges from the Onsen (and `crisisState === 'none'`), `SimState.victoryAchieved = true` spawns `28` drifting sakura petals & emerald-gold fireflies (`SimState.matsuriPetals`) and displays `CrisisDefinitions.victory` (`🏆 PEAK MITOCHONDRIAL BIOGENESIS — Golden Matsuri`).
  2. **Festive Visuals (`drawMatsuriCelebration`):** Illuminates gold and emerald *chōchin* festival lanterns along the Dojo Torii gate, Dojo perimeter, Castle battlements, and Membrane Bridge while sakura petals and fireflies drift across the thriving, humming village.
  3. **Non-Blocking Continue (`#btnContinueVictory`):** Players can click **`✨ Continue Playing`** to dismiss the banner and keep running their 25-Samurai engine with the Golden Matsuri visuals active, or **`🔄 Reconstruct Village`** to start a fresh run.
  4. **Win 2 — Metabolic Flexibility (`CrisisDefinitions.flexibility`):** Cycling `targetGarrisonSize` both up (`flexUpCount >= 2`) and down (`flexDownCount >= 2`) within `16–24` around `18–22` triggers the **☯️ METABOLIC FLEXIBILITY** Matsuri variation (cyan & gold *chōchin* lanterns + drifting petals).
  5. **Win 3 — Steady-State Homeostasis (`CrisisDefinitions.homeostasis`):** Sustaining `>= 300s` (`> 5 min`) of clean bioenergetic equilibrium (`!warburgActive`, `rosLevel < 35`, `etcDamage < 15`, `ronin.length <= 6`, `targetGarrisonSize` in `15–24`, no crises—e.g. fasting down to `17` Samurai then running `100%` Fat / `10%` Glucose / `71%` Work) triggers the **⚖️ STEADY-STATE HOMEOSTASIS** Matsuri variation (amber & jade *chōchin* lanterns + drifting petals).
  6. **Austere Lean Minimum Corollary (`15 / 25` — `CrisisDefinitions.atrophy`):** Prolonged Balanced Fasting pruning down to the `15/25` floor dims Dojo lanterns, drifts cool slate-indigo mist over the Practice Yard (`drawApoptosisFinale`), and displays a non-blocking **`🪶 CATABOLIC MINIMUM (15/25)`** advisory banner with **`✨ Continue Playing`** so players can rebuild capacity via a High Workload → Recovery Feeding cycle.

---

### Overfed Pathway Differentiation, Fat-Adapted Endurance & Visual Polish (V6)
- **Status:** `[x] ✅ IMPLEMENTED IN V6 (VERIFIED)`
- **Updates Implemented (`v3_core.js`, `v4_expansion.js`):**
  1. **3-Way Overfed Substrate Differentiation (`v4_expansion.js`):**
     - **High Fat + Low Glucose (`fat ≥ 60%`, `gluc ≤ 25%`):** Runs Ketogenesis alongside fatty-acid-activated UCP1 proton leak (`ucp1FatLeak`), capping `damLevel` below RET-ROS so neither NAFLD nor Senescence triggers.
     - **High Glucose Alone (`gluc ≥ 65%`, `fat ≤ 30%`, `demand ≤ 40%`):** With adequate antioxidants (`≥ 35%`) and low toxin (`< 25%`), relaxed `mtorAnabolicSurplus` completes the Proteostasis Shrine → **Senescence**, where all village characters (including `senescenceYardWorkers` and `ordainingMonk`) gather in a circle around `(17.3, 10.7)` among SASP fires. With low antioxidants (`< 35%`) or elevated toxin (`≥ 25%`), unbuffered ROS drives ETC scarring → **Warburg Fermentation**.
     - **Both High (`fat ≥ 60%` + `gluc ≥ 60%`, `demand ≤ 40%`):** Randle collision ignites cellular inflammation fires in both cytosolic fuel yards, accelerates `nafldAccumTimer`, and triggers **NAFLD** (`crisisState === 'nafld'`): all traffic/workers slow to `0.32×`, all Samurai/Ronin sheath their katana, and inflammation fires spread throughout the village.
  2. **Fat-Adapted High-Workload Endurance & $\beta\text{-HB}$ Ronin Rescues (`v4_expansion.js`):**
     - Golden `BHB` butterflies dive directly onto prowling Ronin (`ronin.length > 3`, capped at `bhbRecruitsUsed < 4` per bout, resetting when `samuraiDemand < 60` or `recoveryWindowTimer > 0`), and `ketogenesisActive && effectiveFat >= 50` slows `waitTimer` accumulation (`×0.75`)—extending endurance without creating an infinite 3-Ronin equilibrium.
  3. **Complex I–V Roof Roman Numerals (`drawJapaneseRoof`):** Added subtle perspective-locked inlaid Roman numerals (`I`–`V`) onto the front/west-facing roof slopes of Complexes I–V.
  4. **Character & Effect Upgrades (`v3_core.js`, `v4_expansion.js`):**
     - **River-Spirit Maiden (`drawKawabeMiko`):** Floating celestial posture, spirit ring + orbiting *hitodama* wisps, billowing *chihaya* sleeves, flowing hair, golden *kanzashi* halo, *kitsune* spirit mask, and *gohei* wand.
     - **AMPK Pruning Ninja & Victim (`drawPruningEvent`):** Direct path out of the Practice Yard along `gy = 7.75` halfway between the Onsen and Practice Yard to `(32.85, 8.60)`, upgraded Samurai livery/armor/*kuwagata* horns and Ninja *tsuba*/*hachimaki*/scarf, plus radial-gradient *kemuridama* smoke-bomb flash, shockwave, swirling plumes, and sparks.
     - **Zen Monk Onsen Transition (`drawOrdainingMonk`):** Discarded folded robes and *shakujo* staff on the Onsen bank, concentric water ripples, rising steam plumes, gold-emerald metamorphosis flash, and fluttering *sashimono* back-banner.
     - **Complex IV Cleanup (`renderVillage4`):** Removed the unused south-facing bamboo pipe `(22.65, 13.2) → (22.55, 11.75)`.
     - **Austere Advisory Copy:** Updated `CrisisDefinitions.atrophy.desc` to `"Prolonged low-glucose, low-mTOR fasting with no exercise..."`.
