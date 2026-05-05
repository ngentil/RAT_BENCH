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
export const CARB_BRANDS = ["Walbro","Zama","Mikuni","Keihin","Tillotson","Briggs & Stratton","Nikki","Aisan","Teikei","Clone","Other"];
export const CARB_CLONE_BRANDS = ["Ruixing","Farmertec","Sanmin","Generic (unbranded)","Other"];
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
export const STUD_LOCS      = ["Intake","Exhaust","Head","Cylinder base","Crankcase","Side cover","Carburetor","Other"];

export const OIL_BRANDS     = ["Castrol","Motul","Shell","Penrite","Valvoline","Nulon","Gulf","Mobil","Stihl","Husqvarna","Ipone","Silkolene","Amsoil","Ryco","Other"];
export const OIL_SYNTH      = ["Mineral","Semi-synthetic","Full synthetic"];
export const JASO_2T        = ["JASO FA","JASO FB","JASO FC","JASO FD"];
export const JASO_4T        = ["JASO MA","JASO MA1","JASO MA2","JASO MB"];

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

export const OUTBOARD_SHAFT_LENGTHS = ["Short (381mm / 15\")", "Long (508mm / 20\")", "Extra Long (635mm / 25\")", "Ultra Long (762mm / 30\")"];
export const OUTBOARD_TILT_TRIM    = ["Manual tilt", "Power tilt", "Power trim & tilt"];
export const OUTBOARD_STEERING     = ["Tiller handle", "Remote (cable)", "Hydraulic remote"];
export const OUTBOARD_PROP_MAT     = ["Aluminium", "Stainless steel", "Bronze", "Composite / plastic"];
export const OUTBOARD_ANODES       = ["Zinc (saltwater / brackish)", "Aluminium (all water)", "Magnesium (freshwater only)"];
export const OUTBOARD_GEAR_RATIOS  = ["1.83:1","1.92:1","2.00:1","2.08:1","2.15:1","2.27:1","2.33:1","2.50:1","Other"];

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
