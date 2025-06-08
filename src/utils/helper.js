import {safeString} from "melperjs";
import {getString} from "../config/packages.js";

export async function paginate(model, pageNumber, pageSize = 25, buttonCount = 5, query = null) {
    pageNumber = Math.max(+(pageNumber) || 1, 1);
    pageSize = Math.max(+(pageSize) || 25, 1);
    buttonCount = Math.max(+(buttonCount) || 5, 1);
    const offset = (pageNumber - 1) * pageSize;

    const {rows: items, count: totalItemCount} = await model.paginate(offset, pageSize, query);

    const totalPageCount = Math.ceil(totalItemCount / pageSize);
    let buttonStartPage = Math.max(1, pageNumber - Math.floor(buttonCount / 2));
    let buttonEndPage = Math.min(totalPageCount, buttonStartPage + buttonCount - 1);
    if (buttonEndPage - buttonStartPage + 1 < buttonCount && buttonStartPage > 1) {
        buttonStartPage = Math.max(1, buttonEndPage - buttonCount + 1);
    }

    return {
        pageNumber,
        pageSize,
        offset,
        hasPrevious: pageNumber > 1,
        hasNext: pageNumber < totalPageCount,
        buttonCount,
        buttonStartPage,
        buttonEndPage,
        totalPageCount,
        totalItemCount,
        items
    };
}

export function rowText(key, prev, next, maxLength = 0, allowNull = true) {
    let text = next.hasOwnProperty(key) ? safeString(getString(next[key])) : prev[key];
    if (maxLength && text?.length > maxLength) {
        throw new Error("Field " + key + " cannot exceed " + maxLength + " characters");
    }
    if (!text && !allowNull) {
        throw new Error("Field " + key + " cannot be empty");
    }
    return text || null;
}