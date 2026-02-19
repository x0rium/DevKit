# Assumptions — DevKit Tooling

## Assumption: Developers want structured AI methodology
STATEMENT: Разработчики которые уже используют AI-агенты чувствуют потребность в фазовой дисциплине
BASIS: Рост интереса к SDD (spec-driven development), появление spec-kit от GitHub, статьи о "vibe coding" проблемах
RISK: medium
VALIDATION_METHOD: опросить 5+ разработчиков использующих AI, спросить про боли
STATUS: assumed
FINDING:

## Assumption: Agent Skills standard will persist
STATEMENT: Формат Agent Skills (SKILL.md + references/) станет де-факто стандартом для AI-агентов
BASIS: Anthropic официально поддерживает, Vercel выпустил agent-skills, растущая экосистема
RISK: medium
VALIDATION_METHOD: отслеживать adoption в 2026, проверять поддержку в новых агентах
STATUS: assumed
FINDING:

## Assumption: CLI enhances but doesn't replace methodology
STATEMENT: CLI — опциональный усилитель. Методология DevKit ценна даже без CLI только как набор Skills
BASIS: Текущий DevKit уже работает как чистые Skills без рантайма
RISK: low
VALIDATION_METHOD: использовать DevKit на реальном проекте без CLI, измерить friction
STATUS: assumed
FINDING:

## Assumption: TypeScript is the right choice for CLI
STATEMENT: TypeScript/Node — оптимальный рантайм для DevKit CLI
BASIS: Совместимость с npm/npx, экосистема spec-kit, знакомство ЦА с JS/TS
RISK: low
VALIDATION_METHOD: проверить что все нужные библиотеки (markdown parser, YAML, JSON Schema) доступны в npm
STATUS: assumed
FINDING:

## Assumption: Markdown artifacts are sufficient
STATEMENT: Structured markdown (YAML frontmatter + markdown body) достаточен для всех артефактов DevKit
BASIS: spec-kit использует такой же подход, Git-friendly, человекочитаемый
RISK: low
VALIDATION_METHOD: описать schema для каждого типа артефакта, проверить что все поля парсятся без потерь
STATUS: assumed
FINDING:
