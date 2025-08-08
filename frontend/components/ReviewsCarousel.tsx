import React, { useState } from "react";

const reviews = [
  {
    name: "Alice",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Alice",
    agent: "QuantumTrader",
    review:
      "QuantumTrader helped me automate my trades and boosted my returns! The UI is clean and the strategies are transparent.",
    date: "July 2025",
  },
  {
    name: "Bob",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Bob",
    agent: "SuiMomentum",
    review:
      "I love the risk controls on SuiMomentum. Subscribing was easy and the performance has been consistent.",
    date: "June 2025",
  },
  {
    name: "Chloe",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Chloe",
    agent: "GreenBot",
    review:
      "GreenBot's strategy is unique and the community is super helpful. Highly recommend for new users!",
    date: "May 2025",
  },
  {
    name: "Community Member",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Community",
    agent: "-",
    review:
      "The marketplace is a game-changer for DeFi automation. Excited to see more agents join!",
    date: "April 2025",
  },
];

const accentBorders = [
  "from-blue-500 to-green-400",
  "from-green-400 to-blue-500",
  "from-primary-600 to-primary-300",
  "from-primary-300 to-primary-600",
];

const ReviewsCarousel: React.FC = () => {
  const [scrollIndex, setScrollIndex] = useState(0);
  const cardWidth = 370; // px
  const visibleCards =
    typeof window !== "undefined" && window.innerWidth >= 768 ? 2 : 1;
  const maxIndex = Math.max(0, reviews.length - visibleCards);

  // Auto-advance every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [maxIndex]);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full overflow-x-hidden">
        <div
          className="flex gap-8 transition-transform duration-500"
          style={{
            transform: `translateX(-${scrollIndex * (cardWidth + 32)}px)`, // 32px = gap-8
          }}
          id="reviews-carousel-track"
        >
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className={`flex-shrink-0 min-w-[320px] max-w-[370px] w-[90vw] md:w-[370px] h-[260px] md:h-[260px] transition-all duration-500 rounded-2xl p-[2px] bg-gradient-to-r ${
                accentBorders[idx % accentBorders.length]
              }`}
              style={{ boxSizing: "border-box" }}
            >
              <div className="rounded-2xl h-full w-full bg-dark-900 shadow-xl flex flex-col justify-between p-6 md:p-8">
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://api.dicebear.com/7.x/personas/svg?seed=Default";
                    }}
                  />
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {review.name}
                    </div>
                    <div className="text-xs text-white/70">
                      {review.agent !== "-"
                        ? `Used: ${review.agent}`
                        : "Community"}
                    </div>
                  </div>
                  <div className="ml-auto text-xs text-white/50">
                    {review.date}
                  </div>
                </div>
                <div className="text-white text-base md:text-lg font-medium mb-2 line-clamp-3">
                  “{review.review}”
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        {Array.from({ length: reviews.length - visibleCards + 1 }).map(
          (_, idx) => (
            <button
              key={idx}
              className={`h-0.5 w-20 rounded transition-all duration-300 ${
                idx === scrollIndex ? "bg-white/70" : "bg-white/20"
              }`}
              onClick={() => setScrollIndex(idx)}
              aria-label={`Go to review set ${idx + 1}`}
            />
          )
        )}
      </div>
      <style jsx>{`
        #reviews-carousel-track {
          scroll-behavior: smooth;
        }
        @media (max-width: 767px) {
          #reviews-carousel-track > div {
            min-width: 90vw !important;
            max-width: 95vw !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewsCarousel;
