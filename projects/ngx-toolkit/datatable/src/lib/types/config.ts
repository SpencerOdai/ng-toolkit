export interface IDatatableConfig{
  properties?: (IDatatableColumn| string)[];
  images?: string[];
  date?: string[];
  allowSelection?: boolean;
  actions?: IDatatableAction[];
  classes?: string[];
  headerClasses?: string[];
  pagination?: IDatatablePagination;
}

export interface IDatatableAction{
  text: string;
  event: () => void;
}

export interface IDatatablePagination{
  maxPageSize: number;
  startPage?: number;
}

export interface IDatatableColumn{
  propName: string;
  formatted: string;
}
