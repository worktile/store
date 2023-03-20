import { createReferencesBuilder, ReferencesBuilder } from '../references-builder';

interface ReferencesInfo {
    projects: { _id: string; [key: string]: any }[];
    sprints: { _id: string; [key: string]: any }[];
    suites: { _id: string; [key: string]: any }[];
    attachment_infos: { _id: string; [key: string]: any }[];
}

describe('Store: ReferencesBuilder', () => {
    let refsBuilder: ReferencesBuilder<ReferencesInfo>;

    beforeEach(() => {
        refsBuilder = createReferencesBuilder(responseData.references).build();
    });

    it('should create referencesBuilder', () => {
        expect(refsBuilder.maps).toEqual({
            projects: {
                '5d52b816ba0092ef66610393': {
                    _id: '5d52b816ba0092ef66610393',
                    name: '东离剑游记'
                }
            },
            sprints: {
                '5d53715d98b51d32cb6a5c75': {
                    _id: '5d53715d98b51d32cb6a5c75',
                    name: '生命的意义'
                }
            },
            suites: {
                '5eccdb455e57e0c4ce3b7ba5': {
                    _id: '5eccdb455e57e0c4ce3b7ba5',
                    name: '未命名模块尔特我让泰文太稳'
                },
                '62287b4aa942ffb24b59e001': {
                    _id: '62287b4aa942ffb24b59e001',
                    name: '阿斯顿发送到发送到'
                }
            },
            attachment_infos: {
                '6410860c8e1f90c2286f094a': {
                    _id: '6410860c8e1f90c2286f094a',
                    title: 'test'
                }
            }
        });
        refsBuilder.merge(extraRef);
        expect(refsBuilder.maps.projects).toEqual({
            '5d52b816ba0092ef66610393': {
                _id: '5d52b816ba0092ef66610393',
                name: '东离剑游记'
            },
            '5d52b816ba0092ef66610wew3': {
                _id: '5d52b816ba0092ef66610wew3',
                name: 'Extra Project'
            }
        });
    });

    it('should attach references', () => {
        const attachedValue = refsBuilder.attachRefs(responseData.value, fields);
        expect(attachedValue.refs).toEqual({
            project_id: {
                _id: '5d52b816ba0092ef66610393',
                name: '东离剑游记'
            },
            sprint_id: {
                _id: '5d53715d98b51d32cb6a5c75',
                name: '生命的意义'
            },
            suite_ids: [
                {
                    _id: '5eccdb455e57e0c4ce3b7ba5',
                    name: '未命名模块尔特我让泰文太稳'
                },
                {
                    _id: '62287b4aa942ffb24b59e001',
                    name: '阿斯顿发送到发送到'
                }
            ],
            attachments: [
                {
                    _id: '6410860c8e1f90c2286f094a',
                    title: 'test'
                }
            ]
        });
    });
});

const responseData = {
    value: {
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

    references: {
        projects: [
            {
                _id: '5d52b816ba0092ef66610393',
                name: '东离剑游记'
            }
        ],
        sprints: [
            {
                _id: '5d53715d98b51d32cb6a5c75',
                name: '生命的意义'
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
                title: 'test'
            }
        ]
    }
};

const fields = [
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

const extraRef = {
    projects: [
        {
            _id: '5d52b816ba0092ef66610wew3',
            name: 'Extra Project'
        }
    ]
};
