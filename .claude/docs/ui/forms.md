## Forms

All forms use the standard stack: **React Hook Form + Zod + shadcn `Form`
components.** Never hand-roll form state or validation.

- Use React Hook Form (`useForm`) with `zodResolver(schema)` for any form with more
  than two fields. The Zod schema lives in `src/schema/<entity>.ts`, not inline in the
  component (see `../rules/file-placement.md`).
- Wrap the form with `<Form {...form}>` so nested components can read context via
  `useFormContext()` instead of prop-drilling the `form` object.
- Use `FormField` / `FormItem` / `FormControl` / `FormMessage` (or the controlled
  wrappers in `src/components/ui/form/*` if one already fits) for every field — see
  `docs/ui/form.md` for the full pattern.
- Always render `<FormMessage />` for every field — it's how the user sees Zod
  validation errors.
- The submit `<Button>` always gets `isLoading={form.formState.isSubmitting}` (or the
  relevant mutation/action pending flag) and stays disabled while submitting to
  prevent double-submits. Never swap the button's text for "Loading...".

```tsx
const form = useForm<CreateEmployeeInput>({
  resolver: zodResolver(createEmployeeSchema),
  defaultValues: { name: '', email: '' },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit" isLoading={form.formState.isSubmitting}>
      Save
    </Button>
  </form>
</Form>;
```
