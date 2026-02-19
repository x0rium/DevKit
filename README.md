# DevKit — AI-Native Development Methodology

> Полный цикл разработки с AI от идеи до верифицированного продукта.

---

## Проблема которую решает DevKit

Существующие инструменты AI-разработки (SpecKit и подобные) описывают только середину цикла — реализацию. Они не знают что было до и что будет после. Это приводит к:

- AI хитрит и упрощает потому что нет доказанного основания
- архитектурные решения принимаются молча внутри спек
- новые требования ломают всё потому что нет impact analysis
- баги в либах или UX проблемы обнаруживаются после реализации
- тесты проверяют код, а не архитектурные инварианты

DevKit — это **upstream layer** над SpecKit. Не конкурент, не форк — экосистема из пяти уровней где каждый генерирует артефакты для следующего.

---

## Быстрый старт

### Установка CLI

```bash
cd your-project

# Склонировать DevKit
git clone https://github.com/x0rium/DevKit.git /tmp/devkit-src

# Собрать CLI
cd /tmp/devkit-src/cli
npm install && npm run build

# Создать алиас (добавить в .zshrc/.bashrc)
alias devkit="node /tmp/devkit-src/cli/dist/index.js"
```

### Первая сессия

```bash
# 1. Инициализация — DevKit определит состояние проекта
devkit init

# 2. Проверить текущий статус
devkit status

# 3. Валидировать артефакты
devkit validate

# 4. Начать работу с Agent Skills
#    В чате с AI вызовите /devkit-init
```

DevKit автоматически определит состояние проекта и выберет нужный режим.

---

## Режимы инициализации

| Что найдено в проекте | Режим | Что происходит |
|----------------------|-------|----------------|
| Пустая папка | Greenfield | Создаёт .devkit/ + .specify/, старт с ResearchKit |
| Код без .devkit/ | Brownfield | Реконструирует инварианты из кода, выявляет gaps |
| .specify/ без .devkit/ | Upgrade | Извлекает артефакты из constitution.md, связывает |
| .devkit/ уже есть | Status | Показывает текущее состояние |

---

## Пять уровней

```
[ResearchKit]   → "возможно ли это вообще?"
      ↓
[ProductKit]    → "что именно строим и для кого?"
      ↓
[ArchKit]       → "как это устроено технически?"
      ↓
[SpecKit]       → "строим" (github/spec-kit)
      ↓
[QAKit]         → "работает ли это как мы решили?"
      ↓
      └── эскалация событий на любой уровень вверх
```

---

## CLI — Справочник команд

### Общие опции

Все команды поддерживают флаг `--dir <path>` для указания директории проекта. По умолчанию используется текущая директория.

```bash
devkit status                          # текущая папка
devkit status --dir /path/to/project   # указать явно
```

---

### `devkit init` — Инициализация

Создаёт структуру `.devkit/` и определяет состояние проекта.

```bash
devkit init
```

**Вывод:**
```
🚀 DevKit Init

  Detected: greenfield project

  Created:
    + .devkit/
    + .devkit/research/
    + .devkit/product/
    + .devkit/arch/
    + .devkit/arch/decisions/
    + .devkit/qa/
    + .devkit/qa/escalations/
    + .devkit/STATUS.md

  Next steps:
    Start with: /research-kit
    Describe your idea and explore feasibility.
```

Команда идемпотентна — повторный вызов ничего не ломает.

---

### `devkit status` — Статус проекта

Показывает текущую фазу, прогресс, открытые эскалации и доступные команды.

```bash
devkit status
```

**Вывод:**
```
╔══════════════════════════════════════╗
║         DevKit Status                ║
╚══════════════════════════════════════╝

  Mode:        greenfield
  Initialized: 2026-02-19
  Phase:       ArchKit

  Progress:
    ✅ ResearchKit
    ✅ ProductKit
    ⬜ ArchKit ◀ current
    ⬜ SpecKit
    ⬜ QAKit

  Next: Define technical invariants. Run /arch-kit

  ⚡ Open escalations:
    📋 RFC-001: Add watch mode (RFC)
    🔬 INV-001: SQLite performance (Investigation)

  Available commands for this phase:
    devkit status
    devkit validate
    devkit gate
    devkit advance
    devkit generate-constitution
    devkit impact "..."
    devkit rfc "..."
    devkit investigate "..."
```

> **Progressive disclosure (U5):** команды показываются только если релевантны текущей фазе. В QAKit фазе появится `devkit escalate`, а в ArchKit — `devkit rfc`.

---

### `devkit validate` — Валидация артефактов

Проверяет все `.devkit/` артефакты на наличие обязательных секций и структурированных полей.

```bash
devkit validate
```

**Вывод при ошибках:**
```
🔍 DevKit Validate

  Checked: 4 artifacts

  Errors:
    ✗ .devkit/research/unknowns.md:0 — Missing section "## Unknown: [name]"
      Fix: Add section "## Unknown: [name]" to unknowns.md

    ✗ .devkit/research/unknowns.md:12 — Missing field BLOCKER
      Fix: Add "BLOCKER: yes / no" under each "## Unknown:" section
```

Каждая ошибка содержит: файл, строку, описание и **конкретную инструкцию по исправлению** (UX Invariant U3).

---

### `devkit gate` — Проверка перехода

Проверяет можно ли перейти на следующую фазу. Каждая фаза имеет свои условия.

```bash
devkit gate                    # проверить текущую фазу
devkit gate --phase research   # проверить конкретную фазу
```

**Вывод:**
```
🚧 DevKit Gate Check

  Gate: ResearchKit → ProductKit

    ✅ market.md exists
    ✅ feasibility.md exists
    ✅ unknowns.md exists
    ✅ assumptions.md exists
    ✅ No open blocker unknowns

  Result: ✅ GATE PASSED — transition allowed
```

**Если заблокировано:**
```
  Gate: ResearchKit → ProductKit

    ✅ market.md exists
    ✅ feasibility.md exists
    ✅ unknowns.md exists
    ❌ assumptions.md missing
    ❌ Open blocker unknowns: "Database scalability"

  Result: ❌ GATE BLOCKED — resolve conditions first
```

---

### `devkit advance` — Переход на следующую фазу

Проверяет gate и продвигает проект на следующую фазу в STATUS.md.

```bash
devkit advance           # с проверкой gate
devkit advance --force   # без проверки (не рекомендуется)
```

**Вывод:**
```
⏩ Advance Phase

  ✅ Advanced: ResearchKit → ProductKit
```

---

### `devkit generate-constitution` — Генерация конституции

Собирает `constitution.md` из технических инвариантов, UX инвариантов и ADR решений.

```bash
devkit generate-constitution
```

**Вывод:**
```
📜 Generate Constitution

  ✅ Constitution generated!
     Technical invariants: 3
     UX invariants:        6
     ADR decisions:        2
     Output: .devkit/arch/constitution.md

  Run "devkit sync" to copy to .specify/constitution.md
```

**Источники:**
- `.devkit/arch/invariants.md` — технические инварианты (`## I1:`, `## I2:` ...)
- `.devkit/product/ux_invariants.md` — UX инварианты (`## U1:`, `## U2:` ...)
- `.devkit/arch/decisions/ADR-*.md` — Architecture Decision Records
- `.devkit/arch/decisions/RFC-*.md` — Active RFCs (listed separately)

---

### `devkit sync` — Синхронизация конституции

Копирует `constitution.md` из `.devkit/arch/` в `.specify/` для использования SpecKit.

```bash
devkit sync
```

**Вывод:**
```
🔄 Sync Constitution

  ✅ Synced!
     .devkit/arch/constitution.md → .specify/constitution.md
```

---

### `devkit impact "описание"` — Анализ влияния

Анализирует как предложенное изменение повлияет на инварианты и компоненты.

```bash
devkit impact "add authentication to CLI"
devkit impact "remove offline mode"
devkit impact "change error format"
```

**Вывод:**
```
💥 Impact Analysis

Impact Analysis: "add authentication to CLI"
Risk: 🟡 MEDIUM

  Affected invariants:
    ⚡ U4: Non-invasive integration
    ⚡ U5: Progressive disclosure

  💡 This change touches 2 invariant(s). Open an RFC via "devkit rfc" before proceeding.
```

**Уровни риска:**
- 🟢 **LOW** — 0 затронутых инвариантов
- 🟡 **MEDIUM** — 1-2 затронутых инварианта
- 🔴 **HIGH** — 3+ затронутых инвариантов (exit code 1)

---

### `devkit rfc "описание"` — Создание RFC

Создаёт RFC (Request for Change) с автоматическим impact analysis.

```bash
devkit rfc "Add watch mode for validate command"
```

**Вывод:**
```
📋 Create RFC

  ✅ Created: RFC-001
     Path:   .devkit/arch/decisions/RFC-001.md
     Risk:   🔴 high

  Affected invariants:
    ⚡ U3: Artifact validation with actionable errors
    ⚡ U4: Non-invasive integration
    ⚡ U6: Offline-first

  Next: Fill Options and Decision in the RFC file.
  Then: devkit resolve-rfc RFC-001 "Option A" "rationale"
```

**Что происходит автоматически:**
1. Запускается `impact analysis`
2. Заполняются `Affected Invariants` и `Affected Specs`
3. Подсчитывается `Change Cost` (specs + invariants)
4. Генерируется шаблон с Options A/B и Post-Decision Actions

**Жизненный цикл RFC:**
```bash
devkit rfc "описание"                              # создать
devkit rfc-list                                      # посмотреть все
# (вручную заполнить Options в файле)
devkit resolve-rfc RFC-001 "Option A" "rationale"  # закрыть
devkit generate-constitution                         # обновить конституцию
devkit sync                                          # синхронизировать
```

---

### `devkit investigate "описание"` — Расследование

Создаёт Investigation для технического блокера или сломавшегося допущения.

```bash
devkit investigate "SQLite performance degrades under concurrent load"
```

**Вывод:**
```
🔬 Create Investigation

  ✅ Created: INV-001
     Path: .devkit/arch/decisions/INV-001.md

  🔗 Linked ADR: ADR-001
     Broken assumption: SQLite handles concurrent writes

  Invariants at risk:
    ⚠️  U2: Status at a glance
```

**Что происходит автоматически:**
1. Ищутся ADR файлы с assumption'ами содержащими ключевые слова
2. Если найден — линкуется как `ASSUMPTION_IN: ADR-XXX`
3. Определяются инварианты под угрозой

**Жизненный цикл Investigation:**
```bash
devkit investigate "описание"                                   # создать
devkit inv-list                                                  # посмотреть все
# (вручную заполнить Options и REALITY в файле)
devkit resolve-inv INV-001 "use WAL mode" "fixes concurrency"  # закрыть
devkit generate-constitution                                     # обновить
```

---

### `devkit escalate "описание"` — QA Эскалация

Создаёт эскалацию с автоматическим определением уровня.

```bash
devkit escalate "user finds error messages confusing and unintuitive"
devkit escalate "data loss from race condition in save"
devkit escalate "we assumed API would be free but it costs money"
devkit escalate "function returns wrong value"
```

**Автоматическая маршрутизация:**
```
🚨 QA Escalation

  ✅ Created: ESC-001
     Path:  .devkit/qa/escalations/ESC-001.md
     Level: 👤 productkit
     Why:   UX issue detected ("confusing"). Escalating to ProductKit.

  Action: Review .devkit/product/ux_invariants.md
```

**4 уровня эскалации:**

| Уровень | Когда | Пример ключевых слов | Действие |
|---------|-------|---------------------|----------|
| 🔧 speckit | Код ≠ спека | (по умолчанию) | Фикс в коде |
| 🏛️ archkit | Инвариант нарушен | invariant, race condition, data loss, security | `devkit investigate` |
| 👤 productkit | UX проблема | confusing, unintuitive, hard to use, awkward | Ревью UX инвариантов |
| 🔬 researchkit | Assumption ложный | assumed, turns out, wrong assumption | Ревизия research |

**Принудительный уровень:**
```bash
devkit escalate "some issue" --level archkit
```

---

### `devkit rfc-list` / `devkit inv-list` — Списки

```bash
devkit rfc-list
```
```
📋 RFCs

  🟡 RFC-001: Add watch mode [open]
  ✅ RFC-002: Change error format [accepted]
```

```bash
devkit inv-list
```
```
🔬 Investigations

  🟡 INV-001: SQLite performance [open]
  ✅ INV-002: Memory leak [resolved]
```

---

## Типичные workflow

### Greenfield проект

```bash
devkit init                             # создать .devkit/
# → Работа с AI через /research-kit
devkit validate                         # проверить артефакты
devkit gate                             # готовы ли к следующей фазе?
devkit advance                          # перейти к ProductKit
# → Работа через /product-kit
devkit advance                          # → ArchKit
devkit generate-constitution            # собрать конституцию
devkit sync                             # → .specify/
# → Работа через /spec-kit, /qa-kit
```

### Новое требование в середине разработки

```bash
devkit impact "add OAuth authentication"      # оценить влияние
# Risk: 🔴 HIGH — 3 инварианта затронуты
devkit rfc "add OAuth authentication"         # создать RFC
# → Заполнить Options в RFC-001.md
devkit resolve-rfc RFC-001 "OAuth2 + PKCE" "industry standard"
devkit generate-constitution                    # обновить
devkit sync                                     # синхронизировать
```

### Баг в QA

```bash
devkit escalate "benchmark shows 10x slowdown on large files"
# → Level: 🏛️ archkit — performance invariant
# → Action: devkit investigate "..."
devkit investigate "file processing performance regression"
# → Linked ADR: ADR-003, Invariant at risk: I2
# → Заполнить Options
devkit resolve-inv INV-001 "streaming parser" "O(1) memory"
devkit generate-constitution
```

---

## Ключевые принципы

### 1. Фазовая дисциплина
AI знает на каком уровне находится и не может перепрыгнуть вперёд. На каждом уровне есть явные ALLOWED и FORBIDDEN действия. Переход возможен только когда уровень закрыт.

### 2. Артефакты как источник истины
Каждый уровень производит машиночитаемые артефакты которые следующий уровень получает на вход. Не markdown для людей — структурированные документы со схемой.

### 3. Инварианты как контракты
Система описывается через то что она **гарантирует**, а не через то как реализована. Инварианты бывают технические (ArchKit) и UX (ProductKit). Нарушение инварианта — блокер.

### 4. Детектор событий
AI в процессе диалога распознаёт тип события и автоматически переключает уровень — без явных команд от разработчика:

| Событие | Триггер | Действие |
|---------|---------|----------|
| RFC | "нам ещё нужно X", "добавь Y" | Стоп SpecKit → ArchKit delta-цикл |
| Investigation | "баг в либе", "бенчмарк упал" | Стоп SpecKit → ArchKit Investigation |
| Product Blocker | "неудобно использовать" | Стоп SpecKit → ProductKit investigation |
| QA Эскалация | тест упал | Анализ уровня → эскалация куда нужно |

### 5. Явная цена изменений
Любое изменение проходит impact analysis до принятия решения. Разработчик видит стоимость до действия, а не после.

---

## Структура артефактов

```
.devkit/
  STATUS.md               ← текущая фаза, прогресс
  research/
    market.md             ← аналоги, ниши, конкуренты
    feasibility.md        ← техническая реализуемость
    unknowns.md           ← карта неизвестного
    assumptions.md        ← что предполагаем, риск каждого
  product/
    users.md              ← кто пользователь, сценарии
    ux_invariants.md      ← UX гарантии системы
    roadmap.md            ← фазы, приоритеты, anti-scope
  arch/
    invariants.md         ← технические инварианты
    impact.md             ← карта зависимостей решений
    constitution.md       ← генерируется → копируется в .specify/
    decisions/
      ADR-XXX.md          ← Architecture Decision Records
      RFC-XXX.md          ← Requests for Change
      INV-XXX.md          ← Investigations
  qa/
    test_contracts.md     ← тест для каждого инварианта
    assumption_checks.md  ← валидация assumptions из research
    coverage_map.md       ← какие инварианты покрыты
    escalations/
      ESC-XXX.md          ← история QA эскалаций

.specify/                 ← github/spec-kit (не редактировать вручную)
  constitution.md         ← OWNED BY ArchKit, не редактировать
```

---

## Отношение к github/spec-kit

DevKit не заменяет spec-kit. SpecKit — это уровень 4 экосистемы.

```
Без DevKit:
  разработчик → пишет constitution вручную
             → AI додумывает архитектуру сам
             → хитрит потому что основания нет

С DevKit:
  ArchKit генерирует constitution.md из верифицированных решений
  SpecKit получает доказанное основание
  AI не может отклониться — инварианты зафиксированы
```

---

## Agent Skills

DevKit распространяется как набор [Agent Skills](https://agentskills.io) — работает с любым совместимым агентом: Claude Code, Cursor, VS Code Copilot и другими.

| Skill | Когда активируется |
|-------|-------------------|
| [devkit-init](./devkit-init/) | "init devkit", старт проекта |
| [research-kit](./ResearchKit/) | новая идея, feasibility вопросы |
| [product-kit](./ProductKit/) | "кто пользователь", "что MVP" |
| [arch-kit](./ArchKit/) | архитектура, RFC, Investigation |
| [spec-kit](./SpecKit/) | реализация + детектор событий |
| [qa-kit](./QAKit/) | тестирование, эскалации |

---

## Лицензия

MIT
