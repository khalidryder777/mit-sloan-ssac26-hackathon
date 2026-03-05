"""
visualization.py
MIT Sloan SSAC 2026 Hackathon — Chart Generation & Visual Storytelling

Every chart in this module is designed to survive two tests:
1. Can a judge read it from 10 feet away on a projector?
2. Does it tell a story without needing a paragraph of explanation?

If the answer to both is "yes," the chart ships. If not, it gets
the matplotlib-default-style treatment (execution by firing squad).

All charts use a consistent dark palette optimized for presentation slides.
Every function returns the figure object AND optionally saves to disk.

Usage:
    from visualization import *
    plot_radar(profiles, features, cluster_names, save_path='outputs/radar.png')
    X_2d = reduce_dimensions(X, method='umap')
    plot_cluster_scatter(X_2d, labels, cluster_names)
"""

import os
import warnings
from typing import Optional

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# The Palette — choose your colors like your hackathon depends on it
# (because it does, presentation-wise)
# ---------------------------------------------------------------------------

PALETTE = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
BACKGROUND = '#1a1a2e'
TEXT_COLOR = '#ffffff'
GRID_COLOR = '#2d2d4e'

# Matplotlib dark theme setup
DARK_STYLE = {
    'figure.facecolor': BACKGROUND,
    'axes.facecolor': BACKGROUND,
    'axes.edgecolor': GRID_COLOR,
    'axes.labelcolor': TEXT_COLOR,
    'text.color': TEXT_COLOR,
    'xtick.color': TEXT_COLOR,
    'ytick.color': TEXT_COLOR,
    'grid.color': GRID_COLOR,
    'grid.alpha': 0.3,
}


def _apply_dark_theme():
    """Apply our dark presentation theme to matplotlib."""
    for key, val in DARK_STYLE.items():
        matplotlib.rcParams[key] = val


def _cluster_color(idx: int) -> str:
    """Get a color from the palette, wrapping around if needed."""
    return PALETTE[idx % len(PALETTE)]


def _save_if_needed(fig, save_path: Optional[str]) -> None:
    """Save a matplotlib figure if save_path is provided."""
    if save_path:
        os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else '.', exist_ok=True)
        fig.savefig(save_path, dpi=300, bbox_inches='tight', facecolor=BACKGROUND)
        print(f"   💾 Saved to {save_path}")


# ---------------------------------------------------------------------------
# Radar / Spider Chart — the "personality wheel" for each segment
# ---------------------------------------------------------------------------

def plot_radar(
    profiles_df: pd.DataFrame,
    features: list,
    cluster_names: dict,
    save_path: Optional[str] = None,
) -> go.Figure:
    """Plotly radar chart: one trace per cluster, features on angular axis.

    This is the chart that makes your personas feel REAL. Each cluster
    gets a polygon showing its strengths and weaknesses. It's like a
    D&D character sheet but for fan segments.

    Args:
        profiles_df: Cluster profiles with columns like '{feature}_mean'.
        features: List of feature names (we'll look for '{feature}_mean' columns).
        cluster_names: Dict {cluster_id: 'Persona Name'}.
        save_path: Optional path to save as PNG.

    Returns:
        Plotly Figure object.
    """
    print("📊 Generating radar chart...")

    fig = go.Figure()

    # Normalize features to 0-1 for radar display
    mean_cols = [f'{f}_mean' for f in features if f'{f}_mean' in profiles_df.columns]
    if not mean_cols:
        # Try raw feature names
        mean_cols = [f for f in features if f in profiles_df.columns]

    display_names = [c.replace('_mean', '').replace('_', ' ').title() for c in mean_cols]

    # Min-max normalize across clusters for each feature
    norm_data = profiles_df[mean_cols].copy()
    for col in mean_cols:
        col_min = norm_data[col].min()
        col_max = norm_data[col].max()
        if col_max > col_min:
            norm_data[col] = (norm_data[col] - col_min) / (col_max - col_min)
        else:
            norm_data[col] = 0.5

    for idx, (cluster_id, row) in enumerate(norm_data.iterrows()):
        name = cluster_names.get(cluster_id, f"Cluster {cluster_id}")
        values = row.tolist()
        values.append(values[0])  # Close the polygon

        fig.add_trace(go.Scatterpolar(
            r=values,
            theta=display_names + [display_names[0]],
            fill='toself',
            name=name,
            line=dict(color=_cluster_color(idx), width=2),
            fillcolor=_cluster_color(idx),
            opacity=0.3,
        ))

    fig.update_layout(
        polar=dict(
            bgcolor=BACKGROUND,
            radialaxis=dict(visible=True, range=[0, 1], gridcolor=GRID_COLOR, color=TEXT_COLOR),
            angularaxis=dict(gridcolor=GRID_COLOR, color=TEXT_COLOR),
        ),
        showlegend=True,
        title=dict(text="Fan Segment Profiles", font=dict(color=TEXT_COLOR, size=20)),
        paper_bgcolor=BACKGROUND,
        plot_bgcolor=BACKGROUND,
        font=dict(color=TEXT_COLOR),
        legend=dict(font=dict(color=TEXT_COLOR)),
    )

    if save_path:
        fig.write_image(save_path, width=1200, height=800, scale=2)
        print(f"   💾 Saved to {save_path}")

    print("✅ Radar chart ready")
    return fig


# ---------------------------------------------------------------------------
# Cluster Scatter Plot — the "look, they're actually different!" chart
# ---------------------------------------------------------------------------

def plot_cluster_scatter(
    X_2d: np.ndarray,
    labels: np.ndarray,
    cluster_names: dict,
    method_name: str = 'UMAP',
    save_path: Optional[str] = None,
) -> go.Figure:
    """2D scatter plot of dimensionality-reduced data, colored by cluster.

    This chart exists to prove that your clusters aren't just random noise.
    If the dots form visually distinct blobs, you're golden. If it looks
    like someone sneezed on a canvas, maybe reconsider your k.

    Args:
        X_2d: 2D array from reduce_dimensions().
        labels: Cluster assignment labels.
        cluster_names: Dict {cluster_id: 'Name'}.
        method_name: Name of the reduction method (for axis labels).
        save_path: Optional save path.

    Returns:
        Plotly Figure object.
    """
    print(f"📊 Generating {method_name} scatter plot...")

    scatter_df = pd.DataFrame({
        f'{method_name}-1': X_2d[:, 0],
        f'{method_name}-2': X_2d[:, 1],
        'cluster': labels,
        'cluster_name': [cluster_names.get(l, f'Cluster {l}') for l in labels],
    })

    fig = px.scatter(
        scatter_df,
        x=f'{method_name}-1',
        y=f'{method_name}-2',
        color='cluster_name',
        color_discrete_sequence=PALETTE,
        title=f'Fan Segments ({method_name} Projection)',
        hover_data=['cluster'],
    )

    # Add centroids as larger markers
    for idx, cluster_id in enumerate(sorted(set(labels))):
        mask = labels == cluster_id
        cx = X_2d[mask, 0].mean()
        cy = X_2d[mask, 1].mean()
        fig.add_trace(go.Scatter(
            x=[cx], y=[cy],
            mode='markers+text',
            marker=dict(size=20, color=_cluster_color(idx), symbol='diamond',
                       line=dict(width=2, color='white')),
            text=[cluster_names.get(cluster_id, f'C{cluster_id}')],
            textposition='top center',
            textfont=dict(color=TEXT_COLOR, size=12),
            showlegend=False,
        ))

    fig.update_layout(
        paper_bgcolor=BACKGROUND,
        plot_bgcolor=BACKGROUND,
        font=dict(color=TEXT_COLOR),
        xaxis=dict(gridcolor=GRID_COLOR, zerolinecolor=GRID_COLOR),
        yaxis=dict(gridcolor=GRID_COLOR, zerolinecolor=GRID_COLOR),
        legend=dict(font=dict(color=TEXT_COLOR)),
    )

    if save_path:
        fig.write_image(save_path, width=1200, height=800, scale=2)
        print(f"   💾 Saved to {save_path}")

    print("✅ Scatter plot ready")
    return fig


# ---------------------------------------------------------------------------
# CVI Bar Chart — "Show me the money"
# ---------------------------------------------------------------------------

def plot_cvi_bar(
    segment_summary: pd.DataFrame,
    cluster_names: dict,
    save_path: Optional[str] = None,
) -> go.Figure:
    """Horizontal bar chart ranking clusters by Commercial Value Index.

    Shows both mean CVI and total CVI (size × mean). Because a small
    high-value segment and a large medium-value segment both matter,
    just in different ways.

    Args:
        segment_summary: Output from segment_size_and_value().
        cluster_names: Dict {cluster_id: 'Name'}.
        save_path: Optional save path.

    Returns:
        Plotly Figure object.
    """
    print("📊 Generating CVI bar chart...")

    df = segment_summary.copy()
    df['name'] = df['cluster'].map(
        lambda c: cluster_names.get(c, f'Cluster {c}')
    )
    df = df.sort_values('mean_cvi', ascending=True)

    fig = go.Figure()

    fig.add_trace(go.Bar(
        y=df['name'],
        x=df['mean_cvi'],
        orientation='h',
        name='Mean CVI',
        marker_color=PALETTE[0],
        text=[f"{v:.2f} (n={n:,}, {pct}%)" for v, n, pct
              in zip(df['mean_cvi'], df['n'], df['pct_of_total'])],
        textposition='outside',
        textfont=dict(color=TEXT_COLOR),
    ))

    fig.update_layout(
        title=dict(text='Commercial Value Index by Segment', font=dict(color=TEXT_COLOR, size=20)),
        xaxis_title='Mean CVI Score',
        paper_bgcolor=BACKGROUND,
        plot_bgcolor=BACKGROUND,
        font=dict(color=TEXT_COLOR),
        xaxis=dict(gridcolor=GRID_COLOR, zerolinecolor=GRID_COLOR),
        yaxis=dict(gridcolor=GRID_COLOR),
        showlegend=False,
        margin=dict(l=200),
    )

    if save_path:
        fig.write_image(save_path, width=1200, height=600, scale=2)
        print(f"   💾 Saved to {save_path}")

    print("✅ CVI bar chart ready")
    return fig


# ---------------------------------------------------------------------------
# Cluster Heatmap — the "who's hot, who's not" grid
# ---------------------------------------------------------------------------

def plot_cluster_heatmap(
    comparison_df: pd.DataFrame,
    cluster_names: dict,
    save_path: Optional[str] = None,
) -> plt.Figure:
    """Heatmap of cluster index values (cluster mean / pop mean × 100).

    Red = over-indexes (>120), Blue = under-indexes (<80), White = average.
    This is the chart that reveals at a glance what makes each segment unique.
    Judges love it. Sponsors love it. Your presentation loves it.

    Args:
        comparison_df: Output from generate_cluster_comparison().
        cluster_names: Dict {cluster_id: 'Name'}.
        save_path: Optional save path.

    Returns:
        Matplotlib Figure object.
    """
    print("📊 Generating cluster heatmap...")
    _apply_dark_theme()

    # Rename index to cluster names
    plot_df = comparison_df.copy()
    plot_df.index = [cluster_names.get(i, f'Cluster {i}') for i in plot_df.index]

    # Clean column names for display
    plot_df.columns = [c.replace('_', ' ').title() for c in plot_df.columns]

    # Limit to manageable number of features
    if len(plot_df.columns) > 15:
        # Pick features with highest variance across clusters (most differentiating)
        variance = plot_df.var()
        top_features = variance.nlargest(15).index.tolist()
        plot_df = plot_df[top_features]

    fig, ax = plt.subplots(figsize=(max(12, len(plot_df.columns) * 0.8), max(6, len(plot_df) * 1.2)))

    sns.heatmap(
        plot_df,
        annot=True,
        fmt='.0f',
        center=100,
        cmap='RdBu_r',
        linewidths=0.5,
        linecolor=GRID_COLOR,
        cbar_kws={'label': 'Index (100 = population avg)'},
        ax=ax,
        vmin=50,
        vmax=150,
    )

    ax.set_title('Cluster Index: Over/Under-Indexing vs Population',
                 fontsize=16, color=TEXT_COLOR, pad=20)
    ax.set_ylabel('')
    ax.set_xlabel('')
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)

    plt.tight_layout()
    _save_if_needed(fig, save_path)

    print("✅ Heatmap ready")
    return fig


# ---------------------------------------------------------------------------
# Feature Distribution — the "zoom and enhance" chart
# ---------------------------------------------------------------------------

def plot_feature_distributions(
    df: pd.DataFrame,
    feature: str,
    labels: np.ndarray,
    cluster_names: dict,
    save_path: Optional[str] = None,
) -> plt.Figure:
    """Violin/box plots of a single feature split by cluster.

    When you find something interesting in the heatmap and want to
    "zoom in" on a specific variable. Good for Q&A deep-dives.

    Args:
        df: DataFrame with the feature column.
        feature: Column name to plot.
        labels: Cluster labels.
        cluster_names: Dict {cluster_id: 'Name'}.
        save_path: Optional save path.

    Returns:
        Matplotlib Figure object.
    """
    print(f"📊 Generating distribution plot for '{feature}'...")
    _apply_dark_theme()

    plot_df = df.copy()
    plot_df['Segment'] = [cluster_names.get(l, f'Cluster {l}') for l in labels]

    fig, ax = plt.subplots(figsize=(10, 6))

    # Use violin plot with strip overlay for best of both worlds
    parts = ax.violinplot(
        [plot_df[plot_df['Segment'] == name][feature].dropna().values
         for name in sorted(plot_df['Segment'].unique())],
        positions=range(len(cluster_names)),
        showmeans=True,
        showmedians=True,
    )

    # Color the violins
    for idx, pc in enumerate(parts['bodies']):
        pc.set_facecolor(_cluster_color(idx))
        pc.set_alpha(0.6)

    ax.set_xticks(range(len(cluster_names)))
    ax.set_xticklabels(sorted(cluster_names.values()), rotation=30, ha='right')
    ax.set_ylabel(feature.replace('_', ' ').title())
    ax.set_title(f'Distribution of {feature.replace("_", " ").title()} by Segment',
                 fontsize=14, color=TEXT_COLOR, pad=15)

    plt.tight_layout()
    _save_if_needed(fig, save_path)

    print(f"✅ Distribution plot ready")
    return fig


# ---------------------------------------------------------------------------
# Segment Size vs Value — the "SO WHAT" chart (a.k.a. Slide 7)
# ---------------------------------------------------------------------------

def plot_segment_size_value(
    size_value_df: pd.DataFrame,
    cluster_names: dict,
    save_path: Optional[str] = None,
) -> go.Figure:
    """Bubble chart: x = % of population, y = % of total CVI.

    Segments above the diagonal are high-value (punching above their weight).
    Segments below are underperforming relative to size.
    This is THE "so what" chart — it answers "where should we invest?"

    If this chart doesn't make your audience sit up straighter, nothing will.

    Args:
        size_value_df: Output from segment_size_and_value().
        cluster_names: Dict {cluster_id: 'Name'}.
        save_path: Optional save path.

    Returns:
        Plotly Figure object.
    """
    print("📊 Generating segment size vs. value bubble chart...")

    df = size_value_df.copy()
    df['name'] = df['cluster'].map(lambda c: cluster_names.get(c, f'Cluster {c}'))

    fig = go.Figure()

    # Diagonal reference line (size = value)
    max_val = max(df['pct_of_total'].max(), df.get('pct_of_total_cvi', df['pct_of_total']).max()) + 5
    fig.add_trace(go.Scatter(
        x=[0, max_val], y=[0, max_val],
        mode='lines',
        line=dict(color='white', width=1, dash='dash'),
        name='Fair Share Line',
        showlegend=True,
    ))

    # Add annotation for the diagonal
    fig.add_annotation(
        x=max_val * 0.7, y=max_val * 0.5,
        text="← Underperforming",
        showarrow=False,
        font=dict(color='#ff6b6b', size=11),
    )
    fig.add_annotation(
        x=max_val * 0.3, y=max_val * 0.5,
        text="Overperforming →",
        showarrow=False,
        font=dict(color='#4ecdc4', size=11),
    )

    # Bubble for each segment
    pct_cvi_col = 'pct_of_total_cvi' if 'pct_of_total_cvi' in df.columns else 'pct_of_total'
    for idx, row in df.iterrows():
        fig.add_trace(go.Scatter(
            x=[row['pct_of_total']],
            y=[row[pct_cvi_col]],
            mode='markers+text',
            marker=dict(
                size=row['n'] / df['n'].max() * 60 + 20,
                color=_cluster_color(idx),
                line=dict(width=2, color='white'),
            ),
            text=[row['name']],
            textposition='top center',
            textfont=dict(color=TEXT_COLOR, size=12),
            name=row['name'],
            hovertemplate=(
                f"<b>{row['name']}</b><br>"
                f"Size: {row['pct_of_total']}% of fans<br>"
                f"Value: {row[pct_cvi_col]}% of CVI<br>"
                f"n = {row['n']:,}<extra></extra>"
            ),
        ))

    fig.update_layout(
        title=dict(text='Segment Size vs. Commercial Value', font=dict(color=TEXT_COLOR, size=20)),
        xaxis_title='% of Total Fans',
        yaxis_title='% of Total Commercial Value',
        paper_bgcolor=BACKGROUND,
        plot_bgcolor=BACKGROUND,
        font=dict(color=TEXT_COLOR),
        xaxis=dict(gridcolor=GRID_COLOR, zerolinecolor=GRID_COLOR, range=[0, max_val]),
        yaxis=dict(gridcolor=GRID_COLOR, zerolinecolor=GRID_COLOR, range=[0, max_val]),
        showlegend=False,
    )

    if save_path:
        fig.write_image(save_path, width=1000, height=800, scale=2)
        print(f"   💾 Saved to {save_path}")

    print("✅ Size vs. value chart ready — this is the money slide")
    return fig


# ---------------------------------------------------------------------------
# Dimensionality Reduction — squishing 30 dimensions into 2
# ---------------------------------------------------------------------------

def reduce_dimensions(
    X: np.ndarray,
    method: str = 'umap',
    n_components: int = 2,
) -> np.ndarray:
    """Reduce feature matrix to 2D for visualization.

    UMAP is preferred (better at preserving local structure), but we
    gracefully fall back to PCA if UMAP throws a tantrum.

    Args:
        X: Feature matrix (numeric).
        method: 'umap' or 'pca'.
        n_components: Output dimensions (usually 2).

    Returns:
        Reduced array of shape (n_samples, n_components).
    """
    X = np.asarray(X, dtype=float)
    print(f"📐 Reducing {X.shape[1]} dimensions → {n_components}D using {method.upper()}...")

    if method.lower() == 'umap':
        try:
            import umap
            reducer = umap.UMAP(n_components=n_components, random_state=42)
            X_reduced = reducer.fit_transform(X)
            print(f"✅ UMAP reduction complete")
            return X_reduced
        except ImportError:
            print("⚠️  UMAP not available, falling back to PCA "
                  "(install umap-learn for the good stuff)")
        except Exception as e:
            print(f"⚠️  UMAP failed ({e}), falling back to PCA")

    # PCA fallback — the reliable understudy
    from sklearn.decomposition import PCA
    pca = PCA(n_components=n_components, random_state=42)
    X_reduced = pca.fit_transform(X)
    explained = pca.explained_variance_ratio_.sum()
    print(f"✅ PCA reduction complete ({explained:.1%} variance explained)")
    return X_reduced


# ---------------------------------------------------------------------------
# Export All — the "save everything" panic button
# ---------------------------------------------------------------------------

def export_all_charts(outputs_dir: str = 'outputs/') -> None:
    """Save all currently open matplotlib figures to the outputs directory.

    Call this at the end of your analysis notebook to make sure
    every chart is safely saved to disk. Like hitting Ctrl+S
    forty times in a row. Better safe than presenting a blank slide.

    Args:
        outputs_dir: Directory to save all charts.
    """
    os.makedirs(outputs_dir, exist_ok=True)

    figures = [plt.figure(i) for i in plt.get_fignums()]
    if not figures:
        print("📭 No matplotlib figures to export. (Plotly figures need explicit save_path)")
        return

    print(f"💾 Exporting {len(figures)} matplotlib figures to {outputs_dir}...")
    for idx, fig in enumerate(figures):
        title = fig.axes[0].get_title() if fig.axes else f'figure_{idx}'
        safe_name = title.lower().replace(' ', '_').replace('/', '_')[:50]
        path = os.path.join(outputs_dir, f'{safe_name}.png')
        fig.savefig(path, dpi=300, bbox_inches='tight', facecolor=BACKGROUND)
        print(f"   💾 {path}")

    print(f"✅ All charts exported. You're ready for slide-making.\n")
