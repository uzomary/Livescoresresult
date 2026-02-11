import { useState, useEffect, useRef } from 'react';
import { Match } from '@/utils/fixtureTransform';

interface LiveTimerProps {
    match: Match;
    className?: string;
    showSeconds?: boolean;
}

export const LiveTimer = ({ match, className = '', showSeconds = false }: LiveTimerProps) => {
    // Use a ref to store the start time to prevent re-calculations causing jumps
    const startTimeRef = useRef<number | null>(null);
    const [displayTime, setDisplayTime] = useState<string>(`${match.minute || 0}'`);

    useEffect(() => {
        // If not live, just show the static minute
        if (!['1H', '2H', 'ET'].includes(match.status)) {
            setDisplayTime(`${match.minute || 0}'`);
            startTimeRef.current = null;
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        const currentMinute = match.minute || 0;

        // Function to calculate estimated start time from minute
        const getEstimatedStart = () => {
            let elapsedMinutes = currentMinute;

            if (match.status === '2H') {
                elapsedMinutes = currentMinute - 45;
            } else if (match.status === 'ET') {
                elapsedMinutes = currentMinute - 90;
            }

            const elapsedSeconds = elapsedMinutes * 60;
            return now - elapsedSeconds;
        };

        // Initialize or update start time reference
        if (startTimeRef.current === null) {
            if (match.startTime) {
                // Check if the provided startTime is reasonable (within 2 mins of official minute)
                // We need to adjust logic because startTime from API is usually the match KICKOFF, not the half start
                // But our local match.startTime might be processed. 
                // Let's rely on the logic from MatchDetails which seemed to trust match.startTime but validated it.

                const elapsedFromStart = now - match.startTime + (match.status === '2H' ? 45 * 60 : 0);
                const minuteFromStart = Math.floor(elapsedFromStart / 60);

                if (Math.abs(minuteFromStart - currentMinute) > 2) {
                    // API start time is wildly off, ignore it and estimate
                    startTimeRef.current = getEstimatedStart();
                } else {
                    startTimeRef.current = match.startTime;
                }
            } else {
                startTimeRef.current = getEstimatedStart();
            }
        }

        // Continuous sync check: if our timer drifted too far from official minute, resync
        if (startTimeRef.current) {
            const currentElapsed = now - startTimeRef.current + (match.status === '2H' ? 45 * 60 : 0);
            const currentMinuteCalc = Math.floor(currentElapsed / 60);

            // If we are more than 2 minutes off from the official API minute, force a resync
            if (Math.abs(currentMinuteCalc - currentMinute) > 2) {
                startTimeRef.current = getEstimatedStart();
            }
        }

        const updateTime = () => {
            if (!startTimeRef.current) return;
            const currentTime = Math.floor(Date.now() / 1000);
            let elapsedSeconds = currentTime - startTimeRef.current;

            if (match.status === '2H') elapsedSeconds += 45 * 60;
            if (match.status === 'ET') elapsedSeconds += 90 * 60;

            if (elapsedSeconds < 0) elapsedSeconds = 0;

            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;

            if (showSeconds) {
                setDisplayTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setDisplayTime(`${minutes}'`);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [match.status, match.minute, match.startTime, showSeconds]);

    return <span className={className}>{displayTime}</span>;
};
