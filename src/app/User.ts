import { OrmEntity } from "../orm/entity/OrmEntity";
import { OrmEntityFieldAsString } from "../orm/entity/OrmEntityFieldAsString";
import { OrmExtends } from "../orm/entity/OrmExtends";
import { OrmOnPostInsert } from "../orm/entity/OrmOnPostInsert";
import { OrmOnPostUpdate } from "../orm/entity/OrmOnPostUpdate";
import { OrmOnPreInsert } from "../orm/entity/OrmOnPreInsert";
import { OrmOnPreUpdate } from "../orm/entity/OrmOnPreUpdate";
import { Objekt } from "./Objekt";

@OrmEntity()
@OrmExtends({
    base: Objekt,
    discriminatorValue: 'user',
})
export class User extends Objekt
{
    @OrmEntityFieldAsString()
    username: string;

    @OrmEntityFieldAsString()
    password: string;

    @OrmOnPreInsert()
    onPreInsert()
    {
        console.log('User.onPreInsert()')
    }

    @OrmOnPostInsert()
    onPostInsert()
    {
        console.log('User.onPostInsert()')
    }

    @OrmOnPreUpdate()
    onPreUpdate()
    {
        console.log('User.onPreUpdate()')
    }

    @OrmOnPostUpdate()
    onPostUpdate()
    {
        console.log('User.onPostUpdate()')
    }
}
