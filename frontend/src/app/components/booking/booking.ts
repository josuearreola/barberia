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
        if (this.isFormValid() && !this.isSubmitting) {
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
                next: (response) => {
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
    }

    isFormValid(): boolean {
        return this.bookingForm.fullName.trim() !== '' &&
               this.bookingForm.phone.trim() !== '' &&
               this.bookingForm.service !== '' &&
               this.bookingForm.date !== '' &&
               this.bookingForm.time !== '';
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