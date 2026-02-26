/**
 * Documentation routes - /docs/*
 */

import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { S } from './routeHelpers';

// All docs pages are lazy-loaded
const DocsLayout = lazy(() => import('../pages/docs/DocsLayout'));
const DocsHomePage = lazy(() => import('../pages/docs/DocsHomePage'));
const GettingStartedPage = lazy(() => import('../pages/docs/GettingStartedPage'));
const ChangelogPage = lazy(() => import('../pages/docs/ChangelogPage'));
const StudentGuidePage = lazy(() => import('../pages/docs/uhs/StudentGuidePage'));
const ParentGuidePage = lazy(() => import('../pages/docs/uhs/ParentGuidePage'));
const InstructorGuidePage = lazy(() => import('../pages/docs/uhs/InstructorGuidePage'));
const PartnerGuidePage = lazy(() => import('../pages/docs/uhs/PartnerGuidePage'));
const CoursesGuidePage = lazy(() => import('../pages/docs/uhs/CoursesGuidePage'));
const AssessmentsGuidePage = lazy(() => import('../pages/docs/uhs/AssessmentsGuidePage'));
const PaymentsGuidePage = lazy(() => import('../pages/docs/uhs/PaymentsGuidePage'));
const ForumGuidePage = lazy(() => import('../pages/docs/uhs/ForumGuidePage'));
const StoreGuidePage = lazy(() => import('../pages/docs/uhs/StoreGuidePage'));
const CertificatesGuidePage = lazy(() => import('../pages/docs/uhs/CertificatesGuidePage'));
const AITutorGuidePage = lazy(() => import('../pages/docs/bird/AITutorGuidePage'));
const CoPilotGuidePage = lazy(() => import('../pages/docs/bird/CoPilotGuidePage'));
const VoiceModeGuidePage = lazy(() => import('../pages/docs/bird/VoiceModeGuidePage'));
const LearningPathsGuidePage = lazy(() => import('../pages/docs/bird/LearningPathsGuidePage'));
const ApiOverviewPage = lazy(() => import('../pages/docs/api/ApiOverviewPage'));
const AuthApiPage = lazy(() => import('../pages/docs/api/AuthApiPage'));
const CoursesApiPage = lazy(() => import('../pages/docs/api/CoursesApiPage'));
const AITutorApiPage = lazy(() => import('../pages/docs/api/AITutorApiPage'));
const PaymentsApiPage = lazy(() => import('../pages/docs/api/PaymentsApiPage'));
const MoreApisPage = lazy(() => import('../pages/docs/api/MoreApisPage'));
const DocsFAQPage = lazy(() => import('../pages/docs/FAQPage'));

export const docsRoutes = (
  <Route path="/docs" element={<S><DocsLayout /></S>}>
    <Route index element={<S><DocsHomePage /></S>} />
    <Route path="getting-started" element={<S><GettingStartedPage /></S>} />
    <Route path="changelog" element={<S><ChangelogPage /></S>} />

    {/* UHS Platform Guides */}
    <Route path="uhs/student" element={<S><StudentGuidePage /></S>} />
    <Route path="uhs/parent" element={<S><ParentGuidePage /></S>} />
    <Route path="uhs/instructor" element={<S><InstructorGuidePage /></S>} />
    <Route path="uhs/partner" element={<S><PartnerGuidePage /></S>} />
    <Route path="uhs/courses" element={<S><CoursesGuidePage /></S>} />
    <Route path="uhs/assessments" element={<S><AssessmentsGuidePage /></S>} />
    <Route path="uhs/payments" element={<S><PaymentsGuidePage /></S>} />
    <Route path="uhs/forum" element={<S><ForumGuidePage /></S>} />
    <Route path="uhs/store" element={<S><StoreGuidePage /></S>} />
    <Route path="uhs/certificates" element={<S><CertificatesGuidePage /></S>} />

    {/* Bird AI Guides */}
    <Route path="bird/ai-tutor" element={<S><AITutorGuidePage /></S>} />
    <Route path="bird/co-pilot" element={<S><CoPilotGuidePage /></S>} />
    <Route path="bird/voice-mode" element={<S><VoiceModeGuidePage /></S>} />
    <Route path="bird/learning-paths" element={<S><LearningPathsGuidePage /></S>} />

    {/* API Documentation */}
    <Route path="api" element={<S><ApiOverviewPage /></S>} />
    <Route path="api/auth" element={<S><AuthApiPage /></S>} />
    <Route path="api/courses" element={<S><CoursesApiPage /></S>} />
    <Route path="api/ai-tutor" element={<S><AITutorApiPage /></S>} />
    <Route path="api/payments" element={<S><PaymentsApiPage /></S>} />
    <Route path="api/more" element={<S><MoreApisPage /></S>} />

    <Route path="faq" element={<S><DocsFAQPage /></S>} />
  </Route>
);
