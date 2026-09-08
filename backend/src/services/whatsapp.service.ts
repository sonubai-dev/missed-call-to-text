import { repository } from "../db/repository";
import { MessageRecord } from "../types";

export interface DispatchMessageParams {
  businessId: string;
  followupId?: string;
  phoneNumber: string;
  customerName?: string;
  content: string;
  mode?: "MANUAL" | "WHATSAPP_WEB" | "CLOUD_API";
}

class WhatsAppService {
  private connectionStatus: "CONNECTED" | "DISCONNECTED" | "CONNECTING" = "CONNECTED";
  private connectedNumber: string = "+91 98765 43210";

  getStatus() {
    return {
      status: this.connectionStatus,
      number: this.connectedNumber,
      timestamp: Date.now(),
    };
  }

  async connect(phoneNumber: string) {
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

  async dispatchMessage(params: DispatchMessageParams): Promise<MessageRecord> {
    const msg = await repository.createMessage({
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
      await repository.updateFollowUpStatus(params.followupId, "SENT");
    }

    // Simulate async delivery pipeline
    setTimeout(async () => {
      await repository.updateMessageStatus(msg.id, "SENDING");
      setTimeout(async () => {
        await repository.updateMessageStatus(msg.id, "SENT");
        setTimeout(async () => {
          await repository.updateMessageStatus(msg.id, "DELIVERED");
        }, 800);
      }, 600);
    }, 400);

    return msg;
  }
}

export const whatsappService = new WhatsAppService();
