"""
clustering_pipeline.py
MIT Sloan SSAC 2026 Hackathon — Clustering Pipeline

This script provides an end-to-end clustering pipeline that supports:
  - Numeric data     : KMeans (scikit-learn) or HDBSCAN
  - Mixed data       : Gower distance + KMedoids (kmodes / custom)
  - High-dimensional : UMAP dimensionality reduction before clustering
  - Categorical-only : KModes

Usage:
    python scripts/clustering_pipeline.py --data data/dataset.csv \
        --method kmeans --n_clusters 5 --output data/clustered.csv
"""

import argparse
import os
import warnings

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from yellowbrick.cluster import KElbowVisualizer
import hdbscan
import umap
import gower
from kmodes.kmodes import KModes
from kmodes.kprototypes import KPrototypes

warnings.filterwarnings("ignore")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_data(path: str) -> pd.DataFrame:
    """Load a CSV or Parquet file into a DataFrame."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Data file not found: {path}")
    if path.endswith(".parquet"):
        return pd.read_parquet(path)
    return pd.read_csv(path)


def preprocess_numeric(df: pd.DataFrame) -> tuple[pd.DataFrame, StandardScaler]:
    """Scale numeric columns; return scaled DataFrame and fitted scaler."""
    num_cols = df.select_dtypes(include=np.number).columns.tolist()
    scaler = StandardScaler()
    df_scaled = df.copy()
    df_scaled[num_cols] = scaler.fit_transform(df[num_cols])
    return df_scaled, scaler


def reduce_dimensions(X: np.ndarray, n_components: int = 2, random_state: int = 42) -> np.ndarray:
    """Reduce feature matrix with UMAP."""
    reducer = umap.UMAP(n_components=n_components, random_state=random_state)
    return reducer.fit_transform(X)


# ---------------------------------------------------------------------------
# Clustering methods
# ---------------------------------------------------------------------------

def run_kmeans(X: np.ndarray, n_clusters: int, random_state: int = 42) -> np.ndarray:
    """Fit KMeans and return cluster labels."""
    model = KMeans(n_clusters=n_clusters, random_state=random_state, n_init="auto")
    return model.fit_predict(X)


def run_hdbscan(X: np.ndarray, min_cluster_size: int = 5) -> np.ndarray:
    """Fit HDBSCAN and return cluster labels (-1 = noise)."""
    clusterer = hdbscan.HDBSCAN(min_cluster_size=min_cluster_size)
    return clusterer.fit_predict(X)


def run_kmodes(df: pd.DataFrame, n_clusters: int, random_state: int = 42) -> np.ndarray:
    """Fit KModes on categorical columns and return cluster labels."""
    cat_cols = df.select_dtypes(include="object").columns.tolist()
    if not cat_cols:
        raise ValueError("KModes requires categorical columns.")
    km = KModes(n_clusters=n_clusters, init="Huang", n_init=5, random_state=random_state)
    return km.fit_predict(df[cat_cols])


def run_kprototypes(df: pd.DataFrame, n_clusters: int, random_state: int = 42) -> np.ndarray:
    """Fit KPrototypes on mixed data and return cluster labels."""
    cat_cols = df.select_dtypes(include="object").columns.tolist()
    cat_indices = [df.columns.get_loc(c) for c in cat_cols]
    if not cat_indices:
        raise ValueError("KPrototypes requires at least one categorical column.")
    kp = KPrototypes(n_clusters=n_clusters, init="Huang", n_init=5, random_state=random_state)
    return kp.fit_predict(df.to_numpy(), categorical=cat_indices)


def run_gower_hdbscan(df: pd.DataFrame, min_cluster_size: int = 5) -> np.ndarray:
    """Compute Gower distance matrix then cluster with HDBSCAN."""
    dist_matrix = gower.gower_matrix(df)
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=min_cluster_size,
        metric="precomputed",
    )
    return clusterer.fit_predict(dist_matrix)


# ---------------------------------------------------------------------------
# Evaluation & visualisation
# ---------------------------------------------------------------------------

def evaluate_clusters(X: np.ndarray, labels: np.ndarray) -> None:
    """Print silhouette score (skips noise label -1)."""
    mask = labels != -1
    if mask.sum() < 2 or len(set(labels[mask])) < 2:
        print("Silhouette score: N/A (too few clusters or all noise)")
        return
    score = silhouette_score(X[mask], labels[mask])
    print(f"Silhouette score: {score:.4f}")


def plot_clusters_2d(X_2d: np.ndarray, labels: np.ndarray, title: str = "Clusters (UMAP projection)") -> None:
    """Scatter plot of 2-D projection coloured by cluster label."""
    plt.figure(figsize=(9, 6))
    scatter = plt.scatter(X_2d[:, 0], X_2d[:, 1], c=labels, cmap="tab10", s=15, alpha=0.7)
    plt.colorbar(scatter, label="Cluster")
    plt.title(title)
    plt.xlabel("UMAP-1")
    plt.ylabel("UMAP-2")
    plt.tight_layout()
    plt.savefig("cluster_plot.png", dpi=150)
    print("Cluster plot saved to cluster_plot.png")


def elbow_plot(X: np.ndarray, k_range: range = range(2, 11)) -> None:
    """Use Yellowbrick to display the elbow curve for KMeans."""
    model = KMeans(random_state=42, n_init="auto")
    visualizer = KElbowVisualizer(model, k=k_range)
    visualizer.fit(X)
    visualizer.show(outpath="elbow_plot.png")
    print("Elbow plot saved to elbow_plot.png")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Clustering pipeline for SSAC 2026 hackathon")
    parser.add_argument("--data", required=True, help="Path to input CSV/Parquet file")
    parser.add_argument(
        "--method",
        choices=["kmeans", "hdbscan", "kmodes", "kprototypes", "gower_hdbscan"],
        default="kmeans",
        help="Clustering algorithm to use",
    )
    parser.add_argument("--n_clusters", type=int, default=5, help="Number of clusters (KMeans / KModes / KPrototypes)")
    parser.add_argument("--min_cluster_size", type=int, default=5, help="Min cluster size (HDBSCAN)")
    parser.add_argument("--umap_dims", type=int, default=2, help="UMAP output dimensions before clustering")
    parser.add_argument("--use_umap", action="store_true", help="Apply UMAP before clustering (numeric methods only)")
    parser.add_argument("--elbow", action="store_true", help="Generate elbow plot (KMeans only)")
    parser.add_argument("--output", default="data/clustered.csv", help="Path for output CSV with cluster labels")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    print(f"Loading data from {args.data} ...")
    df = load_data(args.data)
    print(f"Shape: {df.shape}")

    labels = None

    if args.method in ("kmodes",):
        labels = run_kmodes(df, n_clusters=args.n_clusters)

    elif args.method in ("kprototypes",):
        labels = run_kprototypes(df, n_clusters=args.n_clusters)

    elif args.method == "gower_hdbscan":
        labels = run_gower_hdbscan(df, min_cluster_size=args.min_cluster_size)

    else:  # kmeans | hdbscan — work on numeric features
        df_scaled, _ = preprocess_numeric(df)
        num_cols = df_scaled.select_dtypes(include=np.number).columns.tolist()
        X = df_scaled[num_cols].to_numpy()

        if args.use_umap:
            print("Applying UMAP ...")
            X = reduce_dimensions(X, n_components=args.umap_dims)

        if args.elbow and args.method == "kmeans":
            elbow_plot(X)

        if args.method == "kmeans":
            labels = run_kmeans(X, n_clusters=args.n_clusters)
        else:  # hdbscan
            labels = run_hdbscan(X, min_cluster_size=args.min_cluster_size)

        evaluate_clusters(X, labels)

        # 2-D UMAP visualisation
        X_2d = reduce_dimensions(X, n_components=2) if X.shape[1] != 2 else X
        plot_clusters_2d(X_2d, labels)

    df["cluster"] = labels
    print(f"Cluster distribution:\n{pd.Series(labels).value_counts().sort_index()}")

    os.makedirs(os.path.dirname(args.output) if os.path.dirname(args.output) else ".", exist_ok=True)
    df.to_csv(args.output, index=False)
    print(f"Clustered data saved to {args.output}")


if __name__ == "__main__":
    main()
