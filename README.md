# Commercial Roofing Profitability Demo

This repo contains two versions of the same synthetic demonstration:

- `commercial_roofing_profitability_demo.ipynb`: the full notebook with data generation, exploratory analysis, regression models, and narrative.
- `index.html`: a static dashboard version designed for GitHub Pages.

The data is synthetic and is included in `synthetic_swfl_commercial_roofing_projects.csv`. It is meant to demonstrate the analytical approach, not to represent any actual roofing company.

## Launch as a GitHub Pages Site

1. Push this repo to GitHub.
2. Go to the repo's **Settings** tab.
3. Open **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the branch you want to publish, usually `main`.
6. Select the root folder, `/`.
7. Save.

After GitHub finishes publishing, the dashboard will open at the GitHub Pages URL for the repository.

## Local Preview

Because the dashboard loads the CSV with JavaScript, preview it through a local web server:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```
