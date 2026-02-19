# QAKit

> Уровень 5. "Работает ли это как мы решили?"

---

## Ключевая идея

Обычный QA проверяет код против спек. QAKit проверяет систему против **всех уровней принятых решений**. Тест который упал — это не просто баг. Это сигнал о том на каком уровне решение было неверным.

```
QAKit проверяет:

  против SpecKit:      код делает что написано в спеке?
  против ArchKit:      система соблюдает технические инварианты?
  против ProductKit:   продукт решает проблему пользователя?
  против ResearchKit:  assumptions оказались верны?
```

---

## Входные артефакты

```
.devkit/arch/invariants.md       → test_contracts.md
.devkit/product/ux_invariants.md → ux_test_contracts.md
.devkit/research/assumptions.md  → assumption_checks.md
.specify/specs/                  → spec coverage
```

---

## Фазы

### Phase 1: Contract Generation
```
Из каждого инварианта генерируется тест-контракт:
  - что проверяем
  - как проверяем
  - что является нарушением
  - критичность нарушения
```

### Phase 2: Coverage Analysis
```
Карта покрытия:
  - какие инварианты покрыты тестами
  - какие инварианты не покрыты (технический долг)
  - какие assumptions проверены в реальности
```

### Phase 3: Assumption Validation
```
Проверка что assumptions из ResearchKit
оказались верны в реальной системе.

Если assumption отклонён реальностью →
эскалация в ResearchKit для пересмотра.
```

---

## Эскалация

### Логика эскалации упавшего теста

```
Тест упал
      ↓
AI анализирует: что именно нарушено?
      ↓
┌─────────────────────────────────────────────┐
│ Баг реализации?                             │
│ Код не соответствует спеке                  │
│ → фикс в SpecKit, не эскалируем             │
└─────────────────────────────────────────────┘
      ↓ нет
┌─────────────────────────────────────────────┐
│ Нарушен технический инвариант?              │
│ Система не выполняет архитектурную гарантию │
│ → Investigation в ArchKit                   │
└─────────────────────────────────────────────┘
      ↓ нет
┌─────────────────────────────────────────────┐
│ Нарушен UX инвариант?                       │
│ Система работает но неудобна / непонятна    │
│ → Product Blocker в ProductKit              │
└─────────────────────────────────────────────┘
      ↓ нет
┌─────────────────────────────────────────────┐
│ Отклонён assumption из ResearchKit?         │
│ Реальность не совпала с предположением      │
│ → ResearchKit revision                      │
└─────────────────────────────────────────────┘
```

---

## Артефакты

### test_contracts.md
```markdown
# Test Contracts

## TC-I1: [название инварианта]
INVARIANT: I1 из invariants.md
WHAT: что проверяем
HOW: метод проверки (unit / integration / e2e / manual)
VIOLATION: что считается нарушением
CRITICALITY: blocker / major / minor
COVERAGE: covered / not-covered
```

### ux_test_contracts.md
```markdown
# UX Test Contracts

## TC-U1: [название UX инварианта]
INVARIANT: U1 из ux_invariants.md
SCENARIO: пользовательский сценарий для проверки
WHAT: что наблюдаем
VIOLATION: что считается нарушением
METHOD: usability test / metric / manual review
```

### assumption_checks.md
```markdown
# Assumption Validation

## AC-A1: [название assumption]
ASSUMPTION: A1 из assumptions.md
ORIGINAL_STATEMENT: что предполагали
VALIDATION_METHOD: как проверили
RESULT: confirmed / rejected / partially-confirmed
FINDING: что обнаружили
ESCALATION: none / ResearchKit revision needed
```

### coverage_map.md
```markdown
# Coverage Map

## Technical Invariants Coverage
| Инвариант | Контракт | Статус | Метод |
|----------|---------|--------|-------|
| I1       | TC-I1   | ✅     | unit  |
| I2       | TC-I2   | ❌     | -     |

## UX Invariants Coverage
...

## Assumptions Validation
...

## Uncovered (технический долг)
...
```

### escalations/
```
ESC-XXX.md  ← история каждой эскалации
            ← что нашли, на какой уровень эскалировали, решение
```

---

## Переход к Production

**ALLOWED** когда:
- все BLOCKER test contracts покрыты
- нет open эскалаций blocker уровня
- coverage_map показывает покрытие критических инвариантов

**BLOCKED** когда:
- есть непокрытые BLOCKER контракты
- есть open эскалации blocker уровня

---

## Команды

```
/qa init                    ← генерация контрактов из инвариантов
/qa coverage                ← анализ текущего покрытия
/qa check-assumptions       ← валидация assumptions против реальности
/qa escalate "описание"     ← ручная эскалация
/qa status                  ← можно ли в production
```
