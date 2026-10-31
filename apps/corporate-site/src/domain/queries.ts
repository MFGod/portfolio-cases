import { type CaseStudy, type Content } from './content';
import type { CaseFilter } from './route';

export const casesOfSolution = (content: Content, slug: string) =>
  content.cases.filter((item) => item.solution === slug);

export const casesOfMember = (content: Content, slug: string) =>
  content.cases.filter((item) => item.team.includes(slug));

export const membersOf = (content: Content, slugs: string[]) =>
  content.team.filter((member) => slugs.includes(member.slug));

export const buildersOf = (content: Content, solution: string) =>
  membersOf(content, [...new Set(casesOfSolution(content, solution).flatMap((item) => item.team))]);

export const filterCases = (cases: CaseStudy[], filter: CaseFilter) =>
  cases.filter(
    (item) =>
      (!filter.industry || item.industry === filter.industry) &&
      (!filter.solution || item.solution === filter.solution),
  );

export const stacksOf = (content: Content) =>
  [...new Set(content.team.flatMap((member) => member.stack))].sort((a, b) => a.localeCompare(b));
