import type { Question } from '../../types';
import { strategyQuestions } from './strategy';
import { managementQuestions } from './management';
import { technologyQuestions } from './technology';

export const QUESTIONS: Question[] = [
  ...strategyQuestions,
  ...managementQuestions,
  ...technologyQuestions,
];

export const questionById = (id: string): Question | undefined => QUESTIONS.find((q) => q.id === id);

export const questionsOfCategory = (categoryId: string): Question[] =>
  QUESTIONS.filter((q) => q.categoryId === categoryId);

export const questionsOfSection = (sectionId: string): Question[] =>
  QUESTIONS.filter((q) => q.sectionId === sectionId);
