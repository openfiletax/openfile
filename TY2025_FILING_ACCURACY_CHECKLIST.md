# TY2025 Filing-Accuracy Checklist (OpenFile)

Date run: 2026-03-29 (America/New_York)

## Source documents used
- IRS Rev. Proc. 2024-40 (TY2025 inflation adjustments): https://www.irs.gov/pub/irs-drop/rp-24-40.pdf
- IRS Rev. Proc. 2024-25 (TY2025 HSA/HDHP): https://www.irs.gov/pub/irs-drop/rp-24-25.pdf
- IRS Notice 2024-80 (TY2025 Saver's Credit AGI thresholds): https://www.irs.gov/pub/irs-drop/n-24-80.pdf
- IRS Publication 501 (2025): https://www.irs.gov/pub/irs-pdf/p501.pdf
- Alaska DOR 2025 PFD announcement: https://dor.alaska.gov/department-of-revenue/news-detail/2025/09/22/department-of-revenue-announces-2025-permanent-fund-dividend-amount

## Results

| Check | Status | Evidence |
|---|---|---|
| Tax year set to TY2025 in fact graph | PASS | `/taxYear` updated to `2025` in `constants.xml`; all touched TY-specific facts set to `<TaxYear>2025</TaxYear>`. |
| Standard deduction values (Rev. Proc. 2024-40 §2.15) | PASS | XML has `30000/22500/15000`, dependent floor `1350`, additional SD `1600/2000`; matches Rev. Proc lines showing §63 updates for TY2025. |
| Tax brackets (Rev. Proc. 2024-40 §2.01) | PASS | MFJ/HOH/Single/MFS breakpoints and base-tax amounts in `taxCalculations.xml` match TY2025 bracket tables in Rev. Proc. |
| HSA + HDHP limits (Rev. Proc. 2024-25 §2.01) | PASS | XML has `4300/8550`, HDHP deductibles `1650/3300`, OOP max `8300/16600`; matches Rev. Proc. 2024-25. |
| EITC inflation values (Rev. Proc. 2024-40 §2.06) | PASS | XML phase-in limits, max credits (`649/4328/7152/8046`), phaseout thresholds/limits, investment income limit `11950` match TY2025 Rev. Proc values. |
| PTC repayment caps (Rev. Proc. 2024-40 §2.07) | PASS | XML repayment limits `375/750`, `975/1950`, `1625/3250` match TY2025 Rev. Proc table. |
| Saver's Credit AGI thresholds (Notice 2024-80) | PASS | XML thresholds updated to TY2025 values (MFJ `47500/51000/79000`, HOH `35625/38250/59250`, other `23750/25500/39500`). |
| Student loan interest phaseout (Rev. Proc. 2024-40 §2.30) | PASS | XML has phaseout start/end `85k/100k` and `170k/200k`; matches Rev. Proc TY2025. |
| Qualifying-relative gross-income test (Rev. Proc. 2024-40 §2.24) | PASS | XML updated `5050 -> 5200`; matches Rev. Proc TY2025. |
| Alaska PFD amount for 2025 | PASS | XML has dividend `1000.00`, energy-relief `0.00`; matches Alaska DOR 2025 announcement ($1,000 PFD, no separate energy relief payment announced). |
| OASDI wage base used for W-2 KO logic | PASS | XML updated to `176100` for TY2025 flow logic. |
| Runtime PDF path points at TY2025 tree | PASS | `application.yaml` now points to `pdf/2025/...`; `pdf/2025` exists with 76 files. |
| Runtime uses official TY2025 PDF binaries/mappings | PASS | `direct-file/backend/src/main/resources/pdf/2025` replaced with official TY2025 IRS binaries (including `f1040_accessible.pdf`, `f1040s1_accessible.pdf`, `f1040s2_accessible.pdf`, `f1040s3_accessible.pdf`, `f1040s_accessible.pdf`, `f1040sb_accessible.pdf`, `f1040sei_accessible.pdf`, `f8812_accessible.pdf`, `f2441_accessible.pdf`, `f8862_accessible.pdf`, `f8880_accessible.pdf`, `f8889_accessible.pdf`, `f8962_accessible.pdf`, `f1040lep_accessible.pdf` and Spanish equivalents where used). Backend tests pass with these assets loaded. |
| Backend regression suite | PASS | `./mvnw test` in `direct-file/backend` passed: `Tests run: 157, Failures: 0, Errors: 0`. |
| df-client scenario/fact-dictionary regression (`npm run test:ci`) | PASS | Re-ran after TY2025 baseline updates: `Test Files 171 passed | 4 skipped (175)` and `Tests 13143 passed | 24 skipped | 10 todo`. |
| df-client completeness/functional regression (`npm run test:ci:2`) | PASS | Re-ran after TY2025 flow/value baseline updates: `Test Files 16 passed | 1 skipped (17)` and `Tests 814 passed | 32 skipped (846)`. |
| df-client all-screens regression (`npm run test:ci:3`) | PASS | Passed: `1 file`, `2 tests`. |

## Final assessment

Current state is **filing-accurate for TY2025 based on the implemented constants, loaded TY2025 PDFs, and green regression suites (`test:ci`, `test:ci:2`, `test:ci:3`, backend `mvn test`)**.
