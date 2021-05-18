import { Comment } from "../app/Comment";
import { OrmConfig } from "../orm/OrmConfig";
import { OrmManager } from "../orm/OrmManager";

/*
entity
{
    id: PrimaryId(Incremental)

    name: String(
        maxLength: 150,
    )
    items
}

formatter.formatField(await ent.items.load(), 'id,name');

*/
export async function test_one_to_many(cfg: OrmConfig)
{
    console.log('TEST ONE-TO-MANY');

    let mgr = new OrmManager(cfg);
    let cmt = await mgr.findOneBy(Comment, {
        id: 1,
    })
    console.log(await cmt.user.get())
    console.log(await cmt.parent.get())
}
