"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJwt = authenticateJwt;
async function authenticateJwt(request, reply) {
    try {
        const payload = await request.jwtVerify();
        request.userId = payload.userId;
        request.businessId = payload.businessId;
    }
    catch (err) {
        return reply.status(401).send({
            error: "Unauthorized",
            message: "Invalid or expired JWT authorization token",
        });
    }
}
//# sourceMappingURL=auth.js.map