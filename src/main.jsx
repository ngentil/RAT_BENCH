import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from './lib/supabase';
import { MACHINE_TYPES, TYPE_PH, getPH, HANDHELD, WHEELED, MOTO, VEHICLE, TRACKED, isCustom, isVehicle, isTracked, showForCustom, ALL_SECTIONS, ALL_TYPES, showPTO, showPump, showGenOutput, showDrivetrain, showSuspension, showBrakes, showTyres, showElectrics, showBlade, BODY_TYPES_VEHICLE, BODY_TYPES_MOTO, DRIVE_CONFIGS, VEHICLE_MAKES, COMMON_COLOURS, CHAINSAW_CHAIN_PITCHES, CHAINSAW_GAUGES, SPROCKET_STYLES, BAR_MOUNT_TYPES, TRACKED_BRANDS, TRACKED_SUBTYPES, OPERATING_WEIGHTS, TRACK_TYPES, HYD_PUMP_COUNTS, HYD_PUMP_TYPES, RAM_LOCATIONS, COOLING_TYPES, TURBO_TYPES, CHARGING_TYPES, CHARGE_VOLTAGES, RECT_REG, BELT_TYPES, ATTACH_TYPES, SOURCES, STATUSES, SCOL, SBG_, SVC_CATEGORIES, CARB_BRANDS, CARB_TYPES, CARB_BOLTS, EXH_BOLTS, RECOIL_BOLTS, RECOIL_COUNTS, VALVE_COUNTS, PULSE_LOC, PULSE_POS, PORT_CONDITION, SHAFT_TYPES, THREAD_DIR, THREAD_SIZES, PTO_DIAMETERS, SPROCKET_TYPES, CYLINDER_COUNTS, VALVE_TRAIN, CAM_TYPES, LOCKNUT_SIZES, SENSOR_STATUS, INJECTOR_COUNTS, STARTER_TYPES, DRIVE_TYPES, FASTENER_TYPES, FASTENER_LOCS, BOLT_DIAMETERS, CHAIN_PITCHES, TRANS_TYPES, CLUTCH_TYPES, CVT_BELT_TYPES, FORK_TYPES, SHOCK_TYPES, BRAKE_TYPES, BLADE_TYPES, PUMP_TYPES, INLET_SIZES, OUTLET_SIZES, VOLTAGE_OPTIONS, FRAME_TYPES, COIL_TYPES, ENG_BOLTS, ENG_COUNTS, STUD_N, RAGE_LBL, STUD_LOCS, TILE_FIELDS, DEFAULT_TILE, ALL_BADGE_FIELDS, BADGE_PALETTE, TILE_COLOR_DEFAULTS, EXPAND_SECTIONS, DEFAULT_EXPAND, getExpandFields, getTileFields, TABS } from './lib/constants';
import { BG, SURF, BRD, BRD2, TXT, MUT, ACC, GRN, RED, inp, sel, txa, btnA, btnG, btnD, sm, col, row, dvdr, empt, ovly, mdl, mdlH, mdlB, mdlF } from './lib/styles';
import { jsPDF } from 'jspdf';
import './index.css';
import AuthScreen from './components/auth/AuthScreen';
import OnboardingScreen from './components/auth/OnboardingScreen';
import PasswordResetScreen from './components/auth/PasswordResetScreen';
import ProfileSettings from './components/settings/ProfileSettings';
import CompanySettings from './components/settings/CompanySettings';
import SettingsPage from './components/settings/SettingsPage';
import WikiLoginBar from './components/wiki/WikiLoginBar';
import WikiHomePage from './components/wiki/WikiHomePage';
import WikiEntryPage from './components/wiki/WikiEntryPage';
import WikiHistoryPage from './components/wiki/WikiHistoryPage';
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{padding:24,color:"#ff6b6b",fontFamily:"monospace",background:"#1a0000",border:"1px solid #ff3333",borderRadius:4,margin:16}}>
        <b>Render error:</b><br/>{this.state.error.message}<br/><pre style={{fontSize:10,marginTop:8,whiteSpace:"pre-wrap"}}>{this.state.error.stack}</pre>
      </div>
    );
    return this.props.children;
  }
}





// ── Field name mapping: app camelCase ↔ DB snake_case ────────────────────────
function toDb(m) {
  return {
    id:                   m.id,
    user_id:              m.userId || null,
    company_id:           m.companyId || null,
    client_id:            m.clientId || null,
    name:                 m.name,
    type:                 m.type,
    make:                 m.make,
    model:                m.model,
    source:               m.source,
    status:               m.status||'Active',
    description:          m.desc,
    year:                 m.year,
    colour:               m.colour,
    body_type:            m.bodyType,
    drive_config:         m.driveConfig,
    notes:                m.notes,
    rage:                 m.rage || 0,
    photos:               m.photos || [],
    stroke_type:          m.strokeType,
    motor_type:           m.motorType,
    motor_power:          m.motorPower,
    motor_torque:         m.motorTorque,
    controller_brand:     m.controllerBrand,
    pack_voltage:         m.packVoltage,
    pack_capacity:        m.packCapacity,
    batt_chemistry:       m.battChemistry,
    cell_count:           m.cellCount,
    charge_port:          m.chargePort,
    max_charge_rate:      m.maxChargeRate,
    ev_range:             m.evRange,
    regen_braking:        m.regenBraking,
    cyl_count:            m.cylCount,
    firing_order:         m.firingOrder,
    cc_size:              m.ccSize,
    compression:          m.compression,
    idle_rpm:             m.idleRpm,
    wot_rpm:              m.wotRpm,
    bore_diameter:        m.boreDiameter,
    plug_type:            m.plugType,
    plug_gap:             m.plugGap,
    coil_type:            m.coilType,
    primary_ohms:         m.primaryOhms,
    secondary_ohms:       m.secondaryOhms,
    starter_type:         m.starterType,
    rope_diameter:        m.ropeDiameter,
    rope_length:          m.ropeLength,
    r_bolt_n:             m.rBoltN,
    r_bolt_sz:            m.rBoltSz,
    r_bolt_len:           m.rBoltLen,
    valve_train:          m.valveTrain,
    cam_type:             m.camType,
    locknut_size:         m.locknutSize,
    intake_valve_clear:   m.intakeValveClear,
    exhaust_valve_clear:  m.exhaustValveClear,
    intake_valve_n:       m.intakeValveN,
    exhaust_valve_n:      m.exhaustValveN,
    i_valve_face:         m.iValveFace,
    i_valve_stem:         m.iValveStem,
    i_valve_lift:         m.iValveLift,
    i_valve_weight:       m.iValveWeight,
    e_valve_face:         m.eValveFace,
    e_valve_stem:         m.eValveStem,
    e_valve_lift:         m.eValveLift,
    e_valve_weight:       m.eValveWeight,
    spring_free_len:      m.springFreeLen,
    spring_outer_d:       m.springOuterD,
    spring_wire_d:        m.springWireD,
    spring_weight:        m.springWeight,
    i_pw:                 m.iPW,
    i_ph:                 m.iPH,
    i_p_cond:             m.iPCond,
    i_p_notes:            m.iPNotes,
    i_p_photos:           m.iPPhotos || [],
    e_pw:                 m.ePW,
    e_ph:                 m.ePH,
    e_p_cond:             m.ePCond,
    e_p_notes:            m.ePNotes,
    e_p_photos:           m.ePPhotos || [],
    bar_length:           m.barLength,
    bar_gauge:            m.barGauge,
    bar_mount:            m.barMount,
    bar_stud_diameter:    m.barStudDiameter,
    bar_nut_type:         m.barNutType,
    bar_nut_size:         m.barNutSize,
    chain_pitch_cs:       m.chainPitchCS,
    chain_gauge:          m.chainGauge,
    chain_drive_links:    m.chainDriveLinks,
    chain_part_no:        m.chainPartNo,
    chain_brand:          m.chainBrand,
    sprocket_style:       m.sprocketStyle,
    sprocket_pitch_cs:    m.sprocketPitchCS,
    sprocket_teeth_cs:    m.sprocketTeethCS,
    clutch2t_type:        m.clutch2TType,
    clutch_drum_diameter: m.clutchDrumDiameter,
    clutch_shoe_count:    m.clutchShoeCount,
    clutch_engage_rpm:    m.clutchEngageRpm,
    clutch_bearing_part:  m.clutchBearingPart,
    clutch2t_notes:       m.clutch2TNotes,
    pulse_loc:            m.pulseLoc,
    pulse_pos:            m.pulsePos,
    pulse_offset:         m.pulseOffset,
    pto_diameter:         m.ptoDiameter,
    input_shaft_diameter: m.inputShaftDiameter,
    input_shaft_splines:  m.inputShaftSplines,
    input_shaft_thread:   m.inputShaftThread,
    output_shaft_diameter:m.outputShaftDiameter,
    output_shaft_splines: m.outputShaftSplines,
    output_shaft_thread:  m.outputShaftThread,
    prop_shaft_diameter:  m.propShaftDiameter,
    gearbox_shaft_notes:  m.gearboxShaftNotes,
    shaft_type:           m.shaftType,
    thread_dir:           m.threadDir,
    thread_size:          m.threadSize,
    sprocket_type:        m.sprocketType,
    fuel_system:          m.fuelSystem,
    fuel_tank_capacity:   m.fuelTankCapacity,
    mix_ratio:            m.mixRatio,
    c_brand:              m.cBrand,
    carb_count:           m.carbCount,
    c_type:               m.cType,
    c_model:              m.cModel,
    ecu_model:            m.ecuModel,
    tb_diameter:          m.tbDiameter,
    injector_count:       m.injectorCount,
    injector_flow:        m.injectorFlow,
    fuel_rail_pressure:   m.fuelRailPressure,
    fuel_pump_pressure:   m.fuelPumpPressure,
    tps_sensor:           m.tpsSensor,
    map_sensor:           m.mapSensor,
    iat_sensor:           m.iatSensor,
    o2_sensor:            m.o2Sensor,
    iac_sensor:           m.iacSensor,
    fasteners:            m.fasteners || [],
    studs:                m.studs || [],
    i_spacing:            m.iSpacing,
    i_studs:              m.iStuds,
    i_bolt_sz:            m.iBoltSz,
    i_bolt_len:           m.iBoltLen,
    e_spacing:            m.eSpacing,
    e_studs:              m.eStuds,
    e_bolt_sz:            m.eBoltSz,
    e_bolt_len:           m.eBoltLen,
    pump_brand:           m.pumpBrand,
    pump_model:           m.pumpModel,
    pump_psi:             m.pumpPsi,
    pump_flow:            m.pumpFlow,
    pump_inlet:           m.pumpInlet,
    pump_outlet:          m.pumpOutlet,
    pump_type:            m.pumpType,
    gen_watts:            m.genWatts,
    gen_peak_watts:       m.genPeakWatts,
    gen_voltage:          m.genVoltage,
    gen_freq:             m.genFreq,
    gen_avr:              m.genAvr,
    gen_outlets:          m.genOutlets,
    drive_type:           m.driveType,
    gearbox_brand:        m.gearboxBrand,
    clutch_type:          m.clutchType,
    clutch_diameter:      m.clutchDiameter,
    torque_converter:     m.torqueConverter,
    auto_speeds:          m.autoSpeeds,
    auto_fluid_type:      m.autoFluidType,
    auto_fluid_capacity:  m.autoFluidCapacity,
    cvt_belt_type:        m.cvtBeltType,
    gearbox_oil_type:     m.gearboxOilType,
    gearbox_oil_capacity: m.gearboxOilCapacity,
    chain_pitch:          m.chainPitch,
    front_sprocket:       m.frontSprocket,
    rear_sprocket:        m.rearSprocket,
    gear_count:           m.gearCount,
    trans_type:           m.transType,
    fork_type:            m.forkType,
    fork_diameter:        m.forkDiameter,
    fork_travel:          m.forkTravel,
    rear_shock_type:      m.rearShockType,
    rear_travel:          m.rearTravel,
    front_brake:          m.frontBrake,
    front_disc_d:         m.frontDiscD,
    front_disc_w:         m.frontDiscW,
    rear_brake:           m.rearBrake,
    rear_disc_d:          m.rearDiscD,
    rear_disc_w:          m.rearDiscW,
    tyre_front:           m.tyreFront,
    tyre_rear:            m.tyreRear,
    rim_front:            m.rimFront,
    rim_rear:             m.rimRear,
    batt_voltage:         m.battVoltage,
    battery_cca:          m.batteryCCA,
    battery_ah:           m.batteryAh,
    battery_dimensions:   m.batteryDimensions,
    starter_motor_type:   m.starterMotorType,
    fuse_box_notes:       m.fuseBoxNotes,
    deck_size:            m.deckSize,
    blade_length:         m.bladeLength,
    blade_type:           m.bladeType,
    blade_count:          m.bladeCount,
    tile_fields:          m.tileFields || [],
    tile_colors:          m.tileColors || {},
    expand_fields:        m.expandFields || [],
    custom_sections:      m.customSections || null,
    submitted_to_wiki:    m.submittedToWiki || false,
    wiki_machine_id:      m.wikiMachineId || null,
    tracked_brand:        m.trackedBrand,
    tracked_hours:        m.trackedHours,
    tracked_brand_other:  m.trackedBrandOther,
    tracked_subtype:      m.trackedSubtype,
    tracked_subtype_other:m.trackedSubtypeOther,
    operating_weight:     m.operatingWeight,
    operating_weight_other:m.operatingWeightOther,
    track_type:           m.trackType,
    track_width:          m.trackWidth,
    track_pitch:          m.trackPitch,
    track_links:          m.trackLinks,
    sprocket_teeth:       m.sprocketTeeth,
    undercarriage_hours:  m.undercarriageHours,
    hyd_pump_count:       m.hydPumpCount,
    hyd_pump_type:        m.hydPumpType,
    hyd_system_pressure:  m.hydSystemPressure,
    hyd_oil_capacity:     m.hydOilCapacity,
    hyd_relief_valve:     m.hydReliefValve,
    hyd_rams:             m.hydRams || [],
    attachments:          m.attachments || [],
    cooling_type:         m.coolingType,
    coolant_type:         m.coolantType,
    coolant_capacity:     m.coolantCapacity,
    thermostat_temp:      m.thermostatTemp,
    cooling_notes:        m.coolingNotes,
    turbo_fitted:         m.turboFitted,
    turbo_type:           m.turboType,
    turbo_brand:          m.turboBrand,
    turbo_boost:          m.turboBoost,
    intercooler:          m.intercooler,
    turbo_notes:          m.turboNotes,
    charging_type:        m.chargingType,
    charge_voltage:       m.chargeVoltage,
    charge_amps:          m.chargeAmps,
    rect_reg_fitted:      m.rectRegFitted,
    charging_notes:       m.chargingNotes,
    cyl_max_wear:         m.cylMaxWear,
    cyl_taper_limit:      m.cylTaperLimit,
    cyl_out_of_round:     m.cylOutOfRound,
    honing_angle:         m.honingAngle,
    nikasil:              m.nikasil,
    main_bearing_type:    m.mainBearingType,
    main_bearing_left:    m.mainBearingLeft,
    main_bearing_right:   m.mainBearingRight,
    main_bearing_clear:   m.mainBearingClear,
    main_bearing_preload: m.mainBearingPreload,
    crank_pin_diameter:   m.crankPinDiameter,
    crank_pin_length:     m.crankPinLength,
    main_journal_diameter:m.mainJournalDiameter,
    crank_end_float:      m.crankEndFloat,
    crank_runout:         m.crankRunout,
    crank_stroke:         m.crankStroke,
    crank_seal_left:      m.crankSealLeft,
    crank_seal_right:     m.crankSealRight,
    conrod_length:        m.conrodLength,
    conrod_small_end:     m.conrodSmallEnd,
    conrod_small_clear:   m.conrodSmallClear,
    conrod_big_end:       m.conrodBigEnd,
    conrod_big_clear:     m.conrodBigClear,
    conrod_side_clear:    m.conrodSideClear,
    conrod_bearing_type:  m.conrodBearingType,
    conrod_bearing_part:  m.conrodBearingPartNo,
    piston_diameter:      m.pistonDiameter,
    piston_clearance:     m.pistonClearance,
    ring_count:           m.ringCount,
    ring_gap_top:         m.ringGapTop,
    ring_gap_second:      m.ringGapSecond,
    ring_gap_oil:         m.ringGapOil,
    ring_width:           m.ringWidth,
    ring_thickness:       m.ringThickness,
    gudgeon_diameter:     m.gudgeonDiameter,
    gudgeon_length:       m.gudgeonLength,
    gudgeon_fit:          m.gudgeonFit,
    gudgeon_circlip:      m.gudgeonCirclip,
    oil_change_interval:  m.oilChangeInterval,
    oil_change_unit:      m.oilChangeUnit,
    filter_interval:      m.filterInterval,
    filter_interval_unit: m.filterIntervalUnit,
    major_service_interval:m.majorServiceInterval,
    major_service_unit:   m.majorServiceUnit,
    last_service_odo:     m.lastServiceOdo,
    engine_oil_grade:     m.engineOilGrade,
    engine_oil_capacity:  m.engineOilCapacity,
    hydraulic_fluid_type: m.hydraulicFluidType,
    brake_fluid_type:     m.brakeFluidType,
    diff_oil_type:        m.diffOilType,
    diff_oil_capacity:    m.diffOilCapacity,
    transfer_case_oil:    m.transferCaseOil,
    dry_weight:           m.dryWeight,
    gross_weight:         m.grossWeight,
    wheelbase:            m.wheelbase,
    overall_length:       m.overallLength,
    overall_width:        m.overallWidth,
    overall_height:       m.overallHeight,
    belt_type:            m.beltType,
    belt_part_no:         m.beltPartNo,
    belt_width:           m.beltWidth,
    belt_length:          m.beltLength,
    belt_count:           m.beltCount,
    belt_notes:           m.beltNotes,
  };
}

function fromDb(r) {
  return {
    id:                r.id,
    userId:            r.user_id,
    clientId:          r.client_id,
    companyId:         r.company_id || null,
    name:              r.name,
    type:              r.type,
    make:              r.make,
    model:             r.model,
    source:            r.source,
    status:            r.status,
    desc:              r.description,
    year:              r.year,
    colour:            r.colour,
    bodyType:          r.body_type,
    driveConfig:       r.drive_config,
    notes:             r.notes,
    rage:              r.rage || 0,
    photos:            r.photos || [],
    strokeType:        r.stroke_type,
    motorType:         r.motor_type,
    motorPower:        r.motor_power,
    motorTorque:       r.motor_torque,
    controllerBrand:   r.controller_brand,
    packVoltage:       r.pack_voltage,
    packCapacity:      r.pack_capacity,
    battChemistry:     r.batt_chemistry,
    cellCount:         r.cell_count,
    chargePort:        r.charge_port,
    maxChargeRate:     r.max_charge_rate,
    evRange:           r.ev_range,
    regenBraking:      r.regen_braking,
    cylCount:          r.cyl_count,
    firingOrder:       r.firing_order,
    ccSize:            r.cc_size,
    compression:       r.compression,
    idleRpm:           r.idle_rpm,
    wotRpm:            r.wot_rpm,
    boreDiameter:      r.bore_diameter,
    plugType:          r.plug_type,
    plugGap:           r.plug_gap,
    coilType:          r.coil_type,
    primaryOhms:       r.primary_ohms,
    secondaryOhms:     r.secondary_ohms,
    starterType:       r.starter_type,
    ropeDiameter:      r.rope_diameter,
    ropeLength:        r.rope_length,
    rBoltN:            r.r_bolt_n,
    rBoltSz:           r.r_bolt_sz,
    rBoltLen:          r.r_bolt_len,
    valveTrain:        r.valve_train,
    camType:           r.cam_type,
    locknutSize:       r.locknut_size,
    intakeValveClear:  r.intake_valve_clear,
    exhaustValveClear: r.exhaust_valve_clear,
    intakeValveN:      r.intake_valve_n,
    exhaustValveN:     r.exhaust_valve_n,
    iValveFace:        r.i_valve_face,
    iValveStem:        r.i_valve_stem,
    iValveLift:        r.i_valve_lift,
    iValveWeight:      r.i_valve_weight,
    eValveFace:        r.e_valve_face,
    eValveStem:        r.e_valve_stem,
    eValveLift:        r.e_valve_lift,
    eValveWeight:      r.e_valve_weight,
    springFreeLen:     r.spring_free_len,
    springOuterD:      r.spring_outer_d,
    springWireD:       r.spring_wire_d,
    springWeight:      r.spring_weight,
    iPW:               r.i_pw,
    iPH:               r.i_ph,
    iPCond:            r.i_p_cond,
    iPNotes:           r.i_p_notes,
    iPPhotos:          r.i_p_photos || [],
    ePW:               r.e_pw,
    ePH:               r.e_ph,
    ePCond:            r.e_p_cond,
    ePNotes:           r.e_p_notes,
    ePPhotos:          r.e_p_photos || [],
    barLength:         r.bar_length,
    barGauge:          r.bar_gauge,
    barMount:          r.bar_mount,
    barStudDiameter:   r.bar_stud_diameter,
    barNutType:        r.bar_nut_type,
    barNutSize:        r.bar_nut_size,
    chainPitchCS:      r.chain_pitch_cs,
    chainGauge:        r.chain_gauge,
    chainDriveLinks:   r.chain_drive_links,
    chainPartNo:       r.chain_part_no,
    chainBrand:        r.chain_brand,
    sprocketStyle:     r.sprocket_style,
    sprocketPitchCS:   r.sprocket_pitch_cs,
    sprocketTeethCS:   r.sprocket_teeth_cs,
    clutch2TType:      r.clutch2t_type,
    clutchDrumDiameter:r.clutch_drum_diameter,
    clutchShoeCount:   r.clutch_shoe_count,
    clutchEngageRpm:   r.clutch_engage_rpm,
    clutchBearingPart: r.clutch_bearing_part,
    clutch2TNotes:     r.clutch2t_notes,
    pulseLoc:          r.pulse_loc,
    pulsePos:          r.pulse_pos,
    pulseOffset:       r.pulse_offset,
    ptoDiameter:       r.pto_diameter,
    inputShaftDiameter:r.input_shaft_diameter,
    inputShaftSplines: r.input_shaft_splines,
    inputShaftThread:  r.input_shaft_thread,
    outputShaftDiameter:r.output_shaft_diameter,
    outputShaftSplines:r.output_shaft_splines,
    outputShaftThread: r.output_shaft_thread,
    propShaftDiameter: r.prop_shaft_diameter,
    gearboxShaftNotes: r.gearbox_shaft_notes,
    shaftType:         r.shaft_type,
    threadDir:         r.thread_dir,
    threadSize:        r.thread_size,
    sprocketType:      r.sprocket_type,
    fuelSystem:        r.fuel_system,
    fuelTankCapacity:  r.fuel_tank_capacity,
    mixRatio:          r.mix_ratio,
    cBrand:            r.c_brand,
    carbCount:         r.carb_count,
    cType:             r.c_type,
    cModel:            r.c_model,
    ecuModel:          r.ecu_model,
    tbDiameter:        r.tb_diameter,
    injectorCount:     r.injector_count,
    injectorFlow:      r.injector_flow,
    fuelRailPressure:  r.fuel_rail_pressure,
    fuelPumpPressure:  r.fuel_pump_pressure,
    tpsSensor:         r.tps_sensor,
    mapSensor:         r.map_sensor,
    iatSensor:         r.iat_sensor,
    o2Sensor:          r.o2_sensor,
    iacSensor:         r.iac_sensor,
    fasteners:         r.fasteners || [],
    studs:             r.studs || [],
    iSpacing:          r.i_spacing,
    iStuds:            r.i_studs,
    iBoltSz:           r.i_bolt_sz,
    iBoltLen:          r.i_bolt_len,
    eSpacing:          r.e_spacing,
    eStuds:            r.e_studs,
    eBoltSz:           r.e_bolt_sz,
    eBoltLen:          r.e_bolt_len,
    pumpBrand:         r.pump_brand,
    pumpModel:         r.pump_model,
    pumpPsi:           r.pump_psi,
    pumpFlow:          r.pump_flow,
    pumpInlet:         r.pump_inlet,
    pumpOutlet:        r.pump_outlet,
    pumpType:          r.pump_type,
    genWatts:          r.gen_watts,
    genPeakWatts:      r.gen_peak_watts,
    genVoltage:        r.gen_voltage,
    genFreq:           r.gen_freq,
    genAvr:            r.gen_avr,
    genOutlets:        r.gen_outlets,
    driveType:         r.drive_type,
    gearboxBrand:      r.gearbox_brand,
    clutchType:        r.clutch_type,
    clutchDiameter:    r.clutch_diameter,
    torqueConverter:   r.torque_converter,
    autoSpeeds:        r.auto_speeds,
    autoFluidType:     r.auto_fluid_type,
    autoFluidCapacity: r.auto_fluid_capacity,
    cvtBeltType:       r.cvt_belt_type,
    gearboxOilType:    r.gearbox_oil_type,
    gearboxOilCapacity:r.gearbox_oil_capacity,
    chainPitch:        r.chain_pitch,
    frontSprocket:     r.front_sprocket,
    rearSprocket:      r.rear_sprocket,
    gearCount:         r.gear_count,
    transType:         r.trans_type,
    forkType:          r.fork_type,
    forkDiameter:      r.fork_diameter,
    forkTravel:        r.fork_travel,
    rearShockType:     r.rear_shock_type,
    rearTravel:        r.rear_travel,
    frontBrake:        r.front_brake,
    frontDiscD:        r.front_disc_d,
    frontDiscW:        r.front_disc_w,
    rearBrake:         r.rear_brake,
    rearDiscD:         r.rear_disc_d,
    rearDiscW:         r.rear_disc_w,
    tyreFront:         r.tyre_front,
    tyreRear:          r.tyre_rear,
    rimFront:          r.rim_front,
    rimRear:           r.rim_rear,
    battVoltage:       r.batt_voltage,
    batteryCCA:        r.battery_cca,
    batteryAh:         r.battery_ah,
    batteryDimensions: r.battery_dimensions,
    starterMotorType:  r.starter_motor_type,
    fuseBoxNotes:      r.fuse_box_notes,
    deckSize:          r.deck_size,
    bladeLength:       r.blade_length,
    bladeType:         r.blade_type,
    bladeCount:        r.blade_count,
    tileFields:        r.tile_fields || [],
    tileColors:        r.tile_colors || {},
    expandFields:      r.expand_fields || [],
    customSections:    r.custom_sections || null,
    submittedToWiki:   r.submitted_to_wiki || false,
    wikiMachineId:     r.wiki_machine_id || null,
    trackedBrand:      r.tracked_brand,
    trackedHours:      r.tracked_hours,
    trackedBrandOther: r.tracked_brand_other,
    trackedSubtype:    r.tracked_subtype,
    trackedSubtypeOther:r.tracked_subtype_other,
    operatingWeight:   r.operating_weight,
    operatingWeightOther:r.operating_weight_other,
    trackType:         r.track_type,
    trackWidth:        r.track_width,
    trackPitch:        r.track_pitch,
    trackLinks:        r.track_links,
    sprocketTeeth:     r.sprocket_teeth,
    undercarriageHours:r.undercarriage_hours,
    hydPumpCount:      r.hyd_pump_count,
    hydPumpType:       r.hyd_pump_type,
    hydSystemPressure: r.hyd_system_pressure,
    hydOilCapacity:    r.hyd_oil_capacity,
    hydReliefValve:    r.hyd_relief_valve,
    hydRams:           r.hyd_rams || [],
    attachments:       r.attachments || [],
    coolingType:       r.cooling_type,
    coolantType:       r.coolant_type,
    coolantCapacity:   r.coolant_capacity,
    thermostatTemp:    r.thermostat_temp,
    coolingNotes:      r.cooling_notes,
    turboFitted:       r.turbo_fitted,
    turboType:         r.turbo_type,
    turboBrand:        r.turbo_brand,
    turboBoost:        r.turbo_boost,
    intercooler:       r.intercooler,
    turboNotes:        r.turbo_notes,
    chargingType:      r.charging_type,
    chargeVoltage:     r.charge_voltage,
    chargeAmps:        r.charge_amps,
    rectRegFitted:     r.rect_reg_fitted,
    chargingNotes:     r.charging_notes,
    cylMaxWear:        r.cyl_max_wear,
    cylTaperLimit:     r.cyl_taper_limit,
    cylOutOfRound:     r.cyl_out_of_round,
    honingAngle:       r.honing_angle,
    nikasil:           r.nikasil,
    mainBearingType:   r.main_bearing_type,
    mainBearingLeft:   r.main_bearing_left,
    mainBearingRight:  r.main_bearing_right,
    mainBearingClear:  r.main_bearing_clear,
    mainBearingPreload:r.main_bearing_preload,
    crankPinDiameter:  r.crank_pin_diameter,
    crankPinLength:    r.crank_pin_length,
    mainJournalDiameter:r.main_journal_diameter,
    crankEndFloat:     r.crank_end_float,
    crankRunout:       r.crank_runout,
    crankStroke:       r.crank_stroke,
    crankSealLeft:     r.crank_seal_left,
    crankSealRight:    r.crank_seal_right,
    conrodLength:      r.conrod_length,
    conrodSmallEnd:    r.conrod_small_end,
    conrodSmallClear:  r.conrod_small_clear,
    conrodBigEnd:      r.conrod_big_end,
    conrodBigClear:    r.conrod_big_clear,
    conrodSideClear:   r.conrod_side_clear,
    conrodBearingType: r.conrod_bearing_type,
    conrodBearingPartNo:r.conrod_bearing_part,
    pistonDiameter:    r.piston_diameter,
    pistonClearance:   r.piston_clearance,
    ringCount:         r.ring_count,
    ringGapTop:        r.ring_gap_top,
    ringGapSecond:     r.ring_gap_second,
    ringGapOil:        r.ring_gap_oil,
    ringWidth:         r.ring_width,
    ringThickness:     r.ring_thickness,
    gudgeonDiameter:   r.gudgeon_diameter,
    gudgeonLength:     r.gudgeon_length,
    gudgeonFit:        r.gudgeon_fit,
    gudgeonCirclip:    r.gudgeon_circlip,
    oilChangeInterval: r.oil_change_interval,
    oilChangeUnit:     r.oil_change_unit,
    filterInterval:    r.filter_interval,
    filterIntervalUnit:r.filter_interval_unit,
    majorServiceInterval:r.major_service_interval,
    majorServiceUnit:  r.major_service_unit,
    lastServiceOdo:    r.last_service_odo,
    engineOilGrade:    r.engine_oil_grade,
    engineOilCapacity: r.engine_oil_capacity,
    hydraulicFluidType:r.hydraulic_fluid_type,
    brakeFluidType:    r.brake_fluid_type,
    diffOilType:       r.diff_oil_type,
    diffOilCapacity:   r.diff_oil_capacity,
    transferCaseOil:   r.transfer_case_oil,
    dryWeight:         r.dry_weight,
    grossWeight:       r.gross_weight,
    wheelbase:         r.wheelbase,
    overallLength:     r.overall_length,
    overallWidth:      r.overall_width,
    overallHeight:     r.overall_height,
    beltType:          r.belt_type,
    beltPartNo:        r.belt_part_no,
    beltWidth:         r.belt_width,
    beltLength:        r.belt_length,
    beltCount:         r.belt_count,
    beltNotes:         r.belt_notes,
    createdAt:         r.created_at,
  };
}

function svcToDb(machineId, s) {
  return {
    id:           s.id,
    machine_id:   machineId,
    completed_at: s.completedAt,
    types:        s.types || [],
    notes:        s.notes,
    plug_photo:   s.plugPhoto || null,
    job_photos:   s.jobPhotos || [],
  };
}

function svcFromDb(r) {
  return {
    id:          r.id,
    machineId:   r.machine_id,
    completedAt: r.completed_at,
    types:       r.types || [],
    notes:       r.notes,
    plugPhoto:   r.plug_photo,
    jobPhotos:   r.job_photos || [],
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
  };
}

// ── Supabase API functions ────────────────────────────────────────────────────
async function getMachines() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("machines")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("getMachines:", error); return []; }
  return (data || []).map(fromDb);
}

async function getServices(machineId) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("machine_id", machineId)
    .order("completed_at", { ascending: false });
  if (error) { console.error("getServices:", error); return []; }
  return (data || []).map(svcFromDb);
}

async function upsertMachine(machine) {
  const { data: { user } } = await supabase.auth.getUser();
  const row = { ...toDb(machine), user_id: user?.id };
  const { error } = await supabase
    .from("machines")
    .upsert(row, { onConflict: "id" });
  if (error) { console.error("upsertMachine:", error); throw error; }
}

async function upsertService(machineId, s) {
  const { data: { user } } = await supabase.auth.getUser();
  const row = { ...svcToDb(machineId, s), user_id: user?.id };
  const { error } = await supabase
    .from("services")
    .upsert(row, { onConflict: "id" });
  if (error) console.error("upsertService:", error);
}

async function deleteMachineApi(id) {
  const { error } = await supabase.from("machines").delete().eq("id", id);
  if (error) console.error("deleteMachine:", error);
}

async function deleteServiceApi(id) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) console.error("deleteService:", error);
}

// ── Company API ───────────────────────────────────────────────────────────────
async function getMyCompany(companyId) {
  if (!companyId) return null;
  const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).single();
  if (error) return null;
  return data;
}

async function createCompany(ownerId, fields) {
  const { data: co, error } = await supabase.from("companies")
    .insert({ ...fields, owner_id: ownerId }).select().single();
  if (error) throw error;
  await supabase.from("company_members").insert({ company_id: co.id, user_id: ownerId, role: "admin" });
  await supabase.from("profiles").update({ company_id: co.id }).eq("id", ownerId);
  return co;
}

async function updateCompany(companyId, fields) {
  const { data, error } = await supabase.from("companies")
    .update(fields).eq("id", companyId).select().single();
  if (error) throw error;
  return data;
}

async function joinCompanyByCode(code, userId) {
  const { data, error } = await supabase.rpc("join_company_by_invite", { invite_code_input: code.trim() });
  if (error) throw new Error("Invalid invite code — check and try again.");
  return data;
}

async function leaveCompany(companyId, userId) {
  await supabase.from("company_members").delete().eq("company_id", companyId).eq("user_id", userId);
  await supabase.from("profiles").update({ company_id: null }).eq("id", userId);
}

async function getCompanyMembers(companyId) {
  const { data: members } = await supabase.from("company_members").select("*").eq("company_id", companyId);
  if (!members?.length) return [];
  const { data: profiles } = await supabase.from("profiles")
    .select("id, username, display_name").in("id", members.map(m => m.user_id));
  const pm = {};
  (profiles || []).forEach(p => { pm[p.id] = p; });
  return members.map(m => ({ ...m, profile: pm[m.user_id] || {} }));
}

async function removeMember(companyId, userId) {
  await supabase.from("company_members").delete().eq("company_id", companyId).eq("user_id", userId);
  await supabase.from("profiles").update({ company_id: null }).eq("id", userId);
}

async function regenerateInviteCode(companyId) {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const { data, error } = await supabase.from("companies")
    .update({ invite_code: code }).eq("id", companyId).select().single();
  if (error) throw error;
  return data;
}

async function updateProfile(userId, fields) {
  const { data, error } = await supabase.from("profiles")
    .update(fields).eq("id", userId).select().single();
  if (error) throw error;
  return data;
}

// ── Wiki API ──────────────────────────────────────────────────────────────────
function makeSlug(make, model) {
  return [make, model].join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getWikiEntryBySlug(slug) {
  const { data: entry, error } = await supabase.from("wiki_entries")
    .select("*").eq("slug", slug).single();
  if (error || !entry) return null;
  if (entry.current_rev_id) {
    const { data: rev } = await supabase.from("wiki_revisions")
      .select("*").eq("id", entry.current_rev_id).single();
    entry.currentRevision = rev || null;
  }
  return entry;
}

async function getWikiRevisions(entryId) {
  const { data } = await supabase.from("wiki_revisions")
    .select("*").eq("entry_id", entryId).order("created_at", { ascending: false });
  return data || [];
}

async function searchWiki(query) {
  const { data } = await supabase.from("wiki_entries")
    .select("id,slug,make,model,type,view_count")
    .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
    .order("view_count", { ascending: false })
    .limit(30);
  return data || [];
}

async function incrementViewCount(entryId) {
  await supabase.rpc("increment_wiki_views", { entry_id: entryId });
}

async function saveWikiRevision(entryId, data, editSummary, profile) {
  const { data: rev, error } = await supabase.from("wiki_revisions").insert({
    entry_id:     entryId,
    edited_by:    profile.id,
    username:     profile.username,
    edit_summary: editSummary || "Updated specs",
    data,
  }).select().single();
  if (error) throw error;
  await supabase.from("wiki_entries")
    .update({ current_rev_id: rev.id }).eq("id", entryId);
  return rev;
}

async function deleteWikiRevision(revId, entryId){
  const{error}=await supabase.from("wiki_revisions").delete().eq("id",revId);
  if(error) throw error;
  const{data:remaining}=await supabase.from("wiki_revisions")
    .select("id").eq("entry_id",entryId).order("created_at",{ascending:false}).limit(1);
  await supabase.from("wiki_entries").update({current_rev_id:remaining?.[0]?.id||null}).eq("id",entryId);
}

async function deleteWikiEntry(entryId){
  await supabase.from("wiki_revisions").delete().eq("entry_id",entryId);
  await supabase.from("wiki_contributions").delete().eq("entry_id",entryId);
  const{error}=await supabase.from("wiki_entries").delete().eq("id",entryId);
  if(error) throw error;
}

async function publishToWiki(machine, profile) {
  const slug = makeSlug(machine.make || "", machine.model || "");
  if (!slug || slug === "-") throw new Error("Machine must have a make and model to publish.");

  // Strip private/user-specific fields before storing
  const { userId, companyId, clientId, ...specData } = machine;

  // Check for existing entry
  const { data: existing } = await supabase.from("wiki_entries")
    .select("*").eq("slug", slug).single();

  if (existing) {
    // Return existing entry + current revision for merge review
    const { data: currentRev } = await supabase.from("wiki_revisions")
      .select("*").eq("id", existing.current_rev_id).single();
    return { entry: existing, currentRevision: currentRev || null, isNew: false, slug, specData };
  }

  // Create new entry
  const { data: entry, error } = await supabase.from("wiki_entries").insert({
    slug, make: machine.make, model: machine.model, type: machine.type,
    created_by: profile.id,
  }).select().single();
  if (error) throw error;

  const rev = await saveWikiRevision(entry.id, specData, "Initial publish", profile);

  await supabase.from("wiki_contributions").insert({
    entry_id: entry.id, machine_id: machine.id, user_id: profile.id,
  });

  return { entry, currentRevision: rev, isNew: true, slug, specData };
}


// ── helpers ───────────────────────────────────────────────────────────────────
const uid  = () => crypto.randomUUID();
const nowL = () => { const n = new Date(); return new Date(n - n.getTimezoneOffset()*60000).toISOString().slice(0,16); };
const fmtDT = iso => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"numeric"})
       + " " + d.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit",hour12:true});
};
const mIcon = t => MACHINE_TYPES.find(m => m.label === t)?.icon || "⚙️";

const resizeImg = (b64, maxW=1800) => new Promise(res => {
  const img = new Image();
  img.onload = () => {
    const r = Math.min(1, maxW/img.width);
    const c = document.createElement("canvas");
    c.width = img.width*r; c.height = img.height*r;
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    res(c.toDataURL("image/jpeg",0.92));
  };
  img.src = b64;
});
const toB64 = f => new Promise((res,rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(f);
});


function SL({t}){ return <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,marginBottom:8}}>{t}</div>; }
function FL({t}){ return <div style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:MUT,marginBottom:4}}>{t}</div>; }
function Divider(){ return <div style={dvdr} />; }
function Empty({t}){ return <div style={empt}>{t}</div>; }
function StatusBadge({status}){
  return <span style={{fontSize:8,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",padding:"2px 7px",borderRadius:2,fontFamily:"'IBM Plex Mono',monospace",background:SBG_[status]||"#222",color:SCOL[status]||MUT,border:"1px solid "+(SCOL[status]||MUT)+"55"}}>{status}</span>;
}

function SkullRating({value,onChange}){
  const [hov,setHov]=useState(0);
  const d=hov||value||0;
  return (
    <div>
      <FL t="Rage Factor" />
      <div style={{display:"flex",gap:2,alignItems:"center"}}>
        {[1,2,3,4,5].map(n=>(
          <button key={n} onClick={()=>onChange(n===value?0:n)} onMouseEnter={()=>setHov(n)} onMouseLeave={()=>setHov(0)}
            style={{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:"1px",opacity:n<=d?1:0.15}}>☠️</button>
        ))}
        {value>0&&<span style={{fontSize:9,color:MUT,marginLeft:4,fontFamily:"'IBM Plex Mono',monospace"}}>{RAGE_LBL[value]}</span>}
      </div>
    </div>
  );
}

function PhotoAdder({photos,setPhotos,label="Photos"}){
  const [busy,setBusy]=useState(false);
  const camRef=React.useRef();
  const galRef=React.useRef();
  const handle=async e=>{
    const files=Array.from(e.target.files);if(!files.length)return;
    setBusy(true);
    const processed=await Promise.all(files.map(async f=>resizeImg(await toB64(f))));
    setPhotos(prev=>[...prev,...processed]);setBusy(false);e.target.value="";
  };
  return (
    <div style={col}>
      <FL t={label} />
      {photos.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:6}}>
          {photos.map((p,i)=>(
            <div key={i} style={{position:"relative"}}>
              <img src={p} alt="" style={{width:"100%",height:80,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD,display:"block"}} />
              <button onClick={()=>setPhotos(ps=>ps.filter((_,j)=>j!==i))}
                style={{position:"absolute",top:2,right:2,background:"rgba(0,0,0,0.8)",border:"none",color:"#ccc",width:16,height:16,borderRadius:"50%",cursor:"pointer",fontSize:8,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          ))}
        </div>
      )}
      {busy?<div style={{fontSize:9,color:MUT,textAlign:"center",padding:"9px 0",letterSpacing:"0.1em",textTransform:"uppercase"}}>Processing...</div>:
      <div style={{display:"flex",gap:6}} onClick={ev=>ev.stopPropagation()}>
        <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={handle} style={{display:"none"}} />
        <input ref={galRef} type="file" accept="image/*" multiple onChange={handle} style={{display:"none"}} />
        <button onClick={()=>camRef.current.click()} style={{...btnG,flex:1,fontSize:9,padding:"8px 0"}}>📷 Camera</button>
        <button onClick={()=>galRef.current.click()} style={{...btnG,flex:1,fontSize:9,padding:"8px 0"}}>🖼 Gallery</button>
      </div>}
    </div>
  );
}

function SpecCell({label,value,highlight}){
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+(highlight?"#3a2200":BRD2),borderRadius:2,padding:"6px 9px"}}>
      <div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:highlight?ACC:MUT,marginBottom:2}}>{label}</div>
      <div style={{fontSize:11,color:highlight?"#e8a060":TXT,fontFamily:"'IBM Plex Mono',monospace"}}>{value}</div>
    </div>
  );
}

// ── Fastener Row ─────────────────────────────────────────────────────────────
function FastenerRow({f, idx, onChange, onRemove}){
  const [locOther,setLocOther]=useState(f.locOther||"");
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase"}}>Fastener {idx+1}</span>
        <button onClick={()=>onRemove(idx)} style={{background:"none",border:"none",color:"#884040",cursor:"pointer",fontSize:12}}>✕</button>
      </div>
      <div style={col}>
        <FL t="Location" />
        <select style={sel} value={f.location||""} onChange={ev=>onChange(idx,{...f,location:ev.target.value,locOther:""})}>
          <option value="">— not set —</option>
          {FASTENER_LOCS.map(l=><option key={l}>{l}</option>)}
        </select>
      </div>
      {f.location==="Other"&&<div style={col}><FL t="Location (describe)" /><input style={inp} placeholder="e.g. Timing cover" value={f.locOther||""} onChange={ev=>onChange(idx,{...f,locOther:ev.target.value})} /></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={col}><FL t="Count" /><input style={inp} placeholder="e.g. 4" value={f.count||""} onChange={ev=>onChange(idx,{...f,count:ev.target.value})} /></div>
        <div style={col}>
          <FL t="Fastener type" />
          <select style={sel} value={f.fType||""} onChange={ev=>onChange(idx,{...f,fType:ev.target.value,driveType:""})}>
            <option value="">— not set —</option>
            {FASTENER_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        {f.fType==="Bolt"&&<div style={col}><FL t="Drive type" /><select style={sel} value={f.driveType||""} onChange={ev=>onChange(idx,{...f,driveType:ev.target.value})}><option value="">— not set —</option>{DRIVE_TYPES.map(d=><option key={d}>{d}</option>)}</select></div>}
        <div style={col}><FL t="Diameter" /><select style={sel} value={f.diameter||""} onChange={ev=>onChange(idx,{...f,diameter:ev.target.value})}><option value="">— not set —</option>{BOLT_DIAMETERS.map(d=><option key={d}>{d}</option>)}</select></div>
        <div style={col}><FL t="Length (mm)" /><input style={inp} type="number" placeholder="e.g. 25" step="0.5" min="0" value={f.length||""} onChange={ev=>onChange(idx,{...f,length:ev.target.value})} /></div>
      </div>
    </div>
  );
}

// ── Stud Card & Form ─────────────────────────────────────────────────────────
function StudCard({s,onEdit,onRemove}){
  const loc=s.location==="Other"?(s.locOther||"Other"):(s.location||"—");
  const parts=[s.fType,s.fType==="Bolt"&&s.driveType?s.driveType:null,s.diameter?s.diameter+" dia":null,s.length?s.length+"mm length":null,s.spacing?s.spacing+"mm ctr spacing":null,s.countPerSide?s.countPerSide+"/side":null].filter(Boolean);
  const torque=[s.torqueNm?s.torqueNm+"Nm":null,s.torqueFtlb?s.torqueFtlb+"ft-lb":null].filter(Boolean);
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:6}}>
      <div style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{loc}</div>
      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",marginBottom:torque.length?4:8,lineHeight:1.5}}>{parts.length?parts.join(" · "):"No specs yet"}</div>
      {torque.length>0&&<div style={{fontSize:11,color:"#d4a017",fontFamily:"'IBM Plex Mono',monospace",marginBottom:8}}>⚡ {torque.join(" / ")}</div>}
      <div style={{display:"flex",gap:6}}>
        <button onClick={onEdit} style={{...btnG,...sm}}>Edit</button>
        <button onClick={onRemove} style={btnD}>Delete</button>
      </div>
    </div>
  );
}
function StudForm({s,onSave,onCancel}){
  const [location,setLocation]=useState(s.location||"");
  const [locOther,setLocOther]=useState(s.locOther||"");
  const [fType,setFType]=useState(s.fType||"");
  const [driveType,setDriveType]=useState(s.driveType||"");
  const [diameter,setDiameter]=useState(s.diameter||"");
  const [length,setLength]=useState(s.length||"");
  const [spacing,setSpacing]=useState(s.spacing||"");
  const [countPerSide,setCountPerSide]=useState(s.countPerSide||"");
  const [torqueNm,setTorqueNm]=useState(s.torqueNm||"");
  const [torqueFtlb,setTorqueFtlb]=useState(s.torqueFtlb||"");

  const NM_TO_FTLB = 0.737562;
  const FTLB_TO_NM = 1.35582;

  const handleNm = v => {
    setTorqueNm(v);
    if(v&&!isNaN(v)) setTorqueFtlb((parseFloat(v)*NM_TO_FTLB).toFixed(2));
    else setTorqueFtlb("");
  };
  const handleFtlb = v => {
    setTorqueFtlb(v);
    if(v&&!isNaN(v)) setTorqueNm((parseFloat(v)*FTLB_TO_NM).toFixed(2));
    else setTorqueNm("");
  };

  const save=()=>onSave({...s,location,locOther,fType,driveType,diameter,length:length.toString(),spacing:spacing.toString(),countPerSide:countPerSide.toString(),torqueNm:torqueNm.toString(),torqueFtlb:torqueFtlb.toString()});
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+ACC,borderRadius:2,padding:"12px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase"}}>{s.id?"Edit Entry":"New Entry"}</span>
        <button onClick={onCancel} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:12}}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={{...col,gridColumn:"1/-1"}}>
          <FL t="Location" />
          <select style={sel} value={location} onChange={ev=>setLocation(ev.target.value)}>
            <option value="">— not set —</option>
            {STUD_LOCS.map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
        {location==="Other"&&<div style={{...col,gridColumn:"1/-1"}}><FL t="Describe location" /><input style={inp} placeholder="e.g. Timing cover" value={locOther} onChange={ev=>setLocOther(ev.target.value)} /></div>}
        <div style={col}>
          <FL t="Fastener type" />
          <select style={sel} value={fType} onChange={ev=>{setFType(ev.target.value);setDriveType("");}}>
            <option value="">— not set —</option>
            {FASTENER_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        {fType==="Bolt"&&<div style={col}><FL t="Drive type" /><select style={sel} value={driveType} onChange={ev=>setDriveType(ev.target.value)}><option value="">— not set —</option>{DRIVE_TYPES.map(d=><option key={d}>{d}</option>)}</select></div>}
        <div style={col}><FL t="Diameter" /><select style={sel} value={diameter} onChange={ev=>setDiameter(ev.target.value)}><option value="">— not set —</option>{BOLT_DIAMETERS.map(d=><option key={d}>{d}</option>)}</select></div>
        <div style={col}><FL t="Length (mm)" /><input style={inp} type="number" placeholder="e.g. 35" step="0.5" min="0" value={length} onChange={ev=>setLength(ev.target.value)} /></div>
        <div style={col}><FL t="Center spacing (mm)" /><input style={inp} type="number" placeholder="e.g. 31" step="0.5" min="0" value={spacing} onChange={ev=>setSpacing(ev.target.value)} /></div>
        <div style={col}><FL t="Count per side" /><input style={inp} placeholder="e.g. 2" value={countPerSide} onChange={ev=>setCountPerSide(ev.target.value)} /></div>
      </div>
      <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
      <div style={{fontSize:9,color:"#d4a017",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Torque Spec</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={col}><FL t="Torque (Nm)" /><input style={inp} type="number" placeholder="e.g. 12" step="0.1" min="0" value={torqueNm} onChange={ev=>handleNm(ev.target.value)} /></div>
        <div style={col}><FL t="Torque (ft-lb)" /><input style={inp} type="number" placeholder="e.g. 8.85" step="0.01" min="0" value={torqueFtlb} onChange={ev=>handleFtlb(ev.target.value)} /></div>
      </div>
      <div style={{fontSize:9,color:MUT,marginTop:-4,marginBottom:8,lineHeight:1.5}}>Enter either unit — the other auto-converts.</div>
      <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
        <button style={{...btnG,...sm}} onClick={onCancel}>Cancel</button>
        <button style={{...btnA,...sm}} onClick={save}>Save</button>
      </div>
    </div>
  );
}

// ── Section Summary Card ─────────────────────────────────────────────────────
function SummaryCard({lines,onEdit}){
  const filtered=lines.filter(l=>l&&l.trim());
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:4}}>
      {filtered.map((l,i)=><div key={i} style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.7,marginBottom:i<filtered.length-1?2:8}}>{l}</div>)}
      <button onClick={onEdit} style={{...btnG,...sm}}>Edit</button>
    </div>
  );
}
function NotLogged({onAdd}){
  return (
    <div style={{padding:"10px 0 14px 0"}}>
      <div style={{fontSize:10,color:MUT,marginBottom:8,fontStyle:"italic"}}>Not logged yet</div>
      <button onClick={onAdd} style={{...btnG,...sm}}>+ Add</button>
    </div>
  );
}

// ── Section Picker Modal ────────────────────────────────────────────────────
function SectionPicker({selected, onSave, onClose}){
  const [secs,setSecs]=useState(selected!==null&&selected!==undefined?selected:[...ALL_SECTIONS]);
  const toggle=s=>setSecs(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);
  return (
    <div style={ovly} onClick={onClose}>
      <div style={{...mdl,maxHeight:"80vh"}} onClick={ev=>ev.stopPropagation()}>
        <div style={mdlH}>
          <b style={{fontSize:13,textTransform:"uppercase",letterSpacing:"0.1em"}}>Custom Sections</b>
          <button style={{...btnG,...sm}} onClick={onClose}>✕</button>
        </div>
        <div style={{...mdlB,paddingTop:8}}>
          <div style={{fontSize:9,color:MUT,marginBottom:14,lineHeight:1.6}}>Choose which sections apply to this machine.</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button style={{...btnG,...sm}} onClick={()=>setSecs([...ALL_SECTIONS])}>All</button>
            <button style={{...btnG,...sm}} onClick={()=>setSecs([])}>None</button>
          </div>
          {ALL_SECTIONS.map(s=>(
            <label key={s} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}}>
              <input type="checkbox" checked={secs.includes(s)} onChange={()=>toggle(s)} style={{accentColor:ACC,width:15,height:15}} />
              <span style={{fontSize:11,color:secs.includes(s)?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>{s}</span>
            </label>
          ))}
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onClose}>Cancel</button>
          <button style={btnA} onClick={()=>onSave(secs)}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Hydraulic Ram Card & Form ─────────────────────────────────────────────────
function HydRamCard({r,onEdit,onRemove}){
  const loc=r.location==="Other"?(r.locationOther||"Other"):(r.location||"—");
  const parts=[r.bore?r.bore+"mm bore":null,r.rod?r.rod+"mm rod":null,r.stroke?r.stroke+"mm stroke":null,r.collapsed?r.collapsed+"mm collapsed":null,r.sealKit?"Seal: "+r.sealKit:null].filter(Boolean);
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:6}}>
      <div style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{loc}</div>
      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",marginBottom:8,lineHeight:1.5}}>{parts.length?parts.join(" · "):"No specs yet"}</div>
      {r.notes&&<div style={{fontSize:10,color:MUT,marginBottom:6,lineHeight:1.4}}>{r.notes}</div>}
      <div style={{display:"flex",gap:6}}><button onClick={onEdit} style={{...btnG,...sm}}>Edit</button><button onClick={onRemove} style={btnD}>Delete</button></div>
    </div>
  );
}
function HydRamForm({r,onSave,onCancel}){
  const [location,setLocation]=useState(r.location||"");
  const [locationOther,setLocationOther]=useState(r.locationOther||"");
  const [bore,setBore]=useState(r.bore||"");
  const [rod,setRod]=useState(r.rod||"");
  const [stroke,setStroke]=useState(r.stroke||"");
  const [collapsed,setCollapsed]=useState(r.collapsed||"");
  const [extended,setExtended]=useState(r.extended||"");
  const [sealKit,setSealKit]=useState(r.sealKit||"");
  const [notes,setNotes]=useState(r.notes||"");
  const save=()=>onSave({...r,location,locationOther,bore:bore.toString(),rod:rod.toString(),stroke:stroke.toString(),collapsed:collapsed.toString(),extended:extended.toString(),sealKit,notes});
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+ACC,borderRadius:2,padding:"12px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase"}}>{r.id?"Edit Ram":"New Ram"}</span>
        <button onClick={onCancel} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:12}}>✕</button>
      </div>
      <div style={{...col,gridColumn:"1/-1"}}><FL t="Location" /><select style={sel} value={location} onChange={ev=>setLocation(ev.target.value)}><option value="">— not set —</option>{RAM_LOCATIONS.map(l=><option key={l}>{l}</option>)}</select></div>
      {location==="Other"&&<div style={col}><FL t="Describe location" /><input style={inp} placeholder="e.g. Tilt cylinder" value={locationOther} onChange={ev=>setLocationOther(ev.target.value)} /></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
        <div style={col}><FL t="Bore (mm)" /><input style={inp} type="number" placeholder="e.g. 80" step="0.5" min="0" value={bore} onChange={ev=>setBore(ev.target.value)} /></div>
        <div style={col}><FL t="Rod diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 55" step="0.5" min="0" value={rod} onChange={ev=>setRod(ev.target.value)} /></div>
        <div style={col}><FL t="Stroke (mm)" /><input style={inp} type="number" placeholder="e.g. 1200" step="1" min="0" value={stroke} onChange={ev=>setStroke(ev.target.value)} /></div>
        <div style={col}><FL t="Collapsed length (mm)" /><input style={inp} type="number" placeholder="e.g. 950" step="1" min="0" value={collapsed} onChange={ev=>setCollapsed(ev.target.value)} /></div>
        <div style={col}><FL t="Extended length (mm)" /><input style={inp} type="number" placeholder="e.g. 2150" step="1" min="0" value={extended} onChange={ev=>setExtended(ev.target.value)} /></div>
        <div style={col}><FL t="Seal kit part no." /><input style={inp} placeholder="e.g. KOM-707-98-09000" value={sealKit} onChange={ev=>setSealKit(ev.target.value)} /></div>
      </div>
      <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Outer seal only, no wiper" value={notes} onChange={ev=>setNotes(ev.target.value)} /></div>
      <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
        <button style={{...btnG,...sm}} onClick={onCancel}>Cancel</button>
        <button style={{...btnA,...sm}} onClick={save}>Save</button>
      </div>
    </div>
  );
}

// ── Attachment Card & Form ────────────────────────────────────────────────────
function AttachCard({a,onEdit,onRemove}){
  const parts=[a.attachType,a.sizeSpec,a.weight?a.weight+"kg":null].filter(Boolean);
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:6}}>
      <div style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{a.attachType||"Attachment"}</div>
      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",marginBottom:8,lineHeight:1.5}}>{parts.length>1?parts.slice(1).join(" · "):"No specs yet"}</div>
      {a.notes&&<div style={{fontSize:10,color:MUT,marginBottom:6,lineHeight:1.4}}>{a.notes}</div>}
      <div style={{display:"flex",gap:6}}><button onClick={onEdit} style={{...btnG,...sm}}>Edit</button><button onClick={onRemove} style={btnD}>Delete</button></div>
    </div>
  );
}
function AttachForm({a,onSave,onCancel}){
  const [attachType,setAttachType]=useState(a.attachType||"");
  const [attachTypeOther,setAttachTypeOther]=useState(a.attachTypeOther||"");
  const [sizeSpec,setSizeSpec]=useState(a.sizeSpec||"");
  const [weight,setWeight]=useState(a.weight||"");
  const [notes,setNotes]=useState(a.notes||"");
  const save=()=>onSave({...a,attachType,attachTypeOther,sizeSpec,weight:weight.toString(),notes});
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+ACC,borderRadius:2,padding:"12px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase"}}>{a.id?"Edit Attachment":"New Attachment"}</span>
        <button onClick={onCancel} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:12}}>✕</button>
      </div>
      <div style={col}><FL t="Attachment type" /><select style={sel} value={attachType} onChange={ev=>setAttachType(ev.target.value)}><option value="">— not set —</option>{ATTACH_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
      {attachType==="Other"&&<div style={col}><FL t="Describe type" /><input style={inp} placeholder="e.g. Snow pusher" value={attachTypeOther} onChange={ev=>setAttachTypeOther(ev.target.value)} /></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
        <div style={col}><FL t="Size / spec" /><input style={inp} placeholder='e.g. 600mm GP bucket' value={sizeSpec} onChange={ev=>setSizeSpec(ev.target.value)} /></div>
        <div style={col}><FL t="Weight (kg)" /><input style={inp} type="number" placeholder="e.g. 280" step="1" min="0" value={weight} onChange={ev=>setWeight(ev.target.value)} /></div>
      </div>
      <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Pin size 40mm, 2x bucket pins included" value={notes} onChange={ev=>setNotes(ev.target.value)} /></div>
      <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
        <button style={{...btnG,...sm}} onClick={onCancel}>Cancel</button>
        <button style={{...btnA,...sm}} onClick={save}>Save</button>
      </div>
    </div>
  );
}

// ── Machine Form ──────────────────────────────────────────────────────────────
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
      hydRams,attachments});
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

// ── Service Modal ─────────────────────────────────────────────────────────────
function ServiceModal({machine,existing,onSave,onClose}){
  const e=existing||{};
  const [ca,setCa]=useState(e.completedAt||nowL());
  const [types,setTy]=useState(e.types||[]);
  const [notes,setNo]=useState(e.notes||"");
  const [pp,setPp]=useState(e.plugPhoto||null);
  const [jp,setJp]=useState(e.jobPhotos||[]);
  const [pb,setPb]=useState(false);
  const [openCats,setOpenCats]=useState({general:true});
  const tog=t=>setTy(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t]);
  const togCat=id=>setOpenCats(prev=>({...prev,[id]:!prev[id]}));
  const handlePlug=async ev=>{const f=ev.target.files[0];if(!f)return;setPb(true);setPp(await resizeImg(await toB64(f)));setPb(false);};
  const save=()=>onSave({id:e.id||uid(),completedAt:ca,types:types.length?types:["General Service"],
    notes:notes.trim(),plugPhoto:pp,jobPhotos:jp,
    createdAt:e.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});

  const mType = machine.type||"";
  const sType = machine.strokeType||"";

  const visibleCats = SVC_CATEGORIES.filter(cat=>cat.show(mType,sType));

  return (
    <div style={ovly} onClick={onClose}>
      <div style={mdl} onClick={ev=>ev.stopPropagation()}>
        <div style={mdlH}>
          <b style={{fontSize:14,textTransform:"uppercase"}}>{existing?"Edit Entry":"Log Service"}</b>
          <button style={{...btnG,...sm}} onClick={onClose}>✕</button>
        </div>
        <div style={mdlB}>
          <div style={{fontSize:11,color:MUT,marginBottom:10}}>{mIcon(machine.type)} {machine.name}</div>
          <div style={col}><FL t="Completed" /><input type="datetime-local" style={inp} value={ca} onChange={ev=>setCa(ev.target.value)} /></div>

          {types.length>0&&<div style={{marginBottom:10,padding:"8px 10px",background:"#0d0d0d",border:"1px solid "+BRD,borderRadius:2}}>
            <div style={{fontSize:8,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Selected ({types.length})</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {types.map(t=><span key={t} onClick={()=>tog(t)} style={{fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:2,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",textTransform:"uppercase",background:"#2a1200",border:"1px solid "+ACC,color:ACC}}>✕ {t}</span>)}
            </div>
          </div>}

          <FL t="Work Done" />
          <div style={{marginBottom:12}}>
            {visibleCats.map(cat=>{
              const items = typeof cat.items==="function" ? cat.items(mType,sType) : cat.items;
              if(!items||items.length===0) return null;
              const catSelected = items.filter(i=>types.includes(i)).length;
              const isOpen = openCats[cat.id];
              return (
                <div key={cat.id} style={{marginBottom:4,border:"1px solid "+(catSelected>0?ACC+"44":BRD),borderRadius:2,overflow:"hidden"}}>
                  <div onClick={()=>togCat(cat.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",cursor:"pointer",background:catSelected>0?"#1a0a00":"#0a0a0a",userSelect:"none"}}>
                    <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:catSelected>0?ACC:MUT}}>{cat.label}{catSelected>0&&<span style={{marginLeft:6,fontSize:8,background:ACC,color:"#fff",borderRadius:2,padding:"1px 5px"}}>{catSelected}</span>}</span>
                    <span style={{color:MUT,fontSize:11}}>{isOpen?"▲":"▼"}</span>
                  </div>
                  {isOpen&&<div style={{padding:"8px 10px",display:"flex",flexWrap:"wrap",gap:5,borderTop:"1px solid "+BRD}}>
                    {items.map(t=>(
                      <button key={t} onClick={()=>tog(t)} style={{fontSize:9,fontWeight:600,padding:"4px 8px",borderRadius:2,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",textTransform:"uppercase",background:types.includes(t)?"#2a1200":"none",border:types.includes(t)?"1px solid "+ACC:"1px solid "+BRD,color:types.includes(t)?ACC:MUT}}>
                        {t}
                      </button>
                    ))}
                  </div>}
                </div>
              );
            })}
          </div>

          <div style={col}><FL t="Notes" /><textarea style={txa} placeholder="What was found, done, part numbers..." value={notes} onChange={ev=>setNo(ev.target.value)} /></div>
          {sType!=="Electric"&&sType!=="Diesel"&&<div style={col}>
            <FL t="Spark Plug Photo" />
            {pp&&<img src={pp} alt="" style={{width:"100%",maxHeight:120,objectFit:"cover",borderRadius:2,marginBottom:6}} />}
            {pb?<div style={{fontSize:9,color:MUT,textAlign:"center",padding:"8px 0"}}>Processing...</div>:
            <div style={{display:"flex",gap:6}} onClick={ev=>ev.stopPropagation()}>
              <input id="plugCam" type="file" accept="image/*" capture="environment" onChange={handlePlug} style={{display:"none"}} />
              <input id="plugGal" type="file" accept="image/*" onChange={handlePlug} style={{display:"none"}} />
              <button onClick={()=>document.getElementById("plugCam").click()} style={{...btnG,flex:1,fontSize:9,padding:"8px 0"}}>📷 Camera</button>
              <button onClick={()=>document.getElementById("plugGal").click()} style={{...btnG,flex:1,fontSize:9,padding:"8px 0"}}>🖼 Gallery</button>
            </div>}
            {pp&&<button style={{...btnG,...sm,marginTop:5}} onClick={()=>setPp(null)}>Remove</button>}
          </div>}
          <PhotoAdder photos={jp} setPhotos={setJp} label="Job Photos" />
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onClose}>Cancel</button>
          <button style={btnA} onClick={save}>{existing?"Save Changes":"Save Entry"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Machine Card ──────────────────────────────────────────────────────────────
// ── Tile Config Modal ────────────────────────────────────────────────────────
function TileConfig({machine, onSave, onClose}){
  const [fields, setFields] = useState(machine.tileFields&&machine.tileFields.length>0 ? machine.tileFields : [...DEFAULT_TILE]);
  const [colors, setColors] = useState(machine.tileColors||{});
  const toggle = k => setFields(prev => prev.includes(k) ? prev.filter(f=>f!==k) : [...prev,k]);
  const setColor = (k,idx) => setColors(prev=>({...prev,[k]:idx}));
  const getColorIdx = k => colors[k]!==undefined ? colors[k] : 0;
  const save = () => onSave({...machine, tileFields: fields, tileColors: colors});
  const autoFields = ["status","strokeType","rage"];

  // Only show fields that have data logged on this machine
  const availableFields = ALL_BADGE_FIELDS.filter(f => {
    if(f.auto) return true; // always show status/strokeType/rage
    const val = machine[f.k];
    if(!val) return false;
    if(typeof val === "string") return val.trim().length > 0;
    if(typeof val === "number") return val > 0;
    return true;
  });

  // Group by section
  const sections = [...new Set(availableFields.map(f=>f.section))];

  return (
    <div style={ovly} onClick={onClose}>
      <div style={{...mdl,maxHeight:"80vh"}} onClick={ev=>ev.stopPropagation()}>
        <div style={mdlH}>
          <b style={{fontSize:13,textTransform:"uppercase",letterSpacing:"0.1em"}}>Tile Badges</b>
          <button style={{...btnG,...sm}} onClick={onClose}>✕</button>
        </div>
        <div style={{...mdlB,paddingTop:8}}>
          <div style={{fontSize:9,color:MUT,marginBottom:8,lineHeight:1.6}}>
            Showing {availableFields.length} fields with data logged. Pick what shows as badges on the card.
          </div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            <button style={{...btnG,...sm}} onClick={()=>setFields(availableFields.map(f=>f.k))}>All</button>
            <button style={{...btnG,...sm}} onClick={()=>setFields(["status","strokeType"])}>Reset</button>
          </div>
          {sections.map(section=>(
            <div key={section} style={{marginBottom:10}}>
              <div style={{fontSize:8,color:ACC,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6,paddingBottom:4,borderBottom:"1px solid #1a1a1a"}}>{section}</div>
              {availableFields.filter(f=>f.section===section).map(f=>{
                const active = fields.includes(f.k);
                const isAuto = autoFields.includes(f.k);
                const cidx = getColorIdx(f.k);
                const val = machine[f.k];
                return (
                  <div key={f.k} style={{padding:"6px 0",borderBottom:"1px solid #111"}}>
                    <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                      <input type="checkbox" checked={active} onChange={()=>toggle(f.k)} style={{accentColor:ACC,width:14,height:14,flexShrink:0}} />
                      <span style={{fontSize:10,color:active?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace",flex:1}}>{f.l}</span>
                      {val&&!isAuto&&<span style={{fontSize:8,color:"#444"}}>{String(val).slice(0,16)}</span>}
                    </label>
                    {active&&!isAuto&&(
                      <div style={{display:"flex",gap:4,marginTop:6,marginLeft:24}}>
                        {BADGE_PALETTE.map(([bg,brd,txt],i)=>(
                          <button key={i} onClick={()=>setColor(f.k,i)}
                            style={{width:16,height:16,borderRadius:2,background:bg,border:cidx===i?"2px solid "+txt:"1px solid "+brd,cursor:"pointer",padding:0,flexShrink:0}}
                            title={["Orange","Blue","Green","Red","Purple","Yellow","Teal","Grey"][i]}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {availableFields.length===0&&<div style={{fontSize:10,color:MUT,textAlign:"center",padding:"20px 0"}}>No specs logged yet — add data to this machine first.</div>}
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onClose}>Cancel</button>
          <button style={btnA} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Expand Config Modal ──────────────────────────────────────────────────────
function ExpandConfig({machine, onSave, onClose}){
  // Define all possible expand sections with data-presence check
  const ALL_EXPAND_SECTIONS = [
    {k:"photos",        l:"Photos",              hasData: m => m.photos?.length>0},
    {k:"desc",          l:"Description",         hasData: m => !!m.desc},
    {k:"strokeType",    l:"Engine Specs",        hasData: m => !!(m.strokeType||m.ccSize||m.compression||m.plugType||m.cylCount||m.motorPower)},
    {k:"fasteners",     l:"Fastener Specs",      hasData: m => m.fasteners?.length>0},
    {k:"iPW",           l:"Port Dimensions",     hasData: m => !!(m.iPW||m.ePW), onlyFor: s => s==="2-stroke"},
    {k:"boreDiameter",  l:"Cylinder Bore",       hasData: m => !!m.boreDiameter},
    {k:"ptoDiameter",   l:"PTO / Output Shaft",  hasData: m => !!m.ptoDiameter},
    {k:"fuelSystem",    l:"Fuel System",         hasData: m => !!(m.fuelSystem||m.cBrand||m.ecuModel||m.fuelTankCapacity)},
    {k:"coolingType",   l:"Cooling System",      hasData: m => !!m.coolingType},
    {k:"turboFitted",   l:"Turbo / Supercharger",hasData: m => !!m.turboFitted},
    {k:"chargingType",  l:"Charging System",     hasData: m => !!m.chargingType},
    {k:"driveType",     l:"Drivetrain",          hasData: m => !!(m.driveType||m.transType||m.chainPitch)},
    {k:"forkType",      l:"Suspension",          hasData: m => !!(m.forkType||m.rearShockType)},
    {k:"frontBrake",    l:"Brakes",              hasData: m => !!(m.frontBrake||m.rearBrake)},
    {k:"tyreFront",     l:"Tyres",               hasData: m => !!(m.tyreFront||m.tyreRear)},
    {k:"battVoltage",   l:"Electrics",           hasData: m => !!(m.battVoltage||m.batteryCCA||m.starterMotorType)},
    {k:"pumpBrand",     l:"Pump Details",        hasData: m => !!(m.pumpBrand||m.pumpPsi), onlyFor: (s,t) => t==="Pressure Washer"},
    {k:"genWatts",      l:"Generator Output",    hasData: m => !!m.genWatts, onlyFor: (s,t) => t==="Generator"},
    {k:"deckSize",      l:"Blade / Deck",        hasData: m => !!m.deckSize},
    {k:"engineOilGrade",l:"Fluids",              hasData: m => !!(m.engineOilGrade||m.brakeFluidType||m.diffOilType)},
    {k:"dryWeight",     l:"Dimensions & Weight", hasData: m => !!(m.dryWeight||m.overallLength||m.wheelbase)},
    {k:"beltType",      l:"Belt Specs",          hasData: m => !!m.beltType},
    {k:"oilChangeInterval",l:"Service Intervals",hasData: m => !!(m.oilChangeInterval||m.majorServiceInterval)},
    {k:"pistonDiameter",l:"Piston & Bore",       hasData: m => !!m.pistonDiameter},
    {k:"conrodLength",  l:"Connecting Rod",      hasData: m => !!m.conrodLength},
    {k:"crankStroke",   l:"Crankshaft",          hasData: m => !!(m.crankStroke||m.crankPinDiameter)},
    {k:"mainBearingType",l:"Main Bearings",      hasData: m => !!m.mainBearingType},
    {k:"cylMaxWear",    l:"Cylinder Wear Limits",hasData: m => !!m.cylMaxWear},
    {k:"trackedBrand",  l:"Tracked Machine",     hasData: m => !!(m.trackedBrand||m.trackType||m.hydRams?.length>0)},
    {k:"notes",         l:"Notes",               hasData: m => !!m.notes},
    {k:"serviceHistory",l:"Service History",     hasData: () => true},
  ];

  // Filter to sections that have data AND are relevant to this machine
  const available = ALL_EXPAND_SECTIONS.filter(s => {
    if(s.onlyFor && !s.onlyFor(machine.strokeType, machine.type)) return false;
    return s.hasData(machine);
  });

  const current = machine.expandFields&&machine.expandFields.length>0
    ? machine.expandFields
    : available.map(f=>f.k); // default to all sections with data

  const [fields, setFields] = useState(current);
  const toggle = k => setFields(prev => prev.includes(k) ? prev.filter(f=>f!==k) : [...prev,k]);
  const save = () => onSave({...machine, expandFields: fields});

  return (
    <div style={ovly} onClick={onClose}>
      <div style={{...mdl,maxHeight:"80vh"}} onClick={ev=>ev.stopPropagation()}>
        <div style={mdlH}>
          <b style={{fontSize:13,textTransform:"uppercase",letterSpacing:"0.1em"}}>Expanded View</b>
          <button style={{...btnG,...sm}} onClick={onClose}>✕</button>
        </div>
        <div style={{...mdlB,paddingTop:8}}>
          <div style={{fontSize:9,color:MUT,marginBottom:8,lineHeight:1.6}}>
            Showing {available.length} sections with data. Choose what appears when expanded.
          </div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button style={{...btnG,...sm}} onClick={()=>setFields(available.map(f=>f.k))}>All</button>
            <button style={{...btnG,...sm}} onClick={()=>setFields(["serviceHistory"])}>Min</button>
          </div>
          {available.map(f=>(
            <label key={f.k} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}}>
              <input type="checkbox" checked={fields.includes(f.k)} onChange={()=>toggle(f.k)} style={{accentColor:ACC,width:15,height:15}} />
              <span style={{fontSize:11,color:fields.includes(f.k)?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>{f.l}</span>
            </label>
          ))}
          {available.length===0&&<div style={{fontSize:10,color:MUT,textAlign:"center",padding:"20px 0"}}>No data logged yet.</div>}
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onClose}>Cancel</button>
          <button style={btnA} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

const PDF_SCHEMA=[
  {k:"basic",l:"Basic Info",fields:[
    {k:"status",l:"Status"},{k:"year",l:"Year"},{k:"source",l:"Source"},
    {k:"colour",l:"Colour"},{k:"bodyType",l:"Body Type"},{k:"driveConfig",l:"Drive Config"},{k:"desc",l:"Description"},
  ]},
  {k:"engine",l:"Engine",fields:[
    {k:"strokeType",l:"Engine Type"},{k:"ccSize",l:"CC / Rating"},{k:"compression",l:"Compression"},
    {k:"boreDiameter",l:"Bore Diameter"},{k:"idleRpm",l:"Idle RPM"},{k:"wotRpm",l:"WOT RPM"},
    {k:"cylCount",l:"Cylinders"},{k:"valveTrain",l:"Valve Train"},{k:"coolingType",l:"Cooling Type"},
    {k:"coolantType",l:"Coolant"},{k:"coolantCapacity",l:"Coolant Capacity"},
  ]},
  {k:"ignition",l:"Ignition",fields:[
    {k:"plugType",l:"Spark Plug"},{k:"plugGap",l:"Plug Gap"},{k:"coilType",l:"Coil Type"},
    {k:"primaryOhms",l:"Primary Coil Ω"},{k:"secondaryOhms",l:"Secondary Coil Ω"},
  ]},
  {k:"starter",l:"Starter System",fields:[
    {k:"starterType",l:"Starter Type"},{k:"ropeDiameter",l:"Rope Diameter"},{k:"ropeLength",l:"Rope Length"},
  ]},
  {k:"fuel",l:"Fuel System",fields:[
    {k:"fuelSystem",l:"Fuel System"},{k:"cBrand",l:"Carb Brand"},{k:"cType",l:"Carb Type"},
    {k:"cModel",l:"Carb Model"},{k:"fuelTankCapacity",l:"Tank Capacity"},{k:"mixRatio",l:"Mix Ratio"},
    {k:"ecuModel",l:"ECU"},{k:"tbDiameter",l:"Throttle Body"},{k:"injectorCount",l:"Injectors"},
    {k:"fuelRailPressure",l:"Fuel Rail Pressure"},{k:"fuelPumpPressure",l:"Pump Pressure"},
  ]},
  {k:"valves",l:"Valve Specs",fields:[
    {k:"intakeValveClear",l:"Intake Clearance"},{k:"exhaustValveClear",l:"Exhaust Clearance"},
    {k:"iValveFace",l:"Intake Face"},{k:"eValveFace",l:"Exhaust Face"},
    {k:"iValveStem",l:"Intake Stem"},{k:"eValveStem",l:"Exhaust Stem"},
    {k:"springFreeLen",l:"Spring Free Length"},{k:"springOuterD",l:"Spring OD"},
    {k:"locknutSize",l:"Rocker Locknut"},
  ]},
  {k:"fasteners",l:"Fastener Specs",array:true},
  {k:"ports",l:"Port Dimensions",fields:[
    {k:"iPW",l:"Intake Port W"},{k:"iPH",l:"Intake Port H"},
    {k:"ePW",l:"Exhaust Port W"},{k:"ePH",l:"Exhaust Port H"},
    {k:"iSpacing",l:"Intake Stud Spacing"},{k:"iBoltSz",l:"Intake Stud Size"},
    {k:"eSpacing",l:"Exhaust Stud Spacing"},{k:"eBoltSz",l:"Exhaust Stud Size"},
  ]},
  {k:"drivetrain",l:"Drivetrain",fields:[
    {k:"driveType",l:"Drive Type"},{k:"transType",l:"Transmission"},{k:"gearCount",l:"Gears"},
    {k:"gearboxBrand",l:"Gearbox Brand"},{k:"gearboxOilType",l:"Gearbox Oil"},
    {k:"chainPitch",l:"Chain Pitch"},{k:"frontSprocket",l:"Front Sprocket"},{k:"rearSprocket",l:"Rear Sprocket"},
    {k:"cvtBeltType",l:"CVT Belt"},
  ]},
  {k:"fluids",l:"Fluids",fields:[
    {k:"engineOilGrade",l:"Engine Oil"},{k:"engineOilCapacity",l:"Engine Oil Cap"},
    {k:"brakeFluidType",l:"Brake Fluid"},{k:"diffOilType",l:"Diff Oil"},{k:"diffOilCapacity",l:"Diff Oil Cap"},
    {k:"hydraulicFluidType",l:"Hydraulic Fluid"},
  ]},
  {k:"intervals",l:"Service Intervals",fields:[
    {k:"oilChangeInterval",l:"Oil Change"},{k:"filterInterval",l:"Filter Change"},
    {k:"majorServiceInterval",l:"Major Service"},{k:"lastServiceOdo",l:"Last Service Odo"},
  ]},
  {k:"electrics",l:"Electrics",fields:[
    {k:"battVoltage",l:"Battery Voltage"},{k:"batteryCCA",l:"Battery CCA"},{k:"batteryAh",l:"Battery Ah"},
    {k:"starterMotorType",l:"Starter Motor"},{k:"chargingType",l:"Charging Type"},
    {k:"chargeVoltage",l:"Charge Voltage"},{k:"chargeAmps",l:"Charge Amps"},
  ]},
  {k:"tyres",l:"Tyres",fields:[
    {k:"tyreFront",l:"Front Tyre"},{k:"tyreRear",l:"Rear Tyre"},
    {k:"rimFront",l:"Front Rim"},{k:"rimRear",l:"Rear Rim"},
  ]},
  {k:"notes",l:"Notes",fields:[{k:"notes",l:"Notes"}]},
  {k:"history",l:"Service History",svc:true},
];

function exportMachinePDF(m, svcs, opts){
  const iS=k=>!opts||(typeof opts[k]==='boolean'?opts[k]:!!(opts[k]&&Object.values(opts[k]).some(Boolean)));
  const iF=(s,f)=>!opts||!opts[s]||(typeof opts[s]==='object'?opts[s][f]!==false:true);

  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210, margin=14, col=W-margin*2;
  let y=margin;

  const addLine=(text,size=10,bold=false,color=[30,30,30])=>{
    doc.setFontSize(size);doc.setFont("helvetica",bold?"bold":"normal");doc.setTextColor(...color);
    const lines=doc.splitTextToSize(text,col);
    lines.forEach(l=>{if(y>275){doc.addPage();y=margin;}doc.text(l,margin,y);y+=size*0.45;});
    y+=1;
  };
  const addSection=(title)=>{
    y+=3;doc.setFillColor(232,103,10);doc.rect(margin,y-4,col,6,"F");
    doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(255,255,255);
    doc.text(title.toUpperCase(),margin+2,y);y+=5;
  };
  const addField=(label,value)=>{
    if(!value)return;
    doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(100,100,100);
    doc.text(label.toUpperCase(),margin,y);
    doc.setFont("helvetica","normal");doc.setTextColor(30,30,30);
    const lines=doc.splitTextToSize(String(value),col-40);
    doc.text(lines,margin+40,y);y+=Math.max(5,lines.length*4);
  };
  const sf=(sk,fk,label,val)=>{if(iF(sk,fk))addField(label,val);};

  // Header
  doc.setFillColor(22,22,22);doc.rect(0,0,W,22,"F");
  doc.setFontSize(18);doc.setFont("helvetica","bold");doc.setTextColor(232,103,10);
  doc.text("RAT BENCH",margin,14);
  doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(90,90,90);
  doc.text("SMALL ENGINE & EQUIPMENT REPAIR",margin,19);
  y=30;

  addLine(`${m.name}`,16,true,[20,20,20]);
  if(m.make||m.model||m.year) addLine([m.make,m.model,m.year].filter(Boolean).join("  ·  "),9,false,[100,100,100]);
  if(m.type||m.strokeType) addLine([m.type,m.strokeType].filter(Boolean).join("  ·  "),9,false,[150,90,20]);
  y+=4;

  if(iS('basic')){
    addSection("Basic Info");
    sf('basic','status','Status',m.status);
    sf('basic','year','Year',m.year);
    sf('basic','source','Source',m.source);
    sf('basic','colour','Colour',m.colour);
    sf('basic','bodyType','Body Type',m.bodyType);
    sf('basic','driveConfig','Drive Config',m.driveConfig);
    if(iF('basic','desc')&&m.desc) addField("Description",m.desc);
  }

  if(iS('engine')&&(m.strokeType||m.ccSize||m.compression||m.boreDiameter||m.cylCount)){
    addSection("Engine");
    sf('engine','strokeType','Type',m.strokeType);
    sf('engine','ccSize','CC / Rating',m.ccSize?m.ccSize+"cc":null);
    sf('engine','compression','Compression',m.compression?m.compression+" PSI":null);
    sf('engine','boreDiameter','Bore',m.boreDiameter?m.boreDiameter+"mm":null);
    sf('engine','idleRpm','Idle RPM',m.idleRpm?m.idleRpm+" rpm":null);
    sf('engine','wotRpm','WOT RPM',m.wotRpm?m.wotRpm+" rpm":null);
    sf('engine','cylCount','Cylinders',m.cylCount);
    sf('engine','valveTrain','Valve Train',m.valveTrain);
    sf('engine','coolingType','Cooling',m.coolingType);
    sf('engine','coolantType','Coolant',m.coolantType?m.coolantType+(m.coolantCapacity?" / "+m.coolantCapacity+"L":""):null);
  }

  if(iS('ignition')&&(m.plugType||m.plugGap||m.coilType)){
    addSection("Ignition");
    sf('ignition','plugType','Plug Type',m.plugType);
    sf('ignition','plugGap','Plug Gap',m.plugGap?m.plugGap+"mm":null);
    sf('ignition','coilType','Coil Type',m.coilType);
    sf('ignition','primaryOhms','Primary Coil',m.primaryOhms?m.primaryOhms+"Ω":null);
    sf('ignition','secondaryOhms','Secondary Coil',m.secondaryOhms?m.secondaryOhms+"Ω":null);
  }

  if(iS('starter')&&m.starterType){
    addSection("Starter System");
    sf('starter','starterType','Type',m.starterType);
    sf('starter','ropeDiameter','Rope Diameter',m.ropeDiameter?m.ropeDiameter+"mm":null);
    sf('starter','ropeLength','Rope Length',m.ropeLength?m.ropeLength+"mm":null);
  }

  if(iS('fuel')&&(m.fuelSystem||m.cBrand||m.fuelTankCapacity||m.ecuModel)){
    addSection("Fuel System");
    sf('fuel','fuelSystem','Delivery',m.fuelSystem);
    sf('fuel','cBrand','Carb Brand',m.cBrand);
    sf('fuel','cType','Carb Type',m.cType);
    sf('fuel','cModel','Carb Model',m.cModel);
    sf('fuel','fuelTankCapacity','Tank Capacity',m.fuelTankCapacity?m.fuelTankCapacity+"L":null);
    sf('fuel','mixRatio','Mix Ratio',m.mixRatio);
    sf('fuel','ecuModel','ECU',m.ecuModel);
    sf('fuel','tbDiameter','Throttle Body',m.tbDiameter?m.tbDiameter+"mm":null);
    sf('fuel','injectorCount','Injectors',m.injectorCount?m.injectorCount+(m.injectorFlow?" / "+m.injectorFlow+"cc/min":""):null);
    sf('fuel','fuelRailPressure','Rail Pressure',m.fuelRailPressure?m.fuelRailPressure+" bar":null);
    sf('fuel','fuelPumpPressure','Pump Pressure',m.fuelPumpPressure?m.fuelPumpPressure+" bar":null);
  }

  if(iS('valves')&&(m.intakeValveClear||m.iValveFace||m.springFreeLen)){
    addSection("Valve Specs");
    sf('valves','intakeValveClear','Intake Clearance',m.intakeValveClear?m.intakeValveClear+" mm":null);
    sf('valves','exhaustValveClear','Exhaust Clearance',m.exhaustValveClear?m.exhaustValveClear+" mm":null);
    sf('valves','iValveFace','Intake Valve',m.iValveFace?m.iValveFace+"mm face"+(m.iValveStem?" / "+m.iValveStem+"mm stem":""):null);
    sf('valves','eValveFace','Exhaust Valve',m.eValveFace?m.eValveFace+"mm face"+(m.eValveStem?" / "+m.eValveStem+"mm stem":""):null);
    sf('valves','springFreeLen','Valve Spring',m.springFreeLen?m.springFreeLen+"mm free"+(m.springOuterD?" / OD "+m.springOuterD+"mm":""):null);
    sf('valves','locknutSize','Rocker Locknut',m.locknutSize);
  }

  if(iS('fasteners')&&m.fasteners&&m.fasteners.length>0){
    addSection("Fastener Specs");
    m.fasteners.forEach(f=>{
      const loc=f.location==="Other"?(f.locOther||"Other"):(f.location||"—");
      const parts=[f.fType,f.diameter,f.length?f.length+"mm":null,f.torqueNm?f.torqueNm+"Nm":null].filter(Boolean).join(" · ");
      addField(loc,parts);
    });
  }

  if(iS('ports')&&(m.iPW||m.iSpacing||m.iBoltSz)){
    addSection("Port Dimensions");
    sf('ports','iPW','Intake Port',m.iPW&&m.iPH?m.iPW+"×"+m.iPH+"mm":null);
    sf('ports','ePW','Exhaust Port',m.ePW&&m.ePH?m.ePW+"×"+m.ePH+"mm":null);
    sf('ports','iSpacing','Intake Stud Spacing',m.iSpacing?m.iSpacing+" mm":null);
    sf('ports','iBoltSz','Intake Stud Size',m.iBoltSz?m.iBoltSz+(m.iBoltLen?" / "+m.iBoltLen+"mm":""):null);
    sf('ports','eSpacing','Exhaust Stud Spacing',m.eSpacing?m.eSpacing+" mm":null);
    sf('ports','eBoltSz','Exhaust Stud Size',m.eBoltSz?m.eBoltSz+(m.eBoltLen?" / "+m.eBoltLen+"mm":""):null);
  }

  if(iS('drivetrain')&&(m.transType||m.driveType||m.chainPitch)){
    addSection("Drivetrain");
    sf('drivetrain','driveType','Drive Type',m.driveType);
    sf('drivetrain','transType','Transmission',m.transType);
    sf('drivetrain','gearCount','Gear Count',m.gearCount);
    sf('drivetrain','gearboxBrand','Gearbox Brand',m.gearboxBrand);
    sf('drivetrain','gearboxOilType','Gearbox Oil',m.gearboxOilType?m.gearboxOilType+(m.gearboxOilCapacity?" / "+m.gearboxOilCapacity+"L":""):null);
    sf('drivetrain','chainPitch','Chain Pitch',m.chainPitch);
    sf('drivetrain','frontSprocket','Front Sprocket',m.frontSprocket);
    sf('drivetrain','rearSprocket','Rear Sprocket',m.rearSprocket);
    sf('drivetrain','cvtBeltType','CVT Belt',m.cvtBeltType);
  }

  if(iS('fluids')&&(m.engineOilGrade||m.brakeFluidType||m.diffOilType)){
    addSection("Fluids");
    sf('fluids','engineOilGrade','Engine Oil',m.engineOilGrade?m.engineOilGrade+(m.engineOilCapacity?" / "+m.engineOilCapacity+"L":""):null);
    sf('fluids','brakeFluidType','Brake Fluid',m.brakeFluidType);
    sf('fluids','diffOilType','Diff Oil',m.diffOilType?m.diffOilType+(m.diffOilCapacity?" / "+m.diffOilCapacity+"L":""):null);
    sf('fluids','hydraulicFluidType','Hydraulic Fluid',m.hydraulicFluidType);
  }

  if(iS('intervals')&&(m.oilChangeInterval||m.majorServiceInterval)){
    addSection("Service Intervals");
    sf('intervals','oilChangeInterval','Oil Change',m.oilChangeInterval?m.oilChangeInterval+" "+m.oilChangeUnit:null);
    sf('intervals','filterInterval','Filter Change',m.filterInterval?m.filterInterval+" "+m.filterIntervalUnit:null);
    sf('intervals','majorServiceInterval','Major Service',m.majorServiceInterval?m.majorServiceInterval+" "+m.majorServiceUnit:null);
    sf('intervals','lastServiceOdo','Last Service',m.lastServiceOdo);
  }

  if(iS('electrics')&&(m.battVoltage||m.batteryCCA||m.starterMotorType||m.chargingType)){
    addSection("Electrics");
    sf('electrics','battVoltage','Battery Voltage',m.battVoltage);
    sf('electrics','batteryCCA','Battery CCA',m.batteryCCA);
    sf('electrics','batteryAh','Battery Ah',m.batteryAh);
    sf('electrics','starterMotorType','Starter Motor',m.starterMotorType);
    sf('electrics','chargingType','Charging',m.chargingType);
    sf('electrics','chargeVoltage','Charge Voltage',m.chargeVoltage?m.chargeVoltage+"V":null);
    sf('electrics','chargeAmps','Charge Amps',m.chargeAmps?m.chargeAmps+"A":null);
  }

  if(iS('tyres')&&(m.tyreFront||m.tyreRear)){
    addSection("Tyres");
    sf('tyres','tyreFront','Front Tyre',m.tyreFront);
    sf('tyres','tyreRear','Rear Tyre',m.tyreRear);
    sf('tyres','rimFront','Front Rim',m.rimFront);
    sf('tyres','rimRear','Rear Rim',m.rimRear);
  }

  if(iS('notes')&&m.notes){addSection("Notes");if(iF('notes','notes'))addLine(m.notes,9);}

  if(iS('history')&&svcs&&svcs.length>0){
    addSection("Service History");
    svcs.forEach(s=>{
      const d=s.completedAt?new Date(s.completedAt).toLocaleDateString("en-AU"):"-";
      addField(d,(s.types||[]).join(", "));
      if(s.notes) addLine("  "+s.notes,8,false,[80,80,80]);
      y+=1;
    });
  }

  doc.setFontSize(7);doc.setTextColor(120,120,120);
  doc.text("Generated by Rat Bench · ratbench.net · "+new Date().toLocaleDateString("en-AU"),margin,290);
  doc.save((m.name||"machine").replace(/[^a-z0-9]/gi,"_")+"_ratbench.pdf");
}

function PdfExportModal({m,svcs,onClose}){
  const available=React.useMemo(()=>PDF_SCHEMA.map(sec=>{
    if(sec.svc) return svcs.length>0?sec:null;
    if(sec.array) return m.fasteners?.length>0?sec:null;
    const fields=sec.fields.filter(f=>m[f.k]!=null&&m[f.k]!=="");
    return fields.length>0?{...sec,fields}:null;
  }).filter(Boolean),[]);

  const [opts,setOpts]=React.useState(()=>{
    const o={};
    available.forEach(sec=>{
      if(sec.svc||sec.array){o[sec.k]=true;}
      else{o[sec.k]={};sec.fields.filter(f=>m[f.k]!=null&&m[f.k]!=="").forEach(f=>{o[sec.k][f.k]=true;});}
    });
    return o;
  });
  const [openSecs,setOpenSecs]=React.useState(()=>new Set());

  const toggleSec=k=>{
    const sec=available.find(s=>s.k===k);
    if(!sec)return;
    if(sec.svc||sec.array){setOpts(o=>({...o,[k]:!o[k]}));return;}
    const allOn=sec.fields.every(f=>opts[k]?.[f.k]);
    const fields={};sec.fields.forEach(f=>{fields[f.k]=!allOn;});
    setOpts(o=>({...o,[k]:fields}));
  };
  const toggleField=(sk,fk)=>setOpts(o=>({...o,[sk]:{...o[sk],[fk]:!o[sk]?.[fk]}}));
  const toggleOpen=k=>setOpenSecs(s=>{const n=new Set(s);n.has(k)?n.delete(k):n.add(k);return n;});

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:SURF,border:"1px solid "+BRD,borderRadius:"4px 4px 0 0",width:"100%",maxWidth:520,maxHeight:"82vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid "+BRD,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontSize:11,fontWeight:700,color:TXT,letterSpacing:"0.08em",textTransform:"uppercase"}}>PDF Export Options</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {available.map(sec=>{
            const isOpen=openSecs.has(sec.k);
            const allOn=sec.svc||sec.array?!!opts[sec.k]:sec.fields.every(f=>opts[sec.k]?.[f.k]);
            const someOn=sec.svc||sec.array?allOn:sec.fields.some(f=>opts[sec.k]?.[f.k]);
            return(
              <div key={sec.k} style={{borderBottom:"1px solid "+BRD+"33"}}>
                <div style={{display:"flex",alignItems:"center",padding:"9px 16px",gap:10}}>
                  <input type="checkbox" checked={allOn} onChange={()=>toggleSec(sec.k)}
                    ref={el=>{if(el)el.indeterminate=!allOn&&someOn;}}
                    onClick={e=>e.stopPropagation()} style={{cursor:"pointer",flexShrink:0}}/>
                  <span onClick={()=>toggleOpen(sec.k)} style={{flex:1,fontSize:10,fontWeight:700,color:someOn?TXT:MUT,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer"}}>{sec.l}</span>
                  {!sec.svc&&!sec.array&&<span onClick={()=>toggleOpen(sec.k)} style={{fontSize:9,color:MUT,cursor:"pointer"}}>{isOpen?"▲":"▼"}</span>}
                </div>
                {isOpen&&!sec.svc&&!sec.array&&(
                  <div style={{paddingLeft:42,paddingBottom:8,display:"flex",flexWrap:"wrap",gap:"2px 16px"}}>
                    {sec.fields.map(f=>(
                      <label key={f.k} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",cursor:"pointer",minWidth:120}}>
                        <input type="checkbox" checked={!!opts[sec.k]?.[f.k]} onChange={()=>toggleField(sec.k,f.k)} style={{cursor:"pointer"}}/>
                        <span style={{fontSize:10,color:opts[sec.k]?.[f.k]?TXT:MUT}}>{f.l}</span>
                      </label>
                    ))}
                  </div>
                )}
                {isOpen&&(sec.svc||sec.array)&&(
                  <div style={{paddingLeft:42,paddingBottom:8}}>
                    <span style={{fontSize:9,color:MUT}}>{sec.svc?`${svcs.length} entr${svcs.length===1?"y":"ies"}`:"All fasteners included as block"}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{padding:"12px 16px",borderTop:"1px solid "+BRD,display:"flex",gap:8,flexShrink:0}}>
          <button onClick={onClose} style={{...btnG,flex:1,fontSize:10}}>Cancel</button>
          <button onClick={()=>{exportMachinePDF(m,svcs,opts);onClose();}} style={{...btnA,flex:2,fontSize:10}}>Export PDF</button>
        </div>
      </div>
    </div>
  );
}

function WikiTrackerModal({machine,profile,onClose}){
  const [tab,setTab]=React.useState("publish");
  const [entry,setEntry]=React.useState(null);
  const [revisions,setRevisions]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [deleting,setDeleting]=React.useState(false);
  const m=machine;

  React.useEffect(()=>{
    (async()=>{
      const slug=makeSlug(m.make||"",m.model||"");
      const e=await getWikiEntryBySlug(slug);
      if(e){
        setEntry(e);
        const r=await getWikiRevisions(e.id);
        setRevisions(r||[]);
      }
      setLoading(false);
    })();
  },[]);

  const isOwner=entry&&profile&&entry.created_by===profile.id;
  const myRevs=revisions.filter(r=>r.edited_by===profile?.id);
  const hasContribs=isOwner||myRevs.length>0;

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:SURF,border:"1px solid "+BRD,borderRadius:"4px 4px 0 0",width:"100%",maxWidth:520,maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid "+BRD,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",gap:12}}>
            <button onClick={()=>setTab("publish")} style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",background:"none",border:"none",cursor:"pointer",color:tab==="publish"?ACC:MUT,borderBottom:tab==="publish"?"2px solid "+ACC:"2px solid transparent",paddingBottom:2,fontFamily:"'IBM Plex Mono',monospace"}}>PUBLISH</button>
            {hasContribs&&<button onClick={()=>setTab("manage")} style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",background:"none",border:"none",cursor:"pointer",color:tab==="manage"?ACC:MUT,borderBottom:tab==="manage"?"2px solid "+ACC:"2px solid transparent",paddingBottom:2,fontFamily:"'IBM Plex Mono',monospace"}}>MANAGE</button>}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:16}}>
          {tab==="publish"&&<PublishWikiModal machine={m} profile={profile} onClose={onClose} onPublished={onClose} inline/>}
          {tab==="manage"&&(
            loading?<div style={{fontSize:10,color:MUT}}>Loading…</div>:
            !entry?<div style={{fontSize:10,color:MUT}}>No wiki entry found for this machine.</div>:
            <div>
              <a href={"https://wiki.ratbench.net/"+makeSlug(m.make||"",m.model||"")} target="_blank" rel="noreferrer" style={{fontSize:10,color:ACC,display:"block",marginBottom:16}}>View on wiki ↗</a>
              {isOwner&&(
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:9,color:MUT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Delete Entire Entry</div>
                  <div style={{fontSize:10,color:MUT,marginBottom:8}}>Permanently removes this machine and all revisions from the wiki.</div>
                  <button disabled={deleting} onClick={async()=>{
                    if(!confirm(`Delete the entire wiki entry for ${m.make} ${m.model}? This cannot be undone.`))return;
                    setDeleting(true);
                    try{await deleteWikiEntry(entry.id);alert("Wiki entry deleted.");onClose();}
                    catch(e){alert(e.message);setDeleting(false);}
                  }} style={{...btnG,fontSize:9,color:"#e05555",borderColor:"#e05555"}}>
                    {deleting?"Deleting…":"🗑 Delete Entire Wiki Entry"}
                  </button>
                </div>
              )}
              {myRevs.length>0&&(
                <div>
                  <div style={{fontSize:9,color:MUT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>My Revisions ({myRevs.length})</div>
                  {myRevs.map(r=>(
                    <div key={r.id} style={{background:BG,border:"1px solid "+BRD,padding:"8px 12px",borderRadius:2,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                      <div>
                        <div style={{fontSize:10,color:TXT}}>{r.edit_summary||"No summary"}</div>
                        <div style={{fontSize:9,color:MUT}}>{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                      <button disabled={deleting} onClick={async()=>{
                        if(!confirm("Delete this revision?"))return;
                        setDeleting(true);
                        try{
                          await deleteWikiRevision(r.id,entry.id);
                          setRevisions(prev=>prev.filter(x=>x.id!==r.id));
                        }catch(e){alert(e.message);}
                        setDeleting(false);
                      }} style={{...btnG,fontSize:9,color:"#e05555",borderColor:"#e05555",flexShrink:0}}>🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PublishWikiModal({machine,profile,onClose,onPublished,inline}){
  const [step,setStep]=useState("loading"); // loading|confirm|merge|done|error
  const [result,setResult]=useState(null);
  const [mergedData,setMergedData]=useState({});
  const [conflicts,setConflicts]=useState([]);
  const [picks,setPicks]=useState({}); // fieldKey -> "wiki"|"mine"
  const [summary,setSummary]=useState("");
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState("");
  const [publishedSlug,setPublishedSlug]=useState("");

  useEffect(()=>{
    publishToWiki(machine,profile).then(res=>{
      setResult(res);
      if(res.isNew){
        setSummary("Initial publish");
        setStep("confirm");
      } else {
        // Compute conflicts
        const wikiData=res.currentRevision?.data||{};
        const mine=res.specData;
        const cflcts=[];
        const auto={...wikiData};
        Object.keys(mine).forEach(k=>{
          const mv=mine[k],wv=wikiData[k];
          const hasM=mv!==null&&mv!==undefined&&mv!=="";
          const hasW=wv!==null&&wv!==undefined&&wv!=="";
          if(hasM&&hasW&&String(mv)!==String(wv)) cflcts.push({key:k,wiki:wv,mine:mv});
          else if(hasM&&!hasW) auto[k]=mv;
        });
        setConflicts(cflcts);
        const initPicks={};
        cflcts.forEach(c=>{initPicks[c.key]="wiki";});
        setPicks(initPicks);
        setMergedData(auto);
        setSummary("Merged specs from my machine");
        setStep(cflcts.length?"merge":"confirm");
      }
    }).catch(e=>{setErr(e.message);setStep("error");});
  },[]);

  const submit=async()=>{
    setBusy(true);setErr("");
    try{
      const finalData={...mergedData};
      conflicts.forEach(c=>{finalData[c.key]=picks[c.key]==="mine"?c.mine:c.wiki;});
      if(result.isNew){
        // Already created — just record contribution
        await supabase.from("wiki_contributions").insert({entry_id:result.entry.id,machine_id:machine.id,user_id:profile.id});
      } else {
        await saveWikiRevision(result.entry.id,{...result.currentRevision?.data,...finalData},summary,profile);
        await supabase.from("wiki_contributions").insert({entry_id:result.entry.id,machine_id:machine.id,user_id:profile.id});
      }
      setPublishedSlug(result.slug);
      setStep("done");
      onPublished&&onPublished(result.slug);
    }catch(e){setErr(e.message);}
    setBusy(false);
  };

  const lbl={fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4};

  const inner=(
    <>
        <div style={mdlH}>
          {!inline&&<b style={{fontSize:13,textTransform:"uppercase"}}>Publish to Wiki</b>}
          {!inline&&<button style={{...btnG,...sm}} onClick={onClose}>✕</button>}
        </div>
        <div style={mdlB}>
          {step==="loading"&&<div style={{textAlign:"center",padding:24,color:MUT,fontSize:11}}>Checking wiki…</div>}

          {step==="error"&&<>
            <div style={{fontSize:10,color:RED,marginBottom:12}}>{err}</div>
            <button onClick={onClose} style={{...btnG,...sm}}>Close</button>
          </>}

          {step==="done"&&<>
            <div style={{fontSize:13,color:GRN,marginBottom:8}}>✓ Published!</div>
            <div style={{fontSize:10,color:MUT,marginBottom:16}}>Your data is now live on the wiki.</div>
            <a href={`https://wiki.ratbench.net/${publishedSlug}`} target="_blank" rel="noreferrer"
              style={{...btnA,display:"inline-block",textDecoration:"none",fontSize:10,padding:"8px 14px"}}>
              View Wiki Page →
            </a>
          </>}

          {(step==="confirm"||step==="merge")&&<>
            {!result?.isNew&&<div style={{background:"#0d1a0d",border:"1px solid #1a3a1a",borderRadius:2,padding:"8px 12px",fontSize:10,color:GRN,marginBottom:14}}>
              A wiki entry for <b>{machine.make} {machine.model}</b> already exists. Your data will be merged as a new revision.
            </div>}
            {result?.isNew&&<div style={{fontSize:10,color:MUT,marginBottom:14}}>
              Creating new wiki entry: <span style={{color:ACC,fontFamily:"monospace"}}>wiki.ratbench.net/{result?.slug}</span>
            </div>}

            {step==="merge"&&conflicts.length>0&&<>
              <div style={{fontSize:9,color:ACC,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>
                Conflicting Fields — pick which value to keep
              </div>
              <div style={{maxHeight:260,overflowY:"auto",marginBottom:14}}>
                {conflicts.map(c=>(
                  <div key={c.key} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid "+BRD}}>
                    <div style={{...lbl,marginBottom:6}}>{c.key}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      {[["wiki","Wiki: "+String(c.wiki)],["mine","Mine: "+String(c.mine)]].map(([val,label])=>(
                        <label key={val} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"6px 8px",borderRadius:2,border:"1px solid "+(picks[c.key]===val?ACC:BRD),background:picks[c.key]===val?"#1a1200":"transparent"}}>
                          <input type="radio" name={c.key} checked={picks[c.key]===val} onChange={()=>setPicks(p=>({...p,[c.key]:val}))} style={{accentColor:ACC}}/>
                          <span style={{fontSize:10,color:picks[c.key]===val?TXT:MUT}}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>}

            <div style={{...col,marginBottom:12}}>
              <div style={lbl}>Edit Summary</div>
              <input style={inp} value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Brief description of changes"/>
            </div>
            {err&&<div style={{fontSize:10,color:RED,marginBottom:10}}>{err}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={submit} disabled={busy} style={{...btnA,...sm,opacity:busy?0.6:1}}>{busy?"Publishing…":"Publish"}</button>
              <button onClick={onClose} style={{...btnG,...sm}}>Cancel</button>
            </div>
          </>}
        </div>
      </>
  );
  if(inline) return inner;
  return <div style={ovly} onClick={onClose}><div style={{...mdl,maxWidth:480}} onClick={e=>e.stopPropagation()}>{inner}</div></div>;
}

function MachineCard({machine,onUpdate,onDelete,company,profile}){
  const [open,setOpen]=useState(false);
  const [svcs,setSvcs]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const [showSvc,setShowSvc]=useState(false);
  const [editSvc,setEditSvc]=useState(null);
  const [saving,setSaving]=useState(false);
  const [fullImg,setFullImg]=useState(null);
  const [showConfig,setShowConfig]=useState(false);
  const [showWiki,setShowWiki]=useState(false);
  const [showExpandConfig,setShowExpandConfig]=useState(false);
  const [showPdfOpts,setShowPdfOpts]=useState(false);
  const m=machine;

  useEffect(()=>{
    if(open&&!loaded) getServices(m.id).then(s=>{setSvcs(s||[]);setLoaded(true);});
  },[open]);

  const saveSvc=async entry=>{
    setSaving(true);
    await upsertService(m.id,entry);
    const updated=svcs.find(s=>s.id===entry.id)?svcs.map(s=>s.id===entry.id?entry:s):[entry,...svcs];
    setSvcs(updated);setSaving(false);setShowSvc(false);setEditSvc(null);
  };
  const delSvc=async id=>{
    if(!confirm("Delete this entry?"))return;
    await deleteServiceApi(id);
    setSvcs(svcs.filter(s=>s.id!==id));
  };

  const specs=[
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
  ].filter(Boolean);

  return (
    <div style={{background:SURF,border:"1px solid "+BRD,borderRadius:3,marginBottom:8,overflow:"hidden"}}>
      {fullImg&&<div onClick={()=>setFullImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}><img src={fullImg} alt="" style={{maxWidth:"95vw",maxHeight:"95vh",objectFit:"contain"}} /></div>}
      {showEdit&&<MachineForm existing={m} onSave={u=>{onUpdate(u);setShowEdit(false);}} onClose={()=>setShowEdit(false)} company={company}/>}
      {showWiki&&<WikiTrackerModal machine={m} profile={profile} onClose={()=>setShowWiki(false)}/>}
      {showConfig&&<TileConfig machine={m} onSave={u=>{onUpdate(u);setShowConfig(false);}} onClose={()=>setShowConfig(false)} />
      }
      {showExpandConfig&&<ExpandConfig machine={m} onSave={u=>{onUpdate(u);setShowExpandConfig(false);}} onClose={()=>setShowExpandConfig(false)} />}
      {(showSvc||editSvc)&&<ServiceModal machine={m} existing={editSvc} onSave={saveSvc} onClose={()=>{setShowSvc(false);setEditSvc(null);}} />}

      <div style={{display:"flex",alignItems:"center",padding:"11px 14px",gap:10}}>
        <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:10,flex:1,cursor:"pointer",userSelect:"none",minWidth:0}}>
          <span style={{fontSize:16}}>{mIcon(m.type)}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:700,color:TXT}}>{m.name}</div>
            <div style={{fontSize:9,color:MUT,marginTop:2}}>{[m.make,m.model,m.year,m.source].filter(Boolean).join(" · ")}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:"55%",overflow:"hidden"}}>
            {(m.tileFields&&m.tileFields.length>0?m.tileFields:DEFAULT_TILE).map(k=>{
              const tc=m.tileColors||{};
              const colIdx=tc[k]!==undefined?tc[k]:(TILE_COLOR_DEFAULTS[k]!==undefined&&TILE_COLOR_DEFAULTS[k]!=="auto"?TILE_COLOR_DEFAULTS[k]:0);
              const [cbg,cbrd,ctxt]=BADGE_PALETTE[colIdx]||BADGE_PALETTE[0];
              const bStyle={fontSize:8,fontWeight:700,letterSpacing:"0.1em",padding:"2px 6px",borderRadius:2,fontFamily:"'IBM Plex Mono',monospace",background:cbg,color:ctxt,border:"1px solid "+cbrd,whiteSpace:"nowrap"};
              if(k==="status") return <StatusBadge key="status" status={m.status||"Active"} />;
              if(k==="strokeType"&&m.strokeType) return <span key="st" style={{fontSize:8,fontWeight:700,letterSpacing:"0.1em",padding:"2px 6px",borderRadius:2,fontFamily:"'IBM Plex Mono',monospace",background:m.strokeType==="4-stroke"?"#0e1a2a":m.strokeType==="Diesel"?"#0e200e":"#1a0e00",color:m.strokeType==="4-stroke"?"#3a7bd5":m.strokeType==="Diesel"?"#3d9e50":"#e8670a",border:"1px solid "+(m.strokeType==="4-stroke"?"#3a7bd555":m.strokeType==="Diesel"?"#3d9e5055":"#e8670a55")}}>{m.strokeType==="4-stroke"?"4T":m.strokeType==="Diesel"?"DSL":"2T"}</span>;
              if(k==="rage"&&(m.rage||0)>0) return <span key="rage" style={{fontSize:10,letterSpacing:-2}}>{"☠️".repeat(m.rage)}</span>;
              const field=ALL_BADGE_FIELDS.find(f=>f.k===k);
              if(field&&m[k]){
                const lbl=(field.s?field.s.replace(":",""):field.l.split("/")[0].trim().split(" ").slice(0,2).join(" "));
                return <span key={k} style={bStyle}>{lbl}: {String(m[k]).slice(0,14)}</span>;
              }
              return null;
            })}
            <span style={{fontSize:10,color:MUT}}>{open?"▲":"▼"}</span>
          </div>
        </div>
        <button onClick={ev=>{ev.stopPropagation();setShowConfig(true);}} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:2,color:MUT,cursor:"pointer",fontSize:11,padding:"4px 6px",flexShrink:0}} title="Configure tile">⚙️</button>
      </div>

      {open&&(
        <div style={{borderTop:"1px solid "+BRD2}}>
          {(()=>{
            const ef = m.expandFields&&m.expandFields.length>0 ? m.expandFields : DEFAULT_EXPAND;
            const show = k => ef.includes(k);
            // Filter specs based on expandFields
            const visibleSpecs = specs.filter(s=>{
              const fieldMap = {
                "Engine Type":"strokeType","Cylinder Count":"cylCount","CC Size / Rating":"ccSize",
                "Compression":"compression","Spark Plug Type":"plugType","Spark Plug Gap":"plugGap",
                "Glow Plug Type":"plugType","Glow plug resistance":"plugGap",
                "Coil Type":"coilType","Primary Coil":"primaryOhms","Secondary Coil":"primaryOhms",
                "Starter System":"starterType","Starter Rope":"ropeDiameter","Recoil Bolts":"rBoltN",
                "Intake Valve Clearance":"intakeValveClear","Exhaust Valve Clearance":"intakeValveClear",
                "Valve Train":"valveTrain","Cam Type":"valveTrain","Rocker Locknut":"valveTrain",
                "Intake Valve":"iValveFace","Exhaust Valve":"eValveFace","Valve Spring":"springFreeLen",
                "Intake Stud Center Spacing":"iSpacing","Intake Studs per Side":"iSpacing","Intake Stud Diameter":"iSpacing",
                "Exhaust Stud Center Spacing":"iSpacing","Exhaust Studs per Side":"iSpacing","Exhaust Stud Diameter":"iSpacing",
                "Intake Port Dimensions":"iPW","Exhaust Port Dimensions":"iPW",
                "Pulse Port Location":"pulseLoc","Cylinder Bore Diameter":"boreDiameter",
                "PTO Shaft Diameter":"ptoDiameter","Shaft Type":"ptoDiameter","Head Thread Direction":"ptoDiameter","Head Thread Size":"ptoDiameter","Sprocket Type":"ptoDiameter",
                "Fuel System":"fuelSystem","Carb Brand":"cBrand","Carb Type":"cBrand","Carb Model":"cBrand",
                "ECU":"ecuModel","Throttle Body":"ecuModel","Injectors":"ecuModel","Fuel Rail Pressure":"ecuModel",
                "TPS":"tpsSensor","MAP Sensor":"tpsSensor","IAT Sensor":"tpsSensor","O2 Sensor":"tpsSensor","IAC":"tpsSensor",
              };
              const fk = fieldMap[s.label];
              return fk ? show(fk) : true;
            });
            return <>
              {show("photos")&&m.photos?.length>0&&<div style={{padding:"10px 14px 0"}}><FL t="Photos" /><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginTop:4}}>{m.photos.map((p,i)=><img key={i} src={p} alt="" onClick={()=>setFullImg(p)} style={{width:"100%",height:80,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD,cursor:"zoom-in",display:"block"}} />)}</div></div>}
              {show("desc")&&m.desc&&<div style={{padding:"10px 14px 0"}}><FL t="Description" /><div style={{fontSize:11,color:"#999",lineHeight:1.5,marginTop:2}}>{m.desc}</div></div>}
              {visibleSpecs.length>0&&<div style={{padding:"12px 14px 0"}}><SL t="Engine Spec" /><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{visibleSpecs.map(s=><SpecCell key={s.label} label={s.label} value={s.value} highlight={s.highlight} />)}</div></div>}
              {show("fasteners")&&m.fasteners&&m.fasteners.length>0&&<div style={{padding:"12px 14px 0"}}>
                <SL t="Fastener Specs" />
                <div style={{marginTop:6}}>
                  {m.fasteners.map((f,idx)=>{
                    const loc=f.location==="Other"?(f.locOther||"Other"):(f.location||"—");
                    const parts=[
                      f.fType,
                      f.fType==="Bolt"&&f.driveType?f.driveType:null,
                      f.diameter?f.diameter+" dia":null,
                      f.length?f.length+"mm length":null,
                      f.spacing?f.spacing+"mm ctr spacing":null,
                      f.countPerSide?f.countPerSide+"/side":null,
                      f.torqueNm?f.torqueNm+"Nm torque":null,
                    ].filter(Boolean);
                    return <div key={f.id||idx} style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"8px 10px",marginBottom:5}}>
                      <div style={{fontSize:8,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{loc}</div>
                      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.6}}>{parts.length?parts.join(" · "):"No specs"}</div>
                    </div>;
                  })}
                </div>
              </div>}
              {show("notes")&&m.notes&&<div style={{padding:"10px 14px 0"}}><FL t="Notes" /><div style={{fontSize:11,color:"#999",lineHeight:1.5,marginTop:2}}>{m.notes}</div></div>}
              <div style={{height:1,background:BRD2,margin:"12px 0 0"}} />
            </>;
          })()}

          {(()=>{const ef=m.expandFields&&m.expandFields.length>0?m.expandFields:DEFAULT_EXPAND;const showSvcH=ef.includes("serviceHistory");return showSvcH&&(
          <div style={{padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <SL t="Service History" />
              <button style={{...btnA,...sm}} onClick={ev=>{ev.stopPropagation();setShowSvc(true);}}>+ Log</button>
            </div>
            {saving&&<div style={{fontSize:10,color:MUT,marginBottom:8}}>Saving...</div>}
            {!loaded&&<div style={{fontSize:10,color:MUT}}>Loading...</div>}
            {loaded&&svcs.length===0&&<Empty t="No entries yet" />}
            {loaded&&svcs.length>0&&(
              <div style={{borderLeft:"1px solid "+BRD}}>
                {svcs.map(svc=>(
                  <div key={svc.id} style={{position:"relative",paddingLeft:18,marginBottom:14}}>
                    <div style={{position:"absolute",left:3,top:4,width:7,height:7,borderRadius:"50%",background:ACC,border:"1px solid #c04f00"}} />
                    <div style={{fontSize:9,color:MUT,marginBottom:2}}>{fmtDT(svc.completedAt)}</div>
                    <div style={{fontSize:13,fontWeight:700,color:TXT,marginBottom:3}}>{svc.types.join("  ·  ")}</div>
                    {svc.notes&&<div style={{fontSize:11,color:"#888",lineHeight:1.5,marginBottom:5}}>{svc.notes}</div>}
                    {svc.plugPhoto&&<div style={{marginBottom:6}}><FL t="Spark Plug" /><img src={svc.plugPhoto} alt="" onClick={()=>setFullImg(svc.plugPhoto)} style={{borderRadius:2,maxWidth:"100%",maxHeight:130,objectFit:"cover",border:"1px solid "+BRD,cursor:"zoom-in",display:"block"}} /></div>}
                    {svc.jobPhotos?.length>0&&<div style={{marginBottom:6}}><FL t={"Job Photos ("+svc.jobPhotos.length+")"} /><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>{svc.jobPhotos.map((p,i)=><img key={i} src={p} alt="" onClick={()=>setFullImg(p)} style={{width:"100%",height:70,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD,cursor:"zoom-in",display:"block"}} />)}</div></div>}
                    <div style={{display:"flex",gap:6,marginTop:5}}>
                      <button style={{...btnG,...sm}} onClick={()=>setEditSvc(svc)}>Edit</button>
                      <button style={btnD} onClick={()=>delSvc(svc.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          );})()}
          <div style={{padding:"0 14px 12px",display:"flex",gap:8,justifyContent:"space-between",alignItems:"center"}}>
            <button onClick={ev=>{ev.stopPropagation();setShowExpandConfig(true);}} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:2,color:MUT,cursor:"pointer",fontSize:11,padding:"4px 6px"}} title="Configure expanded view">⚙️</button>
            <div style={{display:"flex",gap:8}}>
              <button style={{...btnG,...sm}} onClick={ev=>{ev.stopPropagation();setShowEdit(true);}}>Edit Machine</button>
              <button style={{...btnG,...sm}} onClick={ev=>{ev.stopPropagation();if(!loaded){getServices(m.id).then(s=>{setSvcs(s||[]);setLoaded(true);setShowPdfOpts(true);});}else setShowPdfOpts(true);}}>📄 PDF</button>
              {showPdfOpts&&<PdfExportModal m={m} svcs={svcs} onClose={()=>setShowPdfOpts(false)}/>}
              {m.make&&m.model&&<button style={{...btnG,...sm}} onClick={ev=>{ev.stopPropagation();setShowWiki(true);}}>🌐 Wiki</button>}
              <button style={btnD} onClick={ev=>{ev.stopPropagation();onDelete(m);}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tracker ───────────────────────────────────────────────────────────────────
function MachineTile({machine,onClick}){
  const m=machine;
  const photo=m.photos?.[0];
  const icon=MACHINE_TYPES.find(t=>t.label===m.type)?.icon||"⚙️";
  const sc=SCOL[m.status]||MUT;
  return(
    <div onClick={onClick} style={{background:SURF,border:"1px solid "+BRD,borderRadius:2,cursor:"pointer",overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <div style={{height:90,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
        {photo
          ? <img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <span style={{fontSize:28,opacity:0.4}}>{icon}</span>}
      </div>
      <div style={{padding:"8px 10px",flex:1}}>
        <div style={{fontSize:11,fontWeight:700,color:TXT,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.name||`${m.make||""} ${m.model||""}`.trim()||"Unnamed"}</div>
        {(m.make||m.model)&&<div style={{fontSize:9,color:MUT,marginBottom:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.make} {m.model}</div>}
        <span style={{fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"2px 6px",borderRadius:2,background:SBG_[m.status]||"#222",color:sc,border:"1px solid "+sc+"55"}}>{m.status||"Active"}</span>
      </div>
    </div>
  );
}

function Tracker({machines,setMachines,company,profile}){
  const [showAdd,setShowAdd]=useState(false);
  const [saving,setSaving]=useState(false);
  const [dragIdx,setDragIdx]=useState(null);
  const [dragOver,setDragOver]=useState(null);
  const [showSort,setShowSort]=useState(false);
  const [sortBy,setSortBy]=useState(null);
  const [view,setView]=useState(()=>localStorage.getItem("trackerView")||"list");
  const [cols,setCols]=useState(()=>parseInt(localStorage.getItem("trackerCols")||"2"));
  const [tileOpen,setTileOpen]=useState(null);
  const setViewP=v=>{setView(v);localStorage.setItem("trackerView",v);};
  const setColsP=c=>{setCols(c);localStorage.setItem("trackerCols",String(c));setViewP("grid");};

  const SORT_OPTS=[
    {k:"name_az",l:"Name A → Z"},
    {k:"name_za",l:"Name Z → A"},
    {k:"status",l:"Status"},
    {k:"type",l:"Machine Type"},
    {k:"newest",l:"Date Added (Newest)"},
    {k:"oldest",l:"Date Added (Oldest)"},
    {k:"rage_hi",l:"Rage ☠️ (Highest)"},
    {k:"rage_lo",l:"Rage ☠️ (Lowest)"},
  ];

  const sorted=sortBy?[...machines].sort((a,b)=>{
    if(sortBy==="name_az") return (a.name||"").localeCompare(b.name||"");
    if(sortBy==="name_za") return (b.name||"").localeCompare(a.name||"");
    if(sortBy==="status"){const o=["Active","Queued","Complete"];return o.indexOf(a.status||"Active")-o.indexOf(b.status||"Active");}
    if(sortBy==="type") return (a.type||"").localeCompare(b.type||"");
    if(sortBy==="newest") return new Date(b.createdAt||0)-new Date(a.createdAt||0);
    if(sortBy==="oldest") return new Date(a.createdAt||0)-new Date(b.createdAt||0);
    if(sortBy==="rage_hi") return (b.rage||0)-(a.rage||0);
    if(sortBy==="rage_lo") return (a.rage||0)-(b.rage||0);
    return 0;
  }):machines;

  const addM=async m=>{
    setSaving(true);
    try{
      await upsertMachine(m);
      setMachines(prev=>[m,...prev]);
      setShowAdd(false);
    }catch(e){alert("Save failed: "+e.message);}
    setSaving(false);
  };
  const updateM=async m=>{
    try{
      await upsertMachine(m);
      setMachines(prev=>prev.map(x=>x.id===m.id?m:x));
    }catch(e){alert("Save failed: "+e.message);}
  };
  const deleteM=async m=>{
    if(!confirm(`Delete "${m.name}" and all its history?`))return;
    await deleteMachineApi(m.id);
    setMachines(prev=>prev.filter(x=>x.id!==m.id));
  };

  const onDragStart=(e,idx)=>{setDragIdx(idx);e.dataTransfer.effectAllowed="move";};
  const onDragOver=(e,idx)=>{e.preventDefault();setDragOver(idx);};
  const onDrop=(e,idx)=>{
    e.preventDefault();
    if(dragIdx===null||dragIdx===idx)return;
    const reordered=[...machines];
    const [moved]=reordered.splice(dragIdx,1);
    reordered.splice(idx,0,moved);
    setMachines(reordered);
    setDragIdx(null);setDragOver(null);
  };
  const onDragEnd=()=>{setDragIdx(null);setDragOver(null);};

  return (
    <div style={{padding:16,flex:1}}>
      {showAdd&&<ErrorBoundary><MachineForm onSave={addM} onClose={()=>setShowAdd(false)} company={company}/></ErrorBoundary>}
      {showSort&&(
        <div style={ovly} onClick={()=>setShowSort(false)}>
          <div style={{...mdl,maxHeight:"70vh"}} onClick={ev=>ev.stopPropagation()}>
            <div style={mdlH}>
              <b style={{fontSize:13,textTransform:"uppercase",letterSpacing:"0.1em"}}>Sort Machines</b>
              <button style={{...btnG,...sm}} onClick={()=>setShowSort(false)}>✕</button>
            </div>
            <div style={{...mdlB,paddingTop:8}}>
              <label style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}} onClick={()=>setSortBy(null)}>
                <input type="radio" readOnly checked={sortBy===null} style={{accentColor:ACC,width:15,height:15}} />
                <span style={{fontSize:11,color:sortBy===null?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>Manual order (drag)</span>
              </label>
              {SORT_OPTS.map(o=>(
                <label key={o.k} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}} onClick={()=>setSortBy(o.k)}>
                  <input type="radio" readOnly checked={sortBy===o.k} style={{accentColor:ACC,width:15,height:15}} />
                  <span style={{fontSize:11,color:sortBy===o.k?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>{o.l}</span>
                </label>
              ))}
            </div>
            <div style={mdlF}>
              <button style={btnG} onClick={()=>{setSortBy(null);setShowSort(false);}}>Reset</button>
              <button style={btnA} onClick={()=>setShowSort(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <SL t="Machines" />
          {sortBy&&<span style={{fontSize:8,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",border:"1px solid "+ACC+"44",borderRadius:2,padding:"1px 5px"}}>{SORT_OPTS.find(o=>o.k===sortBy)?.l}</span>}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button style={{background:"none",border:"1px solid #2a2a2a",borderRadius:2,color:sortBy?ACC:MUT,cursor:"pointer",fontSize:11,padding:"4px 6px"}} onClick={()=>setShowSort(true)} title="Sort machines">⚙️</button>
          <button onClick={()=>{if(view==="list"){setColsP(2);}else if(cols<4){setColsP(cols+1);}else{setViewP("list");}}} style={{...btnG,...sm,fontSize:9,minWidth:36}}>{view==="list"?"☰":`⊞${cols}`}</button>
          <button style={{...btnA,...sm}} onClick={()=>setShowAdd(true)}>+ Add</button>
        </div>
      </div>
      {saving&&<div style={{fontSize:10,color:MUT,marginBottom:10}}>Saving...</div>}
      {machines.length===0&&<Empty t="No machines yet — tap + Add" />}
      {view==="grid"?(
        <>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:8}}>
            {sorted.map(m=>(
              <MachineTile key={m.id} machine={m} onClick={()=>setTileOpen(m.id)}/>
            ))}
          </div>
          {tileOpen&&(()=>{const m=sorted.find(x=>x.id===tileOpen);return m?(
            <div style={{position:"fixed",inset:0,background:"#000a",zIndex:200,overflowY:"auto"}} onClick={e=>{if(e.target===e.currentTarget)setTileOpen(null);}}>
              <div style={{maxWidth:640,margin:"24px auto",padding:"0 8px"}}>
                <MachineCard machine={m} onUpdate={u=>{updateM(u);}} onDelete={d=>{deleteM(d);setTileOpen(null);}} company={company} profile={profile}/>
                <button onClick={()=>setTileOpen(null)} style={{...btnG,width:"100%",marginTop:8,fontSize:10}}>Close</button>
              </div>
            </div>
          ):null;})()}
        </>
      ):sorted.map((m,idx)=>(
        <div
          key={m.id}
          draggable={!sortBy}
          onDragStart={e=>!sortBy&&onDragStart(e,idx)}
          onDragOver={e=>!sortBy&&onDragOver(e,idx)}
          onDrop={e=>!sortBy&&onDrop(e,idx)}
          onDragEnd={onDragEnd}
          style={{opacity:dragIdx===idx?0.4:1,borderTop:dragOver===idx&&dragIdx!==idx?"2px solid "+ACC:"2px solid transparent",transition:"opacity 0.15s,border-color 0.1s"}}
        >
          <MachineCard machine={m} onUpdate={updateM} onDelete={deleteM} company={company} profile={profile}/>
        </div>
      ))}
    </div>
  );
}

// ── Plug Log ──────────────────────────────────────────────────────────────────
function PlugLog({machines}){
  const [selId,setSelId]=useState("");
  const [ca,setCa]=useState(nowL());
  const [notes,setNotes]=useState("");
  const [photo,setPhoto]=useState(null);
  const [busy,setBusy]=useState(false);
  const [saved,setSaved]=useState(false);
  const machine=machines.find(m=>m.id===selId)||null;

  const handlePhoto=async e=>{const f=e.target.files[0];if(!f)return;setBusy(true);setPhoto(await resizeImg(await toB64(f)));setBusy(false);setSaved(false);};
  const doSave=async()=>{
    if(!machine||!photo)return;
    const entry={id:uid(),completedAt:ca,types:["Spark Plug"],notes:notes.trim(),plugPhoto:photo,jobPhotos:[],createdAt:new Date().toISOString()};
    await upsertService(machine.id,entry);
    setSaved(true);setPhoto(null);setNotes("");setCa(nowL());
  };

  return (
    <div style={{padding:16,flex:1}}>
      <SL t="Spark Plug Log" />
      <div style={col}>
        <FL t="Machine" />
        {machines.length===0
          ?<div style={{fontSize:11,color:MUT}}>Add a machine in the Tracker tab first</div>
          :<select style={sel} value={selId} onChange={e=>{setSelId(e.target.value);setSaved(false);}}>
            <option value="">— Select machine —</option>
            {machines.map(m=><option key={m.id} value={m.id}>{mIcon(m.type)} {m.name}</option>)}
          </select>}
      </div>
      {machine&&(
        <>
          <div style={col}><FL t="Completed" /><input type="datetime-local" style={inp} value={ca} onChange={e=>setCa(e.target.value)} /></div>
          <div style={col}>
            <FL t="Plug Photo" />
            <div style={{border:"1px dashed "+BRD,borderRadius:2,padding:14,textAlign:"center",cursor:"pointer",position:"relative"}} onClick={ev=>ev.stopPropagation()}>
              <input type="file" accept="image/*" onChange={handlePhoto}
                style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}} />
              {busy?<span style={{fontSize:9,color:MUT}}>Processing...</span>
                :photo?<img src={photo} alt="" style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:2}} />
                :<div><div style={{fontSize:26,marginBottom:6}}>🔩</div><span style={{fontSize:9,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase"}}>Tap to photograph plug</span></div>}
            </div>
            {photo&&<button style={{...btnG,...sm,marginTop:5}} onClick={()=>{setPhoto(null);setSaved(false);}}>Retake</button>}
          </div>
          <div style={col}><FL t="Notes (optional)" /><textarea style={txa} placeholder="Gap, brand, condition reading..." value={notes} onChange={e=>{setNotes(e.target.value);setSaved(false);}} /></div>
          {saved&&<div style={{background:"#0e2410",border:"1px solid #1a3a1a",borderRadius:2,padding:"8px 12px",fontSize:11,color:GRN,marginBottom:12}}>✓ Logged to {machine.name}</div>}
          <button style={{...btnA,width:"100%",opacity:!photo?0.4:1}} onClick={doSave} disabled={!photo}>Save to {machine.name}</button>
        </>
      )}
    </div>
  );
}

// ── Job Board ─────────────────────────────────────────────────────────────────
function JobBoard({machines,setMachines}){
  const updateStatus=async(m,status)=>{const u={...m,status};await upsertMachine(u);setMachines(prev=>prev.map(x=>x.id===m.id?u:x));};
  const updateRage=async(m,rage)=>{const u={...m,rage};await upsertMachine(u);setMachines(prev=>prev.map(x=>x.id===m.id?u:x));};
  const groups=STATUSES.map(s=>({status:s,items:machines.filter(m=>(m.status||"Active")===s)}));
  return (
    <div style={{padding:16,flex:1}}>
      <SL t="Job Board" />
      {machines.length===0&&<Empty t="No machines yet" />}
      {groups.map(({status,items})=>items.length===0?null:(
        <div key={status} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <StatusBadge status={status} />
            <span style={{fontSize:9,color:MUT,letterSpacing:"0.1em"}}>{items.length} machine{items.length!==1?"s":""}</span>
          </div>
          {items.map(m=>(
            <div key={m.id} style={{background:SURF,border:"1px solid "+BRD,borderRadius:3,marginBottom:8,padding:"13px 14px"}}>
              <div style={{display:"flex",gap:10}}>
                <span style={{fontSize:17}}>{mIcon(m.type)}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:TXT,marginBottom:2}}>{m.name}</div>
                  <div style={{fontSize:9,color:MUT,marginBottom:8}}>{[m.source,m.make,m.model].filter(Boolean).join("  ·  ")}</div>
                  {m.notes&&<div style={{fontSize:11,color:"#777",lineHeight:1.5,marginBottom:8}}>{m.notes}</div>}
                  <SkullRating value={m.rage||0} onChange={r=>updateRage(m,r)} />
                  <Divider />
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {STATUSES.filter(s=>s!==status).map(s=>(
                      <button key={s} onClick={()=>updateStatus(m,s)} style={{fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 9px",borderRadius:2,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",background:SBG_[s],color:SCOL[s],border:"1px solid "+SCOL[s]+"55"}}>
                        → {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Spec Search ───────────────────────────────────────────────────────────────
function SpecSearch({machines}){
  const [query,setQuery]=useState("");
  const q=query.trim().toLowerCase();
  const FIELDS=[
    {k:"name",             l:"Name",                              u:""},
    {k:"make",             l:"Make",                              u:""},
    {k:"model",            l:"Model",                             u:""},
    {k:"type",             l:"Machine Type",                      u:""},
    {k:"source",           l:"Source",                            u:""},
    {k:"status",           l:"Status",                            u:""},
    {k:"strokeType",       l:"Engine Type",                       u:""},
    {k:"plugGap",          l:"Spark Plug Gap",                    u:"mm"},
    {k:"coilType",         l:"Coil Type",                         u:""},
    {k:"primaryOhms",      l:"Primary Coil Resistance",           u:"ohms"},
    {k:"secondaryOhms",    l:"Secondary Coil Resistance",         u:"ohms"},
    {k:"starterType",      l:"Starter System",                    u:""},
    {k:"ropeDiameter",     l:"Starter Rope Diameter",             u:"mm"},
    {k:"ropeLength",       l:"Starter Rope Length",               u:"mm"},
    {k:"rBoltN",           l:"Recoil Bolt Count",                 u:""},
    {k:"rBoltSz",          l:"Recoil Bolt Diameter",              u:""},
    {k:"rBoltLen",         l:"Recoil Bolt Length",                u:"mm"},
    {k:"cylCount",         l:"Cylinder Count",                    u:""},
    {k:"firingOrder",      l:"Firing Order",                      u:""},
    {k:"valveTrain",       l:"Valve Train Type",                  u:""},
    {k:"camType",          l:"Cam Type",                          u:""},
    {k:"locknutSize",      l:"Rocker Arm Locknut Size",           u:""},
    {k:"iValveFace",       l:"Intake Valve Face Diameter",        u:"mm"},
    {k:"iValveStem",       l:"Intake Valve Stem Diameter",        u:"mm"},
    {k:"iValveLift",       l:"Intake Valve Lift",                 u:"mm"},
    {k:"iValveWeight",     l:"Intake Valve Weight",               u:"g"},
    {k:"eValveFace",       l:"Exhaust Valve Face Diameter",       u:"mm"},
    {k:"eValveStem",       l:"Exhaust Valve Stem Diameter",       u:"mm"},
    {k:"eValveLift",       l:"Exhaust Valve Lift",                u:"mm"},
    {k:"eValveWeight",     l:"Exhaust Valve Weight",              u:"g"},
    {k:"springFreeLen",    l:"Valve Spring Free Length",          u:"mm"},
    {k:"springOuterD",     l:"Valve Spring Outer Diameter",       u:"mm"},
    {k:"springWireD",      l:"Valve Spring Wire Diameter",        u:"mm"},
    {k:"springWeight",     l:"Valve Spring Weight",               u:"g"},
    {k:"ccSize",           l:"CC Size / Rating",                  u:"cc"},
    {k:"compression",      l:"Compression",                       u:"PSI"},
    {k:"idleRpm",          l:"Idle RPM (approx)",                 u:"rpm"},
    {k:"wotRpm",           l:"WOT RPM (approx)",                  u:"rpm"},
    {k:"plugType",         l:"Spark Plug Type",                   u:""},
    {k:"intakeValveClear", l:"Intake Valve Clearance",            u:"mm"},
    {k:"exhaustValveClear",l:"Exhaust Valve Clearance",           u:"mm"},
    {k:"intakeValveN",     l:"Valves per Intake",                 u:""},
    {k:"exhaustValveN",    l:"Valves per Exhaust",                u:""},
    {k:"iSpacing",         l:"Intake Stud Center Spacing",        u:"mm"},
    {k:"iStuds",           l:"Intake Studs per Side",             u:""},
    {k:"iBoltSz",          l:"Intake Stud Diameter",              u:""},
    {k:"iBoltLen",         l:"Intake Stud Length",                u:"mm"},
    {k:"eSpacing",         l:"Exhaust Stud Center Spacing",       u:"mm"},
    {k:"eStuds",           l:"Exhaust Studs per Side",            u:""},
    {k:"eBoltSz",          l:"Exhaust Stud Diameter",             u:""},
    {k:"eBoltLen",         l:"Exhaust Stud Length",               u:"mm"},
    {k:"iPW",              l:"Intake Port Width",                 u:"mm"},
    {k:"iPH",              l:"Intake Port Height",                u:"mm"},
    {k:"iPCond",           l:"Intake Port Condition",             u:""},
    {k:"iPNotes",          l:"Intake Port Notes",                 u:""},
    {k:"ePW",              l:"Exhaust Port Width",                u:"mm"},
    {k:"ePH",              l:"Exhaust Port Height",               u:"mm"},
    {k:"ePCond",           l:"Exhaust Port Condition",            u:""},
    {k:"ePNotes",          l:"Exhaust Port Notes",                u:""},
    {k:"pulseLoc",         l:"Pulse Port Location",               u:""},
    {k:"pulsePos",         l:"Pulse Port Position",               u:""},
    {k:"pulseOffset",      l:"Pulse Port Offset from Nearest Edge",u:"mm"},
    {k:"boreDiameter",     l:"Cylinder Bore Diameter",             u:"mm"},
    {k:"ptoDiameter",      l:"PTO Shaft Diameter",                 u:""},
    {k:"shaftType",        l:"Shaft Type",                         u:""},
    {k:"threadDir",        l:"Head Thread Direction",               u:""},
    {k:"threadSize",       l:"Head Thread Size",                    u:""},
    {k:"sprocketType",     l:"Sprocket Type",                       u:""},
    {k:"fuelSystem",       l:"Fuel System",                       u:""},
    {k:"cBrand",           l:"Carb Brand",                        u:""},
    {k:"cType",            l:"Carb Type",                         u:""},
    {k:"cModel",           l:"Carb Model",                        u:""},
    {k:"ecuModel",         l:"ECU Brand / Model",                 u:""},
    {k:"tbDiameter",       l:"Throttle Body Diameter",            u:"mm"},
    {k:"injectorCount",    l:"Fuel Injector Count",               u:""},
    {k:"injectorFlow",     l:"Injector Flow Rate",                u:"cc/min"},
    {k:"fuelRailPressure", l:"Fuel Rail Pressure",                u:"bar"},
    {k:"fuelPumpPressure", l:"Fuel Pump Pressure",                u:"bar"},
    {k:"tpsSensor",        l:"TPS Sensor",                        u:""},
    {k:"mapSensor",        l:"MAP Sensor",                        u:""},
    {k:"iatSensor",        l:"IAT Sensor",                        u:""},
    {k:"o2Sensor",         l:"O2 Sensor",                         u:""},
    {k:"iacSensor",        l:"IAC",                               u:""},
    {k:"cType",            l:"Carb Type",                         u:""},
    {k:"cModel",           l:"Carb Model (optional)",             u:""},
    {k:"notes",            l:"Notes",                             u:""},
    {k:"year",             l:"Year",                              u:""},
    {k:"colour",           l:"Colour",                            u:""},
    {k:"bodyType",         l:"Body Type",                         u:""},
    {k:"driveConfig",      l:"Drive Configuration",               u:""},
    {k:"desc",             l:"Description",                       u:""},
    {k:"pumpBrand",        l:"Pump Brand",                        u:""},
    {k:"pumpModel",        l:"Pump Model",                        u:""},
    {k:"pumpPsi",          l:"Pump Max PSI",                      u:"PSI"},
    {k:"pumpType",         l:"Pump Type",                         u:""},
    {k:"genWatts",         l:"Generator Rated Watts",             u:"W"},
    {k:"genVoltage",       l:"Generator Voltage",                 u:""},
    {k:"genFreq",          l:"Generator Frequency",               u:""},
    {k:"driveType",        l:"Drive Type",                        u:""},
    {k:"chainPitch",       l:"Chain Pitch",                       u:""},
    {k:"frontSprocket",    l:"Front Sprocket",                    u:"teeth"},
    {k:"rearSprocket",     l:"Rear Sprocket",                     u:"teeth"},
    {k:"transType",        l:"Transmission Type",                 u:""},
    {k:"forkType",         l:"Front Suspension Type",             u:""},
    {k:"forkDiameter",     l:"Fork Diameter",                     u:"mm"},
    {k:"rearShockType",    l:"Rear Suspension Type",              u:""},
    {k:"frontBrake",       l:"Front Brake Type",                  u:""},
    {k:"rearBrake",        l:"Rear Brake Type",                   u:""},
    {k:"tyreFront",        l:"Front Tyre Size",                   u:""},
    {k:"tyreRear",         l:"Rear Tyre Size",                    u:""},
    {k:"battVoltage",      l:"Battery Voltage",                   u:""},
    {k:"deckSize",         l:"Deck Size",                         u:"inches"},
    {k:"bladeType",        l:"Blade Type",                        u:""},
    {k:"bladeLength",      l:"Blade Length",                      u:"mm"},
  ];
  const results=!q?[]:machines.map(m=>{
    const hits=FIELDS.filter(f=>{
      const valMatch=(m[f.k]||"").toString().toLowerCase().includes(q);
      const labelMatch=f.l.toLowerCase().includes(q);
      return (valMatch||labelMatch)&&m[f.k];
    });
    const scored=hits.map(f=>({
      ...f,
      score:(m[f.k]||"").toString().toLowerCase().includes(q)?2:1
    })).sort((a,b)=>b.score-a.score);

    // Also search fastener entries
    const fastenerHits=[];
    (m.fasteners||[]).forEach((f,idx)=>{
      const vals=[f.location,f.locOther,f.fType,f.driveType,f.diameter,f.length,f.spacing,f.countPerSide,f.torqueNm?f.torqueNm+"Nm":null,f.torqueFtlb?f.torqueFtlb+"ft-lb":null].filter(Boolean);
      const matchedVals=vals.filter(v=>v.toString().toLowerCase().includes(q));
      if(matchedVals.length){
        fastenerHits.push({
          k:`fastener_${idx}`,
          l:`Fastener: ${f.location==="Other"?f.locOther:f.location||"Unknown"}`,
          u:"",
          value:vals.join(" · "),
          score:2,
          isFastener:true,
          fastenerData:f,
        });
      }
    });

    const allHits=[...scored,...fastenerHits];
    return allHits.length?{m,hits:allHits}:null;
  }).filter(Boolean)
  .sort((a,b)=>{
    const aScore=a.hits.reduce((s,f)=>s+f.score,0);
    const bScore=b.hits.reduce((s,f)=>s+f.score,0);
    return bScore-aScore;
  });

  return (
    <div style={{padding:16,flex:1}}>
      <SL t="Spec Search" />
      <div style={{fontSize:10,color:MUT,marginBottom:12,lineHeight:1.6}}>Search any spec across your inventory — stud spacing, carb brand, plug type, bolt size.</div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <input style={{...inp,fontSize:13}} placeholder="e.g.  28  /  Walbro  /  NGK  /  M5..." value={query} onChange={e=>setQuery(e.target.value)} />
        {query&&<button style={{...btnG,...sm,whiteSpace:"nowrap"}} onClick={()=>setQuery("")}>Clear</button>}
      </div>
      {!q&&machines.length===0&&<Empty t="No machines in inventory yet" />}
      {!q&&machines.length>0&&<div style={{fontSize:10,color:MUT,textAlign:"center",padding:"24px 0",lineHeight:2}}>{machines.length} machine{machines.length!==1?"s":""} in inventory<br /><span style={{fontSize:9}}>Start typing to search</span></div>}
      {q&&results.length===0&&<Empty t={"No matches for \""+query+"\""} />}
      {q&&results.length>0&&(
        <>
          <div style={{fontSize:9,color:MUT,marginBottom:10,letterSpacing:"0.1em"}}>{results.length} match{results.length!==1?"es":""} for "{query}"</div>
          {results.map(({m,hits})=>(
            <div key={m.id} style={{background:SURF,border:"1px solid "+BRD,borderRadius:3,marginBottom:10,padding:"13px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:15}}>{mIcon(m.type)}</span>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:TXT}}>{m.name}</div><div style={{fontSize:9,color:MUT,marginTop:1}}>{[m.make,m.model,m.source].filter(Boolean).join(" · ")}</div></div>
                <StatusBadge status={m.status||"Active"} />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                {hits.map(f=>(
                  f.isFastener
                    ? <div key={f.k} style={{background:"#1a0e00",border:"1px solid #3a2200",borderRadius:2,padding:"6px 9px",gridColumn:"1/-1"}}>
                        <div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:ACC,marginBottom:2}}>{f.l}</div>
                        <div style={{fontSize:11,color:"#e8a060",fontFamily:"'IBM Plex Mono',monospace"}}>{f.value}</div>
                      </div>
                    : <div key={f.k} style={{background:"#1a0e00",border:"1px solid #3a2200",borderRadius:2,padding:"6px 9px"}}>
                        <div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:ACC,marginBottom:2}}>{f.l}</div>
                        <div style={{fontSize:11,color:"#e8a060",fontFamily:"'IBM Plex Mono',monospace"}}>{m[f.k]}{f.u?" "+f.u:""}</div>
                      </div>
                ))}
              </div>
              {FIELDS.filter(f=>m[f.k]&&!hits.find(h=>h.k===f.k)).length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginTop:5}}>
                  {FIELDS.filter(f=>m[f.k]&&!hits.find(h=>h.k===f.k)).map(f=><div key={f.k} style={{background:"#0d0d0d",border:"1px solid "+BRD2,borderRadius:2,padding:"6px 9px"}}><div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:MUT,marginBottom:2}}>{f.l}</div><div style={{fontSize:11,color:"#555",fontFamily:"'IBM Plex Mono',monospace"}}>{m[f.k]}{f.u?" "+f.u:""}</div></div>)}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────






function App(){
  const [tab,setTab]=useState("tracker");
  const [machines,setMachines]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [session,setSession]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  const [profile,setProfile]=useState(null);
  const [profileChecked,setProfileChecked]=useState(false);
  const [passwordReset,setPasswordReset]=useState(false);
  const [company,setCompany]=useState(null);

  // Load data for a given session
  const loadForSession = async(session) => {
    if(!session){
      setSession(null);setProfile(null);setMachines([]);setCompany(null);
      setAuthChecked(true);setProfileChecked(true);setLoading(false);
      return;
    }
    setSession(session);
    setLoading(true);setProfileChecked(false);
    try {
      const {data:profileData} = await supabase
        .from("profiles").select("*").eq("id",session.user.id).single();
      setProfile(profileData||null);
      if(profileData?.company_id){
        const co=await getMyCompany(profileData.company_id);
        setCompany(co);
      }
    } catch(e){ setProfile(null); }
    setProfileChecked(true);
    setAuthChecked(true);
    try {
      const machines = await getMachines();
      setMachines(Array.isArray(machines)?machines:[]);
    } catch(e){ setError("Could not load machines."); }
    setLoading(false);
  };

  useEffect(()=>{
    // Bootstrap from existing session
    supabase.auth.getSession().then(({data:{session}})=>loadForSession(session));
    // Listen for auth changes (login/logout)
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(_event==="PASSWORD_RECOVERY"){
        setPasswordReset(true);
        setSession(session);
        setAuthChecked(true);
        setProfileChecked(true);
        setLoading(false);
        return;
      }
      setPasswordReset(false);
      loadForSession(session);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const signOut=async()=>{
    await supabase.auth.signOut();
    // onAuthStateChange will fire with null session and call loadForSession(null)
    // which resets all state correctly — don't touch state here
  };

  // Auth not yet checked
  if(!authChecked||!profileChecked){
    return (
      <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
        <div style={{fontSize:32}}>🐀</div>
        <div style={{fontSize:11,color:MUT,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"0.1em"}}>Loading...</div>
      </div>
    );
  }

  // Password reset flow
  if(passwordReset) return <PasswordResetScreen onComplete={()=>{setPasswordReset(false);loadForSession(session);}} />;

  // Not logged in
  if(!session) return <AuthScreen />;

  // Logged in but no profile — show onboarding
  if(!profile) return <OnboardingScreen session={session} onComplete={p=>setProfile(p)} />;

  // Loading machines
  if(loading){
    return (
      <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
        <div style={{fontSize:32}}>🐀</div>
        <div style={{fontSize:11,color:MUT,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"0.1em"}}>Loading...</div>
      </div>
    );
  }

  if(error){
    return (
      <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:20}}>
        <div style={{fontSize:32}}>⚠️</div>
        <div style={{fontSize:11,color:RED,fontFamily:"'IBM Plex Mono',monospace",textAlign:"center",lineHeight:1.6,maxWidth:320}}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:BG,color:TXT,fontFamily:"'IBM Plex Mono',monospace",display:"flex",flexDirection:"column"}}>
      <div style={{background:SURF,borderBottom:"2px solid "+ACC,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
        {company?.logo
          ? <img src={company.logo} alt="" style={{width:36,height:36,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD}}/>
          : <span style={{fontSize:20}}>🐀</span>}
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:700,color:ACC,letterSpacing:"0.04em",textTransform:"uppercase"}}>Rat Bench</div>
          {company
            ? <div style={{fontSize:9,color:TXT,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:1}}>{company.name}</div>
            : <div style={{fontSize:9,color:MUT,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:1}}>small engine & equipment repair</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:9,color:MUT,letterSpacing:"0.06em"}}>{profile?.display_name||profile?.username}</span>
          <button onClick={()=>setTab("settings")} style={{...btnG,...sm,fontSize:8}}>⚙️</button>
        </div>
      </div>
      <div style={{display:"flex",background:SURF,borderBottom:"1px solid "+BRD}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:tab===t.id?ACC:MUT,cursor:"pointer",border:"none",background:"none",borderBottom:tab===t.id?"2px solid "+ACC:"2px solid transparent",fontFamily:"'IBM Plex Mono',monospace",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>
      {tab==="tracker" &&<Tracker     machines={machines} setMachines={setMachines} company={company} profile={profile}/>}
      {tab==="jobs"    &&<JobBoard    machines={machines} setMachines={setMachines} />}
      {tab==="search"  &&<SpecSearch  machines={machines} />}
      {tab==="settings"&&<SettingsPage profile={profile} setProfile={setProfile} session={session} company={company} setCompany={setCompany} onSignOut={signOut}/>}
    </div>
  );
}







function WikiApp(){
  const [profile,setProfile]=React.useState(null);
  const raw=window.location.pathname.replace(/^\/+/,"").replace(/\/+$/,"");
  const parts=raw.split("/");
  const slug=parts[0];
  const sub=parts[1];

  const loadProfile=async()=>{
    const{data:{session}}=await supabase.auth.getSession();
    if(!session){setProfile(null);return;}
    const{data}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
    setProfile(data||null);
  };

  React.useEffect(()=>{
    loadProfile();
    const{data:{subscription}}=supabase.auth.onAuthStateChange(()=>loadProfile());
    return()=>subscription.unsubscribe();
  },[]);

  const header=<WikiLoginBar profile={profile} onLogin={loadProfile} onLogout={async()=>{await supabase.auth.signOut();setProfile(null);}}/>;

  if(slug&&sub==="history") return <>{header}<WikiHistoryPage slug={slug}/></>;
  if(slug) return <>{header}<WikiEntryPage slug={slug} profile={profile}/></>;
  return <>{header}<WikiHomePage/></>;
}

const isWiki=window.location.hostname==="wiki.ratbench.net";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>{isWiki?<WikiApp/>:<App/>}</React.StrictMode>
);
