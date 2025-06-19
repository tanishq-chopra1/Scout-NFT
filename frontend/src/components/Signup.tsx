import { useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import supabase from '../supabaseClient';

interface SignupProps {
  onSignupSuccess: (user: User) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const { data, error }: { data: { user: User | null; session: any } | null; error: AuthError | null } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        return;
      }

      if (data?.user) {
        setMessage('Signup successful! Please check your email to confirm your account.');
        onSignupSuccess(data.user);
      } else {
        setMessage('Unexpected error occurred.');
      }
    } catch (error) {
      // Handle any other errors
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Unknown error occurred.');
      }
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Signup</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Signup;
