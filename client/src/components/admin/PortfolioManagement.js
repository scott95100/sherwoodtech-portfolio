import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../../utils/axios';
import { FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';

const PortfolioContainer = styled.div``;

const PortfoliosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const PortfolioCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const PortfolioHeader = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.tealBlue}, ${props => props.theme.colors.rackley});
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.lg};
  position: relative;
`;

const VisibilityBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  background: ${props => props.isPublic ? props.theme.colors.success : props.theme.colors.warning};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const PortfolioTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.white};
`;

const PortfolioSubtitle = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: ${props => props.theme.fontSizes.sm};
`;

const PortfolioContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.lightGrey};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.theme.colors.lightGrey};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.davysGrey};
`;

const UserDetails = styled.div`
  flex: 1;

  .name {
    font-weight: ${props => props.theme.fontWeights.semibold};
    color: ${props => props.theme.colors.blackOlive};
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  .email {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.davysGrey};
  }
`;

const PortfolioStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
  
  .number {
    font-size: ${props => props.theme.fontSizes.lg};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.tealBlue};
    margin-bottom: ${props => props.theme.spacing.xs};
  }
  
  .label {
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.davysGrey};
    text-transform: uppercase;
    font-weight: ${props => props.theme.fontWeights.semibold};
  }
`;

const LastUpdated = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.mediumGrey};
  text-align: center;
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
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.davysGrey};
`;

const PortfolioManagement = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/portfolios');
      setPortfolios(response.data.portfolios);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <LoadingSpinner>
        <div className="spinner"></div>
      </LoadingSpinner>
    );
  }

  if (portfolios.length === 0) {
    return (
      <EmptyState>
        <h3>No Portfolios Found</h3>
        <p>No users have created portfolios yet.</p>
      </EmptyState>
    );
  }

  return (
    <PortfolioContainer>
      <PortfoliosGrid>
        {portfolios.map(portfolio => (
          <PortfolioCard key={portfolio._id}>
            <PortfolioHeader>
              <VisibilityBadge isPublic={portfolio.isPublic}>
                {portfolio.isPublic ? <FaEye /> : <FaEyeSlash />}
                {portfolio.isPublic ? 'Public' : 'Private'}
              </VisibilityBadge>
              
              <PortfolioTitle>
                {portfolio.personalInfo?.title || 'Untitled Portfolio'}
              </PortfolioTitle>
              <PortfolioSubtitle>
                {portfolio.personalInfo?.subtitle || 'No subtitle'}
              </PortfolioSubtitle>
            </PortfolioHeader>

            <PortfolioContent>
              <UserInfo>
                <UserAvatar>
                  <FaUser />
                </UserAvatar>
                <UserDetails>
                  <div className="name">{portfolio.user?.name}</div>
                  <div className="email">{portfolio.user?.email}</div>
                </UserDetails>
              </UserInfo>

              <PortfolioStats>
                <StatItem>
                  <div className="number">{portfolio.skills?.length || 0}</div>
                  <div className="label">Skills</div>
                </StatItem>
                <StatItem>
                  <div className="number">{portfolio.projects?.length || 0}</div>
                  <div className="label">Projects</div>
                </StatItem>
                <StatItem>
                  <div className="number">{portfolio.experience?.length || 0}</div>
                  <div className="label">Experience</div>
                </StatItem>
              </PortfolioStats>

              <LastUpdated>
                Last updated: {formatDate(portfolio.updatedAt)}
              </LastUpdated>
            </PortfolioContent>
          </PortfolioCard>
        ))}
      </PortfoliosGrid>
    </PortfolioContainer>
  );
};

export default PortfolioManagement;
