export interface LessonExplanations {
  start: string;
  compareGreater: string;
  compareLess: string;
  swap: string;
  markSorted: string;
  done: string;
}

export interface LessonConfig {
  slug: string;
  title: string;
  entryFunctionName: string;
  defaultCode: string;
  visualTheme: string;
  explanations: LessonExplanations;
}