import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import xz1IdLogo from '@/assets/xz1-id-logo.png';

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, signIn } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={xz1IdLogo} alt="XZ1 ID" className="h-20 w-auto glow-pink" />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Welcome</h1>
          <p className="text-muted-foreground text-center mb-8">
            XZ1 Corporation Manager
          </p>

          <Button onClick={signIn} className="w-full gap-2" size="lg">
            <LogIn className="h-4 w-4" />
            Sign in with XZ1 ID
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Secure authentication powered by XZ1 ID
          </p>
        </div>
      </div>
    </div>
  );
}
