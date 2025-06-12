import { useEffect, useState } from "react";

import { GrammarTopicModel, LanguageCode } from "../interfaces/models/GrammarTopicModel";
import { GRAMMAR_TOPICS } from "../mock/mockGrammarTopics";
import { GrammarTopicService } from "../services/GrammarTopicService";

/**
 * Custom hook для загрузки и управления грамматическими темами и переводами
 */
export const useGrammarTopic = (topicId: string | number) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState<GrammarTopicModel | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<LanguageCode[]>(
    [],
  );
  const [translations, setTranslations] = useState<GrammarTopicModel[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Загрузка темы и доступных переводов
  useEffect(() => {
    const fetchTopicData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Получаем основную тему
        // const mainTopic = await GrammarTopicService.getById(topicId);
        const mainTopic = GRAMMAR_TOPICS.find(
          (topic) => topic.id === Number(topicId),
        );

        if (!mainTopic) {
          setError(`Topic not found: ${topicId}`);
          setLoading(false);
          return;
        }

        setCurrentLanguage(mainTopic.language as LanguageCode);

        // Получаем все переводы для этой темы
        let allTranslations: GrammarTopicModel[] = [];

        if (mainTopic.topicId === null) {
          // Это основная тема, получаем все её переводы
          // const translations = await GrammarTopicService.getTopicsByTopicId(
          //   mainTopic.id ?? null,
          // );
          const translations = GRAMMAR_TOPICS.filter(
            (topic) => topic.topicId === mainTopic.id,
          );
          allTranslations = [mainTopic, ...translations];
        } else {
          // Это перевод, получаем основную тему и все переводы
          if (mainTopic.topicId) {
            // const mainParentTopic = await GrammarTopicService.getById(
            //   mainTopic.topicId,
            // );
            const mainParentTopic = GRAMMAR_TOPICS.find(
              (topic) => topic.id === mainTopic.topicId,
            );
            if (mainParentTopic) {
              // const otherTranslations =
              //   await GrammarTopicService.getTopicsByTopicId(
              //     mainParentTopic.id ?? null,
              //   );
              const otherTranslations = GRAMMAR_TOPICS.filter(
                (topic) => topic.topicId === mainParentTopic.id,
              );
              allTranslations = [mainParentTopic, ...otherTranslations];
            } else {
              allTranslations = [mainTopic];
            }
          } else {
            allTranslations = [mainTopic];
          }
        }

        // Определяем доступные языки
        const languages = Array.from(
          new Set(allTranslations.map((t) => t.language)),
        ) as LanguageCode[];
        setAvailableLanguages(languages);

        // Сохраняем все переводы
        setTranslations(allTranslations);

        // Выбираем тему на текущем языке или первую доступную
        const topicForCurrentLanguage = allTranslations.find(
          (t) => t.language === currentLanguage,
        );
        if (topicForCurrentLanguage) {
          setTopic(topicForCurrentLanguage);
        } else if (allTranslations.length > 0) {
          setTopic(allTranslations[0]);
          setCurrentLanguage(allTranslations[0].language as LanguageCode);
        }
      } catch (error) {
        console.error("Error fetching topic data:", error);
        setError("Failed to load topic data");
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      fetchTopicData();
    }
  }, [topicId]);

  // Обработчик переключения языка
  const switchLanguage = (language: LanguageCode) => {
    // Находим тему на выбранном языке
    const topicForLanguage = translations.find((t) => t.language === language);
    if (topicForLanguage) {
      setTopic(topicForLanguage);
      setCurrentLanguage(language);
    }
  };

  return {
    currentLanguage,
    topic,
    loading,
    error,
    availableLanguages,
    switchLanguage,
  };
};
