# ACU Blueprint nbdev Notebooks

This directory contains the development notebooks for the Holistic GPA scoring system. We use nbdev so that you can prototype and visualize in notebooks, while exporting tested, importable Python modules for CLI and AWS Lambda.

## Quick Start

1. Install dependencies and hooks
```bash
cd scripts/python
pip install -r requirements.txt
nbdev_install_hooks
```

2. Open notebooks
```bash
jupyter notebook nbs
```

3. Export code from notebooks to the library
```bash
nbdev_export
```
Exports `#| export` cells from `nbs/*.ipynb` into `apex_scoring/*.py`.

## Authoring Rules
- Put production code in cells tagged with `#| export`.
- Optionally, set a default module with `#| default_export module_name` at the top of a notebook.
- Keep experiments/visualizations in regular cells; they won’t be exported.
- Run `nbdev_export` after edits to update `apex_scoring/` modules.

## Testing
- You can place tests in notebooks with `#| export` test functions and run:
```bash
nbdev_test
```
- Or keep pytest files; both work. The exported modules are regular `.py` files.

## Using the Exported Library
After `nbdev_export`, import from `apex_scoring` anywhere:
```python
from apex_scoring.bell_curve import BellCurveCalculator
```

## CI/Pre-commit
- `nbdev_install_hooks` adds git hooks to clean notebook outputs and ensure metadata is stable.
- You can also run `nbdev_clean` to strip outputs before commits.

## Deployments
- CLI and Lambda entrypoints should import from `apex_scoring/*`.
- Our Dockerfile and `aws-deploy.sh` continue to work; they package the exported modules.

## Notebook Naming
- Suggested convention:
  - `00-bell-curve.ipynb`
  - `01-subcategory-aggregators.ipynb`
  - `02-company-scores.ipynb`
  - `03-daily-orchestrator.ipynb`

## Common Commands
```bash
# Export code to apex_scoring/
nbdev_export

# Run tests in notebooks
nbdev_test

# Clean outputs
nbdev_clean
```

## Tips
- If Jupyter in Docker, use `docker-compose --profile development up jupyter` then open the notebook URL.
- Keep logic in exported cells to avoid divergence between notebook and runtime code.
