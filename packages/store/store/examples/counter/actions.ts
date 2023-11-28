import { defineAction } from '@tethys/store';

export const updateCounter = defineAction<string, number>('updateCounter');
