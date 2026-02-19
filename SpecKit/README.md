# SpecKit

> Уровень 4. "Строим."

---

## Отношение к github/spec-kit

DevKit использует оригинальный [github/spec-kit](https://github.com/github/spec-kit) без изменений. SpecKit в контексте DevKit — это уровень 4 который получает на вход верифицированные артефакты из ArchKit.

Разница с использованием spec-kit напрямую:

```
Без DevKit:
  разработчик пишет constitution.md вручную
  AI додумывает архитектуру сам
  хитрит потому что нет доказанного основания

С DevKit:
  constitution.md генерируется из invariants.md + decisions/
  AI работает в рамках верифицированной архитектуры
  отклонение от инвариантов — блокер, не молчаливое изменение
```

---

## Входные артефакты

SpecKit получает из ArchKit:

```
.devkit/arch/constitution.md  →  .specify/constitution.md
.devkit/arch/invariants.md    →  контекст для всех спек
.devkit/arch/impact.md        →  используется при эскалации
.devkit/product/ux_invariants.md → часть constitution
```

---

## Стандартный флоу (github/spec-kit)

```
/constitution   ← не писать вручную, брать из ArchKit
/specify        ← описание фичи
/clarify        ← уточнение до планирования
/plan           ← технический план
/tasks          ← разбивка на задачи
/analyze        ← проверка согласованности
/implement      ← реализация
```

---

## Детектор событий

В процессе работы в SpecKit AI отслеживает триггеры и эскалирует:

### Триггер RFC
Разработчик упоминает новое требование которое меняет инварианты.

```
Паттерны:
  "нам ещё нужно..."
  "а что если добавить..."
  "заказчик попросил..."

Реакция AI:
  "Это затрагивает инвариант [I_N] из invariants.md.
   Предлагаю RFC перед продолжением. /arch rfc?"
```

### Триггер Investigation
Технический блокер в процессе реализации.

```
Паттерны:
  "либа не поддерживает..."
  "бенчмарк показал..."
  "нашёл баг в..."
  "это работает не так как ожидали..."

Реакция AI:
  "Это нарушает допущение из [ADR-N].
   Нужен Investigation. /arch investigate?"
```

### Триггер Product Blocker
UX проблема обнаруженная при реализации.

```
Паттерны:
  "это неудобно использовать..."
  "слишком много параметров..."
  "пользователь не поймёт..."

Реакция AI:
  "Это нарушение UX инварианта [U_N].
   Нужен ProductKit investigation. /product investigate?"
```

---

## Структура спеки

Каждая спека в DevKit контексте содержит дополнительный раздел:

```markdown
# Spec NNN: [название]

## Invariants
TECHNICAL: [какие инварианты из invariants.md затрагивает]
UX: [какие UX инварианты из ux_invariants.md затрагивает]

## Standard SpecKit content
...

## Deviation Guard
Если реализация требует отклонения от инварианта — СТОП.
Не реализовывать. Создать RFC.
```

---

## Команды

```
/speckit init           ← инициализация из ArchKit артефактов
/speckit sync           ← обновить constitution из ArchKit после RFC
/speckit check-invariants ← проверить что спеки не нарушают инварианты

# Стандартные команды github/spec-kit
/constitution
/specify
/clarify
/plan
/tasks
/analyze
/implement
```
