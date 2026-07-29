// Single source of truth for "what spec fields does this machine actually
// have data for" — shared between MachineCard's Engine Spec render and the
// Tile Badges / Layout customization pickers (src/components/ui/config.jsx).
// Extracted from MachineCard.jsx, which used to build this list inline while
// the pickers read from a separate, smaller curated list — the two drifted
// apart over time (new fields got added here but never added to the
// picker's list), so a field could have real data and still be impossible
// to select as a tile badge or layout item. Reading both from this one
// function makes that drift structurally impossible.
//
// Every entry carries a `section` — every picker groups by this, so a field
// always shows up filed under what it actually is (Engine/Electrics/
// Suspension/etc), never a generic catch-all bucket. This function was
// originally a much shorter list covering only engine/ignition/fuel/valve-
// train fields; MachineForm.jsx actually captures ~150 fields across every
// machine category (drivetrain, suspension, brakes, tyres, electrics, pump,
// generator, fluids, dimensions, service intervals, tracked-machine
// hydraulics, chainsaw bar & chain, EV/electric drive, and deep engine-
// internals like piston/rings/crank/conrod/bearings) — almost all of which
// had ZERO display path anywhere in the app before this list was extended
// to cover them, not just no picker entry.

export function getMachineSpecEntries(m) {
  return [
    // ── General ──────────────────────────────────────────────────────────
    m.year&&{label:"Year",value:m.year,section:"General"},
    m.colour&&{label:"Colour",value:m.colour,section:"General"},
    m.bodyType&&{label:"Body Type",value:m.bodyType,section:"General"},
    m.driveConfig&&{label:"Drive Config",value:m.driveConfig,section:"General"},

    // ── Engine ───────────────────────────────────────────────────────────
    m.strokeType&&{label:"Engine Type",value:m.strokeType,section:"Engine"},
    m.cylCount&&{label:"Cylinder Count",value:m.cylCount+(parseInt(m.cylCount)>=2&&m.firingOrder?" · Firing: "+m.firingOrder:""),section:"Engine"},
    m.valveTrain&&{label:"Valve Train",value:m.valveTrain+(m.camType?" · "+m.camType:""),section:"Engine"},
    m.locknutSize&&{label:"Rocker Locknut",value:m.locknutSize,section:"Engine"},
    m.iValveFace&&{label:"Intake Valve",value:m.iValveFace+"mm face"+(m.iValveStem?" · "+m.iValveStem+"mm stem":"")+(m.iValveLift?" · "+m.iValveLift+"mm lift":"")+(m.iValveWeight?" · "+m.iValveWeight+"g":""),section:"Engine"},
    m.eValveFace&&{label:"Exhaust Valve",value:m.eValveFace+"mm face"+(m.eValveStem?" · "+m.eValveStem+"mm stem":"")+(m.eValveLift?" · "+m.eValveLift+"mm lift":"")+(m.eValveWeight?" · "+m.eValveWeight+"g":""),section:"Engine"},
    m.springFreeLen&&{label:"Valve Spring",value:m.springFreeLen+"mm free"+(m.springOuterD?" · ⌀"+m.springOuterD+"mm":"")+(m.springWireD?" · wire "+m.springWireD+"mm":"")+(m.springWeight?" · "+m.springWeight+"g":""),section:"Engine"},
    m.ccSize&&{label:"CC Size / Rating",value:m.ccSize+" cc",section:"Engine"},
    m.compression&&{label:"Compression",value:m.compression+" PSI",section:"Engine"},
    m.compressionRatio&&{label:"Compression Ratio",value:m.compressionRatio+":1",section:"Engine"},
    m.idleRpm&&{label:"Idle RPM (approx)",value:m.idleRpm+" rpm",section:"Engine"},
    m.wotRpm&&{label:"WOT RPM (approx)",value:m.wotRpm+" rpm",section:"Engine"},
    m.intakeValveClear&&{label:"Intake Valve Clearance",value:m.intakeValveClear+" mm · "+m.intakeValveN+" valve"+(m.intakeValveN!=="1"?"s":""),section:"Engine"},
    m.exhaustValveClear&&{label:"Exhaust Valve Clearance",value:m.exhaustValveClear+" mm · "+m.exhaustValveN+" valve"+(m.exhaustValveN!=="1"?"s":""),section:"Engine"},
    m.iSpacing&&{label:"Intake Stud Center Spacing",value:m.iSpacing+" mm",highlight:true,section:"Engine"},
    m.iStuds&&m.iStuds!==""&&{label:"Intake Studs per Side",value:m.iStuds,highlight:true,section:"Engine"},
    m.iBoltSz&&{label:"Intake Stud Diameter",value:m.iBoltSz+(m.iBoltLen?" · "+m.iBoltLen+" mm":""),highlight:true,section:"Engine"},
    m.eSpacing&&{label:"Exhaust Stud Center Spacing",value:m.eSpacing+" mm",highlight:true,section:"Engine"},
    m.eStuds&&m.eStuds!==""&&{label:"Exhaust Studs per Side",value:m.eStuds,highlight:true,section:"Engine"},
    m.eBoltSz&&{label:"Exhaust Stud Diameter",value:m.eBoltSz+(m.eBoltLen?" · "+m.eBoltLen+" mm":""),highlight:true,section:"Engine"},

    // ── Electric Drive (EV / hybrid — previously 100% invisible) ────────
    m.motorType&&{label:"Motor Type",value:m.motorType,section:"Electric Drive"},
    m.motorPower&&{label:"Motor Power",value:m.motorPower+" kW"+(m.motorTorque?" · "+m.motorTorque+" Nm":""),section:"Electric Drive"},
    m.controllerBrand&&{label:"Controller Brand",value:m.controllerBrand,section:"Electric Drive"},
    m.packVoltage&&{label:"Battery Pack",value:m.packVoltage+"V"+(m.packCapacity?" · "+m.packCapacity+"kWh":"")+(m.battChemistry?" · "+m.battChemistry:"")+(m.cellCount?" · "+m.cellCount+" cells":""),section:"Electric Drive"},
    m.chargePort&&{label:"Charge Port",value:m.chargePort+(m.maxChargeRate?" · "+m.maxChargeRate+"kW max":""),section:"Electric Drive"},
    m.evRange&&{label:"EV Range",value:m.evRange+" km",section:"Electric Drive"},
    m.regenBraking&&{label:"Regenerative Braking",value:m.regenBraking,section:"Electric Drive"},

    // ── Cylinder & Piston ────────────────────────────────────────────────
    m.boreDiameter&&{label:"Cylinder Bore Diameter",value:m.boreDiameter+" mm",section:"Cylinder & Piston"},
    m.pistonDiameter&&{label:"Piston Diameter",value:m.pistonDiameter+"mm"+(m.pistonClearance?" · "+m.pistonClearance+"mm clearance":""),section:"Cylinder & Piston"},
    m.ringCount&&{label:"Piston Rings",value:m.ringCount+" ring"+(m.ringCount!=="1"?"s":"")+(m.ringWidth?" · "+m.ringWidth+"mm wide":"")+(m.ringThickness?" · "+m.ringThickness+"mm thick":""),section:"Cylinder & Piston"},
    (m.ringGapTop||m.ringGapSecond||m.ringGapOil)&&{label:"Ring End Gaps",value:[m.ringGapTop?"Top "+m.ringGapTop+"mm":null,m.ringGapSecond?"2nd "+m.ringGapSecond+"mm":null,m.ringGapOil?"Oil "+m.ringGapOil+"mm":null].filter(Boolean).join(" · "),section:"Cylinder & Piston"},
    m.gudgeonDiameter&&{label:"Gudgeon Pin",value:m.gudgeonDiameter+"mm"+(m.gudgeonLength?" × "+m.gudgeonLength+"mm":"")+(m.gudgeonFit?" · "+m.gudgeonFit:"")+(m.gudgeonCirclip?" · circlip "+m.gudgeonCirclip+"mm":""),section:"Cylinder & Piston"},
    m.cylMaxWear&&{label:"Bore Wear Limit",value:m.cylMaxWear+"mm"+(m.cylTaperLimit?" · taper "+m.cylTaperLimit+"mm":"")+(m.cylOutOfRound?" · OOR "+m.cylOutOfRound+"mm":""),section:"Cylinder & Piston"},
    m.honingAngle&&{label:"Honing Angle",value:m.honingAngle,section:"Cylinder & Piston"},
    m.nikasil&&{label:"Bore Treatment",value:m.nikasil,section:"Cylinder & Piston"},

    // ── Crankshaft ───────────────────────────────────────────────────────
    m.crankStroke&&{label:"Crank Stroke",value:m.crankStroke+" mm",section:"Crankshaft"},
    m.crankPinDiameter&&{label:"Crank Pin",value:m.crankPinDiameter+"mm"+(m.crankPinLength?" × "+m.crankPinLength+"mm":""),section:"Crankshaft"},
    m.mainJournalDiameter&&{label:"Main Journal",value:m.mainJournalDiameter+"mm"+(m.crankEndFloat?" · "+m.crankEndFloat+"mm end float":""),section:"Crankshaft"},
    m.crankRunout&&{label:"Crank Runout",value:m.crankRunout+" mm",section:"Crankshaft"},
    (m.crankSealLeft||m.crankSealRight)&&{label:"Crank Seals",value:[m.crankSealLeft?"L: "+m.crankSealLeft:null,m.crankSealRight?"R: "+m.crankSealRight:null].filter(Boolean).join(" · "),section:"Crankshaft"},

    // ── Connecting Rod ───────────────────────────────────────────────────
    m.conrodLength&&{label:"Conrod Length (C-C)",value:m.conrodLength+"mm"+(m.conrodBearingType?" · "+m.conrodBearingType:""),section:"Connecting Rod"},
    m.conrodSmallEnd&&{label:"Conrod Small End",value:m.conrodSmallEnd+"mm"+(m.conrodSmallClear?" · "+m.conrodSmallClear+"mm clearance":""),section:"Connecting Rod"},
    m.conrodBigEnd&&{label:"Conrod Big End",value:m.conrodBigEnd+"mm"+(m.conrodBigClear?" · "+m.conrodBigClear+"mm clearance":"")+(m.conrodSideClear?" · "+m.conrodSideClear+"mm side":"")+(m.conrodBearingPartNo?" · "+m.conrodBearingPartNo:""),section:"Connecting Rod"},

    // ── Ignition ─────────────────────────────────────────────────────────
    m.plugType&&{label:"Spark Plug Type",value:m.plugType,section:"Ignition"},
    m.plugGap&&{label:"Spark Plug Gap",value:m.plugGap+" mm",section:"Ignition"},
    m.coilType&&{label:"Coil Type",value:m.coilType,section:"Ignition"},
    m.primaryOhms&&{label:"Primary Coil",value:m.primaryOhms+" Ω",section:"Ignition"},
    m.secondaryOhms&&{label:"Secondary Coil",value:m.secondaryOhms+" Ω",section:"Ignition"},

    // ── Starter ──────────────────────────────────────────────────────────
    m.starterType&&{label:"Starter System",value:m.starterType,section:"Starter"},
    m.ropeDiameter&&{label:"Starter Rope",value:m.ropeDiameter+"mm ⌀"+(m.ropeLength?" · "+m.ropeLength+"mm long":""),section:"Starter"},
    m.rBoltN&&{label:"Recoil Bolts",value:m.rBoltN+" bolts"+(m.rBoltSz?" · "+m.rBoltSz:"")+(m.rBoltLen?" · "+m.rBoltLen+"mm":""),section:"Starter"},

    // ── Ports (2-stroke) ─────────────────────────────────────────────────
    m.iPW&&m.iPH&&{label:"Intake Port Dimensions",value:m.iPW+"×"+m.iPH+" mm"+(m.iPCond==="Modified"?" · Modified ✦":"")+(m.iPNotes?" · "+m.iPNotes:""),section:"Ports"},
    m.ePW&&m.ePH&&{label:"Exhaust Port Dimensions",value:m.ePW+"×"+m.ePH+" mm"+(m.ePCond==="Modified"?" · Modified ✦":"")+(m.ePNotes?" · "+m.ePNotes:""),section:"Ports"},
    m.pulseLoc&&m.strokeType==="2-stroke"&&{label:"Pulse Port Location",value:m.pulseLoc+(m.pulsePos?" · "+m.pulsePos:"")+(m.pulseOffset?" · "+m.pulseOffset+" mm offset":""),section:"Ports"},

    // ── 2-Stroke Clutch ──────────────────────────────────────────────────
    m.clutch2TType&&{label:"Centrifugal Clutch",value:m.clutch2TType+(m.clutchDrumDiameter?" · drum ⌀"+m.clutchDrumDiameter+"mm":"")+(m.clutchShoeCount?" · "+m.clutchShoeCount+" shoes":"")+(m.clutchEngageRpm?" · engages "+m.clutchEngageRpm+"rpm":"")+(m.clutchBearingPart?" · brg "+m.clutchBearingPart:"")+(m.clutch2TNotes?" · "+m.clutch2TNotes:""),section:"2-Stroke Clutch"},

    // ── Turbo / Forced Induction ─────────────────────────────────────────
    m.turboFitted&&{label:"Forced Induction",value:[m.turboFitted,m.turboType,m.turboBrand,m.turboBoost?m.turboBoost+" PSI boost":null,m.intercooler?"Intercooled":null,m.turboNotes].filter(Boolean).join(" · "),section:"Turbo"},

    // ── PTO / Output Shaft ───────────────────────────────────────────────
    m.ptoDiameter&&{label:"PTO Shaft Diameter",value:m.ptoDiameter,section:"PTO / Output Shaft"},
    m.shaftType&&{label:"Shaft Type",value:m.shaftType,section:"PTO / Output Shaft"},
    m.threadDir&&{label:"Head Thread Direction",value:m.threadDir,section:"PTO / Output Shaft"},
    m.threadSize&&{label:"Head Thread Size",value:m.threadSize,section:"PTO / Output Shaft"},
    m.sprocketType&&{label:"Sprocket Type",value:m.sprocketType,section:"PTO / Output Shaft"},

    // ── Gearbox Shafts ───────────────────────────────────────────────────
    m.inputShaftDiameter&&{label:"Input Shaft",value:m.inputShaftDiameter+"mm"+(m.inputShaftSplines?" · "+m.inputShaftSplines+" splines":"")+(m.inputShaftThread?" · "+m.inputShaftThread:""),section:"Gearbox Shafts"},
    m.outputShaftDiameter&&{label:"Output Shaft",value:m.outputShaftDiameter+"mm"+(m.outputShaftSplines?" · "+m.outputShaftSplines+" splines":"")+(m.outputShaftThread?" · "+m.outputShaftThread:""),section:"Gearbox Shafts"},
    m.propShaftDiameter&&{label:"Prop Shaft Diameter",value:m.propShaftDiameter+" mm"+(m.gearboxShaftNotes?" · "+m.gearboxShaftNotes:""),section:"Gearbox Shafts"},

    // ── Fuel ─────────────────────────────────────────────────────────────
    m.fuelSystem&&{label:"Fuel System",value:m.fuelSystem,section:"Fuel"},
    m.cBrand&&{label:"Carb Brand",value:m.cBrand,section:"Fuel"},
    m.cType&&{label:"Carb Type",value:m.cType,section:"Fuel"},
    m.cModel&&{label:"Carb Model",value:m.cModel,section:"Fuel"},
    m.fuelTankCapacity&&{label:"Fuel Tank Capacity",value:m.fuelTankCapacity+" L",section:"Fuel"},
    m.mixRatio&&{label:"Fuel Mix Ratio",value:m.mixRatio,section:"Fuel"},
    m.ecuModel&&{label:"ECU",value:m.ecuModel,section:"Fuel"},
    m.tbDiameter&&{label:"Throttle Body",value:m.tbDiameter+" mm",section:"Fuel"},
    m.injectorCount&&{label:"Injectors",value:m.injectorCount+(m.injectorFlow?" · "+m.injectorFlow+" cc/min":""),section:"Fuel"},
    m.fuelRailPressure&&{label:"Fuel Rail Pressure",value:m.fuelRailPressure+" bar"+(m.fuelPumpPressure?" · pump "+m.fuelPumpPressure+" bar":""),section:"Fuel"},
    m.tpsSensor&&{label:"TPS",value:m.tpsSensor,section:"Fuel"},
    m.mapSensor&&{label:"MAP Sensor",value:m.mapSensor,section:"Fuel"},
    m.iatSensor&&{label:"IAT Sensor",value:m.iatSensor,section:"Fuel"},
    m.o2Sensor&&{label:"O2 Sensor",value:m.o2Sensor,section:"Fuel"},
    m.iacSensor&&{label:"IAC",value:m.iacSensor,section:"Fuel"},

    // ── Carburettor (detailed gasket-kit spec form — distinct from the
    // plain cBrand/cType/cModel fields above; a machine can have both) ──
    m.carbSpec?.brand&&{label:"Carb Kit Brand",value:m.carbSpec.brand==="Clone"?`Clone (${m.carbSpec.cloneBrand||"?"} → ${m.carbSpec.cloneDerivative||"?"})`:m.carbSpec.brand,section:"Carburettor"},
    m.carbSpec?.oemPartNo&&{label:"Carb OEM Part No.",value:m.carbSpec.oemPartNo,section:"Carburettor"},
    m.carbSpec?.clonePartNo&&{label:"Carb Clone Part No.",value:m.carbSpec.clonePartNo,section:"Carburettor"},
    m.carbSpec?.repairKitPartNo&&{label:"Carb Repair Kit Part No.",value:m.carbSpec.repairKitPartNo,section:"Carburettor"},
    m.carbSpec?.thickness&&{label:"Carb Gasket Thickness",value:m.carbSpec.thickness+" mm",section:"Carburettor"},
    m.carbSpec?.boltSpacing&&{label:"Carb Bolt Spacing",value:m.carbSpec.boltSpacing+" mm",section:"Carburettor"},
    m.carbSpec?.throatDiameter&&{label:"Carb Throat Diameter",value:"⌀"+m.carbSpec.throatDiameter+" mm",section:"Carburettor"},
    m.carbSpec?.engravings&&{label:"Carb Engravings",value:m.carbSpec.engravings,section:"Carburettor"},
    m.carbSpec?.needlePumpValveDiameter&&{label:"Needle/Pump Valve Diameter",value:m.carbSpec.needlePumpValveDiameter+" mm",section:"Carburettor"},
    m.carbSpec?.needleValveLength&&{label:"Needle Valve Length",value:m.carbSpec.needleValveLength+" mm",section:"Carburettor"},
    m.carbSpec?.fuelInletBarbDiameter&&{label:"Fuel Inlet Barb Diameter",value:m.carbSpec.fuelInletBarbDiameter+" mm",section:"Carburettor"},
    m.carbSpec?.fuelOutletBarbDiameter&&{label:"Fuel Outlet Barb Diameter",value:m.carbSpec.fuelOutletBarbDiameter+" mm",section:"Carburettor"},
    m.carbSpec?.fuelBulbDiameter&&{label:"Fuel Bulb Diameter",value:m.carbSpec.fuelBulbDiameter+" mm",section:"Carburettor"},
    m.carbSpec?.throttleCableDia&&{label:"Throttle Cable Diameter",value:m.carbSpec.throttleCableDia+" mm",section:"Carburettor"},

    // ── Drivetrain ───────────────────────────────────────────────────────
    m.driveType&&{label:"Drive Type",value:m.driveType,section:"Drivetrain"},
    m.chainPitch&&{label:"Chain Pitch",value:m.chainPitch,section:"Drivetrain"},
    (m.frontSprocket||m.rearSprocket)&&{label:"Sprockets",value:[m.frontSprocket?m.frontSprocket+"T front":null,m.rearSprocket?m.rearSprocket+"T rear":null].filter(Boolean).join(" · "),section:"Drivetrain"},
    (m.primaryRatio||m.topGearRatio)&&{label:"Gear Ratios",value:[m.primaryRatio?"Primary "+m.primaryRatio:null,m.topGearRatio?"Top "+m.topGearRatio:null].filter(Boolean).join(" · "),section:"Drivetrain"},
    m.gearCount&&{label:"Gears",value:m.gearCount,section:"Drivetrain"},
    m.transType&&{label:"Transmission",value:m.transType+(m.gearboxBrand?" · "+m.gearboxBrand:""),section:"Drivetrain"},
    m.clutchType&&{label:"Clutch",value:m.clutchType+(m.clutchDiameter?" · ⌀"+m.clutchDiameter+"mm":""),section:"Drivetrain"},
    m.torqueConverter&&{label:"Torque Converter",value:m.torqueConverter,section:"Drivetrain"},
    m.autoSpeeds&&{label:"Automatic Speeds",value:m.autoSpeeds+(m.autoFluidType?" · "+m.autoFluidType:"")+(m.autoFluidCapacity?" · "+m.autoFluidCapacity+"L":""),section:"Drivetrain"},
    m.cvtBeltType&&{label:"CVT Belt Type",value:m.cvtBeltType,section:"Drivetrain"},
    m.gearboxOilType&&{label:"Gearbox Oil",value:m.gearboxOilType+(m.gearboxOilCapacity?" · "+m.gearboxOilCapacity+"L":""),section:"Drivetrain"},

    // ── Suspension ───────────────────────────────────────────────────────
    m.forkType&&{label:"Front Suspension",value:m.forkType+(m.forkDiameter?" · ⌀"+m.forkDiameter+"mm":"")+(m.forkTravel?" · "+m.forkTravel+"mm travel":""),section:"Suspension"},
    m.rearShockType&&{label:"Rear Suspension",value:m.rearShockType+(m.rearTravel?" · "+m.rearTravel+"mm travel":""),section:"Suspension"},
    m.springRate&&{label:"Spring Rate",value:m.springRate+" N/mm"+(m.riderWeight?" · set for "+m.riderWeight+"kg":""),section:"Suspension"},

    // ── Brakes ───────────────────────────────────────────────────────────
    m.frontBrake&&{label:"Front Brake",value:m.frontBrake+(m.frontDiscD?" · ⌀"+m.frontDiscD+"mm":"")+(m.frontDiscW?" × "+m.frontDiscW+"mm":""),section:"Brakes"},
    m.rearBrake&&{label:"Rear Brake",value:m.rearBrake+(m.rearDiscD?" · ⌀"+m.rearDiscD+"mm":"")+(m.rearDiscW?" × "+m.rearDiscW+"mm":""),section:"Brakes"},

    // ── Tyres ────────────────────────────────────────────────────────────
    m.tyreFront&&{label:"Front Tyre",value:m.tyreFront+(m.rimFront?" · "+m.rimFront+'" rim':""),section:"Tyres"},
    m.tyreRear&&{label:"Rear Tyre",value:m.tyreRear+(m.rimRear?" · "+m.rimRear+'" rim':""),section:"Tyres"},

    // ── Electrics ────────────────────────────────────────────────────────
    m.battVoltage&&{label:"Battery",value:m.battVoltage+(m.batteryCCA?" · "+m.batteryCCA+" CCA":"")+(m.batteryAh?" · "+m.batteryAh+" Ah":"")+(m.batteryDimensions?" · "+m.batteryDimensions:""),section:"Electrics"},
    m.starterMotorType&&{label:"Starter Motor",value:m.starterMotorType,section:"Electrics"},
    (m.wireGauge||m.wireLength||m.wireAmps)&&{label:"Wiring",value:[m.wireGauge?m.wireGauge+" gauge":null,m.wireLength?m.wireLength+"m run":null,m.wireAmps?m.wireAmps+"A load":null].filter(Boolean).join(" · "),section:"Electrics"},

    // ── Charging ─────────────────────────────────────────────────────────
    m.chargingType&&{label:"Charging System",value:m.chargingType,section:"Charging"},
    m.chargeVoltage&&{label:"Charge Voltage",value:m.chargeVoltage,section:"Charging"},
    m.chargeAmps&&{label:"Charge Amps",value:m.chargeAmps+" A"+(m.totalLoadWatts?" · "+m.totalLoadWatts+"W load":""),section:"Charging"},
    m.rectRegFitted&&{label:"Rectifier/Regulator",value:m.rectRegFitted+(m.chargingNotes?" · "+m.chargingNotes:""),section:"Charging"},

    // ── Pump ─────────────────────────────────────────────────────────────
    m.pumpBrand&&{label:"Pump Brand",value:m.pumpBrand+(m.pumpModel?" "+m.pumpModel:""),section:"Pump"},
    m.pumpPsi&&{label:"Pump PSI",value:m.pumpPsi+(m.pumpFlow?" · "+m.pumpFlow+" LPM":""),section:"Pump"},
    m.pumpType&&{label:"Pump Type",value:m.pumpType,section:"Pump"},
    (m.pumpInlet||m.pumpOutlet)&&{label:"Pump Fittings",value:[m.pumpInlet?"In: "+m.pumpInlet:null,m.pumpOutlet?"Out: "+m.pumpOutlet:null].filter(Boolean).join(" · "),section:"Pump"},

    // ── Generator ────────────────────────────────────────────────────────
    m.genWatts&&{label:"Generator Watts",value:m.genWatts+(m.genPeakWatts?" · peak "+m.genPeakWatts+"W":""),section:"Generator"},
    m.genVoltage&&{label:"Generator Voltage",value:m.genVoltage+(m.genFreq?" · "+m.genFreq:""),section:"Generator"},
    m.genAvr&&{label:"AVR",value:m.genAvr,section:"Generator"},
    m.genOutlets&&{label:"Generator Outlets",value:m.genOutlets,section:"Generator"},

    // ── Blade / Deck ─────────────────────────────────────────────────────
    m.deckSize&&{label:"Deck Size",value:m.deckSize+'"',section:"Blade / Deck"},
    m.bladeType&&{label:"Blade Type",value:m.bladeType+(m.bladeLength?" · "+m.bladeLength+"mm":"")+(m.bladeCount?" · "+m.bladeCount+"x":""),section:"Blade / Deck"},

    // ── Fluids ───────────────────────────────────────────────────────────
    m.coolingType&&{label:"Cooling System",value:m.coolingType,section:"Fluids"},
    m.coolantType&&{label:"Coolant",value:m.coolantType+(m.coolantCapacity?" · "+m.coolantCapacity+"L":"")+(m.thermostatTemp?" · "+m.thermostatTemp+"°C thermostat":"")+(m.coolingNotes?" · "+m.coolingNotes:""),section:"Fluids"},
    m.engineOilGrade&&{label:"Engine Oil",value:[m.engineOilGrade,m.engineOilBrand,m.engineOilJaso,m.engineOilSynth].filter(Boolean).join(" · ")+(m.engineOilCapacity?" · "+m.engineOilCapacity+"L":""),section:"Fluids"},
    m.hydraulicFluidType&&{label:"Hydraulic Fluid",value:m.hydraulicFluidType,section:"Fluids"},
    m.brakeFluidType&&{label:"Brake Fluid",value:m.brakeFluidType,section:"Fluids"},
    m.diffOilType&&{label:"Differential Oil",value:m.diffOilType+(m.diffOilCapacity?" · "+m.diffOilCapacity+"L":""),section:"Fluids"},
    m.transferCaseOil&&{label:"Transfer Case Oil",value:m.transferCaseOil,section:"Fluids"},

    // ── Service ──────────────────────────────────────────────────────────
    m.oilChangeInterval&&{label:"Oil Change Interval",value:"every "+m.oilChangeInterval+" "+(m.oilChangeUnit||""),section:"Service"},
    m.filterInterval&&{label:"Filter Interval",value:"every "+m.filterInterval+" "+(m.filterIntervalUnit||""),section:"Service"},
    m.majorServiceInterval&&{label:"Major Service Interval",value:"every "+m.majorServiceInterval+" "+(m.majorServiceUnit||""),section:"Service"},
    m.lastServiceDate&&{label:"Last Service",value:m.lastServiceDate+(m.lastServiceOdo?" · "+m.lastServiceOdo:""),section:"Service"},

    // ── Dimensions ───────────────────────────────────────────────────────
    m.dryWeight&&{label:"Dry Weight",value:m.dryWeight+" kg"+(m.grossWeight?" · "+m.grossWeight+"kg gross":""),section:"Dimensions"},
    m.wheelbase&&{label:"Wheelbase",value:m.wheelbase+" mm",section:"Dimensions"},
    (m.overallLength||m.overallWidth||m.overallHeight)&&{label:"Overall Dimensions (L×W×H)",value:[m.overallLength,m.overallWidth,m.overallHeight].filter(Boolean).join("×")+"mm",section:"Dimensions"},

    // ── Tracked Machine ──────────────────────────────────────────────────
    m.trackedBrand&&{label:"Tracked Machine Brand",value:m.trackedBrand==="Other"?(m.trackedBrandOther||"Other"):m.trackedBrand,section:"Tracked Machine"},
    m.trackedSubtype&&{label:"Tracked Machine Type",value:m.trackedSubtype==="Other"?(m.trackedSubtypeOther||"Other"):m.trackedSubtype,section:"Tracked Machine"},
    m.operatingWeight&&{label:"Operating Weight",value:m.operatingWeight==="Other"?(m.operatingWeightOther||"Other"):m.operatingWeight,section:"Tracked Machine"},
    m.trackedHours&&{label:"Hour Meter",value:m.trackedHours+"h",section:"Tracked Machine"},
    m.trackType&&{label:"Track Type",value:m.trackType+(m.trackWidth?" · "+m.trackWidth+"mm wide":"")+(m.trackPitch?" · "+m.trackPitch+"mm pitch":""),section:"Tracked Machine"},
    m.trackLinks&&{label:"Track Links",value:m.trackLinks+(m.sprocketTeeth?" · sprocket "+m.sprocketTeeth+"T":""),section:"Tracked Machine"},
    m.undercarriageHours&&{label:"Undercarriage Hours",value:m.undercarriageHours+"h"+(m.groundContactLength?" · "+m.groundContactLength+"mm contact":""),section:"Tracked Machine"},
    m.hydPumpCount&&{label:"Hydraulic Pumps",value:m.hydPumpCount+(m.hydPumpType?" · "+m.hydPumpType:""),section:"Tracked Machine"},
    m.hydSystemPressure&&{label:"Hyd. System Pressure",value:m.hydSystemPressure+" bar"+(m.hydOilCapacity?" · "+m.hydOilCapacity+"L":"")+(m.hydReliefValve?" · relief "+m.hydReliefValve+" bar":""),section:"Tracked Machine"},

    // ── Bar & Chain (chainsaw) ───────────────────────────────────────────
    m.barLength&&{label:"Guide Bar",value:m.barLength+'"'+[m.barGauge,m.barMount].filter(Boolean).map(v=>" · "+v).join("")+(m.barStudDiameter?" · stud ⌀"+m.barStudDiameter:"")+[m.barNutType,m.barNutSize].filter(Boolean).map(v=>" · "+v).join(""),section:"Bar & Chain"},
    m.chainPitchCS&&{label:"Chain",value:[m.chainPitchCS,m.chainGauge,m.chainDriveLinks?m.chainDriveLinks+" links":null,m.chainPartNo,m.chainBrand].filter(Boolean).join(" · "),section:"Bar & Chain"},
    m.sprocketStyle&&{label:"Drive Sprocket",value:[m.sprocketStyle,m.sprocketPitchCS,m.sprocketTeethCS?m.sprocketTeethCS+"T":null].filter(Boolean).join(" · "),section:"Bar & Chain"},

    // ── Outboard ─────────────────────────────────────────────────────────
    m.obShaftLength&&{label:"Shaft Length",value:m.obShaftLength+(m.obTransomHeight?" · Transom: "+m.obTransomHeight+"mm":""),section:"Outboard"},
    m.obTiltTrim&&{label:"Tilt / Trim",value:m.obTiltTrim+(m.obSteering?" · "+m.obSteering:""),section:"Outboard"},
    m.obPropPitch&&{label:"Propeller",value:[m.obPropDiameter?m.obPropDiameter+'" dia':null,m.obPropPitch?m.obPropPitch+'" pitch':null,m.obPropMaterial].filter(Boolean).join(" · "),section:"Outboard"},
    m.obGearRatio&&{label:"Gear Ratio",value:m.obGearRatio,section:"Outboard"},
    m.obLowerUnitOilType&&{label:"Lower Unit Oil",value:m.obLowerUnitOilType+(m.obLowerUnitOilCapacity?" · "+m.obLowerUnitOilCapacity+"mL":""),section:"Outboard"},
    m.obAnodeMaterial&&{label:"Anode Material",value:m.obAnodeMaterial,section:"Outboard"},
    m.obBreakInHours&&{label:"Break-in Hours",value:m.obBreakInHours+"h",section:"Outboard"},
    m.obImpellerLastChanged&&{label:"Impeller Last Changed",value:m.obImpellerLastChanged,section:"Outboard"},

    // ── Chipper ──────────────────────────────────────────────────────────
    m.chipperSpec?.type&&{label:"Chipper Type",value:[m.chipperSpec.type,m.chipperSpec.brand&&m.chipperSpec.brand!=="Other"?m.chipperSpec.brand:m.chipperSpec.brandOther].filter(Boolean).join(" · "),section:"Chipper"},
    m.chipperSpec?.inchSize&&{label:"Capacity",value:m.chipperSpec.inchSize+'" chip capacity',section:"Chipper"},
    m.chipperSpec?.bladeCount&&{label:"Blade Count",value:m.chipperSpec.bladeCount,section:"Chipper"},
    m.chipperSpec?.hours&&{label:"Hour Meter",value:m.chipperSpec.hours+"h",section:"Chipper"},
    m.chipperSpec?.bladeLastSharpened&&{label:"Blades Last Sharpened",value:m.chipperSpec.bladeLastSharpened,section:"Chipper"},

    // ── Stump Grinder ────────────────────────────────────────────────────
    m.stumpGrinderSpec?.brand&&{label:"Brand",value:m.stumpGrinderSpec.brand!=="Other"?m.stumpGrinderSpec.brand:m.stumpGrinderSpec.brandOther,section:"Stump Grinder"},
    m.stumpGrinderSpec?.driveType&&{label:"Drive Type",value:m.stumpGrinderSpec.driveType,section:"Stump Grinder"},
    m.stumpGrinderSpec?.wheelDiameter&&{label:"Wheel",value:m.stumpGrinderSpec.wheelDiameter+'" dia'+(m.stumpGrinderSpec.toothCount?" · "+m.stumpGrinderSpec.toothCount+" teeth":""),section:"Stump Grinder"},
    m.stumpGrinderSpec?.cuttingDepth&&{label:"Cutting",value:m.stumpGrinderSpec.cuttingDepth+'" depth'+(m.stumpGrinderSpec.cuttingWidth?" · "+m.stumpGrinderSpec.cuttingWidth+'" wide':""),section:"Stump Grinder"},
    m.stumpGrinderSpec?.hours&&{label:"Hour Meter",value:m.stumpGrinderSpec.hours+"h",section:"Stump Grinder"},
    m.stumpGrinderSpec?.teethLastReplaced&&{label:"Teeth Last Replaced",value:m.stumpGrinderSpec.teethLastReplaced,section:"Stump Grinder"},
  ].filter(Boolean);
}

// Turns an unlabeled camelCase key into a readable fallback label (e.g.
// "obBreakInHours" -> "Break In Hours") for any field with real data that
// isn't in a curated label list (ALL_BADGE_FIELDS) — shared by the Tile
// Badges picker and its actual badge-render lookup so the two can never
// disagree on what a dynamically-discovered field is called.
export const humanizeKey = k => k.replace(/^ob/, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase()).trim();

// True content blocks — arrays/free-text/structured data that genuinely
// can't be split into individual key/value toggles (unlike scalar specs,
// which all get their own per-field checkbox via getMachineSpecEntries
// instead of a bucket toggle here). Shared by ExpandConfig's Layout picker
// (src/components/ui/config.jsx) and MachineCard's actual render, so the
// default expandFields value and the picker's own options list can never
// drift out of sync with each other.
export const CONTENT_BLOCKS = [
  {k:"photos",        l:"Photos",              hasData: m => m.photos?.length>0},
  {k:"desc",          l:"Description",         hasData: m => !!m.desc},
  {k:"fasteners",     l:"Fastener Specs",      hasData: m => m.fasteners?.length>0},
  {k:"lighting",      l:"Lighting",            hasData: m => m.lighting?.length>0},
  {k:"bearings",      l:"Bearings",            hasData: m => m.bearings?.length>0},
  {k:"belts",         l:"Belts",               hasData: m => m.belts?.length>0},
  {k:"batteries",     l:"Batteries",           hasData: m => m.batteries?.length>0},
  {k:"fuseBoxes",     l:"Fuse Boxes",          hasData: m => m.fuseBoxes?.length>0},
  {k:"hydRams",       l:"Hydraulic Rams",      hasData: m => m.hydRams?.length>0},
  {k:"attachments",   l:"Attachments",         hasData: m => m.attachments?.length>0},
  {k:"notes",         l:"Notes",               hasData: m => !!m.notes},
  {k:"parts",         l:"Parts Used",          hasData: m => m.parts?.length>0},
  {k:"serviceHistory",l:"Service History",     hasData: () => true},
];
export const DEFAULT_EXPAND = CONTENT_BLOCKS.map(f=>f.k);
