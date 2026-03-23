import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Appointment, AppointmentService } from '../../services/appointment.service';

interface AppointmentFilters {
  fecha?: string;
  estado?: string;
}

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-appointments.html',
  styleUrl: './admin-appointments.css'
})
export class AdminAppointments implements OnInit {
  appointments: Appointment[] = [];
  filters: AppointmentFilters = {};
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  editId: number | null = null;
  editForm = {
    nombreCompleto: '',
    telefono: '',
    correo: '',
    servicio: '',
    fechaCita: '',
    horaCita: '',
    notas: '',
    estado: 'pendiente',
  };

  statusOptions = ['pendiente', 'confirmada', 'completada', 'cancelada'];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentService.getAppointments(this.filters).subscribe({
      next: (data) => {
        this.appointments = data;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las citas.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadAppointments();
  }

  clearFilters(): void {
    this.filters = {};
    this.loadAppointments();
  }

  startEdit(appointment: Appointment): void {
    this.editId = appointment.id;
    this.editForm = {
      nombreCompleto: appointment.nombreCompleto,
      telefono: appointment.telefono,
      correo: appointment.correo || '',
      servicio: appointment.servicio,
      fechaCita: appointment.fechaCita,
      horaCita: appointment.horaCita,
      notas: appointment.notas || '',
      estado: appointment.estado,
    };
  }

  cancelEdit(): void {
    this.editId = null;
  }

  saveEdit(): void {
    if (!this.editId) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    this.appointmentService.updateAppointment(this.editId, this.editForm).subscribe({
      next: () => {
        this.successMessage = 'Cita actualizada.';
        this.editId = null;
        this.loadAppointments();
      },
      error: () => {
        this.errorMessage = 'No se pudo actualizar la cita.';
      }
    });
  }

  updateStatus(appointment: Appointment, estado: string): void {
    this.appointmentService.updateAppointmentStatus(appointment.id, estado).subscribe({
      next: () => {
        appointment.estado = estado;
      },
      error: () => {
        this.errorMessage = 'No se pudo cambiar el estado.';
      }
    });
  }

  deleteAppointment(appointment: Appointment): void {
    const confirmed = window.confirm('Estas seguro de eliminar la cita?');
    if (!confirmed) {
      return;
    }

    this.appointmentService.deleteAppointment(appointment.id).subscribe({
      next: () => {
        this.appointments = this.appointments.filter((item) => item.id !== appointment.id);
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar la cita.';
      }
    });
  }
}
