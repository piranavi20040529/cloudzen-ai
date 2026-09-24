import React from 'react';
import PagerView from 'react-native-pager-view';

export default function WebPager({ pagerRef, style, initialPage, onPageSelected, children }) {
  return (
    <PagerView
      ref={pagerRef}
      style={style}
      initialPage={initialPage}
      onPageSelected={onPageSelected}
    >
      {children}
    </PagerView>
  );
}
