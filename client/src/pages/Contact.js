import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const ContactContainer = styled.div`
  min-height: 100vh;
  padding: ${props => props.theme.spacing['4xl']} 0;
  background: ${props => props.theme.colors.lightGrey};
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.tealBlue};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ContactForm = styled.form`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
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

const TextArea = styled.textarea`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.mediumGrey};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.base};
  min-height: 120px;
  resize: vertical;
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

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Contact form data:', data);
      toast.success('Message sent successfully! I\'ll get back to you soon.');
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContactContainer>
      <Container>
        <Title>Get In Touch</Title>
        <ContactForm onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              className={errors.name ? 'error' : ''}
              {...register('name', { 
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
            />
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </FormGroup>

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
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              className={errors.subject ? 'error' : ''}
              {...register('subject', { 
                required: 'Subject is required',
                minLength: { value: 5, message: 'Subject must be at least 5 characters' }
              })}
            />
            {errors.subject && <ErrorMessage>{errors.subject.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="message">Message</Label>
            <TextArea
              id="message"
              className={errors.message ? 'error' : ''}
              {...register('message', { 
                required: 'Message is required',
                minLength: { value: 10, message: 'Message must be at least 10 characters' }
              })}
            />
            {errors.message && <ErrorMessage>{errors.message.message}</ErrorMessage>}
          </FormGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </SubmitButton>
        </ContactForm>
      </Container>
    </ContactContainer>
  );
};

export default Contact;
