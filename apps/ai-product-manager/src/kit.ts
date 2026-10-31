import { createCase } from '@cases/demo-kit';
import manifest from '../case.json';
import { createWorkspace } from './runtime';

export const kit = createCase(manifest);
export const workspace = createWorkspace(kit);
