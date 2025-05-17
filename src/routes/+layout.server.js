//import UAParser from "ua-parser-js";
//import { redirect } from "@sveltejs/kit";

export const load = async ({ locals, request }) => {

    //let ua = UAParser(request.headers.get("user-agent") || "");
    // if (ua.getDevice().type === 'mobile') {
        ///throw redirect(301, '/mobile');
    let session = await locals.getSession();

    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
        
    }

    console.log("Session:", session);

    return {
        session
    };
};