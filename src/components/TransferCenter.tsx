import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Transfer {
  id: string;
  playerName: string;
  playerImage?: string;
  value: string;
  fromTeam?: string;
  toTeam?: string;
  status: 'completed' | 'rumored' | 'confirmed';
}

const mockTransfers: Transfer[] = [
  {
    id: '1',
    playerName: 'Alejandro Garnacho',
    playerImage: '/api/placeholder/40/40',
    value: '€65M',
    fromTeam: 'Man United',
    toTeam: 'Real Madrid',
    status: 'rumored'
  },
  {
    id: '2',
    playerName: 'Nick Woltemade',
    playerImage: '/api/placeholder/40/40',
    value: '€85M',
    fromTeam: 'Stuttgart',
    toTeam: 'Bayern Munich',
    status: 'confirmed'
  },
  {
    id: '3',
    playerName: 'Xavi Simons',
    playerImage: '/api/placeholder/40/40',
    value: '€60M',
    fromTeam: 'PSG',
    toTeam: 'Barcelona',
    status: 'rumored'
  }
];

export const TransferCenter = () => {
  return (
    <div className="w-80 bg-[#1a1a1a] border-l border-gray-800 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-white font-semibold text-lg">Transfer Center</h3>
      </div>

      {/* Transfer List */}
      <div className="p-4 space-y-3">
        {mockTransfers.map((transfer) => (
          <Card key={transfer.id} className="bg-[#2a2a2a] border-gray-700 p-3 hover:bg-[#333333] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={transfer.playerImage} alt={transfer.playerName} />
                <AvatarFallback className="bg-gray-600 text-white text-sm">
                  {transfer.playerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium text-sm truncate">
                    {transfer.playerName}
                  </h4>
                  <Badge 
                    variant={transfer.status === 'confirmed' ? 'default' : 'secondary'}
                    className={`text-xs px-2 py-0.5 ${
                      transfer.status === 'confirmed' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-orange-600 text-white'
                    }`}
                  >
                    {transfer.status === 'confirmed' ? '✓' : '?'}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-400 mb-1">
                  {transfer.fromTeam} → {transfer.toTeam}
                </div>
                
                <div className="text-sm font-semibold text-green-400">
                  {transfer.value}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Build your own XI section */}
      <div className="p-4 border-t border-gray-800">
        <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-800/30 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Build your own XI</h4>
              <p className="text-gray-400 text-xs">Try our lineup builder</p>
            </div>
          </div>
          
          {/* Formation preview */}
          <div className="bg-green-900/20 rounded-lg p-3 relative overflow-hidden">
            <div className="grid grid-cols-3 gap-2 relative z-10">
              {/* Formation dots */}
              {[...Array(11)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                </div>
              ))}
            </div>
            
            {/* Field lines */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-px bg-white absolute top-1/2 transform -translate-y-1/2"></div>
              <div className="w-px h-full bg-white absolute left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
