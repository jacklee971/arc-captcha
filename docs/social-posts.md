# Social Posts

---

## LinkedIn (한국어)

AI가 1%도 못 푸는 문제로 봇을 잡으면 어떨까?

ARC-AGI-3라는 벤치마크가 있다. GPT-5, Claude, Gemini 같은 최신 AI들이 0.3% 이하 점수를 받는데, 일반인은 처음 보고도 다 푼다. 지금 존재하는 벤치마크 중 인간과 AI의 격차가 가장 큰 테스트다.

이 격차를 CAPTCHA에 활용해봤다.

ARC-AGI-3 퍼즐을 웹사이트 로그인 폼 같은 데 끼워넣고, 유저의 플레이 행동(클릭 타이밍, 탐색 패턴, 전략 변경 등)을 분석해서 인간인지 봇인지 판별하는 방식이다.

기존 reCAPTCHA는 이미 AI가 뚫는다. 그런데 이건 현재 AI가 풀 수 없는 문제라 원리적으로 뚫기 어렵다.

재밌는 건, 수집된 플레이 데이터로 다시 AI 솔버를 학습시킬 수 있다는 점이다. CAPTCHA를 쓰는 플랫폼은 봇 방어를 얻고, 나는 학습 데이터를 얻는 구조.

Apart Research에서 2024년에 비슷한 아이디어를 제안한 적 있지만 실제 구현은 없었다. 이번에 직접 만들어서 오픈소스로 공개했다.

npm install arc-captcha-react 하면 바로 쓸 수 있고, ARC Prize 2026 대회(상금 200만 달러)에도 이걸로 참여할 예정이다.

GitHub: https://github.com/jacklee971/arc-captcha
npm: https://www.npmjs.com/package/arc-captcha-react

#ARC #AGI #CAPTCHA #OpenSource #Kaggle

---

## LinkedIn (English)

What if the hardest AI benchmark could stop bots?

ARC-AGI-3 is an interactive reasoning benchmark where frontier AI models (GPT-5, Claude, Gemini) score below 0.3%. Regular humans solve it 100% of the time on first try. It's the largest human-AI performance gap in any benchmark right now.

I turned that gap into a CAPTCHA.

The idea: embed ARC-AGI-3 puzzles into login forms and registration pages, then analyze how users play — timing between actions, exploration patterns, strategy shifts, undo behavior. Humans and bots play these games in fundamentally different ways.

Traditional CAPTCHAs are already beaten by AI. But ARC-AGI-3 environments test fluid intelligence and adaptation to novel situations, which current models can't do.

The interesting part is the feedback loop. Every time someone plays, I collect behavioral data. That data can train better ARC-AGI-3 solvers. Platforms get bot detection, I get training data.

Apart Research proposed this concept in 2024 but nobody built it. So I did.

It's open source, published on npm, and I'm entering the ARC Prize 2026 competition ($2M prize pool) with it.

GitHub: https://github.com/jacklee971/arc-captcha
npm: https://www.npmjs.com/package/arc-captcha-react

#ARC #AGI #CAPTCHA #OpenSource #Kaggle

---

## X/Twitter (한국어)

AI가 0.3%밖에 못 푸는 퍼즐로 CAPTCHA를 만들었다

ARC-AGI-3: 인간 100% vs AI 0.3%
→ 이 격차를 봇 탐지에 활용
→ 플레이 행동 패턴으로 인간/봇 구별
→ 수집 데이터로 다시 AI 솔버 학습

reCAPTCHA는 이미 AI가 뚫는데, 이건 원리적으로 현재 AI가 못 풂

오픈소스로 공개함
npm install arc-captcha-react

github.com/jacklee971/arc-captcha

---

## X/Twitter (English)

Built a CAPTCHA from puzzles AI can't solve

ARC-AGI-3: humans 100% vs AI 0.3%

→ Embed puzzles in login forms
→ Analyze play behavior to detect bots
→ Collected data trains better AI solvers

reCAPTCHA is already beaten by AI. This can't be — yet.

Open source, on npm:
npm install arc-captcha-react

github.com/jacklee971/arc-captcha
