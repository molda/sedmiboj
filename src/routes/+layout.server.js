//import UAParser from "ua-parser-js";
//import { redirect } from "@sveltejs/kit";

export const load = async ({ locals, url }) => {

    //let ua = UAParser(request.headers.get("user-agent") || "");
    // if (ua.getDevice().type === 'mobile') {
        ///throw redirect(301, '/mobile');

    return {
        session: await locals.getSession()
    };
};