# Unknowns Map — DevKit Tooling

## Unknown: Agent Skills interop across agents
DESCRIPTION: Будет ли SKILL.md загружаться одинаково в Claude Code, Cursor, VS Code Copilot, Gemini CLI?
RISK: medium
VALIDATION: протестировать один SKILL.md в 3+ агентах, проверить одинаковость поведения
BLOCKER: no
STATUS: open
FINDING: spec-kit поддерживает 18+ агентов через разные форматы команд (.claude/commands/ = Markdown, .gemini/commands/ = TOML, .cursor/commands/ = Markdown). Не единый стандарт, а per-agent адаптация. DevKit пока только Claude Code.

## Unknown: spec-kit availability
DESCRIPTION: github/spec-kit (specify-cli) — приватный или публичный? Будет ли доступен внешним пользователям DevKit?
RISK: high
VALIDATION: проверить доступность репозитория, попробовать установить
BLOCKER: no (DevKit работает и без spec-kit, SpecKit — один из 5 уровней)
STATUS: resolved
FINDING: Публичный MIT, ~70K stars. Install: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git`. Python 3.11+, uv. Активно развивается — v0.0.99 (2026-02-19), 99 релизов за 6 месяцев. Экспериментальный.

## Unknown: Markdown frontmatter as structured data
DESCRIPTION: Достаточно ли YAML frontmatter в markdown для машиночитаемых артефактов, или нужен отдельный JSON/TOML?
RISK: low
VALIDATION: написать JSON Schema для одного артефакта (invariants.md), проверить парсинг
BLOCKER: no
STATUS: resolved
FINDING: YAML frontmatter достаточен. DevKit validator парсит все 15 артефактов без проблем. spec-kit использует тот же подход (markdown + YAML frontmatter для команд). Единственное ограничение — inline fields типа `STATUS: open` парсятся regex, не YAML.

## Unknown: Constitution generation algorithm
DESCRIPTION: Как именно генерировать constitution.md из invariants.md + decisions/? Просто конкатенация или трансформация?
RISK: medium
VALIDATION: вручную создать constitution из тестовых инвариантов, проверить что spec-kit принимает
BLOCKER: no
STATUS: resolved
FINDING: DevKit генерирует конкатенацией (invariants + UX invariants + decisions). Но spec-kit ожидает ДРУГОЙ формат: `.specify/memory/constitution.md` с "Core Principles" (декларативные, MUST/SHOULD), semver-версионирование, placeholders `[PRINCIPLE_N]`. Наш формат (tech invariants I1-I8 + UX U1-U6) НЕ совместим напрямую. Нужен трансформер: invariant → principle. См. INV-002.

## Unknown: Impact analysis complexity
DESCRIPTION: Можно ли автоматически определить impact изменения по impact.md, или это требует AI?
RISK: medium
VALIDATION: описать 3 RFC сценария, попробовать алгоритмически определить affected компоненты
BLOCKER: no
STATUS: resolved
FINDING: Keyword-based impact работает. `devkit impact` парсит impact.md, извлекает DEPENDS_ON/DEPENDED_BY/INVARIANTS, делает graph walk по keywords из описания. Точность достаточна для CLI — false positives допустимы (лучше показать лишнее чем пропустить). AI нужен только для формулировки рекомендации (пока hardcoded).

## Unknown: spec-kit real workflow and integration points
DESCRIPTION: Как именно работает полный цикл spec-kit? Какие точки интеграции с DevKit?
RISK: high
VALIDATION: изучить исходники и документацию spec-kit, проверить фактический workflow
BLOCKER: no
STATUS: resolved
FINDING: 9 slash-команд: `/speckit.constitution` → `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.analyze` → `/speckit.checklist` → `/speckit.implement` → `/speckit.taskstoissues`. Структура: `.specify/memory/constitution.md`, `.specify/specs/NNN-name/{spec,plan,tasks,data-model,research,contracts/,checklists/}.md`. Shell-скрипты: `create-new-feature.sh`, `setup-plan.sh`, `update-agent-context.sh`. Точки интеграции DevKit: (1) constitution — DevKit генерирует → spec-kit потребляет, (2) SpecKit SKILL должен делегировать `/speckit.*` командам, (3) event detection (RFC/INV) — DevKit прерывает spec-kit workflow. Текущая интеграция сломана по 8 пунктам — см. INV-002.
