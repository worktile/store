import { Id } from '@tethys/cdk';
import {
    ReferencedField,
    buildReferencesKeyBy,
    mergeReferences,
    MergeReferencesStrategy,
    ReferenceArrayExtractAllowKeys,
    ReferencesIdDictionary
} from './references';
import { getIdFromValue, getObjectValue, keyBy } from './utils';

export class ReferencesBuilder<TReferences> {
    protected referencesIdMap: ReferencesIdDictionary<TReferences>;

    get maps() {
        return this.referencesIdMap;
    }

    constructor(protected references: TReferences, protected idKeys?: Partial<ReferenceArrayExtractAllowKeys<TReferences>>) {}

    build(references?: TReferences): ReferencesBuilder<TReferences> {
        if (references) {
            this.references = references;
        }
        if (this.references) {
            this.referencesIdMap = buildReferencesKeyBy(this.references, this.idKeys);
        }
        return this;
    }

    merge(references: Partial<TReferences>, options?: { strategy: MergeReferencesStrategy }) {
        this.references = mergeReferences(this.references, references, this.idKeys, options);
        return this.build();
    }

    attachRefs<T>(entity: T, fields: ReferencedField[]) {
        const refs = {};
        fields.forEach((field) => {
            const valuePath = field.value_path || field.key;
            const lookup = field.lookup || field.key;

            if (field.lookup) {
                const value = getObjectValue(entity, valuePath);
                let refsMap = this.referencesIdMap[lookup];
                if (refsMap) {
                    if (value) {
                        if (Array.isArray(value)) {
                            refs[field.key] = value.map((value) => {
                                return refsMap[getIdFromValue(value)];
                            });
                        } else {
                            refs[field.key] = refsMap[getIdFromValue(value)];
                        }
                    }
                }
            }
        });
        return { ...entity, refs: refs };
    }
}

export function createReferencesBuilder<TReferences>(
    references: TReferences,
    idKeys?: Partial<ReferenceArrayExtractAllowKeys<TReferences>>
) {
    return new ReferencesBuilder(references, idKeys);
}
