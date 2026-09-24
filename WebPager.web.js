import React from 'react';
import { View } from 'react-native';

export default function WebPager({ children, currentPage }) {
  const slides = React.Children.toArray(children);
  return (
    <View style={{ flex: 1 }}>
      {slides[currentPage] || slides[0]}
    </View>
  );
}
