import {forever} from "melperjs";
import Game from "../models/game.js";
import Selection from "../models/selection.js";

export default async (app, p1) => {
    await forever(3000000, async () => {

    }, (e) => {
        console.error("example", e?.response?.data || e.message);
    });
}