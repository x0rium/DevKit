# Technical Feasibility — DevKit Tooling

## Scope

DevKit Tooling = CLI + runtime который автоматизирует методологию DevKit:
- Инициализация `.devkit/` (сейчас делает AI вручную по SKILL.md)
- Валидация артефактов (JSON Schema / frontmatter linting)
- Отслеживание состояния (STATUS.md + gate checking)
- Генерация constitution.md из invariants + decisions
- Impact analysis при изменениях
- Coverage map для QAKit

## Known Approaches

| Подход | Пример | Плюсы | Минусы |
|--------|--------|-------|--------|
| **CLI на TypeScript/Node** | specify-cli, create-next-app | Экосистема npm, кроссплатформенность, Agent Skills совместимость | Тяжёлый runtime |
| **CLI на Rust** | cargo, ripgrep | Быстрый, единый бинарник | Дольше разрабатывать, меньше контрибьюторов |
| **CLI на Python** | uv, specify-cli (pip) | Быстрый прототип, uv для дистрибуции | Зависимость от Python runtime |
| **CLI на Go** | gh, docker CLI | Единый бинарник, быстро | Меньше экосистемы для Agent Skills |
| **Pure Agent Skills (без CLI)** | Текущий DevKit | Нулевая инфраструктура, работает с любым агентом | Нет валидации, нет автоматизации, AI может ошибиться в структуре |

## Known Limitations

1. **Agent Skills стандарт молодой** — спецификация Anthropic может меняться
2. **spec-kit — приватный** — зависимость от GitHub, specify-cli может стать unavailable
3. **AI не детерминистичен** — даже с CLI, результат артефактов будет варьироваться
4. **Нет стандарта для артефактов** — markdown + frontmatter = conventions, не schema

## Hard Constraints

1. Должен работать с любым Agent Skills-совместимым агентом
2. Не должен требовать изменений в SKILL.md (backwards compatible)
3. CLI опциональный — методология работает и без CLI (graceful degradation)
4. Артефакты остаются человекочитаемым markdown

## Verdict

FEASIBLE: yes
CONDITIONS:
  - CLI как опциональный усилитель, не обязательная зависимость
  - TypeScript/Node как рантайм (совместимость с экосистемой spec-kit)
  - JSON Schema валидация frontmatter в markdown артефактах
  - Начинать с MVP: init + status + validate
CONFIDENCE: high
