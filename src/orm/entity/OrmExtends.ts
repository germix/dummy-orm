import { logOrmExtends } from "../../testing/log";
import { entityDefinitions } from "../OrmConfig";
import { OrmException } from "../OrmException";
import { camelcaseToUnderscore } from "../utils";
import { OrmEntityDefinition } from "./OrmEntityDefinition";

export function OrmExtends({base, discriminatorValue}:
{
    base;
    discriminatorValue? : string;
})
{
    return function(target)
    {
        let baseName = base.name;
        let entityName = target.name;

        logOrmExtends(entityName + ' extends ' + baseName);

        if(entityName == baseName)
        {
            throw new OrmException("Entity cannot extend itself");
        }

        if(entityDefinitions[entityName] === undefined)
        {
            entityDefinitions[entityName] = {} as OrmEntityDefinition;
        }
        if(entityDefinitions[entityName].extends === undefined)
        {
            entityDefinitions[entityName].extends = base;
            entityDefinitions[entityName].discriminatorValue = discriminatorValue || camelcaseToUnderscore(entityName);
        }
        else
        {
            throw new OrmException('Entity extends already set');
        }
    }
}
