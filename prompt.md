# SSAC 2026 Hackathon Technical Toolkit — Build Instructions

## Context

I'm competing in the MIT Sloan Sports Analytics Conference (SSAC) 2026 Hackathon on March 5th. The theme is **women's sports fandom commercial value**, data provided by Wasserman Foundation. We'll receive an anonymized first-party fan dataset (likely 10K–50K rows, mixed categorical + numeric, survey/behavioral hybrid) at 9 AM and have ~7 hours to analyze, build, and present.

I need a complete, pre-built technical toolkit that I can load on hackathon day, swap in the real CSV filename, and start producing insights immediately. Every minute of setup saved on Thursday is a minute spent on analysis and storytelling.

My stack: Python, Jupyter, pandas, scikit-learn, plotly, seaborn, streamlit. I'm comfortable with clustering, NLP, and full-stack visualization.

---

## Project Structure

Create the following directory structure:

```
ssac-2026/
├── README.md                    # Quick-reference guide for hackathon day
├── requirements.txt             # All dependencies
├── notebooks/
│   ├── 01_eda.ipynb             # Auto-EDA + manual exploration template
│   ├── 02_clustering.ipynb      # End-to-end clustering workflow
│   └── 03_analysis.ipynb        # Post-clustering deep analysis + CVI
├── scripts/
│   ├── preprocessing.py         # Data cleaning + encoding utilities
│   ├── clustering.py            # Clustering algorithms + evaluation
│   ├── profiling.py             # Cluster profiling + Commercial Value Index
│   └── visualization.py         # All chart generation (radar, scatter, heatmap, bar)
├── app/
│   └── dashboard.py             # Streamlit interactive dashboard
├── data/
│   └── .gitkeep                 # Empty — real data goes here Thursday AM
├── outputs/
│   └── .gitkeep                 # Charts, reports, exports land here
└── cheatsheet.md                # Printable one-pager for hackathon day
```

---

## File Specifications

### `requirements.txt`

```
pandas>=2.0
numpy
scikit-learn
matplotlib
seaborn
plotly
kaleido
streamlit
ydata-profiling
sweetviz
kmodes
gower
umap-learn
hdbscan
yellowbrick
textblob
scipy
openpyxl
Jinja2
```

After creating, verify all packages install cleanly with `pip install -r requirements.txt`.

---

### `README.md`

Write a quick-reference README with:
- **Hackathon day quick-start:** step-by-step instructions (drop CSV in `data/`, open `01_eda.ipynb`, change filename, run all cells)
- **Pipeline overview:** EDA → Preprocessing → Clustering → Profiling → CVI → Visualization → Streamlit → Presentation
- **Decision tree:** which clustering method to use based on data type (see clustering.py section below)
- **Time budget:** suggested time allocation for each phase (from 9 AM to 3:45 PM)
- **Emergency fallbacks:** what to do if clustering fails, data is weird, Streamlit crashes, etc.

---

### `scripts/preprocessing.py`

Functions needed:

```python
def load_and_inspect(filepath: str) -> pd.DataFrame:
    """
    Load CSV/Excel, print shape, dtypes, missing counts, first 5 rows.
    Auto-detect delimiter. Handle common encoding issues.
    Return the DataFrame.
    """

def identify_column_types(df: pd.DataFrame) -> dict:
    """
    Auto-classify columns into: numeric_continuous, numeric_ordinal (Likert 1-5 or 1-7),
    categorical_low_cardinality (<10 unique), categorical_high_cardinality (>=10 unique),
    binary, text/freeform, datetime, id_columns (unique per row).
    Return dict like {'numeric_continuous': [...], 'categorical_low': [...], ...}
    """

def clean_data(df: pd.DataFrame, col_types: dict) -> pd.DataFrame:
    """
    Handle missing values:
    - Numeric: median imputation
    - Categorical: mode imputation or 'Unknown' category
    - Drop columns with >50% missing
    - Drop exact duplicate rows
    Return cleaned df + print summary of changes.
    """

def encode_for_clustering(df: pd.DataFrame, col_types: dict) -> tuple:
    """
    Prepare data for clustering:
    - StandardScaler on numeric columns
    - One-hot encode low-cardinality categoricals (or leave as-is for K-Prototypes)
    - Label encode ordinal columns preserving order
    - Return (X_processed, scaler, encoders, feature_names, categorical_indices)
    The categorical_indices list is needed for K-Prototypes.
    """

def create_feature_matrix(df: pd.DataFrame, features: list = None) -> pd.DataFrame:
    """
    Select subset of features for clustering. If features=None, auto-select
    by dropping ID columns, low-variance columns, and highly correlated pairs (r>0.95).
    Return filtered DataFrame.
    """
```

Include proper docstrings, type hints, and print statements that show progress (so I can follow along on hackathon day without reading code).

---

### `scripts/clustering.py`

Functions needed:

```python
def find_optimal_k(X, method='silhouette', k_range=range(2, 9), categorical_indices=None) -> dict:
    """
    Test multiple k values. Compute:
    - Inertia / cost (for elbow plot)
    - Silhouette score
    - Calinski-Harabasz score
    
    If categorical_indices provided, use K-Prototypes. Otherwise K-Means.
    
    Generate and save elbow plot + silhouette plot to outputs/.
    Return dict with scores per k and recommended k.
    """

def run_kmeans(X, k: int) -> np.ndarray:
    """Standard K-Means. Return cluster labels."""

def run_kprototypes(X, k: int, categorical_indices: list) -> np.ndarray:
    """K-Prototypes for mixed data. Return cluster labels."""

def run_kmodes(X, k: int) -> np.ndarray:
    """K-Modes for fully categorical data. Return cluster labels."""

def run_hierarchical(X, k: int, method='ward') -> np.ndarray:
    """Agglomerative clustering. Return cluster labels."""

def run_hdbscan_clustering(X) -> np.ndarray:
    """HDBSCAN for density-based clustering (no k needed). Return cluster labels."""

def cluster_stability_check(X, k: int, n_runs: int = 10, categorical_indices=None) -> float:
    """
    Run clustering n_runs times with different seeds.
    Compute adjusted Rand index between pairs.
    Return mean stability score. Print warning if <0.7.
    """

def auto_cluster(X, col_types: dict, categorical_indices: list = None) -> tuple:
    """
    Decision tree:
    1. Mixed data (has categorical_indices) → K-Prototypes
    2. All numeric, <15 features → K-Means with silhouette-optimal k
    3. All numeric, >=15 features → PCA to 80% variance, then K-Means
    4. All categorical → K-Modes
    5. Fallback: percentile-based segmentation on top 3 variance columns
    
    Return (labels, k, method_used, metadata_dict)
    """
```

Each function should have clear print statements ("Running K-Means with k=4...", "Silhouette score: 0.42", etc).

---

### `scripts/profiling.py`

Functions needed:

```python
def profile_clusters(df: pd.DataFrame, labels: np.ndarray, col_types: dict) -> pd.DataFrame:
    """
    Add cluster labels to df. For each cluster compute:
    - Numeric columns: mean, median, std
    - Categorical columns: mode, top-3 values with %
    - Cluster size (n and %)
    Return a summary DataFrame indexed by cluster.
    """

def name_clusters(profiles: pd.DataFrame, n_clusters: int) -> dict:
    """
    Generate suggested persona names based on dominant traits.
    Use a simple heuristic: look at which features each cluster indexes
    highest on relative to the population mean, combine the top 2-3 traits
    into an evocative name.
    
    Return dict like {0: 'The Values Advocate', 1: 'The Silent Superfan', ...}
    Also print the reasoning for each name.
    
    Pre-loaded name bank (use as starting points, adapt based on actual profiles):
    - "The Values Advocate" — highest on social values / cause alignment
    - "The Sports Purist" — highest on game attendance / stats engagement
    - "The Social Spectator" — highest on social media / group attendance
    - "The Silent Superfan" — high spend but low social / community signals (iso-fan)
    - "The Casual Curious" — low frequency but high growth indicators
    - "The Digital-First Devotee" — streaming/app heavy, low in-person
    - "The Next-Gen Evangelist" — youngest, highest brand receptivity
    """

def compute_cvi(df: pd.DataFrame, labels: np.ndarray, col_types: dict) -> pd.DataFrame:
    """
    Commercial Value Index — composite metric per fan, then averaged per cluster.
    
    Sub-scores (each normalized 0-1 using min-max within the dataset):
    1. Spending Score (weight 0.30): map any spending/purchase columns
    2. Brand Receptivity (weight 0.25): map sponsor awareness, purchase intent, brand recall columns
    3. Engagement Depth (weight 0.20): map frequency, recency, multi-channel engagement columns
    4. Social Amplification (weight 0.15): map sharing, social follows, content interaction columns
    5. Growth Potential (weight 0.10): map age (younger = higher), tenure (newer = higher), avidity trend
    
    IMPORTANT: This function needs to be flexible. On hackathon day, I'll manually
    map which actual columns from the dataset correspond to each sub-score.
    
    Include a helper function:
    def map_columns_to_subscores(df, mapping: dict) -> pd.DataFrame
    where mapping = {
        'spending_score': ['col_a', 'col_b'],
        'brand_receptivity': ['col_c'],
        ...
    }
    that averages the mapped columns per sub-score before normalizing.
    
    Return df with CVI column + sub-score columns, and a summary by cluster.
    """

def generate_cluster_comparison(df: pd.DataFrame, labels: np.ndarray, col_types: dict) -> pd.DataFrame:
    """
    For each feature, compute the cluster mean vs population mean.
    Express as index (cluster_mean / pop_mean * 100).
    Values >120 = "over-indexes", <80 = "under-indexes".
    Return a styled DataFrame that highlights over/under-indexing.
    """

def segment_size_and_value(df: pd.DataFrame, labels: np.ndarray) -> pd.DataFrame:
    """
    Compute per cluster: n, % of total, mean CVI, total CVI (n * mean CVI),
    % of total CVI. This shows which segments punch above/below their weight.
    Return sorted by total CVI descending.
    """
```

---

### `scripts/visualization.py`

Functions needed. All charts should use a consistent color palette. Define it at the top:

```python
PALETTE = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
BACKGROUND = '#1a1a2e'  # Dark background for presentation slides
TEXT_COLOR = '#ffffff'
```

Every plot function should:
- Accept a `save_path` parameter (default None). If provided, save to that path as PNG (300 dpi).
- Return the figure object so it can be displayed in Jupyter or Streamlit.
- Use the consistent palette above.
- Have clean, readable labels (no default matplotlib ugliness).

```python
def plot_radar(profiles_df: pd.DataFrame, features: list, cluster_names: dict, save_path=None):
    """
    Plotly radar/spider chart. One trace per cluster.
    Features on the angular axis, normalized values (0-1) on radial.
    Legend with cluster names. Clean, presentation-ready.
    """

def plot_cluster_scatter(X_2d: np.ndarray, labels: np.ndarray, cluster_names: dict, method_name='UMAP', save_path=None):
    """
    2D scatter plot of dimensionality-reduced data colored by cluster.
    Plotly for interactivity. Show cluster centroids as larger markers.
    """

def plot_cvi_bar(segment_summary: pd.DataFrame, cluster_names: dict, save_path=None):
    """
    Horizontal bar chart: clusters ranked by Commercial Value Index.
    Show both mean CVI and total CVI (size * mean). 
    Annotate with segment size %.
    """

def plot_cluster_heatmap(comparison_df: pd.DataFrame, cluster_names: dict, save_path=None):
    """
    Seaborn heatmap of cluster index values (cluster mean / pop mean * 100).
    Red for over-index (>120), blue for under-index (<80), white for neutral.
    Features on y-axis, clusters on x-axis.
    """

def plot_feature_distributions(df: pd.DataFrame, feature: str, labels: np.ndarray, cluster_names: dict, save_path=None):
    """
    Overlapping histograms or violin plots of a single feature split by cluster.
    Useful for deep-diving into a specific finding.
    """

def plot_segment_size_value(size_value_df: pd.DataFrame, cluster_names: dict, save_path=None):
    """
    Bubble chart or grouped bar: x = % of population, y = % of total CVI.
    Segments above the diagonal line are high-value (punch above weight).
    Segments below are underperforming relative to size.
    This is the "so what" chart.
    """

def reduce_dimensions(X, method='umap', n_components=2):
    """
    Reduce to 2D using UMAP or PCA.
    Return X_2d array.
    Handle UMAP import gracefully (fall back to PCA if UMAP fails).
    """

def export_all_charts(outputs_dir: str = 'outputs/'):
    """
    Convenience function that saves all generated figures to outputs/.
    Call this at the end of the analysis notebook.
    """
```

---

### `notebooks/01_eda.ipynb`

Create as a Jupyter notebook with these cells. Each cell should have a markdown header above it explaining what it does.

**Cell structure:**

1. **Setup + Load Data**
   - Imports (pandas, numpy, matplotlib, seaborn, plotly, ydata_profiling)
   - `sys.path.append('../scripts')` to import our modules
   - `from preprocessing import *`
   - `df = load_and_inspect('../data/CHANGEME.csv')`
   - **BIG COMMENT: "⬆️ CHANGE THE FILENAME ABOVE ⬆️"**

2. **Auto Column Type Detection**
   - `col_types = identify_column_types(df)`
   - Print the classification

3. **Auto EDA Report** (runs in background)
   - `profile = ProfileReport(df, title="SSAC Fan Data", explorative=True, minimal=True)`
   - `profile.to_file("../outputs/eda_report.html")`
   - Note: "Open eda_report.html in browser for full interactive report"

4. **Numeric Distributions**
   - `.describe()` for all numeric columns
   - Grid of histograms (4 columns wide, auto-rows)

5. **Categorical Breakdowns**
   - Value counts for each categorical column
   - Bar charts for top categories

6. **Missing Data Visualization**
   - Heatmap of missing values
   - Bar chart of % missing per column

7. **Correlation Analysis**
   - Correlation heatmap for numeric columns
   - Print top 10 strongest correlations (excluding self)

8. **Key Variable Deep Dives** (placeholder cells with comments)
   - "# SPENDING VARIABLES — uncomment and adapt"
   - "# ENGAGEMENT VARIABLES — uncomment and adapt"
   - "# DEMOGRAPHIC SPLITS — uncomment and adapt"
   - Each with example code for cross-tabs and grouped bar charts

9. **Initial Observations** (empty markdown cell)
   - Template: "### Key observations from EDA:\n1. \n2. \n3. \n### Hypotheses for clustering:\n1. \n2. \n3."

---

### `notebooks/02_clustering.ipynb`

**Cell structure:**

1. **Setup**
   - Imports + sys.path for scripts
   - Load cleaned data from 01_eda (or re-load and clean)
   - `from preprocessing import *`
   - `from clustering import *`
   - `from profiling import *`
   - `from visualization import *`

2. **Feature Selection**
   - `feature_df = create_feature_matrix(df)` 
   - Print selected features and rationale
   - **MANUAL OVERRIDE CELL:** "# Uncomment to manually select features:\n# features = ['col_a', 'col_b', ...]\n# feature_df = df[features]"

3. **Encoding**
   - `X, scaler, encoders, feature_names, cat_idx = encode_for_clustering(feature_df, col_types)`

4. **Find Optimal K**
   - `k_results = find_optimal_k(X, categorical_indices=cat_idx)`
   - Display elbow + silhouette plots
   - **MANUAL OVERRIDE:** `# k = 4  # Override if you disagree with auto-selection`

5. **Run Clustering**
   - `labels, k, method, meta = auto_cluster(X, col_types, cat_idx)`
   - Or manual: `labels = run_kmeans(X, k=4)` / `labels = run_kprototypes(X, k=4, cat_idx)`
   - Print cluster sizes

6. **Stability Check**
   - `stability = cluster_stability_check(X, k, categorical_indices=cat_idx)`

7. **Dimensionality Reduction + Scatter**
   - `X_2d = reduce_dimensions(X, method='umap')`
   - `plot_cluster_scatter(X_2d, labels, cluster_names={})`

8. **Quick Profile Preview**
   - `profiles = profile_clusters(df, labels, col_types)`
   - Display profiles table

9. **Name the Clusters**
   - `cluster_names = name_clusters(profiles, k)`
   - **MANUAL OVERRIDE:** `# cluster_names = {0: 'Your Name', 1: 'Your Name', ...}`

10. **Save Results**
    - `df['cluster'] = labels`
    - `df.to_csv('../data/clustered_data.csv', index=False)`

---

### `notebooks/03_analysis.ipynb`

**Cell structure:**

1. **Setup + Load Clustered Data**
   - Load `clustered_data.csv`
   - Import all scripts

2. **Commercial Value Index**
   - **MAPPING CELL (this is where hackathon-day work happens):**
   ```python
   # MAP YOUR ACTUAL COLUMNS HERE:
   cvi_mapping = {
       'spending_score': [],       # e.g., ['ticket_spend', 'merch_spend']
       'brand_receptivity': [],    # e.g., ['sponsor_awareness', 'purchase_intent']
       'engagement_depth': [],     # e.g., ['games_attended', 'app_sessions']
       'social_amplification': [], # e.g., ['social_shares', 'content_engagement']
       'growth_potential': [],     # e.g., ['age_inverted', 'fan_tenure_inverted']
   }
   ```
   - `df = compute_cvi(df, labels, col_types)`

3. **Segment Size vs Value Analysis**
   - `sv = segment_size_and_value(df, labels)`
   - `plot_segment_size_value(sv, cluster_names)`
   - This is the slide 7 chart — "which segments punch above their weight"

4. **Cluster Comparison Index**
   - `comparison = generate_cluster_comparison(df, labels, col_types)`
   - `plot_cluster_heatmap(comparison, cluster_names)`

5. **Full Radar Chart**
   - Select top 6–8 features that differentiate clusters most
   - `plot_radar(profiles, features, cluster_names)`

6. **CVI Bar Chart**
   - `plot_cvi_bar(sv, cluster_names)`

7. **Deep Dive: The Undervalued Segment** (placeholder)
   - Template for isolating the most interesting cluster and doing additional analysis
   - Cross-tabs, feature distributions, comparison to population

8. **Deep Dive: Outlier / Iso-Fan Analysis** (placeholder)
   - Template for identifying iso-fan-like patterns in the data
   - Filter for high-spend + low-social or low-community signals

9. **Export All Visualizations**
   - Save every chart to `outputs/` as PNG 300dpi
   - `export_all_charts()`

10. **Presentation-Ready Findings Summary** (markdown cell)
    - Template:
    ```
    ### Finding 1: [Title]
    **The insight:** 
    **The evidence:** 
    **The activation opportunity:** 
    **The dollar figure:** 
    
    ### Finding 2: [Title]
    ...
    
    ### Finding 3: [Title]
    ...
    ```

---

### `app/dashboard.py`

Full Streamlit app. Should be runnable with `streamlit run app/dashboard.py` from project root.

**Layout:**

- **Sidebar:** Segment selector dropdown, feature selector for deep dives
- **Top row:** 4 KPI metric cards (Total fans, Segments found, Highest CVI segment name, Total untapped value estimate)
- **Row 2:** Two columns — Radar chart (left), UMAP scatter (right)  
- **Row 3:** CVI bar chart (full width)
- **Row 4:** Segment size vs value bubble chart (full width)
- **Row 5:** Expandable cards for each segment with profile details, key traits, recommended activation
- **Row 6:** Raw data explorer with filtering (for judges who want to poke around)

The app should:
- Try to load `data/clustered_data.csv` on startup
- If file not found, show a friendly message + file uploader widget
- Use `@st.cache_data` on data loading
- Use the same color palette as visualization.py
- Have a title: "Women's Sports Fan Segments: Unlocking Commercial Value"
- Include a brief methodology note in a collapsed expander

---

### `cheatsheet.md`

Printable one-pager with:

**5 Key Stats:**
| Stat | Source |
|------|--------|
| $2.5B monetization gap | McKinsey |
| 94% of women fans feel misunderstood | Wasserman |
| 2x engagement, 21x less earnings for women athletes | Wasserman/RBC |
| 286% avg ROI for WNBA Changemaker sponsors | Deloitte |
| 46% Gen Z more likely to buy from women's sports sponsors | Parity |

**Clustering Decision Tree:**
```
Mixed data? → K-Prototypes
All numeric? → StandardScaler → K-Means (silhouette for k)
All categorical? → K-Modes
Nothing works? → Percentile segmentation on top 3 columns
```

**Presentation Structure:**
```
Slide 1: Title + thesis (15 sec)
Slide 2: The problem — 94% feel misunderstood (45 sec)  
Slide 3: Data + methodology (30 sec)
Slides 4–6: Three findings with persona profiles (60 sec each)
Slide 7: Recommendations — what to do Monday morning (45 sec)
Slide 8: Summary + Q&A
```

**Emergency Playbook:**
- Clustering nonsense → manual percentile segmentation
- Streamlit crash → static PNGs in slides
- Running late → stop coding 2:45 PM no matter what
- Weird data → descriptive analytics + hypothesis generation

**CVI Formula:**
```
CVI = 0.30(Spending) + 0.25(Brand Receptivity) + 0.20(Engagement) + 0.15(Social Amplification) + 0.10(Growth Potential)
```

---

## Validation

After generating all files, run these checks:
1. `pip install -r requirements.txt` — all packages install without errors
2. `python -c "from scripts.preprocessing import *; from scripts.clustering import *; from scripts.profiling import *; from scripts.visualization import *; print('All imports OK')"` — no import errors
3. `streamlit run app/dashboard.py` — app launches without errors (will show "file not found" message, that's expected)
4. Open `notebooks/01_eda.ipynb` in Jupyter — all cells render, no syntax errors
5. Generate a small synthetic dataset and run the full pipeline through all 3 notebooks to confirm everything works end-to-end

Create a `tests/test_pipeline.py` that generates synthetic mixed data (500 rows, 5 numeric + 3 categorical columns simulating a fan survey) and runs the full pipeline: load → clean → encode → cluster → profile → name → CVI → visualize. This is the ultimate validation that everything works before hackathon day.

---

## Style Notes

- Use f-strings everywhere
- Type hints on all function signatures
- Docstrings on every function (Google style)
- Print progress statements liberally ("✅ Loaded 45,231 rows with 28 columns", "🔍 Running K-Means with k=4...", "📊 Generating radar chart...")
- Use emoji in print statements sparingly but consistently for visual scanning
- Comments should explain WHY, not WHAT
- All visualization functions should work in both Jupyter and Streamlit contexts
