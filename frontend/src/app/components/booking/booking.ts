import { Component, inject, signal, computed } from '@angular/core';
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

    isSubmitting = signal(false);
    submitMessage = signal('');
    submitError = signal(false);
    submitted = signal(false);

    services = [
        { name: 'Corte Clásico', price: 15 },
        { name: 'Corte Premium', price: 25 },
        { name: 'Arreglo de Barba', price: 12 },
        { name: 'Paquete Completo', price: 35 }
    ];

    // All time slots in 24h format for internal logic
    allTimeSlots = [
        { display: '9:00 AM', value: '09:00' },
        { display: '9:30 AM', value: '09:30' },
        { display: '10:00 AM', value: '10:00' },
        { display: '10:30 AM', value: '10:30' },
        { display: '11:00 AM', value: '11:00' },
        { display: '11:30 AM', value: '11:30' },
        { display: '12:00 PM', value: '12:00' },
        { display: '12:30 PM', value: '12:30' },
        { display: '1:00 PM', value: '13:00' },
        { display: '1:30 PM', value: '13:30' },
        { display: '2:00 PM', value: '14:00' },
        { display: '2:30 PM', value: '14:30' },
        { display: '3:00 PM', value: '15:00' },
        { display: '3:30 PM', value: '15:30' },
        { display: '4:00 PM', value: '16:00' },
        { display: '4:30 PM', value: '16:30' },
        { display: '5:00 PM', value: '17:00' },
        { display: '5:30 PM', value: '17:30' },
        { display: '6:00 PM', value: '18:00' },
        { display: '6:30 PM', value: '18:30' },
        { display: '7:00 PM', value: '19:00' },
        { display: '7:30 PM', value: '19:30' },
        { display: '8:00 PM', value: '20:00' }
    ];

    // Computed available slots based on selected date
    availableTimeSlots = computed(() => {
        const dateStr = this.bookingForm.date;
        if (!dateStr) return this.allTimeSlots.map(s => s.display);

        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();

        // 0 = Domingo, 1-5 = Lunes-Viernes, 6 = Sábado
        if (dayOfWeek === 0) {
            // Domingo: Cerrado
            return [];
        } else if (dayOfWeek === 6) {
            // Sábado: 9:00 AM - 7:00 PM (09:00 - 19:00)
            return this.allTimeSlots
                .filter(s => Number.parseInt(s.value) >= 9 && Number.parseInt(s.value) <= 19)
                .map(s => s.display);
        } else {
            // Lunes-Viernes: 9:00 AM - 8:00 PM (09:00 - 20:00)
            return this.allTimeSlots
                .filter(s => Number.parseInt(s.value) >= 9 && Number.parseInt(s.value) <= 20)
                .map(s => s.display);
        }
    });

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
        if (this.isSubmitting()) {
            return;
        }

        this.submitted.set(true);

        const validationError = this.getValidationError();
        if (validationError) {
            this.submitMessage.set(validationError);
            this.submitError.set(true);
            return;
        }

        this.isSubmitting.set(true);
        this.submitMessage.set('');
        this.submitError.set(false);

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
                this.submitMessage.set('✓ ¡Reserva confirmada! Te contactaremos pronto.');
                this.submitError.set(false);
                this.resetForm();
                this.submitted.set(false);
                setTimeout(() => {
                    this.submitMessage.set('');
                }, 6000);
            },
            error: (error) => {
                console.error('Error al crear la cita:', error);
                this.submitMessage.set('✗ Hubo un error al procesar tu reserva. Intenta nuevamente.');
                this.submitError.set(true);
                setTimeout(() => {
                    this.submitMessage.set('');
                }, 6000);
            },
            complete: () => {
                this.isSubmitting.set(false);
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
            return this.submitted() ? 'El nombre es requerido.' : null;
        }

        return name.length >= 3 ? null : 'Ingresa un nombre valido.';
    }

    get phoneError(): string | null {
        const phone = this.bookingForm.phone.trim();
        if (!phone) {
            return this.submitted() ? 'El telefono es requerido.' : null;
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
        return this.bookingForm.service ? null : (this.submitted() ? 'Selecciona un servicio.' : null);
    }

    get dateError(): string | null {
        if (!this.bookingForm.date) {
            return this.submitted() ? 'Selecciona una fecha.' : null;
        }

        const selectedDate = new Date(this.bookingForm.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            return 'La fecha no puede ser en el pasado.';
        }

        // Check if it's Sunday
        if (selectedDate.getDay() === 0) {
            return 'No trabajamos domingos.';
        }

        return null;
    }

    get timeError(): string | null {
        if (!this.bookingForm.time) {
            return this.submitted() ? 'Selecciona una hora.' : null;
        }

        const availableSlots = this.availableTimeSlots();
        if (availableSlots.length === 0) {
            return 'No hay horarios disponibles para este día.';
        }

        return availableSlots.includes(this.bookingForm.time) ? null : 'Horario no disponible para este día.';
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
        // Reset submitted flag to clear validation messages after form reset
        this.submitted.set(false);
    }

    onDateChange(): void {
        // Reset time when date changes to prevent invalid time selections
        this.bookingForm.time = '';
    }
}