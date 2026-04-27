import { jsPDF } from 'jspdf';

export const PDF_SCHEMA=[
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

export function exportMachinePDF(m, svcs, opts){
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
    sf('basic','status','Status',m.status);sf('basic','year','Year',m.year);sf('basic','source','Source',m.source);
    sf('basic','colour','Colour',m.colour);sf('basic','bodyType','Body Type',m.bodyType);sf('basic','driveConfig','Drive Config',m.driveConfig);
    if(iF('basic','desc')&&m.desc)addField("Description",m.desc);
  }

  if(iS('engine')&&(m.strokeType||m.ccSize||m.compression||m.boreDiameter||m.cylCount)){
    addSection("Engine");
    sf('engine','strokeType','Type',m.strokeType);sf('engine','ccSize','CC / Rating',m.ccSize?m.ccSize+"cc":null);
    sf('engine','compression','Compression',m.compression?m.compression+" PSI":null);sf('engine','boreDiameter','Bore',m.boreDiameter?m.boreDiameter+"mm":null);
    sf('engine','idleRpm','Idle RPM',m.idleRpm?m.idleRpm+" rpm":null);sf('engine','wotRpm','WOT RPM',m.wotRpm?m.wotRpm+" rpm":null);
    sf('engine','cylCount','Cylinders',m.cylCount);sf('engine','valveTrain','Valve Train',m.valveTrain);
    sf('engine','coolingType','Cooling',m.coolingType);sf('engine','coolantType','Coolant',m.coolantType?m.coolantType+(m.coolantCapacity?" / "+m.coolantCapacity+"L":""):null);
  }

  if(iS('ignition')&&(m.plugType||m.plugGap||m.coilType)){
    addSection("Ignition");
    sf('ignition','plugType','Plug Type',m.plugType);sf('ignition','plugGap','Plug Gap',m.plugGap?m.plugGap+"mm":null);
    sf('ignition','coilType','Coil Type',m.coilType);sf('ignition','primaryOhms','Primary Coil',m.primaryOhms?m.primaryOhms+"Ω":null);
    sf('ignition','secondaryOhms','Secondary Coil',m.secondaryOhms?m.secondaryOhms+"Ω":null);
  }

  if(iS('starter')&&m.starterType){
    addSection("Starter System");
    sf('starter','starterType','Type',m.starterType);sf('starter','ropeDiameter','Rope Diameter',m.ropeDiameter?m.ropeDiameter+"mm":null);
    sf('starter','ropeLength','Rope Length',m.ropeLength?m.ropeLength+"mm":null);
  }

  if(iS('fuel')&&(m.fuelSystem||m.cBrand||m.fuelTankCapacity||m.ecuModel)){
    addSection("Fuel System");
    sf('fuel','fuelSystem','Delivery',m.fuelSystem);sf('fuel','cBrand','Carb Brand',m.cBrand);sf('fuel','cType','Carb Type',m.cType);
    sf('fuel','cModel','Carb Model',m.cModel);sf('fuel','fuelTankCapacity','Tank Capacity',m.fuelTankCapacity?m.fuelTankCapacity+"L":null);
    sf('fuel','mixRatio','Mix Ratio',m.mixRatio);sf('fuel','ecuModel','ECU',m.ecuModel);sf('fuel','tbDiameter','Throttle Body',m.tbDiameter?m.tbDiameter+"mm":null);
    sf('fuel','injectorCount','Injectors',m.injectorCount?m.injectorCount+(m.injectorFlow?" / "+m.injectorFlow+"cc/min":""):null);
    sf('fuel','fuelRailPressure','Rail Pressure',m.fuelRailPressure?m.fuelRailPressure+" bar":null);sf('fuel','fuelPumpPressure','Pump Pressure',m.fuelPumpPressure?m.fuelPumpPressure+" bar":null);
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
    sf('ports','iPW','Intake Port',m.iPW&&m.iPH?m.iPW+"×"+m.iPH+"mm":null);sf('ports','ePW','Exhaust Port',m.ePW&&m.ePH?m.ePW+"×"+m.ePH+"mm":null);
    sf('ports','iSpacing','Intake Stud Spacing',m.iSpacing?m.iSpacing+" mm":null);sf('ports','iBoltSz','Intake Stud Size',m.iBoltSz?m.iBoltSz+(m.iBoltLen?" / "+m.iBoltLen+"mm":""):null);
    sf('ports','eSpacing','Exhaust Stud Spacing',m.eSpacing?m.eSpacing+" mm":null);sf('ports','eBoltSz','Exhaust Stud Size',m.eBoltSz?m.eBoltSz+(m.eBoltLen?" / "+m.eBoltLen+"mm":""):null);
  }

  if(iS('drivetrain')&&(m.transType||m.driveType||m.chainPitch)){
    addSection("Drivetrain");
    sf('drivetrain','driveType','Drive Type',m.driveType);sf('drivetrain','transType','Transmission',m.transType);sf('drivetrain','gearCount','Gear Count',m.gearCount);
    sf('drivetrain','gearboxBrand','Gearbox Brand',m.gearboxBrand);sf('drivetrain','gearboxOilType','Gearbox Oil',m.gearboxOilType?m.gearboxOilType+(m.gearboxOilCapacity?" / "+m.gearboxOilCapacity+"L":""):null);
    sf('drivetrain','chainPitch','Chain Pitch',m.chainPitch);sf('drivetrain','frontSprocket','Front Sprocket',m.frontSprocket);sf('drivetrain','rearSprocket','Rear Sprocket',m.rearSprocket);
    sf('drivetrain','cvtBeltType','CVT Belt',m.cvtBeltType);
  }

  if(iS('fluids')&&(m.engineOilGrade||m.brakeFluidType||m.diffOilType)){
    addSection("Fluids");
    sf('fluids','engineOilGrade','Engine Oil',m.engineOilGrade?m.engineOilGrade+(m.engineOilCapacity?" / "+m.engineOilCapacity+"L":""):null);
    sf('fluids','brakeFluidType','Brake Fluid',m.brakeFluidType);sf('fluids','diffOilType','Diff Oil',m.diffOilType?m.diffOilType+(m.diffOilCapacity?" / "+m.diffOilCapacity+"L":""):null);
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
    sf('electrics','battVoltage','Battery Voltage',m.battVoltage);sf('electrics','batteryCCA','Battery CCA',m.batteryCCA);sf('electrics','batteryAh','Battery Ah',m.batteryAh);
    sf('electrics','starterMotorType','Starter Motor',m.starterMotorType);sf('electrics','chargingType','Charging',m.chargingType);
    sf('electrics','chargeVoltage','Charge Voltage',m.chargeVoltage?m.chargeVoltage+"V":null);sf('electrics','chargeAmps','Charge Amps',m.chargeAmps?m.chargeAmps+"A":null);
  }

  if(iS('tyres')&&(m.tyreFront||m.tyreRear)){
    addSection("Tyres");
    sf('tyres','tyreFront','Front Tyre',m.tyreFront);sf('tyres','tyreRear','Rear Tyre',m.tyreRear);sf('tyres','rimFront','Front Rim',m.rimFront);sf('tyres','rimRear','Rear Rim',m.rimRear);
  }

  if(iS('notes')&&m.notes){addSection("Notes");if(iF('notes','notes'))addLine(m.notes,9);}

  if(iS('history')&&svcs&&svcs.length>0){
    addSection("Service History");
    svcs.forEach(s=>{
      const d=s.completedAt?new Date(s.completedAt).toLocaleDateString("en-AU"):"-";
      addField(d,(s.types||[]).join(", "));
      if(s.notes)addLine("  "+s.notes,8,false,[80,80,80]);
      y+=1;
    });
  }

  doc.setFontSize(7);doc.setTextColor(120,120,120);
  doc.text("Generated by Rat Bench · ratbench.net · "+new Date().toLocaleDateString("en-AU"),margin,290);
  doc.save((m.name||"machine").replace(/[^a-z0-9]/gi,"_")+"_ratbench.pdf");
}
