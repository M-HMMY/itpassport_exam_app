import type { TextbookSection } from '../../types';
import { intro } from './intro';
import { strategy } from './strategy';
import { strategyBiz } from './strategy-biz';
import { management } from './management';
import { techBasic } from './tech-basic';
import { techComp } from './tech-comp';
import { techMediaDb } from './tech-media-db';
import { techNw } from './tech-nw';
import { techSec } from './tech-sec';

/**
 * 教本の全セクション。CATEGORIES の並び順に対応させている。
 *
 * ファイルは「章ごと」ではなく「まとめて書く単位ごと」に分けてある。
 * 複数人（エージェント）で並行して書くとき、1 ファイル 1 担当にすると衝突しないため。
 */
export const SECTIONS: TextbookSection[] = [
  ...intro,
  ...strategy,
  ...strategyBiz,
  ...management,
  ...techBasic,
  ...techComp,
  ...techMediaDb,
  ...techNw,
  ...techSec,
];

export const sectionById = (id: string): TextbookSection | undefined => SECTIONS.find((s) => s.id === id);

export const sectionsOfCategory = (categoryId: string): TextbookSection[] =>
  SECTIONS.filter((s) => s.categoryId === categoryId);

export const totalMinutes = SECTIONS.reduce((sum, s) => sum + s.minutes, 0);
