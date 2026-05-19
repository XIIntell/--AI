# Discord AI Bot

Discord-бот с AI-ассистентом на базе **Google Gemini 2.5 Flash**. Отвечает на любые вопросы, **умеет искать актуальную информацию в Google** (новости, погода, события, курсы — всё свежее), помнит контекст разговора.

Полностью **бесплатный** на бесплатном тарифе Gemini (1500 запросов в день).

## Возможности

- `/ask вопрос:<твой вопрос>` — задать вопрос с автоматическим поиском в Google.
- Упоминание `@бот` в любом сообщении — отвечает с учётом последних 10 сообщений канала.
- `/clear` — очистить память бота в текущем канале.
- `/help` — показать справку.
- Источники, которые бот использовал, прилагаются к ответу.
- Память диалога хранится в SQLite-файле локально.
- Логирование через pino, валидация конфига через zod, строгий TypeScript.

## Стек

| Что | Зачем |
|---|---|
| Node.js 20+ | Runtime |
| TypeScript (strict) | Типизация |
| discord.js v14 | Работа с Discord API |
| @google/genai | Gemini SDK с поддержкой Google Search grounding |
| better-sqlite3 | Локальная база для памяти |
| zod | Валидация переменных окружения |
| pino + pino-pretty | Логи |
| tsx | Запуск TypeScript без шага сборки |

---

## Установка с нуля на Windows

### 1. Установи Node.js

1. Открой https://nodejs.org/ru
2. Скачай **LTS-версию** (зелёная кнопка слева, версия 20 или новее).
3. Запусти установщик. На всех экранах жми **Next** / **Install**. Галку **"Automatically install the necessary tools..."** можно НЕ ставить (но если поставишь — ничего страшного).
4. Перезагрузи компьютер (Windows иногда требует это для применения переменных PATH).
5. Открой **PowerShell** (нажми Win → набери `powershell` → Enter) и проверь:
   ```powershell
   node --version
   npm --version
   ```
   Должны напечататься версии (например `v20.18.0` и `10.x.x`).

### 2. Установи pnpm (опционально, но рекомендуется — быстрее npm)

```powershell
npm install -g pnpm
pnpm --version
```

Если не хочешь возиться — везде дальше можешь заменить `pnpm` на `npm`. Команды совместимы.

### 3. Скачай этот репозиторий

Вариант **А** (через Git — если установлен):
```powershell
git clone https://github.com/<твой_логин>/discord-ai-bot.git
cd discord-ai-bot
```

Вариант **Б** (без Git):
1. На странице репозитория нажми зелёную кнопку **Code** → **Download ZIP**.
2. Распакуй ZIP в удобное место (например `C:\Projects\discord-ai-bot`).
3. В PowerShell перейди в эту папку:
   ```powershell
   cd C:\Projects\discord-ai-bot
   ```

### 4. Установи зависимости

```powershell
pnpm install
```

Это скачает все библиотеки в папку `node_modules`. Займёт 1-2 минуты.

### 5. Получи ключи

#### Discord Bot Token
1. https://discord.com/developers/applications
2. **New Application** → имя → **Create**.
3. Слева вкладка **Bot** → включи все три **Privileged Gateway Intents** (особенно **Message Content Intent**).
4. **Reset Token** → скопируй (это твой `DISCORD_BOT_TOKEN`).
5. На той же странице слева **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Read Message History`, `Use Slash Commands`, `Embed Links`, `Attach Files`
   - Скопируй сгенерированный URL → открой в браузере → выбери свой сервер → Authorize.

#### Gemini API Key (бесплатно)
1. https://aistudio.google.com/apikey
2. Войди под Google-аккаунтом.
3. **Create API key** → выбрать "Create in new project".
4. Скопируй ключ (это твой `GEMINI_API_KEY`).

### 6. Настрой `.env`

В корне проекта скопируй файл-шаблон:

```powershell
Copy-Item .env.example .env
```

Открой `.env` в Блокноте (или любом редакторе) и вставь свои значения:

```env
DISCORD_BOT_TOKEN=твой_токен_сюда
GEMINI_API_KEY=твой_ключ_сюда

# Опционально — если хочешь чтобы slash-команды появились МГНОВЕННО на одном сервере
# (в Discord включи Developer Mode: User Settings -> Advanced -> Developer Mode,
# потом правый клик по серверу -> Copy Server ID)
DISCORD_TEST_GUILD_ID=
```

> **Никогда не коммить файл `.env` в Git!** Он уже в `.gitignore` — оставь как есть.

### 7. Зарегистрируй slash-команды

Это нужно сделать один раз (и потом каждый раз, когда добавишь новые команды):

```powershell
pnpm register
```

В логах увидишь `Slash commands registered`.

### 8. Запусти бота

```powershell
pnpm start
```

Через 2-5 секунд увидишь:

```
INFO: Bot is online
    tag: "ТвоёИмяБота#1234"
```

Бот в Discord станет **зелёным** (онлайн). Иди в свой сервер и попробуй:
- `/ask вопрос: Какая погода сейчас в Москве?`
- Упомяни бота в сообщении: `@Помощник-AI расскажи новости за сегодня`

Чтобы остановить бота — `Ctrl+C` в PowerShell.

---

## Команды для разработки

| Команда | Что делает |
|---|---|
| `pnpm start` | Запустить бота |
| `pnpm dev` | Запустить с автоперезагрузкой при изменениях (`tsx watch`) |
| `pnpm register` | Зарегистрировать/обновить slash-команды |
| `pnpm typecheck` | Проверить типы TypeScript |
| `pnpm lint` | Запустить ESLint |
| `pnpm format` | Отформатировать код Prettier'ом |
| `pnpm build` | Скомпилировать в `dist/` (для продакшена) |
| `pnpm start:prod` | Запустить скомпилированную версию |

---

## Структура проекта

```
src/
├── commands/          — slash-команды (/ask, /clear, /help)
├── events/            — обработчики событий Discord (ready, interactionCreate, messageCreate)
├── services/
│   ├── ai.ts          — обёртка над Gemini API с Google Search grounding
│   └── memory.ts      — SQLite-хранилище истории диалогов
├── utils/
│   ├── discord.ts     — разбиение длинных сообщений на части ≤2000 символов
│   ├── discord-api.ts — REST-клиент для метаданных приложения
│   └── logger.ts      — pino-логгер
├── config/
│   └── env.ts         — валидация .env через zod
├── scripts/
│   └── register-commands.ts — регистрация slash-команд в Discord
├── bot.ts             — создание Discord-клиента и подключение обработчиков
└── index.ts           — точка входа
```

---

## FAQ / Troubleshooting

**"Бот серый в Discord после `pnpm start`"** — Проверь логи. Скорее всего токен неверный (`Invalid token`), или бот не приглашён на сервер.

**"Slash-команды не появляются"** — Глобальные команды могут регистрироваться до часа. Чтобы появились мгновенно — добавь в `.env`:
```
DISCORD_TEST_GUILD_ID=айди_твоего_сервера
```
и снова запусти `pnpm register`.

**"You exceeded your current quota / 429"** — Превысил бесплатный лимит Gemini. Подожди минуту (лимит по минутам) или до завтра (1500/день). В коде уже стоит модель `gemini-2.5-flash`. Если она не работает — попробуй `gemini-2.5-flash-lite` (быстрее, лимит шире) через `GEMINI_MODEL` в `.env`.

**"better-sqlite3 не собирается на Windows"** — Установи `windows-build-tools` или Visual Studio Build Tools. Альтернатива: использовать готовые prebuilt-бинари (они скачиваются автоматически для большинства версий Node.js).

**"Бот не читает сообщения"** — Включи `MESSAGE CONTENT INTENT` на странице Discord Developer Portal (вкладка Bot).

**"Не хочу чтобы бот реагировал на упоминания, только на slash"** — Закомментируй `registerMessageEvent(client)` в `src/bot.ts`.

---

## Что можно добавить дальше

- Голосовые ответы (запись с микрофона → Whisper → Gemini → TTS).
- Распознавание картинок (Gemini умеет vision, нужно только обработать вложения сообщений).
- Команда `/translate`, `/summarize` для веб-страниц, `/code` для генерации кода.
- Долговременная память через embeddings + pgvector/Qdrant.
- Деплой на Fly.io / Railway / Oracle Cloud для работы 24/7.

---

## Лицензия

MIT — делай что хочешь.
