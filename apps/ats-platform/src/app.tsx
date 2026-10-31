import { useEffect, useRef, useState } from 'react';
import {
  moveCandidate,
  saveVacancy,
  stages,
  type Vacancy,
  type Workspace,
} from './domain/workspace';
import { CandidateSheet } from './features/pipeline/candidate-sheet';
import { PipelineBoard } from './features/pipeline/pipeline-board';
import { ReportPage } from './features/report/report-page';
import { VacancyEditor } from './features/vacancies/vacancy-editor';
import { VacancyList } from './features/vacancies/vacancy-list';
import { ActionError, Empty, SkeletonRows } from './ui/feedback';
import { Sidebar, type RouteId } from './ui/sidebar';
import { Toast } from './ui/toast';
import { VacancyIndex } from './ui/vacancy-index';
import { WorkspaceRecovery } from './ui/workspace-recovery';
import { useViewState } from './ui/use-view-state';
import { useWorkspace } from './use-workspace';

const titles: Record<RouteId, string> = {
  vacancies: 'Вакансии',
  pipeline: 'Кандидаты',
  report: 'Отчёт',
};
function readRoute(): RouteId {
  const route = location.hash.slice(2).split('?')[0];
  return route === 'pipeline' || route === 'report' ? route : 'vacancies';
}

export function App() {
  const [route, setRoute] = useState(readRoute);
  const [editor, setEditor] = useState<Vacancy | 'new' | null>(null);
  const editorBase = useRef<Workspace | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);
  const preferences = useViewState();
  const { view, change, role } = preferences;
  const state = useWorkspace();
  const { workspace, setWorkspace, pending, run, setActionError } = state;
  const selected = workspace.vacancies.some((item) => item.id === view.selected)
    ? view.selected
    : (workspace.vacancies[0]?.id ?? '');
  const reportFilter =
    view.reportFilter === 'all' || workspace.vacancies.some((item) => item.id === view.reportFilter)
      ? view.reportFilter
      : 'all';

  useEffect(() => {
    const sync = () => {
      setRoute(readRoute());
      setActionError('');
    };
    if (location.hash.slice(2).split('?')[0] !== readRoute()) location.hash = '#/vacancies';
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [setActionError]);

  const closeModal = () => {
    if (state.isPending()) return;
    setEditor(null);
    setPersonId(null);
    setActionError('');
  };
  const openEditor = (vacancy: Vacancy | 'new') => {
    if (state.isPending()) return;
    editorBase.current = workspace;
    setActionError('');
    setEditor(vacancy);
  };
  const move = (id: string, stage: number) => {
    const name = workspace.candidates.find((item) => item.id === id)?.name ?? 'Кандидат';
    void run(async () => {
      setWorkspace(await moveCandidate(workspace, id, stage));
      if (!personId)
        requestAnimationFrame(() => {
          const target =
            document.getElementById(`candidate-${id}`)?.querySelector<HTMLElement>('button') ??
            document.getElementById('main-content');
          target?.focus();
        });
    }, `${name}: ${stages[stage]}`);
  };
  const person = workspace.candidates.find((item) => item.id === personId);
  const managerNote =
    role !== 'manager'
      ? ''
      : route === 'vacancies'
        ? 'Руководитель может просматривать вакансии. Изменения вносит рекрутер.'
        : route === 'pipeline'
          ? 'Руководитель может переводить между интервью, оффером и выходом.'
          : '';

  const page = () => {
    if (state.loading) return <SkeletonRows />;
    if (state.loadError)
      return (
        <Empty title={state.loadError}>
          <button
            className="button secondary"
            disabled={pending}
            onClick={() => void state.reload()}
          >
            Повторить загрузку
          </button>
        </Empty>
      );
    if (route === 'pipeline')
      return (
        <PipelineBoard
          workspace={workspace}
          role={role}
          selected={selected}
          pending={pending}
          query={view.pipelineQuery}
          stageFilter={view.pipelineStage}
          onSelect={(id) => change({ selected: id })}
          onQueryChange={(pipelineQuery) => change({ pipelineQuery })}
          onStageFilterChange={(pipelineStage) => change({ pipelineStage })}
          onOpenCandidate={(id) => {
            if (state.isPending()) return;
            setActionError('');
            setPersonId(id);
          }}
          onMove={move}
        />
      );
    if (route === 'report')
      return (
        <ReportPage
          workspace={workspace}
          pending={pending}
          filter={reportFilter}
          error={state.actionKind === 'report' ? state.actionError : ''}
          onFilterChange={(reportFilter) => change({ reportFilter })}
          onDownload={(download) => void run(download, 'CSV скачан', 'report')}
        />
      );
    return (
      <VacancyList
        workspace={workspace}
        role={role}
        pending={pending}
        query={view.vacancyQuery}
        status={view.vacancyStatus}
        onQueryChange={(vacancyQuery) => change({ vacancyQuery })}
        onStatusChange={(vacancyStatus) => change({ vacancyStatus })}
        onOpen={openEditor}
        onCreate={() => openEditor('new')}
        onOpenBoard={(id) => {
          change({ selected: id });
          location.hash = '#/pipeline';
        }}
      />
    );
  };

  return (
    <div className="workspace">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        К содержимому
      </a>
      <Sidebar route={route} role={role} pending={pending} onRoleChange={preferences.changeRole} />
      <div className={route === 'pipeline' ? 'app-body with-index' : 'app-body'}>
        {route === 'pipeline' && !state.loadError && !state.loading && (
          <VacancyIndex
            workspace={workspace}
            selected={selected}
            pending={pending}
            onSelect={(id) => change({ selected: id })}
          />
        )}
        <main id="main-content" tabIndex={-1} className={`page-${route}`}>
          <header className="content-head">
            <h1>{titles[route]}</h1>
            {route === 'pipeline' && !state.loading && !state.loadError && (
              <span className="record-count">
                {workspace.candidates.filter((item) => item.vacancyId === selected).length}
              </span>
            )}
          </header>
          {preferences.error && (
            <p className="action-error" role="alert">
              {preferences.error}
            </p>
          )}
          {managerNote && <p className="note">{managerNote}</p>}
          {!editor &&
            !person &&
            (state.actionKind !== 'report' ||
              route !== 'report' ||
              state.loadError ||
              state.loading) && (
              <ActionError message={state.actionError} retry={state.retry} pending={pending} />
            )}
          {state.recoveryRequired && (
            <WorkspaceRecovery pending={pending} onRecover={() => void state.recover()} />
          )}
          {page()}
        </main>
      </div>
      <Toast message={state.notice} onDismiss={() => state.setNotice('')} />
      {editor && (
        <VacancyEditor
          vacancy={editor === 'new' ? null : editor}
          readOnly={role !== 'recruiter'}
          pending={pending}
          error={state.actionKind === 'workspace' ? state.actionError : ''}
          onClose={closeModal}
          onSave={(vacancy) =>
            void run(
              async () => {
                setWorkspace(await saveVacancy(editorBase.current ?? workspace, vacancy));
                setEditor(null);
              },
              editor === 'new' ? 'Вакансия создана' : 'Вакансия сохранена',
            )
          }
        />
      )}
      {person && (
        <CandidateSheet
          candidate={person}
          vacancy={workspace.vacancies.find((item) => item.id === person.vacancyId)}
          role={role}
          pending={pending}
          error={state.actionKind === 'workspace' ? state.actionError : ''}
          onClose={closeModal}
          onMove={move}
        />
      )}
    </div>
  );
}
