import {
    buildReferencesKeyBy,
    mergeReferences,
    MergeReferencesStrategy,
    ReferenceArrayExtractAllowKeys,
    ReferencesIdDictionary
} from './references';

export class ReferencesBuilder<TReferences> {
    protected referencesIdMap: ReferencesIdDictionary<TReferences>;

    get maps() {
        return this.referencesIdMap;
    }

    constructor(protected references: TReferences, protected idKeys?: Partial<ReferenceArrayExtractAllowKeys<TReferences>>) {}

    build(references?: TReferences): ReferencesIdDictionary<TReferences> {
        if (references) {
            this.references = references;
        }
        if (this.references) {
            this.referencesIdMap = buildReferencesKeyBy(this.references, this.idKeys);
            return this.referencesIdMap;
        }
    }

    merge(references: Partial<TReferences>, options: { strategy: MergeReferencesStrategy }) {
        this.references = mergeReferences(this.references, references, this.idKeys, options);
        return this.build();
    }

    attachRefs<T>(entity: T, properties: []) {
        properties.forEach((property) => {});
    }
}

export function createReferencesBuilder<TReferences>(
    references: TReferences,
    idKeys?: Partial<ReferenceArrayExtractAllowKeys<TReferences>>
) {
    return new ReferencesBuilder(references, idKeys);
}
