import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';

@Component({
    selector: 'app-booking',
    imports: [FormsModule],
    templateUrl: './booking.html',
    styleUrl: './booking.css',
})
export class Booking {
    private readonly appointmentService = inject(AppointmentService);
    
    bookingForm = {
        fullName: '',
        phone: '',
        email: '',
        service: '',
        date: '',
        time: ''
    };

    isSubmitting = false;
    submitMessage = '';
    submitError = false;
    submitted = false;

    services = [
        { name: 'Corte Clásico', price: 15 },
        { name: 'Corte Premium', price: 25 },
        { name: 'Arreglo de Barba', price: 12 },
        { name: 'Paquete Completo', price: 35 }
    ];

    timeSlots = [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
        '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
        '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
    ];

    benefits = [
        {
            title: 'Barberos Certificados',
            description: 'Profesionales con más de 10 años de experiencia',
            icon: 'certificate'
        },
        {
            title: 'Productos Premium',
            description: 'Usamos solo las mejores marcas del mercado',
            icon: 'premium'
        },
        {
            title: 'Ambiente Exclusivo',
            description: 'Un lugar relajante y completamente renovado',
            icon: 'exclusive'
        },
        {
            title: 'Garantía de Satisfacción',
            description: 'Si no quedas contento, te arreglamos gratis',
            icon: 'guarantee'
        }
    ];

    schedule = [
        { day: 'Lunes - Viernes', hours: '9:00 AM - 8:00 PM' },
        { day: 'Sábados', hours: '9:00 AM - 7:00 PM' },
        { day: 'Domingos', hours: 'Cerrado', closed: true }
    ];

    onSubmit(): void {
        if (this.isSubmitting) {
            return;
        }

        this.submitted = true;

        const validationError = this.getValidationError();
        if (validationError) {
            this.submitMessage = validationError;
            this.submitError = true;
            return;
        }

        this.isSubmitting = true;
        this.submitMessage = '';
        this.submitError = false;

        const appointmentData = {
            nombreCompleto: this.bookingForm.fullName,
            telefono: this.bookingForm.phone,
            correo: this.bookingForm.email || undefined,
            servicio: this.bookingForm.service,
            fechaCita: this.bookingForm.date,
            horaCita: this.bookingForm.time
        };

        this.appointmentService.createAppointment(appointmentData).subscribe({
            next: () => {
                this.submitMessage = '¡Reserva confirmada! Te contactaremos pronto.';
                this.submitError = false;
                this.resetForm();
                setTimeout(() => {
                    this.submitMessage = '';
                }, 5000);
            },
            error: (error) => {
                console.error('Error al crear la cita:', error);
                this.submitMessage = 'Hubo un error al procesar tu reserva. Intenta nuevamente.';
                this.submitError = true;
                setTimeout(() => {
                    this.submitMessage = '';
                }, 5000);
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }

    isFormValid(): boolean {
        return !this.getValidationError();
    }

    private getValidationError(): string | null {
        return (
            this.fullNameError ||
            this.phoneError ||
            this.emailError ||
            this.serviceError ||
            this.dateError ||
            this.timeError ||
            null
        );
    }

    get fullNameError(): string | null {
        const name = this.bookingForm.fullName.trim();
        if (!name) {
            return this.submitted ? 'El nombre es requerido.' : null;
        }

        return name.length >= 3 ? null : 'Ingresa un nombre valido.';
    }

    get phoneError(): string | null {
        const phone = this.bookingForm.phone.trim();
        if (!phone) {
            return this.submitted ? 'El telefono es requerido.' : null;
        }

        return /^[+\d\s()-]{7,20}$/.test(phone) ? null : 'Ingresa un telefono valido.';
    }

    get emailError(): string | null {
        const email = this.bookingForm.email.trim();
        if (!email) {
            return null;
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ? null
            : 'Ingresa un email valido.';
    }

    get serviceError(): string | null {
        return this.bookingForm.service ? null : (this.submitted ? 'Selecciona un servicio.' : null);
    }

    get dateError(): string | null {
        if (!this.bookingForm.date) {
            return this.submitted ? 'Selecciona una fecha.' : null;
        }

        const selectedDate = new Date(this.bookingForm.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate < today ? 'La fecha no puede ser en el pasado.' : null;
    }

    get timeError(): string | null {
        return this.bookingForm.time ? null : (this.submitted ? 'Selecciona una hora.' : null);
    }

    resetForm(): void {
        this.bookingForm = {
            fullName: '',
            phone: '',
            email: '',
            service: '',
            date: '',
            time: ''
        };
    }
}