import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "jobs.db");
console.log(`Initializing database at: ${dbPath}`);
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    details TEXT NOT NULL,
    company TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    compensation TEXT,
    email TEXT NOT NULL,
    link TEXT,
    posted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed data if empty or missing new rows
const count = db.prepare("SELECT COUNT(*) as count FROM jobs").get() as { count: number };
const checkNew = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE role = 'Growth Product Manager'").get() as { count: number };
const checkBatch3 = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE role = 'Lead Product Manager, AI Ethics'").get() as { count: number };
const checkBatch4 = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE role = 'Product Manager, FinTech (Wealth Management)'").get() as { count: number };
const checkBatch5 = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE role = 'Product Manager, No Email'").get() as { count: number };

if (count.count === 0 || checkNew.count === 0 || checkBatch3.count === 0 || checkBatch4.count === 0 || checkBatch5.count === 0) {
  const insert = db.prepare(`
    INSERT INTO jobs (role, details, company, city, country, compensation, email, link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Only insert defaults if empty
  if (count.count === 0) {
    insert.run("Senior Frontend Engineer", "React expert for design systems", "TechFlow", "Remote", "USA", "$140k - $180k", "hiring@techflow.com", "https://techflow.com/jobs/1");
    // ... (rest of the initial jobs)
    insert.run("Product Designer", "Shape the future of creative tools", "CreativeCloud", "New York", "USA", "$120k - $160k", "jobs@creativecloud.com", "https://creativecloud.com/careers");
    insert.run("Backend Developer (Go)", "Scale microservices with Go", "FastScale", "Berlin", "Germany", "$80 - $120 / hr", "dev@fastscale.io", "https://fastscale.io/apply");
    insert.run("Full Stack Engineer", "Founding team for ScouterZero", "ScouterZero", "San Francisco", "USA", "$150k - $200k", "founders@scouterzero.com", "https://scouterzero.com/jobs");
    insert.run("Product Manager, Fintech", "Scale our payments platform", "DubaiPay", "Dubai", "UAE", "AED 30k - 45k / mo", "hiring@dubaipay.ae", "https://dubaipay.ae/jobs");
    insert.run("Senior PM, Logistics", "Optimize last-mile delivery", "DesertShip", "Dubai", "UAE", "AED 40k - 60k / mo", "talent@desertship.com", "https://desertship.com/careers");
    insert.run("Product Manager, E-commerce", "Growth for middle-east market", "Noon-ish", "Dubai", "UAE", "AED 35k - 50k / mo", "jobs@noonish.com", "https://noonish.com/apply");
    insert.run("Lead Product Manager", "Banking transformation", "HSBC-ish", "London", "UK", "£100k - £140k", "careers@hsbcish.com", "https://hsbcish.com/jobs");
    insert.run("Product Manager, AI", "Generative AI for legal tech", "LawBot", "London", "UK", "£85k - £115k", "apply@lawbot.io", "https://lawbot.io/careers");
    insert.run("Remote Product Manager", "Work from anywhere in the world", "NomadStack", "Remote", "Global", "$120k - $160k", "remote@nomadstack.com", "https://nomadstack.com/jobs");
    insert.run("Product Manager (US Only)", "Healthcare tech for US market", "HealthHero", "New York", "USA", "$150k - $190k", "jobs@healthhero.com", "https://healthhero.com/careers");
    insert.run("Senior PM, SaaS", "B2B platform growth", "SaaSify", "San Francisco", "USA", "$170k - $220k", "talent@saasify.io", "https://saasify.io/jobs");
  }

  // Always insert the 20 new rows if they are missing
  if (checkNew.count === 0) {
    insert.run("Growth Product Manager", "Drive user acquisition for our consumer app", "Socially", "London", "UK", "£70k - £95k", "jobs@socially.com", "https://socially.com/careers");
    insert.run("Technical PM, Infrastructure", "Scale our global cloud infrastructure", "CloudScale", "Seattle", "USA", "$180k - $230k", "infra-jobs@cloudscale.com", "https://cloudscale.com/apply");
    insert.run("Junior Product Manager", "Great entry-level role in EdTech", "LearnFast", "Dubai", "UAE", "AED 15k - 25k / mo", "careers@learnfast.ae", "https://learnfast.ae/jobs");
    insert.run("Principal PM, Marketplace", "Lead strategy for our global marketplace", "GlobalShop", "Remote", "Global", "$190k - $250k", "talent@globalshop.com", "https://globalshop.com/careers");
    insert.run("Product Manager, Crypto", "Build the future of decentralized finance", "ChainLinker", "London", "UK", "£90k - £130k", "crypto@chainlinker.io", "https://chainlinker.io/jobs");
    insert.run("Senior PM, HR Tech", "Revolutionize employee experience", "PeopleFirst", "New York", "USA", "$160k - $200k", "hr@peoplefirst.com", "https://peoplefirst.com/careers");
    insert.run("Product Manager, Sustainability", "Build tools for carbon tracking", "EcoTrack", "Berlin", "Germany", "€75k - €100k", "green@ecotrack.de", "https://ecotrack.de/jobs");
    insert.run("Mobile PM, Fitness App", "Own the mobile roadmap for FitPulse", "FitPulse", "Austin", "USA", "$140k - $175k", "mobile@fitpulse.com", "https://fitpulse.com/careers");
    insert.run("Product Manager, Cybersecurity", "Protect users with AI-driven security", "ShieldAI", "London", "UK", "£80k - £110k", "security@shieldai.co.uk", "https://shieldai.co.uk/jobs");
    insert.run("Senior PM, Real Estate", "Modernize the property buying experience", "PropTech", "Dubai", "UAE", "AED 45k - 65k / mo", "jobs@proptech.ae", "https://proptech.ae/apply");
    insert.run("Product Manager, API Platform", "Developer-first product strategy", "DevTools", "Remote", "USA", "$150k - $190k", "api@devtools.io", "https://devtools.io/careers");
    insert.run("Associate PM, Retail", "Early career role in retail innovation", "ShopSmart", "London", "UK", "£45k - £60k", "talent@shopsmart.com", "https://shopsmart.com/jobs");
    insert.run("Product Manager, Data Analytics", "Turn data into actionable insights", "Insightly", "San Francisco", "USA", "$165k - $210k", "data@insightly.com", "https://insightly.com/careers");
    insert.run("Senior PM, Travel", "Build the next generation of travel booking", "Wanderlust", "Dubai", "UAE", "AED 40k - 55k / mo", "hr@wanderlust.com", "https://wanderlust.com/jobs");
    insert.run("Product Manager, Gaming", "Design immersive player experiences", "PlaySphere", "Remote", "Europe", "€80k - €115k", "games@playsphere.com", "https://playsphere.com/apply");
    insert.run("Technical PM, Machine Learning", "Deploy ML models at scale", "Brainy", "Boston", "USA", "$175k - $225k", "ml@brainy.ai", "https://brainy.ai/careers");
    insert.run("Product Manager, HealthTech", "Improve patient outcomes with tech", "CarePlus", "London", "UK", "£75k - £105k", "health@careplus.com", "https://careplus.com/jobs");
    insert.run("Senior PM, Fintech", "Lead our expansion into new markets", "Neobank", "Dubai", "UAE", "AED 50k - 75k / mo", "finance@neobank.ae", "https://neobank.ae/careers");
    insert.run("Product Manager, E-commerce", "Optimize the checkout experience", "QuickCart", "Remote", "USA", "$130k - $170k", "jobs@quickcart.com", "https://quickcart.com/apply");
    insert.run("Principal PM, Enterprise SaaS", "Strategic lead for B2B platform", "BizCore", "Chicago", "USA", "$200k - $260k", "talent@bizcore.com", "https://bizcore.com/jobs");
  }

  // Batch 3: 20 More Rows
  if (checkBatch3.count === 0) {
    insert.run("Lead Product Manager, AI Ethics", "Ensure responsible AI development", "EthicsAI", "San Francisco", "USA", "$190k - $240k", "jobs@ethicsai.com", "https://ethicsai.com/careers");
    insert.run("Product Manager, Web3", "Build the next generation of the web", "Web3World", "Remote", "Global", "$140k - $180k", "hr@web3world.io", "https://web3world.io/jobs");
    insert.run("Senior PM, EdTech", "Transform global education", "EduGlobal", "London", "UK", "£85k - £120k", "talent@eduglobal.com", "https://eduglobal.com/apply");
    insert.run("Product Manager, InsurTech", "Disrupt the insurance industry", "InsureIt", "New York", "USA", "$155k - $195k", "jobs@insureit.com", "https://insureit.com/careers");
    insert.run("Technical PM, Cloud Security", "Secure the cloud for enterprises", "CloudGuard", "Austin", "USA", "$160k - $210k", "security@cloudguard.com", "https://cloudguard.com/jobs");
    insert.run("Product Manager, PropTech", "Innovation in real estate technology", "PropNext", "Dubai", "UAE", "AED 35k - 50k / mo", "hr@propnext.ae", "https://propnext.ae/apply");
    insert.run("Senior PM, AdTech", "Optimize digital advertising at scale", "AdScale", "San Francisco", "USA", "$175k - $220k", "jobs@adscale.com", "https://adscale.com/careers");
    insert.run("Product Manager, BioTech", "Tech for the future of biology", "BioFuture", "Boston", "USA", "$165k - $215k", "hr@biofuture.com", "https://biofuture.com/jobs");
    insert.run("Lead PM, Consumer Fintech", "Banking for the next generation", "NextBank", "London", "UK", "£95k - £135k", "talent@nextbank.com", "https://nextbank.com/apply");
    insert.run("Product Manager, GovTech", "Modernize government services", "GovSmart", "Washington DC", "USA", "$145k - $185k", "jobs@govsmart.gov", "https://govsmart.gov/careers");
    insert.run("Senior PM, Logistics Tech", "Efficiency in global supply chains", "LogiTech", "Dubai", "UAE", "AED 40k - 60k / mo", "hr@logitech.ae", "https://logitech.ae/jobs");
    insert.run("Product Manager, HR Innovation", "The future of work tools", "WorkFlow", "Remote", "Europe", "€75k - €110k", "jobs@workflow.io", "https://workflow.io/apply");
    insert.run("Technical PM, Data Privacy", "Protect user data globally", "PrivacyFirst", "Berlin", "Germany", "€85k - €125k", "hr@privacyfirst.de", "https://privacyfirst.de/jobs");
    insert.run("Product Manager, Retail Tech", "Omnichannel shopping experiences", "RetailNext", "New York", "USA", "$150k - $190k", "jobs@retailnext.com", "https://retailnext.com/careers");
    insert.run("Senior PM, Energy Tech", "Tech for sustainable energy", "EnergyWise", "London", "UK", "£80k - £115k", "talent@energywise.com", "https://energywise.com/apply");
    insert.run("Product Manager, Travel Innovation", "The future of travel booking", "TravelNext", "Dubai", "UAE", "AED 38k - 52k / mo", "hr@travelnext.com", "https://travelnext.com/jobs");
    insert.run("Lead PM, Enterprise AI", "AI solutions for big business", "EnterpriseAI", "San Francisco", "USA", "$200k - $260k", "jobs@enterpriseai.com", "https://enterpriseai.com/careers");
    insert.run("Product Manager, Mobility", "The future of urban transport", "MoveSmart", "Berlin", "Germany", "€70k - €105k", "hr@movesmart.de", "https://movesmart.de/jobs");
    insert.run("Senior PM, Health Innovation", "Tech for better health outcomes", "HealthNext", "London", "UK", "£90k - £125k", "talent@healthnext.com", "https://healthnext.com/apply");
    insert.run("Product Manager, Social Impact", "Tech for a better world", "ImpactTech", "Remote", "Global", "$120k - $160k", "hr@impacttech.org", "https://impacttech.org/jobs");
  }

  // Batch 4: 20 More Rows
  if (checkBatch4.count === 0) {
    insert.run("Product Manager, FinTech (Wealth Management)", "Revolutionize personal finance", "WealthWise", "London", "UK", "£85k - £125k", "jobs@wealthwise.com", "https://wealthwise.com/careers");
    insert.run("Senior PM, AI Platforms", "Build the foundation for AI apps", "AIStack", "San Francisco", "USA", "$185k - $235k", "talent@aistack.io", "https://aistack.io/jobs");
    insert.run("Product Manager, ClimateTech", "Tech for a sustainable planet", "GreenFuture", "Berlin", "Germany", "€80k - €115k", "hr@greenfuture.de", "https://greenfuture.de/apply");
    insert.run("Lead PM, E-commerce Growth", "Scale global online retail", "ShopGlobal", "Remote", "Global", "$150k - $200k", "growth@shopglobal.com", "https://shopglobal.com/jobs");
    insert.run("Product Manager, HealthTech (Telemedicine)", "Improve access to healthcare", "TeleHealth", "New York", "USA", "$145k - $190k", "jobs@telehealth.com", "https://telehealth.com/careers");
    insert.run("Senior PM, SaaS (Productivity Tools)", "Empower teams to work better", "WorkFlow", "Austin", "USA", "$160k - $210k", "talent@workflow.io", "https://workflow.io/jobs");
    insert.run("Product Manager, EdTech (K-12)", "Innovate in primary education", "EduPrimary", "London", "UK", "£75k - £110k", "hr@eduprimary.co.uk", "https://eduprimary.co.uk/apply");
    insert.run("Technical PM, Blockchain Infrastructure", "Build the backbone of Web3", "NodeChain", "Remote", "Global", "$140k - $190k", "infra@nodechain.io", "https://nodechain.io/jobs");
    insert.run("Product Manager, Retail (Digital Transformation)", "Modernize the shopping experience", "RetailHub", "Dubai", "UAE", "AED 35k - 55k / mo", "jobs@retailhub.ae", "https://retailhub.ae/apply");
    insert.run("Senior PM, Cybersecurity (Identity)", "Secure digital identities", "IDGuard", "San Francisco", "USA", "$180k - $230k", "security@idguard.com", "https://idguard.com/careers");
    insert.run("Product Manager, Logistics (Supply Chain)", "Optimize global logistics", "LogiFlow", "Chicago", "USA", "$140k - $185k", "hr@logiflow.com", "https://logiflow.com/jobs");
    insert.run("Lead PM, Consumer Apps", "Design apps people love", "AppStudio", "London", "UK", "£95k - £140k", "talent@appstudio.com", "https://appstudio.com/apply");
    insert.run("Product Manager, InsurTech (Auto)", "The future of car insurance", "AutoInsure", "New York", "USA", "$150k - $195k", "jobs@autoinsure.com", "https://autoinsure.com/careers");
    insert.run("Senior PM, PropTech (Marketplace)", "Innovation in real estate", "PropMarket", "Dubai", "UAE", "AED 45k - 65k / mo", "hr@propmarket.ae", "https://propmarket.ae/jobs");
    insert.run("Product Manager, AdTech (Video)", "Scale video advertising", "AdVideo", "San Francisco", "USA", "$165k - $215k", "jobs@advideo.com", "https://advideo.com/careers");
    insert.run("Technical PM, ML Ops", "Deploy ML models at scale", "MLOpsPro", "Seattle", "USA", "$175k - $225k", "talent@mlopspro.io", "https://mlopspro.io/jobs");
    insert.run("Product Manager, HR Tech (Recruitment)", "Better tools for hiring", "HireSmart", "Remote", "Europe", "€75k - €110k", "hr@hiresmart.io", "https://hiresmart.io/apply");
    insert.run("Senior PM, FinTech (Crypto)", "Banking on the blockchain", "CryptoBank", "London", "UK", "£100k - £145k", "talent@cryptobank.io", "https://cryptobank.io/jobs");
    insert.run("Product Manager, Travel (Experience)", "Curate the best travel experiences", "TravelJoy", "Dubai", "UAE", "AED 40k - 58k / mo", "hr@traveljoy.com", "https://traveljoy.com/apply");
    insert.run("Lead PM, Enterprise Software", "Build tools for big business", "BizSoftware", "Boston", "USA", "$195k - $250k", "jobs@bizsoftware.com", "https://bizsoftware.com/careers");
  }

  // Batch 5: Jobs with no email
  if (checkBatch5.count === 0) {
    insert.run("Product Manager, No Email", "This job has no email, only LinkedIn", "LinkedInOnly", "San Francisco", "USA", "$150k - $200k", "", "https://linkedin.com/jobs/view/12345");
    insert.run("Senior PM, Stealth Startup", "Building something secret", "StealthCo", "New York", "USA", "$180k - $220k", "", "https://linkedin.com/jobs/view/67890");
    insert.run("Product Manager, Web3 Gaming", "Next gen gaming", "GameFi", "Remote", "Global", "$130k - $170k", "", "https://linkedin.com/jobs/view/11111");
    insert.run("Lead PM, AI Agents", "Autonomous agents", "AgentAI", "London", "UK", "£90k - £130k", "", "https://linkedin.com/jobs/view/22222");
    insert.run("Product Manager, Creator Economy", "Tools for creators", "CreateSpace", "Los Angeles", "USA", "$140k - $180k", "", "https://linkedin.com/jobs/view/33333");
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/jobs", (req, res) => {
    const jobs = db.prepare("SELECT * FROM jobs ORDER BY posted_at DESC").all();
    res.json(jobs);
  });

  app.get("/api/jobs/:id", (req, res) => {
    const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id);
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ error: "Job not found" });
    }
  });

  app.post("/api/jobs", (req, res) => {
    const { role, details, company, city, country, compensation, email, link } = req.body;
    const result = db.prepare(`
      INSERT INTO jobs (role, details, company, city, country, compensation, email, link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(role, details, company, city, country, compensation, email, link);
    
    res.json({ id: result.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
