// src/smartsocial/pages/onboarding/steps/Step3Quiz.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { auth } from "../../../utils/firebase";
import { updateOnboardingStep } from "../../../utils/userService";

// =============================================================================
// INDUSTRY DATA CONFIGURATION
// =============================================================================

/**
 * Industry categories with icons and items
 * Used for the industry dropdown with categorized options
 */
const industryCategories = [
  {
    category: "Technology",
    icon: "🚀", // Changed from 💻 to more modern icon
    items: ["AI & Machine Learning", "SaaS", "E-commerce", "FinTech", "EdTech", "Cybersecurity", "Web Development", "Mobile Apps"]
  },
  {
    category: "Food & Beverage", 
    icon: "🍽️", // Changed from 🍔 to more professional icon
    items: ["Café", "Restaurant", "Brewery", "Food Truck", "Bakery", "Coffee Shop", "Bar", "Catering"]
  },
  {
    category: "Health & Wellness",
    icon: "💎", // Changed from 💪 to more elegant icon
    items: ["Fitness", "Yoga", "Nutrition", "Mental Health", "Wellness", "Skincare", "Supplement", "Physical Therapy"]
  },
  {
    category: "Retail",
    icon: "🛒", // Changed from 🛍️ to cleaner icon
    items: ["Fashion", "Electronics", "Home Goods", "Specialty Store", "Jewelry", "Beauty Products", "Sports Equipment", "Books"]
  },
  {
    category: "Services",
    icon: "⚡", // Changed from 🔧 to more dynamic icon
    items: ["Consulting", "Marketing", "Legal", "Design", "Real Estate", "Finance", "Education", "Cleaning"]
  },
  {
    category: "Creative",
    icon: "🎯", // Changed from 🎨 to more strategic icon
    items: ["Photography", "Art", "Music", "Writing", "Graphic Design", "Video Production", "Podcasting", "Game Development"]
  }
];

/**
 * Common business name patterns for auto-suggestions
 * Used to generate intelligent business name recommendations
 */
const businessNamePatterns = [
  "Tech", "Solutions", "Innovations", "Labs", "Studio", "Ventures", 
  "Group", "Global", "Digital", "Creative", "Systems", "Network"
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Step3Quiz: React.FC = () => {
  const navigate = useNavigate();
  
  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================
  
  // Form field states
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [brandVibe, setBrandVibe] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // UI interaction states
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showBusinessSuggestions, setShowBusinessSuggestions] = useState(false);
  const [industrySearch, setIndustrySearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // ===========================================================================
  // REFS FOR DOM MANIPULATION
  // ===========================================================================
  
  const industryRef = useRef<HTMLDivElement>(null);
  const businessRef = useRef<HTMLDivElement>(null);
  const industryInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ===========================================================================
  // COMPUTED VALUES & MEMOIZED DATA
  // ===========================================================================
  
  /**
   * Trimmed form values for validation and submission
   * Prevents whitespace-related issues in form submission
   */
  const trimmed = useMemo(() => ({
    businessName: businessName.trim(),
    industry: industry.trim(),
    brandVibe: brandVibe.trim(),
    campaignType: campaignType.trim(),
  }), [businessName, industry, brandVibe, campaignType]);

  /**
   * Filtered industries based on search term
   * Searches both category names and individual industry items
   */
  const filteredIndustries = useMemo(() => {
    if (!industrySearch.trim()) return industryCategories;
    
    const searchTerm = industrySearch.toLowerCase();
    return industryCategories
      .map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.toLowerCase().includes(searchTerm) ||
          category.category.toLowerCase().includes(searchTerm)
        )
      }))
      .filter(category => category.items.length > 0);
  }, [industrySearch]);

  /**
   * Flat version of filtered industries for keyboard navigation
   * Enables linear keyboard traversal through search results
   */
  const filteredIndustriesFlat = useMemo(() => {
    return filteredIndustries.flatMap(category => 
      category.items.map(item => ({ 
        name: item, 
        category: category.category 
      }))
    );
  }, [filteredIndustries]);

  /**
   * Business name suggestions based on current input and industry
   * Provides intelligent naming recommendations to users
   */
  const businessSuggestions = useMemo(() => {
    if (businessName.length < 2) return [];
    
    const baseName = businessName.trim();
    const industryHint = industry.toLowerCase();
    
    const suggestions = [
      baseName,
      `${baseName} ${businessNamePatterns.find(pattern => 
        !baseName.includes(pattern)) || "Solutions"}`,
      `${baseName} ${industryHint ? industryHint.split(' ')[0] : "Tech"}`,
      `The ${baseName} Company`,
      `${baseName} ${industryHint.includes('tech') ? "Technologies" : "Group"}`,
    ].filter((suggestion, index, self) => 
      self.indexOf(suggestion) === index && suggestion !== businessName
    );

    return suggestions.slice(0, 3); // Reduced to 3 to minimize height
  }, [businessName, industry]);

  /**
   * Form validation - checks if all required fields are filled
   * Prevents submission of incomplete forms
   */
  const canSubmit = useMemo(
    () =>
      !!trimmed.businessName &&
      !!trimmed.industry &&
      !!trimmed.brandVibe &&
      !!trimmed.campaignType &&
      !isSaving,
    [trimmed, isSaving]
  );

  // ===========================================================================
  // EFFECTS & SIDE EFFECTS
  // ===========================================================================
  
  /**
   * Close dropdowns when clicking outside component boundaries
   * Improves UX by automatically closing open dropdowns
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close industry dropdown if click outside
      if (industryRef.current && !industryRef.current.contains(event.target as Node)) {
        setShowIndustryDropdown(false);
        setHighlightedIndex(-1);
      }
      // Close business suggestions if click outside
      if (businessRef.current && !businessRef.current.contains(event.target as Node)) {
        setShowBusinessSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Keyboard navigation for industry dropdown
   * Enables arrow key navigation and keyboard selection
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showIndustryDropdown) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex(prev => 
            Math.min(prev + 1, filteredIndustriesFlat.length - 1)
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex(prev => Math.max(prev - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          if (highlightedIndex >= 0) {
            handleIndustrySelect(filteredIndustriesFlat[highlightedIndex].name);
          } else if (industrySearch && filteredIndustriesFlat.length > 0) {
            handleIndustrySelect(filteredIndustriesFlat[0].name);
          }
          break;
        case "Escape":
          setShowIndustryDropdown(false);
          setHighlightedIndex(-1);
          industryInputRef.current?.focus();
          break;
      }
    };

    if (showIndustryDropdown) {
      document.addEventListener("keydown", handleKeyDown);
    }
    
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showIndustryDropdown, highlightedIndex, filteredIndustriesFlat, industrySearch]);

  /**
   * Auto-scroll to highlighted item in dropdown
   * Ensures keyboard-navigated items remain visible
   */
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('.industry-item');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // ===========================================================================
  // EVENT HANDLERS
  // ===========================================================================
  
  /**
   * Handle industry selection from dropdown
   * Updates industry state and resets search/dropdown UI
   */
  const handleIndustrySelect = (selectedIndustry: string) => {
    console.log("Industry selected:", selectedIndustry);
    setIndustry(selectedIndustry);
    setShowIndustryDropdown(false);
    setIndustrySearch("");
    setHighlightedIndex(-1);
    // Removed auto-focus to prevent dropdown reopening
  };

  /**
   * Handle business name suggestion selection
   * Applies suggested name and closes suggestions dropdown
   */
  const handleBusinessSuggestionSelect = (suggestion: string) => {
    setBusinessName(suggestion);
    setShowBusinessSuggestions(false);
  };

  /**
   * Handle industry input focus - shows dropdown with fresh state
   */
  const handleIndustryInputFocus = () => {
    setShowIndustryDropdown(true);
    setIndustrySearch("");
    setHighlightedIndex(-1);
  };

  /**
   * Handle industry input changes with real-time search
   */
  const handleIndustryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIndustry(value);
    setIndustrySearch(value);
    setShowIndustryDropdown(true);
    setHighlightedIndex(-1);
  };

  /**
   * Handle dropdown toggle button click
   */
  const handleDropdownToggle = () => {
    const newState = !showIndustryDropdown;
    setShowIndustryDropdown(newState);
    setIndustrySearch(newState ? industry : "");
    setHighlightedIndex(-1);
  };

  /**
   * Handle form submission with validation and API call
   * Saves onboarding progress and navigates to next step
   */
 // In Step3Quiz.tsx - change the navigate path and progress number:
const handleSubmit = async () => {
  if (!auth.currentUser) {
    alert("⚠️ Please sign in to continue.");
    return;
  }
  
  if (!canSubmit) {
    alert("⚠️ Please fill out all fields before continuing.");
    return;
  }

  try {
    setIsSaving(true);

    await updateOnboardingStep(auth.currentUser.uid, {
      businessName: trimmed.businessName,
      industry: trimmed.industry,
      brandVibe: trimmed.brandVibe,
      campaignType: trimmed.campaignType,
      progress: 2, // Changed to 2 since this is the second step
      completed: false,
      celebrated: false,
    });

    console.log("✅ Step 2 data saved:", trimmed);
    navigate("/smartsocial/onboarding/step2"); // Navigate to step2 (AhaMoment)
  } catch (error) {
    console.error("❌ Error saving quiz:", error);
    alert("Something went wrong saving your info. Please try again.");
  } finally {
    setIsSaving(false);
  }
};

  // ===========================================================================
  // RENDER
  // ===========================================================================
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-50 p-4">
      {/* Main Form Container - Reduced height and padding */}
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full border border-gray-200">
        
        {/* Progress Indicator */}
        <ProgressBar currentStep={3} totalSteps={4} />

        {/* Page Header - Compact spacing */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Defining Your Brand Identity
          </h1>
          <p className="text-gray-600 text-xs">
            Tell us about your business to personalize your experience
          </p>
        </div>

        {/* Business Name with Auto-suggest */}
        <div className="mb-4 relative" ref={businessRef}>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            placeholder="e.g., TechGuard Innovations"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setShowBusinessSuggestions(e.target.value.length > 1);
            }}
            onFocus={() => setShowBusinessSuggestions(businessName.length > 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-sm"
          />
          
          {/* Business Name Suggestions - Limited height */}
          {showBusinessSuggestions && businessSuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-2 bg-blue-50 border-b border-blue-100 text-xs font-semibold text-blue-800">
                💡 Name Suggestions
              </div>
              {businessSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleBusinessSuggestionSelect(suggestion)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 text-sm"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Industry Selector with Search and Categories */}
        <div className="mb-4 relative" ref={industryRef}>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Industry *
          </label>
          <div className="relative">
            <input
              ref={industryInputRef}
              type="text"
              placeholder="Search or select your industry..."
              value={industry}
              onChange={handleIndustryInputChange}
              onFocus={handleIndustryInputFocus}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors pr-10 text-sm"
            />
            <button
              type="button"
              onClick={handleDropdownToggle}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showIndustryDropdown ? "▲" : "▼"}
            </button>
          </div>
          
          {/* Industry Dropdown - Fixed height to prevent scrollbar */}
          {showIndustryDropdown && (
            <div 
              ref={dropdownRef}
              className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-hidden flex flex-col"
            >
              {/* Search Header - Single search icon */}
              <div className="p-2 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type to search industries..."
                    value={industrySearch}
                    onChange={(e) => setIndustrySearch(e.target.value)}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowIndustryDropdown(false);
                        industryInputRef.current?.focus();
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Industry List - Limited height to prevent scrolling */}
              <div className="overflow-y-auto flex-1">
                {filteredIndustries.map((category) => (
                  <div key={category.category} className="mb-1">
                    <div className="flex items-center px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-50 sticky top-0">
                      <span className="mr-2">{category.icon}</span>
                      {category.category}
                    </div>
                    {category.items.map((item, itemIndex) => {
                      const flatIndex = filteredIndustriesFlat.findIndex(i => i.name === item);
                      return (
                        <div
                          key={item}
                          onClick={() => handleIndustrySelect(item)}
                          className={`industry-item px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                            flatIndex === highlightedIndex 
                              ? 'bg-blue-100 border-l-2 border-blue-500' 
                              : ''
                          }`}
                        >
                          {item}
                        </div>
                      );
                    })}
                  </div>
                ))}
                
                {/* No Results State */}
                {filteredIndustries.length === 0 && (
                  <div className="px-3 py-3 text-sm text-gray-500 text-center">
                    No industries found. Try a different search term.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Brand Vibe Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Brand Personality *
          </label>
          <select
            value={brandVibe}
            onChange={(e) => setBrandVibe(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-white text-sm"
          >
            <option value="">Select your brand personality</option>
            <option value="friendly">Friendly & Welcoming</option>
            <option value="professional">Professional & Expert</option>
            <option value="fun">Playful & Fun</option>
            <option value="luxury">Premium & Luxury</option>
            <option value="innovative">Innovative & Forward-thinking</option>
            <option value="reliable">Trustworthy & Reliable</option>
          </select>
        </div>

        {/* Campaign Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Campaign Type *
          </label>
          <select
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-white text-sm"
          >
            <option value="">What type of campaign are you planning?</option>
            <option value="launch">Product Launch</option>
            <option value="sale">Promotion / Sale</option>
            <option value="event">Event Marketing</option>
            <option value="announcement">General Announcement</option>
            <option value="awareness">Brand Awareness</option>
            <option value="engagement">Audience Engagement</option>
          </select>
        </div>

        {/* Submit Button - Compact size */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSaving}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center justify-center"
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Saving...
            </>
          ) : (
            <>
              Continue to Next Step
              <span className="ml-1">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step3Quiz;