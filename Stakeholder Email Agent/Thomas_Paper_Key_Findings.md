# Thomas et al. Real-World Implementation Study - Key Performance Data

**Citation:** Thomas CB, Wyler B, D'Antonio CM, et al. Impact of a Sepsis Quality Improvement Initiative on Clinical and Operational Outcomes. *Healthcare*. 2025;13:1273. DOI: 10.3390/healthcare13111273

## Study Design
- **Real-world quality improvement initiative** at Our Lady of the Lake Regional Medical Center (OLOLRMC), Baton Rouge, LA
- **800-bed academic medical center**
- **Study period:** April 2023 - July 2024 (16 months)
- **Pre-implementation:** April-July 2023 (n=2,555 OPA alerts)
- **Post-implementation:** August 2023-July 2024 (n=9,525 OPA alerts)
- **IntelliSep tested patients:** n=5,471 (49.2% Band 1, 25.5% Band 2, 25.3% Band 3)

## Key Clinical Outcomes

### Mortality Reduction
- **Sepsis-associated mortality dropped from 10.9% to 6.6%** (p < 0.001)
- **Absolute risk reduction: 4.2%** in temporally matched group
- **Number needed to treat: 23.8 patients** with sepsis DRG to prevent one death
- **Number needed to test: ~115 patients** to prevent one death due to sepsis
- No significant change in non-sepsis mortality (confirms real sepsis impact, not reclassification)

### Hospital Length of Stay (HLOS)
- **Statistically significant reduction** in HLOS for sepsis patients (p = 0.042 overall, p = 0.048 temporally matched)
- **Pre-implementation mean:** 6.72 days
- **Post-implementation mean:** 6.08 days
- **Temporally matched mean:** 5.96 days (median 4 days)

### Resource Utilization
- **Blood culture utilization reduced from 50.8% to 45.7%** (p < 0.001)
- **Estimated 944 blood cultures saved** over one-year post-implementation
- **Blood culture contamination rate decreased** from 2.47% to 1.97% to 1.77% (temporally matched)
- **Significant decline in Band 1 blood culture orders:** from 48.1% to 23.8-37.0% range

## Operational Performance

### Turnaround Time
- **Average total TAT from order to result: 78.2 minutes**
  - Order to collection: 39.8 min
  - Collection to lab receipt: 10.5 min
  - Lab receipt to result: 27.9 min
- **Comparable to lactate (99.3 min) and CBC (72.4 min)**
- **Nurse-driven triage screen optimized:** identified at-risk population 99 min earlier than EHR-based provider screen

### Test Utilization
- **IntelliSep ordered in 57.5% of OPA-triggered patients**
- **94.80% ordered from triage OPA** (nurse-driven), 5.1% from physician OPA
- **OPA activation rate:** 13.0% of all ED encounters (consistent throughout study)

## Risk Stratification Validation

### Band 1 ("Sepsis Unlikely") - 49.2% of tested patients
- **Antibiotic utilization:** 40.2-50.0% (lowest among bands)
- **Blood culture utilization:** 23.8-37.0% (significant decline post-implementation)
- **Mortality:** Lowest among all bands

### Band 2 ("Sepsis Possible") - 25.5% of tested patients
- **Antibiotic utilization:** 66.9-84.3%
- **Blood culture utilization:** Transient decline observed
- **27.9% of sepsis DRGs** fell in this band

### Band 3 ("Sepsis Probable") - 25.3% of tested patients
- **Antibiotic utilization:** 94.5-99.1% (highest, appropriate for high-risk)
- **Blood culture utilization:** Increased (appropriate resource allocation)
- **58.3% of sepsis DRGs** fell in this band
- **Significantly higher mortality** than Bands 1 and 2 (p < 0.01)

## Clinical Implementation Model

### Workflow Integration
- **Two-tiered screening system:**
  1. Primary (Triage) OPA: based on vitals and nursing questionnaire
  2. Secondary (Provider) OPA: based on Epic Sepsis Model (predictive analytics, 20-min updates)
- **Three discrete IntelliSep-informed clinical pathways:**
  - Band 1: "Sepsis Unlikely"
  - Band 2: "Sepsis Possible"
  - Band 3: "Sepsis Probable or Definite"
- **Standardized ED workflows** with protocolized IntelliSep ordering

### Education & Adoption
- **Initial training:** journal clubs and "lunch-and-learn" activities in first month
- **No formal ongoing education** after August 2023 (transition period)
- **High adoption rate:** 57.5% of eligible patients tested within one year

## Key Takeaways for Stakeholders

**For Hospital CEOs & CFOs:**
- One life saved per week in 800-bed facility
- 944 fewer blood cultures per year = significant cost savings
- Reduced HLOS for sepsis patients = improved throughput and capacity

**For CMOs & Quality Officers:**
- 40% relative reduction in sepsis mortality (10.9% → 6.6%)
- Improved resource allocation without adverse outcomes
- Objective, data-driven sepsis care pathways

**For Sepsis Coordinators:**
- Protocolized approach operationalizes Surviving Sepsis Campaign guidelines
- Clear clinical pathways reduce variability and diagnostic anchoring
- Nurse-driven triage screen enables earlier identification

**For Lab Directors:**
- TAT comparable to standard tests (lactate, CBC)
- Minimal workflow disruption
- Reduced unnecessary blood culture orders

**For ED Physicians & Nurses:**
- Objective tool reduces diagnostic uncertainty
- Results available in ~78 minutes to guide decision-making
- Nurse-driven triage empowers early risk stratification
