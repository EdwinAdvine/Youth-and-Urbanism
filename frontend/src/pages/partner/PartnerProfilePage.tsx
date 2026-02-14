import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Upload,
  Users,
  Plus,
  Trash2,
  Edit,
  Shield,
  Award,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import {
  getPartnerProfile,
  updatePartnerProfile,
  getTeamMembers,
} from '../../services/partner/partnerAccountService';
import type { PartnerProfile } from '../../types/partner';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type TabType = 'organization' | 'branding' | 'team' | 'partnership';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'active' | 'pending';
}

// ---- Fallback / default data used when the API is unavailable ----

const FALLBACK_ORG_DATA = {
  name: 'Tech Foundation Kenya',
  legalName: 'Tech Foundation Kenya Ltd',
  registrationNumber: 'PBO/123456',
  email: 'contact@techfoundation.ke',
  phone: '+254 712 345 678',
  address: '123 Innovation Drive, Nairobi',
  website: 'https://techfoundation.ke',
  description:
    'Empowering Kenyan youth through technology education and digital literacy programs. We believe in creating opportunities for underprivileged children to access quality STEM education.',
};

const FALLBACK_BRANDING_DATA = {
  primaryColor: '#E40000',
  logo: null as string | null,
  tagline: 'Empowering Through Technology',
  communicationPreferences: {
    monthlyReports: true,
    achievementAlerts: true,
    billingNotifications: true,
    programUpdates: true,
  },
};

const FALLBACK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'John Kamau',
    email: 'john.kamau@techfoundation.ke',
    role: 'Program Director',
    permissions: ['View Reports', 'Manage Programs', 'View Billing'],
    status: 'active',
  },
  {
    id: '2',
    name: 'Mary Wanjiku',
    email: 'mary.wanjiku@techfoundation.ke',
    role: 'Finance Manager',
    permissions: ['View Billing', 'Process Payments'],
    status: 'active',
  },
  {
    id: '3',
    name: 'David Otieno',
    email: 'david.otieno@techfoundation.ke',
    role: 'Program Coordinator',
    permissions: ['View Reports', 'View Programs'],
    status: 'pending',
  },
];

const FALLBACK_PARTNERSHIP_TIER = {
  name: 'Gold Partner',
  level: 'gold',
  benefits: [
    'Priority support response time',
    'Monthly detailed analytics reports',
    'Quarterly strategy sessions with education experts',
    'Custom branding on certificates',
    'Exclusive partner events access',
    'Annual impact assessment report',
  ],
  childrenSupported: 247,
  programsActive: 4,
  joinedDate: 'Jan 2024',
};

// ---- Helper: map API PartnerProfile to local orgData shape ----

const mapProfileToOrgData = (profile: PartnerProfile) => ({
  name: profile.org_name || FALLBACK_ORG_DATA.name,
  legalName: profile.display_name || profile.org_name || FALLBACK_ORG_DATA.legalName,
  registrationNumber: profile.registration_number || FALLBACK_ORG_DATA.registrationNumber,
  email: profile.contact_email || FALLBACK_ORG_DATA.email,
  phone: profile.contact_phone || FALLBACK_ORG_DATA.phone,
  address: FALLBACK_ORG_DATA.address, // address not in PartnerProfile, keep fallback
  website: profile.website_url || FALLBACK_ORG_DATA.website,
  description: profile.bio || FALLBACK_ORG_DATA.description,
});

const mapProfileToBrandingData = (profile: PartnerProfile) => ({
  primaryColor:
    profile.branding_config?.primaryColor || FALLBACK_BRANDING_DATA.primaryColor,
  logo: profile.logo_url || FALLBACK_BRANDING_DATA.logo,
  tagline: profile.tagline || FALLBACK_BRANDING_DATA.tagline,
  communicationPreferences:
    profile.branding_config?.communicationPreferences ||
    FALLBACK_BRANDING_DATA.communicationPreferences,
});

const mapProfileToPartnershipTier = (profile: PartnerProfile) => ({
  ...FALLBACK_PARTNERSHIP_TIER,
  level: profile.partnership_tier || FALLBACK_PARTNERSHIP_TIER.level,
  name:
    profile.partnership_tier
      ? `${profile.partnership_tier.charAt(0).toUpperCase() + profile.partnership_tier.slice(1)} Partner`
      : FALLBACK_PARTNERSHIP_TIER.name,
});

const mapTeamMember = (
  member: { id: string; name: string; email: string; role: string; permissions: string[]; added_at: string }
): TeamMember => ({
  id: member.id,
  name: member.name,
  email: member.email,
  role: member.role,
  permissions: member.permissions,
  status: 'active',
});

// ---- Component ----

const PartnerProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('organization');
  const [isEditing, setIsEditing] = useState(false);

  // Data state
  const [orgData, setOrgData] = useState(FALLBACK_ORG_DATA);
  const [brandingData, setBrandingData] = useState(FALLBACK_BRANDING_DATA);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(FALLBACK_TEAM_MEMBERS);
  const [partnershipTier, setPartnershipTier] = useState(FALLBACK_PARTNERSHIP_TIER);

  // Keep a reference to the raw profile for building update payloads
  const [profileRef, setProfileRef] = useState<PartnerProfile | null>(null);

  // Loading / error / saving state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ---- Fetch data on mount ----
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [profile, team] = await Promise.all([
          getPartnerProfile(),
          getTeamMembers(),
        ]);

        if (cancelled) return;

        // Map API data into local state shapes
        setProfileRef(profile);
        setOrgData(mapProfileToOrgData(profile));
        setBrandingData(mapProfileToBrandingData(profile));
        setPartnershipTier(mapProfileToPartnershipTier(profile));
        setTeamMembers(team.map(mapTeamMember));
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load partner profile, using fallback data:', err);
        // Keep fallback data already set as initial state
        setError('Could not load profile from server. Showing cached data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Save handlers ----

  const handleSaveOrganization = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Partial<PartnerProfile> = {
        org_name: orgData.name,
        display_name: orgData.legalName,
        registration_number: orgData.registrationNumber,
        contact_email: orgData.email,
        contact_phone: orgData.phone,
        website_url: orgData.website,
        bio: orgData.description,
      };
      const updated = await updatePartnerProfile(payload);
      setProfileRef(updated);
      setOrgData(mapProfileToOrgData(updated));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save organization data:', err);
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Partial<PartnerProfile> = {
        tagline: brandingData.tagline,
        branding_config: {
          ...(profileRef?.branding_config || {}),
          primaryColor: brandingData.primaryColor,
          communicationPreferences: brandingData.communicationPreferences,
        },
      };
      const updated = await updatePartnerProfile(payload);
      setProfileRef(updated);
      setBrandingData(mapProfileToBrandingData(updated));
    } catch (err) {
      console.error('Failed to save branding preferences:', err);
      setSaveError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'organization', label: 'Organization Details', icon: Building2 },
    { id: 'branding', label: 'Branding & Preferences', icon: Globe },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'partnership', label: 'Partnership Tier', icon: Award },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'organization':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Organization Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#E40000] rounded-lg hover:bg-[#E40000]/30 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Organization Name</label>
                  <input
                    type="text"
                    value={orgData.name}
                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Legal Name</label>
                  <input
                    type="text"
                    value={orgData.legalName}
                    onChange={(e) => setOrgData({ ...orgData, legalName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Registration Number</label>
                  <input
                    type="text"
                    value={orgData.registrationNumber}
                    onChange={(e) => setOrgData({ ...orgData, registrationNumber: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="email"
                      value={orgData.email}
                      onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50 disabled:opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="tel"
                      value={orgData.phone}
                      onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50 disabled:opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="url"
                      value={orgData.website}
                      onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50 disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="text"
                      value={orgData.address}
                      onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50 disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Description</label>
                  <textarea
                    value={orgData.description}
                    onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50 disabled:opacity-50 resize-none"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveOrganization}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-[#2A2F34] transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                  {saveError && (
                    <p className="text-sm text-red-400">{saveError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Branding Configuration</h3>

              <div className="space-y-6">
                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Organization Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-[#22272B] border-2 border-dashed border-gray-200 dark:border-[#2A2F34] rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-400 dark:text-white/40" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-[#2A2F34] transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-2">PNG or JPG. Max 2MB. Recommended 400x400px</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Tagline</label>
                  <input
                    type="text"
                    value={brandingData.tagline}
                    onChange={(e) => setBrandingData({ ...brandingData, tagline: e.target.value })}
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-3">Communication Preferences</label>
                  <div className="space-y-3">
                    {Object.entries(brandingData.communicationPreferences).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setBrandingData({
                              ...brandingData,
                              communicationPreferences: {
                                ...brandingData.communicationPreferences,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 rounded border-gray-200 dark:border-[#2A2F34] bg-gray-100 dark:bg-[#22272B] text-[#E40000] focus:ring-[#E40000]/50"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSaveBranding}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                  {saveError && (
                    <p className="text-sm text-red-400">{saveError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF4444] transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Member
                </button>
              </div>

              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg p-4 hover:bg-[#2A2F34] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-gray-900 dark:text-white font-medium">{member.name}</h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              member.status === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {member.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-white/60 mb-2">{member.email}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-4 h-4 text-[#E40000]" />
                          <span className="text-xs text-gray-500 dark:text-white/60">{member.role}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {member.permissions.map((perm, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 text-xs rounded"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-[#2A2F34] rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-500 dark:text-white/60" />
                        </button>
                        <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'partnership':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-8 h-8 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{partnershipTier.name}</h2>
                  </div>
                  <p className="text-gray-500 dark:text-white/60">Member since {partnershipTier.joinedDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-[#181C1F]/50 rounded-lg p-4">
                  <p className="text-gray-400 dark:text-white/40 text-xs mb-1">Children Supported</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{partnershipTier.childrenSupported}</p>
                </div>
                <div className="bg-white dark:bg-[#181C1F]/50 rounded-lg p-4">
                  <p className="text-gray-400 dark:text-white/40 text-xs mb-1">Active Programs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{partnershipTier.programsActive}</p>
                </div>
                <div className="bg-white dark:bg-[#181C1F]/50 rounded-lg p-4">
                  <p className="text-gray-400 dark:text-white/40 text-xs mb-1">Partnership Level</p>
                  <p className="text-2xl font-bold text-yellow-400 capitalize">
                    {partnershipTier.level}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Partnership Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {partnershipTier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-white/80">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upgrade Your Partnership</h3>
              <p className="text-gray-500 dark:text-white/60 mb-4">
                Unlock more benefits and impact by upgrading to our Platinum partnership tier.
              </p>
              <button className="px-6 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF4444] transition-colors">
                View Upgrade Options
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Partner Profile</h1>
            <p className="text-gray-500 dark:text-white/60">Manage your organization details and preferences</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#E40000] text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-[#22272B] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error banner */}
        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-sm text-yellow-300">
            {error}
          </div>
        )}

        {/* Content */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-[#E40000] animate-spin" />
              <span className="ml-3 text-gray-500 dark:text-white/60">Loading profile...</span>
            </div>
          ) : (
            renderContent()
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerProfilePage;
