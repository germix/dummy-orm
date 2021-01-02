import { BgCyan, Reset } from "../../bash";
import { entityDefinitions } from "../OrmConfig";
import { OrmException } from "../OrmException";

export function OrmExtends({base})
{
    return function(target)
    {
        let baseName = base.name;
        let entityName = target.name;

        console.log(BgCyan + "[ORM EXTENDS]:" + Reset + " " + entityName + ' extends ' + baseName);

        if(entityName == baseName)
        {
            throw new OrmException("Entity cannot extend itself");
        }

        if(entityDefinitions[entityName] === undefined)
        {
            entityDefinitions[entityName] = {};
        }
        if(entityDefinitions[entityName].extends === undefined)
        {
            entityDefinitions[entityName].extends = base;
        }
        else
        {
            throw new OrmException('Entity extends already set');
        }
    }
}
