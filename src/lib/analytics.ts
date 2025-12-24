import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

type EventData = Record<string, string | number | boolean | null>;

export const analytics = {
  /**
   * Track a custom event
   */
  async track(eventName: string, eventData?: EventData, page?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("analytics_events").insert([{
        event_name: eventName,
        event_data: (eventData || {}) as Json,
        page: page || window.location.pathname,
        session_id: getSessionId(),
        user_id: user?.id || null,
      }]);
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.debug("Analytics tracking error:", error);
    }
  },

  /**
   * Track page view
   */
  pageView(pageName: string) {
    this.track("page_view", { page_name: pageName }, pageName);
  },

  /**
   * Auth prompt events
   */
  authPromptShown(feature: "stylist" | "builder") {
    this.track("auth_prompt_shown", { feature });
  },

  authPromptDismissed(feature: "stylist" | "builder") {
    this.track("auth_prompt_dismissed", { feature, action: "continue_as_guest" });
  },

  authPromptClicked(feature: "stylist" | "builder", action: "sign_in" | "create_account") {
    this.track("auth_prompt_clicked", { feature, action });
  },

  /**
   * Feature engagement events
   */
  stylistMessageSent(hasImage: boolean) {
    this.track("stylist_message_sent", { has_image: hasImage ? 1 : 0 });
  },

  builderItemSwapped(category: string) {
    this.track("builder_item_swapped", { category });
  },

  builderOutfitSaved() {
    this.track("builder_outfit_saved");
  },

  productClicked(productId: string, source: string) {
    this.track("product_clicked", { product_id: productId, source });
  },

  /**
   * User actions
   */
  signupCompleted(method: string) {
    this.track("signup_completed", { method });
  },

  loginCompleted(method: string) {
    this.track("login_completed", { method });
  },
};

export default analytics;