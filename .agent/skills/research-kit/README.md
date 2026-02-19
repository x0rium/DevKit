# ResearchKit

> Уровень 1. "Возможно ли это вообще?"

---

## Когда использовать

- у тебя есть идея которую никто ещё не делал
- не знаешь существуют ли аналоги
- не знаешь технически реализуемо ли это
- не знаешь нужно ли это кому-то кроме тебя
- хочешь понять риски до инвестиции времени

---

## Фазы

### Phase 1: Market Research
```
QUESTIONS:
  - Существуют ли аналоги?
  - Чем они плохи / чего не делают?
  - Есть ли незанятая ниша?
  - Кто потенциальный пользователь?

FORBIDDEN:
  - предлагать решения
  - думать об архитектуре
  - оценивать сложность реализации
```

### Phase 2: Technical Feasibility
```
QUESTIONS:
  - Это реализуемо с текущим state of the art?
  - Какие известные подходы существуют?
  - Где известные тупики и ограничения?
  - Какие технологии близко решают задачу?

FORBIDDEN:
  - выбирать конкретный стек
  - писать архитектуру
```

### Phase 3: Unknowns Map
```
Главный артефакт ResearchKit.
Не ответы — карта того что мы не знаем.

Каждый unknown классифицируется:
  RISK: high / medium / low
  VALIDATION: как проверить до начала разработки
  BLOCKER: блокирует ли переход к ProductKit
```

---

## Артефакты

### market.md
```markdown
# Market Research

## Аналоги
| Инструмент | Что делает | Чего не делает | Ниша |
|-----------|-----------|---------------|------|

## Незанятое пространство
...

## Потенциальный пользователь
...
```

### feasibility.md
```markdown
# Technical Feasibility

## Известные подходы
...

## Известные ограничения
...

## Вывод
FEASIBLE: yes / no / conditional
CONDITIONS: [что должно быть верным чтобы это работало]
```

### unknowns.md
```markdown
# Unknowns Map

## Unknown: [название]
DESCRIPTION: что именно не знаем
RISK: high / medium / low
VALIDATION: как проверить
BLOCKER: yes / no
STATUS: open / validated / invalidated
```

### assumptions.md
```markdown
# Assumptions

## Assumption: [название]
STATEMENT: что предполагаем
BASIS: почему предполагаем
RISK: high / medium / low
VALIDATION_METHOD: как проверить
STATUS: assumed / confirmed / rejected
```

---

## Переход к ProductKit

**ALLOWED** когда:
- все HIGH RISK unknowns имеют validation path
- feasibility = yes или conditional с известными условиями
- нет BLOCKER unknowns в статусе open

**BLOCKED** когда:
- есть BLOCKER unknown без validation path
- feasibility = no

---

## Команды

```
/research init "описание идеи"
/research market
/research feasibility  
/research unknowns
/research validate "unknown name" "результат проверки"
/research status      ← можно ли переходить к ProductKit
```
