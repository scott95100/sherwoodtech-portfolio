import React from 'react';
import styled from 'styled-components';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.blackOlive};
  color: ${props => props.theme.colors.lightGrey};
  padding: ${props => props.theme.spacing['2xl']} 0 ${props => props.theme.spacing.lg} 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const FooterSection = styled.div`
  h3 {
    color: ${props => props.theme.colors.darkSkyBlue};
    margin-bottom: ${props => props.theme.spacing.lg};
    font-size: ${props => props.theme.fontSizes.lg};
  }

  p {
    line-height: 1.6;
    margin-bottom: ${props => props.theme.spacing.sm};
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const SocialLink = styled.a`
  color: ${props => props.theme.colors.lightGrey};
  font-size: ${props => props.theme.fontSizes.xl};
  transition: color 0.3s ease, transform 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.darkSkyBlue};
    transform: translateY(-2px);
  }
`;

const QuickLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};

  a {
    color: ${props => props.theme.colors.lightGrey};
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: ${props => props.theme.colors.darkSkyBlue};
    }
  }
`;

const ContactInfo = styled.div`
  p {
    margin-bottom: ${props => props.theme.spacing.sm};
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
  }

  svg {
    color: ${props => props.theme.colors.rackley};
  }
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${props => props.theme.colors.davysGrey};
  margin: ${props => props.theme.spacing.xl} 0 ${props => props.theme.spacing.lg} 0;
`;

const Copyright = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.mediumGrey};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <Container>
        <FooterContent>
          <FooterSection>
            <h3>Scott Sherwood</h3>
            <p>
              Full Stack Software Engineer passionate about creating innovative solutions 
              and building scalable applications with modern technologies.
            </p>
            <SocialLinks>
              <SocialLink href="https://github.com" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </SocialLink>
              <SocialLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </SocialLink>
              <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </SocialLink>
              <SocialLink href="mailto:scott@example.com">
                <FaEnvelope />
              </SocialLink>
            </SocialLinks>
          </FooterSection>

          <FooterSection>
            <h3>Quick Links</h3>
            <QuickLinks>
              <a href="/">Home</a>
              <a href="/about">About</a>
              <a href="/projects">Projects</a>
              <a href="/contact">Contact</a>
              <a href="/dashboard">Dashboard</a>
            </QuickLinks>
          </FooterSection>

          <FooterSection>
            <h3>Contact Info</h3>
            <ContactInfo>
              <p>
                <FaEnvelope />
                scott@example.com
              </p>
              <p>
                <FaLinkedin />
                linkedin.com/in/scott-sherwood
              </p>
              <p>
                <FaGithub />
                github.com/scott-sherwood
              </p>
            </ContactInfo>
          </FooterSection>
        </FooterContent>

        <Divider />
        
        <Copyright>
          <p>&copy; {currentYear} Scott Sherwood. All rights reserved.</p>
        </Copyright>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
