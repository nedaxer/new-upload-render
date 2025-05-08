import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../lib/auth';
import { useToast } from '@/hooks/use-toast';
import { insertUserSchema } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Registration schema with password confirmation
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema> & { confirmPassword: string };

export default function AuthPage() {
  const { toast } = useToast();
  const { login, register, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('login');

  // Login form
  const {
    register: registerLoginField,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Register form
  const {
    register: registerRegisterField,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password);
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'An error occurred during login',
        variant: 'destructive',
      });
    }
  };

  // Handle register form submission
  const onRegisterSubmit = async (data: RegisterFormData) => {
    // Check if passwords match
    if (data.password !== data.confirmPassword) {
      toast({
        title: 'Registration failed',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Remove confirmPassword as it's not part of the API schema
      const { confirmPassword, ...userData } = data;
      
      const result = await register(userData);
      
      toast({
        title: 'Registration successful',
        description: 'Please check your email for verification instructions',
      });
      
      // Redirect to verification page
      if (result && result.user && result.user.id) {
        setLocation(`/account/verify?userId=${result.user.id}`);
      }
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Nedaxer</h1>
          <p className="text-gray-500 mt-2">Your trusted crypto trading platform</p>
        </div>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          {/* Login Form */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      {...registerLoginField('username')}
                      placeholder="Enter your username"
                    />
                    {loginErrors.username && (
                      <p className="text-sm text-red-500">{loginErrors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      {...registerLoginField('password')}
                      placeholder="Enter your password"
                    />
                    {loginErrors.password && (
                      <p className="text-sm text-red-500">{loginErrors.password.message}</p>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                  
                  <p className="text-sm text-center mt-4">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="text-blue-500 hover:underline"
                      onClick={() => setActiveTab('register')}
                    >
                      Register here
                    </button>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Register Form */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Create a new account to start trading</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...registerRegisterField('firstName')}
                        placeholder="John"
                      />
                      {registerErrors.firstName && (
                        <p className="text-sm text-red-500">{registerErrors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...registerRegisterField('lastName')}
                        placeholder="Doe"
                      />
                      {registerErrors.lastName && (
                        <p className="text-sm text-red-500">{registerErrors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...registerRegisterField('username')}
                      placeholder="Choose a username"
                    />
                    {registerErrors.username && (
                      <p className="text-sm text-red-500">{registerErrors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerRegisterField('email')}
                      placeholder="your.email@example.com"
                    />
                    {registerErrors.email && (
                      <p className="text-sm text-red-500">{registerErrors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...registerRegisterField('password')}
                        placeholder="Create a password"
                      />
                      {registerErrors.password && (
                        <p className="text-sm text-red-500">{registerErrors.password.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...registerRegisterField('confirmPassword')}
                        placeholder="Confirm your password"
                      />
                      {registerErrors.confirmPassword && (
                        <p className="text-sm text-red-500">{registerErrors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Register'
                    )}
                  </Button>
                  
                  <p className="text-sm text-center mt-4">
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="text-blue-500 hover:underline"
                      onClick={() => setActiveTab('login')}
                    >
                      Login here
                    </button>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}