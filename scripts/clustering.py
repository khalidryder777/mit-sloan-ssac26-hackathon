"""
clustering.py
MIT Sloan SSAC 2026 Hackathon — Clustering Algorithms & Evaluation

This is the module where math meets hubris. We take a pile of numbers,
squint at them from multiple angles, and declare "yes, there are exactly
4 types of sports fans" with the confidence of someone who's never been
wrong about anything (narrator: they had been wrong about many things).

Supports: K-Means, K-Prototypes, K-Modes, Hierarchical, HDBSCAN.
Also includes: optimal k selection, stability checking, and an auto_cluster
function for when you want to let the algorithm drive.

Usage:
    from clustering import *
    k_results = find_optimal_k(X, categorical_indices=cat_idx)
    labels, k, method, meta = auto_cluster(X, col_types, cat_idx)
"""

import warnings
from itertools import combinations

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.metrics import (
    silhouette_score,
    calinski_harabasz_score,
    adjusted_rand_score,
)
from sklearn.decomposition import PCA

warnings.filterwarnings("ignore")

# Conditional imports — because not every environment has every package,
# and we're not about to let a missing import ruin hackathon day
try:
    from kmodes.kprototypes import KPrototypes
    HAS_KPROTOTYPES = True
except ImportError:
    HAS_KPROTOTYPES = False

try:
    from kmodes.kmodes import KModes as KModesAlgo
    HAS_KMODES = True
except ImportError:
    HAS_KMODES = False

try:
    import hdbscan
    HAS_HDBSCAN = True
except ImportError:
    HAS_HDBSCAN = False


# ---------------------------------------------------------------------------
# Finding Optimal K — "How many groups of fans are there?" is basically
# the sports analytics version of "how many licks to the center of a
# Tootsie Pop" and the answer is similarly unsatisfying.
# ---------------------------------------------------------------------------

def find_optimal_k(
    X: np.ndarray,
    method: str = 'silhouette',
    k_range: range = range(2, 9),
    categorical_indices: list = None,
) -> dict:
    """Test multiple k values and recommend the best one.

    Computes inertia (elbow), silhouette, and Calinski-Harabasz scores
    across a range of k values. Generates plots. Makes a recommendation
    that you're free to ignore (and probably should double-check).

    Args:
        X: Feature matrix (numpy array).
        method: Primary metric for recommendation ('silhouette' or 'calinski').
        k_range: Range of k values to test.
        categorical_indices: If provided, uses K-Prototypes instead of K-Means.

    Returns:
        Dict with 'scores' (per k), 'recommended_k', and 'plots_saved'.
    """
    use_kproto = categorical_indices is not None and len(categorical_indices) > 0

    if use_kproto and not HAS_KPROTOTYPES:
        print("⚠️  K-Prototypes not available. Falling back to K-Means on all features.")
        use_kproto = False

    results = {
        'k': [], 'inertia': [], 'silhouette': [], 'calinski': []
    }

    print(f"🔍 Testing k = {list(k_range)} using "
          f"{'K-Prototypes' if use_kproto else 'K-Means'}...")

    for k in k_range:
        if use_kproto:
            model = KPrototypes(n_clusters=k, init='Huang', n_init=3, random_state=42)
            labels = model.fit_predict(X, categorical=categorical_indices)
            inertia = model.cost_
        else:
            model = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = model.fit_predict(X)
            inertia = model.inertia_

        # Silhouette needs numeric data — use only non-categorical columns
        if use_kproto:
            numeric_mask = [i for i in range(X.shape[1]) if i not in categorical_indices]
            X_numeric = X[:, numeric_mask].astype(float) if numeric_mask else X.astype(float)
        else:
            X_numeric = X.astype(float)

        sil = silhouette_score(X_numeric, labels) if len(set(labels)) > 1 else 0
        cal = calinski_harabasz_score(X_numeric, labels) if len(set(labels)) > 1 else 0

        results['k'].append(k)
        results['inertia'].append(inertia)
        results['silhouette'].append(sil)
        results['calinski'].append(cal)

        print(f"   k={k}: silhouette={sil:.3f}, calinski={cal:.1f}, "
              f"{'cost' if use_kproto else 'inertia'}={inertia:.1f}")

    # Recommend based on primary method
    if method == 'silhouette':
        best_idx = np.argmax(results['silhouette'])
    else:
        best_idx = np.argmax(results['calinski'])

    recommended_k = results['k'][best_idx]

    # Generate plots
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))

    # Elbow plot
    axes[0].plot(results['k'], results['inertia'], 'bo-', linewidth=2)
    axes[0].axvline(x=recommended_k, color='red', linestyle='--', alpha=0.7)
    axes[0].set_xlabel('k')
    axes[0].set_ylabel('Inertia / Cost')
    axes[0].set_title('Elbow Plot\n(look for the "elbow" — easier said than done)')

    # Silhouette plot
    axes[1].plot(results['k'], results['silhouette'], 'go-', linewidth=2)
    axes[1].axvline(x=recommended_k, color='red', linestyle='--', alpha=0.7)
    axes[1].set_xlabel('k')
    axes[1].set_ylabel('Silhouette Score')
    axes[1].set_title('Silhouette Score\n(higher = more distinct clusters)')

    # Calinski-Harabasz plot
    axes[2].plot(results['k'], results['calinski'], 'mo-', linewidth=2)
    axes[2].axvline(x=recommended_k, color='red', linestyle='--', alpha=0.7)
    axes[2].set_xlabel('k')
    axes[2].set_ylabel('Calinski-Harabasz Score')
    axes[2].set_title('Calinski-Harabasz\n(higher = better defined clusters)')

    plt.tight_layout()
    plt.savefig('outputs/optimal_k_plots.png', dpi=300, bbox_inches='tight')
    plt.show()
    print(f"\n📊 Plots saved to outputs/optimal_k_plots.png")

    print(f"\n🎯 Recommended k = {recommended_k} "
          f"(silhouette={results['silhouette'][best_idx]:.3f})")
    print(f"   But seriously, look at the plots and use your judgment. "
          f"The algorithm is suggesting, not commanding.\n")

    return {
        'scores': pd.DataFrame(results),
        'recommended_k': recommended_k,
        'plots_saved': 'outputs/optimal_k_plots.png',
    }


# ---------------------------------------------------------------------------
# Clustering Algorithms — the actual "putting fans in boxes" part
# ---------------------------------------------------------------------------

def run_kmeans(X: np.ndarray, k: int) -> np.ndarray:
    """Standard K-Means clustering.

    The Toyota Camry of clustering algorithms: reliable, boring, gets
    the job done. Works great on numeric data with roughly spherical clusters.

    Args:
        X: Feature matrix (numeric, scaled).
        k: Number of clusters.

    Returns:
        Cluster labels array.
    """
    print(f"🔄 Running K-Means with k={k}...")
    model = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = model.fit_predict(X)
    sil = silhouette_score(X, labels)
    print(f"✅ K-Means complete. Silhouette: {sil:.3f}")
    _print_cluster_sizes(labels)
    return labels


def run_kprototypes(X: np.ndarray, k: int, categorical_indices: list) -> np.ndarray:
    """K-Prototypes for mixed numeric + categorical data.

    The hybrid car of clustering — handles both numeric and categorical
    features without forcing you to one-hot-encode everything into oblivion.

    Args:
        X: Feature matrix (mixed types).
        k: Number of clusters.
        categorical_indices: List of column indices that are categorical.

    Returns:
        Cluster labels array.
    """
    if not HAS_KPROTOTYPES:
        raise ImportError("kmodes package not installed. Run: pip install kmodes")

    print(f"🔄 Running K-Prototypes with k={k}, {len(categorical_indices)} categorical features...")
    model = KPrototypes(n_clusters=k, init='Huang', n_init=5, random_state=42)
    labels = model.fit_predict(X, categorical=categorical_indices)

    # Silhouette on numeric features only
    numeric_mask = [i for i in range(X.shape[1]) if i not in categorical_indices]
    if numeric_mask:
        X_numeric = X[:, numeric_mask].astype(float)
        sil = silhouette_score(X_numeric, labels)
        print(f"✅ K-Prototypes complete. Silhouette (numeric features): {sil:.3f}")
    else:
        print(f"✅ K-Prototypes complete. (No numeric features for silhouette score)")

    _print_cluster_sizes(labels)
    return labels


def run_kmodes(X: np.ndarray, k: int) -> np.ndarray:
    """K-Modes for fully categorical data.

    When your entire dataset is categories and you just need to group
    similar responses together. It's like sorting M&Ms by color,
    except the M&Ms are survey responses and nobody agrees on the colors.

    Args:
        X: Feature matrix (categorical).
        k: Number of clusters.

    Returns:
        Cluster labels array.
    """
    if not HAS_KMODES:
        raise ImportError("kmodes package not installed. Run: pip install kmodes")

    print(f"🔄 Running K-Modes with k={k}...")
    model = KModesAlgo(n_clusters=k, init='Huang', n_init=5, random_state=42)
    labels = model.fit_predict(X)
    print(f"✅ K-Modes complete.")
    _print_cluster_sizes(labels)
    return labels


def run_hierarchical(X: np.ndarray, k: int, method: str = 'ward') -> np.ndarray:
    """Agglomerative (hierarchical) clustering.

    Builds a family tree of data points and then cuts it at the right level.
    Good when you suspect your clusters have sub-clusters (fans within fans).

    Args:
        X: Feature matrix (numeric, scaled).
        k: Number of clusters.
        method: Linkage method ('ward', 'complete', 'average', 'single').

    Returns:
        Cluster labels array.
    """
    print(f"🔄 Running Hierarchical Clustering (linkage={method}) with k={k}...")
    model = AgglomerativeClustering(n_clusters=k, linkage=method)
    labels = model.fit_predict(X)
    sil = silhouette_score(X, labels)
    print(f"✅ Hierarchical complete. Silhouette: {sil:.3f}")
    _print_cluster_sizes(labels)
    return labels


def run_hdbscan_clustering(X: np.ndarray) -> np.ndarray:
    """HDBSCAN density-based clustering (no k needed).

    The "I refuse to pick a number of clusters" option. HDBSCAN finds
    clusters based on density, which means it can find non-spherical
    clusters AND identify noise points. The downside: sometimes it
    decides everything is noise. Fun times.

    Args:
        X: Feature matrix (numeric, scaled).

    Returns:
        Cluster labels array (-1 = noise/unclustered).
    """
    if not HAS_HDBSCAN:
        raise ImportError("hdbscan package not installed. Run: pip install hdbscan")

    print(f"🔄 Running HDBSCAN (auto-detecting clusters)...")
    clusterer = hdbscan.HDBSCAN(min_cluster_size=max(5, len(X) // 50))
    labels = clusterer.fit_predict(X)

    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    n_noise = (labels == -1).sum()
    print(f"✅ HDBSCAN found {n_clusters} clusters, {n_noise} noise points "
          f"({n_noise / len(labels) * 100:.1f}% of data)")

    if n_noise > len(labels) * 0.3:
        print(f"⚠️  Warning: >30% noise. HDBSCAN might not be the best fit here.")

    _print_cluster_sizes(labels)
    return labels


# ---------------------------------------------------------------------------
# Stability Check — "But are we SURE about those clusters?"
# ---------------------------------------------------------------------------

def cluster_stability_check(
    X: np.ndarray,
    k: int,
    n_runs: int = 10,
    categorical_indices: list = None,
) -> float:
    """Run clustering multiple times and check consistency.

    If you run the same algorithm 10 times and get 10 different answers,
    your clusters are about as stable as a Jenga tower in an earthquake.
    We use adjusted Rand index to measure agreement between runs.

    Args:
        X: Feature matrix.
        k: Number of clusters.
        n_runs: Number of repetitions.
        categorical_indices: If provided, uses K-Prototypes.

    Returns:
        Mean stability score (0-1). Print warning if < 0.7.
    """
    print(f"🔬 Stability check: running clustering {n_runs} times with different seeds...")

    all_labels = []
    use_kproto = categorical_indices is not None and len(categorical_indices) > 0 and HAS_KPROTOTYPES

    for i in range(n_runs):
        seed = 42 + i
        if use_kproto:
            model = KPrototypes(n_clusters=k, init='Huang', n_init=2, random_state=seed)
            labels = model.fit_predict(X, categorical=categorical_indices)
        else:
            model = KMeans(n_clusters=k, random_state=seed, n_init=5)
            labels = model.fit_predict(X)
        all_labels.append(labels)

    # Compare all pairs of runs
    ari_scores = []
    for (a, b) in combinations(range(n_runs), 2):
        ari = adjusted_rand_score(all_labels[a], all_labels[b])
        ari_scores.append(ari)

    mean_ari = np.mean(ari_scores)

    if mean_ari >= 0.9:
        print(f"✅ Stability score: {mean_ari:.3f} — Rock solid. These clusters are real.")
    elif mean_ari >= 0.7:
        print(f"✅ Stability score: {mean_ari:.3f} — Good enough for hackathon work.")
    else:
        print(f"⚠️  Stability score: {mean_ari:.3f} — Sketchy. Clusters might be artifacts.")
        print(f"   Consider: different k, different algorithm, or different features.")

    return mean_ari


# ---------------------------------------------------------------------------
# Auto Cluster — for when you want the machine to drive
# ---------------------------------------------------------------------------

def auto_cluster(
    X: np.ndarray,
    col_types: dict,
    categorical_indices: list = None,
) -> tuple:
    """Automatically choose and run the best clustering approach.

    Decision tree:
    1. Mixed data (has categorical_indices) → K-Prototypes
    2. All numeric, < 15 features → K-Means with silhouette-optimal k
    3. All numeric, >= 15 features → PCA to 80% variance, then K-Means
    4. All categorical → K-Modes
    5. Fallback: percentile-based segmentation (the "nothing works" plan)

    This is the "I trust the algorithm" button. Use it for a quick first pass,
    then override with manual choices once you see the data.

    Args:
        X: Feature matrix.
        col_types: Column type dict from preprocessing.
        categorical_indices: Indices of categorical features in X.

    Returns:
        Tuple of (labels, k, method_used, metadata_dict).
    """
    print("🤖 Auto-clustering: analyzing data characteristics...")

    has_categorical = categorical_indices is not None and len(categorical_indices) > 0
    n_features = X.shape[1]

    # Path 1: Mixed data → K-Prototypes
    if has_categorical and HAS_KPROTOTYPES:
        print("   📊 Mixed data detected → using K-Prototypes")
        k_results = find_optimal_k(X, categorical_indices=categorical_indices)
        k = k_results['recommended_k']
        labels = run_kprototypes(X, k, categorical_indices)
        return labels, k, 'K-Prototypes', k_results

    # Path 4: All categorical → K-Modes
    all_categorical = (
        len(col_types.get('categorical_low', [])) +
        len(col_types.get('categorical_high', [])) +
        len(col_types.get('binary', []))
    )
    all_numeric = (
        len(col_types.get('numeric_continuous', [])) +
        len(col_types.get('numeric_ordinal', []))
    )

    if all_numeric == 0 and all_categorical > 0 and HAS_KMODES:
        print("   📊 All categorical data → using K-Modes")
        k_results = find_optimal_k(X)
        k = k_results['recommended_k']
        labels = run_kmodes(X, k)
        return labels, k, 'K-Modes', k_results

    # Path 3: High-dimensional numeric → PCA first
    X_work = X.astype(float)
    pca_meta = None
    if n_features >= 15:
        print(f"   📊 {n_features} features is a lot. Applying PCA (80% variance)...")
        pca = PCA(n_components=0.8, random_state=42)
        X_work = pca.fit_transform(X_work)
        n_components = X_work.shape[1]
        print(f"   📐 PCA reduced {n_features} → {n_components} components")
        pca_meta = {'pca_components': n_components, 'variance_explained': pca.explained_variance_ratio_.sum()}

    # Path 2 (or 3 continued): K-Means with optimal k
    print("   📊 Numeric data → using K-Means with silhouette-optimal k")
    k_results = find_optimal_k(X_work)
    k = k_results['recommended_k']
    labels = run_kmeans(X_work, k)

    meta = k_results
    if pca_meta:
        meta.update(pca_meta)

    return labels, k, 'K-Means' + (' (after PCA)' if pca_meta else ''), meta


# ---------------------------------------------------------------------------
# Helpers — the supporting cast nobody thanks at the Oscars
# ---------------------------------------------------------------------------

def _print_cluster_sizes(labels: np.ndarray) -> None:
    """Print cluster sizes as a nice summary."""
    unique, counts = np.unique(labels, return_counts=True)
    total = len(labels)
    print("   Cluster sizes:")
    for cluster, count in zip(unique, counts):
        label = f"Noise" if cluster == -1 else f"Cluster {cluster}"
        print(f"   {label}: {count:,} ({count / total * 100:.1f}%)")
    print()
