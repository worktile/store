import { Injectable } from '@angular/core';
import { Action, Store } from '@tethys/store';
import { SafeAny } from '@tethys/store/inner-types';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
    _id: string;
    name: string;
}

export interface DetailReferences {
    users?: User[];
    states?: { _id: string; [key: string]: SafeAny }[];
}

interface DetailState {
    _id: string;
    [key: string]: SafeAny;
}

@Injectable({ providedIn: 'root' })
export class DetailStore extends Store<DetailState, DetailReferences> {
    constructor() {
        super({});
    }

    @Action()
    fetchDetail() {
        const data = {
            value: {
                _id: '63c8b74c21cccf986012a131',
                title: '如何实现骨架屏',
                maintenance_uid: 'user2',
                test_library_id: '5d68c672e514ac452594ba44',
                suite_ids: ['60ecf0c9fe7a7a8d8c2c8ecb', '6368ccf675ec249953b63020'],
                state_id: 'no-start-state-id',
                properties: {
                    canyuren: ['user1', 'user2']
                },
                attachments: [
                    {
                        _id: '63f1f80adce37a33de785f0a',
                        latest_version: 1
                    },
                    {
                        _id: '63f1f824dce37a33de785f0d',
                        latest_version: 1
                    }
                ]
            },
            references: {
                library: [
                    {
                        name: '提升用户体验',
                        _id: '5d68c672e514ac452594ba44'
                    }
                ],
                suites: [
                    {
                        _id: '60ecf0c9fe7a7a8d8c2c8ecb',
                        name: '其他模块'
                    },
                    {
                        _id: '6368ccf675ec249953b63020',
                        name: '模块01'
                    }
                ],
                states: [
                    {
                        _id: 'no-start-state-id',
                        name: '未开始'
                    }
                ],
                users: [
                    { _id: 'user1', name: 'why520crazy' },
                    { _id: 'user2', name: 'peter' }
                ],
                attachment_infos: [
                    {
                        _id: '63f1f80adce37a33de785f0a',
                        title: 'Untitled'
                    },
                    {
                        _id: '63f1f824dce37a33de785f0d',
                        title: '未命名文件-导出 (1).png'
                    }
                ],
                properties: [
                    {
                        key: 'canyuren',
                        name: '多个成员',
                        value_path: 'properties.canyuren',
                        lookup: 'users'
                    },
                    {
                        key: 'test_library_id',
                        name: '测试库',
                        value_path: 'test_library_id',
                        lookup: 'library'
                    },
                    {
                        key: 'suite_ids',
                        name: '模块',
                        value_path: 'suite_ids',
                        lookup: 'suites'
                    },
                    {
                        key: 'state_id',
                        name: '状态',
                        value_path: 'state_id',
                        lookup: 'states'
                    },
                    {
                        key: 'maintenance_uid',
                        name: '负责人',
                        value_path: 'maintenance_uid',
                        lookup: 'users'
                    },
                    {
                        key: 'attachments',
                        name: '附件',
                        value_path: 'attachments',
                        lookup: 'attachment_infos'
                    }
                ]
            }
        };
        return of(data).pipe(
            tap((data) => {
                this.initializeWithReferences(data.value, data.references, data.references.properties);
            })
        );
    }
}
