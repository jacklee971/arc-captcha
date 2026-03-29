# LinkedIn Post Draft

---

**ARC-AGI-3 meets CAPTCHA — can we use the hardest AI benchmark to stop bots?**

AI systems score below 1% on ARC-AGI-3.
Humans solve 100%.

This is the biggest human-AI performance gap in any benchmark today.

I thought: what if we use this gap to build a better CAPTCHA?

So I built **ARC-CAPTCHA** — an open-source SDK that wraps ARC-AGI-3 game environments into an embeddable CAPTCHA widget.

**How it works:**
1. A user plays a mini ARC-AGI-3 puzzle in their browser
2. Every action is logged — timing, patterns, strategy changes
3. A classifier analyzes the behavioral trace to distinguish humans from bots
4. The collected data feeds back into training better ARC-AGI-3 solvers

**The feedback loop:**
- Platforms get bot detection that current AI can't beat
- We get behavioral data to improve AI reasoning
- The better AI gets, the harder the CAPTCHAs become

**Why this matters:**
- Traditional CAPTCHAs (reCAPTCHA, hCAPTCHA) are increasingly solvable by AI
- ARC-AGI-3 tests *fluid intelligence* — the ability to adapt to never-seen-before environments
- No amount of memorization helps — each environment is unique

The project is open source and I'm entering the ARC Prize 2026 competition ($2M prize pool on Kaggle).

This idea was first conceptually proposed by Apart Research in 2024, but never implemented. ARC-CAPTCHA is the first working implementation with a data pipeline.

GitHub: https://github.com/jacklee971/arc-captcha
ARC Prize 2026: https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-3

#ARC #AGI #CAPTCHA #OpenSource #AIResearch #Kaggle #MachineLearning

---

## Notes for posting:
- Add a screenshot or short video of the demo (playing an ARC-AGI-3 environment in the browser)
- Tag @ARC Prize Foundation, @François Chollet if possible
- Consider posting on X/Twitter as well with a shorter version
