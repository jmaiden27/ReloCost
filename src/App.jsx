import { Analytics } from "@vercel/analytics/react";
import { useState, useCallback, useRef } from "react";


const STATES = {
  AL: { name: "Alabama", tax: 0.05, propRate: 0.004, ins: 1200 },
  AK: { name: "Alaska", tax: 0.0, propRate: 0.0119, ins: 1040 },
  AZ: { name: "Arizona", tax: 0.025, propRate: 0.0062, ins: 1230 },
  AR: { name: "Arkansas", tax: 0.047, propRate: 0.0063, ins: 1840 },
  CA: { name: "California", tax: 0.093, propRate: 0.0073, ins: 1620 },
  CO: { name: "Colorado", tax: 0.044, propRate: 0.0049, ins: 1490 },
  CT: { name: "Connecticut", tax: 0.0699, propRate: 0.0215, ins: 1730 },
  DE: { name: "Delaware", tax: 0.066, propRate: 0.0057, ins: 940 },
  FL: { name: "Florida", tax: 0.0, propRate: 0.0097, ins: 2380 },
  GA: { name: "Georgia", tax: 0.055, propRate: 0.009, ins: 1620 },
  HI: { name: "Hawaii", tax: 0.0825, propRate: 0.0028, ins: 1200 },
  ID: { name: "Idaho", tax: 0.058, propRate: 0.0063, ins: 890 },
  IL: { name: "Illinois", tax: 0.0495, propRate: 0.0227, ins: 1490 },
  IN: { name: "Indiana", tax: 0.0323, propRate: 0.0085, ins: 1250 },
  IA: { name: "Iowa", tax: 0.06, propRate: 0.0151, ins: 1220 },
  KS: { name: "Kansas", tax: 0.057, propRate: 0.0132, ins: 2340 },
  KY: { name: "Kentucky", tax: 0.045, propRate: 0.0083, ins: 1810 },
  LA: { name: "Louisiana", tax: 0.0425, propRate: 0.0054, ins: 2480 },
  ME: { name: "Maine", tax: 0.0715, propRate: 0.0113, ins: 980 },
  MD: { name: "Maryland", tax: 0.0575, propRate: 0.0106, ins: 1190 },
  MA: { name: "Massachusetts", tax: 0.05, propRate: 0.0124, ins: 1700 },
  MI: { name: "Michigan", tax: 0.0425, propRate: 0.0143, ins: 1350 },
  MN: { name: "Minnesota", tax: 0.0985, propRate: 0.0105, ins: 1540 },
  MS: { name: "Mississippi", tax: 0.05, propRate: 0.0065, ins: 1780 },
  MO: { name: "Missouri", tax: 0.054, propRate: 0.0097, ins: 1740 },
  MT: { name: "Montana", tax: 0.059, propRate: 0.0083, ins: 1220 },
  NE: { name: "Nebraska", tax: 0.0664, propRate: 0.0151, ins: 2030 },
  NV: { name: "Nevada", tax: 0.0, propRate: 0.0053, ins: 1000 },
  NH: { name: "New Hampshire", tax: 0.0, propRate: 0.0204, ins: 1010 },
  NJ: { name: "New Jersey", tax: 0.0897, propRate: 0.0247, ins: 1310 },
  NM: { name: "New Mexico", tax: 0.059, propRate: 0.0077, ins: 1210 },
  NY: { name: "New York", tax: 0.0685, propRate: 0.0172, ins: 1450 },
  NC: { name: "North Carolina", tax: 0.0525, propRate: 0.0077, ins: 1510 },
  ND: { name: "North Dakota", tax: 0.029, propRate: 0.0098, ins: 1580 },
  OH: { name: "Ohio", tax: 0.04, propRate: 0.0153, ins: 1200 },
  OK: { name: "Oklahoma", tax: 0.0475, propRate: 0.0089, ins: 2730 },
  OR: { name: "Oregon", tax: 0.099, propRate: 0.0094, ins: 800 },
  PA: { name: "Pennsylvania", tax: 0.0307, propRate: 0.0153, ins: 1060 },
  RI: { name: "Rhode Island", tax: 0.0599, propRate: 0.0153, ins: 1250 },
  SC: { name: "South Carolina", tax: 0.07, propRate: 0.0057, ins: 1480 },
  SD: { name: "South Dakota", tax: 0.0, propRate: 0.0117, ins: 1580 },
  TN: { name: "Tennessee", tax: 0.0, propRate: 0.0068, ins: 1740 },
  TX: { name: "Texas", tax: 0.0, propRate: 0.018, ins: 2090 },
  UT: { name: "Utah", tax: 0.0485, propRate: 0.0058, ins: 850 },
  VT: { name: "Vermont", tax: 0.0875, propRate: 0.0194, ins: 990 },
  VA: { name: "Virginia", tax: 0.0575, propRate: 0.0082, ins: 1140 },
  WA: { name: "Washington", tax: 0.0, propRate: 0.0093, ins: 1090 },
  WV: { name: "West Virginia", tax: 0.065, propRate: 0.0058, ins: 1020 },
  WI: { name: "Wisconsin", tax: 0.0765, propRate: 0.0154, ins: 1020 },
  WY: { name: "Wyoming", tax: 0.0, propRate: 0.0061, ins: 1330 },
  DC: { name: "Washington D.C.", tax: 0.0895, propRate: 0.0085, ins: 1210 },
};

const FEDERAL_BRACKETS_SINGLE = [
  [11600, 0.1],
  [47150, 0.12],
  [100525, 0.22],
  [191950, 0.24],
  [243725, 0.32],
  [609350, 0.35],
  [Infinity, 0.37],
];
const FEDERAL_BRACKETS_MFJ = [
  [23200, 0.1],
  [94300, 0.12],
  [201050, 0.22],
  [383900, 0.24],
  [487450, 0.32],
  [731200, 0.35],
  [Infinity, 0.37],
];
const STANDARD_DEDUCTION = { single: 14600, mfj: 29200, hoh: 21900 };

function calcFederalTax(gross, filing) {
  const b = filing === "mfj" ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
  const taxable = Math.max(0, gross - STANDARD_DEDUCTION[filing]);
  let tax = 0,
    prev = 0;
  for (const [top, rate] of b) {
    if (taxable <= prev) break;
    tax += (Math.min(taxable, top) - prev) * rate;
    prev = top;
  }
  return tax;
}
function calcFICA(g) {
  return (
    Math.min(g, 160200) * 0.062 +
    g * 0.0145 +
    (g > 200000 ? (g - 200000) * 0.009 : 0)
  );
}
function calcMortgage(p, r, y) {
  if (!p || p <= 0) return 0;
  const m = r / 100 / 12,
    n = y * 12;
  if (m === 0) return p / n;
  return (p * m * Math.pow(1 + m, n)) / (Math.pow(1 + m, n) - 1);
}
function estPropTax(v, s) {
  return (v * (STATES[s]?.propRate || 0.011)) / 12;
}
function estIns(v, s) {
  return ((STATES[s]?.ins || 1400) * Math.sqrt(v / 300000)) / 12;
}
function calcTakeHome(g, s, f) {
  const fed = calcFederalTax(g, f),
    st = g * (STATES[s]?.tax || 0),
    fica = calcFICA(g);
  return { takeHome: g - fed - st - fica, fed, state: st, fica };
}
const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
const pct = (n) => (n * 100).toFixed(2) + "%";
const num = (v) => parseFloat(v) || 0;

const TABS = ["Current", "New Home", "Income", "Summary"];

async function fetchAssessorInfo(address, stateName) {
  const prompt = `A user wants to look up property tax records for this address: "${address}, ${stateName}".
1. Identify the county this address is likely in.
2. Find the official county assessor or property tax search website for that county.
3. Return a JSON object with exactly these fields:
   - "county": the county name
   - "assessorUrl": the direct URL to the county assessor's property search page (must be a real government website)
   - "instructions": one short sentence telling the user what to do on that page.
Return ONLY valid JSON, no markdown, no explanation.`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".07em",
        textTransform: "uppercase",
        color: "#5a6a40",
        marginBottom: 4,
      }}
    >
      {label}
    </label>
    {children}
    {hint && (
      <div style={{ fontSize: 11, color: "#9aaa80", marginTop: 4 }}>{hint}</div>
    )}
  </div>
);

const TextInput = ({
  value,
  onChange,
  prefix,
  step,
  type = "number",
  placeholder,
}) => (
  <div style={{ position: "relative" }}>
    {prefix && (
      <span
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#3a4a20",
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        {prefix}
      </span>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      step={step}
      placeholder={placeholder}
      style={{
        width: "100%",
        background: "#fff",
        border: "none",
        borderBottom: "2px solid #c8d880",
        padding: prefix ? "11px 12px 11px 26px" : "11px 12px",
        fontSize: 15,
        color: "#1a2a08",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color .2s",
      }}
      onFocus={(e) => (e.target.style.borderBottomColor = "#7ab800")}
      onBlur={(e) => (e.target.style.borderBottomColor = "#c8d880")}
    />
  </div>
);

const SelectInput = ({ value, onChange, options }) => (
  <div style={{ position: "relative" }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        background: "#fff",
        border: "none",
        borderBottom: "2px solid #c8d880",
        padding: "11px 32px 11px 12px",
        fontSize: 14,
        color: "#1a2a08",
        outline: "none",
        cursor: "pointer",
        appearance: "none",
        boxSizing: "border-box",
      }}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
    <span
      style={{
        position: "absolute",
        right: 12,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#7ab800",
        pointerEvents: "none",
        fontSize: 12,
      }}
    >
      ▾
    </span>
  </div>
);

const Btn = ({ children, onClick, secondary, full, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: disabled ? "#d8e8a0" : secondary ? "transparent" : "#7ab800",
      color: disabled ? "#a0b860" : secondary ? "#5a7a20" : "#fff",
      border: secondary ? "2px solid #c8d880" : "none",
      borderRadius: 8,
      padding: "13px 24px",
      fontSize: 14,
      fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      width: full ? "100%" : "auto",
      letterSpacing: ".04em",
      transition: "all .15s",
    }}
  >
    {children}
  </button>
);

const DeltaChip = ({ value, label }) => {
  const pos = value >= 0;
  return (
    <div
      style={{
        background: pos ? "#e8f8c0" : "#fde8e8",
        borderRadius: 10,
        padding: "14px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          color: pos ? "#5a8a10" : "#c03030",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: pos ? "#4a7a00" : "#b02020",
        }}
      >
        {pos ? "+" : ""}
        {fmt(value)}
      </div>
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <div
    style={{
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: ".1em",
      textTransform: "uppercase",
      color: "#7ab800",
      marginBottom: 18,
      marginTop: 8,
      paddingBottom: 6,
      borderBottom: "2px solid #e8f4b0",
    }}
  >
    {children}
  </div>
);

function AssessorLookup({ stateCode }) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const handleLookup = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const info = await fetchAssessorInfo(address, STATES[stateCode]?.name);
      setResult(info);
    } catch (e) {
      setError(
        "Couldn't find assessor info — try adding your city or county to the address.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "22px 18px",
        marginBottom: 16,
        boxShadow: "0 2px 12px rgba(100,140,0,.08)",
      }}
    >
      <SectionTitle>Look Up Property Tax</SectionTitle>
      <Field label="Property Address" hint="Include city for best results">
        <TextInput
          type="text"
          value={address}
          onChange={setAddress}
          placeholder="123 Main St, Springfield"
        />
      </Field>
      <Btn onClick={handleLookup} disabled={loading || !address.trim()} full>
        {loading ? "Finding assessor…" : "Find County Assessor →"}
      </Btn>
      {loading && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              border: "2px solid #c8d880",
              borderTopColor: "#7ab800",
              borderRadius: "50%",
              animation: "spin .8s linear infinite",
            }}
          />
          <span style={{ fontSize: 13, color: "#7a9a50" }}>
            Searching for the right assessor website…
          </span>
        </div>
      )}
      {result && (
        <div
          style={{
            marginTop: 16,
            background: "#f4f8e8",
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#5a8a10",
              textTransform: "uppercase",
              letterSpacing: ".06em",
              marginBottom: 6,
            }}
          >
            {result.county}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#3a5020",
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            {result.instructions}
          </div>
          <a
            href={result.assessorUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#7ab800",
              borderRadius: 8,
              padding: "11px 14px",
              textDecoration: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <span>Open {result.county} Assessor</span>
            <span>↗</span>
          </a>
          <div style={{ fontSize: 11, color: "#9aaa80", marginTop: 10 }}>
            Once you find the annual tax, divide by 12 and enter it in the
            Property Tax field above.
          </div>
        </div>
      )}
      {error && (
        <div
          style={{
            marginTop: 14,
            background: "#fff4f0",
            borderRadius: 8,
            padding: "12px 14px",
            fontSize: 13,
            color: "#c04040",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [stubName, setStubName] = useState(null);
  const fileRef = useRef();

  const [cur, setCur] = useState({
    state: "CA",
    homeValue: "",
    mortgageBalance: "",
    mortgageRate: 6.5,
    mortgageYearsLeft: 25,
    propTax: "",
    ins: "",
    hoa: "",
  });
  const [nw, setNw] = useState({
    state: "TX",
    homeValue: "",
    downPayment: "",
    mortgageRate: 7.1,
    loanYears: 30,
    propTax: "",
    ins: "",
    hoa: "",
  });
  const [inc, setInc] = useState({ gross: "", filing: "single" });

  const cM = calcMortgage(
    num(cur.mortgageBalance),
    num(cur.mortgageRate),
    num(cur.mortgageYearsLeft),
  );
  const cT =
    cur.propTax !== ""
      ? num(cur.propTax)
      : estPropTax(num(cur.homeValue), cur.state);
  const cI =
    cur.ins !== "" ? num(cur.ins) : estIns(num(cur.homeValue), cur.state);
  const cH = num(cur.hoa);
  const cHousing = cM + cT + cI + cH;
  const cTax = calcTakeHome(num(inc.gross), cur.state, inc.filing);
  const cNet = cTax.takeHome / 12 - cHousing;

  const loan = num(nw.homeValue) - num(nw.downPayment);
  const nM = calcMortgage(loan, num(nw.mortgageRate), num(nw.loanYears));
  const nT =
    nw.propTax !== ""
      ? num(nw.propTax)
      : estPropTax(num(nw.homeValue), nw.state);
  const nI = nw.ins !== "" ? num(nw.ins) : estIns(num(nw.homeValue), nw.state);
  const nH = num(nw.hoa);
  const nHousing = nM + nT + nI + nH;
  const nTax = calcTakeHome(num(inc.gross), nw.state, inc.filing);
  const nNet = nTax.takeHome / 12 - nHousing;

  const netDiff = nNet - cNet;
  const housingDiff = nHousing - cHousing;
  const taxDiff = nTax.takeHome - cTax.takeHome;

  const stateOpts = Object.entries(STATES).map(([k, v]) => [
    k,
    `${v.name} (${k})`,
  ]);
  const filingOpts = [
    ["single", "Single"],
    ["mfj", "Married Filing Jointly"],
    ["hoh", "Head of Household"],
  ];

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setStubName(file.name);
    const text = await file.text().catch(() => "");
    const up = text.toUpperCase();
    const gm = up.match(
      /GROSS\s*(?:PAY|EARNINGS|WAGES)?\s*[:\$]?\s*([\d,]+\.?\d*)/,
    );
    const ym = up.match(/YTD\s*(?:GROSS)?\s*[:\$]?\s*([\d,]+\.?\d*)/);
    const parse = (m) => (m ? parseFloat(m[1].replace(/,/g, "")) : null);
    const g = parse(gm),
      y = parse(ym);
    if (g && y && y > g) {
      const p = Math.round(y / g);
      const c = [52, 26, 24, 12, 4, 2, 1].reduce((a, b) =>
        Math.abs(b - p) < Math.abs(a - p) ? b : a,
      );
      setInc((i) => ({ ...i, gross: String(Math.round(g * c)) }));
    } else if (g) setInc((i) => ({ ...i, gross: String(Math.round(g * 26)) }));
  }, []);

  const card = {
    background: "#fff",
    borderRadius: 14,
    padding: "22px 18px",
    marginBottom: 16,
    boxShadow: "0 2px 12px rgba(100,140,0,.08)",
  };

  return (
    <>
    <Analytics |>
      
      <div
        style={{
          fontFamily: "system-ui,-apple-system,sans-serif",
          background: "#f4f8e8",
          minHeight: "100vh",
          color: "#1a2a08",
        }}
      >
        <style>{`*,*::before,*::after{box-sizing:border-box;}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.pg{animation:fadeUp .25s ease forwards}select option{background:#fff}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <div style={{ background: "#1a2a08", padding: "18px 20px 0" }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 2,
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#c8f040",
                  letterSpacing: "-.02em",
                }}
              >
                ReloCost
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#7a9a50",
                  letterSpacing: ".05em",
                }}
              >
                RELOCATION CALCULATOR
              </span>
            </div>
            <div style={{ display: "flex", marginTop: 14 }}>
              {TABS.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTab(i)}
                  style={{
                    flex: 1,
                    padding: "10px 4px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                    background: "transparent",
                    border: "none",
                    borderBottom:
                      tab === i ? "3px solid #c8f040" : "3px solid transparent",
                    color: tab === i ? "#c8f040" : "#6a8a50",
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 40px" }}
        >
          {tab === 0 && (
            <div className="pg">
              <div style={card}>
                <SectionTitle>Current Home</SectionTitle>
                <Field label="State">
                  <SelectInput
                    value={cur.state}
                    onChange={(v) => setCur({ ...cur, state: v })}
                    options={stateOpts}
                  />
                </Field>
                <Field label="Home Value">
                  <TextInput
                    value={cur.homeValue}
                    onChange={(v) => setCur({ ...cur, homeValue: v })}
                    prefix="$"
                    placeholder="e.g. 650000"
                  />
                </Field>
                <Field label="Mortgage Balance">
                  <TextInput
                    value={cur.mortgageBalance}
                    onChange={(v) => setCur({ ...cur, mortgageBalance: v })}
                    prefix="$"
                    placeholder="e.g. 520000"
                  />
                </Field>
                <Field label="Interest Rate (%)">
                  <TextInput
                    value={cur.mortgageRate}
                    onChange={(v) => setCur({ ...cur, mortgageRate: v })}
                    step="0.05"
                  />
                </Field>
                <Field label="Years Remaining">
                  <TextInput
                    value={cur.mortgageYearsLeft}
                    onChange={(v) => setCur({ ...cur, mortgageYearsLeft: v })}
                    step="1"
                  />
                </Field>
              </div>
              <div style={card}>
                <SectionTitle>Monthly Costs</SectionTitle>
                <Field
                  label="Property Tax / mo"
                  hint={
                    cur.propTax === ""
                      ? `Estimated: ${fmt(estPropTax(num(cur.homeValue), cur.state))} (${pct(STATES[cur.state]?.propRate || 0)} rate)`
                      : undefined
                  }
                >
                  <TextInput
                    value={cur.propTax}
                    onChange={(v) => setCur({ ...cur, propTax: v })}
                    prefix="$"
                    placeholder="Leave blank to estimate"
                  />
                </Field>
                <Field
                  label="Insurance / mo"
                  hint={
                    cur.ins === ""
                      ? `Estimated: ${fmt(estIns(num(cur.homeValue), cur.state))}`
                      : undefined
                  }
                >
                  <TextInput
                    value={cur.ins}
                    onChange={(v) => setCur({ ...cur, ins: v })}
                    prefix="$"
                    placeholder="Leave blank to estimate"
                  />
                </Field>
                <Field label="HOA / mo">
                  <TextInput
                    value={cur.hoa}
                    onChange={(v) => setCur({ ...cur, hoa: v })}
                    prefix="$"
                    placeholder="0 if none"
                  />
                </Field>
              </div>
              <AssessorLookup stateCode={cur.state} />
              <div style={{ ...card, background: "#1a2a08" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".07em",
                    textTransform: "uppercase",
                    color: "#7ab800",
                    marginBottom: 12,
                  }}
                >
                  Current Monthly Snapshot
                </div>
                {[
                  ["Mortgage P&I", cM],
                  ["Property Tax", cT],
                  ["Insurance", cI],
                  ["HOA", cH],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: "1px solid #2a3a18",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#9ab880" }}>{l}</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#e0f0a0",
                      }}
                    >
                      {fmt(v)}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0 0",
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}
                  >
                    Total Housing
                  </span>
                  <span
                    style={{ fontSize: 16, fontWeight: 800, color: "#c8f040" }}
                  >
                    {fmt(cHousing)}/mo
                  </span>
                </div>
              </div>
              <Btn onClick={() => setTab(1)} full>
                Next: New Home →
              </Btn>
            </div>
          )}

          {tab === 1 && (
            <div className="pg">
              <div style={card}>
                <SectionTitle>New Property</SectionTitle>
                <Field label="Target State">
                  <SelectInput
                    value={nw.state}
                    onChange={(v) => setNw({ ...nw, state: v })}
                    options={stateOpts}
                  />
                </Field>
                <Field label="Purchase Price">
                  <TextInput
                    value={nw.homeValue}
                    onChange={(v) => setNw({ ...nw, homeValue: v })}
                    prefix="$"
                    placeholder="e.g. 420000"
                  />
                </Field>
                <Field
                  label="Down Payment"
                  hint={
                    nw.homeValue && nw.downPayment
                      ? `${((num(nw.downPayment) / num(nw.homeValue)) * 100).toFixed(1)}% down · Loan: ${fmt(loan)}`
                      : undefined
                  }
                >
                  <TextInput
                    value={nw.downPayment}
                    onChange={(v) => setNw({ ...nw, downPayment: v })}
                    prefix="$"
                    placeholder="e.g. 84000"
                  />
                </Field>
                <Field label="Interest Rate (%)">
                  <TextInput
                    value={nw.mortgageRate}
                    onChange={(v) => setNw({ ...nw, mortgageRate: v })}
                    step="0.05"
                  />
                </Field>
                <Field label="Loan Term (Years)">
                  <TextInput
                    value={nw.loanYears}
                    onChange={(v) => setNw({ ...nw, loanYears: v })}
                    step="5"
                  />
                </Field>
              </div>
              <div style={card}>
                <SectionTitle>Monthly Costs</SectionTitle>
                <Field
                  label="Property Tax / mo"
                  hint={
                    nw.propTax === ""
                      ? `Estimated: ${fmt(estPropTax(num(nw.homeValue), nw.state))} (${pct(STATES[nw.state]?.propRate || 0)} rate)`
                      : undefined
                  }
                >
                  <TextInput
                    value={nw.propTax}
                    onChange={(v) => setNw({ ...nw, propTax: v })}
                    prefix="$"
                    placeholder="Leave blank to estimate"
                  />
                </Field>
                <Field
                  label="Insurance / mo"
                  hint={
                    nw.ins === ""
                      ? `Estimated: ${fmt(estIns(num(nw.homeValue), nw.state))}`
                      : undefined
                  }
                >
                  <TextInput
                    value={nw.ins}
                    onChange={(v) => setNw({ ...nw, ins: v })}
                    prefix="$"
                    placeholder="Leave blank to estimate"
                  />
                </Field>
                <Field label="HOA / mo">
                  <TextInput
                    value={nw.hoa}
                    onChange={(v) => setNw({ ...nw, hoa: v })}
                    prefix="$"
                    placeholder="0 if none"
                  />
                </Field>
              </div>
              <AssessorLookup stateCode={nw.state} />
              <div style={{ ...card, background: "#1a2a08" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".07em",
                    textTransform: "uppercase",
                    color: "#7ab800",
                    marginBottom: 12,
                  }}
                >
                  Housing Comparison
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 4,
                    marginBottom: 8,
                  }}
                >
                  {["Item", "Current", "New"].map((h) => (
                    <div
                      key={h}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#5a7a30",
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                        textAlign: h === "Item" ? "left" : "right",
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>
                {[
                  ["Mortgage", cM, nM],
                  ["Prop Tax", cT, nT],
                  ["Insurance", cI, nI],
                  ["HOA", cH, nH],
                ].map(([l, c, n]) => (
                  <div
                    key={l}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 4,
                      padding: "6px 0",
                      borderBottom: "1px solid #2a3a18",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#9ab880" }}>{l}</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#c0d890",
                        textAlign: "right",
                      }}
                    >
                      {fmt(c)}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#e0f0a0",
                        fontWeight: 600,
                        textAlign: "right",
                      }}
                    >
                      {fmt(n)}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 4,
                    padding: "10px 0 0",
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#c0d890",
                      textAlign: "right",
                    }}
                  >
                    {fmt(cHousing)}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#c8f040",
                      textAlign: "right",
                    }}
                  >
                    {fmt(nHousing)}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn secondary onClick={() => setTab(0)}>
                  ← Back
                </Btn>
                <div style={{ flex: 1 }}>
                  <Btn onClick={() => setTab(2)} full>
                    Next: Income →
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {tab === 2 && (
            <div className="pg">
              <div style={card}>
                <SectionTitle>Income Details</SectionTitle>
                <Field
                  label="Pay Stub Upload"
                  hint="Optional — parsed locally, nothing leaves your device"
                >
                  <div
                    onClick={() => fileRef.current.click()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFile(e.dataTransfer.files[0]);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      border: "2px dashed #c8d880",
                      borderRadius: 8,
                      padding: "18px 12px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "border-color .2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#7ab800")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "#c8d880")
                    }
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.txt,.csv"
                      style={{ display: "none" }}
                      onChange={(e) => handleFile(e.target.files[0])}
                    />
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                    <div
                      style={{
                        fontSize: 13,
                        color: stubName ? "#4a7a00" : "#7a9a60",
                        fontWeight: stubName ? 700 : 400,
                      }}
                    >
                      {stubName || "Tap to upload pay stub"}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#aac070", marginTop: 4 }}
                    >
                      PDF or text
                    </div>
                  </div>
                </Field>
                <Field label="Gross Annual Income" hint="Pre-tax salary">
                  <TextInput
                    value={inc.gross}
                    onChange={(v) => setInc({ ...inc, gross: v })}
                    prefix="$"
                    placeholder="e.g. 145000"
                  />
                </Field>
                <Field label="Filing Status">
                  <SelectInput
                    value={inc.filing}
                    onChange={(v) => setInc({ ...inc, filing: v })}
                    options={filingOpts}
                  />
                </Field>
              </div>
              <div style={{ ...card, background: "#1a2a08" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".07em",
                    textTransform: "uppercase",
                    color: "#7ab800",
                    marginBottom: 12,
                  }}
                >
                  Tax Comparison
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 4,
                    marginBottom: 8,
                  }}
                >
                  {["Tax", "Current", "New"].map((h) => (
                    <div
                      key={h}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#5a7a30",
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                        textAlign: h === "Tax" ? "left" : "right",
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>
                {[
                  ["Federal", cTax.fed, nTax.fed],
                  ["FICA", cTax.fica, nTax.fica],
                  ["State", cTax.state, nTax.state],
                ].map(([l, c, n]) => (
                  <div
                    key={l}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 4,
                      padding: "6px 0",
                      borderBottom: "1px solid #2a3a18",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#9ab880" }}>{l}</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#c0d890",
                        textAlign: "right",
                      }}
                    >
                      {fmt(c)}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#e0f0a0",
                        fontWeight: 600,
                        textAlign: "right",
                      }}
                    >
                      {fmt(n)}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 4,
                    padding: "10px 0 0",
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}
                  >
                    Take-Home
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#c0d890",
                      textAlign: "right",
                    }}
                  >
                    {fmt(cTax.takeHome)}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#c8f040",
                      textAlign: "right",
                    }}
                  >
                    {fmt(nTax.takeHome)}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn secondary onClick={() => setTab(1)}>
                  ← Back
                </Btn>
                <div style={{ flex: 1 }}>
                  <Btn onClick={() => setTab(3)} full>
                    See Summary →
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {tab === 3 && (
            <div className="pg">
              <div
                style={{
                  ...card,
                  background: netDiff >= 0 ? "#1a3a08" : "#2a1008",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: netDiff >= 0 ? "#7ab800" : "#e06040",
                    marginBottom: 8,
                  }}
                >
                  Net Monthly Change
                </div>
                <div
                  style={{
                    fontSize: 38,
                    fontWeight: 900,
                    color: netDiff >= 0 ? "#c8f040" : "#ff8060",
                    lineHeight: 1,
                  }}
                >
                  {netDiff >= 0 ? "+" : ""}
                  {fmt(netDiff)}
                </div>
                <div style={{ fontSize: 13, color: "#7a9a60", marginTop: 6 }}>
                  per month after taxes &amp; housing
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 18,
                  }}
                >
                  <DeltaChip value={netDiff * 12} label="Per Year" />
                  <DeltaChip value={netDiff * 60} label="5-Year Total" />
                </div>
              </div>
              <div style={card}>
                <SectionTitle>Monthly Breakdown</SectionTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 4,
                    marginBottom: 6,
                  }}
                >
                  {["", "Current", "New"].map((h) => (
                    <div
                      key={h}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#9aaa80",
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                        textAlign: h === "" ? "left" : "right",
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>
                {[
                  ["Mortgage", cM, nM],
                  ["Prop Tax", cT, nT],
                  ["Insurance", cI, nI],
                  ["HOA", cH, nH],
                  ["Total Housing", cHousing, nHousing],
                  ["Take-Home /mo", cTax.takeHome / 12, nTax.takeHome / 12],
                  ["Net Discretionary", cNet, nNet],
                ].map(([l, c, n], i) => {
                  const isTotal = i === 4 || i === 6;
                  return (
                    <div
                      key={l}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 4,
                        padding: isTotal ? "11px 0" : "8px 0",
                        borderTop: isTotal
                          ? "2px solid #e8f4b0"
                          : "1px solid #f0f4e0",
                        marginTop: isTotal ? 4 : 0,
                        background: i === 6 ? "#f7fce8" : "transparent",
                        borderRadius: i === 6 ? 6 : 0,
                        paddingLeft: i === 6 ? 6 : 0,
                        paddingRight: i === 6 ? 6 : 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: isTotal ? 13 : 12,
                          fontWeight: isTotal ? 700 : 400,
                          color: "#3a5020",
                        }}
                      >
                        {l}
                      </span>
                      <span
                        style={{
                          fontSize: isTotal ? 13 : 12,
                          fontWeight: isTotal ? 700 : 400,
                          color: "#3a5020",
                          textAlign: "right",
                        }}
                      >
                        {fmt(c)}
                      </span>
                      <span
                        style={{
                          fontSize: isTotal ? 14 : 12,
                          fontWeight: isTotal ? 800 : 600,
                          color:
                            i === 6
                              ? n >= 0
                                ? "#4a8a00"
                                : "#c03030"
                              : "#1a3008",
                          textAlign: "right",
                        }}
                      >
                        {fmt(n)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <DeltaChip value={-housingDiff} label="Housing Savings/mo" />
                <DeltaChip value={taxDiff / 12} label="Tax Savings/mo" />
              </div>
              <div style={{ ...card, padding: "16px 18px" }}>
                <SectionTitle>State Comparison</SectionTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    ["Current State", STATES[cur.state]?.name],
                    ["New State", STATES[nw.state]?.name],
                    ["Current Tax Rate", pct(STATES[cur.state]?.tax || 0)],
                    ["New Tax Rate", pct(STATES[nw.state]?.tax || 0)],
                    [
                      "Current Prop Rate",
                      pct(STATES[cur.state]?.propRate || 0),
                    ],
                    ["New Prop Rate", pct(STATES[nw.state]?.propRate || 0)],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      style={{
                        padding: "8px 10px",
                        background: "#f4f8e8",
                        borderRadius: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "#7a9a50",
                          fontWeight: 700,
                          letterSpacing: ".05em",
                          textTransform: "uppercase",
                          marginBottom: 3,
                        }}
                      >
                        {l}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1a3008",
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Btn
                full
                onClick={() => {
                  const lines = [
                    "RELOCOST SUMMARY",
                    "=".repeat(40),
                    `${STATES[cur.state]?.name} → ${STATES[nw.state]?.name}`,
                    `Gross Income: ${fmt(num(inc.gross))}`,
                    "",
                    "HOUSING (MONTHLY)",
                    `  Current: ${fmt(cHousing)}`,
                    `  New:     ${fmt(nHousing)}`,
                    `  Change:  ${fmt(nHousing - cHousing)}`,
                    "",
                    "INCOME (MONTHLY TAKE-HOME)",
                    `  Current: ${fmt(cTax.takeHome / 12)}`,
                    `  New:     ${fmt(nTax.takeHome / 12)}`,
                    "",
                    "NET DISCRETIONARY / MONTH",
                    `  Current: ${fmt(cNet)}`,
                    `  New:     ${fmt(nNet)}`,
                    `  CHANGE:  ${netDiff >= 0 ? "+" : ""}${fmt(netDiff)}`,
                    "",
                    `Annual impact: ${fmt(netDiff * 12)}`,
                    `5-yr impact:   ${fmt(netDiff * 60)}`,
                  ];
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(
                    new Blob([lines.join("\n")], { type: "text/plain" }),
                  );
                  a.download = "relocost.txt";
                  a.click();
                }}
              >
                ↓ Export Report
              </Btn>
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button
                  onClick={() => setTab(0)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#7ab800",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ↺ Start Over
                </button>
              </div>
              <div
                style={{
                  marginTop: 20,
                  fontSize: 10,
                  color: "#9aaa80",
                  lineHeight: 1.7,
                  textAlign: "center",
                }}
              >
                Estimates based on 2024 IRS schedules and state average rates.
                <br />
                Not financial advice.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
