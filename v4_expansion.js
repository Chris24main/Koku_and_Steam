/***********************************************************************
 * KOKU & STEAM — V4 EXPANSION MODULE (ARCHITECTURAL & ROUTE-FINDING EDITION)
 * Integrates:
 *  1. Non-Blocking Top-Centre Crisis Banner (Apoptosis, Senescence, Necrosis, Warburg)
 *  2. Xenobiotic Bandit Raids & 1-on-1 Samurai Pursuit Relay (80% Sabotage Suppression)
 *  3. Adenylate Kinase Salvage (2 ADP -> ATP + AMP) & Wellhouse AMP Alarm
 *  4. Unblocked Ketogenesis & 1-to-1 BHB Origami Butterfly Aerial Firefighting
 *  5. Three-Pathway Redox-Gated ETC Repair (GSH/Fe-S, AMPK Mitophagy, BHB PGC-1a, mTOR Biogenesis)
 *  6. Vicious Cycle of OxPhos Breakdown (RIRR) & Compensatory Warburg / mSLP Zombie Transition
 *  7. Waypoint Graph Pathfinding & Multi-Layered Bandit Character Graphics
 ***********************************************************************/

// Global Coordinate Safety Helpers (Section 4.3)
window.n_gx = function (entity) {
    if (!entity) return 0;
    return typeof entity.gx === 'number' ? entity.gx : (typeof entity.x === 'number' ? entity.x : 0);
};
window.n_gy = function (entity) {
    if (!entity) return 0;
    return typeof entity.gy === 'number' ? entity.gy : (typeof entity.y === 'number' ? entity.y : 0);
};

// Extend Landmarks with V4/V6 biochemical details
Landmarks.wellhouse.metaphor += ' Also receives AMP Donor Samurai during Adenylate Kinase salvage and sinks into a bubbling Violet Glutaminolysis (mSLP) fermentation bog during Warburg lock-in!';
Landmarks.wellhouse.biology += ' Under chronic ETC failure, mitochondrial Substrate-Level Phosphorylation (mSLP via Succinyl-CoA Synthetase driven by glutaminolysis) generates emergency GTP/ATP.';
Landmarks.glucoseLine.metaphor += ' Above 55% ETC Scarring, HIF-1α/PDK1 sinks this yard into a Neon-Green Warburg Lactate Fermentation bog to keep minting Koku without oxygen!';

// Initialize V4 state fields on SimState
Object.assign(SimState, {
    toxinLoad: 0,
    etcDamage: 0,
    ampCount: 0,
    bandits: [],
    banditSpawnTimer: 0,
    banditIdSeq: 0,
    akCooldown: 0,
    floatingTexts: [],
    crisisState: 'none', // 'none' | 'apoptosis' | 'senescence' | 'necrosis' | 'warburg'
    fermentationTimer: 0,
    ketoneCycleDuration: 1.95,
    ketoneSpawnSeq: 0,
    // F-08: Hepatic Glycogen, GNG, Muscle Outpost Ferry & Kawabe-no-Miko
    glycogenLevel: 55,
    glycogenMode: 'idle', // 'idle' | 'glycogenesis' | 'glycogenolysis'
    glycerolPool: 22,
    pyruvatePool: 35,
    lactatePool: 28,
    alaninePool: 12,
    gngActive: false,
    gngTier: 'none', // 'none' | 'glycogen' | 'lactate_glycerol' | 'alanine'
    gngEnergyCredit: 0,
    gngNeedsKoku: false,
    gngOutputCount: 0,
    gngReverseTimer: 0,
    gngExportPulse: 0,
    muscleProteolysis: false,
    muscleFerry: {
        // Decoupled 2-lane floating river ferries (gx: 3.1 <-> 13.1 along Southern River)
        inPhase: 'atMuscle', // 'atMuscle' | 'toLiver' | 'atLiver'
        inProgress: 0,
        inWait: 0,
        inCargo: 'none', // 'none' | 'lactate' | 'alanine'
        outPhase: 'atLiver', // 'atLiver' | 'toMuscle' | 'atMuscle'
        outProgress: 0,
        outWait: 0,
        outCargo: 'none', // 'none' | 'glucose'
        glucoseWaiting: 0
    },
    dockPorter: {
        gx: 5.55, gy: 12.92, state: 'idleAtDock', cargo: 'none', stepPhase: 0, facing: 1, _wpIdx: 0
    },
    musclePorter: {
        gx: 14.25, gy: 15.02, state: 'idleAtPontoon', cargo: 'none', stepPhase: 0, facing: -1
    },
    warburgActive: false,
    pressActive: false,
    pulseAnimTimer: 0,
    succinatePool: 0,
    targetGarrisonSize: 20,
    exercisePriming: 0,
    recoveryWindowTimer: 0,
    recoveryFedWithPriming: false,
    monkOrdainPending: false,
    ordainingMonk: null,
    pruningEvent: null,
    apoptosisSequence: null,
    necrosisSequence: null,
    starvationSequence: null,
    senescenceYardWorkers: [],
    victoryAchieved: false,
    victoryType: 'none',
    flexUpCount: 0,
    flexDownCount: 0,
    lastTrackedGarrisonSize: 20,
    homeostasisTimer: 0,
    atrophyAdvised: false,
    matsuriPetals: [],
    villageCharred: false,
    villageGreyLevel: 0,
    membraneDepolarized: false,
    fastingAtrophyTimer: 0,
    gngSpiritPulses: [],
    muscleCalmingSpirits: [],
    muscleSpiritCooldown: 0,
    // F-09: Complex I & II Back-Pressure, RET-ROS, Adaptive ROS Feedback & NAFLD
    v1StallTimer: 0,
    c1ReverseSlip: false,
    c1SpillAnim: 0,
    nafldAccumTimer: 0,
    irRatchetBonus: 0,
    retArcTimer: 0,
    retCooldown: 0,
    rosFeedbackBrake: 0,
    rosSluiceTimer: 0,
    rosSluiceCooldown: 0,
    nrf2BoostActive: false,
    succinateHifDrive: 0,
    mikoCouriers: []
});

function spawnFloatingText(gx, gy, gz, text, color = '#fef08a') {
    if (SimState.floatingTexts.length > 30) SimState.floatingTexts.shift();
    SimState.floatingTexts.push({ gx, gy, gz, text, color, life: 0, maxLife: 1.45 });
}

const CrisisDefinitions = {
    apoptosis: {
        icon: '👹',
        badge: 'Catastrophic Bioenergetic Collapse',
        title: 'mPTP BREACH & APOPTOSIS',
        desc: 'Starved Samurai turned into rogue Ronin and hacked open the Mitochondrial Permeability Transition Pore! Dam Potential (ΔΨm) collapsed to 0 mV and Cytochrome c leaked into the cytosol.',
        borderClass: 'border-red-500/90 bg-red-950/90 text-red-100'
    },
    senescence: {
        icon: '⛩️',
        badge: 'Chronic Unchecked mTORC1 Hypertrophy',
        title: 'GILDED TEMPLE OF SENESCENCE',
        desc: 'mTOR Zen Monks completed 100% of the Temple without AMPK Autophagy turnover! Entranced by the Golden Bell, villagers entered permanent cell-cycle arrest amid SASP oxidative fires.',
        borderClass: 'border-amber-400/90 bg-amber-950/90 text-amber-100'
    },
    necrosis: {
        icon: '☠️',
        badge: 'Overwhelming Electrophilic & Oxidative Siege',
        title: 'ACUTE TOXIC NECROSIS & FERROPTOSIS',
        desc: 'A massive Xenobiotic Bandit surge depleted Glutathione (GSH ≤ 2%) amid rampant ROS fires before metabolic adaptation could occur, rupturing membranes via lipid peroxidation!',
        borderClass: 'border-rose-500/90 bg-slate-950/95 text-rose-200'
    },
    warburg: {
        icon: '🧟',
        badge: '100% ETC Scarring • HIF-1α / PDK1 Lock-In',
        title: 'COMPENSATORY WARBURG & mSLP ZOMBIE STATE',
        desc: '100% of OxPhos waterwheels scarred—irreversible Warburg lock-in! Next time, intervene BEFORE 100% scarring with Seyfried’s Press-Pulse: set the Press (Glucose <10%, Fat >80%, Toxin <5%) to bale the Glycolysis bog, then click Pulse repeatedly to empty the refilling Succinate (mSLP) basket!',
        borderClass: 'border-lime-400/90 bg-emerald-950/90 text-lime-100'
    },
    nafld: {
        icon: '🫧',
        badge: 'Chronic ROS + Insulin Resistance (>80%)',
        title: 'HEPATIC STEATOSIS (NAFLD / MASLD)',
        desc: 'Sustained high ROS (≥80%) and escalating Insulin Resistance (>80%) drove De Novo Lipogenesis while Malonyl-CoA blocked CPT-1 β-oxidation—trapping lipotoxic lipid droplets across the hepatocyte!',
        borderClass: 'border-amber-400/90 bg-orange-950/90 text-amber-100'
    },
    starvation: {
        icon: '🌾',
        badge: 'AUTOPHAGIC EXHAUSTION',
        title: 'Bioenergetic Starvation & Atrophy',
        desc: 'All exogenous fuel and endogenous Glycogen, Lactate, Glycerol, and Alanine reserves were exhausted. AMPK hyper-autophagy pruned the garrison before the cell entered silent bioenergetic shutdown.',
        borderClass: 'border-stone-400/90 bg-stone-950/90 text-stone-100'
    },
    victory: {
        icon: '🏆',
        badge: 'PEAK MITOCHONDRIAL BIOGENESIS',
        title: 'Golden Matsuri — 25/25 Garrison Achieved!',
        desc: 'By cycling High Workload (PGC-1α priming), Recovery Feeding (mTORC1 supercompensation), and Balanced Fasting consolidation, you expanded the conserved adenylate pool to peak 25/25 capacity!',
        borderClass: 'border-emerald-400/90 bg-emerald-950/90 text-emerald-100'
    },
    flexibility: {
        icon: '☯️',
        badge: 'METABOLIC FLEXIBILITY',
        title: 'AMPK ↔ mTOR Plasticity — Dynamic Health!',
        desc: 'You actively cycled between catabolic pruning and anabolic supercompensation within 16–24 Samurai around ~20—preserving clean mitochondrial turnover and dynamic metabolic flexibility!',
        borderClass: 'border-cyan-400/90 bg-cyan-950/90 text-cyan-100'
    },
    homeostasis: {
        icon: '⚖️',
        badge: 'STEADY-STATE HOMEOSTASIS (>5 MIN)',
        title: 'Bioenergetic Balance — Sustained Homeostasis!',
        desc: 'You sustained >5 minutes of clean, low-ROS bioenergetic equilibrium—matching ATP supply and workload without triggering either catabolic exhaustion or anabolic overload!',
        borderClass: 'border-amber-400/90 bg-amber-950/90 text-amber-100'
    },
    atrophy: {
        icon: '🪶',
        badge: 'CATABOLIC MINIMUM (15/25)',
        title: 'Austere Lean Garrison — Reduced Reserve',
        desc: 'Prolonged low-glucose, low-mTOR fasting with no exercise pruned away spare mitochondrial capacity down to 15/25. Cycle High Workload (PGC-1α priming) → Recovery Feeding to rebuild surge reserve.',
        borderClass: 'border-indigo-400/90 bg-slate-950/90 text-indigo-100'
    }
};

function setCrisisBanner(state) {
    SimState.crisisState = state;
    const banner = document.getElementById('crisisBanner');
    if (!banner) return;
    if (state === 'none' || !CrisisDefinitions[state]) {
        banner.classList.add('hidden');
        return;
    }
    const def = CrisisDefinitions[state];
    banner.className = `pointer-events-auto mx-auto max-w-2xl w-full rounded-2xl px-4 py-2.5 border-2 shadow-2xl backdrop-blur-md transition-all duration-300 flex items-center justify-between gap-3 ${def.borderClass}`;
    document.getElementById('crisisIcon').textContent = def.icon;
    document.getElementById('crisisBadge').textContent = def.badge;
    document.getElementById('crisisTitle').textContent = def.title;
    document.getElementById('crisisDesc').textContent = def.desc;
    const btnContinue = document.getElementById('btnContinueVictory');
    if (btnContinue) btnContinue.classList.toggle('hidden', state !== 'victory' && state !== 'flexibility' && state !== 'homeostasis' && state !== 'atrophy');
}

// Wrap initSamuraiGarrison & resetFullSimulation to reset V4 state cleanly
const _v3InitSamuraiGarrison = initSamuraiGarrison;
initSamuraiGarrison = function () {
    _v3InitSamuraiGarrison();
    SimState.bandits = [];
    SimState.banditSpawnTimer = 0;
    SimState.akCooldown = 0;
    SimState.ampCount = 0;
    SimState.floatingTexts = [];
    SimState.fermentationTimer = 0;
    SimState.gngActive = false;
    SimState.gngTier = 'none';
    SimState.gngEnergyCredit = 0;
    SimState.gngNeedsKoku = false;
    SimState.gngOutputCount = 0;
    SimState.gngReverseTimer = 0;
    SimState.gngExportPulse = 0;
    SimState.muscleProteolysis = false;
    SimState.muscleFerry = {
        inPhase: 'atMuscle', inProgress: 0, inWait: 0, inCargo: 'none',
        outPhase: 'atLiver', outProgress: 0, outWait: 0, outCargo: 'none',
        glucoseWaiting: 0
    };
    SimState.dockPorter = {
        gx: 5.55, gy: 12.92, state: 'idleAtDock', cargo: 'none', stepPhase: 0, facing: 1, _wpIdx: 0
    };
    SimState.musclePorter = {
        gx: 14.25, gy: 15.02, state: 'idleAtPontoon', cargo: 'none', stepPhase: 0, facing: -1
    };
    SimState.warburgActive = false;
    SimState.pressActive = false;
    SimState.pulseAnimTimer = 0;
    SimState.succinatePool = 0;
    SimState.targetGarrisonSize = 20;
    SimState.exercisePriming = 0;
    SimState.recoveryWindowTimer = 0;
    SimState.recoveryFedWithPriming = false;
    SimState.monkOrdainPending = false;
    SimState.ordainingMonk = null;
    SimState.pruningEvent = null;
    SimState.apoptosisSequence = null;
    SimState.necrosisSequence = null;
    SimState.starvationSequence = null;
    SimState.senescenceYardWorkers = [];
    SimState.victoryAchieved = false;
    SimState.victoryType = 'none';
    SimState.flexUpCount = 0;
    SimState.flexDownCount = 0;
    SimState.lastTrackedGarrisonSize = 20;
    SimState.homeostasisTimer = 0;
    SimState.atrophyAdvised = false;
    SimState.matsuriPetals = [];
    SimState.villageCharred = false;
    SimState.villageGreyLevel = 0;
    SimState.membraneDepolarized = false;
    SimState.fastingAtrophyTimer = 0;
    SimState.gngSpiritPulses = [];
    SimState.muscleCalmingSpirits = [];
    SimState.muscleSpiritCooldown = 0;
    SimState.bhbRecruitsUsed = 0;
    SimState.v1StallTimer = 0;
    SimState.c1ReverseSlip = false;
    SimState.c1SpillAnim = 0;
    SimState.nafldAccumTimer = 0;
    SimState.irRatchetBonus = 0;
    SimState.retArcTimer = 0;
    SimState.retCooldown = 0;
    SimState.rosFeedbackBrake = 0;
    SimState.rosSluiceTimer = 0;
    SimState.rosSluiceCooldown = 0;
    SimState.nrf2BoostActive = false;
    SimState.succinateHifDrive = 0;
    SimState.mikoCouriers = [
        { id: 1, gx: 0.85, gy: 11.0, state: 'waitingAtGate', hasGlucose: false, stepPhase: 0, facing: 1, waitTimer: 0 }
    ];
    setCrisisBanner('none');
    for (const s of SimState.samurai) {
        s.targetBanditId = null;
    }
};

const _v3ResetFullSimulation = resetFullSimulation;
resetFullSimulation = function () {
    SimState.toxinLoad = 0;
    SimState.etcDamage = 0;
    const sliderToxin = document.getElementById('sliderToxin');
    const valToxin = document.getElementById('valToxin');
    if (sliderToxin) sliderToxin.value = 0;
    if (valToxin) valToxin.textContent = '0%';
    _v3ResetFullSimulation();
};

// V4 Master Update Step (Replaces V3 updateSimulation with full V3+V4 fidelity & Road Route-Finding)
updateSimulation = function (dt) {
    const time = performance.now() * 0.001;
    if (SimState.crisisState === 'nafld') {
        const rawDt = dt;
        dt = dt * 0.32;
        for (const s of SimState.samurai) s.sheathed = true;
        for (const r of SimState.ronin) r.sheathed = true;
        if (SimState.fires.length < 18 && Math.random() < rawDt * 1.4) {
            SimState.fires.push({
                gx: 2.0 + Math.random() * 25.0,
                gy: 5.0 + Math.random() * 7.2,
                intensity: 1.05
            });
        }
    }

    // 1. RANDLE CYCLE & INSULIN RESISTANCE (Outer GLUT4 Gate vs. Inner MPC/PDH Gate)
    const fatNorm = SimState.fatSupply / 100;
    const glucNorm = SimState.glucoseSupply / 100;
    const demandNorm = SimState.samuraiDemand / 100;
    const lowDemandAmplifier = 0.75 + 0.50 * (1 - demandNorm) + 0.20 * (SimState.damLevel / 100);

    if (SimState.glut4ForcedOpenTimer > 0) {
        SimState.glut4ForcedOpenTimer = Math.max(0, SimState.glut4ForcedOpenTimer - dt);
    }
    // Physiological Insulin Resistance: driven by chronic mTOR/S6K1 AND protective Complex I NADH/ROS overload!
    const c1RosIrDrive = (SimState.villageStock.v1 >= 3 || SimState.rosLevel >= 30)
        ? Math.min(0.65, Math.max(0, (SimState.villageStock.v1 - 2) * 0.14) + Math.max(0, (SimState.rosLevel - 20) / 100) * 0.55)
        : 0;
    const mtorIrDrive = SimState.shrineScaffolding > 50
        ? Math.min(0.62, ((SimState.shrineScaffolding - 50) / 50) * 0.58 + (SimState.misfoldedBeams * 0.02))
        : 0;
    // Smooth leaky accumulator: sustained ROS >= 80% & IR >= 40% ratchets IR by +10% every 30s -> NAFLD at IR > 80%
    const bothHighRandle = SimState.fatSupply >= 60 && SimState.glucoseSupply >= 60 && SimState.samuraiDemand <= 40;
    const highGlucAlone = SimState.glucoseSupply >= 65 && SimState.fatSupply <= 30 && SimState.samuraiDemand <= 40;
    const unbufferedHighGluc = highGlucAlone && (SimState.antioxSynthesis < 35 || SimState.toxinLoad >= 25) && !SimState.warburgActive;

    if (bothHighRandle && SimState.damLevel >= 40 && SimState.crisisState === 'none') {
        SimState._yardFireTimer = (SimState._yardFireTimer || 0) + dt;
        const yardFires = SimState.fires.filter(f => f.gx >= 1.5 && f.gx <= 4.5 && ((f.gy >= 4.8 && f.gy <= 7.0) || (f.gy >= 9.6 && f.gy <= 12.0))).length;
        if (yardFires < 4 && SimState._yardFireTimer >= 2.0) {
            SimState._yardFireTimer = 0;
            const inFatYard = yardFires % 2 === 0;
            SimState.fires.push({
                gx: 2.2 + Math.random() * 1.8,
                gy: inFatYard ? (5.3 + Math.random() * 1.1) : (10.1 + Math.random() * 1.3),
                intensity: 1.1
            });
        }
        if (SimState.antioxSynthesis >= 45 && SimState.toxinLoad < 20) {
            SimState.etcDamage = Math.min(42, SimState.etcDamage);
        }
    }

    if (unbufferedHighGluc && SimState.crisisState === 'none') {
        SimState.etcDamage = Math.min(99, SimState.etcDamage + dt * 4.5);
    }

    if ((SimState.rosLevel >= 75 || (bothHighRandle && SimState.damLevel >= 40)) && SimState.insulinResistance >= 0.40 && SimState.crisisState === 'none') {
        SimState.nafldAccumTimer += dt * (bothHighRandle ? 3.2 : 1.0);
        if (SimState.nafldAccumTimer >= 30.0) {
            SimState.nafldAccumTimer = 0;
            SimState.irRatchetBonus = Math.min(0.55, SimState.irRatchetBonus + (bothHighRandle ? 0.15 : 0.10));
            spawnFloatingText(1.22, 10.9, 1.85, '📈 Chronic ROS → +10% Insulin Resistance!', '#f472b6');
        }
    } else if (SimState.rosLevel < 40) {
        SimState.nafldAccumTimer = Math.max(0, SimState.nafldAccumTimer - dt * 0.4);
    }
    const randleIrFloor = bothHighRandle ? 0.45 : 0;
    const targetInsulinRes = Math.min(0.95, Math.max(mtorIrDrive, c1RosIrDrive, randleIrFloor) + SimState.irRatchetBonus);
    if (SimState.insulinResistance > 0.80 && (SimState.rosLevel >= 75 || bothHighRandle) && SimState.crisisState === 'none') {
        setCrisisBanner('nafld');
        spawnFloatingText(3.5, 7.5, 2.2, '🫧 HEPATIC STEATOSIS (NAFLD / MASLD)!', '#fbbf24');
    }
    const irRate = targetInsulinRes > SimState.insulinResistance ? 1.8 : 2.5;
    SimState.insulinResistance += (targetInsulinRes - SimState.insulinResistance) * Math.min(1, dt * irRate);

    const effectiveInsulinBlock = SimState.glut4ForcedOpenTimer > 0
        ? SimState.insulinResistance * 0.15
        : SimState.insulinResistance;

    // PDK1 Gate Closure during Warburg or severe ETC Scarring (>= 50% scar) throttles mitochondrial pyruvate entry
    const pdk1Block = (SimState.warburgActive || SimState.etcDamage >= 50)
        ? Math.min(0.92, Math.max(SimState.warburgActive ? 0.55 : 0, ((SimState.etcDamage - 50) / 50) * 0.90))
        : 0;

    const rawGlucAfterGlut4 = glucNorm * (1 - effectiveInsulinBlock);
    const rawGlucPressure = rawGlucAfterGlut4 * (0.35 + 0.65 * (SimState.effectiveGlucose / 100 || rawGlucAfterGlut4));
    const targetFatInhib = (fatNorm > 0.05 && rawGlucAfterGlut4 > 0.05)
        ? Math.min(0.88, Math.pow(rawGlucPressure, 1.15) * BioConfig.malonylInhibitionStrength * lowDemandAmplifier)
        : 0;
    const rawFatPressure = fatNorm * (0.35 + 0.65 * (SimState.effectiveFat / 100 || fatNorm));
    const targetGlucInhib = (fatNorm > 0.05 && rawGlucAfterGlut4 > 0.05)
        ? Math.min(0.88, Math.pow(rawFatPressure, 1.15) * BioConfig.randleInhibitionStrength * (0.85 + 0.30 * (SimState.damLevel / 100)))
        : 0;

    SimState.fatInhibitionLevel += (targetFatInhib - SimState.fatInhibitionLevel) * Math.min(1, dt * 4.0);
    // F-09: Chronic Complex II Succinate buildup (>= 7 bales) drives HIF-1a PDH throttle
    const targetSuccHif = SimState.villageStock.v2 >= 7 ? Math.min(0.42, (SimState.villageStock.v2 - 6) * 0.12) : 0;
    SimState.succinateHifDrive += (targetSuccHif - SimState.succinateHifDrive) * Math.min(1, dt * 2.5);
    SimState.randleBlockLevel += (Math.max(targetGlucInhib, pdk1Block, SimState.succinateHifDrive) - SimState.randleBlockLevel) * Math.min(1, dt * 4.0);

    // F-09: Adaptive ROS Feedback Brake throttles upstream fuel entry so the ETC can clear its backlog
    const targetRosBrake = SimState.fires.length > 0 ? Math.min(0.25, SimState.fires.length * 0.06) : 0;
    SimState.rosFeedbackBrake += (targetRosBrake - SimState.rosFeedbackBrake) * Math.min(1, dt * 3.0);

    // Bistable Warburg Toggle Switch (55% Entry Threshold -> stays locked until < 30% Exit Threshold)
    if (bothHighRandle && SimState.antioxSynthesis >= 45 && SimState.toxinLoad < 20) {
        SimState.etcDamage = Math.min(42, SimState.etcDamage);
    }
    if (SimState.etcDamage >= 55) SimState.warburgActive = true;
    else if (SimState.etcDamage < 30) SimState.warburgActive = false;

    // Complete shutdown of Beta-Oxidation when Warburg Fermentation is active
    SimState.effectiveFat = SimState.warburgActive
        ? 0
        : SimState.fatSupply * (1 - SimState.fatInhibitionLevel) * (1 - pdk1Block * 0.75) * (1 - SimState.rosFeedbackBrake);
    SimState.effectiveGlucose = SimState.glucoseSupply * (1 - effectiveInsulinBlock) * (1 - SimState.randleBlockLevel) * (1 - SimState.rosFeedbackBrake * 0.75);

    const freezeTransport = SimState.cellDead
        || SimState.crisisState === 'necrosis'
        || SimState.crisisState === 'starvation'
        || (SimState.apoptosisSequence && SimState.apoptosisSequence.act !== 'rampage')
        || (SimState.necrosisSequence && SimState.necrosisSequence.act !== 'surge')
        || (SimState.starvationSequence && SimState.starvationSequence.act !== 'scavenge');
    if (!freezeTransport) {
        SimState.fatChainOffset = ((SimState.fatChainOffset || 0) + dt * (SimState.effectiveFat / 100) * 1.15) % 1;
        const isReverseConveyor = (SimState.gngActive && SimState.gngEnergyCredit > 0.05) || SimState.glycogenMode === 'glycogenesis';
        const glucSpeed = SimState.warburgActive
            ? 1.35
            : (SimState.gngActive && SimState.gngEnergyCredit > 0.05
                ? -0.78
                : (SimState.glycogenMode === 'glycogenesis' ? -0.52 : (SimState.effectiveGlucose / 100)));
        SimState.glucConveyorPhase = (((SimState.glucConveyorPhase || 0) + dt * glucSpeed * 0.95) % 1 + 1) % 1;
        SimState.glucSmashPhase = (SimState.glucSmashPhase + dt * (isReverseConveyor ? 1.8 : ((SimState.glucoseSupply * (1 - effectiveInsulinBlock)) / 100) * 3.5)) % (Math.PI * 2);
    }

    // Fatty-acid-activated UCP1 proton leak during High Fat + Low Glucose (keeps ΔΨm below RET-ROS threshold)
    const ucp1FatLeak = (SimState.fatSupply >= 60 && SimState.glucoseSupply <= 25 && !SimState.mtorKetoneSeal && !SimState.warburgActive && !SimState.cellDead);
    if (ucp1FatLeak && SimState.damLevel > 78) {
        SimState.damLevel = Math.max(78, SimState.damLevel - (SimState.damLevel - 78) * 1.8 * dt);
    }

    // 2. UNBLOCKED KETOGENESIS & THREE PHYSIOLOGICAL KETONE BODIES: BHB, AcAc & Acetone (Section 3.4)
    if (SimState.glucoseSupply <= 30) {
        SimState.mtorKetoneSeal = false;
    }

    if (SimState.glucoseSupply <= 28 && SimState.effectiveFat >= 32 && !SimState.mtorKetoneSeal && !SimState.warburgActive) {
        SimState.lowCarbDuration = Math.min(10, SimState.lowCarbDuration + dt * 2.5);
    } else {
        SimState.lowCarbDuration = Math.max(0, SimState.lowCarbDuration - dt * 3.0);
    }
    SimState.ketogenesisActive = SimState.lowCarbDuration >= 2.0 && !SimState.mtorKetoneSeal && !SimState.warburgActive;

    const cycleLen = SimState.ketoneCycleDuration || 1.95;
    if (SimState.ketogenesisActive) {
        const excessDrive = ((SimState.effectiveFat - 22) / 78) * ((30 - SimState.glucoseSupply) / 30);
        // Realistic condensation pace (~1 butterfly per 1.8–2.3s; 2 Acetyl-CoA loaves per butterfly)
        SimState.ketoneTimer += dt * Math.max(0.55, excessDrive * 1.45);
        if (SimState.ketoneTimer >= cycleLen && SimState.ketoneButterflies.length < 10) {
            SimState.ketoneTimer = 0;
            SimState.ketoneCounterWindow.push(time);
            // Physiological Ketone Body Proportions: ~50% BHB (Golden), ~33% Acetoacetate (Blue), ~17% Acetone (Pink)
            const kTypes = ['BHB', 'AcAc', 'BHB', 'AcAc', 'BHB', 'Acetone'];
            const ketoneType = kTypes[(SimState.ketoneSpawnSeq = (SimState.ketoneSpawnSeq || 0) + 1) % kTypes.length];
            SimState.ketoneButterflies.push({
                ketoneType,
                phase: 'snapping',
                timer: 0,
                gx: 2.98,
                gy: 3.18,
                gz: 0.56,
                vx: ketoneType === 'Acetone' ? (2.2 + Math.random() * 0.8) : (3.1 + Math.random() * 1.0),
                vy: ketoneType === 'Acetone' ? (-0.55 + (Math.random() - 0.5) * 0.3) : (-0.15 + (Math.random() - 0.5) * 0.4),
                vz: ketoneType === 'Acetone' ? 1.15 : (0.50 + Math.random() * 0.25),
                wingPhase: Math.random() * Math.PI * 2,
                targetFire: null,
                healingEtc: false,
                deliveredFuel: false,
                alpha: 1.0
            });
        }
    } else {
        SimState.ketoneTimer = 0;
    }

    const canRepairEtc = SimState.toxinLoad < 15 && SimState.bandits.length === 0 && SimState.crisisState === 'none';

    for (let i = SimState.ketoneButterflies.length - 1; i >= 0; i--) {
        const kb = SimState.ketoneButterflies[i];
        const kType = kb.ketoneType || 'BHB';
        kb.timer += dt;
        kb.wingPhase += dt * (kType === 'Acetone' ? 24.0 : 18.0);
        if (kb.phase === 'snapping') {
            if (kb.timer >= 0.48) {
                kb.phase = 'flying';
                const pCol = kType === 'BHB' ? '#fbbf24' : (kType === 'AcAc' ? '#38bdf8' : '#f472b6');
                for (let s = 0; s < 8; s++) {
                    spawnParticle(kb.gx, kb.gy, kb.gz + 0.2, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4, 1.5, pCol, 3.4, 0.6);
                }
            }
            continue;
        }

        // Species 3: Acetone (Volatile decarboxylation byproduct -> cannot extinguish fires; flutters skyward and exhales/evaporates)
        if (kType === 'Acetone') {
            kb.gx += kb.vx * dt;
            kb.gy += (kb.vy + Math.sin(time * 5.0 + i) * 0.35) * dt;
            kb.gz += kb.vz * dt * 0.75;
            const flightTime = kb.timer - 0.48;
            kb.alpha = Math.max(0, 1 - (flightTime / 3.1));
            if (Math.random() < 0.32) {
                spawnParticle(kb.gx, kb.gy, kb.gz, -0.3, (Math.random() - 0.5) * 0.4, 0.6, '#fda4af', 2.2, 0.45);
            }
            if (flightTime >= 3.1 || kb.gx > 33.5) {
                spawnFloatingText(kb.gx, kb.gy, kb.gz, '💨 Acetone (Exhaled)', '#fda4af');
                SimState.ketoneButterflies.splice(i, 1);
            }
            continue;
        }

        // Species 2: Acetoacetate (AcAc -> Oxidized Ketone Fuel via SCOT; CANNOT inhibit NLRP3 or extinguish fires!)
        if (kType === 'AcAc') {
            if (!kb.deliveredFuel && SimState.villageStock.v1 < 9 && !SimState.warburgActive) {
                const tx = 10.9, ty = 5.8;
                const dist = Math.hypot(tx - kb.gx, ty - kb.gy);
                if (dist < 0.52) {
                    kb.deliveredFuel = true;
                    SimState.villageStock.v1 = Math.min(12, SimState.villageStock.v1 + 1);
                    for (let s = 0; s < 8; s++) {
                        spawnParticle(tx, ty, 0.9, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 1.4, '#38bdf8', 3.2, 0.55);
                    }
                    spawnFloatingText(tx, ty, 1.5, '🦋 AcAc → Acetyl-CoA (Fuel)', '#38bdf8');
                    SimState.ketoneButterflies.splice(i, 1);
                    continue;
                } else {
                    const ang = Math.atan2(ty - kb.gy, tx - kb.gx);
                    kb.gx += Math.cos(ang) * 4.1 * dt;
                    kb.gy += Math.sin(ang) * 4.1 * dt;
                    continue;
                }
            }
            kb.gx += kb.vx * dt;
            kb.gy += (kb.vy + Math.sin(time * 3.2 + i) * 0.28) * dt;
            kb.gz += Math.min(0.85, kb.vz) * dt * 0.40;
            if (Math.random() < 0.25) {
                spawnParticle(kb.gx - 0.2, kb.gy, kb.gz, -0.4, (Math.random() - 0.5) * 0.3, 0.2, '#38bdf8', 2.1, 0.42);
            }
            if (kb.gx > 33.5) SimState.ketoneButterflies.splice(i, 1);
            continue;
        }

        // Species 1: Golden BHB (beta-Hydroxybutyrate -> dives on prowling Ronin, ROS fires, PGC-1a, or Muscle SCOT)
        if (SimState.samuraiDemand < 60 || (SimState.recoveryWindowTimer || 0) > 0) {
            SimState.bhbRecruitsUsed = 0;
        }
        if (kb.targetRoninId) {
            const rIdx = SimState.ronin.findIndex(r => r.id === kb.targetRoninId);
            if (rIdx === -1 || SimState.ronin.length <= 3 || SimState.roninRebelling) {
                kb.targetRoninId = null;
            } else {
                const targetR = SimState.ronin[rIdx];
                const distR = Math.hypot(targetR.gx - kb.gx, targetR.gy - kb.gy);
                if (distR < 0.65) {
                    SimState.ronin.splice(rIdx, 1);
                    SimState.bhbRecruitsUsed = (SimState.bhbRecruitsUsed || 0) + 1;
                    targetR.isRonin = false;
                    targetR.sheathed = false;
                    targetR.hasKoku = false;
                    targetR.kokuEnergy = 0;
                    targetR.state = 'approaching';
                    targetR.waitTimer = 0;
                    targetR.exchangeProgress = 0;
                    targetR.queueJoinSeq = ++SimState.samuraiQueueSeq;
                    targetR._path = null;
                    for (let s = 0; s < 10; s++) {
                        spawnParticle(targetR.gx, targetR.gy, 0.7, (Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.8, 1.6, s % 2 === 0 ? '#fde047' : '#22d3ee', 3.6, 0.65);
                    }
                    spawnFloatingText(targetR.gx, targetR.gy, 1.45, `🦋 β-HB → Ronin Returns! (${SimState.bhbRecruitsUsed}/4)`, '#fde047');
                    SimState.ketoneButterflies.splice(i, 1);
                    continue;
                } else {
                    const ang = Math.atan2(targetR.gy - kb.gy, targetR.gx - kb.gx);
                    kb.gx += Math.cos(ang) * 5.2 * dt;
                    kb.gy += Math.sin(ang) * 5.2 * dt;
                    kb.gz = Math.max(0.55, kb.gz - dt * 0.25);
                    continue;
                }
            }
        }
        if (!kb.targetFire && !kb.healingEtc && !kb.toMuscle && !kb.targetRoninId && SimState.ronin.length > 3 && (SimState.bhbRecruitsUsed || 0) < 4 && SimState.effectiveFat >= 35 && SimState.samuraiDemand < 95 && !SimState.roninRebelling && !SimState.ketoneButterflies.some(other => other.targetRoninId)) {
            kb.targetRoninId = SimState.ronin[SimState.ronin.length - 1].id;
            continue;
        }
        if (kb.toMuscle) {
            const distM = Math.hypot(14.3 - kb.gx, 14.05 - kb.gy);
            if (distM < 0.55) {
                for (let s = 0; s < 10; s++) {
                    spawnParticle(14.3, 14.05, 0.55, (Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.8, 1.5, '#fbbf24', 3.4, 0.6);
                }
                spawnFloatingText(14.3, 14.05, 1.25, '🦋 β-HB → Muscle SCOT!', '#fbbf24');
                if (typeof window.trySpawnMuscleCalmingSpirit === 'function') {
                    window.trySpawnMuscleCalmingSpirit('🦋 β-HB → Muscle');
                }
                SimState.ketoneButterflies.splice(i, 1);
                continue;
            } else {
                const ang = Math.atan2(14.05 - kb.gy, 14.3 - kb.gx);
                kb.gx += Math.cos(ang) * 4.4 * dt;
                kb.gy += Math.sin(ang) * 4.4 * dt;
                kb.gz = Math.max(0.45, kb.gz - dt * 0.25);
                continue;
            }
        }
        if (!kb.targetFire && !kb.healingEtc && SimState.ronin.length > 5 && (SimState.bhbRecruitsUsed || 0) < 4 && SimState.effectiveFat >= 35 && SimState.samuraiDemand < 90 && SimState.muscleSpiritCooldown <= 0 && !SimState.ketoneButterflies.some(other => other.toMuscle)) {
            kb.toMuscle = true;
            continue;
        }
        if (kb.targetFire && !SimState.fires.includes(kb.targetFire)) {
            kb.targetFire = null;
        }
        if (!kb.targetFire && SimState.fires.length > 0) {
            for (const f of SimState.fires) {
                const alreadyClaimed = SimState.ketoneButterflies.some(other => other !== kb && other.targetFire === f);
                if (!alreadyClaimed) {
                    kb.targetFire = f;
                    kb.healingEtc = false;
                    break;
                }
            }
        }

        if (kb.targetFire) {
            const f = kb.targetFire;
            const dist = Math.hypot(f.gx - kb.gx, f.gy - kb.gy);
            const speed = 5.2;
            if (dist < 0.45) {
                const fIdx = SimState.fires.indexOf(f);
                if (fIdx !== -1) SimState.fires.splice(fIdx, 1);
                for (let s = 0; s < 12; s++) {
                    spawnParticle(f.gx, f.gy, 0.35, (Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 2.0, 1.6, s % 2 === 0 ? '#22d3ee' : '#fbbf24', 3.8, 0.65);
                }
                spawnFloatingText(f.gx, f.gy, 0.9, '🦋 β-HB ⊣ NLRP3!', '#22d3ee');
                SimState.ketoneButterflies.splice(i, 1);
                continue;
            } else {
                const ang = Math.atan2(f.gy - kb.gy, f.gx - kb.gx);
                kb.gx += Math.cos(ang) * speed * dt;
                kb.gy += Math.sin(ang) * speed * dt;
                kb.gz = Math.max(0.3, kb.gz - dt * 0.6);
            }
        } else if (SimState.fires.length === 0 && SimState.toxinLoad < 25 && SimState.etcDamage > 0 && canRepairEtc) {
            // Pathway 3: Golden BHB Butterfly Epigenetic Healing at Village III (17.3, 5.5) (-4% Scar)
            kb.healingEtc = true;
            const tx = 17.3, ty = 5.5;
            const dist = Math.hypot(tx - kb.gx, ty - kb.gy);
            if (dist < 0.48) {
                SimState.etcDamage = Math.max(0, SimState.etcDamage - 4);
                for (let s = 0; s < 12; s++) {
                    spawnParticle(tx, ty, 1.1, (Math.random() - 0.5) * 1.9, (Math.random() - 0.5) * 1.9, 1.7, '#fde047', 3.8, 0.65);
                }
                spawnFloatingText(tx, ty, 1.8, '🦋 β-HB → PGC-1α (-4% Scar)', '#fde047');
                SimState.ketoneButterflies.splice(i, 1);
                continue;
            } else {
                const ang = Math.atan2(ty - kb.gy, tx - kb.gx);
                kb.gx += Math.cos(ang) * 4.5 * dt;
                kb.gy += Math.sin(ang) * 4.5 * dt;
            }
        } else {
            kb.gx += kb.vx * dt;
            kb.gy += (kb.vy + Math.sin(time * 3.2 + i) * 0.28) * dt;
            kb.gz += Math.min(0.85, kb.vz) * dt * 0.45;
            if (Math.random() < 0.28) {
                spawnParticle(kb.gx - 0.2, kb.gy, kb.gz, -0.4, (Math.random() - 0.5) * 0.3, 0.2, '#fde047', 2.2, 0.45);
            }
            if (kb.gx > 33.5) SimState.ketoneButterflies.splice(i, 1);
        }
    }
    SimState.ketoneCounterWindow = SimState.ketoneCounterWindow.filter(t => time - t <= 3.0);
    SimState.ketoneRate = SimState.ketoneCounterWindow.length / 3.0;

    // 2B. F-08: HEPATIC GLYCOGENESIS / GLYCOGENOLYSIS, GLUCONEOGENESIS (GNG), MUSCLE FERRY & KAWABE-NO-MIKO
    {
        // A. Metabolite Spill-Over Pools (Glycerol from Beta-Oxidation; Pyruvate <-> Lactate equilibration)
        if (SimState.effectiveFat > 5 && !SimState.warburgActive) {
            SimState.glycerolPool = Math.min(100, SimState.glycerolPool + dt * (SimState.effectiveFat / 100) * 2.8);
        }
        const glucAfterGlut4 = SimState.glucoseSupply * (1 - effectiveInsulinBlock);
        if (glucAfterGlut4 > 15) {
            SimState.pyruvatePool = Math.min(100, SimState.pyruvatePool + dt * (glucAfterGlut4 / 100) * (SimState.warburgActive ? 4.2 : 1.6));
        }
        // Warburg spills excess Pyruvate into Lactate; otherwise LDH equilibrates Pyruvate <-> Lactate
        if (SimState.warburgActive) {
            const spill = Math.min(SimState.pyruvatePool, dt * 3.5);
            SimState.pyruvatePool -= spill;
            SimState.lactatePool = Math.min(100, SimState.lactatePool + spill);
        } else {
            const eqDiff = (SimState.pyruvatePool - SimState.lactatePool) * 0.12 * dt;
            SimState.pyruvatePool = Math.max(0, Math.min(100, SimState.pyruvatePool - eqDiff));
            SimState.lactatePool = Math.max(0, Math.min(100, SimState.lactatePool + eqDiff));
        }

        // B. Glycogenesis (Surplus / Randle Back-Pressure -> Low-Cost Reverse Conveyor into Granary)
        //    vs. Glycogenolysis (Tier 1 First-Line Buffer when Glucose drops)
        const randleBackPressure = SimState.randleBlockLevel > 0.22 && glucAfterGlut4 >= 25;
        const surplusGlycogenesis = SimState.glucoseSupply >= 48 && (SimState.mtorActive || SimState.damLevel >= 55) && SimState.atpCount >= 11;
        if (!SimState.warburgActive && SimState.glycogenLevel < 99 && (randleBackPressure || surplusGlycogenesis) && SimState.glucoseSupply > 24) {
            SimState.glycogenMode = 'glycogenesis';
            const fillRate = (randleBackPressure ? 2.8 : 2.1) * (glucAfterGlut4 / 100);
            SimState.glycogenLevel = Math.min(100, SimState.glycogenLevel + dt * fillRate);
        } else if (SimState.glucoseSupply <= 28 && SimState.glycogenLevel > 1.5 && !SimState.warburgActive) {
            SimState.glycogenMode = 'glycogenolysis';
            SimState.glycogenLevel = Math.max(0, SimState.glycogenLevel - dt * 2.6);
        } else {
            SimState.glycogenMode = 'idle';
        }

        // C. Hepatic Gluconeogenesis (GNG) Context Gate & Strict Order of Demand:
        //    1. Glycogen (handled above) -> 2. Lactate + Glycerol -> 3. Alanine (extreme starvation only)
        const gngContextMet = (
            SimState.glucoseSupply <= 28 &&
            !SimState.mtorActive &&
            !SimState.warburgActive &&
            (SimState.ketogenesisActive || SimState.effectiveFat >= 26) &&
            SimState.glycogenLevel <= 2.5
        );

        const hasTier2 = (SimState.lactatePool > 3 || SimState.glycerolPool > 3);
        const hasTier3 = SimState.alaninePool > 2;

        if (SimState.glycogenMode === 'glycogenolysis') {
            SimState.gngActive = false;
            SimState.gngTier = 'glycogen';
            SimState.gngNeedsKoku = false;
        } else if (gngContextMet && (hasTier2 || hasTier3)) {
            SimState.gngActive = true;
            SimState.gngTier = hasTier2 ? 'lactate_glycerol' : 'alanine';
            SimState.gngNeedsKoku = SimState.gngEnergyCredit < 2.2;
        } else {
            SimState.gngActive = false;
            SimState.gngTier = 'none';
            SimState.gngNeedsKoku = false;
        }

        // Consume donated Samurai Koku credit while actively synthesizing & exporting Glucose
        if (SimState.gngActive && SimState.gngEnergyCredit > 0) {
            const gngBurn = dt * 1.0;
            SimState.gngEnergyCredit = Math.max(0, SimState.gngEnergyCredit - gngBurn);
            if (SimState.gngTier === 'lactate_glycerol') {
                if (SimState.lactatePool > 0) SimState.lactatePool = Math.max(0, SimState.lactatePool - dt * 2.4);
                if (SimState.glycerolPool > 0) SimState.glycerolPool = Math.max(0, SimState.glycerolPool - dt * 1.8);
                SimState.pyruvatePool = Math.max(0, Math.min(100, SimState.pyruvatePool + dt * 0.8));
            } else if (SimState.gngTier === 'alanine') {
                SimState.alaninePool = Math.max(0, SimState.alaninePool - dt * 2.1);
            }

            // Produce a newly minted Glucose hex-ring at the left GLUT2 gate every 2.2s
            SimState.gngReverseTimer += dt;
            if (SimState.gngReverseTimer >= 2.2) {
                SimState.gngReverseTimer = 0;
                SimState.gngExportPulse = 1.0;
                SimState.gngOutputCount++;
                // Dispatch Kawabe-no-Miko at the GLUT2 gate if waiting
                const waitingMiko = SimState.mikoCouriers.find(m => m.state === 'waitingAtGate');
                if (waitingMiko) {
                    waitingMiko.state = 'carryingToFerry';
                    waitingMiko.hasGlucose = true;
                    waitingMiko._wpIdx = 0;
                    spawnFloatingText(1.15, 10.9, 1.35, '✨ GLUT2 Glucose Export!', '#38bdf8');
                }
            }
        }
        SimState.gngExportPulse = Math.max(0, SimState.gngExportPulse - dt * 1.6);

        // D. Peripheral Muscle Outpost & Bloodstream River Ferry (Cori Cycle & Cahill Starvation Proteolysis)
        const starvMuscleExhausted = (SimState.preset === 'starvation' || (SimState.glucoseSupply <= 10 && SimState.fatSupply <= 10)) && (SimState.starvationTimer || 0) >= 6.0;
        SimState.muscleProteolysis = (
            !starvMuscleExhausted &&
            SimState.glycogenLevel <= 3 &&
            SimState.lactatePool < 16 &&
            SimState.glycerolPool < 16 &&
            SimState.glucoseSupply <= 25 &&
            !SimState.warburgActive
        );

        const mf = SimState.muscleFerry;
        const dp = SimState.dockPorter;
        if (SimState.cellDead
            || SimState.crisisState === 'necrosis'
            || SimState.crisisState === 'starvation'
            || (SimState.apoptosisSequence && SimState.apoptosisSequence.act !== 'rampage')
            || (SimState.necrosisSequence && SimState.necrosisSequence.act !== 'surge')
            || (SimState.starvationSequence && SimState.starvationSequence.act !== 'scavenge')) {
            // Freeze ferries & dock porters during/after bridge breach
        } else if (mf.inPhase === 'atMuscle') {
            mf.inWait += dt;
            if (mf.inWait >= 1.8) {
                mf.inWait = 0;
                if (SimState.muscleProteolysis) {
                    mf.inCargo = 'alanine';
                } else if (!starvMuscleExhausted && (SimState.samuraiDemand >= 30 || SimState.gngActive)) {
                    mf.inCargo = 'lactate';
                } else {
                    mf.inCargo = 'none';
                }
                mf.inPhase = 'toLiver';
                mf.inProgress = 0;
            }
        } else if (mf.inPhase === 'toLiver') {
            mf.inProgress = Math.min(1, mf.inProgress + dt * 0.24);
            if (mf.inProgress >= 1) {
                mf.inPhase = 'atLiver';
                mf.inWait = 0;
                // Hand off cargo to the human Dockhand Porter on the south side of the pontoon
                if (mf.inCargo !== 'none' && dp && dp.state === 'idleAtDock') {
                    dp.gx = 5.65; dp.gy = 13.55;
                    dp.cargo = mf.inCargo;
                    dp.state = 'carryingToBucket';
                    dp._wpIdx = 0;
                    mf.inCargo = 'none';
                }
            }
        } else if (mf.inPhase === 'atLiver') {
            mf.inWait += dt;
            if (mf.inWait >= 1.2) {
                mf.inWait = 0;
                mf.inPhase = 'returningToMuscle';
                mf.inProgress = 0;
            }
        } else if (mf.inPhase === 'returningToMuscle') {
            mf.inProgress = Math.min(1, mf.inProgress + dt * 0.28);
            if (mf.inProgress >= 1) {
                mf.inPhase = 'atMuscle';
                mf.inWait = 0;
            }
        }

        // D2. Outbound Glucose Ferry (Cytosol River Dock gx=3.1 -> Muscle Platform gx=13.1 along gy=13.24)
        if (mf.outPhase === 'atLiver') {
            mf.outWait += dt;
            if (mf.glucoseWaiting > 0) {
                mf.glucoseWaiting--;
                mf.outCargo = 'glucose';
                mf.outPhase = 'toMuscle';
                mf.outProgress = 0;
                mf.outWait = 0;
            } else if (mf.outWait >= 3.5) {
                mf.outWait = 0;
            }
        } else if (mf.outPhase === 'toMuscle') {
            mf.outProgress = Math.min(1, mf.outProgress + dt * 0.24);
            if (mf.outProgress >= 1) {
                if (mf.outCargo === 'glucose') {
                    spawnFloatingText(14.3, 13.8, 1.0, '🌾 Glucose → Muscle!', '#67e8f9');
                    if (typeof window.trySpawnMuscleCalmingSpirit === 'function') {
                        window.trySpawnMuscleCalmingSpirit('🌾 GNG Glucose → Muscle');
                    }
                }
                mf.outCargo = 'none';
                mf.outPhase = 'atMuscle';
                mf.outWait = 0;
            }
        } else if (mf.outPhase === 'atMuscle') {
            mf.outWait += dt;
            if (mf.outWait >= 1.4) {
                mf.outWait = 0;
                mf.outPhase = 'returningToLiver';
                mf.outProgress = 0;
            }
        } else if (mf.outPhase === 'returningToLiver') {
            mf.outProgress = Math.min(1, mf.outProgress + dt * 0.28);
            if (mf.outProgress >= 1) {
                mf.outPhase = 'atLiver';
                mf.outWait = 0;
            }
        }

        // D3. Human Dockhand Porter (always stays south/outside of the Maiden's lane)
        if (dp) {
            const bucketTarget = dp.cargo === 'alanine' ? { x: 1.45, y: 8.20 } : { x: 4.25, y: 8.20 };
            const carryPath = [{ x: 5.55, y: 12.92 }, { x: 5.35, y: 9.25 }, bucketTarget];
            const returnPath = [{ x: 5.35, y: 9.25 }, { x: 5.55, y: 12.92 }];
            if (dp.state === 'carryingToBucket') {
                const wp = carryPath[dp._wpIdx || 0];
                const dx = wp.x - dp.gx, dy = wp.y - dp.gy;
                const d = Math.hypot(dx, dy);
                const spd = 1.65;
                dp.stepPhase += dt * 8.0;
                if (Math.abs(dx) > 0.02) dp.facing = dx >= 0 ? 1 : -1;
                if (d <= spd * dt * 1.15) {
                    dp.gx = wp.x; dp.gy = wp.y;
                    dp._wpIdx++;
                    if (dp._wpIdx >= carryPath.length) {
                        if (dp.cargo === 'alanine') {
                            SimState.alaninePool = Math.min(100, SimState.alaninePool + 16);
                            spawnFloatingText(1.45, 7.8, 0.95, '+Alanine (Muscle)', '#f472b6');
                        } else {
                            SimState.lactatePool = Math.min(100, SimState.lactatePool + 14);
                            spawnFloatingText(4.25, 7.8, 0.95, '+Lactate (Cori)', '#a78bfa');
                        }
                        dp.cargo = 'none';
                        dp.state = 'returningToDock';
                        dp._wpIdx = 0;
                    }
                } else {
                    dp.gx += (dx / d) * spd * dt;
                    dp.gy += (dy / d) * spd * dt;
                }
            } else if (dp.state === 'returningToDock') {
                const wp = returnPath[dp._wpIdx || 0];
                const dx = wp.x - dp.gx, dy = wp.y - dp.gy;
                const d = Math.hypot(dx, dy);
                const spd = 1.65;
                dp.stepPhase += dt * 7.5;
                if (Math.abs(dx) > 0.02) dp.facing = dx >= 0 ? 1 : -1;
                if (d <= spd * dt * 1.15) {
                    dp.gx = wp.x; dp.gy = wp.y;
                    dp._wpIdx++;
                    if (dp._wpIdx >= returnPath.length) {
                        dp.state = 'idleAtDock';
                        dp._wpIdx = 0;
                    }
                } else {
                    dp.gx += (dx / d) * spd * dt;
                    dp.gy += (dy / d) * spd * dt;
                }
            } else {
                dp.stepPhase += dt * 1.2;
            }
        }

        // D4. Muscle Outpost Pontoon Porter (loads Lactate/Alanine onto inbound Isobune & offloads Glucose from outbound Isobune)
        const mp = SimState.musclePorter;
        if (mp) {
            let targetX = 14.25, targetY = 15.02;
            if (mf.inPhase === 'atMuscle' && mf.inWait < 1.2) {
                mp.cargo = SimState.muscleProteolysis ? 'alanine' : ((SimState.samuraiDemand >= 30 || SimState.gngActive) ? 'lactate' : 'none');
                targetX = 13.95; targetY = 15.12;
            } else if (mf.outPhase === 'atMuscle') {
                mp.cargo = mf.outCargo === 'glucose' ? 'glucose' : 'none';
                if (mf.outWait < 0.85) {
                    targetX = 13.95; targetY = 15.12; // Step forward to pontoon edge to unload Glucose from boat
                } else {
                    targetX = 14.35; targetY = 14.55; // Carry Glucose back onto Muscle Outpost deck
                }
            } else {
                mp.cargo = 'none';
                targetX = 14.25; targetY = 15.02;
            }
            const dx = targetX - mp.gx, dy = targetY - mp.gy;
            const d = Math.hypot(dx, dy);
            if (d > 0.04) {
                const spd = 1.35;
                mp.gx += (dx / d) * Math.min(d, spd * dt);
                mp.gy += (dy / d) * Math.min(d, spd * dt);
                mp.stepPhase += dt * 7.5;
                if (Math.abs(dx) > 0.01) mp.facing = dx >= 0 ? 1 : -1;
            } else {
                mp.stepPhase += dt * 1.4;
            }
        }

        // E. Kawabe-no-Miko (River-Shrine Maiden) takes the northern/inner lane (north of the Dockhand Porter)
        const mikoCarryRoute = [
            { x: 0.75, y: 11.15 },
            { x: 0.75, y: 12.38 },
            { x: 5.15, y: 12.42 },
            { x: 5.45, y: 13.28 }
        ];
        const mikoReturnRoute = [
            { x: 5.15, y: 12.42 },
            { x: 0.75, y: 12.38 },
            { x: 0.85, y: 11.0 }
        ];
        for (const m of SimState.mikoCouriers) {
            if (m.state === 'carryingToFerry') {
                const wp = mikoCarryRoute[m._wpIdx || 0];
                const dx = wp.x - m.gx, dy = wp.y - m.gy;
                const d = Math.hypot(dx, dy);
                const spd = 1.45;
                m.stepPhase += dt * 7.5;
                if (Math.abs(dx) > 0.02) m.facing = dx >= 0 ? 1 : -1;
                if (d <= spd * dt * 1.15) {
                    m.gx = wp.x; m.gy = wp.y;
                    m._wpIdx = (m._wpIdx || 0) + 1;
                    if (m._wpIdx >= mikoCarryRoute.length) {
                        m.hasGlucose = false;
                        mf.glucoseWaiting = Math.min(3, mf.glucoseWaiting + 1);
                        m.state = 'returningToGate';
                        m._wpIdx = 0;
                        spawnParticle(2.75, 12.35, 0.45, 0, 0.3, 1.1, '#67e8f9', 3.4, 0.6);
                    }
                } else {
                    m.gx += (dx / d) * spd * dt;
                    m.gy += (dy / d) * spd * dt;
                }
            } else if (m.state === 'returningToGate') {
                const wp = mikoReturnRoute[m._wpIdx || 0];
                const dx = wp.x - m.gx, dy = wp.y - m.gy;
                const d = Math.hypot(dx, dy);
                const spd = 1.45;
                m.stepPhase += dt * 7.0;
                if (Math.abs(dx) > 0.02) m.facing = dx >= 0 ? 1 : -1;
                if (d <= spd * dt * 1.15) {
                    m.gx = wp.x; m.gy = wp.y;
                    m._wpIdx = (m._wpIdx || 0) + 1;
                    if (m._wpIdx >= mikoReturnRoute.length) {
                        m.state = 'waitingAtGate';
                        m._wpIdx = 0;
                    }
                } else {
                    m.gx += (dx / d) * spd * dt;
                    m.gy += (dy / d) * spd * dt;
                }
            } else {
                m.stepPhase += dt * 1.5;
            }
        }

        // F. Shodo Koku Donation Water Spirit (Suijin Wisp) gliding from Shodo Pavilion to Glycolysis Yard
        if (SimState.gngSpiritPulses) {
            for (let i = SimState.gngSpiritPulses.length - 1; i >= 0; i--) {
                const sp = SimState.gngSpiritPulses[i];
                sp.progress = Math.min(1, sp.progress + dt * 0.45);
                const t = sp.progress;
                sp.gx = 25.55 + (3.0 - 25.55) * t;
                sp.gy = t < 0.82
                    ? 13.15 + Math.sin(t * Math.PI * 4) * 0.22
                    : 13.15 + (10.9 - 13.15) * ((t - 0.82) / 0.18);
                sp.gz = 0.45 + Math.sin(t * Math.PI) * 0.45;
                if (Math.random() < 0.55) {
                    spawnParticle(sp.gx, sp.gy, sp.gz, 0.2, (Math.random() - 0.5) * 0.3, 0.4, Math.random() < 0.5 ? '#67e8f9' : '#fde047', 2.8, 0.45);
                }
                if (sp.progress >= 1) {
                    spawnFloatingText(3.0, 10.9, 1.45, '🌊⚡ Shodo Spirit → GNG!', '#67e8f9');
                    for (let k = 0; k < 10; k++) {
                        spawnParticle(3.0, 10.9, 0.75, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, 1.5, '#67e8f9', 3.4, 0.55);
                    }
                    SimState.gngSpiritPulses.splice(i, 1);
                }
            }
        }

        // G. Fat-Adapted Muscle Calming Spirit (GNG Glucose or BHB SCOT -> coaxes 1 prowling Ronin back to Castle ADP queue)
        if (SimState.muscleSpiritCooldown > 0) {
            SimState.muscleSpiritCooldown = Math.max(0, SimState.muscleSpiritCooldown - dt);
        }
        window.trySpawnMuscleCalmingSpirit = function (sourceLabel) {
            if (
                SimState.ronin.length > 5 &&
                !SimState.roninRebelling &&
                SimState.effectiveFat >= 35 &&
                SimState.ketogenesisActive &&
                SimState.samuraiDemand < 90 &&
                SimState.muscleSpiritCooldown <= 0
            ) {
                const targetR = SimState.ronin.find(r => !r.recruitedBySpirit);
                if (targetR) {
                    targetR.recruitedBySpirit = true;
                    SimState.muscleSpiritCooldown = 4.5;
                    SimState.muscleCalmingSpirits.push({
                        gx: 14.3, gy: 14.05, gz: 0.9,
                        startX: 14.3, startY: 14.05,
                        progress: 0,
                        targetRoninId: targetR.id,
                        label: sourceLabel
                    });
                    if (SimState.ripples) SimState.ripples.push({ gx: 14.3, gy: 14.05, radius: 0.35, alpha: 0.95 });
                    return true;
                }
            }
            return false;
        };

        if (SimState.muscleCalmingSpirits) {
            for (let i = SimState.muscleCalmingSpirits.length - 1; i >= 0; i--) {
                const sp = SimState.muscleCalmingSpirits[i];
                const rIdx = SimState.ronin.findIndex(r => r.id === sp.targetRoninId);
                if (rIdx === -1 || SimState.roninRebelling) {
                    SimState.muscleCalmingSpirits.splice(i, 1);
                    continue;
                }
                const targetR = SimState.ronin[rIdx];
                sp.progress = Math.min(1, sp.progress + dt * 0.55);
                const t = sp.progress;
                sp.gx = sp.startX + (targetR.gx - sp.startX) * t;
                sp.gy = sp.startY + (targetR.gy - sp.startY) * t;
                sp.gz = 0.9 + Math.sin(t * Math.PI) * 0.65;
                if (Math.random() < 0.5) {
                    spawnParticle(sp.gx, sp.gy, sp.gz, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, 0.5, '#67e8f9', 2.8, 0.45);
                }
                if (sp.progress >= 1) {
                    SimState.ronin.splice(rIdx, 1);
                    targetR.isRonin = false;
                    targetR.recruitedBySpirit = false;
                    targetR.hasKoku = false;
                    targetR.kokuEnergy = 0;
                    targetR.state = 'approaching';
                    targetR.isRecoveringAMP = false;
                    targetR.waitTimer = 0;
                    targetR.exchangeProgress = 0;
                    targetR.queueJoinSeq = ++SimState.samuraiQueueSeq;
                    targetR._path = null;
                    spawnFloatingText(targetR.gx, targetR.gy, 1.35, '🌊 Fat-Adapted → Ronin Returns (ADP)!', '#67e8f9');
                    for (let k = 0; k < 10; k++) {
                        spawnParticle(targetR.gx, targetR.gy, 0.6, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, 1.5, '#67e8f9', 3.4, 0.6);
                    }
                    SimState.muscleCalmingSpirits.splice(i, 1);
                }
            }
        }
    }

    // 3. NON-BLOCKING PATHOLOGY DYNAMICS (Apoptosis, Senescence, Necrosis)
    // Advance ambient particles, floating texts, and river ripples even in terminal states so the canvas never freezes!
    if (SimState.cellDead || SimState.senescenceActive || SimState.crisisState === 'necrosis' || SimState.crisisState === 'starvation') {
        if (SimState.cellDead) {
            if (SimState.crisisState !== 'apoptosis') setCrisisBanner('apoptosis');
            SimState.damLevel = 0;
            SimState.atpRate = 0;
        } else if (SimState.senescenceActive) {
            if (SimState.crisisState !== 'senescence') setCrisisBanner('senescence');
            SimState.senescenceTimer += dt;
            SimState.atpRate = 0;
            const circleMembers = [
                ...SimState.samurai.filter(s => !s.isRonin),
                ...SimState.ronin,
                ...SimState.porters,
                ...SimState.brigade,
                ...SimState.monks,
                ...SimState.ninjas,
                ...(SimState.mikoCouriers || []),
                ...(SimState.bandits || []),
                ...(SimState.senescenceYardWorkers || []),
            ];
            if (SimState.ordainingMonk) circleMembers.push(SimState.ordainingMonk);
            if (SimState.dockPorter) circleMembers.push(SimState.dockPorter);
            if (SimState.musclePorter) circleMembers.push(SimState.musclePorter);
            const totalMembers = Math.max(1, circleMembers.length);
            for (let idx = 0; idx < circleMembers.length; idx++) {
                const ent = circleMembers[idx];
                const ang = (idx / totalMembers) * Math.PI * 2;
                const tx = 17.3 + Math.cos(ang) * 2.45;
                const ty = 10.7 + Math.sin(ang) * 1.95;
                const dist = Math.hypot(tx - ent.gx, ty - ent.gy);
                if (dist > 0.14) {
                    const moveAng = Math.atan2(ty - ent.gy, tx - ent.gx);
                    const step = Math.min(dist, 2.6 * dt);
                    ent.gx += Math.cos(moveAng) * step;
                    ent.gy += Math.sin(moveAng) * step;
                    ent.walkPhase = (ent.walkPhase || 0) + dt * 8.5;
                    ent.facingDir = Math.cos(moveAng) >= 0 ? 1 : -1;
                } else {
                    ent.facingDir = ent.gx < 17.3 ? 1 : -1;
                }
            }
            if (SimState.fires.length < 14 && Math.random() < dt * 2.0) {
                SimState.fires.push({
                    gx: 10.5 + Math.random() * 12.5,
                    gy: 5.5 + Math.random() * 6.5,
                    intensity: 1.0
                });
            }
            SimState.rosLevel = Math.min(100, Math.round(SimState.fires.length * 8 + 30));
        } else if (SimState.crisisState === 'necrosis') {
            SimState.damLevel = 0;
            SimState.atpRate = 0;
            SimState.membraneDepolarized = true;
            SimState.sluiceOpen = true;
            SimState.villageCharred = true;
            // Ground fires continue burning and spreading toward neighboring SE tissue
            if (SimState.fires.length < 28 && Math.random() < dt * 2.2) {
                SimState.fires.push({
                    gx: 8.5 + Math.random() * 25.5,
                    gy: 5.0 + Math.random() * 8.6,
                    intensity: 1.0
                });
            }
            SimState.rosLevel = 100;
        } else if (SimState.crisisState === 'starvation') {
            SimState.damLevel = 0;
            SimState.atpRate = 0;
            SimState.villageGreyLevel = 1.0;
            if (SimState.starvationSequence && SimState.starvationSequence.tumbleweeds) {
                for (const tw of SimState.starvationSequence.tumbleweeds) {
                    tw.gx += tw.speed * dt;
                    tw.rot += tw.speed * 2.4 * dt;
                    if (tw.gx > 35.0) tw.gx = 7.6;
                }
            }
        }
        for (let i = SimState.particles.length - 1; i >= 0; i--) {
            const pt = SimState.particles[i];
            pt.life += dt;
            if (pt.life >= pt.maxLife) { SimState.particles.splice(i, 1); continue; }
            pt.gx += (pt.vx || 0) * dt; pt.gy += (pt.vy || 0) * dt; pt.gz += (pt.vz || 0) * dt;
        }
        for (let i = SimState.floatingTexts.length - 1; i >= 0; i--) {
            const ft = SimState.floatingTexts[i];
            ft.life += dt; ft.gz += dt * 0.75;
            if (ft.life >= ft.maxLife) SimState.floatingTexts.splice(i, 1);
        }
        for (let i = SimState.ripples.length - 1; i >= 0; i--) {
            const rp = SimState.ripples[i];
            rp.radius += dt * 1.4; rp.alpha -= dt * 0.95;
            if (rp.alpha <= 0) SimState.ripples.splice(i, 1);
        }
        updateHUD();
        return;
    }

    // 4. XENOBIOTIC BANDIT RAIDS & SABOTAGE (Section 3.2)
    let maxBandits = 0;
    if (SimState.toxinLoad >= 80) maxBandits = 5;
    else if (SimState.toxinLoad >= 35) maxBandits = 2;
    else if (SimState.toxinLoad > 5) maxBandits = 1;

    const banditWaypoints = [
        { x: 10.9, y: 6.85 }, // Village I Plaza
        { x: 14.3, y: 9.35 }, // GSH Wellhouse Plaza
        { x: 17.3, y: 6.85 }, // Village III Plaza
        { x: 22.1, y: 11.65 }  // Village IV Plaza
    ];

    if (SimState.toxinLoad > 5 && SimState.bandits.length < maxBandits && SimState.crisisState !== 'warburg' && !SimState.necrosisSequence && SimState.crisisState !== 'necrosis' && !SimState.roninRebelling) {
        const spawnInterval = SimState.toxinLoad >= 80 ? 4.2 : (SimState.toxinLoad >= 35 ? 7.2 : 10.5);
        SimState.banditSpawnTimer += dt;
        if (SimState.banditSpawnTimer >= spawnInterval) {
            SimState.banditSpawnTimer = 0;
            const initIdx = Math.floor(Math.random() * 3); // Head straight into Village I, Wellhouse, or Village III first!
            SimState.bandits.push({
                id: ++SimState.banditIdSeq,
                gx: 22.8 + (Math.random() - 0.5) * 0.35,
                gy: 3.4,
                tx: banditWaypoints[initIdx].x,
                ty: banditWaypoints[initIdx].y,
                roamTargetIdx: initIdx,
                chasedBySamuraiIds: [],
                engaged: false,
                chaseTimer: 0,
                requiredChaseTime: 5.8 + Math.random() * 1.0,
                fireTimer: 0,
                robCooldown: 0,
                walkPhase: Math.random() * 6,
                clubPhase: Math.random() * 6
            });
            for (let s = 0; s < 8; s++) {
                spawnParticle(22.8, 3.4, 0.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 1.2, '#a3e635', 3.6, 0.55);
            }
        }
    }

    const toxinScale = 0.35 + 0.65 * (SimState.toxinLoad / 100);

    for (let i = SimState.bandits.length - 1; i >= 0; i--) {
        if (SimState.necrosisSequence) break;
        const b = SimState.bandits[i];
        b.robCooldown = Math.max(0, b.robCooldown - dt);

        // Clean up stale chasers (include both 'consumingKoku' potion-drinking Samurai and actively 'chasingBandit' Samurai)
        b.chasedBySamuraiIds = b.chasedBySamuraiIds.filter(sid => {
            const sam = SimState.samurai.find(s => s.id === sid);
            return sam && !sam.isRonin && (sam.state === 'chasingBandit' || sam.state === 'consumingKoku') && sam.targetBanditId === b.id && sam.kokuEnergy > 0.02;
        });

        // A Bandit is only physically engaged once the Samurai has finished drinking/taking their Koku Potion ('chasingBandit') and closed within 1.25 tiles!
        let isEngaged = false;
        for (const sid of b.chasedBySamuraiIds) {
            const sam = SimState.samurai.find(s => s.id === sid);
            if (sam && sam.state === 'chasingBandit' && Math.hypot(sam.gx - b.gx, sam.gy - b.gy) <= 1.25) {
                isEngaged = true;
                break;
            }
        }
        b.engaged = isEngaged;
        b.clubPhase = (b.clubPhase || 0) + dt * (isEngaged ? 8.5 : 3.2);

        // 80% Sabotage Suppression when engaged, and ~60% gentler base toxin strength so 10% toxin does not overload in seconds!
        const sabotageMult = (isEngaged ? 0.20 : 1.0) * toxinScale;

        SimState.gshReserve = Math.max(0, SimState.gshReserve - 0.65 * sabotageMult * dt);
        if (b.gy > 5.0) {
            SimState.etcDamage = Math.min(100, SimState.etcDamage + 0.45 * sabotageMult * dt);
        }

        b.fireTimer += dt * sabotageMult;
        if (b.fireTimer >= 6.8 && SimState.fires.length < 12 && b.gy > 5.0) {
            b.fireTimer = 0;
            SimState.fires.push({
                gx: b.gx + (Math.random() - 0.5) * 0.6,
                gy: b.gy + (Math.random() - 0.5) * 0.6,
                intensity: 1.0
            });
        }

        // Rob passing CoQ or CytC porters (only when unengaged and robCooldown <= 0)
        if (!isEngaged && b.robCooldown <= 0 && b.gy > 5.0) {
            for (let pIdx = SimState.porters.length - 1; pIdx >= 0; pIdx--) {
                const p = SimState.porters[pIdx];
                if (Math.hypot(p.gx - b.gx, p.gy - b.gy) <= 1.1) {
                    SimState.porters.splice(pIdx, 1);
                    const robScar = +(0.9 * toxinScale).toFixed(1);
                    SimState.etcDamage = Math.min(100, SimState.etcDamage + robScar);
                    b.robCooldown = 5.5;
                    for (let s = 0; s < 8; s++) {
                        spawnParticle(b.gx, b.gy, 0.4, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, 1.4, '#a3e635', 3.5, 0.5);
                    }
                    spawnFloatingText(b.gx, b.gy, 0.9, `🧪 Cargo Robbed! (+${robScar}% Scar)`, '#bef264');
                    break;
                }
            }
        }

        // Recruit at most 1 Dojo Samurai once Bandit enters the village road network (gy > 6.45)
        // Recruited Samurai must physically "take" their Koku like Asterix drinking the magic potion before giving chase!
        if (b.gy > 6.45 && b.chasedBySamuraiIds.length < 1) {
            const candidate = SimState.samurai.find(s =>
                !s.isRonin &&
                s.state === 'training' &&
                s.kokuEnergy > 0.25
            );
            if (candidate) {
                candidate.state = 'consumingKoku';
                candidate.consumeTimer = 2.85;
                candidate.consumeDuration = 2.85;
                candidate.targetBanditId = b.id;
                candidate._path = null;
                candidate._kokuWaypoints = null;
                b.chasedBySamuraiIds.push(candidate.id);
                spawnFloatingText(candidate.gx, candidate.gy, 1.2, '🧪 Taking Koku Potion!', '#facc15');
            }
        }

        // Engagement detoxification progress
        if (isEngaged) {
            b.chaseTimer += dt;
            if (Math.random() < 0.45) {
                spawnParticle(b.gx, b.gy, 0.55, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 1.3, '#fde047', 2.8, 0.35);
            }
            if (b.chaseTimer >= b.requiredChaseTime) {
                // Bandit defeated!
                for (const sid of b.chasedBySamuraiIds) {
                    const sam = SimState.samurai.find(s => s.id === sid);
                    if (sam) {
                        sam.targetBanditId = null;
                        sam.state = sam.kokuEnergy > 0.1 ? 'toTrainingYard' : 'approaching';
                        if (sam.state === 'approaching') {
                            sam.hasKoku = false;
                            sam.kokuEnergy = 0;
                            sam.queueJoinSeq = ++SimState.samuraiQueueSeq;
                        }
                    }
                }
                for (let s = 0; s < 14; s++) {
                    spawnParticle(b.gx, b.gy, 0.5, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2, 1.8, s % 2 === 0 ? '#a3e635' : '#38bdf8', 3.8, 0.65);
                }
                spawnFloatingText(b.gx, b.gy, 1.1, '⚔️ Bandit Detoxified!', '#34d399');
                SimState.bandits.splice(i, 1);
                continue;
            }
        }

        // Movement along infiltration trail and paved avenues between villages (slowed for smooth observability)
        const moveSpeed = isEngaged ? 0.38 : 1.35;
        if (b.gy < 6.65) {
            const ang = Math.atan2(6.85 - b.gy, 22.8 - b.gx);
            b.gx += Math.cos(ang) * moveSpeed * dt;
            b.gy += Math.sin(ang) * moveSpeed * dt;
            b.walkPhase += moveSpeed * dt * 5.2;
        } else {
            const arrived = window.stepAlongVillagePath(b, b.tx, b.ty, moveSpeed, dt, 0.38);
            if (arrived) {
                b.roamTargetIdx = (b.roamTargetIdx + 1 + Math.floor(Math.random() * 2)) % banditWaypoints.length;
                b.tx = banditWaypoints[b.roamTargetIdx].x + (Math.random() - 0.5) * 0.4;
                b.ty = banditWaypoints[b.roamTargetIdx].y + (Math.random() - 0.5) * 0.3;
            }
        }
    }

    // 5. VICIOUS CYCLE OF OXPHOS BREAKDOWN (RIRR), PRE-WARBURG FASTING RESCUE & BISTABLE WARBURG SWITCH
    const preWarburgFasting = !SimState.warburgActive && SimState.glucoseSupply <= 12 && SimState.fatSupply >= 75 && SimState.toxinLoad < 10;
    if (preWarburgFasting && SimState.etcDamage > 0) {
        // Balanced Fasting (Ketosis + AMPK + Low Toxin) in the Pre-Warburg window (<55%) halts RIRR, clears ROS & heals ETC before full Warburg locks in!
        SimState.gshReserve = Math.min(95, SimState.gshReserve + 8.0 * dt);
        if (SimState.fires.length > 0 && Math.random() < 2.2 * dt) SimState.fires.pop();
        if (SimState.bandits && SimState.bandits.length > 0) SimState.bandits.pop();
        SimState.etcDamage = Math.max(0, SimState.etcDamage - 2.6 * dt);
    } else if (canRepairEtc && SimState.etcDamage > 0 && !SimState.warburgActive) {
        if (SimState.gshReserve > 60) {
            SimState.etcDamage = Math.max(0, SimState.etcDamage - 1.85 * dt);
        }
    }

    if (SimState.etcDamage >= 38 && !canRepairEtc && !SimState.pressActive && !preWarburgFasting) {
        const rirrDecay = ((SimState.etcDamage - 36) / 64) * 0.52;
        SimState.etcDamage = Math.min(100, SimState.etcDamage + rirrDecay * dt);
        if (bothHighRandle && SimState.antioxSynthesis >= 45 && SimState.toxinLoad < 20) {
            SimState.etcDamage = Math.min(42, SimState.etcDamage);
        }
        const scarFrac = SimState.etcDamage / 100;
        if (SimState.fires.length < 12 && Math.random() < 0.25 * scarFrac * dt) {
            const hubs = [{ x: 10.9, y: 6.6 }, { x: 17.3, y: 6.6 }, { x: 22.1, y: 11.4 }];
            const h = hubs[Math.floor(Math.random() * hubs.length)];
            SimState.fires.push({
                gx: h.x + (Math.random() - 0.5) * 1.1,
                gy: h.y + (Math.random() - 0.5) * 0.9,
                intensity: 1.0
            });
        }
    }

    if (SimState.etcDamage >= 45 && SimState.toxinLoad < 75) {
        SimState.gshReserve = Math.min(100, SimState.gshReserve + 3.2 * dt);
    }

    if (bothHighRandle && SimState.antioxSynthesis >= 45 && SimState.toxinLoad < 20) {
        SimState.etcDamage = Math.min(42, SimState.etcDamage);
    }

    if (SimState.warburgActive || SimState.etcDamage >= 50) {
        if (SimState.glucoseSupply >= 15 && !SimState.pressActive) {
            SimState.glucoseSupply = Math.min(100, SimState.glucoseSupply + 2.1 * dt);
            const sGluc = document.getElementById('sliderGlucose');
            const vGluc = document.getElementById('valGlucose');
            if (sGluc) sGluc.value = Math.round(SimState.glucoseSupply);
            if (vGluc) vGluc.textContent = `${Math.round(SimState.glucoseSupply)}%`;
        }
        SimState.antioxSynthesis = Math.min(100, SimState.antioxSynthesis + 1.8 * dt);

        const sAntiox = document.getElementById('sliderAntiox');
        const vAntiox = document.getElementById('valAntiox');
        if (sAntiox) sAntiox.value = Math.round(SimState.antioxSynthesis);
        if (vAntiox) vAntiox.textContent = `${Math.round(SimState.antioxSynthesis)}%`;

        const damDrag = 6.5 * Math.max(SimState.warburgActive ? 0.35 : 0, (SimState.etcDamage - 50) / 50);
        SimState.damLevel = Math.max(0, SimState.damLevel - damDrag * dt);
    }

    if (SimState.etcDamage >= 99.5) {
        SimState.etcDamage = 100;
        if (SimState.crisisState !== 'warburg') {
            setCrisisBanner('warburg');
            spawnFloatingText(16.5, 8.0, 2.2, '🧟 WARBURG & mSLP ZOMBIE STATE LOCKED IN!', '#a3e635');
        }
    }

    // 5b. PROF. SEYFRIED PRESS-PULSE: User sets Press (Glucose < 10%, Fat > 80%, Toxin < 5%), then clicks Pulse at Succinate overflow until < 30%!
    const warburgEligible = SimState.warburgActive && SimState.etcDamage < 99.5 && SimState.crisisState !== 'warburg' && !SimState.cellDead;
    const prevPress = SimState.pressActive;
    SimState.pressActive = warburgEligible && SimState.glucoseSupply < 10 && SimState.fatSupply > 80 && SimState.toxinLoad < 5;
    if (SimState.pressActive && !prevPress) {
        spawnFloatingText(8.5, 9.5, 2.2, '💧 PRESS ACTIVE: Firemen Baling Glycolysis Bog — Click PULSE to Empty Succinate!', '#4ade80');
    }
    if (SimState.pulseAnimTimer > 0) {
        SimState.pulseAnimTimer = Math.max(0, SimState.pulseAnimTimer - dt);
    }

    const btnPP = document.getElementById('btnPressPulse');
    const lblPP = document.getElementById('lblPressPulseText');
    const succReady = (SimState.succinatePool || 0) >= 95;
    if (btnPP) {
        btnPP.classList.toggle('hidden', !SimState.pressActive);
        const pulsing = SimState.pulseAnimTimer > 0;
        btnPP.classList.toggle('bg-fuchsia-900/80', pulsing || succReady);
        btnPP.classList.toggle('ring-2', SimState.pressActive && succReady);
        btnPP.classList.toggle('ring-fuchsia-400/80', SimState.pressActive && succReady);
        btnPP.classList.toggle('opacity-80', SimState.pressActive && !succReady && !pulsing);
    }
    if (lblPP) {
        lblPP.textContent = SimState.pulseAnimTimer > 0 ? 'Pulsing...' : (succReady ? 'Pulse NOW!' : 'Pulse (Wait)');
    }

    if (SimState.pressActive) {
        // Firemen bale/pump out Glycolysis bog & drain overflowing Lactate puddle, but Press alone cannot cure mSLP below 55% without Pulse!
        SimState.lactatePool = Math.max(0, SimState.lactatePool - 14.0 * dt);
        SimState.pyruvatePool = Math.max(0, SimState.pyruvatePool - 8.0 * dt);
        SimState.gshReserve = Math.min(95, SimState.gshReserve + 6.0 * dt);
        if (SimState.fires.length > 0 && Math.random() < 1.8 * dt) {
            SimState.fires.pop();
        }
        if (SimState.bandits && SimState.bandits.length > 0) {
            SimState.bandits.pop();
        }
    } else if (SimState.warburgActive) {
        // Without Press conditions, Warburg floods Lactate to 100% until it overflows onto the floor!
        SimState.lactatePool = Math.min(100, (SimState.lactatePool || 0) + 12.0 * dt);
    }

    if (SimState.warburgActive) {
        // Succinate fills continuously from Wellhouse mSLP toward overflow (>= 95%)
        if (SimState.pulseAnimTimer <= 1.2) {
            SimState.succinatePool = Math.min(100, (SimState.succinatePool || 0) + 11.5 * dt);
        }
        // Spilled Succinate overflow (>= 95%) creeps Toxin Load up if not Pulsed, releasing bandits & worsening ETC scarring!
        if (SimState.succinatePool >= 95 && SimState.pulseAnimTimer <= 0) {
            SimState.toxinLoad = Math.min(100, SimState.toxinLoad + 2.6 * dt);
            const sTox = document.getElementById('sliderToxin');
            const vTox = document.getElementById('valToxin');
            if (sTox) sTox.value = Math.round(SimState.toxinLoad);
            if (vTox) vTox.textContent = `${Math.round(SimState.toxinLoad)}%`;
        }
    } else {
        SimState.succinatePool = Math.max(0, (SimState.succinatePool || 0) - 8.0 * dt);
    }

    // Acute Toxic Necrosis requires actual high Xenobiotic Toxin siege (toxinLoad >= 50%), never endogenous fasted/overfed states
    if (SimState.toxinLoad >= 50 && SimState.gshReserve <= 2 && SimState.fires.length >= 6 && SimState.etcDamage < 85 && SimState.crisisState === 'none' && !SimState.necrosisSequence && !SimState.roninRebelling) {
        SimState.necrosisSequence = { act: 'surge', timer: 0, fireTimer: 0, roofHeat: 1.0 };
        while (SimState.bandits.length < 14) {
            const idx = SimState.bandits.length;
            SimState.bandits.push({
                id: ++SimState.banditIdSeq,
                gx: 21.5 + (idx % 4) * 0.9,
                gy: 3.4 + Math.floor(idx / 4) * 0.45,
                tx: 14.3, ty: 8.1,
                roamTargetIdx: idx % 5,
                chasedBySamuraiIds: [],
                engaged: false,
                chaseTimer: 0,
                walkPhase: Math.random() * 6.28,
                necroSurge: true,
            });
        }
        spawnFloatingText(14.3, 8.6, 2.2, '☠️ ACT I: NECROTIC BANDIT SURGE & ARSON!', '#f43f5e');
    }

    if (SimState.necrosisSequence && SimState.crisisState === 'none') {
        const np = SimState.necrosisSequence;
        np.timer += dt;

        if (np.act === 'surge') {
            // Act I: Bandits surge across the village, eliminating every character and igniting fires on all structures
            const allTargets = [
                ...SimState.porters,
                ...SimState.carts,
                ...SimState.brigade,
                ...SimState.monks,
                ...SimState.ninjas,
                ...SimState.ketoneButterflies,
                ...SimState.samurai,
                ...SimState.ronin,
            ];
            if (SimState.ordainingMonk) allTargets.push(SimState.ordainingMonk);

            np.fireTimer += dt;
            if (np.fireTimer >= 0.22 && SimState.fires.length < 22) {
                np.fireTimer = 0;
                const bPick = SimState.bandits[Math.floor(Math.random() * Math.max(1, SimState.bandits.length))];
                SimState.fires.push({
                    gx: bPick ? Math.max(9.0, Math.min(31.5, bPick.gx + (Math.random() - 0.5) * 1.5)) : (10.0 + Math.random() * 18.0),
                    gy: bPick ? Math.max(5.0, Math.min(12.2, bPick.gy + (Math.random() - 0.5) * 1.2)) : (5.2 + Math.random() * 6.5),
                    intensity: 1.0,
                });
            }

            for (let i = 0; i < SimState.bandits.length; i++) {
                const b = SimState.bandits[i];
                if (allTargets.length > 0) {
                    const tgt = allTargets[i % allTargets.length];
                    b.tx = tgt.gx;
                    b.ty = tgt.gy;
                } else {
                    const d = Math.hypot(b.tx - b.gx, b.ty - b.gy);
                    if (d <= 0.35) {
                        b.tx = 10.0 + Math.random() * 18.5;
                        b.ty = 5.0 + Math.random() * 6.8;
                    }
                }
                const d = Math.hypot(b.tx - b.gx, b.ty - b.gy);
                if (d > 0.25) {
                    const ang = Math.atan2(b.ty - b.gy, b.tx - b.gx);
                    b.gx += Math.cos(ang) * 5.0 * dt;
                    b.gy += Math.sin(ang) * 5.0 * dt;
                    b.walkPhase = (b.walkPhase || 0) + dt * 11;
                }
                const strikeGroup = (arr, color) => {
                    for (let idx = arr.length - 1; idx >= 0; idx--) {
                        const ent = arr[idx];
                        if (Math.hypot(ent.gx - b.gx, ent.gy - b.gy) < 1.25) {
                            for (let k = 0; k < 6; k++) spawnParticle(ent.gx, ent.gy, 0.5, (Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 2.4, 1.6, color, 3.5, 0.55);
                            arr.splice(idx, 1);
                        }
                    }
                };
                strikeGroup(SimState.porters, '#fb923c');
                strikeGroup(SimState.carts, '#f43f5e');
                strikeGroup(SimState.brigade, '#fb923c');
                strikeGroup(SimState.monks, '#fbbf24');
                strikeGroup(SimState.ninjas, '#c084fc');
                strikeGroup(SimState.ketoneButterflies, '#f59e0b');
                strikeGroup(SimState.samurai, '#f43f5e');
                strikeGroup(SimState.ronin, '#f43f5e');
                if (SimState.ordainingMonk && Math.hypot(SimState.ordainingMonk.gx - b.gx, SimState.ordainingMonk.gy - b.gy) < 1.25) {
                    SimState.ordainingMonk = null;
                    SimState.monkOrdainPending = false;
                }
            }

            if (np.timer >= 3.4 || (allTargets.length === 0 && np.timer >= 1.8)) {
                np.act = 'breach_flee';
                np.timer = 0;
                np.bridgeBlown = false;
                np.sluiceBurst = false;
                SimState.porters = [];
                SimState.carts = [];
                SimState.brigade = [];
                SimState.monks = [];
                SimState.ninjas = [];
                SimState.ketoneButterflies = [];
                SimState.samurai = [];
                SimState.ronin = [];
                SimState.mikoCouriers = [];
                SimState.gngSpiritPulses = [];
                SimState.muscleCalmingSpirits = [];
                SimState.dockPorter = null;
                SimState.musclePorter = null;
                SimState.ordainingMonk = null;
                SimState.monkOrdainPending = false;
                for (let i = 0; i < SimState.bandits.length; i++) {
                    if (i < 6) {
                        SimState.bandits[i].tx = 7.0 + ((i % 3) - 1) * 0.45;
                        SimState.bandits[i].ty = 8.35 + (Math.floor(i / 3) - 0.5) * 0.35;
                    } else {
                        SimState.bandits[i].tx = 22.5 + (i % 3) * 0.8;
                        SimState.bandits[i].ty = 5.4 + (Math.floor(i / 3) % 2) * 0.5;
                    }
                }
                spawnFloatingText(7.0, 8.35, 2.2, '💣 ACT II: BLOWING BRIDGE & FLEEING PAST DAM WALL!', '#f43f5e');
            }
        } else if (np.act === 'breach_flee') {
            SimState.damLevel = Math.max(0, SimState.damLevel - 52 * dt);
            if (np.timer >= 1.0 && !np.bridgeBlown) {
                np.bridgeBlown = true;
                SimState.membraneDepolarized = true;
                SimState.damLevel = 0;
                for (let k = 0; k < 34; k++) {
                    const bx = 7.0 + (Math.random() - 0.5) * 2.2;
                    const by = 8.35 + (Math.random() - 0.5) * 1.2;
                    const col = k % 3 === 0 ? '#f43f5e' : (k % 3 === 1 ? '#fb923c' : '#fde047');
                    spawnParticle(bx, by, 0.6, (Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 4.5, 2.8 + Math.random() * 2.0, col, 4.8 + Math.random() * 2.5, 0.9);
                }
                for (let i = 0; i < SimState.bandits.length; i++) {
                    const b = SimState.bandits[i];
                    const laneY = 5.2 + (i % 3) * 0.28;
                    b.fleeWaypoints = [
                        { x: 24.5, y: 5.5 },
                        { x: 30.4, y: laneY },
                        { x: 35.5, y: laneY }
                    ];
                    b.fleeIdx = 0;
                    b.tx = b.fleeWaypoints[0].x;
                    b.ty = b.fleeWaypoints[0].y;
                }
                spawnFloatingText(7.0, 8.35, 2.2, '💥 BRIDGE DESTROYED — ΔΨm COLLAPSED (0 mV)!', '#fda4af');
            }
            for (let i = SimState.bandits.length - 1; i >= 0; i--) {
                const b = SimState.bandits[i];
                if (np.bridgeBlown && b.fleeWaypoints && b.fleeIdx < b.fleeWaypoints.length - 1) {
                    const dw = Math.hypot(b.tx - b.gx, b.ty - b.gy);
                    if (dw < 0.45) {
                        b.fleeIdx++;
                        b.tx = b.fleeWaypoints[b.fleeIdx].x;
                        b.ty = b.fleeWaypoints[b.fleeIdx].y;
                    }
                }
                const dist = Math.hypot(b.tx - b.gx, b.ty - b.gy);
                if (dist > 0.2) {
                    const ang = Math.atan2(b.ty - b.gy, b.tx - b.gx);
                    const spd = np.bridgeBlown ? 7.6 : 4.8;
                    b.gx += Math.cos(ang) * spd * dt;
                    b.gy += Math.sin(ang) * spd * dt;
                    b.walkPhase = (b.walkPhase || 0) + dt * 13;
                }
                if (np.bridgeBlown && b.gx >= 29.6 && !np.sluiceBurst) {
                    np.sluiceBurst = true;
                    if (typeof setSluiceGate === 'function') setSluiceGate(true);
                    else SimState.sluiceOpen = true;
                    for (let k = 0; k < 28; k++) {
                        const col = k % 3 === 0 ? '#38bdf8' : (k % 3 === 1 ? '#fb923c' : '#fde047');
                        spawnParticle(30.4 + (Math.random() - 0.5) * 1.4, 5.2 + (Math.random() - 0.5) * 0.9, 0.7, (Math.random() - 0.2) * 4.2, (Math.random() - 0.5) * 3.5, 2.5 + Math.random() * 1.8, col, 4.5 + Math.random() * 2.0, 0.85);
                    }
                    spawnFloatingText(30.4, 5.2, 2.2, '💥🌊 ONSEN SLUICE BLOWN OPEN — DAMPs SPILLING OUT!', '#fb923c');
                }
                if (np.bridgeBlown && b.gx >= 34.2) {
                    SimState.bandits.splice(i, 1);
                }
            }
            if ((np.bridgeBlown && SimState.bandits.length === 0) || np.timer >= 5.4) {
                if (!np.sluiceBurst) {
                    np.sluiceBurst = true;
                    if (typeof setSluiceGate === 'function') setSluiceGate(true);
                    else SimState.sluiceOpen = true;
                }
                SimState.bandits = [];
                np.act = 'smolder';
                np.timer = 0;
                np.roofHeat = 1.0;
                spawnFloatingText(16.0, 7.5, 2.2, '🔥 ACT III: ROOFS BLACKENED — GROUND FIRES SPREADING!', '#fb923c');
            }
        } else if (np.act === 'smolder') {
            np.roofHeat = Math.max(0, 1 - np.timer / 2.2);
            if (np.roofHeat <= 0.6) {
                SimState.villageCharred = true;
            }
            if (SimState.fires.length < 28 && Math.random() < dt * 2.5) {
                SimState.fires.push({
                    gx: 8.5 + Math.random() * 25.5,
                    gy: 5.0 + Math.random() * 8.6,
                    intensity: 1.0,
                });
            }
            if (np.timer >= 2.6) {
                np.act = 'complete';
                np.roofHeat = 0;
                SimState.villageCharred = true;
                SimState.damLevel = 0;
                setCrisisBanner('necrosis');
            }
        }
    }

    // Starvation Endpoint: Option 1 — Burn Endogenous Metabolite Baskets -> Autophagic Atrophy & Silent Brownout
    const isStarving = (SimState.preset === 'starvation' || (SimState.glucoseSupply <= 10 && SimState.fatSupply <= 10)) && !SimState.warburgActive;
    if (isStarving && SimState.crisisState === 'none' && !SimState.starvationSequence && !SimState.roninRebelling && !SimState.necrosisSequence) {
        SimState.starvationTimer = (SimState.starvationTimer || 0) + dt;
        // Actively burn Lactate & Glycerol first, then Alanine, visibly supplying emergency carts & dam energy until baskets empty!
        let burningMetabolite = false;
        if (SimState.lactatePool > 0.5) { SimState.lactatePool = Math.max(0, SimState.lactatePool - dt * 3.0); burningMetabolite = true; }
        if (SimState.glycerolPool > 0.5) { SimState.glycerolPool = Math.max(0, SimState.glycerolPool - dt * 2.5); burningMetabolite = true; }
        if (SimState.lactatePool <= 1.0 && SimState.glycerolPool <= 1.0 && SimState.alaninePool > 0.5) {
            SimState.alaninePool = Math.max(0, SimState.alaninePool - dt * 4.5);
            burningMetabolite = true;
        }
        if (burningMetabolite) {
            SimState.damLevel = Math.min(28, SimState.damLevel + dt * 5.2);
            SimState._starvCartTimer = (SimState._starvCartTimer || 0) + dt;
            if (SimState._starvCartTimer >= 1.35 && SimState.carts.length < 18) {
                SimState._starvCartTimer = 0;
                SimState.carts.push({ type: 'NADH', source: 'glucose', state: 'toBridge', gx: 4.5, gy: 11.0, targetComplex: 1, hasSack: true, acetylPopTimer: 0.45, speed: 2.3, wheelPhase: 0, headingAngle: 0 });
            }
        }
        const basketsEmpty = SimState.lactatePool <= 0.5 && SimState.glycerolPool <= 0.5 && SimState.alaninePool <= 0.5 && SimState.glycogenLevel <= 0.5;
        if (basketsEmpty && SimState.starvationTimer >= 16.0) {
            SimState.damLevel = Math.max(0, SimState.damLevel - dt * 10.0);
        }
        if (basketsEmpty && SimState.damLevel <= 15 && SimState.starvationTimer >= 16.0) {
            SimState.starvationSequence = { act: 'scavenge', timer: 0, pruneTimer: 0, tumbleweeds: [] };
            spawnFloatingText(16.0, 7.5, 2.2, '🌾 PHASE I: BASKETS EMPTY — AMPK AUTOPHAGY!', '#a8a29e');
        }
    } else if (!isStarving) {
        SimState.starvationTimer = 0;
    }

    if (SimState.starvationSequence && SimState.crisisState === 'none') {
        const st = SimState.starvationSequence;
        st.timer += dt;
        if (st.act === 'scavenge') {
            st.pruneTimer += dt;
            SimState.damLevel = Math.max(0, SimState.damLevel - 6 * dt);
            SimState.villageGreyLevel = Math.min(0.45, (st.timer / 4.5) * 0.45);
            if (st.pruneTimer >= 0.48 && (SimState.samurai.length > 3 || SimState.ronin.length > 0)) {
                st.pruneTimer = 0;
                const pruned = SimState.ronin.length > 0 ? SimState.ronin.pop() : SimState.samurai.pop();
                if (pruned) {
                    SimState.roninCount = SimState.ronin.length;
                    for (let k = 0; k < 8; k++) spawnParticle(pruned.gx, pruned.gy, 0.5, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, 1.8, k % 2 === 0 ? '#c084fc' : '#a8a29e', 3.4, 0.65);
                }
            }
            if (st.timer >= 4.5) {
                st.act = 'brownout';
                st.timer = 0;
                SimState.damLevel = 0;
                SimState.porters = [];
                SimState.carts = [];
                SimState.brigade = [];
                SimState.monks = [];
                SimState.ninjas = [];
                SimState.ketoneButterflies = [];
                SimState.samurai = [];
                SimState.ronin = [];
                SimState.bandits = [];
                SimState.mikoCouriers = [];
                SimState.gngSpiritPulses = [];
                SimState.muscleCalmingSpirits = [];
                SimState.dockPorter = null;
                SimState.musclePorter = null;
                SimState.ordainingMonk = null;
                SimState.monkOrdainPending = false;
                SimState.fires = [];
                SimState.lactatePool = 0;
                SimState.glycerolPool = 0;
                SimState.alaninePool = 0;
                st.tumbleweeds = [
                    { gx: 8.2, gy: 6.8, speed: 1.85, rot: 0, scale: 1.0 },
                    { gx: 14.5, gy: 8.6, speed: 2.15, rot: 1.7, scale: 1.15 },
                    { gx: 21.0, gy: 11.2, speed: 1.65, rot: 3.1, scale: 0.9 }
                ];
                spawnFloatingText(16.0, 7.5, 2.2, '💨 PHASE II: BIOENERGETIC BROWNOUT — SILENT SHUTDOWN', '#d6d3d1');
            }
        } else if (st.act === 'brownout') {
            SimState.damLevel = 0;
            SimState.villageGreyLevel = Math.min(1.0, 0.45 + (st.timer / 3.4) * 0.55);
            for (const tw of st.tumbleweeds) {
                tw.gx += tw.speed * dt;
                tw.rot += tw.speed * 2.4 * dt;
                if (tw.gx > 35.0) tw.gx = 7.6;
            }
            if (st.timer >= 3.8) {
                st.act = 'complete';
                SimState.villageGreyLevel = 1.0;
                setCrisisBanner('starvation');
            }
        }
    }

    const etcEfficiency = Math.max(0, 1 - (SimState.etcDamage / 100));

    // 6. SUBSTRATE CARTS, BRIDGE & VILLAGE COMPLEXES I-IV (Following Cobblestone Avenues)
    const ketDiv = SimState.ketogenesisActive ? 0.82 : 1.0;
    SimState.fatTimer += dt * (SimState.effectiveFat / 100) * BioConfig.fatToCartRatio * ketDiv * etcEfficiency;
    if (SimState.fatTimer >= 1.15 && SimState.carts.length < 28 && etcEfficiency > 0.05 && !SimState.roninRebelling && !SimState.necrosisSequence && !SimState.starvationSequence) {
        SimState.fatTimer = 0;
        SimState.carts.push({ type: 'NADH', source: 'fat', state: 'toBridge', gx: 4.5, gy: 6.2, targetComplex: 1, hasSack: true, acetylPopTimer: 0.55, speed: 2.3, wheelPhase: 0, headingAngle: 0 });
        SimState.carts.push({ type: 'FADH2', source: 'fat', state: 'toBridge', gx: 4.2, gy: 6.8, targetComplex: 2, hasSack: true, acetylPopTimer: 0.55, speed: 2.15, wheelPhase: 0, headingAngle: 0 });
    }
    SimState.glucTimer += dt * (SimState.effectiveGlucose / 100) * BioConfig.glucoseToCartRatio * etcEfficiency;
    if (SimState.glucTimer >= 0.95 && SimState.carts.length < 28 && etcEfficiency > 0.05 && !SimState.roninRebelling && !SimState.necrosisSequence && !SimState.starvationSequence) {
        SimState.glucTimer = 0;
        SimState.carts.push({ type: 'NADH', source: 'glucose', state: 'toBridge', gx: 4.5, gy: 11.0, targetComplex: 1, hasSack: true, acetylPopTimer: 0.55, speed: 2.35, wheelPhase: 0, headingAngle: 0 });
        // TCA cycle from Glucose also yields Succinate/FADH2 for Complex II
        SimState._glucTcaToggle = !SimState._glucTcaToggle;
        if (SimState._glucTcaToggle) {
            SimState.carts.push({ type: 'FADH2', source: 'glucose', state: 'toBridge', gx: 4.2, gy: 11.4, targetComplex: 2, hasSack: true, acetylPopTimer: 0.55, speed: 2.15, wheelPhase: 0, headingAngle: 0 });
        }
    }

    for (let i = SimState.carts.length - 1; i >= 0; i--) {
        const c = SimState.carts[i]; let tx = c.gx, ty = c.gy;
        if (c.acetylPopTimer > 0) c.acetylPopTimer = Math.max(0, c.acetylPopTimer - dt);
        if (c.hasSack && Math.random() < 0.18) {
            spawnParticle(c.gx, c.gy, 0.55, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, 1.1, c.type === 'NADH' ? '#38bdf8' : '#fb923c', 2.4, 0.35);
        }
        // If Beta-Oxidation is walled off (warburgActive), clear any remaining fat carts
        if (SimState.warburgActive && c.source === 'fat') {
            SimState.carts.splice(i, 1);
            continue;
        }
        if (c.state === 'toBridge') { tx = 5.15; ty = 8.15; if (Math.hypot(tx - c.gx, ty - c.gy) < 0.25) c.state = 'crossBridge'; }
        else if (c.state === 'crossBridge') { tx = 8.85; ty = 8.15; if (Math.hypot(tx - c.gx, ty - c.gy) < 0.25) c.state = (c.targetComplex === 2) ? 'toV2South' : 'toVillage'; }
        else if (c.state === 'toV2South') { tx = 9.35; ty = 12.15; if (Math.hypot(tx - c.gx, ty - c.gy) < 0.28) c.state = 'toVillage'; }
        else if (c.state === 'toVillage') {
            tx = c.targetComplex === 1 ? 10.9 : 10.8; ty = c.targetComplex === 1 ? 6.85 : 12.15;
            if (Math.hypot(tx - c.gx, ty - c.gy) < 0.3) {
                c.hasSack = false;
                if (c.targetComplex === 1) SimState.villageStock.v1 = Math.min(12, SimState.villageStock.v1 + 1);
                else SimState.villageStock.v2 = Math.min(12, SimState.villageStock.v2 + 1);
                c.state = c.targetComplex === 2 ? 'returnV2West' : 'returnBridgeEast';
            }
        }
        else if (c.state === 'returnV2West') { tx = 9.35; ty = 12.15; if (Math.hypot(tx - c.gx, ty - c.gy) < 0.28) c.state = 'returnBridgeEast'; }
        else if (c.state === 'returnBridgeEast') { tx = 8.85; ty = 8.55; if (Math.hypot(tx - c.gx, ty - c.gy) < 0.25) c.state = 'returnCrossBridge'; }
        else if (c.state === 'returnCrossBridge') { tx = 5.15; ty = 8.55; if (Math.hypot(tx - c.gx, ty - c.gy) < 0.25) c.state = 'returnYard'; }
        else if (c.state === 'returnYard') {
            tx = 4.35; ty = c.source === 'fat' ? 6.85 : 11.65;
            if (Math.hypot(tx - c.gx, ty - c.gy) < 0.35) { SimState.carts.splice(i, 1); continue; }
        }
        const ang = Math.atan2(ty - c.gy, tx - c.gx); c.headingAngle = ang;
        c.gx += Math.cos(ang) * c.speed * dt; c.gy += Math.sin(ang) * c.speed * dt;
        c.wheelPhase = (c.wheelPhase || 0) + c.speed * dt * 5.5;
    }

    const bpDrag = (SimState.damLevel > BioConfig.rosDamThreshold
        ? Math.max(0.18, 1 - ((SimState.damLevel - BioConfig.rosDamThreshold) / (100 - BioConfig.rosDamThreshold)) * 0.82)
        : 1.0) * etcEfficiency;

    // Village I (Complex I) — Halts when compensatory fermentation bogs take over (warburgActive)
    SimState.porter1Timer += dt * bpDrag;
    if (SimState.villageStock.v1 >= 1 && SimState.porter1Timer > 0.65 && etcEfficiency > 0.02 && !SimState.warburgActive && !SimState.roninRebelling && !SimState.necrosisSequence && !SimState.starvationSequence) {
        SimState.porter1Timer = 0; SimState.villageStock.v1--;
        SimState.pumpSpinTimers.v1 = 0.85;
        SimState.damLevel = Math.min(100, SimState.damLevel + BioConfig.pumpProtons.complexI * 0.65 * etcEfficiency);
        for (let p = 0; p < 4; p++) spawnPipePulse(12.05, 5.15, 0.85, 12.05, 3.35, 2.35, 0.42 + p * 0.08);
        for (let s = 0; s < 4; s++) spawnParticle(12.05, 3.35, 2.35, (Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 0.8, 1.4, '#38bdf8', 3.0, 0.45);
        SimState.porters.push({
            type: 'CoQ', cargo: 'flour', from: 1,
            gx: 10.9, gy: 6.85,
            waypoints: [{ x: 12.75, y: 6.85 }, { x: 15.65, y: 6.85 }, { x: 17.3, y: 6.85 }],
            wpIndex: 0, tx: 12.75, ty: 6.85,
            stumbled: false, stumbleTimer: 0, walkPhase: Math.random() * 6
        });
    }

    // Village II (Complex II) — throttled by CoQ pool back-pressure when Dam > 72% or V3 backed up
    const v2BackPressure = (SimState.damLevel > 72 || SimState.villageStock.v3 >= 4)
        ? Math.max(0.14, Math.min(bpDrag, 1 - Math.max(0, SimState.damLevel - 70) * 0.032))
        : 1.0;
    SimState.porter2Timer += dt * etcEfficiency * v2BackPressure;
    if (SimState.villageStock.v2 >= 1 && SimState.porter2Timer > 0.95 && etcEfficiency > 0.02 && !SimState.warburgActive && !SimState.roninRebelling && !SimState.necrosisSequence && !SimState.starvationSequence) {
        SimState.porter2Timer = 0; SimState.villageStock.v2--;
        SimState.porters.push({
            type: 'CoQ', cargo: 'flour', from: 2,
            gx: 10.8, gy: 12.15,
            waypoints: [{ x: 12.75, y: 12.15 }, { x: 12.75, y: 9.35 }, { x: 15.65, y: 9.35 }, { x: 15.65, y: 6.85 }, { x: 17.3, y: 6.85 }],
            wpIndex: 0, tx: 12.75, ty: 12.15,
            stumbled: false, stumbleTimer: 0, walkPhase: Math.random() * 6
        });
    }

    // Village III (Complex III)
    SimState.porter3Timer += dt * bpDrag;
    if (SimState.villageStock.v3 >= 1 && SimState.porter3Timer > 0.55 && etcEfficiency > 0.02 && !SimState.warburgActive && !SimState.roninRebelling && !SimState.necrosisSequence && !SimState.starvationSequence) {
        SimState.porter3Timer = 0; SimState.villageStock.v3--;
        SimState.pumpSpinTimers.v3 = 0.58;
        SimState.damLevel = Math.min(100, SimState.damLevel + BioConfig.pumpProtons.complexIII * 0.65 * etcEfficiency);
        for (let p = 0; p < 4; p++) spawnPipePulse(18.45, 5.25, 0.85, 18.45, 3.35, 2.35, 0.42 + p * 0.08);
        SimState.porters.push({
            type: 'CytC', cargo: 'mochi', from: 3,
            gx: 17.3, gy: 6.85,
            waypoints: [
                { x: 19.65, y: 6.85 },
                { x: 19.65, y: 11.65 },
                { x: 22.1, y: 11.65 }
            ],
            wpIndex: 0, tx: 19.65, ty: 6.85,
            stumbled: false, stumbleTimer: 0, walkPhase: Math.random() * 6
        });
    }

    // Village IV (Complex IV: Paired 2x2 Kiln-Press Clamping & H2O Launch Sequence)
    const press = SimState.village4Press;
    if (!press.cyclePhase) press.cyclePhase = 'idle';
    if (press.slamAnim > 0) press.slamAnim = Math.max(0, press.slamAnim - dt * 2.5);

    if (press.cyclePhase === 'idle') {
        if (SimState.villageStock.v4 >= 1 && press.ballsCount < 4 && !press.overheated && etcEfficiency > 0.02 && !SimState.warburgActive) {
            SimState.villageStock.v4--;
            press.ballsCount++;
            press.timer = 0;
            if (press.ballsCount === 4) {
                // All 4 Mochi buns deposited in time -> trigger 2-sided kiln snap-shut animation!
                press.cyclePhase = 'clamping';
                press.cycleTimer = 0;
                press.slamAnim = 1.0;
            }
        }

        if (press.ballsCount > 0 && press.ballsCount < 4) {
            press.timer += dt;
            if (press.timer > 3.2) {
                const trappedBalls = press.ballsCount;
                press.overheated = true;
                press.ballsCount = 0;
                press.timer = 0;
                // Partial O2 reduction at Complex IV (1-3 e-) leaks Hydroxyl Radicals (•OH): larger ROS fire + cardiolipin/heme scar + GSH hit!
                if (SimState.fires.length < 10) {
                    SimState.fires.push({ gx: 22.10, gy: 11.55, intensity: 1.75, isHydroxyl: true });
                }
                if (trappedBalls >= 2 && SimState.fires.length < 10) {
                    SimState.fires.push({ gx: 21.15, gy: 11.65, intensity: 1.45, isHydroxyl: true });
                }
                SimState.etcDamage = Math.min(100, (SimState.etcDamage || 0) + 1.5);
                SimState.gshReserve = Math.max(0, (SimState.gshReserve || 0) - 3.5);
                spawnFloatingText(22.12, 11.2, 1.5, '💥 ⋅OH Radical Leak! (Complex IV)', '#f43f5e');
                for (let s = 0; s < 16; s++) {
                    spawnParticle(22.12, 11.64, 0.6, (Math.random() - 0.5) * 3.2, (Math.random() - 0.5) * 3.2, 2.4, s % 2 === 0 ? '#c084fc' : '#f43f5e', 4.5, 0.85);
                }
                setTimeout(() => { SimState.village4Press.overheated = false; }, 1400);
            }
        }
    } else {
        press.cycleTimer = (press.cycleTimer || 0) + dt;
        if (press.cyclePhase === 'clamping' && press.cycleTimer >= 0.24) {
            // The 2 sides of the kiln have snapped shut around the 4 buns & O2!
            press.cyclePhase = 'sealed';
            SimState.pumpSpinTimers.v4 = 0.75;
            SimState.damLevel = Math.min(100, SimState.damLevel + BioConfig.pumpProtons.complexIV * 0.75 * etcEfficiency);
            for (let p = 0; p < 2; p++) spawnPipePulse(23.25, 9.85, 0.85, 23.25, 3.35, 2.35, 0.48 + p * 0.1);
            for (let s = 0; s < 10; s++) {
                spawnParticle(22.12, 11.64, 0.62, (Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.8, 1.6, s % 2 === 0 ? '#38bdf8' : '#facc15', 3.4, 0.45);
            }
        } else if (press.cyclePhase === 'sealed' && press.cycleTimer >= 0.52) {
            // Kiln sides snap open -> fling newly formed H2O water molecules into the Southern River!
            press.cyclePhase = 'opening';
            press.ballsCount = 0;
            press.timer = 0;
            for (let s = 0; s < 8; s++) {
                spawnParticle(22.12, 11.64, 0.68, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 1.9, '#e0f2fe', 3.8, 0.5);
            }
            SimState.thrownBales.push({
                startX: 22.12, startY: 11.64, startZ: 0.62,
                endX: 22.05 + (Math.random() - 0.5) * 0.35,
                endY: 14.08 + (Math.random() - 0.5) * 0.25,
                endZ: 0.05, progress: 0, duration: 0.72, spinOffset: 0, label: '💧 H₂O'
            });
            SimState.thrownBales.push({
                startX: 22.24, startY: 11.64, startZ: 0.62,
                endX: 22.58 + (Math.random() - 0.5) * 0.35,
                endY: 14.22 + (Math.random() - 0.5) * 0.25,
                endZ: 0.05, progress: 0, duration: 0.78, spinOffset: 1.2, label: '💧 H₂O'
            });
        } else if (press.cyclePhase === 'opening' && press.cycleTimer >= 0.85) {
            press.cyclePhase = 'idle';
            press.cycleTimer = 0;
        }
    }

    for (let i = SimState.thrownBales.length - 1; i >= 0; i--) {
        const tb = SimState.thrownBales[i];
        tb.progress += dt / tb.duration;
        if (tb.progress >= 1) {
            SimState.ripples.push({ gx: tb.endX, gy: tb.endY, radius: 0.15, alpha: 1.0, showH2OText: true, text: tb.label || '💧 H₂O' });
            for (let s = 0; s < 6; s++) {
                spawnParticle(tb.endX, tb.endY, 0.1, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4, 1.4, '#7dd3fc', 3.2, 0.55);
            }
            SimState.thrownBales.splice(i, 1);
        }
    }

    for (const k of ['v1', 'v3', 'v4']) {
        if (SimState.pumpSpinTimers[k] > 0 && etcEfficiency > 0.02) {
            SimState.pumpSpinTimers[k] = Math.max(0, SimState.pumpSpinTimers[k] - dt);
            SimState.pumpAngles[k] += dt * 6.2 * bpDrag;
        }
    }

    for (let i = SimState.porters.length - 1; i >= 0; i--) {
        const p = SimState.porters[i];
        // When Warburg fermentation is active, remaining Complex porters relocate to the Wellhouse mSLP bog!
        if (SimState.warburgActive) {
            const arrivedBonfire = window.stepAlongVillagePath(p, 14.3, 8.95, 3.2, dt, 0.45);
            if (arrivedBonfire) {
                SimState.porters.splice(i, 1);
            }
            continue;
        }

        const dist = Math.hypot(p.tx - p.gx, p.ty - p.gy);

        if (p.type === 'CoQ' && SimState.damLevel > BioConfig.rosDamThreshold && SimState.fires.length < 10) {
            const leakProb = ((SimState.damLevel - BioConfig.rosDamThreshold) / 18) * 0.45 * dt;
            if (Math.random() < leakProb) {
                SimState.fires.push({ gx: p.gx, gy: p.gy, intensity: 1.0 });
                SimState.porters.splice(i, 1);
                continue;
            }
        }

        if (dist < 0.25) {
            p.wpIndex++;
            if (p.wpIndex < p.waypoints.length) {
                p.tx = p.waypoints[p.wpIndex].x;
                p.ty = p.waypoints[p.wpIndex].y;
            } else {
                if (p.type === 'CoQ') SimState.villageStock.v3 = Math.min(14, SimState.villageStock.v3 + 1);
                else SimState.villageStock.v4 = Math.min(14, SimState.villageStock.v4 + 1);
                SimState.porters.splice(i, 1);
                continue;
            }
        } else {
            const speed = p.type === 'CytC' ? 3.5 * Math.max(0.25, etcEfficiency) : 2.5 * Math.max(0.25, bpDrag);
            const ang = Math.atan2(p.ty - p.gy, p.tx - p.gx);
            p.gx += Math.cos(ang) * speed * dt;
            p.gy += Math.sin(ang) * speed * dt;
            p.walkPhase = (p.walkPhase || 0) + speed * dt * 6.0;
        }
    }

    // F-09: Complex I Back-Pressure -> Wheel Turns Red, Runs in Reverse & Spills a Bale onto the Floor into Flames!
    if (SimState.c1SpillAnim > 0) SimState.c1SpillAnim = Math.max(0, SimState.c1SpillAnim - dt);
    if (SimState.villageStock.v1 >= 2 && SimState.damLevel >= 78 && !SimState.warburgActive) {
        SimState.c1ReverseSlip = true;
        SimState.pumpAngles.v1 -= dt * 3.8; // Visually spins backward under ΔΨm back-pressure!
        SimState.v1StallTimer = (SimState.v1StallTimer || 0) + dt * (0.75 + (SimState.damLevel - 78) * 0.05);
        if (SimState.v1StallTimer >= 2.8 && SimState.fires.length < 10) {
            SimState.v1StallTimer = 0;
            SimState.c1SpillAnim = 0.85;
            SimState.villageStock.v1 = Math.max(0, SimState.villageStock.v1 - 1);
            SimState.fires.push({ gx: 10.85 + (Math.random() - 0.5) * 0.4, gy: 6.55 + (Math.random() - 0.5) * 0.25, intensity: 1.40, isComplex1Leak: true });
            spawnFloatingText(10.9, 5.8, 1.5, '🔥 Complex I Reversed → Bale Spilled & Ignited!', '#ef4444');
            for (let k = 0; k < 12; k++) {
                spawnParticle(10.85, 6.55, 0.55, (Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 2.0, 1.8, '#ef4444', 3.6, 0.65);
            }
        }
    } else {
        SimState.c1ReverseSlip = false;
        SimState.v1StallTimer = Math.max(0, (SimState.v1StallTimer || 0) - dt * 1.5);
    }

    // F-09: Complex II -> Complex I Reverse Electron Transport (RET-ROS) & Adaptive ROS Feedback Loop
    if (SimState.retArcTimer > 0) SimState.retArcTimer = Math.max(0, SimState.retArcTimer - dt);
    if (SimState.retCooldown > 0) SimState.retCooldown = Math.max(0, SimState.retCooldown - dt);
    if (SimState.villageStock.v2 >= 4 && SimState.damLevel >= 74 && SimState.retCooldown <= 0 && !SimState.warburgActive) {
        SimState.retArcTimer = 1.65;
        SimState.retCooldown = 5.5;
        SimState.villageStock.v2 = Math.max(0, SimState.villageStock.v2 - 2);
        if (SimState.fires.length < 8) {
            SimState.fires.push({ gx: 10.9, gy: 6.25, intensity: 1.25, isRetRos: true });
        }
        spawnFloatingText(10.85, 8.6, 1.45, '⚡ RET-ROS (II → I): High ΔΨm Feedback!', '#fbbf24');
        for (let k = 0; k < 10; k++) {
            spawnParticle(10.9, 6.25, 0.5, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, 1.6, '#f59e0b', 3.4, 0.6);
        }
    }

    // High ROS automatically cracks open the Onsen UCP1 Sluice Gate briefly (partial relief, insufficient for extreme glucose overload!)
    if (SimState.rosSluiceCooldown > 0) SimState.rosSluiceCooldown = Math.max(0, SimState.rosSluiceCooldown - dt);
    if (SimState.fires.length >= 3 && SimState.damLevel >= 80 && !SimState.sluiceOpen && SimState.rosSluiceCooldown <= 0 && !SimState.cellDead) {
        if (typeof setSluiceGate === 'function') setSluiceGate(true);
        else SimState.sluiceOpen = true;
        SimState.rosSluiceTimer = 2.2;
        SimState.rosSluiceCooldown = 5.5;
        spawnFloatingText(29.5, 4.0, 1.85, '🔓 High ROS → UCP1 Sluice Cracked!', '#38bdf8');
    } else if (SimState.rosSluiceTimer > 0) {
        SimState.rosSluiceTimer = Math.max(0, SimState.rosSluiceTimer - dt);
        if ((SimState.rosSluiceTimer <= 0 || SimState.damLevel <= 74) && SimState.sluiceOpen) {
            SimState.rosSluiceTimer = 0;
            if (typeof setSluiceGate === 'function') setSluiceGate(false);
            else SimState.sluiceOpen = false;
        }
    }

    // GSH Wellhouse recharge (with Nrf2 hormetic boost at moderate 1-3 ROS fires) & automated bucket brigade firefighting
    const mtorGshDrag = SimState.mtorActive ? 0.48 : 1.0;
    SimState.nrf2BoostActive = (SimState.fires.length >= 1 && SimState.fires.length <= 3 && SimState.gshReserve > 25 && SimState.toxinLoad < 40);
    const nrf2Mult = SimState.nrf2BoostActive ? 1.35 : 1.0;
    SimState.gshReserve = Math.min(100, SimState.gshReserve + (SimState.antioxSynthesis / 100) * 9.5 * mtorGshDrag * nrf2Mult * dt);
    SimState.rosLevel = Math.min(100, Math.round(SimState.fires.length * 12 + (SimState.village4Press.overheated ? 25 : 0) + SimState.misfoldedBeams * 4));

    SimState.brigadeSpawnTimer += dt * mtorGshDrag;
    if (SimState.fires.length > 0 && SimState.brigade.length < Math.min(4, SimState.fires.length) && SimState.gshReserve >= BioConfig.gshCostPerFire && SimState.brigadeSpawnTimer > 0.55 && !SimState.roninRebelling && !SimState.necrosisSequence && !SimState.starvationSequence) {
        SimState.brigadeSpawnTimer = 0;
        SimState.gshReserve = Math.max(0, SimState.gshReserve - BioConfig.gshCostPerFire);
        SimState.brigade.push({ gx: 14.3, gy: 9.25, hasWater: true, walkPhase: 0, facingDir: 1, douseTimer: 0 });
    }

    for (let i = SimState.brigade.length - 1; i >= 0; i--) {
        const b = SimState.brigade[i];
        const prevGx = b.gx;
        if (b.douseTimer > 0) {
            b.douseTimer = Math.max(0, b.douseTimer - dt);
            b.walkPhase = (b.walkPhase || 0) + dt * 10.0;
            if (b.douseTimer <= 0) {
                b.hasWater = false;
                b._path = null;
            }
            continue;
        }
        if (!b.hasWater || SimState.fires.length === 0) {
            const arrivedHome = window.stepAlongVillagePath(b, 14.3, 9.25, 1.75, dt, 0.35);
            b.walkPhase = (b.walkPhase || 0) + dt * 7.2;
            if (Math.abs(b.gx - prevGx) > 0.002) b.facingDir = b.gx >= prevGx ? 1 : -1;
            if (arrivedHome) { SimState.brigade.splice(i, 1); }
            continue;
        }
        let nearestIdx = 0; let minDist = Infinity;
        for (let fIdx = 0; fIdx < SimState.fires.length; fIdx++) {
            const d = Math.hypot(SimState.fires[fIdx].gx - b.gx, SimState.fires[fIdx].gy - b.gy);
            if (d < minDist) { minDist = d; nearestIdx = fIdx; }
        }
        const targetFire = SimState.fires[nearestIdx];
        const arrivedFire = window.stepAlongVillagePath(b, targetFire.gx, targetFire.gy, 1.95, dt, 0.44);
        b.walkPhase = (b.walkPhase || 0) + dt * 8.0;
        if (Math.abs(b.gx - prevGx) > 0.002) b.facingDir = b.gx >= prevGx ? 1 : -1;
        if (arrivedFire || minDist < 0.44) {
            for (let w = 0; w < 10; w++) spawnParticle(targetFire.gx, targetFire.gy, 0.3, (Math.random() - 0.5) * 1.7, (Math.random() - 0.5) * 1.7, 1.5, '#22d3ee', 3.6, 0.6);
            SimState.fires.splice(nearestIdx, 1);
            b.douseTimer = 0.65;
        }
    }

    // 7. 20-SAMURAI GARRISON, PURSUIT RELAY & ADENYLATE KINASE SALVAGE (Sections 3.2 & 3.3)
    if (SimState.samurai.length === 0 && !SimState.cellDead && !SimState.roninRebelling && !SimState.necrosisSequence && SimState.crisisState !== 'necrosis' && !SimState.starvationSequence && SimState.crisisState !== 'starvation') {
        initSamuraiGarrison();
    }

    const GATE_X = 25.55;
    const SLOT_0_Y = 6.72;
    const SLOT_SPACING = 0.31;

    let atpCount = 0;
    let ampCount = 0;
    // Slowed Dojo Koku burn rate (ATP -> ADP) at normal demand, with steep superlinear surge at high workload (>65%)
    const baseBurn = Math.pow(SimState.samuraiDemand / 100, 1.35) * 0.125;
    const highDemandSurge = SimState.samuraiDemand > 65 ? Math.pow((SimState.samuraiDemand - 65) / 35, 1.35) * 0.29 : 0;
    const burnRate = baseBurn + highDemandSurge;

    for (let i = 0; i < SimState.samurai.length; i++) {
        const s = SimState.samurai[i];
        if (s.isRonin) continue;

        if (s.state === 'consumingKoku') {
            // "Asterix Magic Potion" ritual: Samurai physically takes/drinks the gifted Koku energy before chasing!
            // This gives invading Bandits ~2.2s to move past the entrance deep into the village plazas so they must be chased.
            s._kokuWaypoints = null;
            atpCount++;
            s.consumeTimer = (s.consumeTimer || 0) - dt;
            s.sparPhase = (s.sparPhase || 0) + dt * 12.0;
            s.walkPhase = 0;
            if (Math.random() < 0.55) {
                spawnParticle(s.gx, s.gy, 0.65, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2, 1.6, Math.random() < 0.5 ? '#facc15' : '#fef08a', 3.0, 0.42);
            }
            if (s.consumeTimer <= 0) {
                let targetBandit = SimState.bandits.find(b => b.id === s.targetBanditId);
                if (!targetBandit) {
                    targetBandit = SimState.bandits.find(b => b.gy > 5.0 && b.chasedBySamuraiIds.length < 1) || SimState.bandits[0];
                }
                if (targetBandit) {
                    s.targetBanditId = targetBandit.id;
                    if (!targetBandit.chasedBySamuraiIds.includes(s.id)) {
                        targetBandit.chasedBySamuraiIds.push(s.id);
                    }
                    s.state = 'chasingBandit';
                    s._path = null;
                    for (let k = 0; k < 10; k++) {
                        spawnParticle(s.gx, s.gy, 0.7, (Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 2.0, 1.8, '#fde047', 3.5, 0.55);
                    }
                    spawnFloatingText(s.gx, s.gy, 1.3, '⚡ Koku Charged! Chasing!', '#fef08a');
                } else {
                    s.targetBanditId = null;
                    s.state = 'toTrainingYard';
                    s._kokuWaypoints = null;
                }
            }
        } else if (s.state === 'chasingBandit') {
            s._kokuWaypoints = null;
            atpCount++;
            const targetBandit = SimState.bandits.find(b => b.id === s.targetBanditId);
            if (!targetBandit) {
                const nextBandit = SimState.bandits.find(b => b.gy > 5.0 && b.chasedBySamuraiIds.length < 1);
                if (nextBandit && s.kokuEnergy > 0.15) {
                    s.targetBanditId = nextBandit.id;
                    nextBandit.chasedBySamuraiIds.push(s.id);
                } else {
                    s.targetBanditId = null;
                    s.state = s.kokuEnergy > 0.08 ? 'toTrainingYard' : 'approaching';
                    if (s.state === 'approaching') {
                        s.hasKoku = false;
                        s.kokuEnergy = 0;
                        s.queueJoinSeq = ++SimState.samuraiQueueSeq;
                    }
                }
                continue;
            }

            // Tuned Pursuit Koku Burn Rate (scaled proportionally to slower pursuit speed so Samurai stay engaged longer)
            const pursuitBurn = 0.11 + 0.18 * burnRate;
            s.kokuEnergy -= pursuitBurn * dt;
            if (s.kokuEnergy <= 0.02) {
                s.kokuEnergy = 0;
                s.hasKoku = false;
                s.targetBanditId = null;
                s.state = 'approaching';
                s.queueJoinSeq = ++SimState.samuraiQueueSeq;
                s.waitTimer = 0;
                s.exchangeProgress = 0;
                continue;
            }

            const dist = Math.hypot(targetBandit.gx - s.gx, targetBandit.gy - s.gy);
            if (!Number.isFinite(dist)) {
                // NaN/Infinity coordinates — reset Samurai to Castle queue to prevent freeze
                s.targetBanditId = null;
                s.state = 'approaching';
                s.hasKoku = false;
                s.kokuEnergy = 0;
                s.queueJoinSeq = ++SimState.samuraiQueueSeq;
                continue;
            }
            if (dist > 0.58) {
                s.isEngagedSparring = false;
                const chaseSpeed = 2.10;
                // If starting inside the fenced Dojo courtyard, exit cleanly via West Dojo Gate first
                if (s.gx > 28.05 && s.gy > 9.35) {
                    const exitAng = Math.atan2(11.15 - s.gy, 27.75 - s.gx);
                    s.headingAngle = exitAng;
                    s.facingDir = Math.cos(exitAng - Math.PI / 4) >= 0 ? 1 : -1;
                    s.gx += Math.cos(exitAng) * chaseSpeed * dt;
                    s.gy += Math.sin(exitAng) * chaseSpeed * dt;
                    s.walkPhase = (s.walkPhase || 0) + chaseSpeed * dt * 5.2;
                    s._path = null;
                } else if (dist <= 4.5) {
                    // Direct smooth intercept when within 4.5 tiles of the Bandit
                    const ang = Math.atan2(targetBandit.gy - s.gy, targetBandit.gx - s.gx);
                    s.headingAngle = ang;
                    s.facingDir = Math.cos(ang - Math.PI / 4) >= 0 ? 1 : -1;
                    s.gx += Math.cos(ang) * chaseSpeed * dt;
                    s.gy += Math.sin(ang) * chaseSpeed * dt;
                    s.walkPhase = (s.walkPhase || 0) + chaseSpeed * dt * 5.2;
                } else {
                    window.stepAlongVillagePath(s, targetBandit.gx, targetBandit.gy, chaseSpeed, dt, 0.55);
                }
            } else {
                s.isEngagedSparring = true;
                s.sparPhase = (s.sparPhase || 0) + dt * 9.5;
            }
        } else if (s.state === 'toWellhouseAMP') {
            s._kokuWaypoints = null;
            ampCount++;
            const wx = 14.3, wy = 9.25;
            const arrivedWell = window.stepAlongVillagePath(s, wx, wy, 1.95, dt, 0.42);
            if (arrivedWell) {
                // Ring Wellhouse Bronze Alarm Bell -> pause 2.10s at Bell, shut down mTOR & dispatch emergency AMPK Ninja!
                SimState.wellhouseAlarmTimer = 2.25;
                SimState.mtorActive = false;
                SimState.ampkActive = true;
                SimState.crisisTimer = Math.max(0, SimState.crisisTimer - 0.6);
                const targetType = SimState.sluiceOpen ? 'sluice'
                    : (SimState.insulinResistance > 0.35 && SimState.glut4ForcedOpenTimer <= 0 ? 'glut4'
                        : (SimState.shrineScaffolding > 35 ? 'autophagy'
                            : (SimState.glucoseSupply <= 30 ? 'fat' : 'glucose')));
                const targetCoords = targetType === 'sluice' ? { x: 29.5, y: 4.5 }
                    : (targetType === 'glut4' ? { x: 1.5, y: 11.0 }
                        : (targetType === 'autophagy' ? { x: 17.3, y: 11.85 }
                            : (targetType === 'fat' ? { x: 4.5, y: 6.2 } : { x: 4.5, y: 11.0 })));
                SimState.ninjas.push({
                    targetType,
                    gx: 14.3,
                    gy: 9.25,
                    tx: targetCoords.x,
                    ty: targetCoords.y,
                    workTimer: 0,
                    returning: false,
                    walkPhase: 0
                });
                for (let p = 0; p < 12; p++) {
                    spawnParticle(14.3, 8.6, 0.8, (Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 2.0, 1.6, p % 2 === 0 ? '#22d3ee' : '#c084fc', 3.8, 0.6);
                }
                spawnFloatingText(14.3, 8.6, 1.5, '🔔 AMP Alarm → AMPK Ninja!', '#22d3ee');
                s.state = 'ringingWellhouseBell';
                s.bellTimer = 2.10;
                s.walkPhase = 0;
            }
        } else if (s.state === 'ringingWellhouseBell') {
            ampCount++;
            s.bellTimer = (s.bellTimer || 0) - dt;
            s.walkPhase = (s.walkPhase || 0) + dt * 7.5;
            if (s.bellTimer <= 0) {
                // Walk back across the village in 'recoveringAMP' first so this far-away Samurai
                // NEVER claims Slot 0 (q === 0) or blocks the Castle Gate while still in transit!
                s.state = 'recoveringAMP';
                s.isRecoveringAMP = true;
                s.hasKoku = false;
                s.kokuEnergy = 0;
                s._path = null;
                s.waitTimer = 0;
            }
        } else if (s.state === 'recoveringAMP') {
            ampCount++;
            s.isRecoveringAMP = true;
            const arrivedQueueTail = window.stepAlongVillagePath(s, 25.55, 9.25, 0.95, dt, 0.45);
            if (arrivedQueueTail || s.gx >= 24.6) {
                s.state = 'approaching';
                s.isRecoveringAMP = false;
                s.queueJoinSeq = ++SimState.samuraiQueueSeq;
                s.waitTimer = 0;
                s.exchangeProgress = 0;
            }
        } else if (s.state === 'toCalligraphy') {
            atpCount++;
            s.stepPhase += dt * 7.5;
            // Walk straight south from Castle along gx=25.55 to the suspended Shodo Pavilion overhanging the river (25.55, 12.85)
            const arrivedPavilion = window.stepAlongVillagePath(s, 25.55, 12.85, 1.95, dt, 0.40);
            if (arrivedPavilion) {
                // Donate Koku to power Hepatic GNG and begin 2.5s Shodo Calligraphy ritual!
                s.state = 'calligraphy';
                s.calligraphyTimer = 2.5;
                s.hasKoku = false;
                s.kokuEnergy = 0;
                SimState.gngEnergyCredit = Math.min(10, SimState.gngEnergyCredit + 5.5);
                SimState.gngNeedsKoku = false;
                if (SimState.gngSpiritPulses) {
                    SimState.gngSpiritPulses.push({ gx: 25.55, gy: 13.15, gz: 0.45, progress: 0 });
                }
                if (SimState.ripples) {
                    SimState.ripples.push({ gx: 25.55, gy: 13.25, radius: 0.3, alpha: 0.95 });
                }
                spawnFloatingText(25.55, 12.85, 1.55, '🖌️ Koku → GNG! (Shodo)', '#fde047');
                for (let k = 0; k < 8; k++) {
                    spawnParticle(25.55, 12.85, 0.85, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4, 1.4, '#facc15', 3.2, 0.6);
                }
            }
        } else if (s.state === 'calligraphy') {
            // Samurai has donated Koku (now ADP) and spends 2.5s practicing Shodo before returning to Castle queue
            s.calligraphyTimer = Math.max(0, (s.calligraphyTimer || 0) - dt);
            s.sparPhase += dt * 4.5;
            if (s.calligraphyTimer <= 0) {
                s.state = 'approaching';
                s.isRecoveringAMP = false;
                s.queueJoinSeq = ++SimState.samuraiQueueSeq;
                s.waitTimer = 0;
                s.exchangeProgress = 0;
                s._path = null;
            }
        } else if (s.state === 'toTrainingYard') {
            atpCount++;
            s.isEngagedSparring = false;
            // Smooth, wide East Koku Return Promenade clear of Castle walls (via North Dojo Torii Gate)
            if (!s._kokuWaypoints || s._kokuWaypoints.length === 0) {
                if (s.gx >= 24.5 && s.gy <= 7.8) {
                    s._kokuWaypoints = [
                        { x: 26.35, y: 7.45 },
                        { x: 27.65, y: 7.85 },
                        { x: 29.05, y: 8.25 },
                        { x: 30.25, y: 8.75 },
                        { x: 30.65, y: 9.48 },
                        { x: s.yardX, y: s.yardY }
                    ];
                } else {
                    const roadToPromenade = window.findVillagePath(s.gx, s.gy, 27.65, 7.85);
                    s._kokuWaypoints = [
                        ...roadToPromenade,
                        { x: 29.05, y: 8.25 },
                        { x: 30.25, y: 8.75 },
                        { x: 30.65, y: 9.48 },
                        { x: s.yardX, y: s.yardY }
                    ];
                }
                s._kokuWpIdx = 0;
            }

            const wp = s._kokuWaypoints[s._kokuWpIdx];
            const distWp = Math.hypot(wp.x - s.gx, wp.y - s.gy);
            const speed = 1.75;
            if (distWp <= Math.max(0.18, speed * dt * 1.1)) {
                s._kokuWpIdx++;
                if (s._kokuWpIdx >= s._kokuWaypoints.length) {
                    s.gx = s.yardX;
                    s.gy = s.yardY;
                    s._kokuWaypoints = null;
                    s.state = 'training';
                    continue;
                }
            }
            const curWp = s._kokuWaypoints[Math.min(s._kokuWpIdx, s._kokuWaypoints.length - 1)];
            const ang = Math.atan2(curWp.y - s.gy, curWp.x - s.gx);
            s.headingAngle = ang;
            s.facingDir = Math.cos(ang - Math.PI / 4) >= 0 ? 1 : -1;
            s.gx += Math.cos(ang) * speed * dt;
            s.gy += Math.sin(ang) * speed * dt;
            s.walkPhase = (s.walkPhase || 0) + speed * dt * 5.2;
        } else if (s.state === 'training') {
            atpCount++;
            s.walkPhase = 0;
            const prevPhase = s.sparPhase || 0;
            s.sparPhase = prevPhase + dt * (1.4 + (SimState.samuraiDemand / 100) * 6.5);
            if (s.facingDir === 1 && Math.floor(prevPhase / Math.PI) !== Math.floor(s.sparPhase / Math.PI) && Math.random() < 0.45) {
                const sparkCol = SimState.crisisState === 'warburg' ? '#39ff14' : '#fde047';
                spawnParticle(s.gx + 0.16, s.gy + 0.08, 0.55, (Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 1.1, 1.1, sparkCol, 2.4, 0.32);
            }
            s.kokuEnergy -= burnRate * dt;

            if (s.kokuEnergy <= 0) {
                s.kokuEnergy = 0;
                s.hasKoku = false;
                s.state = 'approaching';
                s.queueJoinSeq = ++SimState.samuraiQueueSeq;
                s.waitTimer = 0;
                s.exchangeProgress = 0;
                s._exitDojoStage = 0;
            }
        }
    }

    // Castle ADP Queue Management & Adenylate Kinase Salvage (2 ADP -> ATP + AMP)
    if ((SimState.wellhouseAlarmTimer || 0) > 0) {
        SimState.wellhouseAlarmTimer = Math.max(0, SimState.wellhouseAlarmTimer - dt);
    }
    if ((SimState.akTradeFlashTimer || 0) > 0) {
        SimState.akTradeFlashTimer = Math.max(0, SimState.akTradeFlashTimer - dt);
    }

    let activeQueue = SimState.samurai
        .filter(s => !s.isRonin && (s.state === 'approaching' || s.state === 'queued' || s.state === 'receiving'))
        .sort((a, b) => (a.queueJoinSeq || 0) - (b.queueJoinSeq || 0));

    // Only Samurai physically lined up along the West Castle Queue Avenue (gx: 23.0..26.1, gy <= 10.8)
    // count as waiting at the Castle Gate (excluding Samurai still exiting the Dojo courtyard or walking along the south path)
    const queueAtCastle = activeQueue.filter(s => !s.isRecoveringAMP && s.gx >= 23.0 && s.gx <= 26.1 && s.gy <= 10.8);

    SimState.akCooldown = Math.max(0, SimState.akCooldown - dt);
    // Thermodynamic product inhibition: 2ADP <-> ATP + AMP saturates once AMP pool >= 3
    const akTriggerStress = SimState.ampCount < 3 && ((queueAtCastle.length > 4 && SimState.bandits.length > 0) || (queueAtCastle.length > 7));
    if (akTriggerStress && SimState.akCooldown <= 0 && queueAtCastle.length >= 2) {
        SimState.akCooldown = 2.4;
        SimState.akTradeFlashTimer = 0.65;
        SimState.crisisTimer = Math.max(0, SimState.crisisTimer - 0.8);
        const recipient = queueAtCastle[0];
        const donor = queueAtCastle[1];
        SimState.akTradePos = { gx: recipient.gx, gy: recipient.gy };

        recipient.hasKoku = true;
        recipient.kokuEnergy = 1.0;
        recipient.waitTimer = 0;
        recipient.exchangeProgress = 0;
        recipient.isRecoveringAMP = false;
        const targetB = SimState.bandits.find(b => b.gy > 5.0 && b.chasedBySamuraiIds.length < 1) || SimState.bandits[0];
        if (targetB) {
            // Step slightly aside from the queue & physically "take" the gifted Koku like Asterix drinking the magic potion (2.85s)!
            recipient.gx = 24.85;
            recipient.gy = 6.55;
            recipient.state = 'consumingKoku';
            recipient.consumeTimer = 2.85;
            recipient.consumeDuration = 2.85;
            recipient.targetBanditId = targetB.id;
            recipient._path = null;
            if (!targetB.chasedBySamuraiIds.includes(recipient.id)) {
                targetB.chasedBySamuraiIds.push(recipient.id);
            }
        } else {
            const calligraphyBusy = SimState.samurai.some(other => !other.isRonin && (other.state === 'toCalligraphy' || other.state === 'calligraphy'));
            if (SimState.gngNeedsKoku && SimState.bandits.length === 0 && !calligraphyBusy) {
                recipient.state = 'toCalligraphy';
                recipient._path = null;
            } else {
                recipient.state = 'toTrainingYard';
                recipient._kokuWaypoints = null;
            }
        }

        donor.state = 'toWellhouseAMP';
        donor._path = null;
        donor.isRecoveringAMP = false;
        donor.hasKoku = false;
        donor.kokuEnergy = 0;
        donor.waitTimer = 0;
        donor.exchangeProgress = 0;

        SimState.atpCounterWindow.push(time);
        spawnFloatingText(recipient.gx, recipient.gy, 1.4, '⚡ 2ADP → ATP + AMP!', '#38bdf8');
        for (let k = 0; k < 14; k++) {
            spawnParticle(recipient.gx, recipient.gy, 0.8, (Math.random() - 0.5) * 2.1, (Math.random() - 0.5) * 2.1, 1.7, k % 2 === 0 ? '#facc15' : '#22d3ee', 3.8, 0.65);
        }

        atpCount++;
        ampCount++;
        activeQueue = SimState.samurai
            .filter(s => !s.isRonin && (s.state === 'approaching' || s.state === 'queued' || s.state === 'receiving'))
            .sort((a, b) => (a.queueJoinSeq || 0) - (b.queueJoinSeq || 0));
    }

    const adpWaitingCount = activeQueue.length;
    const gateRiotQueueCount = activeQueue.filter(s => !s.isRecoveringAMP && s.gx >= 23.0 && s.gx <= 26.1 && s.gy <= 10.8).length;
    SimState.atpCount = atpCount;
    SimState.ampCount = ampCount;
    const activePoolSize = SimState.targetGarrisonSize || BioConfig.garrisonSize;
    SimState.adpCount = Math.max(0, activePoolSize - SimState.ronin.length - atpCount - ampCount);

    if (adpWaitingCount < 6) {
        SimState.ninjaInterventionsUsed = 0;
    }

    // Compensatory Warburg & mSLP Fermentation ATP recharge when bistable Warburg switch is active
    const warburgFermentActive = !!SimState.warburgActive;
    if (warburgFermentActive && SimState.roninRebelling) {
        SimState.roninRebelling = false;
        SimState.ronin = [];
    }
    const fermentStrength = warburgFermentActive ? Math.max(0.25, (SimState.etcDamage - 30) / 70) : 0;

    // Sort activeQueue so Samurai physically at the West Castle Queue Avenue (gx <= 26.1) always take front slots
    // ahead of Samurai still walking out of the Dojo courtyard (gx > 26.1)
    activeQueue.sort((a, b) => {
        const aAtAvenue = (a.gx <= 26.1 && a.gy <= 10.3) ? 0 : 1;
        const bAtAvenue = (b.gx <= 26.1 && b.gy <= 10.3) ? 0 : 1;
        if (aAtAvenue !== bAtAvenue) return aAtAvenue - bAtAvenue;
        return (a.queueJoinSeq || 0) - (b.queueJoinSeq || 0);
    });

    for (let q = 0; q < activeQueue.length; q++) {
        const s = activeQueue[q];
        s.slotIndex = q;
        // Waiting ADP Queue lines up along the West Castle Avenue (gx = 25.55), curving west if > 9 waiting
        const curveWest = q > 9 ? -(q - 9) * 0.24 : 0;
        const targetX = GATE_X + curveWest;
        const targetY = SLOT_0_Y + Math.min(q, 9) * SLOT_SPACING + (q > 9 ? (q - 9) * 0.14 : 0);

        // Ensure depleted Samurai leaving the Dojo exit via the South-West Dojo Gate (27.85, 11.15 -> 25.55, 11.15)
        let navTargetX = targetX;
        let navTargetY = targetY;
        if (s.gx > 27.6 && s.gy < 10.9) {
            navTargetX = 27.85;
            navTargetY = 11.15;
        } else if (s.gx > 26.2 && s.gy >= 10.4) {
            navTargetX = 25.55;
            navTargetY = Math.max(targetY, 10.85);
        }

        const dist = Math.hypot(targetX - s.gx, targetY - s.gy);
        const navDist = Math.hypot(navTargetX - s.gx, navTargetY - s.gy);
        if (dist > 0.08) {
            const stepSpeed = s.isRecoveringAMP ? 0.95 : (s.state === 'approaching' ? 1.75 : 1.45);
            if (s.gx < 24.5 && dist > 1.35) {
                window.stepAlongVillagePath(s, targetX, targetY, stepSpeed, dt, 0.1);
            } else {
                s.isRecoveringAMP = false;
                const ang = Math.atan2(navTargetY - s.gy, navTargetX - s.gx);
                s.gx += Math.cos(ang) * Math.min(navDist, stepSpeed * dt);
                s.gy += Math.sin(ang) * Math.min(navDist, stepSpeed * dt);
                s.walkPhase = (s.walkPhase || 0) + stepSpeed * dt * 5.2;
            }
        } else {
            s.gx = targetX;
            s.gy = targetY;
            s.walkPhase = 0;
            s.isRecoveringAMP = false;
            if (s.state === 'approaching') s.state = 'queued';
        }

        if (s.state === 'queued' || s.state === 'receiving') {
            const isChronicOverwork = (SimState.overworkTimer || 0) >= 65 || SimState.samuraiDemand >= 88;
            // At ~80% workload, hold around ~50/50 Ronin-to-Samurai (~10 Ronin) until chronic overwork or higher demand tips the balance!
            const plateauHold = (!isChronicOverwork && SimState.samuraiDemand >= 75 && SimState.samuraiDemand < 88 && SimState.ronin.length >= 10 && SimState.damLevel >= 20);
            const baseStress = plateauHold
                ? 0.25
                : (SimState.samuraiDemand >= 88 ? 1.48 : (SimState.samuraiDemand >= 75 ? 1.28 : (SimState.damLevel < 20 ? 1.35 : 0.85)));
            const overworkMult = isChronicOverwork ? 1.45 : 1.0;
            const poolStress = plateauHold ? 1.0 : (1 + SimState.ronin.length * 0.14);
            const fatEnduranceMult = (SimState.ketogenesisActive && SimState.effectiveFat >= 50) ? 0.75 : 1.0;
            s.waitTimer += dt * baseStress * poolStress * overworkMult * fatEnduranceMult;
        }

        if (q === 0 && dist <= 0.14) {
            if (SimState.damLevel >= BioConfig.wheelDrainRate && etcEfficiency > 0.02) {
                s.state = 'receiving';
                s.waitTimer = Math.max(0, s.waitTimer - dt * 2.0);
                // Slower, clearly observable ADP -> ATP Koku minting cadence (~1.35s per Samurai at the Castle Gate)
                const loyalMult = SimState.ronin.length > 0 ? Math.max(0.45, 1 - SimState.ronin.length * 0.045) : 1.0;
                const state3Boost = (0.82 + Math.min(0.22, gateRiotQueueCount * 0.03)) * Math.max(0.2, etcEfficiency) * loyalMult;
                s.exchangeProgress = Math.min(1, (s.exchangeProgress || 0) + dt * 0.72 * state3Boost);
                SimState.wheelAngle -= dt * 4.2 * state3Boost;
                if (Math.random() < 0.55) spawnParticle(24.45, 4.95, 1.2, -0.4, 1.2, -0.5, '#7dd3fc', 3, 0.5);

                if (s.exchangeProgress >= 1) {
                    SimState.damLevel = Math.max(0, SimState.damLevel - BioConfig.wheelDrainRate);
                    s.hasKoku = true;
                    s.kokuEnergy = 0.85 + Math.random() * 0.3;
                    const calligraphyBusy = SimState.samurai.some(other => !other.isRonin && (other.state === 'toCalligraphy' || other.state === 'calligraphy'));
                    if (SimState.gngNeedsKoku && SimState.bandits.length === 0 && !calligraphyBusy) {
                        s.state = 'toCalligraphy';
                        s._path = null;
                    } else {
                        s.state = 'toTrainingYard';
                        s._kokuWaypoints = null;
                    }
                    s.slotIndex = -1;
                    s.waitTimer = 0;
                    SimState.atpCounterWindow.push(time);
                    for (let k = 0; k < 5; k++) spawnParticle(25.55, 6.4, 1.2, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2, 1.8, '#facc15', 3.5, 0.65);
                }
            } else if (warburgFermentActive) {
                s.state = 'receiving';
                s.waitTimer = 0;
                s.exchangeProgress = Math.min(1, (s.exchangeProgress || 0) + dt * (0.75 + fermentStrength * 0.75));
                if (Math.random() < 0.45) {
                    spawnParticle(25.55, 6.4, 1.0, (Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 1.1, 1.4, Math.random() < 0.5 ? '#39ff14' : '#a855f7', 3.2, 0.5);
                }
                if (s.exchangeProgress >= 1) {
                    s.hasKoku = true;
                    s.kokuEnergy = 0.82 + Math.random() * 0.25;
                    s.state = 'toTrainingYard';
                    s._kokuWaypoints = null;
                    s.slotIndex = -1;
                    s.waitTimer = 0;
                    SimState.atpCounterWindow.push(time);
                    // Fire visible energy pulses from both the Glycolytic Stage Bonfire and the Wellhouse mSLP Bonfire to the Castle queue!
                    spawnPipePulse(3.05, 10.82, 0.95, 25.55, 6.72, 0.85, 0.55);
                    spawnPipePulse(14.30, 8.16, 0.95, 25.55, 6.72, 0.85, 0.45);
                }
            } else {
                s.state = 'queued';
            }
        }
    }

    // 8. mTOR ZEN MONKS (Requires Anabolic Surplus or Post-Stress Recovery + Bridge/Road Pathfinding)
    const totalFuelInput = SimState.fatSupply + SimState.glucoseSupply;
    const mtorRecoveryMode = (canRepairEtc && SimState.etcDamage > 0 && SimState.glucoseSupply >= 45 && SimState.atpCount >= 12);
    const mtorAnabolicSurplus = (SimState.glucoseSupply >= 50 && totalFuelInput >= 85 && SimState.samuraiDemand <= 40 && SimState.atpCount >= 14 && adpWaitingCount <= 5 && SimState.toxinLoad < 25 && SimState.etcDamage < 35 && SimState.fires.length < 4 && SimState.rosLevel < 65 && !bothHighRandle);
    SimState.mtorActive = (mtorAnabolicSurplus || mtorRecoveryMode) && !SimState.ampkActive && SimState.crisisState === 'none';
    if (!SimState.mtorActive && SimState.shrineScaffolding < 45) {
        SimState.mtorKetoneSeal = false;
    }

    if (SimState.mtorActive) {
        SimState.monkSpawnTimer += dt * BioConfig.mtorBuildSpeed;
        if (mtorAnabolicSurplus && (SimState.recoveryWindowTimer || 0) <= 0) {
            SimState.shrineScaffolding = Math.min(100, SimState.shrineScaffolding + dt * 0.62 * BioConfig.mtorBuildSpeed);
        }
        if (SimState.shrineScaffolding > 60 && Math.random() < dt * 0.25) {
            SimState.misfoldedBeams = Math.min(6, SimState.misfoldedBeams + 1);
        }

        if (SimState.monks.length < 2 && SimState.monkSpawnTimer > 4.2) {
            SimState.monkSpawnTimer = 0;
            const donor = SimState.samurai.find(s => s.state === 'training' && s.kokuEnergy > 0.35);
            if (donor) donor.kokuEnergy = Math.max(0.1, donor.kokuEnergy - 0.22);

            let task = 'buildShrine';
            if (canRepairEtc && SimState.etcDamage > 0 && SimState.shrineScaffolding < 65) {
                task = 'repairEtc';
            } else if (!SimState.mtorKetoneSeal && SimState.glucoseSupply <= 35 && SimState.glucoseSupply >= 31) {
                task = 'sealKetones';
            }
            const targetPt = task === 'repairEtc'
                ? { x: 17.3, y: 6.85 }
                : (task === 'sealKetones'
                    ? { x: 3.0, y: 3.75 }
                    : { x: 17.3 + (Math.random() - 0.5) * 0.8, y: 11.85 });

            SimState.monks.push({
                task,
                gx: 25.8,
                gy: 6.85,
                tx: targetPt.x,
                ty: targetPt.y,
                carryingKoku: true,
                workTimer: 0,
                returning: false,
                walkPhase: Math.random() * 6
            });
        }
    }

    for (let i = SimState.monks.length - 1; i >= 0; i--) {
        const m = SimState.monks[i];
        const arrived = window.stepAlongVillagePath(m, m.tx, m.ty, 1.30, dt, 0.38);
        if (arrived) {
            if (!m.returning) {
                m.workTimer += dt;
                if (m.workTimer >= 2.50) {
                    m.carryingKoku = false;
                    if (m.task === 'repairEtc') {
                        SimState.etcDamage = Math.max(0, SimState.etcDamage - 6);
                        spawnFloatingText(17.3, 5.5, 1.9, '🧘 Biogenesis (-6% Scar)', '#fde047');
                        for (let s = 0; s < 10; s++) spawnParticle(17.3, 5.5, 1.0, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 1.4, '#fbbf24', 3.5, 0.55);
                    } else if (m.task === 'buildShrine' && (SimState.recoveryWindowTimer || 0) <= 0) {
                        SimState.shrineScaffolding = Math.min(100, SimState.shrineScaffolding + 3.2 * BioConfig.mtorBuildSpeed);
                        if (SimState.shrineScaffolding > 58 && SimState.misfoldedBeams < 6) {
                            SimState.misfoldedBeams++;
                        }
                    } else if (m.task === 'sealKetones' && SimState.glucoseSupply > 30) {
                        SimState.mtorKetoneSeal = true;
                    }
                    m.returning = true;
                    m.tx = 25.8;
                    m.ty = 6.85;
                }
            } else {
                SimState.monks.splice(i, 1);
            }
        }
    }

    if (SimState.shrineScaffolding >= 100 && !SimState.senescenceActive) {
        SimState.shrineScaffolding = 100;
        SimState.senescenceActive = true;
        SimState.senescenceTimer = 0;
        SimState.senescenceYardWorkers = [
            { gx: 3.75, gy: 6.65, tunicCol: '#92400e', toolType: 'cleaver', walkPhase: 0 },
            { gx: 3.15, gy: 11.65, tunicCol: '#1e40af', toolType: 'mallet', walkPhase: 0 },
            { gx: 21.32, gy: 11.85, tunicCol: '#9f1239', toolType: 'lever', walkPhase: 0 }
        ];
        setCrisisBanner('senescence');
        for (let k = 0; k < 28; k++) {
            spawnParticle(17.3, 10.7, 1.5, (Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 4.5, 2.8, k % 2 === 0 ? '#facc15' : '#a855f7', 5.0, 1.2);
        }
    }

    // 9. AMPK NINJAS (Pathway 2 Mitophagy Repair + Nutritional-State-Aware Substrate Boost + Bridge/Road Pathfinding)
    const fastingAutophagyTrigger = (totalFuelInput <= 45 && SimState.samuraiDemand >= 60 && (SimState.shrineScaffolding > 20 || (canRepairEtc && SimState.etcDamage > 0)));
    const sluiceDrainTrigger = SimState.sluiceOpen && SimState.damLevel < 18 && adpWaitingCount >= 5;
    SimState.ampkActive = (adpWaitingCount >= BioConfig.ampkQueueThreshold) || fastingAutophagyTrigger || sluiceDrainTrigger;

    if (SimState.ampkActive && SimState.ninjaInterventionsUsed < BioConfig.maxNinjaInterventions) {
        SimState.ninjaSpawnTimer += dt;
        if (SimState.ninjas.length === 0 && SimState.ninjaSpawnTimer > 3.0) {
            SimState.ninjaSpawnTimer = 0;
            SimState.ninjaInterventionsUsed++;

            let targetType = isStarving ? 'autophagy' : 'glucose';
            if (SimState.sluiceOpen) {
                targetType = 'sluice';
            } else if (canRepairEtc && SimState.etcDamage > 0) {
                targetType = 'mitophagy';
            } else if (isStarving || SimState.shrineScaffolding > 35 || SimState.misfoldedBeams > 0) {
                targetType = 'autophagy';
            } else if (SimState.insulinResistance > 0.20 && SimState.glut4ForcedOpenTimer <= 1.0 && SimState.glucoseSupply > 30) {
                targetType = 'glut4';
            } else if (SimState.glucoseSupply <= 30 || SimState.ninjaInterventionsUsed % 2 === 0) {
                targetType = 'fat';
            }

            const targetCoords = targetType === 'sluice'
                ? { x: 29.5, y: 4.5 }
                : (targetType === 'mitophagy'
                    ? { x: 10.9, y: 6.85 }
                    : (targetType === 'autophagy'
                        ? { x: 17.3, y: 11.85 }
                        : (targetType === 'glut4'
                            ? { x: 1.35, y: 11.0 }
                            : (targetType === 'glucose' ? { x: 4.5, y: 11.0 } : { x: 4.5, y: 6.2 }))));

            SimState.ninjas.push({
                targetType,
                gx: 25.8,
                gy: 6.85,
                tx: targetCoords.x,
                ty: targetCoords.y,
                workTimer: 0,
                returning: false,
                walkPhase: 0
            });
            for (let p = 0; p < 8; p++) {
                spawnParticle(25.8, 6.85, 0.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 1.2, '#a855f7', 4.0, 0.5);
            }
        }
    }

    for (let i = SimState.ninjas.length - 1; i >= 0; i--) {
        const n = SimState.ninjas[i];
        if (n.rebelling) {
            const rDist = Math.hypot(24.55 - n.gx, 4.35 - n.gy);
            if (rDist > 0.35) {
                const ang = Math.atan2(4.35 - n.gy, 24.55 - n.gx);
                n.gx += Math.cos(ang) * 3.6 * dt;
                n.gy += Math.sin(ang) * 3.6 * dt;
                n.walkPhase = (n.walkPhase || 0) + 3.6 * dt * 5.2;
            } else {
                n.workTimer = (n.workTimer || 0) + dt;
                SimState.damLevel = Math.max(0, SimState.damLevel - 10 * dt);
                if (Math.random() < 0.45) {
                    spawnParticle(24.5, 4.3, 0.8, -1.0, (Math.random() - 0.5) * 1.4, 1.4, '#f43f5e', 3.5, 0.45);
                }
            }
            continue;
        }
        if (Math.random() < 0.28) {
            spawnParticle(n_gx(n), n_gy(n), 0.3, 0, 0, 0.4, 'rgba(30, 41, 59, 0.7)', 3.0, 0.3);
        }
        const arrived = window.stepAlongVillagePath(n, n.tx, n.ty, 2.15, dt, 0.38);
        if (arrived) {
            if (!n.returning) {
                n.workTimer = (n.workTimer || 0) + dt;
                if (Math.random() < 0.35) {
                    spawnParticle(n_gx(n), n_gy(n), 0.65, (Math.random() - 0.5) * 1.3, (Math.random() - 0.5) * 1.3, 1.2, '#c084fc', 2.8, 0.4);
                }
                if (n.workTimer >= 1.80) {
                    if (n.targetType === 'sluice' && SimState.sluiceOpen) {
                        setSluiceGate(false);
                        for (let s = 0; s < 10; s++) spawnParticle(n_gx(n), n_gy(n), 0.8, (Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.8, 1.5, '#2dd4bf', 3.5, 0.6);
                    } else if (n.targetType === 'mitophagy') {
                        SimState.etcDamage = Math.max(0, SimState.etcDamage - 8);
                        spawnFloatingText(10.9, 5.8, 2.0, '🥷 Mitophagy (-8% Scar)', '#c084fc');
                        for (let s = 0; s < 12; s++) spawnParticle(10.9, 5.8, 1.1, (Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 2.0, 1.6, '#c084fc', 3.8, 0.6);
                    } else if (n.targetType === 'autophagy') {
                        SimState.shrineScaffolding = Math.max(15, SimState.shrineScaffolding - 24);
                        SimState.misfoldedBeams = Math.max(0, SimState.misfoldedBeams - 3);
                        SimState.mtorKetoneSeal = false;
                        SimState.glut4ForcedOpenTimer = 9.0;
                        if (SimState.carts.length < 28) {
                            SimState.carts.push({ type: 'NADH', source: 'fat', state: 'toVillage', gx: 15.65, gy: 9.35, targetComplex: 1, hasSack: true, speed: 2.5, wheelPhase: 0, headingAngle: 0 });
                        }
                        for (let s = 0; s < 14; s++) spawnParticle(17.3, 10.7, 1.1, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2, 1.8, s % 2 === 0 ? '#34d399' : '#c084fc', 3.8, 0.65);
                    } else if (n.targetType === 'glut4') {
                        SimState.glut4ForcedOpenTimer = 12.0;
                        SimState.insulinResistance = Math.max(0, SimState.insulinResistance - 0.35);
                        SimState.glucoseSupply = Math.min(100, SimState.glucoseSupply + BioConfig.ninjaBoostAmount);
                        document.getElementById('sliderGlucose').value = Math.round(SimState.glucoseSupply);
                        document.getElementById('valGlucose').textContent = `${Math.round(SimState.glucoseSupply)}%`;
                    } else if (n.targetType === 'glucose') {
                        if (!isStarving) {
                            SimState.glut4ForcedOpenTimer = 8.0;
                            SimState.glucoseSupply = Math.min(100, SimState.glucoseSupply + BioConfig.ninjaBoostAmount);
                            document.getElementById('sliderGlucose').value = Math.round(SimState.glucoseSupply);
                            document.getElementById('valGlucose').textContent = `${Math.round(SimState.glucoseSupply)}%`;
                        }
                    } else if (n.targetType === 'fat') {
                        if (!isStarving) {
                            SimState.mtorKetoneSeal = false;
                            SimState.fatSupply = Math.min(100, SimState.fatSupply + BioConfig.ninjaBoostAmount);
                            document.getElementById('sliderFat').value = Math.round(SimState.fatSupply);
                            document.getElementById('valFat').textContent = `${Math.round(SimState.fatSupply)}%`;
                        }
                    }
                    n.returning = true;
                    n.workTimer = 0;
                    n.tx = 25.8;
                    n.ty = 6.85;
                }
            } else {
                SimState.ninjas.splice(i, 1);
            }
        }
    }

    // 10. PROGRESSIVE RONIN DESERTION, CAMP PROWLING, INTERVENTION RETURN & >60% REBELLION (mPTP)
    if (SimState.samuraiDemand >= 75 && !SimState.roninRebelling && !SimState.cellDead) {
        SimState.overworkTimer = (SimState.overworkTimer || 0) + dt;
    } else if (SimState.samuraiDemand < 75) {
        SimState.overworkTimer = Math.max(0, (SimState.overworkTimer || 0) - dt * 2.5);
    }
    SimState.roninDesertCooldown = Math.max(0, (SimState.roninDesertCooldown || 0) - dt);
    const roninRebellionThreshold = Math.floor(BioConfig.garrisonSize * 0.6) + 1; // >60% (13 / 20)

    // Stage 1: Individual Samurai waiting too long desert 1-by-1 to prowl outside the camp (halted during Recovery/Feeding!)
    if (!SimState.roninRebelling && !warburgFermentActive && !SimState.cellDead && SimState.roninDesertCooldown <= 0 && (SimState.recoveryWindowTimer || 0) <= 0 && !SimState.starvationSequence && SimState.crisisState !== 'starvation') {
        let impatientSamurai = null;
        let maxWait = BioConfig.roninPatienceLimit;
        for (const s of activeQueue) {
            if ((s.state === 'queued' || (s.state === 'receiving' && SimState.damLevel < BioConfig.wheelDrainRate)) && s.waitTimer >= maxWait) {
                maxWait = s.waitTimer;
                impatientSamurai = s;
            }
        }
        if (impatientSamurai) {
            impatientSamurai.isRonin = true;
            impatientSamurai.waitTimer = 0;
            const rIdx = SimState.ronin.length;
            // Far-right open area east of Onsen & Dojo (gx: 32.5..33.6, gy: 6.4..10.2)
            const campX = 32.5 + (rIdx % 2) * 0.95;
            const campY = 6.4 + Math.floor(rIdx / 2) * 0.58;
            SimState.ronin.push({
                id: impatientSamurai.id,
                gx: impatientSamurai.gx,
                gy: impatientSamurai.gy,
                campX,
                campY,
                tx: campX,
                ty: campY,
                _path: null,
                // Exit east in front of the Onsen (gy = 6.95, clear of Onsen bath & Koku promenade) to the open east area
                _exitWaypoints: [
                    { x: 24.85, y: 6.85 },
                    { x: 32.55, y: 6.95 },
                    { x: campX, y: campY }
                ],
                _exitIdx: 0,
                prowlPhase: Math.random() * 6.28
            });
            SimState.roninDesertCooldown = 2.6;
            spawnFloatingText(impatientSamurai.gx, impatientSamurai.gy, 1.3, '👹 Turned Ronin! (Left Duty)', '#fb7185');
        }
    }

    // Stage 2: If the user intervenes before >60% turn Ronin, prowling Ronin gradually return to duty (no damage done)
    if (SimState.ronin.length > 0 && !SimState.roninRebelling && !SimState.cellDead) {
        let maxQueueWait = 0;
        for (const s of activeQueue) {
            if ((SimState.recoveryWindowTimer || 0) > 0) s.waitTimer = Math.max(0, s.waitTimer - dt * 4.5);
            if (s.waitTimer > maxQueueWait) maxQueueWait = s.waitTimer;
        }
        const inRecovery = (SimState.recoveryWindowTimer || 0) > 0 && SimState.samuraiDemand < 75 && SimState.damLevel >= 22;
        const crisisRelieved = inRecovery || (SimState.samuraiDemand < 75 && gateRiotQueueCount <= 5 && SimState.damLevel >= 22 && maxQueueWait < BioConfig.roninPatienceLimit * 0.65);
        const returnInterval = inRecovery ? 0.85 : 2.0;
        if (crisisRelieved) {
            SimState.roninReturnTimer = (SimState.roninReturnTimer || 0) + dt;
            if (SimState.roninReturnTimer >= returnInterval) {
                SimState.roninReturnTimer = 0;
                const returningRonin = SimState.ronin.pop();
                const sam = SimState.samurai.find(s => s.id === returningRonin.id);
                if (sam) {
                    sam.isRonin = false;
                    sam.state = 'approaching';
                    sam.hasKoku = false;
                    sam.kokuEnergy = 0;
                    sam.waitTimer = 0;
                    sam.exchangeProgress = 0;
                    sam.gx = returningRonin.gx;
                    sam.gy = returningRonin.gy;
                    sam._path = null;
                    sam.queueJoinSeq = ++SimState.samuraiQueueSeq;
                }
                spawnFloatingText(returningRonin.gx, returningRonin.gy, 1.3, '🤝 Ronin Returned to Duty!', '#34d399');
            }
        } else {
            SimState.roninReturnTimer = 0;
        }
    }

    // Stage 3: >60% Ronin Rebellion — Simplified 3-Act Apoptosis Finale (suppressed during Starvation or existing terminal crisis)
    if (!SimState.roninRebelling && !isStarving && SimState.crisisState === 'none' && SimState.ronin.length >= roninRebellionThreshold) {
        SimState.roninRebelling = true;
        SimState.apoptosisSequence = { act: 'rampage', timer: 0, blebLanterns: [] };
        spawnFloatingText(22.0, 7.5, 2.2, '👹 ACT I: >60% RONIN REVOLT — LAYING WASTE TO VILLAGE!', '#f43f5e');
    }

    SimState.roninCount = SimState.ronin.length;
    SimState.crisisTimer = SimState.roninRebelling ? BioConfig.roninPatienceLimit : 0;

    if (SimState.roninRebelling && SimState.apoptosisSequence && !SimState.cellDead) {
        const ap = SimState.apoptosisSequence;
        ap.timer += dt;

        if (ap.act === 'rampage') {
            // Act I: Ronin hunt down and eliminate every character in the village (no Castle/Dam targets)
            const allTargets = [
                ...SimState.porters,
                ...SimState.carts,
                ...SimState.brigade,
                ...SimState.monks,
                ...SimState.ninjas,
                ...SimState.ketoneButterflies,
                ...SimState.samurai.filter(s => !s.isRonin),
            ];
            if (SimState.ordainingMonk) allTargets.push(SimState.ordainingMonk);

            for (let i = 0; i < SimState.ronin.length; i++) {
                const r = SimState.ronin[i];
                if (allTargets.length > 0) {
                    const tgt = allTargets[i % allTargets.length];
                    r.tx = tgt.gx;
                    r.ty = tgt.gy;
                } else {
                    const d = Math.hypot(r.tx - r.gx, r.ty - r.gy);
                    if (d <= 0.3) {
                        r.tx = 10.0 + Math.random() * 13.5;
                        r.ty = 5.2 + Math.random() * 6.0;
                    }
                }
                const d = Math.hypot(r.tx - r.gx, r.ty - r.gy);
                if (d > 0.25) {
                    const ang = Math.atan2(r.ty - r.gy, r.tx - r.gx);
                    r.gx += Math.cos(ang) * 4.8 * dt;
                    r.gy += Math.sin(ang) * 4.8 * dt;
                }
                const strikeGroup = (arr, color) => {
                    for (let idx = arr.length - 1; idx >= 0; idx--) {
                        const ent = arr[idx];
                        if (Math.hypot(ent.gx - r.gx, ent.gy - r.gy) < 1.2) {
                            for (let k = 0; k < 6; k++) spawnParticle(ent.gx, ent.gy, 0.5, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2, 1.5, color, 3.4, 0.5);
                            arr.splice(idx, 1);
                        }
                    }
                };
                strikeGroup(SimState.porters, '#f43f5e');
                strikeGroup(SimState.carts, '#fb7185');
                strikeGroup(SimState.brigade, '#f43f5e');
                strikeGroup(SimState.monks, '#fbbf24');
                strikeGroup(SimState.ninjas, '#c084fc');
                strikeGroup(SimState.ketoneButterflies, '#f59e0b');
                for (let si = SimState.samurai.length - 1; si >= 0; si--) {
                    const s = SimState.samurai[si];
                    if (!s.isRonin && Math.hypot(s.gx - r.gx, s.gy - r.gy) < 1.15) {
                        for (let k = 0; k < 8; k++) spawnParticle(s.gx, s.gy, 0.6, (Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 2.4, 1.7, '#f43f5e', 3.6, 0.55);
                        SimState.samurai.splice(si, 1);
                    }
                }
                if (SimState.ordainingMonk && Math.hypot(SimState.ordainingMonk.gx - r.gx, SimState.ordainingMonk.gy - r.gy) < 1.2) {
                    for (let k = 0; k < 6; k++) spawnParticle(SimState.ordainingMonk.gx, SimState.ordainingMonk.gy, 0.5, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2, 1.5, '#fbbf24', 3.4, 0.5);
                    SimState.ordainingMonk = null;
                    SimState.monkOrdainPending = false;
                }
            }

            if (ap.timer >= 3.2 || (allTargets.length === 0 && ap.timer >= 1.6)) {
                ap.act = 'bridge_breach';
                ap.timer = 0;
                SimState.porters = [];
                SimState.carts = [];
                SimState.brigade = [];
                SimState.monks = [];
                SimState.ninjas = [];
                SimState.ketoneButterflies = [];
                SimState.bandits = [];
                SimState.mikoCouriers = [];
                SimState.gngSpiritPulses = [];
                SimState.muscleCalmingSpirits = [];
                SimState.dockPorter = null;
                SimState.musclePorter = null;
                SimState.ordainingMonk = null;
                SimState.monkOrdainPending = false;
                SimState.samurai = SimState.samurai.filter(s => s.isRonin);
                for (let i = 0; i < SimState.ronin.length; i++) {
                    SimState.ronin[i].tx = 7.0 + ((i % 5) - 2) * 0.45;
                    SimState.ronin[i].ty = 8.35 + ((Math.floor(i / 5) % 3) - 1) * 0.35;
                }
                spawnFloatingText(7.0, 8.35, 2.2, '💣 ACT II: BLOWING THE MEMBRANE BRIDGE!', '#f43f5e');
            }
        } else if (ap.act === 'bridge_breach') {
            for (let i = 0; i < SimState.ronin.length; i++) {
                const r = SimState.ronin[i];
                const dist = Math.hypot(r.tx - r.gx, r.ty - r.gy);
                if (dist > 0.22) {
                    const ang = Math.atan2(r.ty - r.gy, r.tx - r.gx);
                    r.gx += Math.cos(ang) * 4.6 * dt;
                    r.gy += Math.sin(ang) * 4.6 * dt;
                } else if (Math.random() < 0.45) {
                    spawnParticle(7.0 + (Math.random() - 0.5) * 1.4, 8.35 + (Math.random() - 0.5) * 0.8, 0.5, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2, 1.8, '#fb923c', 4.0, 0.5);
                }
            }
            SimState.damLevel = Math.max(0, SimState.damLevel - 48 * dt);
            if (ap.timer >= 1.2 && !SimState.membraneDepolarized) {
                SimState.membraneDepolarized = true;
                SimState.damLevel = 0;
                for (let k = 0; k < 36; k++) {
                    const bx = 7.0 + (Math.random() - 0.5) * 2.2;
                    const by = 8.35 + (Math.random() - 0.5) * 1.2;
                    const col = k % 3 === 0 ? '#f43f5e' : (k % 3 === 1 ? '#fb923c' : '#fde047');
                    spawnParticle(bx, by, 0.6, (Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 4.5, 2.8 + Math.random() * 2.0, col, 4.8 + Math.random() * 2.5, 0.9);
                }
                spawnFloatingText(7.0, 8.35, 2.2, '💥 BRIDGE DESTROYED — MEMBRANE DEPOLARIZED (0 mV)!', '#fda4af');
            }
            if (ap.timer >= 2.4 && !SimState.warburgActive) {
                ap.act = 'seppuku';
                ap.timer = 0;
                SimState.damLevel = 0;
                for (let i = 0; i < SimState.ronin.length; i++) {
                    SimState.ronin[i].seppuku = true;
                    SimState.ronin[i].seppukuProgress = 0;
                    SimState.ronin[i].tx = 9.0 + (i % 5) * 0.7;
                    SimState.ronin[i].ty = 7.0 + Math.floor(i / 5) * 0.75;
                }
                spawnFloatingText(9.5, 7.6, 2.2, '🗡️ ACT III: RONIN SEPPUKU — PROGRAMMED CELL DEATH', '#fecdd3');
            }
        } else if (ap.act === 'seppuku') {
            if (SimState.ronin.length > 0) {
                const prog = Math.min(1, ap.timer / 1.8);
                for (let i = 0; i < SimState.ronin.length; i++) {
                    const r = SimState.ronin[i];
                    r.seppukuProgress = prog;
                    const dist = Math.hypot(r.tx - r.gx, r.ty - r.gy);
                    if (dist > 0.15 && ap.timer < 0.85) {
                        const ang = Math.atan2(r.ty - r.gy, r.tx - r.gx);
                        r.gx += Math.cos(ang) * 4.2 * dt;
                        r.gy += Math.sin(ang) * 4.2 * dt;
                    }
                }
                if (ap.timer >= 1.8) {
                    for (const r of SimState.ronin) {
                        for (let k = 0; k < 10; k++) {
                            const col = k % 2 === 0 ? '#fecdd3' : '#f8fafc';
                            spawnParticle(r.gx, r.gy, 0.5, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4, 2.2, col, 3.6, 0.85);
                        }
                    }
                    SimState.ronin = [];
                    SimState.samurai = [];
                    SimState.roninCount = 0;
                    const lanternHubs = [
                        { x: 7.0, y: 8.35 }, { x: 10.9, y: 5.5 }, { x: 10.8, y: 11.0 },
                        { x: 14.3, y: 8.1 }, { x: 17.3, y: 5.5 }, { x: 17.3, y: 10.7 },
                        { x: 22.1, y: 10.3 }, { x: 25.5, y: 6.5 }, { x: 29.5, y: 10.6 },
                        { x: 3.0, y: 6.0 }, { x: 3.0, y: 10.9 }, { x: 7.0, y: 5.0 }
                    ];
                    for (const lh of lanternHubs) {
                        ap.blebLanterns.push({ gx: lh.x, gy: lh.y, phase: Math.random() * 6.28 });
                    }
                    spawnFloatingText(14.5, 7.5, 2.2, '🏮 QUIET APOPTOSIS — ONLY LANTERNS REMAIN', '#fef08a');
                }
            }
            if (ap.timer >= 3.4 && !SimState.cellDead) {
                ap.act = 'complete';
                SimState.cellDead = true;
                SimState.damLevel = 0;
                setCrisisBanner('apoptosis');
            }
        }
    }

    for (let i = 0; i < SimState.ronin.length; i++) {
        const r = SimState.ronin[i];
        if (!SimState.roninRebelling) {
            r.sheathed = isStarving;
            // In Starvation, Ronin put away their katana and mill about idly; otherwise >= 4 Ronin line up outside the SE Practice Yard edge
            const menacingLineUp = !isStarving && SimState.ronin.length >= 4;
            const targetBaseX = menacingLineUp ? (32.65 + (i % 2) * 0.65) : r.campX;
            const targetBaseY = menacingLineUp ? (11.45 + Math.floor(i / 2) * 0.45) : r.campY;
            // Route north/east past the Onsen (gy = 6.20) to the open east area; never cut back into the Practice Yard!
            if (r._exitWaypoints && r._exitIdx < r._exitWaypoints.length) {
                const ew = r._exitWaypoints[r._exitIdx];
                const dExit = Math.hypot(ew.x - r.gx, ew.y - r.gy);
                const spd = 2.0;
                if (dExit <= Math.max(0.20, spd * dt * 1.1)) {
                    r._exitIdx++;
                } else {
                    const ang = Math.atan2(ew.y - r.gy, ew.x - r.gx);
                    r.gx += Math.cos(ang) * spd * dt;
                    r.gy += Math.sin(ang) * spd * dt;
                }
            } else {
                r.prowlPhase = (r.prowlPhase || 0) + dt * (menacingLineUp ? 2.2 : (isStarving ? 2.0 : 1.6));
                const wx = menacingLineUp ? 0.10 : (isStarving ? 0.65 : 0.25);
                const wy = menacingLineUp ? 0.15 : (isStarving ? 0.85 : 0.42);
                r.tx = Math.max(32.55, targetBaseX + Math.cos(r.prowlPhase * 0.5) * wx);
                r.ty = targetBaseY + Math.sin(r.prowlPhase) * wy;
                const dist = Math.hypot(r.tx - r.gx, r.ty - r.gy);
                if (dist > 0.08) {
                    const ang = Math.atan2(r.ty - r.gy, r.tx - r.gx);
                    const moveSpd = dist > 1.2 ? 1.85 : 0.95;
                    r.gx += Math.cos(ang) * Math.min(dist, moveSpd * dt);
                    r.gy += Math.sin(ang) * Math.min(dist, moveSpd * dt);
                }
            }
        }
    }

    // 10B. CYCLICAL METABOLIC STATES (High Workload PGC-1a Priming -> Recovery/Feeding -> Balanced Fasting Monk Changeover vs. Fasting Pruning)
    if (SimState.samuraiDemand >= 70 && !SimState.warburgActive && !SimState.roninRebelling && !SimState.cellDead) {
        SimState.exercisePriming = Math.min(100, (SimState.exercisePriming || 0) + dt * 5.2);
        SimState.fastingAtrophyTimer = Math.max(0, (SimState.fastingAtrophyTimer || 0) - dt * 12.0);
    }

    if ((SimState.recoveryWindowTimer || 0) > 0) {
        SimState.recoveryWindowTimer = Math.max(0, SimState.recoveryWindowTimer - dt);
        if (SimState.recoveryWindowTimer <= 0 && !SimState.monkOrdainPending) {
            // Lingering too long in Recovery/Feeding reverts to Sedentary Overfed -> mTOR Senescence path
            SimState.recoveryFedWithPriming = false;
            spawnFloatingText(17.3, 10.7, 1.8, '🍱 Recovery Window Passed → Sedentary Overfed!', '#fb923c');
        }
    }

    // Zen Monk Changeover: Stage 1 (initiate visible Monk march to the Onsen upon Balanced Fasting with all Ronin re-recruited)
    if (SimState.monkOrdainPending && !SimState.ordainingMonk && SimState.ronin.length === 0 && !SimState.cellDead && !SimState.warburgActive) {
        SimState.monkOrdainPending = false;
        SimState.recoveryFedWithPriming = false;
        SimState.recoveryWindowTimer = 0;
        if ((SimState.targetGarrisonSize || 20) < 25 && (SimState.exercisePriming || 0) >= 50) {
            SimState.exercisePriming = Math.max(0, SimState.exercisePriming - 60);
            const spawnMonk = SimState.monks.length > 0 ? SimState.monks.pop() : null;
            const sx = spawnMonk ? spawnMonk.gx : 25.8;
            const sy = spawnMonk ? spawnMonk.gy : 7.4;
            SimState.ordainingMonk = {
                gx: sx,
                gy: sy,
                tx: 30.25,
                ty: 5.85,
                phase: 'walking',
                timer: 0,
                walkPhase: 0
            };
            spawnFloatingText(sx, sy, 1.9, '🧘 Zen Monk Advancing to Onsen for Changeover!', '#fbbf24');
        }
    }

    // Zen Monk Changeover: Stage 2 (walk to Onsen -> 2.8s Onsen robe-shedding & bath transformation -> emerge as Samurai)
    if (SimState.ordainingMonk) {
        const om = SimState.ordainingMonk;
        if (om.phase === 'walking') {
            const arrivedOnsen = window.stepAlongVillagePath
                ? window.stepAlongVillagePath(om, om.tx, om.ty, 1.50, dt, 0.35)
                : (Math.hypot(om.tx - om.gx, om.ty - om.gy) < 0.25);
            if (arrivedOnsen) {
                om.gx = 30.55;
                om.gy = 5.45; // Step into the steaming Onsen pool
                om.phase = 'bathing';
                om.timer = 0;
                spawnFloatingText(om.gx, om.gy, 2.0, '♨️ Throwing Off Robes & Entering Onsen!', '#fde047');
            }
        } else if (om.phase === 'bathing') {
            om.timer += dt;
            if (Math.random() < 0.50) {
                spawnParticle(om.gx, om.gy, 0.65, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4, 1.8, Math.random() < 0.5 ? '#e0f2fe' : '#fde047', 3.6, 0.75);
            }
            if (om.timer >= 2.8) {
                SimState.targetGarrisonSize = Math.min(25, (SimState.targetGarrisonSize || 20) + 1);
                let maxId = 0;
                for (const s of SimState.samurai) if ((s.id || 0) > maxId) maxId = s.id;
                const slotIdx = SimState.samurai.length;
                const col = slotIdx % 4; const row = Math.floor(slotIdx / 4);
                const yx = 29.2 + col * 0.72; const yy = 10.25 + row * 0.48;
                SimState.samurai.push({
                    id: maxId + 1,
                    gx: 30.35, gy: 6.25,
                    yardX: yx, yardY: yy,
                    state: 'approaching',
                    hasKoku: false, kokuEnergy: 0,
                    slotIndex: -1,
                    queueJoinSeq: ++SimState.samuraiQueueSeq,
                    waitTimer: 0,
                    exchangeProgress: 0,
                    walkPhase: 0,
                    sparPhase: 0,
                    isRonin: false,
                    livery: (typeof SamuraiLiveries !== 'undefined' ? SamuraiLiveries[slotIdx % SamuraiLiveries.length] : undefined)
                });
                for (let k = 0; k < 16; k++) {
                    spawnParticle(30.35, 6.25, 0.85, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2, 1.9, k % 2 === 0 ? '#34d399' : '#fde047', 4.0, 0.8);
                }
                spawnFloatingText(30.35, 6.25, 2.0, `⚔️ EMERGED FROM ONSEN AS SAMURAI (${SimState.targetGarrisonSize}/25)!`, '#34d399');
                SimState.ordainingMonk = null;
                if (SimState.targetGarrisonSize > 15) SimState.atrophyAdvised = false;
                if (SimState.targetGarrisonSize >= 25 && !SimState.victoryAchieved && SimState.crisisState === 'none') {
                    SimState.victoryAchieved = true;
                    SimState.victoryType = 'superCapacity';
                    SimState.matsuriPetals = Array.from({ length: 28 }, (_, idx) => ({
                        gx: 4.0 + Math.random() * 29.0,
                        gy: 3.5 + Math.random() * 10.5,
                        gz: 0.4 + Math.random() * 2.6,
                        vx: 0.45 + Math.random() * 0.55,
                        vy: (Math.random() - 0.5) * 0.35,
                        phase: Math.random() * 6.28,
                        isFirefly: idx % 3 === 0,
                    }));
                    setCrisisBanner('victory');
                    spawnFloatingText(22.0, 6.5, 2.5, '🏆 GOLDEN MATSURI — 25/25 BIOGENESIS VICTORY!', '#34d399');
                }
            }
        }
    }

    // Track Win 2 (Metabolic Flexibility: cycling 16–24 around ~20) & Win 3 (Homeostasis: >5 min steady-state)
    const curGarrison = SimState.targetGarrisonSize || 20;
    if (curGarrison !== (SimState.lastTrackedGarrisonSize || 20)) {
        if (curGarrison > (SimState.lastTrackedGarrisonSize || 20)) SimState.flexUpCount = (SimState.flexUpCount || 0) + 1;
        else SimState.flexDownCount = (SimState.flexDownCount || 0) + 1;
        SimState.lastTrackedGarrisonSize = curGarrison;
        SimState.homeostasisTimer = 0;
    }

    if (!SimState.victoryAchieved && SimState.crisisState === 'none' && !SimState.cellDead && !SimState.senescenceActive && !SimState.roninRebelling && !SimState.necrosisSequence && !SimState.starvationSequence) {
        const spawnMatsuriPetals = () => Array.from({ length: 28 }, (_, idx) => ({
            gx: 4.0 + Math.random() * 29.0,
            gy: 3.5 + Math.random() * 10.5,
            gz: 0.4 + Math.random() * 2.6,
            vx: 0.45 + Math.random() * 0.55,
            vy: (Math.random() - 0.5) * 0.35,
            phase: Math.random() * 6.28,
            isFirefly: idx % 3 === 0,
        }));
        // Win 2: Metabolic Flexibility (at least 2 up-shifts and 2 down-shifts, staying within 16-24 and hovering near ~20)
        if ((SimState.flexUpCount || 0) >= 2 && (SimState.flexDownCount || 0) >= 2 && curGarrison >= 18 && curGarrison <= 22) {
            SimState.victoryAchieved = true;
            SimState.victoryType = 'flexibility';
            SimState.matsuriPetals = spawnMatsuriPetals();
            setCrisisBanner('flexibility');
            spawnFloatingText(22.0, 6.5, 2.5, '☯️ METABOLIC FLEXIBILITY ACHIEVED!', '#22d3ee');
        } else {
            // Win 3: Homeostasis (>5 min = 300s of clean steady-state without crises, high ROS, or desertion escalation)
            const inSteadyState = !SimState.warburgActive && SimState.rosLevel < 35 && SimState.etcDamage < 15 && SimState.ronin.length <= 6 && curGarrison >= 15 && curGarrison <= 24;
            if (inSteadyState) {
                SimState.homeostasisTimer = (SimState.homeostasisTimer || 0) + dt;
                if (SimState.homeostasisTimer >= 300.0) {
                    SimState.victoryAchieved = true;
                    SimState.victoryType = 'homeostasis';
                    SimState.matsuriPetals = spawnMatsuriPetals();
                    setCrisisBanner('homeostasis');
                    spawnFloatingText(22.0, 6.5, 2.5, '⚖️ HOMEOSTASIS (>5 MIN) ACHIEVED!', '#fbbf24');
                }
            } else if (SimState.rosLevel >= 50 || SimState.ronin.length >= 8) {
                SimState.homeostasisTimer = 0;
            }
        }
    }

    if (SimState.victoryAchieved && SimState.matsuriPetals && SimState.matsuriPetals.length > 0) {
        for (const pt of SimState.matsuriPetals) {
            pt.phase += dt * 2.8;
            pt.gx += pt.vx * dt;
            pt.gy += (pt.vy + Math.sin(pt.phase) * 0.25) * dt;
            if (pt.gx > 34.5) pt.gx = 3.5;
            if (pt.gy < 3.0) pt.gy = 13.5;
            if (pt.gy > 13.8) pt.gy = 3.2;
        }
    }

    // Extended Balanced Fasting Catabolic Pruning: Chronic low-glucose/low-mTOR fasting -> Ninja drags idle Samurai to east camp & drops smoke bomb (min 15)
    if (SimState.glucoseSupply <= 20 && SimState.samuraiDemand < 70 && !SimState.mtorActive && !SimState.warburgActive && !SimState.roninRebelling && !SimState.cellDead) {
        if (!SimState.pruningEvent) {
            SimState.fastingAtrophyTimer = Math.min(100, (SimState.fastingAtrophyTimer || 0) + dt * 3.8);
            if (SimState.fastingAtrophyTimer >= 100 && (SimState.targetGarrisonSize || 20) > 15 && SimState.ronin.length === 0) {
                SimState.fastingAtrophyTimer = 0;
                const victimIdx = SimState.samurai.findIndex(s => !s.isRonin && s.state !== 'chasingBandit' && s.state !== 'toWellhouseAMP' && s.state !== 'ringingWellhouseBell' && s.state !== 'consumingKoku');
                if (victimIdx !== -1) {
                    const victim = SimState.samurai[victimIdx];
                    SimState.samurai.splice(victimIdx, 1);
                    SimState.targetGarrisonSize = Math.max(15, (SimState.targetGarrisonSize || 20) - 1);
                    SimState.pruningEvent = {
                        phase: 'dragging',
                        timer: 0,
                        gx: victim.gx,
                        gy: victim.gy,
                        livery: victim.livery,
                        walkPhase: 0,
                        waypoints: [
                            { x: 30.65, y: 9.00 },
                            { x: 30.65, y: 7.75 },
                            { x: 32.85, y: 7.75 },
                            { x: 32.85, y: 8.60 }
                        ],
                        wpIdx: 0
                    };
                    spawnFloatingText(victim.gx, victim.gy, 1.85, '🥷 AMPK Pruning: Dragging Idle Samurai to East Camp!', '#c084fc');
                }
            }
        }
    } else if (SimState.mtorActive) {
        SimState.fastingAtrophyTimer = Math.max(0, (SimState.fastingAtrophyTimer || 0) - dt * 12.0);
    }

    if (SimState.pruningEvent) {
        const pe = SimState.pruningEvent;
        if (pe.phase === 'dragging') {
            const wp = pe.waypoints[pe.wpIdx];
            const distPe = Math.hypot(wp.x - pe.gx, wp.y - pe.gy);
            const dragSpd = 2.35;
            if (distPe <= Math.max(0.18, dragSpd * dt * 1.1)) {
                pe.wpIdx++;
                if (pe.wpIdx >= pe.waypoints.length) {
                    pe.phase = 'smokeBomb';
                    pe.timer = 0;
                    for (let k = 0; k < 18; k++) {
                        spawnParticle(pe.gx, pe.gy, 0.65, (Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 2.4, 1.9, k % 2 === 0 ? '#cbd5e1' : '#c084fc', 4.4, 0.85);
                    }
                    spawnFloatingText(pe.gx, pe.gy, 1.9, `💨 *POOF!* Autophagic Pruning (-1 Samurai → ${SimState.targetGarrisonSize}/15 Min)`, '#e2e8f0');
                }
            } else {
                const ang = Math.atan2(wp.y - pe.gy, wp.x - pe.gx);
                pe.gx += Math.cos(ang) * dragSpd * dt;
                pe.gy += Math.sin(ang) * dragSpd * dt;
                pe.walkPhase = (pe.walkPhase || 0) + dragSpd * dt * 5.2;
            }
        } else if (pe.phase === 'smokeBomb') {
            pe.timer += dt;
            if (pe.timer >= 1.8) {
                SimState.pruningEvent = null;
                if (SimState.targetGarrisonSize <= 15 && !SimState.atrophyAdvised && SimState.crisisState === 'none') {
                    SimState.atrophyAdvised = true;
                    setCrisisBanner('atrophy');
                    spawnFloatingText(30.5, 9.5, 2.2, '🪶 LEAN MINIMUM (15/25) — REDUCED SURGE RESERVE', '#a5b4fc');
                }
            }
        }
    }

    // Dynamic Overfed / Balanced Fasting button labels guiding the 3-phase cycle
    const btnOverfed = document.getElementById('btnPresetOverfed');
    if (btnOverfed) {
        const inHighWorkload = SimState.samuraiDemand >= 70 && !SimState.warburgActive && !SimState.roninRebelling && !SimState.cellDead;
        const showRecovery = (inHighWorkload && SimState.ronin.length >= 4 && !SimState.recoveryFedWithPriming)
            || ((SimState.recoveryWindowTimer || 0) > 0 && !SimState.cellDead && !SimState.warburgActive);
        btnOverfed.textContent = showRecovery ? '🍲 Recovery / Feeding' : '🍱 Sedentary Overfed (State 4)';
        btnOverfed.classList.toggle('ring-1', showRecovery);
        btnOverfed.classList.toggle('ring-emerald-400/70', showRecovery);
        btnOverfed.classList.toggle('text-emerald-200', showRecovery);
    }
    const btnFasted = document.getElementById('btnPresetFasted');
    if (btnFasted) {
        const readyToSeal = !!SimState.recoveryFedWithPriming && SimState.ronin.length === 0 && (SimState.exercisePriming || 0) >= 50 && (SimState.targetGarrisonSize || 20) < 25;
        btnFasted.textContent = readyToSeal ? '🥑 Balanced Fasting (+1 Ready!)' : '🥑 Balanced Fasting (Ketones)';
        btnFasted.classList.toggle('ring-1', readyToSeal);
        btnFasted.classList.toggle('ring-emerald-400/70', readyToSeal);
    }

    // 11. DAM LEAK, HOUSEKEEPING AQUEDUCT & ONSEN UCP1 THERMOGENESIS
    const hkDrain = SimState.damLevel > 5 ? BioConfig.basalHousekeepingLeak : 0;
    SimState.housekeepingRate = hkDrain;
    SimState.damLevel = Math.max(0, SimState.damLevel - hkDrain * dt * 0.45);
    if (hkDrain > 0) {
        SimState.housekeepingWheelAngle += dt * 3.2;
        SimState.housekeepingParticleTimer += dt;
        if (SimState.housekeepingParticleTimer > 0.28) {
            SimState.housekeepingParticleTimer = 0;
            spawnParticle(20.6, 4.2, 1.15, 0, 1.4, -0.2, '#818cf8', 2.6, 0.5);
        }
    }

    if (SimState.sluiceOpen && SimState.damLevel > 2) {
        const ventRate = (12.0 + (SimState.damLevel / 100) * 18.0);
        // When auto-cracked by ROS (rather than full Cold/User UCP1), drain is partial (0.22x) — insufficient for extreme glucose overload!
        const rosPartialMult = SimState.rosSluiceTimer > 0 ? 0.22 : 1.0;
        SimState.damLevel = Math.max(0, SimState.damLevel - ventRate * dt * 0.65 * rosPartialMult);
        SimState.heatRate = ventRate * 0.45 * rosPartialMult;
        if (Math.random() < 0.65) {
            spawnParticle(29.8 + (Math.random() - 0.5) * 1.1, 5.1 + (Math.random() - 0.5) * 0.9, 0.5, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, 1.8 + Math.random() * 0.8, 'rgba(226, 232, 240, 0.78)', 5.2, 0.85);
        }
    } else {
        SimState.heatRate = Math.max(0, SimState.heatRate - dt * 15.0);
    }

    SimState.atpCounterWindow = SimState.atpCounterWindow.filter(t => time - t <= 3.0);
    SimState.atpRate = SimState.atpCounterWindow.length / 3.0;

    // 12. UPDATE PARTICLES, FLOATING TEXTS & RIVER RIPPLES
    for (let i = SimState.particles.length - 1; i >= 0; i--) {
        const pt = SimState.particles[i];
        pt.life += dt;
        if (pt.life >= pt.maxLife) {
            SimState.particles.splice(i, 1);
            continue;
        }
        if (pt.type === 'pipePulse') {
            const f = pt.life / pt.maxLife;
            pt.gx = pt.gx1 + (pt.gx2 - pt.gx1) * f;
            pt.gy = pt.gy1 + (pt.gy2 - pt.gy1) * f;
            pt.gz = pt.gz1 + (pt.gz2 - pt.gz1) * f;
        } else {
            pt.gx += (pt.vx || 0) * dt;
            pt.gy += (pt.vy || 0) * dt;
            pt.gz += (pt.vz || 0) * dt;
        }
    }

    for (let i = SimState.floatingTexts.length - 1; i >= 0; i--) {
        const ft = SimState.floatingTexts[i];
        ft.life += dt;
        ft.gz += dt * 0.75;
        if (ft.life >= ft.maxLife) SimState.floatingTexts.splice(i, 1);
    }

    for (let i = SimState.ripples.length - 1; i >= 0; i--) {
        const rp = SimState.ripples[i];
        rp.radius += dt * 1.4;
        rp.alpha -= dt * 0.95;
        if (rp.alpha <= 0) SimState.ripples.splice(i, 1);
    }

    updateHUD();
};

// V4 Sprite Renderers: Detailed Xenobiotic Bandits, Warburg / mSLP Fermentation Fires & Enhanced Samurai States
function drawXenobioticBandit(b) {
    const pos = isoToScreen(b.gx, b.gy, 0.22);
    const z = Camera.zoom;
    const time = performance.now() * 0.001;
    const phase = b.walkPhase || 0;
    const clubPhase = b.clubPhase || phase;
    const stride = Math.sin(phase) * (b.engaged ? 2.4 : 3.6) * z;
    const kneeLiftL = Math.max(0, -Math.cos(phase)) * 2.0 * z;
    const kneeLiftR = Math.max(0, Math.cos(phase)) * 2.0 * z;
    const breath = Math.sin(time * 3.8 + (b.id || 0)) * 0.45 * z;
    const bob = Math.abs(Math.cos(phase)) * 1.45 * z + breath;
    const swagger = Math.sin(phase * 0.5) * 1.05 * z;
    const capeWave = Math.sin(phase * 1.3 + time * 4.5) * 2.4 * z;
    ctx.save();

    // Ground shadow + Toxic lime-purple miasma aura
    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2.2 * z, 7.8 * z, 3.4 * z, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = b.engaged ? 'rgba(250, 204, 21, 0.28)' : 'rgba(163, 230, 53, 0.34)';
    ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2 * z, 10.2 * z, 4.6 * z, 0, 0, Math.PI * 2); ctx.fill();

    // Billowing tattered brigand cloak behind torso
    ctx.fillStyle = '#2e1065';
    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 0.9 * z;
    ctx.beginPath();
    ctx.moveTo(pos.x - 5.2 * z + swagger * 0.2, pos.y - 15.8 * z - bob);
    ctx.lineTo(pos.x - 8.4 * z + capeWave, pos.y - 4.5 * z - bob * 0.4);
    ctx.lineTo(pos.x - 3.5 * z + capeWave * 0.5, pos.y - 5.8 * z - bob * 0.4);
    ctx.lineTo(pos.x + 1.5 * z + capeWave * 0.3, pos.y - 4.2 * z - bob * 0.4);
    ctx.lineTo(pos.x + 5.2 * z + swagger * 0.2, pos.y - 15.8 * z - bob);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Articulated 2-segment tattered charcoal hakama legs, purple kyahan shin wraps & waraji sandals
    ctx.strokeStyle = '#27272a'; ctx.lineWidth = 2.6 * z; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pos.x - 2.0 * z, pos.y - 6.8 * z - bob * 0.4);
    ctx.lineTo(pos.x - 2.2 * z - stride * 0.5, pos.y - 2.6 * z - kneeLiftL);
    ctx.lineTo(pos.x - 2.4 * z - stride, pos.y + 1.0 * z - kneeLiftL * 0.35);
    ctx.moveTo(pos.x + 2.0 * z, pos.y - 6.8 * z - bob * 0.4);
    ctx.lineTo(pos.x + 2.2 * z + stride * 0.5, pos.y - 2.6 * z - kneeLiftR);
    ctx.lineTo(pos.x + 2.4 * z + stride, pos.y + 1.0 * z - kneeLiftR * 0.35);
    ctx.stroke();
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.5 * z;
    ctx.beginPath();
    ctx.moveTo(pos.x - 2.2 * z - stride * 0.55, pos.y - 2.4 * z - kneeLiftL * 0.6);
    ctx.lineTo(pos.x - 2.4 * z - stride, pos.y + 0.5 * z - kneeLiftL * 0.35);
    ctx.moveTo(pos.x + 2.2 * z + stride * 0.55, pos.y - 2.4 * z - kneeLiftR * 0.6);
    ctx.lineTo(pos.x + 2.4 * z + stride, pos.y + 0.5 * z - kneeLiftR * 0.35);
    ctx.stroke();
    ctx.fillStyle = '#09090b';
    ctx.beginPath(); ctx.ellipse(pos.x - 2.4 * z - stride, pos.y + 1.3 * z - kneeLiftL * 0.35, 1.9 * z, 1.0 * z, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(pos.x + 2.4 * z + stride, pos.y + 1.3 * z - kneeLiftR * 0.35, 1.9 * z, 1.0 * z, 0, 0, Math.PI * 2); ctx.fill();

    // Left arm holding glowing toxic Xenobiotic Flask
    const leftSwing = Math.sin(phase) * 1.8 * z;
    ctx.strokeStyle = '#3b0764'; ctx.lineWidth = 2.1 * z;
    ctx.beginPath();
    ctx.moveTo(pos.x - 5.2 * z + swagger * 0.25, pos.y - 14.5 * z - bob);
    ctx.lineTo(pos.x - 7.8 * z + leftSwing * 0.5, pos.y - 10.2 * z - bob);
    ctx.stroke();
    ctx.fillStyle = '#84cc16'; ctx.strokeStyle = '#ecfccb'; ctx.lineWidth = 0.8 * z;
    ctx.beginPath(); ctx.arc(pos.x - 8.2 * z + leftSwing * 0.5, pos.y - 9.2 * z - bob, 2.3 * z, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // Spiked purple-lacquer Do chest armour + Kusazuri waist tassets + diagonal bandolier
    ctx.fillStyle = '#3b0764'; ctx.strokeStyle = '#a3e635'; ctx.lineWidth = 1.25 * z;
    ctx.beginPath(); ctx.roundRect(pos.x - 5.8 * z + swagger * 0.25, pos.y - 16.5 * z - bob, 11.6 * z, 10.2 * z, 2.4 * z); ctx.fill(); ctx.stroke();
    // Kusazuri tasset plates
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(pos.x - 5.4 * z + swagger * 0.25, pos.y - 7.4 * z - bob, 4.8 * z, 2.4 * z);
    ctx.fillRect(pos.x + 0.6 * z + swagger * 0.25, pos.y - 7.4 * z - bob, 4.8 * z, 2.4 * z);
    // Diagonal bandolier & Oni chest clasp
    ctx.strokeStyle = '#a3e635'; ctx.lineWidth = 1.4 * z;
    ctx.beginPath();
    ctx.moveTo(pos.x - 4.8 * z + swagger * 0.25, pos.y - 15.8 * z - bob);
    ctx.lineTo(pos.x + 4.8 * z + swagger * 0.25, pos.y - 8.5 * z - bob);
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.arc(pos.x + swagger * 0.25, pos.y - 12.2 * z - bob, 1.5 * z, 0, Math.PI * 2); ctx.fill();

    // Spiked shoulder guards (Sode)
    ctx.fillStyle = '#581c87'; ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 0.8 * z;
    ctx.fillRect(pos.x - 7.5 * z + swagger * 0.25, pos.y - 16.2 * z - bob, 2.4 * z, 4.8 * z);
    ctx.strokeRect(pos.x - 7.5 * z + swagger * 0.25, pos.y - 16.2 * z - bob, 2.4 * z, 4.8 * z);
    ctx.fillRect(pos.x + 5.1 * z + swagger * 0.25, pos.y - 16.2 * z - bob, 2.4 * z, 4.8 * z);
    ctx.strokeRect(pos.x + 5.1 * z + swagger * 0.25, pos.y - 16.2 * z - bob, 2.4 * z, 4.8 * z);

    // Toxic lime sash
    ctx.fillStyle = '#a3e635';
    ctx.fillRect(pos.x - 5.4 * z + swagger * 0.25, pos.y - 9.2 * z - bob, 10.8 * z, 1.7 * z);

    // Articulated right arm & studded iron Kanabo war club with multi-frame swing arc
    const clubAng = -0.65 + Math.sin(clubPhase) * (b.engaged ? 0.95 : 0.42);
    ctx.save();
    ctx.translate(pos.x + 4.8 * z, pos.y - 12.2 * z - bob);
    ctx.rotate(clubAng);
    if (b.engaged && Math.cos(clubPhase) > 0.25) {
        ctx.strokeStyle = 'rgba(163, 230, 53, 0.42)';
        ctx.lineWidth = 3.2 * z;
        ctx.beginPath(); ctx.arc(0, 0, 12.8 * z, -1.1, 0.4); ctx.stroke();
    }
    ctx.strokeStyle = '#18181b'; ctx.lineWidth = 3.2 * z;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12.0 * z, -10.0 * z); ctx.stroke();
    ctx.strokeStyle = '#a3e635'; ctx.lineWidth = 1.4 * z;
    ctx.beginPath(); ctx.moveTo(4.0 * z, -3.4 * z); ctx.lineTo(12.0 * z, -10.0 * z); ctx.stroke();
    // Iron studs along the Kanabo head
    ctx.fillStyle = '#e2e8f0';
    for (const st of [0.45, 0.65, 0.85]) {
        ctx.beginPath(); ctx.arc(12.0 * st * z, -10.0 * st * z - 1.2 * z, 0.95 * z, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(12.0 * st * z + 1.0 * z, -10.0 * st * z + 0.8 * z, 0.95 * z, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // Masked Bandit Head (Oni Menpo half-mask with glowing toxic eyes, fangs & curved Oni horns)
    ctx.fillStyle = '#18181b';
    ctx.beginPath(); ctx.arc(pos.x + swagger * 0.3, pos.y - 19.4 * z - bob, 3.8 * z, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a3e635';
    ctx.fillRect(pos.x - 2.4 * z + swagger * 0.3, pos.y - 20.2 * z - bob, 1.8 * z, 1.3 * z);
    ctx.fillRect(pos.x + 0.6 * z + swagger * 0.3, pos.y - 20.2 * z - bob, 1.8 * z, 1.3 * z);
    // Oni fangs
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(pos.x - 1.6 * z + swagger * 0.3, pos.y - 17.5 * z - bob);
    ctx.lineTo(pos.x - 1.0 * z + swagger * 0.3, pos.y - 18.6 * z - bob);
    ctx.lineTo(pos.x - 0.4 * z + swagger * 0.3, pos.y - 17.5 * z - bob);
    ctx.moveTo(pos.x + 0.4 * z + swagger * 0.3, pos.y - 17.5 * z - bob);
    ctx.lineTo(pos.x + 1.0 * z + swagger * 0.3, pos.y - 18.6 * z - bob);
    ctx.lineTo(pos.x + 1.6 * z + swagger * 0.3, pos.y - 17.5 * z - bob);
    ctx.fill();

    // Weathered bamboo Sandogasa straw hat with toxic-lime rim & Oni horns peeking out
    ctx.fillStyle = '#3f2e1d'; ctx.strokeStyle = '#a3e635'; ctx.lineWidth = 1.15 * z;
    ctx.beginPath();
    ctx.moveTo(pos.x - 9.0 * z + swagger * 0.3, pos.y - 20.8 * z - bob);
    ctx.lineTo(pos.x + swagger * 0.3, pos.y - 26.2 * z - bob);
    ctx.lineTo(pos.x + 9.0 * z + swagger * 0.3, pos.y - 20.8 * z - bob);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Bamboo weave rib lines
    ctx.strokeStyle = 'rgba(163, 230, 53, 0.35)'; ctx.lineWidth = 0.7 * z;
    ctx.beginPath();
    ctx.moveTo(pos.x + swagger * 0.3, pos.y - 26.0 * z - bob); ctx.lineTo(pos.x - 4.2 * z + swagger * 0.3, pos.y - 21.0 * z - bob);
    ctx.moveTo(pos.x + swagger * 0.3, pos.y - 26.0 * z - bob); ctx.lineTo(pos.x + 4.2 * z + swagger * 0.3, pos.y - 21.0 * z - bob);
    ctx.stroke();

    // Detoxification progress bar above Bandit
    const detFrac = Math.max(0, Math.min(1, 1 - b.chaseTimer / b.requiredChaseTime));
    const bw = 26 * z, bh = 3.6 * z;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(pos.x - bw / 2, pos.y - 32.0 * z - bob, bw, bh);
    ctx.fillStyle = b.engaged ? '#facc15' : '#a3e635';
    ctx.fillRect(pos.x - bw / 2, pos.y - 32.0 * z - bob, bw * detFrac, bh);

    if (SimState.showLabels) {
        ctx.font = `bold ${Math.round(8 * z)}px Inter, sans-serif`;
        ctx.fillStyle = b.engaged ? '#fef08a' : '#bef264';
        ctx.textAlign = 'center';
        ctx.fillText(b.engaged ? '🧪 BANDIT (Suppressed!)' : '🧪 XENOBIOTIC BANDIT', pos.x, pos.y - 34.5 * z - bob);
    }
    ctx.restore();
}

// Wrap drawSamuraiRetainer to render "Asterix Magic Potion" Koku Consumption, Pursuit Stamina, AMP Donor Ring & Warburg Zombie Aura
const _v3DrawSamuraiRetainer = drawSamuraiRetainer;
drawSamuraiRetainer = function (s) {
    const pos = isoToScreen(s.gx, s.gy, 0.22);
    const z = Camera.zoom;

    // Warburg Zombie Neon-Green Aura when etcDamage >= 99.5%
    if (SimState.crisisState === 'warburg') {
        ctx.save();
        ctx.fillStyle = 'rgba(57, 255, 20, 0.26)';
        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 1.4 * z;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 1.5 * z, 10.5 * z, 5.0 * z, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    // Golden "Asterix Magic Potion" Power-Up Aura when physically taking/consuming gifted Koku energy
    if (s.state === 'consumingKoku') {
        const pulse = 0.5 + 0.5 * Math.sin((s.sparPhase || 0) * 1.5);
        ctx.save();
        ctx.fillStyle = `rgba(250, 204, 21, ${0.24 + pulse * 0.18})`;
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.2 * z;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 1.5 * z, (11 + pulse * 3.5) * z, (5.2 + pulse * 1.6) * z, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    // Cyan AMP Ring when running to the Wellhouse or ringing the Wellhouse Alarm Bell during Adenylate Kinase salvage
    if (s.state === 'toWellhouseAMP' || s.state === 'ringingWellhouseBell') {
        ctx.save();
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.2 * z;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 1.5 * z, 11 * z, 5.2 * z, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    _v3DrawSamuraiRetainer(s);

    // Overlay for "Asterix Magic Potion" Koku Consumption, Pursuing Bandit, or AMP Donor States
    if (s.state === 'consumingKoku') {
        const gulpBob = Math.sin((s.sparPhase || 0) * 1.8) * 2.2 * z;
        const dur = s.consumeDuration || 2.25;
        const prog = Math.max(0, Math.min(1, 1 - (s.consumeTimer || 0) / dur));
        ctx.save();
        // Both arms raised overhead holding the glowing Golden Koku Elixir Gourd / Bale
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5 * z;
        ctx.beginPath();
        ctx.moveTo(pos.x - 5.2 * z, pos.y - 16.0 * z);
        ctx.lineTo(pos.x - 3.2 * z, pos.y - 27.5 * z + gulpBob);
        ctx.moveTo(pos.x + 5.2 * z, pos.y - 16.0 * z);
        ctx.lineTo(pos.x + 3.2 * z, pos.y - 27.5 * z + gulpBob);
        ctx.stroke();

        // Tilted Golden Koku Gourd (Hyotan) pouring magic energy into the Samurai
        const gx = pos.x, gy = pos.y - 30.0 * z + gulpBob;
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.2 * z;
        ctx.beginPath();
        ctx.arc(gx - 2.2 * z, gy - 2.0 * z, 3.8 * z, 0, Math.PI * 2);
        ctx.arc(gx + 2.0 * z, gy + 1.2 * z, 2.6 * z, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Golden elixir stream & lightning sparks
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.8 * z;
        ctx.beginPath();
        ctx.moveTo(gx + 1.0 * z, gy + 3.2 * z);
        ctx.lineTo(pos.x, pos.y - 21.5 * z);
        ctx.stroke();

        // Power-up progress bar & callout
        const kw = 24 * z, kh = 3.6 * z;
        const kx = pos.x - kw / 2, ky = pos.y - 39.5 * z;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(kx, ky, kw, kh);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(kx, ky, kw * prog, kh);
        if (SimState.showLabels) {
            ctx.font = `bold ${Math.round(8 * z)}px Inter, sans-serif`;
            ctx.fillStyle = '#fef08a';
            ctx.textAlign = 'center';
            ctx.fillText('🧪 Taking Koku Potion! ⚡', pos.x, ky - 2.5 * z);
        }
        ctx.restore();
    } else if (s.state === 'chasingBandit') {
        ctx.save();
        const kw = 22 * z, kh = 3.5 * z;
        const kx = pos.x - kw / 2, ky = pos.y - 35 * z;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(kx, ky, kw, kh);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(kx, ky, kw * Math.max(0, Math.min(1, s.kokuEnergy)), kh);
        if (SimState.showLabels) {
            ctx.font = `bold ${Math.round(8 * z)}px Inter, sans-serif`;
            ctx.fillStyle = '#fef08a';
            ctx.textAlign = 'center';
            ctx.fillText('⚔️ Pursuing!', pos.x, ky - 2.5 * z);
        }
        ctx.restore();
    } else if (s.state === 'toWellhouseAMP') {
        if (SimState.showLabels) {
            ctx.save();
            ctx.font = `bold ${Math.round(8 * z)}px Inter, sans-serif`;
            ctx.fillStyle = '#22d3ee';
            ctx.textAlign = 'center';
            ctx.fillText('🔔 AMP → Wellhouse!', pos.x, pos.y - 32 * z);
            ctx.restore();
        }
    } else if (s.state === 'ringingWellhouseBell') {
        if (SimState.showLabels) {
            ctx.save();
            ctx.font = `bold ${Math.round(8 * z)}px Inter, sans-serif`;
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'center';
            ctx.fillText('🔔 Ringing AMPK Alarm!', pos.x, pos.y - 32 * z);
            ctx.restore();
        }
    } else if (s.state === 'toCalligraphy') {
        if (SimState.showLabels) {
            ctx.save();
            ctx.font = `bold ${Math.round(7.5 * z)}px Inter, sans-serif`;
            ctx.fillStyle = '#fde047';
            ctx.textAlign = 'center';
            ctx.fillText('🌾 Koku → GNG Pavilion', pos.x, pos.y - 31 * z);
            ctx.restore();
        }
    } else if (s.state === 'calligraphy') {
        const strokeBob = Math.sin((s.sparPhase || 0) * 2.4) * 2.2 * z;
        const prog = Math.max(0, Math.min(1, 1 - (s.calligraphyTimer || 0) / 2.5));
        ctx.save();
        // White Shodo scroll & bamboo brush
        ctx.fillStyle = '#fefce8';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.1 * z;
        ctx.fillRect(pos.x - 9 * z, pos.y - 6 * z, 18 * z, 7 * z);
        ctx.strokeRect(pos.x - 9 * z, pos.y - 6 * z, 18 * z, 7 * z);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.6 * z;
        ctx.beginPath();
        ctx.moveTo(pos.x + 4 * z, pos.y - 16 * z);
        ctx.lineTo(pos.x + 1 * z + strokeBob, pos.y - 2.5 * z);
        ctx.stroke();

        const kw = 22 * z, kh = 3.2 * z;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(pos.x - kw / 2, pos.y - 37 * z, kw, kh);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(pos.x - kw / 2, pos.y - 37 * z, kw * prog, kh);

        if (SimState.showLabels) {
            ctx.font = `bold ${Math.round(7.8 * z)}px Inter, sans-serif`;
            ctx.fillStyle = '#fef08a';
            ctx.textAlign = 'center';
            ctx.fillText('🖌️ Shodo (GNG Koku Donated)', pos.x, pos.y - 40.5 * z);
        }
        ctx.restore();
    } else if (s.state === 'recoveringAMP' || (s.isRecoveringAMP && s.state === 'approaching')) {
        if (SimState.showLabels) {
            ctx.save();
            ctx.font = `bold ${Math.round(7.5 * z)}px Inter, sans-serif`;
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText('😮‍💨 AMP → ADP (Returning)', pos.x, pos.y - 31 * z);
            ctx.restore();
        }
    }
};

// Wrap drawWaterPumpWheel to show purple-lime ETC Scarring crust when etcDamage > 15%
const _v3DrawWaterPumpWheel = drawWaterPumpWheel;
drawWaterPumpWheel = function (gx, gy, gz, angle, isSpinning, rimColor = '#38bdf8') {
    const scarCol = (SimState.etcDamage > 35 && rimColor !== '#facc15' && rimColor !== '#818cf8')
        ? (SimState.etcDamage > 75 ? '#a3e635' : '#c084fc')
        : rimColor;
    _v3DrawWaterPumpWheel(gx, gy, gz, angle, isSpinning, scarCol);
};

// Wrap renderScene to draw Adenylate Kinase shockwave and Floating Callouts
const _v3RenderScene = renderScene;
renderScene = function () {
    _v3RenderScene();
    const time = performance.now() * 0.001;

    // Render Adenylate Kinase (2ADP -> ATP + AMP) Reaction Shockwave Ring at Castle Queue
    if ((SimState.akTradeFlashTimer || 0) > 0 && SimState.akTradePos) {
        const z = Camera.zoom;
        const tFrac = 1 - (SimState.akTradeFlashTimer / 0.65);
        const pos = isoToScreen(SimState.akTradePos.gx, SimState.akTradePos.gy, 0.45);
        ctx.save();
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.9 * (1 - tFrac)})`;
        ctx.lineWidth = 2.6 * z;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, (10 + tFrac * 26) * z, (5 + tFrac * 13) * z, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.9 * (1 - tFrac)})`;
        ctx.lineWidth = 2.0 * z;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, (6 + tFrac * 18) * z, (3 + tFrac * 9) * z, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // Render floating biochemical callout texts
    const z = Camera.zoom;
    for (const ft of SimState.floatingTexts) {
        const pos = isoToScreen(ft.gx, ft.gy, ft.gz);
        const alpha = Math.max(0, 1 - ft.life / ft.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${Math.round(10 * z)}px Inter, sans-serif`;
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, pos.x + 1, pos.y + 1);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, pos.x, pos.y);
        ctx.restore();
    }
};

// Extend updateHUD with V4 Telemetry (ETC Scarring, ATP:ADP:AMP + Sky-Blue AMP Segment, Toxin/Bandit status)
const _v3UpdateHUD = updateHUD;
updateHUD = function () {
    _v3UpdateHUD();

    const atp = SimState.atpCount || 0;
    const adp = SimState.adpCount || 0;
    const amp = SimState.ampCount || 0;
    const total = Math.max(1, atp + adp + amp);

    const poolEl = document.getElementById('hudPoolRatio');
    if (poolEl) {
        if (amp > 0) {
            poolEl.innerHTML = `<span class="text-emerald-300">${atp}</span>:<span class="text-slate-300">${adp}</span>:<span class="text-sky-400 animate-pulse">${amp}</span>`;
        } else {
            poolEl.textContent = `${atp}:${adp}:${amp}`;
        }
    }

    const atpBar = document.getElementById('hudAtpBar');
    const adpBar = document.getElementById('hudAdpBar');
    const ampBar = document.getElementById('hudAmpBar');
    if (atpBar && adpBar && ampBar) {
        atpBar.style.width = `${(atp / total) * 100}%`;
        adpBar.style.width = `${(adp / total) * 100}%`;
        ampBar.style.width = `${(amp / total) * 100}%`;
    }

    const scarVal = Math.round(SimState.etcDamage || 0);
    const scarTextEl = document.getElementById('hudEtcScarText');
    const scarBarEl = document.getElementById('hudEtcScarBar');
    if (scarTextEl && scarBarEl) {
        scarTextEl.textContent = `${scarVal}%`;
        scarBarEl.style.width = `${scarVal}%`;
        scarTextEl.className = scarVal >= 55
            ? 'font-mono font-bold text-lime-400'
            : (scarVal >= 25 ? 'font-mono font-bold text-purple-400' : 'font-mono font-bold text-slate-300');
    }

    const banditStatusEl = document.getElementById('lblBanditStatus');
    if (banditStatusEl) {
        if (SimState.crisisState === 'warburg') {
            banditStatusEl.textContent = '🧟 Warburg Locked';
            banditStatusEl.className = 'text-lime-400 font-bold';
        } else if (SimState.bandits.length > 0) {
            const supCount = SimState.bandits.filter(b => b.engaged).length;
            banditStatusEl.textContent = `${SimState.bandits.length} Raiding (${supCount} Parried)`;
            banditStatusEl.className = 'text-lime-300 font-semibold';
        } else if (SimState.etcDamage > 0 && SimState.toxinLoad < 15) {
            banditStatusEl.textContent = `Repairing (-${SimState.gshReserve > 60 ? 'GSH' : 'Wait'})`;
            banditStatusEl.className = 'text-emerald-300';
        } else {
            banditStatusEl.textContent = 'Trail Clear';
            banditStatusEl.className = 'text-lime-300/80';
        }
    }

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

    // F-08: Glycogen & GNG Output HUD Readout
    const glycPct = Math.round(SimState.glycogenLevel || 0);
    const glycTextEl = document.getElementById('hudGlycogenText');
    const glycBarEl = document.getElementById('hudGlycogenBar');
    const gngBadgeEl = document.getElementById('hudGngBadge');
    if (glycTextEl && glycBarEl) {
        glycTextEl.textContent = `${glycPct}%`;
        glycBarEl.style.width = `${glycPct}%`;
    }
    if (gngBadgeEl) {
        if (SimState.glycogenMode === 'glycogenesis') {
            gngBadgeEl.textContent = '⬇ Glycogenesis (Storing)';
            gngBadgeEl.className = 'text-[9px] font-semibold text-cyan-300 truncate mt-0.5';
        } else if (SimState.glycogenMode === 'glycogenolysis') {
            gngBadgeEl.textContent = '⬆ Glycogenolysis (Tier 1)';
            gngBadgeEl.className = 'text-[9px] font-semibold text-amber-300 truncate mt-0.5';
        } else if (SimState.gngActive) {
            const tierStr = SimState.gngTier === 'alanine' ? 'Tier 3: Alanine' : 'Tier 2: Lactate+Glycerol';
            const kokuStr = SimState.gngEnergyCredit > 0.05 ? `Out: ${SimState.gngOutputCount}` : 'Need Koku!';
            gngBadgeEl.textContent = `⬆ GNG (${tierStr}) • ${kokuStr}`;
            gngBadgeEl.className = SimState.gngEnergyCredit > 0.05
                ? 'text-[9px] font-semibold text-sky-300 truncate mt-0.5'
                : 'text-[9px] font-semibold text-amber-400 truncate mt-0.5';
        } else {
            gngBadgeEl.textContent = 'GNG: Idle (Fwd Glycolysis)';
            gngBadgeEl.className = 'text-[9px] font-semibold text-slate-400 truncate mt-0.5';
        }
    }
};

// Add V4/V6 Presets immediately at module load
Presets.warburg = {
    fat: 45, gluc: 55, demand: 45, antiox: 72, toxin: 45, sluice: false,
    gshReserve: 76
};
Presets.necrosis = {
    fat: 40, gluc: 50, demand: 60, antiox: 18, toxin: 95, sluice: false,
    gshReserve: 28
};

function applyScenarioPreset(presetName) {
    const p = Presets[presetName];
    if (!p) return;
    const wasTerminal = SimState.cellDead || SimState.senescenceActive || SimState.crisisState !== 'none';
    if (SimState.crisisState !== 'none') setCrisisBanner('none');
    if (wasTerminal) {
        initSamuraiGarrison();
        SimState.etcDamage = 0;
        SimState.warburgActive = false;
    } else {
        SimState.pulseAnimTimer = 0;
    }
    SimState.ninjaInterventionsUsed = 0;
    SimState.crisisTimer = 0;
    if (p.drainDam) SimState.damLevel = 10;

    SimState.preset = presetName;
    SimState.starvationTimer = 0;
    SimState._starvCartTimer = 0;
    SimState.fatSupply = p.fat;
    SimState.glucoseSupply = p.gluc;
    SimState.samuraiDemand = p.demand;
    SimState.antioxSynthesis = p.antiox;
    SimState.toxinLoad = p.toxin || 0;
    SimState.gshReserve = p.gshReserve !== undefined ? p.gshReserve : 85;

    const sFat = document.getElementById('sliderFat'); const vFat = document.getElementById('valFat');
    if (sFat) sFat.value = p.fat; if (vFat) vFat.textContent = `${p.fat}%`;
    const sGluc = document.getElementById('sliderGlucose'); const vGluc = document.getElementById('valGlucose');
    if (sGluc) sGluc.value = p.gluc; if (vGluc) vGluc.textContent = `${p.gluc}%`;
    const sDem = document.getElementById('sliderDemand'); const vDem = document.getElementById('valDemand');
    if (sDem) sDem.value = p.demand; if (vDem) vDem.textContent = `${p.demand}%`;
    const sAnt = document.getElementById('sliderAntiox'); const vAnt = document.getElementById('valAntiox');
    if (sAnt) sAnt.value = p.antiox; if (vAnt) vAnt.textContent = `${p.antiox}%`;
    const sTox = document.getElementById('sliderToxin'); const vTox = document.getElementById('valToxin');
    if (sTox) sTox.value = SimState.toxinLoad; if (vTox) vTox.textContent = `${SimState.toxinLoad}%`;

    setSluiceGate(p.sluice);

    // F-08: Preset-appropriate Glycogen & Spill-over pool initialization
    if (presetName === 'overfed') {
        SimState.glycogenLevel = 92; SimState.lactatePool = 20; SimState.glycerolPool = 25; SimState.alaninePool = 8;
        if (!wasTerminal && SimState.ronin.length >= 4) {
            SimState.exercisePriming = Math.max(SimState.exercisePriming || 0, 55);
            SimState.recoveryFedWithPriming = true;
            SimState.recoveryWindowTimer = 18.0;
            SimState.monkOrdainPending = false;
            spawnFloatingText(25.5, 6.2, 2.0, '🍲 RECOVERY / FEEDING: Re-recruiting Ronin — Switch to Balanced Fasting once all return!', '#34d399');
        } else {
            SimState.recoveryFedWithPriming = false;
            SimState.recoveryWindowTimer = 0;
        }
    } else if (presetName === 'fasted') {
        SimState.glycogenLevel = 12; SimState.lactatePool = 36; SimState.glycerolPool = 38; SimState.alaninePool = 14;
        if (!wasTerminal && SimState.recoveryFedWithPriming && (SimState.exercisePriming || 0) >= 50 && (SimState.targetGarrisonSize || 20) < 25) {
            SimState.monkOrdainPending = true;
        } else {
            SimState.recoveryFedWithPriming = false;
            SimState.recoveryWindowTimer = 0;
        }
    } else if (presetName === 'starvation') {
        SimState.glycogenLevel = 0; SimState.lactatePool = 8; SimState.glycerolPool = 6; SimState.alaninePool = 28;
    } else if (presetName === 'exercise') {
        SimState.glycogenLevel = 40; SimState.lactatePool = 52; SimState.glycerolPool = 24; SimState.alaninePool = 10;
    } else {
        SimState.glycogenLevel = 55; SimState.lactatePool = 28; SimState.glycerolPool = 22; SimState.alaninePool = 12;
    }
}
window.applyScenarioPreset = applyScenarioPreset;

// Wire up V4/V6 DOM controls & unified Scenario Presets
window.addEventListener('DOMContentLoaded', () => {
    const sliderToxin = document.getElementById('sliderToxin');
    const valToxin = document.getElementById('valToxin');
    if (sliderToxin && valToxin) {
        sliderToxin.addEventListener('input', (e) => {
            SimState.toxinLoad = Number(e.target.value);
            valToxin.textContent = `${SimState.toxinLoad}%`;
        });
    }

    const btnResetCrisis = document.getElementById('btnResetCrisis');
    if (btnResetCrisis) {
        btnResetCrisis.addEventListener('click', resetFullSimulation);
    }
    const btnContinueVictory = document.getElementById('btnContinueVictory');
    if (btnContinueVictory) {
        btnContinueVictory.addEventListener('click', () => {
            setCrisisBanner('none');
        });
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => applyScenarioPreset(btn.dataset.preset));
    });

    const btnPressPulse = document.getElementById('btnPressPulse');
    if (btnPressPulse) {
        btnPressPulse.addEventListener('click', () => {
            if (!SimState.pressActive || !SimState.warburgActive || SimState.etcDamage >= 99.5 || SimState.crisisState === 'warburg' || SimState.cellDead) return;
            if (SimState.pulseAnimTimer > 0.15) return; // Wait for current Pulse scoop to finish
            if ((SimState.succinatePool || 0) < 95) {
                // Premature anti-glutamine Pulse before Succinate overflow harms healthy host Glutamine/GSH!
                SimState.gshReserve = Math.max(0, SimState.gshReserve - 28);
                SimState.toxinLoad = Math.min(100, SimState.toxinLoad + 18);
                SimState.pulseAnimTimer = 0.8;
                SimState.fires.push({
                    gx: 14.3 + (Math.random() - 0.5) * 1.2,
                    gy: 8.6 + (Math.random() - 0.5) * 0.8,
                    intensity: 1.0
                });
                if (sliderToxin) sliderToxin.value = Math.round(SimState.toxinLoad);
                if (valToxin) valToxin.textContent = `${Math.round(SimState.toxinLoad)}%`;
                spawnFloatingText(14.3, 7.6, 2.2, '☠️ PREMATURE PULSE TOXICITY! Wait for Succinate Overflow (Starved Host GSH)!', '#f43f5e');
                return;
            }
            SimState.succinatePool = 0;
            SimState.pulseAnimTimer = 2.0;
            const pulseDrop = Math.max(4.5, 11.5 - ((SimState.etcDamage - 30) / 70) * 7.0);
            SimState.etcDamage = Math.max(0, SimState.etcDamage - pulseDrop);
            spawnFloatingText(14.3, 7.6, 2.1, `🪣 PULSE: Succinate Emptied (-${pulseDrop.toFixed(1)}% ETC Scarring)!`, '#f0abfc');
            if (SimState.etcDamage < 30) {
                SimState.warburgActive = false;
                SimState.damLevel = Math.max(SimState.damLevel, 38);
                SimState.roninRebelling = false;
                SimState.ronin = [];
                spawnFloatingText(8.5, 9.5, 2.4, '🌿 PRESS-PULSE SUCCESS: Warburg Switch Broken (<30%) & OxPhos Restored!', '#4ade80');
            }
        });
    }
});
