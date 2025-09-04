import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../../utils/axios';
import { FaUsers, FaPortrait, FaEye, FaUserClock } from 'react-icons/fa';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border-left: 4px solid ${props => props.color || props.theme.colors.tealBlue};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const StatIcon = styled.div`
  color: ${props => props.color || props.theme.colors.tealBlue};
  font-size: ${props => props.theme.fontSizes['2xl']};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatNumber = styled.div`
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.blackOlive};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.davysGrey};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const RecentActivitySection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.xl};
  margin-top: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ActivityCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const ActivityHeader = styled.div`
  background: ${props => props.theme.colors.lightGrey};
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.mediumGrey};

  h3 {
    color: ${props => props.theme.colors.tealBlue};
    margin: 0;
  }
`;

const ActivityList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.lightGrey};
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.colors.lightGrey};
  }
`;

const ActivityText = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.davysGrey};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ActivityTime = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.mediumGrey};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid ${props => props.theme.colors.lightGrey};
    border-top: 4px solid ${props => props.theme.colors.rackley};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/recent-activity')
      ]);

      setStats(statsRes.data.stats);
      setActivity(activityRes.data.activity);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <LoadingSpinner>
        <div className="spinner"></div>
      </LoadingSpinner>
    );
  }

  return (
    <div>
      <DashboardGrid>
        <StatCard color={props => props.theme.colors.tealBlue}>
          <StatIcon color={props => props.theme.colors.tealBlue}>
            <FaUsers />
          </StatIcon>
          <StatNumber>{stats?.totalUsers || 0}</StatNumber>
          <StatLabel>Total Users</StatLabel>
        </StatCard>

        <StatCard color={props => props.theme.colors.rackley}>
          <StatIcon color={props => props.theme.colors.rackley}>
            <FaPortrait />
          </StatIcon>
          <StatNumber>{stats?.totalPortfolios || 0}</StatNumber>
          <StatLabel>Total Portfolios</StatLabel>
        </StatCard>

        <StatCard color={props => props.theme.colors.airSuperiorityBlue}>
          <StatIcon color={props => props.theme.colors.airSuperiorityBlue}>
            <FaEye />
          </StatIcon>
          <StatNumber>{stats?.publicPortfolios || 0}</StatNumber>
          <StatLabel>Public Portfolios</StatLabel>
        </StatCard>

        <StatCard color={props => props.theme.colors.darkSkyBlue}>
          <StatIcon color={props => props.theme.colors.darkSkyBlue}>
            <FaUserClock />
          </StatIcon>
          <StatNumber>{stats?.recentLogins || 0}</StatNumber>
          <StatLabel>Recent Logins (24h)</StatLabel>
        </StatCard>
      </DashboardGrid>

      <RecentActivitySection>
        <ActivityCard>
          <ActivityHeader>
            <h3>Recent User Registrations</h3>
          </ActivityHeader>
          <ActivityList>
            {activity?.recentUsers?.length > 0 ? (
              activity.recentUsers.map(user => (
                <ActivityItem key={user._id}>
                  <ActivityText>
                    <strong>{user.name}</strong> ({user.email}) registered
                    {user.role === 'admin' && <span style={{ color: '#e74c3c' }}> • Admin</span>}
                  </ActivityText>
                  <ActivityTime>{formatTimeAgo(user.createdAt)}</ActivityTime>
                </ActivityItem>
              ))
            ) : (
              <ActivityItem>
                <ActivityText>No recent registrations</ActivityText>
              </ActivityItem>
            )}
          </ActivityList>
        </ActivityCard>

        <ActivityCard>
          <ActivityHeader>
            <h3>Recent Portfolio Updates</h3>
          </ActivityHeader>
          <ActivityList>
            {activity?.recentPortfolios?.length > 0 ? (
              activity.recentPortfolios.map(portfolio => (
                <ActivityItem key={portfolio._id}>
                  <ActivityText>
                    <strong>{portfolio.user?.name}</strong> updated portfolio
                    {portfolio.personalInfo?.title && (
                      <span> • {portfolio.personalInfo.title}</span>
                    )}
                  </ActivityText>
                  <ActivityTime>{formatTimeAgo(portfolio.updatedAt)}</ActivityTime>
                </ActivityItem>
              ))
            ) : (
              <ActivityItem>
                <ActivityText>No recent portfolio updates</ActivityText>
              </ActivityItem>
            )}
          </ActivityList>
        </ActivityCard>
      </RecentActivitySection>
    </div>
  );
};

export default AdminDashboard;
