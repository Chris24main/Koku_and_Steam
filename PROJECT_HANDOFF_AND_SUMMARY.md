# Koku & Steam: The Mitochondrial Village (V6) — Project Handoff & Architecture Guide

## 1. Project Overview
**Koku & Steam: The Mitochondrial Village** is an interactive 2.5D isometric educational biochemistry simulation that maps cellular bioenergetics, substrate competition, oxidative stress, xenobiotic toxicity, and metabolic reprogramming onto a Feudal Japanese castle-town metaphor:
- **Gold Koku (米)**: $\text{ATP}$ (minted at the Castle of Complex V by rotating the $\text{F}_1\text{F}_0$ waterwheel).
- **20-Samurai Garrison**: The conserved Adenine Nucleotide Pool ($\text{ATP} + \text{ADP} + \text{AMP} = 20$).
- **North Elevated Reservoir Dam**: Proton Motive Force ($\Delta p$ / $\Delta\Psi_m$, $0\text{–}220\text{ mV}$).
- **Villages I, II, III, IV**: Electron Transport Chain Complexes I–IV.
- **CoQ Porters & Cytochrome c Couriers**: Mobile electron carriers ubiquinone ($\text{CoQ}_{10}$) and Cytochrome $c$.
- **GSH Apothecary Wellhouse & Bucket-Brigade Hikeshi**: Mitochondrial Glutathione ($\text{GSH}$) & GPx4 antioxidant defense.
- **Ketogenesis Shrine & Origami Butterflies**: $\beta\text{-Hydroxybutyrate}$ ($\text{BHB}$) signaling, NLRP3 inflammasome suppression, and HDAC/PGC-1$\alpha$ epigenetic repair.
- **mTOR Zen Monks & Shrine of Proteostasis**: Anabolic protein synthesis, mitochondrial biogenesis, and (when unchecked) proteotoxic insulin resistance and cellular senescence.
- **AMPK Shadow Ninjas**: Energy-stress sensor ($\text{AMP:ATP}$) triggering mitophagy, autophagy, GLUT4 translocation, and UCP1 sluice closure.
- **Xenobiotic Bandits**: Electrophilic environmental toxins (rotenone/paraquat/heavy metals) that deplete $\text{GSH}$, rob electron carriers, and inflict persistent **ETC Scarring**.

---

## 2. Directory Structure & Files
| File | Role |
| :--- | :--- |
| `koku_steam_mitochondrial_village_simulation_V6.html` | **Standalone Single-File V6 Bundle** (zero external dependencies other than Tailwind CDN; double-click to run in any browser). |
| `koku_steam_mitochondrial_village_simulation_V5.html` | Frozen V5 milestone archive (read-only). |
| `koku_steam_mitochondrial_village_simulation_V4.html` | Frozen V4 milestone archive (read-only). |
| `index.html` | Modular V6 HTML shell, HUD telemetry bar, non-blocking top-centre `#crisisBanner`, 6-slider control deck, `#btnPressPulse` (`Pulse`), and 7 physiological/pathological presets. |
| `v3_core.js` | Isometric 2.5D engine, camera pan/zoom, master-planned architectural building grid, 34-node road/bridge waypoint pathfinder (`window.findVillagePath` / `window.stepAlongVillagePath`), feudal wicker metabolite baskets, and multi-layered feudal Japanese character sprites. |
| `v4_expansion.js` | V6 biochemical simulation loop (`updateSimulation`), Xenobiotic Bandit raids & 1-on-1 Samurai pursuit relay, Adenylate Kinase salvage ($2\,\text{ADP} \rightarrow \text{ATP} + \text{AMP}$), 3-pathway redox-gated ETC repair, RIRR breakdown, bistable Warburg/mSLP toggle (`>= 55%` ON / `< 30%` OFF), and user-driven Seyfried Press-Pulse. |
| `scripts/bundle_v6.mjs` | Zero-dependency Node script to regenerate `koku_steam_mitochondrial_village_simulation_V6.html` from `index.html`, `v3_core.js`, and `v4_expansion.js`. |
| `koku_steam_mitochondrial_village_simulation_V3.html` | Original working V3 baseline HTML file for reference. |
| `Design document - Koku & Steam.md` | Full V1–V4 Technical & Biochemical Design Specification. |
| `IMPLEMENTATION_TRACKER.md` | **Offline-Editable Feature Spec, Status & Playtest Feedback Tracker** (edit offline to add playtest feedback or draft new biochemical feature specs). |
| `conversation_logs/CONVERSATION_EXPORT.md` | Human-readable markdown transcript of the development session. |
| `conversation_logs/transcript.jsonl` | Compact JSONL conversation log from Antigravity. |
| `conversation_logs/transcript_full.jsonl` | Unabridged JSONL conversation log from Antigravity. |

---

## 3. Master-Planned Isometric Coordinate Grid (`v3_core.js`)
All landmarks are aligned on a structured architectural grid separated by paved cobblestone avenues (`gy = 6.85`, `gy = 9.35`, `gy = 12.15`, `gx = 9.35`, `gx = 12.75`, `gx = 15.65`, `gx = 19.65`, `gx = 24.05`, `gx = 28.15`):

- **Left Bank (Cytosol & Outer Membrane, `gx = 1.2 .. 4.7`)**:
  - **Ketogenesis Shrine**: `(3.0, 2.4)`
  - **Fat Processing Yard (CPT1 / $\beta$-Oxidation)**: `(3.0, 6.0)`
  - **Cytosol Glycolysis Yard (GLUT4 / PDH)**: `(3.0, 10.9)`
- **Boundary River & Arched Wooden Bridge (`gx = 5.2 .. 8.8`)**:
  - **Taiko-bashi Arched Bridge**: `(7.0, 8.35)` (Inbound lane `gy = 8.15`, Outbound lane `gy = 8.55`)
- **Inner Mitochondrial Matrix (`gx = 9.8 .. 33.1`)**:
  - **Column 1 (`gx = 10.9`)**: **Village I (Complex I)** at `(10.9, 5.5)` (pump at `12.05, 5.25`) & **Village II (Complex II)** at `(10.8, 11.0)`
  - **Central Courtyard Plaza (`gx = 14.3`)**: **GSH Apothecary Wellhouse** at `(14.3, 8.1)`
  - **Column 2 (`gx = 17.3`)**: **Village III (Complex III)** at `(17.3, 5.5)` (pump at `18.45, 5.35`) & **Shrine of Proteostasis** at `(17.3, 10.7)`
  - **Column 3 (`gx = 21.0 .. 22.1`)**: **Housekeeping Aqueduct** at `(21.0, 5.1)` (wheel at `21.65, 5.45`) & **Village IV (Complex IV)** at `(22.1, 10.3)` (pump at `23.25, 9.95`, 2-sided clamping Mochi Kiln-Press at `22.12, 11.64` that snaps shut on 4 buns and flings triatomic $\text{H}_2\text{O}$ molecules into the Southern River on opening)
  - **Column 4 (`gx = 26.2`)**: **Castle of Complex V (ATP Synthase)** at `(26.2, 5.0)` (wheel at `24.45, 4.95`, West ADP Queue Avenue at `gx = 25.55`, East Golden Koku Return Promenade at `gx = 28.25`)
  - **Column 5 (`gx = 30.4 .. 30.5`)**: **Onsen Spillway (UCP1)** at `(30.4, 5.2)` & **20-Samurai Garrison Dojo** at `(30.5, 10.9)` (North Koku Entry Torii Gate at `30.65, 9.25`, South-West ADP Exit Gate at `27.85, 11.15`)

---

## 4. Re-Bundling Instructions
Whenever you edit `index.html`, `v3_core.js`, or `v4_expansion.js`, regenerate the standalone single-file HTML bundle (`koku_steam_mitochondrial_village_simulation_V6.html`) cleanly in UTF-8 without touching frozen `V3.html`, `V4.html`, or `V5.html` archives:

```bash
node scripts/bundle_v6.mjs
```
