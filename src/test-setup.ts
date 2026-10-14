if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }

  if (!window.scrollTo) {
    window.scrollTo = () => {};
  }

  if (!window.IntersectionObserver) {
    class MockIntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = '0px';
      readonly scrollMargin: string = '0px';
      readonly thresholds: ReadonlyArray<number> = [0];
      disconnect() {}
      observe() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: MockIntersectionObserver as unknown as typeof IntersectionObserver,
    });
  }

  if (!window.ResizeObserver) {
    class MockResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    }
    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      value: MockResizeObserver as unknown as typeof ResizeObserver,
    });
  }
}
