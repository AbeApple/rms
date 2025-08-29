import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setMonthInView } from '../../../Global/store';

const useMonthObserver = (months, active = true) => {
  const dispatch = useDispatch();
  const observerRef = useRef(null);
  const currentMonthRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    // Don't set up observer if not active
    if (!active) {
      return;
    }
    
    // console.log('useMonthObserver: Running effect, months:', months);

    // Create IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // console.log('IntersectionObserver callback triggered, entries:', entries.length);

        let mostVisibleMonth = null;
        let maxRatio = 0;
        let secondMaxRatio = 0;

        // Find the most and second-most visible months
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          const month = entry.target.getAttribute('data-month');
        //   console.log(`Month ${month}: intersectionRatio = ${ratio.toFixed(2)}`);
          if (ratio > maxRatio) {
            secondMaxRatio = maxRatio;
            maxRatio = ratio;
            mostVisibleMonth = month;
          } else if (ratio > secondMaxRatio) {
            secondMaxRatio = ratio;
          }
        });

        console.log(
        //   `Most visible: ${mostVisibleMonth} (${maxRatio.toFixed(2)}), Second most: ${secondMaxRatio.toFixed(2)}`
        );

        // Only dispatch if the most visible month is at least 5% more visible and at least 50% in view
        if (mostVisibleMonth && maxRatio >= (secondMaxRatio + 0.05) && maxRatio > 0.5) {
          if (mostVisibleMonth !== currentMonthRef.current) {
            // Debounce dispatch to prevent rapid switching
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
              dispatch(setMonthInView(mostVisibleMonth));
              currentMonthRef.current = mostVisibleMonth;
            }, 500); // Avoid rapid switching
          } else {
            // console.log(`No dispatch: ${mostVisibleMonth} is already current`);
          }
        } else {
          console.log(
            // `No dispatch: visibility difference too small (${(maxRatio - secondMaxRatio).toFixed(2)} < 0.05) or maxRatio too low (${maxRatio.toFixed(2)} <= 0.5)`
          );
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: '0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // Track visibility at 10% increments
      }
    );

    // Observe month elements after DOM update
    const observeElements = () => {
      const monthElements = document.querySelectorAll('.monthBox.month[data-month]');
    //   console.log(
    //     'Found month elements:',
    //     monthElements.length,
    //     'with data-month values:',
    //     Array.from(monthElements).map((el) => el.getAttribute('data-month'))
    //   );
      if (monthElements.length === 0) {
        console.warn('No month elements found to observe. Check DOM rendering or selector.');
        return;
      }
      monthElements.forEach((element) => {
        observerRef.current.observe(element);
      });
    };

    // Delay observation to ensure DOM is ready
    const timeout = setTimeout(observeElements, 100);

    // Cleanup observer and debounce timeout on unmount or when months change
    return () => {
    //   console.log('Cleaning up observer');
      clearTimeout(timeout);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [months, dispatch, active]);

//   console.log('Returning current month in view:', currentMonthRef.current);
  return currentMonthRef.current;
};

export default useMonthObserver;