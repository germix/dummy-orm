import { OrmEntity } from "../orm/entity/OrmEntity";
import { OrmEntityFieldAsManyToOne } from "../orm/entity/OrmEntityFieldAsManyToOne";
import { OrmEntityIdAsIncremental } from "../orm/entity/OrmEntityIdAsIncremental";
import { Playlist } from "./Playlist";
import { Video } from "./Video";

@OrmEntity()
export class PlaylistHasVideo
{
    @OrmEntityIdAsIncremental()
    id;

    @OrmEntityFieldAsManyToOne({
        target: Video,
    })
    video: Video;

    @OrmEntityFieldAsManyToOne({
        target: Playlist,
    })
    playlist: Playlist;
}
