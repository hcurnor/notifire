import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import * as Sentry from '@sentry/react';
import { PasswordInput, Divider, Container, Button as GithubButton, Center } from '@mantine/core';
import { AuthContext } from '../../store/authContext';
import { api } from '../../api/api.client';
import { Button, colors, Input, Text, Title } from '../../design-system';
import { inputStyles } from '../../design-system/config/inputs.styles';
import { Github } from '../../design-system/icons';

type Props = {};

export function LoginForm({}: Props) {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);
  const { isLoading, mutateAsync, isError, error } = useMutation<
    { token: string },
    { error: string; message: string; statusCode: number },
    {
      email: string;
      password: string;
    }
  >((data) => api.post(`/v1/auth/login`, data));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  const onLogin = async (data) => {
    const itemData = {
      email: data.email,
      password: data.password,
    };

    try {
      const response = await mutateAsync(itemData);

      setToken((response as any).token);
      navigate('/templates');
    } catch (e: any) {
      if (e.statusCode !== 400) {
        Sentry.captureException(e);
      }
    }
  };

  return (
    <Container fluid>
      <Title>Sign In</Title>
      <Text size="lg" color={colors.B60} mb={60} mt={20}>
        Welcome back! Sign in with the data you entered in your registration
      </Text>
      <GithubButton
        my={30}
        variant="white"
        fullWidth
        radius="md"
        leftIcon={<Github />}
        sx={{ color: colors.B40, fontSize: '16px', fontWeight: '700', height: '50px' }}>
        Sign In with Github
      </GithubButton>
      <Divider label={<Text color={colors.B40}>Or</Text>} color={colors.B30} labelPosition="center" my="md" />

      <form onSubmit={handleSubmit(onLogin)}>
        <Input
          error={errors.email?.message}
          {...register('email', {
            required: 'Please provide an email',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please provide a valid email' },
          })}
          required
          label="Email"
          placeholder="Type your email..."
          data-test-id="email"
          mt={5}
        />
        <PasswordInput
          error={errors.password?.message}
          styles={inputStyles}
          mt={20}
          sx={{
            invalid: {
              color: 'blue',

              '&::placeholder': {
                opacity: 1,
                color: 'blue',
              },
            },
          }}
          radius="md"
          size="md"
          {...register('password', {
            required: 'Please input a password',
          })}
          required
          label="Password"
          placeholder="Type your password..."
          data-test-id="password"
        />
        <Link to="/auth/reset/request">
          <Text my={30} gradient align="center">
            Forgot Your Password?
          </Text>
        </Link>
        <Button mt={60} inherit loading={isLoading} submit>
          Sign In
        </Button>
        <Center mt={20}>
          <Text mr={10} size="md" color={colors.B60}>
            Don't have an account yet?{' '}
          </Text>
          <Link to="/auth/signup">
            <Text gradient>Sign Up</Text>
          </Link>
        </Center>
      </form>
    </Container>
  );
}