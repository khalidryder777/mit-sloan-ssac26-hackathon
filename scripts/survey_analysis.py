"""
survey_analysis.py
SSAC 2026 Hackathon — Survey Insight Engine

Functions to extract insights from parsed survey cross-tab data.
Works with the output of parse_survey.load_survey().

Key analyses:
- Segment comparison (percentages side by side)
- Index values (segment vs total, >120 = over-indexes)
- Gap analysis (biggest differences between two segments)
- Ranked preference aggregation

Usage:
    from parse_survey import load_survey
    from survey_analysis import *
    survey = load_survey('path/to/xlsx')
    compare_segments(survey, 'Q28', 'motherhood')
"""

import warnings
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")


# ---------------------------------------------------------------------------
# Percentage comparison
# ---------------------------------------------------------------------------

def compare_segments(survey: dict, q_id: str, dimension: str = 'motherhood') -> pd.DataFrame:
    """Side-by-side percentage comparison for a question across segments.

    Args:
        survey: Output from load_survey()
        q_id: Question ID (e.g., 'Q28')
        dimension: 'motherhood', 'sports_fan', or 'age'

    Returns:
        DataFrame with response options as index, segment percentages as columns.
    """
    from parse_survey import get_question
    q = get_question(survey, q_id)
    counts = q['data'][dimension]

    # Compute percentages
    col_sums = counts.sum(axis=0)
    pct = counts.copy()
    for col in pct.columns:
        if col_sums[col] > 0:
            pct[col] = (counts[col] / col_sums[col] * 100).round(1)
    return pct


# ---------------------------------------------------------------------------
# Index analysis
# ---------------------------------------------------------------------------

def compute_index(survey: dict, q_id: str, dimension: str = 'motherhood',
                  baseline_col: str = 'Total') -> pd.DataFrame:
    """Compute index values: (segment% / baseline%) x 100.

    Index > 120 means the segment over-indexes on that response.
    Index < 80 means under-indexing.

    Args:
        survey: Output from load_survey()
        q_id: Question ID
        dimension: Cross-tab dimension
        baseline_col: Column to use as baseline (default 'Total')

    Returns:
        DataFrame with index values for each segment vs baseline.
    """
    pct = compare_segments(survey, q_id, dimension)

    if baseline_col not in pct.columns:
        baseline_col = pct.columns[0]

    baseline = pct[baseline_col]
    index_df = pd.DataFrame(index=pct.index)

    for col in pct.columns:
        if col == baseline_col:
            continue
        index_vals = []
        for idx in pct.index:
            base_val = baseline[idx]
            seg_val = pct.loc[idx, col]
            if base_val > 0:
                index_vals.append(round(seg_val / base_val * 100, 0))
            else:
                index_vals.append(100)
        index_df[col] = index_vals

    return index_df


# ---------------------------------------------------------------------------
# Gap analysis
# ---------------------------------------------------------------------------

def gap_analysis(survey: dict, q_id: str, dimension: str = 'motherhood',
                 col_a: str = None, col_b: str = None) -> pd.DataFrame:
    """Find the biggest percentage-point gaps between two segments.

    Args:
        survey: Output from load_survey()
        q_id: Question ID
        dimension: Cross-tab dimension
        col_a: First segment column name (default: first non-Total)
        col_b: Second segment column name (default: second non-Total)

    Returns:
        DataFrame sorted by absolute gap, with columns for both segments and the delta.
    """
    pct = compare_segments(survey, q_id, dimension)

    non_total = [c for c in pct.columns if c != 'Total']
    if col_a is None:
        col_a = non_total[0] if non_total else pct.columns[0]
    if col_b is None:
        col_b = non_total[1] if len(non_total) > 1 else pct.columns[-1]

    result = pd.DataFrame({
        col_a: pct[col_a],
        col_b: pct[col_b],
        'gap_pp': (pct[col_a] - pct[col_b]).round(1),
        'abs_gap': abs(pct[col_a] - pct[col_b]).round(1),
    })
    return result.sort_values('abs_gap', ascending=False)


# ---------------------------------------------------------------------------
# Top responses
# ---------------------------------------------------------------------------

def top_responses(survey: dict, q_id: str, dimension: str = 'motherhood',
                  segment: str = 'Total', n: int = 5) -> pd.DataFrame:
    """Get the top N responses by percentage for a specific segment.

    Args:
        survey: Output from load_survey()
        q_id: Question ID
        dimension: Cross-tab dimension
        segment: Segment column name
        n: Number of top responses

    Returns:
        DataFrame with top responses and their percentages.
    """
    pct = compare_segments(survey, q_id, dimension)
    if segment not in pct.columns:
        segment = pct.columns[0]

    result = pct[[segment]].copy()
    result.columns = ['pct']
    return result.sort_values('pct', ascending=False).head(n)


# ---------------------------------------------------------------------------
# Multi-question comparison
# ---------------------------------------------------------------------------

def compare_sports_fans_vs_all(survey: dict, question_ids: list) -> pd.DataFrame:
    """For a list of questions, show the top response for sports fans vs. total.

    Useful for building a summary table: "Sports fans over-index on X, Y, Z."

    Args:
        survey: Output from load_survey()
        question_ids: List of question IDs to compare

    Returns:
        Summary DataFrame.
    """
    from parse_survey import get_question
    rows = []
    for q_id in question_ids:
        try:
            q = get_question(survey, q_id)
            moth_data = q['data']['motherhood']
            sf_data = q['data']['sports_fan']

            # Total population top response
            moth_total = moth_data['Total']
            moth_sum = moth_total.sum()
            if moth_sum > 0:
                moth_pct = (moth_total / moth_sum * 100).round(1)
                top_all = moth_pct.idxmax()
                top_all_pct = moth_pct.max()
            else:
                top_all = 'N/A'
                top_all_pct = 0

            # Sports fan top response
            sf_col = [c for c in sf_data.columns if c != 'Total']
            if sf_col:
                sf_series = sf_data[sf_col[0]]
            else:
                sf_series = sf_data['Total']
            sf_sum = sf_series.sum()
            if sf_sum > 0:
                sf_pct = (sf_series / sf_sum * 100).round(1)
                top_sf = sf_pct.idxmax()
                top_sf_pct = sf_pct.max()
            else:
                top_sf = 'N/A'
                top_sf_pct = 0

            rows.append({
                'question': q_id,
                'label': q['label'][:60],
                'top_all': f"{top_all} ({top_all_pct}%)",
                'top_sports_fan': f"{top_sf} ({top_sf_pct}%)",
            })
        except Exception as e:
            rows.append({
                'question': q_id,
                'label': str(e)[:60],
                'top_all': 'ERROR',
                'top_sports_fan': 'ERROR',
            })

    return pd.DataFrame(rows)


# ---------------------------------------------------------------------------
# Summary statistics
# ---------------------------------------------------------------------------

def key_stat(survey: dict, q_id: str, option: str, dimension: str = 'motherhood',
             segment: str = 'Total') -> float:
    """Get a single percentage for a specific question + option + segment.

    Example: key_stat(survey, 'Q12', 'I am the primary decision', 'motherhood', 'Total')
    Returns the % of total respondents who are primary decision-makers.
    """
    pct = compare_segments(survey, q_id, dimension)

    if segment not in pct.columns:
        segment = pct.columns[0]

    # Fuzzy match on option text
    for idx in pct.index:
        if option.lower() in idx.lower():
            return pct.loc[idx, segment]

    raise KeyError(f"Option containing '{option}' not found in {q_id}. Options: {list(pct.index)}")


def decision_maker_pct(survey: dict) -> dict:
    """Calculate the % of respondents who are primary/shared purchase decision-makers."""
    from parse_survey import get_question
    q = get_question(survey, 'Q12')
    moth = q['data']['motherhood']
    total = moth['Total'].sum()

    primary = 0
    shared = 0
    for opt in q['options']:
        opt_lower = opt.lower()
        val = moth.loc[opt, 'Total'] if opt in moth.index else 0
        if 'primary' in opt_lower:
            primary = val
        elif 'share' in opt_lower:
            shared = val

    return {
        'primary_pct': round(primary / total * 100, 1) if total > 0 else 0,
        'shared_pct': round(shared / total * 100, 1) if total > 0 else 0,
        'combined_pct': round((primary + shared) / total * 100, 1) if total > 0 else 0,
        'total_n': int(total),
    }


def sports_frequency(survey: dict) -> dict:
    """Get sports consumption frequency breakdown."""
    from parse_survey import get_question
    q = get_question(survey, 'Q28')
    moth = q['data']['motherhood']
    total_sum = moth['Total'].sum()

    result = {}
    for opt in q['options']:
        val = moth.loc[opt, 'Total'] if opt in moth.index else 0
        result[opt] = round(val / total_sum * 100, 1) if total_sum > 0 else 0

    return result


# ---------------------------------------------------------------------------
# Age cohort analysis
# ---------------------------------------------------------------------------

def age_comparison(survey: dict, q_id: str) -> pd.DataFrame:
    """Compare response patterns across age cohorts.

    Returns pct DataFrame with age groups as columns, highlighting
    the most interesting generational differences.
    """
    pct = compare_segments(survey, q_id, 'age')
    # Drop cohorts with 0 total (Under 18 and 66+ often empty)
    from parse_survey import get_question
    q = get_question(survey, q_id)
    counts = q['data']['age']
    non_empty = [col for col in counts.columns if counts[col].sum() > 0]
    return pct[non_empty]


# ---------------------------------------------------------------------------
# Quick insight generator
# ---------------------------------------------------------------------------

def generate_quick_insights(survey: dict) -> list:
    """Generate a list of key insights from the survey data.

    Returns list of dicts with 'insight', 'stat', 'source_question'.
    """
    insights = []

    # 1. Decision-maker stat
    dm = decision_maker_pct(survey)
    insights.append({
        'insight': f"{dm['combined_pct']}% of women are primary or shared household purchase decision-makers",
        'stat': dm['combined_pct'],
        'source': 'Q12',
    })

    # 2. Sports frequency
    freq = sports_frequency(survey)
    occasional_plus = sum(v for k, v in freq.items()
                         if any(w in k.lower() for w in ['occasionally', 'often', 'very']))
    insights.append({
        'insight': f"{occasional_plus}% of women follow sports at least occasionally",
        'stat': occasional_plus,
        'source': 'Q28',
    })

    # 3. Brand authenticity (Q16)
    try:
        pct_q16 = compare_segments(survey, 'Q16', 'motherhood')
        # Find the "important" or top box response
        for opt in pct_q16.index:
            if 'important' in opt.lower() or 'essential' in opt.lower():
                val = pct_q16.loc[opt, 'Total']
                if val > 30:
                    insights.append({
                        'insight': f"{val}% say brand authenticity is {opt.lower()}",
                        'stat': val,
                        'source': 'Q16',
                    })
                    break
    except Exception:
        pass

    # 4. How well brands understand women (Q17)
    try:
        pct_q17 = compare_segments(survey, 'Q17', 'motherhood')
        not_well = 0
        for opt in pct_q17.index:
            if any(w in opt.lower() for w in ['not well', 'poorly', 'not at all', "don't"]):
                not_well += pct_q17.loc[opt, 'Total']
        if not_well > 0:
            insights.append({
                'insight': f"{not_well}% of women feel brands don't understand them well",
                'stat': not_well,
                'source': 'Q17',
            })
    except Exception:
        pass

    # 5. Mom vs Non-Mom gap on sports
    try:
        gap = gap_analysis(survey, 'Q28', 'motherhood', 'Mom', 'Non-Mom')
        biggest = gap.iloc[0]
        insights.append({
            'insight': f"Biggest Mom vs Non-Mom gap on sports frequency: '{gap.index[0]}' ({biggest['gap_pp']:+.1f} pp)",
            'stat': abs(biggest['gap_pp']),
            'source': 'Q28',
        })
    except Exception:
        pass

    return insights


# ---------------------------------------------------------------------------
# Main — run standalone for quick insights
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    import sys, os
    sys.path.insert(0, os.path.dirname(__file__))
    from parse_survey import load_survey

    xlsx = os.path.join(
        os.path.dirname(__file__), '..',
        'problem and data',
        'Power Players Research - Wasserman x Sloan MIT research.xlsx'
    )

    survey = load_survey(xlsx)

    print("\n" + "=" * 70)
    print("QUICK INSIGHTS")
    print("=" * 70)
    for insight in generate_quick_insights(survey):
        src = insight['source']
        print(f"  [{src}] {insight['insight']}")

    print("\n" + "=" * 70)
    print("Q12: PURCHASE DECISION-MAKER ROLE")
    print("=" * 70)
    dm = decision_maker_pct(survey)
    print(f"  Primary: {dm['primary_pct']}%")
    print(f"  Shared: {dm['shared_pct']}%")
    print(f"  Combined: {dm['combined_pct']}%")
    print(f"  Total respondents: {dm['total_n']}")

    print("\n" + "=" * 70)
    print("Q28: SPORTS FREQUENCY")
    print("=" * 70)
    pct = compare_segments(survey, 'Q28', 'motherhood')
    print(pct.to_string())

    print("\n" + "=" * 70)
    print("Q28: MOM vs NON-MOM GAP")
    print("=" * 70)
    gap = gap_analysis(survey, 'Q28', 'motherhood', 'Mom', 'Non-Mom')
    print(gap.to_string())

    print("\n" + "=" * 70)
    print("Q37: HOW TO BETTER ENGAGE WOMEN FANS")
    print("=" * 70)
    try:
        pct37 = compare_segments(survey, 'Q37', 'sports_fan')
        print(pct37.sort_values(pct37.columns[0], ascending=False).to_string())
    except Exception as e:
        print(f"  Error: {e}")

    print("\n" + "=" * 70)
    print("Q29: SPORTS LEAGUES WATCHED")
    print("=" * 70)
    try:
        pct29 = compare_segments(survey, 'Q29', 'age')
        age_cols = [c for c in pct29.columns if pct29[c].sum() > 0]
        print(pct29[age_cols].sort_values(age_cols[0], ascending=False).head(10).to_string())
    except Exception as e:
        print(f"  Error: {e}")
