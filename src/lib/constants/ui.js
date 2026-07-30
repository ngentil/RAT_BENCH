export const DEFAULT_TILE = ["type","ccSize"];

export const ALL_BADGE_FIELDS = [
  {k:"type",          l:"Machine Type",        s:"Type:",    section:"General",   auto:true},
  {k:"strokeType",    l:"Engine Type",         s:"",         section:"General",   auto:true},
  {k:"rage",          l:"Rage Rating",         s:"",         section:"General",   auto:true},
  {k:"year",          l:"Year",                s:"",         section:"General"},
  {k:"colour",        l:"Colour",              s:"",         section:"General"},
  {k:"bodyType",      l:"Body Type",           s:"",         section:"General"},
  {k:"driveConfig",   l:"Drive Config",        s:"",         section:"General"},
  {k:"source",        l:"Source",              s:"",         section:"General"},
  {k:"ccSize",        l:"CC Size",             s:"CC:",      section:"Engine"},
  {k:"compression",   l:"Compression",         s:"Comp:",    section:"Engine"},
  {k:"idleRpm",       l:"Idle RPM",            s:"Idle:",    section:"Engine"},
  {k:"wotRpm",        l:"WOT RPM",             s:"WOT:",     section:"Engine"},
  {k:"cylCount",      l:"Cylinders",           s:"Cyl:",     section:"Engine"},
  {k:"boreDiameter",  l:"Bore",                s:"Bore:",    section:"Engine"},
  {k:"crankStroke",   l:"Stroke",              s:"Stroke:",  section:"Engine"},
  {k:"coolingType",   l:"Cooling",             s:"",         section:"Engine"},
  {k:"motorPower",    l:"Motor Power",         s:"kW:",      section:"Engine"},
  {k:"motorTorque",   l:"Motor Torque",        s:"Nm:",      section:"Engine"},
  {k:"evRange",       l:"Range",               s:"Range:",   section:"Engine"},
  {k:"plugType",      l:"Plug Type",           s:"Plug:",    section:"Ignition"},
  {k:"plugGap",       l:"Plug Gap",            s:"Gap:",     section:"Ignition"},
  {k:"coilType",      l:"Coil Type",           s:"Coil:",    section:"Ignition"},
  {k:"starterType",   l:"Starter",             s:"Start:",   section:"Starter"},
  {k:"ropeDiameter",  l:"Rope Diameter",       s:"Rope:",    section:"Starter"},
  {k:"fuelSystem",    l:"Fuel System",         s:"Fuel:",    section:"Fuel"},
  {k:"cBrand",        l:"Carb Brand",          s:"Carb:",    section:"Fuel"},
  {k:"cModel",        l:"Carb Model",          s:"",         section:"Fuel"},
  {k:"fuelTankCapacity",l:"Tank Capacity",     s:"Tank:",    section:"Fuel"},
  {k:"mixRatio",      l:"Mix Ratio",           s:"Mix:",     section:"Fuel"},
  {k:"turboFitted",   l:"Turbo",               s:"Turbo:",   section:"Fuel"},
  {k:"turboBoost",    l:"Boost",               s:"Boost:",   section:"Fuel"},
  {k:"chargingType",  l:"Charging",            s:"",         section:"Charging"},
  {k:"chargeVoltage", l:"Charge Voltage",      s:"",         section:"Charging"},
  {k:"chargeAmps",    l:"Charge Amps",         s:"A:",       section:"Charging"},
  {k:"driveType",     l:"Drive Type",          s:"Drive:",   section:"Drivetrain"},
  {k:"transType",     l:"Transmission",        s:"Trans:",   section:"Drivetrain"},
  {k:"gearCount",     l:"Gears",               s:"Gears:",   section:"Drivetrain"},
  {k:"chainPitch",    l:"Chain Pitch",         s:"Chain:",   section:"Drivetrain"},
  {k:"gearboxOilType",l:"Gearbox Oil",         s:"Oil:",     section:"Drivetrain"},
  {k:"forkType",      l:"Front Suspension",    s:"Fork:",    section:"Suspension"},
  {k:"rearShockType", l:"Rear Suspension",     s:"Rear:",    section:"Suspension"},
  {k:"frontBrake",    l:"Front Brake",         s:"F-Brk:",   section:"Brakes"},
  {k:"rearBrake",     l:"Rear Brake",          s:"R-Brk:",   section:"Brakes"},
  {k:"brakeFluidType",l:"Brake Fluid",         s:"BF:",      section:"Brakes"},
  {k:"tyreFront",     l:"Front Tyre",          s:"F:",       section:"Tyres"},
  {k:"tyreRear",      l:"Rear Tyre",           s:"R:",       section:"Tyres"},
  {k:"battVoltage",   l:"Battery Voltage",     s:"Batt:",    section:"Electrics"},
  {k:"batteryCCA",    l:"Battery CCA",         s:"CCA:",     section:"Electrics"},
  {k:"batteryAh",     l:"Battery Ah",          s:"Ah:",      section:"Electrics"},
  {k:"starterMotorType",l:"Starter Motor",     s:"Strt:",    section:"Electrics"},
  {k:"pumpBrand",     l:"Pump Brand",          s:"Pump:",    section:"Pump"},
  {k:"pumpPsi",       l:"Pump PSI",            s:"PSI:",     section:"Pump"},
  {k:"pumpType",      l:"Pump Type",           s:"",         section:"Pump"},
  {k:"genWatts",      l:"Watts",               s:"W:",       section:"Generator"},
  {k:"genVoltage",    l:"Gen Voltage",         s:"V:",       section:"Generator"},
  {k:"deckSize",      l:"Deck Size",           s:"Deck:",    section:"Blade"},
  {k:"bladeType",     l:"Blade Type",          s:"",         section:"Blade"},
  {k:"engineOilGrade",l:"Engine Oil",          s:"Oil:",     section:"Fluids"},
  {k:"engineOilCapacity",l:"Oil Capacity",     s:"",         section:"Fluids"},
  {k:"dryWeight",     l:"Dry Weight",          s:"kg:",      section:"Dimensions"},
  {k:"wheelbase",     l:"Wheelbase",           s:"WB:",      section:"Dimensions"},
  {k:"oilChangeInterval",l:"Oil Interval",     s:"Oil@:",    section:"Service"},
  {k:"majorServiceInterval",l:"Major Service", s:"Svc@:",    section:"Service"},
  {k:"trackedBrand",  l:"Brand",               s:"",         section:"Tracked"},
  {k:"trackedSubtype",l:"Machine Type",        s:"",         section:"Tracked"},
  {k:"operatingWeight",l:"Op. Weight",         s:"",         section:"Tracked"},
  {k:"trackType",     l:"Track Type",          s:"",         section:"Tracked"},
  {k:"hydPumpCount",  l:"Hyd Pumps",           s:"Pumps:",   section:"Tracked"},
];

export const BADGE_PALETTE = [
  ["#2a1200","#e8670a88","#e8670a"],
  ["#0e1a2a","#3a7bd588","#3a7bd5"],
  ["#0e200e","#3d9e5088","#3d9e50"],
  ["#200e0e","#c9404088","#c94040"],
  ["#180e28","#8b5cf688","#a78bfa"],
  ["#201a00","#d4a01788","#d4a017"],
  ["#0e1e1e","#2dd4bf88","#2dd4bf"],
  ["#1a1a1a","#55555588","#888888"],
];

// Site-wide accent-color choices (Settings → Profile → Appearance). A
// separate, larger, more saturated palette from BADGE_PALETTE on purpose —
// tile badges are small text-on-chip elements tuned for legibility at that
// size, while the accent recolors big surfaces (buttons, tab highlights),
// so it can afford to be more vibrant. First entry is the original default,
// kept first so an account that's never chosen one still sees its current
// color highlighted in the grid.
export const ACCENT_PRESETS = [
  "#e8670a", // orange (default)
  "#ef4444", // red
  "#f43f5e", // rose
  "#ec4899", // pink
  "#d946ef", // fuchsia
  "#a855f7", // purple
  "#8b5cf6", // violet
  "#6366f1", // indigo
  "#3b82f6", // blue
  "#0ea5e9", // sky
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#22c55e", // green
  "#84cc16", // lime
  "#eab308", // yellow
  "#f59e0b", // amber
];

export const TILE_COLOR_DEFAULTS = {
  status:"auto", strokeType:"auto", rage:"auto",
  type:4, ccSize:3, compression:1, plugType:2, plugGap:2,
  idleRpm:6, wotRpm:6, starterType:7, fuelSystem:1,
  cBrand:0, cModel:0, driveType:1, chainPitch:1,
  tyreFront:7, tyreRear:7, battVoltage:5, pumpPsi:3,
  pumpBrand:7, genWatts:5, genVoltage:5, deckSize:7,
  bladeType:7, source:7,
};

// "jobs" keeps its id so nobody's saved tab_order/last-tab preference breaks —
// only the label and position change (Bench now leads, ahead of Garage,
// since it replaces the old "Active" status as the actively-worked view).
export const TABS = [
  {id:"jobs",        label:"Bench"},
  {id:"tracker",     label:"Garage"},
  {id:"workshop",    label:"Workshop"},
  {id:"office",      label:"Office"},
  {id:"community",   label:"Community"},
];

export const WORKSHOP_TABS = [
  {id:"reminders",   label:"Remind"},
  {id:"parts",       label:"Parts"},
  {id:"consumables", label:"Consumables"},
  {id:"tools",       label:"Tools"},
  {id:"equipment",   label:"Equipment"},
  {id:"vehicles",    label:"Vehicles"},
  {id:"storage",     label:"Storage"},
  {id:"collected",   label:"Collected"},
];

export const OFFICE_TABS = [
  {id:"clients",     label:"Clients"},
  {id:"revenue",     label:"Revenue"},
  {id:"quotes",      label:"Quotes"},
  {id:"invoices",    label:"Invoices"},
];

export const COMMUNITY_TABS = [
  {id:"wiki",        label:"Wiki"},
  {id:"marketplace", label:"Market"},
  {id:"messages",    label:"Messages"},
];

