"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappService = void 0;
const repository_1 = require("../db/repository");
class WhatsAppService {
    connectionStatus = "CONNECTED";
    connectedNumber = "+91 98765 43210";
    getStatus() {
        return {
            status: this.connectionStatus,
            number: this.connectedNumber,
            timestamp: Date.now(),
        };
    }
    async connect(phoneNumber) {
        this.connectionStatus = "CONNECTING";
        await new Promise((r) => setTimeout(r, 600));
        this.connectionStatus = "CONNECTED";
        this.connectedNumber = phoneNumber || "+91 98765 43210";
        return this.getStatus();
    }
    async disconnect() {
        this.connectionStatus = "DISCONNECTED";
        this.connectedNumber = "";
        return this.getStatus();
    }
    async dispatchMessage(params) {
        const msg = await repository_1.repository.createMessage({
            business_id: params.businessId,
            followup_id: params.followupId,
            phone_number: params.phoneNumber,
            customer_name: params.customerName,
            content: params.content,
            mode: params.mode || "MANUAL",
            status: "QUEUED",
            sent_at: undefined,
            delivered_at: undefined,
        });
        if (params.followupId) {
            await repository_1.repository.updateFollowUpStatus(params.followupId, "SENT");
        }
        // Simulate async delivery pipeline
        setTimeout(async () => {
            await repository_1.repository.updateMessageStatus(msg.id, "SENDING");
            setTimeout(async () => {
                await repository_1.repository.updateMessageStatus(msg.id, "SENT");
                setTimeout(async () => {
                    await repository_1.repository.updateMessageStatus(msg.id, "DELIVERED");
                }, 800);
            }, 600);
        }, 400);
        return msg;
    }
}
exports.whatsappService = new WhatsAppService();
//# sourceMappingURL=whatsapp.service.js.map