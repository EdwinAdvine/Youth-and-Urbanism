import React from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Award,
  Eye,
  EyeOff,
  ChevronRight,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const DashboardPartner: React.FC = () => {
  // Mock user data for direct dashboard access
  const user = {
    id: 'demo-partner',
    name: 'Demo Partner',
    email: 'partner@example.com',
    role: 'partner' as const,
    createdAt: new Date(),
    lastLogin: new Date(),
    position: 'Community Partner',
    preferences: {
      theme: 'light' as const,
      language: 'en' as const,
      notifications: true,
      emailNotifications: true,
      pushNotifications: false,
      dashboardWidgets: []
    }
  };
  // Mock data for partner dashboard
  const stats = [
    {
      title: 'Active Partnerships',
      value: '12',
      icon: Building2,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10'
    },
    {
      title: 'Students Supported',
      value: '1,247',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Programs Funded',
      value: '8',
      icon: Award,
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    {
      title: 'Community Impact',
      value: '94%',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    }
  ];

  const recentUpdates = [
    {
      id: 1,
      title: 'New STEM Lab Opening',
      date: '2 days ago',
      excerpt: 'Our new state-of-the-art STEM laboratory is now operational, providing students with hands-on learning experiences in robotics and coding.',
      category: 'Facility'
    },
    {
      id: 2,
      title: 'Scholarship Program Expansion',
      date: '1 week ago',
      excerpt: 'Thanks to generous donations, we\'ve expanded our scholarship program to support an additional 50 students from underprivileged backgrounds.',
      category: 'Program'
    },
    {
      id: 3,
      title: 'Community Garden Initiative',
      date: '2 weeks ago',
      excerpt: 'Students and community members collaborated to create a sustainable garden that will provide fresh produce for our nutrition program.',
      category: 'Community'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Annual Fundraising Gala',
      date: 'March 15, 2024',
      time: '6:00 PM',
      location: 'Grand Ballroom, City Center',
      description: 'Join us for an evening of dinner, dancing, and fundraising to support our educational programs.'
    },
    {
      id: 2,
      title: 'STEM Workshop for Parents',
      date: 'March 22, 2024',
      time: '10:00 AM',
      location: 'School Auditorium',
      description: 'Learn how to support your child\'s interest in science, technology, engineering, and math at home.'
    },
    {
      id: 3,
      title: 'Community Outreach Day',
      date: 'April 5, 2024',
      time: '9:00 AM',
      location: 'Various Locations',
      description: 'Volunteer opportunities available for tutoring, mentoring, and community service projects.'
    }
  ];

  const contactInfo = {
    coordinator: 'Sarah Johnson',
    email: 'partnerships@urbanhomeschool.com',
    phone: '+1 (555) 123-4567',
    officeHours: 'Monday - Friday, 9:00 AM - 5:00 PM'
  };

  return (
    <DashboardLayout role="partner">
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-[#181C1F] border border-[#2A3035] rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">{stat.title}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Our Latest Updates */}
            <div className="bg-[#181C1F] border border-[#2A3035] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Our Latest Updates</h2>
                <button className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-2">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {recentUpdates.map((update) => (
                  <div key={update.id} className="border border-[#2A3035] rounded-lg p-4 hover:bg-[#22272B] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full font-medium">
                        {update.category}
                      </span>
                      <span className="text-xs text-white/60">{update.date}</span>
                    </div>
                    <h3 className="font-medium text-white mb-2">{update.title}</h3>
                    <p className="text-sm text-white/80 mb-3">{update.excerpt}</p>
                    <button className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-1">
                      Read More
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-[#181C1F] border border-[#2A3035] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
                <button className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-2">
                  View Calendar
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border border-[#2A3035] rounded-lg p-4 hover:bg-[#22272B] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        </div>
                        <p className="text-sm text-white/80">{event.description}</p>
                      </div>
                      <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                        RSVP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPartner;