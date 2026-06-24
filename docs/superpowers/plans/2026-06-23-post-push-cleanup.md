# Post-Push Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the remaining issues found after the diagnosis reframe push without expanding the scope beyond runtime correctness, branding consistency, and local run reliability.

**Architecture:** Keep each issue as a small, reversible commit. Prefer backend core tests for diagnosis behavior, lightweight frontend string tests for copy/branding regressions, and documentation-only changes for local run instructions.

**Tech Stack:** FastAPI/Python 3 backend, Next.js/React/TypeScript frontend, Node test runner for frontend copy tests, pytest for backend core/API tests.

---

### Task 1: Repair Alignment Map Philosophy Keywords

**Files:**
- Modify: `backend/app/core/alignment_map.py`
- Test: `backend/core_tests/test_alignment_map.py`

- [ ] **Step 1: Write the failing test**

Add tests that prove philosophy notes classify the L0 choices correctly:

```python
def test_alignment_map_philosophy_notes_use_readable_keywords():
    responses = _base_responses()
    responses.update({
        "L0-1": "외부에서 검증된 최고의 S급 인재를 높은 비용을 치르더라도 영입하여 즉시 전력으로 활용한다",
        "L0-2": "성과 추적과 솔직한 피드백을 통해 저성과 이슈를 빠르게 직면한다",
        "L0-3": "외부에서 검증된 최고의 S급 인재를 높은 비용을 치르더라도 영입하여 즉시 전력으로 활용한다",
        "L0-4": "내부 불만이 다소 생기더라도 당장의 비즈니스 공백과 리스크를 막는 것이 우선이므로, 예외를 인정하고 파격적으로 잡는다.",
    })

    result = analyze_alignment_map(responses, [])
    notes = {axis.domain_id: axis.philosophy_note for axis in result.axes}

    assert notes["compensation"] == "회사는 핵심 고성과자에게 더 큰 보상을 주는 차등 배분을 중시합니다."
    assert notes["recruitment"] == "회사는 검증된 외부 인재를 빠르게 영입해 성장 속도를 높이는 방향을 중시합니다."
    assert notes["retention"] == "회사는 중요한 역할 공백을 막기 위해 핵심 인재 예외 조치도 감수합니다."
    assert notes["leadership"] == "회사는 성과 부진을 빠르게 직면하고 기준에 따라 피드백하는 리더십을 중시합니다."
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
python -m pytest core_tests\test_alignment_map.py::test_alignment_map_philosophy_notes_use_readable_keywords -q
```

Expected: FAIL because corrupted keywords classify several notes as balanced/default.

- [ ] **Step 3: Replace corrupted keyword tuples**

Use readable Korean keywords already present in schema options:

```python
a_keywords=("파격", "상위 고성과자")
b_keywords=("협업", "평균 보상", "팀 기여")
a_keywords=("외부", "S급", "즉시 전력")
b_keywords=("내부", "주니어", "육성")
a_keywords=("형평성", "보상 원칙", "원칙대로 내보낸다")
b_keywords=("비즈니스 공백", "예외를 인정", "파격적으로 잡는다")
a_keywords=("성과 추적", "솔직한 피드백", "저성과")
b_keywords=("1:1", "고충", "심리적 안전")
```

- [ ] **Step 4: Run focused and backend tests**

Run:

```powershell
python -m pytest core_tests\test_alignment_map.py::test_alignment_map_philosophy_notes_use_readable_keywords -q
python -m pytest core_tests tests -q -k "not test_l0_4_retention_philosophy_question_exists"
```

Expected: focused test passes; broader backend suite still excludes the known label issue until Task 2.

- [ ] **Step 5: Commit**

```powershell
git add backend/app/core/alignment_map.py backend/core_tests/test_alignment_map.py
git commit -m "fix: repair alignment philosophy keywords"
```

### Task 2: Resolve L0-4 Label Mismatch

**Files:**
- Modify: `backend/app/core/variables.py`
- Modify: `backend/app/content/schema.json`
- Test: `backend/core_tests/test_schema_wording.py`

- [ ] **Step 1: Confirm desired product label**

Use `핵심 인력 철학` because the existing test expects it and the question is explicitly about 대체 불가능한 핵심 인재.

- [ ] **Step 2: Run current failing test**

Run:

```powershell
python -m pytest core_tests\test_schema_wording.py::test_l0_4_retention_philosophy_question_exists -q
```

Expected: FAIL showing `인력운영 철학` versus `핵심 인력 철학`.

- [ ] **Step 3: Update runtime schema labels**

Change `L0-4` short label in both Python source and generated/static JSON from `인력운영 철학` to `핵심 인력 철학`.

- [ ] **Step 4: Run full backend tests**

Run:

```powershell
python -m pytest core_tests tests -q
python -m compileall app core_tests tests
```

Expected: all backend tests pass.

- [ ] **Step 5: Commit**

```powershell
git add backend/app/core/variables.py backend/app/content/schema.json
git commit -m "fix: align l0 retention philosophy label"
```

### Task 3: Finish HR Prism Runtime Branding

**Files:**
- Modify: `backend/app/main.py`
- Modify: `frontend/components/shared/EmptyShell.tsx`
- Modify: `frontend/scripts/result-copy.test.mjs` or create a focused frontend script test

- [ ] **Step 1: Write failing checks**

Add or extend frontend/backend tests or one-off script assertions to require `HR Prism` in runtime brand surfaces.

- [ ] **Step 2: Update runtime strings**

Change FastAPI title/description and empty shell eyebrow to HR Prism wording.

- [ ] **Step 3: Verify**

Run:

```powershell
npm.cmd run test:copy
npm.cmd run typecheck
python -m compileall app core_tests tests
```

Expected: all pass.

- [ ] **Step 4: Commit**

```powershell
git add backend/app/main.py frontend/components/shared/EmptyShell.tsx frontend/scripts
git commit -m "fix: complete hr prism runtime branding"
```

### Task 4: Align Local Port Documentation

**Files:**
- Modify: `backend/README.md`

- [ ] **Step 1: Update local command**

Change backend dev command from `--port 8000` to `--port 8010` and mention that it matches the frontend default API base.

- [ ] **Step 2: Verify documentation consistency**

Run:

```powershell
rg "8000|8010|NEXT_PUBLIC_API" backend/README.md frontend/lib/api/client.ts backend/start_backend.bat frontend/start_frontend.bat
```

Expected: README and startup scripts consistently point local dev to `8010`.

- [ ] **Step 3: Commit**

```powershell
git add backend/README.md
git commit -m "docs: align backend dev port"
```

### Task 5: Final Verification and Push

**Files:**
- No production files unless earlier verification reveals a blocker.

- [ ] **Step 1: Run final verification**

Run:

```powershell
npm.cmd run test:copy
npm.cmd run typecheck
python -m pytest core_tests tests -q
python -m compileall app core_tests tests
git status --short
```

Expected: frontend checks pass, backend tests pass, compile passes, working tree clean.

- [ ] **Step 2: Push**

```powershell
git push
```

Expected: branch updates `origin/codex/diagnosis-reframe-260623`.
