/**
 * Partner Services Index
 * Centralized export for all partner-related API services
 */

export * from './partnerDashboardService';
export * from './sponsorshipService';
export * from './partnerFinanceService';
export * from './partnerAnalyticsService';
export * from './partnerContentService';
export * from './partnerSupportService';
export * from './partnerAccountService';

// Default exports
export { default as partnerDashboardService } from './partnerDashboardService';
export { default as sponsorshipService } from './sponsorshipService';
export { default as partnerFinanceService } from './partnerFinanceService';
export { default as partnerAnalyticsService } from './partnerAnalyticsService';
export { default as partnerContentService } from './partnerContentService';
export { default as partnerSupportService } from './partnerSupportService';
export { default as partnerAccountService } from './partnerAccountService';
