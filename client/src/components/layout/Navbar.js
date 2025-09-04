import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const Nav = styled.nav`
  background: ${props => props.theme.colors.white};
  box-shadow: ${props => props.theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${props => props.theme.zIndex.sticky};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

const Logo = styled(Link)`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.tealBlue};
  text-decoration: none;

  &:hover {
    color: ${props => props.theme.colors.rackley};
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${props => props.theme.colors.white};
    flex-direction: column;
    padding: ${props => props.theme.spacing.lg};
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.colors.davysGrey};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.medium};
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.tealBlue};
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    margin-top: ${props => props.theme.spacing.lg};
  }
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.semibold};
  transition: all 0.2s ease;
  cursor: pointer;
`;

const LoginButton = styled(Button)`
  background: transparent;
  color: ${props => props.theme.colors.tealBlue};
  border: 1px solid ${props => props.theme.colors.tealBlue};

  &:hover {
    background: ${props => props.theme.colors.tealBlue};
    color: ${props => props.theme.colors.white};
  }
`;

const SignupButton = styled(Button)`
  background: ${props => props.theme.colors.tealBlue};
  color: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.tealBlue};

  &:hover {
    background: ${props => props.theme.colors.rackley};
    border-color: ${props => props.theme.colors.rackley};
  }
`;

const LogoutButton = styled(Button)`
  background: ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.error};

  &:hover {
    background: #c82333;
    border-color: #c82333;
  }
`;

const UserInfo = styled.span`
  color: ${props => props.theme.colors.davysGrey};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const MobileToggle = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: ${props => props.theme.fontSizes.xl};
  color: ${props => props.theme.colors.tealBlue};
  cursor: pointer;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: block;
  }
`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <Nav>
      <Container>
        <Logo to="/" onClick={handleLinkClick}>Scott Sherwood</Logo>
        
        <NavLinks isOpen={isOpen}>
          <NavLink to="/" onClick={handleLinkClick}>Home</NavLink>
          <NavLink to="/about" onClick={handleLinkClick}>About</NavLink>
          <NavLink to="/projects" onClick={handleLinkClick}>Projects</NavLink>
          <NavLink to="/contact" onClick={handleLinkClick}>Contact</NavLink>
          
          {isAuthenticated && (
            <NavLink to="/dashboard" onClick={handleLinkClick}>Dashboard</NavLink>
          )}
          
          {isAuthenticated && user?.role === 'admin' && (
            <NavLink to="/admin" onClick={handleLinkClick}>Admin</NavLink>
          )}
          
          <AuthButtons>
            {isAuthenticated ? (
              <>
                <UserInfo>Welcome, {user?.name}</UserInfo>
                <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
              </>
            ) : (
              <>
                <LoginButton as={Link} to="/login" onClick={handleLinkClick}>
                  Login
                </LoginButton>
                <SignupButton as={Link} to="/register" onClick={handleLinkClick}>
                  Sign Up
                </SignupButton>
              </>
            )}
          </AuthButtons>
        </NavLinks>

        <MobileToggle onClick={() => setIsOpen(!isOpen)}>
          ☰
        </MobileToggle>
      </Container>
    </Nav>
  );
};

export default Navbar;
