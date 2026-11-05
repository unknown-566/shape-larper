# Balance pass — v0.4.8

The aim is to make offensive upgrades visibly improve kill times, keep defensive picks useful, and bound late-run combinations. Automated pacing tests are not a substitute for human difficulty feedback.

## Encounters

Enemy health and attack cadence no longer depend on the number of picked upgrades or estimated player DPS. Previously even picking armor raised enemy health. Health now depends on sector, Endless loop and player count.

| Guardian | Base solo HP |
| --- | ---: |
| Warden | 90 |
| Hive Mother | 170 |
| Core | 260 |
| Orbiter | 340 |
| Stormcaller | 440 |
| Omega | 580 |
| Singularity | 720 |
| Final guardian | 1,000 + 4% per debt |

These replace the previous **base HP plus adaptive multiplier**, so larger table entries do not necessarily mean longer fights. Co-op bosses have 1.65× HP and regular enemies 1.35× HP. Regular HP is `ceil((base + sector * 0.65) * (1 + loop * 0.25) * playersMultiplier)`. Endless guardians gain 50% base HP per loop. Chaser speed caps at 200, shooter interval floors at 0.85 seconds (it previously became negative), and the Endless bullet-speed multiplier caps at 1.5×. Sacrifice bullet-speed penalties separately cap at 1.6×.

## Upgrades and drafting

| Card / system | New behavior |
| --- | --- |
| Overcharge | +25% damage |
| Heavy Barrel | +50% damage, −15% fire rate |
| Split Shot | Up to 5 pellets; pellet damage gets a 0.9 multiplier per extra pellet |
| Piercing Rounds | +2 pierce, distinguishing it from Big Rounds |
| Armor / reinforced armor | Add max HP and heal 1; max HP 12 |
| Phase Boots | −20% cooldown, floor 0.715 seconds including base cooldown |
| Pulse Cell | +30% charge speed, max 3× |
| Pulse, chain, aura | Damage scales with square root of shot damage |
| Shock Dash | Ring pellets deal 60% normal pellet damage |
| Hungry Pact | +2 pellets, −20% damage; offered only at 1–2 pellets |
| Titan Rounds | +90% damage, −20% rate, costs max HP |
| Overclock | +60% rate and +1 pellet, +15% enemy bullet speed |
| Hunter’s Eye | +2 homing, +20% crit, −15% damage |
| Glass Cannon | +65% damage, +15% crit, hitbox +3 |
| Pulse Tithe | Full pulse and +50% charge speed, +8% enemy bullet speed |
| Cursed Coin | +40% kill credits and +15% damage, +8% enemy bullet speed |
| Echo Chamber | Rear shot and +2 bounces, −15% damage |

All card effects, including sacrifices and Gamble rewards, use the same limits: damage 12×, rate 3×, pellets 5, crit 60%, speed 1.65×, pierce 4, orbs 4, homing/bounces/aura/chain/shock/rear/graze 3, one stored revive and one Field Medic level. These are ceilings, not suggested target builds. Adrenaline still temporarily multiplies rate by 1.8.

Completed one-time cards, healing at full health and capped cards without an improvement are excluded from offers. Several sacrifices have additional eligibility rules to avoid becoming worse versions of normal cards at the cap. Fisher–Yates replaces biased random sorting. If every upgrade is exhausted, Supply Cache trades a point for 40 credits. Banishment does not consume a charge without a replacement. Previews and offer checks restore all game state.

Natural kill healing is 4%, at most once per wave; clear healing and Vampiric remain. Revival cannot exceed maximum HP.

## Credits and co-op parity

Bounty Hunter adds 25% kill credits per pick, capped at +100%; Compound Interest caps at +60 per clear. Liquid Armor spends 30 credits with an eight-second cooldown. Capital Rounds grants 1% damage per 50 credits **earned in this run**, capped at 25%; saved wealth no longer affects damage. Cosmetic prices and saved unlocks are unchanged.

Orbs cover both pilots; aura checks either pilot without doubling damage to overlapping targets. Both pilots receive Adrenaline's shared fire-rate boost. Guest boss contact now deals shared-hull damage consistently.

## Validation and limits

`tests/balance.js` verifies HP/cadence independence from offensive and defensive picks, co-op HP, capped combinations, sufficient gap between Hyperdrive invulnerability and dash cooldown, no-op filtering, safe previews, exhausted-pool fallback, run-only Capital Rounds, revival and Endless limits.

`tests/balance-runs.js` completed all six deterministic campaigns (seeds 183/927 × offense/mixed/defense preferences). Simulated completion times were 6.01–7.39 minutes; the longest guardian in each run took 29–52 seconds. This bot uses invulnerability and automatic aim: these are pacing/regression observations, **not measured human completion times or win rates**. Its DPS number is a relative estimate, not observed damage per second. An attempted comparison against v0.4.7 did not complete with the same bot, so no before/after percentage is claimed.

The existing full-run regression also completes the campaign, enters Endless and starts final-boss practice. Boss interception, panel bounds, card layout, protocol rejection and native co-op receive separate regression checks. Both game clients and the optional relay require v0.4.8 (protocol 048), because the new card catalog is not compatible with older clients.
