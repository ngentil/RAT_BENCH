import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, RED, GRN, inp, sel, txa, btnA, btnG, btnD, sm, col, row, dvdr, empt, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { MACHINE_TYPES, TYPE_PH, getPH, HANDHELD, WHEELED, MOTO, VEHICLE, TRACKED, isCustom, isVehicle, isTracked, showForCustom, ALL_SECTIONS, ALL_TYPES, showPTO, showPump, showGenOutput, showDrivetrain, showSuspension, showBrakes, showTyres, showElectrics, showBlade, BODY_TYPES_VEHICLE, BODY_TYPES_MOTO, DRIVE_CONFIGS, VEHICLE_MAKES, COMMON_COLOURS, CHAINSAW_CHAIN_PITCHES, CHAINSAW_GAUGES, SPROCKET_STYLES, BAR_MOUNT_TYPES, TRACKED_BRANDS, TRACKED_SUBTYPES, OPERATING_WEIGHTS, TRACK_TYPES, HYD_PUMP_COUNTS, HYD_PUMP_TYPES, RAM_LOCATIONS, COOLING_TYPES, TURBO_TYPES, CHARGING_TYPES, CHARGE_VOLTAGES, RECT_REG, BELT_TYPES, ATTACH_TYPES, SOURCES, STATUSES, CARB_BRANDS, CARB_TYPES, CARB_BOLTS, EXH_BOLTS, RECOIL_BOLTS, RECOIL_COUNTS, VALVE_COUNTS, PULSE_LOC, PULSE_POS, PORT_CONDITION, SHAFT_TYPES, THREAD_DIR, THREAD_SIZES, PTO_DIAMETERS, SPROCKET_TYPES, CYLINDER_COUNTS, VALVE_TRAIN, CAM_TYPES, LOCKNUT_SIZES, SENSOR_STATUS, INJECTOR_COUNTS, STARTER_TYPES, DRIVE_TYPES, FASTENER_TYPES, FASTENER_LOCS, BOLT_DIAMETERS, CHAIN_PITCHES, TRANS_TYPES, CLUTCH_TYPES, CVT_BELT_TYPES, FORK_TYPES, SHOCK_TYPES, BRAKE_TYPES, BLADE_TYPES, PUMP_TYPES, INLET_SIZES, OUTLET_SIZES, VOLTAGE_OPTIONS, FRAME_TYPES, COIL_TYPES, ENG_BOLTS, ENG_COUNTS, STUD_N, RAGE_LBL, STUD_LOCS } from '../../lib/constants';
import { SL, FL, SkullRating, FastenerRow, StudCard, StudForm, SummaryCard, NotLogged, SectionPicker, HydRamCard, HydRamForm, AttachCard, AttachForm, LightingCard, LightingForm  } from '../ui/shared';
import { uid, resizeImg, toB64 } from '../../lib/helpers';
import PhotoAdder from '../ui/PhotoAdder';
function MachineForm({existing,onSave,onClose,company}){
  const e=existing||{};
  const isNew=true;
  const [companyId,setCompanyId]=useState(e.companyId||null);
  const [type,setType]=useState(e.type||"");
  const [name,setName]=useState(e.name||"");
  const [make,setMake]=useState(e.make||"");
  const [model,setModel]=useState(e.model||"");
  const [year,setYear]=useState(e.year||"");
  const [desc,setDesc]=useState(e.desc||"");
  const [source,setSource]=useState(e.source||"");
  const [status,setStatus]=useState(e.status||"");
  const [colour,setColour]=useState(e.colour||"");
  const [bodyType,setBodyType]=useState(e.bodyType||"");
  const [driveConfig,setDriveConfig]=useState(e.driveConfig||"");
  const [photos,setPhotos]=useState(e.photos||[]);
  const [plugType,setPlugType]=useState(e.plugType||"");
  const [iSpacing,setISpacing]=useState(e.iSpacing||"");
  const [iStuds,setIStuds]=useState(e.iStuds||"");
  const [eSpacing,setESpacing]=useState(e.eSpacing||"");
  const [eStuds,setEStuds]=useState(e.eStuds||"");
  const [eBoltSz,setEBoltSz]=useState(e.eBoltSz||"");
  const [eBoltLen,setEBoltLen]=useState(e.eBoltLen||"");
  const [iBoltSz,setIBoltSz]=useState(e.iBoltSz||"");
  const [iBoltLen,setIBoltLen]=useState(e.iBoltLen||"");
  const [rBoltN,setRBoltN]=useState(e.rBoltN||"");
  const [rBoltSz,setRBoltSz]=useState(e.rBoltSz||"");
  const [rBoltLen,setRBoltLen]=useState(e.rBoltLen||"");
  const [compression,setCompression]=useState(e.compression||"");
  const [idleRpm,setIdleRpm]=useState(e.idleRpm||"");
  const [wotRpm,setWotRpm]=useState(e.wotRpm||"");
  const [ccSize,setCcSize]=useState(e.ccSize||"");
  const [strokeType,setStrokeType]=useState(e.strokeType||"");
  const [motorType,setMotorType]=useState(e.motorType||"");
  const [motorPower,setMotorPower]=useState(e.motorPower||"");
  const [motorTorque,setMotorTorque]=useState(e.motorTorque||"");
  const [controllerBrand,setControllerBrand]=useState(e.controllerBrand||"");
  const [packVoltage,setPackVoltage]=useState(e.packVoltage||"");
  const [packCapacity,setPackCapacity]=useState(e.packCapacity||"");
  const [battChemistry,setBattChemistry]=useState(e.battChemistry||"");
  const [cellCount,setCellCount]=useState(e.cellCount||"");
  const [chargePort,setChargePort]=useState(e.chargePort||"");
  const [maxChargeRate,setMaxChargeRate]=useState(e.maxChargeRate||"");
  const [evRange,setEvRange]=useState(e.evRange||"");
  const [regenBraking,setRegenBraking]=useState(e.regenBraking||"");
  const [intakeValveClear,setIntakeValveClear]=useState(e.intakeValveClear||"");
  const [exhaustValveClear,setExhaustValveClear]=useState(e.exhaustValveClear||"");
  const [intakeValveN,setIntakeValveN]=useState(e.intakeValveN||"");
  const [exhaustValveN,setExhaustValveN]=useState(e.exhaustValveN||"");
  // cylinder / valve train
  const [cylCount,setCylCount]=useState(e.cylCount||"");
  const [firingOrder,setFiringOrder]=useState(e.firingOrder||"");
  const [valveTrain,setValveTrain]=useState(e.valveTrain||"");
  const [locknutSize,setLocknutSize]=useState(e.locknutSize||"");
  const [camType,setCamType]=useState(e.camType||"");
  // intake valve dims
  const [iValveFace,setIValveFace]=useState(e.iValveFace||"");
  const [iValveStem,setIValveStem]=useState(e.iValveStem||"");
  const [iValveLift,setIValveLift]=useState(e.iValveLift||"");
  const [iValveWeight,setIValveWeight]=useState(e.iValveWeight||"");
  // exhaust valve dims
  const [eValveFace,setEValveFace]=useState(e.eValveFace||"");
  const [eValveStem,setEValveStem]=useState(e.eValveStem||"");
  const [eValveLift,setEValveLift]=useState(e.eValveLift||"");
  const [eValveWeight,setEValveWeight]=useState(e.eValveWeight||"");
  // valve springs
  const [springFreeLen,setSpringFreeLen]=useState(e.springFreeLen||"");
  const [springOuterD,setSpringOuterD]=useState(e.springOuterD||"");
  const [springWireD,setSpringWireD]=useState(e.springWireD||"");
  const [springWeight,setSpringWeight]=useState(e.springWeight||"");
  // fuel system
  const [fuelSystem,setFuelSystem]=useState(e.fuelSystem||"");
  const [fuelTankCapacity,setFuelTankCapacity]=useState(e.fuelTankCapacity||"");
  const [mixRatio,setMixRatio]=useState(e.mixRatio||"");
  // EFI
  const [ecuModel,setEcuModel]=useState(e.ecuModel||"");
  const [tbDiameter,setTbDiameter]=useState(e.tbDiameter||"");
  const [injectorCount,setInjectorCount]=useState(e.injectorCount||"");
  const [injectorFlow,setInjectorFlow]=useState(e.injectorFlow||"");
  const [fuelRailPressure,setFuelRailPressure]=useState(e.fuelRailPressure||"");
  const [fuelPumpPressure,setFuelPumpPressure]=useState(e.fuelPumpPressure||"");
  const [tpsSensor,setTpsSensor]=useState(e.tpsSensor||"");
  const [mapSensor,setMapSensor]=useState(e.mapSensor||"");
  const [iatSensor,setIatSensor]=useState(e.iatSensor||"");
  const [o2Sensor,setO2Sensor]=useState(e.o2Sensor||"");
  const [iacSensor,setIacSensor]=useState(e.iacSensor||"");
  // fasteners - dynamic array
  const [fasteners,setFasteners]=useState(e.fasteners||[]);
  // Lighting - dynamic array
  const [lighting, setLighting] = useState(e.lighting||[]);
  const [lightEditIdx, setLightEditIdx] = useState(null);
  const [lightAdding, setLightAdding] = useState(false);
  // pump
  const [pumpBrand,setPumpBrand]=useState(e.pumpBrand||"");
  const [pumpModel,setPumpModel]=useState(e.pumpModel||"");
  const [pumpPsi,setPumpPsi]=useState(e.pumpPsi||"");
  const [pumpFlow,setPumpFlow]=useState(e.pumpFlow||"");
  const [pumpInlet,setPumpInlet]=useState(e.pumpInlet||"");
  const [pumpOutlet,setPumpOutlet]=useState(e.pumpOutlet||"");
  const [pumpType,setPumpType]=useState(e.pumpType||"");
  // generator output
  const [genWatts,setGenWatts]=useState(e.genWatts||"");
  const [genPeakWatts,setGenPeakWatts]=useState(e.genPeakWatts||"");
  const [genVoltage,setGenVoltage]=useState(e.genVoltage||"");
  const [genFreq,setGenFreq]=useState(e.genFreq||"");
  const [genAvr,setGenAvr]=useState(e.genAvr||"");
  const [genOutlets,setGenOutlets]=useState(e.genOutlets||"");
  // drivetrain
  const [driveType,setDriveType]=useState(e.driveType||"");
  const [chainPitch,setChainPitch]=useState(e.chainPitch||"");
  const [frontSprocket,setFrontSprocket]=useState(e.frontSprocket||"");
  const [rearSprocket,setRearSprocket]=useState(e.rearSprocket||"");
  const [gearCount,setGearCount]=useState(e.gearCount||"");
  const [gearboxBrand,setGearboxBrand]=useState(e.gearboxBrand||"");
  const [clutchType,setClutchType]=useState(e.clutchType||"");
  const [clutchDiameter,setClutchDiameter]=useState(e.clutchDiameter||"");
  const [torqueConverter,setTorqueConverter]=useState(e.torqueConverter||"");
  const [autoSpeeds,setAutoSpeeds]=useState(e.autoSpeeds||"");
  const [autoFluidType,setAutoFluidType]=useState(e.autoFluidType||"");
  const [autoFluidCapacity,setAutoFluidCapacity]=useState(e.autoFluidCapacity||"");
  const [cvtBeltType,setCvtBeltType]=useState(e.cvtBeltType||"");
  const [gearboxOilType,setGearboxOilType]=useState(e.gearboxOilType||"");
  const [gearboxOilCapacity,setGearboxOilCapacity]=useState(e.gearboxOilCapacity||"");
  const [transType,setTransType]=useState(e.transType||"");
  // suspension
  const [forkType,setForkType]=useState(e.forkType||"");
  const [forkDiameter,setForkDiameter]=useState(e.forkDiameter||"");
  const [forkTravel,setForkTravel]=useState(e.forkTravel||"");
  const [rearShockType,setRearShockType]=useState(e.rearShockType||"");
  const [rearTravel,setRearTravel]=useState(e.rearTravel||"");
  // brakes
  const [frontBrake,setFrontBrake]=useState(e.frontBrake||"");
  const [frontDiscD,setFrontDiscD]=useState(e.frontDiscD||"");
  const [frontDiscW,setFrontDiscW]=useState(e.frontDiscW||"");
  const [rearBrake,setRearBrake]=useState(e.rearBrake||"");
  const [rearDiscD,setRearDiscD]=useState(e.rearDiscD||"");
  const [rearDiscW,setRearDiscW]=useState(e.rearDiscW||"");
  // tyres
  const [tyreFront,setTyreFront]=useState(e.tyreFront||"");
  const [tyreRear,setTyreRear]=useState(e.tyreRear||"");
  const [rimFront,setRimFront]=useState(e.rimFront||"");
  const [rimRear,setRimRear]=useState(e.rimRear||"");
  // electrics
  const [battVoltage,setBattVoltage]=useState(e.battVoltage||"");
  // blade / deck
  const [deckSize,setDeckSize]=useState(e.deckSize||"");
  const [bladeLength,setBladeLength]=useState(e.bladeLength||"");
  const [bladeType,setBladeType]=useState(e.bladeType||"");
  const [bladeCount,setBladeCount]=useState(e.bladeCount||"");
  // section open state for new sections
  const [secFasteners,setSecFasteners]=useState(false);
  const [secPump,setSecPump]=useState(false);
  const [secGenOutput,setSecGenOutput]=useState(false);
  const [secDrive,setSecDrive]=useState(false);
  const [secSuspension,setSecSuspension]=useState(false);
  const [secBrakes,setSecBrakes]=useState(false);
  const [secTyres,setSecTyres]=useState(false);
  const [secElectrics,setSecElectrics]=useState(false);
  const [batteryCCA,setBatteryCCA]=useState(e.batteryCCA||"");
  const [batteryAh,setBatteryAh]=useState(e.batteryAh||"");
  const [batteryDimensions,setBatteryDimensions]=useState(e.batteryDimensions||"");
  const [starterMotorType,setStarterMotorType]=useState(e.starterMotorType||"");
  const [fuseBoxNotes,setFuseBoxNotes]=useState(e.fuseBoxNotes||"");
  const [secBlade,setSecBlade]=useState(false);
  const [secCylinder,setSecCylinder]=useState(false);
  const [editCylinder,setEditCylinder]=useState(isNew);
  const [cylMaxWear,setCylMaxWear]=useState(e.cylMaxWear||"");
  const [cylTaperLimit,setCylTaperLimit]=useState(e.cylTaperLimit||"");
  const [cylOutOfRound,setCylOutOfRound]=useState(e.cylOutOfRound||"");
  const [honingAngle,setHoningAngle]=useState(e.honingAngle||"");
  const [nikasil,setNikasil]=useState(e.nikasil||"");
  const [secMainBearings,setSecMainBearings]=useState(false);
  const [editMainBearings,setEditMainBearings]=useState(isNew);
  const [mainBearingType,setMainBearingType]=useState(e.mainBearingType||"");
  const [mainBearingLeft,setMainBearingLeft]=useState(e.mainBearingLeft||"");
  const [mainBearingRight,setMainBearingRight]=useState(e.mainBearingRight||"");
  const [mainBearingClear,setMainBearingClear]=useState(e.mainBearingClear||"");
  const [mainBearingPreload,setMainBearingPreload]=useState(e.mainBearingPreload||"");
  const [secCrank,setSecCrank]=useState(false);
  const [editCrank,setEditCrank]=useState(isNew);
  const [crankPinDiameter,setCrankPinDiameter]=useState(e.crankPinDiameter||"");
  const [crankPinLength,setCrankPinLength]=useState(e.crankPinLength||"");
  const [mainJournalDiameter,setMainJournalDiameter]=useState(e.mainJournalDiameter||"");
  const [crankEndFloat,setCrankEndFloat]=useState(e.crankEndFloat||"");
  const [crankRunout,setCrankRunout]=useState(e.crankRunout||"");
  const [crankStroke,setCrankStroke]=useState(e.crankStroke||"");
  const [crankSealLeft,setCrankSealLeft]=useState(e.crankSealLeft||"");
  const [crankSealRight,setCrankSealRight]=useState(e.crankSealRight||"");
  const [secConrod,setSecConrod]=useState(false);
  const [editConrod,setEditConrod]=useState(isNew);
  const [conrodLength,setConrodLength]=useState(e.conrodLength||"");
  const [conrodSmallEnd,setConrodSmallEnd]=useState(e.conrodSmallEnd||"");
  const [conrodSmallClear,setConrodSmallClear]=useState(e.conrodSmallClear||"");
  const [conrodBigEnd,setConrodBigEnd]=useState(e.conrodBigEnd||"");
  const [conrodBigClear,setConrodBigClear]=useState(e.conrodBigClear||"");
  const [conrodSideClear,setConrodSideClear]=useState(e.conrodSideClear||"");
  const [conrodBearingType,setConrodBearingType]=useState(e.conrodBearingType||"");
  const [conrodBearingPartNo,setConrodBearingPartNo]=useState(e.conrodBearingPartNo||"");
  const [secPiston,setSecPiston]=useState(false);
  const [editPiston,setEditPiston]=useState(isNew);
  const [pistonDiameter,setPistonDiameter]=useState(e.pistonDiameter||"");
  const [pistonClearance,setPistonClearance]=useState(e.pistonClearance||"");
  const [ringCount,setRingCount]=useState(e.ringCount||"");
  const [ringGapTop,setRingGapTop]=useState(e.ringGapTop||"");
  const [ringGapSecond,setRingGapSecond]=useState(e.ringGapSecond||"");
  const [ringGapOil,setRingGapOil]=useState(e.ringGapOil||"");
  const [ringWidth,setRingWidth]=useState(e.ringWidth||"");
  const [ringThickness,setRingThickness]=useState(e.ringThickness||"");
  const [gudgeonDiameter,setGudgeonDiameter]=useState(e.gudgeonDiameter||"");
  const [gudgeonLength,setGudgeonLength]=useState(e.gudgeonLength||"");
  const [gudgeonFit,setGudgeonFit]=useState(e.gudgeonFit||"");
  const [gudgeonCirclip,setGudgeonCirclip]=useState(e.gudgeonCirclip||"");
  const [secServiceIntervals,setSecServiceIntervals]=useState(false);
  const [editServiceIntervals,setEditServiceIntervals]=useState(isNew);
  const [oilChangeInterval,setOilChangeInterval]=useState(e.oilChangeInterval||"");
  const [oilChangeUnit,setOilChangeUnit]=useState(e.oilChangeUnit||"hours");
  const [filterInterval,setFilterInterval]=useState(e.filterInterval||"");
  const [filterIntervalUnit,setFilterIntervalUnit]=useState(e.filterIntervalUnit||"hours");
  const [majorServiceInterval,setMajorServiceInterval]=useState(e.majorServiceInterval||"");
  const [majorServiceUnit,setMajorServiceUnit]=useState(e.majorServiceUnit||"hours");
  const [lastServiceOdo,setLastServiceOdo]=useState(e.lastServiceOdo||"");
  const [secFluids,setSecFluids]=useState(false);
  const [editFluids,setEditFluids]=useState(isNew);
  const [engineOilGrade,setEngineOilGrade]=useState(e.engineOilGrade||"");
  const [engineOilCapacity,setEngineOilCapacity]=useState(e.engineOilCapacity||"");
  const [hydraulicFluidType,setHydraulicFluidType]=useState(e.hydraulicFluidType||"");
  const [brakeFluidType,setBrakeFluidType]=useState(e.brakeFluidType||"");
  const [diffOilType,setDiffOilType]=useState(e.diffOilType||"");
  const [diffOilCapacity,setDiffOilCapacity]=useState(e.diffOilCapacity||"");
  const [transferCaseOil,setTransferCaseOil]=useState(e.transferCaseOil||"");
  const [secDimensions,setSecDimensions]=useState(false);
  const [editDimensions,setEditDimensions]=useState(isNew);
  const [dryWeight,setDryWeight]=useState(e.dryWeight||"");
  const [grossWeight,setGrossWeight]=useState(e.grossWeight||"");
  const [wheelbase,setWheelbase]=useState(e.wheelbase||"");
  const [overallLength,setOverallLength]=useState(e.overallLength||"");
  const [overallWidth,setOverallWidth]=useState(e.overallWidth||"");
  const [overallHeight,setOverallHeight]=useState(e.overallHeight||"");
  const [secBelt,setSecBelt]=useState(false);
  const [secCooling,setSecCooling]=useState(false);
  const [editCooling,setEditCooling]=useState(isNew);
  const [coolingType,setCoolingType]=useState(e.coolingType||"");
  const [coolantType,setCoolantType]=useState(e.coolantType||"");
  const [coolantCapacity,setCoolantCapacity]=useState(e.coolantCapacity||"");
  const [thermostatTemp,setThermostatTemp]=useState(e.thermostatTemp||"");
  const [coolingNotes,setCoolingNotes]=useState(e.coolingNotes||"");
  const [secTurbo,setSecTurbo]=useState(false);
  const [editTurbo,setEditTurbo]=useState(isNew);
  const [turboFitted,setTurboFitted]=useState(e.turboFitted||"");
  const [turboType,setTurboType]=useState(e.turboType||"");
  const [turboBrand,setTurboBrand]=useState(e.turboBrand||"");
  const [turboBoost,setTurboBoost]=useState(e.turboBoost||"");
  const [intercooler,setIntercooler]=useState(e.intercooler||"");
  const [turboNotes,setTurboNotes]=useState(e.turboNotes||"");
  const [secCharging,setSecCharging]=useState(false);
  const [editCharging,setEditCharging]=useState(isNew);
  const [chargingType,setChargingType]=useState(e.chargingType||"");
  const [chargeVoltage,setChargeVoltage]=useState(e.chargeVoltage||"");
  const [chargeAmps,setChargeAmps]=useState(e.chargeAmps||"");
  const [rectRegFitted,setRectRegFitted]=useState(e.rectRegFitted||"");
  const [chargingNotes,setChargingNotes]=useState(e.chargingNotes||"");
  const [editBelt,setEditBelt]=useState(isNew);
  const [beltType,setBeltType]=useState(e.beltType||"");
  const [beltPartNo,setBeltPartNo]=useState(e.beltPartNo||"");
  const [beltWidth,setBeltWidth]=useState(e.beltWidth||"");
  const [beltLength,setBeltLength]=useState(e.beltLength||"");
  const [beltCount,setBeltCount]=useState(e.beltCount||"");
  const [beltNotes,setBeltNotes]=useState(e.beltNotes||"");
  // starter system
  const [starterType,setStarterType]=useState(e.starterType||"");
  const [ropeDiameter,setRopeDiameter]=useState(e.ropeDiameter||"");
  const [ropeLength,setRopeLength]=useState(e.ropeLength||"");
  // ignition
  const [plugGap,setPlugGap]=useState(e.plugGap||"");
  const [coilType,setCoilType]=useState(e.coilType||"");
  const [primaryOhms,setPrimaryOhms]=useState(e.primaryOhms||"");
  const [secondaryOhms,setSecondaryOhms]=useState(e.secondaryOhms||"");
  // section open state for new sections
  const [secStarter,setSecStarter]=useState(false);
  const [secIgnition,setSecIgnition]=useState(false);
  const [cBrand,setCBrand]=useState(e.cBrand||"");
  const [carbCount,setCarbCount]=useState(e.carbCount||"");
  const [cType,setCType]=useState(e.cType||"");
  const [cModel,setCModel]=useState(e.cModel||"");
  const [notes,setNotes]=useState(e.notes||"");
  // port dimensions
  const [iPW,setIPW]=useState(e.iPW||"");
  const [iPH,setIPH]=useState(e.iPH||"");
  const [iPCond,setIPCond]=useState(e.iPCond||"Stock");
  const [iPNotes,setIPNotes]=useState(e.iPNotes||"");
  const [iPPhotos,setIPPhotos]=useState(e.iPPhotos||[]);
  const [ePW,setEPW]=useState(e.ePW||"");
  const [ePH,setEPH]=useState(e.ePH||"");
  const [ePCond,setEPCond]=useState(e.ePCond||"Stock");
  const [ePNotes,setEPNotes]=useState(e.ePNotes||"");
  const [ePPhotos,setEPPhotos]=useState(e.ePPhotos||[]);
  // pulse port (2-stroke only)
  const [pulseLoc,setPulseLoc]=useState(e.pulseLoc||"");
  const [pulsePos,setPulsePos]=useState(e.pulsePos||"");
  const [pulseOffset,setPulseOffset]=useState(e.pulseOffset||"");
  // PTO / output shaft
  const [ptoDiameter,setPtoDiameter]=useState(e.ptoDiameter||"");
  const [shaftType,setShaftType]=useState(e.shaftType||"");
  const [threadDir,setThreadDir]=useState(e.threadDir||"");
  const [threadSize,setThreadSize]=useState(e.threadSize||"");
  const [sprocketType,setSprocketType]=useState(e.sprocketType||"");
  const [boreDiameter,setBoreDiameter]=useState(e.boreDiameter||"");
  // section open state
  const [secBasic,setSecBasic]=useState(true);
  const [secEngine,setSecEngine]=useState(false);
  const [secStuds,setSecStuds]=useState(false);
  const [secPorts,setSecPorts]=useState(false);
  const [secCarb,setSecCarb]=useState(false);
  const [secNotes,setSecNotes]=useState(false);
  // tracked machine
  const [secTracked,setSecTracked]=useState(false);
  const [trackedBrand,setTrackedBrand]=useState(e.trackedBrand||"");
  const [trackedBrandOther,setTrackedBrandOther]=useState(e.trackedBrandOther||"");
  const [trackedSubtype,setTrackedSubtype]=useState(e.trackedSubtype||"");
  const [trackedSubtypeOther,setTrackedSubtypeOther]=useState(e.trackedSubtypeOther||"");
  const [operatingWeight,setOperatingWeight]=useState(e.operatingWeight||"");
  const [operatingWeightOther,setOperatingWeightOther]=useState(e.operatingWeightOther||"");
  const [trackType,setTrackType]=useState(e.trackType||"");
  const [trackWidth,setTrackWidth]=useState(e.trackWidth||"");
  const [trackPitch,setTrackPitch]=useState(e.trackPitch||"");
  const [trackLinks,setTrackLinks]=useState(e.trackLinks||"");
  const [sprocketTeeth,setSprocketTeeth]=useState(e.sprocketTeeth||"");
  const [undercarriageHours,setUndercarriageHours]=useState(e.undercarriageHours||"");
  const [hydPumpCount,setHydPumpCount]=useState(e.hydPumpCount||"");
  const [hydPumpType,setHydPumpType]=useState(e.hydPumpType||"");
  const [hydSystemPressure,setHydSystemPressure]=useState(e.hydSystemPressure||"");
  const [hydOilCapacity,setHydOilCapacity]=useState(e.hydOilCapacity||"");
  const [hydReliefValve,setHydReliefValve]=useState(e.hydReliefValve||"");
  const [hydRams,setHydRams]=useState(e.hydRams||[]);
  const [attachments,setAttachments]=useState(e.attachments||[]);
  const [hydRamEditIdx,setHydRamEditIdx]=useState(null);
  const [hydRamAdding,setHydRamAdding]=useState(false);
  const [attachEditIdx,setAttachEditIdx]=useState(null);
  const [attachAdding,setAttachAdding]=useState(false);
  const [secPto,setSecPto]=useState(false);
  const [secChainsaw,setSecChainsaw]=useState(false);
  const [editChainsaw,setEditChainsaw]=useState(isNew);
  const [barLength,setBarLength]=useState(e.barLength||"");
  const [barGauge,setBarGauge]=useState(e.barGauge||"");
  const [barMount,setBarMount]=useState(e.barMount||"");
  const [barStudDiameter,setBarStudDiameter]=useState(e.barStudDiameter||"");
  const [barNutType,setBarNutType]=useState(e.barNutType||"");
  const [barNutSize,setBarNutSize]=useState(e.barNutSize||"");
  const [chainPitchCS,setChainPitchCS]=useState(e.chainPitchCS||"");
  const [chainGauge,setChainGauge]=useState(e.chainGauge||"");
  const [chainDriveLinks,setChainDriveLinks]=useState(e.chainDriveLinks||"");
  const [chainPartNo,setChainPartNo]=useState(e.chainPartNo||"");
  const [chainBrand,setChainBrand]=useState(e.chainBrand||"");
  const [sprocketStyle,setSprocketStyle]=useState(e.sprocketStyle||"");
  const [sprocketPitchCS,setSprocketPitchCS]=useState(e.sprocketPitchCS||"");
  const [sprocketTeethCS,setSprocketTeethCS]=useState(e.sprocketTeethCS||"");
  const [trackedHours,setTrackedHours]=useState(e.trackedHours||"");
  const [sec2TClutch,setSec2TClutch]=useState(false);
  const [edit2TClutch,setEdit2TClutch]=useState(isNew);
  const [clutch2TType,setClutch2TType]=useState(e.clutch2TType||"");
  const [clutchDrumDiameter,setClutchDrumDiameter]=useState(e.clutchDrumDiameter||"");
  const [clutchShoeCount,setClutchShoeCount]=useState(e.clutchShoeCount||"");
  const [clutchEngageRpm,setClutchEngageRpm]=useState(e.clutchEngageRpm||"");
  const [clutchBearingPart,setClutchBearingPart]=useState(e.clutchBearingPart||"");
  const [clutch2TNotes,setClutch2TNotes]=useState(e.clutch2TNotes||"");
  const [secGearboxShafts,setSecGearboxShafts]=useState(false);
  const [editGearboxShafts,setEditGearboxShafts]=useState(isNew);
  const [inputShaftDiameter,setInputShaftDiameter]=useState(e.inputShaftDiameter||"");
  const [inputShaftSplines,setInputShaftSplines]=useState(e.inputShaftSplines||"");
  const [inputShaftThread,setInputShaftThread]=useState(e.inputShaftThread||"");
  const [outputShaftDiameter,setOutputShaftDiameter]=useState(e.outputShaftDiameter||"");
  const [outputShaftSplines,setOutputShaftSplines]=useState(e.outputShaftSplines||"");
  const [outputShaftThread,setOutputShaftThread]=useState(e.outputShaftThread||"");
  const [propShaftDiameter,setPropShaftDiameter]=useState(e.propShaftDiameter||"");
  const [gearboxShaftNotes,setGearboxShaftNotes]=useState(e.gearboxShaftNotes||"");
  const [editEngine,setEditEngine]=useState(isNew);
  const [editIgnition,setEditIgnition]=useState(isNew);
  const [editStarter,setEditStarter]=useState(isNew);
  const [editPorts,setEditPorts]=useState(isNew);
  const [editPto,setEditPto]=useState(isNew);
  const [editCarb,setEditCarb]=useState(isNew);
  const [editPump,setEditPump]=useState(isNew);
  const [editGenOutput,setEditGenOutput]=useState(isNew);
  const [editDrive,setEditDrive]=useState(isNew);
  const [editSuspension,setEditSuspension]=useState(isNew);
  const [editBrakes,setEditBrakes]=useState(isNew);
  const [editTyres,setEditTyres]=useState(isNew);
  const [editElectrics,setEditElectrics]=useState(isNew);
  const [editBlade,setEditBlade]=useState(isNew);
  const [editNotes,setEditNotes]=useState(isNew);
  const [nameErr,setNameErr]=useState(false);
  const [customSections,setCustomSections]=useState(e.customSections!==undefined?e.customSections:null);
  const [showSectionPicker,setShowSectionPicker]=useState(false);
  const [studs,setStuds]=useState(e.studs||[]);
  const [studEditIdx,setStudEditIdx]=useState(null);
  const [studAdding,setStudAdding]=useState(false);
  const [fastEditIdx,setFastEditIdx]=useState(null);
  const [fastAdding,setFastAdding]=useState(false);

  const save=()=>{
    let finalName=name.trim();
    if(isTracked(type)&&!finalName){
      const brand=trackedBrand==="Other"?(trackedBrandOther||"Tracked"):trackedBrand||"Tracked";
      const sub=trackedSubtype==="Other"?(trackedSubtypeOther||"Machine"):trackedSubtype||"Machine";
      finalName=[brand,model||sub].filter(Boolean).join(" ");
      setName(finalName);
    }
    if(!isTracked(type)&&!finalName){setNameErr(true);return;}
    onSave({id:e.id||uid(),companyId:companyId||null,type,name:finalName,make:make.trim(),model:model.trim(),
      desc:desc.trim(),source,status,photos,year:year.trim(),colour:colour.trim(),bodyType,driveConfig,plugType:plugType.trim(),strokeType,motorType,motorPower:motorPower.toString(),motorTorque:motorTorque.toString(),controllerBrand:controllerBrand.trim(),packVoltage:packVoltage.toString(),packCapacity:packCapacity.toString(),battChemistry,cellCount:cellCount.toString(),chargePort,maxChargeRate:maxChargeRate.toString(),evRange:evRange.toString(),regenBraking,cylCount,firingOrder:firingOrder.trim(),valveTrain,locknutSize,camType,
      intakeValveClear:intakeValveClear.toString().trim(),exhaustValveClear:exhaustValveClear.toString().trim(),intakeValveN,exhaustValveN,
      iValveFace:iValveFace.toString().trim(),iValveStem:iValveStem.toString().trim(),iValveLift:iValveLift.toString().trim(),iValveWeight:iValveWeight.toString().trim(),
      eValveFace:eValveFace.toString().trim(),eValveStem:eValveStem.toString().trim(),eValveLift:eValveLift.toString().trim(),eValveWeight:eValveWeight.toString().trim(),
      springFreeLen:springFreeLen.toString().trim(),springOuterD:springOuterD.toString().trim(),springWireD:springWireD.toString().trim(),springWeight:springWeight.toString().trim(),starterType,ropeDiameter:ropeDiameter.toString().trim(),ropeLength:ropeLength.toString().trim(),fasteners,pumpBrand:pumpBrand.trim(),pumpModel:pumpModel.trim(),pumpPsi:pumpPsi.toString().trim(),pumpFlow:pumpFlow.toString().trim(),pumpInlet,pumpOutlet,pumpType,genWatts:genWatts.toString().trim(),genPeakWatts:genPeakWatts.toString().trim(),genVoltage,genFreq,genAvr,genOutlets:genOutlets.trim(),driveType,chainPitch,frontSprocket:frontSprocket.toString().trim(),rearSprocket:rearSprocket.toString().trim(),gearCount,transType,gearboxBrand:gearboxBrand.trim(),clutchType,clutchDiameter:clutchDiameter.toString(),torqueConverter,autoSpeeds,autoFluidType:autoFluidType.trim(),autoFluidCapacity:autoFluidCapacity.toString(),cvtBeltType,gearboxOilType:gearboxOilType.trim(),gearboxOilCapacity:gearboxOilCapacity.toString(),forkType,forkDiameter:forkDiameter.toString().trim(),forkTravel:forkTravel.toString().trim(),rearShockType,rearTravel:rearTravel.toString().trim(),frontBrake,frontDiscD:frontDiscD.toString().trim(),frontDiscW:frontDiscW.toString().trim(),rearBrake,rearDiscD:rearDiscD.toString().trim(),rearDiscW:rearDiscW.toString().trim(),tyreFront:tyreFront.trim(),tyreRear:tyreRear.trim(),rimFront:rimFront.toString().trim(),rimRear:rimRear.toString().trim(),battVoltage,batteryCCA:batteryCCA.toString(),batteryAh:batteryAh.toString(),batteryDimensions:batteryDimensions.trim(),starterMotorType,fuseBoxNotes:fuseBoxNotes.trim(),deckSize:deckSize.toString().trim(),bladeLength:bladeLength.toString().trim(),bladeType,bladeCount,plugGap:plugGap.toString().trim(),coilType,primaryOhms:primaryOhms.toString().trim(),secondaryOhms:secondaryOhms.toString().trim(),fuelSystem,fuelTankCapacity:fuelTankCapacity.toString(),mixRatio:mixRatio.trim(),ecuModel:ecuModel.trim(),tbDiameter:tbDiameter.toString().trim(),injectorCount,injectorFlow:injectorFlow.toString().trim(),fuelRailPressure:fuelRailPressure.toString().trim(),fuelPumpPressure:fuelPumpPressure.toString().trim(),tpsSensor,mapSensor,iatSensor,o2Sensor,iacSensor,
      iSpacing:iSpacing.trim(),iStuds,eSpacing:eSpacing.trim(),
      eStuds,eBoltSz,eBoltLen:eBoltLen.toString().trim(),iBoltSz,iBoltLen:iBoltLen.toString().trim(),rBoltN,rBoltSz,rBoltLen:rBoltLen.toString().trim(),
      compression:compression.toString().trim(),idleRpm:idleRpm.toString().trim(),wotRpm:wotRpm.toString().trim(),ccSize:ccSize.toString().trim(),
      iPW:iPW.toString().trim(),iPH:iPH.toString().trim(),iPCond,iPNotes:iPNotes.trim(),iPPhotos,
      ePW:ePW.toString().trim(),ePH:ePH.toString().trim(),ePCond,ePNotes:ePNotes.trim(),ePPhotos,
      barLength:barLength.toString(),barGauge,barMount,barStudDiameter,barNutType,barNutSize,chainPitchCS,chainGauge,chainDriveLinks:chainDriveLinks.toString(),chainPartNo:chainPartNo.trim(),chainBrand:chainBrand.trim(),sprocketStyle,sprocketPitchCS,sprocketTeethCS:sprocketTeethCS.toString(),
      clutch2TType,clutchDrumDiameter:clutchDrumDiameter.toString(),clutchShoeCount,clutchEngageRpm:clutchEngageRpm.toString(),clutchBearingPart:clutchBearingPart.trim(),clutch2TNotes:clutch2TNotes.trim(),pulseLoc,pulsePos,pulseOffset:pulseOffset.toString().trim(),ptoDiameter,shaftType,threadDir,threadSize,sprocketType,boreDiameter:boreDiameter.toString().trim(),inputShaftDiameter:inputShaftDiameter.toString(),inputShaftSplines:inputShaftSplines.toString(),inputShaftThread,outputShaftDiameter:outputShaftDiameter.toString(),outputShaftSplines:outputShaftSplines.toString(),outputShaftThread,propShaftDiameter:propShaftDiameter.toString(),gearboxShaftNotes:gearboxShaftNotes.trim(),
      cBrand,cType,cModel:cModel.trim(),notes:notes.trim(),
      studs,customSections,tileFields:e.tileFields||[],tileColors:e.tileColors||{},expandFields:e.expandFields||[],rage:e.rage||0,createdAt:e.createdAt||new Date().toISOString(),
      coolingType,coolantType:coolantType.trim(),coolantCapacity:coolantCapacity.toString(),thermostatTemp:thermostatTemp.toString(),coolingNotes:coolingNotes.trim(),
      turboFitted,turboType,turboBrand:turboBrand.trim(),turboBoost:turboBoost.toString(),intercooler,turboNotes:turboNotes.trim(),
      chargingType,chargeVoltage,chargeAmps:chargeAmps.toString(),rectRegFitted,chargingNotes:chargingNotes.trim(),
      cylMaxWear:cylMaxWear.toString(),cylTaperLimit:cylTaperLimit.toString(),cylOutOfRound:cylOutOfRound.toString(),honingAngle:honingAngle.trim(),nikasil,
      mainBearingType,mainBearingLeft:mainBearingLeft.trim(),mainBearingRight:mainBearingRight.trim(),mainBearingClear:mainBearingClear.toString(),mainBearingPreload:mainBearingPreload.toString(),
      crankPinDiameter:crankPinDiameter.toString(),crankPinLength:crankPinLength.toString(),mainJournalDiameter:mainJournalDiameter.toString(),crankEndFloat:crankEndFloat.toString(),crankRunout:crankRunout.toString(),crankStroke:crankStroke.toString(),crankSealLeft:crankSealLeft.trim(),crankSealRight:crankSealRight.trim(),
      conrodLength:conrodLength.toString(),conrodSmallEnd:conrodSmallEnd.toString(),conrodSmallClear:conrodSmallClear.toString(),conrodBigEnd:conrodBigEnd.toString(),conrodBigClear:conrodBigClear.toString(),conrodSideClear:conrodSideClear.toString(),conrodBearingType,conrodBearingPartNo:conrodBearingPartNo.trim(),
      pistonDiameter:pistonDiameter.toString(),pistonClearance:pistonClearance.toString(),ringCount,ringGapTop:ringGapTop.toString(),ringGapSecond:ringGapSecond.toString(),ringGapOil:ringGapOil.toString(),ringWidth:ringWidth.toString(),ringThickness:ringThickness.toString(),gudgeonDiameter:gudgeonDiameter.toString(),gudgeonLength:gudgeonLength.toString(),gudgeonFit,gudgeonCirclip:gudgeonCirclip.toString(),
      oilChangeInterval:oilChangeInterval.toString(),oilChangeUnit,filterInterval:filterInterval.toString(),filterIntervalUnit,majorServiceInterval:majorServiceInterval.toString(),majorServiceUnit,lastServiceOdo:lastServiceOdo.toString(),
      engineOilGrade:engineOilGrade.trim(),engineOilCapacity:engineOilCapacity.toString(),hydraulicFluidType:hydraulicFluidType.trim(),brakeFluidType,diffOilType:diffOilType.trim(),diffOilCapacity:diffOilCapacity.toString(),transferCaseOil:transferCaseOil.trim(),
      dryWeight:dryWeight.toString(),grossWeight:grossWeight.toString(),wheelbase:wheelbase.toString(),overallLength:overallLength.toString(),overallWidth:overallWidth.toString(),overallHeight:overallHeight.toString(),
      beltType,beltPartNo:beltPartNo.trim(),beltWidth:beltWidth.toString(),beltLength:beltLength.toString(),beltCount,beltNotes:beltNotes.trim(),
      trackedBrand,trackedBrandOther,trackedHours:trackedHours.toString(),trackedSubtype,trackedSubtypeOther,operatingWeight,operatingWeightOther,
      trackType,trackWidth:trackWidth.toString(),trackPitch:trackPitch.toString(),trackLinks:trackLinks.toString(),sprocketTeeth:sprocketTeeth.toString(),undercarriageHours:undercarriageHours.toString(),
      hydPumpCount,hydPumpType,hydSystemPressure:hydSystemPressure.toString(),hydOilCapacity:hydOilCapacity.toString(),hydReliefValve:hydReliefValve.toString(),
      hydRams,attachments,lighting});
  };

  return (
    <div style={ovly} onClick={onClose}>
      <div style={mdl} onClick={ev=>ev.stopPropagation()}>
        <div style={mdlH}>
          <b style={{fontSize:14,textTransform:"uppercase"}}>{existing?"Edit Machine":"Add Machine"}</b>
          <button style={{...btnG,...sm}} onClick={onClose}>✕</button>
        </div>
        {showSectionPicker&&<SectionPicker selected={customSections} onSave={secs=>{setCustomSections(secs);setShowSectionPicker(false);}} onClose={()=>setShowSectionPicker(false)} />}
        <div style={mdlB}>
          {company&&<div style={{marginBottom:14}}>
            <div style={{fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Assign to</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setCompanyId(null)} style={{...btnG,...sm,...(!companyId?{background:ACC,color:"#fff",border:"1px solid "+ACC}:{})}}>Personal</button>
              <button onClick={()=>setCompanyId(company.id)} style={{...btnG,...sm,...(companyId?{background:ACC,color:"#fff",border:"1px solid "+ACC}:{})}}>{company.name}</button>
            </div>
          </div>}

          {/* ── Section header helper inline ── */}
          {/* Basic Info */}
          {(()=>{
            const hasData = name||make||model||desc||photos.length>0;
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecBasic(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Basic Info</span>
                  {hasData&&!secBasic&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secBasic?"▲":"▼"}</span>
              </div>
              {secBasic&&<div style={{paddingTop:12}}>
                <div style={row}>
                  <div style={{...col,flex:1}}>
                    <FL t="Type" />
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <select style={{...sel,flex:1}} value={type} onChange={ev=>setType(ev.target.value)}>
                        <option value="">— not set —</option>
                        {MACHINE_TYPES.map(m=><option key={m.label} value={m.label}>{m.icon} {m.label}</option>)}
                      </select>
                      {type==="Custom"&&<button type="button" onClick={()=>setShowSectionPicker(true)} style={{background:"none",border:"1px solid "+ACC,borderRadius:2,color:ACC,cursor:"pointer",fontSize:14,padding:"6px 8px",flexShrink:0,lineHeight:1}} title="Configure sections">⚙️</button>}
                    </div>
                  </div>
                  <div style={{...col,flex:1}}><FL t="Source" /><select style={sel} value={source} onChange={ev=>setSource(ev.target.value)}><option value="">— not set —</option>{SOURCES.map(s=><option key={s}>{s}</option>)}</select></div>
                </div>
                {!isTracked(type)&&<div style={col}>
                  <FL t="Name *" />
                  <input style={{...inp,border:"1px solid "+(nameErr?RED:BRD)}} placeholder={getPH(type,"name")} value={name} onChange={ev=>{setName(ev.target.value);setNameErr(false);}} autoFocus />
                  {nameErr&&<div style={{fontSize:9,color:RED,marginTop:3}}>Name is required</div>}
                </div>}
                {isTracked(type)&&<div style={{fontSize:9,color:MUT,marginBottom:8,lineHeight:1.5}}>Name auto-generated from Brand + Machine Type + Model.</div>}
                {!isTracked(type)&&<div style={row}>
                  <div style={{...col,flex:1}}>
                    <FL t="Make" />
                    {isVehicle(type)
                      ? <select style={sel} value={make} onChange={ev=>setMake(ev.target.value)}><option value="">— not set —</option>{VEHICLE_MAKES.map(m=><option key={m}>{m}</option>)}</select>
                      : <input style={inp} placeholder={getPH(type,"make")} value={make} onChange={ev=>setMake(ev.target.value)} />
                    }
                  </div>
                  <div style={{...col,flex:1}}><FL t="Model" /><input style={inp} placeholder={getPH(type,"model")} value={model} onChange={ev=>setModel(ev.target.value)} /></div>
                </div>}
                {isTracked(type)&&<div style={{...col,flex:1}}><FL t="Model" /><input style={inp} placeholder="e.g. PC130, 308, JD-50G" value={model} onChange={ev=>setModel(ev.target.value)} /></div>}
                <div style={{...col,maxWidth:140}}><FL t="Year" /><input style={inp} type="number" placeholder="e.g. 2018" min="1900" max="2099" step="1" value={year} onChange={ev=>setYear(ev.target.value)} /></div>
                <div style={col}><FL t="Description" /><textarea style={txa} placeholder={getPH(type,"desc")} value={desc} onChange={ev=>setDesc(ev.target.value)} /></div>
                <div style={col}><FL t="Status" /><select style={sel} value={status} onChange={ev=>setStatus(ev.target.value)}><option value="">— not set —</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
                {/* Vehicle-specific fields */}
                {isVehicle(type)&&<>
                  <div style={row}>
                    <div style={{...col,flex:1}}>
                      <FL t="Colour" />
                      <select style={sel} value={colour} onChange={ev=>setColour(ev.target.value)}>
                        <option value="">— not set —</option>
                        {COMMON_COLOURS.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{...col,flex:1}}><FL t="Body Type" /><select style={sel} value={bodyType} onChange={ev=>setBodyType(ev.target.value)}><option value="">— not set —</option>{BODY_TYPES_VEHICLE.map(b=><option key={b}>{b}</option>)}</select></div>
                  </div>
                  <div style={col}><FL t="Drive Configuration" /><select style={sel} value={driveConfig} onChange={ev=>setDriveConfig(ev.target.value)}><option value="">— not set —</option>{DRIVE_CONFIGS.map(d=><option key={d}>{d}</option>)}</select></div>
                </>}
                {MOTO.includes(type)&&<>
                  <div style={col}><FL t="Body Type" /><select style={sel} value={bodyType} onChange={ev=>setBodyType(ev.target.value)}><option value="">— not set —</option>{BODY_TYPES_MOTO.map(b=><option key={b}>{b}</option>)}</select></div>
                  <div style={col}><FL t="Colour" /><select style={sel} value={colour} onChange={ev=>setColour(ev.target.value)}><option value="">— not set —</option>{COMMON_COLOURS.map(c=><option key={c}>{c}</option>)}</select></div>
                </>}
                {isTracked(type)&&<>
                  <div style={row}>
                    <div style={{...col,flex:1}}>
                      <FL t="Brand" />
                      <select style={sel} value={trackedBrand} onChange={ev=>setTrackedBrand(ev.target.value)}>
                        <option value="">— not set —</option>
                        {TRACKED_BRANDS.map(b=><option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div style={{...col,flex:1}}>
                      <FL t="Machine Type" />
                      <select style={sel} value={trackedSubtype} onChange={ev=>setTrackedSubtype(ev.target.value)}>
                        <option value="">— not set —</option>
                        {TRACKED_SUBTYPES.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  {trackedBrand==="Other"&&<div style={col}><FL t="Brand (describe)" /><input style={inp} placeholder="e.g. Zaxis" value={trackedBrandOther} onChange={ev=>setTrackedBrandOther(ev.target.value)} /></div>}
                  {trackedSubtype==="Other"&&<div style={col}><FL t="Machine type (describe)" /><input style={inp} placeholder="e.g. Pipe Layer" value={trackedSubtypeOther} onChange={ev=>setTrackedSubtypeOther(ev.target.value)} /></div>}
                  <div style={row}>
                    <div style={{...col,flex:1}}>
                      <FL t="Operating Weight" />
                      <select style={sel} value={operatingWeight} onChange={ev=>setOperatingWeight(ev.target.value)}>
                        <option value="">— not set —</option>
                        {OPERATING_WEIGHTS.map(w=><option key={w}>{w}</option>)}
                      </select>
                    </div>
                    {operatingWeight==="Other"&&<div style={{...col,flex:1}}><FL t="Weight (describe)" /><input style={inp} placeholder="e.g. 67T" value={operatingWeightOther} onChange={ev=>setOperatingWeightOther(ev.target.value)} /></div>}
                  </div>
                  <div style={{...col,maxWidth:180}}><FL t="Hours" /><input style={inp} type="number" placeholder="e.g. 4250" step="1" min="0" value={trackedHours} onChange={ev=>setTrackedHours(ev.target.value)} /></div>
                </>}
                <PhotoAdder photos={photos} setPhotos={setPhotos} label="Machine Photos" />
              </div>}
            </div>;
          })()}

          {/* Engine */}
          {(!isCustom(type)||showForCustom("Engine",customSections))&&(()=>{
            const hasData = !!(plugType||strokeType||ccSize||compression||idleRpm||wotRpm||intakeValveClear||exhaustValveClear||cylCount||valveTrain||iValveFace||eValveFace||springFreeLen);
            const engineSum=[
              [strokeType,ccSize?ccSize+"cc":null,compression?compression+" PSI":null].filter(Boolean).join(" · "),
              [plugType?plugType+" plug":null,cylCount?cylCount+" cyl":null,idleRpm?idleRpm+" idle":null,wotRpm?wotRpm+" WOT":null].filter(Boolean).join(" · "),
              [valveTrain,camType,locknutSize?"locknut: "+locknutSize:null].filter(Boolean).join(" · "),
              [intakeValveClear?intakeValveClear+"mm intake clearance":null,exhaustValveClear?exhaustValveClear+"mm exhaust clearance":null].filter(Boolean).join(" · "),
              [iValveFace?iValveFace+"mm intake face":null,eValveFace?eValveFace+"mm exhaust face":null].filter(Boolean).join(" · "),
              [springFreeLen?springFreeLen+"mm spring free length":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecEngine(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Engine</span>
                  {hasData&&!secEngine&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secEngine?"▲":"▼"}</span>
              </div>
              {secEngine&&<div style={{paddingTop:12}}>
                {hasData&&!editEngine&&<SummaryCard onEdit={()=>setEditEngine(true)} lines={engineSum} />}
                {(editEngine||!hasData)&&<>
                <div style={col}>
                  <FL t="Engine / Drive Type" />
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                    {["2-stroke","4-stroke","Diesel","LPG","Hybrid","Electric"].map(s=>(
                      <button key={s} onClick={()=>setStrokeType(strokeType===s?"":s)} style={{padding:"7px 10px",fontSize:9,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer",border:"1px solid "+(strokeType===s?ACC:"#252525"),borderRadius:2,background:strokeType===s?ACC:"#111",color:strokeType===s?"#fff":"#3a3a3a",transition:"background 0.15s,color 0.15s"}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ICE fields — not Electric */}
                {strokeType&&strokeType!=="Electric"&&<>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Cylinder count" /><select style={sel} value={cylCount} onChange={ev=>setCylCount(ev.target.value)}><option value="">— not set —</option>{CYLINDER_COUNTS.map(n=><option key={n}>{n}</option>)}</select></div>
                    {strokeType!=="Diesel"&&strokeType!=="LPG"&&<div style={{...col,flex:1}}><FL t="Spark Plug Type" /><input style={inp} placeholder="e.g. NGK CMR6H" value={plugType} onChange={ev=>setPlugType(ev.target.value)} /></div>}
                    {strokeType==="Diesel"&&<div style={{...col,flex:1}}><FL t="Glow Plug Type" /><input style={inp} placeholder="e.g. Bosch 0250201036" value={plugType} onChange={ev=>setPlugType(ev.target.value)} /></div>}
                    {strokeType==="LPG"&&<div style={{...col,flex:1}}><FL t="Spark Plug Type" /><input style={inp} placeholder="e.g. NGK BKR6E" value={plugType} onChange={ev=>setPlugType(ev.target.value)} /></div>}
                  </div>
                  {cylCount&&parseInt(cylCount)>=2&&<div style={col}><FL t="Firing order" /><input style={inp} placeholder="e.g. 1-3-4-2" value={firingOrder} onChange={ev=>setFiringOrder(ev.target.value)} /></div>}
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="CC size / rating" /><input style={inp} type="number" placeholder="e.g. 26" step="0.1" min="0" value={ccSize} onChange={ev=>setCcSize(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Compression (PSI)" /><input style={inp} type="number" placeholder="e.g. 120" step="1" min="0" value={compression} onChange={ev=>setCompression(ev.target.value)} /></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Idle RPM (approx)" /><input style={inp} type="number" placeholder="e.g. 2800" step="100" min="0" value={idleRpm} onChange={ev=>setIdleRpm(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="WOT RPM (approx)" /><input style={inp} type="number" placeholder="e.g. 10500" step="100" min="0" value={wotRpm} onChange={ev=>setWotRpm(ev.target.value)} /></div>
                  </div>
                  <div style={{...col,maxWidth:180}}><FL t="Cylinder bore diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 38" step="0.01" min="0" value={boreDiameter} onChange={ev=>setBoreDiameter(ev.target.value)} /></div>
                </>}

                {/* Electric / Hybrid motor fields */}
                {(strokeType==="Electric"||strokeType==="Hybrid")&&<>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Electric Motor</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Motor type" /><select style={sel} value={motorType} onChange={ev=>setMotorType(ev.target.value)}><option value="">— not set —</option><option>AC induction</option><option>DC brushed</option><option>DC brushless (BLDC)</option><option>Permanent magnet AC</option><option>Switched reluctance</option></select></div>
                    <div style={{...col,flex:1}}><FL t="Controller brand / model" /><input style={inp} placeholder="e.g. Bosch EMR3" value={controllerBrand} onChange={ev=>setControllerBrand(ev.target.value)} /></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Peak power (kW)" /><input style={inp} type="number" placeholder="e.g. 150" step="0.1" min="0" value={motorPower} onChange={ev=>setMotorPower(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Peak torque (Nm)" /><input style={inp} type="number" placeholder="e.g. 310" step="1" min="0" value={motorTorque} onChange={ev=>setMotorTorque(ev.target.value)} /></div>
                  </div>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Battery Pack</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Pack voltage (V)" /><input style={inp} type="number" placeholder="e.g. 400" step="1" min="0" value={packVoltage} onChange={ev=>setPackVoltage(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Capacity (kWh)" /><input style={inp} type="number" placeholder="e.g. 75" step="0.1" min="0" value={packCapacity} onChange={ev=>setPackCapacity(ev.target.value)} /></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Chemistry" /><select style={sel} value={battChemistry} onChange={ev=>setBattChemistry(ev.target.value)}><option value="">— not set —</option><option>Li-ion NMC</option><option>Li-ion NCA</option><option>LiFePO4</option><option>NiMH</option><option>Lead acid</option><option>Solid state</option></select></div>
                    <div style={{...col,flex:1}}><FL t="Cell count" /><input style={inp} type="number" placeholder="e.g. 96" step="1" min="0" value={cellCount} onChange={ev=>setCellCount(ev.target.value)} /></div>
                  </div>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Charging</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Charge port type" /><select style={sel} value={chargePort} onChange={ev=>setChargePort(ev.target.value)}><option value="">— not set —</option><option>Type 1 (J1772)</option><option>Type 2 (Mennekes)</option><option>CCS Combo 1</option><option>CCS Combo 2</option><option>CHAdeMO</option><option>Tesla/NACS</option><option>GB/T</option><option>Proprietary</option></select></div>
                    <div style={{...col,flex:1}}><FL t="Max charge rate (kW)" /><input style={inp} type="number" placeholder="e.g. 150" step="0.5" min="0" value={maxChargeRate} onChange={ev=>setMaxChargeRate(ev.target.value)} /></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Range (km)" /><input style={inp} type="number" placeholder="e.g. 450" step="1" min="0" value={evRange} onChange={ev=>setEvRange(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Regenerative braking" /><select style={sel} value={regenBraking} onChange={ev=>setRegenBraking(ev.target.value)}><option value="">— not set —</option><option>Yes</option><option>No</option></select></div>
                  </div>
                </>}
                {strokeType==="4-stroke"&&<>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>

                  {/* Valve train */}
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Valve Train</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Valve train type" /><select style={sel} value={valveTrain} onChange={ev=>setValveTrain(ev.target.value)}><option value="">— not set —</option>{VALVE_TRAIN.map(v=><option key={v}>{v}</option>)}</select></div>
                    <div style={{...col,flex:1}}><FL t="Cam type" /><select style={sel} value={camType} onChange={ev=>setCamType(ev.target.value)}><option value="">— not set —</option>{CAM_TYPES.map(v=><option key={v}>{v}</option>)}</select></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Rocker arm locknut size" /><select style={sel} value={locknutSize} onChange={ev=>setLocknutSize(ev.target.value)}><option value="">— not set —</option>{LOCKNUT_SIZES.map(v=><option key={v}>{v}</option>)}</select></div>
                    <div style={{...col,flex:1}}></div>
                  </div>

                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>

                  {/* Valve clearances */}
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Valve Clearances (cold, mm)</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Intake valve clearance (mm)" /><input style={inp} type="number" placeholder="e.g. 0.10" step="0.01" min="0" value={intakeValveClear} onChange={ev=>setIntakeValveClear(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Exhaust valve clearance (mm)" /><input style={inp} type="number" placeholder="e.g. 0.15" step="0.01" min="0" value={exhaustValveClear} onChange={ev=>setExhaustValveClear(ev.target.value)} /></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Valves per intake" /><select style={sel} value={intakeValveN} onChange={ev=>setIntakeValveN(ev.target.value)}><option value="">— not set —</option>{VALVE_COUNTS.map(n=><option key={n}>{n}</option>)}</select></div>
                    <div style={{...col,flex:1}}><FL t="Valves per exhaust" /><select style={sel} value={exhaustValveN} onChange={ev=>setExhaustValveN(ev.target.value)}><option value="">— not set —</option>{VALVE_COUNTS.map(n=><option key={n}>{n}</option>)}</select></div>
                  </div>

                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>

                  {/* Auto-calculated */}
                  {(intakeValveN&&exhaustValveN&&cylCount)&&<>
                    <div style={{background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:2,padding:"8px 10px",marginBottom:10}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <div><div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:MUT,marginBottom:2}}>Total Valve Count</div><div style={{fontSize:13,color:"#e8a060",fontFamily:"'IBM Plex Mono',monospace"}}>{(parseInt(intakeValveN)+parseInt(exhaustValveN))*parseInt(cylCount)}</div></div>
                        <div><div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:MUT,marginBottom:2}}>Valves per Cylinder</div><div style={{fontSize:13,color:"#e8a060",fontFamily:"'IBM Plex Mono',monospace"}}>{parseInt(intakeValveN)+parseInt(exhaustValveN)}</div></div>
                      </div>
                    </div>
                  </>}

                  {/* Intake valve dims */}
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Intake Valve</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Face diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 28" step="0.1" min="0" value={iValveFace} onChange={ev=>setIValveFace(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Stem diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 6" step="0.1" min="0" value={iValveStem} onChange={ev=>setIValveStem(ev.target.value)} /></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Lift (mm)" /><input style={inp} type="number" placeholder="e.g. 6.5" step="0.01" min="0" value={iValveLift} onChange={ev=>setIValveLift(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Weight (g)" /><input style={inp} type="number" placeholder="e.g. 18" step="0.1" min="0" value={iValveWeight} onChange={ev=>setIValveWeight(ev.target.value)} /></div>
                  </div>

                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>

                  {/* Exhaust valve dims */}
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Exhaust Valve</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Face diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 24" step="0.1" min="0" value={eValveFace} onChange={ev=>setEValveFace(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Stem diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 6" step="0.1" min="0" value={eValveStem} onChange={ev=>setEValveStem(ev.target.value)} /></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Lift (mm)" /><input style={inp} type="number" placeholder="e.g. 5.8" step="0.01" min="0" value={eValveLift} onChange={ev=>setEValveLift(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Weight (g)" /><input style={inp} type="number" placeholder="e.g. 16" step="0.1" min="0" value={eValveWeight} onChange={ev=>setEValveWeight(ev.target.value)} /></div>
                  </div>

                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>

                  {/* Valve springs */}
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Valve Springs</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Free length (mm)" /><input style={inp} type="number" placeholder="e.g. 35" step="0.1" min="0" value={springFreeLen} onChange={ev=>setSpringFreeLen(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Outer diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 22" step="0.1" min="0" value={springOuterD} onChange={ev=>setSpringOuterD(ev.target.value)} /></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Wire diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 2.5" step="0.1" min="0" value={springWireD} onChange={ev=>setSpringWireD(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Weight (g)" /><input style={inp} type="number" placeholder="e.g. 12" step="0.1" min="0" value={springWeight} onChange={ev=>setSpringWeight(ev.target.value)} /></div>
                  </div>
                </>}
                {editEngine&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditEngine(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Ignition System */}
          {(!isCustom(type)||showForCustom("Ignition System",customSections))&&(()=>{
            const hasData = !!(plugGap||coilType||primaryOhms||secondaryOhms);
            const ignitionSum=[
              [plugGap?plugGap+"mm plug gap":null,coilType].filter(Boolean).join(" · "),
              [primaryOhms?primaryOhms+"Ω primary":null,secondaryOhms?secondaryOhms+"Ω secondary":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecIgnition(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Ignition System</span>
                  {hasData&&!secIgnition&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secIgnition?"▲":"▼"}</span>
              </div>
              {secIgnition&&<div style={{paddingTop:12}}>
                {hasData&&!editIgnition&&<SummaryCard onEdit={()=>setEditIgnition(true)} lines={ignitionSum} />}
                {(editIgnition||!hasData)&&<>
                {strokeType!=="Diesel"&&<div style={col}><FL t="Spark plug gap (mm)" /><input style={inp} type="number" placeholder="e.g. 0.60" step="0.01" min="0" value={plugGap} onChange={ev=>setPlugGap(ev.target.value)} /></div>}
                {strokeType==="Diesel"&&<div style={col}><FL t="Glow plug resistance (ohms)" /><input style={inp} type="number" placeholder="e.g. 0.8" step="0.01" min="0" value={plugGap} onChange={ev=>setPlugGap(ev.target.value)} /></div>}
                <div style={col}>
                  <FL t="Coil type" />
                  <select style={sel} value={coilType} onChange={ev=>setCoilType(ev.target.value)}>
                    <option value="">— not set —</option>
                    {COIL_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                {coilType&&<div style={row}>
                  <div style={{...col,flex:1}}><FL t="Primary coil resistance (ohms)" /><input style={inp} type="number" placeholder="e.g. 0.5" step="0.1" min="0" value={primaryOhms} onChange={ev=>setPrimaryOhms(ev.target.value)} /></div>
                  {coilType==="Primary + Secondary"&&<div style={{...col,flex:1}}><FL t="Secondary coil resistance (ohms)" /><input style={inp} type="number" placeholder="e.g. 8000" step="1" min="0" value={secondaryOhms} onChange={ev=>setSecondaryOhms(ev.target.value)} /></div>}
                </div>}
                {editIgnition&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditIgnition(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Starter System */}
          {(!isCustom(type)||showForCustom("Starter System",customSections))&&(()=>{
            const hasData = !!(starterType||ropeDiameter||ropeLength||rBoltN||rBoltSz||rBoltLen);
            const hasRecoil = starterType==="Recoil only"||starterType==="Recoil + electric";
            const starterSum=[
              [starterType].filter(Boolean).join(" · "),
              [ropeDiameter?ropeDiameter+"mm rope dia":null,ropeLength?ropeLength+"mm rope length":null].filter(Boolean).join(" · "),
              [rBoltN?rBoltN+"x recoil bolts":null,rBoltSz,rBoltLen?rBoltLen+"mm":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecStarter(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Starter System</span>
                  {hasData&&!secStarter&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secStarter?"▲":"▼"}</span>
              </div>
              {secStarter&&<div style={{paddingTop:12}}>
                {hasData&&!editStarter&&<SummaryCard onEdit={()=>setEditStarter(true)} lines={starterSum} />}
                {(editStarter||!hasData)&&<>
                <div style={col}>
                  <FL t="Starter type" />
                  <select style={sel} value={starterType} onChange={ev=>setStarterType(ev.target.value)}>
                    <option value="">— not set —</option>
                    {STARTER_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                {hasRecoil&&<>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Recoil Housing Bolts</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Bolt count" /><select style={sel} value={rBoltN} onChange={ev=>setRBoltN(ev.target.value)}><option value="">— not set —</option>{RECOIL_COUNTS.map(n=><option key={n} value={n}>{n} bolts</option>)}</select></div>
                    <div style={{...col,flex:1}}><FL t="Bolt diameter" /><select style={sel} value={rBoltSz} onChange={ev=>setRBoltSz(ev.target.value)}><option value="">— not set —</option>{RECOIL_BOLTS.map(s=><option key={s}>{s}</option>)}</select></div>
                  </div>
                  <div style={col}><FL t="Bolt length (mm)" /><input style={inp} type="number" placeholder="e.g. 20" step="0.5" min="0" value={rBoltLen} onChange={ev=>setRBoltLen(ev.target.value)} /></div>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Starter Rope</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Rope diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 3.5" step="0.1" min="0" value={ropeDiameter} onChange={ev=>setRopeDiameter(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Rope length (mm)" /><input style={inp} type="number" placeholder="e.g. 900" step="1" min="0" value={ropeLength} onChange={ev=>setRopeLength(ev.target.value)} /></div>
                  </div>
                </>}
                {editStarter&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditStarter(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Ports */}
          {(strokeType==="2-stroke")&&(!isCustom(type)||showForCustom("Port Dimensions",customSections))&&(()=>{
            const hasData = iPW||iPH||ePW||ePH||iPCond==="Modified"||ePCond==="Modified"||(strokeType==="2-stroke"&&(pulseLoc!=="Manifold face"||pulseOffset));
            const iArea=iPW&&iPH?(parseFloat(iPW)*parseFloat(iPH)).toFixed(1)+"mm²":null;
            const eArea=ePW&&ePH?(parseFloat(ePW)*parseFloat(ePH)).toFixed(1)+"mm²":null;
            const portsSum=[
              iPW&&iPH?"Intake: "+iPW+"x"+iPH+"mm"+(iArea?" ("+iArea+")":"")+(iPCond==="Modified"?" ✦ modified":""):null,
              ePW&&ePH?"Exhaust: "+ePW+"x"+ePH+"mm"+(eArea?" ("+eArea+")":"")+(ePCond==="Modified"?" ✦ modified":""):null,
              pulseLoc?"Pulse: "+pulseLoc+(pulsePos?" / "+pulsePos:"")+(pulseOffset?" / "+pulseOffset+"mm offset":""):null,
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecPorts(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Port Dimensions</span>
                  {hasData&&!secPorts&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secPorts?"▲":"▼"}</span>
              </div>
              {secPorts&&<div style={{paddingTop:12}}>
                {hasData&&!editPorts&&<SummaryCard onEdit={()=>setEditPorts(true)} lines={portsSum} />}
                {(editPorts||!hasData)&&<>
                <div style={{fontSize:9,color:MUT,marginBottom:10,lineHeight:1.5}}>Measured at bore wall. Area is auto-calculated.</div>

                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Intake Port</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Width (mm)" /><input style={inp} type="number" placeholder="e.g. 18" step="0.1" min="0" value={iPW} onChange={ev=>setIPW(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Height (mm)" /><input style={inp} type="number" placeholder="e.g. 12" step="0.1" min="0" value={iPH} onChange={ev=>setIPH(ev.target.value)} /></div>
                </div>
                {iPW&&iPH&&<div style={{background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:2,padding:"6px 10px",marginBottom:10}}>
                  <div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:MUT,marginBottom:2}}>Intake Port Area</div>
                  <div style={{fontSize:13,color:"#e8a060",fontFamily:"'IBM Plex Mono',monospace"}}>{(parseFloat(iPW)*parseFloat(iPH)).toFixed(1)} mm²</div>
                </div>}
                <div style={col}><FL t="Condition" /><select style={sel} value={iPCond} onChange={ev=>setIPCond(ev.target.value)}>{PORT_CONDITION.map(c=><option key={c}>{c}</option>)}</select></div>
                {iPCond==="Modified"&&<>
                  <div style={col}><FL t="Modification notes" /><textarea style={txa} placeholder="e.g. raised 1.5mm, blended transfers..." value={iPNotes} onChange={ev=>setIPNotes(ev.target.value)} /></div>
                  <PhotoAdder photos={iPPhotos} setPhotos={setIPPhotos} label="Port photos" />
                </>}

                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Exhaust Port</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Width (mm)" /><input style={inp} type="number" placeholder="e.g. 22" step="0.1" min="0" value={ePW} onChange={ev=>setEPW(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Height (mm)" /><input style={inp} type="number" placeholder="e.g. 16" step="0.1" min="0" value={ePH} onChange={ev=>setEPH(ev.target.value)} /></div>
                </div>
                {ePW&&ePH&&<div style={{background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:2,padding:"6px 10px",marginBottom:10}}>
                  <div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:MUT,marginBottom:2}}>Exhaust Port Area</div>
                  <div style={{fontSize:13,color:"#e8a060",fontFamily:"'IBM Plex Mono',monospace"}}>{(parseFloat(ePW)*parseFloat(ePH)).toFixed(1)} mm²</div>
                </div>}
                <div style={col}><FL t="Condition" /><select style={sel} value={ePCond} onChange={ev=>setEPCond(ev.target.value)}>{PORT_CONDITION.map(c=><option key={c}>{c}</option>)}</select></div>
                {ePCond==="Modified"&&<>
                  <div style={col}><FL t="Modification notes" /><textarea style={txa} placeholder="e.g. raised 1.5mm, blended transfers..." value={ePNotes} onChange={ev=>setEPNotes(ev.target.value)} /></div>
                  <PhotoAdder photos={ePPhotos} setPhotos={setEPPhotos} label="Port photos" />
                </>}

                {strokeType==="2-stroke"&&<>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Pulse Port</div>
                  <div style={{fontSize:9,color:MUT,marginBottom:10,lineHeight:1.5}}>The carb diaphragm impulse port — location relative to the intake port.</div>
                  <div style={col}><FL t="Location" /><select style={sel} value={pulseLoc} onChange={ev=>setPulseLoc(ev.target.value)}><option value="">— not set —</option>{PULSE_LOC.map(l=><option key={l}>{l}</option>)}</select></div>
                  <div style={col}><FL t="Position" /><select style={sel} value={pulsePos} onChange={ev=>setPulsePos(ev.target.value)}><option value="">— not set —</option>{PULSE_POS.map(p=><option key={p}>{p}</option>)}</select></div>
                  <div style={col}><FL t="Offset from nearest port edge (mm)" /><input style={inp} type="number" placeholder="e.g. 8" step="0.5" min="0" value={pulseOffset} onChange={ev=>setPulseOffset(ev.target.value)} /></div>
                </>}
                {editPorts&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditPorts(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* 2-Stroke Centrifugal Clutch */}
          {strokeType==="2-stroke"&&(!isCustom(type)||showForCustom("Engine",customSections))&&(()=>{
            const hasData=!!(clutch2TType||clutchDrumDiameter||clutchShoeCount||clutchEngageRpm);
            const clutchSum=[
              [clutch2TType,clutchDrumDiameter?clutchDrumDiameter+"mm drum":null,clutchShoeCount?clutchShoeCount+" shoes":null].filter(Boolean).join(" · "),
              [clutchEngageRpm?clutchEngageRpm+" RPM engagement":null,clutchBearingPart?"Bearing: "+clutchBearingPart:null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSec2TClutch(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Centrifugal Clutch</span>
                  {hasData&&!sec2TClutch&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{sec2TClutch?"▲":"▼"}</span>
              </div>
              {sec2TClutch&&<div style={{paddingTop:12}}>
                {hasData&&!edit2TClutch&&<SummaryCard onEdit={()=>setEdit2TClutch(true)} lines={clutchSum} />}
                {(edit2TClutch||!hasData)&&<>
                <div style={col}><FL t="Clutch type" /><select style={sel} value={clutch2TType} onChange={ev=>setClutch2TType(ev.target.value)}><option value="">— not set —</option><option>Centrifugal drum</option><option>Centrifugal plate</option><option>Manual</option><option>Other</option></select></div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Drum diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 76" step="0.5" min="0" value={clutchDrumDiameter} onChange={ev=>setClutchDrumDiameter(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Shoe count" /><select style={sel} value={clutchShoeCount} onChange={ev=>setClutchShoeCount(ev.target.value)}><option value="">— not set —</option>{["2","3","4","6"].map(n=><option key={n}>{n}</option>)}</select></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Engagement RPM (approx)" /><input style={inp} type="number" placeholder="e.g. 3500" step="100" min="0" value={clutchEngageRpm} onChange={ev=>setClutchEngageRpm(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Clutch bearing part no." /><input style={inp} placeholder="e.g. 6201" value={clutchBearingPart} onChange={ev=>setClutchBearingPart(ev.target.value)} /></div>
                </div>
                <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Drum condition, spring tension" value={clutch2TNotes} onChange={ev=>setClutch2TNotes(ev.target.value)} /></div>
                {edit2TClutch&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEdit2TClutch(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Engine Output Shaft */}
          {showPTO(type,customSections)&&(()=>{
            const hasData = !!(ptoDiameter||shaftType||threadDir||threadSize||sprocketType);
            const ptoSum=[
              [ptoDiameter?"PTO: "+ptoDiameter:null,shaftType].filter(Boolean).join(" · "),
              [threadDir,threadSize,sprocketType].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecPto(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Engine Output Shaft</span>
                  {hasData&&!secPto&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secPto?"▲":"▼"}</span>
              </div>
              {secPto&&<div style={{paddingTop:12}}>
                {hasData&&!editPto&&<SummaryCard onEdit={()=>setEditPto(true)} lines={ptoSum} />}
                {(editPto||!hasData)&&<>
                <div style={{...col,maxWidth:240}}><FL t="PTO shaft diameter" /><select style={sel} value={ptoDiameter} onChange={ev=>setPtoDiameter(ev.target.value)}><option value="">— not set —</option>{PTO_DIAMETERS.map(d=><option key={d}>{d}</option>)}</select></div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Shaft type" /><select style={sel} value={shaftType} onChange={ev=>setShaftType(ev.target.value)}><option value="">— not set —</option>{SHAFT_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Head thread direction" /><select style={sel} value={threadDir} onChange={ev=>setThreadDir(ev.target.value)}><option value="">— not set —</option>{THREAD_DIR.map(t=><option key={t}>{t}</option>)}</select></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Head thread size" /><select style={sel} value={threadSize} onChange={ev=>setThreadSize(ev.target.value)}><option value="">— not set —</option>{THREAD_SIZES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Sprocket type" /><select style={sel} value={sprocketType} onChange={ev=>setSprocketType(ev.target.value)}><option value="">— not set —</option>{SPROCKET_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
                </div>
                {editPto&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditPto(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Gearbox Shafts — vehicles, motos, tracked */}
          {(isVehicle(type)||MOTO.includes(type)||isTracked(type)||isCustom(type))&&(()=>{
            const hasData=!!(inputShaftDiameter||outputShaftDiameter||propShaftDiameter);
            const shaftSum=[
              [inputShaftDiameter?"Input: "+inputShaftDiameter+"mm":null,inputShaftSplines?inputShaftSplines+" splines":null,inputShaftThread||null].filter(Boolean).join(" · "),
              [outputShaftDiameter?"Output: "+outputShaftDiameter+"mm":null,outputShaftSplines?outputShaftSplines+" splines":null,outputShaftThread||null].filter(Boolean).join(" · "),
              [propShaftDiameter?"Prop shaft: "+propShaftDiameter+"mm":null].filter(Boolean).join(""),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecGearboxShafts(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Gearbox Shafts</span>
                  {hasData&&!secGearboxShafts&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secGearboxShafts?"▲":"▼"}</span>
              </div>
              {secGearboxShafts&&<div style={{paddingTop:12}}>
                {hasData&&!editGearboxShafts&&<SummaryCard onEdit={()=>setEditGearboxShafts(true)} lines={shaftSum} />}
                {(editGearboxShafts||!hasData)&&<>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Input Shaft (Engine → Gearbox)</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 25" step="0.1" min="0" value={inputShaftDiameter} onChange={ev=>setInputShaftDiameter(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Spline count" /><input style={inp} type="number" placeholder="e.g. 23" step="1" min="0" value={inputShaftSplines} onChange={ev=>setInputShaftSplines(ev.target.value)} /></div>
                </div>
                <div style={{...col,maxWidth:200}}><FL t="Thread spec" /><input style={inp} placeholder="e.g. M22×1.5 RH" value={inputShaftThread} onChange={ev=>setInputShaftThread(ev.target.value)} /></div>
                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Output Shaft (Gearbox → Drivetrain)</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 28" step="0.1" min="0" value={outputShaftDiameter} onChange={ev=>setOutputShaftDiameter(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Spline count" /><input style={inp} type="number" placeholder="e.g. 26" step="1" min="0" value={outputShaftSplines} onChange={ev=>setOutputShaftSplines(ev.target.value)} /></div>
                </div>
                <div style={{...col,maxWidth:200}}><FL t="Thread spec" /><input style={inp} placeholder="e.g. M24×1.5 RH" value={outputShaftThread} onChange={ev=>setOutputShaftThread(ev.target.value)} /></div>
                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Prop / Drive Shaft</div>
                <div style={{...col,maxWidth:200}}><FL t="Diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 50" step="0.1" min="0" value={propShaftDiameter} onChange={ev=>setPropShaftDiameter(ev.target.value)} /></div>
                <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Double cardan front, single rear" value={gearboxShaftNotes} onChange={ev=>setGearboxShaftNotes(ev.target.value)} /></div>
                {editGearboxShafts&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditGearboxShafts(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Fuel System */}
          {(!isCustom(type)||showForCustom("Fuel System",customSections))&&(()=>{
            const hasData = !!(fuelSystem||cBrand||cType||cModel||ecuModel||tbDiameter||injectorCount||fuelTankCapacity||mixRatio);
            const carbSum=[
              [strokeType==="2-stroke"?"Carburetted":strokeType==="Diesel"?"Diesel injection":fuelSystem,cBrand,cType,cModel].filter(Boolean).join(" · "),
              [fuelTankCapacity?fuelTankCapacity+"L tank":null,mixRatio?"Mix: "+mixRatio:null].filter(Boolean).join(" · "),
              [ecuModel,tbDiameter?tbDiameter+"mm TB":null,injectorCount?injectorCount+" injectors":null].filter(Boolean).join(" · "),
              [[tpsSensor,mapSensor,iatSensor,o2Sensor,iacSensor].filter(s=>s&&s!=="Not present").length>0?[tpsSensor&&tpsSensor!=="Not present"?"TPS":null,mapSensor&&mapSensor!=="Not present"?"MAP":null,iatSensor&&iatSensor!=="Not present"?"IAT":null,o2Sensor&&o2Sensor!=="Not present"?"O2":null,iacSensor&&iacSensor!=="Not present"?"IAC":null].filter(Boolean).join(" / ")+" sensors fitted":null].filter(Boolean).join(""),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecCarb(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Fuel System</span>
                  {hasData&&!secCarb&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secCarb?"▲":"▼"}</span>
              </div>
              {secCarb&&<div style={{paddingTop:12}}>
                {hasData&&!editCarb&&<SummaryCard onEdit={()=>setEditCarb(true)} lines={carbSum} />}
                {(editCarb||!hasData)&&<>

                {/* Tank capacity — all engine types */}
                {strokeType&&<div style={{...col,maxWidth:180}}><FL t="Fuel tank capacity (L)" /><input style={inp} type="number" placeholder="e.g. 3.5" step="0.1" min="0" value={fuelTankCapacity} onChange={ev=>setFuelTankCapacity(ev.target.value)} /></div>}

                {/* No engine type selected */}
                {!strokeType&&<div style={{fontSize:10,color:MUT,padding:"8px 0"}}>Select engine type in the Engine section first.</div>}

                {/* 2-stroke — carb only, no toggle */}
                {strokeType==="2-stroke"&&<>
                  <div style={{fontSize:9,color:MUT,marginBottom:12}}>2-stroke engines are carburetted.</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Carb brand" /><select style={sel} value={cBrand} onChange={ev=>setCBrand(ev.target.value)}><option value="">— not set —</option>{CARB_BRANDS.map(b=><option key={b}>{b}</option>)}</select></div>
                    <div style={{...col,flex:1}}><FL t="Carb type" /><select style={sel} value={cType} onChange={ev=>setCType(ev.target.value)}><option value="">— not set —</option>{CARB_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  </div>
                  <div style={col}><FL t="Carb model (optional)" /><input style={inp} placeholder="e.g. WT-668" value={cModel} onChange={ev=>setCModel(ev.target.value)} /></div>
                  <div style={col}><FL t="Oil/fuel mix ratio" /><input style={inp} placeholder="e.g. 50:1 / 40:1 / 25:1" value={mixRatio} onChange={ev=>setMixRatio(ev.target.value)} /></div>
                </>}

                {/* 4-stroke — show fuel system toggle */}
                {strokeType==="4-stroke"&&<>
                  <div style={col}>
                    <FL t="Fuel delivery" />
                    <div style={{display:"flex",gap:0,borderRadius:2,overflow:"hidden",border:"1px solid #252525"}}>
                      {["Carburetted","Fuel Injected"].map(s=>(
                        <button key={s} onClick={()=>setFuelSystem(s)} style={{flex:1,padding:"8px 0",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer",border:"none",background:fuelSystem===s?"#e8670a":"#0a0a0a",color:fuelSystem===s?"#fff":"#3a3a3a",transition:"background 0.15s,color 0.15s"}}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Carburetted fields */}
                  {fuelSystem==="Carburetted"&&<>
                    <div style={row}>
                      <div style={{...col,flex:1}}><FL t="Carb brand" /><select style={sel} value={cBrand} onChange={ev=>setCBrand(ev.target.value)}><option value="">— not set —</option>{CARB_BRANDS.map(b=><option key={b}>{b}</option>)}</select></div>
                      <div style={{...col,flex:1}}><FL t="Carb type" /><select style={sel} value={cType} onChange={ev=>setCType(ev.target.value)}><option value="">— not set —</option>{CARB_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                    </div>
                    <div style={row}>
                      <div style={{...col,flex:2}}><FL t="Carb model (optional)" /><input style={inp} placeholder="e.g. WT-668" value={cModel} onChange={ev=>setCModel(ev.target.value)} /></div>
                      <div style={{...col,flex:1}}><FL t="Count" /><select style={sel} value={carbCount} onChange={ev=>setCarbCount(ev.target.value)}><option value="">—</option>{["1","2","3","4","6","8"].map(n=><option key={n}>{n}</option>)}</select></div>
                    </div>
                  </>}

                  {/* EFI fields */}
                  {fuelSystem==="Fuel Injected"&&<>
                    <div style={row}>
                      <div style={{...col,flex:1}}><FL t="ECU brand / model" /><input style={inp} placeholder="e.g. Keihin PGM-FI" value={ecuModel} onChange={ev=>setEcuModel(ev.target.value)} /></div>
                      <div style={{...col,flex:1}}><FL t="Throttle body diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 28" step="0.1" min="0" value={tbDiameter} onChange={ev=>setTbDiameter(ev.target.value)} /></div>
                    </div>
                    <div style={row}>
                      <div style={{...col,flex:1}}><FL t="Fuel injector count" /><select style={sel} value={injectorCount} onChange={ev=>setInjectorCount(ev.target.value)}><option value="">— not set —</option>{INJECTOR_COUNTS.map(n=><option key={n}>{n}</option>)}</select></div>
                      <div style={{...col,flex:1}}><FL t="Injector flow rate (cc/min)" /><input style={inp} type="number" placeholder="e.g. 120" step="1" min="0" value={injectorFlow} onChange={ev=>setInjectorFlow(ev.target.value)} /></div>
                    </div>
                    <div style={row}>
                      <div style={{...col,flex:1}}><FL t="Fuel rail pressure (bar)" /><input style={inp} type="number" placeholder="e.g. 3.0" step="0.1" min="0" value={fuelRailPressure} onChange={ev=>setFuelRailPressure(ev.target.value)} /></div>
                      <div style={{...col,flex:1}}><FL t="Fuel pump pressure (bar)" /><input style={inp} type="number" placeholder="e.g. 3.5" step="0.1" min="0" value={fuelPumpPressure} onChange={ev=>setFuelPumpPressure(ev.target.value)} /></div>
                    </div>
                    <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                    <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Sensors</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <div style={col}><FL t="TPS" /><select style={sel} value={tpsSensor} onChange={ev=>setTpsSensor(ev.target.value)}><option value="">— not set —</option>{SENSOR_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
                      <div style={col}><FL t="MAP sensor" /><select style={sel} value={mapSensor} onChange={ev=>setMapSensor(ev.target.value)}><option value="">— not set —</option>{SENSOR_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
                      <div style={col}><FL t="IAT sensor" /><select style={sel} value={iatSensor} onChange={ev=>setIatSensor(ev.target.value)}><option value="">— not set —</option>{SENSOR_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
                      <div style={col}><FL t="O2 sensor" /><select style={sel} value={o2Sensor} onChange={ev=>setO2Sensor(ev.target.value)}><option value="">— not set —</option>{SENSOR_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
                      <div style={col}><FL t="IAC" /><select style={sel} value={iacSensor} onChange={ev=>setIacSensor(ev.target.value)}><option value="">— not set —</option>{SENSOR_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
                    </div>
                  </>}

                {editCarb&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditCarb(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Fastener Specs */}
          {(!isCustom(type)||showForCustom("Fastener Specs",customSections))&&(()=>{
            const hasData = fasteners.length>0;
            const saveFastener = sv => {
              if(fastEditIdx!==null){setFasteners(prev=>prev.map((x,i)=>i===fastEditIdx?{...sv,id:x.id||uid()}:x));setFastEditIdx(null);}
              else{setFasteners(prev=>[...prev,{...sv,id:uid()}]);setFastAdding(false);}
            };
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecFasteners(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Fastener Specs</span>
                  {hasData&&!secFasteners&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secFasteners?"▲":"▼"}</span>
              </div>
              {secFasteners&&<div style={{paddingTop:12}}>
                <div style={{fontSize:9,color:MUT,marginBottom:12,lineHeight:1.5}}>Log any fastener — studs, bolts, plugs. Add as many as needed.</div>
                {fasteners.map((f,idx)=>(
                  fastEditIdx===idx
                    ? <StudForm key={f.id||idx} s={f} onSave={saveFastener} onCancel={()=>setFastEditIdx(null)} />
                    : <StudCard key={f.id||idx} s={f} onEdit={()=>{setFastEditIdx(idx);setFastAdding(false);}} onRemove={()=>{if(confirm("Remove this entry?"))setFasteners(prev=>prev.filter((_,i)=>i!==idx));}} />
                ))}
                {fastAdding&&<StudForm s={{}} onSave={saveFastener} onCancel={()=>setFastAdding(false)} />}
                {!fastAdding&&fastEditIdx===null&&<button onClick={()=>setFastAdding(true)} style={{...btnG,width:"100%",marginTop:4}}>+ Add Fastener</button>}
              </div>}
            </div>;
          })()}

          {/* Pump — Pressure Washer only */}
          {showPump(type,customSections)&&(()=>{
            const hasData = !!(pumpBrand||pumpModel||pumpPsi||pumpFlow||pumpType);
            const pumpSum=[
              [pumpBrand,pumpModel,pumpType].filter(Boolean).join(" · "),
              [pumpPsi?pumpPsi+" PSI":null,pumpFlow?pumpFlow+" LPM":null,pumpInlet?"in: "+pumpInlet:null,pumpOutlet?"out: "+pumpOutlet:null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecPump(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Pump</span>
                  {hasData&&!secPump&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secPump?"▲":"▼"}</span>
              </div>
              {secPump&&<div style={{paddingTop:12}}>
                {hasData&&!editPump&&<SummaryCard onEdit={()=>setEditPump(true)} lines={pumpSum} />}
                {(editPump||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Pump brand" /><input style={inp} placeholder="e.g. AR" value={pumpBrand} onChange={ev=>setPumpBrand(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Pump model" /><input style={inp} placeholder="e.g. RMW2.2G24" value={pumpModel} onChange={ev=>setPumpModel(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Max PSI" /><input style={inp} type="number" placeholder="e.g. 3200" step="10" min="0" value={pumpPsi} onChange={ev=>setPumpPsi(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Flow rate (LPM)" /><input style={inp} type="number" placeholder="e.g. 8" step="0.1" min="0" value={pumpFlow} onChange={ev=>setPumpFlow(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Pump type" /><select style={sel} value={pumpType} onChange={ev=>setPumpType(ev.target.value)}><option value="">— not set —</option>{PUMP_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Inlet size" /><select style={sel} value={pumpInlet} onChange={ev=>setPumpInlet(ev.target.value)}><option value="">— not set —</option>{INLET_SIZES.map(s=><option key={s}>{s}</option>)}</select></div>
                </div>
                <div style={col}><FL t="Outlet size" /><select style={sel} value={pumpOutlet} onChange={ev=>setPumpOutlet(ev.target.value)}><option value="">— not set —</option>{OUTLET_SIZES.map(s=><option key={s}>{s}</option>)}</select></div>
                {editPump&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditPump(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Generator Output — Generator only */}
          {showGenOutput(type,customSections)&&(()=>{
            const hasData = !!(genWatts||genPeakWatts||genVoltage||genFreq);
            const genSum=[
              [genWatts?genWatts+"W rated":null,genPeakWatts?genPeakWatts+"W peak":null,genVoltage,genFreq].filter(Boolean).join(" · "),
              [genAvr?"AVR: "+genAvr:null,genOutlets?"Outlets: "+genOutlets:null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecGenOutput(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Generator Output</span>
                  {hasData&&!secGenOutput&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secGenOutput?"▲":"▼"}</span>
              </div>
              {secGenOutput&&<div style={{paddingTop:12}}>
                {hasData&&!editGenOutput&&<SummaryCard onEdit={()=>setEditGenOutput(true)} lines={genSum} />}
                {(editGenOutput||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Rated watts" /><input style={inp} type="number" placeholder="e.g. 2000" step="50" min="0" value={genWatts} onChange={ev=>setGenWatts(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Peak watts" /><input style={inp} type="number" placeholder="e.g. 2500" step="50" min="0" value={genPeakWatts} onChange={ev=>setGenPeakWatts(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Voltage" /><select style={sel} value={genVoltage} onChange={ev=>setGenVoltage(ev.target.value)}><option value="">— not set —</option><option>110V</option><option>120V</option><option>230V</option><option>240V</option><option>Dual</option></select></div>
                  <div style={{...col,flex:1}}><FL t="Frequency" /><select style={sel} value={genFreq} onChange={ev=>setGenFreq(ev.target.value)}><option value="">— not set —</option><option>50Hz</option><option>60Hz</option></select></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="AVR" /><select style={sel} value={genAvr} onChange={ev=>setGenAvr(ev.target.value)}><option value="">— not set —</option><option>Present</option><option>Not present</option></select></div>
                  <div style={{...col,flex:1}}><FL t="Outlets" /><input style={inp} placeholder="e.g. 2× 240V, 1× 12V DC" value={genOutlets} onChange={ev=>setGenOutlets(ev.target.value)} /></div>
                </div>
                {editGenOutput&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditGenOutput(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Drivetrain */}
          {showDrivetrain(type,customSections)&&(()=>{
            const hasData = !!(driveType||chainPitch||frontSprocket||rearSprocket||transType||gearboxBrand||clutchType||gearboxOilType);
            const driveSum=[
              [driveType,transType,gearCount?gearCount+" gears":null,gearboxBrand].filter(Boolean).join(" · "),
              [chainPitch?chainPitch+" pitch":null,frontSprocket?"F: "+frontSprocket+"T":null,rearSprocket?"R: "+rearSprocket+"T":null].filter(Boolean).join(" · "),
              [clutchType,clutchDiameter?clutchDiameter+"mm clutch":null].filter(Boolean).join(" · "),
              [gearboxOilType,gearboxOilCapacity?gearboxOilCapacity+"L gearbox oil":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecDrive(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Drivetrain</span>
                  {hasData&&!secDrive&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secDrive?"▲":"▼"}</span>
              </div>
              {secDrive&&<div style={{paddingTop:12}}>
                {hasData&&!editDrive&&<SummaryCard onEdit={()=>setEditDrive(true)} lines={driveSum} />}
                {(editDrive||!hasData)&&<>

                {/* Drive type and transmission */}
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Drive type" /><select style={sel} value={driveType} onChange={ev=>setDriveType(ev.target.value)}><option value="">— not set —</option><option>Chain</option><option>Belt</option><option>Shaft</option><option>Direct</option></select></div>
                  <div style={{...col,flex:1}}><FL t="Transmission" /><select style={sel} value={transType} onChange={ev=>setTransType(ev.target.value)}><option value="">— not set —</option>{TRANS_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                </div>

                {/* Manual */}
                {transType==="Manual"&&<>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Gear count" /><select style={sel} value={gearCount} onChange={ev=>setGearCount(ev.target.value)}><option value="">— not set —</option>{["1","2","3","4","5","6","7","8","9","10"].map(n=><option key={n}>{n}</option>)}</select></div>
                    <div style={{...col,flex:1}}><FL t="Gearbox brand / model" /><input style={inp} placeholder="e.g. ZF 6-speed" value={gearboxBrand} onChange={ev=>setGearboxBrand(ev.target.value)} /></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Clutch type" /><select style={sel} value={clutchType} onChange={ev=>setClutchType(ev.target.value)}><option value="">— not set —</option>{CLUTCH_TYPES.map(c=><option key={c}>{c}</option>)}</select></div>
                    <div style={{...col,flex:1}}><FL t="Clutch diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 228" step="1" min="0" value={clutchDiameter} onChange={ev=>setClutchDiameter(ev.target.value)} /></div>
                  </div>
                </>}

                {/* Automatic */}
                {transType==="Automatic"&&<>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Speeds" /><select style={sel} value={autoSpeeds} onChange={ev=>setAutoSpeeds(ev.target.value)}><option value="">— not set —</option>{["3","4","5","6","7","8","9","10"].map(n=><option key={n}>{n}</option>)}</select></div>
                    <div style={{...col,flex:1}}><FL t="Gearbox brand / model" /><input style={inp} placeholder="e.g. Aisin AW55-50SN" value={gearboxBrand} onChange={ev=>setGearboxBrand(ev.target.value)} /></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Torque converter" /><select style={sel} value={torqueConverter} onChange={ev=>setTorqueConverter(ev.target.value)}><option value="">— not set —</option><option>Yes</option><option>No</option></select></div>
                    <div style={{...col,flex:1}}><FL t="ATF type" /><input style={inp} placeholder="e.g. Dexron VI" value={autoFluidType} onChange={ev=>setAutoFluidType(ev.target.value)} /></div>
                  </div>
                  <div style={{...col,maxWidth:160}}><FL t="ATF capacity (L)" /><input style={inp} type="number" placeholder="e.g. 8.5" step="0.1" min="0" value={autoFluidCapacity} onChange={ev=>setAutoFluidCapacity(ev.target.value)} /></div>
                </>}

                {/* CVT */}
                {transType==="CVT"&&<>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Gearbox brand / model" /><input style={inp} placeholder="e.g. Jatco JF015E" value={gearboxBrand} onChange={ev=>setGearboxBrand(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Belt / chain type" /><select style={sel} value={cvtBeltType} onChange={ev=>setCvtBeltType(ev.target.value)}><option value="">— not set —</option>{CVT_BELT_TYPES.map(b=><option key={b}>{b}</option>)}</select></div>
                  </div>
                </>}

                {/* DCT */}
                {transType==="DCT"&&<>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Gearbox brand / model" /><input style={inp} placeholder="e.g. VW DSG DQ250" value={gearboxBrand} onChange={ev=>setGearboxBrand(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Clutch type" /><select style={sel} value={clutchType} onChange={ev=>setClutchType(ev.target.value)}><option value="">— not set —</option><option>Wet</option><option>Dry</option></select></div>
                  </div>
                </>}

                {/* Chain/sprocket — for chain drive types */}
                {driveType==="Chain"&&<>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Chain & Sprockets</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Chain pitch" /><select style={sel} value={chainPitch} onChange={ev=>setChainPitch(ev.target.value)}><option value="">— not set —</option>{CHAIN_PITCHES.map(p=><option key={p}>{p}</option>)}</select></div>
                    <div style={{...col,flex:1}}><FL t="Gear count" /><select style={sel} value={gearCount} onChange={ev=>setGearCount(ev.target.value)}><option value="">— not set —</option>{["1","2","3","4","5","6","7","8"].map(n=><option key={n}>{n}</option>)}</select></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Front sprocket (teeth)" /><input style={inp} type="number" placeholder="e.g. 14" step="1" min="0" value={frontSprocket} onChange={ev=>setFrontSprocket(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Rear sprocket (teeth)" /><input style={inp} type="number" placeholder="e.g. 42" step="1" min="0" value={rearSprocket} onChange={ev=>setRearSprocket(ev.target.value)} /></div>
                  </div>
                </>}

                {/* Gearbox oil — all types */}
                {transType&&transType!=="None"&&<>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Gearbox Oil</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Oil type / grade" /><input style={inp} placeholder="e.g. 75W-90 GL-4" value={gearboxOilType} onChange={ev=>setGearboxOilType(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Capacity (L)" /><input style={inp} type="number" placeholder="e.g. 2.1" step="0.1" min="0" value={gearboxOilCapacity} onChange={ev=>setGearboxOilCapacity(ev.target.value)} /></div>
                  </div>
                </>}

                {editDrive&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditDrive(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Suspension */}
          {showSuspension(type,customSections)&&(()=>{
            const hasData = !!(forkType||forkDiameter||rearShockType);
            const suspSum=[
              [forkType,forkDiameter?forkDiameter+"mm forks":null,forkTravel?forkTravel+"mm travel":null].filter(Boolean).join(" · "),
              [rearShockType,rearTravel?rearTravel+"mm rear travel":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecSuspension(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Suspension</span>
                  {hasData&&!secSuspension&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secSuspension?"▲":"▼"}</span>
              </div>
              {secSuspension&&<div style={{paddingTop:12}}>
                {hasData&&!editSuspension&&<SummaryCard onEdit={()=>setEditSuspension(true)} lines={suspSum} />}
                {(editSuspension||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Front type" /><select style={sel} value={forkType} onChange={ev=>setForkType(ev.target.value)}><option value="">— not set —</option>{FORK_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Fork diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 33" step="0.1" min="0" value={forkDiameter} onChange={ev=>setForkDiameter(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Front travel (mm)" /><input style={inp} type="number" placeholder="e.g. 120" step="1" min="0" value={forkTravel} onChange={ev=>setForkTravel(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Rear type" /><select style={sel} value={rearShockType} onChange={ev=>setRearShockType(ev.target.value)}><option value="">— not set —</option>{SHOCK_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                </div>
                <div style={col}><FL t="Rear travel (mm)" /><input style={inp} type="number" placeholder="e.g. 110" step="1" min="0" value={rearTravel} onChange={ev=>setRearTravel(ev.target.value)} /></div>
                {editSuspension&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditSuspension(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Brakes */}
          {showBrakes(type,customSections)&&(()=>{
            const hasData = !!(frontBrake||rearBrake);
            const brakesSum=[
              [frontBrake?"Front: "+frontBrake:null,frontDiscD?frontDiscD+"mm dia":null,frontDiscW?frontDiscW+"mm wide":null].filter(Boolean).join(" · "),
              [rearBrake?"Rear: "+rearBrake:null,rearDiscD?rearDiscD+"mm dia":null,rearDiscW?rearDiscW+"mm wide":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecBrakes(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Brakes</span>
                  {hasData&&!secBrakes&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secBrakes?"▲":"▼"}</span>
              </div>
              {secBrakes&&<div style={{paddingTop:12}}>
                {hasData&&!editBrakes&&<SummaryCard onEdit={()=>setEditBrakes(true)} lines={brakesSum} />}
                {(editBrakes||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Front brake type" /><select style={sel} value={frontBrake} onChange={ev=>setFrontBrake(ev.target.value)}><option value="">— not set —</option>{BRAKE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  {frontBrake==="Disc"&&<div style={{...col,flex:1}}><FL t="Front disc diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 220" step="1" min="0" value={frontDiscD} onChange={ev=>setFrontDiscD(ev.target.value)} /></div>}
                 {frontBrake==="Disc"&&<div style={{...col,flex:1}}><FL t="Front disc width (mm)" /><input style={inp} type="number" placeholder="e.g. 4.5" step="0.1" min="0" value={frontDiscW} onChange={ev=>setFrontDiscW(ev.target.value)} /></div>}
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Rear brake type" /><select style={sel} value={rearBrake} onChange={ev=>setRearBrake(ev.target.value)}><option value="">— not set —</option>{BRAKE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  {rearBrake==="Disc"&&<div style={{...col,flex:1}}><FL t="Rear disc diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 190" step="1" min="0" value={rearDiscD} onChange={ev=>setRearDiscD(ev.target.value)} /></div>}
                 {rearBrake==="Disc"&&<div style={{...col,flex:1}}><FL t="Rear disc width (mm)" /><input style={inp} type="number" placeholder="e.g. 4.5" step="0.1" min="0" value={rearDiscW} onChange={ev=>setRearDiscW(ev.target.value)} /></div>}
                </div>
                {editBrakes&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditBrakes(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Tyres */}
          {showTyres(type,customSections)&&(()=>{
            const hasData = !!(tyreFront||tyreRear||rimFront||rimRear);
            const tyresSum=[
              [tyreFront?"Front: "+tyreFront:null,rimFront?rimFront+'" rim':null].filter(Boolean).join(" · "),
              [tyreRear?"Rear: "+tyreRear:null,rimRear?rimRear+'" rim':null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecTyres(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Tyres</span>
                  {hasData&&!secTyres&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secTyres?"▲":"▼"}</span>
              </div>
              {secTyres&&<div style={{paddingTop:12}}>
                {hasData&&!editTyres&&<SummaryCard onEdit={()=>setEditTyres(true)} lines={tyresSum} />}
                {(editTyres||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Front tyre size" /><input style={inp} placeholder="e.g. 120/70-17" value={tyreFront} onChange={ev=>setTyreFront(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Rear tyre size" /><input style={inp} placeholder="e.g. 140/70-17" value={tyreRear} onChange={ev=>setTyreRear(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Front rim diameter (in)" /><input style={inp} type="number" placeholder="e.g. 17" step="0.5" min="0" value={rimFront} onChange={ev=>setRimFront(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Rear rim diameter (in)" /><input style={inp} type="number" placeholder="e.g. 17" step="0.5" min="0" value={rimRear} onChange={ev=>setRimRear(ev.target.value)} /></div>
                </div>
                {editTyres&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditTyres(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Electrics */}
          {showElectrics(type,customSections)&&(()=>{
            const hasData = !!(battVoltage||batteryCCA||batteryAh||starterMotorType||fuseBoxNotes);
            const electricsSum=[
              [battVoltage?"Battery: "+battVoltage:null,batteryCCA?batteryCCA+"CCA":null,batteryAh?batteryAh+"Ah":null].filter(Boolean).join(" · "),
              [starterMotorType?"Starter: "+starterMotorType:null].filter(Boolean).join(""),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecElectrics(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Electrics</span>
                  {hasData&&!secElectrics&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secElectrics?"▲":"▼"}</span>
              </div>
              {secElectrics&&<div style={{paddingTop:12}}>
                {hasData&&!editElectrics&&<SummaryCard onEdit={()=>setEditElectrics(true)} lines={electricsSum} />}
                {(editElectrics||!hasData)&&<>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Battery</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Voltage" /><select style={sel} value={battVoltage} onChange={ev=>setBattVoltage(ev.target.value)}><option value="">— not set —</option>{["6V","12V","24V","48V"].map(v=><option key={v}>{v}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="CCA" /><input style={inp} type="number" placeholder="e.g. 550" step="1" min="0" value={batteryCCA} onChange={ev=>setBatteryCCA(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Capacity (Ah)" /><input style={inp} type="number" placeholder="e.g. 45" step="0.5" min="0" value={batteryAh} onChange={ev=>setBatteryAh(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Dimensions (mm)" /><input style={inp} placeholder="e.g. 230×175×225" value={batteryDimensions} onChange={ev=>setBatteryDimensions(ev.target.value)} /></div>
                </div>
                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Starter Motor</div>
                <div style={col}><FL t="Type" /><select style={sel} value={starterMotorType} onChange={ev=>setStarterMotorType(ev.target.value)}><option value="">— not set —</option>{["Gear reduction","Direct drive","Pre-engaged","Permanent magnet"].map(s=><option key={s}>{s}</option>)}</select></div>
                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Fuse Box</div>
                <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Main fuse 30A under seat, blade fuses in engine bay" value={fuseBoxNotes} onChange={ev=>setFuseBoxNotes(ev.target.value)} /></div>
                {editElectrics&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditElectrics(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Cooling System */}
          {(!isCustom(type)||showForCustom("Engine",customSections))&&strokeType&&strokeType!=="Electric"&&(()=>{
            const hasData=!!(coolingType||coolantType||coolantCapacity||thermostatTemp);
            const coolingSum=[
              [coolingType,coolantType].filter(Boolean).join(" · "),
              [coolantCapacity?coolantCapacity+"L capacity":null,thermostatTemp?thermostatTemp+"°C thermostat":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecCooling(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Cooling System</span>
                  {hasData&&!secCooling&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secCooling?"▲":"▼"}</span>
              </div>
              {secCooling&&<div style={{paddingTop:12}}>
                {hasData&&!editCooling&&<SummaryCard onEdit={()=>setEditCooling(true)} lines={coolingSum} />}
                {(editCooling||!hasData)&&<>
                <div style={col}><FL t="Cooling type" /><select style={sel} value={coolingType} onChange={ev=>setCoolingType(ev.target.value)}><option value="">— not set —</option>{COOLING_TYPES.map(c=><option key={c}>{c}</option>)}</select></div>
                {coolingType==="Liquid cooled"&&<>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Coolant type" /><input style={inp} placeholder="e.g. OAT Green, HOAT Red" value={coolantType} onChange={ev=>setCoolantType(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Coolant capacity (L)" /><input style={inp} type="number" placeholder="e.g. 4.5" step="0.1" min="0" value={coolantCapacity} onChange={ev=>setCoolantCapacity(ev.target.value)} /></div>
                  </div>
                  <div style={{...col,maxWidth:180}}><FL t="Thermostat opening temp (°C)" /><input style={inp} type="number" placeholder="e.g. 82" step="1" min="0" value={thermostatTemp} onChange={ev=>setThermostatTemp(ev.target.value)} /></div>
                </>}
                <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Mix 50/50 distilled water, flush every 2 years" value={coolingNotes} onChange={ev=>setCoolingNotes(ev.target.value)} /></div>
                {editCooling&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditCooling(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Turbo / Supercharger */}
          {(!isCustom(type)||showForCustom("Engine",customSections))&&strokeType&&strokeType!=="Electric"&&(()=>{
            const hasData=!!(turboFitted||turboType||turboBrand||turboBoost);
            const turboSum=[
              [turboFitted==="Yes"?(turboType||"Forced induction fitted"):turboFitted==="No"?"Naturally aspirated":null].filter(Boolean).join(""),
              [turboBrand,turboBoost?turboBoost+" PSI boost":null,intercooler?"Intercooler: "+intercooler:null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecTurbo(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Turbo / Supercharger</span>
                  {hasData&&!secTurbo&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secTurbo?"▲":"▼"}</span>
              </div>
              {secTurbo&&<div style={{paddingTop:12}}>
                {hasData&&!editTurbo&&<SummaryCard onEdit={()=>setEditTurbo(true)} lines={turboSum} />}
                {(editTurbo||!hasData)&&<>
                <div style={col}>
                  <FL t="Forced induction fitted?" />
                  <div style={{display:"flex",gap:0,borderRadius:2,overflow:"hidden",border:"1px solid #252525"}}>
                    {["Yes","No"].map(s=>(
                      <button key={s} onClick={()=>setTurboFitted(s)} style={{flex:1,padding:"8px 0",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer",border:"none",background:turboFitted===s?ACC:"#111",color:turboFitted===s?"#fff":"#3a3a3a"}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {turboFitted==="Yes"&&<>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Type" /><select style={sel} value={turboType} onChange={ev=>setTurboType(ev.target.value)}><option value="">— not set —</option>{TURBO_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                    <div style={{...col,flex:1}}><FL t="Brand / model" /><input style={inp} placeholder="e.g. Garrett GTX2867R" value={turboBrand} onChange={ev=>setTurboBrand(ev.target.value)} /></div>
                  </div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Boost pressure (PSI)" /><input style={inp} type="number" placeholder="e.g. 15" step="0.5" min="0" value={turboBoost} onChange={ev=>setTurboBoost(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Intercooler fitted" /><select style={sel} value={intercooler} onChange={ev=>setIntercooler(ev.target.value)}><option value="">— not set —</option><option>Yes</option><option>No</option></select></div>
                  </div>
                  <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Front mount intercooler, external wastegate" value={turboNotes} onChange={ev=>setTurboNotes(ev.target.value)} /></div>
                </>}
                {editTurbo&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditTurbo(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Charging System — 4-stroke, Diesel, LPG only */}
          {(strokeType==="4-stroke"||strokeType==="Diesel"||strokeType==="LPG")&&(()=>{
            const hasData=!!(chargingType||chargeVoltage||chargeAmps||rectRegFitted);
            const chargingSum=[
              [chargingType,chargeVoltage,chargeAmps?chargeAmps+"A":null].filter(Boolean).join(" · "),
              [rectRegFitted?"Rect/Reg: "+rectRegFitted:null].filter(Boolean).join(""),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecCharging(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Charging System</span>
                  {hasData&&!secCharging&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secCharging?"▲":"▼"}</span>
              </div>
              {secCharging&&<div style={{paddingTop:12}}>
                {hasData&&!editCharging&&<SummaryCard onEdit={()=>setEditCharging(true)} lines={chargingSum} />}
                {(editCharging||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Charging type" /><select style={sel} value={chargingType} onChange={ev=>setChargingType(ev.target.value)}><option value="">— not set —</option>{CHARGING_TYPES.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Output voltage" /><select style={sel} value={chargeVoltage} onChange={ev=>setChargeVoltage(ev.target.value)}><option value="">— not set —</option>{CHARGE_VOLTAGES.map(v=><option key={v}>{v}</option>)}</select></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Output (amps)" /><input style={inp} type="number" placeholder="e.g. 40" step="0.5" min="0" value={chargeAmps} onChange={ev=>setChargeAmps(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Rectifier / Regulator fitted" /><select style={sel} value={rectRegFitted} onChange={ev=>setRectRegFitted(ev.target.value)}><option value="">— not set —</option>{RECT_REG.map(r=><option key={r}>{r}</option>)}</select></div>
                </div>
                <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Internal regulator, replace at 80k km" value={chargingNotes} onChange={ev=>setChargingNotes(ev.target.value)} /></div>
                {editCharging&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditCharging(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Cylinder Wear Limits */}
          {(!isCustom(type)||showForCustom("Engine",customSections))&&strokeType&&strokeType!=="Electric"&&(()=>{
            const hasData=!!(cylMaxWear||cylTaperLimit||cylOutOfRound||honingAngle||nikasil);
            const cylSum=[
              [cylMaxWear?"Max wear: "+cylMaxWear+"mm":null,cylTaperLimit?"Taper limit: "+cylTaperLimit+"mm":null,cylOutOfRound?"Out-of-round: "+cylOutOfRound+"mm":null].filter(Boolean).join(" · "),
              [honingAngle?"Honing: "+honingAngle:null,nikasil?"Nikasil: "+nikasil:null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecCylinder(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Cylinder Wear Limits</span>
                  {hasData&&!secCylinder&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secCylinder?"▲":"▼"}</span>
              </div>
              {secCylinder&&<div style={{paddingTop:12}}>
                {hasData&&!editCylinder&&<SummaryCard onEdit={()=>setEditCylinder(true)} lines={cylSum} />}
                {(editCylinder||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Max bore wear limit (mm)" /><input style={inp} type="number" placeholder="e.g. 0.05" step="0.001" min="0" value={cylMaxWear} onChange={ev=>setCylMaxWear(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Taper limit (mm)" /><input style={inp} type="number" placeholder="e.g. 0.05" step="0.001" min="0" value={cylTaperLimit} onChange={ev=>setCylTaperLimit(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Out-of-round limit (mm)" /><input style={inp} type="number" placeholder="e.g. 0.05" step="0.001" min="0" value={cylOutOfRound} onChange={ev=>setCylOutOfRound(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Honing angle" /><input style={inp} placeholder="e.g. 45°" value={honingAngle} onChange={ev=>setHoningAngle(ev.target.value)} /></div>
                </div>
                <div style={col}><FL t="Nikasil / plated bore" /><select style={sel} value={nikasil} onChange={ev=>setNikasil(ev.target.value)}><option value="">— not set —</option><option>Yes — plated bore (no rebore)</option><option>No — cast iron / steel liner</option></select></div>
                {editCylinder&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditCylinder(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Main Bearings */}
          {(!isCustom(type)||showForCustom("Engine",customSections))&&strokeType&&strokeType!=="Electric"&&(()=>{
            const hasData=!!(mainBearingType||mainBearingLeft||mainBearingRight||mainBearingClear);
            const mbSum=[
              [mainBearingType,mainBearingClear?mainBearingClear+"mm clearance":null,mainBearingPreload?mainBearingPreload+"Nm preload":null].filter(Boolean).join(" · "),
              [mainBearingLeft?"L: "+mainBearingLeft:null,mainBearingRight?"R: "+mainBearingRight:null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecMainBearings(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Main Bearings</span>
                  {hasData&&!secMainBearings&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secMainBearings?"▲":"▼"}</span>
              </div>
              {secMainBearings&&<div style={{paddingTop:12}}>
                {hasData&&!editMainBearings&&<SummaryCard onEdit={()=>setEditMainBearings(true)} lines={mbSum} />}
                {(editMainBearings||!hasData)&&<>
                <div style={col}><FL t="Bearing type" /><select style={sel} value={mainBearingType} onChange={ev=>setMainBearingType(ev.target.value)}><option value="">— not set —</option><option>Ball bearing</option><option>Roller bearing</option><option>Plain shell</option><option>Taper roller</option></select></div>
                <div style={{fontSize:9,color:MUT,marginBottom:8,lineHeight:1.5}}>Part no. or dimensions ID×OD×Width mm</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Left bearing" /><input style={inp} placeholder="e.g. 6203 / 17×40×12" value={mainBearingLeft} onChange={ev=>setMainBearingLeft(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Right bearing" /><input style={inp} placeholder="e.g. 6203 / 17×40×12" value={mainBearingRight} onChange={ev=>setMainBearingRight(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Clearance (mm)" /><input style={inp} type="number" placeholder="e.g. 0.025" step="0.001" min="0" value={mainBearingClear} onChange={ev=>setMainBearingClear(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Preload (Nm)" /><input style={inp} type="number" placeholder="e.g. 15" step="0.5" min="0" value={mainBearingPreload} onChange={ev=>setMainBearingPreload(ev.target.value)} /></div>
                </div>
                {editMainBearings&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditMainBearings(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Crankshaft */}
          {(!isCustom(type)||showForCustom("Engine",customSections))&&strokeType&&strokeType!=="Electric"&&(()=>{
            const hasData=!!(crankPinDiameter||mainJournalDiameter||crankStroke||crankSealLeft);
            const crankSum=[
              [crankStroke?crankStroke+"mm stroke":null,crankPinDiameter?crankPinDiameter+"mm crank pin":null,mainJournalDiameter?mainJournalDiameter+"mm main journal":null].filter(Boolean).join(" · "),
              [crankEndFloat?crankEndFloat+"mm end float":null,crankRunout?crankRunout+"mm runout limit":null].filter(Boolean).join(" · "),
              [crankSealLeft?"L seal: "+crankSealLeft:null,crankSealRight?"R seal: "+crankSealRight:null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecCrank(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Crankshaft</span>
                  {hasData&&!secCrank&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secCrank?"▲":"▼"}</span>
              </div>
              {secCrank&&<div style={{paddingTop:12}}>
                {hasData&&!editCrank&&<SummaryCard onEdit={()=>setEditCrank(true)} lines={crankSum} />}
                {(editCrank||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Stroke (mm)" /><input style={inp} type="number" placeholder="e.g. 34.00" step="0.01" min="0" value={crankStroke} onChange={ev=>setCrankStroke(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Main journal diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 28.00" step="0.01" min="0" value={mainJournalDiameter} onChange={ev=>setMainJournalDiameter(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Crank pin diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 22.00" step="0.01" min="0" value={crankPinDiameter} onChange={ev=>setCrankPinDiameter(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Crank pin length (mm)" /><input style={inp} type="number" placeholder="e.g. 18.00" step="0.01" min="0" value={crankPinLength} onChange={ev=>setCrankPinLength(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="End float (mm)" /><input style={inp} type="number" placeholder="e.g. 0.05" step="0.01" min="0" value={crankEndFloat} onChange={ev=>setCrankEndFloat(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Runout limit (mm)" /><input style={inp} type="number" placeholder="e.g. 0.03" step="0.01" min="0" value={crankRunout} onChange={ev=>setCrankRunout(ev.target.value)} /></div>
                </div>
                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Crank Seals</div>
                <div style={{fontSize:9,color:MUT,marginBottom:8}}>Format: ID×OD×Width mm (e.g. 20×35×7)</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Left seal" /><input style={inp} placeholder="e.g. 20×35×7" value={crankSealLeft} onChange={ev=>setCrankSealLeft(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Right seal" /><input style={inp} placeholder="e.g. 20×35×7" value={crankSealRight} onChange={ev=>setCrankSealRight(ev.target.value)} /></div>
                </div>
                {editCrank&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditCrank(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Conrod */}
          {(!isCustom(type)||showForCustom("Engine",customSections))&&strokeType&&strokeType!=="Electric"&&(()=>{
            const hasData=!!(conrodLength||conrodSmallEnd||conrodBigEnd||conrodBearingType);
            const conrodSum=[
              [conrodLength?conrodLength+"mm C-C length":null,conrodBearingType].filter(Boolean).join(" · "),
              [conrodSmallEnd?conrodSmallEnd+"mm small end":null,conrodSmallClear?conrodSmallClear+"mm clearance":null].filter(Boolean).join(" · "),
              [conrodBigEnd?conrodBigEnd+"mm big end":null,conrodBigClear?conrodBigClear+"mm clearance":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecConrod(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Connecting Rod</span>
                  {hasData&&!secConrod&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secConrod?"▲":"▼"}</span>
              </div>
              {secConrod&&<div style={{paddingTop:12}}>
                {hasData&&!editConrod&&<SummaryCard onEdit={()=>setEditConrod(true)} lines={conrodSum} />}
                {(editConrod||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Length C-C (mm)" /><input style={inp} type="number" placeholder="e.g. 110.00" step="0.01" min="0" value={conrodLength} onChange={ev=>setConrodLength(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Bearing type" /><select style={sel} value={conrodBearingType} onChange={ev=>setConrodBearingType(ev.target.value)}><option value="">— not set —</option><option>Needle roller</option><option>Shell / plain</option><option>Ball bearing</option></select></div>
                </div>
                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Small End</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 10.00" step="0.01" min="0" value={conrodSmallEnd} onChange={ev=>setConrodSmallEnd(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Clearance (mm)" /><input style={inp} type="number" placeholder="e.g. 0.012" step="0.001" min="0" value={conrodSmallClear} onChange={ev=>setConrodSmallClear(ev.target.value)} /></div>
                </div>
                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Big End</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 28.00" step="0.01" min="0" value={conrodBigEnd} onChange={ev=>setConrodBigEnd(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Clearance (mm)" /><input style={inp} type="number" placeholder="e.g. 0.025" step="0.001" min="0" value={conrodBigClear} onChange={ev=>setConrodBigClear(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Side clearance (mm)" /><input style={inp} type="number" placeholder="e.g. 0.15" step="0.01" min="0" value={conrodSideClear} onChange={ev=>setConrodSideClear(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Bearing part no." /><input style={inp} placeholder="e.g. STD / 0.25 OS" value={conrodBearingPartNo} onChange={ev=>setConrodBearingPartNo(ev.target.value)} /></div>
                </div>
                {editConrod&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditConrod(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Piston & Bore */}
          {(!isCustom(type)||showForCustom("Engine",customSections))&&strokeType&&strokeType!=="Electric"&&(()=>{
            const hasData=!!(pistonDiameter||pistonClearance||ringCount||gudgeonDiameter);
            const pistonSum=[
              [pistonDiameter?pistonDiameter+"mm piston":null,pistonClearance?pistonClearance+"mm clearance":null,ringCount?ringCount+" rings":null].filter(Boolean).join(" · "),
              [ringGapTop?"Top gap: "+ringGapTop+"mm":null,ringGapSecond?"2nd: "+ringGapSecond+"mm":null,ringGapOil?"Oil: "+ringGapOil+"mm":null].filter(Boolean).join(" · "),
              [gudgeonDiameter?gudgeonDiameter+"mm gudgeon":null,gudgeonFit].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecPiston(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Piston & Bore</span>
                  {hasData&&!secPiston&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secPiston?"▲":"▼"}</span>
              </div>
              {secPiston&&<div style={{paddingTop:12}}>
                {hasData&&!editPiston&&<SummaryCard onEdit={()=>setEditPiston(true)} lines={pistonSum} />}
                {(editPiston||!hasData)&&<>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Piston</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Piston diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 38.00" step="0.01" min="0" value={pistonDiameter} onChange={ev=>setPistonDiameter(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Piston clearance (mm)" /><input style={inp} type="number" placeholder="e.g. 0.045" step="0.001" min="0" value={pistonClearance} onChange={ev=>setPistonClearance(ev.target.value)} /></div>
                </div>
                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Piston Rings</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Ring count" /><select style={sel} value={ringCount} onChange={ev=>setRingCount(ev.target.value)}><option value="">— not set —</option>{["1","2","3","4"].map(n=><option key={n}>{n}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Ring width (mm)" /><input style={inp} type="number" placeholder="e.g. 1.5" step="0.01" min="0" value={ringWidth} onChange={ev=>setRingWidth(ev.target.value)} /></div>
                </div>
                <div style={{...col,maxWidth:180}}><FL t="Ring thickness (mm)" /><input style={inp} type="number" placeholder="e.g. 2.0" step="0.01" min="0" value={ringThickness} onChange={ev=>setRingThickness(ev.target.value)} /></div>
                <div style={{fontSize:9,color:MUT,marginBottom:6,marginTop:2}}>End gaps (mm)</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Top ring" /><input style={inp} type="number" placeholder="e.g. 0.20" step="0.01" min="0" value={ringGapTop} onChange={ev=>setRingGapTop(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="2nd ring" /><input style={inp} type="number" placeholder="e.g. 0.35" step="0.01" min="0" value={ringGapSecond} onChange={ev=>setRingGapSecond(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Oil ring" /><input style={inp} type="number" placeholder="e.g. 0.50" step="0.01" min="0" value={ringGapOil} onChange={ev=>setRingGapOil(ev.target.value)} /></div>
                </div>
                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Gudgeon Pin</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 10.00" step="0.01" min="0" value={gudgeonDiameter} onChange={ev=>setGudgeonDiameter(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Length (mm)" /><input style={inp} type="number" placeholder="e.g. 34.00" step="0.01" min="0" value={gudgeonLength} onChange={ev=>setGudgeonLength(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Fit type" /><select style={sel} value={gudgeonFit} onChange={ev=>setGudgeonFit(ev.target.value)}><option value="">— not set —</option><option>Press fit</option><option>Floating</option></select></div>
                  <div style={{...col,flex:1}}><FL t="Circlip diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 10.00" step="0.01" min="0" value={gudgeonCirclip} onChange={ev=>setGudgeonCirclip(ev.target.value)} /></div>
                </div>
                {editPiston&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditPiston(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Service Intervals */}
          {(!isCustom(type)||showForCustom("Engine",customSections))&&(()=>{
            const hasData=!!(oilChangeInterval||filterInterval||majorServiceInterval||lastServiceOdo);
            const svcIntSum=[
              [oilChangeInterval?"Oil change: every "+oilChangeInterval+" "+oilChangeUnit:null].filter(Boolean).join(""),
              [filterInterval?"Filter: every "+filterInterval+" "+filterIntervalUnit:null].filter(Boolean).join(""),
              [majorServiceInterval?"Major service: every "+majorServiceInterval+" "+majorServiceUnit:null].filter(Boolean).join(""),
              [lastServiceOdo?"Last service at: "+lastServiceOdo:null].filter(Boolean).join(""),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecServiceIntervals(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Service Intervals</span>
                  {hasData&&!secServiceIntervals&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secServiceIntervals?"▲":"▼"}</span>
              </div>
              {secServiceIntervals&&<div style={{paddingTop:12}}>
                {hasData&&!editServiceIntervals&&<SummaryCard onEdit={()=>setEditServiceIntervals(true)} lines={svcIntSum} />}
                {(editServiceIntervals||!hasData)&&<>
                {[
                  {label:"Oil change interval",val:oilChangeInterval,setVal:setOilChangeInterval,unit:oilChangeUnit,setUnit:setOilChangeUnit},
                  {label:"Filter change interval",val:filterInterval,setVal:setFilterInterval,unit:filterIntervalUnit,setUnit:setFilterIntervalUnit},
                  {label:"Major service interval",val:majorServiceInterval,setVal:setMajorServiceInterval,unit:majorServiceUnit,setUnit:setMajorServiceUnit},
                ].map(({label,val,setVal,unit,setUnit})=>(
                  <div key={label} style={row}>
                    <div style={{...col,flex:2}}><FL t={label} /><input style={inp} type="number" placeholder="e.g. 250" step="1" min="0" value={val} onChange={ev=>setVal(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}>
                      <FL t="Unit" />
                      <select style={sel} value={unit} onChange={ev=>setUnit(ev.target.value)}>
                        <option value="hours">Hours</option>
                        <option value="km">km</option>
                        <option value="miles">Miles</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>
                ))}
                <div style={col}><FL t="Last service odometer / hours" /><input style={inp} placeholder="e.g. 1250 hrs / 45,000 km" value={lastServiceOdo} onChange={ev=>setLastServiceOdo(ev.target.value)} /></div>
                {editServiceIntervals&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditServiceIntervals(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Fluids */}
          {(!isCustom(type)||showForCustom("Engine",customSections))&&strokeType&&strokeType!=="Electric"&&(()=>{
            const hasData=!!(engineOilGrade||engineOilCapacity||brakeFluidType||diffOilType||hydraulicFluidType);
            const fluidsSum=[
              [engineOilGrade,engineOilCapacity?engineOilCapacity+"L engine oil":null].filter(Boolean).join(" · "),
              [brakeFluidType?"Brake: "+brakeFluidType:null,diffOilType?diffOilType+(diffOilCapacity?" "+diffOilCapacity+"L diff":"")+" diff":null].filter(Boolean).join(" · "),
              [hydraulicFluidType?"Hyd: "+hydraulicFluidType:null,transferCaseOil?"T/case: "+transferCaseOil:null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecFluids(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Fluids</span>
                  {hasData&&!secFluids&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secFluids?"▲":"▼"}</span>
              </div>
              {secFluids&&<div style={{paddingTop:12}}>
                {hasData&&!editFluids&&<SummaryCard onEdit={()=>setEditFluids(true)} lines={fluidsSum} />}
                {(editFluids||!hasData)&&<>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Engine Oil</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Grade" /><input style={inp} placeholder="e.g. 10W-40, 5W-30" value={engineOilGrade} onChange={ev=>setEngineOilGrade(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Capacity (L)" /><input style={inp} type="number" placeholder="e.g. 1.2" step="0.1" min="0" value={engineOilCapacity} onChange={ev=>setEngineOilCapacity(ev.target.value)} /></div>
                </div>
                {showBrakes(type,customSections)&&<>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Brake Fluid</div>
                  <div style={col}><FL t="Type" /><select style={sel} value={brakeFluidType} onChange={ev=>setBrakeFluidType(ev.target.value)}><option value="">— not set —</option>{["DOT 3","DOT 4","DOT 5","DOT 5.1","Mineral"].map(b=><option key={b}>{b}</option>)}</select></div>
                </>}
                {showDrivetrain(type,customSections)&&<>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Differential Oil</div>
                  <div style={row}>
                    <div style={{...col,flex:1}}><FL t="Type / grade" /><input style={inp} placeholder="e.g. 75W-90 GL-5" value={diffOilType} onChange={ev=>setDiffOilType(ev.target.value)} /></div>
                    <div style={{...col,flex:1}}><FL t="Capacity (L)" /><input style={inp} type="number" placeholder="e.g. 1.5" step="0.1" min="0" value={diffOilCapacity} onChange={ev=>setDiffOilCapacity(ev.target.value)} /></div>
                  </div>
                  {isVehicle(type)&&<>
                    <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                    <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Transfer Case</div>
                    <div style={col}><FL t="Oil type / grade" /><input style={inp} placeholder="e.g. ATF Dexron III" value={transferCaseOil} onChange={ev=>setTransferCaseOil(ev.target.value)} /></div>
                  </>}
                </>}
                {isTracked(type)&&<>
                  <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                  <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Hydraulic Fluid</div>
                  <div style={col}><FL t="Fluid type" /><input style={inp} placeholder="e.g. ISO VG 46, Mobil DTE 25" value={hydraulicFluidType} onChange={ev=>setHydraulicFluidType(ev.target.value)} /></div>
                </>}
                {editFluids&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditFluids(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Dimensions & Weight */}
          {(!isCustom(type)||showForCustom("Engine",customSections))&&(()=>{
            const hasData=!!(dryWeight||grossWeight||wheelbase||overallLength||overallWidth||overallHeight);
            const dimSum=[
              [dryWeight?dryWeight+"kg dry":null,grossWeight?grossWeight+"kg gross":null].filter(Boolean).join(" · "),
              [wheelbase?wheelbase+"mm wheelbase":null,overallLength?overallLength+"mm long":null].filter(Boolean).join(" · "),
              [overallWidth?overallWidth+"mm wide":null,overallHeight?overallHeight+"mm tall":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecDimensions(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Dimensions & Weight</span>
                  {hasData&&!secDimensions&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secDimensions?"▲":"▼"}</span>
              </div>
              {secDimensions&&<div style={{paddingTop:12}}>
                {hasData&&!editDimensions&&<SummaryCard onEdit={()=>setEditDimensions(true)} lines={dimSum} />}
                {(editDimensions||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Dry weight (kg)" /><input style={inp} type="number" placeholder="e.g. 185" step="0.1" min="0" value={dryWeight} onChange={ev=>setDryWeight(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Gross weight (kg)" /><input style={inp} type="number" placeholder="e.g. 210" step="0.1" min="0" value={grossWeight} onChange={ev=>setGrossWeight(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Wheelbase (mm)" /><input style={inp} type="number" placeholder="e.g. 1410" step="1" min="0" value={wheelbase} onChange={ev=>setWheelbase(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Overall length (mm)" /><input style={inp} type="number" placeholder="e.g. 2100" step="1" min="0" value={overallLength} onChange={ev=>setOverallLength(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Overall width (mm)" /><input style={inp} type="number" placeholder="e.g. 820" step="1" min="0" value={overallWidth} onChange={ev=>setOverallWidth(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Overall height (mm)" /><input style={inp} type="number" placeholder="e.g. 1150" step="1" min="0" value={overallHeight} onChange={ev=>setOverallHeight(ev.target.value)} /></div>
                </div>
                {editDimensions&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditDimensions(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Belt Specs — 4-stroke, Diesel, LPG only */}
          {(strokeType==="4-stroke"||strokeType==="Diesel"||strokeType==="LPG")&&(()=>{
            const hasData=!!(beltType||beltPartNo||beltWidth||beltLength||beltCount);
            const beltSum=[
              [beltType,beltCount?beltCount+" belt"+(beltCount!=="1"?"s":""):null].filter(Boolean).join(" · "),
              [beltPartNo?beltPartNo:null,beltWidth?beltWidth+"mm wide":null,beltLength?beltLength+"mm long":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecBelt(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Belt Specs</span>
                  {hasData&&!secBelt&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secBelt?"▲":"▼"}</span>
              </div>
              {secBelt&&<div style={{paddingTop:12}}>
                {hasData&&!editBelt&&<SummaryCard onEdit={()=>setEditBelt(true)} lines={beltSum} />}
                {(editBelt||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Belt type" /><select style={sel} value={beltType} onChange={ev=>setBeltType(ev.target.value)}><option value="">— not set —</option>{BELT_TYPES.map(b=><option key={b}>{b}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Number of belts" /><input style={inp} type="number" placeholder="e.g. 2" step="1" min="1" value={beltCount} onChange={ev=>setBeltCount(ev.target.value)} /></div>
                </div>
                <div style={col}><FL t="Part number / size code" /><input style={inp} placeholder="e.g. A56 / 13×1422" value={beltPartNo} onChange={ev=>setBeltPartNo(ev.target.value)} /></div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Width (mm)" /><input style={inp} type="number" placeholder="e.g. 13" step="0.5" min="0" value={beltWidth} onChange={ev=>setBeltWidth(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Length (mm)" /><input style={inp} type="number" placeholder="e.g. 1422" step="1" min="0" value={beltLength} onChange={ev=>setBeltLength(ev.target.value)} /></div>
                </div>
                <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Fan belt, tensioner on idler pulley" value={beltNotes} onChange={ev=>setBeltNotes(ev.target.value)} /></div>
                {editBelt&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditBelt(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Blade / Deck */}
          {showBlade(type,customSections)&&(()=>{
            const hasData = !!(deckSize||bladeLength||bladeType||bladeCount);
            const bladeSum=[
              [deckSize?deckSize+'" deck':null,bladeCount?bladeCount+" blade(s)":null,bladeType,bladeLength?bladeLength+"mm blade":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecBlade(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Blade / Deck</span>
                  {hasData&&!secBlade&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secBlade?"▲":"▼"}</span>
              </div>
              {secBlade&&<div style={{paddingTop:12}}>
                {hasData&&!editBlade&&<SummaryCard onEdit={()=>setEditBlade(true)} lines={bladeSum} />}
                {(editBlade||!hasData)&&<>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Deck size (inches)" /><input style={inp} type="number" placeholder="e.g. 18" step="0.5" min="0" value={deckSize} onChange={ev=>setDeckSize(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Blade count" /><select style={sel} value={bladeCount} onChange={ev=>setBladeCount(ev.target.value)}><option value="">— not set —</option><option>1</option><option>2</option><option>3</option></select></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Blade length (mm)" /><input style={inp} type="number" placeholder="e.g. 430" step="1" min="0" value={bladeLength} onChange={ev=>setBladeLength(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Blade type" /><select style={sel} value={bladeType} onChange={ev=>setBladeType(ev.target.value)}><option value="">— not set —</option>{BLADE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                </div>
                {editBlade&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditBlade(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Tracked Machine */}
          {isTracked(type)&&(()=>{
            const hasData=!!(trackedBrand||trackedSubtype||operatingWeight||trackType||hydPumpCount||hydRams.length||attachments.length);
            const trackedSum=[
              [trackedBrand==="Other"?trackedBrandOther:trackedBrand, trackedSubtype==="Other"?trackedSubtypeOther:trackedSubtype, operatingWeight==="Other"?operatingWeightOther:operatingWeight].filter(Boolean).join(" · "),
              [trackType?trackType+" tracks":null, trackWidth?trackWidth+"mm wide":null, undercarriageHours?undercarriageHours+"h undercarriage":null].filter(Boolean).join(" · "),
              [hydPumpCount?hydPumpCount+" pump"+(hydPumpCount!=="1"?"s":""):null, hydPumpType, hydSystemPressure?hydSystemPressure+"bar":null].filter(Boolean).join(" · "),
              [hydRams.length?hydRams.length+" ram"+(hydRams.length!==1?"s":"")+" logged":null].filter(Boolean).join(""),
              [attachments.length?attachments.length+" attachment"+(attachments.length!==1?"s":"")+" logged":null].filter(Boolean).join(""),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecTracked(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Tracked Machine</span>
                  {hasData&&!secTracked&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secTracked?"▲":"▼"}</span>
              </div>
              {secTracked&&<div style={{paddingTop:12}}>
                {hasData&&!isNew&&<SummaryCard onEdit={()=>setSecTracked(true)} lines={trackedSum} />}

                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Undercarriage</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Track type" /><select style={sel} value={trackType} onChange={ev=>setTrackType(ev.target.value)}><option value="">— not set —</option>{TRACK_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Track width (mm)" /><input style={inp} type="number" placeholder="e.g. 400" step="1" min="0" value={trackWidth} onChange={ev=>setTrackWidth(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Track pitch (mm)" /><input style={inp} type="number" placeholder="e.g. 154" step="1" min="0" value={trackPitch} onChange={ev=>setTrackPitch(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Link count" /><input style={inp} type="number" placeholder="e.g. 47" step="1" min="0" value={trackLinks} onChange={ev=>setTrackLinks(ev.target.value)} /></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Sprocket teeth" /><input style={inp} type="number" placeholder="e.g. 25" step="1" min="0" value={sprocketTeeth} onChange={ev=>setSprocketTeeth(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Undercarriage hours" /><input style={inp} type="number" placeholder="e.g. 2400" step="1" min="0" value={undercarriageHours} onChange={ev=>setUndercarriageHours(ev.target.value)} /></div>
                </div>

                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Hydraulic System</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Pump count" /><select style={sel} value={hydPumpCount} onChange={ev=>setHydPumpCount(ev.target.value)}><option value="">— not set —</option>{HYD_PUMP_COUNTS.map(n=><option key={n}>{n}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Pump type" /><select style={sel} value={hydPumpType} onChange={ev=>setHydPumpType(ev.target.value)}><option value="">— not set —</option>{HYD_PUMP_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="System pressure (bar)" /><input style={inp} type="number" placeholder="e.g. 340" step="1" min="0" value={hydSystemPressure} onChange={ev=>setHydSystemPressure(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Oil capacity (L)" /><input style={inp} type="number" placeholder="e.g. 120" step="0.5" min="0" value={hydOilCapacity} onChange={ev=>setHydOilCapacity(ev.target.value)} /></div>
                </div>
                <div style={col}><FL t="Relief valve setting (bar)" /><input style={inp} type="number" placeholder="e.g. 350" step="1" min="0" value={hydReliefValve} onChange={ev=>setHydReliefValve(ev.target.value)} /></div>

                {/* Hydraulic Rams */}
                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Hydraulic Rams</div>
                <div style={{fontSize:9,color:MUT,marginBottom:10,lineHeight:1.5}}>Log each ram individually — bore, rod, stroke, seal kit.</div>
                {hydRams.map((r,idx)=>(
                  hydRamEditIdx===idx
                    ? <HydRamForm key={r.id||idx} r={r} onSave={sv=>{setHydRams(prev=>prev.map((x,i)=>i===idx?{...sv,id:x.id||crypto.randomUUID()}:x));setHydRamEditIdx(null);}} onCancel={()=>setHydRamEditIdx(null)} />
                    : <HydRamCard key={r.id||idx} r={r} onEdit={()=>{setHydRamEditIdx(idx);setHydRamAdding(false);}} onRemove={()=>{if(confirm("Remove this ram?"))setHydRams(prev=>prev.filter((_,i)=>i!==idx));}} />
                ))}
                {hydRamAdding&&<HydRamForm r={{}} onSave={sv=>{setHydRams(prev=>[...prev,{...sv,id:crypto.randomUUID()}]);setHydRamAdding(false);}} onCancel={()=>setHydRamAdding(false)} />}
                {!hydRamAdding&&hydRamEditIdx===null&&<button onClick={()=>setHydRamAdding(true)} style={{...btnG,width:"100%",marginTop:4}}>+ Add Ram</button>}

                {/* Attachments */}
                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Attachments</div>
                <div style={{fontSize:9,color:MUT,marginBottom:10,lineHeight:1.5}}>Log each attachment — bucket, blade, auger etc.</div>
                {attachments.map((a,idx)=>(
                  attachEditIdx===idx
                    ? <AttachForm key={a.id||idx} a={a} onSave={sv=>{setAttachments(prev=>prev.map((x,i)=>i===idx?{...sv,id:x.id||crypto.randomUUID()}:x));setAttachEditIdx(null);}} onCancel={()=>setAttachEditIdx(null)} />
                    : <AttachCard key={a.id||idx} a={a} onEdit={()=>{setAttachEditIdx(idx);setAttachAdding(false);}} onRemove={()=>{if(confirm("Remove this attachment?"))setAttachments(prev=>prev.filter((_,i)=>i!==idx));}} />
                ))}
                {attachAdding&&<AttachForm a={{}} onSave={sv=>{setAttachments(prev=>[...prev,{...sv,id:crypto.randomUUID()}]);setAttachAdding(false);}} onCancel={()=>setAttachAdding(false)} />}
                {!attachAdding&&attachEditIdx===null&&<button onClick={()=>setAttachAdding(true)} style={{...btnG,width:"100%",marginTop:4}}>+ Add Attachment</button>}
              {/* Lighting */}
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8,marginTop:16}}>Lighting</div>
                {lighting.map((l,idx)=>(
                  lightEditIdx===idx
                    ? <LightingForm key={l.id||idx} l={l} onSave={sv=>{setLighting(prev=>prev.map((x,i)=>i===idx?{...sv,id:x.id||crypto.randomUUID()}:x));setLightEditIdx(null);}} onCancel={()=>setLightEditIdx(null)} />
                    : <LightingCard key={l.id||idx} l={l} onEdit={()=>{setLightEditIdx(idx);setLightAdding(false);}} onRemove={()=>{if(confirm("Remove this entry?"))setLighting(prev=>prev.filter((_,i)=>i!==idx));}} />
                ))}
                {lightAdding&&<LightingForm l={{}} onSave={sv=>{setLighting(prev=>[...prev,{...sv,id:crypto.randomUUID()}]);setLightAdding(false);}} onCancel={()=>setLightAdding(false)} />}
                {!lightAdding&&lightEditIdx===null&&<button onClick={()=>setLightAdding(true)} style={{...btnG,width:"100%",marginTop:4}}>+ Add Light</button>}

              </div>}
            </div>;
          })()}

          {/* Chainsaw Bar & Chain */}
          {type==="Chainsaw"&&(()=>{
            const hasData=!!(barLength||chainPitchCS||chainDriveLinks||sprocketStyle);
            const csSum=[
              [barLength?barLength+"\" bar":null,barGauge?barGauge+" gauge":null,barMount].filter(Boolean).join(" · "),
              [chainPitchCS?chainPitchCS+" pitch":null,chainGauge?chainGauge+" gauge":null,chainDriveLinks?chainDriveLinks+" drive links":null].filter(Boolean).join(" · "),
              [chainBrand,chainPartNo].filter(Boolean).join(" · "),
              [sprocketStyle,sprocketPitchCS,sprocketTeethCS?sprocketTeethCS+"T":null].filter(Boolean).join(" · "),
            ].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecChainsaw(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Bar & Chain</span>
                  {hasData&&!secChainsaw&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secChainsaw?"▲":"▼"}</span>
              </div>
              {secChainsaw&&<div style={{paddingTop:12}}>
                {hasData&&!editChainsaw&&<SummaryCard onEdit={()=>setEditChainsaw(true)} lines={csSum} />}
                {(editChainsaw||!hasData)&&<>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Guide Bar</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Bar length (inches)" /><input style={inp} type="number" placeholder="e.g. 16" step="1" min="0" value={barLength} onChange={ev=>setBarLength(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Bar gauge (groove width)" /><select style={sel} value={barGauge} onChange={ev=>setBarGauge(ev.target.value)}><option value="">— not set —</option>{CHAINSAW_GAUGES.map(g=><option key={g}>{g}</option>)}</select></div>
                </div>
                <div style={col}><FL t="Bar mount type" /><select style={sel} value={barMount} onChange={ev=>setBarMount(ev.target.value)}><option value="">— not set —</option>{BAR_MOUNT_TYPES.map(b=><option key={b}>{b}</option>)}</select></div>
                <div style={{fontSize:9,color:MUT,marginBottom:8,lineHeight:1.5}}>Bar studs are the press-fit studs the bar slides onto, secured by bar nuts.</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Bar stud diameter" /><select style={sel} value={barStudDiameter} onChange={ev=>setBarStudDiameter(ev.target.value)}><option value="">— not set —</option>{["M8","M10","M12","Other"].map(s=><option key={s}>{s}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Bar nut type" /><select style={sel} value={barNutType} onChange={ev=>setBarNutType(ev.target.value)}><option value="">— not set —</option><option>Hex nut</option><option>Spanner / Star nut</option><option>Other</option></select></div>
                </div>
                <div style={{...col,maxWidth:160}}><FL t="Bar nut size" /><select style={sel} value={barNutSize} onChange={ev=>setBarNutSize(ev.target.value)}><option value="">— not set —</option>{["13mm","19mm","Other"].map(s=><option key={s}>{s}</option>)}</select></div>

                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Chain</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Chain pitch" /><select style={sel} value={chainPitchCS} onChange={ev=>setChainPitchCS(ev.target.value)}><option value="">— not set —</option>{CHAINSAW_CHAIN_PITCHES.map(p=><option key={p}>{p}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Chain gauge (must match bar)" /><select style={sel} value={chainGauge} onChange={ev=>setChainGauge(ev.target.value)}><option value="">— not set —</option>{CHAINSAW_GAUGES.map(g=><option key={g}>{g}</option>)}</select></div>
                </div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Drive link count" /><input style={inp} type="number" placeholder="e.g. 56" step="1" min="0" value={chainDriveLinks} onChange={ev=>setChainDriveLinks(ev.target.value)} /></div>
                  <div style={{...col,flex:1}}><FL t="Chain brand" /><input style={inp} placeholder="e.g. Oregon, Stihl" value={chainBrand} onChange={ev=>setChainBrand(ev.target.value)} /></div>
                </div>
                <div style={col}><FL t="Chain part no. / loop" /><input style={inp} placeholder="e.g. Oregon 91VXL056G" value={chainPartNo} onChange={ev=>setChainPartNo(ev.target.value)} /></div>

                <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
                <div style={{fontSize:9,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Drive Sprocket</div>
                <div style={row}>
                  <div style={{...col,flex:1}}><FL t="Sprocket type" /><select style={sel} value={sprocketStyle} onChange={ev=>setSprocketStyle(ev.target.value)}><option value="">— not set —</option>{SPROCKET_STYLES.map(s=><option key={s}>{s}</option>)}</select></div>
                  <div style={{...col,flex:1}}><FL t="Pitch (must match chain)" /><select style={sel} value={sprocketPitchCS} onChange={ev=>setSprocketPitchCS(ev.target.value)}><option value="">— not set —</option>{CHAINSAW_CHAIN_PITCHES.map(p=><option key={p}>{p}</option>)}</select></div>
                </div>
                <div style={{...col,maxWidth:140}}><FL t="Tooth count" /><input style={inp} type="number" placeholder="e.g. 7" step="1" min="0" value={sprocketTeethCS} onChange={ev=>setSprocketTeethCS(ev.target.value)} /></div>
                {editChainsaw&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditChainsaw(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

          {/* Notes */}
          {(!isCustom(type)||showForCustom("Notes",customSections))&&(()=>{
            const hasData = !!notes;
            const notesSum=[notes].filter(l=>l&&l.trim());
            return <div style={{marginBottom:2}}>
              <div onClick={()=>setSecNotes(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #252525",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,fontWeight:700}}>Notes</span>
                  {hasData&&!secNotes&&<span style={{width:6,height:6,borderRadius:"50%",background:ACC,display:"inline-block"}}/>}
                </div>
                <span style={{color:MUT,fontSize:12}}>{secNotes?"▲":"▼"}</span>
              </div>
              {secNotes&&<div style={{paddingTop:12}}>
                {hasData&&!editNotes&&<SummaryCard onEdit={()=>setEditNotes(true)} lines={notesSum} />}
                {(editNotes||!hasData)&&<>
                <div style={col}><textarea style={txa} placeholder="General notes, intake condition, known issues..." value={notes} onChange={ev=>setNotes(ev.target.value)} /></div>
                {editNotes&&hasData&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button onClick={()=>setEditNotes(false)} style={{...btnA,...sm}}>Done</button></div>}
                </>}
              </div>}
            </div>;
          })()}

        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onClose}>Cancel</button>
          <button style={btnA} onClick={save}>{existing?"Save Changes":"Add Machine"}</button>
        </div>
      </div>
    </div>
  );
}
export default MachineForm;