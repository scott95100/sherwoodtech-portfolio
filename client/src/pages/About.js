import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
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
  text-align: center;
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing['2xl']};
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const TextSection = styled.div`
  h2 {
    color: ${props => props.theme.colors.rackley};
    margin-bottom: ${props => props.theme.spacing.lg};
  }

  p {
    margin-bottom: ${props => props.theme.spacing.md};
    line-height: 1.8;
  }
`;

const ImageSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: ${props => props.theme.colors.darkSkyBlue};
  border-radius: ${props => props.theme.borderRadius.xl};
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.fontSizes.xl};
`;

const About = () => {
  return (
    <AboutContainer>
      <Container>
        <Title>About Me</Title>
        <Content>
          <TextSection>
            <h2>Hello, I'm Scott!</h2>
            <p>
              I'm a passionate Full Stack Software Engineer with expertise in modern web technologies. 
              I love creating clean, efficient, and scalable solutions that make a real difference.
            </p>
            <p>
              With a strong foundation in both frontend and backend development, I specialize in 
              the MERN stack (MongoDB, Express.js, React, Node.js) and enjoy working on projects 
              that challenge me to grow and learn new technologies.
            </p>
            <p>
              When I'm not coding, I enjoy exploring new technologies, contributing to open source 
              projects, and sharing knowledge with the developer community.
            </p>
          </TextSection>
          <ImageSection>
            Professional Photo Coming Soon
          </ImageSection>
        </Content>
      </Container>
    </AboutContainer>
  );
};

export default About;
