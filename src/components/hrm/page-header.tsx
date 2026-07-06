type PageHeaderProps = {
  title: string;
  description?: string;
  /** Action slot (e.g. a "Request leave" button). */
  children?: React.ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
        {!!description && (
          <p className='text-sm text-muted-foreground'>{description}</p>
        )}
      </div>
      {!!children && <div className='flex shrink-0 gap-2'>{children}</div>}
    </div>
  );
}
