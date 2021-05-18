import { OrmEntity } from "../orm/entity/OrmEntity";
import { OrmEntityFieldAsString } from "../orm/entity/OrmEntityFieldAsString";
import { OrmExtends } from "../orm/entity/OrmExtends";
import { OrmOnPostInsert } from "../orm/entity/OrmOnPostInsert";
import { OrmOnPreInsert } from "../orm/entity/OrmOnPreInsert";
import { Objekt } from "./Objekt";

@OrmEntity()
@OrmExtends({ base: Objekt })
export class User extends Objekt
{
    @OrmEntityFieldAsString()
    username;

    @OrmEntityFieldAsString()
    password;

    @OrmOnPreInsert()
    onPreInsert()
    {
        console.log('User.onPreInsert()')
    }

    @OrmOnPostInsert()
    onPostInsert()
    {
        console.log('User.onPreInsert()')
    }
}
