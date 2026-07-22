"""Run the full pipeline: CSV → JSON → HTML in one command.

USAGE:
    python3 build_all.py

This is equivalent to running:
    python3 csv_to_json.py && python3 build_dashboard.py
"""
import subprocess
import sys
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def run(script):
    print(f"\n{'='*60}")
    print(f"Running {script}...")
    print('='*60)
    result = subprocess.run([sys.executable, os.path.join(HERE, script)],
                            capture_output=False)
    if result.returncode != 0:
        print(f"\n✗ {script} failed (exit {result.returncode})")
        sys.exit(result.returncode)


if __name__ == '__main__':
    run('csv_to_json.py')
    run('build_dashboard.py')
    print(f"\n{'='*60}")
    print("✓ Full pipeline complete.")
    print('='*60)
    print(f"\nOpen: {HERE}/dot_budget_atlas.html")
