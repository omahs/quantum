export default function ProgressBar({
  progressPercentage,
}: {
  progressPercentage: number;
}): JSX.Element {
  return (
    <div className="h-2 w-full bg-dark-200 rounded-[9px]">
      <div
        style={{ width: `${progressPercentage}%` }}
        className="h-full rounded-[9px] bg-dark-grdient-3"
      />
    </div>
  );
}
