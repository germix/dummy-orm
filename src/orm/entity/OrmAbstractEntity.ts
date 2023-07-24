import { logOrmEntity } from "../../testing/log";
import { entityDefinitions } from "../OrmConfig";
import { camelcaseToUnderscore } from "../utils";
import { OrmEntityDefinition } from "./OrmEntityDefinition";

interface Params
{
    tableName?: string;
    discriminatorColumn?: string;
}

export function OrmAbstractEntity(params?: Params)
{
    return function(target)
    {
        params = params || {};
        const entityName = target.prototype.constructor.name;

        logOrmEntity(entityName);
        if(entityDefinitions[entityName] === undefined)
        {
            entityDefinitions[entityName] = {} as OrmEntityDefinition;
        }

        entityDefinitions[entityName].name = entityName;
        entityDefinitions[entityName].tableName = params.tableName || camelcaseToUnderscore(entityName);
        entityDefinitions[entityName].isAbstract = true;
        entityDefinitions[entityName].discriminatorColumn = params.discriminatorColumn;

        return target;
    }
}
