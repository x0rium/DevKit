# Market Research — DevKit Tooling

## Analogues

| Tool | What it does | What it lacks | Our niche |
|------|-------------|---------------|-----------|
| **github/spec-kit** (specify-cli) | SDD: specification → plan → tasks → implement. CLI + Agent Skills | Только середина цикла. Нет research, product, QA. Нет инвариантов. Нет event detection. Constitution пишется вручную | DevKit — upstream layer. Генерирует constitution из верифицированных решений |
| **Claude Code / Gemini CLI / Codex CLI** | AI-агенты для написания кода в терминале | Нет методологии. Нет фазовой дисциплины. Нет артефактов между фазами | DevKit добавляет методологию поверх любого агента через Agent Skills |
| **Aider** | AI pair programming, diff-based editing | Чистый coding assistant. Нет архитектуры, research, QA | DevKit покрывает полный цикл |
| **Cursor / Windsurf** | IDE с встроенным AI | IDE-specific. Нет методологии. Нет артефактов | DevKit — IDE-agnostic через Agent Skills |
| **TDD/BDD фреймворки** | Тесты как спецификация | Тестируют код, не архитектурные решения. Нет эскалации | QAKit тестирует решения на всех уровнях |
| **ADR tools** (adr-tools, log4brains) | Architecture Decision Records | Только запись решений. Нет верификации. Нет связи с кодом | ArchKit связывает ADR с инвариантами, impact map, и constitution |

## Unoccupied Space

Ни один существующий инструмент не покрывает:
1. **Полный цикл** от исследования до верификации с артефактами между фазами
2. **Инварианты как контракты** (UX + технические) до написания кода
3. **Автоматическая эскалация** (event detection) при нарушении инвариантов
4. **QA на уровне решений** — тест проверяет не код, а правильность решения
5. **Методология как код** — Agent Skills вместо документации

## Potential User

PROFILE: разработчик или тех-лид который использует AI-агентов (Claude Code, Copilot, Cursor) для разработки
PROBLEM: AI хитрит и упрощает, нет фазовой дисциплины, архитектурные решения принимаются молча, баги обнаруживаются после реализации
CURRENT_SOLUTION: пишет constitution.md вручную для spec-kit; или не использует методологию вообще ("vibe coding")
