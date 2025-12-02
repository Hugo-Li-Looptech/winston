import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo, just navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border-2 border-foreground shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-secondary border-2 border-foreground flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">Log In</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter your ID"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12"
            />
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button type="button" variant="outline" className="w-28">
              Cancel
            </Button>
            <Button type="submit" className="w-28">
              Log In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
