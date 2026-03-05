# SSAC 2026 — Hackathon Day Cheatsheet

> Print this. Tape it to your monitor. Tattoo it on your forearm if needed.

---

## 5 Key Stats (for slides + judges)

| Stat | Source |
|------|--------|
| $2.5B monetization gap in women's sports | McKinsey |
| 94% of women fans feel misunderstood by brands | Wasserman |
| 2x engagement, 21x less earnings for women athletes | Wasserman/RBC |
| 286% avg ROI for WNBA Changemaker sponsors | Deloitte |
| 46% Gen Z more likely to buy from women's sports sponsors | Parity |

Use these to frame the "why this matters" narrative. Every finding should
connect back to at least one of these stats. It's called "anchoring" and
it makes you sound 40% more credible (source: I made that up, but it works).

---

## Speed Run

```
9:00  → Drop CSV in data/, open 01_eda.ipynb, CHANGE THE FILENAME
9:05  → Run all EDA cells, fill in observations
10:00 → Open 02_clustering.ipynb, run clustering pipeline
10:30 → Pick k, validate stability, name clusters
11:30 → Open 03_analysis.ipynb, MAP YOUR CVI COLUMNS (cell 2)
12:00 → Generate all charts, identify top 3 findings
1:00  → streamlit run app/dashboard.py
2:00  → START BUILDING SLIDES (stop all coding)
2:45  → STOP CODING. FULL STOP. I MEAN IT.
3:00  → Practice presentation (aim for 4 min)
3:45  → Present. Nail it. Win. Celebrate.
```

---

## Clustering Decision Tree

```
Mixed data?      → K-Prototypes
All numeric?     → StandardScaler → K-Means (silhouette for k)
  ≥15 features?  → PCA first, then K-Means
All categorical? → K-Modes
Nothing works?   → Percentile segmentation on top 3 columns
                   (desperate times, desperate measures)
```

---

## Presentation Structure

```
Slide 1: Title + thesis                         (15 sec)
         "X segments of women's sports fans, Y% are underserved"

Slide 2: The problem — 94% feel misunderstood   (45 sec)
         Frame the $2.5B gap

Slide 3: Data + methodology                     (30 sec)
         "N fans, K segments, validated with silhouette + stability"

Slides 4-6: Three findings with persona profiles (60 sec each)
         Each: insight → evidence → activation → dollar figure

Slide 7: Recommendations — what to do Monday     (45 sec)
         Three actionable strategies

Slide 8: Summary + Q&A                          (15 sec)
         One-sentence thesis restatement
```

Total: ~5 minutes. Practice cutting, not adding.

---

## CVI Formula

```
CVI = 0.30 × Spending
    + 0.25 × Brand Receptivity
    + 0.20 × Engagement
    + 0.15 × Social Amplification
    + 0.10 × Growth Potential

Each sub-score: average of mapped columns, normalized 0-1 (min-max)
```

---

## Emergency Playbook

| Emergency | What To Do |
|-----------|-----------|
| Clustering is nonsense | Manual percentile segmentation on 3 key columns |
| Streamlit crashes | Screenshots of static PNGs from outputs/ |
| Running late | STOP CODING AT 2:45 PM. Use what you have. |
| Data is weird | Descriptive analytics + hypothesis generation (still wins) |
| Too many features | PCA to 80% variance, then cluster |
| K-Prototypes fails | One-hot encode everything, use K-Means |
| UMAP fails | PCA to 2D (always works) |
| Can't name clusters | Use the name bank in profiling.py as inspiration |
| Judges stump you | "That's a great direction for future work" |
| Panic | Breathe. You prepped for this. The toolkit works. Trust it. |

---

## Column Mapping Reminder (for CVI)

Fill this in when you see the actual data:

```python
cvi_mapping = {
    'spending_score':       [________________],
    'brand_receptivity':    [________________],
    'engagement_depth':     [________________],
    'social_amplification': [________________],
    'growth_potential':     [________________],
}
```

---

*"Every problem on Earth can be solved with enough potatoes."*
*— Mark Watney, The Martian*

*"Every problem at a hackathon can be solved with enough clusters."*
*— You, probably, at 2:30 PM tomorrow*
