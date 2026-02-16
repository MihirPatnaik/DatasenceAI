// src/smartsocial/agents/helpers/claudeImageHelper.ts

/**
 * Claude Image Helper
 * 
 * IMPORTANT: This is NOT a real AI image generator. It's a keyword-based Unsplash fallback
 * that returns stock photos when all AI image generation services fail.
 * 
 * 🚨 FOR DEMO: This is temporarily disabled to force real AI image generation
 * 🚨 AFTER DEMO: Re-enable as emergency fallback when AI services are down
 */

/**
 * Enhances a caption and returns emergency fallback images from Unsplash.
 * NOTE: This does NOT generate AI images - it only returns pre-selected stock photos.
 */
export const claudeImageHelper = async (caption: string): Promise<string | null> => {
  try {
    console.log("🎨 Claude image helper called with:", caption.substring(0, 100));
    
    // 🆕 DEMO MODE: TEMPORARILY DISABLED - FORCE REAL AI GENERATION
    // ⬇️⬇️⬇️ UNCOMMENT DURING DEMO TO BYPASS UNSPLASH FALLBACK ⬇️⬇️⬇️
    console.log("🚫 DEMO MODE: Claude Unsplash fallback disabled - using real AI generation");
    return null;
    // ⬆️⬆️⬆️ COMMENT OUT AFTER DEMO ⬆️⬆️⬆️
    
    // 🆕 AFTER DEMO: UNCOMMENT BELOW TO RE-ENABLE EMERGENCY FALLBACK
    // ⬇️⬇️⬇️ COMMENT OUT DURING DEMO ⬇️⬇️⬇️
    /*
    console.log("🆘 EMERGENCY: Using Unsplash fallback images (all AI services failed)");
    
    const lowerCaption = caption.toLowerCase();
    
    // Return high-quality Unsplash images based on content
    // 🎯 BAKERY-RELATED IMAGES
    if (lowerCaption.includes('bakery') || lowerCaption.includes('bread') || lowerCaption.includes('pastry') || lowerCaption.includes('cake')) {
      const bakeryImages = [
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=512&h=512&fit=crop", // Bakery interior
        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=512&h=512&fit=crop", // Fresh bread
        "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=512&h=512&fit=crop", // Pastries
        "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=512&h=512&fit=crop", // Bakery display
      ];
      const selectedImage = bakeryImages[Math.floor(Math.random() * bakeryImages.length)];
      console.log("🖼️ Selected bakery fallback image:", selectedImage);
      return selectedImage;
    }
    
    // 🎯 COFFEE SHOP IMAGES
    if (lowerCaption.includes('coffee') || lowerCaption.includes('cafe')) {
      const coffeeImages = [
        "https://images.unsplash.com/photo-1544787219-7f47ccb765a8?w=512&h=512&fit=crop",
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=512&h=512&fit=crop",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=512&h=512&fit=crop",
      ];
      const selectedImage = coffeeImages[Math.floor(Math.random() * coffeeImages.length)];
      console.log("🖼️ Selected coffee fallback image:", selectedImage);
      return selectedImage;
    }
    
    // 🎯 GRAND OPENING/LAUNCH IMAGES
    if (lowerCaption.includes('opening') || lowerCaption.includes('launch') || lowerCaption.includes('grand opening')) {
      const openingImage = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=512&h=512&fit=crop";
      console.log("🖼️ Selected opening fallback image:", openingImage);
      return openingImage;
    }
    
    // 🎯 SALE/PROMOTION IMAGES
    if (lowerCaption.includes('sale') || lowerCaption.includes('discount') || lowerCaption.includes('promotion')) {
      const saleImage = "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=512&h=512&fit=crop";
      console.log("🖼️ Selected sale fallback image:", saleImage);
      return saleImage;
    }
    
    // 🎯 GENERIC SOCIAL MEDIA IMAGES (fallback for everything else)
    const genericImages = [
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=512&h=512&fit=crop", // Abstract
      "https://images.unsplash.com/photo-1552581234-26160f608093?w=512&h=512&fit=crop", // Colorful
      "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=512&h=512&fit=crop", // Gradient
    ];
    const selectedImage = genericImages[Math.floor(Math.random() * genericImages.length)];
    console.log("🖼️ Selected generic fallback image:", selectedImage);
    return selectedImage;
    */
    // ⬆️⬆️⬆️ UNCOMMENT AFTER DEMO ⬆️⬆️⬆️
    
  } catch (err) {
    console.error("❌ Claude image helper failed:", err);
    return null;
  }
};

/**
 * USAGE INSTRUCTIONS:
 * 
 * 🎯 DURING DEMO:
 * - Keep the current code (returns null)
 * - This forces the system to use real AI image generation (SDXL Turbo)
 * - Prevents random Unsplash images during stakeholder presentation
 * 
 * 🎯 AFTER DEMO:
 * - Comment out the "return null" line (line 18)
 * - Uncomment the entire block from line 22 to line 85
 * - This re-enables emergency fallback when AI services fail
 * 
 * 🚨 IMPORTANT NOTES:
 * - This is NOT AI image generation
 * - This is a keyword-based stock photo fallback
 * - Only use as last resort when all AI services are down
 * - For real AI images, rely on SDXL Turbo/Stability AI/OpenAI
 */