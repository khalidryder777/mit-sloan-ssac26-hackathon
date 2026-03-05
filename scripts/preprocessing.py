"""
preprocessing.py
MIT Sloan SSAC 2026 Hackathon — Data Preprocessing & Encoding Utilities

Welcome to the "grow potatoes on Mars" phase of our hackathon pipeline.
Before we can do anything glamorous (clustering! personas! CVI!), we need
to shovel through the raw data like astronauts composting their own waste.

This module handles: loading, inspecting, cleaning, encoding, and feature
selection. It's the unglamorous foundation that keeps everything else from
exploding on the launchpad.

Usage:
    from preprocessing import *
    df = load_and_inspect('../data/CHANGEME.csv')
    col_types = identify_column_types(df)
    df = clean_data(df, col_types)
    X, scaler, encoders, feature_names, cat_idx = encode_for_clustering(df, col_types)
"""

import os
import warnings
from typing import Optional

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder

warnings.filterwarnings("ignore")


# ---------------------------------------------------------------------------
# Loading & Inspection — a.k.a. "What fresh hell is this dataset?"
# ---------------------------------------------------------------------------

def load_and_inspect(filepath: str) -> pd.DataFrame:
    """Load CSV/Excel, print shape, dtypes, missing counts, first 5 rows.

    Auto-detects delimiter and handles common encoding disasters.
    Think of it as the data equivalent of opening the airlock slowly
    to see if there's atmosphere on the other side.

    Args:
        filepath: Path to the data file. Supports CSV, TSV, Excel.

    Returns:
        The loaded DataFrame, ready for abuse.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(
            f"🚨 File not found: {filepath}\n"
            f"   Did you forget to drop the CSV into data/? "
            f"It's literally step 1 on the cheatsheet."
        )

    ext = os.path.splitext(filepath)[1].lower()
    print(f"📂 Loading {filepath}...")

    if ext in ('.xlsx', '.xls'):
        df = pd.read_excel(filepath)
    else:
        # Try common delimiters — because apparently CSV doesn't always mean "comma"
        for sep in [',', '\t', ';', '|']:
            try:
                df = pd.read_csv(filepath, sep=sep, encoding='utf-8')
                if df.shape[1] > 1:
                    break
            except UnicodeDecodeError:
                df = pd.read_csv(filepath, sep=sep, encoding='latin-1')
                if df.shape[1] > 1:
                    break

    print(f"✅ Loaded {df.shape[0]:,} rows × {df.shape[1]} columns")
    print(f"   That's {df.shape[0] * df.shape[1]:,} cells of raw potential.\n")

    print("📊 Column Types:")
    print(df.dtypes.to_string())
    print()

    missing = df.isnull().sum()
    missing_pct = (missing / len(df) * 100).round(1)
    missing_report = pd.DataFrame({'missing': missing, 'pct': missing_pct})
    missing_report = missing_report[missing_report['missing'] > 0].sort_values('pct', ascending=False)

    if len(missing_report) > 0:
        print(f"🕳️  Missing Values ({len(missing_report)} columns affected):")
        print(missing_report.to_string())
    else:
        print("🎉 No missing values! (suspicious, but we'll take it)")
    print()

    print("👀 First 5 rows:")
    print(df.head().to_string())
    print()

    return df


# ---------------------------------------------------------------------------
# Column Type Detection — teaching the computer what a Likert scale is
# ---------------------------------------------------------------------------

def identify_column_types(df: pd.DataFrame) -> dict:
    """Auto-classify columns into semantic types for downstream processing.

    This function looks at each column and tries to figure out what it
    actually represents, because pandas dtypes are about as informative
    as a weather forecast that says "there will be weather."

    Categories:
        - numeric_continuous: Actual continuous numeric data
        - numeric_ordinal: Likert scales (1-5 or 1-7) — the backbone of surveys
        - categorical_low: < 10 unique values
        - categorical_high: >= 10 unique values
        - binary: Exactly 2 unique values
        - text: Freeform text (mean length > 50 chars)
        - datetime: Date/time columns
        - id_columns: Unique per row (useless for clustering, great for databases)

    Args:
        df: The DataFrame to classify.

    Returns:
        Dict mapping type names to lists of column names.
    """
    col_types = {
        'numeric_continuous': [],
        'numeric_ordinal': [],
        'categorical_low': [],
        'categorical_high': [],
        'binary': [],
        'text': [],
        'datetime': [],
        'id_columns': [],
    }

    for col in df.columns:
        n_unique = df[col].nunique()
        n_rows = len(df)

        # ID columns: unique (or nearly unique) per row — the "name tags" of data
        if n_unique >= 0.95 * n_rows and n_rows > 20:
            col_types['id_columns'].append(col)
            continue

        # Datetime detection
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            col_types['datetime'].append(col)
            continue

        # Try to parse as datetime if it's object type
        if df[col].dtype == 'object':
            try:
                pd.to_datetime(df[col].dropna().head(20))
                col_types['datetime'].append(col)
                continue
            except (ValueError, TypeError):
                pass

        # Text: object type with long strings (probably open-ended survey responses)
        if df[col].dtype == 'object':
            avg_len = df[col].dropna().astype(str).str.len().mean()
            if avg_len > 50:
                col_types['text'].append(col)
                continue

        # Binary: exactly 2 unique values
        if n_unique == 2:
            col_types['binary'].append(col)
            continue

        # Numeric columns
        if pd.api.types.is_numeric_dtype(df[col]):
            # Likert scales: integers in small range (1-5 or 1-7 or 0-10)
            if n_unique <= 11 and df[col].dropna().apply(lambda x: x == int(x)).all():
                col_types['numeric_ordinal'].append(col)
            else:
                col_types['numeric_continuous'].append(col)
            continue

        # Categorical
        if n_unique < 10:
            col_types['categorical_low'].append(col)
        else:
            col_types['categorical_high'].append(col)

    # Print the classification like a proud parent showing off their kid's grades
    print("🔍 Column Type Classification:")
    for type_name, cols in col_types.items():
        if cols:
            print(f"   {type_name}: {cols}")
    print()

    return col_types


# ---------------------------------------------------------------------------
# Data Cleaning — because real data is never clean and neither is my desk
# ---------------------------------------------------------------------------

def clean_data(df: pd.DataFrame, col_types: dict) -> pd.DataFrame:
    """Handle missing values, drop junk columns, remove duplicates.

    Like a hazmat team for your dataset. We go in, neutralize the threats,
    and come out with something you can actually work with.

    Strategy:
        - Numeric: median imputation (mean is a coward's choice — outliers destroy it)
        - Categorical: mode imputation or 'Unknown' bucket
        - Columns > 50% missing: dropped (they had their chance)
        - Exact duplicate rows: dropped (clones aren't fans, they're errors)

    Args:
        df: The dirty DataFrame.
        col_types: Output from identify_column_types().

    Returns:
        Cleaned DataFrame + prints a summary of what we nuked.
    """
    original_shape = df.shape
    df = df.copy()

    # Step 1: Drop columns that are more hole than data
    missing_pct = df.isnull().mean()
    drop_cols = missing_pct[missing_pct > 0.5].index.tolist()
    if drop_cols:
        print(f"🗑️  Dropping {len(drop_cols)} columns with >50% missing: {drop_cols}")
        df = df.drop(columns=drop_cols)

    # Update col_types to remove dropped columns
    for type_name in col_types:
        col_types[type_name] = [c for c in col_types[type_name] if c in df.columns]

    # Step 2: Impute numeric columns with median
    numeric_cols = (
        col_types['numeric_continuous'] +
        col_types['numeric_ordinal'] +
        col_types['binary']
    )
    numeric_cols = [c for c in numeric_cols if c in df.columns]
    for col in numeric_cols:
        n_missing = df[col].isnull().sum()
        if n_missing > 0:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"   📍 {col}: filled {n_missing} missing with median={median_val:.2f}")

    # Step 3: Impute categoricals with mode or 'Unknown'
    cat_cols = col_types['categorical_low'] + col_types['categorical_high'] + col_types['text']
    cat_cols = [c for c in cat_cols if c in df.columns]
    for col in cat_cols:
        n_missing = df[col].isnull().sum()
        if n_missing > 0:
            mode_val = df[col].mode()
            if len(mode_val) > 0:
                df[col] = df[col].fillna(mode_val.iloc[0])
                print(f"   📍 {col}: filled {n_missing} missing with mode='{mode_val.iloc[0]}'")
            else:
                df[col] = df[col].fillna('Unknown')
                print(f"   📍 {col}: filled {n_missing} missing with 'Unknown'")

    # Step 4: Drop exact duplicates
    n_dupes = df.duplicated().sum()
    if n_dupes > 0:
        df = df.drop_duplicates()
        print(f"🧹 Removed {n_dupes} exact duplicate rows")

    print(f"\n✅ Cleaning complete: {original_shape} → {df.shape}")
    print(f"   We lost {original_shape[0] - df.shape[0]} rows and "
          f"{original_shape[1] - df.shape[1]} columns. Acceptable casualties.\n")

    return df


# ---------------------------------------------------------------------------
# Encoding — translating human data into robot language
# ---------------------------------------------------------------------------

def encode_for_clustering(df: pd.DataFrame, col_types: dict) -> tuple:
    """Prepare data for clustering algorithms.

    Converts the messy human-readable DataFrame into the pristine numeric
    matrix that clustering algorithms demand. It's like translating
    Shakespeare into binary — information is preserved, soul is not.

    Strategy:
        - StandardScaler on continuous numeric columns
        - Label encode ordinal columns (preserving order)
        - One-hot encode low-cardinality categoricals
        - Binary columns left as-is (they're already 0/1, or close enough)
        - ID, text, datetime, and high-cardinality columns are dropped

    Args:
        df: Cleaned DataFrame.
        col_types: Output from identify_column_types().

    Returns:
        Tuple of (X_processed, scaler, encoders_dict, feature_names, categorical_indices)
        categorical_indices is needed for K-Prototypes.
    """
    df = df.copy()
    encoders = {}
    feature_dfs = []
    categorical_indices = []
    current_idx = 0

    # Continuous numeric: scale to zero mean, unit variance
    num_cols = [c for c in col_types['numeric_continuous'] if c in df.columns]
    scaler = StandardScaler()
    if num_cols:
        scaled = pd.DataFrame(
            scaler.fit_transform(df[num_cols]),
            columns=num_cols,
            index=df.index
        )
        feature_dfs.append(scaled)
        current_idx += len(num_cols)
        print(f"📐 Scaled {len(num_cols)} continuous numeric columns")

    # Ordinal: label encode preserving order (they're already integers, just scale)
    ord_cols = [c for c in col_types['numeric_ordinal'] if c in df.columns]
    if ord_cols:
        ord_scaled = pd.DataFrame(
            scaler.fit_transform(df[ord_cols]) if not num_cols else StandardScaler().fit_transform(df[ord_cols]),
            columns=ord_cols,
            index=df.index
        )
        feature_dfs.append(ord_scaled)
        current_idx += len(ord_cols)
        print(f"📏 Scaled {len(ord_cols)} ordinal columns")

    # Binary: keep as-is (encode to 0/1 if string)
    bin_cols = [c for c in col_types['binary'] if c in df.columns]
    for col in bin_cols:
        if df[col].dtype == 'object':
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = le
    if bin_cols:
        feature_dfs.append(df[bin_cols].reset_index(drop=True))
        current_idx += len(bin_cols)
        print(f"🔘 Encoded {len(bin_cols)} binary columns")

    # Low-cardinality categoricals: one-hot encode
    cat_cols = [c for c in col_types['categorical_low'] if c in df.columns]
    if cat_cols:
        ohe = OneHotEncoder(sparse_output=False, drop='first', handle_unknown='ignore')
        encoded = ohe.fit_transform(df[cat_cols].astype(str))
        ohe_names = ohe.get_feature_names_out(cat_cols).tolist()
        encoded_df = pd.DataFrame(encoded, columns=ohe_names, index=df.index)
        feature_dfs.append(encoded_df)

        # Track categorical indices for K-Prototypes
        categorical_indices.extend(range(current_idx, current_idx + len(ohe_names)))
        current_idx += len(ohe_names)
        encoders['ohe'] = ohe
        print(f"🏷️  One-hot encoded {len(cat_cols)} categorical columns → {len(ohe_names)} features")

    # Skip: id_columns, text, datetime, categorical_high
    skipped = col_types['id_columns'] + col_types['text'] + col_types['datetime'] + col_types['categorical_high']
    skipped = [c for c in skipped if c in df.columns]
    if skipped:
        print(f"⏭️  Skipped {len(skipped)} columns (IDs/text/datetime/high-card): {skipped}")

    if not feature_dfs:
        raise ValueError(
            "🚨 No features survived encoding! Your data might be entirely "
            "IDs and text columns. Check col_types and try manual feature selection."
        )

    X = pd.concat(feature_dfs, axis=1)
    feature_names = X.columns.tolist()

    print(f"\n✅ Feature matrix ready: {X.shape[0]} samples × {X.shape[1]} features")
    if categorical_indices:
        print(f"   Categorical feature indices (for K-Prototypes): {categorical_indices}")
    print()

    return X.values, scaler, encoders, feature_names, categorical_indices


# ---------------------------------------------------------------------------
# Feature Selection — Marie Kondo-ing your feature space
# ---------------------------------------------------------------------------

def create_feature_matrix(df: pd.DataFrame, features: list = None) -> pd.DataFrame:
    """Select a subset of features for clustering.

    If no features are specified, auto-selects by dropping:
    - ID columns (unique per row — useless for clustering)
    - Near-zero-variance columns (everyone answered the same thing)
    - One of each highly correlated pair (r > 0.95 — redundant info)

    Think of it as packing for a trip: you don't need 12 pairs of shoes,
    and you definitely don't need your passport column in a clustering model.

    Args:
        df: The DataFrame to select features from.
        features: Optional explicit list of columns to keep.

    Returns:
        Filtered DataFrame with only the good stuff.
    """
    if features is not None:
        missing = [f for f in features if f not in df.columns]
        if missing:
            raise ValueError(f"🚨 These columns don't exist in the DataFrame: {missing}")
        print(f"📋 Using {len(features)} manually selected features")
        return df[features].copy()

    print("🤖 Auto-selecting features...")
    keep = df.copy()

    # Drop likely ID columns (unique or near-unique values)
    id_cols = [c for c in keep.columns if keep[c].nunique() >= 0.95 * len(keep)]
    if id_cols:
        keep = keep.drop(columns=id_cols)
        print(f"   Dropped ID-like columns: {id_cols}")

    # Drop non-numeric for variance/correlation checks
    # (but remember them for later — we're not monsters)
    non_numeric = keep.select_dtypes(exclude=np.number).columns.tolist()
    numeric_keep = keep.select_dtypes(include=np.number)

    # Drop near-zero-variance columns (std < 0.01 of range, basically constants)
    if len(numeric_keep.columns) > 0:
        col_range = numeric_keep.max() - numeric_keep.min()
        col_std = numeric_keep.std()
        low_var = col_std[
            (col_range > 0) & (col_std / col_range < 0.01)
        ].index.tolist()
        # Also catch truly constant columns
        constant = col_std[col_std == 0].index.tolist()
        low_var = list(set(low_var + constant))
        if low_var:
            numeric_keep = numeric_keep.drop(columns=low_var)
            print(f"   Dropped low-variance columns: {low_var}")

    # Drop one of each highly correlated pair (r > 0.95)
    if len(numeric_keep.columns) > 1:
        corr = numeric_keep.corr().abs()
        upper = corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))
        to_drop = [col for col in upper.columns if any(upper[col] > 0.95)]
        if to_drop:
            numeric_keep = numeric_keep.drop(columns=to_drop)
            print(f"   Dropped highly correlated columns (r>0.95): {to_drop}")

    # Recombine numeric and non-numeric
    keep_cols = numeric_keep.columns.tolist() + non_numeric
    result = df[keep_cols].copy()

    print(f"✅ Selected {len(result.columns)} features from {len(df.columns)} original columns")
    print(f"   Features: {result.columns.tolist()}\n")

    return result
