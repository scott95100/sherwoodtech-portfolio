import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import PortfolioManagement from '../components/admin/PortfolioManagement';
import SystemInfo from '../components/admin/SystemInfo';

const AdminContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.lightGrey};
`;

const AdminHeader = styled.div`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl} 0;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.tealBlue};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.davysGrey};
`;

const AdminContent = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const TabNavigation = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.mediumGrey};
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 3px solid transparent;
  color: ${props => props.theme.colors.davysGrey};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    color: ${props => props.theme.colors.tealBlue};
    border-bottom-color: ${props => props.theme.colors.tealBlue};
  }

  &:hover {
    color: ${props => props.theme.colors.rackley};
  }
`;

const TabContent = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  padding: ${props => props.theme.spacing.xl};
`;

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'portfolios':
        return <PortfolioManagement />;
      case 'system':
        return <SystemInfo />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminContainer>
      <AdminHeader>
        <Container>
          <Title>Admin Panel</Title>
          <Subtitle>Manage your portfolio site and users</Subtitle>
        </Container>
      </AdminHeader>

      <AdminContent>
        <Container>
          <TabNavigation>
            <Tab 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </Tab>
            <Tab 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </Tab>
            <Tab 
              className={activeTab === 'portfolios' ? 'active' : ''}
              onClick={() => setActiveTab('portfolios')}
            >
              Portfolios
            </Tab>
            <Tab 
              className={activeTab === 'system' ? 'active' : ''}
              onClick={() => setActiveTab('system')}
            >
              System Info
            </Tab>
          </TabNavigation>

          <TabContent>
            {renderTabContent()}
          </TabContent>
        </Container>
      </AdminContent>
    </AdminContainer>
  );
};

export default Admin;
