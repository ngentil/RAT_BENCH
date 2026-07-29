// Single source of truth for "what spec fields does this machine actually
// have data for" — shared between MachineCard's Engine Spec render and the
// Tile Badges / Layout customization pickers (src/components/ui/config.jsx).
// Extracted from MachineCard.jsx, which used to build this list inline while
// the pickers read from a separate, smaller curated list — the two drifted
// apart over time (new fields like Outboard Motor specs got added here but
// never added to the picker's list), so a field could have real data and
// still be impossible to select as a tile badge or layout section. Reading
// both from this one function makes that drift structurally impossible.

export function getMachineSpecEntries(m) {
  return [
    m.year&&{label:"Year",value:m.year},
    m.colour&&{label:"Colour",value:m.colour},
    m.bodyType&&{label:"Body Type",value:m.bodyType},
    m.driveConfig&&{label:"Drive Config",value:m.driveConfig},
    m.strokeType&&{label:"Engine Type",value:m.strokeType},
    m.cylCount&&{label:"Cylinder Count",value:m.cylCount+(parseInt(m.cylCount)>=2&&m.firingOrder?" · Firing: "+m.firingOrder:"")},
    m.valveTrain&&{label:"Valve Train",value:m.valveTrain+(m.camType?" · "+m.camType:"")},
    m.locknutSize&&{label:"Rocker Locknut",value:m.locknutSize},
    m.iValveFace&&{label:"Intake Valve",value:m.iValveFace+"mm face"+(m.iValveStem?" · "+m.iValveStem+"mm stem":"")+(m.iValveLift?" · "+m.iValveLift+"mm lift":"")+(m.iValveWeight?" · "+m.iValveWeight+"g":"")},
    m.eValveFace&&{label:"Exhaust Valve",value:m.eValveFace+"mm face"+(m.eValveStem?" · "+m.eValveStem+"mm stem":"")+(m.eValveLift?" · "+m.eValveLift+"mm lift":"")+(m.eValveWeight?" · "+m.eValveWeight+"g":"")},
    m.springFreeLen&&{label:"Valve Spring",value:m.springFreeLen+"mm free"+(m.springOuterD?" · ⌀"+m.springOuterD+"mm":"")+(m.springWireD?" · wire "+m.springWireD+"mm":"")+(m.springWeight?" · "+m.springWeight+"g":"")},
    m.ccSize&&{label:"CC Size / Rating",value:m.ccSize+" cc"},
    m.compression&&{label:"Compression",value:m.compression+" PSI"},
    m.idleRpm&&{label:"Idle RPM (approx)",value:m.idleRpm+" rpm"},
    m.wotRpm&&{label:"WOT RPM (approx)",value:m.wotRpm+" rpm"},
    m.plugType&&{label:"Spark Plug Type",value:m.plugType},
    m.plugGap&&{label:"Spark Plug Gap",value:m.plugGap+" mm"},
    m.coilType&&{label:"Coil Type",value:m.coilType},
    m.primaryOhms&&{label:"Primary Coil",value:m.primaryOhms+" Ω"},
    m.secondaryOhms&&{label:"Secondary Coil",value:m.secondaryOhms+" Ω"},
    m.starterType&&{label:"Starter System",value:m.starterType},
    m.ropeDiameter&&{label:"Starter Rope",value:m.ropeDiameter+"mm ⌀"+(m.ropeLength?" · "+m.ropeLength+"mm long":"")},
    m.rBoltN&&{label:"Recoil Bolts",value:m.rBoltN+" bolts"+(m.rBoltSz?" · "+m.rBoltSz:"")+(m.rBoltLen?" · "+m.rBoltLen+"mm":"")},
    m.intakeValveClear&&{label:"Intake Valve Clearance",value:m.intakeValveClear+" mm · "+m.intakeValveN+" valve"+(m.intakeValveN!=="1"?"s":"")},
    m.exhaustValveClear&&{label:"Exhaust Valve Clearance",value:m.exhaustValveClear+" mm · "+m.exhaustValveN+" valve"+(m.exhaustValveN!=="1"?"s":"")},
    m.iSpacing&&{label:"Intake Stud Center Spacing",value:m.iSpacing+" mm",highlight:true},
    m.iStuds&&m.iStuds!==""&&{label:"Intake Studs per Side",value:m.iStuds,highlight:true},
    m.iBoltSz&&{label:"Intake Stud Diameter",value:m.iBoltSz+(m.iBoltLen?" · "+m.iBoltLen+" mm":""),highlight:true},
    m.eSpacing&&{label:"Exhaust Stud Center Spacing",value:m.eSpacing+" mm",highlight:true},
    m.eStuds&&m.eStuds!==""&&{label:"Exhaust Studs per Side",value:m.eStuds,highlight:true},
    m.eBoltSz&&{label:"Exhaust Stud Diameter",value:m.eBoltSz+(m.eBoltLen?" · "+m.eBoltLen+" mm":""),highlight:true},
    m.iPW&&m.iPH&&{label:"Intake Port Dimensions",value:m.iPW+"×"+m.iPH+" mm"+(m.iPCond==="Modified"?" · Modified ✦":"")},
    m.ePW&&m.ePH&&{label:"Exhaust Port Dimensions",value:m.ePW+"×"+m.ePH+" mm"+(m.ePCond==="Modified"?" · Modified ✦":"")},
    m.pulseLoc&&m.strokeType==="2-stroke"&&{label:"Pulse Port Location",value:m.pulseLoc+(m.pulsePos?" · "+m.pulsePos:"")+(m.pulseOffset?" · "+m.pulseOffset+" mm offset":"")},
    m.boreDiameter&&{label:"Cylinder Bore Diameter",value:m.boreDiameter+" mm"},
    m.ptoDiameter&&{label:"PTO Shaft Diameter",value:m.ptoDiameter},
    m.shaftType&&{label:"Shaft Type",value:m.shaftType},
    m.threadDir&&{label:"Head Thread Direction",value:m.threadDir},
    m.threadSize&&{label:"Head Thread Size",value:m.threadSize},
    m.sprocketType&&{label:"Sprocket Type",value:m.sprocketType},
    m.fuelSystem&&{label:"Fuel System",value:m.fuelSystem},
    m.cBrand&&{label:"Carb Brand",value:m.cBrand},
    m.cType&&{label:"Carb Type",value:m.cType},
    m.cModel&&{label:"Carb Model",value:m.cModel},
    m.ecuModel&&{label:"ECU",value:m.ecuModel},
    m.tbDiameter&&{label:"Throttle Body",value:m.tbDiameter+" mm"},
    m.injectorCount&&{label:"Injectors",value:m.injectorCount+(m.injectorFlow?" · "+m.injectorFlow+" cc/min":"")},
    m.fuelRailPressure&&{label:"Fuel Rail Pressure",value:m.fuelRailPressure+" bar"},
    m.tpsSensor&&{label:"TPS",value:m.tpsSensor},
    m.mapSensor&&{label:"MAP Sensor",value:m.mapSensor},
    m.iatSensor&&{label:"IAT Sensor",value:m.iatSensor},
    m.o2Sensor&&{label:"O2 Sensor",value:m.o2Sensor},
    m.iacSensor&&{label:"IAC",value:m.iacSensor},
    m.obShaftLength&&{label:"Shaft Length",value:m.obShaftLength+(m.obTransomHeight?" · Transom: "+m.obTransomHeight+"mm":"")},
    m.obTiltTrim&&{label:"Tilt / Trim",value:m.obTiltTrim+(m.obSteering?" · "+m.obSteering:"")},
    m.obPropPitch&&{label:"Propeller",value:[m.obPropDiameter?m.obPropDiameter+'" dia':null,m.obPropPitch?m.obPropPitch+'" pitch':null,m.obPropMaterial].filter(Boolean).join(" · ")},
    m.obGearRatio&&{label:"Gear Ratio",value:m.obGearRatio},
    m.obLowerUnitOilType&&{label:"Lower Unit Oil",value:m.obLowerUnitOilType+(m.obLowerUnitOilCapacity?" · "+m.obLowerUnitOilCapacity+"mL":"")},
    m.obAnodeMaterial&&{label:"Anode Material",value:m.obAnodeMaterial},
    m.obBreakInHours&&{label:"Break-in Hours",value:m.obBreakInHours+"h"},
    m.obImpellerLastChanged&&{label:"Impeller Last Changed",value:m.obImpellerLastChanged},
    // chipper
    m.chipperSpec?.type&&{label:"Chipper Type",value:[m.chipperSpec.type,m.chipperSpec.brand&&m.chipperSpec.brand!=="Other"?m.chipperSpec.brand:m.chipperSpec.brandOther].filter(Boolean).join(" · ")},
    m.chipperSpec?.inchSize&&{label:"Capacity",value:m.chipperSpec.inchSize+'" chip capacity'},
    m.chipperSpec?.bladeCount&&{label:"Blade Count",value:m.chipperSpec.bladeCount},
    m.chipperSpec?.hours&&{label:"Hour Meter",value:m.chipperSpec.hours+"h"},
    m.chipperSpec?.bladeLastSharpened&&{label:"Blades Last Sharpened",value:m.chipperSpec.bladeLastSharpened},
    // stump grinder
    m.stumpGrinderSpec?.brand&&{label:"Brand",value:m.stumpGrinderSpec.brand!=="Other"?m.stumpGrinderSpec.brand:m.stumpGrinderSpec.brandOther},
    m.stumpGrinderSpec?.driveType&&{label:"Drive Type",value:m.stumpGrinderSpec.driveType},
    m.stumpGrinderSpec?.wheelDiameter&&{label:"Wheel",value:m.stumpGrinderSpec.wheelDiameter+'" dia'+(m.stumpGrinderSpec.toothCount?" · "+m.stumpGrinderSpec.toothCount+" teeth":"")},
    m.stumpGrinderSpec?.cuttingDepth&&{label:"Cutting",value:m.stumpGrinderSpec.cuttingDepth+'" depth'+(m.stumpGrinderSpec.cuttingWidth?" · "+m.stumpGrinderSpec.cuttingWidth+'" wide':"")},
    m.stumpGrinderSpec?.hours&&{label:"Hour Meter",value:m.stumpGrinderSpec.hours+"h"},
    m.stumpGrinderSpec?.teethLastReplaced&&{label:"Teeth Last Replaced",value:m.stumpGrinderSpec.teethLastReplaced},
  ].filter(Boolean);
}

// Turns an unlabeled camelCase key into a readable fallback label (e.g.
// "obBreakInHours" -> "Break In Hours") for any field with real data that
// isn't in a curated label list (ALL_BADGE_FIELDS) — shared by the Tile
// Badges picker and its actual badge-render lookup so the two can never
// disagree on what a dynamically-discovered field is called.
export const humanizeKey = k => k.replace(/^ob/, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase()).trim();

// Coarse label -> section-key mapping used by the Layout picker's bucketed
// toggles (e.g. "Engine Specs" hides/shows several related labels at once).
// IMPORTANT: every value here MUST be a key that actually exists in
// ExpandConfig's ALL_EXPAND_SECTIONS (src/components/ui/config.jsx) — a
// label pointed at a section key nobody offers as a checkbox becomes
// permanently unhideable-AND-unshowable the moment any Layout customization
// is ever saved (ef.includes() can never be true for a key that was never a
// real option), which is exactly the bug this whole map used to have: only
// strokeType/iPW/boreDiameter/ptoDiameter/fuelSystem were ever real buckets,
// so saving Layout used to silently and permanently wipe out every plug,
// coil, starter, valve, stud, and sensor field forever. Everything below
// that has no genuine matching bucket is deliberately left OUT of this map
// so it falls through to ExpandConfig's "Other Specs" section instead — a
// real per-field toggle with a safe (default-visible) fallback, rather than
// a fake coarse one that silently breaks.
export const SPEC_LABEL_TO_SECTION = {
  "Engine Type":"strokeType","Cylinder Count":"strokeType","CC Size / Rating":"strokeType","Compression":"strokeType",
  "Intake Port Dimensions":"iPW","Exhaust Port Dimensions":"iPW",
  "Cylinder Bore Diameter":"boreDiameter",
  "PTO Shaft Diameter":"ptoDiameter","Shaft Type":"ptoDiameter","Head Thread Direction":"ptoDiameter","Head Thread Size":"ptoDiameter","Sprocket Type":"ptoDiameter",
  // The "Fuel System" bucket's own hasData already checks cBrand/ecuModel,
  // so carb/ECU/injector/sensor-adjacent labels genuinely belong here too —
  // unlike the old map's invented "cBrand"/"ecuModel" keys, which pointed at
  // buckets that were never real.
  "Fuel System":"fuelSystem","Carb Brand":"fuelSystem","Carb Type":"fuelSystem","Carb Model":"fuelSystem",
  "ECU":"fuelSystem","Throttle Body":"fuelSystem","Injectors":"fuelSystem","Fuel Rail Pressure":"fuelSystem",
};
