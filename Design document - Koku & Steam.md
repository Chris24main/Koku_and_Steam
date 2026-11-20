# Technical Design & Architecture Document: _Koku & Steam_ (V4 Baseline / V6 Live Tuning Notes)

> **📌 V6 Live Architecture & Project Goals Notice:**
> The baseline sections below preserve the original **V4 architectural foundation**. Active development targets `koku_steam_mitochondrial_village_simulation_V6.html` (via `node scripts/bundle_v6.mjs`; `V3.html`, `V4.html`, and `V5.html` are frozen milestone archives). See [`IMPLEMENTATION_TRACKER.md`](IMPLEMENTATION_TRACKER.md) and [`Audit.md`](Audit.md) for the complete V6 specification. Significant goal & mechanic evolutions in V6:
> - **Dynamic Garrison Plasticity (`15–25` Samurai) & 3-Phase Cyclical Loop (`F-10`):** Instead of a static 20-Samurai pool, the conserved adenylate garrison (`ATP : ADP : AMP`) expands and contracts between `15` and `25` via **High Workload ($\text{PGC-1}\alpha$ priming)** → **`🍲 Recovery / Feeding` ($\text{mTORC1}$ supercompensation)** → **`Balanced Fasting` ($\text{AMPK}$ Zen Monk Onsen ordination, `+1 Samurai`)**, while prolonged low-glucose/low-mTOR fasting without exercise triggers **AMPK Ninja Pruning (`-1 Samurai`, min `15`)**.
> - **3 Win Conditions (`F-11`, Matsuri Variations with `Continue Playing`):**
>   1. **Super Capacity (`victory`, `25 / 25` Samurai):** Peak mitochondrial biogenesis — Gold & Emerald Matsuri lanterns, sakura petals, and fireflies.
>   2. **Metabolic Flexibility (`flexibility`):** Dynamic `AMPK ↔ mTOR` plasticity cycling `targetGarrisonSize` both up (`>= 2`) and down (`>= 2`) within `16–24` around `18–22` — Cyan & Gold Matsuri variation.
>   3. **Steady-State Homeostasis (`homeostasis`):** Sustaining `>= 300s` (`> 5 min`) of clean, low-ROS equilibrium without crises (e.g., fasting to `17` Samurai then running `100%` Fat / `10%` Glucose / `71%` Work) — Amber & Jade Matsuri variation.
> - **Intentional Living (No Passive Default Balance):** There is intentionally no effortless middle-slider equilibrium; default steady settings drift toward stress, requiring active cycling or discovered ketogenic homeostasis.
> - **6 Pathological Endpoints + `15/25` Advisory (`atrophy`):**
>   - **Apoptosis (`apoptosis`):** 3-Act Ronin revolt → village wipeout → blow Membrane Bridge (`ΔΨm → 0`) → full-detail *seppuku* → `12` *Toro Nagashi* lanterns.
>   - **Necrosis (`necrosis`):** 3-Act bandit surge → wipeout & arson → blow Bridge & burst Onsen Sluice (`DAMPs`) → blackened carbon roofs + spreading ground fires.
>   - **Starvation (`starvation`):** Burns endogenous Lactate, Glycerol & Alanine baskets to empty while Ronin sheath katana and mill idly → AMPK autophagy → silent brownout, dull grey roofs & rolling tumbleweeds.
>   - **Senescence (`senescence`):** Buffered high glucose alone (`antiox >= 35%`, `toxin < 25%`) completes the mTOR Proteostasis Shrine → all village characters (including yard workers) form a circle around the temple among SASP fires.
>   - **NAFLD / MASLD (`nafld`):** Both-high Randle collision (`fat >= 60%`, `gluc >= 60%`, `demand <= 40%`) ignites yard inflammation fires → sluggish `0.32×` traffic, sheathed Samurai, and village-wide fires.
>   - **Warburg (`warburg`):** Bistable `etcDamage >= 55%` ON / `< 30%` OFF bogs with Press-Pulse (`Glucose < 10%`, `Fat > 80%`, `Toxin < 5%` + `Pulse` at Succinate overflow); also reachable via unbuffered high glucose (`antiox < 35%` or `toxin >= 25%`).
>   - **High Fat + Low Glucose (`fat >= 60%`, `gluc <= 25%`):** Runs Ketogenesis + fatty-acid-activated UCP1 proton leak (`damLevel <= 78%`), preventing both NAFLD and Senescence; during High Workload, `BHB` butterflies dive on prowling Ronin (`max 4` per bout, floor `3`) to extend endurance without creating an infinite loop.
> - **Visual & UI Refinements:** Complexes I–V carry inlaid roof Roman numerals (`I`–`V`); flame cluster rendering (`drawFlameCluster`); mystical *River-Spirit Maiden* (`drawKawabeMiko`); upgraded Zen Monk Onsen & Ninja Pruning smoke-bomb transitions; `VENTING` sluice status; and removal of the redundant `Uncoupled Thermogenesis` preset and unused Complex IV river pipe.

**Subtitle:** A 2.5D Isometric Feudal Japanese Bioenergetics & Oxidative Stress Simulator **Baseline Source File:** `koku_steam_mitochondrial_village_simulation_V3.html` (1,355 lines, HTML5 Canvas + Tailwind CSS) **Target Deliverable:** Self-contained or modularised V4 implementation integrating Xenobiotic Bandit raids, Adenylate Kinase salvage, Ketone (BHB) aerial firefighting, 3-pathway ETC repair, and the bifurcation between Acute Toxic Necrosis and Chronic Compensatory Warburg/mSLP Fermentation.

  

## 1. Core Vision & Pedagogical Philosophy

_Koku & Steam_ translates complex mitochondrial bioenergetics, redox thermodynamics, and metabolic signalling into an intuitive, deterministic 2.5D isometric village simulation. Rather than relying on abstract node graphs, every biochemical substrate, enzyme complex, thermodynamic gradient, and allosteric feedback loop is represented by a physical feudal Japanese architectural landmark, cargo type, or autonomous character class.

  

The simulation operates on first principles:

  

1. **Dynamic Adenylate Plasticity:** Adenine nucleotides ($\text{ATP} + \text{ADP} + \text{AMP}$) form a strictly conserved garrison cycling between work and recharge (`20` baseline, expanding to `25` via $\text{PGC-1}\alpha \rightarrow \text{mTORC1} \rightarrow \text{AMPK}$ cycling or pruning to `15` under prolonged sedentary fasting).
    
      
    
2. **Thermodynamic Backpressure:** Electron transport depends on demand. High Proton Motive Force ($\Delta\Psi_m$) without $\text{ATP}$ hydrolysis or uncoupling stalls the waterwheels, causing electron leak and reactive oxygen species ($\text{ROS}$) fires.
    
      
    
3. **Allosteric & Retrograde Signalling:** Nutrient competition (the Randle Cycle), energy stress ($\text{AMPK}$), anabolic excess ($\text{mTORC1}$), and mitochondrial damage ($\text{HIF-1}\alpha / \text{PDK1}$) dynamically reshape village infrastructure without arbitrary scripting.

4. **Intentional Metabolic Living (3 Win States vs. 6 Pathologies):** Long-term health cannot be achieved by leaving fuel/demand at a passive middle default; players must either build **Super Capacity (`25/25`)**, maintain **Metabolic Flexibility** (cycling `16–24` around `~20`), or discover **Steady-State Homeostasis** (`> 5 min` clean balance, e.g., `17` Samurai on `100%` Fat / `10%` Glucose / `71%` Work).
    
      
    

## 2. Established Baseline Architecture (V3)

### 2.1 Spatial & Rendering Engine

- **Projection:** Custom 2.5D isometric projection (`TILE_W = 54`, `TILE_H = 27`, `ELEV_PX = 24`) with pan/zoom camera controls and painter's algorithm depth-sorting (`gx + gy`).
    
      
    
- **Geography:**
    
      
    - **Left Bank (`gx < 6`):** Cytosol & outer/inner membrane interfaces (Fat Processing Yard, Ketogenesis Shrine, Cytosol Glycolysis Yard).
        
          
        
    - **Boundary River (`gx: 6..8`):** The Inner Mitochondrial Membrane, crossed via the Arched Wooden Bridge.
        
          
        
    - **Southern River (`gy >= 13`):** The Oxygen ($\text{O}_2$) River supplying terminal electron acceptors to Complex IV.
        
          
        
    - **Northern Escarpment (`gy: 0.5..3.5`):** The Elevated Stone Proton Dam ($\Delta\Psi_m$ Intermembrane Space $\text{H}^+$ reservoir).
        
          
        
    - **Central & Eastern Field (`gx: 9..32`):** The Mitochondrial Matrix & ETC village complexes, Castle Complex V, Onsen UCP1 spillway, and the 20-Samurai Dojo.
        
          
        

### 2.2 Step-Down Cargo Evolution (Electron & Energy Currencies)

1. **Raw Tawara Straw Bales ($\text{NADH} / \text{FADH}_2$):** High-energy reducing equivalents hauled across the Arched Wooden Bridge in hand-carts from the Fat and Glucose yards to Village I ($\text{NADH}$) and Village II ($\text{FADH}_2$).
    
      
    
2. **White Linen Flour Sacks (Ubiquinol / $\text{CoQH}_2$):** Medium-energy cargo milled at Villages I and II, carried on the shoulders of blue-tunic $\text{CoQ}$ porters to Village III.
    
      
    
3. **Steamed Mochi Dough Balls (Reduced Cytochrome $c$):** Single-electron cargo steamed at Village III and carried on red lacquer trays by swift red Cytochrome $c$ couriers to Village IV.
    
      
    
4. **Golden Koku Rice Bales ($\text{ATP}$):** Minted at Castle Complex V and carried by Samurai to the Training Dojo (or by $\text{mTOR}$ Zen Monks to build Shrine scaffolding).
    
      
    
5. **4-Winged Amber Origami Butterflies ($\beta\text{-Hydroxybutyrate / BHB}$):** Folded from excess 2-bale Acetyl-CoA pairs at the Ketogenesis Shrine during low-glucose, high-fat states.
    
      
    

### 2.3 Landmarks & Baseline Mechanics (V3)

- **Fat Processing Yard ($\beta\text{-Oxidation}$, `gx: 3.2, gy: 6.2`):** Chops Tawara bales into 2-carbon pairs. Guarded by the **CPT-1 Torii Gate**, which is throttled by **Malonyl-CoA** when glucose flux is high (Reverse Randle Cycle). Exports Citrate across a dashed yellow line to inhibit the Glucose Yard's inner gate.
    
      
    
- **Ketogenesis Origami Shrine (`gx: 3.3, gy: 2.6`):** Diverts Acetyl-CoA bales up a bamboo chute when carbohydrate input is low, snapping pairs together into flying golden Origami Butterflies. Can be sealed shut by an **$\text{mTOR}$ Seal ($\text{PPAR}\alpha \dashv$)**.
    
      
    
- **Cytosol Glycolysis Yard (`gx: 3.2, gy: 11.2`):** Guarded by two sequential gates:
    
      
    - _Outer Left Gate ($\text{GLUT4}$ / Insulin Receptor, `gx: 1.15`):_ Becomes bricked up with purple-gold **Insulin Resistance ($\text{S6K1} \dashv \text{IRS-1}$)** when $\text{mTOR}$ Shrine scaffolding exceeds $50\%$. Can be picked open from the inside by **$\text{AMPK}$ Ninjas** ($\text{AS160}$ phosphorylation).
        
          
        
    - _Inner Right Gate ($\text{MPC / PDH}$, `gx: 4.85`):_ Throttled by Citrate exported from high Fat oxidation (Randle Cycle).
        
          
        
- **Village I (Complex I, `gx: 11.2, gy: 5.8`):** Accepts $\text{NADH}$ bales, mills $\text{CoQ}$ flour sacks, and spins a waterwheel pumping $4\text{ H}^+$ into the Proton Dam.
    
      
    
- **Village II (Complex II, `gx: 10.6, gy: 11.4`):** Accepts $\text{FADH}_2$ bales and mills $\text{CoQ}$ flour sacks with **no water pump ($0\text{ H}^+$)**.
    
      
    
- **Village III (Complex III, `gx: 16.8, gy: 5.5`):** Steams $\text{CoQ}$ flour into single-electron Mochi balls for Cytochrome $c$ couriers and pumps $4\text{ H}^+$ into the Dam.
    
      
    
- **Village IV Paired $2\times2$ Steam-Kiln Press (Complex IV, `gx: 22.1, gy: 10.3`):** Clamps a central River $\text{O}_2$ orb between two sliding 2-socket copper-and-iron jaws (`[2e⁻] + [2e⁻]`). When all 4 Mochi buns are deposited in time (`< 3.2 s`), the **two lateral sides of the kiln snap shut** (`clamping` $\rightarrow$ `sealed`), locking the 4 buns and $\text{O}_2$ orb together behind a glowing catalytic seam while pumping $2\text{ H}^+$ into the Dam. When the two sides snap back open (`opening`), **triatomic $\text{H}_2\text{O}$ water molecules** (central Oxygen sphere bonded to two Hydrogen spheres at $104.5^\circ$ with trailing vapor arcs) are flung into the Southern River. If electron delivery stalls mid-cycle ($>3.2\text{ s}$ with $1\text{–}3$ balls), the half-reduced intermediate overheats and detonates as a purple hydroxyl radical ($\cdot\text{OH}$) burst.
    
      
    
- **The Elevated Stone Gravity Dam ($\Delta\Psi_m$, `gx: 18.2, gy: 1.8`):** A 4-walled impounded *Ishigaki* masonry reservoir (North cliff wall, West & East abutment wing-walls, and a 3-tiered battered Southern Gravity Dam face reinforced by 6 heavy stone buttress piers and crest parapets) storing pumped water ($140\text{–}220\text{ mV}$) with animated surface waves and a penstock flume chute feeding Castle Complex V. Above `rosDamThreshold` ($82\%$), high backpressure drags down Complex I and III waterwheels and causes $\text{CoQ}$ porters to stumble and ignite red **$\text{ROS}$ flour-dust fires**.
    
      
    
- **Housekeeping Aqueduct (`gx: 21.0, gy: 5.1`) & Onsen Sluice Gate / Valve ($\text{UCP1}$, `gx: 30.25, gy: 5.2`):** Basal proton leak spins a small maintenance wheel, while the Onsen spillway features a literal **vertical-sliding iron-bound cedar Sluice Gate (`Suimon`)** built into the Dam wall and operated by an overhead **rotating 6-spoked Valve Handwheel**. Opening the valve raises the sluice gate leaf, unleashing a foaming white-water chute into the Onsen bath and venting Dam water into non-shivering thermogenic steam (`kW`).
    
      
    
- **Apothecary Wellhouse ($\text{GSH}$ Reserve, `gx: 13.6, gy: 8.6`):** Recharged by the Antioxidant Synthesis slider (throttled $52\%$ when $\text{mTOR}$ is active due to $\text{FOXO}$ inhibition). Dispatches bucket-brigade firefighters (`-12 GSH` per fire) to douse path fires.
    
      
    
- **Castle Complex V ($\text{ATP}$ Synthase, `gx: 26.2, gy: 5.0`) & 20-Samurai Dojo (`gx: 30.5, gy: 10.9`) — One-Way Clockwise Circulation Loop:** Samurai burn Koku in 1v1 bokken duels at a rate set by the Workload slider. To prevent recharged $\text{ATP}$ Samurai and waiting $\text{ADP}$ Samurai from occupying the same space, the Castle–Dojo precinct uses two separated avenues and gates:
    
    - _Inbound $\text{ADP}$ Queue Avenue (`gx: 25.55`, West Dojo Gate):_ Depleted Samurai (`approaching` / `queued`) exit the **South-West Dojo Gate (`27.85, 11.15`)**, walk west to `gx = 25.55`, and form a northward FIFO single-file queue up to the Castle gate (`25.55, 6.72`).
    - _Outbound Full-Koku Promenade (`gx: 28.25`, North Dojo Torii Gate):_ Recharged Samurai carrying full Golden Koku (`toTrainingYard`, `🌾 Koku → Dojo`) step **East** from the Castle gate along the **Golden Koku Return Promenade (`27.15, 6.75` $\rightarrow$ `28.25, 6.85` $\rightarrow$ `28.25, 8.55` $\rightarrow$ `30.65, 8.55`)** and enter the Training Yard through the **North Dojo Torii Gate (`30.65, 9.48`)**.
    
      
    
- **Shrine of Proteostasis (`gx: 15.6, gy: 9.8`), $\text{mTOR}$ Monks & $\text{AMPK}$ Ninjas:**
    
      
    - _$\text{mTOR}$ Zen Monks:_ Spawn during energy abundance ($\text{ATP} \ge 14$, $\text{ADP} \le 5$, total fuel $\ge 85$). Carry Koku from the Castle to erect bamboo scaffolding around the Proteostasis Shrine and place the $\text{mTOR}$ Seal on the Ketogenesis Shrine. Above $60\%$ scaffolding, purple **misfolded protein beams** accumulate and **Insulin Resistance** crusts over the $\text{GLUT4}$ gate. At $100\%$ scaffolding, the **Gilded Temple of Senescence** is unveiled, entrancing all villagers into cell-cycle arrest while $\text{SASP}$ fires consume the village.
        
          
        
    - _$\text{AMPK}$ Ninjas:_ Spawn when the Castle $\text{ADP}$ queue $\ge 10$ or during fasted exercise. Close the $\text{UCP1}$ sluice, strip excess Shrine scaffolding and misfolded beams (Autophagy), pick the $\text{GLUT4}$ lock from the inside, or nudge substrate sliders $+5\%$.
        
          
        
    - _Ronin mPTP Breach:_ If $\ge 12$ Samurai starve in the queue with Dam $< 18\%$ for $>6.5\text{ s}$, they turn into rogue **Ronin** and hack open the Dam wall, collapsing $\Delta\Psi_m$ to $0\text{ mV}$ (Apoptosis).
        
          
        

## 3. V4 Expansion Specifications (To Be Integrated by Antigravity)

### 3.1 UI & Non-Blocking Crisis Architecture

1. **Replace Blocking Game-Over Modals with a Non-Blocking Top-Centre Crisis Banner:**
    
      
    - Hide or remove the full-screen blocking `#apoptosisOverlay` and `#senescenceOverlay` modals so the player can observe pathological states unfolding on the canvas in real time.
        
          
        
    - Add a floating, non-blocking top-centre banner (`#crisisBanner`) displaying the pathology icon, title, biochemical explanation, and a **`🔄 Reconstruct Village` (Hard Reset)** button.
        
          
        
    - **Four Terminal/Pathological States Supported by the Banner:**
        
          
        1. 👹 **mPTP Breach & Apoptosis** (Acute $\text{ATP}$ starvation $\rightarrow$ Ronin breach Dam).
            
              
            
        2. ⛩️ **Gilded Temple of Senescence** ($100\%$ $\text{mTOR}$ Shrine scaffolding $\rightarrow$ permanent meditative arrest + $\text{SASP}$ fires).
            
              
            
        3. ☠️ **Acute Toxic Necrosis & Ferroptosis** (Overwhelming Xenobiotic Bandit surge drains $\text{GSH} \le 2\%$ with $\ge 5$ active $\text{ROS}$ fires before adaptation can occur).
            
              
            
        4. 🧟 **Compensatory Warburg & Glutamate ($\text{mSLP}$) Zombie State** (Chronic Bandit attrition + $\text{RIRR}$ scars $100\%$ of the $\text{ETC}$ waterwheels; $\text{HIF-1}\alpha / \text{PDK1}$ shuts down OxPhos and locks the village into neon-green cytosolic Lactate fermentation and violet Wellhouse Glutaminolysis).
            
              
            
2. **New Top Telemetry Meter — `ETC Scarring` (`0%` to `100%`):**
    
      
    - Placed beside the `GSH Well` meter in the top HUD bar, with a purple-to-lime gradient bar tracking `SimState.etcDamage`.
        
          
        
3. **Updated Adenylate Pool Readout — `ATP : ADP : AMP`:**
    
      
    - Update the top HUD `ATP : ADP` readout to display `ATP : ADP : AMP` (e.g., `14:5:1`), counting active $\text{AMP}$ Donor Samurai en route to the Wellhouse.
        
          
        
4. **New Bottom Control Slider — `🧪 Toxin / Banditry` (`0%` to `100%`):**
    
      
    - Added as the 6th control card in the bottom deck (`SimState.toxinLoad`), controlling Xenobiotic Bandit infiltration from the Onsen trail.
        
          
        
5. **Two New Scenario Presets:**
    
      
    - **`🧟 Chronic Bandits (Warburg)`:** `Fat: 45%`, `Glucose: 55%`, `Workload: 45%`, `Antioxidant: 72%`, `Toxin: 45%`, starting `etcDamage: 35%`, `gshReserve: 76%`. Takes ~35–45 seconds of unmitigated chronic attrition to reach $100\%$ Warburg lock-in.
        
          
        
    - **`☠️ Acute Toxin Surge (Necrosis)`:** `Fat: 40%`, `Glucose: 50%`, `Workload: 60%`, `Antioxidant: 22%`, `Toxin: 95%`, starting `etcDamage: 15%`, `gshReserve: 48%`. Unleashes up to 5 Bandits simultaneously, collapsing into Necrosis in ~25–30 seconds unless rescued.
        
          
        

### 3.2 Xenobiotic Bandit Raids & 1-on-1 Samurai Pursuit Relay

- **Biochemical Basis:** Environmental electrophiles, heavy metals, and mitochondrial toxins infiltrate the matrix, covalently modifying $\text{Fe-S}$ clusters, depleting reduced glutathione ($\text{GSH}$), and consuming $\text{ATP}$ for Phase II/III detoxification.
    
      
    
- **Spawning & Infiltration Path:**
    
      
    - When `toxinLoad > 5%`, Bandits spawn near the **Onsen trail (`gx: 21.8, gy: 3.4`)**.
        
          
        
    - Maximum concurrent Bandits scales with `toxinLoad`: `1` Bandit for $6\text{–}34\%$, `2` Bandits for $35\text{–}79\%$ (Chronic mode), and up to `5` Bandits for $\ge 80\%$ (Acute surge).
        
          
        
    - Bandits first march down the trail past `gy > 5.1`, then roam between **Village I, Village III, Village IV, and the GSH Wellhouse**.
        
          
        
- **Sabotage Mechanics & Engagement Suppression:**
    
      
    - While unengaged (`sabotageMult = 1.0`), each Bandit drains `gshReserve` at **`1.95%/s`**, inflicts `etcDamage` (ETC Scarring) at **`1.35%/s`** (once `gy > 5.0`), sparks a new red $\text{ROS}$ fire every **`2.8s`** (up to 12 fires), and robs any passing $\text{CoQ}$ or Cytochrome $c$ porter within `1.1` tiles (`+2.4%` ETC Scar per robbery, subject to a **`2.6s` per-bandit robbery cooldown** so a single Bandit cannot wipe out an entire line of porters at once).
        
          
        
    - **80% Sabotage Suppression When Engaged (`sabotageMult = 0.20`):** Once a pursuing Samurai closes within `1.25` tiles of a Bandit, the Bandit is forced to parry (`🧪 BANDIT (Suppressed!)`): they **cannot rob porters**, and their $\text{GSH}$ drain, $\text{ETC}$ scarring, and fire-setting rates are reduced by **$80\%$**.
        
          
        
- **1-on-1 Samurai Pursuit & Stamina Balance:**
    
      
    - Each Bandit past `gy > 5.0` recruits at most **1 Dojo Samurai** (`chasedBySamuraiIds.length < 1`) who has `kokuEnergy > 0.25`.
        
          
        
    - The pursuing Samurai (`state = 'chasingBandit'`) sprints at speed `3.85` toward their assigned Bandit.
        
          
        
    - **Tuned Pursuit Koku Burn Rate:** Pursuing Samurai burn Koku at **`0.22 + 0.35 * burnRate` per second** (~4.5 seconds of pursuit stamina per full Koku bar), displayed via a golden stamina bar above the Samurai's helmet (`⚔️ Pursuing!`).
        
          
        
    - **Bandit Detoxification Stamina (`requiredChaseTime`):** Each Bandit requires **`3.6 to 4.4 seconds`** of close-range engagement (`dist < 1.25`) to be defeated (~1.5 Samurai Koku bars). If the first Samurai runs out of Koku (`kokuEnergy <= 0.02`), they peel off to join the Castle $\text{ADP}$ queue and a fresh Samurai from the Dojo tags in to finish the Bandit.
        
          
        

### 3.3 Adenylate Kinase Salvage ($2\text{ADP} \rightarrow \text{ATP} + \text{AMP}$)

- **Biochemical Basis:** During acute metabolic stress when $\text{ADP}$ accumulates faster than OxPhos can phosphorylate it, **Adenylate Kinase** catalyses the reversible emergency salvage reaction $2\text{ADP} \leftrightarrow \text{ATP} + \text{AMP}$, simultaneously providing emergency $\text{ATP}$ for cellular defence and generating $\text{AMP}$ to allosterically activate $\text{AMPK}$.
    
      
    
- **Village Implementation:**
    
      
    - **Trigger:** Whenever the Castle $\text{ADP}$ queue reaches $\ge 7$ Samurai while Bandits are raiding (`queueAtCastle.length >= 7 && SimState.bandits.length > 0`) **or** reaches $\ge 8$ Samurai during severe low-Dam stress (`SimState.damLevel < 32`), with a `1.35s` cooldown (`akCooldown`) that actively relieves the Ronin riot timer (`crisisTimer -= 2.5s`).
        
          
        
    - **The Trade:** Two queued Samurai at the front of the Castle line execute an emergency trade (`⚡ 2ADP → ATP + AMP!`) accompanied by expanding cyan-and-gold reaction rings and sparks:
        
          
        1. **Recipient Samurai ($\text{ATP}$):** Immediately receives a full Golden Koku (`hasKoku = true`, `kokuEnergy = 1.0`) and sprints out of the queue in `chasingBandit` state (`⚔️ Pursuing!`, explicitly added to `targetBandit.chasedBySamuraiIds`) to engage and suppress a Bandit.
            
              
            
        2. **Donor Samurai ($\text{AMP}$):** Switches into the cyan-ringed `toWellhouseAMP` state (`🔔 AMP → Wellhouse!`) and runs to the **Wellhouse (`gx: 14.3, gy: 9.25`)**. Upon arrival, the donor pauses for **`1.35s`** (`ringingWellhouseBell`, `🔔 Ringing AMPK Alarm!`) to strike the hanging **Bronze Alarm Bell**, shutting down $\text{mTOR}$ and immediately dispatching an emergency **$\text{AMPK}$ Ninja** (bypassing the standard Ninja wave cap), and then walks back at a slow, fatigued recovery pace (`speed = 1.35`, `😮‍💨 AMP → ADP (Returning)`) to rejoin the tail of the Castle $\text{ADP}$ queue.
            
              
            

### 3.4 Unblocking Ketogenesis & 1-to-1 Ketone Butterfly ($\text{BHB}$) Aerial Firefighting

- **Three Bug Fixes to V3 Ketogenesis Logic:**
    
      
    1. **Prevent High Fat Alone from Spawning $\text{mTOR}$ Monks:** In V3, `fatSupply + glucoseSupply >= 85` spawned $\text{mTOR}$ Monks even when Glucose was $10\%$ and Fat was $85\%$, causing Monks to place the $\text{mTOR}$ Seal on the Ketogenesis Shrine during a ketogenic diet. In V4, $\text{mTOR}$ Monk activation requires **`glucoseSupply >= 45%`** (representing insulin/carbohydrate presence) in addition to high total fuel.
        
          
        
    2. **Immediate Unsealing on Low Carbohydrate:** Dropping `glucoseSupply <= 30%` immediately clears `SimState.mtorKetoneSeal = false`.
        
          
        
    3. **Nutritional-State-Aware $\text{AMPK}$ Ninjas:** When an $\text{AMPK}$ Ninja boosts substrate sliders during a low-carbohydrate state (`glucoseSupply <= 30%`), it must boost **Fatty Acids (`+5%`)** rather than Glucose, so it does not knock the player out of Ketosis during a Bandit raid.
        
          
        
- **Biochemical Basis of $\text{BHB}$ Aerial Firefighting:** $\beta\text{-Hydroxybutyrate}$ ($\text{BHB}$) is not merely a fuel; it directly inhibits the **$\text{NLRP3}$ inflammasome** and acts as an endogenous class I $\text{HDAC}$ inhibitor, upregulating $\text{FOXO3a}$ and $\text{Metallothionein/SOD2}$ antioxidant defences while sparing $\text{NADPH/GSH}$.
    
      
    
- **Strict 1-to-1 Fire Targeting (`kb.targetFire`):**
    
      
    - When Origami Ketone Butterflies (`phase === 'flying'`) are airborne and `SimState.fires.length > 0`, each butterfly searches for an active $\text{ROS}$ fire that is **not already targeted by another butterfly** (`!SimState.ketoneButterflies.some(other => other !== kb && other.targetFire === f)`).
        
          
        
    - Claimed butterflies dive toward their assigned fire (`speed = 5.2`) and extinguish it on contact in a burst of cyan and gold sparks (`🦋 BHB ⊣ NLRP3!`), sparing the Wellhouse $\text{GSH}$ bucket brigade. Unclaimed butterflies continue gliding across the village ready to intercept new fires.
        
          
        

### 3.5 Three-Pathway Redox-Gated $\text{ETC}$ Repair System

- **Biochemical Basis:** Damaged respiratory complexes cannot be rebuilt while acute oxidative and electrophilic siege is ongoing (because nascent $\text{Fe-S}$ clusters are immediately destroyed by superoxide/xenobiotics). Once the toxin source is cleared, mitochondrial quality control repairs the $\text{ETC}$ via three synergistic pathways:
    
      
    1. **$\text{PINK1/Parkin}$ Mitophagy ($\text{AMPK}$ Ninjas):** Selectively excises damaged respiratory subunits.
        
          
        
    2. **Epigenetic Cardiolipin & $\text{PGC-1}\alpha$ Support ($\text{BHB}$ Ketone Butterflies):** Restores inner membrane curvature and respiratory supercomplex stability.
        
          
        
    3. **$\text{PGC-1}\alpha$ Biogenesis & $\text{Fe-S}$ Cluster Assembly ($\text{mTOR}$ Monks + $\text{GSH}$ Wellhouse):** Synthesises new replacement subunits once redox poise is restored.
        
          
        
- **Village Implementation:**
    
      
    - **Redox Gate (`canRepairEtc`):** Active $\text{ETC}$ repair is strictly locked out unless **`SimState.toxinLoad < 15%` AND `SimState.bandits.length === 0`** (and `crisisState === 'none'`).
        
          
        
    - When `canRepairEtc` is true and `etcDamage > 0`:
        
          
        1. **Passive $\text{GSH} / \text{Fe-S}$ Repair:** If `gshReserve > 60%`, `etcDamage` decays passively at **`-1.85%/s`**.
            
              
            
        2. **$\text{AMPK}$ Ninja Mitophagy (`-8% Scar`):** Dispatched $\text{AMPK}$ Ninjas leap onto scarred Village I (`11.2, 5.8`), stripping away damaged subunits (`🥷 Mitophagy (-8% Scar)`).
            
              
            
        3. **$\text{BHB}$ Butterfly Epigenetic Healing (`-4% Scar`):** When `fires.length === 0` and `toxinLoad < 25%`, airborne Ketone Butterflies glide to Village III (`16.8, 5.5`) and heal `-4%` ETC Scar in a burst of golden sparks (`🦋 BHB → PGC-1α (-4% Scar)`).
            
              
            
        4. **$\text{mTOR}$ Monk Biogenesis (`-6% Scar`):** When Shrine Scaffolding is in a healthy range ($<65\%$), $\text{mTOR}$ Monks divert to Village III (`16.8, 5.5`) to install fresh waterwheel subunits (`🧘 Biogenesis (-6% Scar)`).
            
              
            

### 3.6 Vicious Cycle of OxPhos Breakdown ($\text{RIRR}$) & Chronic Warburg / $\text{mSLP}$ Transition

- **Why This Mechanism Is Essential:** Without endogenous self-amplification, moderate Bandit raids simply plateau around $40\%$ scarring. In real mitochondrial pathology, crossing a threshold of Complex I/III structural damage triggers **$\text{ROS}$-Induced $\text{ROS}$ Release ($\text{RIRR}$)** and retrograde **$\text{HIF-1}\alpha / \text{PDK1}$** signalling, causing OxPhos to progressively shut down and forcing the cell to rely on cytosolic **Lactate Fermentation (Warburg Effect)** and mitochondrial **Substrate-Level Phosphorylation ($\text{mSLP}$ via Glutaminolysis)** to survive.
    
      
    
- **Stage 1 — $\text{RIRR}$ Self-Scarring (`etcDamage >= 38%`):**
    
      
    - Once `etcDamage` crosses **$38\%$**, scarred waterwheels leak electrons prematurely to $\text{O}_2$, inflicting endogenous self-scarring:
        
          
        
        $$\text{rirrDecay} = \left(\frac{\text{etcDamage} - 36}{64}\right) \times 1.35\%/\text{s}$$
        
    - Damaged Complexes I, III, and IV also spontaneously spark secondary $\text{ROS}$ fires (`prob = 0.25 * scarFrac * dt`).
        
          
        
- **Stage 2 — $\text{Nrf2}$ / Glutamate Buffering (`etcDamage >= 45%` and `toxinLoad < 75%`):**
    
      
    - During sub-lethal chronic attrition, retrograde stress signalling activates $\text{Nrf2}$ and glutamine import, adding **`+3.2%/s` $\text{GSH}$ regeneration** so the cell survives the transition into Warburg fermentation rather than dying of acute Necrosis.
        
          
        
- **Stage 3 — $\text{HIF-1}\alpha / \text{PDK1}$ Gate Closure & Early Fermentation Ignition (`etcDamage >= 50%`):**
    
      
    - Above **$50\%$ Scar**, $\text{HIF-1}\alpha$ automatically pulls the **Glucose** (`+2.1%/s`) and **Antioxidant/Glutamine** (`+1.8%/s`) sliders upward, while $\text{PDK1}$ throttles mitochondrial pyruvate entry and drags down the Proton Dam (`-6.5%/s` scaled from $50\% \rightarrow 100\%$ scar) and waterwheel spin speeds.
        
          
        
    - Above **$55\%$ Scar**, two compensatory fermentation fires visibly ignite on the map and begin recharging queued Samurai at the Castle gate even as the Proton Dam drains:
        
          
        1. **Neon-Green Cytosolic Lactate Fire (`#39ff14` at Glycolysis Yard, `gx: 3.2, gy: 11.2`):** Represents high-flux Warburg glycolysis ($\text{Pyruvate} \rightarrow \text{Lactate}$).
            
              
            
        2. **Violet Mitochondrial $\text{mSLP}$ Fire (`#a855f7` at GSH Wellhouse, `gx: 13.6, gy: 8.6`):** Represents glutaminolysis driving Succinyl-CoA Synthetase ($\text{Glutamine} \rightarrow \text{Glutamate} \rightarrow \alpha\text{-KG} \rightarrow \text{Succinyl-CoA} \rightarrow \text{ATP/GTP}$).
            
              
            
- **Stage 4 — $100\%$ Warburg & Glutamate ($\text{mSLP}$) Zombie Lock-In (`etcDamage >= 99.5%`):**
    
      
    - When `etcDamage` hits **$100\%$**, the non-blocking **Warburg Zombie Banner** appears, OxPhos waterwheels lock to a halt, the green Lactate and violet $\text{mSLP}$ fires burn at full intensity, and the 20 Samurai receive a glowing neon-green zombie aura—endlessly cycling and sparring on fermentative $\text{ATP}$ inside a metabolically inflexible cell.

### 3.7 Spatial & Mechanical Refinements (Castle–Dojo One-Way Loop & Complex IV Jaw-Clamp Animation)

1. **Separated One-Way Circulation Between Castle Complex V and the 20-Samurai Dojo:**
    - **Waiting $\text{ADP}$ Queue (`approaching` / `queued` / `receiving`):** Depleted Samurai exit the Dojo via the **South-West Gate (`27.85, 11.15`)**, walk west along the southern road (`25.55, 11.15`), and queue northward along the **West Castle Queue Avenue (`gx = 25.55`, from `gy = 6.72` to `9.51`)**, curving west if $>9$ Samurai are waiting.
    - **Full-Koku Return Path (`toTrainingYard`):** Samurai with full Koku (`🌾 Koku → Dojo`) never walk back through the waiting $\text{ADP}$ queue. Instead, upon receiving Koku at the Castle gate (`25.55, 6.72`), they step **East** onto the paved **Golden Koku Return Promenade (`27.15, 6.75` $\rightarrow$ `28.25, 6.85` $\rightarrow$ `28.25, 8.55` $\rightarrow$ `30.65, 8.55`)** and enter the Dojo courtyard through the **North Torii Gate (`30.65, 9.48`)**.

2. **Multi-Stage Complex IV Steam-Kiln Clamping & $\text{H}_2\text{O}$ Molecule Ejection:**
    - **`clamping` (`0.00s – 0.24s`):** As soon as the 4th Mochi bun is deposited in time (`ballsCount === 4`), all 4 buns remain visible inside the two lateral `[2e⁻]` chambers while the **left and right copper-iron kiln jaws physically snap shut** (`clampT: 0 → 1`) around the central $\text{O}_2$ orb and the top cross-clamp locks down.
    - **`sealed` (`0.24s – 0.52s`):** A glowing cyan-gold catalytic seam seals the two halves together (`⚡ KILN LOCKED SHUT: 4e⁻ + 4H⁺ + O₂ → 2 H₂O!`), spinning the Complex IV proton pump ($2\text{ H}^+$ to the Dam) amid catalytic sparks.
    - **`opening` (`0.52s – 0.85s`):** The two sides of the kiln spring back open (`clampT: 1 → 0`), venting a steam plume and **flinging triatomic $\text{H}_2\text{O}$ water molecules** (rendered with a central blue Oxygen sphere, two white Hydrogen spheres at a $104.5^\circ$ bond angle, and a dashed vapor trail) in a high arc into the Southern $\text{O}_2$ River.

## 4. Implementation Roadmap for Antigravity

1. **Use `koku_steam_mitochondrial_village_simulation_V3.html` as the immutable visual foundation** so all custom isometric buildings, roofs, waterwheels, cargo sprites (Tawara bales, flour sacks, mochi balls, 4-winged origami butterflies), and Inspector tooltips remain $100\%$ intact.
    
      
    
2. **Modularise or Integrate Cleanly:** Either load the V4 logic via an external `<script src="v4_expansion.js"></script>` hooked into `updateSimulation(dt)` and `renderScene()`, or merge the V4 state properties, UI controls, update loops, and sprite renderers directly into the main script block of `V3.html`.
    
      
    
3. **Ensure Helper Safety:** Keep the `n_gx(entity)` and `n_gy(entity)` coordinate helpers defined in the global scope so Ninja and Monk pathfinding never throws a `ReferenceError` during dynamic target switching.