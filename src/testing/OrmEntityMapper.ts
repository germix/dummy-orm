import { OrmConfig } from "../orm/OrmConfig";
import { OrmReference } from "../orm/OrmReference";
import { makeReferenceFieldId } from "../orm/utils";
import isString from "../orm/utils/isString";

export class OrmEntityMapper
{
    private config: OrmConfig;

    constructor(cfg: OrmConfig)
    {
        this.config = cfg;
    }

    public map<T>(entityClass, result: any[]): T[]
    {
        const resultEntities: T[] = [];

        const ed = this.config.getEntityDefinition(entityClass);
        const ids = this.config.getEntityIds(ed);
        const normalFields = this.config.getEntityFields(ed);
        const manyToOneFields = this.config.getEntityManyToOneFields(ed);

        //
        // Map rows to entities
        //
        result.forEach((row) =>
        {
            const entity = isString(entityClass) ? new (this.config.findClass(entityClass))() : new entityClass();

            for(const idName in ids)
            {
                entity[idName] = row[idName];
            }
            for(const fieldName in normalFields)
            {
                entity[fieldName] = row[fieldName];
            }
            for(const fieldName in manyToOneFields)
            {
                const target = manyToOneFields[fieldName].target;
                const targetEd = this.config.getEntityDefinition(target);
                const targetIds = this.config.getEntityIds(targetEd);

                for(const targetId in targetIds)
                {
                    const underscoreColumnName = makeReferenceFieldId(fieldName, targetId);

                    // TODO: Mejorar esto (¿Que pasa si hay mas de un id?)
                    entity[fieldName] = new OrmReference(row[underscoreColumnName], this.config, target.name);
                }
            }

            resultEntities.push(entity);
        });

        // Done
        return resultEntities;
    }
}
