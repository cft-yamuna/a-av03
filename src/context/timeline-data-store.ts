import type { TimelineData, DandelionConfig, TimelineMilestone } from '../types/timeline-data';

const STORAGE_KEY = 'wipro-timeline-data';

/** Convert hex color (#rrggbb) to rgba glow string */
export function hexToGlow(hex: string, alpha = 0.4): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Derive decade string from year (e.g. 2007 → '2005', 1983 → '1975') */
export function yearToDecade(year: number): string {
  const base = Math.floor(year / 10) * 10;
  const decade = base + (year % 10 >= 5 ? 5 : -5);
  return String(decade < 1945 ? 1945 : decade);
}

const DEFAULT_DANDELIONS: DandelionConfig[] = [
  {
    sector: { id: 'IT', label: 'IT', color: '#5072b6', glowColor: 'rgba(80, 114, 182, 0.4)' },
    placement: { x: 550, y: 200, size: 500, delay: 0 },
  },
  {
    sector: { id: 'Sustainability', label: 'Sustainability', color: '#70a363', glowColor: 'rgba(112, 163, 99, 0.4)' },
    placement: { x: 360, y: 720, size: 380, delay: 0.8 },
  },
  {
    sector: { id: 'ConsumerCare', label: 'Consumer\nCare', color: '#f58d53', glowColor: 'rgba(245, 141, 83, 0.4)' },
    placement: { x: 300, y: 1100, size: 330, delay: 1.6 },
  },
  {
    sector: { id: 'WiN', label: 'WIN', color: '#7676b3', glowColor: 'rgba(118, 118, 179, 0.4)' },
    placement: { x: 80, y: 860, size: 310, delay: 1.2 },
  },
  {
    sector: { id: 'GEJV', label: 'GE-JV', color: '#6fc5b1', glowColor: 'rgba(111, 197, 177, 0.4)' },
    placement: { x: 50, y: 1180, size: 220, delay: 2.4 },
  },
  {
    sector: { id: 'Foundation', label: 'Foundation', color: '#349bb3', glowColor: 'rgba(52, 155, 179, 0.4)' },
    placement: { x: 680, y: 830, size: 280, delay: 2.0 },
  },
  {
    sector: { id: 'General', label: 'General\nCompany\nEvents', color: '#f48182', glowColor: 'rgba(244, 129, 130, 0.4)' },
    placement: { x: 30, y: 160, size: 540, delay: 0.3 },
  },
];

const DEFAULT_MILESTONES: TimelineMilestone[] = [
  // ── General Company Events ──
  { id: 'g1', year: 1945, description: 'M.H. Hasham Premji establishes the company in Amalner, Maharashtra.', sectorId: 'General', decade: '1945' },
  { id: 'g13', year: 1947, description: 'Company expands production capacity to meet growing domestic demand in newly independent India.', sectorId: 'General', decade: '1945' },
  { id: 'g14', year: 1960, description: 'Major expansion of the Amalner manufacturing facility, doubling production capacity for vegetable oils.', sectorId: 'General', decade: '1955' },
  { id: 'g2', year: 1966, description: '21-year-old Azim Premji returns from Stanford to lead the company after his father\'s death.', sectorId: 'General', decade: '1965' },
  { id: 'g3', year: 1968, description: 'Western India Vegetable Products becomes Wipro Products Limited.', sectorId: 'General', decade: '1965' },
  { id: 'g15', year: 1975, description: 'Azim Premji initiates strategic diversification into industrial and technology segments under the Wipro umbrella.', sectorId: 'General', decade: '1975' },
  { id: 'g16', year: 1982, description: 'Company renamed from Wipro Products Limited to Wipro Limited, reflecting its multi-industry portfolio.', sectorId: 'General', decade: '1975' },
  { id: 'g4', year: 1992, description: 'Wipro lists on the Bombay Stock Exchange.', sectorId: 'General', decade: '1985' },
  { id: 'g5', year: 1997, description: 'Wipro becomes one of the first Indian companies to adopt Six Sigma quality methodology across all businesses.', sectorId: 'General', decade: '1995' },
  { id: 'g6', year: 2000, description: 'Wipro lists on the New York Stock Exchange.', sectorId: 'General', decade: '1995' },
  { id: 'g7', year: 2005, description: 'New brand identity reflecting innovation focus.', sectorId: 'General', decade: '2005' },
  { id: 'g8', year: 2013, description: 'Non-IT businesses (consumer care, lighting, hydraulics) demerged into Wipro Enterprises, effective March 31.', sectorId: 'General', decade: '2005' },
  { id: 'g9', year: 2019, description: 'Azim Premji retires after 53 years; son Rishad Premji succeeds him as Executive Chairman.', sectorId: 'General', decade: '2015' },
  { id: 'g10', year: 2020, description: 'Major remote work transition; Rs 1,125 crore committed to pandemic relief.', sectorId: 'General', decade: '2015' },
  { id: 'g11', year: 2022, description: 'Wipro surpasses $10 billion annual revenue for the first time, reaching $10.38 billion.', sectorId: 'General', decade: '2015' },
  { id: 'g12', year: 2024, description: 'Srini Pallia becomes Chief Executive Officer and Managing Director, succeeding Thierry Delaporte.', sectorId: 'General', decade: '2015' },

  // ── IT Services ──
  { id: 'it20', year: 1947, description: 'Early manufacturing operations lay the groundwork for Wipro\'s future engineering and technology capabilities.', sectorId: 'IT', decade: '1945' },
  { id: 'it21', year: 1962, description: 'India\'s IIT system expansion creates the talent base that will power Wipro\'s future IT services division.', sectorId: 'IT', decade: '1955' },
  { id: 'it22', year: 1970, description: 'Azim Premji begins studying global technology trends, recognizing the potential of computing for Indian industry.', sectorId: 'IT', decade: '1965' },
  { id: 'it1', year: 1977, description: 'Wipro enters the technology sector with minicomputers.', sectorId: 'IT', decade: '1975' },
  { id: 'it2', year: 1980, description: 'Manufacturing minicomputers under license from Sentinel.', sectorId: 'IT', decade: '1975' },
  { id: 'it3', year: 1981, description: 'Separate IT division established for software services.', sectorId: 'IT', decade: '1975' },
  { id: 'it4', year: 1983, description: 'First dedicated software development center established.', sectorId: 'IT', decade: '1975' },
  { id: 'it5', year: 1985, description: 'Collaboration with Sun Microsystems for workstations.', sectorId: 'IT', decade: '1985' },
  { id: 'it6', year: 1990, description: 'Wipro begins offshore software services for global clients.', sectorId: 'IT', decade: '1985' },
  { id: 'it7', year: 1995, description: 'First company in the world to achieve SEI CMM Level 5.', sectorId: 'IT', decade: '1995' },
  { id: 'it8', year: 1999, description: 'Major Y2K remediation projects accelerate global growth.', sectorId: 'IT', decade: '1995' },
  { id: 'it9', year: 2001, description: 'World\'s first IT services company to achieve People Capability Maturity Model Level 5.', sectorId: 'IT', decade: '1995' },
  { id: 'it10', year: 2003, description: 'Entry into business process outsourcing.', sectorId: 'IT', decade: '1995' },
  { id: 'it11', year: 2007, description: '$600 million acquisition of US-based IT infrastructure services provider with five data centers.', sectorId: 'IT', decade: '2005' },
  { id: 'it12', year: 2012, description: 'Launch of cloud infrastructure and services division.', sectorId: 'IT', decade: '2005' },
  { id: 'it13', year: 2015, description: 'Launch of Wipro Digital and acquisition of Danish strategic design firm Designit for $94 million.', sectorId: 'IT', decade: '2015' },
  { id: 'it14', year: 2016, description: 'Launch of Holmes, Wipro\'s proprietary AI and automation platform for cognitive computing.', sectorId: 'IT', decade: '2015' },
  { id: 'it15', year: 2017, description: 'Acquisition strengthens crowdsourcing and developer community capabilities.', sectorId: 'IT', decade: '2015' },
  { id: 'it16', year: 2021, description: '$1.45B Capco acquisition and $1B FullStride Cloud Services investment launched.', sectorId: 'IT', decade: '2015' },
  { id: 'it17', year: 2022, description: '$540 million acquisition of SAP consulting firm Rizing, creating an SAP consulting powerhouse.', sectorId: 'IT', decade: '2015' },
  { id: 'it18', year: 2023, description: 'Launch of dedicated AI innovation hub.', sectorId: 'IT', decade: '2015' },
  { id: 'it19', year: 2024, description: 'Enterprise-wide AI transformation strategy launched.', sectorId: 'IT', decade: '2015' },

  // ── Consumer Care ──
  { id: 'cc1', year: 1947, description: 'Production of vanaspati ghee and refined oils under Sunflower and Kisan brands.', sectorId: 'ConsumerCare', decade: '1945' },
  { id: 'cc2', year: 1957, description: 'The company diversifies into the personal care market with laundry soap 787.', sectorId: 'ConsumerCare', decade: '1955' },
  { id: 'cc3', year: 1971, description: 'Expansion into bakery fats, ethnic ingredient-based toiletries.', sectorId: 'ConsumerCare', decade: '1965' },
  { id: 'cc13', year: 1978, description: 'Launch of herbal shikakai-based hair wash soap, tapping into India\'s traditional hair care ingredients.', sectorId: 'ConsumerCare', decade: '1975' },
  { id: 'cc4', year: 1985, description: 'Sandalwood-and-turmeric soap test-launched in Bangalore; national rollout follows in 1986.', sectorId: 'ConsumerCare', decade: '1985' },
  { id: 'cc5', year: 1991, description: 'Entry into baby care with milk-and-almonds baby soap, later expanding to full baby care portfolio.', sectorId: 'ConsumerCare', decade: '1985' },
  { id: 'cc14', year: 1999, description: 'Santoor expands beyond South India to become a pan-India brand with distribution across all major states.', sectorId: 'ConsumerCare', decade: '1995' },
  { id: 'cc6', year: 2003, description: 'Glucovita glucose powder brand acquired from Hindustan Unilever.', sectorId: 'ConsumerCare', decade: '1995' },
  { id: 'cc7', year: 2004, description: 'Kerala-origin ayurvedic soap brand Chandrika acquired for Rs 31 crore.', sectorId: 'ConsumerCare', decade: '1995' },
  { id: 'cc8', year: 2007, description: 'Singapore-based Unza Holdings acquired for $246 million, expanding into Southeast Asia.', sectorId: 'ConsumerCare', decade: '2005' },
  { id: 'cc9', year: 2009, description: 'Yardley of London acquired for Asia, Middle East, and Australasia for $45.5 million.', sectorId: 'ConsumerCare', decade: '2005' },
  { id: 'cc10', year: 2012, description: '$144 million acquisition of Singapore skincare company with Bio-essence and Ginvera brands.', sectorId: 'ConsumerCare', decade: '2005' },
  { id: 'cc11', year: 2018, description: 'Santoor becomes India\'s second-largest soap brand by value, surpassing Lux.', sectorId: 'ConsumerCare', decade: '2015' },
  { id: 'cc12', year: 2025, description: 'Santoor crosses Rs 2,850 crore in sales, surpassing Lifebuoy as India\'s largest soap brand.', sectorId: 'ConsumerCare', decade: '2015' },

  // ── WiN (Infrastructure Engineering) ──
  { id: 'w9', year: 1948, description: 'Foundation-era industrial operations in Amalner establish Wipro\'s manufacturing DNA and engineering culture.', sectorId: 'WiN', decade: '1945' },
  { id: 'w10', year: 1960, description: 'Wipro explores industrial product lines beyond consumer goods, laying groundwork for future engineering businesses.', sectorId: 'WiN', decade: '1955' },
  { id: 'w2', year: 1974, description: 'Wipro enters the medical systems business.', sectorId: 'WiN', decade: '1965' },
  { id: 'w1', year: 1976, description: 'Wipro establishes hydraulic cylinder manufacturing in Bengaluru.', sectorId: 'WiN', decade: '1975' },
  { id: 'w3', year: 1992, description: 'Wipro Lighting division established for commercial, industrial, and outdoor lighting solutions.', sectorId: 'WiN', decade: '1985' },
  { id: 'w11', year: 1988, description: 'Bengaluru hydraulic cylinder plant undergoes major expansion to serve growing construction and earth-moving equipment markets.', sectorId: 'WiN', decade: '1985' },
  { id: 'w12', year: 1998, description: 'Wipro Lighting establishes R&D center focused on energy-efficient lighting solutions for commercial buildings.', sectorId: 'WiN', decade: '1995' },
  { id: 'w4', year: 2006, description: 'Swedish Hydrauto Group acquired, gaining five European manufacturing facilities in Sweden and Finland.', sectorId: 'WiN', decade: '2005' },
  { id: 'w5', year: 2008, description: 'Water and wastewater treatment division launched for industrial applications across oil, steel, and pharma.', sectorId: 'WiN', decade: '2005' },
  { id: 'w6', year: 2012, description: 'Metal and polymer additive manufacturing division launched in Bengaluru for aerospace and defense.', sectorId: 'WiN', decade: '2005' },
  { id: 'w7', year: 2024, description: 'Nebraska-based hydraulic cylinder manufacturer acquired, strengthening North American presence.', sectorId: 'WiN', decade: '2015' },
  { id: 'w8', year: 2024, description: 'Rs 250 crore state-of-the-art facility opened in Jaipur, first in Northern India, with 1,000 cylinders/day capacity.', sectorId: 'WiN', decade: '2015' },
  { id: 'w13', year: 2019, description: 'Wipro Lighting launches IoT-enabled smart lighting platform for connected buildings and smart city projects.', sectorId: 'WiN', decade: '2015' },

  // ── GE Joint Venture ──
  { id: 'ge11', year: 1950, description: 'Post-independence India invests in medical infrastructure — the ecosystem that will later attract GE\'s partnership.', sectorId: 'GEJV', decade: '1945' },
  { id: 'ge12', year: 1956, description: 'General Electric begins operations in India, importing industrial and medical equipment — decades before the Wipro JV.', sectorId: 'GEJV', decade: '1955' },
  { id: 'ge13', year: 1974, description: 'Wipro\'s Medical Systems division begins operations, building capability that will eventually attract GE as a JV partner.', sectorId: 'GEJV', decade: '1965' },
  { id: 'ge14', year: 1980, description: 'India\'s medical devices import reliance grows, creating the opportunity for domestic manufacturing partnerships.', sectorId: 'GEJV', decade: '1975' },
  { id: 'ge1', year: 1989, description: 'Wipro and GE establish 51:49 joint venture for medical diagnostic equipment in South Asia.', sectorId: 'GEJV', decade: '1985' },
  { id: 'ge2', year: 1990, description: 'Wipro GE Medical Systems incorporated in March; Bengaluru manufacturing facility commences operations.', sectorId: 'GEJV', decade: '1985' },
  { id: 'ge3', year: 1998, description: 'Wipro GE emerges as the largest healthcare systems company in South Asia and India\'s top medical exporter.', sectorId: 'GEJV', decade: '1995' },
  { id: 'ge4', year: 2000, description: 'John F. Welch Technology Centre inaugurated in Bengaluru, GE\'s largest multidisciplinary R&D center outside the US.', sectorId: 'GEJV', decade: '1995' },
  { id: 'ge5', year: 2004, description: 'JV renamed from Wipro GE Medical Systems to Wipro GE Healthcare following GE\'s global rebrand.', sectorId: 'GEJV', decade: '1995' },
  { id: 'ge6', year: 2008, description: 'Ultra-portable ECG designed and manufactured in India at one-third the cost, later exported globally.', sectorId: 'GEJV', decade: '2005' },
  { id: 'ge7', year: 2009, description: 'GE consolidates all standalone healthcare units under Wipro GE, streamlining manufacturing, sales, and service.', sectorId: 'GEJV', decade: '2005' },
  { id: 'ge8', year: 2020, description: 'Collaborative AI lab for medical and healthcare imaging inaugurated with Indian Institute of Science.', sectorId: 'GEJV', decade: '2015' },
  { id: 'ge9', year: 2022, description: 'Revolution Aspire CT scanner launched, designed and manufactured end-to-end in India under the PLI scheme.', sectorId: 'GEJV', decade: '2015' },
  { id: 'ge10', year: 2024, description: 'Rs 8,000 crore investment announced over 5 years in manufacturing and R&D, targeting 70% local production by 2030.', sectorId: 'GEJV', decade: '2015' },

  // ── Foundation & Philanthropy ──
  { id: 'f9', year: 1950, description: 'M.H. Hasham Premji instills strong values of community service and giving back — principles that shape Wipro\'s future philanthropy.', sectorId: 'Foundation', decade: '1945' },
  { id: 'f10', year: 1962, description: 'Early employee welfare initiatives in Amalner factory including housing, healthcare, and education support for workers\' families.', sectorId: 'Foundation', decade: '1955' },
  { id: 'f11', year: 1970, description: 'Young Azim Premji begins integrating social responsibility into corporate strategy, influenced by his father\'s values and Stanford education.', sectorId: 'Foundation', decade: '1965' },
  { id: 'f12', year: 1980, description: 'Wipro begins structured community engagement programs in Bengaluru, focusing on education and local development.', sectorId: 'Foundation', decade: '1975' },
  { id: 'f13', year: 1990, description: 'First formal education outreach programs launched, supporting government schools near Wipro campuses across India.', sectorId: 'Foundation', decade: '1985' },
  { id: 'f1', year: 2001, description: 'Non-profit founded to improve public school education in rural India.', sectorId: 'Foundation', decade: '1995' },
  { id: 'f2', year: 2002, description: 'Employee-driven trust established for community engagement in education, healthcare, and disaster response.', sectorId: 'Foundation', decade: '1995' },
  { id: 'f3', year: 2010, description: 'University established in Bengaluru under Karnataka state act with $2 billion endowment for education.', sectorId: 'Foundation', decade: '2005' },
  { id: 'f4', year: 2011, description: 'Sustainability education program for schools; has since reached 51,000+ schools and 210,000+ students.', sectorId: 'Foundation', decade: '2005' },
  { id: 'f5', year: 2013, description: 'First Indian to sign the Giving Pledge, committing majority of wealth to philanthropic causes.', sectorId: 'Foundation', decade: '2005' },
  { id: 'f6', year: 2014, description: '$5.1 million program with US universities to train school teachers in science education leadership.', sectorId: 'Foundation', decade: '2005' },
  { id: 'f7', year: 2019, description: 'Largest charitable gift in Indian history; total commitment reaches $21 billion in Wipro shares.', sectorId: 'Foundation', decade: '2015' },
  { id: 'f8', year: 2020, description: 'Rs 1,125 crore committed to pandemic relief; additional Rs 1,000 crore in 2021 for vaccination.', sectorId: 'Foundation', decade: '2015' },

  // ── Sustainability ──
  { id: 's11', year: 1950, description: 'As a vegetable oil producer, Wipro\'s founding business relies on sustainable agricultural sourcing from day one.', sectorId: 'Sustainability', decade: '1945' },
  { id: 's12', year: 1963, description: 'Amalner factory implements early water recycling practices in vanaspati production, reducing industrial water consumption.', sectorId: 'Sustainability', decade: '1955' },
  { id: 's13', year: 1972, description: 'Following the first UN Conference on Environment in Stockholm, Wipro begins considering environmental impact in operations.', sectorId: 'Sustainability', decade: '1965' },
  { id: 's14', year: 1982, description: 'Early energy efficiency initiatives in manufacturing facilities, reducing power consumption in hydraulic cylinder and consumer goods production.', sectorId: 'Sustainability', decade: '1975' },
  { id: 's15', year: 1993, description: 'Wipro begins environmental management system implementation across manufacturing units, ahead of most Indian companies.', sectorId: 'Sustainability', decade: '1985' },
  { id: 's1', year: 2001, description: 'Wipro launches programs addressing ecological and social sustainability.', sectorId: 'Sustainability', decade: '1995' },
  { id: 's2', year: 2005, description: 'Gurgaon campus receives LEED Platinum certification -- largest Platinum-rated green building in Asia.', sectorId: 'Sustainability', decade: '2005' },
  { id: 's3', year: 2008, description: 'Enterprise-wide ecological sustainability charter covering carbon, water, waste, and biodiversity.', sectorId: 'Sustainability', decade: '2005' },
  { id: 's4', year: 2009, description: 'Inaugural sustainability report published following Global Reporting Initiative framework.', sectorId: 'Sustainability', decade: '2005' },
  { id: 's5', year: 2010, description: 'First inclusion in DJSI World Index; maintains unbroken membership for 13+ consecutive years.', sectorId: 'Sustainability', decade: '2005' },
  { id: 's6', year: 2013, description: 'Campus near Hyderabad achieves net-zero energy through solar, geothermal, and LED systems.', sectorId: 'Sustainability', decade: '2005' },
  { id: 's7', year: 2021, description: 'Commitment to net-zero GHG emissions by 2040 with 55% absolute reduction target by 2030.', sectorId: 'Sustainability', decade: '2015' },
  { id: 's8', year: 2022, description: 'Among first seven companies globally to have net-zero targets validated by the Science Based Targets initiative.', sectorId: 'Sustainability', decade: '2015' },
  { id: 's9', year: 2022, description: 'Achieved A rating on CDP climate disclosure, recognized among top Indian companies in environmental action.', sectorId: 'Sustainability', decade: '2015' },
  { id: 's10', year: 2023, description: 'Ranked 2nd overall in Financial Times Climate Leaders Asia-Pacific for 67.6% emissions reduction.', sectorId: 'Sustainability', decade: '2015' },
];

export function getDefaultData(): TimelineData {
  return {
    dandelions: DEFAULT_DANDELIONS.map((d) => ({
      sector: { ...d.sector },
      placement: { ...d.placement },
    })),
    milestones: DEFAULT_MILESTONES.map((m) => ({ ...m })),
  };
}

export function loadData(): TimelineData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TimelineData;
      if (parsed.dandelions && parsed.milestones) {
        return parsed;
      }
    }
  } catch {
    // Fall through to defaults
  }
  return getDefaultData();
}

export function saveData(data: TimelineData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function exportJson(data: TimelineData): string {
  return JSON.stringify(data, null, 2);
}

export function importJson(json: string): TimelineData {
  const parsed = JSON.parse(json) as TimelineData;
  if (!Array.isArray(parsed.dandelions) || !Array.isArray(parsed.milestones)) {
    throw new Error('Invalid timeline data format');
  }
  return parsed;
}
