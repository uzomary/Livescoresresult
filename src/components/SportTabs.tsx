import { cn } from '@/lib/utils';

export type SportId = 'football' | 'basketball' | 'hockey' | 'handball' | 'rugby' | 'baseball' | 'volleyball';

interface SportTab {
    id: SportId;
    label: string;
    icon: React.ReactNode;
}

interface SportTabsProps {
    activeSport: SportId;
    onSportChange: (sport: SportId) => void;
}

// Simple SVG sport icons
const FootballIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 4.3l1.35-.95 1.65.65.3 1.75-1.3.95-1.7-.3-.3-2.1zm-3.7.6l1.65-.65 1.35.95-.3 2.1-1.7.3-1.3-.95.3-1.75zM5.4 13.8l.3-1.75 1.5-.8 1.4 1.1-.15 1.75-1.55.75-1.5-1.05zM8.35 19l-.55-1.65.95-1.45 1.75.15.8 1.55-1 1.35-1.95.05zM12 17.3l-1.05-1.4.55-1.65h2l.55 1.65L12 17.3zm2.65 1.7l-1-1.35.8-1.55 1.75-.15.95 1.45-.55 1.65-1.95-.05zm2.55-5.9l-1.55-.75-.15-1.75 1.4-1.1 1.5.8.3 1.75-1.5 1.05z" />
    </svg>
);

const BasketballIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.22.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
);

const HockeyIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M13.58 3.81L3 14.38l3.62 3.62 10.56-10.57-3.6-3.62zM2.3 15.79L1 21l5.21-1.3-3.91-3.91zM21.71 6.71L17.29 2.29a1 1 0 0 0-1.41 0L14 4.17l5.83 5.83 1.88-1.88a1 1 0 0 0 0-1.41z" />
    </svg>
);

const HandballIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 2c-2.5 4-2.5 8 0 12s2.5 8 0 12" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const RugbyIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-45 12 12)" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1" transform="rotate(-45 11 10)" />
        <line x1="10" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1" transform="rotate(-45 13 14)" />
    </svg>
);

const BaseballIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M6.34 4.93c1.5 2.5 1.5 5.5 0 8M17.66 11.07c-1.5 2.5-1.5 5.5 0 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const VolleyballIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 2C8 6 8 12 12 12s4 6 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 9c4-1 8 1 9.5 3s5.5 4 9.5 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

const TrophyIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M6 3h12v2h2c1.1 0 2 .9 2 2v3c0 1.66-1.34 3-3 3h-.18C18.4 14.63 17.05 16 15 16h-1v3h3v2H7v-2h3v-3H9c-2.05 0-3.4-1.37-3.82-3H5c-1.66 0-3-1.34-3-3V7c0-1.1.9-2 2-2h2V3zm0 4H4v3c0 .55.45 1 1 1h1V7zm12 0v4h1c.55 0 1-.45 1-1V7h-2z" />
    </svg>
);

const sportTabs: SportTab[] = [
    { id: 'football', label: 'FOOTBALL', icon: <FootballIcon /> },
    { id: 'basketball', label: 'BASKETBALL', icon: <BasketballIcon /> },
    { id: 'hockey', label: 'HOCKEY', icon: <HockeyIcon /> },
    { id: 'handball', label: 'HANDBALL', icon: <HandballIcon /> },
    { id: 'rugby', label: 'RUGBY', icon: <RugbyIcon /> },
    { id: 'baseball', label: 'BASEBALL', icon: <BaseballIcon /> },
    { id: 'volleyball', label: 'VOLLEYBALL', icon: <VolleyballIcon /> },
];

export const SportTabs = ({ activeSport, onSportChange }: SportTabsProps) => {
    return (
        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 mb-4">
            <div className="flex items-center gap-1 min-w-max border-b border-gray-200">
                {sportTabs.map((tab) => (
                    <>
                        <button
                            key={tab.id}
                            onClick={() => onSportChange(tab.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold tracking-wider transition-all whitespace-nowrap border-b-2 uppercase",
                                activeSport === tab.id
                                    ? "text-[#ff0046] border-[#ff0046]"
                                    : "text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>

                        {/* Pools Results Link - After Football */}
                        {tab.id === 'football' && (
                            <a
                                href="https://poolsupdate.com/pools_results.php"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold tracking-wider transition-all whitespace-nowrap border-b-2 uppercase text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300"
                            >
                                <TrophyIcon />
                                POOLS RESULTS
                            </a>
                        )}
                    </>
                ))}


            </div>
        </div>
    );
};
