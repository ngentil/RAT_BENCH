export const MACHINE_TYPES = [
  {icon:"🪚",label:"Chainsaw"},{icon:"🌿",label:"Trimmer"},{icon:"💨",label:"Blower"},
  {icon:"🔫",label:"Pressure Washer"},{icon:"✂️",label:"Hedge Trimmer"},
  {icon:"🔧",label:"Multi-Tool"},{icon:"🌿",label:"Lawnmower"},{icon:"🚜",label:"Ride-on Mower"},
  {icon:"⚡",label:"Generator"},{icon:"🏍️",label:"Motorcycle"},{icon:"🛵",label:"Scooter"},
  {icon:"🛵",label:"Moped"},{icon:"🏍️",label:"Quad Bike"},{icon:"🏎️",label:"Go-kart"},
  {icon:"🚗",label:"Vehicle"},{icon:"🚧",label:"Tracked Machine"},
  {icon:"⛵",label:"Outboard Motor"},{icon:"⚙️",label:"Custom"},
];

// Context-aware placeholders
export const TYPE_PH = {
  "Chainsaw":            {name:"e.g. Stihl MS250",        make:"e.g. Stihl",      model:"e.g. MS250",       desc:"e.g. Condition on arrival, chain brake issue"},
  "Trimmer":             {name:"e.g. Echo SRM-220BE",     make:"e.g. Echo",       model:"e.g. SRM-220BE",   desc:"e.g. Condition on arrival, runs on full choke"},
  "Blower":              {name:"e.g. Husqvarna 125B",     make:"e.g. Husqvarna",  model:"e.g. 125B",        desc:"e.g. Condition on arrival, no start"},
  "Pressure Washer":     {name:"e.g. Full Boar 3200PSI",  make:"e.g. Full Boar",  model:"e.g. 3200PSI",     desc:"e.g. Condition on arrival, pump issue"},
  "Hedge Trimmer":       {name:"e.g. Echo HC-152",        make:"e.g. Echo",       model:"e.g. HC-152",      desc:"e.g. Condition on arrival, blade damage"},
  "Multi-Tool":          {name:"e.g. Ferrex PMF3300",     make:"e.g. Ferrex",     model:"e.g. PMF3300",     desc:"e.g. Condition on arrival, fault description"},
  "Lawnmower":           {name:"e.g. Honda HRX217",       make:"e.g. Honda",      model:"e.g. HRX217",      desc:"e.g. Condition on arrival, self-drive issue"},
  "Ride-on Mower":       {name:"e.g. John Deere X350",    make:"e.g. John Deere", model:"e.g. X350",        desc:"e.g. Condition on arrival, deck engagement fault"},
  "Generator":           {name:"e.g. Gentrax 2kW",        make:"e.g. Gentrax",    model:"e.g. 2kW",         desc:"e.g. Condition on arrival, output issues"},
  "Motorcycle":          {name:"e.g. Honda CB125",        make:"e.g. Honda",      model:"e.g. CB125",       desc:"e.g. Condition on arrival, fault description, mileage"},
  "Scooter":             {name:"e.g. Yamaha NMAX 155",    make:"e.g. Yamaha",     model:"e.g. NMAX 155",    desc:"e.g. Condition on arrival, fault description"},
  "Moped":               {name:"e.g. Honda Ruckus",       make:"e.g. Honda",      model:"e.g. Ruckus",      desc:"e.g. Condition on arrival, fault description"},
  "Quad Bike":           {name:"e.g. Yamaha YFZ450",      make:"e.g. Yamaha",     model:"e.g. YFZ450",      desc:"e.g. Condition on arrival, fault description"},
  "Go-kart":             {name:"e.g. Rotax 125",          make:"e.g. Rotax",      model:"e.g. 125",         desc:"e.g. Condition on arrival, fault description"},
  "Jet Ski / PWC":       {name:"e.g. Sea-Doo GTI 130",   make:"e.g. Sea-Doo",    model:"e.g. GTI 130",     desc:"e.g. Condition on arrival, impeller issue"},
  "Cement Mixer":        {name:"e.g. Belle Minimix 150",  make:"e.g. Belle",      model:"e.g. Minimix 150", desc:"e.g. Condition on arrival, drum fault"},
  "Air Compressor":      {name:"e.g. Pilot 50L",          make:"e.g. Pilot",      model:"e.g. 50L",         desc:"e.g. Condition on arrival, pressure issue"},
  "Tiller / Cultivator": {name:"e.g. Honda FG110",        make:"e.g. Honda",      model:"e.g. FG110",       desc:"e.g. Condition on arrival, tine issue"},
  "Water Pump":          {name:"e.g. Davey 3HP",          make:"e.g. Davey",      model:"e.g. 3HP",         desc:"e.g. Condition on arrival, priming issue"},
  "Outboard Motor":      {name:"e.g. Tohatsu 6HP",        make:"e.g. Tohatsu",    model:"e.g. 6HP",         desc:"e.g. Condition on arrival, water pump issue"},
  "Snowblower":          {name:"e.g. Ariens Classic 24",  make:"e.g. Ariens",     model:"e.g. Classic 24",  desc:"e.g. Condition on arrival, auger fault"},
  "Log Splitter":        {name:"e.g. Boss 7T",            make:"e.g. Boss",       model:"e.g. 7T",          desc:"e.g. Condition on arrival, hydraulic issue"},
  "Vehicle":             {name:"e.g. Toyota Hilux SR5",   make:"e.g. Toyota",     model:"e.g. Hilux SR5",   desc:"e.g. Condition on arrival, fault description"},
  "Tracked Machine":     {name:"e.g. Komatsu PC130",      make:"e.g. Komatsu",    model:"e.g. PC130",       desc:"e.g. Condition on arrival, fault description"},
  "Custom":              {name:"e.g. Machine name",       make:"e.g. Brand",      model:"e.g. Model",       desc:"e.g. Condition on arrival, fault description"},
};
export const getPH = (t,f) => (TYPE_PH[t]||TYPE_PH["Custom"])[f];

// Machine type groupings for section visibility
export const HANDHELD    = ["Chainsaw","Trimmer","Blower","Hedge Trimmer","Multi-Tool"];
export const WHEELED     = ["Lawnmower","Ride-on Mower"];
export const MOTO        = ["Motorcycle","Scooter","Moped","Quad Bike","Go-kart","Jet Ski / PWC"];
export const VEHICLE     = ["Vehicle"];
export const TRACKED     = ["Tracked Machine"];
export const isCustom      = t => t==="Custom";
export const isVehicle     = t => t==="Vehicle";
export const isTracked     = t => t==="Tracked Machine";
export const isOutboard    = t => t==="Outboard Motor";
export const showForCustom = (sec, cs) => cs===null||cs===undefined||cs.includes(sec);
export const ALL_SECTIONS  = ["Engine","Ignition System","Starter System","Port Dimensions","Output Shaft / PTO","Fuel System","Fastener Specs","Pump","Generator Output","Drivetrain","Suspension","Brakes","Tyres","Electrics","Blade / Deck","Notes"];
export const ALL_TYPES   = [...HANDHELD,...WHEELED,"Pressure Washer","Generator",...MOTO,"Vehicle","Tracked Machine","Outboard Motor","Custom"];

export const showPTO        = (t,cs) => isCustom(t) ? showForCustom("Output Shaft / PTO",cs) : !MOTO.includes(t)&&!isVehicle(t)&&!isTracked(t)&&!isOutboard(t);
export const showPump       = (t,cs) => isCustom(t) ? showForCustom("Pump",cs) : t==="Pressure Washer";
export const showGenOutput  = (t,cs) => isCustom(t) ? showForCustom("Generator Output",cs) : t==="Generator";
export const showDrivetrain = (t,cs) => isCustom(t) ? showForCustom("Drivetrain",cs) : [...MOTO,"Ride-on Mower","Vehicle"].includes(t);
export const showSuspension = (t,cs) => isCustom(t) ? showForCustom("Suspension",cs) : [...MOTO,"Vehicle"].includes(t);
export const showBrakes     = (t,cs) => isCustom(t) ? showForCustom("Brakes",cs) : [...MOTO,"Ride-on Mower","Vehicle"].includes(t);
export const showTyres      = (t,cs) => isCustom(t) ? showForCustom("Tyres",cs) : [...MOTO,"Ride-on Mower","Lawnmower","Vehicle"].includes(t);
export const showElectrics  = (t,cs) => isCustom(t) ? showForCustom("Electrics",cs) : [...MOTO,"Generator","Vehicle","Tracked Machine","Outboard Motor"].includes(t);
export const showBlade      = (t,cs) => isCustom(t) ? showForCustom("Blade / Deck",cs) : ["Lawnmower","Ride-on Mower"].includes(t);

// Vehicle-specific export constants
export const BODY_TYPES_VEHICLE = ["Sedan","Hatchback","Wagon","SUV","Ute / Pickup","Van","Coupe","Convertible","People Mover","Other"];
export const BODY_TYPES_MOTO    = ["Naked","Sports / Supersport","Cruiser","Touring","Adventure / Dual Sport","Dirt / Enduro","Scooter","Other"];
export const DRIVE_CONFIGS      = ["2WD (FWD)","2WD (RWD)","4WD","AWD","Part-time 4WD"];
export const VEHICLE_MAKES = ["Toyota","Ford","Holden","Mazda","Mitsubishi","Nissan","Subaru","Honda","Hyundai","Kia","Volkswagen","BMW","Mercedes-Benz","Audi","Jeep","Land Rover","Volvo","Isuzu","LDV","Ram","Dodge","Chevrolet","Fiat","Alfa Romeo","Peugeot","Renault","Citroen","Skoda","SEAT","Other"];
export const COMMON_COLOURS = ["White","Silver","Grey","Black","Red","Blue","Navy","Green","Yellow","Orange","Brown","Beige","Cream","Gold","Bronze","Purple","Maroon","Champagne","Other"];
export const CHAINSAW_CHAIN_PITCHES = ["1/4\"","0.325\"","3/8\" (low profile)","3/8\"","0.404\""];
export const CHAINSAW_GAUGES        = ["1.1mm","1.3mm","1.5mm","1.6mm"];
export const SPROCKET_STYLES        = ["Spur","Rim"];
export const BAR_MOUNT_TYPES        = ["Standard (large)","Narrow (small)","Other"];
export const TRACKED_BRANDS    = ["Komatsu","Caterpillar","Kubota","Bobcat","Volvo","Hitachi","Doosan","JCB","Takeuchi","Yanmar","Case","John Deere","Wacker Neuson","Mecalac","Other"];
export const TRACKED_SUBTYPES  = ["Excavator","Mini Excavator","Dozer","Crawler Loader","Skid Steer","Compact Track Loader","Grader","Articulated Dump Truck","Rigid Dump Truck","Trencher","Pipelayer","Dragline","Other"];
export const OPERATING_WEIGHTS = ["1T","1.5T","2T","3T","5T","8T","10T","14T","20T","30T","50T+","Other"];
export const TRACK_TYPES       = ["Rubber","Steel"];
export const HYD_PUMP_COUNTS   = ["1","2","3","4","5+"];
export const HYD_PUMP_TYPES    = ["Gear","Piston","Vane","Tandem Gear","Tandem Piston","Other"];
export const RAM_LOCATIONS     = ["Boom","Arm / Stick","Bucket","Blade","Thumb","Tilt","Swing","Outrigger","Dozer Blade","Ripper","Other"];
export const COOLING_TYPES     = ["Air cooled","Liquid cooled","Oil cooled","Air + Oil cooled"];
export const TURBO_TYPES       = ["Turbocharger","Supercharger","Twin Turbo","Turbo + Supercharger"];
export const CHARGING_TYPES    = ["Alternator","Magneto","Stator","Dynamo","None"];
export const CHARGE_VOLTAGES   = ["6V","12V","24V","48V"];
export const RECT_REG         = ["Yes","No"];
export const BELT_TYPES        = ["V-Belt","Flat Belt","Toothed / Timing","Poly-V","Raw Edge V-Belt","Other"];
export const ATTACH_TYPES      = ["Bucket","Blade","Scraper","Trenching Bucket","Grading Bucket","Rock Bucket","Auger","Hammer / Breaker","Grapple","Ripper","Compactor","Thumb","Quick Hitch","Rake","Tilt Rotator","Other"];
export const SOURCES     = ["Client Owned","Own","Found","Facebook Marketplace","Friend","Gumtree","Other"];
export const STATUSES    = ["Active","Queued","Complete"];
export const SCOL        = {Active:"#e8670a",Queued:"#3a7bd5",Complete:"#3d9e50"};
export const SBG_        = {Active:"#2a1200",Queued:"#0e1a2a",Complete:"#0e2410"};
export const SVC_CATEGORIES = [
  {id:"filters",    label:"Filters",
    items:["Air filter","Fuel filter","Oil filter","Hydraulic filter","Cabin air filter","Other"],
    show:(t,s)=>true},
  {id:"ignition",   label:"Ignition",
    items:(t,s)=>s==="Diesel"?["Glow plug","Ignition coil","Coil pack","Other"]:s==="Electric"?[]:["Spark plug","Ignition coil","Coil pack","HT lead","Distributor cap","Rotor button","Other"],
    show:(t,s)=>s!=="Electric"},
  {id:"fuel",       label:"Fuel System",
    items:(t,s)=>s==="Electric"?[]:s==="Diesel"?["Injector service","Fuel pump","Fuel filter","Fuel lines","Throttle body clean","Other"]:["Carb clean","Carb rebuild","Fuel lines","Primer bulb","Fuel pump","Injector service","Throttle body clean","Other"],
    show:(t,s)=>s!=="Electric"},
  {id:"lube",       label:"Lubrication",
    items:["Oil change","Gearbox oil","Diff oil","Grease nipples","Chain lube","Other"],
    show:(t,s)=>s!=="Electric"},
  {id:"cooling",    label:"Cooling",
    items:["Coolant flush","Thermostat","Water pump","Radiator flush","Hoses","Other"],
    show:(t,s)=>true},
  {id:"belts",      label:"Belts & Drive",
    items:["Drive belt","Timing belt / chain","Clutch","Chain & sprocket","Other"],
    show:(t,s)=>s!=="Electric"&&s!=="2-stroke"},
  {id:"brakes",     label:"Brakes",
    items:["Brake pads","Brake shoes","Brake fluid","Discs / rotors","Drums","Brake cables","Other"],
    show:(t,s)=>["Vehicle","Motorcycle","Scooter","Moped","Quad Bike","Go-kart","Ride-on Mower","Tracked Machine"].includes(t)},
  {id:"electrical", label:"Electrical",
    items:(t,s)=>s==="Electric"?["Battery pack","Motor service","Controller","Charging system","Wiring","Lights","Other"]:["Battery","Starter motor","Alternator","Fuses","Wiring","Lights","Other"],
    show:(t,s)=>true},
  {id:"engine",     label:"Engine",
    items:["Piston / rings","Cylinder","Valves","Head gasket","Bearings","Seals","Other"],
    show:(t,s)=>s!=="Electric"},
  {id:"hydraulics", label:"Hydraulics",
    items:["Hydraulic oil change","Ram seal","Pump service","Filter","Hoses","Other"],
    show:(t,s)=>t==="Tracked Machine"},
  {id:"undercarriage",label:"Undercarriage",
    items:["Track replacement","Track tension","Sprocket","Idler","Roller","Other"],
    show:(t,s)=>t==="Tracked Machine"},
  {id:"outboard",   label:"Outboard",
    items:["Impeller replacement","Lower unit oil change","Gear oil check","Sacrificial anode","Zincs replacement","Thermostat","Water pump housing","Cooling flush","Prop service","Trim & tilt service","Fuel VST service","Fuel primer bulb","Fuel lines","Gear shift cable","Throttle cable","Corrosion inhibitor spray","Steering service","Other"],
    show:(t,s)=>t==="Outboard Motor"},
  {id:"chainsaw",   label:"Chainsaw",
    items:["Chain sharpen","Chain replace","Guide bar flip / replace","Bar oil refill","Chain tension adjust","Chain brake service","Clutch service","Oiler / bar oil pump","Decompression valve","Bumper spike / dog","Handle / vibration mounts","Throttle trigger service","Anti-vibe springs","Other"],
    show:(t,s)=>t==="Chainsaw"},
  {id:"general",    label:"General",
    items:["General service","Inspection","Clean & detail","Other"],
    show:(t,s)=>true},
];
export const CARB_BRANDS = ["Walbro","Zama","Briggs & Stratton","Keihin","Mikuni","Tillotson","Other"];
export const CARB_TYPES  = ["Diaphragm","Float Bowl"];
export const CARB_BOLTS  = ["M4 – 4mm ⌀","M5 – 5mm ⌀","M6 – 6mm ⌀","M8 – 8mm ⌀","M10 – 10mm ⌀"];
export const EXH_BOLTS   = ["M4","M5","M6","M7","M8","M10","M12"];
export const RECOIL_BOLTS = ["M4","M5","M6","M7","M8","M10","M12"];
export const RECOIL_COUNTS = ["1","2","3","4","5","6","7","8"];
export const VALVE_COUNTS   = ["1","2","3","4","5"];
export const PULSE_LOC      = ["Manifold face","Crankcase","Separate fitting"];
export const PULSE_POS      = ["Above intake port","Below intake port","Left of intake port","Right of intake port"];
export const PORT_CONDITION   = ["Stock","Modified"];
export const SHAFT_TYPES     = ["Straight","Curved","Split/Detachable"];
export const THREAD_DIR      = ["Left hand (standard)","Right hand"];
export const THREAD_SIZES    = ["M8","M10","M12","M14","M16","Other"];
export const PTO_DIAMETERS   = ["19mm","22mm","24mm","25mm","25.4mm (1 inch)","28mm","30mm","Other"];
export const SPROCKET_TYPES  = ["Splined","Keyed","Other"];
export const CYLINDER_COUNTS = ["1","2","3","4","5","6","7","8","9","10","11","12"];
export const VALVE_TRAIN     = ["Pushrod (OHV)","OHC","DOHC"];
export const CAM_TYPES       = ["Stock","Reground","Aftermarket"];
export const LOCKNUT_SIZES   = ["M5","M6","M7","M8","M10","M12"];
export const SENSOR_STATUS   = ["Present","Not present"];
export const INJECTOR_COUNTS = ["1","2","3","4","5","6","7","8","9","10","11","12"];
export const STARTER_TYPES   = ["Recoil only","Electric / key start only","Recoil + electric","Manual crank"];
export const DRIVE_TYPES     = ["Hex head (spanner/socket)","Allen / Hex socket","Torx / Star","Phillips","JIS","Pozidrive","Flathead / Slotted","Square / Robertson","Spanner / Snake eyes"];
export const FASTENER_TYPES  = ["Stud","Bolt"];
export const FASTENER_LOCS   = ["Intake manifold","Exhaust manifold","Cylinder head","Head cover / Valve cover","Cylinder base","Crankcase","Crankcase cover","Oil drain plug","Oil fill plug","Spark plug","Recoil housing","Starter motor","Carburettor mount","Air filter housing","Fuel tank","Ignition coil","Flywheel cover","Side cover","Bottom cover","Guard / Shroud","Clutch cover","Gearbox","Drive shaft","Sprocket","PTO shaft","Engine mount","Front axle","Rear axle","Other"];
export const BOLT_DIAMETERS  = ["M4","M5","M6","M7","M8","M10","M12","M14","M16"];
export const CHAIN_PITCHES   = ["415","420","428","520","525","530","Other"];
export const TRANS_TYPES     = ["Manual","Automatic","CVT","DCT","Semi-auto / Paddle shift","None"];
export const CLUTCH_TYPES    = ["Single plate dry","Twin plate dry","Multi-plate wet","Centrifugal","Other"];
export const CVT_BELT_TYPES  = ["Belt","Chain"];
export const FORK_TYPES      = ["Telescopic fork","USD","Leading link","None"];
export const SHOCK_TYPES     = ["Monoshock","Twin shock","None"];
export const BRAKE_TYPES     = ["Disc","Drum","None"];
export const BLADE_TYPES     = ["Standard","Mulching","3-in-1"];
export const PUMP_TYPES      = ["Axial","Triplex","Wobble"];
export const INLET_SIZES     = ["1/2 inch","3/4 inch","1 inch"];
export const OUTLET_SIZES    = ["1/4 inch","3/8 inch","1/2 inch"];
export const VOLTAGE_OPTIONS = ["6V","12V"];
export const FRAME_TYPES     = ["Backbone","Twin spar","Trellis","Tubular","Monocoque"];
export const COIL_TYPES      = ["Single coil (primary only)","Primary + Secondary"];
export const ENG_BOLTS   = ["M4","M5","M6","M8","M10"];
export const ENG_COUNTS  = ["1","2","3","4","5","6"];
export const STUD_N      = ["0","1","2","3","4","5","6","7","8","9","10"];
export const RAGE_LBL    = ["","barely","annoying","proper pain","nearly quit","absolute nightmare"];
export const STUD_LOCS      = ["Intake","Exhaust","Head","Cylinder base","Crankcase","Side cover","Other"];
// tile field defs: k=field key, l=label, s=short prefix for tile, types=machine types that show it (null=all)
export const TILE_FIELDS = [
  {k:"status",       l:"Status badge",        s:"",          types:null},
  {k:"strokeType",   l:"2T / 4T badge",       s:"",          types:null},
  {k:"year",         l:"Year",                s:"",          types:null},
  {k:"ccSize",       l:"CC size",             s:"",          types:null},
  {k:"compression",  l:"Compression",         s:"Comp:",     types:null},
  {k:"plugType",     l:"Spark plug type",     s:"Plug:",     types:null},
  {k:"plugGap",      l:"Plug gap",            s:"Gap:",      types:null},
  {k:"idleRpm",      l:"Idle RPM",            s:"Idle:",     types:null},
  {k:"wotRpm",       l:"WOT RPM",             s:"WOT:",      types:null},
  {k:"starterType",  l:"Starter",             s:"Start:",    types:null},
  {k:"fuelSystem",   l:"Fuel system",         s:"Fuel:",     types:null},
  {k:"cBrand",       l:"Carb brand",          s:"Carb:",     types:null},
  {k:"cModel",       l:"Carb model",          s:"",          types:null},
  {k:"driveType",    l:"Drive type",          s:"Drive:",    types:["Motorcycle","Scooter","Moped","Quad Bike","Go-kart","Jet Ski / PWC","Ride-on Mower"]},
  {k:"chainPitch",   l:"Chain pitch",         s:"Chain:",    types:["Motorcycle","Scooter","Moped","Quad Bike","Go-kart"]},
  {k:"tyreFront",    l:"Front tyre",          s:"F-tyre:",   types:["Motorcycle","Scooter","Moped","Quad Bike","Go-kart","Ride-on Mower","Lawnmower"]},
  {k:"tyreRear",     l:"Rear tyre",           s:"R-tyre:",   types:["Motorcycle","Scooter","Moped","Quad Bike","Go-kart","Ride-on Mower","Lawnmower"]},
  {k:"battVoltage",  l:"Battery voltage",     s:"Batt:",     types:["Motorcycle","Scooter","Moped","Quad Bike","Go-kart","Generator"]},
  {k:"pumpPsi",      l:"Pump PSI",            s:"PSI:",      types:["Pressure Washer"]},
  {k:"pumpBrand",    l:"Pump brand",          s:"Pump:",     types:["Pressure Washer"]},
  {k:"genWatts",     l:"Generator watts",     s:"Watts:",    types:["Generator"]},
  {k:"genVoltage",   l:"Generator voltage",   s:"V:",        types:["Generator"]},
  {k:"deckSize",     l:"Deck size",           s:"Deck:",     types:["Lawnmower","Ride-on Mower"]},
  {k:"bladeType",    l:"Blade type",          s:"Blade:",    types:["Lawnmower","Ride-on Mower"]},
  {k:"colour",       l:"Colour",              s:"",          types:["Vehicle","Motorcycle","Scooter","Moped","Quad Bike"]},
  {k:"bodyType",     l:"Body Type",           s:"",          types:["Vehicle","Motorcycle","Scooter","Moped"]},
  {k:"driveConfig",  l:"Drive Config",        s:"Drive:",    types:["Vehicle"]},
  {k:"obShaftLength",    l:"Shaft length",        s:"Shaft:",    types:["Outboard Motor"]},
  {k:"obPropPitch",     l:"Prop pitch",          s:"Pitch:",    types:["Outboard Motor"]},
  {k:"obPropDiameter",  l:"Prop diameter",       s:"Prop:",     types:["Outboard Motor"]},
  {k:"obGearRatio",     l:"Gear ratio",          s:"Ratio:",    types:["Outboard Motor"]},
  {k:"obAnodeMaterial", l:"Anode material",      s:"Anode:",    types:["Outboard Motor"]},
  {k:"source",       l:"Source",              s:"",          types:null},
  {k:"rage",         l:"Rage rating ☠️",       s:"",          types:null},
];
export const DEFAULT_TILE = ["status","strokeType","ccSize"];

// All possible badge fields — every spec that can be shown as a tile badge
// k=field key, l=label, s=short prefix, section=grouping label
export const ALL_BADGE_FIELDS = [
  // Always available
  {k:"status",        l:"Status",              s:"",         section:"General",   auto:true},
  {k:"strokeType",    l:"Engine Type",         s:"",         section:"General",   auto:true},
  {k:"rage",          l:"Rage Rating",         s:"",         section:"General",   auto:true},
  {k:"year",          l:"Year",                s:"",         section:"General"},
  {k:"colour",        l:"Colour",              s:"",         section:"General"},
  {k:"bodyType",      l:"Body Type",           s:"",         section:"General"},
  {k:"driveConfig",   l:"Drive Config",        s:"",         section:"General"},
  {k:"source",        l:"Source",              s:"",         section:"General"},
  // Engine
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
  // Ignition
  {k:"plugType",      l:"Plug Type",           s:"Plug:",    section:"Ignition"},
  {k:"plugGap",       l:"Plug Gap",            s:"Gap:",     section:"Ignition"},
  {k:"coilType",      l:"Coil Type",           s:"Coil:",    section:"Ignition"},
  // Starter
  {k:"starterType",   l:"Starter",             s:"Start:",   section:"Starter"},
  {k:"ropeDiameter",  l:"Rope Diameter",       s:"Rope:",    section:"Starter"},
  // Fuel
  {k:"fuelSystem",    l:"Fuel System",         s:"Fuel:",    section:"Fuel"},
  {k:"cBrand",        l:"Carb Brand",          s:"Carb:",    section:"Fuel"},
  {k:"cModel",        l:"Carb Model",          s:"",         section:"Fuel"},
  {k:"fuelTankCapacity",l:"Tank Capacity",     s:"Tank:",    section:"Fuel"},
  {k:"mixRatio",      l:"Mix Ratio",           s:"Mix:",     section:"Fuel"},
  {k:"turboFitted",   l:"Turbo",               s:"Turbo:",   section:"Fuel"},
  {k:"turboBoost",    l:"Boost",               s:"Boost:",   section:"Fuel"},
  // Charging
  {k:"chargingType",  l:"Charging",            s:"",         section:"Charging"},
  {k:"chargeVoltage", l:"Charge Voltage",      s:"",         section:"Charging"},
  {k:"chargeAmps",    l:"Charge Amps",         s:"A:",       section:"Charging"},
  // Drivetrain
  {k:"driveType",     l:"Drive Type",          s:"Drive:",   section:"Drivetrain"},
  {k:"transType",     l:"Transmission",        s:"Trans:",   section:"Drivetrain"},
  {k:"gearCount",     l:"Gears",               s:"Gears:",   section:"Drivetrain"},
  {k:"chainPitch",    l:"Chain Pitch",         s:"Chain:",   section:"Drivetrain"},
  {k:"gearboxOilType",l:"Gearbox Oil",         s:"Oil:",     section:"Drivetrain"},
  // Suspension
  {k:"forkType",      l:"Front Suspension",    s:"Fork:",    section:"Suspension"},
  {k:"rearShockType", l:"Rear Suspension",     s:"Rear:",    section:"Suspension"},
  // Brakes
  {k:"frontBrake",    l:"Front Brake",         s:"F-Brk:",   section:"Brakes"},
  {k:"rearBrake",     l:"Rear Brake",          s:"R-Brk:",   section:"Brakes"},
  {k:"brakeFluidType",l:"Brake Fluid",         s:"BF:",      section:"Brakes"},
  // Tyres
  {k:"tyreFront",     l:"Front Tyre",          s:"F:",       section:"Tyres"},
  {k:"tyreRear",      l:"Rear Tyre",           s:"R:",       section:"Tyres"},
  // Electrics
  {k:"battVoltage",   l:"Battery Voltage",     s:"Batt:",    section:"Electrics"},
  {k:"batteryCCA",    l:"Battery CCA",         s:"CCA:",     section:"Electrics"},
  {k:"batteryAh",     l:"Battery Ah",          s:"Ah:",      section:"Electrics"},
  {k:"starterMotorType",l:"Starter Motor",     s:"Strt:",    section:"Electrics"},
  // Pump
  {k:"pumpBrand",     l:"Pump Brand",          s:"Pump:",    section:"Pump"},
  {k:"pumpPsi",       l:"Pump PSI",            s:"PSI:",     section:"Pump"},
  {k:"pumpType",      l:"Pump Type",           s:"",         section:"Pump"},
  // Generator
  {k:"genWatts",      l:"Watts",               s:"W:",       section:"Generator"},
  {k:"genVoltage",    l:"Gen Voltage",         s:"V:",       section:"Generator"},
  // Blade/Deck
  {k:"deckSize",      l:"Deck Size",           s:"Deck:",    section:"Blade"},
  {k:"bladeType",     l:"Blade Type",          s:"",         section:"Blade"},
  // Fluids
  {k:"engineOilGrade",l:"Engine Oil",          s:"Oil:",     section:"Fluids"},
  {k:"engineOilCapacity",l:"Oil Capacity",     s:"",         section:"Fluids"},
  // Dimensions
  {k:"dryWeight",     l:"Dry Weight",          s:"kg:",      section:"Dimensions"},
  {k:"wheelbase",     l:"Wheelbase",           s:"WB:",      section:"Dimensions"},
  // Service
  {k:"oilChangeInterval",l:"Oil Interval",     s:"Oil@:",    section:"Service"},
  {k:"majorServiceInterval",l:"Major Service", s:"Svc@:",    section:"Service"},
  // Tracked
  {k:"trackedBrand",  l:"Brand",               s:"",         section:"Tracked"},
  {k:"trackedSubtype",l:"Machine Type",        s:"",         section:"Tracked"},
  {k:"operatingWeight",l:"Op. Weight",         s:"",         section:"Tracked"},
  {k:"trackType",     l:"Track Type",          s:"",         section:"Tracked"},
  {k:"hydPumpCount",  l:"Hyd Pumps",           s:"Pumps:",   section:"Tracked"},
];

// Badge colour palette: [bg, border, text]
export const BADGE_PALETTE = [
  ["#2a1200","#e8670a88","#e8670a"],  // 0 orange
  ["#0e1a2a","#3a7bd588","#3a7bd5"],  // 1 blue
  ["#0e200e","#3d9e5088","#3d9e50"],  // 2 green
  ["#200e0e","#c9404088","#c94040"],  // 3 red
  ["#180e28","#8b5cf688","#a78bfa"],  // 4 purple
  ["#201a00","#d4a01788","#d4a017"],  // 5 yellow
  ["#0e1e1e","#2dd4bf88","#2dd4bf"],  // 6 teal
  ["#1a1a1a","#55555588","#888888"],  // 7 grey
];

// Default palette index per field key (auto = handled by existing logic)
export const TILE_COLOR_DEFAULTS = {
  status:"auto", strokeType:"auto", rage:"auto",
  ccSize:7, compression:1, plugType:2, plugGap:2,
  idleRpm:6, wotRpm:6, starterType:7, fuelSystem:1,
  cBrand:0, cModel:0, driveType:1, chainPitch:1,
  tyreFront:7, tyreRear:7, battVoltage:5, pumpPsi:3,
  pumpBrand:7, genWatts:5, genVoltage:5, deckSize:7,
  bladeType:7, source:7,
};

// Expanded view field config
export const EXPAND_SECTIONS = [
  {k:"photos",       l:"Photos",                     types:null},
  {k:"desc",         l:"Description",                types:null},
  {k:"strokeType",   l:"Engine Type",                types:null},
  {k:"cylCount",     l:"Cylinder Count",             types:null},
  {k:"ccSize",       l:"CC Size / Rating",           types:null},
  {k:"compression",  l:"Compression",                types:null},
  {k:"plugType",     l:"Spark / Glow Plug Type",     types:null},
  {k:"plugGap",      l:"Plug Gap / Glow Resistance", types:null},
  {k:"coilType",     l:"Coil Type",                  types:null},
  {k:"primaryOhms",  l:"Coil Resistance",            types:null},
  {k:"starterType",  l:"Starter System",             types:null},
  {k:"ropeDiameter", l:"Starter Rope",               types:null},
  {k:"rBoltN",       l:"Recoil Bolts",               types:null},
  {k:"valveTrain",   l:"Valve Train",                types:["4-stroke"]},
  {k:"intakeValveClear",l:"Valve Clearances",        types:["4-stroke"]},
  {k:"iValveFace",   l:"Intake Valve Dims",          types:["4-stroke"]},
  {k:"eValveFace",   l:"Exhaust Valve Dims",         types:["4-stroke"]},
  {k:"springFreeLen",l:"Valve Springs",              types:["4-stroke"]},
  {k:"fasteners",    l:"Fastener Specs",             types:null},
  {k:"iPW",          l:"Port Dimensions",            types:null},
  {k:"pulseLoc",     l:"Pulse Port",                 types:["2-stroke"]},
  {k:"boreDiameter", l:"Cylinder Bore",              types:null},
  {k:"ptoDiameter",  l:"PTO / Output Shaft",         types:null},
  {k:"fuelSystem",   l:"Fuel System",                types:null},
  {k:"cBrand",       l:"Carb Details",               types:null},
  {k:"ecuModel",     l:"ECU / EFI Details",          types:null},
  {k:"tpsSensor",    l:"Sensors",                    types:null},
  {k:"driveType",    l:"Drivetrain",                 types:["Motorcycle","Scooter","Moped","Quad Bike","Go-kart","Jet Ski / PWC","Ride-on Mower"]},
  {k:"forkType",     l:"Suspension",                 types:["Motorcycle","Scooter","Moped","Quad Bike","Go-kart","Jet Ski / PWC"]},
  {k:"frontBrake",   l:"Brakes",                     types:["Motorcycle","Scooter","Moped","Quad Bike","Go-kart","Ride-on Mower"]},
  {k:"tyreFront",    l:"Tyres",                      types:["Motorcycle","Scooter","Moped","Quad Bike","Go-kart","Ride-on Mower","Lawnmower"]},
  {k:"battVoltage",  l:"Electrics",                  types:["Motorcycle","Scooter","Moped","Quad Bike","Go-kart","Generator"]},
  {k:"pumpBrand",    l:"Pump Details",               types:["Pressure Washer"]},
  {k:"genWatts",     l:"Generator Output",           types:["Generator"]},
  {k:"deckSize",     l:"Blade / Deck",               types:["Lawnmower","Ride-on Mower"]},
  {k:"lighting",     l:"Lighting",                   types:null},
  {k:"notes",        l:"Notes",                      types:null},
  {k:"serviceHistory",l:"Service History",           types:null},
];
export const DEFAULT_EXPAND = EXPAND_SECTIONS.map(f=>f.k);
export const getExpandFields = (type, strokeType) => EXPAND_SECTIONS.filter(f=>{
  if(!f.types) return true;
  return f.types.includes(type)||f.types.includes(strokeType);
});
export const getTileFields = (type) => TILE_FIELDS.filter(f=>!f.types||f.types.includes(type));

export const TABS        = [{id:"tracker",label:"📋 Tracker"},{id:"jobs",label:"🗂 Jobs"},{id:"search",label:"🔍 Search"},{id:"wiki",label:"📖 Wiki"}];
export const LIGHT_LOCATIONS = [
  "Headlights","Tail Lights","Indicators","Brake Lights",
  "Reverse Lights","Trailer Lights","Auxiliary / Work Lights",
  "Dash / Interior","Other"
];
export const LIGHT_TYPES = [
  "Halogen","LED","HID / Xenon","Sealed Beam",
  "Sealed LED Unit","Incandescent","Fluorescent","Other"
];
export const LIGHT_VOLTAGES = ["12V","24V"];
export const OUTBOARD_SHAFT_LENGTHS = ["Short (381mm / 15\")", "Long (508mm / 20\")", "Extra Long (635mm / 25\")", "Ultra Long (762mm / 30\")"];
export const OUTBOARD_TILT_TRIM    = ["Manual tilt", "Power tilt", "Power trim & tilt"];
export const OUTBOARD_STEERING     = ["Tiller handle", "Remote (cable)", "Hydraulic remote"];
export const OUTBOARD_PROP_MAT     = ["Aluminium", "Stainless steel", "Bronze", "Composite / plastic"];
export const OUTBOARD_ANODES       = ["Zinc (saltwater / brackish)", "Aluminium (all water)", "Magnesium (freshwater only)"];
export const OUTBOARD_GEAR_RATIOS  = ["1.83:1","1.92:1","2.00:1","2.08:1","2.15:1","2.27:1","2.33:1","2.50:1","Other"];

export const LIGHT_PLUGS = [
  "H1","H3","H4","H7","H8","H9","H11","H13",
  "9005 / HB3","9006 / HB4","9012 / HIR2",
  "T10 / 194 / W5W","T15 / 921","BA9s","BAU15s",
  "BA15s","BAY15d / 1157","P21W / 1156","P21/5W",
  "PY21W","W21W","W21/5W","WY5W",
  "Deutsch DT 2-pin","Deutsch DT 4-pin",
  "Weatherpack 2-pin","Weatherpack 4-pin",
  "Superseal 1-pin","Superseal 2-pin",
  "Molex Mini-Fit","Anderson SB50",
  "Pigtail / Bare Wire","Other"
];

export const RESERVED_USERNAMES = new Set([
  "admin","administrator","admins","administration",
  "moderator","mod","mods","staff","support","help",
  "ratbench","rat_bench","ratbench_admin","ratbench_support",
  "root","superuser","sysadmin","system","bot","robot",
  "official","team","info","contact","security","abuse",
  "null","undefined","anonymous","guest","user","username",
  "owner","master","webmaster","postmaster","hostmaster",
]);

export const BEARING_LOCATIONS = [
  "Main Bearing — Left (Mag side)",
  "Main Bearing — Right (PTO side)",
  "Main Bearing — Centre",
  "Big End (Conrod)",
  "Small End (Gudgeon Pin)",
  "Camshaft",
  "Balance Shaft",
  "Layshaft / Countershaft",
  "Output Shaft",
  "Transmission Input Shaft",
  "Transmission Output Shaft",
  "Wheel — Front",
  "Wheel — Rear",
  "Steering Head",
  "Swingarm Pivot",
  "Other",
];
export const BEARING_TYPES = [
  "Ball bearing",
  "Roller bearing",
  "Needle roller",
  "Plain shell / big-end",
  "Taper roller",
  "Thrust bearing",
  "Bronze bush",
];
