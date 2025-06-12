import { GrammarTestModel } from "../interfaces/models/GrammarTestModel";

export const GRAMMAR_TESTS: GrammarTestModel[] = [
    {
      id: 1,
      title: "Verb-Preposition Connections",
      mask: null,
      last_review_date: new Date("2024-12-15"),
      review_count: 5,
      guid: "a8b7c6d5-e4f3-42d1-91c0-8d7e6f5a4b3c",
      questions: [
        {
          id: 101,
          sentence: "It is impossible to agree {{answer}} this one hundred percent by definition.",
          translation: "Погодитися з цим на сто відсотків неможливо за визначенням.",
          answers: ["to", "with", "at", "for"],
          correctAnswer: "with",
          testId: 1
        },
        {
          id: 102,
          sentence: "But it was difficult for me to argue {{answer}} adults.",
          translation: "Але мені було важко сперечатися з дорослими.",
          answers: ["for", "with", "to", "at"],
          correctAnswer: "with",
          testId: 1
        },
        {
          id: 103,
          sentence: "I don't have anything in common {{answer}} my sister.",
          translation: "У мене не так багато спільного з моєю сестрою.",
          answers: ["at", "to", "with", "for"],
          correctAnswer: "with",
          testId: 1
        },
        {
          id: 104,
          sentence: "They compare themselves {{answer}} each other too often.",
          translation: "Вони занадто часто порівнюють себе один з одним.",
          answers: ["for", "at", "to", "with"],
          correctAnswer: "with",
          testId: 1
        },
        {
          id: 105,
          sentence: "We spend time {{answer}} our family during the holidays.",
          translation: "Під час свят ми проводимо час із родиною.",
          answers: ["to", "for", "with", "at"],
          correctAnswer: "with",
          testId: 1
        }
      ]
    },
    {
      id: 2,
      title: "Common Phrasal Verbs",
      mask: "phrasal",
      last_review_date: new Date("2025-01-10"),
      review_count: 3,
      guid: "b9c8d7e6-f5g4-43e2-a1b0-9e8d7f6c5b4a",
      questions: [
        {
          id: 201,
          sentence: "Could you please turn {{answer}} the volume? It's too loud.",
          translation: "Чи не могли б ви зменшити гучність? Вона надто висока.",
          answers: ["off", "down", "over", "up"],
          correctAnswer: "down",
          testId: 2
        },
        {
          id: 202,
          sentence: "She decided to give {{answer}} smoking for health reasons.",
          translation: "Вона вирішила кинути курити за станом здоров'я.",
          answers: ["up", "in", "away", "out"],
          correctAnswer: "up",
          testId: 2
        },
        {
          id: 203,
          sentence: "Let's put {{answer}} the meeting until next week.",
          translation: "Давайте відкладемо зустріч до наступного тижня.",
          answers: ["off", "up", "down", "away"],
          correctAnswer: "off",
          testId: 2
        },
        {
          id: 204,
          sentence: "I need to look {{answer}} my little brother this weekend.",
          translation: "Мені потрібно доглядати за молодшим братом на цих вихідних.",
          answers: ["for", "after", "up", "into"],
          correctAnswer: "after",
          testId: 2
        },
        {
          id: 205,
          sentence: "They're planning to set {{answer}} a new business next month.",
          translation: "Вони планують створити новий бізнес наступного місяця.",
          answers: ["up", "out", "in", "off"],
          correctAnswer: "up",
          testId: 2
        }
      ]
    },
    {
      id: 3,
      title: "Conditional Clauses",
      mask: "conditionals",
      last_review_date: new Date("2025-02-20"),
      review_count: 7,
      guid: "c1d2e3f4-g5h6-44f3-b1c2-0d9e8f7g6h5",
      questions: [
        {
          id: 301,
          sentence: "If I {{answer}} rich, I would travel around the world.",
          translation: "Якби я був багатим, я б подорожував по всьому світу.",
          answers: ["am", "was", "were", "be"],
          correctAnswer: "were",
          testId: 3
        },
        {
          id: 302,
          sentence: "If she {{answer}} harder, she would have passed the exam.",
          translation: "Якби вона старанніше працювала, вона б склала іспит.",
          answers: ["studies", "studied", "had studied", "would study"],
          correctAnswer: "had studied",
          testId: 3
        },
        {
          id: 303,
          sentence: "I'll call you if I {{answer}} any news.",
          translation: "Я зателефоную тобі, якщо дізнаюся якісь новини.",
          answers: ["will have", "have", "had", "would have"],
          correctAnswer: "have",
          testId: 3
        },
        {
          id: 304,
          sentence: "What would you do if you {{answer}} a million dollars?",
          translation: "Що б ви зробили, якби у вас був мільйон доларів?",
          answers: ["win", "won", "had won", "would win"],
          correctAnswer: "won",
          testId: 3
        },
        {
          id: 305,
          sentence: "If the weather {{answer}} nice tomorrow, we'll go to the beach.",
          translation: "Якщо завтра буде гарна погода, ми підемо на пляж.",
          answers: ["is", "will be", "would be", "were"],
          correctAnswer: "is",
          testId: 3
        }
      ]
    }
  ];
  
  export const GRAMMAR_TESTS_WITHOUT_QUESTIONS = GRAMMAR_TESTS.map(({ questions, ...test }) => test);