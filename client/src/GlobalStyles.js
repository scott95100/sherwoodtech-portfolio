import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fontSizes.base};
    font-weight: ${theme.fontWeights.normal};
    line-height: 1.6;
    color: ${theme.colors.blackOlive};
    background-color: ${theme.colors.white};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.fontWeights.semibold};
    line-height: 1.2;
    margin-bottom: ${theme.spacing.md};
    color: ${theme.colors.tealBlue};
  }

  h1 {
    font-size: ${theme.fontSizes['4xl']};
    font-weight: ${theme.fontWeights.bold};
  }

  h2 {
    font-size: ${theme.fontSizes['3xl']};
  }

  h3 {
    font-size: ${theme.fontSizes['2xl']};
  }

  h4 {
    font-size: ${theme.fontSizes.xl};
  }

  h5 {
    font-size: ${theme.fontSizes.lg};
  }

  h6 {
    font-size: ${theme.fontSizes.base};
  }

  p {
    margin-bottom: ${theme.spacing.md};
    color: ${theme.colors.davysGrey};
  }

  a {
    color: ${theme.colors.rackley};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${theme.colors.tealBlue};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.2s ease;
  }

  input, textarea, select {
    font-family: inherit;
    outline: none;
    border: 1px solid ${theme.colors.mediumGrey};
    border-radius: ${theme.borderRadius.md};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    transition: border-color 0.2s ease;

    &:focus {
      border-color: ${theme.colors.rackley};
      box-shadow: 0 0 0 3px ${theme.colors.rackley}20;
    }
  }

  /* Scrollbar Styles */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.lightGrey};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.mediumGrey};
    border-radius: ${theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.davysGrey};
  }

  /* Selection Styles */
  ::selection {
    background: ${theme.colors.darkSkyBlue};
    color: ${theme.colors.white};
  }

  /* Focus Styles for Accessibility */
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: 2px solid ${theme.colors.rackley};
    outline-offset: 2px;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.6s ease-out;
  }

  .slide-in-left {
    animation: slideInLeft 0.6s ease-out;
  }

  .slide-in-right {
    animation: slideInRight 0.6s ease-out;
  }

  /* Utility Classes */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.md};
  }

  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Loading Spinner */
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid ${theme.colors.lightGrey};
    border-top: 2px solid ${theme.colors.rackley};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Media Queries */
  @media (max-width: ${theme.breakpoints.md}) {
    body {
      font-size: ${theme.fontSizes.sm};
    }

    h1 {
      font-size: ${theme.fontSizes['3xl']};
    }

    h2 {
      font-size: ${theme.fontSizes['2xl']};
    }

    h3 {
      font-size: ${theme.fontSizes.xl};
    }

    .container {
      padding: 0 ${theme.spacing.sm};
    }
  }
`;

export default GlobalStyles;
