import path from "path";
import momentTz from "moment-timezone";
import {initSettings, setDefaultFile} from "@mahelbir/settings";
import config from "./config.js";
import {toString} from "lodash-es";


momentTz.tz.setDefault(config.env.TIMEZONE);
momentTz.locale(config.env.LANG);

setDefaultFile(path.join(config.path.storage, "settings.json"));
initSettings(1);

export const getString = toString;
export const moment = momentTz;
export default () => true