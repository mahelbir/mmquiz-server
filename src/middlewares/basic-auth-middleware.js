import settings from "@mahelbir/settings";

export default async (req, res, next) => {

    const username = settings().get("basicAuth.username");
    const password = settings().get("basicAuth.password");

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.responseError("Unauthorized", 401);
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [user, pass] = credentials.split(':');

    if (user === username && pass === password) {
        return next();
    }

    return res.responseError("Unauthorized", 401);

}