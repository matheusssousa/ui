/** Envelope returned by server actions, including form feedback. */
export interface ActionResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export interface LaravelPaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

/** Pagination fields shared by paginate() and paginated API Resources. */
export interface LaravelPaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from?: number | null;
  to?: number | null;
  path?: string;
  links?: LaravelPaginationLink[];
}

/** JSON returned directly by Laravel's paginate(). */
export interface LaravelPaginatedResponse<T> extends LaravelPaginationMeta {
  data: T[];
  first_page_url?: string;
  last_page_url?: string;
  next_page_url?: string | null;
  prev_page_url?: string | null;
}

export interface LaravelResourcePaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

/** Default JSON envelope for a single Laravel API Resource. */
export interface LaravelResourceResponse<T> {
  data: T;
}

/** JSON returned by Resource::collection() with paginate(). */
export interface LaravelPaginatedResourceResponse<T> {
  data: T[];
  links: LaravelResourcePaginationLinks;
  meta: LaravelPaginationMeta;
}

/** HTTP response for an index returning paginate() directly. */
export type IndexResponse<T> = LaravelPaginatedResponse<T>;

/** HTTP response for a show returning a model directly (no pagination). */
export type ShowResponse<T> = T;

/** Action wrapping an index HTTP response; pagination lives in action.data. */
export type IndexActionResponse<T> = ActionResponse<IndexResponse<T>>;

/** Action wrapping a single model. */
export type ShowActionResponse<T> = ActionResponse<ShowResponse<T>>;
