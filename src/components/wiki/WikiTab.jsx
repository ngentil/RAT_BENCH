import React, { useState } from 'react';
import WikiHomePage from './WikiHomePage';
import WikiEntryPage from './WikiEntryPage';

// Embedded wiki experience for the main app's Wiki tab.
// Uses local state for navigation — no URL changes.
function WikiTab({ profile }) {
  const [currentSlug, setCurrentSlug] = useState(null);

  if (currentSlug) {
    return (
      <WikiEntryPage
        slug={currentSlug}
        profile={profile}
        onBack={() => setCurrentSlug(null)}
        embedded
      />
    );
  }

  return (
    <WikiHomePage
      onSelect={slug => setCurrentSlug(slug)}
      embedded
    />
  );
}

export default WikiTab;
