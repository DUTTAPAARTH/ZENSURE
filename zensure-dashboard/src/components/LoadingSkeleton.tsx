import React from 'react';

type SkeletonBoxProps = {
  width?: string | number;
  height: string | number;
  borderRadius?: string | number;
};

export function SkeletonBox({
  width = '100%',
  height,
  borderRadius = 8,
}: SkeletonBoxProps) {
  return <div className="skeleton-box" style={{ width, height, borderRadius }} />;
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <SkeletonBox width={44} height={44} borderRadius="50%" />
      <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
        <SkeletonBox width="42%" height={12} />
        <SkeletonBox width="55%" height={30} />
        <SkeletonBox width="70%" height={12} />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonBox key={index} width="100%" height={48} borderRadius={8} />
      ))}
    </div>
  );
}
