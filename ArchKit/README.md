# ArchKit

> Уровень 3. "Как это устроено технически?"

---

## Когда использовать

- ProductKit завершён, UX инварианты зафиксированы
- нужно выбрать архитектуру из нескольких вариантов
- нужно формализовать технические инварианты
- нужно верифицировать архитектуру до написания кода
- нужно сгенерировать constitution.md для SpecKit

---

## Ключевая идея

Архитектура описывается декларативно — не "как реализовать" а "что гарантировать". Верификация происходит до написания кода. SpecKit получает на вход не догадки а доказанное основание.

---

## Фазы

### Phase 1: Discovery
```
QUESTIONS:
  - Какие quality attributes критичны? (reliability, performance, security)
  - Что хуже: потерять данные или показать устаревшие?
  - Какая нагрузка? Какие пики?
  - Один разработчик или команда?
  - Где хостим?

FORBIDDEN:
  - предлагать конкретные технологии
  - выбирать стек
```

### Phase 2: Architecture Variants
```
AI предлагает 2-3 варианта с явными трейдоффами.
Каждый вариант — ADR с:
  - что выбираем
  - почему именно это
  - от чего отказываемся и почему
  - риски выбора

FORBIDDEN:
  - предлагать один вариант как единственный
  - скрывать трейдоффы
  - выбирать за разработчика
```

### Phase 3: Specification
```
Выбранная архитектура формализуется:
  - компоненты и их контракты
  - технические инварианты
  - failure modes и как обрабатываются
  - явные UNKNOWN которые блокируют разработку
```

### Phase 4: Verification
```
Adversarial scenarios — AI играет роль враждебной среды:
  - что если этот сервис упал в момент транзакции?
  - что если два запроса пришли одновременно?
  - что если внешний сервис недоступен?

Для каждого сценария архитектура даёт ответ.
Если ответа нет — OPEN_QUESTION, блокирует переход.

Уровни верификации:
  L1: структурная (зависимости, интерфейсы, нет циклов)
  L2: сценарная (adversarial scenarios, AI симуляция)
  L3: формальная (TLA+/Alloy для критических инвариантов, опционально)
```

---

## События которые обрабатывает ArchKit

### RFC (Request for Change)
Triggered: когда новые требования затрагивают инварианты
```markdown
# RFC-XXX: [название]

TRIGGERED_BY: что изменилось

## Affected Invariants
[список]

## Affected Specs
[список]

## Change Cost
SPECS_TO_REVISE: N
INVARIANTS_TO_CHANGE: M

## Options
### Option A: ...
### Option B: ...

## Decision
CHOSEN: [выбранный вариант]
RATIONALE: почему
STATUS: open / accepted / rejected
```

### Investigation (технический блокер)
Triggered: баг в либе / провал бенчмарка / неожиданное ограничение
```markdown
# INV-XXX: [название]

TRIGGERED_BY: что произошло
ASSUMPTION_IN: [ADR который сломался]
REALITY: что обнаружили

## Options
### Option A: ...
### Option B: ...
### Option C: ...

## Decision
CHOSEN: [выбранный вариант]
RATIONALE: почему
STATUS: open / resolved
```

---

## Артефакты

### invariants.md
```markdown
# Technical Invariants

## I1: [название]
STATEMENT: что система гарантирует
RATIONALE: почему это важно
VERIFICATION: как доказать / проверить
FAILURE_MODE: что происходит при нарушении
STATUS: verified / assumed / unverified
```

### impact.md
```markdown
# Impact Map

Карта зависимостей между архитектурными решениями.
Используется для impact analysis при RFC и Investigation.

## [Компонент / Решение]
DEPENDS_ON: [список]
DEPENDED_BY: [список]
INVARIANTS: [список инвариантов которые затрагивает]
```

### decisions/
```
ADR-XXX.md      ← Architecture Decision Records
RFC-XXX.md      ← Request for Change
INV-XXX.md      ← Investigation
```

### constitution.md
```
Генерируется автоматически из invariants.md и decisions/.
Это входной артефакт для SpecKit.
НЕ редактировать вручную.
```

---

## Переход к SpecKit

**ALLOWED** когда:
- все adversarial scenarios имеют ответ
- нет OPEN_QUESTIONS без resolution
- все инварианты имеют статус verified или assumed с явным риском
- constitution.md сгенерирован

**BLOCKED** когда:
- есть OPEN_QUESTIONS блокирующего типа
- инварианты противоречат UX инвариантам из ProductKit
- не все failure modes описаны для критических путей

---

## Команды

```
/arch-kit init
/arch-kit discovery
/arch-kit variants
/arch-kit specify
/arch-kit verify
/arch-kit rfc "описание изменения"
/arch-kit investigate "описание блокера"
/arch-kit generate-constitution
/arch-kit status
```
