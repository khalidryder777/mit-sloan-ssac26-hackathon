"""
profiling.py
MIT Sloan SSAC 2026 Hackathon — Cluster Profiling & Commercial Value Index

This is where the raw cluster assignments transform from "Group 0, Group 1,
Group 2" into "The Silent Superfan, The Values Advocate, The Social Spectator."
It's basically the naming ceremony, but instead of a baby, it's a marketing segment,
and instead of "after my grandmother," it's "after their spending patterns."

Also contains the Commercial Value Index (CVI) — our custom metric that
answers the question every sponsor cares about: "Which fans should I throw
money at?" Spoiler: it's more nuanced than "the ones who already buy stuff."

Usage:
    from profiling import *
    profiles = profile_clusters(df, labels, col_types)
    cluster_names = name_clusters(profiles, k)
    df = compute_cvi(df, labels, col_types)
"""

import warnings
from typing import Optional

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")


# ---------------------------------------------------------------------------
# Cluster Profiling — "Tell me about yourself, Cluster 3"
# ---------------------------------------------------------------------------

def profile_clusters(
    df: pd.DataFrame,
    labels: np.ndarray,
    col_types: dict,
) -> pd.DataFrame:
    """Compute descriptive profiles for each cluster.

    For each cluster, calculates:
    - Numeric: mean, median, std
    - Categorical: mode, top-3 values with percentages
    - Size: n and % of total

    It's like writing a dating profile for each segment, except the
    "interests" section is all about spending habits and brand recall.

    Args:
        df: Original DataFrame (pre-encoding).
        labels: Cluster assignment array.
        col_types: Column type dict from preprocessing.

    Returns:
        Summary DataFrame indexed by cluster with all the juicy stats.
    """
    df = df.copy()
    df['cluster'] = labels
    n_total = len(df)

    print("📊 Profiling clusters...")

    all_profiles = []

    for cluster_id in sorted(df['cluster'].unique()):
        cluster_df = df[df['cluster'] == cluster_id]
        n = len(cluster_df)
        profile = {
            'cluster': cluster_id,
            'n': n,
            'pct_of_total': round(n / n_total * 100, 1),
        }

        # Numeric columns: mean, median, std
        numeric_cols = (
            col_types.get('numeric_continuous', []) +
            col_types.get('numeric_ordinal', []) +
            col_types.get('binary', [])
        )
        for col in numeric_cols:
            if col in cluster_df.columns:
                profile[f'{col}_mean'] = cluster_df[col].mean()
                profile[f'{col}_median'] = cluster_df[col].median()
                profile[f'{col}_std'] = cluster_df[col].std()

        # Categorical columns: mode and top-3
        cat_cols = col_types.get('categorical_low', []) + col_types.get('categorical_high', [])
        for col in cat_cols:
            if col in cluster_df.columns:
                vc = cluster_df[col].value_counts(normalize=True)
                profile[f'{col}_mode'] = vc.index[0] if len(vc) > 0 else 'N/A'
                top3 = vc.head(3)
                profile[f'{col}_top3'] = '; '.join(
                    [f"{v} ({p:.0%})" for v, p in top3.items()]
                )

        all_profiles.append(profile)

    profiles_df = pd.DataFrame(all_profiles).set_index('cluster')

    print(f"✅ Profiled {len(profiles_df)} clusters")
    for idx, row in profiles_df.iterrows():
        print(f"   Cluster {idx}: n={row['n']:,} ({row['pct_of_total']}%)")
    print()

    return profiles_df


# ---------------------------------------------------------------------------
# Cluster Naming — the fun part where we pretend to be brand strategists
# ---------------------------------------------------------------------------

def name_clusters(profiles: pd.DataFrame, n_clusters: int) -> dict:
    """Generate evocative persona names based on dominant traits.

    Looks at which features each cluster over-indexes on relative to the
    population mean, then combines the top traits into a catchy name.

    Pre-loaded name bank (adapted based on actual profiles):
    - "The Values Advocate" — social values / cause alignment
    - "The Sports Purist" — attendance / stats engagement
    - "The Social Spectator" — social media / group attendance
    - "The Silent Superfan" — high spend, low social
    - "The Casual Curious" — low frequency, high growth
    - "The Digital-First Devotee" — streaming/app heavy
    - "The Next-Gen Evangelist" — youngest, highest brand receptivity

    Think of it as a personality quiz, but for aggregate consumer segments.
    Equally scientific.

    Args:
        profiles: Output from profile_clusters().
        n_clusters: Number of clusters.

    Returns:
        Dict mapping cluster_id → persona name string.
    """
    print("🏷️  Generating cluster names...")

    # Get mean columns only (for comparison)
    mean_cols = [c for c in profiles.columns if c.endswith('_mean')]
    if not mean_cols:
        # Fallback: just number them (sad but functional)
        names = {i: f"Segment {i + 1}" for i in range(n_clusters)}
        print("   ⚠️ No numeric mean columns found for naming. Using generic names.")
        return names

    # Calculate population means (average across all clusters, weighted by n)
    pop_means = {}
    total_n = profiles['n'].sum()
    for col in mean_cols:
        pop_means[col] = (profiles[col] * profiles['n']).sum() / total_n

    # Name bank — keywords mapped to persona names
    name_bank = {
        'spend': 'Spender',
        'purchase': 'Spender',
        'revenue': 'Revenue Driver',
        'ticket': 'Ticket Buyer',
        'merch': 'Merch Maven',
        'attend': 'Attendee',
        'game': 'Sports Purist',
        'watch': 'Viewer',
        'stream': 'Digital-First Devotee',
        'app': 'App Enthusiast',
        'social': 'Social Spectator',
        'share': 'Social Amplifier',
        'follow': 'Social Spectator',
        'brand': 'Brand Champion',
        'sponsor': 'Brand-Receptive',
        'value': 'Values Advocate',
        'cause': 'Values Advocate',
        'community': 'Community Builder',
        'age': 'Next-Gen',
        'young': 'Next-Gen',
        'frequency': 'Frequent Flyer',
        'loyal': 'Loyalist',
        'engage': 'Highly Engaged',
    }

    # Archetype templates
    archetypes = [
        "The Values Advocate",
        "The Sports Purist",
        "The Social Spectator",
        "The Silent Superfan",
        "The Casual Curious",
        "The Digital-First Devotee",
        "The Next-Gen Evangelist",
    ]

    names = {}
    for cluster_id in profiles.index:
        # Find features where this cluster over-indexes most
        over_index = {}
        for col in mean_cols:
            pop_val = pop_means[col]
            cluster_val = profiles.loc[cluster_id, col]
            if pop_val != 0:
                ratio = cluster_val / pop_val
                over_index[col] = ratio

        # Sort by over-indexing strength
        sorted_features = sorted(over_index.items(), key=lambda x: abs(x[1] - 1), reverse=True)
        top_features = sorted_features[:3]

        # Try to match keywords from top features to name bank
        matched_traits = []
        for feat_col, ratio in top_features:
            feat_name = feat_col.replace('_mean', '').lower()
            direction = "High" if ratio > 1 else "Low"
            for keyword, trait_name in name_bank.items():
                if keyword in feat_name:
                    matched_traits.append((trait_name, ratio))
                    break
            else:
                matched_traits.append((feat_name.replace('_', ' ').title(), ratio))

        # Build the name
        if matched_traits:
            primary = matched_traits[0][0]
            name = f"The {primary}"
        elif cluster_id < len(archetypes):
            name = archetypes[cluster_id]
        else:
            name = f"Segment {cluster_id + 1}"

        names[cluster_id] = name

        # Reasoning printout
        feat_summary = ', '.join(
            [f"{f[0]} ({f[1]:.2f}x)" for f in matched_traits[:3]]
        )
        print(f"   Cluster {cluster_id} → \"{name}\"")
        print(f"     Top traits: {feat_summary}")

    print(f"\n💡 These are auto-generated starting points. You'll probably want to")
    print(f"   rename them once you understand the data. Override in the notebook.\n")

    return names


# ---------------------------------------------------------------------------
# Commercial Value Index — the money metric
# ---------------------------------------------------------------------------

def map_columns_to_subscores(df: pd.DataFrame, mapping: dict) -> pd.DataFrame:
    """Map actual dataset columns to CVI sub-score categories.

    This is the "fill in the blanks" function you'll use on hackathon day.
    Point it at the right columns and it averages them into sub-scores.

    Args:
        df: DataFrame with original columns.
        mapping: Dict like {
            'spending_score': ['ticket_spend', 'merch_spend'],
            'brand_receptivity': ['sponsor_awareness'],
            ...
        }

    Returns:
        DataFrame with sub-score columns (raw, pre-normalization).
    """
    result = df.copy()

    for subscore_name, columns in mapping.items():
        valid_cols = [c for c in columns if c in df.columns]
        if valid_cols:
            # Average the mapped columns for this sub-score
            result[subscore_name] = df[valid_cols].mean(axis=1)
            print(f"   📍 {subscore_name}: mapped from {valid_cols}")
        else:
            # No valid columns — fill with 0 and warn
            result[subscore_name] = 0
            if columns:
                print(f"   ⚠️  {subscore_name}: columns {columns} not found! Using 0.")
            else:
                print(f"   ⏭️  {subscore_name}: no columns mapped (fill this in!)")

    return result


def compute_cvi(
    df: pd.DataFrame,
    labels: np.ndarray,
    col_types: dict,
    mapping: dict = None,
) -> pd.DataFrame:
    """Compute the Commercial Value Index for each fan and cluster.

    CVI = 0.30(Spending) + 0.25(Brand Receptivity) + 0.20(Engagement)
        + 0.15(Social Amplification) + 0.10(Growth Potential)

    Each sub-score is normalized 0-1 using min-max within the dataset.
    The weights reflect the reality that money talks (0.30 for spending),
    but potential whispers pretty loudly too (0.10 for growth).

    IMPORTANT: On hackathon day, you need to provide a mapping dict that
    tells this function which actual columns correspond to each sub-score.
    Without it, we'll try to auto-detect (poorly) or return zeros.

    Args:
        df: DataFrame with cluster labels.
        labels: Cluster assignment array.
        col_types: Column type dict.
        mapping: Dict mapping sub-score names to column lists. E.g.:
            {
                'spending_score': ['ticket_spend', 'merch_spend'],
                'brand_receptivity': ['sponsor_awareness', 'purchase_intent'],
                'engagement_depth': ['games_attended', 'app_sessions'],
                'social_amplification': ['social_shares', 'content_engagement'],
                'growth_potential': ['age_inverted', 'fan_tenure_inverted'],
            }

    Returns:
        DataFrame with CVI column, sub-score columns, and cluster labels.
    """
    weights = {
        'spending_score': 0.30,
        'brand_receptivity': 0.25,
        'engagement_depth': 0.20,
        'social_amplification': 0.15,
        'growth_potential': 0.10,
    }

    df = df.copy()
    df['cluster'] = labels

    print("💰 Computing Commercial Value Index (CVI)...")

    # Apply column mapping
    if mapping is None:
        print("   ⚠️  No column mapping provided! Using empty mapping.")
        print("   📝 Fill in the mapping dict on hackathon day. See docstring.")
        mapping = {k: [] for k in weights.keys()}

    df = map_columns_to_subscores(df, mapping)

    # Normalize each sub-score to 0-1 using min-max
    subscore_cols = list(weights.keys())
    for col in subscore_cols:
        if col in df.columns:
            col_min = df[col].min()
            col_max = df[col].max()
            if col_max > col_min:
                df[f'{col}_norm'] = (df[col] - col_min) / (col_max - col_min)
            else:
                df[f'{col}_norm'] = 0.5  # Everything's the same — normalize to middle
        else:
            df[f'{col}_norm'] = 0

    # Compute weighted CVI
    df['cvi'] = sum(
        weights[col] * df[f'{col}_norm'] for col in subscore_cols
    )

    # Summary by cluster
    cluster_cvi = df.groupby('cluster').agg(
        mean_cvi=('cvi', 'mean'),
        median_cvi=('cvi', 'median'),
        std_cvi=('cvi', 'std'),
        n=('cvi', 'count'),
    ).round(3)

    cluster_cvi['total_cvi'] = (cluster_cvi['mean_cvi'] * cluster_cvi['n']).round(1)

    print(f"\n✅ CVI computed for {len(df):,} fans across {len(cluster_cvi)} clusters")
    print("\n📊 CVI Summary by Cluster:")
    print(cluster_cvi.to_string())
    print()

    return df


# ---------------------------------------------------------------------------
# Cluster Comparison — the "who over-indexes where" analysis
# ---------------------------------------------------------------------------

def generate_cluster_comparison(
    df: pd.DataFrame,
    labels: np.ndarray,
    col_types: dict,
) -> pd.DataFrame:
    """Compare each cluster to the population mean using index values.

    For each numeric feature: cluster_mean / population_mean * 100.
    - > 120 = over-indexes (this cluster is way into this thing)
    - < 80 = under-indexes (this cluster doesn't care about this)
    - 80-120 = meh, average

    This is the chart that makes CMOs go "oooh interesting" in presentations.

    Args:
        df: DataFrame with cluster labels.
        labels: Cluster labels.
        col_types: Column type dict.

    Returns:
        DataFrame of index values (clusters × features).
    """
    df = df.copy()
    df['cluster'] = labels

    print("📏 Generating cluster comparison index...")

    numeric_cols = (
        col_types.get('numeric_continuous', []) +
        col_types.get('numeric_ordinal', []) +
        col_types.get('binary', [])
    )
    numeric_cols = [c for c in numeric_cols if c in df.columns]

    if not numeric_cols:
        print("   ⚠️ No numeric columns found for comparison.")
        return pd.DataFrame()

    # Population means
    pop_means = df[numeric_cols].mean()

    # Cluster means
    cluster_means = df.groupby('cluster')[numeric_cols].mean()

    # Compute index (cluster / population * 100)
    comparison = cluster_means.copy()
    for col in numeric_cols:
        if pop_means[col] != 0:
            comparison[col] = (cluster_means[col] / pop_means[col] * 100).round(1)
        else:
            comparison[col] = 100.0

    n_over = (comparison > 120).sum().sum()
    n_under = (comparison < 80).sum().sum()

    print(f"✅ Comparison complete: {n_over} over-indexes (>120), {n_under} under-indexes (<80)")
    print(f"   These are the interesting bits — where clusters diverge from the average.\n")

    return comparison


# ---------------------------------------------------------------------------
# Segment Size & Value — the "so what" table
# ---------------------------------------------------------------------------

def segment_size_and_value(
    df: pd.DataFrame,
    labels: np.ndarray,
) -> pd.DataFrame:
    """Compute each segment's size and commercial value contribution.

    This is the table that answers: "Which segments punch above their weight?"
    A segment that's 10% of fans but 25% of commercial value? That's your
    money maker. A segment that's 30% of fans but 5% of value? That's your
    growth opportunity (or your lost cause — context matters).

    Args:
        df: DataFrame with 'cvi' column and cluster labels.
        labels: Cluster labels.

    Returns:
        Summary DataFrame sorted by total CVI descending.
    """
    df = df.copy()
    df['cluster'] = labels

    if 'cvi' not in df.columns:
        print("⚠️  No 'cvi' column found. Run compute_cvi() first.")
        print("   Returning size-only summary.")
        summary = df.groupby('cluster').size().reset_index(name='n')
        summary['pct_of_total'] = (summary['n'] / summary['n'].sum() * 100).round(1)
        return summary

    print("📊 Computing segment size vs. value...")

    summary = df.groupby('cluster').agg(
        n=('cvi', 'count'),
        mean_cvi=('cvi', 'mean'),
    ).reset_index()

    total_n = summary['n'].sum()
    summary['pct_of_total'] = (summary['n'] / total_n * 100).round(1)
    summary['total_cvi'] = (summary['mean_cvi'] * summary['n']).round(1)

    total_cvi = summary['total_cvi'].sum()
    summary['pct_of_total_cvi'] = (summary['total_cvi'] / total_cvi * 100).round(1) if total_cvi > 0 else 0

    # Value efficiency: pct_of_value / pct_of_size
    summary['value_efficiency'] = (summary['pct_of_total_cvi'] / summary['pct_of_total']).round(2)

    summary = summary.sort_values('total_cvi', ascending=False).reset_index(drop=True)

    print(f"✅ Segment value analysis:")
    for _, row in summary.iterrows():
        efficiency = row['value_efficiency']
        emoji = "🔥" if efficiency > 1.2 else ("💤" if efficiency < 0.8 else "➡️")
        print(f"   {emoji} Cluster {row['cluster']}: "
              f"{row['pct_of_total']}% of fans, {row['pct_of_total_cvi']}% of value "
              f"(efficiency: {efficiency:.2f}x)")
    print()

    return summary
