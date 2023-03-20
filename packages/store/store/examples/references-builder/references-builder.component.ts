import { Component, OnInit } from '@angular/core';
import { createReferencesBuilder } from '@tethys/store/references-builder';

@Component({
    selector: 'thy-store-references-builder-example',
    templateUrl: './references-builder.component.html',
    styleUrls: []
})
export class ThyStoreReferencesBuilderExampleComponent implements OnInit {
    constructor() {}

    responseData = {
        value: [
            {
                _id: '1',
                name: '第一章 一伞之恩',
                project_id: '5d52b816ba0092ef66610393',
                sprint_id: '5d53715d98b51d32cb6a5c75',
                suite_ids: ['5eccdb455e57e0c4ce3b7ba5', '62287b4aa942ffb24b59e001'],
                attachments: [
                    {
                        _id: '6410860c8e1f90c2286f094a',
                        latest_version: 1
                    }
                ]
            },
            {
                _id: '2',
                name: '第二章 玄鬼宗伏袭',
                project_id: '5d52b816ba0092ef66610393',
                sprint_id: '5d53716998b51dd3f26a5c7c',
                suite_ids: ['5eccdb455e57e0c4ce3b7ba5']
            },
            {
                _id: '3',
                name: '第三章 夜魔魅影',
                project_id: '5d52b816ba0092ef66610393',
                sprint_id: '5d53716998b51dd3f26a5c7c'
            }
        ],
        references: {
            projects: [
                {
                    _id: '5d52b816ba0092ef66610393',
                    name: '东离剑游记',
                    template_type: 'scrum',
                    icon: null,
                    color: '#348fe4'
                }
            ],
            sprints: [
                {
                    _id: '5d53715d98b51d32cb6a5c75',
                    name: '生命的意义'
                },
                {
                    _id: '5d53716998b51dd3f26a5c7c',
                    name: '玄学'
                }
            ],
            suites: [
                {
                    _id: '5eccdb455e57e0c4ce3b7ba5',
                    name: '未命名模块尔特我让泰文太稳'
                },
                {
                    _id: '62287b4aa942ffb24b59e001',
                    name: '阿斯顿发送到发送到'
                }
            ],
            attachment_infos: [
                {
                    _id: '6410860c8e1f90c2286f094a',
                    latest_version: 1,
                    attachment_version_id: '6410860c8e1f90c2286f094b',
                    file_id: '641085f6b065d3b3f1c254ef',
                    version: 1,
                    source: 1,
                    title: 'PingCode.T\\estcases-import-template (1).xlsx',
                    type: 3,
                    file_type: 3
                }
            ]
        }
    };

    fields = [
        { key: 'project_id', lookup: 'projects' },
        { key: 'sprint_id', lookup: 'sprints' },
        {
            key: 'suite_ids',
            lookup: 'suites'
        },
        {
            key: 'attachments',
            lookup: 'attachment_infos'
        }
    ];

    ngOnInit(): void {}

    build() {
        const refBuilder = createReferencesBuilder(this.responseData.references).build();
        const attachedValue = this.responseData.value.map((item) => {
            return refBuilder.attachRefs(item, this.fields);
        });
    }
}
