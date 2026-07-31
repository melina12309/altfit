import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchProductsTool from "./tools/search-products";
import listSavedOutfitsTool from "./tools/list-saved-outfits";
import saveOutfitTool from "./tools/save-outfit";
import getStyleProfileTool from "./tools/get-style-profile";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "style-muse",
  title: "Style Muse",
  version: "0.1.0",
  instructions:
    "Tools for ALT-FIT, a fashion platform that recreates iconic looks affordably. Use `search_products` to find shoppable catalog items, `get_style_profile` to read the signed-in user's style preferences, `list_saved_outfits` to review their looks, and `save_outfit` to store a new outfit for them.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchProductsTool, getStyleProfileTool, listSavedOutfitsTool, saveOutfitTool],
});
