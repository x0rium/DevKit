# Users — DevKit Tooling

## Primary User

PROFILE: Разработчик или тех-лид, использующий AI-агентов (Claude Code, Cursor, Copilot) для повседневной разработки. Работает через терминал + IDE. Знаком с Git, npm/npx, markdown.
CONTEXT: Работает один или в маленькой команде (1-5 чел). Использует AI как co-developer. Проекты от MVP до production.
KNOWLEDGE: Знает SDD (или готов изучить). Возможно уже пробовал spec-kit. Понимает value proposition методологии.
GOAL: Получить фазовую дисциплину для AI без friction. AI не хитрит, архитектура верифицирована, баги ловятся на правильном уровне.
HAPPY_PATH: `npx devkit init` → проходит уровни с AI → получает верифицированный результат с coverage map

## Secondary User

PROFILE: Разработчик без опыта AI-методологий, пробует DevKit впервые
CONTEXT: Услышал про DevKit, хочет попробовать на пет-проекте
KNOWLEDGE: Знает Git, терминал. Не знает SDD, spec-kit, Agent Skills.
GOAL: Понять что DevKit даёт за минимальное время
HAPPY_PATH: `npx devkit init` → guided wizard → первый .devkit/ за 5 минут

## Edge Cases

- Команда из 10+ человек (коллаборация на артефактах .devkit/)
- Brownfield проект с 100K+ строк кода (реконструкция инвариантов)
- Проект без spec-kit (DevKit без уровня 4)
