import { logOrmEntity } from "../../testing/log";
import { entityDefinitions } from "../OrmConfig";
import { camelcaseToUnderscore } from "../utils";
import { OrmEntityDefinition } from "./OrmEntityDefinition";

interface Params
{
    tableName?: string;
}

export function OrmEntity(params?: Params)
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

        return target;
    }
}
