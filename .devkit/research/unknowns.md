# Unknowns Map — DevKit Tooling

## Unknown: Agent Skills interop across agents
DESCRIPTION: Будет ли SKILL.md загружаться одинаково в Claude Code, Cursor, VS Code Copilot, Gemini CLI?
RISK: medium
VALIDATION: протестировать один SKILL.md в 3+ агентах, проверить одинаковость поведения
BLOCKER: no
STATUS: open
FINDING:

## Unknown: spec-kit availability
DESCRIPTION: github/spec-kit (specify-cli) — приватный или публичный? Будет ли доступен внешним пользователям DevKit?
RISK: high
VALIDATION: проверить доступность репозитория, попробовать установить
BLOCKER: no (DevKit работает и без spec-kit, SpecKit — один из 5 уровней)
STATUS: open
FINDING:

## Unknown: Markdown frontmatter as structured data
DESCRIPTION: Достаточно ли YAML frontmatter в markdown для машиночитаемых артефактов, или нужен отдельный JSON/TOML?
RISK: low
VALIDATION: написать JSON Schema для одного артефакта (invariants.md), проверить парсинг
BLOCKER: no
STATUS: open
FINDING:

## Unknown: Constitution generation algorithm
DESCRIPTION: Как именно генерировать constitution.md из invariants.md + decisions/? Просто конкатенация или трансформация?
RISK: medium
VALIDATION: вручную создать constitution из тестовых инвариантов, проверить что spec-kit принимает
BLOCKER: no
STATUS: open
FINDING:

## Unknown: Impact analysis complexity
DESCRIPTION: Можно ли автоматически определить impact изменения по impact.md, или это требует AI?
RISK: medium
VALIDATION: описать 3 RFC сценария, попробовать алгоритмически определить affected компоненты
BLOCKER: no
STATUS: open
FINDING:
