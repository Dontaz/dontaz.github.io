const NEWS = [
    {
        date: "2027-03-20",
        title: "Обновление русификатора для игры «Wanderstop» (Версия 1.1)",
        description: "Сделать фильную редактуру всего текста, перейти из категории «машинный перевод» в «ручной перевод».",
        categories: ["Планы", "Моды"]
    },
    {
        date: "2027-03-01",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 3.1)",
        description: "Глобальная переработка текста и исправление пунктуации в тексте.",
        categories: ["Планы", "Моды"]
    },
    {
        date: "2027-01-10",
        title: "Обновление русификатора для игры «Wanderstop» (Версия 1.09)",
        description: "Отредактировать все строки диалогов персонажа Nana и с Nana; Отредактировать все строки диалогов персонажа Zenith и с Zenith.",
        categories: ["Планы", "Моды"]
    },
    {
        date: "2026-12-25",
        title: "Новая страница на сайте: Tier List (Movies)",
        description: 'Сделать Tier List — список просмотренных мною фильмов, мультфильмов, сериалов с моими оценками <a href="https://dontaz.com/top/movies" target="_blank" rel="noopener">dontaz.com/top/movies</a> (<a href="https://dontaz.com/top" target="_blank" rel="noopener">dontaz.com/top</a>)',
        categories: ["Планы", "Сайты"]
    },
    {
        date: "2026-11-01",
        title: "Обновление русификатора для игры «Wanderstop» (Версия 1.08)",
        description: "Отредактировать все строки диалогов персонажа Ren и с Ren; Отредактировать все строки диалогов персонажа Rando и с Rando.",
        categories: ["Планы", "Моды"]
    },
    {
        date: "2026-10-19",
        title: "Новая страница на сайте: Новости моих проектов",
        description: '<a href="https://dontaz.com/news" target="_blank" rel="noopener">dontaz.com/news</a> / <a href="https://dontaz.github.io/news" target="_blank" rel="noopener">dontaz.github.io/news</a>',
        categories: ["Сайты"]
    },
    {
        date: "2026-10-18",
        title: "Новый инструмент: Шпаргалка с Alt кодами (Alt Codes Cheat Sheet)",
        description: '<a href="https://dontaz.com/alt-codes" target="_blank" rel="noopener">dontaz.com/alt-codes</a> / <a href="https://dontaz.github.io/alt-codes" target="_blank" rel="noopener">dontaz.github.io/alt-codes</a>',
        categories: ["Сайты", "Инструменты"]
    },
    {
        date: "2026-10-10",
        title: "Новая страница на сайте: Tier List (Games)",
        description: 'Сделал Tier List — список пройденных мною игр с моими оценками <a href="https://dontaz.com/top/games" target="_blank" rel="noopener">dontaz.com/top/games</a>',
        categories: ["Сайты"]
    },
    {
        date: "2026-10-03",
        title: "Новый инструмент: Читалка книг (Book Reader)",
        description: '<a href="https://dontaz.com/reader" target="_blank" rel="noopener">dontaz.com/reader</a> / <a href="https://dontaz.github.io/reader" target="_blank" rel="noopener">dontaz.github.io/reader</a>',
        categories: ["Сайты", "Инструменты"]
    },
    {
        date: "2026-09-27",
        title: "Портирование русификатора для игры «Wanderstop» на Switch",
        categories: ["Моды"]
    },
    {
        date: "2026-09-27",
        title: "Новый инструмент: Генератор QR кодов (QR Code Generator)",
        description: '<a href="https://dontaz.com/qr-generator" target="_blank" rel="noopener">dontaz.com/qr-generator</a> / <a href="https://dontaz.github.io/qr-generator" target="_blank" rel="noopener">dontaz.github.io/qr-generator</a>',
        categories: ["Сайты", "Инструменты"]
    },
    {
        date: "2026-09-26",
        title: "Отдельные страницы для модов",
        description: 'У каждого моего русификатора теперь есть отдельная страница на сайте (<a href="https://dontaz.com" target="_blank" rel="noopener">dontaz.com</a>) и в карточках модов на персональной странице (<a href="https://dontaz.com/personal-page" target="_blank" rel="noopener">dontaz.com/personal-page</a> / <a href="https://dontaz.github.io/personal-page" target="_blank" rel="noopener">dontaz.github.io/personal-page</a>)',
        categories: ["Моды", "Сайты"]
    },
    {
        date: "2026-09-23",
        title: "Удалён goatcounter (счётчик посетителей) со всех страниц",
        categories: ["Сайты"]
    },
    {
        date: "2026-09-22",
        title: "Новый сайт и домен",
        description: '<a href="https://dontaz.com" target="_blank" rel="noopener">dontaz.com</a>',
        categories: ["Сайты"]
    },
    {
        date: "2026-09-22",
        title: "Новый инструмент: Randomizer",
        description: '<a href="https://dontaz.com/randomizer" target="_blank" rel="noopener">dontaz.com/randomizer</a> / <a href="https://dontaz.github.io/randomizer" target="_blank" rel="noopener">dontaz.github.io/randomizer</a>',
        categories: ["Сайты", "Инструменты"]
    },
    {
        date: "2026-09-12",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 3.0)",
        description: "Переведены текстуры и незначительные улучшения текста.",
        categories: ["Моды"]
    },
    {
        date: "2026-09-12",
        title: "Новый русификатор для демо версии игры «Catfall» (Версия 1.0)",
        categories: ["Моды"]
    },
    {
        date: "2026-09-05",
        title: "Обновление сайта «База знаний» (Knowledge Base)",
        description: "Новый логотип, фикс якоря, фикс прокрутки при открытой карточке.",
        categories: ["Сайты"]
    },
    {
        date: "2026-08-19",
        title: "Обновление русификатора для «Tukoni: Forest Keepers» (Версия 1.2)",
        categories: ["Моды"]
    },
    {
        date: "2026-08-18",
        title: "Новый русификатор для игры «Tukoni: Forest Keepers» (Версия 1.0)",
        categories: ["Моды"]
    },
    {
        date: "2026-08-18",
        title: "Обновление русификатора для «Tukoni: Forest Keepers» (Версия 1.1)",
        categories: ["Моды"]
    },
    {
        date: "2026-06-12",
        title: "Обновление русификатора для игры «Wanderstop» (Версия 1.07)",
        description: "Отредактированы все строки диалогов персонажа CloudKid и с CloudKid; Отредактированы все строки диалогов персонажа Monster и с Monster; Небольшие исправления диалогов у персонажа Gerald; Добавлена возможность ставить русификатор вручную через архив без установщика; Исправлен шрифт для дислексиков, теперь он работает, если его включить в настройках игры; Обновлён код установщика до новой версии (немного другая структура кода, обновлён дизайн); Установщик теперь имеет цифровую подпись (Digital Signature) для подтверждения подлинности и целостности файлов.",
        categories: ["Моды"]
    },
    {
        date: "2026-05-26",
        title: "Обновление Userscript — «SteamDB & PCGamingWiki for Steam» (Версия 1.6)",
        description: 'Добавлена новая возможность — HowLongToBeat. Скрипт переименован в «SteamDB & PCGamingWiki & HowLongToBeat for Steam». Фикс отсутствия названия и скриншотов region locked игры. <a href="https://github.com/Dontaz/dontaz-user_scripts#steamdb--pcgamingwiki--howlongtobeat-for-steam" target="_blank" rel="noopener">github.com</a>',
        categories: ["Инструменты", "Userscript"]
    },
    {
        date: "2026-05-13",
        title: "Обновление дизайна сайта «База знаний» (Knowledge Base)",
        categories: ["Сайты"]
    },
    {
        date: "2026-04-29",
        title: "Обновление дизайна сайта «Персональная страница» (Personal Page)",
        categories: ["Сайты"]
    },
    {
        date: "2026-03-06",
        title: "Обновление Userscript — «SteamDB & PCGamingWiki for Steam» (Версия 1.4)",
        description: '<a href="https://github.com/Dontaz/dontaz-user_scripts#steamdb--pcgamingwiki--howlongtobeat-for-steam" target="_blank" rel="noopener">github.com</a>',
        categories: ["Инструменты", "Userscript"]
    },
    {
        date: "2026-01-28",
        title: "Обновление русификатора для игры «Wanderstop» (Версия 1.06)",
        description: "Отредактированы все строки диалогов персонажа DemonHunter и с DemonHunter; Отредактированы все строки диалогов персонажа Gerald и с Gerald; Изменено название одного растения; Улучшен перевод у Boro; Улучшен перевод в начальной заставке игры.",
        categories: ["Моды"]
    },
    {
        date: "2026-01-21",
        title: "Обновление русификатора для игры «Wanderstop» (Версия 1.05)",
        description: "Отредактированы все строки диалогов персонажа Birdperson (Bird) и с Birdperson (Bird); Улучшен перевод интерфейса во многих местах; Отредактированы дополнительные части интерфейса; Отредактированы дополнительные монологи главной героини; Отредактированы все строки диалогов персонажа Jerry (Business) и с Jerry (Business); Отредактированы все строки диалогов персонажа Larry (Business) и с Larry (Business); Отредактированы все строки диалогов персонажа Terry (Business) и с Terry (Business); Отредактированы все строки диалогов персонажа Harry (Business) и с Harry (Business); Отредактированы все строки TeaLoop.",
        categories: ["Моды"]
    },
    {
        date: "2026-01-20",
        title: "Новый инструмент: Конструктор графиков (Simple Chart Builder)",
        description: '<a href="https://dontaz.com/simple-chart-builder" target="_blank" rel="noopener">dontaz.com/simple-chart-builder</a> / <a href="https://dontaz.github.io/simple-chart-builder" target="_blank" rel="noopener">dontaz.github.io/simple-chart-builder</a>',
        categories: ["Сайты", "Инструменты"]
    },
    {
        date: "2026-01-20",
        title: "Добавление на сайт GoatCounter",
        description: "Добавление счётчика посетителей на сайт — GoatCounter, не собирает никаких персональных данных.",
        categories: ["Сайты"]
    },
    {
        date: "2026-01-16",
        title: "Обновление русификатора для игры «Wanderstop» (Версия 1.04)",
        description: "Отредактированы все строки диалогов персонажа Боро и с Боро; Улучшен перевод интерфейса в некоторых местах; Изменено имя одного из персонажей; Заменён шрифт, чтобы текст лучше вмещался в проблемных местах игры.",
        categories: ["Моды"]
    },
    {
        date: "2025-12-26",
        title: "Обновление русификатора для игры «Wanderstop» (Версия 1.03.8)",
        description: "Отредактировано 80% строк диалогов персонажа Боро и с Боро; Улучшен перевод интерфейса в некоторых местах.",
        categories: ["Моды"]
    },
    {
        date: "2025-12-20",
        title: "Новый Userscript — «SteamDB & PCGamingWiki for Steam»",
        description: '<a href="https://github.com/Dontaz/dontaz-user_scripts#steamdb--pcgamingwiki--howlongtobeat-for-steam" target="_blank" rel="noopener">github.com</a>',
        categories: ["Инструменты", "Userscript"]
    },
    {
        date: "2025-12-13",
        title: "Новый Userscript — «Kinopoisk & IMDb Search + Cross-Site Links»",
        description: '<a href="https://github.com/Dontaz/dontaz-user_scripts#kinopoisk--imdb-search--cross-site-links" target="_blank" rel="noopener">github.com</a>',
        categories: ["Инструменты", "Userscript"]
    },
    {
        date: "2025-12-13",
        title: "Обновление русификатора для игры «Wanderstop» (Версия 1.03)",
        description: "Отредактированы все строки интерфейса, внутренних монологов, названий растений, текстов книг и писем; Добавлен кириллический шрифт для дислексиков (включается в настройках игры).",
        categories: ["Моды"]
    },
    {
        date: "2025-12-10",
        title: "Обновил дизайн сайта «Персональная страница» (Personal Page)",
        categories: ["Сайты"]
    },
    {
        date: "2025-12-03",
        title: "Обновление русификатора для игры «Wanderstop» (Версия 1.02)",
        description: "Отредактировано 70% строк от интерфейса, внутренних монологов, текста книг, названий растений и имён. Диалоги почти не задеты.",
        categories: ["Моды"]
    },
    {
        date: "2025-12-03",
        title: "Обновление русификатора для игры «Wanderstop» (Версия 1.01)",
        description: "Переведён весь интерфейс; Переведены некоторые имена; Небольшая частичная редактура; Подобраны шрифты.",
        categories: ["Моды"]
    },
    {
        date: "2025-11-30",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 2.9)",
        categories: ["Моды"]
    },
    {
        date: "2025-11-25",
        title: "Запуск персональной страницы (Personal page)",
        description: 'Новый сайт по ссылке <a href="https://dontaz.github.io/personal-page" target="_blank" rel="noopener">dontaz.github.io/personal-page</a> с личными проектами',
        categories: ["Сайты"]
    },
    {
        date: "2025-10-29",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 2.8)",
        categories: ["Моды"]
    },
    {
        date: "2025-08-30",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 2.7)",
        categories: ["Моды"]
    },
    {
        date: "2025-08-19",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 2.6)",
        categories: ["Моды"]
    },
    {
        date: "2025-08-01",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 2.5)",
        categories: ["Моды"]
    },
    {
        date: "2025-07-13",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 2.4)",
        categories: ["Моды"]
    },
    {
        date: "2025-07-03",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 2.3)",
        categories: ["Моды"]
    },
    {
        date: "2025-06-25",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 2.2)",
        categories: ["Моды"]
    },
    {
        date: "2025-06-20",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 2.1)",
        categories: ["Моды"]
    },
    {
        date: "2025-06-14",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 2.0)",
        categories: ["Моды"]
    },
    {
        date: "2025-06-13",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 1.9.1)",
        categories: ["Моды"]
    },
    {
        date: "2025-06-12",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 1.9)",
        categories: ["Моды"]
    },
    {
        date: "2025-06-09",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 1.8)",
        categories: ["Моды"]
    },
    {
        date: "2025-06-06",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 1.7)",
        categories: ["Моды"]
    },
    {
        date: "2025-05-25",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 1.6)",
        categories: ["Моды"]
    },
    {
        date: "2025-05-19",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 1.5)",
        categories: ["Моды"]
    },
    {
        date: "2025-05-17",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 1.4)",
        categories: ["Моды"]
    },
    {
        date: "2025-05-16",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 1.3)",
        categories: ["Моды"]
    },
    {
        date: "2025-05-15",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 1.2)",
        categories: ["Моды"]
    },
    {
        date: "2025-05-14",
        title: "Обновление русификатора для игры «The Midnight Walk» (Версия 1.1)",
        categories: ["Моды"]
    },
    {
        date: "2025-05-12",
        title: "Новый русификатор для игры «The Midnight Walk» (Версия 1.0)",
        categories: ["Моды"]
    },
    {
        date: "2025-05-10",
        title: "Новый русификатор для игры «Wanderstop» (Версия 1.0)",
        categories: ["Моды"]
    },
    {
        date: "2024-11-13",
        title: "Запуск сайта «База знаний» (Knowledge Base)",
        description: 'Первая Версия базы знаний по ссылке <a href="https://dontaz.github.io/" target="_blank" rel="noopener">dontaz.github.io</a>',
        categories: ["Сайты", "Инструменты"],
    }
];
