// import { Card } from "@/components/ui/card";
// import { Match } from "@/utils/fixtureTransform";
// import { Star } from "lucide-react";
// import { useState } from "react";

// interface MatchCardProps {
//   match: Match;
//   onClick: (matchId: string) => void;
//   className?: string;
// }

// const MatchCard = ({ match, onClick, className = '' }: MatchCardProps) => {
//   const [isFavorite, setIsFavorite] = useState(false);
  
//   const formatMatchTime = () => {
//     if (match.status === 'LIVE') {
//       return `${match.minute || 'LIVE'}'`;
//     }
//     return match.time;
//   };

//   const isFinished = match.status === 'FT';
//   const isLive = match.status === 'LIVE';
//   const isUpcoming = match.status === 'SCHEDULED';

//   return (
//     <Card 
//       className={`p-3 bg-[#3030303e] backdrop-blur-sm border border-black/5 rounded-lg shadow-sm cursor-pointer hover:bg-[#30303062] transition-colors ${className}`}
//       onClick={() => onClick(match.id)}
//     >
//       <div className="flex items-center gap-4">
//         {/* Time Column */}
//         <div className="flex flex-col items-center w-14">
//           <div className={`flex items-center gap-1 text-sm ${
//             isLive ? 'text-red-500' : 'text-muted-foreground'
//           }`}>
//             {isLive && (
//               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
//             )}
//             <span>{formatMatchTime()}</span>
//           </div>
//         </div>

//         {/* Teams Column */}
//         <div className="flex-1">
//           <div className="flex items-center gap-2 py-1">
//             <img 
//               src={match.homeTeam.logo} 
//               alt=""
//               className="w-5 h-5 object-contain"
//             />
//             <span className="text-sm truncate">
//               {match.homeTeam.name}
//             </span>
//             {(isLive || isFinished) && (
//               <span className="ml-auto font-medium">
//                 {match.homeTeam.score ?? 0}
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-2 py-1">
//             <img 
//               src={match.awayTeam.logo} 
//               alt=""
//               className="w-5 h-5 object-contain"
//             />
//             <span className="text-sm truncate">
//               {match.awayTeam.name}
//             </span>
//             {(isLive || isFinished) && (
//               <span className="ml-auto font-medium">
//                 {match.awayTeam.score ?? 0}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Favorite Button */}
//         <button 
//           onClick={(e) => {
//             e.stopPropagation();
//             setIsFavorite(!isFavorite);
//           }}
//           className="text-muted-foreground hover:text-yellow-400 transition-colors"
//         >
//           <Star 
//             className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} 
//           />
//         </button>
//       </div>
//     </Card>
//   );
// };

// export default MatchCard;
