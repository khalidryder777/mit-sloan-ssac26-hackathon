"""
test_pipeline.py
MIT Sloan SSAC 2026 Hackathon — End-to-End Pipeline Validation

This test generates synthetic fan survey data and runs the ENTIRE pipeline:
load → clean → encode → cluster → profile → name → CVI → visualize

If this passes, you can walk into the hackathon with the confidence of someone
who actually tested their code beforehand. Which, statistically, puts you in
the top 10% of hackathon participants. Low bar, but we clear it with style.

Run: python -m pytest tests/test_pipeline.py -v
 Or: python tests/test_pipeline.py  (for the simple folks)
"""

import sys
import os
import warnings

import numpy as np
import pandas as pd

# Add scripts to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))

warnings.filterwarnings("ignore")


# ---------------------------------------------------------------------------
# Synthetic Data Generator — fake fans, real pipeline
# ---------------------------------------------------------------------------

def generate_synthetic_fan_data(n: int = 500, seed: int = 42) -> pd.DataFrame:
    """Generate synthetic mixed-type fan survey data.

    Creates a dataset that mimics what we might get from Wasserman:
    - Demographics (age, gender, location)
    - Behavioral (games attended, spend, app usage)
    - Attitudinal (Likert scales for brand perception, values alignment)
    - Engagement (social media, content, community)

    The data has 3 natural clusters baked in, because we're not going to
    test on data where clustering is actually hard. Save that for the
    real hackathon. This is validation, not self-punishment.

    Args:
        n: Number of synthetic fans.
        seed: Random seed for reproducibility.

    Returns:
        DataFrame with 500 rows and mixed column types.
    """
    rng = np.random.RandomState(seed)

    # 3 hidden segments with different characteristics
    # Segment 0: High-spending purists (20%)
    # Segment 1: Social-first casual fans (50%)
    # Segment 2: Values-driven advocates (30%)
    segment_probs = [0.20, 0.50, 0.30]
    segments = rng.choice(3, size=n, p=segment_probs)

    data = {
        'respondent_id': [f'FAN_{i:04d}' for i in range(n)],
    }

    # Age: purists older, social younger, values mixed
    age_means = [42, 26, 34]
    data['age'] = np.clip(
        [rng.normal(age_means[s], 8) for s in segments], 18, 70
    ).astype(int)

    # Gender
    gender_probs = {
        0: ['Female', 'Male', 'Non-binary'],
        1: ['Female', 'Male', 'Non-binary'],
        2: ['Female', 'Male', 'Non-binary'],
    }
    gender_weights = {0: [0.5, 0.4, 0.1], 1: [0.6, 0.3, 0.1], 2: [0.7, 0.2, 0.1]}
    data['gender'] = [rng.choice(gender_probs[s], p=gender_weights[s]) for s in segments]

    # Region
    regions = ['Northeast', 'Southeast', 'Midwest', 'West', 'Southwest']
    data['region'] = [rng.choice(regions) for _ in range(n)]

    # Games attended per year
    games_means = [12, 3, 6]
    data['games_attended'] = np.clip(
        [rng.poisson(games_means[s]) for s in segments], 0, 30
    )

    # Annual spending ($)
    spend_means = [800, 150, 350]
    data['annual_spend'] = np.clip(
        [rng.normal(spend_means[s], spend_means[s] * 0.3) for s in segments], 0, 5000
    ).round(2)

    # Merch purchases per year
    merch_means = [6, 1, 3]
    data['merch_purchases'] = np.clip(
        [rng.poisson(merch_means[s]) for s in segments], 0, 20
    )

    # App sessions per month
    app_means = [15, 8, 10]
    data['app_sessions_monthly'] = np.clip(
        [rng.poisson(app_means[s]) for s in segments], 0, 50
    )

    # Social media follows (number of team/athlete accounts)
    social_means = [3, 12, 7]
    data['social_follows'] = np.clip(
        [rng.poisson(social_means[s]) for s in segments], 0, 30
    )

    # Content shares per month
    share_means = [1, 8, 4]
    data['content_shares_monthly'] = np.clip(
        [rng.poisson(share_means[s]) for s in segments], 0, 25
    )

    # Likert scales (1-5): brand perception
    brand_means = [3.5, 3.0, 4.2]
    data['sponsor_awareness'] = np.clip(
        [rng.normal(brand_means[s], 0.8) for s in segments], 1, 5
    ).round(0).astype(int)

    data['purchase_intent'] = np.clip(
        [rng.normal(brand_means[s] - 0.3, 0.9) for s in segments], 1, 5
    ).round(0).astype(int)

    # Likert: values alignment
    values_means = [3.0, 2.8, 4.5]
    data['values_alignment'] = np.clip(
        [rng.normal(values_means[s], 0.7) for s in segments], 1, 5
    ).round(0).astype(int)

    # Fan type (categorical)
    fan_types = ['Hardcore', 'Casual', 'New Fan']
    fan_weights = {0: [0.7, 0.2, 0.1], 1: [0.1, 0.6, 0.3], 2: [0.3, 0.3, 0.4]}
    data['fan_type'] = [rng.choice(fan_types, p=fan_weights[s]) for s in segments]

    # Preferred channel
    channels = ['In-Person', 'Streaming', 'Social Media', 'TV']
    channel_weights = {
        0: [0.5, 0.2, 0.1, 0.2],
        1: [0.1, 0.3, 0.4, 0.2],
        2: [0.2, 0.3, 0.3, 0.2],
    }
    data['preferred_channel'] = [rng.choice(channels, p=channel_weights[s]) for s in segments]

    df = pd.DataFrame(data)

    # Add some missing values (because real data always has them)
    # Sprinkle ~5% missing across a few columns, like sad confetti
    for col in ['annual_spend', 'app_sessions_monthly', 'sponsor_awareness']:
        mask = rng.random(n) < 0.05
        df.loc[mask, col] = np.nan

    return df


# ---------------------------------------------------------------------------
# The Actual Tests — the moment of truth
# ---------------------------------------------------------------------------

def test_full_pipeline():
    """Run the complete pipeline end-to-end on synthetic data.

    This is the "if this works, we can sleep tonight" test.
    """
    from preprocessing import (
        load_and_inspect, identify_column_types, clean_data,
        encode_for_clustering, create_feature_matrix,
    )
    from clustering import (
        find_optimal_k, run_kmeans, auto_cluster, cluster_stability_check,
    )
    from profiling import (
        profile_clusters, name_clusters, compute_cvi,
        generate_cluster_comparison, segment_size_and_value,
    )
    from visualization import reduce_dimensions

    print("\n" + "=" * 70)
    print("  SSAC 2026 — FULL PIPELINE VALIDATION")
    print("  (If this passes, you're ready for hackathon day)")
    print("=" * 70 + "\n")

    # Step 1: Generate synthetic data
    print("📦 Step 1: Generating synthetic fan data...")
    df = generate_synthetic_fan_data(n=500)
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'test_synthetic.csv')
    df.to_csv(csv_path, index=False)
    print(f"   Saved to {csv_path}")
    assert df.shape == (500, 15), f"Expected (500, 15), got {df.shape}"
    print("   ✅ PASS\n")

    # Step 2: Load and inspect
    print("📂 Step 2: Load and inspect...")
    df_loaded = load_and_inspect(csv_path)
    assert df_loaded.shape[0] == 500
    print("   ✅ PASS\n")

    # Step 3: Identify column types
    print("🔍 Step 3: Identify column types...")
    col_types = identify_column_types(df_loaded)
    assert 'numeric_continuous' in col_types
    assert 'id_columns' in col_types
    assert 'respondent_id' in col_types['id_columns'], "Should detect respondent_id as ID"
    print("   ✅ PASS\n")

    # Step 4: Clean data
    print("🧹 Step 4: Clean data...")
    df_clean = clean_data(df_loaded, col_types)
    assert df_clean.isnull().sum().sum() == 0, "Should have no missing after cleaning"
    print("   ✅ PASS\n")

    # Step 5: Feature selection
    print("✂️  Step 5: Feature selection...")
    feature_df = create_feature_matrix(df_clean)
    assert 'respondent_id' not in feature_df.columns, "Should drop ID columns"
    print("   ✅ PASS\n")

    # Step 6: Encoding
    print("🔢 Step 6: Encoding for clustering...")
    feature_col_types = identify_column_types(feature_df)
    X, scaler, encoders, feature_names, cat_idx = encode_for_clustering(feature_df, feature_col_types)
    assert X.shape[0] == len(feature_df), "Should preserve row count"
    assert X.shape[1] > 0, "Should have features"
    print("   ✅ PASS\n")

    # Step 7: Find optimal k
    print("🎯 Step 7: Find optimal k...")
    import matplotlib
    matplotlib.use('Agg')  # Non-interactive backend for testing
    k_results = find_optimal_k(X, k_range=range(2, 6))
    assert 'recommended_k' in k_results
    recommended_k = k_results['recommended_k']
    assert 2 <= recommended_k <= 5
    print(f"   Recommended k = {recommended_k}")
    print("   ✅ PASS\n")

    # Step 8: Run clustering
    print("🔄 Step 8: Run clustering (auto)...")
    labels, k, method, meta = auto_cluster(X, col_types, cat_idx if cat_idx else None)
    assert len(labels) == X.shape[0]
    assert len(set(labels)) >= 2, "Should find at least 2 clusters"
    print(f"   Method: {method}, k = {k}")
    print("   ✅ PASS\n")

    # Step 9: Stability check
    print("🔬 Step 9: Stability check...")
    stability = cluster_stability_check(X, k, n_runs=5)
    assert 0 <= stability <= 1
    print(f"   Stability: {stability:.3f}")
    print("   ✅ PASS\n")

    # Step 10: Dimensionality reduction
    print("📐 Step 10: Dimensionality reduction...")
    X_2d = reduce_dimensions(X, method='pca')  # PCA for speed in tests
    assert X_2d.shape == (X.shape[0], 2)
    print("   ✅ PASS\n")

    # Step 11: Profile clusters
    print("📊 Step 11: Profile clusters...")
    profiles = profile_clusters(df_clean, labels, col_types)
    assert len(profiles) == k
    print("   ✅ PASS\n")

    # Step 12: Name clusters
    print("🏷️  Step 12: Name clusters...")
    cluster_names = name_clusters(profiles, k)
    assert len(cluster_names) == k
    print(f"   Names: {cluster_names}")
    print("   ✅ PASS\n")

    # Step 13: Compute CVI
    print("💰 Step 13: Compute CVI...")
    cvi_mapping = {
        'spending_score': ['annual_spend', 'merch_purchases'],
        'brand_receptivity': ['sponsor_awareness', 'purchase_intent'],
        'engagement_depth': ['games_attended', 'app_sessions_monthly'],
        'social_amplification': ['social_follows', 'content_shares_monthly'],
        'growth_potential': [],  # Would need age inversion, skip for test
    }
    df_with_cvi = compute_cvi(df_clean, labels, col_types, mapping=cvi_mapping)
    assert 'cvi' in df_with_cvi.columns
    assert df_with_cvi['cvi'].between(0, 1).all(), "CVI should be 0-1"
    print("   ✅ PASS\n")

    # Step 14: Cluster comparison
    print("📏 Step 14: Cluster comparison index...")
    comparison = generate_cluster_comparison(df_with_cvi, labels, col_types)
    assert len(comparison) == k
    print("   ✅ PASS\n")

    # Step 15: Segment size & value
    print("⚖️  Step 15: Segment size vs value...")
    sv = segment_size_and_value(df_with_cvi, labels)
    assert 'pct_of_total' in sv.columns
    assert 'total_cvi' in sv.columns
    print("   ✅ PASS\n")

    # Cleanup test file
    if os.path.exists(csv_path):
        os.remove(csv_path)

    # Also clean up test plot files
    for f in ['outputs/optimal_k_plots.png', 'cluster_plot.png', 'elbow_plot.png']:
        full_path = os.path.join(os.path.dirname(__file__), '..', f)
        if os.path.exists(full_path):
            os.remove(full_path)

    print("\n" + "=" * 70)
    print("  🎉 ALL 15 STEPS PASSED!")
    print("  Your pipeline is operational. Go win that hackathon.")
    print("  (Or at minimum, don't embarrass yourself. The bar is low.)")
    print("=" * 70 + "\n")


def test_imports():
    """Verify all modules import cleanly."""
    print("📦 Testing imports...")

    from preprocessing import (
        load_and_inspect, identify_column_types, clean_data,
        encode_for_clustering, create_feature_matrix,
    )
    from clustering import (
        find_optimal_k, run_kmeans, run_kprototypes, run_kmodes,
        run_hierarchical, run_hdbscan_clustering,
        cluster_stability_check, auto_cluster,
    )
    from profiling import (
        profile_clusters, name_clusters, compute_cvi,
        map_columns_to_subscores, generate_cluster_comparison,
        segment_size_and_value,
    )
    from visualization import (
        PALETTE, BACKGROUND, TEXT_COLOR,
        plot_radar, plot_cluster_scatter, plot_cvi_bar,
        plot_cluster_heatmap, plot_feature_distributions,
        plot_segment_size_value, reduce_dimensions, export_all_charts,
    )

    print("✅ All imports successful. Every function exists and is importable.\n")


# ---------------------------------------------------------------------------
# Run directly (no pytest needed)
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    test_imports()
    test_full_pipeline()
