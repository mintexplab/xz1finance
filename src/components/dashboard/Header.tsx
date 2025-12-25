import { RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: Date | null;
}

export function Header({ onRefresh, loading, lastUpdated }: HeaderProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center glow-pink">
                <span className="text-xl font-bold">X</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">XZ1 Recording Ventures</h1>
              <p className="text-sm text-muted-foreground">Financial Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button 
              onClick={onRefresh} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {user && (
              <Button 
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
