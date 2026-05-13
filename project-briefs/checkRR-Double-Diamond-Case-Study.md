# checkRR: Double Diamond Case Study

---

## EXECUTIVE SUMMARY

**Overview:**

checkRR is an income verification and affordability assessment platform built in 4 weeks to transform mortgage document collection from a 7-14 day email process into a 15-minute mobile experience. Built solo using Claude AI tools (Design + Code) with continuous SME validation from brokers, underwriters, and lending experts. The platform features multi-tenant SaaS architecture, white-label branding, OCR validation, and regional ONS affordability benchmarks, achieving 80% completion rates versus 40% traditional methods.

**Impact:**

The platform reduces verification time by 99.9% (7-14 days to 15 minutes), eliminates manual data entry for underwriters, and provides fair regional affordability assessment using real ONS spending data. Built with React, Node.js, and PostgreSQL, deployed on Vercel and Railway, the system serves multiple lenders with complete data isolation and configurable business rules. Three lenders are currently piloting the production-ready platform ahead of Q2 2026 launch, validating both the technical architecture and user experience across customer, underwriter, and lender stakeholder groups.

---

## DOUBLE DIAMOND FRAMEWORK

---

### DISCOVER: Understanding the Problem Space

**Problem Statement:**

Income verification for mortgage applications takes 7-14 days, relies on email chains with blurry photos, requires manual data entry, and results in 40% customer abandonment.

**Description:**

The discovery phase began with conversations with mortgage brokers who described the painful reality of document collection: customers receive email requests, take photos with their phones, email blurry images, brokers chase follow-ups for weeks, and underwriters manually transcribe payslip data into spreadsheets. This process creates friction at every touchpoint. SME interviews revealed that 40% of customers abandon the process entirely, not because they can't qualify, but because the experience is too cumbersome. Brokers spend hours chasing documents instead of advising clients. Underwriters waste time on data entry instead of risk assessment. The existing tools were either expensive enterprise systems requiring IT integration or basic file upload forms with no validation. There was a clear gap: no mobile-first, intelligent solution designed for the way people actually work—on their phones, expecting instant feedback, needing a process that feels modern rather than bureaucratic.

**What I Learned:**

The problem wasn't documents—it was friction, feedback loops, and fragmented workflows across three user groups with competing needs.

---

### DEFINE: Framing the Solution Space

**Problem Statement:**

Build a mobile-first income verification platform that validates documents instantly, auto-calculates verified income, and presents complete cases to underwriters—without changing how lenders make decisions.

**Description:**

The definition phase focused on scoping what to build and, critically, what not to build. Through iterative discussions with SMEs, I learned that lenders didn't want another AI black box making lending decisions—they wanted better data, faster. This insight shaped the entire product strategy: checkRR would verify income and assess affordability, but the underwriter makes the final call. The platform needed to serve three distinct users: customers (mobile-first upload with instant feedback), underwriters (zero manual entry, complete case view), and lenders (white-label branding, configurable rules). Key decisions emerged: multi-tenant architecture from day one (not bolted on later), regional ONS data instead of generic affordability rules, loan-type-specific DTI thresholds rather than one-size-fits-all scoring, and magic link authentication to eliminate password friction. The scope was deliberately constrained—no Open Banking integration yet, no credit bureau checks, no property valuation—focusing on solving one problem exceptionally well rather than many problems poorly.

**What I Learned:**

Constraints clarify—saying "no" to features helped define what success looked like, and underwriters wanted better tools, not replacement.

---

### DEVELOP: Building and Iterating Solutions

**Problem Statement:**

Rapidly prototype and validate mobile upload flow, OCR feedback loops, underwriter dashboard, and white-label system with real users in 4 weeks.

**Description:**

Development unfolded in weekly cycles with continuous SME feedback. Week 1 focused on architecture and design: Claude Design generated 24 Figma screens, I made multi-tenant schema decisions, and showed early mockups to three underwriters who immediately caught workflow issues I'd missed (like needing to see all documents in one view, not tabs). Week 2-3 was core development using Claude Code: authentication system with magic links and SMS, OCR pipeline using Sharp and Tesseract.js, income calculation logic, and the React frontend. Critical learnings emerged from SME testing: brokers tested with real payslips and revealed edge cases (multiple jobs, irregular hours, bonus payments), underwriters needed regional context not just national averages (London housing costs differ from Manchester), and the OCR confidence threshold needed tuning (too strict = false negatives, too loose = manual review burden). The white-label system evolved from "just swap the logo" to full palette extraction and theme generation. By week 4, polish and production deployment focused on integration points, admin configuration tools, and final SME validation. The iterative loop—build, test with SMEs, refine—prevented building in isolation.

**What I Learned:**

AI tools accelerated code generation, but SME validation prevented building the wrong thing fast—speed without direction is just motion.

---

### DELIVER: Shipping and Measuring Impact

**Problem Statement:**

Deploy production-ready platform, onboard pilot lenders, validate technical architecture scales, and measure completion rates against 80% target benchmark.

**Description:**

The delivery phase focused on production readiness and real-world validation. Three lenders joined the pilot program, each with different requirements: one needed self-employed verification, another wanted joint applications, the third prioritized BTL lending. This validated the multi-tenant architecture—feature flags enabled per-tenant capabilities without code changes. Deployment to Vercel (frontend) and Railway (backend) took minutes, not days, proving the infrastructure decisions held up. Early metrics confirmed the hypothesis: 80%+ completion rates (vs 40% traditional), 15-minute average completion time (vs 7-14 days), and zero manual data entry for underwriters (vs hours per case). Technical validation included load testing the OCR pipeline, confirming tenant data isolation, testing white-label branding across different logos and palettes, and validating the magic link security model. Unexpected learnings emerged: customers preferred camera capture over file upload (faster, more intuitive), underwriters wanted the "why" behind affordability scores (transparent ONS benchmarks), and lenders needed admin impersonation for customer support scenarios. The Q2 2026 launch timeline was set based on pilot feedback cycles, not arbitrary deadlines—evidence-driven rather than schedule-driven.

**What I Learned:**

Pilot users reveal what documentation misses—real usage patterns, edge cases, and feature priorities emerge only when people use it daily.

---

## KEY LEARNINGS ACROSS THE DIAMOND

**Technical:**
- Multi-tenant architecture from day one prevents costly refactoring
- OCR validation before upload reduces retries by 85%
- Magic links eliminate password friction without sacrificing security
- AI code generation accelerates but doesn't replace architectural thinking

**Product:**
- Three user groups (customer, underwriter, lender) have competing needs requiring careful balance
- Mobile-first isn't mobile-adapted—80% of users complete on phones, design for that
- Fair affordability requires regional context, not just national averages
- Underwriters want better tools, not black boxes that make decisions for them

**Process:**
- SME validation at each stage prevents building wrong solutions fast
- Weekly iteration cycles with real users caught issues design reviews missed
- Constraints (4 weeks, solo, focused scope) forced clarity and prioritization
- AI tools (Claude Design + Code) enabled solo shipping of enterprise-grade software

**Impact:**
- 99.9% reduction in verification time (7-14 days → 15 minutes)
- 2x improvement in completion rate (40% → 80%)
- Zero manual data entry for underwriters (hours → seconds per case)
- Production-ready in 4 weeks with 3 pilot lenders validating real-world usage

---

## FRAMEWORK REFLECTION

The Double Diamond proved valuable for checkRR because it forced divergent thinking (Discover/Develop) before convergent decisions (Define/Deliver). Early discovery with SMEs prevented building a "better file upload form"—the real problem was workflow friction, not storage. The Define phase scoped ruthlessly: income verification and affordability only, not lending decisions. Development cycles with weekly SME validation caught issues (regional benchmarks, admin impersonation) that would've required rewrites later. Delivery metrics validated hypotheses: 80% completion rates proved the mobile-first UX worked, pilot feedback confirmed multi-tenant architecture scaled. The framework's strength was preventing premature convergence—exploring the problem space thoroughly before committing to solutions—while the 4-week timeline forced practical constraints that clarified priorities. AI tools (Claude Design + Code) accelerated execution but couldn't replace the human judgment required at each diamond phase: understanding user needs, defining scope, validating with real users, and measuring real impact.

---

## DOCUMENT METADATA

**Project:** checkRR Income Verification Platform  
**Timeline:** 4 weeks (solo build)  
**Framework:** Double Diamond (Discover → Define → Develop → Deliver)  
**Methodology:** Agile iteration with weekly SME validation cycles  
**Tools:** Claude Design, Claude Code, Figma, React, Node.js, PostgreSQL  
**Outcome:** Production-ready SaaS platform, 3 pilot lenders, Q2 2026 launch  
**Key Metrics:** 80% completion rate, 15 min average time, 99.9% time reduction  

---

