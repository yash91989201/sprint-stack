# Suspense Fallback Guidelines

All components using `useSuspenseQuery` must implement a loading state via a corresponding skeleton component used as a Suspense fallback.

## Skeleton Components

A skeleton must be an exact structural replica of the real component — same components, same layout, same hierarchy. The only difference:

- **Dynamic data** (from API) → replace with `<Skeleton />`
- **Static content** (headers, labels, structural elements) → render as-is

## Naming Convention

| Role | Name |
|---|---|
| Component | `UsersTable` |
| Skeleton | `UsersTableSkeleton` |
| Fallback alias | `UsersTable.Fallback = UsersTableSkeleton` |

## Example

```tsx
export const UsersTable = () => {
  const { data: users } = useSuspenseQuery(fetchUsers);
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const UsersTableSkeleton = () => {
  return (
    <table>
      <thead>
        <tr>
          {/* Static — render as-is */}
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          //biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          <tr key={i}>
            {/* Dynamic */}
            <td><Skeleton className="h-4 w-32" /></td>
            <td><Skeleton className="h-4 w-48" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

UsersTable.Fallback = UsersTableSkeleton;
```

Usage:

```tsx
<Suspense fallback={<UsersTable.Fallback />}>
  <UsersTable />
</Suspense>
```

## Implementation Checklist

1. Create `<ComponentName>Skeleton` in the same file, at the bottom.
2. Assign `<ComponentName>.Fallback = <ComponentName>Skeleton`.
3. Replicate the exact structure — same components, wrappers, and hierarchy.
4. Replace only API-sourced values with `<Skeleton />` sized to match expected content.
   - When rendering a skeleton array with `Array.from`, use the index as the key and suppress the linter warning:

     ```tsx
     // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
     ```

5. Keep all static content (labels, headers, icons) exactly as in the real component.
6. Wrap with Suspense using `.Fallback` as the fallback prop.

## Requirements

- Structure must match the final UI exactly.
- Only dynamic, API-sourced data is replaced with `<Skeleton />`.
- Keep animation subtle — avoid excessive motion.
