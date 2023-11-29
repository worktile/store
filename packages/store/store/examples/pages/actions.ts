import { defineAction } from '@tethys/store';

export const updateTitle = defineAction<string, { title: string }>('updateTitle');

export const updateContent = defineAction<string, { content: string }>('updateContent');
