import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.lightGrey} 0%, ${props => props.theme.colors.white} 100%);
  text-align: center;
  padding: ${props => props.theme.spacing.md};
`;

const Content = styled.div`
  max-width: 500px;
`;

const ErrorCode = styled.h1`
  font-size: ${props => props.theme.fontSizes['6xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.tealBlue};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ErrorMessage = styled.h2`
  color: ${props => props.theme.colors.davysGrey};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Description = styled.p`
  color: ${props => props.theme.colors.mediumGrey};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const HomeButton = styled(Link)`
  display: inline-block;
  background: ${props => props.theme.colors.tealBlue};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.lg};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.semibold};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.rackley};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Content>
        <ErrorCode>404</ErrorCode>
        <ErrorMessage>Page Not Found</ErrorMessage>
        <Description>
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </Description>
        <HomeButton to="/">Back to Home</HomeButton>
      </Content>
    </NotFoundContainer>
  );
};

export default NotFound;
