import { OrmEntity } from "../orm/entity/OrmEntity";
import { OrmEntityFieldAsManyToOne } from "../orm/entity/OrmEntityFieldAsManyToOne";
import { OrmEntityFieldAsString } from "../orm/entity/OrmEntityFieldAsString";
import { OrmExtends } from "../orm/entity/OrmExtends";
import { OrmReference } from "../orm/OrmReference";
import { Objekt } from "./Objekt";
import { User } from "./User";

@OrmEntity()
@OrmExtends({ base: Objekt })
export class Comment extends Objekt
{
    @OrmEntityFieldAsString()
    message;

    @OrmEntityFieldAsManyToOne({
        target: User,
    })
    user: OrmReference<User>;

    @OrmEntityFieldAsManyToOne({
        target: Objekt,
        nullable: true,
    })
    parent?: OrmReference<Objekt>;
}
