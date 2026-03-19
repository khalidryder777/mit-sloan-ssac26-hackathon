"""
parse_survey.py
SSAC 2026 Hackathon — Survey Cross-Tab Parser

Parses the Wasserman "Power Players Research" Excel file from its
cross-tabulated format into clean, analysis-ready DataFrames.

The Excel file is NOT individual-level data. It's a survey report:
- 40 questions with response options
- 3 demographic cross-tabs: Motherhood, Women Sports Fans, Age
- Values are frequency counts per cell

This module turns that mess into structured data you can actually chart.

Usage:
    from parse_survey import load_survey, get_question, list_questions
    survey = load_survey('../problem and data/Power Players Research - Wasserman x Sloan MIT research.xlsx')
    q28 = get_question(survey, 'Q28')
"""

import os
import re
import warnings
from typing import Optional

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Column layout of the Excel file
# ---------------------------------------------------------------------------
# Cols 0-2: Question label, Answer option, separator
# Cols 3-5: Motherhood cross-tab (Total, Mom, Non-Mom)
# Col 6: separator
# Cols 7-8: Women Sports Fans cross-tab (Total, Women Sports Fans)
# Col 9: separator
# Cols 10-17: Age cross-tab (Total, Under 18, 18-28, 29-44, 35-44, 45-60, 61-65, 66+)

MOTHERHOOD_COLS = {3: 'Total', 4: 'Mom', 5: 'Non-Mom'}
SPORTSFAN_COLS = {7: 'Total', 8: 'Women_Sports_Fans'}
AGE_COLS = {
    10: 'Total', 11: 'Under_18', 12: '18-28', 13: '29-44',
    14: '35-44', 15: '45-60', 16: '61-65', 17: '66+'
}

DIMENSIONS = {
    'motherhood': MOTHERHOOD_COLS,
    'sports_fan': SPORTSFAN_COLS,
    'age': AGE_COLS,
}

# Summary rows to skip — these are aggregated totals, not real response options
SKIP_OPTIONS = {
    'top box', 'bottom box', 'top 2 box', 'bottom 2 box',
    'dm',  # Decision Maker summary row in Q12/Q30
    'total',
}


# ---------------------------------------------------------------------------
# Core parser
# ---------------------------------------------------------------------------

def load_survey(filepath: str) -> dict:
    """Parse the cross-tabulated Excel survey into structured data.

    Args:
        filepath: Path to the .xlsx file.

    Returns:
        Dict with keys:
            'raw_df': The full raw DataFrame
            'questions': Dict[str, dict] mapping question IDs to:
                {
                    'label': Full question text,
                    'options': List of answer option strings,
                    'data': {
                        'motherhood': DataFrame (options x segments),
                        'sports_fan': DataFrame (options x segments),
                        'age': DataFrame (options x segments),
                    },
                    'pct': Same structure but as percentages of column total,
                    'start_row': int,
                    'end_row': int,
                }
            'question_order': List of question IDs in order of appearance
            'totals': Dict of total respondent counts per dimension
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    print(f"Loading survey from {filepath}...")
    raw = pd.read_excel(filepath, sheet_name=0, header=None)
    print(f"Raw shape: {raw.shape}")

    # Find question blocks
    questions = {}
    question_order = []
    current_q_id = None
    current_q_label = None
    current_options = []
    current_rows = []
    current_start = None

    for idx in range(raw.shape[0]):
        cell0 = raw.iloc[idx, 0]
        cell1 = raw.iloc[idx, 1]

        # Detect header rows (skip them)
        if isinstance(cell0, str) and cell0.strip() in ('', 'Moms (to children under 18)'):
            continue
        if isinstance(cell0, str) and cell0.strip() == 'Total':
            continue

        # Detect a new question: starts with Q followed by a number
        is_new_question = False
        if isinstance(cell0, str):
            cell0_stripped = cell0.strip()
            # Match patterns like "Q1:", "Q8_0_1:", "Q5_6_TEXT:"
            match = re.match(r'^(Q\d+[A-Za-z_0-9]*)\s*[:\.]?\s*(.*)', cell0_stripped)
            if match:
                is_new_question = True

        if is_new_question:
            # Save previous question if exists (skip text questions with 100+ options)
            if current_q_id and current_options and len(current_options) <= 100:
                questions[current_q_id] = _build_question_entry(
                    raw, current_q_id, current_q_label,
                    current_options, current_rows, current_start
                )
                question_order.append(current_q_id)

            current_q_id = match.group(1)
            current_q_label = cell0_stripped
            current_options = []
            current_rows = []
            current_start = idx

            # IMPORTANT: First answer option is often on the SAME row as
            # the question label (in col 1). Capture it now.
            if isinstance(cell1, str) and cell1.strip():
                first_opt = cell1.strip()
                if first_opt.lower() not in SKIP_OPTIONS:
                    current_options.append(first_opt)
                    current_rows.append(idx)

        elif current_q_id is not None and isinstance(cell1, str) and cell1.strip():
            # This is an answer option row
            option_text = cell1.strip()
            # Skip summary rows that pollute the real response data
            if option_text.lower() in SKIP_OPTIONS:
                continue
            current_options.append(option_text)
            current_rows.append(idx)

    # Save last question
    if current_q_id and current_options and len(current_options) <= 100:
        questions[current_q_id] = _build_question_entry(
            raw, current_q_id, current_q_label,
            current_options, current_rows, current_start
        )
        question_order.append(current_q_id)

    # Get total respondent counts from first complete question (Q1 usually)
    totals = _extract_totals(raw, questions, question_order)

    print(f"Parsed {len(questions)} question blocks")
    print(f"Questions: {', '.join(question_order[:10])}{'...' if len(question_order) > 10 else ''}")

    return {
        'raw_df': raw,
        'questions': questions,
        'question_order': question_order,
        'totals': totals,
    }


def _build_question_entry(raw, q_id, q_label, options, row_indices, start_row):
    """Build a structured entry for one question."""
    data = {}
    pct = {}

    for dim_name, col_map in DIMENSIONS.items():
        df_data = {}
        for col_idx, seg_name in col_map.items():
            values = []
            for row_idx in row_indices:
                val = raw.iloc[row_idx, col_idx]
                try:
                    values.append(float(val) if pd.notna(val) else 0)
                except (ValueError, TypeError):
                    values.append(0)
            df_data[seg_name] = values

        dim_df = pd.DataFrame(df_data, index=options)
        data[dim_name] = dim_df

        # Compute percentages (each value / column sum * 100)
        col_sums = dim_df.sum(axis=0)
        pct_df = dim_df.copy()
        for col in pct_df.columns:
            if col_sums[col] > 0:
                pct_df[col] = (dim_df[col] / col_sums[col] * 100).round(1)
            else:
                pct_df[col] = 0
        pct[dim_name] = pct_df

    return {
        'label': q_label,
        'options': options,
        'data': data,
        'pct': pct,
        'start_row': start_row,
        'end_row': row_indices[-1] if row_indices else start_row,
    }


def _extract_totals(raw, questions, question_order):
    """Extract total respondent counts from the first question's data."""
    totals = {}
    if question_order:
        first_q = questions[question_order[0]]
        for dim_name, dim_df in first_q['data'].items():
            totals[dim_name] = {}
            for col in dim_df.columns:
                totals[dim_name][col] = int(dim_df[col].sum())
    return totals


# ---------------------------------------------------------------------------
# Access helpers
# ---------------------------------------------------------------------------

def get_question(survey: dict, q_id: str) -> dict:
    """Get a specific question's data by ID (e.g., 'Q28')."""
    if q_id in survey['questions']:
        return survey['questions'][q_id]
    # Try partial match
    matches = [k for k in survey['questions'] if k.startswith(q_id)]
    if len(matches) == 1:
        return survey['questions'][matches[0]]
    elif len(matches) > 1:
        print(f"Multiple matches for '{q_id}': {matches}")
        return survey['questions'][matches[0]]
    raise KeyError(f"Question '{q_id}' not found. Available: {list(survey['questions'].keys())[:20]}...")


def list_questions(survey: dict) -> pd.DataFrame:
    """List all questions with their IDs, labels, and option counts."""
    rows = []
    for q_id in survey['question_order']:
        q = survey['questions'][q_id]
        rows.append({
            'question_id': q_id,
            'label': q['label'][:80],
            'n_options': len(q['options']),
            'options_preview': ', '.join(q['options'][:3]) + ('...' if len(q['options']) > 3 else ''),
        })
    return pd.DataFrame(rows)


def get_pct(survey: dict, q_id: str, dimension: str = 'sports_fan') -> pd.DataFrame:
    """Shortcut: get percentage DataFrame for a question + dimension."""
    q = get_question(survey, q_id)
    return q['pct'][dimension]


def get_counts(survey: dict, q_id: str, dimension: str = 'sports_fan') -> pd.DataFrame:
    """Shortcut: get raw count DataFrame for a question + dimension."""
    q = get_question(survey, q_id)
    return q['data'][dimension]


# ---------------------------------------------------------------------------
# Ranking question aggregator
# ---------------------------------------------------------------------------

def aggregate_rankings(survey: dict, base_q_id: str) -> dict:
    """Aggregate ranking sub-questions (e.g., Q8_0_1 through Q8_0_18) into
    a single summary showing which options rank highest overall.

    For ranking questions, each sub-question (Q8_0_1, Q8_0_2, etc.) represents
    one option being ranked, with responses like "Rank 1", "Rank 2", "Rank 3".

    Returns dict of DataFrames per dimension, with options as index and
    'Weighted_Score' column (Rank1*3 + Rank2*2 + Rank3*1).
    """
    # Find all sub-questions matching the base
    sub_qs = [q_id for q_id in survey['question_order']
              if q_id.startswith(base_q_id + '_') or q_id == base_q_id]

    if not sub_qs:
        print(f"No sub-questions found for {base_q_id}")
        return {}

    results = {}
    for dim in DIMENSIONS.keys():
        scores = {}
        for sq_id in sub_qs:
            q = survey['questions'][sq_id]
            # The sub-question label often contains the option name
            option_name = q['label'].replace(base_q_id, '').strip(' :._0123456789')
            if not option_name:
                option_name = sq_id

            dim_df = q['data'][dim]
            # Look for Rank 1, Rank 2, Rank 3 in the options
            score = 0
            total_col = 'Total' if 'Total' in dim_df.columns else dim_df.columns[0]
            for opt_idx, opt_text in enumerate(q['options']):
                opt_lower = opt_text.lower().strip()
                val = dim_df.iloc[opt_idx][total_col] if opt_idx < len(dim_df) else 0
                if 'rank 1' in opt_lower or opt_lower == '1':
                    score += val * 3
                elif 'rank 2' in opt_lower or opt_lower == '2':
                    score += val * 2
                elif 'rank 3' in opt_lower or opt_lower == '3':
                    score += val * 1

            scores[option_name] = score

        if scores:
            results[dim] = pd.DataFrame.from_dict(
                scores, orient='index', columns=['Weighted_Score']
            ).sort_values('Weighted_Score', ascending=False)

    return results


# ---------------------------------------------------------------------------
# Main — run standalone to verify parsing
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    import sys

    xlsx = os.path.join(
        os.path.dirname(__file__), '..',
        'problem and data',
        'Power Players Research - Wasserman x Sloan MIT research.xlsx'
    )

    survey = load_survey(xlsx)

    print("\n" + "=" * 70)
    print("QUESTION INVENTORY")
    print("=" * 70)
    q_list = list_questions(survey)
    print(q_list.to_string())

    print(f"\nTotal respondents by dimension:")
    for dim, counts in survey['totals'].items():
        print(f"  {dim}: {counts}")

    # Show a sample question
    print("\n" + "=" * 70)
    print("SAMPLE: Q28 (Sports frequency)")
    print("=" * 70)
    try:
        q28 = get_question(survey, 'Q28')
        print(f"Label: {q28['label']}")
        print(f"Options: {q28['options']}")
        print("\nPercentages by Women Sports Fan status:")
        print(q28['pct']['sports_fan'].to_string())
        print("\nPercentages by Motherhood:")
        print(q28['pct']['motherhood'].to_string())
        print("\nPercentages by Age:")
        print(q28['pct']['age'].to_string())
    except Exception as e:
        print(f"Could not load Q28: {e}")
        # Show first available question instead
        if survey['question_order']:
            first_id = survey['question_order'][0]
            first_q = survey['questions'][first_id]
            print(f"\nShowing first question instead: {first_id}")
            print(f"Label: {first_q['label']}")
            print(f"Options: {first_q['options'][:5]}")
            print("\nCounts (sports_fan dimension):")
            print(first_q['data']['sports_fan'].to_string())
