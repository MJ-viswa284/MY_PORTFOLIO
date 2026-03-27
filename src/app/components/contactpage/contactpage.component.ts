import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contactpage',
  standalone: true,
  imports: [FormsModule,NgIf],
  templateUrl: './contactpage.component.html',
  styleUrl: './contactpage.component.css'
})
export class ContactpageComponent {


  constructor() {
      emailjs.init('MSoYy-x1WG6Bl8Qz5');
  }


  // ===== Contact Info (Single Source of Truth) =====
  email = 'Visveswaran760@gmail.com';
  gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${this.email}`;
  
  linkedIn = {
    label: 'LinkedIn',
    text: 'Connect',
    url: 'www.linkedin.com/in/visveswaran-m'
  };

  resume = {
    label: 'Resume',
    text: 'Download PDF',
    url: 'assets/My-Professional-resume.pdf'
  };

  // ===== Form Model =====
  contactForm = {
    name: '',
    email: '',
    message: ''
  };


  isSending = false;
  isSuccess = false;
  isError = false;



  onSubmit() {

  this.isSending = true;
  this.isSuccess = false;
  this.isError = false;


 emailjs.send(
  'service_34vpspb',
  'template_7yb4zhd',
  {
    from_name: this.contactForm.name,
    from_email: this.contactForm.email,
    message: this.contactForm.message
  }
)
  .then((response) => {
    console.log('SUCCESS!', response.status, response.text);
    this.isSuccess = true;
    this.contactForm = { name: '', email: '', message: '' };
  })
  .catch((error) => {
    console.log('FAILED...', error);
    this.isError = true;
  })
  .finally(() => {
    this.isSending = false;
  });
}

}
