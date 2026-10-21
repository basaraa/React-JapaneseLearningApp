import { useMemo, type ReactNode } from 'react';

export interface TableColumn {
  key: string;
  label: string;
  className?: string;
  headerClassName?: string;
}

interface SortableTableProps<T> {
  columns: TableColumn[];
  data: T[];
  renderCell: (item: T, column: string) => ReactNode;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  className?: string;
  emptyMessage?: string;
  rowKey?: (item: T) => string | number;
}

export function SortableTable<T>({
  columns,
  data,
  renderCell,
  sortKey,
  sortDir,
  onSort,
  className,
  emptyMessage = 'No data.',
  rowKey = (item: T) => ((item as Record<string, unknown>).id as string | number | undefined) ?? JSON.stringify(item),
}: SortableTableProps<T>) {
  const sorted = useMemo(() => {
    if (!sortKey || !onSort) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      const av = String(aVal ?? '');
      const bv = String(bVal ?? '');
      const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [data, sortKey, sortDir, onSort]);

  if (sorted.length === 0) {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 ${className ?? ''}`}>
        <p className="text-gray-500 dark:text-gray-400 text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${className ?? ''}`}>
      <table className="w-full min-w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort?.(col.key)}
                className={`px-3 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 select-none ${col.className ?? ''} ${col.headerClassName ?? ''}`}
                role="columnheader"
                aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="inline-flex items-center gap-1">
                  <span>{col.label}</span>
                  {sortKey === col.key && (
                    <span className="text-[10px] text-sakura-600 dark:text-sakura-400">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
          {sorted.map((item) => (
            <tr key={rowKey(item)} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={`px-3 py-2.5 align-middle text-gray-900 dark:text-white ${col.className ?? ''}`}>
                  {renderCell(item, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
