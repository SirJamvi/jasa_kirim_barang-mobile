import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LacakKirimanPageRoutingModule } from './lacak-kiriman-routing.module';
import { LacakKirimanPage } from './lacak-kiriman.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LacakKirimanPageRoutingModule
  ],
  declarations: [LacakKirimanPage]
})
export class LacakKirimanPageModule {}