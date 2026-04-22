"""CLI entry: `pm-copilot "research X and draft a PRD"`."""
from __future__ import annotations

import typer
from rich.console import Console

from pm_copilot import __version__
from pm_copilot.config import settings

app = typer.Typer(no_args_is_help=True)
console = Console()


@app.command()
def version() -> None:
    console.print(f"pm-copilot [bold cyan]v{__version__}[/]")


@app.command()
def run(task: str = typer.Argument(..., help="Natural-language PM task")) -> None:
    """Run the agentic graph on a task. Full impl lands in P1-P4."""
    console.print(f"[yellow]stub[/] task: {task}")
    console.print(f"max_iterations={settings.max_iterations} budget=${settings.max_budget_usd}")


if __name__ == "__main__":
    app()
