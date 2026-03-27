import { Component } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-e2o-intern',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './e2o-intern.component.html',
  styleUrl: './e2o-intern.component.css'
})
export class E2oInternComponent {

  images = [
    'assets/shivam.png',
    'assets/shivam1.png',
    'assets/shivam.png'
  ];

  currentIndex = 0;
  direction: 'left' | 'right' = 'right';
  previewOpen = false;


  
  nextImage() {
    this.direction = 'right';
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevImage() {
    this.direction = 'left';
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  openPreview() {
    this.previewOpen = true;
  }

  closePreview() {
    this.previewOpen = false;
  }
}
