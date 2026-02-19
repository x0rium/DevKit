# UX Invariants — DevKit Tooling

## U1: Zero-config start
STATEMENT: `npx devkit init` создаёт рабочий .devkit/ без конфигурации. Автодетект состояния проекта (greenfield/brownfield/upgrade).
RATIONALE: Первое впечатление определяет adoption. Если нужна конфигурация до первого результата — отток.
VALIDATION: Запустить `npx devkit init` в пустой папке, папке с кодом, папке с .specify/. Каждый раз должен получить рабочий .devkit/.
PRIORITY: must
STATUS: active

## U2: Status at a glance
STATEMENT: `devkit status` показывает текущую фазу, прогресс, blocker'ы и следующий шаг за ≤2 секунды.
RATIONALE: Разработчик должен мгновенно понимать где он и что делать дальше. Без чтения документации.
VALIDATION: Вызвать `devkit status` на разных стадиях проекта, проверить что вывод самодостаточен.
PRIORITY: must
STATUS: active

## U3: Artifact validation with actionable errors
STATEMENT: `devkit validate` проверяет все артефакты и для каждой ошибки говорит что исправить и где.
RATIONALE: "Error in invariants.md" бесполезно. "Missing VERIFICATION field in I3 (invariants.md:15)" — actionable.
VALIDATION: Создать артефакт с 3 разными ошибками, проверить что каждая даёт конкретный fix.
PRIORITY: must
STATUS: active

## U4: Non-invasive integration
STATEMENT: DevKit CLI не ломает существующий workflow. Все команды идемпотентны. Можно остановиться в любой момент.
RATIONALE: Страх необратимости — главный барьер adoption нового инструмента.
VALIDATION: Запустить init → удалить .devkit/ → проект работает как прежде. Запустить validate дважды подряд — одинаковый результат.
PRIORITY: must
STATUS: active

## U5: Progressive disclosure
STATEMENT: CLI показывает только релевантную информацию для текущей фазы. ResearchKit команды недоступны когда текущая фаза — SpecKit (если не эскалация).
RATIONALE: 20 команд в help — cognitive overload. 4 команды для текущей фазы — понятно.
VALIDATION: Вызвать `devkit help` на каждой фазе, проверить что показываются только релевантные команды + общие.
PRIORITY: should
STATUS: active

## U6: Offline-first
STATEMENT: Все core команды (init, status, validate, generate-constitution) работают без интернета.
RATIONALE: DevKit — локальный инструмент. Зависимость от сети — fragile.
VALIDATION: Отключить сеть, выполнить все core команды.
PRIORITY: should
STATUS: active
