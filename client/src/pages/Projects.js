import React from 'react';
import styled from 'styled-components';

const ProjectsContainer = styled.div`
  min-height: 100vh;
  padding: ${props => props.theme.spacing['4xl']} 0;
  background: ${props => props.theme.colors.white};
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

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const ProjectCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const ProjectImage = styled.div`
  height: 200px;
  background: linear-gradient(135deg, ${props => props.theme.colors.rackley}, ${props => props.theme.colors.airSuperiorityBlue});
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.fontSizes.lg};
`;

const ProjectContent = styled.div`
  padding: ${props => props.theme.spacing.xl};

  h3 {
    color: ${props => props.theme.colors.tealBlue};
    margin-bottom: ${props => props.theme.spacing.md};
  }

  p {
    margin-bottom: ${props => props.theme.spacing.lg};
  }
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const TechTag = styled.span`
  background: ${props => props.theme.colors.lightGrey};
  color: ${props => props.theme.colors.davysGrey};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const ProjectLink = styled.a`
  color: ${props => props.theme.colors.rackley};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.semibold};

  &:hover {
    color: ${props => props.theme.colors.tealBlue};
  }
`;

const sampleProjects = [
  {
    id: 1,
    title: "Portfolio Website",
    description: "A responsive portfolio website built with React and Node.js, featuring user authentication and dynamic content management.",
    technologies: ["React", "Node.js", "MongoDB", "Express.js", "Styled Components"],
    githubUrl: "#",
    liveUrl: "#"
  },
  {
    id: 2,
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with shopping cart, payment integration, and admin dashboard.",
    technologies: ["React", "Redux", "Node.js", "PostgreSQL", "Stripe API"],
    githubUrl: "#",
    liveUrl: "#"
  },
  {
    id: 3,
    title: "Task Management App",
    description: "Collaborative task management application with real-time updates and team collaboration features.",
    technologies: ["React", "Socket.io", "Express.js", "MongoDB", "JWT"],
    githubUrl: "#",
    liveUrl: "#"
  }
];

const Projects = () => {
  return (
    <ProjectsContainer>
      <Container>
        <Title>My Projects</Title>
        <ProjectGrid>
          {sampleProjects.map(project => (
            <ProjectCard key={project.id}>
              <ProjectImage>
                Project Screenshot
              </ProjectImage>
              <ProjectContent>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <TechStack>
                  {project.technologies.map(tech => (
                    <TechTag key={tech}>{tech}</TechTag>
                  ))}
                </TechStack>
                <ProjectLinks>
                  <ProjectLink href={project.githubUrl}>GitHub</ProjectLink>
                  <ProjectLink href={project.liveUrl}>Live Demo</ProjectLink>
                </ProjectLinks>
              </ProjectContent>
            </ProjectCard>
          ))}
        </ProjectGrid>
      </Container>
    </ProjectsContainer>
  );
};

export default Projects;
