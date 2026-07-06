import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type InfoCardField = {
  label: string;
  value: React.ReactNode;
};

type InfoCardProps = {
  title: string;
  fields: InfoCardField[];
  /** Action slot in the header, e.g. an Edit button. */
  action?: React.ReactNode;
};

/** Read-only label/value card used for profile and record detail sections. */
export function InfoCard({ title, fields, action }: InfoCardProps) {
  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between space-y-0 pb-4'>
        <CardTitle className='text-lg font-medium'>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        <dl className='grid gap-x-6 gap-y-4 sm:grid-cols-2'>
          {fields.map((field) => (
            <div key={field.label} className='flex flex-col gap-0.5'>
              <dt className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                {field.label}
              </dt>
              <dd className='text-sm'>{field.value || '—'}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
