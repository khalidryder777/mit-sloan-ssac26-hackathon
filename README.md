# SSAC 2026 Hackathon — Women's Sports Fan Segmentation Toolkit

> "In the face of overwhelming data, the only correct response is to
> science the sh\*t out of it." — Mark Watney, probably

## Hackathon Day Quick-Start (Read This First)

You have ~7 hours. Every minute spent on setup is a minute NOT spent on
the analysis that wins this thing. Here's the speedrun:

### Step 0: Environment (do this BEFORE 9 AM)
```bash
pip install -r requirements.txt
```

### Step 1: Drop the data (9:00 AM)
- Save the CSV into `data/`
- That's it. That's the step.

### Step 2: EDA (9:00 – 10:00 AM)
- Open `notebooks/01_eda.ipynb`
- Change `CHANGEME.csv` to your actual filename
- Run all cells
- Fill in the "Key Observations" section at the bottom
- Check `outputs/eda_report.html` in your browser

### Step 3: Clustering (10:00 – 11:30 AM)
- Open `notebooks/02_clustering.ipynb`
- Change the filename again (yes, again)
- Run through the cells — the auto_cluster function picks the best method
- Override k or method if the auto-selection looks off
- **Name your clusters** — this is where personas come alive

### Step 4: Analysis + CVI (11:30 AM – 1:00 PM)
- Open `notebooks/03_analysis.ipynb`
- **CRITICAL: Fill in the CVI mapping** (cell 2) — map your actual columns
  to spending, brand receptivity, engagement, social, growth potential
- Run the size-vs-value chart — this is your money slide
- Fill in the Findings Summary at the bottom

### Step 5: Visualize + Dashboard (1:00 – 2:00 PM)
- Charts auto-save to `outputs/`
- Run `streamlit run app/dashboard.py` for the interactive dashboard
- Grab screenshots if Streamlit acts up

### Step 6: Presentation (2:00 – 3:45 PM)
- Build slides using charts from `outputs/`
- Follow the structure in `cheatsheet.md`
- **STOP CODING AT 2:45 PM** — no exceptions

---

## Pipeline Overview

```
CSV Data
  ↓
01_eda.ipynb ──→ EDA Report + Column Types + Observations
  ↓
02_clustering.ipynb ──→ Feature Selection → Encoding → Clustering → Naming
  ↓
03_analysis.ipynb ──→ CVI Computation → Size vs Value → Heatmaps → Radar Charts
  ↓
app/dashboard.py ──→ Interactive Streamlit Dashboard
  ↓
outputs/ ──→ All Charts (PNG, 300 DPI) → Presentation Slides
```

---

## Clustering Decision Tree

```
What kind of data do you have?
│
├── Mixed (numeric + categorical) ──→ K-Prototypes
│     └── Set categorical_indices in encode_for_clustering()
│
├── All numeric
│     ├── < 15 features ──→ K-Means (silhouette for optimal k)
│     └── ≥ 15 features ──→ PCA (80% variance) → K-Means
│
├── All categorical ──→ K-Modes
│
└── Nothing working? ──→ Percentile segmentation on top 3 variance columns
      └── (The "I refuse to go home empty-handed" option)
```

---

## Time Budget

| Phase | Time | What You're Doing |
|-------|------|-------------------|
| Setup | 9:00 – 9:05 | Drop CSV, verify imports |
| EDA | 9:05 – 10:00 | Understand the data, form hypotheses |
| Preprocessing | 10:00 – 10:30 | Clean, encode, select features |
| Clustering | 10:30 – 11:30 | Find k, run clustering, validate stability |
| CVI + Analysis | 11:30 – 1:00 | Map CVI columns, compute indices, find insights |
| Visualization | 1:00 – 2:00 | Generate all charts, run Streamlit |
| Presentation | 2:00 – 3:00 | Build slides, write script |
| Practice | 3:00 – 3:45 | Rehearse. Twice. Then once more. |

---

## Emergency Fallbacks

| Problem | Solution |
|---------|----------|
| Clustering produces garbage | Manual percentile segmentation on top 3 columns |
| UMAP/HDBSCAN crashes | Fall back to PCA + K-Means (always works) |
| Streamlit won't launch | Use static PNGs from `outputs/` in slides |
| Too many features | PCA to 80% variance, then cluster |
| Data is entirely categorical | K-Modes (already handled by auto_cluster) |
| Missing >50% of a column | auto-dropped by clean_data() |
| Running out of time | STOP CODING AT 2:45 PM. Use what you have. |
| CVI mapping is unclear | Use equal weights on all numeric columns as proxy |
| Judges ask hard questions | "Great question — that's exactly what our next analysis would explore" |

---

## Project Structure

```
ssac-2026/
├── README.md                    ← You are here
├── requirements.txt             ← All dependencies
├── cheatsheet.md                ← Printable one-pager for hackathon day
├── notebooks/
│   ├── 01_eda.ipynb             ← Auto-EDA + manual exploration
│   ├── 02_clustering.ipynb      ← End-to-end clustering workflow
│   └── 03_analysis.ipynb        ← Post-clustering analysis + CVI
├── scripts/
│   ├── preprocessing.py         ← Data cleaning + encoding utilities
│   ├── clustering.py            ← Clustering algorithms + evaluation
│   ├── profiling.py             ← Cluster profiling + CVI
│   └── visualization.py         ← All chart generation
├── app/
│   └── dashboard.py             ← Streamlit interactive dashboard
├── data/
│   └── .gitkeep                 ← Real data goes here Thursday AM
├── outputs/
│   └── .gitkeep                 ← Charts, reports, exports land here
└── tests/
    └── test_pipeline.py         ← End-to-end validation
```

---

## CVI Formula

```
Commercial Value Index (CVI) =
    0.30 × Spending Score
  + 0.25 × Brand Receptivity
  + 0.20 × Engagement Depth
  + 0.15 × Social Amplification
  + 0.10 × Growth Potential
```

Each sub-score is the average of mapped columns, normalized 0–1 (min-max).

---

*Built with the optimism of someone who thinks 7 hours is plenty of time,
and the paranoia of someone who knows it absolutely is not.*
