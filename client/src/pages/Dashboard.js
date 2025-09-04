import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: ${props => props.theme.spacing['4xl']} 0;
  background: ${props => props.theme.colors.lightGrey};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.tealBlue};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const WelcomeCard = styled.div`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  text-align: center;

  h3 {
    color: ${props => props.theme.colors.rackley};
    margin-bottom: ${props => props.theme.spacing.sm};
  }

  .number {
    font-size: ${props => props.theme.fontSizes['3xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.tealBlue};
  }
`;

const QuickActions = styled.div`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};

  h2 {
    margin-bottom: ${props => props.theme.spacing.lg};
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const ActionButton = styled.button`
  background: ${props => props.theme.colors.tealBlue};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.rackley};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardContainer>
      <Container>
        <Title>Dashboard</Title>
        
        <WelcomeCard>
          <h2>Welcome back, {user?.name}!</h2>
          <p>Manage your portfolio content and track your site's performance from here.</p>
        </WelcomeCard>

        <StatsGrid>
          <StatCard>
            <h3>Portfolio Views</h3>
            <div className="number">1,234</div>
          </StatCard>
          <StatCard>
            <h3>Projects</h3>
            <div className="number">12</div>
          </StatCard>
          <StatCard>
            <h3>Skills</h3>
            <div className="number">18</div>
          </StatCard>
          <StatCard>
            <h3>Experience</h3>
            <div className="number">3</div>
          </StatCard>
        </StatsGrid>

        <QuickActions>
          <h2>Quick Actions</h2>
          <ActionGrid>
            <ActionButton>Add New Project</ActionButton>
            <ActionButton>Update Skills</ActionButton>
            <ActionButton>Edit Experience</ActionButton>
            <ActionButton>Manage Profile</ActionButton>
            <ActionButton>View Portfolio</ActionButton>
            <ActionButton>Download Resume</ActionButton>
          </ActionGrid>
        </QuickActions>
      </Container>
    </DashboardContainer>
  );
};

export default Dashboard;
