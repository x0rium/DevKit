# Roadmap — DevKit Tooling

## MVP
GOAL: минимальный CLI который делает DevKit experience ощутимо лучше чем без CLI
UX_INVARIANTS: [U1, U2, U3, U4]
FEATURES:
  - `devkit init` — автодетект + создание .devkit/ структуры
  - `devkit status` — текущая фаза, прогресс, blockers, следующий шаг
  - `devkit validate` — проверка артефактов по JSON Schema с actionable ошибками
  - `devkit gate` — проверка можно ли перейти на следующий уровень
EXCLUDES:
  - constitution generation (V1)
  - impact analysis (V1)
  - spec-kit интеграция (V1)
  - event detection runtime (Later)

## V1
GOAL: полная автоматизация связей между уровнями
UX_INVARIANTS: [U1, U2, U3, U4, U5, U6]
FEATURES:
  - `devkit generate-constitution` — генерация constitution.md из invariants + decisions
  - `devkit impact "описание"` — impact analysis по impact.md
  - `devkit sync` — синхронизация constitution → .specify/
  - Progressive disclosure в help (U5)
  - JSON Schema для всех типов артефактов
  - Полная offline работа (U6)

## Later
FEATURES:
  - `devkit rfc "описание"` — создание RFC с автоматическим impact analysis
  - `devkit investigate "описание"` — создание Investigation с привязкой к ADR
  - `devkit coverage` — coverage map из тестов + инвариантов
  - `devkit escalate` — QA эскалация с автоопределением уровня
  - Интеграция с spec-kit CLI (если доступен)
  - Dashboard в браузере (`devkit dashboard`)
  - Watch mode для валидации (`devkit validate --watch`)

## Never (anti-scope)
  - IDE плагин (Agent Skills достаточно)
  - Собственный AI рантайм (используем существующих агентов)
  - Хостинг / SaaS версия
  - Генерация кода (это SpecKit через spec-kit)
  - Замена Git (артефакты — файлы в Git)
