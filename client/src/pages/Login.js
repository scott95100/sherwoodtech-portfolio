import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.lightGrey} 0%, ${props => props.theme.colors.white} 100%);
  padding: ${props => props.theme.spacing.md};
`;

const LoginForm = styled.form`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.lg};
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.tealBlue};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.davysGrey};
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.mediumGrey};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.base};
  transition: border-color 0.3s ease;

  &:focus {
    border-color: ${props => props.theme.colors.rackley};
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.rackley}20;
  }

  &.error {
    border-color: ${props => props.theme.colors.error};
  }
`;

const ErrorMessage = styled.span`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-top: ${props => props.theme.spacing.xs};
  display: block;
`;

const SubmitButton = styled.button`
  background: ${props => props.theme.colors.tealBlue};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-bottom: ${props => props.theme.spacing.lg};

  &:hover {
    background: ${props => props.theme.colors.rackley};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${props => props.theme.colors.mediumGrey};
    cursor: not-allowed;
    transform: none;
  }
`;

const SignupLink = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.davysGrey};
  
  a {
    color: ${props => props.theme.colors.rackley};
    text-decoration: none;
    font-weight: ${props => props.theme.fontWeights.semibold};

    &:hover {
      color: ${props => props.theme.colors.tealBlue};
    }
  }
`;

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const result = await login(data);
      if (result.success) {
        // Don't navigate here - let useEffect handle it after state updates
        reset(); // Clear the form
      }
    } catch (error) {
      console.error('Login error:', error);
      reset(); // Clear the form on error too
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit(onSubmit)}>
        <Title>Login</Title>
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className={errors.email ? 'error' : ''}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Please enter a valid email address'
              }
            })}
          />
          {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            className={errors.password ? 'error' : ''}
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
          />
          {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
        </FormGroup>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </SubmitButton>

        <SignupLink>
          Don't have an account? <Link to="/register">Sign up here</Link>
        </SignupLink>
      </LoginForm>
    </LoginContainer>
  );
};

export default Login;
