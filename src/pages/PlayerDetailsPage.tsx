import { useParams, useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import MetaTags from '@/components/MetaTags';

const PlayerProfile = lazy(() => import('@/components/PlayerProfile'));

const PlayerDetailsPage = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();

  if (!playerId) {
    return <div>No player ID provided</div>;
  }

  return (
    <div>
      <MetaTags 
        title={`Player Profile - Football Stats & Information`}
        description={`View detailed player profile, statistics, career information and performance data. Get comprehensive football player insights.`}
        url={`/player/${playerId}`}
      />
      <Suspense fallback={
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="flex space-x-4">
            <Skeleton className="h-64 w-64 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3 mt-4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      }>
        <PlayerProfile 
          playerId={playerId} 
          onBack={() => navigate(-1)} 
        />
      </Suspense>
    </div>
  );
};

export default PlayerDetailsPage;
