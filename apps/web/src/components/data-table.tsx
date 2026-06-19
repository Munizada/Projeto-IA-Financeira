import type { ReactNode } from "react";

type Column<TItem> = {
  header: string;
  render: (item: TItem) => ReactNode;
};

type DataTableProps<TItem> = {
  columns: Column<TItem>[];
  items: TItem[];
};

export function DataTable<TItem>({ columns, items }: DataTableProps<TItem>) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={`${column.header}-${rowIndex}`}>{column.render(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
