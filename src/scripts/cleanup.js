import {forever} from "melperjs";
import Tournament from "../models/tournament.js";
import Pick from "../models/pick.js";
import {Op} from "sequelize";
import {moment} from "../config/packages.js";

export default async () => {
    await forever(60000, async () => {
        const oldTournaments = await Tournament.findAll({
            where: {
                createdAt: {
                    [Op.lt]: moment().subtract(1, 'day').unix()
                }
            },
            attributes: ['id'],
            limit: 100
        });

        if (oldTournaments.length > 0) {
            const tournamentIds = oldTournaments.map(tournament => tournament.id);

            await Pick.destroy({
                where: {
                    tournamentId: {
                        [Op.in]: tournamentIds
                    }
                }
            });

            await Tournament.destroy({
                where: {
                    id: {
                        [Op.in]: tournamentIds
                    }
                }
            });

            console.log(`Deleted ${tournamentIds.length} old tournaments and their related picks`);
        } else {
            console.log("No old tournaments");
        }
    }, (e) => {
        console.error("cleanup", e);
    });
}