interface AffiliateLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function AffiliateLink({
  href,
  children,
  className = "",
}: AffiliateLinkProps) {
  return (
    <a
      href={href}
      rel="nofollow sponsored"
      target="_blank"
      className={`text-primary-600 dark:text-primary-400 hover:underline ${className}`}
    >
      {children}
    </a>
  );
}
