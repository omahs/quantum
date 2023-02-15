import clsx from "clsx";

export default function WelcomeHeader() {
  const headerStyle =
    "text-[32px] leading-10 xs:text-[36px] xs:w-6/12 md:w-full lg:leading-[52px] text-dark-1000 lg:text-[44px]";
  const bylineStyle =
    "align-middle text-base text-dark-1000 lg:leading-10 lg:text-[32px]";
  return (
    <div>
      <h1 className={clsx(headerStyle)}>Building a</h1>
      <h1 className={clsx(headerStyle)}>decentralised</h1>
      <h1 className={clsx(headerStyle)}>tomorrow</h1>
      <div className="mt-2">
        <h2 className={clsx(bylineStyle)}>connecting one</h2>
        <h2 className={clsx(bylineStyle)}>blockchain at a time</h2>
      </div>
    </div>
  );
}
