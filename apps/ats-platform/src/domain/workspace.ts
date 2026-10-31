import { kit } from '../kit';
import type { Vacancy, Workspace } from './model';
import { buildReportCsv } from './report';
import { createWorkspaceRepository, withWorkspaceLock } from './repository';

export * from './model';
export * from './report';
export { makeSeed } from './seed';
export { WorkspaceError, workspaceKey } from './repository';

const repository = createWorkspaceRepository(kit.store, withWorkspaceLock);

export const loadWorkspace = () => kit.demo.request(repository.load);
export const readRole = repository.readRole;
export const readRoleError = repository.readRoleError;
export const writeRole = repository.writeRole;
export const saveVacancy = (workspace: Workspace, vacancy: Vacancy) =>
  kit.demo.request(() => repository.saveVacancy(workspace, vacancy));
export const moveCandidate = (workspace: Workspace, id: string, stage: number) =>
  kit.demo.request(() => repository.moveCandidate(workspace, id, stage));
export const restoreWorkspace = () => kit.demo.request(repository.restoreWorkspace);

export const downloadReport = (
  vacancyTitle: string,
  candidates: Parameters<typeof buildReportCsv>[1],
) =>
  kit.demo.request(() => {
    const csv = buildReportCsv(vacancyTitle, candidates);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'hiring-funnel.csv';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
