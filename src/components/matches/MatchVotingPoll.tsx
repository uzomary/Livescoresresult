
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Match } from '@/data/matches';
import { useToast } from '@/hooks/use-toast';

interface MatchVotingPollProps {
  match: Match;
}

interface PollData {
  home: number;
  draw: number;
  away: number;
  total: number;
}

export const MatchVotingPoll = ({ match }: MatchVotingPollProps) => {
  const [pollData, setPollData] = useState<PollData>({ home: 0, draw: 0, away: 0, total: 0 });
  const [userVote, setUserVote] = useState<'home' | 'draw' | 'away' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing poll data from localStorage
    const savedPoll = localStorage.getItem(`poll_${match.id}`);
    if (savedPoll) {
      setPollData(JSON.parse(savedPoll));
    }
    
    // Check if user has already voted
    const savedVote = localStorage.getItem(`vote_${match.id}`);
    if (savedVote) {
      setUserVote(savedVote as 'home' | 'draw' | 'away');
    }
  }, [match.id]);

  const handleVote = (voteType: 'home' | 'draw' | 'away') => {
    if (userVote) {
      toast({
        title: 'Already Voted',
        description: 'You have already voted for this match.',
        variant: 'destructive'
      });
      return;
    }

    const newPollData = {
      ...pollData,
      [voteType]: pollData[voteType] + 1,
      total: pollData.total + 1
    };

    setPollData(newPollData);
    setUserVote(voteType);
    
    // Save to localStorage
    localStorage.setItem(`poll_${match.id}`, JSON.stringify(newPollData));
    localStorage.setItem(`vote_${match.id}`, voteType);

    toast({
      title: 'Vote Recorded',
      description: `You voted for ${voteType === 'home' ? match.homeTeam.name : voteType === 'away' ? match.awayTeam.name : 'Draw'}`,
    });
  };

  const getPercentage = (votes: number) => {
    return pollData.total === 0 ? 0 : Math.round((votes / pollData.total) * 100);
  };

  if (match.status !== 'UPCOMING') {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Who will win?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={userVote === 'home' ? 'default' : 'outline'}
            onClick={() => handleVote('home')}
            disabled={!!userVote}
            className="text-xs p-2 h-auto"
          >
            {match.homeTeam.name}
          </Button>
          <Button
            variant={userVote === 'draw' ? 'default' : 'outline'}
            onClick={() => handleVote('draw')}
            disabled={!!userVote}
            className="text-xs p-2 h-auto"
          >
            Draw
          </Button>
          <Button
            variant={userVote === 'away' ? 'default' : 'outline'}
            onClick={() => handleVote('away')}
            disabled={!!userVote}
            className="text-xs p-2 h-auto"
          >
            {match.awayTeam.name}
          </Button>
        </div>
        
        {pollData.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{match.homeTeam.name}</span>
              <span>{getPercentage(pollData.home)}%</span>
            </div>
            <Progress value={getPercentage(pollData.home)} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Draw</span>
              <span>{getPercentage(pollData.draw)}%</span>
            </div>
            <Progress value={getPercentage(pollData.draw)} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>{match.awayTeam.name}</span>
              <span>{getPercentage(pollData.away)}%</span>
            </div>
            <Progress value={getPercentage(pollData.away)} className="h-2" />
            
            <p className="text-xs text-muted-foreground text-center mt-2">
              Total votes: {pollData.total}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
