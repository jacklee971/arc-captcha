"""
Bot Simulator for ARC-CAPTCHA baseline comparison.

Generates simulated bot sessions using different strategies:
- random: picks random actions at regular intervals
- greedy: repeats the same action every time
- systematic: cycles through all actions in order

Output: JSON files in analysis/data/ matching BehaviorLogger format.
"""

import argparse
import hashlib
import json
import os
import random
import time
import uuid
from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass
class ActionLog:
    """Single logged action matching the TypeScript ActionLog interface."""

    timestamp: int
    actionType: str  # "key" | "select" | "undo" | "reset"
    actionId: int
    frameHash: str
    timeSinceLastAction: int
    level: int
    key: str | None = None
    coordinates: list[int] | None = None


def action_type_from_id(action_id: int) -> str:
    """Convert action ID to action type string."""
    if action_id == 6:
        return "select"
    if action_id == 7:
        return "undo"
    if action_id == 0:
        return "reset"
    return "key"


def generate_frame_hash() -> str:
    """Generate a deterministic-looking frame hash."""
    values = [random.randint(0, 15) for _ in range(5)]
    return "-".join(str(v) for v in values)


class BotStrategy:
    """Base class for bot strategies."""

    def __init__(self, name: str):
        self.name = name

    def next_action(self, step: int, available_actions: list[int]) -> int:
        raise NotImplementedError


class RandomStrategy(BotStrategy):
    """Picks a random action from available actions each step."""

    def __init__(self):
        super().__init__("random")

    def next_action(self, step: int, available_actions: list[int]) -> int:
        return random.choice(available_actions)


class GreedyStrategy(BotStrategy):
    """Repeats the same action (ACTION1 = up) every step."""

    def __init__(self, preferred_action: int = 1):
        super().__init__("greedy")
        self.preferred_action = preferred_action

    def next_action(self, step: int, available_actions: list[int]) -> int:
        if self.preferred_action in available_actions:
            return self.preferred_action
        return available_actions[0]


class SystematicStrategy(BotStrategy):
    """Cycles through all available actions in order."""

    def __init__(self):
        super().__init__("systematic")

    def next_action(self, step: int, available_actions: list[int]) -> int:
        return available_actions[step % len(available_actions)]


def simulate_session(
    strategy: BotStrategy,
    num_actions: int = 50,
    interval_ms: int = 100,
    interval_jitter_ms: int = 10,
) -> dict:
    """
    Simulate a bot session with the given strategy.

    Args:
        strategy: Bot strategy to use for action selection.
        num_actions: Number of actions to simulate.
        interval_ms: Base interval between actions in milliseconds.
        interval_jitter_ms: Random jitter added to intervals.

    Returns:
        Session data dict matching the format expected by the API.
    """
    session_id = str(uuid.uuid4())
    available_actions = [1, 2, 3, 4, 5, 6, 7]
    logs: list[ActionLog] = []
    current_time = int(time.time() * 1000)
    level = 0

    for step in range(num_actions):
        action_id = strategy.next_action(step, available_actions)
        action_type = action_type_from_id(action_id)

        # Bot-like timing: very regular intervals with small jitter
        jitter = random.randint(-interval_jitter_ms, interval_jitter_ms)
        interval = max(10, interval_ms + jitter)

        if step == 0:
            time_since_last = 0
        else:
            time_since_last = interval

        current_time += interval

        coordinates = None
        if action_id == 6:
            coordinates = [random.randint(0, 63), random.randint(0, 63)]

        key_value = None
        if 1 <= action_id <= 5:
            key_value = f"ACTION{action_id}"

        log = ActionLog(
            timestamp=current_time,
            actionType=action_type,
            actionId=action_id,
            frameHash=generate_frame_hash(),
            timeSinceLastAction=time_since_last,
            level=level,
            key=key_value,
            coordinates=coordinates,
        )
        logs.append(log)

        # Simulate level progression (small chance per action)
        if random.random() < 0.02:
            level += 1

    return {
        "sessionId": session_id,
        "strategy": strategy.name,
        "environmentId": "simulated",
        "actionCount": num_actions,
        "levelReached": level,
        "isHuman": False,
        "confidence": 1.0,
        "source": f"bot-{strategy.name}",
        "actionLog": [asdict(log) for log in logs],
    }


def main():
    parser = argparse.ArgumentParser(
        description="Generate simulated bot sessions for ARC-CAPTCHA analysis"
    )
    parser.add_argument(
        "--sessions",
        type=int,
        default=10,
        help="Number of sessions per strategy (default: 10)",
    )
    parser.add_argument(
        "--actions",
        type=int,
        default=50,
        help="Number of actions per session (default: 50)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="analysis/data",
        help="Output directory (default: analysis/data)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility (default: 42)",
    )
    args = parser.parse_args()

    random.seed(args.seed)

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    strategies: list[BotStrategy] = [
        RandomStrategy(),
        GreedyStrategy(),
        SystematicStrategy(),
    ]

    all_sessions = []

    for strategy in strategies:
        print(f"Generating {args.sessions} sessions with {strategy.name} strategy...")
        for i in range(args.sessions):
            session = simulate_session(
                strategy=strategy,
                num_actions=args.actions,
            )
            all_sessions.append(session)

            # Save individual session file
            filename = f"{strategy.name}_{i:03d}.json"
            filepath = output_dir / filename
            with open(filepath, "w") as f:
                json.dump(session, f, indent=2)

    # Save combined file with all sessions
    combined_path = output_dir / "all_bot_sessions.json"
    with open(combined_path, "w") as f:
        json.dump(all_sessions, f, indent=2)

    total = len(all_sessions)
    print(f"\nGenerated {total} bot sessions in {output_dir}/")
    print(f"Combined file: {combined_path}")


if __name__ == "__main__":
    main()
