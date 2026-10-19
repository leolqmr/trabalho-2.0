import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  /** Sem `to`, é o item atual (não clicável). */
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  /** Botões de ação alinhados à direita (normalmente dentro de <Can>). */
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-800">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Navegação" className="mb-3 flex flex-wrap items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="text-gray-500 hover:text-red-600 hover:underline dark:text-gray-400"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-gray-700 dark:text-gray-200">
                  {crumb.label}
                </span>
              )}
            </Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
