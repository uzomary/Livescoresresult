import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    // Also look for any elements with overflow-y-auto that might be the main content container
    const scrollContainers = document.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach(container => {
      container.scrollTo({ top: 0, behavior: "instant" });
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
