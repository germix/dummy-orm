import { OrmAbstractEntity } from "../orm/entity/OrmAbstractEntity";
import { OrmEntity } from "../orm/entity/OrmEntity";
import { OrmEntityFieldAsString } from "../orm/entity/OrmEntityFieldAsString";
import { OrmEntityId } from "../orm/entity/OrmEntityId";
import { OrmEntityIdAsIncremental } from "../orm/entity/OrmEntityIdAsIncremental";

@OrmAbstractEntity()
export abstract class Objekt
{
    @OrmEntityIdAsIncremental()
    id;

    @OrmEntityFieldAsString()
    type;
}
