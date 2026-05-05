import { getNames } from 'country-list';

const OVERRIDES = {
  "Bolivia (Plurinational State of)": "Bolivia",
  "Congo (the Democratic Republic of the)": "DR Congo",
  "Congo (the)": "Republic of the Congo",
  "Côte d'Ivoire": "Ivory Coast",
  "Iran (Islamic Republic of)": "Iran",
  "Korea (the Democratic People's Republic of)": "North Korea",
  "Korea (the Republic of)": "South Korea",
  "Lao People's Democratic Republic (the)": "Laos",
  "Micronesia (Federated States of)": "Micronesia",
  "Moldova (the Republic of)": "Moldova",
  "Russian Federation (the)": "Russia",
  "Syrian Arab Republic (the)": "Syria",
  "Taiwan (Province of China)": "Taiwan",
  "Tanzania, United Republic of": "Tanzania",
  "Timor-Leste": "East Timor",
  "United Kingdom of Great Britain and Northern Ireland (the)": "United Kingdom",
  "Venezuela (Bolivarian Republic of)": "Venezuela",
  "Viet Nam": "Vietnam",
  "Palestine, State of": "Palestine",
  "North Macedonia": "North Macedonia",
  "Eswatini": "Eswatini",
};

function clean(raw) {
  if (OVERRIDES[raw]) return OVERRIDES[raw];
  return raw
    .replace(/\s*\(the\)\s*/gi, '')
    .replace(/\s*\[.*?\]\s*/g, '')
    .trim();
}

export const COUNTRIES = getNames().map(clean).sort((a, b) => a.localeCompare(b));

// Per-country form config
// biz      = business registration number label
// state    = state/province label (null = hide the field)
// postcode = postcode label
export const COUNTRY_CONFIG = {
  "Australia":        { biz: "ABN",                     state: "State",               postcode: "Postcode" },
  "New Zealand":      { biz: "NZBN",                    state: null,                  postcode: "Postcode" },
  "United States":    { biz: "EIN / Tax ID",            state: "State",               postcode: "ZIP Code" },
  "United Kingdom":   { biz: "Company Reg. No.",        state: null,                  postcode: "Postcode" },
  "Canada":           { biz: "Business Number (BN)",    state: "Province / Territory",postcode: "Postal Code" },
  "Ireland":          { biz: "CRO / VAT No.",           state: null,                  postcode: "Eircode" },
  "South Africa":     { biz: "CIPC Reg. No.",           state: "Province",            postcode: "Postal Code" },
  "Germany":          { biz: "Steuernummer",            state: "State (Bundesland)",  postcode: "Postcode" },
  "France":           { biz: "SIRET / SIREN",           state: "Région",              postcode: "Code Postal" },
  "Japan":            { biz: "Corporate Number",        state: "Prefecture",          postcode: "Postal Code" },
  "Singapore":        { biz: "UEN",                     state: null,                  postcode: "Postal Code" },
  "India":            { biz: "GSTIN / CIN",             state: "State",               postcode: "PIN Code" },
  "Brazil":           { biz: "CNPJ",                    state: "State (Estado)",      postcode: "CEP" },
  "China":            { biz: "Unified Credit Code",     state: "Province",            postcode: "Postcode" },
  "Netherlands":      { biz: "KVK Number",              state: "Province",            postcode: "Postcode" },
  "Sweden":           { biz: "Org. No.",                state: "County (Län)",        postcode: "Postcode" },
  "Norway":           { biz: "Org. No.",                state: "County (Fylke)",      postcode: "Postcode" },
  "Denmark":          { biz: "CVR No.",                 state: "Region",              postcode: "Postcode" },
  "Finland":          { biz: "Business ID (Y-tunnus)",  state: "Region",              postcode: "Postcode" },
  "Switzerland":      { biz: "UID / MwSt-Nr.",          state: "Canton",              postcode: "Postcode" },
  "Austria":          { biz: "Firmenbuchnummer",        state: "State (Bundesland)",  postcode: "Postcode" },
  "Belgium":          { biz: "KBO / BCE No.",           state: "Province",            postcode: "Postcode" },
  "Spain":            { biz: "NIF / CIF",               state: "Province",            postcode: "Postcode" },
  "Portugal":         { biz: "NIPC",                    state: "District",            postcode: "Código Postal" },
  "Italy":            { biz: "P.IVA / Codice Fiscale",  state: "Province",            postcode: "CAP" },
  "Greece":           { biz: "AFM (Tax No.)",           state: "Region",              postcode: "Postcode" },
  "Poland":           { biz: "NIP / KRS",               state: "Voivodeship",         postcode: "Kod Pocztowy" },
  "Czech Republic":   { biz: "IČO",                     state: "Region (Kraj)",       postcode: "Postcode" },
  "Hungary":          { biz: "Adószám",                 state: "County (Megye)",      postcode: "Postcode" },
  "Romania":          { biz: "CUI",                     state: "County (Județ)",      postcode: "Cod Poștal" },
  "United Arab Emirates": { biz: "Trade License No.",  state: "Emirate",             postcode: "Postcode" },
  "Saudi Arabia":     { biz: "CR No.",                  state: "Region",              postcode: "Postcode" },
  "Israel":           { biz: "Company No.",             state: "District",            postcode: "Postcode" },
  "Turkey":           { biz: "Vergi Kimlik No.",        state: "Province",            postcode: "Postcode" },
  "Russia":           { biz: "OGRN / INN",              state: "Oblast / Krai",       postcode: "Postcode" },
  "Mexico":           { biz: "RFC",                     state: "State (Estado)",      postcode: "Código Postal" },
  "Argentina":        { biz: "CUIT",                    state: "Province",            postcode: "Código Postal" },
  "Chile":            { biz: "RUT",                     state: "Region",              postcode: "Código Postal" },
  "Colombia":         { biz: "NIT",                     state: "Department",          postcode: "Código Postal" },
  "Malaysia":         { biz: "ROC / SSM No.",           state: "State",               postcode: "Postcode" },
  "Indonesia":        { biz: "NPWP",                    state: "Province",            postcode: "Kode Pos" },
  "Philippines":      { biz: "TIN",                     state: "Province",            postcode: "Postcode" },
  "Vietnam":          { biz: "MST (Tax Code)",          state: "Province",            postcode: "Postcode" },
  "Pakistan":         { biz: "NTN",                     state: "Province",            postcode: "Postcode" },
  "Nigeria":          { biz: "RC No. (CAC)",            state: "State",               postcode: "Postcode" },
  "Kenya":            { biz: "PIN No.",                 state: "County",              postcode: "Postcode" },
  "Ghana":            { biz: "TIN",                     state: "Region",              postcode: "Postcode" },
  "Monaco":           { biz: "RCI No.",                 state: null,                  postcode: "Postcode" },
};

export const DEFAULT_COUNTRY_CONFIG = {
  biz: "Business Reg. No.",
  state: "State / Province / Region",
  postcode: "Postcode",
};
