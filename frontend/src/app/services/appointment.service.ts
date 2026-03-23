import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppointmentData {
  nombreCompleto: string;
  telefono: string;
  correo?: string;
  servicio: string;
  fechaCita: string;
  horaCita: string;
  notas?: string;
}

export interface Appointment extends AppointmentData {
  id: number;
  estado: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface AppointmentFilters {
  fecha?: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  createAppointment(data: AppointmentData): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, data);
  }

  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl);
  }

  getAppointments(filters?: AppointmentFilters): Observable<Appointment[]> {
    let params = new HttpParams();

    if (filters?.fecha) {
      params = params.set('fecha', filters.fecha);
    }

    if (filters?.estado) {
      params = params.set('estado', filters.estado);
    }

    return this.http.get<Appointment[]>(this.apiUrl, { params });
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  getAppointmentsByDate(fecha: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/fecha/${fecha}`);
  }

  updateAppointmentStatus(id: number, estado: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  updateAppointment(id: number, data: Partial<AppointmentData> & { estado?: string }): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}`, data);
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}