export interface ApiResponse<T> {
  success: boolean;
  mensaje: string;
  data: T;
}