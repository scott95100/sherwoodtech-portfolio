import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.tealBlue} 0%, ${props => props.theme.colors.darkSkyBlue} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${props => props.theme.colors.white};
`;

const Hero = styled(motion.div)`
  max-width: 800px;
  padding: ${props => props.theme.spacing.xl};
`;

const Title = styled(motion.h1)`
  font-size: ${props => props.theme.fontSizes['5xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.white};
`;

const Subtitle = styled(motion.h2)`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.normal};
  margin-bottom: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.lightGrey};
`;

const Description = styled(motion.p)`
  font-size: ${props => props.theme.fontSizes.lg};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.lightGrey};
`;

const CTAButton = styled(motion.button)`
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.tealBlue};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.lightGrey};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const Home = () => {
  return (
    <HomeContainer>
      <Hero
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Title
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Scott Sherwood
        </Title>
        <Subtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Full Stack Software Engineer
        </Subtitle>
        <Description
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Passionate about creating innovative solutions and building scalable applications 
          with modern technologies. Specializing in MERN stack development and delivering 
          exceptional user experiences.
        </Description>
        <CTAButton
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View My Work
        </CTAButton>
      </Hero>
    </HomeContainer>
  );
};

export default Home;
