  // src/smartsocial/pages/onboarding/steps/Step3Quiz.tsx

  import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { auth } from "../../../utils/firebase";
import { updateOnboardingStep } from "../../../utils/userService";

  // Industry data with categories and icons
  const industryCategories = [
    {
      category: "Technology",
      icon: "💻",
      items: ["AI & Machine Learning", "SaaS", "E-commerce", "FinTech", "EdTech", "Cybersecurity", "Web Development", "Mobile Apps"]
    },
    {
      category: "Food & Beverage",
      icon: "🍔",
      items: ["Café", "Restaurant", "Brewery", "Food Truck", "Bakery", "Coffee Shop", "Bar", "Catering"]
    },
    {
      category: "Health & Wellness",
      icon: "💪",
      items: ["Fitness", "Yoga", "Nutrition", "Mental Health", "Wellness", "Skincare", "Supplement", "Physical Therapy"]
    },
    {
      category: "Retail",
      icon: "🛍️",
      items: ["Fashion", "Electronics", "Home Goods", "Specialty Store", "Jewelry", "Beauty Products", "Sports Equipment", "Books"]
    },
    {
      category: "Services",
      icon: "🔧",
      items: ["Consulting", "Marketing", "Legal", "Design", "Real Estate", "Finance", "Education", "Cleaning"]
    },
    {
      category: "Creative",
      icon: "🎨",
      items: ["Photography", "Art", "Music", "Writing", "Graphic Design", "Video Production", "Podcasting", "Game Development"]
    }
  ];

  // Common business name patterns
  const businessNamePatterns = [
    "Tech", "Solutions", "Innovations", "Labs", "Studio", "Ventures", 
    "Group", "Global", "Digital", "Creative", "Systems", "Network"
  ];

  const Step3Quiz: React.FC = () => {
    const navigate = useNavigate();
    const [businessName, setBusinessName] = useState("");
    const [industry, setIndustry] = useState("");
    const [brandVibe, setBrandVibe] = useState("");
    const [campaignType, setCampaignType] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
    const [showBusinessSuggestions, setShowBusinessSuggestions] = useState(false);
    const [industrySearch, setIndustrySearch] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const industryRef = useRef<HTMLDivElement>(null);
    const businessRef = useRef<HTMLDivElement>(null);
    const industryInputRef = useRef<HTMLInputElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const trimmed = {
      businessName: businessName.trim(),
      industry: industry.trim(),
      brandVibe: brandVibe.trim(),
      campaignType: campaignType.trim(),
    };

    // Get all industries as a flat array for keyboard navigation
    const allIndustries = useMemo(() => {
      return industryCategories.flatMap(category => 
        category.items.map(item => ({ name: item, category: category.category, icon: category.icon }))
      );
    }, []);

    // Filter industries based on search
    const filteredIndustries = useMemo(() => {
      if (!industrySearch) return industryCategories;
      
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

    // Filtered industries for keyboard navigation
    const filteredIndustriesFlat = useMemo(() => {
      return filteredIndustries.flatMap(category => 
        category.items.map(item => ({ name: item, category: category.category }))
      );
    }, [filteredIndustries]);

    // Generate business name suggestions
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

      return suggestions.slice(0, 4);
    }, [businessName, industry]);

    const canSubmit = useMemo(
      () =>
        !!trimmed.businessName &&
        !!trimmed.industry &&
        !!trimmed.brandVibe &&
        !!trimmed.campaignType &&
        !isSaving,
      [trimmed.businessName, trimmed.industry, trimmed.brandVibe, trimmed.campaignType, isSaving]
    );

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (industryRef.current && !industryRef.current.contains(event.target as Node)) {
          setShowIndustryDropdown(false);
          setHighlightedIndex(-1);
        }
        if (businessRef.current && !businessRef.current.contains(event.target as Node)) {
          setShowBusinessSuggestions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard navigation for industry dropdown
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
              // If user typed something and presses enter, select the first match
              handleIndustrySelect(filteredIndustriesFlat[0].name);
              setShowIndustryDropdown(false); // Close dropdown after selection
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

    // Scroll highlighted item into view
    useEffect(() => {
      if (highlightedIndex >= 0 && dropdownRef.current) {
        const items = dropdownRef.current.querySelectorAll('.industry-item');
        if (items[highlightedIndex]) {
          items[highlightedIndex].scrollIntoView({
            block: 'nearest',
          });
        }
      }
    }, [highlightedIndex]);

    const handleIndustrySelect = (selectedIndustry: string) => {
      setIndustry(selectedIndustry);
      setShowIndustryDropdown(false);
      setIndustrySearch("");
      setHighlightedIndex(-1);
      industryInputRef.current?.focus();
    };

    const handleBusinessSuggestionSelect = (suggestion: string) => {
      setBusinessName(suggestion);
      setShowBusinessSuggestions(false);
    };

    const handleIndustryInputFocus = () => {
      setShowIndustryDropdown(true);
      setIndustrySearch("");
      setHighlightedIndex(-1);
    };

    const handleIndustryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIndustry(e.target.value);
      setIndustrySearch(e.target.value);
      setShowIndustryDropdown(true);
      setHighlightedIndex(-1);
    };

    const handleSubmit = async () => {
      if (!auth.currentUser) return;
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
          progress: 2,
          completed: false,
          celebrated: false,
        });

        console.log("✅ Step2 data saved:", trimmed);
        navigate("../onboarding/step2");
      } catch (error) {
        console.error("❌ Error saving quiz:", error);
        alert("Something went wrong saving your info. Please try again.");
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-50 p-3">
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
          <ProgressBar currentStep={2} totalSteps={4} />

          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-gray-800">
              Getting to Know Your Business
            </h2>
            <p className="text-gray-600 mt-1 text-sm">
              Tell Us About Your Brand
            </p>
          </div>

          {/* Business Name with Auto-suggest */}
          <div className="mb-5 relative" ref={businessRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              placeholder="e.g. TechGuard"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                setShowBusinessSuggestions(e.target.value.length > 1);
              }}
              onFocus={() => setShowBusinessSuggestions(businessName.length > 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-sm"
            />
            {showBusinessSuggestions && businessSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {businessSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleBusinessSuggestionSelect(suggestion)}
                    className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg text-sm"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Industry Selector with Search and Categories */}
          <div className="mb-5 relative" ref={industryRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <div className="relative">
              <input
                ref={industryInputRef}
                type="text"
                placeholder="Search or select industry..."
                value={industry}
                onChange={handleIndustryInputChange}
                onFocus={handleIndustryInputFocus}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors pr-10 text-sm"
              />
              <button
                onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 transition-transform text-sm"
              >
                {showIndustryDropdown ? "▲" : "▼"}
              </button>
            </div>
            
            {showIndustryDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col"
              >
                {/* Search Header */}
                <div className="p-2 border-b bg-gray-50">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search industries..."
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
                      className="w-full px-2 py-1.5 pl-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
                
                {/* Industry List */}
                <div className="overflow-y-auto flex-1">
                  {filteredIndustries.map((category) => (
                    <div key={category.category} className="mb-1">
                      <div className="flex items-center px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-50 sticky top-0">
                        <span className="mr-1">{category.icon}</span>
                        {category.category}
                      </div>
                      {category.items.map((item, itemIndex) => {
                        const flatIndex = filteredIndustriesFlat.findIndex(i => i.name === item);
                        return (
                          <div
                            key={item}
                            onClick={() => handleIndustrySelect(item)}
                            className={`industry-item px-3 py-1.5 text-sm hover:bg-blue-50 cursor-pointer transition-colors ${
                              flatIndex === highlightedIndex ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            {item}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  
                  {filteredIndustries.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      No industries found. Try a different search term.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Brand Vibe */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Brand Vibe
            </label>
            <select
              value={brandVibe}
              onChange={(e) => setBrandVibe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-white text-sm"
            >
              <option value="">Choose your brand personality</option>
              <option value="friendly">Friendly & Welcoming</option>
              <option value="professional">Professional & Expert</option>
              <option value="fun">Playful & Fun</option>
              <option value="luxury">Premium & Luxury</option>
              <option value="innovative">Innovative & Forward-thinking</option>
              <option value="reliable">Trustworthy & Reliable</option>
            </select>
          </div>

          {/* Campaign Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Campaign Type
            </label>
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-white text-sm"
            >
              <option value="">What type of campaign?</option>
              <option value="launch">Product Launch</option>
              <option value="sale">Promotion / Sale</option>
              <option value="event">Event Marketing</option>
              <option value="announcement">General Announcement</option>
              <option value="awareness">Brand Awareness</option>
              <option value="engagement">Audience Engagement</option>
            </select>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSaving}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center text-sm"
          >
            {isSaving ? (
              <>
                <span className="animate-spin mr-1">⟳</span>
                Saving...
              </>
            ) : (
              <>
                Save & Continue
                <span className="ml-1">→</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  export default Step3Quiz;