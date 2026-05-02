export const MACHINE_TYPES = [
  {icon:"🪚",label:"Chainsaw"},{icon:"🌿",label:"Trimmer"},{icon:"💨",label:"Blower"},
  {icon:"🔫",label:"Pressure Washer"},{icon:"✂️",label:"Hedge Trimmer"},
  {icon:"🔧",label:"Multi-Tool"},{icon:"🌿",label:"Lawnmower"},{icon:"🚜",label:"Ride-on Mower"},
  {icon:"⚡",label:"Generator"},{icon:"🏍️",label:"Motorcycle"},{icon:"🛵",label:"Scooter"},
  {icon:"🛵",label:"Moped"},{icon:"🏍️",label:"Quad Bike"},{icon:"🏎️",label:"Go-kart"},
  {icon:"🚗",label:"Vehicle"},{icon:"🚧",label:"Tracked Machine"},
  {icon:"⛵",label:"Outboard Motor"},{icon:"⚙️",label:"Custom"},
];

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
