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

    map<T>(entityClass, result, done)
    {
        let resultEntities: T[] = [];
        /*
        //
        // Map rows to entities
        //
        result.forEach((row) =>
        {
            let entity = new entityClass();

            for(const columnName in row)
            {
                entity[columnName] = row[columnName];
            }

            resultEntities.push(entity);
        });
        */
        
        let ed = this.config.getEntityDefinition(entityClass);
        let ids = this.config.getEntityIds(ed);
        let normalFields = this.config.getEntityFields(ed);
        let manyToOneFields = this.config.getEntityManyToOneFields(ed);

        //
        // Map rows to entities
        //
        result.forEach((row) =>
        {
            let entity = isString(entityClass) ? new (this.config.findClass(entityClass))() : new entityClass();

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
                let target = manyToOneFields[fieldName].target;
                let targetEd = this.config.getEntityDefinition(target);
                let targetIds = this.config.getEntityIds(targetEd);

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
        done(resultEntities);
    }
}
