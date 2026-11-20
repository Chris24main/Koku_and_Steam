        /***********************************************************************
         * 1. GLOBAL BIOCONFIG & SIMULATION STATE
         ***********************************************************************/
        const BioConfig = {
            fatToCartRatio: 1.4,
            glucoseToCartRatio: 1.2,
            randleInhibitionStrength: 0.65,
            malonylInhibitionStrength: 0.70,
            pumpProtons: { complexI: 4, complexIII: 4, complexIV: 2 },
            rosDamThreshold: 82,
            wheelDrainRate: 7.2,
            basalHousekeepingLeak: 3.2,
            gshCostPerFire: 8,
            roninPatienceLimit: 9.0, // Patience seconds before an individual queued Samurai turns Ronin
            garrisonSize: 20,        // Fixed Adenylate Pool (20 Samurai total)
            ampkQueueThreshold: 10,  // Queue length (high ADP/AMP) that dispatches AMPK Ninjas
            ninjaBoostAmount: 5,     // Modest +5% substrate boost per Ninja intervention
            maxNinjaInterventions: 4,// Maximum Ninja waves per crisis
            mtorBuildSpeed: 1.0      // Multiplier for mTOR Monk scaffolding construction speed
        };

        const SimState = {
            fatSupply: 35,
            glucoseSupply: 40,
            samuraiDemand: 55,
            antioxSynthesis: 65,
            sluiceOpen: false,
            showLabels: false,
            showExplanations: true,

            effectiveFat: 35,
            effectiveGlucose: 40,
            fatInhibitionLevel: 0,
            randleBlockLevel: 0,
            insulinResistance: 0,
            glut4ForcedOpenTimer: 0,
            shrineScaffolding: 25,
            misfoldedBeams: 0,
            mtorActive: false,
            mtorKetoneSeal: false,
            senescenceActive: false,
            senescenceTimer: 0,

            lowCarbDuration: 0,
            ketogenesisActive: false,
            ketoneRate: 0,
            damLevel: 48,
            gshReserve: 85,
            atpRate: 0,
            heatRate: 0,
            housekeepingRate: 1.8,
            rosLevel: 0,
            roninCount: 0,
            atpCount: 14,
            adpCount: 6,
            ampkActive: false,
            ninjaInterventionsUsed: 0,
            crisisTimer: 0,
            cellDead: false,

            villageStock: { v1: 0, v2: 0, v3: 0, v4: 0 },

            fatTimer: 0,
            glucTimer: 0,
            ketoneTimer: 0,
            samuraiTimer: 0,
            ninjaSpawnTimer: 0,
            monkSpawnTimer: 0,
            porter1Timer: 0,
            porter2Timer: 0,
            porter3Timer: 0,
            brigadeSpawnTimer: 0,
            housekeepingParticleTimer: 0,
            wheelAngle: 0,
            housekeepingWheelAngle: 0,
            pumpAngles: { v1: 0, v3: 0, v4: 0 },
            pumpSpinTimers: { v1: 0, v3: 0, v4: 0 },
            fatChainOffset: 0,
            glucConveyorPhase: 0,
            glucSmashPhase: 0,
            atpCounterWindow: [],
            ketoneCounterWindow: [],

            carts: [],
            porters: [],
            samurai: [],
            ninjas: [],
            monks: [],
            samuraiQueueSeq: 0,
            ronin: [],
            fires: [],
            particles: [],
            ripples: [],
            brigade: [],
            thrownBales: [],
            ketoneButterflies: [],
            village4Press: { ballsCount: 0, timer: 0, overheated: false, slamAnim: 0, cyclePhase: 'idle', cycleTimer: 0 }
        };

        const SamuraiLiveries = [
            { name: 'Takeda Crimson', cuirass: '#7f1d1d', sode: '#991b1b', hakama: '#1e1b4b', crest: '#facc15', sash: '#f59e0b', plume: false },
            { name: 'Date Indigo',    cuirass: '#1e3a8a', sode: '#1d4ed8', hakama: '#0f172a', crest: '#38bdf8', sash: '#e2e8f0', plume: true  },
            { name: 'Tokugawa Jade',  cuirass: '#064e3b', sode: '#047857', hakama: '#1c1917', crest: '#fbbf24', sash: '#34d399', plume: false },
            { name: 'Oda Plum',       cuirass: '#581c87', sode: '#7e22ce', hakama: '#18181b', crest: '#f472b6', sash: '#fde047', plume: true  }
        ];

        /***********************************************************************
         * 1B. MASTER-PLANNED WAYPOINT GRAPH & ROUTE FINDER (Zero Clipping!)
         ***********************************************************************/
        const RoadNodes = {
            // Left Bank (Cytosol / Outer Matrix Interface)
            ketoneGate:  { x: 4.85, y: 3.20 },
            fatGate:     { x: 4.95, y: 6.20 },
            glut4Outer:  { x: 0.90, y: 11.00 },
            glucNorthW:  { x: 0.90, y: 8.80 },
            glucGate:    { x: 4.95, y: 11.00 },
            bridgeWest:  { x: 5.15, y: 8.35 },

            // Bridge Crossing over Boundary River (Inner Membrane)
            bridgeEast:  { x: 8.95, y: 8.35 },

            // West-Central Avenue (Between V1/V2 column and Wellhouse)
            aveW_north:  { x: 9.35, y: 6.85 },
            v1Porch:     { x: 10.90, y: 6.85 },
            aveW_south:  { x: 9.35, y: 12.15 },
            v2Porch:     { x: 10.80, y: 12.15 },

            // Central Plaza around Apothecary Wellhouse (gx: 13.4..15.2, gy: 7.4..8.9)
            plazaNW:     { x: 12.75, y: 6.85 },
            plazaSW:     { x: 12.75, y: 9.35 },
            wellPorch:   { x: 14.30, y: 9.35 },
            plazaNE:     { x: 15.65, y: 6.85 },
            plazaSE:     { x: 15.65, y: 9.35 },

            // East-Central Avenue (Between V3 / Proteostasis Shrine and V4 / Housekeeping)
            v3Porch:     { x: 17.30, y: 6.85 },
            shrineNorth: { x: 17.30, y: 9.35 },
            shrineSouth: { x: 17.30, y: 12.10 },
            aveE_north:  { x: 19.65, y: 6.85 },
            aveE_mid:    { x: 19.65, y: 8.35 },
            aveE_south:  { x: 19.65, y: 11.65 },

            // Village IV & Eastern Castle / Dojo / Onsen Precinct
            v4Dock:        { x: 22.10, y: 11.65 },
            castleRoadN:   { x: 25.55, y: 6.75 },
            castleRoadM:   { x: 25.55, y: 8.35 },
            castleRoadS:   { x: 25.55, y: 11.15 },
            kokuLaneN:     { x: 28.25, y: 6.85 },
            kokuLaneS:     { x: 28.25, y: 8.55 },
            dojoNorthGate: { x: 30.65, y: 8.55 },
            dojoNorthIn:   { x: 30.65, y: 9.48 },
            onsenTrail:    { x: 28.85, y: 6.75 },
            dojoGate:      { x: 27.85, y: 11.15 },
            banditSpawn:   { x: 22.90, y: 3.65 },
            banditEntry:   { x: 22.90, y: 6.75 }
        };

        const RoadEdges = [
            ['ketoneGate', 'fatGate'],
            ['fatGate', 'bridgeWest'],
            ['glucGate', 'bridgeWest'],
            ['glut4Outer', 'glucNorthW'],
            ['glucNorthW', 'bridgeWest'],
            ['bridgeWest', 'bridgeEast'],

            ['bridgeEast', 'aveW_north'],
            ['bridgeEast', 'aveW_south'],
            ['bridgeEast', 'plazaNW'],
            ['bridgeEast', 'plazaSW'],

            ['aveW_north', 'v1Porch'],
            ['v1Porch', 'plazaNW'],
            ['aveW_south', 'v2Porch'],
            ['v2Porch', 'plazaSW'],

            ['plazaNW', 'plazaSW'],
            ['plazaNW', 'plazaNE'],
            ['plazaSW', 'wellPorch'],
            ['wellPorch', 'plazaSE'],
            ['plazaNE', 'plazaSE'],

            ['plazaNE', 'v3Porch'],
            ['v3Porch', 'aveE_north'],
            ['plazaSE', 'shrineNorth'],
            ['shrineNorth', 'aveE_mid'],
            ['aveW_south', 'shrineSouth'],
            ['shrineSouth', 'aveE_south'],

            ['aveE_north', 'aveE_mid'],
            ['aveE_mid', 'aveE_south'],
            ['aveE_south', 'v4Dock'],

            ['aveE_north', 'banditEntry'],
            ['banditSpawn', 'banditEntry'],
            ['banditEntry', 'castleRoadN'],
            ['aveE_mid', 'castleRoadM'],
            ['v4Dock', 'castleRoadS'],

            ['castleRoadN', 'castleRoadM'],
            ['castleRoadM', 'castleRoadS'],
            ['castleRoadN', 'kokuLaneN'],
            ['kokuLaneN', 'onsenTrail'],
            ['kokuLaneN', 'kokuLaneS'],
            ['kokuLaneS', 'dojoNorthGate'],
            ['dojoNorthGate', 'dojoNorthIn'],
            ['castleRoadS', 'dojoGate']
        ];

        const RoadAdjacency = {};
        for (const k in RoadNodes) RoadAdjacency[k] = [];
        for (const [a, b] of RoadEdges) {
            const dist = Math.hypot(RoadNodes[a].x - RoadNodes[b].x, RoadNodes[a].y - RoadNodes[b].y);
            RoadAdjacency[a].push({ node: b, weight: dist });
            RoadAdjacency[b].push({ node: a, weight: dist });
        }

        function nearestRoadNode(gx, gy) {
            const wantLeftBank = gx < 6.8;
            let bestKey = 'plazaNW';
            let bestDist = Infinity;
            for (const k in RoadNodes) {
                const pt = RoadNodes[k];
                const isLeftNode = pt.x < 6.8;
                if (wantLeftBank !== isLeftNode) continue;
                const d = Math.hypot(gx - pt.x, gy - pt.y);
                if (d < bestDist) {
                    bestDist = d;
                    bestKey = k;
                }
            }
            return bestKey;
        }

        window.findVillagePath = function (startX, startY, endX, endY) {
            const sameBank = (startX < 6.8) === (endX < 6.8);
            if (sameBank && Math.hypot(endX - startX, endY - startY) <= 3.2) {
                return [{ x: endX, y: endY }];
            }
            const startNode = nearestRoadNode(startX, startY);
            const endNode = nearestRoadNode(endX, endY);
            if (startNode === endNode) {
                return [{ x: endX, y: endY }];
            }

            const dists = {};
            const prev = {};
            const visited = new Set();
            for (const k in RoadNodes) dists[k] = Infinity;
            dists[startNode] = 0;

            // Bounded Dijkstra — hard cap at the number of road nodes to guarantee termination
            const nodeCount = Object.keys(RoadNodes).length;
            for (let _dj = 0; _dj < nodeCount + 2; _dj++) {
                let u = null;
                let minD = Infinity;
                for (const k in RoadNodes) {
                    if (!visited.has(k) && dists[k] < minD) {
                        minD = dists[k];
                        u = k;
                    }
                }
                if (!u || u === endNode) break;
                visited.add(u);
                for (const edge of RoadAdjacency[u]) {
                    const alt = dists[u] + edge.weight;
                    if (alt < dists[edge.node]) {
                        dists[edge.node] = alt;
                        prev[edge.node] = u;
                    }
                }
            }

            const waypoints = [];
            let curr = endNode;
            let _wpGuard = 0;
            while (curr && ++_wpGuard < nodeCount + 2) {
                waypoints.unshift({ x: RoadNodes[curr].x, y: RoadNodes[curr].y });
                curr = prev[curr];
            }
            waypoints.push({ x: endX, y: endY });

            // Prevent backward oscillation: if already near startNode or closer to waypoints[1], skip waypoints[0]
            if (waypoints.length >= 2) {
                const wp0 = waypoints[0];
                const wp1 = waypoints[1];
                const distToWp0 = Math.hypot(wp0.x - startX, wp0.y - startY);
                const actorToWp1 = Math.hypot(wp1.x - startX, wp1.y - startY);
                const wp0ToWp1 = Math.hypot(wp1.x - wp0.x, wp1.y - wp0.y);
                if (distToWp0 <= 0.55 || actorToWp1 <= wp0ToWp1 + 0.15) {
                    waypoints.shift();
                }
            }
            return waypoints;
        };

        window.stepAlongVillagePath = function (actor, targetX, targetY, speed, dt, arrivalDist = 0.32) {
            const gx = typeof actor.gx === 'number' ? actor.gx : 0;
            const gy = typeof actor.gy === 'number' ? actor.gy : 0;
            if (Math.hypot(targetX - gx, targetY - gy) <= arrivalDist) {
                return true;
            }
            // Only recompute path when target has moved significantly (> 0.95 tiles), avoiding per-frame path reset on moving targets
            const targetMovedDist = (typeof actor._pathTargetX === 'number' && typeof actor._pathTargetY === 'number')
                ? Math.hypot(targetX - actor._pathTargetX, targetY - actor._pathTargetY)
                : Infinity;
            if (!actor._path || targetMovedDist > 0.95 || actor._pathIdx >= actor._path.length) {
                actor._path = window.findVillagePath(gx, gy, targetX, targetY);
                actor._pathIdx = 0;
                actor._pathTargetX = targetX;
                actor._pathTargetY = targetY;
            } else {
                // Keep final destination waypoint updated to current moving target coordinates
                actor._path[actor._path.length - 1] = { x: targetX, y: targetY };
            }
            let remainingMove = speed * dt;
            // Hard iteration cap prevents any possibility of infinite loop from floating-point edge cases
            let _loopGuard = 0;
            while (remainingMove > 0.0001 && actor._pathIdx < actor._path.length && ++_loopGuard < 16) {
                const wp = actor._path[actor._pathIdx];
                const dx = wp.x - actor.gx;
                const dy = wp.y - actor.gy;
                const d = Math.hypot(dx, dy);
                const isLast = actor._pathIdx === actor._path.length - 1;
                const snapRadius = isLast ? 0.015 : 0.14;
                if (d <= snapRadius) {
                    if (isLast) {
                        actor.gx = wp.x;
                        actor.gy = wp.y;
                    }
                    actor._pathIdx++;
                    continue;
                }
                let targetAng = Math.atan2(dy, dx);
                if (!isLast && d < 0.45 && actor._pathIdx + 1 < actor._path.length) {
                    const nextWp = actor._path[actor._pathIdx + 1];
                    const nextAng = Math.atan2(nextWp.y - wp.y, nextWp.x - wp.x);
                    // Bounded angle difference using atan2 (never loops)
                    const diff = Math.atan2(Math.sin(nextAng - targetAng), Math.cos(nextAng - targetAng));
                    targetAng += diff * (1 - d / 0.45) * 0.42;
                }
                if (typeof actor.headingAngle === 'number') {
                    // Bounded heading interpolation using atan2 (never loops)
                    const hDiff = Math.atan2(Math.sin(targetAng - actor.headingAngle), Math.cos(targetAng - actor.headingAngle));
                    actor.headingAngle += hDiff * Math.min(1, dt * 11.0);
                } else {
                    actor.headingAngle = targetAng;
                }
                actor.facingDir = Math.cos(actor.headingAngle - Math.PI / 4) >= 0 ? 1 : -1;
                const step = Math.min(remainingMove, d);
                // Guard against NaN/Infinity propagation
                if (!Number.isFinite(step) || step <= 0) break;
                actor.gx += Math.cos(targetAng) * step;
                actor.gy += Math.sin(targetAng) * step;
                // Clamp to prevent actors escaping the world bounds
                actor.gx = Math.max(-1, Math.min(35, actor.gx));
                actor.gy = Math.max(-1, Math.min(16, actor.gy));
                remainingMove -= step;
                if (d - step <= snapRadius && !isLast) {
                    actor._pathIdx++;
                } else if (step >= d && isLast) {
                    actor._pathIdx++;
                }
            }
            actor.walkPhase = (actor.walkPhase || 0) + speed * dt * 5.2;
            return Math.hypot(targetX - actor.gx, targetY - actor.gy) <= arrivalDist || actor._pathIdx >= actor._path.length;
        };

        function initSamuraiGarrison() {
            SimState.samurai = [];
            SimState.ronin = [];
            SimState.roninCount = 0;
            SimState.roninRebelling = false;
            SimState.roninDesertCooldown = 0;
            SimState.roninReturnTimer = 0;
            SimState.overworkTimer = 0;
            SimState.ninjas = [];
            SimState.monks = [];
            SimState.samuraiQueueSeq = 0;
            SimState.ninjaInterventionsUsed = 0;
            SimState.crisisTimer = 0;
            SimState.cellDead = false;
            SimState.senescenceActive = false;
            SimState.senescenceTimer = 0;
            SimState.shrineScaffolding = 25;
            SimState.misfoldedBeams = 0;
            SimState.insulinResistance = 0;
            SimState.glut4ForcedOpenTimer = 0;
            SimState.mtorKetoneSeal = false;
            const apopOverlay = document.getElementById('apoptosisOverlay');
            if (apopOverlay) apopOverlay.classList.add('hidden');
            const senOverlay = document.getElementById('senescenceOverlay');
            if (senOverlay) senOverlay.classList.add('hidden');

            for (let i = 0; i < BioConfig.garrisonSize; i++) {
                const livery = SamuraiLiveries[i % SamuraiLiveries.length];
                const pairIdx = Math.floor(i / 2);
                const isRightPartner = (i % 2) === 1;
                const col = pairIdx % 5;
                const row = Math.floor(pairIdx / 5);
                const centerX = 29.05 + col * 0.76;
                const centerY = 10.20 + row * 1.20;
                const yardX = centerX + (isRightPartner ? 0.19 : -0.19);
                const yardY = centerY + (isRightPartner ? 0.08 : -0.08);
                const startWithKoku = i < 14;
                const qSeq = startWithKoku ? 0 : (++SimState.samuraiQueueSeq);

                SimState.samurai.push({
                    id: i + 1,
                    livery,
                    facingDir: isRightPartner ? -1 : 1,
                    state: startWithKoku ? 'training' : 'approaching',
                    slotIndex: -1,
                    queueJoinSeq: qSeq,
                    yardX,
                    yardY,
                    gx: startWithKoku ? yardX : 25.55,
                    gy: startWithKoku ? yardY : 6.75 + (i - 14) * 0.34,
                    hasKoku: startWithKoku,
                    kokuEnergy: startWithKoku ? (0.35 + (i / 14) * 0.65) : 0,
                    waitTimer: 0,
                    exchangeProgress: 0,
                    walkPhase: Math.random() * 6,
                    sparPhase: pairIdx * 1.1 + (isRightPartner ? Math.PI : 0),
                    isRonin: false
                });
            }
        }        function resetFullSimulation() {
            SimState.damLevel = 52;
            SimState.gshReserve = 85;
            SimState.fatSupply = 45;
            SimState.glucoseSupply = 45;
            SimState.samuraiDemand = 50;
            SimState.antioxSynthesis = 65;
            SimState.villageStock = { v1: 0, v2: 0, v3: 0, v4: 0 };
            SimState.carts = [];
            SimState.porters = [];
            SimState.fires = [];
            SimState.brigade = [];
            SimState.thrownBales = [];
            SimState.ketoneButterflies = [];
            SimState.village4Press = { ballsCount: 0, timer: 0, overheated: false, slamAnim: 0, cyclePhase: 'idle', cycleTimer: 0 };

            document.getElementById('sliderFat').value = SimState.fatSupply;
            document.getElementById('valFat').textContent = `${SimState.fatSupply}%`;
            document.getElementById('sliderGlucose').value = SimState.glucoseSupply;
            document.getElementById('valGlucose').textContent = `${SimState.glucoseSupply}%`;
            document.getElementById('sliderDemand').value = SimState.samuraiDemand;
            document.getElementById('valDemand').textContent = `${SimState.samuraiDemand}%`;
            setSluiceGate(false);
            initSamuraiGarrison();
        }

        /***********************************************************************
         * 2. LANDMARK DEFINITIONS & HARMONIOUS ARCHITECTURAL SPACING
         ***********************************************************************/
        const Landmarks = {
            ketoneShrine: {
                id: 'ketoneShrine', gx: 3.0, gy: 2.4, radius: 2.1,
                tag: 'Mitochondrial Matrix (HMG-CoA Pathway)',
                title: 'Ketogenesis Origami Shrine (β-Hydroxybutyrate)',
                metaphor: 'During sustained low carbohydrate input, excess 2-bale Acetyl-CoA pairs travel up the bamboo diversion chute, snap together on the shrine altar, and fold into glowing 4-winged amber origami butterflies that douse ROS fires (1-to-1) and heal ETC scarring!',
                biology: 'Hepatic ketogenesis condenses excess mitochondrial acetyl-CoA into β-hydroxybutyrate (BHB), which inhibits the NLRP3 inflammasome and upregulates FOXO3a/PGC-1α.'
            },
            fatLine: {
                id: 'fatLine', gx: 3.0, gy: 6.0, radius: 2.1,
                tag: 'Mitochondrial Matrix / CPT-1 Interface',
                title: 'Fatty Acid Processing Yard (Tawara Straw Bales)',
                metaphor: 'Workers chop raw golden straw rice bales (Tawara) into two-sack pairs. Malonyl-CoA Torii gates block entry when glucose flux is high (Reverse Randle Cycle).',
                biology: 'Fatty acid β-oxidation yields acetyl-CoA, NADH, and FADH2 inside the mitochondrial matrix, while exporting citrate to inhibit PFK-1 and PDH.'
            },
            glucoseLine: {
                id: 'glucoseLine', gx: 3.0, gy: 10.9, radius: 2.3,
                tag: 'Cytosol Compartment (GLUT4/GLUT2 Outer Gate & MPC Inner Gate)',
                title: 'Cytosolic Glycolysis Yard: GLUT4 / GLUT2 & MPC Gates',
                metaphor: 'Guarded by TWO gates! On the Left is the Outer GLUT4/GLUT2 Gate: chronic mTOR Monks brick GLUT4 shut with Insulin Resistance unless AMPK Ninjas pick the lock—while during hepatic Gluconeogenesis (GNG), the conveyor reverses and newly minted Glucose exits freely via bidirectional GLUT2! On the Right is the Inner MPC/PDH Gate, throttled by Citrate Randle back-pressure.',
                biology: 'Hepatocytes express insulin-independent bidirectional GLUT2 for glucose export during gluconeogenesis, whereas peripheral tissues use insulin-gated GLUT4. Reverse flux is also driven into Glycogen under surplus.',
                tagFn: () => SimState.warburgActive ? '🫧 Warburg Lactate Fermentation Bog (Cytosolic SLP)' : (SimState.etcDamage >= 45 ? '⚠️ Structure Failing — Glycolysis Bog Rising' : null),
                titleFn: () => SimState.warburgActive ? '🫧 Warburg Glycolysis Bog (Cytosolic Lactate ATP)' : (SimState.etcDamage >= 45 ? '⚠️ Cytosol Yard Crumbling into Fermentation Bog' : null),
                metaphorFn: () => SimState.warburgActive
                    ? 'The Glycolysis Yard has sunk into a neon-green Lactate Fermentation Bog! Because scarred OxPhos cannot burn fuel cleanly, the cell hoards Glucose and mints emergency ATP without oxygen while villagers dance "Thriller". Reducing Glucose alone will NOT cure this—set the full Press (Glucose <10%, Fat >80%, Toxin <5%) so firemen bale out this bog, then repeatedly click Pulse at Succinate overflow until ETC scarring drops below 30%!'
                    : (SimState.etcDamage >= 45
                        ? 'ETC Scarring (45–55%) is stressing OxPhos! Select Balanced Fasting (or set Press conditions) NOW before 55% lock-in to halt RIRR and heal the waterwheels before full Warburg takes over.'
                        : null),
                biologyFn: () => SimState.warburgActive
                    ? 'HIF-1α/PDK1 blocks PDH and shunts pyruvate to lactate via LDH to regenerate NAD+ for glycolytic ATP. Once locked in (>=55%), the Warburg toggle stays ON until ETC scarring is driven below 30% via Press + spaced Pulses.'
                    : null,
                liveStatFn: () => SimState.warburgActive
                    ? `ETC Scarring: ${Math.round(SimState.etcDamage)}% (Exit <30%) • Press: ${SimState.pressActive ? '✅ ACTIVE (Firemen Baling)' : '❌ Need Glucose <10%, Fat >80%, Toxin <5%'}`
                    : (SimState.etcDamage >= 45 ? `ETC Scarring: ${Math.round(SimState.etcDamage)}% (Pre-Warburg 45→55% — Fast/Press NOW!)` : null)
            },
            glycogenGranary: {
                id: 'glycogenGranary', gx: 0.35, gy: 8.85, radius: 1.7,
                tag: 'Hepatic Glycogen Store & Spill-Over Buckets',
                title: 'Glycogen Kura Granary & GNG Substrate Vats',
                metaphor: 'Stores excess glucose as Glycogen during surplus/Randle back-pressure (low-cost reverse conveyor), and releases it first during fasting. Once empty, GNG draws Glycerol (from Fat), Lactate↔Pyruvate (Cori Cycle), and finally Alanine (extreme starvation).',
                biology: 'Hepatic glycogenolysis is the first-line defense against hypoglycemia (~12-24h), followed by gluconeogenesis from glycerol, lactate (Cori cycle), and glucogenic amino acids like alanine (Cahill cycle).',
                liveStatFn: () => `Glycogen Reserve: ${Math.round(SimState.glycogenLevel || 0)}% • Mode: ${SimState.glycogenMode === 'glycogenesis' ? '⬇ Storing Surplus' : (SimState.glycogenMode === 'glycogenolysis' ? '⬆ Releasing Glucose' : 'Balanced')}`
            },
            basketAlanine: {
                id: 'basketAlanine', gx: 1.41, gy: 7.91, radius: 0.95,
                tag: 'Cahill Cycle • Tier 3 GNG Basket',
                title: 'Alanine Wicker Basket (Glucogenic Amino Acid)',
                metaphor: 'Delivered by river ferries from the Muscle Outpost when prolonged fasting or muscle proteolysis strips nitrogen from amino acids. Drawn into Gluconeogenesis only as a last-resort Tier 3 fuel once Glycogen, Lactate, and Glycerol run low.',
                biology: 'In the Glucose-Alanine (Cahill) cycle, skeletal muscle exports alanine to the liver, where transamination yields pyruvate for gluconeogenesis and urea-cycle nitrogen disposal.',
                liveStatFn: () => `Alanine Pool: ${Math.round(SimState.alaninePool || 0)}% • ${(SimState.gngActive && SimState.gngTier === 'alanine') ? '⬆ Feeding Tier 3 GNG' : (SimState.muscleProteolysis ? '⬇ Receiving from Muscle Proteolysis' : 'Standby Reserve')}`
            },
            basketGlycerol: {
                id: 'basketGlycerol', gx: 2.36, gy: 7.91, radius: 0.95,
                tag: 'Lipolysis Byproduct • Tier 2 GNG Basket',
                title: 'Glycerol Wicker Basket (Fat-Lipolysis Backbone)',
                metaphor: 'Every time fatty-acid Tawara straw bales are unpacked for β-oxidation, their liberated Glycerol backbone spills into this golden wicker basket. During fasting, GNG scoops it up alongside Lactate to mint fresh Glucose.',
                biology: 'Adipose lipolysis releases free fatty acids and glycerol. Hepatic glycerol kinase converts glycerol to glycerol-3-phosphate and DHAP, entering gluconeogenesis above pyruvate.',
                liveStatFn: () => `Glycerol Pool: ${Math.round(SimState.glycerolPool || 0)}% • ${(SimState.gngActive && SimState.gngTier === 'lactate_glycerol' && SimState.glycerolPool > 1) ? '⬆ Feeding Tier 2 GNG' : ((SimState.effectiveFat > 20 && !SimState.warburgActive) ? '⬇ Accumulating from β-Oxidation' : 'Idle')}`
            },
            basketPyruvate: {
                id: 'basketPyruvate', gx: 3.31, gy: 7.91, radius: 0.95,
                tag: 'Cytosol Crossroads • Glycolysis / LDH / GNG',
                title: 'Pyruvate Wicker Basket (Cytosolic Crossroads)',
                metaphor: 'The central sorting basket at the end of the Cytosol Glycolysis Yard. Normally Pyruvate crosses the MPC Gate into the mitochondria, but under Warburg stress LDH diverts it into Lactate—and during fasting GNG lifts it back up into Glucose.',
                biology: 'Pyruvate sits at the metabolic crossroads between mitochondrial PDH oxidation, cytosolic LDH reduction to lactate (regenerating NAD+), and pyruvate carboxylase-initiated gluconeogenesis.',
                liveStatFn: () => `Pyruvate Pool: ${Math.round(SimState.pyruvatePool || 0)}% • ${SimState.warburgActive ? '→ Diverting to Lactate (Warburg)' : ((SimState.gngActive && SimState.gngTier === 'lactate_glycerol') ? '⬆ Feeding Tier 2 GNG' : 'Crossing MPC Gate / LDH Equilibrium')}`
            },
            basketLactate: {
                id: 'basketLactate', gx: 4.24, gy: 7.91, radius: 0.95,
                tag: 'Cori Cycle • LDH Spill-Over Basket',
                title: 'Lactate Wicker Basket (Cori Cycle & Warburg Sink)',
                metaphor: 'Collects Lactate from Muscle ferries and Warburg fermentation. Without Press conditions (Glucose <10%, Fat >80%, Toxin <5%), Warburg floods this basket until acidic Lactate overflows across the floor—blocking repair! Setting the Press drains the puddle.',
                biology: 'Lactate dehydrogenase (LDH) interconverts pyruvate and lactate. Warburg MCT4 export acidifies the microenvironment unless ketogenic glucose restriction (Press) halts glycolytic lactate production.',
                liveStatFn: () => `Lactate Pool: ${Math.round(SimState.lactatePool || 0)}% • ${SimState.warburgActive ? (SimState.pressActive ? '⬇ Draining Under Press' : (SimState.lactatePool >= 95 ? '⚠️ OVERFLOWING ON FLOOR (Set Press!)' : '⬇ Filling from Warburg Fermentation')) : ((SimState.gngActive && SimState.gngTier === 'lactate_glycerol') ? '⬆ Converting via LDH → Pyr → GNG' : 'Cori / LDH Equilibrium')}`
            },
            basketSuccinate: {
                id: 'basketSuccinate', gx: 14.30, gy: 7.01, radius: 1.0,
                tag: 'Wellhouse mSLP Byproduct • Seyfried Warburg Sink',
                title: 'Succinate Wicker Basket (mSLP Fermentation End-Product)',
                metaphor: 'When the Wellhouse sinks into the Glutamate/mSLP bog, Succinyl-CoA Synthetase dumps Succinate here until it overflows onto the floor. Wait until it OVERFLOWS before clicking Pulse! Clicking Pulse prematurely starves healthy host Glutamine/GSH and spikes Toxins.',
                biology: 'In Prof. Seyfried’s Press-Pulse protocol, anti-glutaminolysis Pulses (e.g. DON) must be spaced to hit peak tumor mSLP flux; premature dosing depletes host enterocyte/hepatic Glutamine and Glutathione (GSH).',
                liveStatFn: () => `Succinate Pool: ${Math.round(SimState.succinatePool || 0)}% • ${SimState.warburgActive ? (SimState.succinatePool >= 95 ? '🪣 OVERFLOWING — CLICK PULSE NOW!' : ((SimState.pulseAnimTimer || 0) > 0 ? '⬇ Emptied by Pulse!' : '⏳ Filling (Wait for Overflow before Pulse!)')) : 'Inactive (OxPhos Intact)'}`
            },
            calligraphyPavilion: {
                id: 'calligraphyPavilion', gx: 25.55, gy: 12.85, radius: 1.7,
                tag: 'GNG Energy Coupling (4 ATP + 2 GTP)',
                title: 'Suspended Shodo Pavilion (Opposite Castle)',
                metaphor: 'Built on a cantilevered timber pier overhanging the Southern River directly opposite Castle Complex V—signifying that GNG is a separate, reverse operation. A Samurai donates their Golden Koku here and spends 2.5s practicing Shodo calligraphy before returning to the Castle queue as ADP.',
                biology: 'Synthesizing 1 glucose from 2 pyruvate costs 4 ATP, 2 GTP, and 2 NADH, requiring high mitochondrial fat oxidation and ATP availability.'
            },
            muscleOutpost: {
                id: 'muscleOutpost', gx: 14.3, gy: 14.05, radius: 2.2,
                tag: 'Peripheral Tissue (Cori & Cahill Cycles)',
                title: 'Raised Muscle Outpost & River Ferries (Opposite Wellhouse)',
                metaphor: 'Stands on a raised stilt platform in the river opposite the Wellhouse (between Complex II and the mTOR Shrine). Floating ferries glide up and down the river, carrying Lactate (Cori Cycle) and Alanine (starvation proteolysis) to the Cytosol Dock—where a dockhand offloads them—while Kawabe-no-Miko loads exported Glucose for the return voyage.',
                biology: 'Skeletal muscle lacks Glucose-6-Phosphatase and exports lactate (Cori cycle) or alanine (Cahill cycle) via the bloodstream to the liver, which resynthesizes glucose via GNG.'
            },
            bridge: {
                id: 'bridge', gx: 7.0, gy: 8.35, radius: 2.1,
                tag: 'Membrane Transport',
                title: 'The Arched Wooden Bridge (Inner Membrane)',
                metaphor: 'Hand-carts and messengers cross this arched timber bridge over the Inner Membrane river along dedicated inbound and outbound lanes.',
                biology: 'Represents substrate shuttles and high-energy reducing equivalents (NADH and FADH2) crossing into the Inner Mitochondrial Membrane.'
            },
            village1: {
                id: 'village1', gx: 10.9, gy: 5.5, radius: 2.1,
                tag: 'Complex I (NADH Dehydrogenase)',
                title: 'Village I & White Flour Sacks',
                metaphor: 'Mills raw Tawara straw bales into White Linen Flour Sacks carried by CoQ porters. Pumping water into the Dam; high backpressure causes CoQ porters to stumble and ignite flour-dust fires.',
                biology: 'Complex I accepts electrons from NADH, reduces Ubiquinone (CoQ), and pumps 4 H+ across the inner membrane.'
            },
            village2: {
                id: 'village2', gx: 10.8, gy: 11.0, radius: 2.0,
                tag: 'Complex II (Succinate Dehydrogenase)',
                title: 'Village II (Unpumped Pavilion)',
                metaphor: 'Aligned directly south of Village I. Receives FADH2 straw bales and mills them into CoQ Flour Sacks without a water pump, forwarding porters along the avenue to Village III.',
                biology: 'Complex II feeds electrons from succinate/FADH2 directly to the Ubiquinone pool without pumping protons.'
            },
            wellhouse: {
                id: 'wellhouse', gx: 14.3, gy: 8.1, radius: 2.0,
                tag: 'Antioxidant Defence (GSH / NADPH) & mSLP',
                title: 'The Apothecary Wellhouse (Glutathione Reserve)',
                metaphor: 'occupies the central stone courtyard. Automated bucket-brigade firefighters (*Hikeshi*) rush out along the roads to quench flour-dust fires with cyan GSH water!',
                biology: 'Mitochondrial antioxidant systems (SOD2, GPx) neutralize superoxide/H2O2 by oxidizing Glutathione (GSH -> GSSG).',
                tagFn: () => SimState.warburgActive ? '🫧 Wellhouse Glutamate/mSLP Bog (Mitochondrial SLP)' : (SimState.etcDamage >= 45 ? '⚠️ Structure Failing — mSLP Bog Rising' : null),
                titleFn: () => SimState.warburgActive ? '🫧 Wellhouse mSLP Bog (Glutaminolysis → Succinate)' : (SimState.etcDamage >= 45 ? '⚠️ Wellhouse Crumbling into mSLP Bog' : null),
                metaphorFn: () => SimState.warburgActive
                    ? 'The Wellhouse has sunk into a Violet Glutamate/mSLP Bog! Even if you starve Glucose, Complex workers pitch Glutamine bales here to mint GTP/ATP via Succinyl-CoA Synthetase and dump waste Succinate into the north basket. Set the Press (Glucose <10%, Fat >80%, Toxin <5%) and click Pulse at Succinate overflow repeatedly until ETC scarring drops below 30%!'
                    : (SimState.etcDamage >= 45
                        ? 'As ETC Scarring climbs (45–55%), the Wellhouse trembles toward a Glutamate/mSLP Bog. Select Balanced Fasting (or Press conditions) NOW before 55% lock-in to quench ROS and reverse the decline.'
                        : null),
                biologyFn: () => SimState.warburgActive
                    ? 'Mitochondrial Substrate-Level Phosphorylation (mSLP) at Succinyl-CoA Synthetase rescues Warburg cells when OxPhos fails, exporting succinate. Once locked in (>=55%), the Warburg toggle stays ON until ETC scarring is driven below 30%.'
                    : null,
                liveStatFn: () => SimState.warburgActive
                    ? `Succinate: ${Math.round(SimState.succinatePool || 0)}% • ETC Scarring: ${Math.round(SimState.etcDamage)}% (Exit <30%) • ${SimState.pressActive ? (SimState.succinatePool >= 95 ? 'Click ⚡ Pulse NOW!' : 'Wait for Succinate Overflow!') : 'Set Press first (Gluc <10, Fat >80, Tox <5)'}`
                    : (SimState.etcDamage >= 45 ? `ETC Scarring: ${Math.round(SimState.etcDamage)}% (Pre-Warburg 45→55% — Fast NOW!)` : null)
            },
            village3: {
                id: 'village3', gx: 17.3, gy: 5.5, radius: 2.1,
                tag: 'Complex III (Cytochrome bc1)',
                title: 'Village III & Cytochrome c Couriers',
                metaphor: 'Mixes and steams white rice flour into single round, warm Mochi Dough Balls carried on red lacquer trays by swift Cytochrome c couriers to the Village IV press.',
                biology: 'Complex III oxidises Ubiquinol via the Q-cycle, pumping 4 H+ and transferring single electrons to soluble Cytochrome c.'
            },
            proteostasisShrine: {
                id: 'proteostasisShrine', gx: 17.3, gy: 10.7, radius: 2.1,
                tag: 'Proteostasis (mTORC1 Anabolism vs. AMPK/ULK1 Autophagy)',
                title: 'The Shrine of Proteostasis & Perpetual Scaffolding',
                metaphor: 'Aligned directly south of Village III. Saffron-robed mTOR Zen Monks carry Koku along the roads to erect bamboo scaffolding around this shrine. Trigger AMPK Ninjas to strip excess scaffolding before it reaches 100% and unveils the Gilded Temple of Senescence!',
                biology: 'Healthy cells balance mTORC1-driven protein synthesis with AMPK/ULK1-driven autophagy. Chronic mTOR hyperactivity blocks autophagy, accumulates misfolded proteins, and drives cellular senescence (SASP).'
            },
            housekeeping: {
                id: 'housekeeping', gx: 21.0, gy: 5.1, radius: 1.9,
                tag: 'Basal Proton Leak & Maintenance',
                title: 'Housekeeping Run-off Aqueduct & Utility Mill',
                metaphor: 'A side flume east of Village III that continuously trickles water from the Dam to spin an internal utility wheel for basal mitochondrial maintenance.',
                biology: 'Baseline proton re-entry for protein import, metabolite symport, and ion homeostasis.'
            },
            village4: {
                id: 'village4', gx: 22.1, gy: 10.3, radius: 2.1,
                tag: 'Complex IV (Paired 2x2 Copper & Iron Kiln-Press)',
                title: 'Village IV Paired 2x2 Steam-Kiln Press (2 H₂O)',
                metaphor: 'Receives 4 Mochi Dough Balls into two distinct 2-bale pairs ([2e⁻] + [2e⁻]) around a central River O2 orb. When both pairs are filled, the press slams shut to power Pump IV and launch two H2O steam cakes into the river.',
                biology: 'Complex IV (Cytochrome c Oxidase) clamps O2 at its Heme a3/CuB center until 4 sequential electrons (two pairs) arrive, cleaving O=O to form 2 H2O molecules and pumping 2 H+.'
            },
            dam: {
                id: 'dam', gx: 17.5, gy: 2.0, radius: 3.5,
                tag: 'Proton Motive Force (Δp / ΔΨm)',
                title: 'The Elevated Stone Dam (Intermembrane Reservoir)',
                metaphor: 'Stores all water pumped up from Villages I, III, and IV. High backpressure stalls pumps and triggers flour-dust fires.',
                biology: 'The electrochemical proton gradient (ΔΨm ~140–220 mV) powering ATP Synthase.'
            },
            castle: {
                id: 'castle', gx: 26.2, gy: 5.0, radius: 2.8,
                tag: 'Complex V (ATP Synthase), Adenylate Kinase & AMPK Sensor',
                title: 'Castle Gate, Adenylate Kinase & Ronin Crisis',
                metaphor: 'Unpaid Samurai (ADP) queue in single file along the Castle Avenue. During Bandit raids when >10 Samurai queue up, Adenylate Kinase trades 2 ADP -> 1 ATP + 1 AMP.',
                biology: 'High ADP/AMP activates Adenylate Kinase (2ADP <-> ATP + AMP) and AMPK to mobilize catabolic reserves. Severe ATP starvation opens the mPTP pore, causing apoptosis.'
            },
            onsen: {
                id: 'onsen', gx: 30.4, gy: 5.2, radius: 2.3,
                tag: 'Uncoupling Protein (UCP1 / Thermogenin)',
                title: 'Hidden Sluice Gate & Steaming Onsen',
                metaphor: 'Opens a hidden spillway to vent Dam water directly into a steaming hot spring bath for non-shivering thermogenesis.',
                biology: 'UCP1 dissipates the proton gradient as heat, bypassing ATP synthase and relieving backpressure.'
            },
            trainingYard: {
                id: 'trainingYard', gx: 30.5, gy: 10.9, radius: 3.1,
                tag: 'Conserved Adenylate Pool (ATP Hydrolysis / Cellular Work)',
                title: 'The 20-Samurai Garrison Training Yard',
                metaphor: 'A fixed garrison of 20 Samurai cycles between the Dojo (ATP) and the Castle Gate Queue (ADP). In the yard, they set down their Koku bales and duel with wooden bokken swords—or sprint out 1-on-1 to intercept Xenobiotic Bandits!',
                biology: 'Total adenine nucleotides (ATP + ADP + AMP) form a conserved recycling pool.'
            }
        };;

        /***********************************************************************
         * 3. ISOMETRIC PROJECTION & CAMERA ENGINE
         ***********************************************************************/
        const canvas = document.getElementById('isoCanvas');
        const ctx = canvas.getContext('2d');

        const TILE_W = 54;
        const TILE_H = 27;
        const ELEV_PX = 24;

        const Camera = { x: 0, y: 0, zoom: 1.0, isDragging: false, dragStartX: 0, dragStartY: 0, camStartX: 0, camStartY: 0 };

        function centerCamera() {
            Camera.zoom = Math.min(window.innerWidth / 1520, window.innerHeight / 870);
            Camera.zoom = Math.max(0.58, Math.min(1.25, Camera.zoom));
            const isoX = (17.5 - 7.8) * (TILE_W / 2);
            const isoY = (17.5 + 7.8) * (TILE_H / 2);
            Camera.x = (window.innerWidth / 2) - isoX * Camera.zoom;
            Camera.y = (window.innerHeight / 2) - isoY * Camera.zoom - 10;
        }

        function resizeCanvas() {
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            if (Camera.x === 0 && Camera.y === 0) centerCamera();
        }
        window.addEventListener('resize', () => { resizeCanvas(); centerCamera(); });
        resizeCanvas();

        function isoToScreen(gx, gy, gz = 0) {
            const rawX = (gx - gy) * (TILE_W / 2);
            const rawY = (gx + gy) * (TILE_H / 2) - (gz * ELEV_PX);
            return { x: Camera.x + rawX * Camera.zoom, y: Camera.y + rawY * Camera.zoom };
        }

        function screenToIso(sx, sy) {
            const adjX = (sx - Camera.x) / Camera.zoom;
            const adjY = (sy - Camera.y) / Camera.zoom;
            const gx = (adjX / (TILE_W / 2) + adjY / (TILE_H / 2)) / 2;
            const gy = (adjY / (TILE_H / 2) - adjX / (TILE_W / 2)) / 2;
            return { gx, gy };
        }

        /***********************************************************************
         * 4. INTERACTION & EVENT LISTENERS
         ***********************************************************************/
        let pointerMoved = false;
        canvas.addEventListener('mousedown', (e) => {
            Camera.isDragging = true; pointerMoved = false;
            Camera.dragStartX = e.clientX; Camera.dragStartY = e.clientY;
            Camera.camStartX = Camera.x; Camera.camStartY = Camera.y;
        });
        window.addEventListener('mousemove', (e) => {
            if (!Camera.isDragging) return;
            const dx = e.clientX - Camera.dragStartX; const dy = e.clientY - Camera.dragStartY;
            if (Math.hypot(dx, dy) > 5) pointerMoved = true;
            Camera.x = Camera.camStartX + dx; Camera.y = Camera.camStartY + dy;
        });
        window.addEventListener('mouseup', (e) => {
            if (Camera.isDragging && !pointerMoved) handleCanvasClick(e.clientX, e.clientY);
            Camera.isDragging = false;
        });
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zf = e.deltaY < 0 ? 1.08 : 0.92;
            const nz = Math.max(0.45, Math.min(1.85, Camera.zoom * zf));
            Camera.x = e.clientX - (e.clientX - Camera.x) * (nz / Camera.zoom);
            Camera.y = e.clientY - (e.clientY - Camera.y) * (nz / Camera.zoom);
            Camera.zoom = nz;
        }, { passive: false });

        function handleCanvasClick(clientX, clientY) {
            const { gx, gy } = screenToIso(clientX, clientY);
            let closest = null; let minDist = Infinity;
            for (const key in Landmarks) {
                const lm = Landmarks[key];
                const d = Math.hypot(gx - lm.gx, gy - lm.gy);
                if (d <= lm.radius && d < minDist) { minDist = d; closest = lm; }
            }
            if (closest) selectLandmark(closest);
        }

        function selectLandmark(lm) {
            const card = document.getElementById('inspectorCard');
            card.classList.remove('hidden');
            document.getElementById('inspTag').textContent = (lm.tagFn && lm.tagFn()) || lm.tag;
            document.getElementById('inspTitle').textContent = (lm.titleFn && lm.titleFn()) || lm.title;
            document.getElementById('inspMetaphor').textContent = (lm.metaphorFn && lm.metaphorFn()) || lm.metaphor;
            document.getElementById('inspBiology').textContent = (lm.biologyFn && lm.biologyFn()) || lm.biology;
            const liveStat = lm.liveStatFn && lm.liveStatFn();
            document.getElementById('inspLiveStat').textContent = liveStat
                || `Grid Location: (${lm.gx.toFixed(1)}, ${lm.gy.toFixed(1)}) • Active Simulation Element`;
        }

        /***********************************************************************
         * 5. ISOMETRIC DRAWING PRIMITIVES & ARCHITECTURAL TEXTURES
         ***********************************************************************/
        function drawIsoTile(gx, gy, gz, colorFill, colorStroke = null) {
            const p1 = isoToScreen(gx, gy, gz); const p2 = isoToScreen(gx + 1, gy, gz);
            const p3 = isoToScreen(gx + 1, gy + 1, gz); const p4 = isoToScreen(gx, gy + 1, gz);
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath();
            ctx.fillStyle = colorFill; ctx.fill();
            if (colorStroke) { ctx.strokeStyle = colorStroke; ctx.lineWidth = 0.7 * Camera.zoom; ctx.stroke(); }
        }

        function drawCobblestoneTile(gx, gy, gz = 0) {
            const isAlt = (gx + gy) % 2 === 0;
            drawIsoTile(gx, gy, gz, isAlt ? '#3b4759' : '#313d4f', 'rgba(148, 163, 184, 0.22)');
            const c1 = isoToScreen(gx + 0.32, gy + 0.35, gz);
            const c2 = isoToScreen(gx + 0.68, gy + 0.65, gz);
            const z = Camera.zoom;
            ctx.save();
            ctx.fillStyle = isAlt ? 'rgba(203, 213, 225, 0.14)' : 'rgba(148, 163, 184, 0.12)';
            ctx.beginPath();
            ctx.ellipse(c1.x, c1.y, 4.5 * z, 2.2 * z, 0, 0, Math.PI * 2);
            ctx.ellipse(c2.x, c2.y, 3.8 * z, 1.9 * z, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function drawIsoBox(gx, gy, gz, w, d, h, topCol, leftCol, rightCol, strokeCol = null) {
            const t1 = isoToScreen(gx, gy, gz + h); const t2 = isoToScreen(gx + w, gy, gz + h);
            const t3 = isoToScreen(gx + w, gy + d, gz + h); const t4 = isoToScreen(gx, gy + d, gz + h);
            const b2 = isoToScreen(gx + w, gy, gz); const b3 = isoToScreen(gx + w, gy + d, gz); const b4 = isoToScreen(gx, gy + d, gz);

            ctx.beginPath(); ctx.moveTo(t4.x, t4.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(b4.x, b4.y); ctx.closePath();
            ctx.fillStyle = leftCol; ctx.fill(); if (strokeCol) { ctx.strokeStyle = strokeCol; ctx.lineWidth = 0.8 * Camera.zoom; ctx.stroke(); }

            ctx.beginPath(); ctx.moveTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(b2.x, b2.y); ctx.closePath();
            ctx.fillStyle = rightCol; ctx.fill(); if (strokeCol) { ctx.strokeStyle = strokeCol; ctx.lineWidth = 0.8 * Camera.zoom; ctx.stroke(); }

            ctx.beginPath(); ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t4.x, t4.y); ctx.closePath();
            ctx.fillStyle = topCol; ctx.fill(); if (strokeCol) { ctx.strokeStyle = strokeCol; ctx.lineWidth = 0.8 * Camera.zoom; ctx.stroke(); }
        }

        function drawIshigakiStoneBox(gx, gy, gz, w, d, h, topCol, leftCol, rightCol, strokeCol = '#0f172a', rows = 4) {
            drawIsoBox(gx, gy, gz, w, d, h, topCol, leftCol, rightCol, strokeCol);
            const z = Camera.zoom; ctx.save(); ctx.lineWidth = 0.85 * z;
            const colsW = Math.max(2, Math.round(w * 2.2));
            for (let r = 0; r < rows; r++) {
                const z0 = gz + (r / rows) * h; const z1 = gz + ((r + 1) / rows) * h;
                if (r > 0) {
                    const hl1 = isoToScreen(gx, gy + d, z0); const hl2 = isoToScreen(gx + w, gy + d, z0);
                    ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)'; ctx.beginPath(); ctx.moveTo(hl1.x, hl1.y); ctx.lineTo(hl2.x, hl2.y); ctx.stroke();
                }
                const stagger = (r % 2) * 0.5;
                for (let c = 0; c < colsW; c++) {
                    const f0 = Math.max(0, (c - 0.5 + stagger) / colsW); const f1 = Math.min(1, (c + 0.5 + stagger) / colsW);
                    if (f1 <= f0) continue;
                    const hash = Math.sin((gx + c) * 12.9898 + (gy + r) * 78.233) * 43758.5453;
                    const shade = hash - Math.floor(hash);
                    if (shade > 0.58 || shade < 0.25) {
                        const s1 = isoToScreen(gx + f0 * w, gy + d, z1 - 0.02); const s2 = isoToScreen(gx + f1 * w, gy + d, z1 - 0.02);
                        const s3 = isoToScreen(gx + f1 * w, gy + d, z0 + 0.02); const s4 = isoToScreen(gx + f0 * w, gy + d, z0 + 0.02);
                        ctx.fillStyle = shade > 0.58 ? 'rgba(226, 232, 240, 0.11)' : 'rgba(15, 23, 42, 0.16)';
                        ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.lineTo(s3.x, s3.y); ctx.lineTo(s4.x, s4.y); ctx.closePath(); ctx.fill();
                    }
                    if (f1 < 0.98) {
                        const jTop = isoToScreen(gx + f1 * w, gy + d, z1); const jBot = isoToScreen(gx + f1 * w, gy + d, z0);
                        ctx.strokeStyle = 'rgba(15, 23, 42, 0.5)'; ctx.beginPath(); ctx.moveTo(jTop.x, jTop.y); ctx.lineTo(jBot.x, jBot.y); ctx.stroke();
                    }
                }
            }
            ctx.restore();
        }

        function renderRiverEmbankments() {
            const z = Camera.zoom; ctx.save();
            for (let gy = 0; gy < 13; gy++) {
                if (gy >= 7.5 && gy <= 9.3) continue;
                const w1 = isoToScreen(6.0, gy, 0.16); const w2 = isoToScreen(6.0, gy + 1, 0.16);
                const b1 = isoToScreen(6.0, gy, -0.05); const b2 = isoToScreen(6.0, gy + 1, -0.05);
                ctx.fillStyle = (gy % 2 === 0) ? '#475569' : '#334155';
                ctx.beginPath(); ctx.moveTo(w1.x, w1.y); ctx.lineTo(w2.x, w2.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(b1.x, b1.y); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.9 * z; ctx.stroke();
            }
            for (let gx = 0; gx < 6; gx++) {
                // Flush stone bank dropping from ground level (z=0.01) down to river water (z=-0.16)
                const n1 = isoToScreen(gx, 13.0, 0.01); const n2 = isoToScreen(gx + 1, 13.0, 0.01);
                const nb1 = isoToScreen(gx, 13.0, -0.16); const nb2 = isoToScreen(gx + 1, 13.0, -0.16);
                ctx.fillStyle = (gx % 2 === 0) ? '#475569' : '#3f4f63';
                ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y); ctx.lineTo(nb2.x, nb2.y); ctx.lineTo(nb1.x, nb1.y); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.85 * z; ctx.stroke();
            }
            for (let gx = 9; gx < 33; gx++) {
                const n1 = isoToScreen(gx, 13.0, 0.18); const n2 = isoToScreen(gx + 1, 13.0, 0.18);
                const nb1 = isoToScreen(gx, 13.0, -0.06); const nb2 = isoToScreen(gx + 1, 13.0, -0.06);
                ctx.fillStyle = (gx % 2 === 0) ? '#475569' : '#3f4f63';
                ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y); ctx.lineTo(nb2.x, nb2.y); ctx.lineTo(nb1.x, nb1.y); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.85 * z; ctx.stroke();
            }
            ctx.restore();
        }

        function lerpHexColor(hexA, hexB, t) {
            if (!hexA || !hexA.startsWith('#') || hexA.length !== 7) return hexB;
            const a = parseInt(hexA.slice(1), 16), b = parseInt(hexB.slice(1), 16);
            const r = Math.round(((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * t);
            const g = Math.round(((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * t);
            const bl = Math.round((a & 255) + ((b & 255) - (a & 255)) * t);
            return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
        }

        function drawJapaneseRoof(gx, gy, gz, w, d, h, roofColDark, roofColLight, ridgeCol, roofNumeral = null) {
            if (SimState.villageCharred) {
                roofColDark = '#09090b';
                roofColLight = '#18181b';
                ridgeCol = '#27272a';
            } else if ((SimState.villageGreyLevel || 0) > 0) {
                const gt = Math.min(1, SimState.villageGreyLevel);
                roofColDark = lerpHexColor(roofColDark, '#52525b', gt);
                roofColLight = lerpHexColor(roofColLight, '#71717a', gt);
                ridgeCol = lerpHexColor(ridgeCol, '#a1a1aa', gt);
            }
            const z = Camera.zoom;
            const ov = 0.32;
            const b1 = isoToScreen(gx - ov, gy - ov, gz);
            const b2 = isoToScreen(gx + w + ov, gy - ov, gz);
            const b3 = isoToScreen(gx + w + ov, gy + d + ov, gz);
            const b4 = isoToScreen(gx - ov, gy + d + ov, gz);

            const ridgeInset = Math.min(w * 0.25, 0.45);
            const r1 = isoToScreen(gx + ridgeInset, gy + d * 0.5, gz + h);
            const r2 = isoToScreen(gx + w - ridgeInset, gy + d * 0.5, gz + h);

            ctx.save();
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(b1.x, b1.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.lineTo(r2.x, r2.y);
            ctx.lineTo(r1.x, r1.y);
            ctx.closePath();
            ctx.fillStyle = roofColDark;
            ctx.fill();
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
            ctx.lineWidth = 1.0 * z;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(b1.x, b1.y);
            ctx.lineTo(b4.x, b4.y);
            ctx.lineTo(r1.x, r1.y);
            ctx.closePath();
            ctx.fillStyle = roofColDark;
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(b4.x, b4.y);
            ctx.lineTo(b3.x, b3.y);
            ctx.lineTo(r2.x, r2.y);
            ctx.lineTo(r1.x, r1.y);
            ctx.closePath();
            ctx.fillStyle = roofColLight;
            ctx.fill();
            ctx.stroke();

            const ribCount = Math.max(3, Math.floor(w * 2.5));
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.28)';
            ctx.lineWidth = 0.85 * z;
            for (let i = 1; i < ribCount; i++) {
                const t = i / ribCount;
                const topX = r1.x + (r2.x - r1.x) * t;
                const topY = r1.y + (r2.y - r1.y) * t;
                const botX = b4.x + (b3.x - b4.x) * t;
                const botY = b4.y + (b3.y - b4.y) * t;
                ctx.beginPath();
                ctx.moveTo(topX, topY);
                ctx.lineTo(botX, botY);
                ctx.stroke();
            }

            if (roofNumeral) {
                const cx = (b4.x + b3.x + r2.x + r1.x) * 0.25;
                const cy = (b4.y + b3.y + r2.y + r1.y) * 0.25;
                const ux = ((r2.x - r1.x) + (b3.x - b4.x)) * 0.5;
                const uy = ((r2.y - r1.y) + (b3.y - b4.y)) * 0.5;
                const vx = ((b4.x - r1.x) + (b3.x - r2.x)) * 0.5;
                const vy = ((b4.y - r1.y) + (b3.y - r2.y)) * 0.5;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.transform(ux / 44, uy / 44, vx / 26, vy / 26, 0, 0);
                ctx.font = 'bold 14px Georgia, serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(15, 23, 42, 0.34)';
                ctx.fillText(roofNumeral, 0.8, 0.8);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
                ctx.fillText(roofNumeral, 0, 0);
                ctx.restore();
            }

            ctx.beginPath();
            ctx.moveTo(b2.x, b2.y);
            ctx.lineTo(b3.x, b3.y);
            ctx.lineTo(r2.x, r2.y);
            ctx.closePath();
            ctx.fillStyle = roofColDark;
            ctx.fill();
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
            ctx.lineWidth = 1.0 * z;
            ctx.stroke();

            ctx.strokeStyle = ridgeCol;
            ctx.lineWidth = 1.2 * z;
            ctx.beginPath();
            ctx.moveTo(r2.x, r2.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.moveTo(r2.x, r2.y);
            ctx.lineTo(b3.x, b3.y);
            ctx.stroke();

            ctx.strokeStyle = ridgeCol;
            ctx.lineWidth = 1.6 * z;
            ctx.beginPath();
            ctx.moveTo(b4.x, b4.y);
            ctx.lineTo(b3.x, b3.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(r1.x, r1.y);
            ctx.lineTo(r2.x, r2.y);
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 4.6 * z;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(r1.x, r1.y);
            ctx.lineTo(r2.x, r2.y);
            ctx.strokeStyle = ridgeCol;
            ctx.lineWidth = 2.8 * z;
            ctx.stroke();

            ctx.fillStyle = ridgeCol;
            ctx.beginPath();
            ctx.arc(r1.x, r1.y - 1.5 * z, 2.8 * z, 0, Math.PI * 2);
            ctx.arc(r2.x, r2.y - 1.5 * z, 2.8 * z, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function drawTawaraBale(sx, sy, scale = 1.0, angle = 0, isGoldenKoku = false) {
            const z = Camera.zoom * scale; ctx.save(); ctx.translate(sx, sy); ctx.rotate(angle);
            const rw = 9.0 * z; const rh = 5.6 * z;
            ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 2.5 * z, rw * 1.08, rh * 0.85, 0, 0, Math.PI * 2); ctx.fill();
            
            const grad = ctx.createLinearGradient(0, -rh, 0, rh);
            if (isGoldenKoku) {
                grad.addColorStop(0, '#fef08a'); grad.addColorStop(0.5, '#facc15'); grad.addColorStop(1, '#ca8a04');
            } else {
                grad.addColorStop(0, '#fef3c7'); grad.addColorStop(0.55, '#f59e0b'); grad.addColorStop(1, '#92400e');
            }
            ctx.fillStyle = grad; ctx.strokeStyle = isGoldenKoku ? '#854d0e' : '#451a03'; ctx.lineWidth = 1.2 * z;
            ctx.beginPath(); ctx.roundRect(-rw, -rh, rw * 2, rh * 2, 4.5 * z); ctx.fill(); ctx.stroke();

            ctx.strokeStyle = isGoldenKoku ? '#a16207' : '#78350f'; ctx.lineWidth = 1.4 * z;
            for (const bx of [-rw * 0.5, 0, rw * 0.5]) {
                ctx.beginPath(); ctx.moveTo(bx, -rh); ctx.lineTo(bx, rh); ctx.stroke();
            }
            ctx.fillStyle = isGoldenKoku ? '#fef9c3' : '#fde68a';
            ctx.beginPath(); ctx.ellipse(rw * 0.72, 0, 1.8 * z, rh * 0.65, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        function drawGlucoseHexRing(sx, sy, scale = 1.0) {
            const z = Camera.zoom * scale;
            const r = 8.2 * z;
            ctx.save();
            ctx.translate(sx, sy);
            // Soft cyan-emerald glow under the 6-carbon pyranose ring
            ctx.fillStyle = 'rgba(56, 189, 248, 0.24)';
            ctx.beginPath(); ctx.ellipse(0, 2.5 * z, r * 1.15, r * 0.65, 0, 0, Math.PI * 2); ctx.fill();

            // Isometric 6-membered hexagon ring
            ctx.fillStyle = 'rgba(14, 116, 144, 0.78)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.8 * z;
            ctx.beginPath();
            for (let k = 0; k < 6; k++) {
                const a = (k * Math.PI) / 3 - Math.PI / 6;
                const vx = Math.cos(a) * r;
                const vy = Math.sin(a) * r * 0.62;
                if (k === 0) ctx.moveTo(vx, vy);
                else ctx.lineTo(vx, vy);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // 5 Carbon vertices (cyan-white) + 1 Ring Oxygen vertex (rose-coral)
            for (let k = 0; k < 6; k++) {
                const a = (k * Math.PI) / 3 - Math.PI / 6;
                const vx = Math.cos(a) * r;
                const vy = Math.sin(a) * r * 0.62;
                ctx.fillStyle = k === 0 ? '#fb7185' : '#e0f2fe';
                ctx.beginPath(); ctx.arc(vx, vy, 2.0 * z, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        }

        function drawConveyorSlats(startGx, gy, gz, length, width, phase = 0, slatColor = 'rgba(255,255,255,0.22)') {
            const z = Camera.zoom;
            const count = 6;
            ctx.save();
            ctx.strokeStyle = slatColor;
            ctx.lineWidth = 1.6 * z;
            for (let i = 0; i < count; i++) {
                const u = ((i + (phase % 1 + 1) % 1) / count);
                const gx = startGx + u * length;
                const p1 = isoToScreen(gx, gy - width * 0.42, gz);
                const p2 = isoToScreen(gx, gy + width * 0.42, gz);
                ctx.globalAlpha = u < 0.12 ? u / 0.12 : (u > 0.88 ? (1 - u) / 0.12 : 1.0);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
            ctx.restore();
        }

        function drawFattyAcylChain(startGx, gy, gz, segments = 10, chainOffset = 0) {
            const z = Camera.zoom;
            const u = ((chainOffset % 1) + 1) % 1;
            const stepPer2C = 0.42; // Exact 2-carbon spacing (2 * 0.21) so wrapping by 1 is seamless!
            ctx.save();
            const pts = [];
            for (let i = 0; i < segments; i++) {
                const gx = startGx + i * 0.21 + u * stepPer2C;
                // Parity anchored to world-step (i % 2) so zig-zag never flips when wrapping by 2 carbons!
                const zigzag = (i % 2 === 0 ? -0.10 : 0.10);
                pts.push({ p: isoToScreen(gx, gy + zigzag, gz), gx });
            }
            // Shadow beneath the hydrocarbon chain
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.lineWidth = 4.6 * z;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            for (let i = 0; i < pts.length; i++) {
                if (i === 0) ctx.moveTo(pts[i].p.x, pts[i].p.y + 2.5 * z);
                else ctx.lineTo(pts[i].p.x, pts[i].p.y + 2.5 * z);
            }
            ctx.stroke();

            // Golden-amber acyl backbone bonds
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 3.0 * z;
            ctx.beginPath();
            for (let i = 0; i < pts.length; i++) {
                if (i === 0) ctx.moveTo(pts[i].p.x, pts[i].p.y);
                else ctx.lineTo(pts[i].p.x, pts[i].p.y);
            }
            ctx.stroke();

            // Carbon beads along the chain (fade in smoothly at left gate, fade/chop at right cleaver)
            for (let i = 0; i < pts.length; i++) {
                const isHead = i >= segments - 2;
                const alpha = i < 2 ? Math.min(1, u + i * 0.5) : (i >= segments - 2 ? Math.max(0.25, 1 - u * 0.65) : 1.0);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = isHead ? '#fef08a' : '#f59e0b';
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 0.9 * z;
                ctx.beginPath();
                ctx.arc(pts[i].p.x, pts[i].p.y, (isHead ? 3.2 : 2.5) * z, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }

        function drawFlourSack(sx, sy, scale = 1.0) {
            const z = Camera.zoom * scale; ctx.save(); ctx.translate(sx, sy);
            ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(0, 3 * z, 7.5 * z, 3.8 * z, 0, 0, Math.PI * 2); ctx.fill();
            
            const grad = ctx.createRadialGradient(-2 * z, -2 * z, 1 * z, 0, 0, 9 * z);
            grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.7, '#f1f5f9'); grad.addColorStop(1, '#cbd5e1');
            ctx.fillStyle = grad; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.1 * z;
            ctx.beginPath();
            ctx.moveTo(-5.5 * z, -5 * z);
            ctx.quadraticCurveTo(-8 * z, 2 * z, -5 * z, 5 * z);
            ctx.lineTo(5 * z, 5 * z);
            ctx.quadraticCurveTo(8 * z, 2 * z, 5.5 * z, -5 * z);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.moveTo(-3.5 * z, -5 * z);
            ctx.lineTo(-5 * z, -9.5 * z);
            ctx.lineTo(0, -8 * z);
            ctx.lineTo(5 * z, -9.5 * z);
            ctx.lineTo(3.5 * z, -5 * z);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.8 * z;
            ctx.beginPath(); ctx.moveTo(-4.2 * z, -5.2 * z); ctx.lineTo(4.2 * z, -5.2 * z); ctx.stroke();

            ctx.fillStyle = '#0284c7';
            ctx.beginPath(); ctx.arc(0, 0.5 * z, 1.8 * z, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        function drawMochiBall(sx, sy, scale = 1.0) {
            const z = Camera.zoom * scale; ctx.save(); ctx.translate(sx, sy);
            ctx.fillStyle = '#991b1b'; ctx.strokeStyle = '#450a0a'; ctx.lineWidth = 0.9 * z;
            ctx.beginPath(); ctx.ellipse(0, 2.8 * z, 6.8 * z, 3.0 * z, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            
            const grad = ctx.createRadialGradient(-2 * z, -2.5 * z, 1 * z, 0, 0, 6.2 * z);
            grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.6, '#fef9c3'); grad.addColorStop(1, '#facc15');
            ctx.fillStyle = grad; ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 1.1 * z;
            ctx.beginPath(); ctx.arc(0, -1 * z, 5.2 * z, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.beginPath(); ctx.arc(-1.8 * z, -2.8 * z, 1.5 * z, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        function drawStoneLantern(gx, gy, gz, lit = true) {
            if (SimState.villageCharred || SimState.cellDead || SimState.crisisState === 'starvation' || (SimState.villageGreyLevel || 0) >= 0.4 || ((SimState.targetGarrisonSize || 20) <= 15 && gx >= 27.5 && gy >= 8.5)) lit = false;
            const p = isoToScreen(gx, gy, gz); const z = Camera.zoom; ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.28)';
            ctx.beginPath(); ctx.ellipse(p.x, p.y + 1 * z, 5.5 * z, 2.5 * z, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#64748b'; ctx.fillRect(p.x - 4.2 * z, p.y - 2 * z, 8.4 * z, 3 * z);
            ctx.fillStyle = '#94a3b8'; ctx.fillRect(p.x - 2.2 * z, p.y - 12 * z, 4.4 * z, 10 * z);
            if (lit) {
                const g = ctx.createRadialGradient(p.x, p.y - 14.5 * z, 1 * z, p.x, p.y - 14.5 * z, 11 * z);
                g.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
                g.addColorStop(1, 'rgba(254, 240, 138, 0)');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(p.x, p.y - 14.5 * z, 11 * z, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = lit ? '#fef08a' : '#475569';
            ctx.strokeStyle = '#334155'; ctx.lineWidth = 0.8 * z;
            ctx.fillRect(p.x - 3.6 * z, p.y - 17 * z, 7.2 * z, 5 * z);
            ctx.strokeRect(p.x - 3.6 * z, p.y - 17 * z, 7.2 * z, 5 * z);
            // Kasagi Curved Lantern Cap
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.moveTo(p.x - 6 * z, p.y - 17 * z);
            ctx.lineTo(p.x, p.y - 21 * z);
            ctx.lineTo(p.x + 6 * z, p.y - 17 * z);
            ctx.closePath(); ctx.fill();
            ctx.restore();
        }

        function drawStockpileBales(gx, gy, gz, count) {
            const maxVisible = Math.min(8, Math.floor(count));
            for (let i = 0; i < maxVisible; i++) {
                const row = Math.floor(i / 3); const col = i % 3;
                const pos = isoToScreen(gx + col * 0.22, gy + row * 0.18, gz + row * 0.18);
                drawTawaraBale(pos.x, pos.y, 0.72, (i % 2 === 0) ? 0.08 : -0.08, false);
            }
        }        function drawFloatingLabel(gx, gy, gz, text, subtext, borderCol = '#f59e0b', placement = 'above') {
            if (!SimState.showLabels) return;
            const p = isoToScreen(gx, gy, gz); ctx.save();
            ctx.font = `bold ${Math.round(11 * Camera.zoom)}px Inter, sans-serif`;
            const w = Math.max(ctx.measureText(text).width, subtext ? ctx.measureText(subtext).width : 0) + 16 * Camera.zoom;
            const h = (subtext ? 30 : 18) * Camera.zoom;
            const rx = p.x - w / 2; const ry = placement === 'below' ? (p.y + 10 * Camera.zoom) : (p.y - h);

            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)'; ctx.strokeStyle = borderCol; ctx.lineWidth = 1.2 * Camera.zoom;
            ctx.beginPath(); ctx.roundRect(rx, ry, w, h, 5 * Camera.zoom); ctx.fill(); ctx.stroke();

            ctx.fillStyle = '#f8fafc'; ctx.textAlign = 'center';
            ctx.fillText(text, p.x, ry + 12 * Camera.zoom);
            if (subtext) {
                ctx.font = `${Math.round(9.5 * Camera.zoom)}px Inter, sans-serif`;
                ctx.fillStyle = '#94a3b8';
                ctx.fillText(subtext, p.x, ry + 24 * Camera.zoom);
            }
            ctx.restore();
        }

        function spawnParticle(gx, gy, gz, vx, vy, vz, color, size = 3, maxLife = 0.6) {
            if (SimState.particles.length > 260) return;
            SimState.particles.push({ type: 'normal', gx, gy, gz, vx, vy, vz, color, size, life: 0, maxLife });
        }

        function spawnPipePulse(gx1, gy1, gz1, gx2, gy2, gz2, maxLife = 0.48) {
            if (SimState.particles.length > 260) return;
            SimState.particles.push({
                type: 'pipePulse',
                gx1, gy1, gz1, gx2, gy2, gz2,
                gx: gx1, gy: gy1, gz: gz1,
                size: 3.4, life: 0, maxLife
            });
        }
        function updateSimulation(dt) {}

        function renderScene() {
            const time = performance.now() * 0.001;
            const w = canvas.width / window.devicePixelRatio;
            const h = canvas.height / window.devicePixelRatio;
            ctx.clearRect(0, 0, w, h);

            for (let gx = 0; gx <= 34; gx++) {
                for (let gy = 0; gy <= 15; gy++) {
                    const isBoundaryRiver = (gx >= 6 && gx <= 8 && gy <= 13);
                    const isOxygenRiver = (gy >= 13);
                    if (isBoundaryRiver || isOxygenRiver) {
                        const wave = Math.sin(time * 3.0 + gx * 0.7 + gy * 0.5) * 0.04;
                        const waterCol = isOxygenRiver
                            ? ((gx + gy) % 2 === 0 ? '#0369a1' : '#0284c7')
                            : ((gx + gy) % 2 === 0 ? '#075985' : '#0369a1');
                        drawIsoTile(gx, gy, -0.08 + wave, waterCol, 'rgba(56, 189, 248, 0.18)');
                        continue;
                    }

                    // Harmonious Grid Avenue Network (including Dual Castle Lanes: West ADP Queue & East Koku Promenade)
                    const onLeftBankRoad  = (gx === 5 && gy >= 3 && gy <= 11) || (gy === 8 && gx >= 4 && gx <= 5);
                    const onNorthHighway  = (gy === 7 && gx >= 9 && gx <= 29);
                    const onMidHighway    = (gy === 9 && gx >= 12 && gx <= 25);
                    const onSouthHighway  = (gy === 12 && gx >= 9 && gx <= 24);
                    const onWestAve       = (gx === 9 && gy >= 7 && gy <= 12);
                    const onPlazaWest     = (gx === 12 && gy >= 7 && gy <= 9);
                    const onPlazaEast     = (gx === 15 && gy >= 7 && gy <= 9);
                    const onEastAve       = (gx === 19 && gy >= 7 && gy <= 12);
                    const onCastleAve     = (gx === 25 && gy >= 6 && gy <= 11) || (gy === 11 && gx >= 25 && gx <= 28);
                    const onKokuPromenade = (gy === 7 && gx >= 26 && gx <= 29) || (gx === 28 && gy >= 7 && gy <= 9) || (gy === 9 && gx >= 28 && gx <= 31);
                    const isRoad = onLeftBankRoad || onNorthHighway || onMidHighway || onSouthHighway ||
                                   onWestAve || onPlazaWest || onPlazaEast || onEastAve || onCastleAve || onKokuPromenade;

                    if (isRoad) {
                        drawCobblestoneTile(gx, gy, 0);
                    } else {
                        let tileCol = (gx + gy) % 2 === 0 ? '#1e293b' : '#172033';
                        if (gx < 6) {
                            tileCol = (gx + gy) % 2 === 0 ? '#1e2638' : '#182030';
                        }
                        drawIsoTile(gx, gy, 0, tileCol, 'rgba(51, 65, 85, 0.22)');
                    }
                }
            }

            renderRiverEmbankments();
            renderElevatedDam();
            renderWoodenBridge();

            const renderQueue = [];
            renderQueue.push({ depth: 3.0 + 2.4, draw: renderKetogenesisShrine });
            renderQueue.push({ depth: 3.0 + 6.0, draw: renderFatProcessingLine });
            renderQueue.push({ depth: 2.4 + 8.1, draw: renderGlycogenAndGngBuckets });
            renderQueue.push({ depth: 25.55 + 12.85, draw: renderCalligraphyPavilion });
            renderQueue.push({ depth: 3.0 + 10.9, draw: renderGlucoseProcessingLine });
            renderQueue.push({ depth: 5.15 + 13.08 - 0.5, draw: renderCytosolPontoon });
            renderQueue.push({ depth: 14.3 + 14.05, draw: renderMuscleOutpostAndFerry });
            renderQueue.push({ depth: 10.9 + 5.5, draw: renderVillage1 });
            renderQueue.push({ depth: 10.8 + 11.0, draw: renderVillage2 });
            renderQueue.push({ depth: 14.3 + 8.1, draw: renderWellhouseApothecary });
            renderQueue.push({ depth: 17.3 + 5.5, draw: renderVillage3 });
            renderQueue.push({ depth: 17.3 + 10.7, draw: renderProteostasisShrine });
            renderQueue.push({ depth: 21.0 + 5.1, draw: renderHousekeepingAqueduct });
            renderQueue.push({ depth: 22.1 + 10.3, draw: renderVillage4 });
            renderQueue.push({ depth: 26.2 + 5.0, draw: renderCastleComplexV });
            renderQueue.push({ depth: 28.0 + 9.2, draw: renderSamuraiTrainingYard });
            renderQueue.push({ depth: 30.4 + 5.2, draw: renderOnsenSpillway });

            for (const c of SimState.carts) renderQueue.push({ depth: c.gx + c.gy, draw: () => drawHandCart(c) });
            for (const p of SimState.porters) renderQueue.push({ depth: p.gx + p.gy, draw: () => drawLocalPorter(p) });
            for (const f of SimState.fires) renderQueue.push({ depth: f.gx + f.gy + 0.1, draw: () => drawPathFire(f, time) });
            for (const b of SimState.brigade) renderQueue.push({ depth: b.gx + b.gy + 0.15, draw: () => drawBrigadeWorker(b) });
            for (const m of SimState.monks) renderQueue.push({ depth: m.gx + m.gy + 0.22, draw: () => drawMtorMonk(m) });
            if (SimState.ordainingMonk) renderQueue.push({ depth: SimState.ordainingMonk.gx + SimState.ordainingMonk.gy + 0.28, draw: () => drawOrdainingMonk(SimState.ordainingMonk) });
            if (SimState.pruningEvent) renderQueue.push({ depth: SimState.pruningEvent.gx + SimState.pruningEvent.gy + 0.26, draw: () => drawPruningEvent(SimState.pruningEvent) });
            for (const n of SimState.ninjas) renderQueue.push({ depth: n.gx + n.gy + 0.25, draw: () => drawAmpkNinja(n) });
            for (const s of SimState.samurai) {
                if (!s.isRonin) renderQueue.push({ depth: s.gx + s.gy, draw: () => drawSamuraiRetainer(s) });
            }
            for (const r of SimState.ronin) renderQueue.push({ depth: r.gx + r.gy + 0.2, draw: () => drawRoninRampager(r, time) });
            const villageCleared = SimState.cellDead
                || SimState.crisisState === 'necrosis'
                || SimState.crisisState === 'starvation'
                || (SimState.apoptosisSequence && SimState.apoptosisSequence.act !== 'rampage')
                || (SimState.necrosisSequence && SimState.necrosisSequence.act !== 'surge')
                || (SimState.starvationSequence && SimState.starvationSequence.act !== 'scavenge');
            const banditsCleared = SimState.cellDead
                || SimState.crisisState === 'necrosis'
                || SimState.crisisState === 'starvation'
                || (SimState.apoptosisSequence && SimState.apoptosisSequence.act !== 'rampage')
                || (SimState.necrosisSequence && (SimState.necrosisSequence.act === 'smolder' || SimState.necrosisSequence.act === 'complete'))
                || (SimState.starvationSequence && SimState.starvationSequence.act !== 'scavenge');
            if (!banditsCleared && SimState.bandits && typeof drawXenobioticBandit === 'function') {
                for (const b of SimState.bandits) renderQueue.push({ depth: b.gx + b.gy + 0.18, draw: () => drawXenobioticBandit(b) });
            }
            for (const tb of SimState.thrownBales) {
                const curX = tb.startX + (tb.endX - tb.startX) * tb.progress;
                const curY = tb.startY + (tb.endY - tb.startY) * tb.progress;
                renderQueue.push({ depth: curX + curY + 0.3, draw: () => drawThrownSteamCake(tb) });
            }
            for (const kb of SimState.ketoneButterflies) renderQueue.push({ depth: kb.gx + kb.gy + 0.5, draw: () => drawKetoneButterfly(kb) });
            if (!villageCleared && SimState.mikoCouriers) {
                for (const mk of SimState.mikoCouriers) renderQueue.push({ depth: mk.gx + mk.gy + 0.32, draw: () => drawKawabeMiko(mk) });
            }
            if (!villageCleared && SimState.dockPorter) {
                renderQueue.push({ depth: SimState.dockPorter.gx + SimState.dockPorter.gy + 0.30, draw: () => drawDockPorter(SimState.dockPorter) });
            }
            if (!villageCleared && SimState.musclePorter) {
                renderQueue.push({ depth: SimState.musclePorter.gx + SimState.musclePorter.gy + 0.34, draw: () => drawDockPorter(SimState.musclePorter) });
            }
            if (SimState.senescenceActive && SimState.senescenceYardWorkers) {
                for (const sw of SimState.senescenceYardWorkers) {
                    renderQueue.push({ depth: sw.gx + sw.gy + 0.24, draw: () => drawYardWorker(sw.gx, sw.gy, 0.25, sw.walkPhase || 0, sw.tunicCol, sw.toolType, true) });
                }
            }
            // F-08: Depth-sorted Japanese Isobune Ferries (SE side of Cytosol Pontoon <-> SW Muscle Pontoon) & Shodo Spirit
            if (SimState.muscleFerry) {
                const mf = SimState.muscleFerry;
                let inT = 0;
                if (mf.inPhase === 'toLiver') inT = mf.inProgress || 0;
                else if (mf.inPhase === 'atLiver') inT = 1;
                else if (mf.inPhase === 'returningToMuscle') inT = 1 - (mf.inProgress || 0);
                const inX = 13.65 + (6.20 - 13.65) * inT;
                const inY = 14.95 + (13.42 - 14.95) * inT;
                renderQueue.push({ depth: inX + inY + 0.25, draw: () => drawJapaneseFerryBoat(inX, inY, mf.inCargo || 'none', '', -1) });

                let outT = 0;
                if (mf.outPhase === 'toMuscle') outT = mf.outProgress || 0;
                else if (mf.outPhase === 'atMuscle') outT = 1;
                else if (mf.outPhase === 'returningToLiver') outT = 1 - (mf.outProgress || 0);
                const outX = 6.20 + (13.65 - 6.20) * outT;
                const outY = 13.82 + (15.32 - 13.82) * outT;
                renderQueue.push({ depth: outX + outY + 0.25, draw: () => drawJapaneseFerryBoat(outX, outY, mf.outCargo || 'none', 'Glc →', 1) });
            }
            if (!villageCleared && SimState.gngSpiritPulses) {
                for (const sp of SimState.gngSpiritPulses) {
                    renderQueue.push({ depth: sp.gx + sp.gy + 0.6, draw: () => drawGngWaterSpirit(sp) });
                }
            }
            if (!villageCleared && SimState.muscleCalmingSpirits) {
                for (const msp of SimState.muscleCalmingSpirits) {
                    renderQueue.push({ depth: msp.gx + msp.gy + 0.65, draw: () => drawMuscleCalmingSpirit(msp) });
                }
            }

            renderQueue.sort((a, b) => a.depth - b.depth);
            for (const item of renderQueue) item.draw();

            for (const rp of SimState.ripples) {
                const pos = isoToScreen(rp.gx, rp.gy, 0.05);
                const z = Camera.zoom;
                ctx.save();
                ctx.strokeStyle = `rgba(125, 211, 252, ${rp.alpha})`;
                ctx.lineWidth = 1.8 * z;
                ctx.beginPath();
                ctx.ellipse(pos.x, pos.y, rp.radius * 26 * z, rp.radius * 13 * z, 0, 0, Math.PI * 2);
                ctx.stroke();
                if (rp.showH2OText && rp.alpha > 0.25) {
                    ctx.font = `bold ${Math.round(11 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = `rgba(224, 242, 254, ${rp.alpha})`;
                    ctx.textAlign = 'center';
                    ctx.fillText(rp.text || '💧 H₂O', pos.x, pos.y - (1 - rp.alpha) * 24 * z - 6 * z);
                }
                ctx.restore();
            }

            for (const pt of SimState.particles) {
                const pos = isoToScreen(pt.gx, pt.gy, pt.gz); ctx.save();
                if (pt.type === 'pipePulse') {
                    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)'; ctx.beginPath(); ctx.arc(pos.x, pos.y, (pt.size + 3.5) * Camera.zoom, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#e0f2fe'; ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 1.2 * Camera.zoom;
                    ctx.beginPath(); ctx.arc(pos.x, pos.y, pt.size * Camera.zoom, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                } else {
                    ctx.globalAlpha = Math.max(0, 1 - (pt.life / pt.maxLife));
                    ctx.fillStyle = pt.color; ctx.beginPath(); ctx.arc(pos.x, pt.y || pos.y, pt.size * Camera.zoom, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            }
            if (typeof drawApoptosisFinale === 'function') drawApoptosisFinale(time);
        }

        function drawApoptosisFinale(time) {
            const z = Camera.zoom;
            if (SimState.victoryAchieved) {
                ctx.save();
                const vType = SimState.victoryType || 'superCapacity';
                const colA = vType === 'flexibility' ? '#22d3ee' : (vType === 'homeostasis' ? '#fbbf24' : '#facc15');
                const glowA = vType === 'flexibility' ? 'rgba(34, 211, 238, 0.36)' : (vType === 'homeostasis' ? 'rgba(251, 191, 36, 0.36)' : 'rgba(250, 204, 21, 0.36)');
                const colB = vType === 'flexibility' ? '#fde047' : '#34d399';
                const glowB = vType === 'flexibility' ? 'rgba(253, 224, 71, 0.34)' : 'rgba(52, 211, 153, 0.36)';
                const matsuriLanterns = [
                    { gx: 30.1, gy: 9.18, gz: 1.35, col: colA, glow: glowA },
                    { gx: 31.1, gy: 9.18, gz: 1.35, col: colB, glow: glowB },
                    { gx: 28.2, gy: 9.4, gz: 0.95, col: colA, glow: glowA },
                    { gx: 32.8, gy: 9.4, gz: 0.95, col: colB, glow: glowB },
                    { gx: 32.8, gy: 12.4, gz: 0.95, col: colA, glow: glowA },
                    { gx: 25.2, gy: 6.4, gz: 1.45, col: colA, glow: glowA },
                    { gx: 26.8, gy: 6.4, gz: 1.45, col: colB, glow: glowB },
                    { gx: 5.3, gy: 7.6, gz: 0.72, col: colA, glow: glowA },
                    { gx: 8.7, gy: 7.6, gz: 0.72, col: colB, glow: glowB },
                    { gx: 5.3, gy: 9.2, gz: 0.72, col: colB, glow: glowB },
                    { gx: 8.7, gy: 9.2, gz: 0.72, col: colA, glow: glowA },
                ];
                for (let i = 0; i < matsuriLanterns.length; i++) {
                    const ml = matsuriLanterns[i];
                    const sway = Math.sin(time * 2.5 + i * 1.1) * 1.2 * z;
                    const lp = isoToScreen(ml.gx, ml.gy, ml.gz);
                    ctx.fillStyle = ml.glow;
                    ctx.beginPath(); ctx.arc(lp.x + sway, lp.y, 9.5 * z, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = ml.col; ctx.strokeStyle = '#fef9c3'; ctx.lineWidth = 0.9 * z;
                    ctx.beginPath(); ctx.ellipse(lp.x + sway, lp.y, 3.2 * z, 4.4 * z, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                }
                for (const pt of (SimState.matsuriPetals || [])) {
                    const bobZ = Math.sin(pt.phase) * 0.25;
                    const pp = isoToScreen(pt.gx, pt.gy, pt.gz + bobZ);
                    if (pt.isFirefly) {
                        const pulse = 0.55 + 0.45 * Math.sin(pt.phase * 1.8);
                        ctx.globalAlpha = pulse;
                        ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
                        ctx.beginPath(); ctx.arc(pp.x, pp.y, 5.8 * z, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = '#fef08a';
                        ctx.beginPath(); ctx.arc(pp.x, pp.y, 2.1 * z, 0, Math.PI * 2); ctx.fill();
                    } else {
                        ctx.globalAlpha = 0.85;
                        ctx.save();
                        ctx.translate(pp.x, pp.y);
                        ctx.rotate(pt.phase);
                        ctx.fillStyle = '#fbcfe8';
                        ctx.beginPath(); ctx.ellipse(0, 0, 3.0 * z, 1.6 * z, 0, 0, Math.PI * 2); ctx.fill();
                        ctx.restore();
                    }
                }
                ctx.restore();
            }
            if ((SimState.targetGarrisonSize || 20) <= 15 && !SimState.cellDead && !SimState.villageCharred && !((SimState.villageGreyLevel || 0) > 0.3)) {
                // Austere cool slate-indigo mist around the Dojo & Practice Yard at the 15/25 Lean Minimum
                ctx.save();
                const mistPts = [
                    { gx: 28.6, gy: 10.0, r: 24 }, { gx: 30.8, gy: 11.2, r: 28 },
                    { gx: 32.4, gy: 10.2, r: 22 }, { gx: 29.8, gy: 12.2, r: 20 }
                ];
                for (let i = 0; i < mistPts.length; i++) {
                    const mp = mistPts[i];
                    const drift = Math.sin(time * 0.85 + i * 1.6) * 4.5 * z;
                    const sp = isoToScreen(mp.gx, mp.gy, 0.25);
                    ctx.fillStyle = 'rgba(129, 140, 248, 0.14)';
                    ctx.beginPath();
                    ctx.ellipse(sp.x + drift, sp.y, mp.r * z, mp.r * 0.45 * z, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
            const np = SimState.necrosisSequence;
            if (np && np.roofHeat > 0.02) {
                const roofHubs = [
                    { gx: 3.0, gy: 2.0, gz: 1.9 }, { gx: 10.9, gy: 5.5, gz: 2.2 },
                    { gx: 10.8, gy: 11.0, gz: 2.2 }, { gx: 14.3, gy: 8.1, gz: 2.2 },
                    { gx: 17.3, gy: 5.5, gz: 2.2 }, { gx: 17.3, gy: 10.7, gz: 2.1 },
                    { gx: 22.1, gy: 10.3, gz: 2.3 }, { gx: 26.2, gy: 5.0, gz: 5.4 }
                ];
                ctx.save();
                for (let i = 0; i < roofHubs.length; i++) {
                    const rh = roofHubs[i];
                    const rp = isoToScreen(rh.gx, rh.gy, rh.gz);
                    drawFlameCluster(rp.x, rp.y, 1.05 * np.roofHeat, z, time, i * 1.9, false, Math.min(1, np.roofHeat * 0.95));
                }
                ctx.restore();
            }

            const st = SimState.starvationSequence;
            if (st && st.tumbleweeds && st.tumbleweeds.length > 0) {
                ctx.save();
                for (const tw of st.tumbleweeds) {
                    const bounce = Math.abs(Math.sin(tw.rot)) * 0.16;
                    const sh = isoToScreen(tw.gx, tw.gy, 0.04);
                    const tp = isoToScreen(tw.gx, tw.gy, 0.28 + bounce);
                    const r = 8.5 * z * (tw.scale || 1);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
                    ctx.beginPath(); ctx.ellipse(sh.x, sh.y + 1.5 * z, r * 0.9, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.save();
                    ctx.translate(tp.x, tp.y);
                    ctx.rotate(tw.rot);
                    ctx.strokeStyle = '#78716c'; ctx.lineWidth = 1.2 * z;
                    for (let k = 0; k < 5; k++) {
                        const a = (k * Math.PI) / 5;
                        ctx.beginPath();
                        ctx.ellipse(0, 0, r, r * (0.45 + (k % 2) * 0.25), a, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    ctx.strokeStyle = '#a8a29e'; ctx.lineWidth = 0.85 * z;
                    ctx.beginPath();
                    ctx.arc(0, 0, r * 0.55, 0.4, Math.PI * 1.65);
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.restore();
            }

            const ap = SimState.apoptosisSequence;
            if (!ap || (ap.act !== 'seppuku' && ap.act !== 'complete')) return;
            if (!ap.blebLanterns || ap.blebLanterns.length === 0) return;

            ctx.save();
            // Quiet Toro Nagashi lanterns drifting gently skyward across the empty village
            for (const bh of ap.blebLanterns) {
                const ph = (time * 0.32 + bh.phase) % 1;
                const bp = isoToScreen(bh.gx + Math.sin(time * 1.5 + bh.phase) * 0.25, bh.gy, 0.5 + ph * 2.2);
                ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.78;
                ctx.fillStyle = 'rgba(253, 224, 71, 0.30)';
                ctx.beginPath(); ctx.arc(bp.x, bp.y, 8.0 * z, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fef08a'; ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 1.0 * z;
                ctx.beginPath(); ctx.arc(bp.x, bp.y, 3.8 * z, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            }
            ctx.restore();
        }

        function renderElevatedDam() {
            const time = performance.now() * 0.001;
            const z = Camera.zoom;
            const isCrit = SimState.damLevel >= BioConfig.rosDamThreshold;
            const waterDepth = 0.22 + (SimState.damLevel / 100) * 1.92;

            // 1. Deep Basalt Bedrock Foundation & Impounded Basin Floor
            drawIshigakiStoneBox(9.0, 0.25, 0, 22.2, 3.45, 0.28, '#334155', '#1e293b', '#0f172a', '#020617', 2);

            // 2. North & West Perimeter Retaining Dam Walls (drawn before water so water sits inside the basin)
            drawIshigakiStoneBox(9.0, 0.25, 0.28, 22.2, 0.48, 2.22, '#64748b', '#475569', '#334155', '#0f172a', 4);
            drawIshigakiStoneBox(9.0, 0.73, 0.28, 0.68, 2.85, 2.22, '#64748b', '#475569', '#334155', '#0f172a', 4);

            // 3. Enclosed Impounded Reservoir Water (completely contained within the 4 masonry walls)
            const wTopCol = isCrit ? '#0284c7' : '#0ea5e9';
            const wLeftCol = isCrit ? '#0369a1' : '#0284c7';
            const wRightCol = '#075985';
            drawIsoBox(9.68, 0.73, 0.28, 20.84, 2.42, waterDepth, wTopCol, wLeftCol, wRightCol, 'rgba(125, 211, 252, 0.4)');

            // Animated Reservoir Surface Waves & Depth Gauge Markings
            ctx.save();
            const waterZ = 0.28 + waterDepth + 0.02;
            ctx.strokeStyle = isCrit ? 'rgba(254, 205, 211, 0.42)' : 'rgba(186, 230, 253, 0.36)';
            ctx.lineWidth = 1.3 * z;
            for (let r = 0; r < 5; r++) {
                const waveX = 11.2 + r * 3.8 + Math.sin(time * 2.2 + r) * 0.35;
                const waveY = 1.25 + (r % 2) * 0.85;
                const p1 = isoToScreen(waveX, waveY, waterZ);
                const p2 = isoToScreen(waveX + 1.6, waveY, waterZ);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.quadraticCurveTo((p1.x + p2.x) * 0.5, p1.y - 2.2 * z, p2.x, p2.y);
                ctx.stroke();
            }
            ctx.restore();

            // 4. East Perimeter Retaining Wing-Wall
            drawIshigakiStoneBox(30.52, 0.73, 0.28, 0.68, 2.85, 2.22, '#64748b', '#475569', '#334155', '#0f172a', 4);

            // 5. Monumental Southern Battered Gravity Dam Wall (Split at gx: 29.05..30.15 for the Onsen Sluice Gate)
            // Lower sloped apron / toe of the gravity dam
            drawIshigakiStoneBox(9.0, 3.15, 0, 20.05, 0.68, 0.92, '#475569', '#334155', '#1e293b', '#0f172a', 2);
            // Middle battered masonry tier
            drawIshigakiStoneBox(9.0, 3.12, 0.92, 20.05, 0.54, 0.86, '#64748b', '#475569', '#334155', '#0f172a', 2);
            // Upper dam crest & walkway (z = 1.78..2.52)
            drawIshigakiStoneBox(9.0, 3.08, 1.78, 20.05, 0.44, 0.74, '#94a3b8', '#64748b', '#475569', '#0f172a', 2);

            // East section of Southern Dam Wall (beyond the Onsen Sluice Gate channel)
            drawIshigakiStoneBox(30.15, 3.12, 0, 1.05, 0.62, 2.52, '#94a3b8', '#475569', '#334155', '#0f172a', 5);

            // 6. Heavy Stone Buttress Counterfort Piers & Crest Parapets along the Southern Dam Face
            const buttressPositions = [10.4, 14.0, 17.4, 21.8, 25.4, 28.1];
            for (const bx of buttressPositions) {
                drawIshigakiStoneBox(bx, 3.42, 0, 0.75, 0.48, 1.95, '#64748b', '#475569', '#1e293b', '#0f172a', 3);
                drawIsoBox(bx + 0.08, 3.10, 2.52, 0.58, 0.36, 0.16, '#cbd5e1', '#94a3b8', '#475569');
            }

            // Castle Complex V Penstock Flume Chute feeding the golden ATP Synthase waterwheel at gx = 24.45
            drawIsoBox(24.22, 3.38, 1.15, 0.52, 1.35, 0.22, '#334155', '#1e293b', '#0f172a');
            if (SimState.damLevel > 5 && SimState.atpRate > 0.05) {
                drawIsoBox(24.28, 3.42, 1.25, 0.40, 1.30, 0.14, '#38bdf8', '#0284c7', '#0369a1');
            }

            // 7. Pressurized Proton Intake Bamboo Aqueducts from Complexes I, III, and IV
            drawBambooPipe(12.05, 5.15, 0.85, 12.05, 3.25, 2.45, true);
            drawBambooPipe(18.45, 5.25, 0.85, 18.45, 3.25, 2.45, true);
            drawBambooPipe(23.25, 9.85, 0.85, 23.25, 3.25, 2.45, true);

            const mv = Math.round(140 + (SimState.damLevel / 100) * 80);
            drawFloatingLabel(18.2, 1.75, 2.95, `THE PROTON DAM (${Math.round(SimState.damLevel)}%)`, `Impounded Intermembrane H+ Reservoir • ${mv} mV`, isCrit ? '#f43f5e' : '#38bdf8');
        }

        function drawBambooPipe(gx1, gy1, gz1, gx2, gy2, gz2, withTrestles = false) {
            const p1 = isoToScreen(gx1, gy1, gz1); const p2 = isoToScreen(gx2, gy2, gz2); const z = Camera.zoom; ctx.save();
            if (withTrestles) {
                const dist = Math.hypot(gx2 - gx1, gy2 - gy1); const stilts = Math.max(1, Math.floor(dist / 1.8));
                ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2.2 * z;
                for (let i = 1; i <= stilts; i++) {
                    const t = i / (stilts + 1);
                    const topPt = isoToScreen(gx1 + (gx2 - gx1) * t, gy1 + (gy2 - gy1) * t, gz1 + (gz2 - gz1) * t);
                    const botPt = isoToScreen(gx1 + (gx2 - gx1) * t, gy1 + (gy2 - gy1) * t, 0);
                    ctx.beginPath(); ctx.moveTo(topPt.x - 2 * z, topPt.y); ctx.lineTo(botPt.x - 3.5 * z, botPt.y); ctx.stroke();
                }
            }
            ctx.strokeStyle = '#365314'; ctx.lineWidth = 6.5 * z; ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            ctx.strokeStyle = '#84cc16'; ctx.lineWidth = 4.2 * z; ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            ctx.restore();
        }

        function renderWoodenBridge() {
            drawIshigakiStoneBox(5.15, 7.60, -0.05, 0.55, 1.75, 0.34, '#64748b', '#475569', '#334155', '#1e293b', 2);
            drawIshigakiStoneBox(8.35, 7.60, -0.05, 0.55, 1.75, 0.34, '#64748b', '#475569', '#334155', '#1e293b', 2);
            if (SimState.membraneDepolarized) {
                // Blown-up bridge: charred broken deck stubs on each bank, center collapsed
                drawIsoBox(5.4, 7.70, 0.08, 0.85, 1.55, 0.16, '#3f2e26', '#292524', '#1c1917', '#09090b');
                drawIsoBox(7.75, 7.70, 0.08, 0.85, 1.55, 0.16, '#3f2e26', '#292524', '#1c1917', '#09090b');
                drawStoneLantern(5.05, 7.45, 0.0, false);
                drawStoneLantern(8.95, 7.45, 0.0, false);
                drawFloatingLabel(7.0, 9.75, 0.0, 'Bridge Destroyed', 'Membrane Depolarized (0 mV)', '#fda4af', 'below');
                return;
            }
            drawIsoBox(5.4, 7.65, 0.10, 3.2, 1.65, 0.22, '#92400e', '#78350f', '#451a03', '#27272a');
            // Red-lacquered Taiko-bashi Bridge Handrails & Giboshi Posts
            drawIsoBox(5.45, 7.65, 0.32, 3.1, 0.08, 0.24, '#dc2626', '#991b1b', '#7f1d1d');
            drawIsoBox(5.45, 9.22, 0.32, 3.1, 0.08, 0.24, '#dc2626', '#991b1b', '#7f1d1d');
            drawStoneLantern(5.05, 7.45, 0.0, true);
            drawStoneLantern(8.95, 7.45, 0.0, true);
            drawFloatingLabel(7.0, 9.75, 0.0, 'Membrane Bridge', 'NADH / FADH2 Carrier Crossing', '#a8a29e', 'below');
        }

        function renderKetogenesisShrine() {
            const time = performance.now() * 0.001;
            const isActive = SimState.ketogenesisActive;
            const prep = Math.min(1, SimState.lowCarbDuration / 2.0);

            drawIshigakiStoneBox(1.2, 1.2, 0, 3.5, 2.5, 0.28, isActive ? '#78350f' : '#475569', '#334155', '#1e293b', '#0f172a', 2);
            drawIsoBox(1.55, 1.35, 0.28, 0.14, 0.14, 0.88, '#991b1b', '#7f1d1d', '#450a0a');
            drawIsoBox(4.35, 1.35, 0.28, 0.14, 0.14, 0.88, '#991b1b', '#7f1d1d', '#450a0a');
            drawIsoBox(1.55, 2.55, 0.28, 0.14, 0.14, 0.88, '#991b1b', '#7f1d1d', '#450a0a');
            drawIsoBox(4.35, 2.55, 0.28, 0.14, 0.14, 0.88, '#991b1b', '#7f1d1d', '#450a0a');
            drawJapaneseRoof(1.4, 1.25, 1.16, 3.1, 1.45, 0.65, '#451a03', isActive ? '#b45309' : '#57534e', isActive ? '#fbbf24' : '#94a3b8');

            drawIsoBox(2.15, 2.82, 0.28, 1.65, 0.72, 0.26, isActive ? '#d97706' : '#64748b', '#78350f', '#451a03');

            drawBambooPipe(2.98, 4.80, 0.32, 2.98, 3.52, 0.42, false);
            drawStoneLantern(1.45, 3.45, 0.28, isActive);
            drawStoneLantern(4.45, 3.45, 0.28, isActive);

            // Step-by-step 2-Loaf Condensation Cycle (0 loaves when dormant; 1st loaf -> 2nd loaf -> snap into butterfly -> empty altar)
            const hasSnappingButterfly = SimState.ketoneButterflies.some(kb => kb.phase === 'snapping');
            if (isActive && !hasSnappingButterfly) {
                const cycleLen = SimState.ketoneCycleDuration || 1.95;
                const prog = Math.max(0, Math.min(1, (SimState.ketoneTimer || 0) / cycleLen));

                if (prog < 0.38) {
                    // Loaf 1 sliding up the bamboo chute onto the left altar pad
                    const t1 = prog / 0.38;
                    const cPos = isoToScreen(2.98 - t1 * 0.30, 4.80 - t1 * 1.62, 0.36 + t1 * 0.20);
                    drawTawaraBale(cPos.x, cPos.y, 0.64, 0.15 * t1, true);
                } else {
                    if (prog < 0.80) {
                        // Loaf 1 resting on the left altar pad while Loaf 2 slides up the bamboo chute
                        const b1 = isoToScreen(2.68, 3.18, 0.56);
                        drawTawaraBale(b1.x, b1.y, 0.65, 0.15, true);
                        const t2 = (prog - 0.38) / 0.42;
                        const cPos2 = isoToScreen(2.98 + t2 * 0.30, 4.80 - t2 * 1.62, 0.36 + t2 * 0.20);
                        drawTawaraBale(cPos2.x, cPos2.y, 0.64, -0.15 * t2, true);
                    } else {
                        // Both loaves shudder in place at their exact altar coordinates (2.68 and 3.28)
                        // before magnetically accelerating inward during the 'snapping' phase (zero outward flick!)
                        const preFrac = (prog - 0.80) / 0.20;
                        const shudder = Math.sin(time * 48) * 0.022 * preFrac;
                        const b1 = isoToScreen(2.68 + shudder, 3.18, 0.56);
                        const b2 = isoToScreen(3.28 - shudder, 3.18, 0.56);
                        drawTawaraBale(b1.x, b1.y, 0.65, 0.15 + shudder * 1.2, true);
                        drawTawaraBale(b2.x, b2.y, 0.65, -0.15 - shudder * 1.2, true);
                    }
                }
            }

            if (SimState.mtorKetoneSeal) {
                const sealPos = isoToScreen(2.98, 3.18, 0.92);
                const z = Camera.zoom;
                ctx.save();
                ctx.fillStyle = 'rgba(180, 83, 9, 0.92)';
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 1.6 * z;
                ctx.beginPath();
                ctx.roundRect(sealPos.x - 42 * z, sealPos.y - 10 * z, 84 * z, 20 * z, 4 * z);
                ctx.fill();
                ctx.stroke();
                if (SimState.showLabels) {
                    ctx.font = `bold ${Math.round(8.5 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#fef08a';
                    ctx.textAlign = 'center';
                    ctx.fillText('🧘‍♂️ mTOR SEAL (PPARα ⊣)', sealPos.x, sealPos.y + 3 * z);
                }
                ctx.restore();
            }

            if (SimState.mtorKetoneSeal) drawFloatingLabel(3.0, 1.8, 2.15, '🔒 KETOGENESIS SEALED BY mTOR', 'Drop Glucose ≤ 30% or Trigger AMPK to Unlock', '#f59e0b');
            else if (isActive) drawFloatingLabel(3.0, 1.8, 2.15, '🦋 KETOGENESIS SHRINE (ACTIVE)', `β-HB (Gold: Fire ⊣) • AcAc (Blue: Fuel) • Acetone (Pink) (${SimState.ketoneRate.toFixed(1)}/s)`, '#fbbf24');
            else if (prep > 0.15) drawFloatingLabel(3.0, 1.8, 2.15, `Ketogenesis Warming (${Math.round(prep * 100)}%)`, 'Low Glc / High Glucagon State...', '#f59e0b');
            else drawFloatingLabel(3.0, 1.8, 2.15, 'Ketogenesis Shrine (Dormant)', 'Activates at Low Glc + High Fat', '#94a3b8');
        }

        function drawKetoneButterfly(kb) {
            const z = Camera.zoom; const pos = isoToScreen(kb.gx, kb.gy, kb.gz);
            const kType = kb.ketoneType || 'BHB'; // 'BHB' | 'AcAc' | 'Acetone'
            if (kb.phase === 'snapping') {
                const t = Math.min(1, kb.timer / 0.48);
                // Magnetic snap: starts at exact altar separation (2.68 and 3.28 -> halfSep = 0.30 world units)
                // and accelerates smoothly inward (t^2.5) with high-frequency shudder and ZERO outward flick!
                const magPull = Math.pow(t, 2.5);
                const shudder = Math.sin(t * Math.PI * 16) * 0.025 * (1 - t * 0.6);
                const halfSep = 0.30 * (1 - magPull);
                const b1 = isoToScreen(2.98 - halfSep + shudder, 3.18, 0.56 + 0.02 * t);
                const b2 = isoToScreen(2.98 + halfSep - shudder, 3.18, 0.56 + 0.02 * t);
                const baleScale = 0.65 + 0.07 * t;
                drawTawaraBale(b1.x, b1.y, baleScale, 0.15 * (1 - t) + shudder, true);
                drawTawaraBale(b2.x, b2.y, baleScale, -0.15 * (1 - t) - shudder, true);
                if (t > 0.55) {
                    ctx.save();
                    const ringCol = kType === 'BHB'
                        ? `rgba(250, 204, 21, ${(1 - t) * 2.2})`
                        : (kType === 'AcAc' ? `rgba(56, 189, 248, ${(1 - t) * 2.2})` : `rgba(244, 114, 182, ${(1 - t) * 2.2})`);
                    ctx.strokeStyle = ringCol;
                    ctx.lineWidth = 2.5 * z;
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, (t - 0.5) * 38 * z, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                return;
            }

            // Palette for the 3 physiological ketone bodies:
            // 1. BHB (Golden-Amber: NLRP3 fire extinguisher & HDAC epigenetic healer)
            // 2. AcAc (Cerulean-Indigo: oxidized ketone fuel, cannot extinguish fires)
            // 3. Acetone (Rose-Pink: volatile decarboxylation byproduct, exhaled skyward)
            const palette = kType === 'AcAc'
                ? {
                    glow0: 'rgba(56, 189, 248, 0.48)', glow1: 'rgba(99, 102, 241, 0)',
                    w0: '#e0f2fe', w1: '#38bdf8', w2: '#4f46e5', stroke: '#1e3a8a',
                    lower: '#6366f1', body: '#e0f2fe', ant: '#7dd3fc', label: 'AcAc (Fuel)', lblCol: '#7dd3fc'
                }
                : (kType === 'Acetone'
                    ? {
                        glow0: 'rgba(244, 114, 182, 0.45)', glow1: 'rgba(244, 114, 182, 0)',
                        w0: '#ffe4e6', w1: '#f472b6', w2: '#e11d48', stroke: '#881337',
                        lower: '#fb7185', body: '#fff1f2', ant: '#fda4af', label: 'Acetone (Volatile)', lblCol: '#fda4af'
                    }
                    : {
                        glow0: kb.targetFire ? 'rgba(34, 211, 238, 0.58)' : 'rgba(251, 191, 36, 0.48)', glow1: 'rgba(251, 191, 36, 0)',
                        w0: '#fef08a', w1: '#fbbf24', w2: '#d97706', stroke: '#78350f',
                        lower: '#f59e0b', body: '#fef9c3', ant: '#fde047', label: kb.targetFire ? 'β-HB ⊣ Fire!' : 'β-HB', lblCol: '#fde047'
                    });

            const flap = Math.sin(kb.wingPhase);
            const ws = (11 + flap * 6.5) * z;
            ctx.save();
            if (typeof kb.alpha === 'number') ctx.globalAlpha = Math.max(0, kb.alpha);
            ctx.translate(pos.x, pos.y);

            const glow = ctx.createRadialGradient(0, 0, 2 * z, 0, 0, 18 * z);
            glow.addColorStop(0, palette.glow0);
            glow.addColorStop(1, palette.glow1);
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(0, 0, 18 * z, 0, Math.PI * 2); ctx.fill();

            const wingGrad = ctx.createLinearGradient(0, -12 * z, 0, 8 * z);
            wingGrad.addColorStop(0, palette.w0);
            wingGrad.addColorStop(0.55, palette.w1);
            wingGrad.addColorStop(1, palette.w2);
            ctx.fillStyle = wingGrad;
            ctx.strokeStyle = palette.stroke;
            ctx.lineWidth = 1.2 * z;

            ctx.beginPath();
            ctx.moveTo(0, -2 * z);
            ctx.lineTo(-ws * 1.25, -12 * z);
            ctx.lineTo(-ws * 0.95, 1 * z);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, -2 * z);
            ctx.lineTo(ws * 1.25, -12 * z);
            ctx.lineTo(ws * 0.95, 1 * z);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.fillStyle = palette.lower;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-ws * 0.85, 2 * z);
            ctx.lineTo(-ws * 0.45, 10 * z);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(ws * 0.85, 2 * z);
            ctx.lineTo(ws * 0.45, 10 * z);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.fillStyle = palette.body;
            ctx.beginPath(); ctx.ellipse(0, 0, 1.8 * z, 6.5 * z, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = palette.ant; ctx.lineWidth = 0.9 * z;
            ctx.beginPath();
            ctx.moveTo(0, -5 * z); ctx.lineTo(-3.5 * z, -9.5 * z);
            ctx.moveTo(0, -5 * z); ctx.lineTo(3.5 * z, -9.5 * z);
            ctx.stroke();

            if (SimState.showLabels) {
                ctx.font = `bold ${Math.round(7.0 * z)}px Inter, sans-serif`;
                ctx.fillStyle = palette.lblCol;
                ctx.textAlign = 'center';
                ctx.fillText(palette.label, 0, -13.5 * z);
            }
            ctx.restore();
        }

        function renderFatProcessingLine() {
            const time = performance.now() * 0.001;
            const warburgShutdown = !!SimState.warburgActive;
            drawIshigakiStoneBox(1.2, 4.8, 0, 3.5, 2.4, 0.25, warburgShutdown ? '#334155' : '#78350f', '#451a03', '#27272a', '#1c1917', 2);
            drawIsoBox(2.0, 5.4, 0.25, 2.3, 0.85, 0.28, warburgShutdown ? '#334155' : '#b45309', '#475569', '#1e293b');

            if (warburgShutdown) {
                // Complete 4-sided Barricade Wall enclosing & shutting down Beta-Oxidation during Compensatory Fermentation
                const wallH = 0.78;
                // North, West, East, and South stone-and-timber containment walls
                drawIsoBox(1.20, 4.78, 0.25, 3.50, 0.18, wallH, '#475569', '#334155', '#1e293b', '#0f172a');
                drawIsoBox(1.20, 4.78, 0.25, 0.18, 2.42, wallH, '#475569', '#334155', '#1e293b', '#0f172a');
                drawIsoBox(4.52, 4.78, 0.25, 0.18, 2.42, wallH, '#475569', '#334155', '#1e293b', '#0f172a');
                drawIsoBox(1.20, 7.02, 0.25, 3.50, 0.18, wallH, '#64748b', '#475569', '#1e293b', '#0f172a');

                // Heavy crimson-and-iron top coping beams & crossed quarantine planks over the conveyor
                drawIsoBox(1.18, 4.76, 0.25 + wallH, 3.54, 0.22, 0.10, '#991b1b', '#7f1d1d', '#450a0a');
                drawIsoBox(1.18, 7.00, 0.25 + wallH, 3.54, 0.22, 0.10, '#991b1b', '#7f1d1d', '#450a0a');
                drawIsoBox(1.18, 4.76, 0.25 + wallH, 0.22, 2.46, 0.10, '#991b1b', '#7f1d1d', '#450a0a');
                drawIsoBox(4.50, 4.76, 0.25 + wallH, 0.22, 2.46, 0.10, '#991b1b', '#7f1d1d', '#450a0a');

                const z = Camera.zoom;
                const c1 = isoToScreen(1.85, 5.25, 0.95);
                const c2 = isoToScreen(4.15, 6.75, 0.95);
                const c3 = isoToScreen(4.15, 5.25, 0.95);
                const c4 = isoToScreen(1.85, 6.75, 0.95);
                ctx.save();
                ctx.strokeStyle = '#dc2626';
                ctx.lineWidth = 4.2 * z;
                ctx.beginPath();
                ctx.moveTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y);
                ctx.moveTo(c3.x, c3.y); ctx.lineTo(c4.x, c4.y);
                ctx.stroke();
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 1.4 * z;
                ctx.setLineDash([5 * z, 4 * z]);
                ctx.beginPath();
                ctx.moveTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y);
                ctx.moveTo(c3.x, c3.y); ctx.lineTo(c4.x, c4.y);
                ctx.stroke();
                ctx.setLineDash([]);

                const signPos = isoToScreen(2.95, 6.0, 1.32);
                ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 1.8 * z;
                ctx.beginPath();
                ctx.roundRect(signPos.x - 54 * z, signPos.y - 10 * z, 108 * z, 20 * z, 4 * z);
                ctx.fill(); ctx.stroke();
                if (SimState.showLabels) {
                    ctx.font = `bold ${Math.round(8.2 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#fca5a5';
                    ctx.textAlign = 'center';
                    ctx.fillText('🧱 WALLED OFF (β-OX SHUTDOWN)', signPos.x, signPos.y + 3 * z);
                }
                ctx.restore();

                drawFloatingLabel(3.0, 4.9, 1.85, 'Fat Processing Yard (WALLED OFF)', 'HIF-1α & NAD⁺ Depletion Shutdown • Workers Moved to Stage Bonfire!', '#f87171');
                return;
            }

            const inhib = SimState.fatInhibitionLevel;
            drawIsoBox(1.45, 5.25, 0.25, 0.18, 0.18, 1.15, '#dc2626', '#991b1b', '#7f1d1d');
            drawIsoBox(1.45, 6.15, 0.25, 0.18, 0.18, 1.15, '#dc2626', '#991b1b', '#7f1d1d');
            drawIsoBox(1.38, 5.10, 1.35, 0.32, 1.35, 0.18, '#ef4444', '#b91c1c', '#7f1d1d');
            if (inhib > 0.12) {
                drawIsoBox(1.47, 5.42, 0.35, 0.12, 0.72, inhib * 0.95, 'rgba(244, 63, 94, 0.88)', 'rgba(190, 18, 60, 0.88)', 'rgba(136, 19, 55, 0.88)');
                const gatePos = isoToScreen(1.50, 5.80, 1.65);
                const z = Camera.zoom;
                if (SimState.showLabels) {
                    ctx.save();
                    ctx.font = `bold ${Math.round(8.5 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#fda4af'; ctx.textAlign = 'center';
                    ctx.fillText(`⛔ Malonyl-CoA (-${Math.round(inhib * 100)}%)`, gatePos.x, gatePos.y);
                    ctx.restore();
                }
            }

            const rBlock = SimState.randleBlockLevel;
            if (rBlock > 0.12) {
                const pStart = isoToScreen(3.9, 7.1, 0.35);
                const pEnd = isoToScreen(4.65, 10.5, 0.55);
                const z = Camera.zoom;
                ctx.save();
                ctx.strokeStyle = `rgba(245, 158, 11, ${0.35 + rBlock * 0.55})`;
                ctx.lineWidth = 3.2 * z;
                ctx.setLineDash([6 * z, 4 * z]);
                ctx.lineDashOffset = -time * 28 * z;
                ctx.beginPath(); ctx.moveTo(pStart.x, pStart.y); ctx.lineTo(pEnd.x, pEnd.y); ctx.stroke();
                ctx.restore();
            }

            // Smooth forward-only conveyor slats + long continuous Fatty Acyl Chain chopped into Acetyl-CoA bales!
            drawConveyorSlats(2.02, 5.82, 0.54, 2.24, 0.80, SimState.fatChainOffset * 3, 'rgba(253, 224, 71, 0.25)');
            drawFattyAcylChain(1.68, 5.78, 0.58, 10, SimState.fatChainOffset);
            if (SimState.effectiveFat > 2) {
                // Freshly cleaved Acetyl-CoA bale slides forward to the cart pickup pad and is collected when fatTimer resets!
                const fProg = Math.max(0, Math.min(1, (SimState.fatTimer || 0) / 1.15));
                const balePos = isoToScreen(3.78 + fProg * 0.58, 5.78, 0.58);
                drawTawaraBale(balePos.x, balePos.y, 0.58 + fProg * 0.16, 0.12 * (1 - fProg), true);
            }
            drawYardWorker(3.75, 6.65, 0.25, time * 8, '#92400e', 'cleaver');
            // Steatotic Lipid Droplets (NAFLD / MASLD accumulation as IR ratchets up)
            if ((SimState.irRatchetBonus || 0) > 0 || SimState.crisisState === 'nafld') {
                const dropCount = SimState.crisisState === 'nafld' ? 8 : Math.min(6, Math.ceil((SimState.irRatchetBonus || 0) * 14));
                const dropCoords = [
                    [1.55, 6.85], [2.15, 7.05], [4.35, 6.95], [4.45, 5.15],
                    [1.45, 5.05], [3.15, 7.10], [2.65, 4.95], [3.95, 7.12]
                ];
                const z = Camera.zoom;
                ctx.save();
                for (let d = 0; d < dropCount; d++) {
                    const dc = dropCoords[d];
                    const dp = isoToScreen(dc[0], dc[1], 0.34);
                    const r = (5.2 + (d % 3) * 1.4) * z;
                    ctx.fillStyle = 'rgba(250, 204, 21, 0.72)';
                    ctx.strokeStyle = '#d97706';
                    ctx.lineWidth = 1.0 * z;
                    ctx.beginPath(); ctx.arc(dp.x, dp.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.fillStyle = 'rgba(254, 249, 195, 0.75)';
                    ctx.beginPath(); ctx.arc(dp.x - r * 0.3, dp.y - r * 0.3, r * 0.28, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            }
            const fatSub = SimState.rosFeedbackBrake > 0.12
                ? `⚡ ROS Feedback Brake (-${Math.round(SimState.rosFeedbackBrake * 100)}% Fuel)`
                : (inhib > 0.25 ? `CPT-1 Gate Throttled (-${Math.round(inhib * 100)}% Malonyl-CoA)` : 'Chopping Acyl Chain → Acetyl-CoA Bales');
            drawFloatingLabel(3.0, 4.9, 1.85, 'Fat Processing Yard (β-Oxidation)', fatSub, SimState.rosFeedbackBrake > 0.12 ? '#fbbf24' : '#f59e0b');
        }

        function drawCrumblingRubble(gx, gy, bogFrac, accentCol, time) {
            const z = Camera.zoom;
            const center = isoToScreen(gx, gy, 0.05);
            ctx.save();
            for (let i = 0; i < 10; i++) {
                const ang = i * 0.68 + 0.4;
                const dist = (14 + (i % 3) * 7) * z * (0.6 + 0.4 * bogFrac);
                const fall = ((time * (1.2 + (i % 4) * 0.3) + i * 0.19) % 1);
                const rx = center.x + Math.cos(ang) * dist;
                const ry = center.y + Math.sin(ang) * dist * 0.52 - (1 - fall) * 14 * z * bogFrac;
                ctx.globalAlpha = bogFrac * (1 - fall * 0.5) * 0.85;
                ctx.fillStyle = i % 3 === 0 ? accentCol : (i % 2 === 0 ? '#475569' : '#78350f');
                const sz = (2.4 + (i % 3) * 1.1) * z;
                ctx.fillRect(rx - sz * 0.5, ry - sz * 0.5, sz, sz * 0.75);
            }
            ctx.restore();
        }

        function drawFermentationBog(gx, gy, gz, primaryCol, coreCol, label, time, bogFrac = 1.0) {
            const pos = isoToScreen(gx, gy, gz);
            const z = Camera.zoom;
            const bf = Math.max(0.05, Math.min(1, bogFrac));
            const scale = (0.35 + 0.85 * bf) + 0.40 * Math.max(0, (SimState.etcDamage - 50) / 50);
            ctx.save();
            // Ground-level sunken murky fermentation bog pool
            ctx.fillStyle = '#090d16';
            ctx.globalAlpha = 0.88 * bf;
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 3 * z, 45 * z * scale, 22.0 * z * scale, 0, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = primaryCol;
            ctx.globalAlpha = 0.54 * bf;
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 3 * z, 41.0 * z * scale, 19.2 * z * scale, 0, 0, Math.PI * 2); ctx.fill();

            ctx.strokeStyle = coreCol;
            ctx.lineWidth = 1.8 * z;
            ctx.globalAlpha = 0.78 * bf;
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 3 * z, 43.0 * z * scale, 20.2 * z * scale, 0, 0, Math.PI * 2); ctx.stroke();

            // Bubbling fermentation gas orbs & popping surface rings
            const bubbleCount = Math.max(2, Math.round(8 * bf));
            for (let b = 0; b < bubbleCount; b++) {
                const phase = ((time * (0.75 + (b % 3) * 0.22) + b * 0.13) % 1);
                const bx = pos.x + Math.sin(b * 2.3) * 25 * z * scale;
                const by = pos.y + 3 * z + Math.cos(b * 1.7) * 9.5 * z * scale;
                const riseY = by - phase * 20 * z * scale;
                const br = (2.2 + Math.sin(phase * Math.PI) * 3.0) * z * scale;

                if (phase < 0.45) {
                    ctx.globalAlpha = (1 - phase / 0.45) * 0.65 * bf;
                    ctx.strokeStyle = coreCol;
                    ctx.lineWidth = 1.2 * z;
                    ctx.beginPath(); ctx.ellipse(bx, by, (3 + phase * 18) * z * scale, (1.4 + phase * 8) * z * scale, 0, 0, Math.PI * 2); ctx.stroke();
                }
                ctx.globalAlpha = (1 - phase) * 0.82 * bf;
                ctx.fillStyle = coreCol;
                ctx.beginPath(); ctx.arc(bx + Math.sin(time * 4 + b) * 1.8 * z, riseY, br, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = (1 - phase) * 0.7 * bf;
                ctx.beginPath(); ctx.arc(bx - br * 0.3, riseY - br * 0.3, br * 0.28, 0, Math.PI * 2); ctx.fill();
            }

            if (SimState.showLabels && bf >= 0.35) {
                ctx.globalAlpha = Math.min(1, (bf - 0.25) / 0.5);
                ctx.font = `bold ${Math.round(8.6 * z)}px Inter, sans-serif`;
                ctx.fillStyle = coreCol;
                ctx.textAlign = 'center';
                ctx.fillText(label, pos.x, pos.y - 24 * z * scale);
            }
            ctx.restore();
        }

        function renderGlucoseProcessingLine() {
            const time = performance.now() * 0.001;
            const warburgFerment = !!SimState.warburgActive;
            const bogFrac = warburgFerment ? 1.0 : Math.max(0, Math.min(1, (SimState.etcDamage - 45) / 10));
            if (warburgFerment) {
                // Structure sinks completely into the ground-level Neon-Green Fermentation Bog; workers dance Thriller on top!
                drawFermentationBog(3.05, 10.85, 0.04, '#16a34a', '#39ff14', '🫧 WARBURG FERMENTATION BOG (Lactate ATP)', time, 1.0);
                const rimBales = [
                    { gx: 1.95, gy: 10.25, gz: 0.06, rot: -0.45 },
                    { gx: 4.10, gy: 10.32, gz: 0.06, rot: 0.48 },
                    { gx: 2.15, gy: 11.45, gz: 0.06, rot: 0.38 },
                    { gx: 4.05, gy: 11.35, gz: 0.06, rot: -0.42 }
                ];
                for (const sb of rimBales) {
                    const sp = isoToScreen(sb.gx, sb.gy, sb.gz);
                    drawTawaraBale(sp.x, sp.y, 0.64, sb.rot, true);
                }
                drawYardWorker(2.20, 11.75, 0.12, time * 12, '#1e40af', 'mallet');
                drawYardWorker(3.65, 11.82, 0.12, time * 14 + 1.5, '#2563eb', 'pitch');
                drawYardWorker(3.85, 10.05, 0.12, time * 13 + 3.0, '#d97706', 'pitch');
                if (SimState.pressActive) {
                    drawPressPulseFireman(1.75, 11.45, 0.14, 'pump', time * 4.5, 1, 2.55, 10.95);
                    drawPressPulseFireman(4.25, 11.45, 0.14, 'pump', time * 4.5 + 1.4, -1, 3.45, 10.95);
                }
                return;
            }
            if (bogFrac > 0) {
                drawFermentationBog(3.05, 10.85, 0.04, '#16a34a', '#39ff14', '⚠️ BOG RISING — STRUCTURE CRUMBLING', time, bogFrac);
                drawCrumblingRubble(3.05, 10.85, bogFrac, '#39ff14', time);
                ctx.save();
                const z = Camera.zoom;
                ctx.translate(Math.sin(time * 26) * bogFrac * 1.4 * z, bogFrac * 22 * z);
                ctx.globalAlpha = Math.max(0.18, 1 - bogFrac * 0.68);
            }
            drawIshigakiStoneBox(1.2, 9.6, 0, 3.5, 2.6, 0.25, '#3b4963', '#1e293b', '#0f172a', '#38bdf8', 2);
            drawIsoBox(1.95, 10.4, 0.25, 2.1, 0.85, 0.26, warburgFerment ? '#365314' : '#64748b', '#475569', '#334155');

            // Smooth forward-only conveyor slats + Hexagonal 6-C Glucose Rings entering from GLUT4 and cleaving into Acetyl-CoA bales!
            const gPhase = ((SimState.glucConveyorPhase || 0) % 1 + 1) % 1;
            drawConveyorSlats(1.97, 10.82, 0.52, 2.04, 0.80, gPhase * 3, 'rgba(56, 189, 248, 0.26)');
            for (let c = 0; c < 3; c++) {
                const u = (c + gPhase) / 3; // Uniform forward-only [0, 1) across the belt
                const cx = 1.98 + u * 1.65;
                const p = isoToScreen(cx, 10.80, 0.58);
                ctx.save();
                ctx.globalAlpha = u < 0.14 ? u / 0.14 : (u > 0.84 ? (1 - u) / 0.16 : 1.0);
                drawGlucoseHexRing(p.x, p.y, 0.88);
                ctx.restore();
            }
            if (SimState.effectiveGlucose > 2 && !warburgFerment) {
                // Cleaved Acetyl-CoA bale slides forward to the cart pickup pad and is collected when glucTimer resets!
                const gProg = Math.max(0, Math.min(1, (SimState.glucTimer || 0) / 0.95));
                const pdhBalePos = isoToScreen(3.68 + gProg * 0.62, 10.80, 0.56);
                drawTawaraBale(pdhBalePos.x, pdhBalePos.y, 0.56 + gProg * 0.16, -0.1 * (1 - gProg), true);
            }

            drawBambooFenceSegment(1.22, 9.65, 4.68, 9.65, 0.25);
            drawBambooFenceSegment(1.22, 9.65, 1.22, 10.45, 0.25);
            drawBambooFenceSegment(1.22, 11.65, 1.22, 12.15, 0.25);
            drawBambooFenceSegment(1.22, 12.15, 4.68, 12.15, 0.25);
            drawBambooFenceSegment(4.68, 9.65, 4.68, 10.55, 0.25);
            drawBambooFenceSegment(4.68, 11.65, 4.68, 12.15, 0.25);

            const isGngReverse = !!(SimState.gngActive && SimState.gngEnergyCredit > 0.05);
            const isGlycogenesis = SimState.glycogenMode === 'glycogenesis';
            const glut4Col = isGngReverse ? '#38bdf8' : (SimState.glut4ForcedOpenTimer > 0 ? '#a855f7' : '#10b981');
            drawIsoBox(1.15, 10.5, 0.25, 0.18, 0.18, 0.95, glut4Col, isGngReverse ? '#0284c7' : '#047857', isGngReverse ? '#075985' : '#064e3b');
            drawIsoBox(1.15, 11.55, 0.25, 0.18, 0.18, 0.95, glut4Col, isGngReverse ? '#0284c7' : '#047857', isGngReverse ? '#075985' : '#064e3b');
            drawIsoBox(1.11, 10.42, 1.15, 0.26, 1.38, 0.16, glut4Col, isGngReverse ? '#0ea5e9' : '#059669', isGngReverse ? '#0284c7' : '#047857');

            const irBlock = SimState.glut4ForcedOpenTimer > 0 ? SimState.insulinResistance * 0.15 : SimState.insulinResistance;
            if (isGngReverse) {
                const glutPos = isoToScreen(1.22, 11.05, 1.58);
                const z = Camera.zoom;
                if (SimState.showLabels) {
                    ctx.save();
                    ctx.font = `bold ${Math.round(8.5 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#67e8f9'; ctx.textAlign = 'center';
                    ctx.fillText(`⬅ GLUT2 Glucose Export!`, glutPos.x, glutPos.y);
                    ctx.restore();
                }
            } else if (SimState.glut4ForcedOpenTimer > 0) {
                const glutPos = isoToScreen(1.22, 11.05, 1.55);
                const z = Camera.zoom;
                if (SimState.showLabels) {
                    ctx.save();
                    ctx.font = `bold ${Math.round(8.5 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#e9d5ff'; ctx.textAlign = 'center';
                    ctx.fillText(`🥷 AMPK GLUT4 Lock-Pick!`, glutPos.x, glutPos.y);
                    ctx.restore();
                }
            } else if (irBlock > 0.12) {
                drawIsoBox(1.16, 10.68, 0.3, 0.14, 0.85, irBlock * 0.92, 'rgba(168, 85, 247, 0.9)', 'rgba(126, 34, 206, 0.9)', 'rgba(217, 119, 6, 0.9)');
                const glutPos = isoToScreen(1.22, 11.05, 1.55);
                const z = Camera.zoom;
                if (SimState.showLabels) {
                    ctx.save();
                    ctx.font = `bold ${Math.round(8.5 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#f5d0fe'; ctx.textAlign = 'center';
                    ctx.fillText(`🔒 Insulin Resist (-${Math.round(irBlock * 100)}%)`, glutPos.x, glutPos.y);
                    ctx.restore();
                }
            }

            drawIsoBox(4.60, 10.5, 0.25, 0.18, 0.18, 0.95, '#0284c7', '#0369a1', '#075985');
            drawIsoBox(4.60, 11.55, 0.25, 0.18, 0.18, 0.95, '#0284c7', '#0369a1', '#075985');
            drawIsoBox(4.56, 10.42, 1.15, 0.26, 1.38, 0.16, '#38bdf8', '#0284c7', '#0369a1');

            const rBlock = SimState.randleBlockLevel;
            if (rBlock > 0.12) {
                drawIsoBox(4.61, 10.68, 0.3, 0.12, 0.85, rBlock * 0.88, 'rgba(245, 158, 11, 0.88)', 'rgba(180, 83, 9, 0.88)', 'rgba(120, 53, 15, 0.88)');
                const pdhPos = isoToScreen(4.68, 11.1, 1.5);
                const z = Camera.zoom;
                if (SimState.showLabels) {
                    ctx.save();
                    ctx.font = `bold ${Math.round(8.5 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#fde047'; ctx.textAlign = 'center';
                    ctx.fillText((SimState.warburgActive || SimState.etcDamage >= 50) ? `⛔ PDK1 Warburg Block (-${Math.round(rBlock * 100)}%)` : `⛔ Randle PDH Block (-${Math.round(rBlock * 100)}%)`, pdhPos.x, pdhPos.y);
                    ctx.restore();
                }
            }

            drawYardWorker(3.15, 11.65, 0.25, SimState.glucSmashPhase, '#1e40af', 'mallet');
            const subLabel = isGngReverse
                ? `⬅ REVERSE GNG (${SimState.gngTier === 'alanine' ? 'Tier 3: Alanine' : 'Tier 2: Lactate+Glycerol'}) → GLUT2 Export!`
                : (isGlycogenesis
                    ? `⬅ REVERSE GLYCOGENESIS (Surplus / Randle Back-Pressure → Granary)`
                    : (irBlock > 0.20
                        ? `GLUT4 Insulin Resist (-${Math.round(irBlock * 100)}%) • Need AMPK!`
                        : (rBlock > 0.25 ? `PDH Gate Throttled (-${Math.round(rBlock * 100)}% Citrate)` : 'GLUT4 Gate (←) & MPC Gate (→) Clear')));
            drawFloatingLabel(3.0, 10.0, 1.85, isGngReverse ? '⬅ Cytosol GNG (Reverse Glycolysis)' : (isGlycogenesis ? '⬅ Cytosol Glycogenesis' : 'Cytosol Glycolysis Yard'), subLabel, isGngReverse ? '#67e8f9' : (isGlycogenesis ? '#38bdf8' : (irBlock > 0.20 ? '#c084fc' : '#38bdf8')));
            if (bogFrac > 0) ctx.restore();
        }

        function drawBasketOverflowPuddle(bx, by, fillVal, puddleCol, coreCol, warningLabel) {
            if ((fillVal || 0) < 95) return;
            const time = performance.now() * 0.001;
            const z = Camera.zoom;
            const overFrac = Math.min(1, ((fillVal - 95) / 5) * 0.6 + 0.4);
            const p = isoToScreen(bx + 0.26, by + 0.26, 0.01);
            ctx.save();
            // Irregular glossy puddle spilling over the cobblestone floor around the basket
            ctx.fillStyle = puddleCol;
            ctx.globalAlpha = 0.58 * overFrac;
            ctx.beginPath();
            ctx.ellipse(p.x + 2 * z, p.y + 3 * z, 28 * z * overFrac, 13.5 * z * overFrac, 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(p.x - 10 * z * overFrac, p.y + 6 * z, 15 * z * overFrac, 7.5 * z * overFrac, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = coreCol;
            ctx.lineWidth = 1.3 * z;
            ctx.globalAlpha = 0.78 * overFrac;
            ctx.beginPath();
            ctx.ellipse(p.x + 2 * z, p.y + 3 * z, 28 * z * overFrac, 13.5 * z * overFrac, 0.12, 0, Math.PI * 2);
            ctx.stroke();

            // Overflow drips from rim + surface shimmer
            for (let d = 0; d < 3; d++) {
                const ph = (time * 1.6 + d * 0.33) % 1;
                ctx.fillStyle = coreCol;
                ctx.globalAlpha = (1 - ph) * 0.85;
                ctx.beginPath();
                ctx.arc(p.x + (d - 1) * 11 * z, p.y + (2 + ph * 8) * z, 2.0 * z, 0, Math.PI * 2);
                ctx.fill();
            }
            if (warningLabel && SimState.showLabels) {
                ctx.globalAlpha = 1;
                ctx.font = `bold ${Math.round(6.8 * z)}px Inter, sans-serif`;
                ctx.fillStyle = coreCol;
                ctx.textAlign = 'center';
                ctx.fillText(warningLabel, p.x, p.y + 20 * z);
            }
            ctx.restore();
        }

        function drawWickerBasket(bx, by, val, topCol, sideCol, label, actionText) {
            const time = performance.now() * 0.001;
            const z = Camera.zoom;
            const f = Math.max(0.03, Math.min(1, (val || 0) / 100));
            const cx = bx + 0.26, cy = by + 0.26;
            const baseC = isoToScreen(cx, cy, 0.02);
            const topC = isoToScreen(cx, cy, 0.40);
            const fillC = isoToScreen(cx, cy, 0.06 + f * 0.32);

            const rxBase = 11.5 * z, ryBase = 5.8 * z;
            const rxTop = 15.2 * z, ryTop = 7.6 * z;
            const rxFill = rxBase + (rxTop - rxBase) * f;
            const ryFill = ryBase + (ryTop - ryBase) * f;

            ctx.save();
            // Ground shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
            ctx.beginPath();
            ctx.ellipse(baseC.x + 1.5 * z, baseC.y + 1.5 * z, rxBase * 1.12, ryBase * 1.15, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dark woven interior cavity
            ctx.fillStyle = '#2d190c';
            ctx.beginPath();
            ctx.ellipse(topC.x, topC.y, rxTop, ryTop, 0, Math.PI, Math.PI * 2);
            ctx.lineTo(baseC.x + rxBase, baseC.y);
            ctx.ellipse(baseC.x, baseC.y, rxBase, ryBase, 0, 0, Math.PI);
            ctx.closePath();
            ctx.fill();

            // Interior top recess
            ctx.fillStyle = '#241308';
            ctx.beginPath();
            ctx.ellipse(topC.x, topC.y, rxTop * 0.92, ryTop * 0.92, 0, 0, Math.PI * 2);
            ctx.fill();

            // Metabolite contents inside basket (visible from top & sight-slit)
            if (val > 0.5) {
                ctx.fillStyle = sideCol;
                ctx.beginPath();
                ctx.ellipse(fillC.x, fillC.y, rxFill * 0.88, ryFill * 0.88, 0, Math.PI, Math.PI * 2);
                ctx.lineTo(baseC.x + rxBase * 0.86, baseC.y);
                ctx.ellipse(baseC.x, baseC.y, rxBase * 0.86, ryBase * 0.86, 0, 0, Math.PI);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = topCol;
                ctx.beginPath();
                ctx.ellipse(fillC.x, fillC.y, rxFill * 0.88, ryFill * 0.88, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
                ctx.beginPath();
                ctx.ellipse(fillC.x - rxFill * 0.2, fillC.y - ryFill * 0.15, rxFill * 0.42, ryFill * 0.38, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // Front woven wicker wall with central bamboo sight-slit
            const grad = ctx.createLinearGradient(topC.x - rxTop, topC.y, topC.x + rxTop, topC.y);
            grad.addColorStop(0, '#d4a373');
            grad.addColorStop(0.45, '#b67e48');
            grad.addColorStop(1, '#7a4921');
            ctx.fillStyle = grad;

            const slitHalf = 2.6 * z;
            ctx.beginPath();
            ctx.moveTo(topC.x - rxTop, topC.y);
            ctx.ellipse(topC.x, topC.y, rxTop, ryTop, 0, Math.PI, Math.PI * 0.57, true);
            ctx.lineTo(baseC.x - slitHalf, baseC.y + ryBase * 0.92);
            ctx.ellipse(baseC.x, baseC.y, rxBase, ryBase, 0, Math.PI * 0.58, Math.PI, false);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(topC.x + slitHalf, topC.y + ryTop * 0.94);
            ctx.ellipse(topC.x, topC.y, rxTop, ryTop, 0, Math.PI * 0.43, 0, true);
            ctx.lineTo(baseC.x + rxBase, baseC.y);
            ctx.ellipse(baseC.x, baseC.y, rxBase, ryBase, 0, 0, Math.PI * 0.42, false);
            ctx.closePath();
            ctx.fill();

            // Horizontal & diagonal bamboo weave texture on front wall
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(topC.x - rxTop, topC.y);
            ctx.ellipse(topC.x, topC.y, rxTop, ryTop, 0, Math.PI, 0, true);
            ctx.lineTo(baseC.x + rxBase, baseC.y);
            ctx.ellipse(baseC.x, baseC.y, rxBase, ryBase, 0, 0, Math.PI, false);
            ctx.closePath();
            ctx.clip();

            ctx.strokeStyle = 'rgba(69, 26, 3, 0.42)';
            ctx.lineWidth = 1.0 * z;
            for (let band = 1; band <= 4; band++) {
                const t = band / 5;
                const byBand = topC.y + (baseC.y - topC.y) * t;
                const rxB = rxTop + (rxBase - rxTop) * t;
                const ryB = ryTop + (ryBase - ryTop) * t;
                ctx.beginPath();
                ctx.ellipse(topC.x, byBand, rxB, ryB, 0, 0.08, Math.PI - 0.08);
                ctx.stroke();
            }
            ctx.strokeStyle = 'rgba(254, 243, 199, 0.25)';
            ctx.lineWidth = 0.9 * z;
            for (const frac of [-0.78, -0.48, 0.48, 0.78]) {
                ctx.beginPath();
                ctx.moveTo(topC.x + rxTop * frac, topC.y + ryTop * 0.55);
                ctx.lineTo(baseC.x + rxBase * frac, baseC.y + ryBase * 0.55);
                ctx.stroke();
            }
            ctx.restore();

            // Bamboo sight-slit frame & front level indicator bar
            const slitW = 4.6 * z;
            const slitTopY = topC.y + ryTop * 0.95;
            const slitBotY = baseC.y + ryBase * 0.92;
            ctx.strokeStyle = '#5c3317';
            ctx.lineWidth = 1.1 * z;
            ctx.strokeRect(topC.x - slitW * 0.5, slitTopY, slitW, slitBotY - slitTopY);
            if (val > 0.5) {
                const barH = (slitBotY - slitTopY) * f;
                ctx.fillStyle = topCol;
                ctx.fillRect(topC.x - slitW * 0.42, slitBotY - barH, slitW * 0.84, barH);
            }

            // Braided top bamboo rim
            ctx.strokeStyle = '#e6be8a';
            ctx.lineWidth = 2.6 * z;
            ctx.beginPath();
            ctx.ellipse(topC.x, topC.y, rxTop, ryTop, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#6b3e1b';
            ctx.lineWidth = 0.9 * z;
            ctx.setLineDash([2.2 * z, 2.2 * z]);
            ctx.beginPath();
            ctx.ellipse(topC.x, topC.y, rxTop, ryTop, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            if (actionText) {
                ctx.strokeStyle = topCol;
                ctx.globalAlpha = 0.45 + 0.25 * Math.sin(time * 5);
                ctx.lineWidth = 1.4 * z;
                ctx.beginPath();
                ctx.ellipse(topC.x, topC.y, rxTop + 1.8 * z, ryTop + 1.0 * z, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            ctx.restore();

            if (SimState.showLabels) {
                const lp = isoToScreen(cx, cy, 0.72);
                ctx.save();
                ctx.font = `bold ${Math.round(7.2 * z)}px Inter, sans-serif`;
                ctx.fillStyle = topCol;
                ctx.textAlign = 'center';
                ctx.fillText(`${label} ${Math.round(val || 0)}`, lp.x, lp.y);
                if (actionText) {
                    ctx.font = `bold ${Math.round(6.6 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#fef08a';
                    ctx.fillText(actionText, lp.x, lp.y - 9.5 * z);
                }
                ctx.restore();
            }
        }        // F-08: Glycogen Kura Granary + Glycerol / Pyruvate <-> Lactate / Alanine Spill-Over Buckets
        function renderGlycogenAndGngBuckets() {
            const time = performance.now() * 0.001;
            const z = Camera.zoom;

            // 1. Hepatic Glycogen Kura Granary (gx: 0.05..0.95, gy: 8.35..9.35)
            const gFrac = Math.max(0, Math.min(1, (SimState.glycogenLevel || 0) / 100));
            drawIshigakiStoneBox(0.05, 8.35, 0, 0.95, 1.0, 0.18, '#475569', '#334155', '#1e293b', '#38bdf8', 1);
            drawIsoBox(0.14, 8.45, 0.18, 0.76, 0.80, 0.75, '#f8fafc', '#cbd5e1', '#94a3b8');
            drawJapaneseRoof(0.08, 8.38, 0.93, 0.88, 0.92, 0.42, '#1e3a8a', '#3b82f6', '#93c5fd');
            // Visible Glycogen fill column beside/front of Granary
            if (gFrac > 0.02) {
                drawIsoBox(0.24, 9.18, 0.22, 0.56, 0.12, Math.max(0.08, gFrac * 0.68), '#38bdf8', '#0284c7', '#0369a1');
            }
            const gPos = isoToScreen(0.52, 8.85, 1.65);
            if (SimState.showLabels) {
                ctx.save();
                ctx.font = `bold ${Math.round(7.8 * z)}px Inter, sans-serif`;
                ctx.fillStyle = SimState.glycogenMode === 'glycogenesis' ? '#67e8f9' : (SimState.glycogenMode === 'glycogenolysis' ? '#fde047' : '#cbd5e1');
                ctx.textAlign = 'center';
                const gAction = SimState.glycogenMode === 'glycogenesis'
                    ? ' (⬇ Storing)'
                    : (SimState.glycogenMode === 'glycogenolysis' ? ' (⬆ Releasing)' : '');
                ctx.fillText(`🌾 Glycogen ${Math.round(SimState.glycogenLevel || 0)}%${gAction}`, gPos.x, gPos.y);
                ctx.restore();
            }

            // 2. Spill-Over Feudal Wicker Baskets (Alanine, Glycerol, Pyruvate <-> Lactate) in the West Courtyard (gy: 7.55..8.25)
            const drawBucket = drawWickerBasket;

            const alaAction = (SimState.gngActive && SimState.gngTier === 'alanine')
                ? '⬆ → GNG'
                : (SimState.muscleProteolysis ? '⬇ +Muscle' : '');
            const glyAction = (SimState.gngActive && SimState.gngTier === 'lactate_glycerol' && SimState.glycerolPool > 1)
                ? '⬆ → GNG'
                : ((SimState.effectiveFat > 20 && !SimState.warburgActive) ? '⬇ +β-Ox' : '');
            const pyrAction = SimState.warburgActive
                ? '→ Lac (Warburg)'
                : ((SimState.gngActive && SimState.gngTier === 'lactate_glycerol') ? '⬆ → GNG' : '');
            const lacAction = SimState.warburgActive
                ? (SimState.pressActive ? '⬇ Draining (Press)' : (SimState.lactatePool >= 95 ? '⚠️ OVERFLOW (Set Press!)' : '⬇ +Warburg'))
                : ((SimState.gngActive && SimState.gngTier === 'lactate_glycerol') ? '⬆ → Pyr → GNG' : '');

            drawBasketOverflowPuddle(3.98, 7.65, SimState.warburgActive ? SimState.lactatePool : 0, '#4c1d95', '#a78bfa', SimState.pressActive ? '💧 Press Draining...' : '⚠️ Acidic Lactate Leak!');
            drawBucket(1.15, 7.65, SimState.alaninePool, '#f472b6', '#be185d', 'Ala', alaAction);
            drawBucket(2.10, 7.65, SimState.glycerolPool, '#fbbf24', '#b45309', 'Glycerol', glyAction);
            drawBucket(3.05, 7.65, SimState.pyruvatePool, '#38bdf8', '#0284c7', 'Pyr', pyrAction);
            drawBucket(3.98, 7.65, SimState.lactatePool, '#a78bfa', '#6d28d9', 'Lac', lacAction);

            // Animated Pyruvate <-> Lactate (LDH) swap arc + consistent LDH status label
            const p1 = isoToScreen(3.32, 7.90, 0.42);
            const p2 = isoToScreen(4.24, 7.90, 0.42);
            ctx.save();
            ctx.strokeStyle = 'rgba(167, 139, 250, 0.75)';
            ctx.lineWidth = 1.6 * z;
            ctx.setLineDash([3 * z, 3 * z]);
            ctx.lineDashOffset = -time * 16 * z;
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            if (SimState.showLabels) {
                ctx.font = `bold ${Math.round(6.6 * z)}px Inter, sans-serif`;
                ctx.fillStyle = '#ddd6fe';
                ctx.textAlign = 'center';
                const ldhTxt = SimState.warburgActive ? 'LDH: Pyr → Lac' : (SimState.gngActive ? 'LDH: Lac → Pyr' : 'LDH: Pyr ⇄ Lac');
                ctx.fillText(ldhTxt, (p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5 + 11 * z);
            }
            ctx.restore();

            // Active GNG Substrate Flow Arrows into Glycolysis Yard
            if (SimState.gngActive && SimState.gngEnergyCredit > 0.05) {
                const srcX = SimState.gngTier === 'alanine' ? 1.41 : 2.36;
                const sPt = isoToScreen(srcX, 8.18, 0.35);
                const ePt = isoToScreen(2.85, 9.75, 0.45);
                ctx.save();
                ctx.strokeStyle = SimState.gngTier === 'alanine' ? '#f472b6' : '#38bdf8';
                ctx.lineWidth = 2.4 * z;
                ctx.setLineDash([5 * z, 4 * z]);
                ctx.lineDashOffset = -time * 24 * z;
                ctx.beginPath(); ctx.moveTo(sPt.x, sPt.y); ctx.lineTo(ePt.x, ePt.y); ctx.stroke();
                ctx.restore();
            }
        }        // F-08: Suspended Shodo Calligraphy Pavilion (gx: 25.55, gy: 12.85) overhanging the Southern River opposite Castle Complex V
        function renderCalligraphyPavilion() {
            const z = Camera.zoom;
            // Timber support pilings anchored into the river & cantilevered deck overhanging Southern River
            drawIsoBox(24.92, 12.35, -0.10, 0.14, 0.14, 0.45, '#451a03', '#271c11', '#1c1917');
            drawIsoBox(26.06, 12.35, -0.10, 0.14, 0.14, 0.45, '#451a03', '#271c11', '#1c1917');
            drawIsoBox(24.92, 13.38, -0.10, 0.14, 0.14, 0.45, '#451a03', '#271c11', '#1c1917');
            drawIsoBox(26.06, 13.38, -0.10, 0.14, 0.14, 0.45, '#451a03', '#271c11', '#1c1917');

            // Suspended Hinoki timber deck & connecting walkway from castleRoadS (25.55, 11.15)
            drawIsoBox(25.25, 11.65, 0.12, 0.60, 0.70, 0.12, '#92400e', '#78350f', '#451a03');
            drawIsoBox(24.85, 12.28, 0.24, 1.40, 1.25, 0.14, '#b45309', '#78350f', '#451a03');
            drawIsoBox(25.02, 12.44, 0.38, 1.06, 0.94, 0.08, '#fef3c7', '#d97706', '#92400e');

            // Four slender cedar corner posts & serene Zen roof
            drawIsoBox(25.00, 12.42, 0.46, 0.07, 0.07, 0.72, '#78350f', '#451a03', '#271c11');
            drawIsoBox(26.02, 12.42, 0.46, 0.07, 0.07, 0.72, '#78350f', '#451a03', '#271c11');
            drawIsoBox(25.00, 13.32, 0.46, 0.07, 0.07, 0.72, '#78350f', '#451a03', '#271c11');
            drawIsoBox(26.02, 13.32, 0.46, 0.07, 0.07, 0.72, '#78350f', '#451a03', '#271c11');
            drawJapaneseRoof(24.92, 12.34, 1.18, 1.25, 1.12, 0.42, '#0f766e', '#14b8a6', '#fde047');

            if (SimState.showLabels) {
                const lp = isoToScreen(25.55, 12.88, 1.92);
                ctx.save();
                ctx.font = `bold ${Math.round(7.6 * z)}px Inter, sans-serif`;
                ctx.fillStyle = SimState.gngEnergyCredit > 0.05 ? '#fde047' : '#94a3b8';
                ctx.textAlign = 'center';
                ctx.fillText(SimState.gngEnergyCredit > 0.05 ? `🖌️ Shodo GNG (⚡${SimState.gngEnergyCredit.toFixed(1)}s)` : '🖌️ Shodo GNG Pavilion', lp.x, lp.y);
                ctx.restore();
            }
        }        // F-08: Cytosol SE Corner Pontoon (depth-sorted independently at gx: 5.15, gy: 13.08 so characters stand on top)
        function renderCytosolPontoon() {
            drawIsoBox(5.15, 13.08, -0.04, 0.85, 0.65, 0.06, '#b45309', '#78350f', '#451a03');
            drawIsoBox(5.20, 13.62, -0.14, 0.10, 0.10, 0.16, '#451a03', '#271c11', '#1c1917');
            drawIsoBox(5.88, 13.62, -0.14, 0.10, 0.10, 0.16, '#451a03', '#271c11', '#1c1917');
        }

        // F-08: Raised Muscle Outpost Platform (SW Pontoon in middle of base)
        function renderMuscleOutpostAndFerry() {
            const z = Camera.zoom;

            // 2. Raised Muscle Outpost Platform on stilts in the River opposite the Wellhouse
            const prot = SimState.muscleProteolysis;
            drawIsoBox(13.28, 13.52, -0.08, 0.16, 0.16, 0.36, '#451a03', '#271c11', '#1c1917');
            drawIsoBox(15.16, 13.52, -0.08, 0.16, 0.16, 0.36, '#451a03', '#271c11', '#1c1917');
            drawIsoBox(13.28, 14.52, -0.08, 0.16, 0.16, 0.36, '#451a03', '#271c11', '#1c1917');
            drawIsoBox(15.16, 14.52, -0.08, 0.16, 0.16, 0.36, '#451a03', '#271c11', '#1c1917');

            drawIshigakiStoneBox(13.18, 13.42, 0.20, 2.24, 1.28, 0.18, prot ? '#7f1d1d' : '#7c2d12', '#451a03', '#1c1917', prot ? '#f472b6' : '#fb923c', 2);
            drawIsoBox(13.55, 13.62, 0.38, 1.50, 0.88, 0.56, prot ? '#be123c' : '#b91c1c', '#991b1b', '#7f1d1d');
            drawJapaneseRoof(13.45, 13.52, 0.94, 1.70, 1.08, 0.42, '#450a0a', '#991b1b', '#fca5a5');

            // Muscle Pontoon attached to the middle of the base layer, protruding South-West (+gy)
            drawIsoBox(13.86, 14.68, 0.04, 0.86, 0.72, 0.12, '#b45309', '#78350f', '#451a03');
            drawIsoBox(13.90, 15.28, -0.08, 0.10, 0.10, 0.22, '#451a03', '#271c11', '#1c1917');
            drawIsoBox(14.60, 15.28, -0.08, 0.10, 0.10, 0.22, '#451a03', '#271c11', '#1c1917');

            if (SimState.showLabels) {
                const mp = isoToScreen(14.3, 14.05, 1.65);
                ctx.save();
                ctx.font = `bold ${Math.round(8.0 * z)}px Inter, sans-serif`;
                ctx.fillStyle = prot ? '#f472b6' : '#fdba74';
                ctx.textAlign = 'center';
                ctx.fillText(prot ? '💪 Muscle Platform (Proteolysis → Alanine!)' : '💪 Raised Muscle Outpost (Cori Cycle)', mp.x, mp.y);
                ctx.restore();
            }
        }        // F-08: Traditional Japanese Isobune Small Craft (Douglas Brooks style: cedar planks, sharp miyoshi bow stem, funabari thwarts & ro oar)
        function drawJapaneseFerryBoat(fx, fy, cargoType, dirLabel, dir = 1) {
            const frozen = SimState.cellDead || SimState.crisisState === 'necrosis' || SimState.crisisState === 'starvation' || (SimState.apoptosisSequence && SimState.apoptosisSequence.act !== 'rampage') || (SimState.necrosisSequence && SimState.necrosisSequence.act !== 'surge') || (SimState.starvationSequence && SimState.starvationSequence.act !== 'scavenge');
            const time = frozen ? 0 : performance.now() * 0.001;
            const z = Camera.zoom;
            const bob = frozen ? 0 : Math.sin(time * 3.4 + fx) * 0.03;
            const p = isoToScreen(fx, fy, 0.04 + bob);

            ctx.save();
            // Water wake (omitted when frozen/empty)
            if (!frozen) {
                ctx.fillStyle = 'rgba(125, 211, 252, 0.24)';
                ctx.beginPath();
                ctx.ellipse(p.x, p.y + 3 * z, 15 * z, 5.2 * z, 0.18, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw flipped horizontally if heading left (-1) vs right (+1)
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(dir, 1);

            // Outer flared cedar hull (tana planks)
            ctx.fillStyle = '#b4692e';
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 1.15 * z;
            ctx.beginPath();
            ctx.moveTo(-14 * z, -2.5 * z); // stern transom
            ctx.lineTo(-12 * z, 3.2 * z);
            ctx.quadraticCurveTo(0, 5.2 * z, 11 * z, 2.2 * z);
            ctx.lineTo(16.5 * z, -5.5 * z); // sharp upturned miyoshi bow stem
            ctx.lineTo(13.5 * z, -7.2 * z);
            ctx.lineTo(8.5 * z, -2.2 * z);
            ctx.lineTo(-12.5 * z, -4.5 * z);
            ctx.closePath();
            ctx.fill(); ctx.stroke();

            // Interior flat floor (shiki) & cross-thwarts (funabari)
            ctx.fillStyle = '#d99b52';
            ctx.beginPath();
            ctx.moveTo(-11 * z, -3.2 * z);
            ctx.lineTo(8 * z, -1.5 * z);
            ctx.lineTo(9.5 * z, 1.2 * z);
            ctx.lineTo(-10.5 * z, 1.8 * z);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.0 * z;
            for (const tx of [-6, 0, 5]) {
                ctx.beginPath();
                ctx.moveTo(tx * z, -2.8 * z);
                ctx.lineTo((tx - 0.5) * z, 1.8 * z);
                ctx.stroke();
            }

            // Stern sculling oar (ro)
            const oarSwing = Math.sin(time * 5.0 + fx) * 1.8 * z;
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.5 * z;
            ctx.beginPath();
            ctx.moveTo(-11 * z, -2.0 * z);
            ctx.lineTo(-19 * z, 2.5 * z + oarSwing);
            ctx.stroke();
            ctx.restore();

            // Cargo on deck
            if (cargoType === 'lactate') {
                ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.arc(p.x, p.y - 4.5 * z, 4.2 * z, 0, Math.PI * 2); ctx.fill();
                if (SimState.showLabels) {
                    ctx.font = `bold ${Math.round(7.2 * z)}px Inter, sans-serif`; ctx.fillStyle = '#ddd6fe'; ctx.textAlign = 'center';
                    ctx.fillText('← Lac', p.x, p.y - 11.5 * z);
                }
            } else if (cargoType === 'alanine') {
                ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.arc(p.x, p.y - 4.5 * z, 4.2 * z, 0, Math.PI * 2); ctx.fill();
                if (SimState.showLabels) {
                    ctx.font = `bold ${Math.round(7.2 * z)}px Inter, sans-serif`; ctx.fillStyle = '#fbcfe8'; ctx.textAlign = 'center';
                    ctx.fillText('← Ala', p.x, p.y - 11.5 * z);
                }
            } else if (cargoType === 'glucose') {
                drawGlucoseHexRing(p.x, p.y - 6.0 * z, 0.72);
                if (SimState.showLabels) {
                    ctx.font = `bold ${Math.round(7.0 * z)}px Inter, sans-serif`; ctx.fillStyle = '#67e8f9'; ctx.textAlign = 'center';
                    ctx.fillText(dirLabel, p.x, p.y - 14.5 * z);
                }
            }
            ctx.restore();
        }

        // F-08: Shodo Koku Donation Water Spirit (Suijin Wisp) gliding from Shodo Pavilion to Glycolysis Yard
        function drawGngWaterSpirit(sp) {
            const time = performance.now() * 0.001;
            const p = isoToScreen(sp.gx, sp.gy, sp.gz || 0.45);
            const z = Camera.zoom;
            const pulse = 0.85 + 0.15 * Math.sin(time * 12);
            ctx.save();
            const grad = ctx.createRadialGradient(p.x, p.y, 1 * z, p.x, p.y, 13 * z * pulse);
            grad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
            grad.addColorStop(0.45, 'rgba(56, 189, 248, 0.85)');
            grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(p.x, p.y, 13 * z * pulse, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(p.x, p.y, 3.6 * z, 0, Math.PI * 2); ctx.fill();
            if (SimState.showLabels) {
                ctx.font = `bold ${Math.round(7.2 * z)}px Inter, sans-serif`;
                ctx.fillStyle = '#67e8f9';
                ctx.textAlign = 'center';
                ctx.fillText('🌊 Koku Spirit → GNG', p.x, p.y - 11 * z);
            }
            ctx.restore();
        }

        // F-08: Calming Water Spirit from Muscle Outpost recruiting a prowling Ronin back to Castle ADP queue
        function drawMuscleCalmingSpirit(sp) {
            const time = performance.now() * 0.001;
            const p = isoToScreen(sp.gx, sp.gy, sp.gz || 0.9);
            const z = Camera.zoom;
            const pulse = 0.85 + 0.15 * Math.sin(time * 10);
            ctx.save();
            const grad = ctx.createRadialGradient(p.x, p.y, 1 * z, p.x, p.y, 14 * z * pulse);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            grad.addColorStop(0.45, 'rgba(34, 211, 238, 0.85)');
            grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(p.x, p.y, 14 * z * pulse, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#fde047';
            ctx.beginPath(); ctx.arc(p.x, p.y, 3.4 * z, 0, Math.PI * 2); ctx.fill();
            if (SimState.showLabels) {
                ctx.font = `bold ${Math.round(7.2 * z)}px Inter, sans-serif`;
                ctx.fillStyle = '#a5f3fc';
                ctx.textAlign = 'center';
                ctx.fillText(sp.label || '🌊 Muscle → Ronin', p.x, p.y - 12 * z);
            }
            ctx.restore();
        }

        // F-08: Human Dockhand Porter offloading Lactate/Alanine from River Ferry to Spill-Over Buckets
        function drawDockPorter(dp) {
            const pos = isoToScreen(dp.gx, dp.gy, 0.06);
            const z = Camera.zoom;
            const moving = dp.state !== 'idleAtDock';
            const stride = Math.sin(dp.stepPhase || 0) * (moving ? 2.5 : 0.2) * z;
            const bob = Math.abs(Math.sin(dp.stepPhase || 0)) * (moving ? 1.4 : 0.2) * z;

            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.28)';
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 1 * z, 5 * z, 2.4 * z, 0, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#1e293b';
            ctx.beginPath(); ctx.arc(pos.x - 2 * z + stride * 0.5, pos.y - 1 * z, 1.4 * z, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(pos.x + 2 * z - stride * 0.5, pos.y - 1 * z, 1.4 * z, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#0f766e';
            ctx.strokeStyle = '#134e4a';
            ctx.lineWidth = 0.9 * z;
            ctx.beginPath();
            ctx.roundRect(pos.x - 4.2 * z, pos.y - 15.5 * z - bob, 8.4 * z, 13.0 * z, 2 * z);
            ctx.fill(); ctx.stroke();

            ctx.fillStyle = '#fed7aa';
            ctx.beginPath(); ctx.arc(pos.x, pos.y - 19 * z - bob, 3.2 * z, 0, Math.PI * 2); ctx.fill();
            // Straw conical dockworker hat (Sugegasa)
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.moveTo(pos.x - 5.8 * z, pos.y - 20.5 * z - bob);
            ctx.lineTo(pos.x + 5.8 * z, pos.y - 20.5 * z - bob);
            ctx.lineTo(pos.x, pos.y - 24.5 * z - bob);
            ctx.closePath(); ctx.fill();

            if (dp.cargo && dp.cargo !== 'none') {
                const dir = dp.facing || 1;
                ctx.fillStyle = dp.cargo === 'alanine' ? '#f472b6' : '#a78bfa';
                ctx.beginPath(); ctx.arc(pos.x + dir * 6 * z, pos.y - 12 * z - bob, 3.8 * z, 0, Math.PI * 2); ctx.fill();
                if (SimState.showLabels) {
                    ctx.font = `bold ${Math.round(7.0 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = dp.cargo === 'alanine' ? '#fbcfe8' : '#ddd6fe';
                    ctx.textAlign = 'center';
                    ctx.fillText(dp.cargo === 'alanine' ? '📦 Ala' : '📦 Lac', pos.x, pos.y - 27 * z - bob);
                }
            }
            ctx.restore();
        }

        // F-08: Kawabe-no-Miko (Mystical River-Spirit Maiden / GLUT2 Glucose Carrier)
        function drawKawabeMiko(m) {
            const time = performance.now() * 0.001;
            const pos = isoToScreen(m.gx, m.gy, 0.14);
            const z = Camera.zoom;
            const dir = m.facing || 1;
            const floatBob = Math.sin(time * 3.4 + (m.gx || 0)) * 1.8 * z;
            const sway = Math.sin(time * 4.5 + (m.stepPhase || 0)) * 1.4 * z;

            ctx.save();
            // Ground shadow & glowing celestial cyan-violet spirit ring
            ctx.fillStyle = 'rgba(15, 23, 42, 0.26)';
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2.5 * z, 6.2 * z, 2.8 * z, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = m.hasGlucose ? 'rgba(103, 232, 249, 0.78)' : 'rgba(192, 132, 252, 0.55)';
            ctx.lineWidth = 1.35 * z;
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2.2 * z, 9.0 * z, 4.0 * z, 0, 0, Math.PI * 2); ctx.stroke();

            // Orbiting hitodama spirit wisps
            for (let w = 0; w < 2; w++) {
                const wa = time * 2.6 + w * Math.PI;
                const wx = pos.x + Math.cos(wa) * 9.5 * z;
                const wy = pos.y - 10 * z + Math.sin(wa) * 3.8 * z - floatBob * 0.5;
                ctx.fillStyle = w === 0 ? 'rgba(103, 232, 249, 0.85)' : 'rgba(216, 180, 254, 0.85)';
                ctx.beginPath(); ctx.arc(wx, wy, 1.9 * z, 0, Math.PI * 2); ctx.fill();
            }

            // Slender flowing Hakama (deep indigo-crimson gradient feel) with gold hem trim
            ctx.fillStyle = '#4c1d95';
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 0.9 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 2.6 * z, pos.y - 11.8 * z - floatBob);
            ctx.lineTo(pos.x + 2.6 * z, pos.y - 11.8 * z - floatBob);
            ctx.quadraticCurveTo(pos.x + 4.8 * z + sway * 0.4, pos.y - 6.0 * z - floatBob, pos.x + 4.2 * z + sway * 0.6, pos.y - 1.5 * z - floatBob);
            ctx.lineTo(pos.x - 4.2 * z + sway * 0.6, pos.y - 1.5 * z - floatBob);
            ctx.quadraticCurveTo(pos.x - 4.8 * z + sway * 0.4, pos.y - 6.0 * z - floatBob, pos.x - 2.6 * z, pos.y - 11.8 * z - floatBob);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Billowing ethereal white & pale-cyan Chihaya sleeves
            ctx.fillStyle = 'rgba(240, 249, 255, 0.94)';
            ctx.strokeStyle = '#67e8f9';
            ctx.lineWidth = 0.85 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 2.8 * z, pos.y - 18.2 * z - floatBob);
            ctx.quadraticCurveTo(pos.x - 8.2 * z, pos.y - 14.5 * z - floatBob, pos.x - 6.8 * z + sway * 0.5, pos.y - 9.2 * z - floatBob);
            ctx.lineTo(pos.x - 2.4 * z, pos.y - 12.0 * z - floatBob);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x + 2.8 * z, pos.y - 18.2 * z - floatBob);
            ctx.quadraticCurveTo(pos.x + 8.2 * z, pos.y - 14.5 * z - floatBob, pos.x + 6.8 * z + sway * 0.5, pos.y - 9.2 * z - floatBob);
            ctx.lineTo(pos.x + 2.4 * z, pos.y - 12.0 * z - floatBob);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Slender white Kosode bodice & crimson-gold obi ribbon
            ctx.fillStyle = '#f8fafc';
            ctx.strokeStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.roundRect(pos.x - 3.0 * z, pos.y - 18.8 * z - floatBob, 6.0 * z, 7.4 * z, 1.8 * z);
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#e11d48';
            ctx.fillRect(pos.x - 2.9 * z, pos.y - 13.0 * z - floatBob, 5.8 * z, 1.5 * z);

            // Long flowing midnight-indigo hair & delicate face
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            ctx.moveTo(pos.x - 3.4 * z, pos.y - 22.0 * z - floatBob);
            ctx.quadraticCurveTo(pos.x - 5.2 * z, pos.y - 15.0 * z - floatBob, pos.x - 3.6 * z + sway * 0.5, pos.y - 9.5 * z - floatBob);
            ctx.lineTo(pos.x + 3.6 * z + sway * 0.5, pos.y - 9.5 * z - floatBob);
            ctx.quadraticCurveTo(pos.x + 5.2 * z, pos.y - 15.0 * z - floatBob, pos.x + 3.4 * z, pos.y - 22.0 * z - floatBob);
            ctx.closePath(); ctx.fill();

            ctx.fillStyle = '#ffedd5';
            ctx.beginPath(); ctx.arc(pos.x, pos.y - 22.0 * z - floatBob, 2.9 * z, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath(); ctx.arc(pos.x, pos.y - 22.9 * z - floatBob, 3.0 * z, Math.PI, Math.PI * 2); ctx.fill();

            // Golden crescent Kanzashi halo & side Kitsune spirit mask
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 1.25 * z;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y - 22.5 * z - floatBob, 5.2 * z, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
            ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 0.7 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x + 2.2 * z, pos.y - 25.8 * z - floatBob);
            ctx.lineTo(pos.x + 4.4 * z, pos.y - 27.6 * z - floatBob);
            ctx.lineTo(pos.x + 5.0 * z, pos.y - 24.4 * z - floatBob);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Sacred Gohei wand with fluttering zigzag paper shide
            const wandX = pos.x - dir * 5.8 * z;
            const wandY = pos.y - 13.5 * z - floatBob;
            ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.2 * z;
            ctx.beginPath(); ctx.moveTo(wandX, wandY + 3 * z); ctx.lineTo(wandX, wandY - 9.5 * z); ctx.stroke();
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.moveTo(wandX, wandY - 9.2 * z);
            ctx.lineTo(wandX - dir * 3.2 * z, wandY - 6.8 * z);
            ctx.lineTo(wandX - dir * 1.2 * z, wandY - 5.2 * z);
            ctx.lineTo(wandX - dir * 3.4 * z, wandY - 3.2 * z);
            ctx.lineTo(wandX, wandY - 3.8 * z);
            ctx.closePath(); ctx.fill();

            // Glowing Hexagonal Glucose Spirit Orb hovering above palm when carrying exported Glucose
            if (m.hasGlucose) {
                drawGlucoseHexRing(pos.x + dir * 7.8 * z, pos.y - 16.0 * z - floatBob, 0.76);
                if (SimState.showLabels) {
                    ctx.font = `bold ${Math.round(7.4 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#67e8f9';
                    ctx.textAlign = 'center';
                    ctx.fillText('✨ Spirit Miko (GLUT2 → Ferry)', pos.x, pos.y - 30.5 * z - floatBob);
                }
            }
            ctx.restore();
        }

        function renderProteostasisShrine() {
            const time = performance.now() * 0.001;
            const scaf = SimState.shrineScaffolding;
            const z = Camera.zoom;

            // Harmoniously aligned directly south of Village III (gx: 16.2..18.4, gy: 9.8..11.6)
            drawIshigakiStoneBox(16.2, 9.8, 0, 2.2, 1.8, 0.32, '#64748b', '#475569', '#334155', '#1e293b', 2);

            if (SimState.senescenceActive || scaf >= 100) {
                drawIsoBox(16.45, 10.0, 0.32, 1.7, 1.4, 1.35, '#fef08a', '#facc15', '#ca8a04', '#854d0e');
                drawJapaneseRoof(16.35, 9.9, 1.67, 1.9, 1.6, 0.85, '#a16207', '#eab308', '#fef08a');
                drawIsoBox(16.7, 10.2, 2.4, 1.2, 1.0, 0.95, '#fef9c3', '#fde047', '#eab308', '#854d0e');
                drawJapaneseRoof(16.6, 10.1, 3.35, 1.4, 1.2, 0.8, '#854d0e', '#facc15', '#ffffff');

                const bellPos = isoToScreen(17.3, 10.7, 2.2);
                const ringR = ((time * 28) % 65) * z;
                ctx.save();
                ctx.strokeStyle = `rgba(250, 204, 21, ${Math.max(0, 1 - ringR / (65 * z))})`;
                ctx.lineWidth = 3.0 * z;
                ctx.beginPath(); ctx.arc(bellPos.x, bellPos.y, ringR, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();

                drawFloatingLabel(17.3, 10.7, 4.4, '⛩️ GILDED TEMPLE OF SENESCENCE (100%)', '🔔 Workers Entranced • SASP ROS Collapse!', '#facc15');
                return;
            }

            drawIsoBox(16.6, 10.1, 0.32, 1.4, 1.2, 0.92, '#d6d3d1', '#78350f', '#451a03', '#271c11');
            drawSouthWestDoorwayAndPorch(16.6, 10.1, 1.4, 1.2, '#b45309');
            drawJapaneseRoof(16.55, 10.05, 1.24, 1.5, 1.3, 0.65, '#451a03', '#78350f', '#f59e0b');

            if (scaf > 5) {
                const tiers = Math.ceil((scaf / 100) * 3);
                const maxZ = 0.32 + (scaf / 100) * 2.25;
                const corners = [
                    [16.32, 9.92], [18.28, 9.92], [18.28, 11.48], [16.32, 11.48]
                ];
                ctx.save();
                ctx.strokeStyle = scaf > 65 ? '#eab308' : '#84cc16';
                ctx.lineWidth = 2.2 * z;
                for (const [cx, cy] of corners) {
                    const pBot = isoToScreen(cx, cy, 0.32);
                    const pTop = isoToScreen(cx, cy, maxZ);
                    ctx.beginPath(); ctx.moveTo(pBot.x, pBot.y); ctx.lineTo(pTop.x, pTop.y); ctx.stroke();
                }
                for (let t = 1; t <= tiers; t++) {
                    const tz = 0.32 + (t / 3) * 2.1 * Math.min(1, scaf / (t * 28));
                    const c0 = isoToScreen(corners[0][0], corners[0][1], tz);
                    const c1 = isoToScreen(corners[1][0], corners[1][1], tz);
                    const c2 = isoToScreen(corners[2][0], corners[2][1], tz);
                    const c3 = isoToScreen(corners[3][0], corners[3][1], tz);
                    ctx.strokeStyle = '#a3e635';
                    ctx.lineWidth = 1.6 * z;
                    ctx.beginPath();
                    ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y);
                    ctx.lineTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y);
                    ctx.closePath(); ctx.stroke();
                }

                for (let b = 0; b < SimState.misfoldedBeams; b++) {
                    const bx = 16.45 + (b % 3) * 0.65;
                    const by = 11.35 - Math.floor(b / 3) * 0.55;
                    const bz = 0.65 + (b * 0.25);
                    const bp = isoToScreen(bx, by, bz);
                    ctx.strokeStyle = '#a855f7';
                    ctx.lineWidth = 3.6 * z;
                    ctx.beginPath();
                    ctx.moveTo(bp.x - 9 * z, bp.y - 4 * z);
                    ctx.lineTo(bp.x + 9 * z, bp.y + 5 * z);
                    ctx.stroke();
                    ctx.fillStyle = '#f43f5e';
                    ctx.beginPath(); ctx.arc(bp.x, bp.y, 2.8 * z, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            }

            const statusSub = scaf > 65
                ? `⚠️ Over-Built (${Math.round(scaf)}%) • Misfolded Proteins & Insulin Resist!`
                : (scaf >= 20 ? `☯️ Healthy Remodeling (${Math.round(scaf)}% Scaffolding)` : `Stripped Bare (${Math.round(scaf)}% • High Autophagy)`);
            const lblCol = scaf > 65 ? '#e879f9' : (scaf >= 20 ? '#34d399' : '#38bdf8');
            drawFloatingLabel(17.3, 12.15, 0.0, `Shrine of Proteostasis (${Math.round(scaf)}%)`, statusSub, lblCol, 'below');
        }

        function drawBambooFenceSegment(gx1, gy1, gx2, gy2, gz = 0.25) {
            const z = Camera.zoom; const p1 = isoToScreen(gx1, gy1, gz); const p2 = isoToScreen(gx2, gy2, gz);
            const p1Top = isoToScreen(gx1, gy1, gz + 0.55); const p2Top = isoToScreen(gx2, gy2, gz + 0.55);
            ctx.save();
            ctx.fillStyle = 'rgba(163, 230, 53, 0.14)'; ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p2Top.x, p2Top.y); ctx.lineTo(p1Top.x, p1Top.y); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#84cc16'; ctx.lineWidth = 2.0 * z; ctx.beginPath(); ctx.moveTo(p1Top.x, p1Top.y); ctx.lineTo(p2Top.x, p2Top.y); ctx.stroke();
            ctx.restore();
        }

        function drawSouthWestDoorwayAndPorch(gx, gy, w, d, doorColor = '#1e3a8a') {
            drawIsoBox(gx + 0.2, gy + d, 0, w - 0.4, 0.45, 0.16, '#92400e', '#78350f', '#451a03');
            const dL = isoToScreen(gx + w * 0.24, gy + d + 0.01, 0.16);
            const dR = isoToScreen(gx + w * 0.76, gy + d + 0.01, 0.16);
            const dTR = isoToScreen(gx + w * 0.76, gy + d + 0.01, 0.88);
            const dTL = isoToScreen(gx + w * 0.24, gy + d + 0.01, 0.88);
            const z = Camera.zoom;
            ctx.save();
            // Warm glowing Shoji paper interior
            ctx.fillStyle = '#fef3c7';
            ctx.beginPath(); ctx.moveTo(dL.x, dL.y); ctx.lineTo(dR.x, dR.y); ctx.lineTo(dTR.x, dTR.y); ctx.lineTo(dTL.x, dTL.y); ctx.closePath(); ctx.fill();
            // Dark timber Shoji lattice bars
            ctx.strokeStyle = '#451a03'; ctx.lineWidth = 0.9 * z;
            ctx.stroke();
            // 3 Noren fabric curtains hanging across the top half of the doorway
            for (let panel = 0; panel < 3; panel++) {
                const f0 = 0.25 + panel * 0.17;
                const f1 = f0 + 0.145;
                const nBL = isoToScreen(gx + w * f0, gy + d + 0.02, 0.48);
                const nBR = isoToScreen(gx + w * f1, gy + d + 0.02, 0.48);
                const nTR = isoToScreen(gx + w * f1, gy + d + 0.02, 0.87);
                const nTL = isoToScreen(gx + w * f0, gy + d + 0.02, 0.87);
                ctx.fillStyle = doorColor;
                ctx.beginPath(); ctx.moveTo(nBL.x, nBL.y); ctx.lineTo(nBR.x, nBR.y); ctx.lineTo(nTR.x, nTR.y); ctx.lineTo(nTL.x, nTL.y); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.8 * z; ctx.stroke();
            }
            ctx.restore();
        }

        function renderVillage1() {
            drawIshigakiStoneBox(9.8, 4.5, 0, 2.2, 1.9, 0.22, '#64748b', '#475569', '#334155', '#1e293b', 2);
            drawIsoBox(9.9, 4.6, 0.22, 2.0, 1.7, 1.05, '#e7e5e4', '#a8a29e', '#78716c', '#44403c');
            drawSouthWestDoorwayAndPorch(9.9, 4.6, 2.0, 1.7, '#2563eb');
            drawJapaneseRoof(9.9, 4.6, 1.27, 2.0, 1.7, 0.85, '#451a03', '#78350f', '#3b82f6', 'I');
            const c1Rev = !!SimState.c1ReverseSlip;
            drawWaterPumpWheel(12.05, 5.25, 0.82, SimState.pumpAngles.v1, SimState.pumpSpinTimers.v1 > 0 || c1Rev, c1Rev ? '#ef4444' : '#38bdf8');
            if (SimState.c1SpillAnim > 0) {
                const t = 1 - Math.min(1, SimState.c1SpillAnim / 0.85);
                const sp = isoToScreen(10.35 + t * 0.5, 6.25 + t * 0.35, 0.55 - t * 0.40);
                drawTawaraBale(sp.x, sp.y, 0.65, t * 2.8, true);
            }
            if (c1Rev && SimState.showLabels) {
                const wp = isoToScreen(12.05, 5.25, 1.55);
                const z = Camera.zoom;
                ctx.save();
                ctx.font = `bold ${Math.round(8.2 * z)}px Inter, sans-serif`;
                ctx.fillStyle = '#f87171';
                ctx.textAlign = 'center';
                ctx.fillText('⛔ PUMP REVERSED (ΔΨm Slip!)', wp.x, wp.y);
                ctx.restore();
            } else if (SimState.pumpSpinTimers.v1 > 0 && SimState.showLabels) {
                const wp = isoToScreen(12.05, 5.25, 1.55);
                const z = Camera.zoom;
                ctx.save();
                ctx.font = `bold ${Math.round(8.2 * z)}px Inter, sans-serif`;
                ctx.fillStyle = '#38bdf8';
                ctx.textAlign = 'center';
                ctx.fillText('💧 +4 H⁺', wp.x, wp.y);
                ctx.restore();
            }
            drawStockpileBales(10.05, 6.45, 0.15, SimState.villageStock.v1);
            drawStoneLantern(9.75, 6.45, 0.0, true);
            const v1Count = SimState.villageStock.v1 || 0;
            const v1Smolder = v1Count >= 2 && SimState.damLevel >= 74;
            drawFloatingLabel(10.9, 5.3, 2.55, 'Village I (Complex I: Mill)', v1Smolder ? `🔥 ΔΨm Stall (${v1Count} Bales Smoldering → ROS!)` : `Mills Straw Bales → Flour Sacks (${BioConfig.pumpProtons.complexI} H+)`, v1Smolder ? '#f97316' : '#3b82f6', 'above');
        }

        function renderVillage2() {
            drawIshigakiStoneBox(9.8, 10.1, 0, 2.0, 1.7, 0.20, '#64748b', '#475569', '#334155', '#1e293b', 2);
            drawIsoBox(9.9, 10.2, 0.20, 1.8, 1.5, 0.85, '#fde68a', '#f59e0b', '#b45309', '#78350f');
            drawSouthWestDoorwayAndPorch(9.9, 10.2, 1.8, 1.5, '#d97706');
            drawJapaneseRoof(9.9, 10.2, 1.05, 1.8, 1.5, 0.68, '#78350f', '#92400e', '#fbbf24', 'II');
            drawStockpileBales(10.05, 11.85, 0.15, SimState.villageStock.v2);
            drawStoneLantern(9.75, 11.85, 0.0, true);
            const v2Count = SimState.villageStock.v2 || 0;
            const v2Sub = v2Count >= 7
                ? `🔥 Succinate Overload (${v2Count} Bales) → HIF-1α & RET-ROS!`
                : (v2Count >= 4
                    ? `⚠️ CoQ Back-Pressure (${v2Count} Bales) → RET-ROS Risk!`
                    : 'NO PUMP (0 H+) • Bales → Flour Sacks');
            drawFloatingLabel(10.8, 12.45, 0.0, 'Village II (Complex II: Mill)', v2Sub, v2Count >= 4 ? '#f87171' : '#f59e0b', 'below');

            // F-09: Crackling Reverse Electron Transport (RET) Arc from Village II -> Village I
            if (SimState.retArcTimer > 0) {
                const time = performance.now() * 0.001;
                const z = Camera.zoom;
                const pStart = isoToScreen(10.8, 10.2, 1.15);
                const pEnd = isoToScreen(10.9, 6.2, 0.95);
                ctx.save();
                ctx.strokeStyle = `rgba(251, 191, 36, ${Math.min(1, SimState.retArcTimer)})`;
                ctx.lineWidth = 3.2 * z;
                ctx.setLineDash([7 * z, 4 * z]);
                ctx.lineDashOffset = -time * 42 * z;
                ctx.beginPath();
                ctx.moveTo(pStart.x, pStart.y);
                ctx.quadraticCurveTo(pStart.x - 16 * z, (pStart.y + pEnd.y) * 0.5, pEnd.x, pEnd.y);
                ctx.stroke();
                if (SimState.showLabels) {
                    ctx.font = `bold ${Math.round(8.0 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#fde047';
                    ctx.textAlign = 'center';
                    ctx.fillText('⚡ RET (CoQH₂ → Complex I)', (pStart.x + pEnd.x) * 0.5 - 18 * z, (pStart.y + pEnd.y) * 0.5);
                }
                ctx.restore();
            }
        }        function drawStockpileFlourSacks(gx, gy, gz, count) {
            const maxVisible = Math.min(8, Math.floor(count));
            for (let i = 0; i < maxVisible; i++) {
                const row = Math.floor(i / 3); const col = i % 3;
                const pos = isoToScreen(gx + col * 0.22, gy + row * 0.18, gz + row * 0.18);
                drawFlourSack(pos.x, pos.y, 0.72);
            }
        }        function drawPressPulseFireman(gx, gy, gz, mode, phase, facing, bogTargetGx, bogTargetGy) {
            if (SimState.cellDead || SimState.crisisState === 'necrosis' || SimState.crisisState === 'starvation' || (SimState.apoptosisSequence && SimState.apoptosisSequence.act !== 'rampage') || (SimState.necrosisSequence && SimState.necrosisSequence.act !== 'surge') || (SimState.starvationSequence && SimState.starvationSequence.act !== 'scavenge')) return;
            const p = isoToScreen(gx, gy, gz);
            const bogP = isoToScreen(bogTargetGx, bogTargetGy, 0.05);
            const z = Camera.zoom;
            ctx.save();

            if (mode === 'pump') {
                // Bamboo siphon hose into the Glycolysis bog + upright wooden piston pump
                ctx.strokeStyle = '#65a30d';
                ctx.lineWidth = 2.4 * z;
                ctx.beginPath();
                ctx.moveTo(bogP.x, bogP.y);
                ctx.quadraticCurveTo((bogP.x + p.x) * 0.5, Math.min(bogP.y, p.y) - 6 * z, p.x + facing * 6 * z, p.y - 6 * z);
                ctx.stroke();

                // Pump cylinder
                ctx.fillStyle = '#78350f';
                ctx.fillRect(p.x + facing * 4 * z, p.y - 14 * z, 4.5 * z, 14 * z);
                const strokeY = Math.sin(phase) * 4 * z;
                ctx.strokeStyle = '#fde68a';
                ctx.lineWidth = 1.6 * z;
                ctx.beginPath();
                ctx.moveTo(p.x + facing * 6.2 * z, p.y - 14 * z + strokeY);
                ctx.lineTo(p.x + facing * 6.2 * z, p.y - 21 * z + strokeY);
                ctx.stroke();

                // Pumped bog discharge droplets
                const dropT = (phase * 0.35) % 1;
                ctx.fillStyle = '#4ade80';
                ctx.beginPath();
                ctx.arc(p.x - facing * (5 + dropT * 12) * z, p.y - 10 * z + dropT * 9 * z, 2.1 * z, 0, Math.PI * 2);
                ctx.fill();
            } else if (mode === 'scoop') {
                const isPulsing = (SimState.pulseAnimTimer || 0) > 0;
                const scoopSwing = isPulsing ? Math.sin(phase) : -0.6;
                const bktX = p.x + facing * (8 + scoopSwing * 6) * z;
                const bktY = p.y - (isPulsing ? (4 - scoopSwing * 5) : 5) * z;

                // Large wooden/wicker scoop bucket
                ctx.fillStyle = '#b45309';
                ctx.beginPath();
                ctx.moveTo(bktX - 4.5 * z, bktY - 4 * z);
                ctx.lineTo(bktX + 4.5 * z, bktY - 4 * z);
                ctx.lineTo(bktX + 3.2 * z, bktY + 3.5 * z);
                ctx.lineTo(bktX - 3.2 * z, bktY + 3.5 * z);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#fde68a';
                ctx.lineWidth = 1.0 * z;
                ctx.stroke();

                if (isPulsing) {
                    // Violet mSLP bog contents & splash arc out of Wellhouse
                    ctx.fillStyle = '#e879f9';
                    ctx.fillRect(bktX - 3.2 * z, bktY - 3.5 * z, 6.4 * z, 2.5 * z);
                    const splashT = (phase * 0.4) % 1;
                    ctx.beginPath();
                    ctx.arc(bktX - facing * splashT * 11 * z, bktY - 5 * z - Math.sin(splashT * Math.PI) * 8 * z, 2.2 * z, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Hikeshi Fireman body (crimson coat, gold trim, hachimaki headband)
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y + 1.5 * z, 5 * z, 2.2 * z, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(p.x - 3.8 * z, p.y - 12 * z, 7.6 * z, 10 * z);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(p.x - 3.8 * z, p.y - 6.5 * z, 7.6 * z, 1.6 * z);

            // Head & headband
            ctx.fillStyle = '#fde68a';
            ctx.beginPath();
            ctx.arc(p.x, p.y - 15.5 * z, 3.3 * z, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(p.x - 3.4 * z, p.y - 17.2 * z, 6.8 * z, 1.6 * z);

            ctx.restore();
        }

        function renderWellhouseApothecary() {
            const time = performance.now() * 0.001;
            const mslpBonfire = !!SimState.warburgActive;
            const bogFrac = mslpBonfire ? 1.0 : Math.max(0, Math.min(1, (SimState.etcDamage - 45) / 10));
            if (mslpBonfire) {
                // Wellhouse sinks completely into the ground-level Violet mSLP Fermentation Bog; workers dance Thriller on top!
                drawFermentationBog(14.30, 8.18, 0.04, '#7e22ce', '#e879f9', '🫧 WELLHOUSE mSLP BOG (Succinyl-CoA)', time, 1.0);
                const wellBales = [
                    { gx: 13.32, gy: 8.85, gz: 0.06, rot: -0.35 },
                    { gx: 15.18, gy: 8.82, gz: 0.06, rot: 0.38 }
                ];
                for (const wb of wellBales) {
                    const wp = isoToScreen(wb.gx, wb.gy, wb.gz);
                    drawTawaraBale(wp.x, wp.y, 0.64, wb.rot, true);
                }
                drawYardWorker(13.55, 9.15, 0.12, time * 12, '#be185d', 'pitch');
                drawYardWorker(15.05, 9.12, 0.12, time * 13 + 1.8, '#9333ea', 'pitch');

                // Seyfried mSLP Waste Byproduct: Succinate wicker basket filling next to the Glutamate/mSLP bog
                const isPulsing = (SimState.pulseAnimTimer || 0) > 0;
                const succOverflow = (SimState.succinatePool || 0) >= 95;
                const succAction = isPulsing
                    ? '⬇ Emptying (Pulse!)'
                    : (succOverflow ? '🪣 OVERFLOW — PULSE NOW!' : '⏳ Filling (Wait!)');
                drawBasketOverflowPuddle(14.04, 6.75, SimState.succinatePool || 0, '#701a75', '#f0abfc', '🪣 Succinate Overflow — Pulse Ready!');
                drawWickerBasket(14.04, 6.75, SimState.succinatePool || 0, '#f0abfc', '#9333ea', 'Succinate', succAction);

                if (SimState.pressActive || isPulsing) {
                    drawPressPulseFireman(13.15, 8.15, 0.08, 'scoop', time * 5.2, 1, 14.0, 8.18);
                    drawPressPulseFireman(15.40, 8.20, 0.08, 'scoop', time * 5.2 + 1.5, -1, 14.6, 8.18);
                    if (SimState.showLabels) {
                        const z = Camera.zoom;
                        const lp = isoToScreen(14.30, 7.65, 1.45);
                        ctx.save();
                        ctx.font = `bold ${Math.round(7.8 * z)}px Inter, sans-serif`;
                        ctx.fillStyle = isPulsing ? '#f0abfc' : '#bae6fd';
                        ctx.textAlign = 'center';
                        ctx.fillText(isPulsing ? '🪣 PULSE: Emptying Succinate & Wellhouse mSLP!' : '💧 Press Active — Click PULSE to Empty Succinate!', lp.x, lp.y);
                        ctx.restore();
                    }
                }
                return;
            }
            if (bogFrac > 0) {
                drawFermentationBog(14.30, 8.18, 0.04, '#7e22ce', '#e879f9', '⚠️ mSLP BOG RISING — WELLHOUSE CRUMBLING', time, bogFrac);
                drawCrumblingRubble(14.30, 8.18, bogFrac, '#e879f9', time);
                ctx.save();
                const zBog = Camera.zoom;
                ctx.translate(Math.sin(time * 24) * bogFrac * 1.4 * zBog, bogFrac * 24 * zBog);
                ctx.globalAlpha = Math.max(0.18, 1 - bogFrac * 0.68);
            }
            // Centered in the courtyard plaza (gx: 13.4..15.2, gy: 7.4..8.9)
            drawIshigakiStoneBox(13.4, 7.4, 0, 1.8, 1.5, 0.30, mslpBonfire ? '#581c87' : '#64748b', '#475569', '#334155', mslpBonfire ? '#e879f9' : '#1e293b', 2);
            drawIsoBox(13.8, 8.9, 0, 1.0, 0.35, 0.16, '#94a3b8', '#64748b', '#475569');
            drawIsoBox(13.75, 7.65, 0.30, 1.1, 1.0, 0.55, '#78350f', '#451a03', '#27272a');
            const gshFrac = SimState.gshReserve / 100;
            drawIsoBox(13.85, 7.75, 0.30, 0.9, 0.8, 0.1 + gshFrac * 0.42, mslpBonfire ? '#a855f7' : (gshFrac > 0.25 ? '#06b6d4' : '#f43f5e'), mslpBonfire ? '#7e22ce' : '#0891b2', '#155e75');
            if (SimState.nrf2BoostActive && !mslpBonfire && SimState.showLabels) {
                const nPos = isoToScreen(14.3, 8.1, 2.2);
                const z = Camera.zoom;
                ctx.save();
                ctx.font = `bold ${Math.round(7.6 * z)}px Inter, sans-serif`;
                ctx.fillStyle = '#34d399';
                ctx.textAlign = 'center';
                ctx.fillText('✨ Nrf2 +GSH Hormesis', nPos.x, nPos.y);
                ctx.restore();
            }

            drawIsoBox(13.60, 7.52, 0.30, 0.12, 0.12, 1.25, '#78350f', '#451a03', '#27272a');
            drawIsoBox(14.88, 7.52, 0.30, 0.12, 0.12, 1.25, '#78350f', '#451a03', '#27272a');
            drawIsoBox(13.60, 8.68, 0.30, 0.12, 0.12, 1.25, '#78350f', '#451a03', '#27272a');
            drawIsoBox(14.88, 8.68, 0.30, 0.12, 0.12, 1.25, '#78350f', '#451a03', '#27272a');
            drawJapaneseRoof(13.55, 7.50, 1.55, 1.5, 1.35, 0.58, mslpBonfire ? '#4c1d95' : '#164e63', mslpBonfire ? '#7e22ce' : '#0e7490', mslpBonfire ? '#e879f9' : '#22d3ee');

            // Hanging Bronze AMPK Alarm Bell (Bonsho) on South Porch for Adenylate Kinase AMP Donors
            const alarmActive = (SimState.wellhouseAlarmTimer || 0) > 0;
            const bellPos = isoToScreen(14.30, 8.82, 1.22);
            const z = Camera.zoom;
            ctx.save();
            const bellSwing = alarmActive ? Math.sin(time * 42) * 3.2 * z : 0;
            ctx.fillStyle = alarmActive ? '#38bdf8' : '#d97706';
            ctx.strokeStyle = alarmActive ? '#e0f2fe' : '#78350f';
            ctx.lineWidth = 1.2 * z;
            ctx.beginPath();
            ctx.arc(bellPos.x + bellSwing, bellPos.y, 4.2 * z, Math.PI, 0);
            ctx.lineTo(bellPos.x + bellSwing + 4.8 * z, bellPos.y + 5.5 * z);
            ctx.lineTo(bellPos.x + bellSwing - 4.8 * z, bellPos.y + 5.5 * z);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            if (alarmActive) {
                const waveFrac = Math.max(0, Math.min(1, 1 - ((SimState.wellhouseAlarmTimer || 0) / 2.25)));
                for (let w = 0; w < 2; w++) {
                    const phase = ((waveFrac + w * 0.45) % 1 + 1) % 1;
                    const r = Math.max(0.5, (8 + phase * 24) * z);
                    ctx.strokeStyle = `rgba(34, 211, 238, ${Math.max(0, 0.85 * (1 - (r / (32 * z))))})`;
                    ctx.lineWidth = 2.0 * z;
                    ctx.beginPath();
                    ctx.arc(bellPos.x, bellPos.y + 2 * z, r, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            ctx.restore();

            drawStoneLantern(13.35, 9.05, 0.0, true);
            const wellSubtitle = alarmActive
                ? '🔔 AMP ALARM RINGING → Dispatching AMPK Ninja!'
                : (mslpBonfire ? '🔥 mSLP BONFIRE: Complex Workers Feeding Glutamate Bales → GTP/ATP!' : 'Auto-Bucket Brigade & AMP Sensor');
            drawFloatingLabel(14.3, 8.1, 2.45, mslpBonfire ? `🔥 WELLHOUSE mSLP BONFIRE (${Math.round(SimState.gshReserve)}% GSH)` : `GSH Wellhouse (${Math.round(SimState.gshReserve)}%)`, wellSubtitle, alarmActive ? '#38bdf8' : (mslpBonfire ? '#e879f9' : '#22d3ee'));
            if (bogFrac > 0) ctx.restore();
        }

        function renderVillage3() {
            // Aligned with Village I on the Northern Terrace (gx: 16.2..18.4, gy: 4.5..6.4)
            drawIshigakiStoneBox(16.2, 4.5, 0, 2.2, 1.9, 0.22, '#64748b', '#475569', '#334155', '#1e293b', 2);
            drawIsoBox(16.3, 4.6, 0.22, 2.0, 1.7, 1.15, '#e2e8f0', '#94a3b8', '#64748b', '#334155');
            drawSouthWestDoorwayAndPorch(16.3, 4.6, 2.0, 1.7, '#1d4ed8');
            drawJapaneseRoof(16.3, 4.6, 1.37, 2.0, 1.7, 0.90, '#1e3a8a', '#1d4ed8', '#38bdf8', 'III');
            drawWaterPumpWheel(18.45, 5.35, 0.85, SimState.pumpAngles.v3, SimState.pumpSpinTimers.v3 > 0);
            drawStockpileFlourSacks(16.45, 6.48, 0.15, SimState.villageStock.v3);
            drawStoneLantern(16.15, 6.45, 0.0, true);
            drawFloatingLabel(17.3, 5.3, 2.65, 'Village III (Complex III: Steamer)', `Steams Flour → Mochi Balls (${BioConfig.pumpProtons.complexIII} H+)`, '#38bdf8', 'above');
        }

        function renderHousekeepingAqueduct() {
            // Spaced 2.0 tiles east of Village III (gx: 20.4..21.6)
            drawIsoBox(20.5, 3.3, 0, 1.0, 1.9, 1.05, '#475569', '#334155', '#1e293b');
            drawIsoBox(20.65, 3.3, 1.05, 0.7, 1.8, 0.12, '#6366f1', '#4f46e5', '#3730a3');
            drawIsoBox(20.4, 4.9, 0, 1.2, 1.1, 0.85, '#cbd5e1', '#94a3b8', '#64748b');
            drawJapaneseRoof(20.4, 4.9, 0.85, 1.2, 1.1, 0.52, '#312e81', '#4338ca', '#818cf8');
            drawWaterPumpWheel(21.65, 5.45, 0.55, SimState.housekeepingWheelAngle, SimState.housekeepingRate > 0.1, '#818cf8');
            drawFloatingLabel(21.0, 4.7, 2.15, 'Housekeeping Run-off', 'Basal Leak & Internal Maintenance', '#818cf8');
        }

        function renderVillage4() {
            const time = performance.now() * 0.001;
            // Spaced cleanly along the Southern River dock (gx: 21.0..23.2, gy: 9.2..11.1)
            drawIshigakiStoneBox(21.0, 9.1, 0, 2.2, 2.0, 0.22, '#64748b', '#475569', '#334155', '#1e293b', 2);
            drawIsoBox(21.1, 9.2, 0.22, 2.0, 1.8, 1.08, '#fecdd3', '#f43f5e', '#be123c', '#881337');
            drawSouthWestDoorwayAndPorch(21.1, 9.2, 2.0, 1.8, '#be123c');
            drawJapaneseRoof(21.1, 9.2, 1.30, 2.0, 1.8, 0.82, '#881337', '#9f1239', '#fda4af', 'IV');
            drawWaterPumpWheel(23.25, 9.95, 0.82, SimState.pumpAngles.v4, SimState.pumpSpinTimers.v4 > 0);

            drawIsoBox(21.2, 11.1, 0, 1.85, 1.35, 0.2, '#78350f', '#451a03', '#27272a');

            const press = SimState.village4Press;
            const cPhase = press.cyclePhase || 'idle';
            const cTimer = press.cycleTimer || 0;
            // clampT: 0 = kiln sides open, 1 = kiln sides snapped shut around O2 & 4 buns
            let clampT = 0;
            if (cPhase === 'clamping') {
                clampT = Math.min(1, Math.pow(cTimer / 0.24, 0.55));
            } else if (cPhase === 'sealed') {
                clampT = 1.0;
            } else if (cPhase === 'opening') {
                clampT = Math.max(0, 1 - ((cTimer - 0.52) / 0.33));
            }

            const isReacting = (cPhase === 'sealed') || (press.ballsCount > 0 && press.timer > 1.5);
            const shakeX = isReacting ? Math.sin(time * (cPhase === 'sealed' ? 68 : 42)) * 0.045 : 0;
            drawIsoBox(21.5 + shakeX, 11.2, 0.2, 1.25, 0.88, 0.3,
                press.overheated ? '#a855f7' : (cPhase === 'sealed' ? '#d97706' : '#b45309'),
                press.overheated ? '#7e22ce' : '#92400e',
                press.overheated ? '#581c87' : '#78350f',
                press.overheated ? '#f43f5e' : '#451a03'
            );

            const z = Camera.zoom;
            const pCenter = isoToScreen(22.12 + shakeX, 11.64, 0.52);
            ctx.save();

            // Central O2 orb (visible while filling or clamping before fusion into H2O)
            if ((press.ballsCount > 0 || cPhase === 'clamping' || cPhase === 'sealed') && clampT < 0.92) {
                const orbY = pCenter.y - 1.5 * z + Math.sin(time * 8) * 1.2 * z;
                ctx.fillStyle = press.overheated ? '#f43f5e' : '#38bdf8';
                ctx.strokeStyle = '#e0f2fe';
                ctx.lineWidth = 1.3 * z;
                ctx.beginPath(); ctx.arc(pCenter.x, orbY, 5.2 * z * (1 - clampT * 0.35), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.font = `bold ${Math.round(7.0 * z)}px Inter, sans-serif`;
                ctx.fillStyle = '#0f172a'; ctx.textAlign = 'center';
                ctx.fillText('O₂', pCenter.x, orbY + 2.5 * z);
            }

            // Left & Right Sliding Copper-Iron Kiln Jaws (Snap shut when 4 buns are deposited in time)
            const openSpread = 13.8 * z;
            const shutSpread = 7.4 * z;
            const curSpread = openSpread - (openSpread - shutSpread) * clampT;

            const displayBalls = (cPhase === 'clamping' || cPhase === 'sealed') ? 4 : press.ballsCount;
            const pair1Filled = displayBalls >= 2;
            const pair2Filled = displayBalls >= 4;

            for (let pIdx = 0; pIdx < 2; pIdx++) {
                const dir = pIdx === 0 ? -1 : 1;
                const pairX = pCenter.x + dir * curSpread;
                const pairY = pCenter.y + dir * 1.0 * z;
                const isPairReady = (pIdx === 0 && pair1Filled) || (pIdx === 1 && pair2Filled);

                // Outer copper kiln jaw housing
                ctx.fillStyle = clampT > 0.85
                    ? 'rgba(180, 83, 9, 0.94)'
                    : (isPairReady ? 'rgba(30, 58, 138, 0.82)' : 'rgba(15, 23, 42, 0.78)');
                ctx.strokeStyle = clampT > 0.85 ? '#facc15' : (isPairReady ? '#38bdf8' : '#d97706');
                ctx.lineWidth = (clampT > 0.85 ? 1.8 : 1.3) * z;
                ctx.beginPath();
                ctx.roundRect(pairX - 7.4 * z, pairY - 11.2 * z, 14.8 * z, 22.4 * z, 3.5 * z);
                ctx.fill();
                ctx.stroke();

                // Interlocking inner iron teeth along the clamping edge
                const innerEdgeX = pairX - dir * 7.4 * z;
                ctx.fillStyle = clampT > 0.85 ? '#fde047' : '#94a3b8';
                for (let t = -1; t <= 1; t++) {
                    ctx.fillRect(innerEdgeX - 1.2 * z, pairY + t * 5.8 * z - 1.4 * z, 2.4 * z, 2.8 * z);
                }

                for (let sInPair = 0; sInPair < 2; sInPair++) {
                    const slotIndex = pIdx * 2 + sInPair;
                    const sx = pairX;
                    const sy = pairY + (sInPair === 0 ? -5.0 : 5.0) * z;
                    ctx.fillStyle = slotIndex < displayBalls ? '#fef08a' : '#1e293b';
                    ctx.strokeStyle = press.overheated ? '#e879f9' : '#f59e0b';
                    ctx.lineWidth = 1.2 * z;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 3.8 * z, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    if (slotIndex < displayBalls) {
                        drawMochiBall(sx, sy - 1.2 * z, 0.62 * (1 - clampT * 0.18));
                    }
                }
            }

            // Glowing vertical catalytic seam & steam burst when the 2 kiln halves snap shut
            if (clampT > 0.82) {
                ctx.strokeStyle = '#7dd3fc';
                ctx.lineWidth = 2.6 * z;
                ctx.beginPath();
                ctx.moveTo(pCenter.x, pCenter.y - 12.5 * z);
                ctx.lineTo(pCenter.x, pCenter.y + 12.5 * z);
                ctx.stroke();

                ctx.fillStyle = 'rgba(125, 211, 252, 0.35)';
                ctx.beginPath();
                ctx.arc(pCenter.x, pCenter.y, 10 * z, 0, Math.PI * 2);
                ctx.fill();
            } else if (cPhase === 'opening') {
                // Steam plume rising as the 2 kiln halves snap open and fling H2O
                const openProgress = Math.min(1, (cTimer - 0.52) / 0.33);
                ctx.fillStyle = `rgba(224, 242, 254, ${0.75 * (1 - openProgress)})`;
                ctx.beginPath();
                ctx.arc(pCenter.x, pCenter.y - openProgress * 14 * z, (7 + openProgress * 9) * z, 0, Math.PI * 2);
                ctx.fill();
            }

            // Top copper cross-head bar that locks down as the 2 sides snap shut
            const lidLift = (21 - clampT * 17.5) * z;
            ctx.fillStyle = press.overheated ? '#9333ea' : (clampT > 0.85 ? '#f59e0b' : '#d97706');
            ctx.strokeStyle = '#451a03'; ctx.lineWidth = 1.4 * z;
            ctx.beginPath();
            ctx.roundRect(pCenter.x - 21 * z, pCenter.y - lidLift - 8 * z, 42 * z, 7.0 * z, 2.5 * z);
            ctx.fill(); ctx.stroke();

            if (press.ballsCount > 0 && press.ballsCount < 4 && !press.overheated && cPhase === 'idle') {
                const heatFrac = Math.min(1, press.timer / 3.2);
                const bw = 40 * z; const bh = 4.5 * z;
                const bx = pCenter.x - bw / 2; const by = pCenter.y - 34 * z;
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.fillRect(bx, by, bw, bh);
                ctx.fillStyle = heatFrac > 0.7 ? '#f43f5e' : (heatFrac > 0.4 ? '#f59e0b' : '#38bdf8');
                ctx.fillRect(bx, by, bw * heatFrac, bh);
            }
            ctx.restore();

            drawYardWorker(21.32, 11.85, 0.2, clampT > 0.5 ? 1.2 : time * 3, '#9f1239', 'lever');

            const pair1Count = Math.min(2, displayBalls);
            const pair2Count = Math.max(0, displayBalls - 2);
            const statusText = press.overheated
                ? '💥 •OH HYDROXYL DETONATION! (Stalled Intermediate)'
                : (cPhase === 'clamping' || cPhase === 'sealed'
                    ? '⚡ KILN LOCKED SHUT: 4e⁻ + 4H⁺ + O₂ → 2 H₂O!'
                    : (cPhase === 'opening'
                        ? '💧 KILN OPENED: Flinging H₂O into River!'
                        : `2 Pairs: [${pair1Count}/2] + [${pair2Count}/2] + O₂ → 2 H₂O`));
            drawFloatingLabel(22.1, 10.1, 2.45, 'Village IV: Paired 2x2 Kiln-Press', statusText, press.overheated ? '#f43f5e' : (cPhase !== 'idle' ? '#38bdf8' : '#fb7185'));
        }

        function drawThrownSteamCake(tb) {
            const curX = tb.startX + (tb.endX - tb.startX) * tb.progress;
            const curY = tb.startY + (tb.endY - tb.startY) * tb.progress;
            const arcZ = Math.sin(tb.progress * Math.PI) * 1.95;
            const curZ = tb.startZ + (tb.endZ - tb.startZ) * tb.progress + arcZ;
            const pos = isoToScreen(curX, curY, curZ);
            const z = Camera.zoom;
            const spin = tb.progress * Math.PI * 1.6 + (tb.spinOffset || 0);

            ctx.save();
            // Vapor trail arc behind the flung H2O molecule
            if (tb.progress > 0.08) {
                const prevT = Math.max(0, tb.progress - 0.12);
                const prevX = tb.startX + (tb.endX - tb.startX) * prevT;
                const prevY = tb.startY + (tb.endY - tb.startY) * prevT;
                const prevZ = tb.startZ + (tb.endZ - tb.startZ) * prevT + Math.sin(prevT * Math.PI) * 1.95;
                const prevPos = isoToScreen(prevX, prevY, prevZ);
                ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
                ctx.lineWidth = 2.8 * z;
                ctx.setLineDash([3 * z, 2 * z]);
                ctx.beginPath();
                ctx.moveTo(prevPos.x, prevPos.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Triatomic H2O Molecule (Central Oxygen + 2 Hydrogen Atoms at 104.5° bond angle)
            const bondLen = 6.8 * z;
            const halfAngle = (104.5 * Math.PI / 180) / 2;
            const h1x = pos.x + Math.cos(-Math.PI / 2 - halfAngle + spin * 0.25) * bondLen;
            const h1y = pos.y + Math.sin(-Math.PI / 2 - halfAngle + spin * 0.25) * bondLen;
            const h2x = pos.x + Math.cos(-Math.PI / 2 + halfAngle + spin * 0.25) * bondLen;
            const h2y = pos.y + Math.sin(-Math.PI / 2 + halfAngle + spin * 0.25) * bondLen;

            // Covalent bond struts
            ctx.strokeStyle = '#e0f2fe';
            ctx.lineWidth = 2.2 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y); ctx.lineTo(h1x, h1y);
            ctx.moveTo(pos.x, pos.y); ctx.lineTo(h2x, h2y);
            ctx.stroke();

            // Central Oxygen (O) atom sphere
            ctx.fillStyle = '#0284c7';
            ctx.strokeStyle = '#7dd3fc';
            ctx.lineWidth = 1.4 * z;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 5.2 * z, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Two Hydrogen (H) atom spheres
            ctx.fillStyle = '#f8fafc';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.1 * z;
            ctx.beginPath(); ctx.arc(h1x, h1y, 3.2 * z, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(h2x, h2y, 3.2 * z, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

            // Molecule label
            ctx.font = `bold ${Math.round(7.5 * z)}px Inter, sans-serif`;
            ctx.fillStyle = '#e0f2fe';
            ctx.textAlign = 'center';
            ctx.fillText('H₂O', pos.x, pos.y - 9.5 * z);
            ctx.restore();
        }

        function drawWaterPumpWheel(gx, gy, gz, angle, isSpinning, rimColor = '#38bdf8') {
            const pos = isoToScreen(gx, gy, gz);
            const z = Camera.zoom;
            const r = 11.8 * z;
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
            ctx.beginPath(); ctx.arc(2 * z, 2 * z, r, 0, Math.PI * 2); ctx.fill();

            ctx.rotate(angle);
            ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2.8 * z;
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();

            ctx.strokeStyle = rimColor; ctx.lineWidth = 1.5 * z;
            ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2); ctx.stroke();

            for (let i = 0; i < 8; i++) {
                const a = (i * Math.PI) / 4;
                ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.8 * z;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                ctx.stroke();

                const bx = Math.cos(a) * (r + 1.5 * z);
                const by = Math.sin(a) * (r + 1.5 * z);
                ctx.fillStyle = isSpinning ? rimColor : '#475569';
                ctx.beginPath(); ctx.arc(bx, by, 2.6 * z, 0, Math.PI * 2); ctx.fill();
            }

            ctx.fillStyle = '#f59e0b';
            ctx.beginPath(); ctx.arc(0, 0, 3.4 * z, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        function renderCastleComplexV() {
            // Spaced at gx: 24.4..28.0, gy: 3.4..6.4
            drawIshigakiStoneBox(24.4, 3.4, 0, 3.6, 3.0, 1.35, '#64748b', '#475569', '#334155', '#0f172a', 4);
            drawIshigakiStoneBox(24.8, 3.7, 1.35, 2.8, 2.3, 0.85, '#94a3b8', '#64748b', '#475569', '#0f172a', 3);
            drawIsoBox(25.1, 4.0, 2.2, 2.2, 1.7, 1.15, '#f8fafc', '#e2e8f0', '#cbd5e1', '#475569');
            drawJapaneseRoof(24.9, 3.85, 3.35, 2.6, 2.0, 0.95, '#1e293b', '#334155', '#facc15', 'V');
            drawIsoBox(25.45, 4.3, 4.1, 1.5, 1.1, 0.85, '#f8fafc', '#e2e8f0', '#cbd5e1', '#475569');
            drawJapaneseRoof(25.3, 4.15, 4.95, 1.8, 1.4, 0.85, '#0f172a', '#1e293b', '#facc15');

            drawWaterPumpWheel(24.45, 4.95, 1.15, SimState.wheelAngle, SimState.atpRate > 0.1, '#facc15');
            drawStoneLantern(25.55, 6.55, 0.0, true);
            drawStoneLantern(26.65, 6.55, 0.0, true);

            const castleSubtitle = SimState.roninRebelling
                ? `⚠️ >60% RONIN REBELLION! (Apoptosis Cascade)`
                : (SimState.roninCount > 0
                    ? `👹 ${SimState.roninCount}/13 Ronin Prowling Outside Camp (60% Mutiny)`
                    : (SimState.ampkActive ? `🥷 AMPK Active (${SimState.ninjaInterventionsUsed}/${BioConfig.maxNinjaInterventions} Boosts)` : 'ATP Synthase • Mints Golden Koku'));
            const castleColor = SimState.roninRebelling
                ? '#f43f5e'
                : (SimState.roninCount > 0 ? '#fb7185' : (SimState.ampkActive ? '#c084fc' : '#facc15'));
            drawFloatingLabel(26.2, 3.6, 6.1, 'CASTLE OF COMPLEX V & AMPK', castleSubtitle, castleColor);
        }

        function renderSamuraiTrainingYard() {
            // Spacious Dojo Courtyard at gx: 28.0..33.1, gy: 9.2..12.6
            drawIsoBox(28.0, 9.2, 0, 5.1, 3.4, 0.14, '#785c3c', '#5c452c', '#3f2e1d', '#271c11');
            drawIsoBox(28.35, 9.50, 0.14, 4.4, 2.8, 0.01, 'rgba(254, 243, 199, 0.14)', 'transparent', 'transparent', 'rgba(253, 224, 71, 0.38)');

            // Split Northern Bamboo Fence with Open North Torii Gate at gx: 30.05..31.25 for Inbound Full-Koku Samurai
            drawBambooFenceSegment(28.1, 9.25, 30.05, 9.25, 0.14);
            drawBambooFenceSegment(31.25, 9.25, 33.0, 9.25, 0.14);
            drawBambooFenceSegment(33.0, 9.25, 33.0, 12.5, 0.14);
            drawBambooFenceSegment(28.1, 12.5, 33.0, 12.5, 0.14);

            // North Koku Entry Gate Pillars & Golden Crossbeam (gx: 30.1..31.2, gy: 9.25)
            drawIsoBox(30.08, 9.18, 0.14, 0.16, 0.16, 1.05, '#dc2626', '#991b1b', '#7f1d1d');
            drawIsoBox(31.08, 9.18, 0.14, 0.16, 0.16, 1.05, '#dc2626', '#991b1b', '#7f1d1d');
            drawIsoBox(29.95, 9.12, 1.15, 1.42, 0.26, 0.18, '#facc15', '#d97706', '#78350f');

            drawStoneLantern(28.15, 9.35, 0.14, true);
            drawStoneLantern(28.15, 12.35, 0.14, true);
            drawStoneLantern(32.85, 12.35, 0.14, true);

            const burnText = SimState.samuraiDemand < 20
                ? 'State 4 (Low Burn: Pool Locked as ATP)'
                : `ATP: ${SimState.atpCount} | ADP: ${SimState.adpCount} | AMP: ${SimState.ampCount || 0}`;
            drawFloatingLabel(30.55, 12.85, 0.0, '20-Samurai Garrison Dojo (ATP Pool)', burnText, '#34d399', 'below');
        }

        function renderOnsenSpillway() {
            const time = performance.now() * 0.001;
            const z = Camera.zoom;
            // Smoothly interpolate literal Sluice Gate lift & valve rotation
            const targetLift = SimState.sluiceOpen ? 1.0 : 0.0;
            SimState.sluiceGateLift = (SimState.sluiceGateLift || 0) + (targetLift - (SimState.sluiceGateLift || 0)) * 0.14;
            const lift = SimState.sluiceGateLift;
            if (Math.abs(targetLift - lift) > 0.01) {
                SimState.sluiceValveAngle = (SimState.sluiceValveAngle || 0) + (SimState.sluiceOpen ? 0.22 : -0.22);
            } else if (SimState.sluiceOpen) {
                SimState.sluiceValveAngle = (SimState.sluiceValveAngle || 0) + 0.02;
            }

            // 1. Stepped Stone Spillway Basin & Onsen Bath (gx: 28.85..31.5, gy: 4.15..6.4)
            drawIshigakiStoneBox(28.85, 4.15, 0, 2.65, 2.25, 0.42, '#78716c', '#57534e', '#44403c', '#1c1917', 2);
            drawIsoBox(29.10, 4.45, 0.08, 2.15, 1.75, 0.38, SimState.sluiceOpen ? '#2dd4bf' : '#0d9488', '#0f766e', '#115e59');

            // 2. Foaming Waterfall Chute pouring through the Dam Sluice when the Gate is lifted
            if (lift > 0.08 && SimState.damLevel > 2) {
                const flowH = 0.25 + lift * 1.15;
                drawIsoBox(29.22, 3.35, 0.25, 0.78, 1.25, flowH * 0.35, '#67e8f9', '#22d3ee', '#0891b2');
                // Cascading white-water foam lines on the spillway chute
                const fTop = isoToScreen(29.60, 3.45, 0.45 + lift * 0.55);
                const fBot = isoToScreen(29.60, 4.65, 0.46);
                ctx.save();
                ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
                ctx.lineWidth = (3.5 + lift * 3.0) * z;
                ctx.setLineDash([4 * z, 3 * z]);
                ctx.lineDashOffset = -time * 38 * z;
                ctx.beginPath();
                ctx.moveTo(fTop.x, fTop.y);
                ctx.lineTo(fBot.x, fBot.y);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }

            // 3. Literal Mechanical Sluice Gate Frame (Suimon) & Sliding Iron-Bound Gate Leaf in the Dam Wall
            // Left & Right Stone/Timber Sluice Gate Piers (gx: 28.88 & 30.02, gy: 3.12..3.78, z: 0..3.05)
            drawIshigakiStoneBox(28.88, 3.12, 0, 0.30, 0.65, 2.85, '#64748b', '#475569', '#1e293b', '#0f172a', 5);
            drawIshigakiStoneBox(30.02, 3.12, 0, 0.30, 0.65, 2.85, '#64748b', '#475569', '#1e293b', '#0f172a', 5);

            // Vertical Sliding Heavy Cedar & Iron Sluice Gate Leaf (lifts from z = 0.28 up to z = 1.75)
            const gateZ = 0.28 + lift * 1.42;
            const gateTopCol = SimState.sluiceOpen ? '#14b8a6' : '#b45309';
            const gateLeftCol = SimState.sluiceOpen ? '#0f766e' : '#78350f';
            const gateRightCol = '#1e293b';
            drawIsoBox(29.18, 3.26, gateZ, 0.84, 0.24, 1.38, gateTopCol, gateLeftCol, gateRightCol, '#facc15');

            // Iron cross-bracing & threaded lifting spindle connecting the gate leaf to the overhead valve
            const gateCenter = isoToScreen(29.60, 3.38, gateZ + 0.68);
            const spindleTop = isoToScreen(29.60, 3.38, 3.25);
            ctx.save();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2.4 * z;
            ctx.beginPath();
            ctx.moveTo(gateCenter.x, gateCenter.y - 6 * z);
            ctx.lineTo(spindleTop.x, spindleTop.y);
            ctx.stroke();
            ctx.restore();

            // Overhead Sluice Gatehouse Cross-Beam & Tiled Cap Roof (z = 2.85..3.35)
            drawIsoBox(28.82, 3.08, 2.85, 1.56, 0.72, 0.26, '#78350f', '#451a03', '#27272a');
            drawJapaneseRoof(28.78, 3.04, 3.11, 1.64, 0.80, 0.45, '#134e4a', '#0f766e', '#2dd4bf');

            // 4. Prominent Rotating Mechanical Valve Handwheel atop the Sluice Gatehouse
            const valvePos = isoToScreen(29.60, 3.42, 3.68);
            const vRad = 7.8 * z;
            const vAng = SimState.sluiceValveAngle || 0;
            ctx.save();
            ctx.translate(valvePos.x, valvePos.y);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
            ctx.beginPath(); ctx.arc(1.5 * z, 1.5 * z, vRad, 0, Math.PI * 2); ctx.fill();
            ctx.rotate(vAng);
            ctx.strokeStyle = SimState.sluiceOpen ? '#2dd4bf' : '#ef4444';
            ctx.lineWidth = 2.6 * z;
            ctx.beginPath(); ctx.arc(0, 0, vRad, 0, Math.PI * 2); ctx.stroke();
            for (let s = 0; s < 6; s++) {
                const a = (s * Math.PI) / 3;
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 1.6 * z;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a) * vRad, Math.sin(a) * vRad);
                ctx.stroke();
            }
            ctx.fillStyle = '#facc15';
            ctx.beginPath(); ctx.arc(0, 0, 2.6 * z, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            drawStoneLantern(31.35, 4.45, 0.42, SimState.sluiceOpen);
            drawFloatingLabel(30.25, 5.2, 2.45, 'Onsen Sluice Gate & Valve (UCP1)', SimState.sluiceOpen ? '🔓 VALVE OPEN: Venting Heat Steam!' : '🔒 VALVE CLOSED (Dam Sealed)', SimState.sluiceOpen ? '#2dd4bf' : '#cbd5e1');
        }

        /***********************************************************************
         * 9. HIGH-DETAIL FEUDAL JAPANESE CHARACTER ART ENGINE
         ***********************************************************************/
        function drawMtorMonk(m) {
            const pos = isoToScreen(m.gx, m.gy, 0.24);
            const z = Camera.zoom;
            const phase = m.walkPhase || 0;
            const isWorking = !m.returning && (m.workTimer || 0) > 0;
            const workPhase = (m.workTimer || 0) * 6.5;
            const stride = isWorking ? 0 : Math.sin(phase) * 2.8 * z;
            const kneeLiftL = isWorking ? 0 : Math.max(0, -Math.cos(phase)) * 1.6 * z;
            const kneeLiftR = isWorking ? 0 : Math.max(0, Math.cos(phase)) * 1.6 * z;
            const bob = isWorking
                ? Math.sin(workPhase) * 1.1 * z
                : Math.abs(Math.cos(phase)) * 1.15 * z;
            const robeSway = isWorking
                ? Math.sin(workPhase * 0.8) * 1.2 * z
                : Math.sin(phase) * 1.6 * z;
            ctx.save();

            // Golden anabolic ground aura & cast shadow (pulses warmly when chanting/working at target)
            const auraPulse = isWorking ? (1 + 0.25 * Math.sin(workPhase * 1.5)) : 1.0;
            ctx.fillStyle = isWorking ? 'rgba(250, 204, 21, 0.34)' : 'rgba(245, 158, 11, 0.24)';
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2 * z, 9.2 * z * auraPulse, 4.4 * z * auraPulse, 0, 0, Math.PI * 2); ctx.fill();

            // Articulated 2-jointed legs (hip -> knee -> ankle) in white Tabi socks & Waraji straw sandals
            ctx.strokeStyle = '#fef3c7'; ctx.lineWidth = 2.3 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 1.8 * z, pos.y - 6.8 * z - bob);
            ctx.lineTo(pos.x - 1.9 * z - stride * 0.55, pos.y - 2.6 * z - kneeLiftL);
            ctx.lineTo(pos.x - 2.0 * z - stride, pos.y + 1.2 * z - kneeLiftL * 0.4);
            ctx.moveTo(pos.x + 1.8 * z, pos.y - 6.8 * z - bob);
            ctx.lineTo(pos.x + 1.9 * z + stride * 0.55, pos.y - 2.6 * z - kneeLiftR);
            ctx.lineTo(pos.x + 2.0 * z + stride, pos.y + 1.2 * z - kneeLiftR * 0.4);
            ctx.stroke();

            // Layered Saffron Koromo inner robe & Ochre outer folds with smooth hem sway
            ctx.fillStyle = '#b45309'; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.1 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 5.2 * z, pos.y - 16.5 * z - bob);
            ctx.quadraticCurveTo(pos.x - 6.2 * z + robeSway * 0.4, pos.y - 10.5 * z - bob, pos.x - 6.8 * z + robeSway, pos.y - 5.0 * z - bob);
            ctx.lineTo(pos.x + 6.8 * z + robeSway, pos.y - 5.0 * z - bob);
            ctx.quadraticCurveTo(pos.x + 6.2 * z + robeSway * 0.4, pos.y - 10.5 * z - bob, pos.x + 5.2 * z, pos.y - 16.5 * z - bob);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Crimson & Gold Brocade Kesa Sash draped diagonally across chest
            ctx.fillStyle = '#991b1b'; ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.1 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 4.8 * z, pos.y - 16.0 * z - bob);
            ctx.lineTo(pos.x + 1.5 * z, pos.y - 16.0 * z - bob);
            ctx.lineTo(pos.x + 5.5 * z + robeSway * 0.5, pos.y - 6.5 * z - bob);
            ctx.lineTo(pos.x - 1.0 * z + robeSway * 0.5, pos.y - 6.5 * z - bob);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Articulated Koromo sleeves & prayer/staff hands
            const armBob = isWorking ? Math.sin(workPhase * 1.4) * 2.2 * z : -stride * 0.45;
            ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2.6 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 4.8 * z, pos.y - 14.5 * z - bob);
            ctx.lineTo(pos.x - 6.5 * z, pos.y - 11.0 * z - bob + armBob);
            ctx.moveTo(pos.x + 4.8 * z, pos.y - 14.5 * z - bob);
            ctx.lineTo(pos.x + (isWorking ? 3.2 : 6.2) * z, pos.y - (isWorking ? 13.5 : 11.0) * z - bob - armBob);
            ctx.stroke();

            // Juzu prayer beads around collar
            ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.3 * z;
            ctx.setLineDash([1.6 * z, 1.4 * z]);
            ctx.beginPath(); ctx.arc(pos.x, pos.y - 15.8 * z - bob, 3.6 * z, 0.2, Math.PI - 0.2); ctx.stroke();
            ctx.setLineDash([]);

            // Shaved Monk Head with warm highlight & serene brow
            ctx.fillStyle = '#fed7aa'; ctx.strokeStyle = '#c2410c'; ctx.lineWidth = 0.8 * z;
            ctx.beginPath(); ctx.arc(pos.x, pos.y - 20.2 * z - bob, 4.0 * z, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.beginPath(); ctx.arc(pos.x - 1.2 * z, pos.y - 21.8 * z - bob, 1.4 * z, 0, Math.PI * 2); ctx.fill();

            // Monk Shakujo (ringed pewter staff) in left hand — rings chime & pulse during work ritual
            const staffX = pos.x - 6.5 * z;
            const staffLift = isWorking ? Math.abs(Math.sin(workPhase * 1.4)) * 2.8 * z : Math.max(0, - Math.sin(phase)) * 1.2 * z;
            ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.6 * z;
            ctx.beginPath(); ctx.moveTo(staffX, pos.y + 1 * z - staffLift); ctx.lineTo(staffX, pos.y - 23 * z - bob - staffLift); ctx.stroke();
            ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.3 * z;
            ctx.beginPath(); ctx.arc(staffX, pos.y - 24.8 * z - bob - staffLift, 2.4 * z, 0, Math.PI * 2); ctx.stroke();
            if (isWorking) {
                ctx.strokeStyle = `rgba(254, 240, 138, ${0.45 + 0.4 * Math.sin(workPhase * 2)})`;
                ctx.lineWidth = 1.2 * z;
                ctx.beginPath(); ctx.arc(staffX, pos.y - 24.8 * z - bob - staffLift, (4.2 + Math.sin(workPhase * 2) * 1.6) * z, 0, Math.PI * 2); ctx.stroke();
            }

            if (m.carryingKoku) {
                drawTawaraBale(pos.x + 7.2 * z, pos.y - 13.0 * z - bob, 0.74, 0.1, true);
            }

            if (SimState.showLabels) {
                ctx.font = `bold ${Math.round(8 * z)}px Inter, sans-serif`;
                ctx.fillStyle = '#fde047'; ctx.textAlign = 'center';
                const monkLbl = m.task === 'repairEtc' ? '🧘 mTOR (Biogenesis!)' : (m.task === 'sealKetones' ? '🧘‍♂️ mTOR (Seal)' : '🧘‍♂️ mTOR (+Build)');
                ctx.fillText(monkLbl, pos.x, pos.y - 27.5 * z - bob);
            }
            ctx.restore();
        }

        function drawOrdainingMonk(om) {
            if (!om) return;
            const pos = isoToScreen(om.gx, om.gy, 0.24);
            const z = Camera.zoom;
            const isBathing = om.phase === 'bathing';
            const bathT = isBathing ? Math.max(0, Math.min(1, (om.timer || 0) / 2.8)) : 0;
            const phase = om.walkPhase || 0;
            const stride = isBathing ? 0 : Math.sin(phase) * 2.8 * z;
            const kneeLiftL = isBathing ? 0 : Math.max(0, -Math.cos(phase)) * 1.5 * z;
            const kneeLiftR = isBathing ? 0 : Math.max(0, Math.cos(phase)) * 1.5 * z;
            const bob = isBathing ? Math.sin(bathT * Math.PI * 4) * 1.1 * z : Math.abs(Math.sin(phase)) * 1.1 * z;
            const bathSinkY = isBathing ? Math.sin(Math.min(1, bathT * 1.25) * Math.PI) * 5.0 * z : 0;

            ctx.save();
            // Ground shadow & ceremony halo
            ctx.fillStyle = 'rgba(0,0,0,0.34)';
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 1.8 * z, 7.5 * z, 3.3 * z, 0, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = isBathing ? `rgba(56, 189, 248, ${0.22 + 0.16 * Math.sin(bathT * 8)})` : 'rgba(250, 204, 21, 0.22)';
            ctx.strokeStyle = isBathing ? '#38bdf8' : '#fbbf24';
            ctx.lineWidth = 1.6 * z;
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y + 1.5 * z, (11 + bathT * 9) * z, (5.2 + bathT * 4.2) * z, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (!isBathing) {
                // Articulated 2-jointed Tabi legs + Waraji straw sandals (matching drawMtorMonk)
                ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.9 * z; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(pos.x - 1.8 * z, pos.y - 5.5 * z);
                ctx.lineTo(pos.x - 1.9 * z - stride * 0.55, pos.y - 2.6 * z - kneeLiftL);
                ctx.lineTo(pos.x - 2.0 * z - stride, pos.y + 1.2 * z - kneeLiftL * 0.4);
                ctx.moveTo(pos.x + 1.8 * z, pos.y - 5.5 * z);
                ctx.lineTo(pos.x + 1.9 * z + stride * 0.55, pos.y - 2.6 * z - kneeLiftR);
                ctx.lineTo(pos.x + 2.0 * z + stride, pos.y + 1.2 * z - kneeLiftR * 0.4);
                ctx.stroke();
                ctx.fillStyle = '#d97706';
                ctx.beginPath(); ctx.ellipse(pos.x - 2.0 * z - stride, pos.y + 1.4 * z - kneeLiftL * 0.4, 1.8 * z, 0.9 * z, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(pos.x + 2.0 * z + stride, pos.y + 1.4 * z - kneeLiftR * 0.4, 1.8 * z, 0.9 * z, 0, 0, Math.PI * 2); ctx.fill();
            }

            const drawY = pos.y + bathSinkY;
            const emerged = isBathing && bathT >= 0.45;

            if (isBathing) {
                // Concentric turquoise & gold Onsen water ripples
                for (let rp = 0; rp < 2; rp++) {
                    const rt = (bathT * 2.2 + rp * 0.5) % 1;
                    ctx.strokeStyle = rp === 0 ? `rgba(56, 189, 248, ${(1 - rt) * 0.7})` : `rgba(250, 204, 21, ${(1 - rt) * 0.55})`;
                    ctx.lineWidth = 1.3 * z;
                    ctx.beginPath();
                    ctx.ellipse(pos.x, pos.y + 1.5 * z, (8 + rt * 16) * z, (3.8 + rt * 7.2) * z, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Discarded folded Koromo robes & Shakujo staff resting on the Onsen bank
                if (bathT >= 0.22) {
                    const rx = pos.x - 13.5 * z, ry = pos.y + 3.8 * z;
                    ctx.fillStyle = '#f59e0b'; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 0.9 * z;
                    ctx.beginPath(); ctx.ellipse(rx, ry, 5.2 * z, 2.6 * z, -0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.strokeStyle = '#991b1b'; ctx.lineWidth = 1.6 * z;
                    ctx.beginPath(); ctx.moveTo(rx - 3.0 * z, ry - 0.8 * z); ctx.lineTo(rx + 3.2 * z, ry + 0.9 * z); ctx.stroke();
                    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.2 * z;
                    ctx.beginPath(); ctx.moveTo(rx - 5.5 * z, ry + 1.6 * z); ctx.lineTo(rx + 6.5 * z, ry - 2.4 * z); ctx.stroke();
                    ctx.strokeStyle = '#fde047'; ctx.lineWidth = 0.9 * z;
                    ctx.beginPath(); ctx.arc(rx + 7.2 * z, ry - 2.6 * z, 1.5 * z, 0, Math.PI * 2); ctx.stroke();
                }
            }

            if (!emerged) {
                // Multi-layered Zen Monk Koromo Robes + Shaded Sleeves + Dark Bronze Hem Trim + Crimson Kesa Sash + Juzu Beads + Shakujo Staff
                const hemSway = Math.sin(phase) * 1.1 * z;
                ctx.fillStyle = '#d97706';
                ctx.beginPath(); ctx.ellipse(pos.x - 4.8 * z, drawY - 12.2 * z - bob, 2.2 * z, 3.6 * z, 0.25, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(pos.x + 4.8 * z, drawY - 12.2 * z - bob, 2.2 * z, 3.6 * z, -0.25, 0, Math.PI * 2); ctx.fill();

                ctx.fillStyle = '#f59e0b'; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.1 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 4.4 * z, drawY - 16.5 * z - bob);
                ctx.lineTo(pos.x + 4.4 * z, drawY - 16.5 * z - bob);
                ctx.lineTo(pos.x + 5.9 * z + hemSway, drawY - 3.6 * z - bob * 0.4);
                ctx.lineTo(pos.x - 5.9 * z + hemSway, drawY - 3.6 * z - bob * 0.4);
                ctx.closePath(); ctx.fill(); ctx.stroke();

                ctx.strokeStyle = '#451a03'; ctx.lineWidth = 1.3 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 5.6 * z + hemSway, drawY - 4.4 * z - bob * 0.4);
                ctx.lineTo(pos.x + 5.6 * z + hemSway, drawY - 4.4 * z - bob * 0.4);
                ctx.stroke();

                ctx.strokeStyle = '#991b1b'; ctx.lineWidth = 2.0 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 3.6 * z, drawY - 15.8 * z - bob);
                ctx.lineTo(pos.x + 4.2 * z, drawY - 7.8 * z - bob * 0.5);
                ctx.stroke();

                // Juzu wooden prayer beads
                ctx.fillStyle = '#78350f';
                for (let jb = -2; jb <= 2; jb++) {
                    ctx.beginPath(); ctx.arc(pos.x + jb * 1.4 * z, drawY - 13.5 * z - bob + Math.abs(jb) * 0.4 * z, 0.75 * z, 0, Math.PI * 2); ctx.fill();
                }

                // Shakujo ringed bronze staff with 3 jingle rings
                ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.4 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x + 6.2 * z, drawY - 21 * z - bob);
                ctx.lineTo(pos.x + 6.2 * z, drawY + 0.5 * z);
                ctx.stroke();
                ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.0 * z;
                ctx.beginPath(); ctx.arc(pos.x + 6.2 * z, drawY - 21.8 * z - bob, 2.2 * z, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.arc(pos.x + 5.0 * z, drawY - 21.6 * z - bob, 0.9 * z, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.arc(pos.x + 7.4 * z, drawY - 21.6 * z - bob, 0.9 * z, 0, Math.PI * 2); ctx.stroke();
            } else {
                // Emerging Articulated Samurai (matching drawSamuraiRetainer + Sashimono back-banner)
                const bannerFlutter = Math.sin(bathT * 18) * 1.1 * z;
                ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.3 * z;
                ctx.beginPath(); ctx.moveTo(pos.x - 4.2 * z, drawY - 14 * z - bob); ctx.lineTo(pos.x - 4.2 * z, drawY - 30.0 * z - bob); ctx.stroke();
                ctx.fillStyle = '#059669'; ctx.strokeStyle = '#fde047'; ctx.lineWidth = 0.9 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 4.2 * z, drawY - 29.5 * z - bob);
                ctx.lineTo(pos.x - 10.2 * z + bannerFlutter * 0.3, drawY - 28.0 * z - bob);
                ctx.lineTo(pos.x - 10.2 * z + bannerFlutter * 0.5, drawY - 19.5 * z - bob);
                ctx.lineTo(pos.x - 4.2 * z, drawY - 20.0 * z - bob);
                ctx.closePath(); ctx.fill(); ctx.stroke();

                ctx.fillStyle = '#064e3b'; ctx.strokeStyle = '#34d399'; ctx.lineWidth = 1.0 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 4.8 * z, drawY - 9.2 * z - bob);
                ctx.lineTo(pos.x + 4.8 * z, drawY - 9.2 * z - bob);
                ctx.lineTo(pos.x + 6.2 * z, drawY - 3.4 * z - bob * 0.5);
                ctx.lineTo(pos.x - 6.2 * z, drawY - 3.4 * z - bob * 0.5);
                ctx.closePath(); ctx.fill(); ctx.stroke();

                // Tiered Kusazuri tassets
                ctx.strokeStyle = '#047857'; ctx.lineWidth = 0.9 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 5.2 * z, drawY - 6.4 * z - bob * 0.6); ctx.lineTo(pos.x + 5.2 * z, drawY - 6.4 * z - bob * 0.6);
                ctx.stroke();

                // O-yoroi chestplate + gold lacing
                ctx.fillStyle = '#059669'; ctx.strokeStyle = '#6ee7b7'; ctx.lineWidth = 1.1 * z;
                ctx.beginPath(); ctx.roundRect(pos.x - 4.8 * z, drawY - 16.8 * z - bob, 9.6 * z, 8.4 * z, 1.5 * z); ctx.fill(); ctx.stroke();
                ctx.strokeStyle = '#fde047'; ctx.lineWidth = 0.8 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 3.0 * z, drawY - 14.2 * z - bob); ctx.lineTo(pos.x + 3.0 * z, drawY - 14.2 * z - bob);
                ctx.moveTo(pos.x - 3.0 * z, drawY - 11.6 * z - bob); ctx.lineTo(pos.x + 3.0 * z, drawY - 11.6 * z - bob);
                ctx.stroke();

                // Shoulder Sode plates
                ctx.fillStyle = '#047857'; ctx.strokeStyle = '#6ee7b7'; ctx.lineWidth = 0.9 * z;
                ctx.fillRect(pos.x - 7.0 * z, drawY - 16.2 * z - bob, 2.4 * z, 4.6 * z);
                ctx.fillRect(pos.x + 4.6 * z, drawY - 16.2 * z - bob, 2.4 * z, 4.6 * z);
                // Katana blade
                ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.7 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x + 5.0 * z, drawY - 12.0 * z - bob);
                ctx.lineTo(pos.x + 12.4 * z, drawY - 21.4 * z - bob);
                ctx.stroke();
            }

            // Head (+ closed meditative eyes / halo or Samurai Kabuto helmet with Maedate crest)
            ctx.fillStyle = '#fde68a';
            ctx.beginPath(); ctx.arc(pos.x, drawY - 19.8 * z - bob, 3.6 * z, 0, Math.PI * 2); ctx.fill();
            if (!emerged) {
                // Meditative closed eyes + golden halo
                ctx.strokeStyle = '#78350f'; ctx.lineWidth = 0.8 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 1.8 * z, drawY - 19.8 * z - bob); ctx.lineTo(pos.x - 0.6 * z, drawY - 19.6 * z - bob);
                ctx.moveTo(pos.x + 0.6 * z, drawY - 19.6 * z - bob); ctx.lineTo(pos.x + 1.8 * z, drawY - 19.8 * z - bob);
                ctx.stroke();
                ctx.strokeStyle = 'rgba(253, 224, 71, 0.78)'; ctx.lineWidth = 1.1 * z;
                ctx.beginPath(); ctx.arc(pos.x, drawY - 19.8 * z - bob, 5.5 * z, 0, Math.PI * 2); ctx.stroke();
            } else {
                ctx.fillStyle = '#064e3b'; ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.2 * z;
                ctx.beginPath(); ctx.arc(pos.x, drawY - 20.6 * z - bob, 4.7 * z, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.5 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 3.4 * z, drawY - 25.2 * z - bob);
                ctx.lineTo(pos.x, drawY - 22.8 * z - bob);
                ctx.lineTo(pos.x + 3.4 * z, drawY - 25.2 * z - bob);
                ctx.stroke();
            }

            // Swirling Onsen steam plumes & golden-emerald metamorphosis flash
            if (isBathing) {
                for (let s = 0; s < 3; s++) {
                    const stPhase = (bathT * 1.8 + s * 0.33) % 1;
                    const sx = pos.x + Math.sin(stPhase * 6.28 + s * 2.1) * 7.5 * z;
                    const sy = pos.y - (6 + stPhase * 24) * z;
                    const sr = (6 + stPhase * 8) * z;
                    const sg = ctx.createRadialGradient(sx, sy, 1 * z, sx, sy, sr);
                    sg.addColorStop(0, 'rgba(240, 249, 255, 0.55)');
                    sg.addColorStop(1, 'rgba(240, 249, 255, 0)');
                    ctx.globalAlpha = Math.sin(stPhase * Math.PI) * 0.85;
                    ctx.fillStyle = sg;
                    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
                }
                if (bathT > 0.36 && bathT < 0.62) {
                    const flashFrac = 1 - Math.abs(bathT - 0.47) / 0.15;
                    if (flashFrac > 0) {
                        const fg = ctx.createRadialGradient(pos.x, drawY - 12 * z, 1 * z, pos.x, drawY - 12 * z, 26 * z * flashFrac);
                        fg.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
                        fg.addColorStop(0.5, 'rgba(52, 211, 153, 0.65)');
                        fg.addColorStop(1, 'rgba(52, 211, 153, 0)');
                        ctx.globalAlpha = flashFrac;
                        ctx.fillStyle = fg;
                        ctx.beginPath(); ctx.arc(pos.x, drawY - 12 * z, 26 * z * flashFrac, 0, Math.PI * 2); ctx.fill();
                    }
                }
                ctx.globalAlpha = 1;
            }

            // Thrown saffron Monk robes flying off onto the Onsen bank
            if (isBathing && bathT < 0.85) {
                ctx.save();
                ctx.globalAlpha = Math.max(0, 1 - bathT / 0.85);
                const rx = pos.x - bathT * 22 * z;
                const ry = pos.y - 10 * z - Math.sin(Math.min(1, bathT * 1.4) * Math.PI) * 16 * z;
                ctx.translate(rx, ry);
                ctx.rotate(-bathT * 2.6);
                ctx.fillStyle = '#f59e0b'; ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 1.1 * z;
                ctx.beginPath();
                ctx.moveTo(-5 * z, -5 * z); ctx.lineTo(5 * z, -4 * z);
                ctx.lineTo(7 * z, 6 * z); ctx.lineTo(-6 * z, 5 * z);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.restore();
            }

            // Ceremony progress bar + clear label
            const prog = isBathing ? bathT : Math.max(0, Math.min(1, 1 - Math.hypot(om.tx - om.gx, om.ty - om.gy) / 5.5));
            const bw = 26 * z, bh = 3.5 * z;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(pos.x - bw / 2, pos.y - 31 * z - bob, bw, bh);
            ctx.fillStyle = isBathing ? '#34d399' : '#fbbf24';
            ctx.fillRect(pos.x - bw / 2, pos.y - 31 * z - bob, bw * prog, bh);
            ctx.font = `bold ${Math.round(8.2 * z)}px Inter, sans-serif`;
            ctx.fillStyle = isBathing ? '#6ee7b7' : '#fde047';
            ctx.textAlign = 'center';
            ctx.fillText(isBathing ? (emerged ? '⚔️ Emerging as Samurai!' : '♨️ Onsen Robe Changeover...') : '🧘 Zen Monk → Onsen!', pos.x, pos.y - 34.5 * z - bob);
            ctx.restore();
        }

        function drawAmpkNinja(n) {
            const pos = isoToScreen(n.gx, n.gy, 0.24);
            const z = Camera.zoom;
            const phase = n.walkPhase || 0;
            const isWorking = (!n.returning && (n.workTimer || 0) > 0) || !!n.rebelling;
            const workPhase = (n.workTimer || 0) * 10.5;
            const stride = isWorking ? Math.sin(workPhase * 0.5) * 2.2 * z : Math.sin(phase) * 4.4 * z;
            const kneeLiftL = isWorking ? 0 : Math.max(0, -Math.cos(phase)) * 2.4 * z;
            const kneeLiftR = isWorking ? 0 : Math.max(0, Math.cos(phase)) * 2.4 * z;
            const bob = isWorking
                ? Math.abs(Math.sin(workPhase)) * 1.6 * z
                : Math.abs(Math.cos(phase)) * 1.8 * z;
            const lean = isWorking ? Math.sin(workPhase) * 1.5 * z : 1.4 * z;
            ctx.save();

            // Shadow & violet AMPK energy ring (crimson-rose when joining Starvation Rebellion!)
            ctx.fillStyle = n.rebelling
                ? 'rgba(244, 63, 94, 0.42)'
                : (isWorking ? 'rgba(192, 132, 252, 0.36)' : 'rgba(168, 85, 247, 0.25)');
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2 * z, 8.5 * z, 4.0 * z, 0, 0, Math.PI * 2); ctx.fill();

            // Articulated 2-segment Kyahan shin-wrapped legs (hip -> knee -> ankle)
            ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 2.4 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 1.6 * z, pos.y - 6.8 * z - bob);
            ctx.lineTo(pos.x - 1.9 * z - stride * 0.5, pos.y - 2.8 * z - kneeLiftL);
            ctx.lineTo(pos.x - 2.3 * z - stride, pos.y + 1.2 * z - kneeLiftL * 0.35);
            ctx.moveTo(pos.x + 1.6 * z, pos.y - 6.8 * z - bob);
            ctx.lineTo(pos.x + 1.9 * z + stride * 0.5, pos.y - 2.8 * z - kneeLiftR);
            ctx.lineTo(pos.x + 2.3 * z + stride, pos.y + 1.2 * z - kneeLiftR * 0.35);
            ctx.stroke();
            // Crisscross violet shin bindings
            ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.0 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 2.1 * z - stride * 0.75, pos.y - 1.8 * z - kneeLiftL * 0.35);
            ctx.lineTo(pos.x - 1.4 * z - stride * 0.5, pos.y - 3.4 * z - kneeLiftL * 0.6);
            ctx.moveTo(pos.x + 2.1 * z + stride * 0.75, pos.y - 1.8 * z - kneeLiftR * 0.35);
            ctx.lineTo(pos.x + 1.4 * z + stride * 0.5, pos.y - 3.4 * z - kneeLiftR * 0.6);
            ctx.stroke();

            // Dual Ninjato scabbards crossed on back
            ctx.strokeStyle = '#334155'; ctx.lineWidth = 2.0 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 6 * z, pos.y - 8 * z - bob); ctx.lineTo(pos.x + 5.5 * z, pos.y - 24 * z - bob);
            ctx.stroke();
            ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.2 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x + 4.2 * z, pos.y - 22 * z - bob); ctx.lineTo(pos.x + 6.0 * z, pos.y - 24.5 * z - bob);
            ctx.stroke();

            // Shinobi Shozoku torso with Kusari chainmail diamond chest panel
            ctx.fillStyle = '#090d16'; ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.2 * z;
            ctx.beginPath(); ctx.roundRect(pos.x - 5.2 * z + lean * 0.25, pos.y - 16.5 * z - bob, 10.4 * z, 10.0 * z, 2.5 * z); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.moveTo(pos.x + lean * 0.25, pos.y - 15.5 * z - bob);
            ctx.lineTo(pos.x + 3.2 * z + lean * 0.25, pos.y - 11.5 * z - bob);
            ctx.lineTo(pos.x + lean * 0.25, pos.y - 8.0 * z - bob);
            ctx.lineTo(pos.x - 3.2 * z + lean * 0.25, pos.y - 11.5 * z - bob);
            ctx.closePath(); ctx.fill();

            // Articulated pumping Shinobi arms & active Ninjato / Kunai strike when working at target landmark
            const armSwing = isWorking ? Math.sin(workPhase * 1.4) * 4.5 * z : -stride * 0.65;
            ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 2.2 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 4.6 * z, pos.y - 14.5 * z - bob);
            ctx.lineTo(pos.x - 6.8 * z - armSwing * 0.5, pos.y - 10.2 * z - bob + armSwing * 0.35);
            ctx.moveTo(pos.x + 4.6 * z, pos.y - 14.5 * z - bob);
            ctx.lineTo(pos.x + 6.8 * z + armSwing * 0.6, pos.y - 11.2 * z - bob - armSwing * 0.45);
            ctx.stroke();

            if (isWorking) {
                // Gleaming cyan-violet Ninjato / Kunai blade arc while executing AMPK intervention at target!
                const slashAng = -0.6 + Math.sin(workPhase * 1.6) * 1.1;
                ctx.save();
                ctx.translate(pos.x + 6.2 * z, pos.y - 12.2 * z - bob);
                ctx.rotate(slashAng);
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
                ctx.lineWidth = 3.2 * z;
                ctx.beginPath(); ctx.arc(0, 0, 12.5 * z, -1.0, 0.5); ctx.stroke();
                ctx.strokeStyle = '#e0f2fe';
                ctx.lineWidth = 2.2 * z;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(13.5 * z, -6.5 * z); ctx.stroke();
                ctx.restore();
            }

            // Zukin Hood & glowing cyan eyes (crimson when rebelling!)
            ctx.fillStyle = '#0f172a'; ctx.strokeStyle = n.rebelling ? '#f43f5e' : '#7e22ce'; ctx.lineWidth = 1.0 * z;
            ctx.beginPath(); ctx.arc(pos.x + 0.8 * z + lean * 0.3, pos.y - 19.8 * z - bob, 4.0 * z, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = n.rebelling ? '#f43f5e' : '#38bdf8';
            ctx.fillRect(pos.x - 1.5 * z + lean * 0.3, pos.y - 20.6 * z - bob, 4.8 * z, 1.6 * z);

            // Multi-node sinusoidal billowing Violet Scarf (crimson-rose when rebelling)
            const w1 = Math.sin(phase * 1.4 + (isWorking ? workPhase : 0)) * 3.2 * z;
            const w2 = Math.cos(phase * 1.4 + (isWorking ? workPhase : 0)) * 4.2 * z;
            ctx.strokeStyle = n.rebelling ? '#fb7185' : '#c084fc'; ctx.lineWidth = 2.4 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 2 * z, pos.y - 19.5 * z - bob);
            ctx.bezierCurveTo(
                pos.x - 7.5 * z, pos.y - 22.5 * z + w1,
                pos.x - 12.5 * z, pos.y - 17.0 * z - w1,
                pos.x - 17.5 * z, pos.y - 19.5 * z + w2
            );
            ctx.stroke();

            if (SimState.showLabels) {
                ctx.font = `bold ${Math.round(8 * z)}px Inter, sans-serif`;
                ctx.fillStyle = n.rebelling ? '#fda4af' : '#e9d5ff'; ctx.textAlign = 'center';
                const ninjaLbl = n.rebelling
                    ? '🥷⚡ NINJA MUTINY!'
                    : (n.targetType === 'mitophagy'
                        ? '🥷 AMPK (Mitophagy!)'
                        : (n.targetType === 'autophagy'
                            ? '🥷 AMPK (Autophagy!)'
                            : (n.targetType === 'glut4' ? '🥷 AMPK (Unlock GLUT4!)' : `🥷 AMPK (+${BioConfig.ninjaBoostAmount}%)`)));
                ctx.fillText(ninjaLbl, pos.x, pos.y - 26.5 * z - bob);
            }
            ctx.restore();
        }

        function drawPruningEvent(pe) {
            if (!pe) return;
            const pos = isoToScreen(pe.gx, pe.gy, 0.22);
            const z = Camera.zoom;
            const isSmoke = pe.phase === 'smokeBomb';
            const smokeT = isSmoke ? Math.max(0, Math.min(1, (pe.timer || 0) / 1.8)) : 0;
            const phase = pe.walkPhase || 0;
            const stride = isSmoke ? 0 : Math.sin(phase) * 4.2 * z;
            const kneeLiftL = isSmoke ? 0 : Math.max(0, -Math.cos(phase)) * 2.0 * z;
            const kneeLiftR = isSmoke ? 0 : Math.max(0, Math.cos(phase)) * 2.0 * z;
            const bob = isSmoke ? 0 : Math.abs(Math.sin(phase)) * 1.4 * z;

            ctx.save();
            if (!isSmoke || smokeT < 0.30) {
                const nx = pos.x + 12.5 * z, ny = pos.y - 3 * z;
                // Ground shadows
                ctx.fillStyle = 'rgba(0,0,0,0.34)';
                ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 1.8 * z, 7.2 * z, 3.2 * z, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(nx, ny + 1.8 * z, 7.2 * z, 3.2 * z, 0, 0, Math.PI * 2); ctx.fill();

                // Taut glowing violet binding rope from Ninja to Samurai
                ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.6 * z;
                ctx.beginPath(); ctx.moveTo(nx - 3.5 * z, ny - 8.5 * z - bob); ctx.lineTo(pos.x + 3.5 * z, pos.y - 9.5 * z - bob); ctx.stroke();

                // Dragged Samurai (full O-yoroi, Suneate greaves, Sashimono banner, Sode, Kabuto with Kuwagata crescent horns)
                const liv = pe.livery || SamuraiLiveries[0];
                ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2.0 * z; ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(pos.x - 2.0 * z, pos.y - 5.2 * z);
                ctx.lineTo(pos.x - 2.2 * z + stride * 0.55, pos.y - 2.2 * z - kneeLiftR * 0.6);
                ctx.lineTo(pos.x - 2.5 * z + stride * 0.8, pos.y + 1.2 * z);
                ctx.moveTo(pos.x + 2.0 * z, pos.y - 5.2 * z);
                ctx.lineTo(pos.x + 2.2 * z - stride * 0.55, pos.y - 2.2 * z - kneeLiftL * 0.6);
                ctx.lineTo(pos.x + 2.5 * z - stride * 0.8, pos.y + 1.2 * z);
                ctx.stroke();

                // Suneate armored shin-guards
                ctx.strokeStyle = liv.crest; ctx.lineWidth = 1.2 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 2.2 * z + stride * 0.55, pos.y - 2.2 * z - kneeLiftR * 0.6);
                ctx.lineTo(pos.x - 2.5 * z + stride * 0.8, pos.y + 0.9 * z);
                ctx.moveTo(pos.x + 2.2 * z - stride * 0.55, pos.y - 2.2 * z - kneeLiftL * 0.6);
                ctx.lineTo(pos.x + 2.5 * z - stride * 0.8, pos.y + 0.9 * z);
                ctx.stroke();

                // Clan Sashimono back-banner
                ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.3 * z;
                ctx.beginPath(); ctx.moveTo(pos.x - 4.0 * z, pos.y - 14 * z - bob); ctx.lineTo(pos.x - 4.0 * z, pos.y - 29.5 * z - bob); ctx.stroke();
                ctx.fillStyle = liv.do; ctx.strokeStyle = liv.crest; ctx.lineWidth = 0.85 * z;
                ctx.fillRect(pos.x - 9.8 * z, pos.y - 29.0 * z - bob, 5.8 * z, 8.8 * z);
                ctx.strokeRect(pos.x - 9.8 * z, pos.y - 29.0 * z - bob, 5.8 * z, 8.8 * z);

                // Pleated Hakama
                ctx.fillStyle = liv.hakama; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 0.85 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 4.6 * z, pos.y - 8.8 * z - bob);
                ctx.lineTo(pos.x + 4.6 * z, pos.y - 8.8 * z - bob);
                ctx.lineTo(pos.x + 5.8 * z, pos.y - 2.8 * z - bob * 0.4);
                ctx.lineTo(pos.x - 5.8 * z, pos.y - 2.8 * z - bob * 0.4);
                ctx.closePath(); ctx.fill(); ctx.stroke();

                // Do-maru Cuirass & Sode shoulder plates
                ctx.fillStyle = liv.do; ctx.strokeStyle = liv.crest; ctx.lineWidth = 1.1 * z;
                ctx.beginPath(); ctx.roundRect(pos.x - 5.2 * z, pos.y - 16.8 * z - bob, 10.4 * z, 8.8 * z, 1.8 * z); ctx.fill(); ctx.stroke();
                ctx.fillStyle = liv.sode; ctx.strokeStyle = liv.crest; ctx.lineWidth = 0.85 * z;
                ctx.fillRect(pos.x - 7.2 * z, pos.y - 16.4 * z - bob, 2.3 * z, 5.2 * z);
                ctx.strokeRect(pos.x - 7.2 * z, pos.y - 16.4 * z - bob, 2.3 * z, 5.2 * z);
                ctx.fillRect(pos.x + 4.9 * z, pos.y - 16.4 * z - bob, 2.3 * z, 5.2 * z);
                ctx.strokeRect(pos.x + 4.9 * z, pos.y - 16.4 * z - bob, 2.3 * z, 5.2 * z);

                // Face & Kabuto Helmet with Kuwagata crescent horns
                ctx.fillStyle = '#fde68a';
                ctx.beginPath(); ctx.arc(pos.x, pos.y - 19.6 * z - bob, 3.4 * z, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0f172a'; ctx.strokeStyle = liv.crest; ctx.lineWidth = 1.0 * z;
                ctx.beginPath(); ctx.arc(pos.x, pos.y - 20.2 * z - bob, 4.4 * z, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.3 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 0.8 * z, pos.y - 23.2 * z - bob); ctx.lineTo(pos.x - 4.0 * z, pos.y - 27.6 * z - bob);
                ctx.moveTo(pos.x + 0.8 * z, pos.y - 23.2 * z - bob); ctx.lineTo(pos.x + 4.0 * z, pos.y - 27.6 * z - bob);
                ctx.stroke();

                // Articulated AMPK Shadow Ninja (Kyahan shin-wraps, dual Ninjato with hilts, Shinobi armor, Hachimaki & billowing scarf)
                ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 2.4 * z;
                ctx.beginPath();
                ctx.moveTo(nx - 1.6 * z, ny - 6.8 * z - bob);
                ctx.lineTo(nx - 1.9 * z - stride * 0.5, ny - 2.8 * z - kneeLiftL);
                ctx.lineTo(nx - 2.3 * z - stride, ny + 1.2 * z - kneeLiftL * 0.35);
                ctx.moveTo(nx + 1.6 * z, ny - 6.8 * z - bob);
                ctx.lineTo(nx + 1.9 * z + stride * 0.5, ny - 2.8 * z - kneeLiftR);
                ctx.lineTo(nx + 2.3 * z + stride, ny + 1.2 * z - kneeLiftR * 0.35);
                ctx.stroke();
                ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.0 * z;
                ctx.beginPath();
                ctx.moveTo(nx - 2.1 * z - stride * 0.75, ny - 1.8 * z - kneeLiftL * 0.35);
                ctx.lineTo(nx - 1.4 * z - stride * 0.5, ny - 3.4 * z - kneeLiftL * 0.6);
                ctx.moveTo(nx + 2.1 * z + stride * 0.75, ny - 1.8 * z - kneeLiftR * 0.35);
                ctx.lineTo(nx + 1.4 * z + stride * 0.5, ny - 3.4 * z - kneeLiftR * 0.6);
                ctx.stroke();

                // Dual Ninjato scabbards & gold tsuba hilts
                ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.8 * z;
                ctx.beginPath();
                ctx.moveTo(nx - 5.2 * z, ny - 18.5 * z - bob); ctx.lineTo(nx + 4.5 * z, ny - 10.0 * z - bob);
                ctx.moveTo(nx + 5.2 * z, ny - 18.5 * z - bob); ctx.lineTo(nx - 4.5 * z, ny - 10.0 * z - bob);
                ctx.stroke();
                ctx.fillStyle = '#facc15';
                ctx.fillRect(nx - 5.8 * z, ny - 19.2 * z - bob, 1.8 * z, 1.8 * z);
                ctx.fillRect(nx + 4.0 * z, ny - 19.2 * z - bob, 1.8 * z, 1.8 * z);

                // Shinobi torso, violet sash & shoulder pads
                ctx.fillStyle = '#1e1b4b'; ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.2 * z;
                ctx.beginPath(); ctx.roundRect(nx - 4.4 * z, ny - 16.0 * z - bob, 8.8 * z, 9.8 * z, 1.6 * z); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#7e22ce';
                ctx.fillRect(nx - 4.1 * z, ny - 9.8 * z - bob, 8.2 * z, 1.6 * z);
                ctx.fillStyle = '#312e81'; ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 0.8 * z;
                ctx.beginPath(); ctx.arc(nx, ny - 19.0 * z - bob, 3.6 * z, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                // Hachimaki brow band & glowing eyes
                ctx.fillStyle = '#a855f7';
                ctx.fillRect(nx - 3.5 * z, ny - 21.0 * z - bob, 7.0 * z, 1.3 * z);
                ctx.fillStyle = '#e9d5ff';
                ctx.fillRect(nx - 1.8 * z, ny - 19.2 * z - bob, 1.2 * z, 0.9 * z);
                ctx.fillRect(nx + 0.6 * z, ny - 19.2 * z - bob, 1.2 * z, 0.9 * z);

                const w1 = Math.sin(phase * 1.4) * 3.0 * z;
                const w2 = Math.cos(phase * 1.4) * 4.0 * z;
                ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 2.4 * z;
                ctx.beginPath();
                ctx.moveTo(nx - 2 * z, ny - 17.5 * z - bob);
                ctx.bezierCurveTo(nx - 7 * z, ny - 20.5 * z + w1, nx - 12 * z, ny - 15 * z - w1, nx - 17 * z, ny - 17.5 * z + w2);
                ctx.stroke();
            }

            // Billowing Ninja Smoke Bomb Cloud (Kemuridama flash + shockwave + radial-gradient swirling plumes + sparks)
            if (isSmoke) {
                const sx = pos.x + 5 * z;
                const sy = pos.y - 7 * z;
                const cloudAlpha = smokeT < 0.18 ? (smokeT / 0.18) : Math.max(0, 1 - (smokeT - 0.18) / 0.82);

                // 1. Initial detonation flash & expanding shockwave ring
                if (smokeT < 0.35) {
                    const flashFrac = 1 - smokeT / 0.35;
                    ctx.globalAlpha = flashFrac * 0.75;
                    ctx.strokeStyle = '#e9d5ff';
                    ctx.lineWidth = (2.2 * flashFrac + 0.6) * z;
                    ctx.beginPath();
                    ctx.ellipse(sx, pos.y + 1 * z, (10 + smokeT * 75) * z, (4.5 + smokeT * 34) * z, 0, 0, Math.PI * 2);
                    ctx.stroke();

                    const fg = ctx.createRadialGradient(sx, sy, 1 * z, sx, sy, (22 * flashFrac + 6) * z);
                    fg.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                    fg.addColorStop(0.5, 'rgba(192, 132, 252, 0.65)');
                    fg.addColorStop(1, 'rgba(192, 132, 252, 0)');
                    ctx.fillStyle = fg;
                    ctx.beginPath(); ctx.arc(sx, sy, (22 * flashFrac + 6) * z, 0, Math.PI * 2); ctx.fill();
                }

                // 2. Soft billowing radial-gradient smoke plumes rising & swirling
                const puffs = [
                    { a: 0.0, dist: 0.15, rise: 0.4, r: 16, inner: 'rgba(248, 250, 252, 0.85)', outer: 'rgba(148, 163, 184, 0)' },
                    { a: 0.8, dist: 0.75, rise: 0.3, r: 14, inner: 'rgba(226, 232, 240, 0.82)', outer: 'rgba(100, 116, 139, 0)' },
                    { a: 1.9, dist: 0.85, rise: 0.5, r: 13, inner: 'rgba(216, 180, 254, 0.78)', outer: 'rgba(126, 34, 206, 0)' },
                    { a: 2.8, dist: 0.90, rise: 0.25, r: 14, inner: 'rgba(203, 213, 225, 0.80)', outer: 'rgba(71, 85, 105, 0)' },
                    { a: 3.9, dist: 0.80, rise: 0.65, r: 12, inner: 'rgba(241, 245, 249, 0.78)', outer: 'rgba(148, 163, 184, 0)' },
                    { a: 5.0, dist: 0.70, rise: 0.85, r: 11, inner: 'rgba(192, 132, 252, 0.72)', outer: 'rgba(88, 28, 135, 0)' },
                    { a: 1.2, dist: 0.40, rise: 1.15, r: 12, inner: 'rgba(226, 232, 240, 0.75)', outer: 'rgba(100, 116, 139, 0)' },
                    { a: 4.4, dist: 0.45, rise: 1.35, r: 10, inner: 'rgba(248, 250, 252, 0.70)', outer: 'rgba(148, 163, 184, 0)' }
                ];
                const spread = (6 + smokeT * 28) * z;
                for (let i = 0; i < puffs.length; i++) {
                    const pf = puffs[i];
                    const swirl = pf.a + smokeT * (i % 2 === 0 ? 1.4 : -1.2);
                    const px = sx + Math.cos(swirl) * pf.dist * spread;
                    const py = sy + Math.sin(swirl) * pf.dist * spread * 0.45 - pf.rise * smokeT * 24 * z;
                    const pr = (pf.r + smokeT * 11) * z;
                    const grad = ctx.createRadialGradient(px, py, 1 * z, px, py, pr);
                    grad.addColorStop(0, pf.inner);
                    grad.addColorStop(0.55, pf.inner.replace(/[\d.]+\)$/, '0.42)'));
                    grad.addColorStop(1, pf.outer);
                    ctx.globalAlpha = cloudAlpha * 0.9;
                    ctx.fillStyle = grad;
                    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
                }

                // 3. Outward-darting violet & gold sparks
                if (smokeT < 0.60) {
                    const spAlpha = 1 - smokeT / 0.60;
                    ctx.globalAlpha = spAlpha;
                    for (let k = 0; k < 6; k++) {
                        const sa = k * (Math.PI / 3) + 0.4;
                        const sd = (8 + smokeT * 38) * z;
                        ctx.fillStyle = k % 2 === 0 ? '#fde047' : '#d8b4fe';
                        ctx.beginPath();
                        ctx.arc(sx + Math.cos(sa) * sd, sy + Math.sin(sa) * sd * 0.55 - smokeT * 8 * z, 1.8 * z * spAlpha, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            ctx.globalAlpha = 1;
            ctx.font = `bold ${Math.round(8 * z)}px Inter, sans-serif`;
            ctx.fillStyle = isSmoke ? '#e2e8f0' : '#d8b4fe';
            ctx.textAlign = 'center';
            ctx.fillText(isSmoke ? '💨 *POOF!* Both Vanished!' : '🥷 Autophagic Pruning → East Camp', pos.x + 5 * z, pos.y - 29 * z - bob);
            ctx.restore();
        }

        function drawHandCart(c) {
            const p = isoToScreen(c.gx, c.gy, 0.18); const z = Camera.zoom;
            const bob = Math.sin(c.wheelPhase || 0) * 1.4 * z;
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.34)';
            ctx.beginPath(); ctx.ellipse(p.x, p.y + 4 * z, 15 * z, 6.2 * z, 0, 0, Math.PI * 2); ctx.fill();

            // Daihachi-Guruma wooden cart bed & bamboo side rails
            ctx.fillStyle = '#78350f'; ctx.strokeStyle = c.type === 'NADH' ? '#38bdf8' : '#f59e0b'; ctx.lineWidth = 1.6 * z;
            ctx.beginPath(); ctx.roundRect(p.x - 11.5 * z, p.y - 8.5 * z, 23 * z, 11.5 * z, 2.5 * z); ctx.fill(); ctx.stroke();

            if (c.hasSack) {
                // Hot energetic cargo aura (electric cyan for NADH, molten amber for FADH2)
                const isNadh = c.type === 'NADH';
                const pulse = 0.7 + 0.3 * Math.sin(performance.now() * 0.015 + (c.gx || 0));
                const hotCol = isNadh ? `rgba(56, 189, 248, ${0.42 * pulse})` : `rgba(251, 146, 60, ${0.44 * pulse})`;
                const coreCol = isNadh ? '#e0f2fe' : '#fef08a';
                const rimCol = isNadh ? '#0284c7' : '#ea580c';

                ctx.fillStyle = hotCol;
                ctx.beginPath(); ctx.ellipse(p.x, p.y - 7.5 * z, 13.5 * z, 7.5 * z, 0, 0, Math.PI * 2); ctx.fill();

                // Glowing energetic NADH / FADH2 orbs stacked in the cart bed
                const orbs = [
                    { ox: -3.8 * z, oy: -6.2 * z, r: 4.2 * z },
                    { ox: 3.8 * z, oy: -6.2 * z, r: 4.2 * z },
                    { ox: 0, oy: -10.8 * z, r: 4.8 * z }
                ];
                for (const ob of orbs) {
                    const g = ctx.createRadialGradient(p.x + ob.ox, p.y + ob.oy, 0.5 * z, p.x + ob.ox, p.y + ob.oy, ob.r);
                    g.addColorStop(0, coreCol);
                    g.addColorStop(0.55, isNadh ? '#38bdf8' : '#f59e0b');
                    g.addColorStop(1, rimCol);
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(p.x + ob.ox, p.y + ob.oy, ob.r, 0, Math.PI * 2); ctx.fill();
                }

                if (SimState.showLabels) {
                    // Hot energy label on cart
                    ctx.font = `bold ${Math.round(7.2 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = coreCol; ctx.textAlign = 'center';
                    ctx.fillText(isNadh ? '⚡NADH' : '🔥FADH₂', p.x, p.y - 16.5 * z);
                }

                // Brief Acetyl-CoA bale popping out of existence right after loading!
                if ((c.acetylPopTimer || 0) > 0) {
                    const popFrac = 1 - Math.max(0, Math.min(1, c.acetylPopTimer / 0.55));
                    const popScale = Math.max(0.05, 0.72 * (1 - popFrac));
                    const popY = p.y - (15.0 + popFrac * 18.0) * z;
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, 1 - popFrac);
                    drawTawaraBale(p.x, popY, popScale, popFrac * 0.5, true);
                    if (SimState.showLabels) {
                        ctx.font = `bold ${Math.round(7.5 * z)}px Inter, sans-serif`;
                        ctx.fillStyle = '#fde047';
                        ctx.textAlign = 'center';
                        ctx.fillText('Acetyl-CoA 💨', p.x, popY - 8 * z);
                    }
                    ctx.restore();
                }
            }

            // 8-spoked wooden wheel
            const wx = p.x - 2 * z; const wy = p.y + 2.2 * z; const wr = 6.6 * z;
            ctx.save(); ctx.translate(wx, wy); ctx.rotate(c.wheelPhase || 0);
            ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2.0 * z;
            ctx.beginPath(); ctx.arc(0, 0, wr, 0, Math.PI * 2); ctx.stroke();
            for (let s = 0; s < 4; s++) {
                const a = (s * Math.PI) / 4;
                ctx.beginPath(); ctx.moveTo(-Math.cos(a) * wr, -Math.sin(a) * wr); ctx.lineTo(Math.cos(a) * wr, Math.sin(a) * wr); ctx.stroke();
            }
            ctx.restore();

            // Detailed Cart Puller (Shafu) holding shafts
            const dir = Math.cos(c.headingAngle || 0) >= 0 ? 1 : -1;
            const px = p.x + dir * 14.5 * z; const py = p.y + 1 * z + bob;
            ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.8 * z;
            ctx.beginPath(); ctx.moveTo(p.x + dir * 8 * z, p.y - 2.5 * z); ctx.lineTo(px, py - 8.5 * z); ctx.stroke();

            const stride = Math.sin(c.wheelPhase || 0) * 3.4 * z;
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2.0 * z;
            ctx.beginPath();
            ctx.moveTo(px - 1.2 * z, py - 5.5 * z); ctx.lineTo(px - stride, py + 2.2 * z);
            ctx.moveTo(px + 1.2 * z, py - 5.5 * z); ctx.lineTo(px + stride, py + 2.2 * z);
            ctx.stroke();

            // Hanten worker coat with white crest
            ctx.fillStyle = c.type === 'NADH' ? '#1d4ed8' : '#b45309';
            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 0.9 * z;
            ctx.beginPath(); ctx.roundRect(px - 4.5 * z, py - 14.5 * z, 9.0 * z, 9.5 * z, 2 * z); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath(); ctx.arc(px, py - 10.2 * z, 1.8 * z, 0, Math.PI * 2); ctx.fill();

            // Head & woven Sugegasa conical hat
            ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(px, py - 17.2 * z, 3.3 * z, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fcd34d'; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.1 * z;
            ctx.beginPath(); ctx.moveTo(px - 8.0 * z, py - 18.0 * z); ctx.lineTo(px, py - 23.0 * z); ctx.lineTo(px + 8.0 * z, py - 18.0 * z); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.restore();
        }

        function drawLocalPorter(p) {
            if (SimState.cellDead || SimState.crisisState === 'necrosis' || SimState.crisisState === 'starvation' || (SimState.apoptosisSequence && SimState.apoptosisSequence.act !== 'rampage') || (SimState.necrosisSequence && SimState.necrosisSequence.act !== 'surge') || (SimState.starvationSequence && SimState.starvationSequence.act !== 'scavenge')) return;
            const pos = isoToScreen(p.gx, p.gy, 0.2); const z = Camera.zoom;
            const phase = p.walkPhase || 0;
            const bob = Math.abs(Math.sin(phase)) * 1.6 * z;
            const stride = Math.sin(phase) * 3.8 * z;
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.32)';
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2 * z, 7.2 * z, 3.3 * z, 0, 0, Math.PI * 2); ctx.fill();

            if (p.type === 'CoQ') {
                // Indigo CoQ Merchant Porter with white Tasuki sleeve-ties & walking staff
                ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2.2 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 1.6 * z, pos.y - 6.5 * z); ctx.lineTo(pos.x - 1.8 * z - stride, pos.y + 1.2 * z);
                ctx.moveTo(pos.x + 1.6 * z, pos.y - 6.5 * z); ctx.lineTo(pos.x + 1.8 * z + stride, pos.y + 1.2 * z);
                ctx.stroke();

                ctx.fillStyle = '#0369a1'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.1 * z;
                ctx.beginPath(); ctx.roundRect(pos.x - 5.2 * z, pos.y - 16.0 * z - bob, 10.4 * z, 10.0 * z, 2.2 * z); ctx.fill(); ctx.stroke();
                // White Tasuki X-straps across chest
                ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.3 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 4.0 * z, pos.y - 15.0 * z - bob); ctx.lineTo(pos.x + 4.0 * z, pos.y - 7.5 * z - bob);
                ctx.moveTo(pos.x + 4.0 * z, pos.y - 15.0 * z - bob); ctx.lineTo(pos.x - 4.0 * z, pos.y - 7.5 * z - bob);
                ctx.stroke();

                drawFlourSack(pos.x + 5.6 * z, pos.y - 15.2 * z - bob, 0.86);

                ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(pos.x - 0.5 * z, pos.y - 19.2 * z - bob, 3.8 * z, 0, Math.PI * 2); ctx.fill();
                // Twisted Hachimaki headband
                ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.8 * z;
                ctx.beginPath(); ctx.moveTo(pos.x - 4.2 * z, pos.y - 20.5 * z - bob); ctx.lineTo(pos.x + 3.4 * z, pos.y - 20.5 * z - bob); ctx.stroke();
            } else {
                // Swift Red-Lacquer Cytochrome c Courier with Jingasa hat & Mochi tray
                ctx.strokeStyle = '#fecdd3'; ctx.lineWidth = 2.0 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 1.5 * z, pos.y - 6.5 * z); ctx.lineTo(pos.x - 1.8 * z - stride * 1.2, pos.y + 1.2 * z);
                ctx.moveTo(pos.x + 1.5 * z, pos.y - 6.5 * z); ctx.lineTo(pos.x + 1.8 * z + stride * 1.2, pos.y + 1.2 * z);
                ctx.stroke();

                ctx.fillStyle = '#dc2626'; ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.1 * z;
                ctx.beginPath(); ctx.roundRect(pos.x - 5.0 * z, pos.y - 16.0 * z - bob, 10.0 * z, 10.0 * z, 2.5 * z); ctx.fill(); ctx.stroke();

                ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(pos.x, pos.y - 19.2 * z - bob, 3.6 * z, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#991b1b'; ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.1 * z;
                ctx.beginPath(); ctx.moveTo(pos.x - 7.2 * z, pos.y - 20.2 * z - bob); ctx.lineTo(pos.x, pos.y - 24.5 * z - bob); ctx.lineTo(pos.x + 7.2 * z, pos.y - 20.2 * z - bob); ctx.closePath(); ctx.fill(); ctx.stroke();

                drawMochiBall(pos.x + 6.6 * z, pos.y - 12.0 * z - bob, 0.88);
            }
            ctx.restore();
        }

        function drawFlameTongue(bx, by, w, h, sway, fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.beginPath();
            ctx.moveTo(bx - w * 0.5, by);
            ctx.bezierCurveTo(
                bx - w * 0.85, by - h * 0.35,
                bx - w * 0.25 + sway * 0.6, by - h * 0.70,
                bx + sway, by - h
            );
            ctx.bezierCurveTo(
                bx + w * 0.35 + sway * 0.5, by - h * 0.65,
                bx + w * 0.80, by - h * 0.32,
                bx + w * 0.5, by
            );
            ctx.closePath();
            ctx.fill();
        }

        function drawFlameCluster(cx, cy, sc, z, time, seed, isHydroxyl = false, alpha = 1.0) {
            ctx.save();
            ctx.globalAlpha *= alpha;
            // Scorched ember bed & warm light halo
            ctx.fillStyle = isHydroxyl ? 'rgba(244, 63, 94, 0.28)' : 'rgba(249, 115, 22, 0.26)';
            ctx.beginPath(); ctx.ellipse(cx, cy + 1.2 * z, 11 * z * sc, 4.8 * z * sc, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(24, 24, 27, 0.45)';
            ctx.beginPath(); ctx.ellipse(cx, cy + 0.8 * z, 6.5 * z * sc, 2.6 * z * sc, 0, 0, Math.PI * 2); ctx.fill();

            const s1 = Math.sin(time * 10.5 + seed) * 2.8 * z * sc;
            const s2 = Math.cos(time * 13.0 + seed * 1.7) * 2.2 * z * sc;
            const s3 = Math.sin(time * 15.5 + seed * 2.3) * 1.9 * z * sc;
            const hBoost = 1 + 0.14 * Math.sin(time * 14 + seed * 0.9);

            const outerCol = isHydroxyl ? 'rgba(192, 38, 211, 0.90)' : 'rgba(220, 38, 38, 0.90)';
            const midCol = isHydroxyl ? 'rgba(244, 63, 94, 0.92)' : 'rgba(249, 115, 22, 0.92)';
            const coreCol = isHydroxyl ? 'rgba(253, 164, 175, 0.96)' : 'rgba(254, 240, 138, 0.96)';

            // Left & right side flame tongues
            drawFlameTongue(cx - 4.2 * z * sc, cy + 0.2 * z, 6.5 * z * sc, 15.5 * z * sc * hBoost, s2 - 1.5 * z * sc, outerCol);
            drawFlameTongue(cx + 4.4 * z * sc, cy + 0.2 * z, 6.2 * z * sc, 14.5 * z * sc * hBoost, s3 + 1.5 * z * sc, outerCol);
            // Main central outer flame
            drawFlameTongue(cx, cy + 0.4 * z, 10.5 * z * sc, 24.5 * z * sc * hBoost, s1, outerCol);
            // Mid amber-orange flames
            drawFlameTongue(cx - 2.2 * z * sc, cy + 0.3 * z, 5.2 * z * sc, 13.5 * z * sc * hBoost, s3 * 0.8, midCol);
            drawFlameTongue(cx + 0.6 * z * sc, cy + 0.4 * z, 7.6 * z * sc, 18.0 * z * sc * hBoost, s2 * 0.85, midCol);
            // Hot inner yellow-white core
            drawFlameTongue(cx + 0.2 * z * sc, cy + 0.4 * z, 4.4 * z * sc, 10.5 * z * sc, s1 * 0.45, coreCol);

            // Rising sparks / embers
            for (let k = 0; k < 3; k++) {
                const spPhase = (time * 1.4 + seed * 0.3 + k * 0.33) % 1;
                const spX = cx + Math.sin(spPhase * 6.28 + k * 2.1 + seed) * 4.5 * z * sc;
                const spY = cy - (12 + spPhase * 18) * z * sc;
                ctx.globalAlpha = alpha * (1 - spPhase) * 0.9;
                ctx.fillStyle = k === 0 ? '#fef08a' : '#fb923c';
                ctx.beginPath(); ctx.arc(spX, spY, (1.3 - spPhase * 0.6) * z * sc, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        }

        function drawPathFire(f, time) {
            const pos = isoToScreen(f.gx, f.gy, 0.15); const z = Camera.zoom;
            const sc = f.intensity ? Math.min(1.85, Math.max(1.0, f.intensity)) : 1.0;
            drawFlameCluster(pos.x, pos.y, sc, z, time, f.gx * 1.7 + f.gy * 2.3, !!f.isHydroxyl, 1.0);
            if (f.isHydroxyl && SimState.showLabels) {
                ctx.save();
                ctx.font = `bold ${Math.round(7.2 * z)}px Inter, sans-serif`;
                ctx.fillStyle = '#fda4af';
                ctx.textAlign = 'center';
                ctx.fillText('💥 ⋅OH', pos.x, pos.y - 29 * z * sc);
                ctx.restore();
            }
        }

        function drawBrigadeWorker(b) {
            if (SimState.cellDead || SimState.crisisState === 'necrosis' || SimState.crisisState === 'starvation' || (SimState.apoptosisSequence && SimState.apoptosisSequence.act !== 'rampage') || (SimState.necrosisSequence && SimState.necrosisSequence.act !== 'surge') || (SimState.starvationSequence && SimState.starvationSequence.act !== 'scavenge')) return;
            const pos = isoToScreen(b.gx, b.gy, 0.22);
            const z = Camera.zoom;
            const time = performance.now() * 0.001;
            const dir = b.facingDir || 1;
            const phase = b.walkPhase || 0;
            const isDousing = (b.douseTimer || 0) > 0;
            const stride = isDousing ? 0 : Math.sin(phase) * 3.1 * z;
            const kneeLiftL = isDousing ? 0 : Math.max(0, -Math.cos(phase)) * 1.8 * z;
            const kneeLiftR = isDousing ? 0 : Math.max(0, Math.cos(phase)) * 1.8 * z;
            const breath = Math.sin(time * 3.5 + (b.gx || 0)) * 0.4 * z;
            const bob = (isDousing ? Math.abs(Math.sin(phase)) * 1.6 * z : Math.abs(Math.sin(phase)) * 1.2 * z) + breath;

            ctx.save();
            // Ground shadow
            ctx.fillStyle = 'rgba(0,0,0,0.34)';
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 1.8 * z, 7.2 * z, 3.2 * z, 0, 0, Math.PI * 2); ctx.fill();

            // 2-jointed articulated legs with Kyahan shin wraps
            const drawLeg = (hipX, footX, lift) => {
                const kneeX = (hipX + footX) * 0.5 + dir * 1.2 * z;
                const kneeY = pos.y - 3.6 * z - lift * 0.6;
                ctx.strokeStyle = '#334155'; ctx.lineWidth = 2.1 * z; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(hipX, pos.y - 7.0 * z - bob * 0.3); ctx.lineTo(kneeX, kneeY); ctx.stroke();
                ctx.strokeStyle = '#0891b2'; ctx.lineWidth = 1.9 * z;
                ctx.beginPath(); ctx.moveTo(kneeX, kneeY); ctx.lineTo(footX, pos.y + 0.8 * z - lift); ctx.stroke();
                ctx.fillStyle = '#0f172a';
                ctx.beginPath(); ctx.ellipse(footX + dir * 0.8 * z, pos.y + 1.1 * z - lift, 1.8 * z, 1.0 * z, 0, 0, Math.PI * 2); ctx.fill();
            };
            drawLeg(pos.x - 1.9 * z, pos.x - 2.0 * z - stride, kneeLiftL);
            drawLeg(pos.x + 1.9 * z, pos.x + 2.0 * z + stride, kneeLiftR);

            // Edo Hikeshi quilted Shoubanten coat + cyan Sashiko trim + Obi belt + chest Mon crest
            ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.25 * z;
            ctx.beginPath(); ctx.roundRect(pos.x - 5.4 * z, pos.y - 16.5 * z - bob, 10.8 * z, 10.2 * z, 2.2 * z); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(pos.x - 5.0 * z, pos.y - 10.2 * z - bob, 10.0 * z, 1.7 * z); // Obi belt
            ctx.strokeStyle = '#bae6fd'; ctx.lineWidth = 1.0 * z;
            ctx.beginPath(); ctx.arc(pos.x, pos.y - 13.0 * z - bob, 1.7 * z, 0, Math.PI * 2); ctx.stroke(); // White crest

            // Pumping back arm
            const armSwing = isDousing ? -3.0 * z : Math.sin(phase) * 2.5 * z;
            ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.0 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - dir * 4.5 * z, pos.y - 14.8 * z - bob);
            ctx.lineTo(pos.x - dir * (6.2 * z - armSwing * 0.5), pos.y - 10.2 * z - bob);
            ctx.stroke();

            // Head + Hikeshi Zukin fire hood with flowing shoulder flaps (shikoro)
            ctx.fillStyle = '#0e7490'; ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 0.85 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 4.8 * z, pos.y - 18.5 * z - bob);
            ctx.lineTo(pos.x - 6.0 * z - dir * 1.4 * z, pos.y - 14.5 * z - bob);
            ctx.lineTo(pos.x + 6.0 * z - dir * 1.4 * z, pos.y - 14.5 * z - bob);
            ctx.lineTo(pos.x + 4.8 * z, pos.y - 18.5 * z - bob);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.fillStyle = '#fed7aa';
            ctx.beginPath(); ctx.arc(pos.x, pos.y - 19.6 * z - bob, 3.4 * z, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0891b2'; ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 0.9 * z;
            ctx.beginPath(); ctx.arc(pos.x, pos.y - 20.4 * z - bob, 4.0 * z, Math.PI * 0.88, Math.PI * 0.12); ctx.fill(); ctx.stroke();

            // Forward arm holding iron-hooped cedar Teoke water bucket + sloshing GSH water
            const bktX = pos.x + dir * (6.2 * z) + (isDousing ? dir * 2.5 * z : 0);
            const bktY = pos.y - (isDousing ? 13.8 : 11.2) * z - bob;
            ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.0 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x + dir * 4.5 * z, pos.y - 14.8 * z - bob);
            ctx.lineTo(bktX, bktY - 1.5 * z);
            ctx.stroke();

            ctx.fillStyle = '#78350f'; ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.15 * z;
            ctx.beginPath(); ctx.roundRect(bktX - 3.4 * z, bktY - 2.0 * z, 6.8 * z, 6.4 * z, 1.4 * z); ctx.fill(); ctx.stroke();
            if (b.hasWater) {
                const slosh = Math.sin(phase * 1.5) * 0.7 * z;
                ctx.fillStyle = '#22d3ee';
                ctx.fillRect(bktX - 2.6 * z, bktY - 1.4 * z + slosh * 0.3, 5.2 * z, 2.6 * z);
            }
            if (isDousing) {
                ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 1.8 * z;
                ctx.beginPath();
                ctx.moveTo(bktX + dir * 2 * z, bktY);
                ctx.quadraticCurveTo(bktX + dir * 8 * z, bktY - 4 * z, bktX + dir * 13 * z, bktY + 3 * z);
                ctx.stroke();
            }
            ctx.restore();
        }

        function drawSamuraiRetainer(s) {
            const sheathed = !!s.sheathed || SimState.crisisState === 'nafld';
            const isSparring = !sheathed && (s.state === 'training' || (s.state === 'chasingBandit' && !!s.isEngagedSparring));
            const dir = isSparring ? (s.facingDir || 1) : (s.facingDir || 1);
            const sparWave = isSparring ? Math.sin(s.sparPhase || 0) : 0;
            const lungeOffset = (s.state === 'training') ? sparWave * 0.055 * dir : 0;

            const pos = isoToScreen(s.gx + lungeOffset, s.gy + lungeOffset * 0.35, 0.22);
            const z = Camera.zoom;
            const liv = s.livery || SamuraiLiveries[0];
            const phase = s.walkPhase || 0;
            const stride = isSparring
                ? Math.sin((s.sparPhase || 0) * 1.6) * 3.4 * z
                : Math.sin(phase) * 3.2 * z;
            const kneeLiftL = isSparring ? 0 : Math.max(0, -Math.cos(phase)) * 1.8 * z;
            const kneeLiftR = isSparring ? 0 : Math.max(0, Math.cos(phase)) * 1.8 * z;
            const breath = Math.sin(performance.now() * 0.0032 + (s.id || 0)) * 0.45 * z;
            const bob = (isSparring
                ? Math.abs(Math.cos(s.sparPhase || 0)) * 1.9 * z
                : Math.abs(Math.sin(phase)) * 1.25 * z) + breath;

            ctx.save();

            if (s.state === 'training' && s.hasKoku) {
                const groundBalePos = isoToScreen(s.gx - dir * 0.14, s.gy + 0.14, 0.18);
                const baleScale = 0.50 + 0.35 * Math.max(0.1, s.kokuEnergy);
                drawTawaraBale(groundBalePos.x, groundBalePos.y, baleScale, 0.12 * dir, true);
            }

            // Ground shadow
            ctx.fillStyle = 'rgba(0,0,0,0.38)';
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2 * z, 8.2 * z, 3.8 * z, 0, 0, Math.PI * 2); ctx.fill();

            // Wide-stance pleated Hakama & articulated Suneate armored greaves
            const stanceW = isSparring ? 6.8 * z : 5.2 * z;
            ctx.fillStyle = liv.hakama;
            ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 0.8 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 4.8 * z, pos.y - 8.5 * z - bob);
            ctx.quadraticCurveTo(pos.x - stanceW * 0.7 - stride * 0.3, pos.y - 4.2 * z - kneeLiftL * 0.5, pos.x - stanceW - stride * 0.55, pos.y + 1.2 * z - kneeLiftL * 0.35);
            ctx.lineTo(pos.x - 0.7 * z, pos.y + 1.2 * z);
            ctx.lineTo(pos.x + 0.7 * z, pos.y + 1.2 * z);
            ctx.lineTo(pos.x + stanceW + stride * 0.55, pos.y + 1.2 * z - kneeLiftR * 0.35);
            ctx.quadraticCurveTo(pos.x + stanceW * 0.7 + stride * 0.3, pos.y - 4.2 * z - kneeLiftR * 0.5, pos.x + 4.8 * z, pos.y - 8.5 * z - bob);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Suneate armored shin guards for crisp step articulation
            ctx.strokeStyle = liv.crest; ctx.lineWidth = 1.3 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - stanceW * 0.65 - stride * 0.35, pos.y - 3.2 * z - kneeLiftL * 0.5);
            ctx.lineTo(pos.x - stanceW * 0.88 - stride * 0.55, pos.y + 1.0 * z - kneeLiftL * 0.35);
            ctx.moveTo(pos.x + stanceW * 0.65 + stride * 0.35, pos.y - 3.2 * z - kneeLiftR * 0.5);
            ctx.lineTo(pos.x + stanceW * 0.88 + stride * 0.55, pos.y + 1.0 * z - kneeLiftR * 0.35);
            ctx.stroke();

            // Clan Sashimono back-banner with gentle wind flutter & mon emblem
            const bannerX = pos.x - dir * 4.2 * z;
            const flagFlutter = Math.sin(performance.now() * 0.005 + (s.id || 0)) * 0.9 * z;
            ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.4 * z;
            ctx.beginPath(); ctx.moveTo(bannerX, pos.y - 14 * z - bob); ctx.lineTo(bannerX, pos.y - 30.5 * z - bob); ctx.stroke();
            ctx.fillStyle = liv.cuirass; ctx.strokeStyle = liv.crest; ctx.lineWidth = 1.0 * z;
            const flagLeft = bannerX - (dir > 0 ? 6.8 * z : 0) + flagFlutter * 0.3;
            ctx.beginPath(); ctx.roundRect(flagLeft, pos.y - 30.0 * z - bob, 6.8 * z, 10.5 * z, 1.2 * z); ctx.fill(); ctx.stroke();
            ctx.fillStyle = liv.crest;
            ctx.beginPath(); ctx.arc(flagLeft + 3.4 * z, pos.y - 24.8 * z - bob, 1.8 * z, 0, Math.PI * 2); ctx.fill();

            // Multi-plate Laced Do-maru Cuirass, Kusazuri tassets & Sode shoulder guards
            ctx.fillStyle = liv.cuirass; ctx.strokeStyle = liv.crest; ctx.lineWidth = 1.2 * z;
            ctx.beginPath(); ctx.roundRect(pos.x - 5.8 * z, pos.y - 17.2 * z - bob, 11.6 * z, 9.5 * z, 2.2 * z); ctx.fill(); ctx.stroke();
            // Horizontal armor lacing ribs (Odoshige)
            ctx.strokeStyle = liv.sash; ctx.lineWidth = 0.85 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 5.2 * z, pos.y - 13.8 * z - bob); ctx.lineTo(pos.x + 5.2 * z, pos.y - 13.8 * z - bob);
            ctx.moveTo(pos.x - 5.2 * z, pos.y - 10.8 * z - bob); ctx.lineTo(pos.x + 5.2 * z, pos.y - 10.8 * z - bob);
            ctx.stroke();
            // Sode shoulder plates
            ctx.fillStyle = liv.sode; ctx.strokeStyle = liv.crest; ctx.lineWidth = 0.8 * z;
            ctx.fillRect(pos.x - 7.8 * z, pos.y - 16.8 * z - bob, 2.6 * z, 6.0 * z);
            ctx.strokeRect(pos.x - 7.8 * z, pos.y - 16.8 * z - bob, 2.6 * z, 6.0 * z);
            ctx.fillRect(pos.x + 5.2 * z, pos.y - 16.8 * z - bob, 2.6 * z, 6.0 * z);
            ctx.strokeRect(pos.x + 5.2 * z, pos.y - 16.8 * z - bob, 2.6 * z, 6.0 * z);

            // Head, Shikoro neck-guard, Kabuto Helmet & Golden Kuwagata Horns
            ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(pos.x, pos.y - 20.2 * z - bob, 3.7 * z, 0, Math.PI * 2); ctx.fill();
            // Flared Shikoro neck-guard plates
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(pos.x - 6.2 * z, pos.y - 19.2 * z - bob);
            ctx.lineTo(pos.x - 4.5 * z, pos.y - 22.0 * z - bob);
            ctx.lineTo(pos.x + 4.5 * z, pos.y - 22.0 * z - bob);
            ctx.lineTo(pos.x + 6.2 * z, pos.y - 19.2 * z - bob);
            ctx.closePath(); ctx.fill();
            // Kabuto dome
            ctx.fillStyle = '#1e293b'; ctx.strokeStyle = liv.crest; ctx.lineWidth = 1.1 * z;
            ctx.beginPath(); ctx.arc(pos.x, pos.y - 21.2 * z - bob, 4.8 * z, Math.PI, 0); ctx.fill(); ctx.stroke();
            // Golden Kuwagata crest horns
            ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.8 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 5.0 * z, pos.y - 26.2 * z - bob);
            ctx.quadraticCurveTo(pos.x - 2.0 * z, pos.y - 22.5 * z - bob, pos.x, pos.y - 22.2 * z - bob);
            ctx.quadraticCurveTo(pos.x + 2.0 * z, pos.y - 22.5 * z - bob, pos.x + 5.0 * z, pos.y - 26.2 * z - bob);
            ctx.stroke();

            if (!s.hasKoku) {
                ctx.fillStyle = '#78350f'; ctx.strokeStyle = s.state === 'toWellhouseAMP' ? '#22d3ee' : '#fde68a'; ctx.lineWidth = 1.2 * z;
                ctx.beginPath(); ctx.ellipse(pos.x + 7.8 * z, pos.y - 11.0 * z - bob, 6.4 * z, 3.4 * z, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                if (SimState.showLabels) {
                    ctx.font = `bold ${Math.round(6.5 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = s.state === 'toWellhouseAMP' ? '#22d3ee' : '#fef08a'; ctx.textAlign = 'center';
                    ctx.fillText(s.state === 'toWellhouseAMP' ? 'AMP' : 'ADP', pos.x + 7.8 * z, pos.y - 9.8 * z - bob);
                }

                if ((s.waitTimer || 0) > 1.2 && (s.state === 'queued' || s.state === 'receiving')) {
                    const patFrac = Math.max(0, 1 - s.waitTimer / BioConfig.roninPatienceLimit);
                    const pw = 22 * z; const ph = 3.5 * z;
                    const px = pos.x - pw / 2; const py = pos.y - 34 * z - bob;
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                    ctx.fillRect(px, py, pw, ph);
                    ctx.fillStyle = patFrac > 0.5 ? '#34d399' : (patFrac > 0.25 ? '#f59e0b' : '#f43f5e');
                    ctx.fillRect(px, py, pw * patFrac, ph);
                }
            } else if (s.state === 'toTrainingYard') {
                drawTawaraBale(pos.x + 7.8 * z, pos.y - 15.0 * z - bob, 0.88, -0.15, true);
                if (SimState.showLabels) {
                    ctx.font = `bold ${Math.round(7.5 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#fde047';
                    ctx.textAlign = 'center';
                    ctx.fillText('🌾 Koku → Dojo', pos.x, pos.y - 31.5 * z - bob);
                }
            } else if (sheathed && (s.state === 'training' || s.state === 'chasingBandit' || s.state === 'queued' || s.state === 'receiving')) {
                // Katana sheathed in scabbard at hip; relaxed arm during NAFLD steatosis
                ctx.strokeStyle = liv.sode; ctx.lineWidth = 2.4 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x + dir * 2.8 * z, pos.y - 14.5 * z - bob);
                ctx.lineTo(pos.x + dir * 4.2 * z, pos.y - 9.0 * z - bob);
                ctx.stroke();
                ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2.4 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - dir * 5.2 * z, pos.y - 10.0 * z - bob);
                ctx.lineTo(pos.x + dir * 6.2 * z, pos.y - 7.2 * z - bob);
                ctx.stroke();
                ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.4 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - dir * 3.5 * z, pos.y - 11.2 * z - bob);
                ctx.lineTo(pos.x - dir * 3.5 * z, pos.y - 8.2 * z - bob);
                ctx.stroke();
            } else if (isSparring || s.state === 'chasingBandit') {
                const swingAngle = (-0.55 + Math.sin(s.sparPhase || 0) * 1.05) * dir;
                const gripX = pos.x + dir * 5.5 * z;
                const gripY = pos.y - 12.8 * z - bob;

                ctx.strokeStyle = liv.sode; ctx.lineWidth = 2.6 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x + dir * 2.5 * z, pos.y - 14.5 * z - bob);
                ctx.lineTo(gripX, gripY);
                ctx.stroke();

                ctx.save();
                ctx.translate(gripX, gripY);
                ctx.rotate(swingAngle);

                if (Math.cos(s.sparPhase || 0) > 0.25) {
                    ctx.strokeStyle = 'rgba(254, 240, 138, 0.42)';
                    ctx.lineWidth = 3.6 * z;
                    ctx.beginPath();
                    ctx.arc(0, 0, 14.5 * z, dir > 0 ? -1.2 : Math.PI - 0.3, dir > 0 ? 0.3 : Math.PI + 1.2);
                    ctx.stroke();
                }

                ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.3 * z;
                ctx.beginPath(); ctx.moveTo(-dir * 3.8 * z, 1.5 * z); ctx.lineTo(0, 0); ctx.stroke();
                ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.8 * z;
                ctx.beginPath(); ctx.moveTo(0, -2.8 * z); ctx.lineTo(0, 2.8 * z); ctx.stroke();

                ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2.5 * z;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(dir * 9.5 * z, -5.2 * z, dir * 18.0 * z, -11.0 * z);
                ctx.stroke();

                ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.2 * z;
                ctx.beginPath();
                ctx.moveTo(0, 0.6 * z);
                ctx.quadraticCurveTo(dir * 9.5 * z, -4.6 * z, dir * 17.5 * z, -10.2 * z);
                ctx.stroke();
                ctx.restore();

                if (s.state === 'training') {
                    const kw = 20 * z; const kh = 3.2 * z;
                    const kx = pos.x - kw / 2; const ky = pos.y - 34 * z - bob;
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                    ctx.fillRect(kx, ky, kw, kh);
                    ctx.fillStyle = s.kokuEnergy > 0.3 ? '#facc15' : '#f97316';
                    ctx.fillRect(kx, ky, kw * Math.max(0, Math.min(1, s.kokuEnergy)), kh);
                }
            }
            ctx.restore();
        }

        function drawRoninRampager(r, time = 0) {
            const pos = isoToScreen(r.gx, r.gy, 0.25); const z = Camera.zoom;
            if (r.seppuku && (r.seppukuProgress || 0) >= 0.45) {
                const prog = Math.max(0, Math.min(1, ((r.seppukuProgress || 0) - 0.45) / 0.55));
                const bow = prog * 3.8 * z;
                const dir = -1;
                ctx.save();
                // Ground aura
                ctx.fillStyle = `rgba(244, 63, 94, ${0.28 + prog * 0.34})`;
                ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2 * z, 9.2 * z, 4.2 * z, 0, 0, Math.PI * 2); ctx.fill();

                // Folded seiza dark-crimson pleated Hakama & Suneate trim
                ctx.fillStyle = '#1f1218'; ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)'; ctx.lineWidth = 0.9 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 6.8 * z, pos.y - 4.0 * z);
                ctx.quadraticCurveTo(pos.x - 8.2 * z, pos.y + 1.4 * z, pos.x - 4.2 * z, pos.y + 1.8 * z);
                ctx.lineTo(pos.x + 4.2 * z, pos.y + 1.8 * z);
                ctx.quadraticCurveTo(pos.x + 8.2 * z, pos.y + 1.4 * z, pos.x + 6.8 * z, pos.y - 4.0 * z);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 1.1 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 5.2 * z, pos.y + 0.5 * z); ctx.lineTo(pos.x - 1.5 * z, pos.y + 1.2 * z);
                ctx.moveTo(pos.x + 5.2 * z, pos.y + 0.5 * z); ctx.lineTo(pos.x + 1.5 * z, pos.y + 1.2 * z);
                ctx.stroke();

                // Tattered Sashimono back-banner lowered with bowed torso
                const bannerX = pos.x + 4.4 * z;
                const flagFlutter = Math.sin(time * 5.0 + (r.id || 0)) * 0.9 * z;
                ctx.strokeStyle = '#451a03'; ctx.lineWidth = 1.4 * z;
                ctx.beginPath(); ctx.moveTo(bannerX, pos.y - 9 * z + bow * 0.5); ctx.lineTo(bannerX, pos.y - 24.5 * z + bow * 0.5); ctx.stroke();
                ctx.fillStyle = '#4c0519'; ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 1.0 * z;
                const flagLeft = bannerX + flagFlutter * 0.25;
                ctx.beginPath();
                ctx.moveTo(flagLeft, pos.y - 24.0 * z + bow * 0.5);
                ctx.lineTo(flagLeft + 6.4 * z, pos.y - 21.8 * z + bow * 0.5);
                ctx.lineTo(flagLeft + 6.4 * z, pos.y - 14.2 * z + bow * 0.5);
                ctx.lineTo(flagLeft, pos.y - 14.8 * z + bow * 0.5);
                ctx.closePath(); ctx.fill(); ctx.stroke();

                // Multi-plate Laced Obsidian & Crimson Do-maru Cuirass + Sode shoulder guards
                const torsoY = pos.y - 12.6 * z + bow * 0.55;
                ctx.fillStyle = '#18181b'; ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 1.2 * z;
                ctx.beginPath(); ctx.roundRect(pos.x - 5.6 * z, torsoY, 11.2 * z, 9.0 * z - bow * 0.25, 2.2 * z); ctx.fill(); ctx.stroke();
                ctx.strokeStyle = '#9f1239'; ctx.lineWidth = 0.9 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 5.0 * z, torsoY + 3.2 * z); ctx.lineTo(pos.x + 5.0 * z, torsoY + 3.2 * z);
                ctx.moveTo(pos.x - 5.0 * z, torsoY + 6.0 * z); ctx.lineTo(pos.x + 5.0 * z, torsoY + 6.0 * z);
                ctx.stroke();
                ctx.fillStyle = '#3f0d1b'; ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 0.85 * z;
                ctx.fillRect(pos.x - 7.5 * z, torsoY + 0.4 * z, 2.5 * z, 5.4 * z);
                ctx.strokeRect(pos.x - 7.5 * z, torsoY + 0.4 * z, 2.5 * z, 5.4 * z);
                ctx.fillRect(pos.x + 5.0 * z, torsoY + 0.4 * z, 2.5 * z, 4.8 * z);
                ctx.strokeRect(pos.x + 5.0 * z, torsoY + 0.4 * z, 2.5 * z, 4.8 * z);

                // Bowed Head, Oni Menpo half-mask, & Wild Unbound Ronin Hair
                const headY = pos.y - 15.6 * z + bow * 0.95;
                ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(pos.x - 0.5 * z, headY, 3.6 * z, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#18181b';
                ctx.beginPath(); ctx.arc(pos.x - 0.5 * z, headY + 0.6 * z, 3.3 * z, 0.1, Math.PI - 0.1); ctx.fill();
                ctx.fillStyle = '#18181b';
                ctx.beginPath();
                ctx.moveTo(pos.x - 6.0 * z, headY - 0.5 * z);
                ctx.lineTo(pos.x - 4.0 * z, headY - 6.6 * z);
                ctx.lineTo(pos.x - 0.8 * z, headY - 3.4 * z);
                ctx.lineTo(pos.x + 1.2 * z, headY - 7.4 * z);
                ctx.lineTo(pos.x + 4.0 * z, headY - 6.2 * z);
                ctx.lineTo(pos.x + 5.2 * z, headY - 0.5 * z);
                ctx.closePath(); ctx.fill();

                // Both arms gripping gleaming curved blade drawn inward across waist
                const bladeY = torsoY + 5.6 * z;
                ctx.strokeStyle = '#3f0d1b'; ctx.lineWidth = 2.4 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 4.5 * z, torsoY + 2.2 * z); ctx.lineTo(pos.x - 1.5 * z, bladeY);
                ctx.moveTo(pos.x + 4.5 * z, torsoY + 2.2 * z); ctx.lineTo(pos.x + 3.2 * z, bladeY);
                ctx.stroke();
                ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.2 * z;
                ctx.beginPath(); ctx.moveTo(pos.x + 6.5 * z, bladeY - 0.6 * z); ctx.lineTo(pos.x + 3.2 * z, bladeY); ctx.stroke();
                ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 1.8 * z;
                ctx.beginPath(); ctx.moveTo(pos.x + 3.2 * z, bladeY - 2.4 * z); ctx.lineTo(pos.x + 3.2 * z, bladeY + 2.4 * z); ctx.stroke();
                ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 2.2 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x + 3.2 * z, bladeY);
                ctx.quadraticCurveTo(pos.x - 0.5 * z, bladeY + 0.8 * z, pos.x - 4.2 * z + prog * 2.4 * z, bladeY - 0.4 * z);
                ctx.stroke();

                if (prog > 0.6) {
                    ctx.fillStyle = `rgba(254, 205, 211, ${(prog - 0.6) * 2.0})`;
                    ctx.beginPath(); ctx.arc(pos.x, torsoY + 3 * z, (prog - 0.6) * 24 * z, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
                return;
            }
            const rebelling = !!SimState.roninRebelling;
            const sheathed = !rebelling && !!r.sheathed;
            const menacing = !rebelling && !sheathed && SimState.ronin.length >= 4;
            const walkSpd = rebelling ? 13.0 : (sheathed ? 5.6 : (menacing ? 7.5 : 5.2));
            const phase = time * walkSpd + (r.id || 0) * 1.3;
            const stride = Math.sin(phase) * (rebelling ? 3.8 : (sheathed ? 2.7 : (menacing ? 3.0 : 2.6))) * z;
            const kneeLiftL = Math.max(0, -Math.cos(phase)) * (sheathed ? 1.6 : 1.9) * z;
            const kneeLiftR = Math.max(0, Math.cos(phase)) * (sheathed ? 1.6 : 1.9) * z;
            const bob = Math.abs(Math.sin(phase)) * (rebelling ? 1.8 : (sheathed ? 1.0 : 1.1)) * z;
            const dir = (rebelling || menacing) ? -1 : (Math.cos(r.prowlPhase || 0) >= 0 ? 1 : -1);
            const slash = rebelling
                ? (-0.45 + Math.sin(time * 15 + r.id) * 1.05) * dir
                : (menacing ? (-0.40 + Math.sin(time * 6.5 + r.id) * 0.55) * dir : (-0.35 + Math.sin(time * 3.8 + r.id) * 0.28) * dir);

            ctx.save();
            // Ground aura
            ctx.fillStyle = rebelling ? 'rgba(244, 63, 94, 0.36)' : (sheathed ? 'rgba(168, 162, 158, 0.20)' : (menacing ? `rgba(244, 63, 94, ${0.22 + 0.10 * Math.sin(time * 5)})` : 'rgba(251, 113, 133, 0.22)'));
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2 * z, 9.2 * z, 4.2 * z, 0, 0, Math.PI * 2); ctx.fill();

            // Articulated wide-stance pleated dark-crimson Hakama & Suneate shin-guards
            const stanceW = rebelling ? 6.6 * z : 5.4 * z;
            ctx.fillStyle = '#1f1218';
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.32)'; ctx.lineWidth = 0.85 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 4.8 * z, pos.y - 8.5 * z - bob);
            ctx.quadraticCurveTo(pos.x - stanceW * 0.7 - stride * 0.3, pos.y - 4.2 * z - kneeLiftL * 0.5, pos.x - stanceW - stride * 0.55, pos.y + 1.2 * z - kneeLiftL * 0.35);
            ctx.lineTo(pos.x - 0.7 * z, pos.y + 1.2 * z);
            ctx.lineTo(pos.x + 0.7 * z, pos.y + 1.2 * z);
            ctx.lineTo(pos.x + stanceW + stride * 0.55, pos.y + 1.2 * z - kneeLiftR * 0.35);
            ctx.quadraticCurveTo(pos.x + stanceW * 0.7 + stride * 0.3, pos.y - 4.2 * z - kneeLiftR * 0.5, pos.x + 4.8 * z, pos.y - 8.5 * z - bob);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Suneate crimson-iron shin guards
            ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 1.3 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - stanceW * 0.65 - stride * 0.35, pos.y - 3.2 * z - kneeLiftL * 0.5);
            ctx.lineTo(pos.x - stanceW * 0.88 - stride * 0.55, pos.y + 1.0 * z - kneeLiftL * 0.35);
            ctx.moveTo(pos.x + stanceW * 0.65 + stride * 0.35, pos.y - 3.2 * z - kneeLiftR * 0.5);
            ctx.lineTo(pos.x + stanceW * 0.88 + stride * 0.55, pos.y + 1.0 * z - kneeLiftR * 0.35);
            ctx.stroke();

            // Tattered Sashimono back-banner with notched top edge & broken clan mon
            const bannerX = pos.x - dir * 4.2 * z;
            const flagFlutter = Math.sin(time * 6.5 + (r.id || 0)) * 1.1 * z;
            ctx.strokeStyle = '#451a03'; ctx.lineWidth = 1.4 * z;
            ctx.beginPath(); ctx.moveTo(bannerX, pos.y - 14 * z - bob); ctx.lineTo(bannerX, pos.y - 29.5 * z - bob); ctx.stroke();
            ctx.fillStyle = '#4c0519'; ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 1.0 * z;
            const flagLeft = bannerX - (dir > 0 ? 6.6 * z : 0) + flagFlutter * 0.3;
            ctx.beginPath();
            ctx.moveTo(flagLeft, pos.y - 29.0 * z - bob);
            ctx.lineTo(flagLeft + 6.6 * z, pos.y - 26.8 * z - bob);
            ctx.lineTo(flagLeft + 6.6 * z, pos.y - 19.0 * z - bob);
            ctx.lineTo(flagLeft, pos.y - 19.5 * z - bob);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Multi-plate Laced Obsidian & Crimson Do-maru Cuirass + Sode shoulder plates
            ctx.fillStyle = '#18181b'; ctx.strokeStyle = rebelling ? '#f43f5e' : '#fb7185'; ctx.lineWidth = 1.2 * z;
            ctx.beginPath(); ctx.roundRect(pos.x - 5.8 * z, pos.y - 17.2 * z - bob, 11.6 * z, 9.5 * z, 2.2 * z); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#9f1239'; ctx.lineWidth = 0.9 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 5.2 * z, pos.y - 13.8 * z - bob); ctx.lineTo(pos.x + 5.2 * z, pos.y - 13.8 * z - bob);
            ctx.moveTo(pos.x - 5.2 * z, pos.y - 10.8 * z - bob); ctx.lineTo(pos.x + 5.2 * z, pos.y - 10.8 * z - bob);
            ctx.stroke();
            // Asymmetric weathered Sode shoulder guards
            ctx.fillStyle = '#3f0d1b'; ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 0.85 * z;
            ctx.fillRect(pos.x - 7.8 * z, pos.y - 16.8 * z - bob, 2.6 * z, 6.0 * z);
            ctx.strokeRect(pos.x - 7.8 * z, pos.y - 16.8 * z - bob, 2.6 * z, 6.0 * z);
            ctx.fillRect(pos.x + 5.2 * z, pos.y - 16.8 * z - bob, 2.6 * z, 5.2 * z);
            ctx.strokeRect(pos.x + 5.2 * z, pos.y - 16.8 * z - bob, 2.6 * z, 5.2 * z);

            // Head, Oni Menpo half-mask with glowing eyes, and Wild Unbound Ronin Hair
            ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(pos.x, pos.y - 20.2 * z - bob, 3.7 * z, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#18181b';
            ctx.beginPath(); ctx.arc(pos.x, pos.y - 19.6 * z - bob, 3.4 * z, 0.1, Math.PI - 0.1); ctx.fill();
            ctx.fillStyle = rebelling ? '#f43f5e' : (sheathed ? '#a8a29e' : '#fbbf24');
            ctx.fillRect(pos.x - 2.1 * z, pos.y - 21.0 * z - bob, 1.4 * z, 1.0 * z);
            ctx.fillRect(pos.x + 0.7 * z, pos.y - 21.0 * z - bob, 1.4 * z, 1.0 * z);

            // Wild unbound Ronin hair
            ctx.fillStyle = '#18181b';
            ctx.beginPath();
            ctx.moveTo(pos.x - 5.8 * z, pos.y - 20.8 * z - bob);
            ctx.lineTo(pos.x - 3.8 * z, pos.y - 27.2 * z - bob);
            ctx.lineTo(pos.x - 0.5 * z, pos.y - 23.8 * z - bob);
            ctx.lineTo(pos.x + 1.5 * z, pos.y - 28.0 * z - bob);
            ctx.lineTo(pos.x + 4.4 * z, pos.y - 26.8 * z - bob);
            ctx.lineTo(pos.x + 5.8 * z, pos.y - 20.8 * z - bob);
            ctx.closePath(); ctx.fill();

            if (sheathed) {
                // Katana put away in scabbard (saya) at hip; arms resting idly
                ctx.strokeStyle = '#3f0d1b'; ctx.lineWidth = 2.4 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x + dir * 3.2 * z, pos.y - 14.5 * z - bob);
                ctx.lineTo(pos.x + dir * 4.5 * z, pos.y - 9.0 * z - bob);
                ctx.stroke();
                ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2.4 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - dir * 5.2 * z, pos.y - 10.0 * z - bob);
                ctx.lineTo(pos.x + dir * 6.5 * z, pos.y - 7.2 * z - bob);
                ctx.stroke();
                ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.4 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - dir * 3.5 * z, pos.y - 11.2 * z - bob);
                ctx.lineTo(pos.x - dir * 3.5 * z, pos.y - 8.2 * z - bob);
                ctx.stroke();
            } else {
                // Articulated sword arm & gleaming curved Katana
                const gripX = pos.x + dir * 5.5 * z;
                const gripY = pos.y - 12.8 * z - bob;
                ctx.strokeStyle = '#3f0d1b'; ctx.lineWidth = 2.6 * z;
                ctx.beginPath(); ctx.moveTo(pos.x + dir * 2.5 * z, pos.y - 14.5 * z - bob); ctx.lineTo(gripX, gripY); ctx.stroke();

                ctx.save();
                ctx.translate(gripX, gripY);
                ctx.rotate(slash);
                if (rebelling && Math.cos(time * 15 + r.id) > 0.2) {
                    ctx.strokeStyle = 'rgba(244, 63, 94, 0.48)'; ctx.lineWidth = 3.6 * z;
                    ctx.beginPath();
                    ctx.arc(0, 0, 14.5 * z, dir > 0 ? -1.2 : Math.PI - 0.3, dir > 0 ? 0.3 : Math.PI + 1.2);
                    ctx.stroke();
                }
                ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.3 * z;
                ctx.beginPath(); ctx.moveTo(-dir * 3.8 * z, 1.5 * z); ctx.lineTo(0, 0); ctx.stroke();
                ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 1.8 * z;
                ctx.beginPath(); ctx.moveTo(0, -2.8 * z); ctx.lineTo(0, 2.8 * z); ctx.stroke();
                ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 2.4 * z;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(dir * 9.5 * z, -5.2 * z, dir * 18.0 * z, -11.0 * z);
                ctx.stroke();
                ctx.restore();
            }

            if (SimState.showLabels) {
                ctx.font = `bold ${Math.round(8 * z)}px Inter, sans-serif`;
                ctx.fillStyle = rebelling ? '#fda4af' : (sheathed ? '#d6d3d1' : '#fecdd3'); ctx.textAlign = 'center';
                ctx.fillText(rebelling ? '👹 REBELLING!' : (sheathed ? '🗡️ RONIN (Milling)' : '👹 RONIN (Prowling)'), pos.x, pos.y - 31.5 * z - bob);
            }
            ctx.restore();
        }

        function drawYardWorker(gx, gy, gz, phase, tunicCol, toolType, isSenescenceWalker = false) {
            if (SimState.senescenceActive && !isSenescenceWalker) return;
            if (SimState.cellDead || SimState.crisisState === 'necrosis' || SimState.crisisState === 'starvation' || (SimState.apoptosisSequence && SimState.apoptosisSequence.act !== 'rampage') || (SimState.necrosisSequence && SimState.necrosisSequence.act !== 'surge') || (SimState.starvationSequence && SimState.starvationSequence.act !== 'scavenge')) return;
            if (SimState.crisisState === 'nafld') phase = phase * 0.30;
            const pos = isoToScreen(gx, gy, gz); const z = Camera.zoom;
            const time = performance.now() * 0.001;
            const isThriller = !!SimState.warburgActive || SimState.crisisState === 'warburg';
            if (isThriller) {
                // Synchronized Michael Jackson "Thriller" Zombie Dance!
                const beat = time * 5.2;
                const snap = Math.sin(beat); // left-right shoulder & claw snap
                const dip = Math.abs(Math.sin(beat * 2)) * 2.2 * z;
                const lean = snap * 3.0 * z;
                const clawDir = snap >= 0 ? 1 : -1;
                ctx.save();
                ctx.fillStyle = 'rgba(57, 255, 20, 0.28)';
                ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2 * z, 8.5 * z, 3.8 * z, 0, 0, Math.PI * 2); ctx.fill();

                // Bent-knee Thriller stance
                ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2.0 * z;
                ctx.beginPath();
                ctx.moveTo(pos.x - 2.2 * z + lean * 0.3, pos.y - 5.5 * z + dip * 0.5);
                ctx.lineTo(pos.x - 3.6 * z + lean * 0.5, pos.y - 2.2 * z + dip);
                ctx.lineTo(pos.x - 2.8 * z, pos.y + 1.2 * z);
                ctx.moveTo(pos.x + 2.2 * z + lean * 0.3, pos.y - 5.5 * z + dip * 0.5);
                ctx.lineTo(pos.x + 3.6 * z + lean * 0.5, pos.y - 2.2 * z + dip);
                ctx.lineTo(pos.x + 2.8 * z, pos.y + 1.2 * z);
                ctx.stroke();

                // Swaying torso
                ctx.fillStyle = tunicCol; ctx.strokeStyle = '#39ff14'; ctx.lineWidth = 1.2 * z;
                ctx.beginPath(); ctx.roundRect(pos.x - 5.0 * z + lean * 0.5, pos.y - 15.2 * z + dip, 10.0 * z, 9.8 * z, 2.2 * z); ctx.fill(); ctx.stroke();

                // Pale zombie head tilted on the beat
                ctx.fillStyle = '#bef264'; ctx.beginPath(); ctx.arc(pos.x + lean * 0.7, pos.y - 18.2 * z + dip, 3.6 * z, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#f8fafc'; ctx.fillRect(pos.x - 3.8 * z + lean * 0.7, pos.y - 20.2 * z + dip, 7.6 * z, 2.0 * z);

                // Signature Thriller Zombie Claw Arms snapping left-right in unison!
                ctx.strokeStyle = '#bef264'; ctx.lineWidth = 2.1 * z; ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(pos.x - 4.2 * z + lean * 0.5, pos.y - 13.5 * z + dip);
                ctx.lineTo(pos.x + clawDir * 7.5 * z, pos.y - 16.0 * z + dip);
                ctx.lineTo(pos.x + clawDir * 9.5 * z, pos.y - 12.5 * z + dip);
                ctx.moveTo(pos.x + 4.2 * z + lean * 0.5, pos.y - 13.5 * z + dip);
                ctx.lineTo(pos.x + clawDir * 10.5 * z, pos.y - 14.5 * z + dip);
                ctx.lineTo(pos.x + clawDir * 12.2 * z, pos.y - 11.0 * z + dip);
                ctx.stroke();

                if (SimState.showLabels && Math.sin(beat * 0.5) > 0.6) {
                    ctx.font = `bold ${Math.round(7.0 * z)}px Inter, sans-serif`;
                    ctx.fillStyle = '#a3e635';
                    ctx.textAlign = 'center';
                    ctx.fillText('🧟🕺', pos.x + lean * 0.5, pos.y - 24 * z + dip);
                }
                ctx.restore();
                return;
            }
            const swing = Math.sin(phase);
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.32)';
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2 * z, 6.5 * z, 3.0 * z, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2.0 * z;
            ctx.beginPath();
            ctx.moveTo(pos.x - 2 * z, pos.y - 5.5 * z); ctx.lineTo(pos.x - 2.6 * z, pos.y + 1.2 * z);
            ctx.moveTo(pos.x + 2 * z, pos.y - 5.5 * z); ctx.lineTo(pos.x + 2.6 * z, pos.y + 1.2 * z);
            ctx.stroke();
            ctx.fillStyle = tunicCol; ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.1 * z;
            ctx.beginPath(); ctx.roundRect(pos.x - 5.0 * z, pos.y - 15.2 * z, 10.0 * z, 9.8 * z, 2.2 * z); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(pos.x, pos.y - 18.2 * z, 3.6 * z, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f8fafc'; ctx.fillRect(pos.x - 3.8 * z, pos.y - 20.2 * z, 7.6 * z, 2.0 * z);

            ctx.save();
            ctx.translate(pos.x + 3.8 * z, pos.y - 12.5 * z);
            ctx.rotate(swing * 0.65);
            if (toolType === 'cleaver') {
                ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.9 * z;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(4 * z, -4 * z); ctx.stroke();
                ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1 * z;
                ctx.beginPath(); ctx.roundRect(3 * z, -9.5 * z, 7.0 * z, 4.8 * z, 1 * z); ctx.fill(); ctx.stroke();
            } else if (toolType === 'mallet') {
                ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2.1 * z;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7.5 * z, -7.5 * z); ctx.stroke();
                ctx.fillStyle = '#d97706'; ctx.strokeStyle = '#451a03'; ctx.lineWidth = 1 * z;
                ctx.beginPath(); ctx.roundRect(4.8 * z, -11.5 * z, 7.5 * z, 4.8 * z, 1.5 * z); ctx.fill(); ctx.stroke();
            } else {
                ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.4 * z;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8.5 * z, -6.5 * z); ctx.stroke();
            }
            ctx.restore();
            ctx.restore();
        }

        function updateHUD() {
            const mv = SimState.cellDead ? 0 : Math.round(140 + (SimState.damLevel / 100) * 80);
            document.getElementById('hudDamMv').textContent = `${mv} mV`;
            document.getElementById('hudDamBar').style.width = `${SimState.damLevel}%`;
            document.getElementById('hudAtpRate').textContent = SimState.atpRate.toFixed(1);
            document.getElementById('hudHeatRate').textContent = SimState.heatRate.toFixed(1);
            document.getElementById('hudKetoneRate').textContent = SimState.ketoneRate.toFixed(1);
            document.getElementById('hudRosLevel').textContent = SimState.rosLevel;
            document.getElementById('hudPoolRatio').textContent = `${SimState.atpCount}:${SimState.adpCount}`;
            document.getElementById('hudGshText').textContent = `${Math.round(SimState.gshReserve)}%`;
            document.getElementById('hudGshBar').style.width = `${Math.round(SimState.gshReserve)}%`;

            const scafVal = Math.round(SimState.shrineScaffolding);
            const scafTextEl = document.getElementById('hudScaffoldText');
            const scafBarEl = document.getElementById('hudScaffoldBar');
            if (scafTextEl && scafBarEl) {
                scafTextEl.textContent = `${scafVal}%`;
                scafBarEl.style.width = `${scafVal}%`;
                scafTextEl.className = scafVal > 65
                    ? 'font-mono font-bold text-fuchsia-400'
                    : (scafVal >= 20 ? 'font-mono font-bold text-emerald-300' : 'font-mono font-bold text-sky-300');
            }

            const ampkBadge = document.getElementById('hudAmpkBadge');
            if (ampkBadge) {
                if (SimState.crisisState === 'warburg') {
                    ampkBadge.textContent = '🧟 WARBURG ZOMBIE';
                    ampkBadge.className = 'px-2 py-0.5 rounded-lg bg-lime-500/30 border border-lime-400 text-lime-200 font-bold text-[10px] whitespace-nowrap';
                } else if (SimState.crisisState === 'necrosis') {
                    ampkBadge.textContent = '☠️ NECROSIS!';
                    ampkBadge.className = 'px-2 py-0.5 rounded-lg bg-rose-500/30 border border-rose-400 text-rose-200 font-bold text-[10px] whitespace-nowrap';
                } else if (SimState.senescenceActive) {
                    ampkBadge.textContent = '⛩️ SENESCENCE!';
                    ampkBadge.className = 'px-2 py-0.5 rounded-lg bg-amber-500/30 border border-amber-400 text-amber-200 font-bold text-[10px] whitespace-nowrap';
                } else if (SimState.roninRebelling) {
                    ampkBadge.textContent = '👹 >60% REBELLION!';
                    ampkBadge.className = 'px-2 py-0.5 rounded-lg bg-red-500/25 border border-red-500/60 text-red-300 font-bold text-[10px] whitespace-nowrap';
                } else if (SimState.roninCount > 0) {
                    ampkBadge.textContent = `👹 Ronin Prowling (${SimState.roninCount}/13)`;
                    ampkBadge.className = 'px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-400/60 text-rose-200 font-bold text-[10px] whitespace-nowrap';
                } else if (SimState.ampkActive || SimState.ninjas.length > 0) {
                    ampkBadge.textContent = `🥷 AMPK Autophagy (${SimState.ninjaInterventionsUsed}/${BioConfig.maxNinjaInterventions})`;
                    ampkBadge.className = 'px-2 py-0.5 rounded-lg bg-purple-500/25 border border-purple-400/60 text-purple-200 font-bold text-[10px] whitespace-nowrap';
                } else if (SimState.mtorActive || SimState.monks.length > 0) {
                    ampkBadge.textContent = `🧘‍♂️ mTOR Building (${scafVal}%)`;
                    ampkBadge.className = 'px-2 py-0.5 rounded-lg bg-amber-500/25 border border-amber-400/60 text-amber-200 font-bold text-[10px] whitespace-nowrap';
                } else {
                    ampkBadge.textContent = '☯️ Dynamic Balance';
                    ampkBadge.className = 'px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-medium text-[10px] whitespace-nowrap';
                }
            }

            const crisisLbl = document.getElementById('lblGarrisonCrisis');
            if (crisisLbl) {
                if (SimState.roninRebelling) {
                    crisisLbl.textContent = `👹 ${SimState.roninCount}/20 REBELLING!`;
                    crisisLbl.className = 'text-red-400 font-bold';
                } else if (SimState.roninCount > 0) {
                    crisisLbl.textContent = `👹 Ronin: ${SimState.roninCount}/13 (60%)`;
                    crisisLbl.className = 'text-rose-300 font-bold';
                } else if (SimState.ampkActive) {
                    crisisLbl.textContent = '🥷 AMPK Active';
                    crisisLbl.className = 'text-purple-300 font-semibold';
                } else if (SimState.mtorActive) {
                    crisisLbl.textContent = '🧘‍♂️ mTOR Anabolism';
                    crisisLbl.className = 'text-amber-300 font-semibold';
                } else {
                    crisisLbl.textContent = `ATP:${SimState.atpCount} / ADP:${SimState.adpCount}`;
                    crisisLbl.className = 'text-emerald-300/80';
                }
            }

            const fatEffEl = document.getElementById('lblFatEffective');
            if (fatEffEl) {
                if (SimState.fatInhibitionLevel > 0.15) {
                    fatEffEl.textContent = `CPT-1 Blocked: ${Math.round(SimState.effectiveFat)}%`;
                    fatEffEl.className = 'text-rose-400 font-semibold';
                } else {
                    fatEffEl.textContent = `Effective: ${Math.round(SimState.effectiveFat)}%`;
                    fatEffEl.className = 'text-amber-300/80';
                }
            }
            const glucEffEl = document.getElementById('lblGlucEffective');
            const irBlock = SimState.glut4ForcedOpenTimer > 0 ? SimState.insulinResistance * 0.15 : SimState.insulinResistance;
            if (glucEffEl) {
                if (SimState.warburgActive) {
                    glucEffEl.textContent = `🧪 Warburg Lactate!`;
                    glucEffEl.className = 'text-lime-400 font-bold';
                } else if (SimState.glut4ForcedOpenTimer > 0) {
                    glucEffEl.textContent = `🥷 GLUT4 Picked: ${Math.round(SimState.effectiveGlucose)}%`;
                    glucEffEl.className = 'text-purple-300 font-semibold';
                } else if (irBlock > 0.18) {
                    glucEffEl.textContent = `🔒 Insulin Resist: ${Math.round(SimState.effectiveGlucose)}%`;
                    glucEffEl.className = 'text-fuchsia-400 font-semibold';
                } else if (SimState.randleBlockLevel > 0.15) {
                    glucEffEl.textContent = `PDH Blocked: ${Math.round(SimState.effectiveGlucose)}%`;
                    glucEffEl.className = 'text-amber-400 font-semibold';
                } else {
                    glucEffEl.textContent = `Effective: ${Math.round(SimState.effectiveGlucose)}%`;
                    glucEffEl.className = 'text-blue-300/80';
                }
            }

            const randleBadge = document.getElementById('hudRandleBadge');
            if (randleBadge) {
                if (SimState.warburgActive) {
                    randleBadge.textContent = `🧪 HIF-1α / PDK1 Fermenting`;
                    randleBadge.className = 'px-2 py-0.5 rounded-lg bg-lime-500/20 border border-lime-400/50 text-lime-300 font-bold text-[10px] whitespace-nowrap';
                } else if (irBlock > 0.22) {
                    randleBadge.textContent = `🔒 GLUT4 Insulin Resist (-${Math.round(irBlock * 100)}%)`;
                    randleBadge.className = 'px-2 py-0.5 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/50 text-fuchsia-300 font-bold text-[10px] whitespace-nowrap';
                } else if (SimState.fatInhibitionLevel > 0.25 && SimState.randleBlockLevel > 0.25) {
                    randleBadge.textContent = '⚔️ Randle Gridlock!';
                    randleBadge.className = 'px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 font-bold text-[10px] whitespace-nowrap';
                } else if (SimState.randleBlockLevel > 0.22) {
                    randleBadge.textContent = `Randle: Fat ⊣ Glc (-${Math.round(SimState.randleBlockLevel * 100)}%)`;
                    randleBadge.className = 'px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold text-[10px] whitespace-nowrap';
                } else if (SimState.fatInhibitionLevel > 0.22) {
                    randleBadge.textContent = `Malonyl: Glc ⊣ Fat (-${Math.round(SimState.fatInhibitionLevel * 100)}%)`;
                    randleBadge.className = 'px-2 py-0.5 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-300 font-semibold text-[10px] whitespace-nowrap';
                } else {
                    randleBadge.textContent = 'Gates: Clear';
                    randleBadge.className = 'px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-medium text-[10px] whitespace-nowrap';
                }
            }
        }        document.getElementById('sliderFat').addEventListener('input', (e) => { SimState.fatSupply = Number(e.target.value); document.getElementById('valFat').textContent = `${SimState.fatSupply}%`; });
        document.getElementById('sliderGlucose').addEventListener('input', (e) => { SimState.glucoseSupply = Number(e.target.value); document.getElementById('valGlucose').textContent = `${SimState.glucoseSupply}%`; });
        document.getElementById('sliderDemand').addEventListener('input', (e) => { SimState.samuraiDemand = Number(e.target.value); document.getElementById('valDemand').textContent = `${SimState.samuraiDemand}%`; });
        document.getElementById('sliderAntiox').addEventListener('input', (e) => { SimState.antioxSynthesis = Number(e.target.value); document.getElementById('valAntiox').textContent = `${SimState.antioxSynthesis}%`; });

        function setSluiceGate(open) {
            SimState.sluiceOpen = open;
            document.getElementById('statusSluice').textContent = open ? 'VENTING' : 'CLOSED';
            document.getElementById('sluiceBtnText').textContent = open ? 'Close Spillway' : 'Open Spillway';
        }
        document.getElementById('btnToggleSluice').addEventListener('click', () => setSluiceGate(!SimState.sluiceOpen));

        const Presets = {
            fasted: { fat: 80, gluc: 10, demand: 55, antiox: 75, sluice: false },
            exercise: { fat: 55, gluc: 80, demand: 80, antiox: 85, sluice: false },
            starvation: { fat: 5, gluc: 5, demand: 95, antiox: 20, sluice: false, drainDam: true },
            overfed: { fat: 90, gluc: 90, demand: 15, antiox: 70, sluice: false },
            cold: { fat: 85, gluc: 30, demand: 25, antiox: 70, sluice: true }
        };

        document.getElementById('btnResetApoptosis').addEventListener('click', resetFullSimulation);
        document.getElementById('btnResetSenescence').addEventListener('click', resetFullSimulation);
        document.getElementById('btnCloseInspector').addEventListener('click', () => document.getElementById('inspectorCard').classList.add('hidden'));
        document.getElementById('btnResetCam').addEventListener('click', centerCamera);

        function setExplanationVisibility(show) {
            SimState.showExplanations = show;
            const body = document.getElementById('inspectorBody');
            if (body) body.classList.toggle('hidden', !show);
            const bottomTxt = document.getElementById('lblToggleExplText');
            if (bottomTxt) bottomTxt.textContent = show ? 'Explanations: ON' : 'Explanations: OFF';
            const inlineBtn = document.getElementById('btnInlineToggleExpl');
            if (inlineBtn) inlineBtn.textContent = show ? 'Hide Details ▲' : 'Show Details ▼';
        }

        document.getElementById('btnToggleLabels').addEventListener('click', () => {
            SimState.showLabels = !SimState.showLabels;
            document.getElementById('lblToggleLabelsText').textContent = SimState.showLabels ? 'Labels: ON' : 'Labels: OFF';
        });

        document.getElementById('btnToggleExplanation').addEventListener('click', () => {
            setExplanationVisibility(!SimState.showExplanations);
        });

        document.getElementById('btnInlineToggleExpl').addEventListener('click', () => {
            setExplanationVisibility(!SimState.showExplanations);
        });

        const configDrawer = document.getElementById('configDrawer');
        document.getElementById('btnToggleConfig').addEventListener('click', () => configDrawer.classList.toggle('hidden'));
        document.getElementById('btnCloseConfig').addEventListener('click', () => configDrawer.classList.add('hidden'));

        document.getElementById('cfgRandle').addEventListener('input', (e) => {
            BioConfig.randleInhibitionStrength = parseFloat(e.target.value);
            document.getElementById('cfgRandleVal').textContent = BioConfig.randleInhibitionStrength.toFixed(2);
        });
        document.getElementById('cfgMalonyl').addEventListener('input', (e) => {
            BioConfig.malonylInhibitionStrength = parseFloat(e.target.value);
            document.getElementById('cfgMalonylVal').textContent = BioConfig.malonylInhibitionStrength.toFixed(2);
        });
        document.getElementById('cfgNinjaBoost').addEventListener('input', (e) => {
            BioConfig.ninjaBoostAmount = parseInt(e.target.value, 10);
            document.getElementById('cfgNinjaBoostVal').textContent = `+${BioConfig.ninjaBoostAmount}%`;
        });
        document.getElementById('cfgRoninWait').addEventListener('input', (e) => {
            BioConfig.roninPatienceLimit = parseFloat(e.target.value);
            document.getElementById('cfgRoninWaitVal').textContent = `${BioConfig.roninPatienceLimit.toFixed(1)}s`;
        });
        document.getElementById('cfgMtorSpeed').addEventListener('input', (e) => {
            BioConfig.mtorBuildSpeed = parseFloat(e.target.value);
            document.getElementById('cfgMtorSpeedVal').textContent = `${BioConfig.mtorBuildSpeed.toFixed(1)}x`;
        });
        document.getElementById('btnResetConfig').addEventListener('click', () => {
            BioConfig.randleInhibitionStrength = 0.65; document.getElementById('cfgRandle').value = 0.65; document.getElementById('cfgRandleVal').textContent = '0.65';
            BioConfig.malonylInhibitionStrength = 0.70; document.getElementById('cfgMalonyl').value = 0.70; document.getElementById('cfgMalonylVal').textContent = '0.70';
            BioConfig.ninjaBoostAmount = 5; document.getElementById('cfgNinjaBoost').value = 5; document.getElementById('cfgNinjaBoostVal').textContent = '+5%';
            BioConfig.roninPatienceLimit = 9.0; document.getElementById('cfgRoninWait').value = 9.0; document.getElementById('cfgRoninWaitVal').textContent = '9.0s';
            BioConfig.mtorBuildSpeed = 1.0; document.getElementById('cfgMtorSpeed').value = 1.0; document.getElementById('cfgMtorSpeedVal').textContent = '1.0x';
        });

        let lastFrameTime = performance.now();
        let _gameLoopErrors = 0;
        function gameLoop(now) {
            const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
            lastFrameTime = now;
            try {
                updateSimulation(dt);
            } catch (err) {
                _gameLoopErrors++;
                console.error('[Koku & Steam] updateSimulation error #' + _gameLoopErrors + ':', err);
            }
            try {
                renderScene();
            } catch (err) {
                _gameLoopErrors++;
                console.error('[Koku & Steam] renderScene error #' + _gameLoopErrors + ':', err);
            }
            requestAnimationFrame(gameLoop);
        }

        window.onload = function () {
            centerCamera();
            initSamuraiGarrison();
            requestAnimationFrame(gameLoop);
        };
