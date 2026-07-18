import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react"; // Lucide Icons
import axios from "axios";

interface Faq {
  question: string;
  answer: string;
}

const DEFAULT_FAQS: Faq[] = [
  {
    question: "What is ReLoop AI?",
    answer: "ReLoop AI is an AI-powered circular resource exchange platform that automates the redistribution of surplus resources (like food, electronics, furniture, books, and clothes) to verified NGOs and recyclers."
  },
  {
    question: "How does the AI auto-listing work?",
    answer: "By uploading a single photo of your surplus resource, our Vision AI, OCR, and LLM classifiers automatically detect the item details, estimate quantity, determine its category, and generate a draft listing for you."
  },
  {
    question: "How are donations matched to recipients?",
    answer: "Our matching engine ranks recipient organizations based on distance, urgency, storage availability, and active categories to ensure resources are routed to the most appropriate receiver."
  },
  {
    question: "What is the role of n8n automation?",
    answer: "n8n handles the end-to-end workflow orchestration: from verifying orgs, sending matching alerts, routing pickup tasks to volunteers, sending SMS/Email reminders, to producing impact reports."
  },
  {
    question: "How do I sign up as a volunteer?",
    answer: "You can sign up for a ReLoop AI account and select the 'Volunteer' role. Once verified, you will receive route-optimized pickup requests in your area to transport items from donors to NGOs."
  }
];

function App() {
  const [faqData, setFaqData] = useState<Faq[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const fetchfaqData = async () => {
    try {
      const Data = await axios.get(
        `${import.meta.env.VITE_Backend_URL}/api/faq`
      );
      if (Data.data && Data.data.length > 0) {
        setFaqData(Data.data);
      } else {
        setFaqData(DEFAULT_FAQS);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs, using defaults", error);
      setFaqData(DEFAULT_FAQS);
    }
  };

  useEffect(() => {
    fetchfaqData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* FAQ Section */}
      <div className="mb-20 animate-in fade-in duration-300">
        {/* FAQ Heading */}
        <h2 className="text-4xl font-bold font-display text-center mb-12 text-foreground">
          FAQ
        </h2>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqData.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-lg shadow-sm overflow-hidden"
              >
                <div
                  onClick={() => setActiveIndex(isOpen ? null : index)}
                  className="flex items-center justify-between cursor-pointer p-6 select-none"
                >
                  <span className="text-lg font-semibold text-foreground/90">
                    {faq.question}
                  </span>
                  <ChevronUp 
                    className={`text-accent2-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
                {isOpen && (
                  <p className="px-6 pb-6 text-foreground/70 leading-relaxed text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
