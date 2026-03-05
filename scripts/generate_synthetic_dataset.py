"""
generate_synthetic_dataset.py
MIT Sloan SSAC 2026 Hackathon — Synthetic Fan Data Generator

"I'm going to fabricate 20,000 fake sports fans with the precision
of someone who's read seven industry reports and has too much time
on their hands. Each fake fan will have fake demographics, fake spending
habits, and very real statistical properties. It's like The Truman Show,
except Truman is a pandas DataFrame and the audience is a clustering
algorithm."

This script generates a realistic guesstimate of the Wasserman Foundation
dataset for the SSAC 2026 Hackathon. The data embeds 5 latent fan segments
matching known Wasserman archetypes (IsoFan, DuoFan, SocialFan) crossed
with behavioral patterns (Silent Superfan, Values Advocate, Next-Gen, etc.)

The generated data has:
- 20,000 rows × 35 columns
- 4 column categories: Demographics, Behavioral, Commercial, Psychographic
- Realistic correlations (spend↔attendance, values↔cause, etc.)
- Non-uniform missing data (income skipped more by Gen Z)
- Known stats embedded: 84% decision-maker, 50% general-fan, 18-21% iso-fan

Usage:
    python scripts/generate_synthetic_dataset.py
    # → Saves to data/synthetic_fan_data.csv
"""

import os
import numpy as np
import pandas as pd


# ---------------------------------------------------------------------------
# Segment Definitions — the 5 tribes we're predicting
# ---------------------------------------------------------------------------

SEGMENT_NAMES = {
    0: 'Silent Superfan',   # IsoFan: high spend, low social, consumes alone
    1: 'Social Spectator',  # SocialFan: group attendance, high social
    2: 'Values Advocate',   # DuoFan: highest cause alignment, shares with 1
    3: 'Next-Gen Evangelist',  # Digital-first Gen Z, highest brand receptivity
    4: 'Casual Curious',    # Low frequency, newest fans, most growth room
}

SEGMENT_PROBS = [0.19, 0.27, 0.22, 0.18, 0.14]


def generate_synthetic_fan_data(n: int = 20000, seed: int = 42) -> pd.DataFrame:
    """Generate a maximally realistic synthetic fan survey dataset.

    Embeds 5 latent segments with segment-conditional distributions,
    realistic correlations, and non-uniform missing data patterns.
    The segment labels are NOT included — they should be discovered
    through clustering. That's the whole point of the hackathon.

    Args:
        n: Number of synthetic fans to generate.
        seed: Random seed for reproducibility.

    Returns:
        DataFrame with 35 columns and n rows.
    """
    rng = np.random.RandomState(seed)
    print(f"🧬 Generating {n:,} synthetic fans across 5 latent segments...")

    # Assign latent segments (these are NOT in the output)
    segments = rng.choice(5, size=n, p=SEGMENT_PROBS)

    data = {}

    # ==================================================================
    # ID COLUMN
    # ==================================================================
    data['respondent_id'] = [f'R{i:05d}' for i in range(n)]

    # ==================================================================
    # DEMOGRAPHICS (7 columns)
    # ==================================================================

    # Age: segment-conditional, clipped to 18-72
    age_params = {0: (38, 8), 1: (33, 7), 2: (36, 9), 3: (23, 4), 4: (30, 10)}
    data['age'] = np.clip(
        [rng.normal(*age_params[s]) for s in segments], 18, 72
    ).astype(int)

    # Generation: derived from age
    def age_to_gen(age):
        if age <= 28:
            return 'Gen Z'
        elif age <= 44:
            return 'Millennial'
        elif age <= 56:
            return 'Gen X'
        else:
            return 'Boomer'
    data['generation'] = [age_to_gen(a) for a in data['age']]

    # Gender: segment-conditional
    gender_weights = {
        0: [0.55, 0.35, 0.10],
        1: [0.60, 0.30, 0.10],
        2: [0.72, 0.18, 0.10],
        3: [0.58, 0.30, 0.12],
        4: [0.62, 0.28, 0.10],
    }
    genders = ['Female', 'Male', 'Non-binary']
    data['gender'] = [rng.choice(genders, p=gender_weights[s]) for s in segments]

    # Region
    regions = ['Northeast', 'Southeast', 'Midwest', 'West', 'Southwest']
    region_weights = {
        0: [0.22, 0.20, 0.22, 0.20, 0.16],
        1: [0.18, 0.22, 0.18, 0.24, 0.18],
        2: [0.20, 0.20, 0.20, 0.22, 0.18],
        3: [0.16, 0.18, 0.16, 0.30, 0.20],
        4: [0.20, 0.22, 0.20, 0.20, 0.18],
    }
    data['region'] = [rng.choice(regions, p=region_weights[s]) for s in segments]

    # Household income: segment-conditional
    incomes = ['Under $35K', '$35K-$60K', '$60K-$100K', '$100K-$150K', 'Over $150K']
    income_weights = {
        0: [0.05, 0.12, 0.28, 0.35, 0.20],  # Skews higher
        1: [0.10, 0.22, 0.35, 0.22, 0.11],
        2: [0.08, 0.18, 0.32, 0.28, 0.14],
        3: [0.30, 0.30, 0.25, 0.10, 0.05],  # Youngest, lowest income
        4: [0.15, 0.25, 0.30, 0.20, 0.10],
    }
    data['household_income'] = [rng.choice(incomes, p=income_weights[s]) for s in segments]

    # Household size
    hh_params = {0: (1.8, 0.8), 1: (3.2, 1.1), 2: (2.2, 0.8), 3: (2.5, 1.0), 4: (2.6, 1.0)}
    data['household_size'] = np.clip(
        [rng.normal(*hh_params[s]) for s in segments], 1, 6
    ).round().astype(int)

    # Primary decision-maker: overall ~84%
    dm_probs = {0: 0.90, 1: 0.82, 2: 0.88, 3: 0.78, 4: 0.80}
    data['primary_decision_maker'] = [
        1 if rng.random() < dm_probs[s] else 0 for s in segments
    ]

    # ==================================================================
    # BEHAVIORAL (10 columns)
    # ==================================================================

    # Games attended: correlated groups within each segment
    games_params = {0: 10, 1: 6, 2: 5, 3: 2, 4: 1}
    data['games_attended_last_year'] = np.clip(
        [rng.poisson(games_params[s]) for s in segments], 0, 40
    )

    # Years as fan
    tenure_params = {0: (12, 5), 1: (8, 4), 2: (7, 5), 3: (3, 2), 4: (2, 2)}
    data['years_as_fan'] = np.clip(
        [rng.normal(*tenure_params[s]) for s in segments], 0, 30
    ).round().astype(int)

    # Merch purchases
    merch_count_params = {0: 7, 1: 3, 2: 3, 3: 2, 4: 1}
    data['merch_purchases_last_year'] = np.clip(
        [rng.poisson(merch_count_params[s]) for s in segments], 0, 25
    )

    # Annual ticket spend — correlated with games attended (r~0.75)
    ticket_base = {0: 650, 1: 300, 2: 250, 3: 80, 4: 40}
    ticket_std = {0: 200, 1: 150, 2: 120, 3: 60, 4: 40}
    raw_ticket = np.array([rng.normal(ticket_base[s], ticket_std[s]) for s in segments])
    # Inject correlation with games_attended
    games_z = (data['games_attended_last_year'] - np.mean(data['games_attended_last_year'])) / (np.std(data['games_attended_last_year']) + 1e-8)
    raw_ticket += games_z * 50  # Add correlated component
    data['annual_ticket_spend'] = np.clip(raw_ticket, 0, 3000).round(2)

    # Annual merch spend — correlated with merch purchases (r~0.85)
    merch_base = {0: 350, 1: 120, 2: 110, 3: 80, 4: 30}
    merch_std = {0: 120, 1: 70, 2: 60, 3: 50, 4: 30}
    raw_merch = np.array([rng.normal(merch_base[s], merch_std[s]) for s in segments])
    merch_z = (data['merch_purchases_last_year'] - np.mean(data['merch_purchases_last_year'])) / (np.std(data['merch_purchases_last_year']) + 1e-8)
    raw_merch += merch_z * 30
    data['annual_merch_spend'] = np.clip(raw_merch, 0, 1500).round(2)

    # Streaming hours per month
    stream_params = {0: (8, 5), 1: (12, 6), 2: (10, 5), 3: (25, 10), 4: (4, 4)}
    data['streaming_hours_per_month'] = np.clip(
        [rng.normal(*stream_params[s]) for s in segments], 0, 80
    ).round(1)

    # App sessions per month
    app_params = {0: 12, 1: 10, 2: 8, 3: 20, 4: 3}
    data['app_sessions_per_month'] = np.clip(
        [rng.poisson(app_params[s]) for s in segments], 0, 60
    )

    # Content pieces consumed weekly
    content_params = {0: 8, 1: 10, 2: 6, 3: 15, 4: 2}
    data['content_pieces_consumed_weekly'] = np.clip(
        [rng.poisson(content_params[s]) for s in segments], 0, 30
    )

    # Preferred viewing method
    methods = ['In-Person', 'Streaming', 'TV Broadcast', 'Social Clips']
    method_weights = {
        0: [0.45, 0.15, 0.30, 0.10],
        1: [0.20, 0.25, 0.30, 0.25],
        2: [0.25, 0.25, 0.30, 0.20],
        3: [0.05, 0.40, 0.10, 0.45],
        4: [0.10, 0.25, 0.40, 0.25],
    }
    data['preferred_viewing_method'] = [rng.choice(methods, p=method_weights[s]) for s in segments]

    # Fan of specific team (vs general women's sports fan): ~50% overall
    team_probs = {0: 0.75, 1: 0.50, 2: 0.40, 3: 0.45, 4: 0.30}
    data['fan_of_specific_team'] = [
        1 if rng.random() < team_probs[s] else 0 for s in segments
    ]

    # ==================================================================
    # COMMERCIAL / SPONSOR (8 columns)
    # ==================================================================

    # Sponsor awareness (Likert 1-5)
    sa_params = {0: (3.5, 0.9), 1: (3.2, 0.8), 2: (3.8, 0.7), 3: (4.2, 0.6), 4: (2.5, 1.0)}
    data['sponsor_awareness'] = np.clip(
        [rng.normal(*sa_params[s]) for s in segments], 1, 5
    ).round().astype(int)

    # Sponsor purchase intent (Likert 1-5) — correlated with awareness
    spi_params = {0: (3.2, 1.0), 1: (3.0, 0.8), 2: (3.6, 0.7), 3: (4.0, 0.7), 4: (2.2, 0.9)}
    raw_spi = np.array([rng.normal(*spi_params[s]) for s in segments])
    sa_z = (data['sponsor_awareness'] - np.mean(data['sponsor_awareness'])) / (np.std(data['sponsor_awareness']) + 1e-8)
    raw_spi += sa_z * 0.4  # Inject r~0.6 correlation
    data['sponsor_purchase_intent'] = np.clip(raw_spi, 1, 5).round().astype(int)

    # Brand affinity score (Likert 1-7)
    ba_params = {0: (4.5, 1.2), 1: (4.0, 1.0), 2: (5.0, 0.8), 3: (5.5, 0.8), 4: (3.0, 1.2)}
    data['brand_affinity_score'] = np.clip(
        [rng.normal(*ba_params[s]) for s in segments], 1, 7
    ).round().astype(int)

    # Would buy sponsor product (binary)
    buy_probs = {0: 0.55, 1: 0.48, 2: 0.58, 3: 0.68, 4: 0.32}
    data['would_buy_sponsor_product'] = [
        1 if rng.random() < buy_probs[s] else 0 for s in segments
    ]

    # Sponsor recall count
    recall_params = {0: 3, 1: 2, 2: 3, 3: 4, 4: 1}
    data['sponsor_recall_count'] = np.clip(
        [rng.poisson(recall_params[s]) for s in segments], 0, 8
    )

    # Partner interaction events
    partner_params = {0: 2, 1: 4, 2: 3, 3: 5, 4: 1}
    data['partner_interaction_events'] = np.clip(
        [rng.poisson(partner_params[s]) for s in segments], 0, 15
    )

    # Athlete endorsement trust (Likert 1-5)
    trust_params = {0: (3.0, 1.0), 1: (3.5, 0.8), 2: (4.0, 0.6), 3: (4.3, 0.6), 4: (2.8, 1.0)}
    data['athlete_endorsement_trust'] = np.clip(
        [rng.normal(*trust_params[s]) for s in segments], 1, 5
    ).round().astype(int)

    # Ad receptivity (Likert 1-5)
    ad_params = {0: (2.5, 1.0), 1: (3.2, 0.8), 2: (3.0, 0.9), 3: (3.8, 0.7), 4: (3.0, 1.0)}
    data['ad_receptivity'] = np.clip(
        [rng.normal(*ad_params[s]) for s in segments], 1, 5
    ).round().astype(int)

    # ==================================================================
    # PSYCHOGRAPHIC (9 columns)
    # ==================================================================

    # Fandom intensity (Likert 1-5)
    fi_params = {0: (4.5, 0.5), 1: (3.8, 0.7), 2: (4.0, 0.6), 3: (3.5, 0.8), 4: (2.0, 0.8)}
    data['fandom_intensity'] = np.clip(
        [rng.normal(*fi_params[s]) for s in segments], 1, 5
    ).round().astype(int)

    # Values alignment (Likert 1-5)
    va_params = {0: (3.0, 1.0), 1: (3.5, 0.8), 2: (4.7, 0.4), 3: (4.0, 0.7), 4: (3.0, 0.9)}
    data['values_alignment'] = np.clip(
        [rng.normal(*va_params[s]) for s in segments], 1, 5
    ).round().astype(int)

    # Social viewing preference (1=always alone, 5=always with others)
    # THIS IS THE KEY ISO-FAN SIGNAL
    svp_params = {0: (1.5, 0.6), 1: (4.2, 0.6), 2: (2.8, 0.7), 3: (3.8, 0.8), 4: (3.0, 1.0)}
    data['social_viewing_preference'] = np.clip(
        [rng.normal(*svp_params[s]) for s in segments], 1, 5
    ).round().astype(int)

    # Social media engagement (Likert 1-5)
    sme_params = {0: (1.5, 0.7), 1: (4.3, 0.6), 2: (3.0, 0.8), 3: (4.5, 0.5), 4: (2.0, 0.9)}
    data['social_media_engagement'] = np.clip(
        [rng.normal(*sme_params[s]) for s in segments], 1, 5
    ).round().astype(int)

    # Content sharing frequency (Likert 1-5) — correlated with social media engagement
    csf_params = {0: (1.3, 0.5), 1: (4.0, 0.7), 2: (2.5, 0.8), 3: (4.2, 0.7), 4: (1.8, 0.8)}
    raw_csf = np.array([rng.normal(*csf_params[s]) for s in segments])
    sme_z = (data['social_media_engagement'] - np.mean(data['social_media_engagement'])) / (np.std(data['social_media_engagement']) + 1e-8)
    raw_csf += sme_z * 0.5  # Inject r~0.7 correlation
    data['content_sharing_frequency'] = np.clip(raw_csf, 1, 5).round().astype(int)

    # Community participation (Likert 1-5)
    cp_params = {0: (1.2, 0.4), 1: (4.0, 0.7), 2: (3.2, 0.8), 3: (3.5, 0.9), 4: (1.5, 0.8)}
    data['community_participation'] = np.clip(
        [rng.normal(*cp_params[s]) for s in segments], 1, 5
    ).round().astype(int)

    # Cause importance (Likert 1-5) — correlated with values_alignment
    ci_params = {0: (2.5, 1.0), 1: (3.5, 0.8), 2: (4.8, 0.3), 3: (4.0, 0.7), 4: (3.0, 0.9)}
    raw_ci = np.array([rng.normal(*ci_params[s]) for s in segments])
    va_z = (data['values_alignment'] - np.mean(data['values_alignment'])) / (np.std(data['values_alignment']) + 1e-8)
    raw_ci += va_z * 0.5  # Inject r~0.80 correlation
    data['cause_importance'] = np.clip(raw_ci, 1, 5).round().astype(int)

    # Motivation primary (categorical)
    motivations = ['Athletic Competition', 'Social Connection', 'Community/Values', 'Entertainment', 'Casual Interest']
    motivation_weights = {
        0: [0.55, 0.05, 0.10, 0.25, 0.05],
        1: [0.10, 0.45, 0.15, 0.25, 0.05],
        2: [0.10, 0.10, 0.55, 0.15, 0.10],
        3: [0.15, 0.20, 0.15, 0.40, 0.10],
        4: [0.05, 0.10, 0.10, 0.25, 0.50],
    }
    data['motivation_primary'] = [rng.choice(motivations, p=motivation_weights[s]) for s in segments]

    # Likelihood to recommend (NPS-style 0-10)
    nps_params = {0: (8, 1.5), 1: (7.5, 1.5), 2: (8.5, 1.0), 3: (7, 2), 4: (5, 2)}
    data['likelihood_to_recommend'] = np.clip(
        [rng.normal(*nps_params[s]) for s in segments], 0, 10
    ).round().astype(int)

    # ==================================================================
    # BUILD DATAFRAME
    # ==================================================================
    df = pd.DataFrame(data)

    # ==================================================================
    # ADD NOISE — ~2% of fans get "wrong segment" behaviors
    # ==================================================================
    n_noise = int(n * 0.02)
    noise_idx = rng.choice(n, size=n_noise, replace=False)
    noise_segments = rng.choice(5, size=n_noise, p=SEGMENT_PROBS)

    # Perturb a few continuous columns for noise fans
    noise_targets = ['annual_ticket_spend', 'annual_merch_spend', 'streaming_hours_per_month']
    for idx in noise_idx:
        for col in noise_targets:
            current = df.at[idx, col]
            noise_val = rng.normal(0, df[col].std() * 0.3)
            df.at[idx, col] = current + noise_val

    # Re-clip after noise
    for col in ['age']:
        df[col] = df[col].clip(18, 72).astype(int)
    for col in ['household_size']:
        df[col] = df[col].clip(1, 6).astype(int)
    for col in ['games_attended_last_year', 'merch_purchases_last_year',
                'app_sessions_per_month', 'content_pieces_consumed_weekly',
                'sponsor_recall_count', 'partner_interaction_events']:
        df[col] = df[col].clip(0).astype(int)
    for col in ['annual_ticket_spend', 'annual_merch_spend', 'streaming_hours_per_month']:
        df[col] = df[col].clip(0).round(2)

    # ==================================================================
    # APPLY MISSING DATA PATTERNS
    # ==================================================================
    print("   Applying realistic missing data patterns...")

    # Household income: 8% overall, but 15% for Gen Z (they skip it more)
    for i in range(n):
        if data['generation'][i] == 'Gen Z':
            if rng.random() < 0.15:
                df.loc[i, 'household_income'] = np.nan
        else:
            if rng.random() < 0.05:
                df.loc[i, 'household_income'] = np.nan

    # Standard missing patterns (survey fatigue, later questions skipped more)
    missing_rates = {
        'annual_ticket_spend': 0.05,
        'annual_merch_spend': 0.05,
        'streaming_hours_per_month': 0.04,
        'brand_affinity_score': 0.06,
        'athlete_endorsement_trust': 0.06,
        'ad_receptivity': 0.07,
        'likelihood_to_recommend': 0.03,
    }
    for col, rate in missing_rates.items():
        mask = rng.random(n) < rate
        df.loc[mask, col] = np.nan

    # ==================================================================
    # ADD A FEW EXACT DUPLICATES (~0.02%) for realism
    # ==================================================================
    n_dupes = int(n * 0.0002)
    if n_dupes > 0:
        dupe_idx = rng.choice(n, size=n_dupes, replace=False)
        dupes = df.iloc[dupe_idx].copy()
        dupes['respondent_id'] = [f'R{n+i:05d}' for i in range(n_dupes)]
        df = pd.concat([df, dupes], ignore_index=True)

    # ==================================================================
    # SHUFFLE — so segment order isn't obvious
    # ==================================================================
    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)

    # Verify key stats
    dm_rate = df['primary_decision_maker'].mean()
    team_rate = df['fan_of_specific_team'].mean()
    income_missing = df['household_income'].isna().mean()

    print(f"\n   Verification:")
    print(f"   Decision-maker rate: {dm_rate:.1%} (target: ~84%)")
    print(f"   Specific team fan rate: {team_rate:.1%} (target: ~50%)")
    print(f"   Income missing rate: {income_missing:.1%} (target: ~8%)")
    print(f"   Shape: {df.shape}")
    print(f"\n   Generation distribution:")
    print(f"   {df['generation'].value_counts().to_dict()}")

    return df


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    print("=" * 60)
    print("  SSAC 2026 — SYNTHETIC DATASET GENERATOR")
    print("  \"Guesstimating like our hackathon depends on it\"")
    print("  \"(because it does)\"")
    print("=" * 60)
    print()

    df = generate_synthetic_fan_data(n=20000, seed=42)

    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'synthetic_fan_data.csv')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)

    print(f"\n   Saved to {output_path}")
    print(f"   {df.shape[0]:,} rows x {df.shape[1]} columns")
    print(f"\n   Column list:")
    for i, col in enumerate(df.columns, 1):
        dtype = df[col].dtype
        nunique = df[col].nunique()
        missing = df[col].isna().sum()
        print(f"   {i:2d}. {col:<35s} {str(dtype):<10s} {nunique:>6d} unique  {missing:>4d} missing")

    print(f"\n   The data is ready. Go cluster the sh*t out of it.")
    print("=" * 60)
