# Commercial Roofing Profitability Demo

This project is a polished demonstration of how a commercial roofing contractor could use historical job data to understand profit margin, improve estimating discipline, spot operational issues, and support better business-development decisions.

The example is built around a synthetic portfolio of completed commercial roofing projects in Southwest Florida. It is designed for a business owner or executive audience: practical enough to explain in a meeting, but technical enough to show how regression and job-level profitability analysis can be used responsibly.

## What This Demonstrates

- How job-level data can reveal the difference between revenue growth and profitable growth.
- How project type, roof system, geography, lead source, bid pressure, discounting, complexity, and delays can be analyzed together.
- How regression can help compare jobs more fairly by controlling for observed differences in job mix.
- How a contractor could use completed-job history to improve estimating, post-job reviews, sales focus, and marketing decisions.
- How the same analysis can be presented in both notebook form and as an executive dashboard.

## Important Note About the Data

The dataset in this project is synthetic. It does not represent any actual roofing contractor, customer list, bid history, or job-costing system.

The purpose is to show the analytical approach. Real pricing, staffing, marketing, and operating decisions would require the contractor's actual estimating, accounting, job-costing, CRM, lead-generation, and completed-job data.

## Project Files

- `commercial_roofing_profitability_demo.ipynb`  
  Full Jupyter Notebook with synthetic data generation, exploratory analysis, regression models, scenario comparisons, charts, and executive narrative.

- `synthetic_swfl_commercial_roofing_projects.csv`  
  Generated dataset of 520 synthetic completed commercial roofing projects from 2019 through 2025.

- `index.html`, `styles.css`, `app.js`  
  Static frontend dashboard that loads the CSV and presents the analysis in a website format suitable for GitHub Pages.

- `.nojekyll`  
  Keeps GitHub Pages from applying Jekyll processing to the static site.

## Analysis Themes

The notebook and dashboard focus on questions a roofing company owner might actually care about:

- Which job types and roof systems tend to produce stronger margins?
- Are competitive bids and discounts eroding profitability?
- Do certain lead sources produce better work, or just more opportunities?
- Are schedule overruns associated with margin leakage?
- Does hurricane-related work create enough margin to justify the operational strain?
- Are some towns, customer types, or project categories more attractive than others?
- How could actual company data be used to support estimating discipline and marketing focus?

## Website Dashboard

The dashboard is intentionally static: no backend, no database, and no build process. It can be hosted directly from GitHub Pages and reads the included CSV file in the browser.

For a local preview:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Where This Could Go With Real Company Data

A real version of this project would usually start with a structured review of the contractor's available data: estimating spreadsheets, accounting exports, job-costing reports, CRM or lead records, material and labor information, and completed-job history.

From there, the analysis could support a historical profitability diagnostic, an estimating and bid-discipline tool, marketing ROI analysis, customer segmentation, storm-response profitability analysis, and ongoing executive reporting.
