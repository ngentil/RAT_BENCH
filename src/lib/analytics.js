import posthog from 'posthog-js';

const key = import.meta.env.VITE_POSTHOG_KEY;

export const initAnalytics = () => {
  if (!key) return;
  posthog.init(key, {
    api_host:        'https://eu.i.posthog.com',
    ui_host:         'https://eu.posthog.com',
    person_profiles: 'identified_only',
    autocapture:     false,
    capture_pageview: true,
    capture_pageleave: true,
  });
};

const loaded = () => key && posthog.__loaded;

export const identifyUser = (userId, props = {}) => {
  if (!loaded()) return;
  posthog.identify(userId, props);
};

export const track = (event, props = {}) => {
  if (!loaded()) return;
  posthog.capture(event, props);
};

export const resetAnalytics = () => {
  if (!loaded()) return;
  posthog.reset();
};
