import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface NewsLoaderProps {
  count?: number;
}

export const NewsLoader = ({ count = 3 }: NewsLoaderProps) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="bg-white border-gray-100 p-3">
          {/* Image skeleton */}
          <Skeleton className="w-full h-32 bg-gray-100 rounded-lg mb-3" />

          {/* Title skeleton */}
          <Skeleton className="h-4 bg-gray-100 rounded mb-2" />
          <Skeleton className="h-4 bg-gray-100 rounded w-3/4 mb-3" />

          {/* Meta info skeleton */}
          <div className="flex justify-between items-center mt-3">
            <Skeleton className="h-3 bg-gray-100 rounded w-16" />
            <Skeleton className="h-3 bg-gray-100 rounded w-20" />
          </div>
        </Card>
      ))}
    </div>
  );
};
