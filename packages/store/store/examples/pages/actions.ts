import { defineAction, defineActions, payload } from '@tethys/store';

export const updateTitle = defineAction<string, { title: string }>('updateTitle');

export const updateContent = defineAction<string, { content: string }>('updateContent');

export const groupActions = defineActions('page', {
    updateTitle: payload<string, { title: string }>(),
    updateContent: payload<string, { content: string }>()
});
